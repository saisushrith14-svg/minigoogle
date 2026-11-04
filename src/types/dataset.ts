import { WebPage } from './webpage';

/**
 * Supported educational scenarios for MiniGoogle datasets.
 */
export type DatasetScenario =
  | 'keyword-stuffing'
  | 'authority-problem'
  | 'link-farm'
  | 'new-website'
  | 'relevance-vs-popularity'
  | 'scientific-network';

/**
 * Dataset representation encapsulating a curated network of WebPages demonstrating
 * specific search engine ranking characteristics and historical edge cases.
 */
export interface Dataset {
  /** Unique identifier for the dataset (e.g., 'keyword-stuffing-demo') */
  readonly id: string;

  /** Display title for user selection in the UI */
  readonly name: string;

  /** Comprehensive explanation of what this dataset illustrates */
  readonly description: string;

  /** Scenario classification determining educational context */
  readonly scenario: DatasetScenario;

  /** Array of WebPages contained in this corpus */
  readonly pages: readonly WebPage[];

  /** Suggested query keywords that demonstrate the educational divergence in this dataset */
  readonly defaultQuery?: string;

  /** Alternate queries that reveal interesting algorithmic properties */
  readonly testQueries?: readonly string[];

  /** In-depth educational description of expected ranking shifts across algorithms */
  readonly educationalNotes?: string;

  /** IDs of key focal pages to highlight in visualizations */
  readonly keyPageIds?: readonly string[];
}

/**
 * Dataset summary used for dropdown selectors and navigation cards.
 */
export type DatasetMeta = Pick<Dataset, 'id' | 'name' | 'description' | 'scenario' | 'defaultQuery'> & {
  readonly pageCount: number;
};

