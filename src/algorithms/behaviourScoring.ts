import type { BehaviourScoreBreakdown, SimulationAnalytics } from '../types';
import { clamp } from '../utils/normalization';

export interface BehaviourScoringOptions {
  /** Dwell duration (seconds) at which engagement is considered strong. */
  readonly dwellSaturationSeconds?: number;
  /** Weight of normalized CTR in the aggregate score. */
  readonly ctrWeight?: number;
  /** Weight of normalized dwell time in the aggregate score. */
  readonly dwellWeight?: number;
  /** Penalty applied per unit of bounce rate. */
  readonly bouncePenaltyWeight?: number;
}

/**
 * Converts observed surfer telemetry into a normalized behaviour score.
 *
 * - CTR is min-max normalized across the pages in the corpus.
 * - Dwell uses saturating normalization so one extremely long outlier does not
 *   erase differences between every other page.
 * - Bounce rate subtracts from the aggregate.
 *
 * Pages without any telemetry receive a score of 0 rather than a synthetic
 * baseline.
 */
export function computeBehaviourScores(
  analytics: SimulationAnalytics,
  pageIds: readonly string[],
  options: BehaviourScoringOptions = {},
): BehaviourScoreBreakdown[] {
  const dwellSaturation = options.dwellSaturationSeconds ?? 20;
  const ctrWeight = options.ctrWeight ?? 0.5;
  const dwellWeight = options.dwellWeight ?? 0.5;
  const bounceWeight = options.bouncePenaltyWeight ?? 0.3;

  const rawCtr = pageIds.map((id) => Math.max(0, analytics.clickThroughRate[id] ?? 0));
  const maxCtr = rawCtr.reduce((max, value) => Math.max(max, value), 0);

  return pageIds.map((pageId, index) => {
    const ctr = rawCtr[index];
    const dwellSeconds = Math.max(0, analytics.dwellTime[pageId] ?? 0);
    const bounceRate = clamp(analytics.bounceRate[pageId] ?? 0, 0, 1);
    const hasTelemetry =
      (analytics.clicks[pageId] ?? 0) > 0 || dwellSeconds > 0 || ctr > 0;

    if (!hasTelemetry) {
      return {
        pageId,
        ctrScore: 0,
        dwellScore: 0,
        bouncePenalty: bounceRate,
        aggregateBehaviourScore: 0,
      };
    }

    const ctrScore = maxCtr > 0 ? clamp(ctr / maxCtr, 0, 1) : 0;
    const dwellScore =
      dwellSaturation > 0 ? clamp(1 - Math.exp(-dwellSeconds / dwellSaturation), 0, 1) : 0;
    const aggregate = clamp(
      ctrWeight * ctrScore + dwellWeight * dwellScore - bounceWeight * bounceRate,
      0,
      1,
    );

    return {
      pageId,
      ctrScore,
      dwellScore,
      bouncePenalty: bounceRate,
      aggregateBehaviourScore: aggregate,
    };
  });
}

/** Convenience map form consumed by the ranking pipeline. */
export function behaviourScoreMap(
  breakdowns: readonly BehaviourScoreBreakdown[],
): Record<string, number> {
  const map: Record<string, number> = {};
  breakdowns.forEach((item) => {
    map[item.pageId] = item.aggregateBehaviourScore;
  });
  return map;
}
