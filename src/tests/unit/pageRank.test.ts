import { describe, expect, it } from 'vitest';
import { computePageRank, DEFAULT_PAGERANK_CONFIG } from '../../algorithms/pageRank';
import type { WebPage } from '../../types';

function makePage(id: string, links: string[] = []): WebPage {
  return {
    id,
    url: `https://example.com/${id}`,
    title: id,
    headings: [id],
    metaDescription: `${id} description`,
    content: `${id} has enough content for validation purposes.`,
    category: 'Test',
    links,
  };
}

function scoreMap(pages: readonly WebPage[]): Record<string, number> {
  const computation = computePageRank(pages);
  const map: Record<string, number> = {};
  computation.results.forEach((result) => {
    map[result.pageId] = result.score;
  });
  return map;
}

describe('computePageRank', () => {
  it('returns an empty, converged result for an empty corpus', () => {
    const result = computePageRank([]);
    expect(result.results).toEqual([]);
    expect(result.converged).toBe(true);
    expect(result.iterations).toBe(0);
  });

  it('produces a probability distribution summing to 1', () => {
    const pages = [
      makePage('a', ['b', 'c']),
      makePage('b', ['c']),
      makePage('c', ['a']),
      makePage('d', ['a', 'c']),
    ];
    const result = computePageRank(pages);
    const total = result.results.reduce((sum, item) => sum + item.score, 0);
    expect(total).toBeCloseTo(1, 10);
  });

  it('gives equal scores to a symmetric cycle', () => {
    const scores = scoreMap([makePage('a', ['b']), makePage('b', ['c']), makePage('c', ['a'])]);
    expect(scores.a).toBeCloseTo(1 / 3, 8);
    expect(scores.b).toBeCloseTo(1 / 3, 8);
    expect(scores.c).toBeCloseTo(1 / 3, 8);
  });

  it('gives equal scores to a two-node cycle', () => {
    const scores = scoreMap([makePage('a', ['b']), makePage('b', ['a'])]);
    expect(scores.a).toBeCloseTo(0.5, 10);
    expect(scores.b).toBeCloseTo(0.5, 10);
  });

  it('ranks the target of a chain highest', () => {
    const scores = scoreMap([
      makePage('a', ['b']),
      makePage('b', ['c']),
      makePage('c', []),
    ]);
    expect(scores.c).toBeGreaterThan(scores.b);
    expect(scores.b).toBeGreaterThan(scores.a);
  });

  it('ranks a heavily cited hub above its leaves', () => {
    const pages = [
      makePage('hub', []),
      makePage('a', ['hub']),
      makePage('b', ['hub']),
      makePage('c', ['hub']),
      makePage('d', ['hub']),
    ];
    const scores = scoreMap(pages);
    expect(scores.hub).toBeGreaterThan(scores.a);
    expect(scores.hub).toBeGreaterThan(scores.d);
  });

  it('redistributes dangling-node mass so the distribution remains valid', () => {
    const result = computePageRank([
      makePage('a', ['b']),
      makePage('b', []),
      makePage('c', ['b']),
    ]);
    expect(result.danglingNodes).toEqual(['b']);
    const total = result.results.reduce((sum, item) => sum + item.score, 0);
    expect(total).toBeCloseTo(1, 10);
    expect(result.results.find((item) => item.pageId === 'b')?.score ?? 0).toBeGreaterThan(
      0,
    );
  });

  it('returns uniform scores when damping is zero', () => {
    const scores = scoreMap([makePage('a', ['b']), makePage('b', ['c']), makePage('c', [])]);
    // scoreMap uses defaults, so use an explicit computation here.
    const result = computePageRank(
      [makePage('a', ['b']), makePage('b', ['c']), makePage('c', [])],
      { dampingFactor: 0 },
    );
    expect(result.results[0]?.score).toBeCloseTo(1 / 3, 10);
    expect(scores.a).toBeGreaterThan(0);
  });

  it('damping concentrates more authority in the cited hub', () => {
    const pages = [
      makePage('hub', []),
      makePage('a', ['hub']),
      makePage('b', ['hub']),
      makePage('c', ['hub']),
    ];
    const low = computePageRank(pages, { dampingFactor: 0.2 });
    const high = computePageRank(pages, { dampingFactor: 0.95 });
    const lowHub = low.scores.hub;
    const highHub = high.scores.hub;
    expect(highHub).toBeGreaterThan(lowHub);
  });

  it('terminates at maxIterations when convergence is unreachable', () => {
    const pages = [makePage('a', ['b']), makePage('b', ['a'])];
    const result = computePageRank(pages, {
      maxIterations: 3,
      convergenceThreshold: 0,
    });
    expect(result.iterations).toBe(3);
    expect(result.converged).toBe(false);
    expect(result.history.length).toBe(4);
  });

  it('records convergence history and a final delta', () => {
    const result = computePageRank([
      makePage('a', ['b']),
      makePage('b', ['c']),
      makePage('c', ['a']),
    ]);
    expect(result.converged).toBe(true);
    expect(result.iterations).toBeGreaterThan(0);
    expect(result.history.length).toBe(result.iterations + 1);
    expect(result.finalDelta).toBeLessThan(DEFAULT_PAGERANK_CONFIG.convergenceThreshold);
  });

  it('reports incoming and outgoing links correctly', () => {
    const result = computePageRank([
      makePage('a', ['b', 'c']),
      makePage('b', ['c']),
      makePage('c', ['a']),
    ]);
    const b = result.results.find((item) => item.pageId === 'b');
    expect(b?.incomingLinks).toEqual(['a']);
    expect(b?.outgoingLinks).toEqual(['c']);
  });

  it('is deterministic for identical corpora', () => {
    const pages = [
      makePage('a', ['b', 'c']),
      makePage('b', ['c']),
      makePage('c', ['a']),
    ];
    expect(computePageRank(pages)).toEqual(computePageRank(pages));
  });

  it('clamps nonsensical configuration values', () => {
    const result = computePageRank([makePage('a', [])], {
      dampingFactor: 4,
      maxIterations: -2,
      convergenceThreshold: -1,
    });
    expect(result.iterations).toBeGreaterThanOrEqual(1);
    expect(result.results[0]?.score).toBeCloseTo(1, 10);
  });
});
