import type { PageRankConfig, PageRankResult, WebPage } from '../types';
import { buildGraphTopology, getIncomingLinks, getOutgoingLinks } from '../utils/graphUtils';
import { clamp } from '../utils/normalization';

export const DEFAULT_PAGERANK_CONFIG: PageRankConfig = {
  dampingFactor: 0.85,
  maxIterations: 100,
  convergenceThreshold: 1e-8,
};

export interface PageRankComputation {
  readonly results: readonly PageRankResult[];
  readonly scores: Readonly<Record<string, number>>;
  /** Number of power-iteration updates performed. */
  readonly iterations: number;
  readonly converged: boolean;
  /** L1 difference observed at the final update. */
  readonly finalDelta: number;
  readonly danglingNodes: readonly string[];
  /** Score vectors: initial uniform vector followed by each iteration. */
  readonly history: readonly (readonly number[])[];
}

function sanitizeConfig(config: Partial<PageRankConfig> = {}): PageRankConfig {
  const damping = Number.isFinite(config.dampingFactor)
    ? clamp(config.dampingFactor as number, 0, 1)
    : DEFAULT_PAGERANK_CONFIG.dampingFactor;
  const maxIterations = Number.isFinite(config.maxIterations)
    ? Math.max(1, Math.floor(config.maxIterations as number))
    : DEFAULT_PAGERANK_CONFIG.maxIterations;
  const threshold = Number.isFinite(config.convergenceThreshold)
    ? Math.max(0, config.convergenceThreshold as number)
    : DEFAULT_PAGERANK_CONFIG.convergenceThreshold;
  return {
    dampingFactor: damping,
    maxIterations,
    convergenceThreshold: threshold,
  };
}

/**
 * Computes PageRank with the power-iteration method.
 *
 * For N pages, damping d, and adjacency matrix A where A[j][i] = 1 means
 * j links to i:
 *
 *   PR(i) = (1 - d) / N + d * ( sum_j PR(j) * A[j][i] / outDegree(j)
 *                               + danglingMass / N )
 *
 * Dangling nodes (no in-corpus outgoing links) redistribute their rank
 * uniformly, which keeps the vector stochastic and summing to 1.
 */
export function computePageRank(
  pages: readonly WebPage[],
  config: Partial<PageRankConfig> = {},
): PageRankComputation {
  const settings = sanitizeConfig(config);
  const topology = buildGraphTopology(pages);
  const n = topology.nodes.length;

  if (n === 0) {
    return {
      results: [],
      scores: {},
      iterations: 0,
      converged: true,
      finalDelta: 0,
      danglingNodes: [],
      history: [],
    };
  }

  const { dampingFactor: d, maxIterations, convergenceThreshold } = settings;
  const validIds = new Set(topology.nodes);
  const danglingSet = new Set(topology.danglingNodes);
  let rank = new Array<number>(n).fill(1 / n);
  const history: number[][] = [rank.slice()];
  let converged = false;
  let iterations = 0;
  let finalDelta = 0;

  for (let iteration = 0; iteration < maxIterations; iteration += 1) {
    iterations = iteration + 1;
    let danglingMass = 0;
    topology.danglingNodes.forEach((id) => {
      danglingMass += rank[topology.nodeIndexMap[id]];
    });

    const teleport = (1 - d) / n;
    const danglingShare = (d * danglingMass) / n;
    const next = new Array<number>(n).fill(teleport + danglingShare);

    for (let source = 0; source < n; source += 1) {
      const sourceId = topology.nodes[source];
      if (danglingSet.has(sourceId)) continue;
      const outDegree = topology.outDegree[sourceId] ?? 0;
      if (outDegree === 0) continue;
      const contribution = (d * rank[source]) / outDegree;
      const row = topology.adjacencyMatrix[source];
      for (let target = 0; target < n; target += 1) {
        if (row[target] === 1) next[target] += contribution;
      }
    }

    finalDelta = next.reduce((total, value, index) => total + Math.abs(value - rank[index]), 0);
    rank = next;
    history.push(rank.slice());

    if (finalDelta < convergenceThreshold) {
      converged = true;
      break;
    }
  }

  // Guard against floating point drift over long iteration counts.
  const total = rank.reduce((sum, value) => sum + value, 0);
  if (total > 0) {
    rank = rank.map((value) => value / total);
    history[history.length - 1] = rank.slice();
  }

  const scores: Record<string, number> = {};
  const results = pages.map((page) => {
    const index = topology.nodeIndexMap[page.id];
    const score = rank[index] ?? 0;
    scores[page.id] = score;
    return {
      pageId: page.id,
      score,
      incomingLinks: getIncomingLinks(page.id, pages),
      outgoingLinks: getOutgoingLinks(page, validIds),
    };
  });

  return {
    results,
    scores,
    iterations,
    converged,
    finalDelta,
    danglingNodes: topology.danglingNodes,
    history,
  };
}
