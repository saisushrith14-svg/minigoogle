/**
 * Deterministic Pseudo-Random Number Generator (PRNG) using Mulberry32.
 * Ensures simulated surfer runs are 100% reproducible given the same seed.
 */
export class SeededRandom {
  private state: number;

  constructor(seed: number = 42) {
    this.state = seed >>> 0;
  }

  /**
   * Resets the PRNG state with a new seed.
   */
  public reseed(seed: number): void {
    this.state = seed >>> 0;
  }

  /**
   * Returns a deterministic pseudo-random float between 0 (inclusive) and 1 (exclusive).
   */
  public next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Returns a deterministic pseudo-random integer in the range [min, max].
   */
  public nextInt(min: number, max: number): number {
    const r = this.next();
    return Math.floor(r * (max - min + 1)) + min;
  }

  /**
   * Returns true with given probability p in [0, 1].
   */
  public chance(p: number): boolean {
    return this.next() < p;
  }

  /**
   * Randomly picks one item from an array.
   */
  public pick<T>(items: readonly T[]): T | undefined {
    if (items.length === 0) return undefined;
    const index = this.nextInt(0, items.length - 1);
    return items[index];
  }
}

