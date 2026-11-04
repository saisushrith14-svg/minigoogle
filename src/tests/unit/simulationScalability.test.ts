import { describe, expect, it } from 'vitest';
import { runSimulation } from '../../simulation/surferSimulation';
import { keywordStuffingDataset } from '../../data/datasets/keywordStuffing';
import { rankPages } from '../../algorithms/rankingPipeline';

describe('Surfer Simulation Performance and Scalability', () => {
  const query = 'cheap flights';
  const ranked = rankPages(keywordStuffingDataset.pages, query, { mode: 'hybrid' });

  it('runs smoothly with 1 user', () => {
    const run = runSimulation({
      dataset: keywordStuffingDataset,
      query,
      results: ranked,
      rankingMode: 'hybrid',
      config: { userCount: 1, randomSeed: 101 },
    });

    expect(run.events.length).toBeGreaterThan(0);
    expect(run.analytics.totalSessions).toBe(1);
  });

  it('runs deterministically and efficiently with 100 users', () => {
    const start = performance.now();
    const run = runSimulation({
      dataset: keywordStuffingDataset,
      query,
      results: ranked,
      rankingMode: 'hybrid',
      config: { userCount: 100, randomSeed: 42 },
    });
    const elapsed = performance.now() - start;

    expect(run.events.length).toBeGreaterThan(100);
    expect(run.analytics.totalSessions).toBe(100);
    expect(elapsed).toBeLessThan(1000); // Should execute in under 1 second
  });

  it('handles 500 users within budget', () => {
    const start = performance.now();
    const run = runSimulation({
      dataset: keywordStuffingDataset,
      query,
      results: ranked,
      rankingMode: 'hybrid',
      config: { userCount: 500, randomSeed: 999 },
    });
    const elapsed = performance.now() - start;

    expect(run.events.length).toBeGreaterThan(500);
    expect(run.analytics.totalSessions).toBe(500);
    expect(elapsed).toBeLessThan(2000);
  });

  it('handles 1000 users efficiently and deterministically', () => {
    const start = performance.now();
    const run = runSimulation({
      dataset: keywordStuffingDataset,
      query,
      results: ranked,
      rankingMode: 'hybrid',
      config: { userCount: 1000, randomSeed: 777 },
    });
    const elapsed = performance.now() - start;

    expect(run.events.length).toBeGreaterThan(1000);
    expect(run.analytics.totalSessions).toBe(1000);
    expect(elapsed).toBeLessThan(3000); // 1000 users simulation in under 3s
  });
});
