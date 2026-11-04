import { describe, expect, it } from 'vitest';
import {
  behaviourScoreMap,
  computeBehaviourScores,
} from '../../algorithms/behaviourScoring';
import type { SimulationAnalytics } from '../../types';

function analytics(overrides: Partial<SimulationAnalytics> = {}): SimulationAnalytics {
  return {
    clicks: { a: 10, b: 2 },
    clickThroughRate: { a: 0.5, b: 0.1 },
    dwellTime: { a: 30, b: 5 },
    bounceRate: { a: 0.1, b: 0.8 },
    pagesPerSession: 2,
    navigationPaths: [],
    totalSessions: 10,
    totalTimeMs: 1000,
    ...overrides,
  };
}

describe('computeBehaviourScores', () => {
  it('produces bounded, normalized component scores', () => {
    const scores = computeBehaviourScores(analytics(), ['a', 'b']);
    scores.forEach((score) => {
      expect(score.ctrScore).toBeGreaterThanOrEqual(0);
      expect(score.ctrScore).toBeLessThanOrEqual(1);
      expect(score.dwellScore).toBeGreaterThanOrEqual(0);
      expect(score.dwellScore).toBeLessThanOrEqual(1);
      expect(score.bouncePenalty).toBeGreaterThanOrEqual(0);
      expect(score.aggregateBehaviourScore).toBeGreaterThanOrEqual(0);
      expect(score.aggregateBehaviourScore).toBeLessThanOrEqual(1);
    });
  });

  it('ranks higher CTR and dwell above lower values', () => {
    const scores = computeBehaviourScores(analytics(), ['a', 'b']);
    const a = scores.find((score) => score.pageId === 'a');
    const b = scores.find((score) => score.pageId === 'b');
    expect(a?.ctrScore).toBe(1);
    expect(a?.dwellScore).toBeGreaterThan(b?.dwellScore ?? 0);
    expect(a?.aggregateBehaviourScore).toBeGreaterThan(b?.aggregateBehaviourScore ?? 0);
  });

  it('gives pages without telemetry a zero score', () => {
    const scores = computeBehaviourScores(analytics(), ['a', 'b', 'c']);
    const c = scores.find((score) => score.pageId === 'c');
    expect(c).toEqual({
      pageId: 'c',
      ctrScore: 0,
      dwellScore: 0,
      bouncePenalty: 0,
      aggregateBehaviourScore: 0,
    });
  });

  it('penalizes bounce rate', () => {
    const clean = computeBehaviourScores(
      analytics({ bounceRate: { a: 0, b: 0 } }),
      ['a', 'b'],
    );
    const bouncy = computeBehaviourScores(
      analytics({ bounceRate: { a: 1, b: 1 } }),
      ['a', 'b'],
    );
    expect(clean[0]?.aggregateBehaviourScore).toBeGreaterThan(
      bouncy[0]?.aggregateBehaviourScore ?? 0,
    );
  });

  it('exposes a map for the ranking pipeline', () => {
    const map = behaviourScoreMap(computeBehaviourScores(analytics(), ['a', 'b']));
    expect(Object.keys(map).sort()).toEqual(['a', 'b']);
  });
});
