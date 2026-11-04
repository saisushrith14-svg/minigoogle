/**
 * Numerical Normalization Utilities for Search Engines.
 * Ensures consistent scaling across Keyword, PageRank, and Behaviour scores.
 */

/**
 * Normalizes an array of numerical values to the range [0, 1] via Min-Max scaling.
 * Handles edge cases where max === min by mapping all items to defaultVal (default: 1.0 if >0, 0 otherwise).
 */
export function minMaxNormalize(
  values: readonly number[],
  fallbackVal: number = 0.5
): number[] {
  if (values.length === 0) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);

  if (Math.abs(max - min) < 1e-12) {
    return values.map(() => fallbackVal);
  }

  return values.map((val) => (val - min) / (max - min));
}

/**
 * Normalizes a map of numeric values so all values lie within [0, 1].
 */
export function normalizeMapValues(
  map: Readonly<Record<string, number>>,
  fallbackVal: number = 0.5
): Record<string, number> {
  const keys = Object.keys(map);
  const rawValues = keys.map((k) => map[k]);
  const normalized = minMaxNormalize(rawValues, fallbackVal);

  const result: Record<string, number> = {};
  keys.forEach((key, idx) => {
    result[key] = normalized[idx];
  });
  return result;
}

/**
 * Normalizes an array so that its elements sum to 1.0 (Probability Vector).
 * Useful for stochastic transition vectors in PageRank.
 */
export function sumToOne(values: readonly number[]): number[] {
  const sum = values.reduce((acc, curr) => acc + curr, 0);
  if (sum === 0) {
    const uniform = 1 / values.length;
    return values.map(() => uniform);
  }
  return values.map((val) => val / sum);
}

/**
 * Clamps a number to a bounded range [min, max].
 */
export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

