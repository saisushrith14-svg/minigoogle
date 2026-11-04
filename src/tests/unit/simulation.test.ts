import { describe, expect, it } from 'vitest';
import {
  computeSimulationAnalytics,
  DEFAULT_SIMULATION_CONFIG,
  runSurferSimulation,
  sanitizeSimulationConfig,
} from '../../simulation/surferSimulation';
import { rankPages } from '../../algorithms/rankingPipeline';
import { keywordStuffingDataset } from '../../data/datasets';
import type { SimulationEvent } from '../../types';

function event(
  timestamp: number,
  userId: string,
  action: SimulationEvent['action'],
  extras: Partial<SimulationEvent> = {},
): SimulationEvent {
  return { timestamp, userId, action, ...extras };
}

describe('sanitizeSimulationConfig', () => {
  it('clamps probabilities and sizes to safe ranges', () => {
    const config = sanitizeSimulationConfig({
      userCount: 0,
      clickProbability: 4,
      attentionSpan: 0,
      scrollProbability: -1,
      returnProbability: 2,
      followLinkProbability: -3,
      speed: 0,
      randomSeed: -5,
    });
    expect(config.userCount).toBe(1);
    expect(config.clickProbability).toBe(1);
    expect(config.attentionSpan).toBe(2);
    expect(config.scrollProbability).toBe(0);
    expect(config.returnProbability).toBe(1);
    expect(config.followLinkProbability).toBe(0);
    expect(config.speed).toBe(0.25);
    expect(config.randomSeed).toBe(5);
  });

  it('keeps defaults when fields are missing', () => {
    expect(sanitizeSimulationConfig()).toEqual(DEFAULT_SIMULATION_CONFIG);
  });
});

describe('computeSimulationAnalytics', () => {
  const pageIds = ['a', 'b'];
  const events: SimulationEvent[] = [
    event(0, 'u1', 'SEARCH'),
    event(100, 'u1', 'SCAN', {
      metadata: { resultPageIds: ['a', 'b'] },
    }),
    event(200, 'u1', 'CLICK_RESULT', { destinationPageId: 'a' }),
    event(300, 'u1', 'DWELL', { sourcePageId: 'a', dwellTimeMs: 4000 }),
    event(400, 'u1', 'RETURN_TO_SEARCH', { sourcePageId: 'a' }),
    event(500, 'u1', 'END_SESSION'),
    event(600, 'u2', 'SEARCH'),
    event(700, 'u2', 'SCAN', {
      metadata: { resultPageIds: ['a', 'b'] },
    }),
    event(800, 'u2', 'CLICK_RESULT', { destinationPageId: 'b' }),
    event(900, 'u2', 'DWELL', { sourcePageId: 'b', dwellTimeMs: 2000 }),
    event(1000, 'u2', 'SCROLL', { sourcePageId: 'b', dwellTimeMs: 1500 }),
    event(1100, 'u2', 'FOLLOW_LINK', {
      sourcePageId: 'b',
      destinationPageId: 'a',
    }),
    event(1200, 'u2', 'DWELL', { sourcePageId: 'a', dwellTimeMs: 6000 }),
    event(1300, 'u2', 'END_SESSION'),
  ];

  it('derives clicks, impressions, CTR, dwell, and bounce from events', () => {
    const analytics = computeSimulationAnalytics(events, pageIds);
    expect(analytics.clicks).toEqual({ a: 1, b: 1 });
    expect(analytics.clickThroughRate.a).toBeCloseTo(0.5, 10);
    expect(analytics.clickThroughRate.b).toBeCloseTo(0.5, 10);
    expect(analytics.dwellTime.a).toBeCloseTo(5, 10);
    expect(analytics.dwellTime.b).toBeCloseTo(2, 10);
    expect(analytics.bounceRate.a).toBeCloseTo(0.5, 10);
    expect(analytics.bounceRate.b).toBeCloseTo(0, 10);
  });

  it('derives sessions, paths, and pages per session', () => {
    const analytics = computeSimulationAnalytics(events, pageIds);
    expect(analytics.totalSessions).toBe(2);
    expect(analytics.pagesPerSession).toBeCloseTo(1.5, 10);
    expect(analytics.navigationPaths).toEqual([
      { userId: 'u1', path: ['a'] },
      { userId: 'u2', path: ['b', 'a'] },
    ]);
    expect(analytics.totalTimeMs).toBe(1300);
  });

  it('returns zero-valued metrics for pages without telemetry', () => {
    const analytics = computeSimulationAnalytics(events, ['a', 'b', 'c']);
    expect(analytics.clicks.c).toBe(0);
    expect(analytics.clickThroughRate.c).toBe(0);
    expect(analytics.dwellTime.c).toBe(0);
    expect(analytics.bounceRate.c).toBe(0);
  });
});

