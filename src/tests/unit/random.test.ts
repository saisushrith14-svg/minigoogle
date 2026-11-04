import { describe, expect, it } from 'vitest';
import { SeededRandom } from '../../utils/random';

describe('SeededRandom', () => {
  it('produces the same sequence for the same seed', () => {
    const a = new SeededRandom(1234);
    const b = new SeededRandom(1234);
    const first = Array.from({ length: 20 }, () => a.next());
    const second = Array.from({ length: 20 }, () => b.next());
    expect(first).toEqual(second);
  });

  it('produces different sequences for different seeds', () => {
    const a = new SeededRandom(1);
    const b = new SeededRandom(2);
    expect(a.next()).not.toBe(b.next());
  });

  it('resets its sequence on reseed', () => {
    const rng = new SeededRandom(99);
    const first = rng.next();
    rng.next();
    rng.reseed(99);
    expect(rng.next()).toBe(first);
  });

  it('returns floats in [0, 1)', () => {
    const rng = new SeededRandom(7);
    for (let i = 0; i < 500; i += 1) {
      const value = rng.next();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it('returns integers within the inclusive range', () => {
    const rng = new SeededRandom(42);
    for (let i = 0; i < 200; i += 1) {
      const value = rng.nextInt(3, 7);
      expect(value).toBeGreaterThanOrEqual(3);
      expect(value).toBeLessThanOrEqual(7);
      expect(Number.isInteger(value)).toBe(true);
    }
  });

  it('respects deterministic probability extremes', () => {
    const rng = new SeededRandom(42);
    expect(rng.chance(0)).toBe(false);
    expect(rng.chance(1)).toBe(true);
  });

  it('picks from arrays and handles empty arrays', () => {
    const rng = new SeededRandom(42);
    expect([10, 20, 30]).toContain(rng.pick([10, 20, 30]));
    expect(rng.pick([])).toBeUndefined();
  });

  it('produces a roughly expected frequency', () => {
    const rng = new SeededRandom(2026);
    let successes = 0;
    for (let i = 0; i < 5000; i += 1) {
      if (rng.chance(0.3)) successes += 1;
    }
    expect(successes / 5000).toBeGreaterThan(0.25);
    expect(successes / 5000).toBeLessThan(0.35);
  });
});
