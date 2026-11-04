import { describe, expect, it } from 'vitest';
import { buildGraphTopology, getIncomingLinks, getOutgoingLinks } from '../../utils/graphUtils';
import type { WebPage } from '../../types';

function makePage(id: string, links: string[]): WebPage {
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

describe('buildGraphTopology', () => {
  it('builds a directed adjacency matrix and degree maps', () => {
    const pages = [makePage('a', ['b', 'c']), makePage('b', ['c']), makePage('c', [])];
    const topology = buildGraphTopology(pages);
    expect(topology.nodes).toEqual(['a', 'b', 'c']);
    expect(topology.adjacencyMatrix[0][1]).toBe(1);
    expect(topology.adjacencyMatrix[0][2]).toBe(1);
    expect(topology.adjacencyMatrix[1][2]).toBe(1);
    expect(topology.adjacencyMatrix[2][0]).toBe(0);
    expect(topology.outDegree).toEqual({ a: 2, b: 1, c: 0 });
    expect(topology.inDegree).toEqual({ a: 0, b: 1, c: 2 });
    expect(topology.danglingNodes).toEqual(['c']);
  });

  it('deduplicates targets and ignores unknown targets in the out-degree', () => {
    const pages = [makePage('a', ['b', 'b', 'missing']), makePage('b', [])];
    const topology = buildGraphTopology(pages);
    expect(topology.outDegree.a).toBe(1);
    expect(topology.adjacencyMatrix[0][1]).toBe(1);
    expect(topology.inDegree.b).toBe(1);
  });

  it('treats a self-link as a valid non-dangling edge', () => {
    const topology = buildGraphTopology([makePage('a', ['a'])]);
    expect(topology.danglingNodes).toEqual([]);
    expect(topology.outDegree.a).toBe(1);
    expect(topology.adjacencyMatrix[0][0]).toBe(1);
  });
});

describe('link helpers', () => {
  const pages = [makePage('a', ['b']), makePage('b', ['a', 'c']), makePage('c', ['a', 'c'])];

  it('finds incoming links', () => {
    expect(getIncomingLinks('a', pages).sort()).toEqual(['b', 'c']);
    expect(getIncomingLinks('b', pages)).toEqual(['a']);
  });

  it('filters outgoing links to the corpus and deduplicates', () => {
    const valid = new Set(['a', 'c']);
    expect(getOutgoingLinks(makePage('x', ['a', 'a', 'missing', 'c']), valid)).toEqual([
      'a',
      'c',
    ]);
  });
});
