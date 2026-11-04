import type {
  Dataset,
  KeywordFactors,
  KeywordWeights,
  PageRankConfig,
  RankingMode,
  RankingResult,
  RankingWeights,
  WebPage,
} from '../types';
import { clamp, minMaxNormalize } from '../utils/normalization';
import { DEFAULT_KEYWORD_WEIGHTS, normalizeKeywordWeights, scoreKeywordCorpus } from './keywordScoring';
import {
  computePageRank,
  DEFAULT_PAGERANK_CONFIG,
  type PageRankComputation,
} from './pageRank';

export const DEFAULT_RANKING_WEIGHTS: RankingWeights = {
  keywordWeight: 0.6,
  pagerankWeight: 0.4,
  behaviourWeight: 0.2,
};

export interface RankPagesOptions {
  readonly mode: RankingMode;
  readonly keywordWeights?: Partial<KeywordWeights>;
  readonly rankingWeights?: Partial<RankingWeights>;
  readonly behaviorScores?: Readonly<Record<string, number>>;
  readonly pageRankConfig?: Partial<PageRankConfig>;
}

export interface SearchResponse {
  readonly datasetId: string;
  readonly query: string;
  readonly mode: RankingMode;
  readonly results: readonly RankingResult[];
  readonly keywordWeights: KeywordWeights;
  readonly rankingWeights: RankingWeights;
  readonly pageRankConfig: PageRankConfig;
  readonly pageRankComputation: PageRankComputation;
}

export interface RankingComparison {
  readonly query: string;
  readonly resultsByMode: Readonly<Record<RankingMode, readonly RankingResult[]>>;
}

const FACTOR_LABELS: Readonly<Record<keyof KeywordFactors, string>> = {
  termFrequency: 'term frequency',
  keywordDensity: 'keyword density',
  titleMatch: 'title match',
  headingMatch: 'heading match',
  metaMatch: 'meta description match',
  exactPhraseMatch: 'exact phrase',
  proximity: 'term proximity',
  lengthNormalization: 'length normalization',
};

/** Resolves and sanitizes a ranking-weight configuration. */
export function resolveRankingWeights(
  overrides: Partial<RankingWeights> = {},
): RankingWeights {
  const merged = { ...DEFAULT_RANKING_WEIGHTS, ...overrides };
  const keywordWeight = Number.isFinite(merged.keywordWeight)
    ? Math.max(0, merged.keywordWeight)
    : DEFAULT_RANKING_WEIGHTS.keywordWeight;
  const pagerankWeight = Number.isFinite(merged.pagerankWeight)
    ? Math.max(0, merged.pagerankWeight)
    : DEFAULT_RANKING_WEIGHTS.pagerankWeight;
  const behaviourWeight =
    merged.behaviourWeight !== undefined && Number.isFinite(merged.behaviourWeight)
      ? Math.max(0, merged.behaviourWeight)
      : (DEFAULT_RANKING_WEIGHTS.behaviourWeight ?? 0);

  if (keywordWeight + pagerankWeight + behaviourWeight === 0) {
    return { ...DEFAULT_RANKING_WEIGHTS };
  }
  return { keywordWeight, pagerankWeight, behaviourWeight };
}

interface ModeWeights {
  readonly keyword: number;
  readonly pagerank: number;
  readonly behaviour: number;
}

function normalizedModeWeights(mode: RankingMode, weights: RankingWeights): ModeWeights {
  if (mode === 'keyword') return { keyword: 1, pagerank: 0, behaviour: 0 };
  if (mode === 'pagerank') return { keyword: 0, pagerank: 1, behaviour: 0 };

  const behaviour = mode === 'experimental' ? (weights.behaviourWeight ?? 0) : 0;
  const total = weights.keywordWeight + weights.pagerankWeight + behaviour;
  if (total <= 0) {
    if (mode === 'experimental') {
      return { keyword: 0.5, pagerank: 0.3, behaviour: 0.2 };
    }
    return { keyword: 0.6, pagerank: 0.4, behaviour: 0 };
  }
  return {
    keyword: weights.keywordWeight / total,
    pagerank: weights.pagerankWeight / total,
    behaviour: behaviour / total,
  };
}

function strongestFactors(factors: KeywordFactors): string {
  const entries = (
    [
      'termFrequency',
      'keywordDensity',
      'titleMatch',
      'headingMatch',
      'metaMatch',
      'exactPhraseMatch',
      'proximity',
    ] as const
  )
    .map((key) => ({ key, value: factors[key] }))
    .sort((a, b) => b.value - a.value || a.key.localeCompare(b.key))
    .slice(0, 2);
  return entries.map((entry) => `${FACTOR_LABELS[entry.key]} (${entry.value.toFixed(2)})`).join(', ');
}

