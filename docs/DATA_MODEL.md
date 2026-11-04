# MiniGoogle — Data Model & Schema Specification

## 1. Core Domain Types

All application models are strictly typed in TypeScript and validated at runtime with Zod. No `any` types are permitted.

### 1.1 WebPage
Represents a single document in a corpus.

```typescript
export interface WebPage {
  readonly id: string;               // Unique alphanumeric identifier (e.g., 'ks-spam')
  readonly url: string;              // Canonical simulated URL (e.g., 'https://...')
  readonly title: string;            // Document title tag content
  readonly headings: readonly string[]; // H1, H2, H3 section headers
  readonly metaDescription: string;  // Meta description tag content
  readonly content: string;          // Full plain-text body content
  readonly category: string;         // Thematic category (e.g., 'Travel / Editorial')
  readonly links: readonly string[];  // Outbound link targets (references to target page IDs)
  readonly publishedDate?: string;   // Optional ISO publication date
  readonly educationalRole?: string; // Pedagogical explanation of page function
}
```

### 1.2 Dataset
Represents a curated knowledge network scenario.

```typescript
export type DatasetScenario =
  | 'keyword-stuffing'
  | 'authority-problem'
  | 'link-farm'
  | 'new-website'
  | 'relevance-vs-popularity'
  | 'scientific-network';

export interface Dataset {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly scenario: DatasetScenario;
  readonly pages: readonly WebPage[];
  readonly defaultQuery?: string;
  readonly testQueries?: readonly string[];
  readonly educationalNotes?: string;
  readonly keyPageIds?: readonly string[];
}
```

### 1.3 Ranking Types

```typescript
export interface KeywordFactors {
  readonly termFrequency: number;       // Satiated TF score: 1 - exp(-count / 2)
  readonly keywordDensity: number;      // Ratio of query tokens to total tokens
  readonly titleMatch: number;          // Fraction of query tokens present in <title>
  readonly headingMatch: number;        // Position-weighted match in headings
  readonly metaMatch: number;           // Fraction of query tokens in meta description
  readonly exactPhraseMatch: number;    // Binary bonus for contiguous phrase match
  readonly proximity: number;           // Inverse span distance between query terms
  readonly lengthNormalization: number; // Gentle symmetric log-ratio document length curve
}

export interface KeywordWeights {
  readonly termFrequency: number;
  readonly keywordDensity: number;
  readonly titleMatch: number;
  readonly headingMatch: number;
  readonly metaMatch: number;
  readonly exactPhraseMatch: number;
  readonly proximity: number;
}

export interface PageRankResult {
  readonly pageId: string;
  readonly score: number;               // Stochastic probability mass (sums to 1 across corpus)
  readonly incomingLinks: readonly string[];
  readonly outgoingLinks: readonly string[];
}

export type RankingMode = 'keyword' | 'pagerank' | 'hybrid' | 'experimental';

export interface RankingWeights {
  readonly keywordWeight: number;       // Default: 0.60
  readonly pagerankWeight: number;      // Default: 0.40
  readonly behaviourWeight?: number;    // Default: 0.20 (in experimental mode)
}

export interface RankingResult {
  readonly pageId: string;
  readonly keywordScore: number;        // Normalized [0, 1]
  readonly pageRank: number;            // Raw stationary probability distribution value
  readonly normalizedPageRank: number;  // Min-max scaled [0, 1] across corpus
  readonly behaviourScore?: number;     // Normalized [0, 1] engagement score
  readonly finalScore: number;          // Blended composite score determining rank order
  readonly position: number;            // 1-based ordinal rank
  readonly factorBreakdown: KeywordFactors;
  readonly explanation?: string;
}
```

### 1.4 Simulation & Analytics Types

```typescript
export type SimulationAction =
  | 'SEARCH'
  | 'SCAN'
  | 'CLICK_RESULT'
  | 'DWELL'
  | 'SCROLL'
  | 'FOLLOW_LINK'
  | 'RETURN_TO_SEARCH'
  | 'END_SESSION';

export interface SimulationConfig {
  readonly userCount: number;           // 1 to 1000 users
  readonly clickProbability: number;    // Base click propensity [0, 1]
  readonly attentionSpan: number;       // Session timeout (seconds)
  readonly scrollProbability: number;   // Page engagement probability [0, 1]
  readonly returnProbability: number;   // Bounce probability [0, 1]
  readonly followLinkProbability: number; // Outbound traversal probability [0, 1]
  readonly speed: number;               // Animation speed multiplier
  readonly randomSeed: number;          // Integer PRNG seed for deterministic runs
}

export interface SimulationEvent {
  readonly timestamp: number;           // Milliseconds from simulation start
  readonly userId: string;              // Simulated surfer ID
  readonly action: SimulationAction;
  readonly sourcePageId?: string;
  readonly destinationPageId?: string;
  readonly dwellTimeMs?: number;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface SimulationAnalytics {
  readonly clicks: Readonly<Record<string, number>>;
  readonly clickThroughRate: Readonly<Record<string, number>>;
  readonly dwellTime: Readonly<Record<string, number>>;
  readonly bounceRate: Readonly<Record<string, number>>;
  readonly pagesPerSession: number;
  readonly navigationPaths: readonly {
    readonly userId: string;
    readonly path: readonly string[];
  }[];
  readonly totalSessions: number;
  readonly totalTimeMs: number;
}
```

## 2. Graph & Corpus Invariant Rules

1. **Identifier Uniqueness**: Every `WebPage.id` within a dataset must be unique.
2. **Referential Integrity**: Every target ID in `WebPage.links` must exist within `Dataset.pages`. Broken external links are rejected by runtime validation.
3. **Directed Topology**: Links are strictly directed edges. Bidirectional links require explicit reciprocal references.
4. **No Synthetic Manipulation**: Graph topology must remain unaltered by simulation events.

