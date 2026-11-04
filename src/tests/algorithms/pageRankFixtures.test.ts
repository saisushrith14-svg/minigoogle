import { describe, expect, it } from 'vitest';
import { computePageRank } from '../../algorithms/pageRank';
import {
  cyclicGraph,
  danglingNodeGraph,
  disconnectedGraph,
  simpleDirectedGraph,
  singleNodeGraph,
} from '../fixtures/sampleGraphs';

describe('PageRank Mathematical Topology Fixtures', () => {
  it('computes PageRank on simple directed 4-node graph correctly and sums to 1.0', () => {
    const result = computePageRank(simpleDirectedGraph, { dampingFactor: 0.85 });
    expect(result.converged).toBe(true);
    expect(result.results).toHaveLength(4);

    const sum = result.results.reduce((acc, r) => acc + r.score, 0);
    expect(sum).toBeCloseTo(1.0, 5);

    // Page C has 3 incoming links (from A, B, D) and should have the highest PageRank
    const scoreA = result.scores['page-a'];
    const scoreB = result.scores['page-b'];
    const scoreC = result.scores['page-c'];
    const scoreD = result.scores['page-d'];

    expect(scoreC).toBeGreaterThan(scoreA);
    expect(scoreC).toBeGreaterThan(scoreB);
    expect(scoreC).toBeGreaterThan(scoreD);
    // Page D has no inbound links, only teleportation mass
    expect(scoreD).toBeLessThan(scoreB);
  });

  it('handles dangling nodes without leaking rank mass', () => {
    const result = computePageRank(danglingNodeGraph, { dampingFactor: 0.85 });
    expect(result.converged).toBe(true);
    expect(result.danglingNodes).toContain('node-c');

    const sum = result.results.reduce((acc, r) => acc + r.score, 0);
    expect(sum).toBeCloseTo(1.0, 5);

    // Because A -> B -> C and C is dangling, C accumulates direct citations,
    // and its rank is uniformly redistributed.
    expect(result.scores['node-c']).toBeGreaterThan(result.scores['node-a']);
  });

  it('guarantees identical PageRank on a symmetric cyclic ring', () => {
    const result = computePageRank(cyclicGraph, { dampingFactor: 0.85 });
    expect(result.converged).toBe(true);

    const s1 = result.scores['cycle-1'];
    const s2 = result.scores['cycle-2'];
    const s3 = result.scores['cycle-3'];

    expect(s1).toBeCloseTo(1 / 3, 5);
    expect(s2).toBeCloseTo(1 / 3, 5);
    expect(s3).toBeCloseTo(1 / 3, 5);
  });

  it('handles single-node graphs gracefully with score 1.0', () => {
    const result = computePageRank(singleNodeGraph);
    expect(result.converged).toBe(true);
    expect(result.results[0].score).toBeCloseTo(1.0, 6);
  });

  it('handles disconnected graph components stably', () => {
    const result = computePageRank(disconnectedGraph, { dampingFactor: 0.85 });
    expect(result.converged).toBe(true);

    const sum = result.results.reduce((acc, r) => acc + r.score, 0);
    expect(sum).toBeCloseTo(1.0, 5);

    // Symmetric components should have equal PageRank
    expect(result.scores['disc-1']).toBeCloseTo(result.scores['disc-2'], 5);
    expect(result.scores['disc-3']).toBeCloseTo(result.scores['disc-4'], 5);
    expect(result.scores['disc-1']).toBeCloseTo(result.scores['disc-3'], 5);
  });
});

