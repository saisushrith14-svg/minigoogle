import { WebPage } from '../types';

export interface GraphTopology {
  readonly nodes: readonly string[];
  readonly nodeIndexMap: Readonly<Record<string, number>>;
  readonly adjacencyMatrix: readonly (readonly number[])[];
  readonly inDegree: Readonly<Record<string, number>>;
  readonly outDegree: Readonly<Record<string, number>>;
  readonly danglingNodes: readonly string[];
}

/**
 * Builds the graph topology representations from an array of WebPages.
 * Converts page hyperlinks into node indices and an adjacency matrix where:
 * matrix[j][i] = 1 indicates a directed hyperlink from node j to node i.
 */
export function buildGraphTopology(pages: readonly WebPage[]): GraphTopology {
  const nodes = pages.map((p) => p.id);
  const nodeIndexMap: Record<string, number> = {};
  nodes.forEach((id, idx) => {
    nodeIndexMap[id] = idx;
  });

  const N = nodes.length;
  // Initialize N x N matrix with 0
  const matrix: number[][] = Array.from({ length: N }, () => Array(N).fill(0));
  const inDegree: Record<string, number> = {};
  const outDegree: Record<string, number> = {};
  const danglingNodes: string[] = [];

  nodes.forEach((id) => {
    inDegree[id] = 0;
    outDegree[id] = 0;
  });

  pages.forEach((page) => {
    const fromIdx = nodeIndexMap[page.id];
    // Only in-corpus targets participate in the transition matrix. Invalid
    // targets must not count toward the out-degree or they would leak rank.
    const validTargets = Array.from(new Set(page.links)).filter(
      (targetId) => nodeIndexMap[targetId] !== undefined,
    );

    outDegree[page.id] = validTargets.length;
    if (validTargets.length === 0) {
      danglingNodes.push(page.id);
    }

    validTargets.forEach((targetId) => {
      const toIdx = nodeIndexMap[targetId];
      matrix[fromIdx][toIdx] = 1;
      inDegree[targetId] = (inDegree[targetId] || 0) + 1;
    });
  });

  return {
    nodes,
    nodeIndexMap,
    adjacencyMatrix: matrix,
    inDegree,
    outDegree,
    danglingNodes,
  };
}

/**
 * Extracts all inbound page IDs pointing to a specific page.
 */
export function getIncomingLinks(pageId: string, pages: readonly WebPage[]): string[] {
  return pages.filter((p) => p.links.includes(pageId)).map((p) => p.id);
}

/**
 * Extracts unique outbound targets from a page that exist in the corpus.
 */
export function getOutgoingLinks(page: WebPage, validPageIds: ReadonlySet<string>): string[] {
  return Array.from(new Set(page.links.filter((target) => validPageIds.has(target))));
}

