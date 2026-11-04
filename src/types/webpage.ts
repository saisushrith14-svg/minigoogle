/**
 * WebPage Interface and Types
 * Defines the core representation of a document in the MiniGoogle search corpus.
 */

export interface WebPage {
  /** Unique identifier for the page (e.g., 'page-1', 'doc-travel-guide') */
  readonly id: string;

  /** Simulated URL (e.g., 'https://www.stanford.edu/cs/pagerank.html') */
  readonly url: string;

  /** HTML Document Title tag content */
  readonly title: string;

  /** Primary and secondary headings extracted from the document (H1, H2, H3) */
  readonly headings: readonly string[];

  /** Meta description tag content for snippet generation and keyword matching */
  readonly metaDescription: string;

  /** Full textual body content of the document */
  readonly content: string;

  /** Classification category for thematic clustering and visual graphing */
  readonly category: string;

  /** Outgoing directed hyperlink targets represented by target page IDs */
  readonly links: readonly string[];

  /** Optional publication date or timestamp for simulation context */
  readonly publishedDate?: string;

  /** Optional human-readable notes detailing the educational purpose of this page */
  readonly educationalRole?: string;
}

/**
 * Summary representation of a WebPage used in compact listings and search results.
 */
export type WebPageSummary = Pick<WebPage, 'id' | 'url' | 'title' | 'metaDescription' | 'category'>;

