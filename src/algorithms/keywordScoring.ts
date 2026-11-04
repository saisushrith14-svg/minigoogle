import type { KeywordFactors, KeywordWeights, WebPage } from '../types';
import {
  clamp,
} from '../utils/normalization';
import {
  containsPhrase,
  countTerm,
  extractPhraseTerms,
  extractQueryTerms,
  minimumTermWindow,
  tokenize,
} from './tokenizer';

/** Default weights used by the pre-1998 keyword relevance model. */
export const DEFAULT_KEYWORD_WEIGHTS: KeywordWeights = {
  termFrequency: 0.18,
  keywordDensity: 0.17,
  titleMatch: 0.2,
  headingMatch: 0.15,
  metaMatch: 0.1,
  exactPhraseMatch: 0.12,
  proximity: 0.08,
};

export interface KeywordScoringOptions {
  /** Partial overrides merged over {@link DEFAULT_KEYWORD_WEIGHTS}. */
  readonly weights?: Partial<KeywordWeights>;
  /** Optional corpus average used by length normalization. */
  readonly averageTokenCount?: number;
}

export interface KeywordScoreResult {
  readonly pageId: string;
  /** Weighted relevance in [0, 1]. */
  readonly score: number;
  readonly factors: KeywordFactors;
}

const FACTOR_KEYS = [
  'termFrequency',
  'keywordDensity',
  'titleMatch',
  'headingMatch',
  'metaMatch',
  'exactPhraseMatch',
  'proximity',
] as const;

/** Merges partial weights, clamps negatives to zero, and avoids NaN values. */
export function normalizeKeywordWeights(
  overrides: Partial<KeywordWeights> = {},
): KeywordWeights {
  const merged = { ...DEFAULT_KEYWORD_WEIGHTS, ...overrides };
  const result = {} as Record<(typeof FACTOR_KEYS)[number], number>;
  FACTOR_KEYS.forEach((key) => {
    const value = merged[key];
    result[key] = Number.isFinite(value) ? Math.max(0, value) : 0;
  });
  if (FACTOR_KEYS.every((key) => result[key] === 0)) {
    return { ...DEFAULT_KEYWORD_WEIGHTS };
  }
  return result;
}

function fractionPresent(terms: readonly string[], tokens: readonly string[]): number {
  if (terms.length === 0) return 0;
  const tokenSet = new Set(tokens);
  const present = terms.filter((term) => tokenSet.has(term)).length;
  return present / terms.length;
}

function headingMatchScore(terms: readonly string[], headings: readonly string[]): number {
  if (terms.length === 0 || headings.length === 0) return 0;
  const tokenizedHeadings = headings.map((heading) => new Set(tokenize(heading)));
  return (
    terms.reduce((total, term) => {
      let best = 0;
      tokenizedHeadings.forEach((tokens, index) => {
        if (!tokens.has(term)) return;
        const weight = index === 0 ? 1 : Math.max(0.35, 1 - index * 0.18);
        best = Math.max(best, weight);
      });
      return total + best;
    }, 0) / terms.length
  );
}

/**
 * Scores a single page against a query using the eight documented factors.
 *
 * `lengthNormalization` is a bounded multiplier over the weighted sum because
 * the public `KeywordWeights` contract deliberately has no weight for it.
 */
export function scoreKeywordPage(
  page: WebPage,
  query: string,
  options: KeywordScoringOptions = {},
): KeywordScoreResult {
  const weights = normalizeKeywordWeights(options.weights);
  const queryTerms = extractQueryTerms(query);
  const phraseTerms = extractPhraseTerms(query);
  const bodyTokens = tokenize(page.content);
  const titleTokens = tokenize(page.title);
  const metaTokens = tokenize(page.metaDescription);

  if (queryTerms.length === 0) {
    return {
      pageId: page.id,
      score: 0,
      factors: {
        termFrequency: 0,
        keywordDensity: 0,
        titleMatch: 0,
        headingMatch: 0,
        metaMatch: 0,
        exactPhraseMatch: 0,
        proximity: 0,
        lengthNormalization: 1,
      },
    };
  }

  const termOccurrences = queryTerms.reduce(
    (total, term) => total + countTerm(bodyTokens, term),
    0,
  );
  const termFrequency = 1 - Math.exp(-termOccurrences / 2);
  const density = bodyTokens.length === 0 ? 0 : termOccurrences / bodyTokens.length;
  const keywordDensity = clamp(density / 0.06, 0, 1);
  const titleMatch = fractionPresent(queryTerms, titleTokens);
  const headingMatch = headingMatchScore(queryTerms, page.headings);
  const metaMatch = fractionPresent(queryTerms, metaTokens);
  const exactPhraseMatch =
    phraseTerms.length > 1 && containsPhrase(bodyTokens, phraseTerms) ? 1 : 0;

  let proximity = 0;
  if (queryTerms.length === 1) {
    proximity = bodyTokens.includes(queryTerms[0]) ? 1 : 0;
  } else {
    const window = minimumTermWindow(bodyTokens, queryTerms);
    if (window) {
      const averageGap = (window.span - queryTerms.length) / (queryTerms.length - 1);
      proximity = 1 / (1 + Math.max(0, averageGap));
    }
  }

  // Gentle symmetric length correction. Keyword density already accounts for
  // most length effects, so this factor must not double-penalize long but
  // genuinely keyword-rich documents (which was the historical failure mode of
  // naive density-only scoring).
  const baseline = options.averageTokenCount ?? 140;
  const lengthRatio = (bodyTokens.length + 1) / (baseline + 1);
  const lengthNormalization = clamp(
    1 / (1 + Math.abs(Math.log(lengthRatio)) * 0.3),
    0.25,
    1,
  );

  const factors: KeywordFactors = {
    termFrequency,
    keywordDensity,
    titleMatch,
    headingMatch,
    metaMatch,
    exactPhraseMatch,
    proximity,
    lengthNormalization,
  };

  const totalWeight = FACTOR_KEYS.reduce((total, key) => total + weights[key], 0);
  const weighted =
    FACTOR_KEYS.reduce((total, key) => total + weights[key] * factors[key], 0) /
    totalWeight;

  return {
    pageId: page.id,
    score: clamp(weighted * lengthNormalization, 0, 1),
    factors,
  };
}

/** Scores every page in a corpus. */
export function scoreKeywordCorpus(
  pages: readonly WebPage[],
  query: string,
  options: KeywordScoringOptions = {},
): KeywordScoreResult[] {
  if (pages.length === 0) return [];
  const averageTokenCount =
    options.averageTokenCount ??
    pages.reduce((total, page) => total + tokenize(page.content).length, 0) / pages.length;
  return pages.map((page) =>
    scoreKeywordPage(page, query, { ...options, averageTokenCount }),
  );
}
