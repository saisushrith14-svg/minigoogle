/**
 * Possible surfer actions emitted during the deterministic simulation.
 */
export type SimulationAction =
  | 'SEARCH'             // User initiates search query
  | 'SCAN'               // User scans top N search results
  | 'CLICK_RESULT'       // User clicks a SERP link
  | 'DWELL'              // User reads content on target page
  | 'SCROLL'             // User engages with content by scrolling
  | 'FOLLOW_LINK'        // User clicks an outgoing link on the page
  | 'RETURN_TO_SEARCH'   // User bounces or returns to SERP
  | 'END_SESSION';       // User abandons search session

/**
 * Deterministic configuration controlling simulated surfer behavior.
 */
export interface SimulationConfig {
  /** Number of virtual web surfers participating in the simulation run */
  readonly userCount: number;

  /** Baseline probability of clicking a result given its position and title [0, 1] */
  readonly clickProbability: number;

  /** Maximum time in seconds a user stays active in one session */
  readonly attentionSpan: number;

  /** Probability that a user scrolls after clicking into a webpage [0, 1] */
  readonly scrollProbability: number;

  /** Probability that a user clicks Back/Return to Search when unsatisfied [0, 1] */
  readonly returnProbability: number;

  /** Probability that a user follows an internal/external link from the target page [0, 1] */
  readonly followLinkProbability: number;

  /** Playback speed multiplier (1x, 2x, 5x, 10x) for UI animation and step intervals */
  readonly speed: number;

  /** Fixed numeric seed ensuring 100% deterministic, reproducible pseudo-random sequences */
  readonly randomSeed: number;
}

/**
 * Atomic event emitted by a simulated surfer.
 */
export interface SimulationEvent {
  /** Relative simulation timestamp in milliseconds */
  readonly timestamp: number;

  /** Simulated user identifier (e.g. 'surfer-001') */
  readonly userId: string;

  /** Action type taken by the surfer */
  readonly action: SimulationAction;

  /** Current page ID where action originated (or undefined if at search box) */
  readonly sourcePageId?: string;

  /** Target page ID being navigated to (or undefined if returning to SERP or ending) */
  readonly destinationPageId?: string;

  /** Duration spent dwelling in milliseconds (relevant for DWELL events) */
  readonly dwellTimeMs?: number;

  /** Optional descriptive metadata for audit logs and event inspection */
  readonly metadata?: Readonly<Record<string, unknown>>;
}

/**
 * Internal state of a simulated surfer during execution.
 */
export interface SurferState {
  readonly id: string;
  readonly status: 'idle' | 'searching' | 'viewing_results' | 'browsing_page' | 'session_ended';
  readonly currentPageId?: string;
  readonly previousPageId?: string;
  readonly sessionStartTime: number;
  readonly currentDwellStart?: number;
  readonly pagesVisited: readonly string[];
  readonly totalClicks: number;
  readonly satisfactionScore: number;
}

