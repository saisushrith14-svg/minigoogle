/**
 * PageRank Convergence Checking Utilities
 */

/**
 * Calculates the L1 norm difference between two probability vectors.
 */
export function calculateL1Difference(
  current: readonly number[],
  previous: readonly number[]
): number {
  if (current.length !== previous.length) {
    throw new Error('Vector dimensions must match to compute L1 difference');
  }
  return current.reduce((sum, val, idx) => sum + Math.abs(val - previous[idx]), 0);
}

/**
 * Checks whether an iterative power iteration has converged within threshold epsilon.
 */
export function hasConverged(l1Delta: number, threshold: number): boolean {
  return l1Delta < threshold;
}