function buildExplanation(
  mode: RankingMode,
  position: number,
  keywordScore: number,
  pageRank: number,
  normalizedPageRank: number,
  behaviourScore: number | undefined,
  factors: KeywordFactors,
  incomingCount: number,
  modeWeights: ModeWeights,
): string {
  switch (mode) {
    case 'keyword':
      return `Position ${position} from content relevance alone. Strongest signals: ${strongestFactors(factors)}.`;
    case 'pagerank':
      return `Position ${position} from link authority alone: PageRank ${pageRank.toFixed(4)} across ${incomingCount} incoming link${incomingCount === 1 ? '' : 's'}.`;
    case 'hybrid':
      return `Position ${position}: ${(modeWeights.keyword * 100).toFixed(0)}% keyword relevance (${keywordScore.toFixed(2)}) + ${(modeWeights.pagerank * 100).toFixed(0)}% normalized PageRank (${normalizedPageRank.toFixed(2)}).`;
    case 'experimental':
      return `Position ${position}: ${(modeWeights.keyword * 100).toFixed(0)}% keyword (${keywordScore.toFixed(2)}), ${(modeWeights.pagerank * 100).toFixed(0)}% PageRank (${normalizedPageRank.toFixed(2)}), ${(modeWeights.behaviour * 100).toFixed(0)}% surfer behaviour (${(behaviourScore ?? 0).toFixed(2)}).`;
    default: {
      const exhaustive: never = mode;
      return exhaustive;
    }
  }
}

/**
 * Ranks a corpus for a query. This is the single pipeline used by search, the
 * graph, the simulator and the comparison lab, guaranteeing consistent scores.
 */
export function rankPages(
  pages: readonly WebPage[],
  query: string,
  options: RankPagesOptions,
): RankingResult[] {
  if (pages.length === 0) return [];

  const mode = options.mode;
  const keywordWeights = normalizeKeywordWeights(options.keywordWeights);
  const rankingWeights = resolveRankingWeights(options.rankingWeights);
  const keywordScores = scoreKeywordCorpus(pages, query, { weights: keywordWeights });
  const pageRank = computePageRank(pages, options.pageRankConfig);
  const normalizedPageRank = minMaxNormalize(
    pages.map((page) => pageRank.scores[page.id] ?? 0),
    0.5,
  );
  const normalizedByPage: Record<string, number> = {};
  pages.forEach((page, index) => {
    normalizedByPage[page.id] = normalizedPageRank[index];
  });

  const weights = normalizedModeWeights(mode, rankingWeights);

  const results = pages.map((page, index) => {
    const keyword = keywordScores[index];
    const rawPageRank = pageRank.scores[page.id] ?? 0;
    const normalizedPr = normalizedByPage[page.id] ?? 0;
    const behaviourValue =
      options.behaviorScores?.[page.id] !== undefined
        ? clamp(options.behaviorScores[page.id], 0, 1)
        : undefined;
    const behaviourForScore = behaviourValue ?? 0;

    let finalScore: number;
    if (mode === 'keyword') finalScore = keyword.score;
    else if (mode === 'pagerank') finalScore = normalizedPr;
    else {
      finalScore =
        weights.keyword * keyword.score +
        weights.pagerank * normalizedPr +
        weights.behaviour * behaviourForScore;
    }

    return {
      pageId: page.id,
      keywordScore: keyword.score,
      pageRank: rawPageRank,
      normalizedPageRank: normalizedPr,
      behaviourScore: behaviourValue,
      finalScore: clamp(finalScore, 0, 1),
      position: 0,
      factorBreakdown: keyword.factors,
      explanation: buildExplanation(
        mode,
        index + 1,
        keyword.score,
        rawPageRank,
        normalizedPr,
        behaviourValue,
        keyword.factors,
        pageRank.results[index]?.incomingLinks.length ?? 0,
        weights,
      ),
    };
  });

  results.sort((a, b) => {
    if (Math.abs(b.finalScore - a.finalScore) > 1e-12) return b.finalScore - a.finalScore;
    if (Math.abs(b.pageRank - a.pageRank) > 1e-12) return b.pageRank - a.pageRank;
    return a.pageId.localeCompare(b.pageId);
  });

  return results.map((result, index) => {
    const incoming = pageRank.results.find((candidate) => candidate.pageId === result.pageId)
      ?.incomingLinks.length ?? 0;
    return {
      ...result,
      position: index + 1,
      explanation: buildExplanation(
        mode,
        index + 1,
        result.keywordScore,
        result.pageRank,
        result.normalizedPageRank,
        result.behaviourScore,
        result.factorBreakdown,
        incoming,
        weights,
      ),
    };
  });
}

/** Runs the pipeline and returns the complete configuration for the UI. */
export function searchDataset(
  dataset: Dataset,
  query: string,
  options: RankPagesOptions,
): SearchResponse {
  const keywordWeights = normalizeKeywordWeights(options.keywordWeights);
  const rankingWeights = resolveRankingWeights(options.rankingWeights);
  const pageRankConfig: PageRankConfig = {
    ...DEFAULT_PAGERANK_CONFIG,
    ...options.pageRankConfig,
  };

  return {
    datasetId: dataset.id,
    query,
    mode: options.mode,
    results: rankPages(dataset.pages, query, options),
    keywordWeights,
    rankingWeights,
    pageRankConfig,
    pageRankComputation: computePageRank(dataset.pages, pageRankConfig),
  };
}

/** Runs every ranking model so the comparison lab can align one corpus. */
export function compareRankingModes(
  pages: readonly WebPage[],
  query: string,
  options: Omit<RankPagesOptions, 'mode'> = {},
): RankingComparison {
  const modes: readonly RankingMode[] = ['keyword', 'pagerank', 'hybrid', 'experimental'];
  const resultsByMode = {} as Record<RankingMode, readonly RankingResult[]>;
  modes.forEach((mode) => {
    resultsByMode[mode] = rankPages(pages, query, { ...options, mode });
  });
  return { query, resultsByMode };
}

export { DEFAULT_KEYWORD_WEIGHTS };
