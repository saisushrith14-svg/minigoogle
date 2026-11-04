import type { BehaviourScoreBreakdown, SimulationAnalytics } from './analytics';
import type { RankingMode } from './ranking';
import type { SimulationConfig, SimulationEvent } from './simulation';

/**
 * Complete, reproducible output of one surfer simulation run. The raw events
 * are retained so analytics and replay always derive from the same telemetry.
 */
export interface SimulationRun {
  readonly id: string;
  readonly datasetId: string;
  readonly query: string;
  /** Ranking model whose SERP ordered the simulation. */
  readonly rankingMode: RankingMode;
  readonly config: SimulationConfig;
  readonly events: readonly SimulationEvent[];
  readonly analytics: SimulationAnalytics;
  /** SERP impressions per page, used as the CTR denominator. */
  readonly impressions: Readonly<Record<string, number>>;
  readonly behaviourScores: readonly BehaviourScoreBreakdown[];
  readonly totalTimeMs: number;
}
