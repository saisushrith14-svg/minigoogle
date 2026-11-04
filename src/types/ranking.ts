/**
 * Ranking Factor Breakdown for Keyword-based relevance scoring.
 * All factors are individually scored between 0 and 1 before weighting.
 */
export interface KeywordFactors {
  /** Raw term frequency score (normalized by total words or log-scaled) */
  readonly termFrequency: number;

  /** Ratio of query occurrences relative to total document tokens */
  readonly keywordDensity: number;

  /** Binary or fractional score indicating match presence in document <title> */
  readonly titleMatch: number;

  /** Score based on match presence and weight in H1, H2, and H3 headers */
  readonly headingMatch: number;

  /** Score based on query occurrences in <meta name="description"> */
  readonly metaMatch: number;

  /** Bonus multiplier for contiguous exact phrase match in body */
  readonly exactPhraseMatch: number;

  /** Inverse distance score between multiword query terms within the text */
  readonly proximity: number;

  /** Length normalization penalty preventing short-document or giant-document distortion */
  readonly lengthNormalization: number;
}

/**
 * User-tunable weights for the Keyword Relevance scoring engine.
 */
export interface KeywordWeights {
  readonly termFrequency: number;
  readonly keywordDensity: number;
  readonly titleMatch: number;
  readonly headingMatch: number;
  readonly metaMatch: number;
  readonly exactPhraseMatch: number;
  readonly proximity: number;
}

/**
 * PageRank iterative convergence computation result for an individual webpage.
 */
export interface PageRankResult {
  /** Target page identifier */
  readonly pageId: string;

  /** Absolute converged PageRank score (sums to 1 across the graph) */
  readonly score: number;

  /** IDs of incoming hyperlinking pages */
  readonly incomingLinks: readonly string[];

  /** IDs of outgoing hyperlinking pages */
  readonly outgoingLinks: readonly string[];
}

/**
 * Mathematical configuration parameters for PageRank calculation.
 */
export interface PageRankConfig {
  /** Teleportation probability complement (standard Google value: 0.85) */
  readonly dampingFactor: number;

  /** Maximum power-iteration loops allowed before terminating */
  readonly maxIterations: number;

  /** L1 norm delta threshold indicating numerical convergence */
  readonly convergenceThreshold: number;
}

/**
 * Supported search ranking modes in MiniGoogle.
 */
export type RankingMode =
  | 'keyword'       // Pre-1998 purely content-based relevance
  | 'pagerank'      // 1998 Google link-structure PageRank
  | 'hybrid'        // Combined Keyword + PageRank model
  | 'experimental'; // Hybrid + Simulated Surfer Behaviour

/**
 * Configuration for blending algorithmic weights in Hybrid and Experimental modes.
 */
export interface RankingWeights {
  /** Weight allocated to Keyword Relevance (e.g. 0.60 in hybrid) */
  readonly keywordWeight: number;

  /** Weight allocated to Normalized PageRank (e.g. 0.40 in hybrid) */
  readonly pagerankWeight: number;

  /** Optional weight allocated to Surfer Behaviour (e.g. 0.20 in experimental) */
  readonly behaviourWeight?: number;
}

/**
 * Unified search result contract returned by the ranking pipeline.
 */
export interface RankingResult {
  /** ID of the ranked webpage */
  readonly pageId: string;

  /** Raw normalized keyword relevance score [0, 1] */
  readonly keywordScore: number;

  /** Raw PageRank probability distribution value */
  readonly pageRank: number;

  /** PageRank score normalized across current query corpus [0, 1] */
  readonly normalizedPageRank: number;

  /** Optional normalized surfer engagement score [0, 1] */
  readonly behaviourScore?: number;

  /** Final composite ranking score used to sort results descending */
  readonly finalScore: number;

  /** Assigned 1-based ordinal position in search engine result pages (SERP) */
  readonly position: number;

  /** Granular diagnostic breakdown of keyword component values */
  readonly factorBreakdown: KeywordFactors;

  /** Optional human-readable explanation of why this page ranked at this position */
  readonly explanation?: string;
}

