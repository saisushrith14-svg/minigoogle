import { describe, expect, it } from 'vitest';
import type { WebPage } from '../../types';
import {
  calculateConvergenceMetric,
  computeNextSurferStep,
} from '../../simulation/humanSurferEngine';

const mockPages: readonly WebPage[] = [
  {
    id: 'page-a',
    title: 'Alpha Page',
    url: 'http://alpha.edu',
    content: 'Alpha content',
    category: 'University',
    links: ['page-b', 'page-c'],
    headings: [],
    metaDescription: '',
  },
  {
    id: 'page-b',
    title: 'Beta Page',
    url: 'http://beta.edu',
    content: 'Beta content',
    category: 'Lab',
    links: ['page-c'],
    headings: [],
    metaDescription: '',
  },
  {
    id: 'page-c',
    title: 'Gamma Dangling Page',
    url: 'http://gamma.edu',
    content: 'Gamma content with no egress links',
    category: 'Archive',
    links: [], // Dangling node
    headings: [],
    metaDescription: '',
  },
];

describe('humanSurferEngine: computeNextSurferStep', () => {
  it('correctly follows outgoing hyperlinks when roll is below damping factor', () => {
    // Force roll < damping (roll = 0.1 < d = 0.85)
    let rollCall = 0;
    const rng = () => {
      rollCall++;
      return rollCall === 1 ? 0.1 : 0.0; // roll 0.1, linkIndex 0
    };

    const step = computeNextSurferStep('page-a', mockPages, 0.85, rng);
    expect(step.type).toBe('HYPERLINK');
    expect(['page-b', 'page-c']).toContain(step.targetPageId);
    expect(step.message).toMatch(/Riding wave along hyperlink/i);
  });

  it('correctly triggers random teleportation when roll is above damping factor', () => {
    // Force roll >= damping (roll = 0.95 >= d = 0.85)
    let rollCall = 0;
    const rng = () => {
      rollCall++;
      return rollCall === 1 ? 0.95 : 0.5; // roll 0.95, randomIdx = floor(0.5 * 3) = 1
    };

    const step = computeNextSurferStep('page-a', mockPages, 0.85, rng);
    expect(step.type).toBe('TELEPORT');
    expect(step.targetPageId).toBe('page-b');
    expect(step.message).toMatch(/Random teleportation triggered/i);
  });

  it('handles dangling nodes (0 outlinks) by teleporting uniformly', () => {
    const rng = () => 0.0; // randomIdx 0 -> page-a
    const step = computeNextSurferStep('page-c', mockPages, 0.85, rng);
    expect(step.type).toBe('DANGLING_TELEPORT');
    expect(step.targetPageId).toBe('page-a');
    expect(step.message).toMatch(/Dead end at "Gamma Dangling Page"/i);
  });
});

describe('humanSurferEngine: calculateConvergenceMetric', () => {
  it('returns 0% alignment when total steps is zero', () => {
    const metric = calculateConvergenceMetric({}, 0, { 'page-a': 0.5, 'page-b': 0.5 }, mockPages);
    expect(metric.similarityPercent).toBe(0);
    expect(metric.l1Difference).toBe(1.0);
  });

  it('returns 100% alignment when empirical distribution matches theoretical PageRank exactly', () => {
    const visitCounts = {
      'page-a': 50,
      'page-b': 30,
      'page-c': 20,
    };
    const theoreticalPR = {
      'page-a': 0.5,
      'page-b': 0.3,
      'page-c': 0.2,
    };
    const metric = calculateConvergenceMetric(visitCounts, 100, theoreticalPR, mockPages);
    expect(metric.similarityPercent).toBe(100);
    expect(metric.l1Difference).toBeCloseTo(0, 5);
  });
});
