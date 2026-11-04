import { describe, expect, it } from 'vitest';
import {
  clamp,
  minMaxNormalize,
  normalizeMapValues,
  sumToOne,
} from '../../utils/normalization';

describe('normalization utilities', () => {
  it('min-max normalizes to [0, 1]', () => {
    expect(minMaxNormalize([2, 4, 6])).toEqual([0, 0.5, 1]);
  });

  it('uses the fallback when all values are equal', () => {
    expect(minMaxNormalize([3, 3, 3])).toEqual([0.5, 0.5, 0.5]);
    expect(minMaxNormalize([3, 3], 0.2)).toEqual([0.2, 0.2]);
  });

  it('handles empty inputs', () => {
    expect(minMaxNormalize([])).toEqual([]);
    expect(sumToOne([])).toEqual([]);
  });

  it('normalizes map values while preserving keys', () => {
    expect(normalizeMapValues({ a: 10, b: 20, c: 30 })).toEqual({
      a: 0,
      b: 0.5,
      c: 1,
    });
  });

  it('produces a probability vector', () => {
    expect(sumToOne([1, 1, 2])).toEqual([0.25, 0.25, 0.5]);
  });

  it('returns a uniform vector when the sum is zero', () => {
    expect(sumToOne([0, 0, 0, 0])).toEqual([0.25, 0.25, 0.25, 0.25]);
  });

  it('clamps values to a range', () => {
    expect(clamp(-1, 0, 1)).toBe(0);
    expect(clamp(2, 0, 1)).toBe(1);
    expect(clamp(0.4, 0, 1)).toBe(0.4);
  });
});
