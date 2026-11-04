/**
 * Aggregated analytics derived from simulated surfer telemetry.
 */
export interface SimulationAnalytics {
  /** Map of pageId to total raw click counts */
  readonly clicks: Readonly<Record<string, number>>;

  /** Map of pageId to click-through rate relative to SERP impressions [0, 1] */
  readonly clickThroughRate: Readonly<Record<string, number>>;

  /** Map of pageId to average dwell time in seconds */
  readonly dwellTime: Readonly<Record<string, number>>;

  /** Map of pageId to bounce rate (ratio of immediate returns to search without further clicks) [0, 1] */
  readonly bounceRate: Readonly<Record<string, number>>;

  /** Average number of distinct pages viewed per user session across the simulation */
  readonly pagesPerSession: number;

  /** Chronological navigation sequences for each simulated user */
  readonly navigationPaths: readonly {
    readonly userId: string;
    readonly path: readonly string[];
  }[];

  /** Total number of simulated sessions represented in analytics */
  readonly totalSessions: number;

  /** Total elapsed simulation time in milliseconds */
  readonly totalTimeMs: number;
}

/**
 * Breakdown of components used to calculate a page's Behaviour Score.
 */
export interface BehaviourScoreBreakdown {
  readonly pageId: string;
  readonly ctrScore: number;
  readonly dwellScore: number;
  readonly bouncePenalty: number;
  readonly aggregateBehaviourScore: number;
}

