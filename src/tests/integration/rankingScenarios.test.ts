import { describe, expect, it } from 'vitest';
import { rankPages } from '../../algorithms/rankingPipeline';
import { runSurferSimulation } from '../../simulation/surferSimulation';
import {
  authorityProblemDataset,
  keywordStuffingDataset,
  linkFarmDataset,
  newWebsiteDataset,
  relevanceVsPopularityDataset,
  scientificNetworkDataset,
} from '../../data/datasets';
import type { Dataset } from '../../types';

function topPage(dataset: Dataset, mode: 'keyword' | 'pagerank' | 'hybrid'): string {
  const query = dataset.defaultQuery ?? '';
  const results = rankPages(dataset.pages, query, { mode });
  return results[0].pageId;
}

function positionOf(dataset: Dataset, pageId: string, mode: 'keyword' | 'pagerank'): number {
  const query = dataset.defaultQuery ?? '';
  return (
    rankPages(dataset.pages, query, { mode }).find((result) => result.pageId === pageId)
      ?.position ?? -1
  );
}

describe('educational ranking divergences', () => {
  it('keyword stuffing: spam wins keyword but not PageRank', () => {
    expect(topPage(keywordStuffingDataset, 'keyword')).toBe('ks-spam');
    expect(topPage(keywordStuffingDataset, 'pagerank')).not.toBe('ks-spam');
    const results = rankPages(
      keywordStuffingDataset.pages,
      keywordStuffingDataset.defaultQuery ?? '',
      { mode: 'pagerank' },
    );
    const spam = results.find((result) => result.pageId === 'ks-spam');
    const authentic = results.find((result) => result.pageId === 'ks-authentic');
    expect(authentic?.pageRank ?? 0).toBeGreaterThan(spam?.pageRank ?? 0);
  });

  it('authority problem: the relevant article wins keyword, the site hub wins PageRank', () => {
    expect(topPage(authorityProblemDataset, 'keyword')).toBe('ap-cancer-article');
    expect(topPage(authorityProblemDataset, 'pagerank')).toBe('ap-university-home');
  });

  it('link farm: the spam page wins keyword ranking', () => {
    expect(topPage(linkFarmDataset, 'keyword')).toBe('lf-casino-spam');
  });

  it('new website: relevance is immediate but authority accrues slowly', () => {
    expect(topPage(newWebsiteDataset, 'keyword')).toBe('nw-new-guide');
    expect(
      positionOf(newWebsiteDataset, 'nw-new-guide', 'pagerank'),
    ).toBeGreaterThan(positionOf(newWebsiteDataset, 'nw-new-guide', 'keyword'));
    expect(topPage(newWebsiteDataset, 'pagerank')).not.toBe('nw-new-guide');
  });

  it('relevance vs popularity: the relevant article wins keyword, popularity wins PageRank', () => {
    expect(topPage(relevanceVsPopularityDataset, 'keyword')).toBe('rp-solutions');
    expect(topPage(relevanceVsPopularityDataset, 'pagerank')).not.toBe('rp-solutions');
  });

  it('scientific network: authority and relevance agree on the seminal paper', () => {
    expect(topPage(scientificNetworkDataset, 'keyword')).toBe('sn-pagerank-paper');
    expect(topPage(scientificNetworkDataset, 'pagerank')).toBe('sn-pagerank-paper');
  });

  it('hybrid ranking blends the two signals', () => {
    (['keyword-stuffing', 'authority-problem', 'new-website'] as const).forEach(() => {
      const dataset = keywordStuffingDataset;
      const query = dataset.defaultQuery ?? '';
      const keywordTop = rankPages(dataset.pages, query, { mode: 'keyword' })[0];
      const pagerankTop = rankPages(dataset.pages, query, { mode: 'pagerank' })[0];
      const hybrid = rankPages(dataset.pages, query, {
        mode: 'hybrid',
        rankingWeights: { keywordWeight: 0.5, pagerankWeight: 0.5, behaviourWeight: 0 },
      });
      expect([keywordTop.pageId, pagerankTop.pageId]).toContain(hybrid[0].pageId);
    });
  });

  it('experimental ranking consumes real surfer telemetry', () => {
    const dataset = keywordStuffingDataset;
    const query = dataset.defaultQuery ?? '';
    const base = rankPages(dataset.pages, query, { mode: 'hybrid' });
    const run = runSurferSimulation({
      dataset,
      query,
      results: base,
      rankingMode: 'hybrid',
      config: { userCount: 20, randomSeed: 7 },
    });
    const scoreMap: Record<string, number> = {};
    run.behaviourScores.forEach((score) => {
      scoreMap[score.pageId] = score.aggregateBehaviourScore;
    });
    const experimental = rankPages(dataset.pages, query, {
      mode: 'experimental',
      rankingWeights: { keywordWeight: 0.4, pagerankWeight: 0.3, behaviourWeight: 0.3 },
      behaviorScores: scoreMap,
    });
    experimental.forEach((result) => {
      expect(result.behaviourScore).toBeDefined();
      expect(result.behaviourScore).toBe(scoreMap[result.pageId]);
    });
    expect(Object.values(scoreMap).some((score) => score > 0)).toBe(true);
  });
});