describe('runSurferSimulation', () => {
  const query = keywordStuffingDataset.defaultQuery ?? 'cheap flights';
  const results = rankPages(keywordStuffingDataset.pages, query, { mode: 'hybrid' });
  const baseInput = {
    dataset: keywordStuffingDataset,
    query,
    results,
    rankingMode: 'hybrid' as const,
    config: {
      userCount: 12,
      clickProbability: 0.8,
      attentionSpan: 45,
      scrollProbability: 0.5,
      returnProbability: 0.5,
      followLinkProbability: 0.3,
      speed: 1,
      randomSeed: 123,
    },
  };

  it('is fully deterministic for the same seed and configuration', () => {
    const first = runSurferSimulation(baseInput);
    const second = runSurferSimulation(baseInput);
    expect(second.events).toEqual(first.events);
    expect(second.analytics).toEqual(first.analytics);
    expect(second.behaviourScores).toEqual(first.behaviourScores);
    expect(second.impressions).toEqual(first.impressions);
  });

  it('changes its event stream when the seed changes', () => {
    const first = runSurferSimulation(baseInput);
    const second = runSurferSimulation({
      ...baseInput,
      config: { ...baseInput.config, randomSeed: 124 },
    });
    expect(second.events).not.toEqual(first.events);
  });

  it('emits chronological events for every user session', () => {
    const run = runSurferSimulation(baseInput);
    for (let index = 1; index < run.events.length; index += 1) {
      expect(run.events[index].timestamp).toBeGreaterThanOrEqual(
        run.events[index - 1].timestamp,
      );
    }
    const users = new Set(run.events.map((item) => item.userId));
    expect(users.size).toBe(baseInput.config.userCount);
    users.forEach((userId) => {
      const actions = run.events
        .filter((item) => item.userId === userId)
        .map((item) => item.action);
      expect(actions[0]).toBe('SEARCH');
      expect(actions[actions.length - 1]).toBe('END_SESSION');
    });
  });

  it('produces internally consistent analytics', () => {
    const run = runSurferSimulation(baseInput);
    const clickEvents = run.events.filter((item) => item.action === 'CLICK_RESULT');
    const clickCount = Object.values(run.analytics.clicks).reduce(
      (total, value) => total + value,
      0,
    );
    expect(clickCount).toBe(clickEvents.length);
    expect(run.analytics.totalSessions).toBe(baseInput.config.userCount);
    expect(run.analytics.navigationPaths).toHaveLength(baseInput.config.userCount);
    expect(run.analytics.totalTimeMs).toBe(run.totalTimeMs);
    expect(run.totalTimeMs).toBeGreaterThan(0);

    Object.values(run.analytics.clickThroughRate).forEach((value) => {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(1);
    });
    Object.values(run.analytics.bounceRate).forEach((value) => {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(1);
    });
    Object.values(run.analytics.dwellTime).forEach((value) => {
      expect(value).toBeGreaterThanOrEqual(0);
    });
    run.behaviourScores.forEach((score) => {
      expect(score.aggregateBehaviourScore).toBeGreaterThanOrEqual(0);
      expect(score.aggregateBehaviourScore).toBeLessThanOrEqual(1);
    });
  });

  it('counts SERP impressions from scan events', () => {
    const run = runSurferSimulation(baseInput);
    const scanEvents = run.events.filter((item) => item.action === 'SCAN');
    const expected: Record<string, number> = {};
    keywordStuffingDataset.pages.forEach((page) => {
      expected[page.id] = 0;
    });
    scanEvents.forEach((scan) => {
      const ids = scan.metadata?.resultPageIds;
      if (Array.isArray(ids)) {
        ids.forEach((id) => {
          if (typeof id === 'string') expected[id] = (expected[id] ?? 0) + 1;
        });
      }
    });
    expect(run.impressions).toEqual(expected);
  });

  it('records navigation paths only with in-corpus page IDs', () => {
    const run = runSurferSimulation(baseInput);
    const valid = new Set(keywordStuffingDataset.pages.map((page) => page.id));
    run.analytics.navigationPaths.forEach((path) => {
      path.path.forEach((pageId) => expect(valid.has(pageId)).toBe(true));
    });
  });
});
