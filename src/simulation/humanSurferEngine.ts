import type { WebPage } from '../types';

export type SurferAnimationState =
  | 'IDLE'
  | 'SURFING'
  | 'TURNING'
  | 'TELEPORTING'
  | 'ARRIVING'
  | 'CELEBRATING';

export type TransitionType = 'HYPERLINK' | 'TELEPORT' | 'DANGLING_TELEPORT';

export interface SurferTransition {
  readonly id: string;
  readonly stepNumber: number;
  readonly fromPageId: string;
  readonly toPageId: string;
  readonly type: TransitionType;
  readonly timestamp: number;
  readonly message: string;
}

export interface HumanSurferState {
  currentPageId: string;
  animationState: SurferAnimationState;
  targetPageId: string | null;
  progress: number; // 0 to 1 during transition
  visitCounts: Record<string, number>;
  totalSteps: number;
  hyperlinkSteps: number;
  teleportSteps: number;
  history: SurferTransition[];
  speechText: string | null;
  speechTimer: number; // ms remaining
  celebrationCount: number;
}

/**
 * Web Audio API retro 8-bit sound synthesizer for authentic 1990s audio cues.
 * Completely self-contained with no external media assets.
 */
class RetroSoundEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = false;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public playWaveSplash() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.16);
    } catch {
      // Audio not permitted or failed
    }
  }

  public playSurfingWhoosh() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(440, this.ctx.currentTime + 0.2);
      osc.frequency.linearRampToValueAtTime(300, this.ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.42);
    } catch {
      // Audio not permitted or failed
    }
  }

  public playTeleportPortal() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [440, 554, 659, 880, 1108].forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);
        gain.gain.setValueAtTime(0.07, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.1);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.11);
      });
    } catch {
      // Audio not permitted or failed
    }
  }

  public playFanfare() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.09, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.26);
      });
    } catch {
      // Audio not permitted or failed
    }
  }
}

export const retroSound = new RetroSoundEngine();

/**
 * Executes a single step of the standard PageRank Random Surfer Model.
 *
 * Algorithm:
 * - With probability d, follow an outgoing hyperlink chosen uniformly at random.
 * - With probability 1 - d (or if out-degree is 0), teleport uniformly to ANY page in the network.
 */
export function computeNextSurferStep(
  currentPageId: string,
  pages: readonly WebPage[],
  dampingFactor: number = 0.85,
  rng: () => number = Math.random,
): { targetPageId: string; type: TransitionType; message: string; speech: string } {
  const pageMap = new Map(pages.map((p) => [p.id, p]));
  const currentPage = pageMap.get(currentPageId) ?? pages[0];

  if (!currentPage || pages.length === 0) {
    return {
      targetPageId: currentPageId,
      type: 'TELEPORT',
      message: 'Empty corpus.',
      speech: 'Lost in cyberspace!',
    };
  }

  const validTargetIds = new Set(pages.map((p) => p.id));
  const validOutlinks = currentPage.links.filter((id) => validTargetIds.has(id));

  // Dangling node handling (0 outlinks in corpus)
  if (validOutlinks.length === 0) {
    const randomIdx = Math.floor(rng() * pages.length);
    const destination = pages[randomIdx];
    return {
      targetPageId: destination.id,
      type: 'DANGLING_TELEPORT',
      message: `Dead end at "${currentPage.title}" (0 outgoing links). Surfer teleported uniformly across the web to "${destination.title}".`,
      speech: 'Dead end island! Teleporting out!',
    };
  }

  // Stochastic decision: Link traversal vs Random Teleportation
  const roll = rng();
  if (roll < dampingFactor) {
    // Follow outgoing link
    const linkIdx = Math.floor(rng() * validOutlinks.length);
    const chosenTargetId = validOutlinks[linkIdx];
    const destination = pageMap.get(chosenTargetId) ?? pages[0];
    return {
      targetPageId: destination.id,
      type: 'HYPERLINK',
      message: `Riding wave along hyperlink: "${currentPage.title}" → "${destination.title}" (out of ${validOutlinks.length} available links).`,
      speech: `Riding wave to ${destination.title.slice(0, 18)}!`,
    };
  } else {
    // Random teleport (probability 1 - d)
    const randomIdx = Math.floor(rng() * pages.length);
    const destination = pages[randomIdx];
    return {
      targetPageId: destination.id,
      type: 'TELEPORT',
      message: `Random teleportation triggered (probability 1-d = ${((1 - dampingFactor) * 100).toFixed(0)}%). Surfer jumped from "${currentPage.title}" to "${destination.title}".`,
      speech: 'Whoa! Random portal teleport!',
    };
  }
}

/**
 * Calculates the Total Variation (L1) distance between empirical visit frequencies
 * and theoretical stationary PageRank distribution.
 */
export function calculateConvergenceMetric(
  visitCounts: Record<string, number>,
  totalSteps: number,
  pageRankScores: Record<string, number>,
  pages: readonly WebPage[],
): { l1Difference: number; similarityPercent: number } {
  if (totalSteps <= 0 || pages.length === 0) {
    return { l1Difference: 1.0, similarityPercent: 0 };
  }

  let l1Sum = 0;
  pages.forEach((p) => {
    const empirical = (visitCounts[p.id] ?? 0) / totalSteps;
    const theoretical = pageRankScores[p.id] ?? 1 / pages.length;
    l1Sum += Math.abs(empirical - theoretical);
  });

  const l1Difference = l1Sum / 2; // Scaled to [0, 1]
  const similarityPercent = Math.max(0, Math.min(100, Math.round((1 - l1Difference) * 100)));

  return { l1Difference, similarityPercent };
}

