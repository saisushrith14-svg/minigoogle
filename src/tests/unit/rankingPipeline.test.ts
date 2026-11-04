import { describe, expect, it } from 'vitest';
import {
  compareRankingModes,
  rankPages,
  resolveRankingWeights,
  searchDataset,
} from '../../algorithms/rankingPipeline';
import { keywordStuffingDataset } from '../../data/datasets';
import type { RankingMode } from '../../types';

const pages = keywordStuffingDataset.pages;
const query = keywordStuffingDataset.defaultQuery ?? 'cheap flights';

describe('resolveRankingWeights', () => {
  it('merges defaults and clamps negative values', () => {
    const weights = resolveRankingWeights({
      keywordWeight: -1,
      pagerankWeight: 0.8,
      behaviourWeight: 0.4,
    });
    expect(weights.keywordWeight).toBe(0);
    expect(weights.pagerankWeight).toBe(0.8);
    expect(weights.behaviourWeight).toBe(0.4);
  });

  it('falls back to defaults when all weights are zero', () => {
    expect(
      resolveRankingWeights({
        keywordWeight: 0,
        pagerankWeight: 0,
        behaviourWeight: 0,
      }),
    ).toEqual({ keywordWeight: 0.6, pagerankWeight: 0.4, behaviourWeight: 0.2 });
  });
});

describe('rankPages', () => {
  it('assigns contiguous 1-based positions', () => {
    const results = rankPages(pages, query, { mode: 'hybrid' });
    expect(results).toHaveLength(pages.length);
    expect(results.map((result) => result.position)).toEqual(
      pages.map((_, index) => index + 1),
    );
  });

  it('sorts by descending final score', () => {
    const results = rankPages(pages, query, { mode: 'hybrid' });
    for (let index = 1; index < results.length; index += 1) {
      expect(results[index - 1].finalScore).toBeGreaterThanOrEqual(
        results[index].finalScore,
      );
    }
  });

  it('reproduces the keyword ranking in keyword mode', () => {
    const results = rankPages(pages, query, { mode: 'keyword' });
    const sorted = results.slice().sort((a, b) => b.keywordScore - a.keywordScore);
    expect(results[0].pageId).toBe(sorted[0].pageId);
    expect(results[0].pageId).toBe('ks-spam');
  });

  it('reproduces the PageRank ordering in pagerank mode', () => {
    const results = rankPages(pages, query, { mode: 'pagerank' });
    const sorted = results.slice().sort((a, b) => b.pageRank - a.pageRank);
    expect(results[0].pageId).toBe(sorted[0].pageId);
    expect(results[0].pageId).not.toBe('ks-spam');
  });

  it('normalizes PageRank into [0, 1]', () => {
    const results = rankPages(pages, query, { mode: 'pagerank' });
    expect(Math.min(...results.map((result) => result.normalizedPageRank))).toBeCloseTo(0, 10);
    expect(Math.max(...results.map((result) => result.normalizedPageRank))).toBeCloseTo(1, 10);
  });

  it('honours a 100% keyword weighting in hybrid mode', () => {
    const keyword = rankPages(pages, query, { mode: 'keyword' });
    const hybrid = rankPages(pages, query, {
      mode: 'hybrid',
      rankingWeights: { keywordWeight: 1, pagerankWeight: 0, behaviourWeight: 0 },
    });
    expect(hybrid.map((result) => result.pageId)).toEqual(
      keyword.map((result) => result.pageId),
    );
  });

  it('honours a 100% PageRank weighting in hybrid mode', () => {
    const pagerank = rankPages(pages, query, { mode: 'pagerank' });
    const hybrid = rankPages(pages, query, {
      mode: 'hybrid',
      rankingWeights: { keywordWeight: 0, pagerankWeight: 1, behaviourWeight: 0 },
    });
    expect(hybrid.map((result) => result.pageId)).toEqual(
      pagerank.map((result) => result.pageId),
    );
  });

  it('normalizes non-unit weights by their sum', () => {
    const a = rankPages(pages, query, {
      mode: 'hybrid',
      rankingWeights: { keywordWeight: 6, pagerankWeight: 4, behaviourWeight: 0 },
    });
    const b = rankPages(pages, query, {
      mode: 'hybrid',
      rankingWeights: { keywordWeight: 0.6, pagerankWeight: 0.4, behaviourWeight: 0 },
    });
    expect(a.map((result) => result.finalScore)).toEqual(
      b.map((result) => result.finalScore),
    );
  });

  it('lets behaviour dominate experimental ranking when configured', () => {
    const behaviourScores: Record<string, number> = {};
    pages.forEach((page) => {
      behaviourScores[page.id] = page.id === 'ks-airport-guide' ? 1 : 0;
    });
    const results = rankPages(pages, query, {
      mode: 'experimental',
      rankingWeights: { keywordWeight: 0, pagerankWeight: 0, behaviourWeight: 1 },
      behaviorScores: behaviourScores,
    });
    expect(results[0].pageId).toBe('ks-airport-guide');
    expect(results[0].behaviourScore).toBe(1);
    expect(results[0].position).toBe(1);
  });

  it('handles an empty corpus', () => {
    expect(rankPages([], query, { mode: 'hybrid' })).toEqual([]);
  });

  it('generates explanations for every result', () => {
    (['keyword', 'pagerank', 'hybrid', 'experimental'] as RankingMode[]).forEach(
      (mode) => {
        const results = rankPages(pages, query, { mode });
        results.forEach((result) => {
          expect(result.explanation).toBeTruthy();
          expect(result.explanation?.length).toBeGreaterThan(10);
        });
      },
    );
  });

  it('is deterministic', () => {
    expect(rankPages(pages, query, { mode: 'hybrid' })).toEqual(
      rankPages(pages, query, { mode: 'hybrid' }),
    );
  });
});

describe('searchDataset', () => {
  it('returns the resolved configuration and PageRank computation', () => {
    const response = searchDataset(keywordStuffingDataset, query, { mode: 'hybrid' });
    expect(response.datasetId).toBe(keywordStuffingDataset.id);
    expect(response.results).toHaveLength(pages.length);
    expect(response.pageRankComputation.results).toHaveLength(pages.length);
    expect(response.keywordWeights.titleMatch).toBeGreaterThan(0);
    expect(response.rankingWeights.keywordWeight).toBe(0.6);
  });
});

describe('compareRankingModes', () => {
  it('returns all four models over the same corpus', () => {
    const comparison = compareRankingModes(pages, query);
    const modes: RankingMode[] = ['keyword', 'pagerank', 'hybrid', 'experimental'];
    modes.forEach((mode) => {
      expect(comparison.resultsByMode[mode]).toHaveLength(pages.length);
      expect(
        comparison.resultsByMode[mode].map((result) => result.pageId).sort(),
      ).toEqual(pages.map((page) => page.id).sort());
    });
  });

  it('guarantees classical PageRank mode is completely independent of user behaviour scores', () => {
    const withoutBehavior = rankPages(pages, query, { mode: 'pagerank' });
    const withBehavior = rankPages(pages, query, {
      mode: 'pagerank',
      behaviorScores: { 'ks-spam': 1.0, 'ks-authentic': 0.0 },
    });

    withoutBehavior.forEach((res, i) => {
      expect(res.pageId).toBe(withBehavior[i].pageId);
      expect(res.finalScore).toBeCloseTo(withBehavior[i].finalScore, 8);
      expect(res.pageRank).toBeCloseTo(withBehavior[i].pageRank, 8);
    });
  });

  it('preserves the query', () => {
    expect(compareRankingModes(pages, query).query).toBe(query);
  });
});
