/**
 * Dangling Node Utilities for PageRank
 * A dangling node has no outbound links within the corpus.
 * Its rank mass must be redistributed uniformly to preserve the stochastic property.
 */

/**
 * Calculates total rank mass accumulated on dangling nodes.
 */
export function calculateDanglingMass(
  rankVector: readonly number[],
  danglingIndices: readonly number[]
): number {
  return danglingIndices.reduce((sum, idx) => sum + (rankVector[idx] ?? 0), 0);
}

/**
 * Calculates uniform redistribution share for each node from dangling mass and teleportation.
 */
export function calculateRedistributionShare(
  dampingFactor: number,
  danglingMass: number,
  totalNodes: number
): number {
  if (totalNodes === 0) return 0;
  const teleportShare = (1 - dampingFactor) / totalNodes;
  const danglingShare = (dampingFactor * danglingMass) / totalNodes;
  return teleportShare + danglingShare;
}

