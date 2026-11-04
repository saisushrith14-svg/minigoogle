import type { WebPage } from '../types';
import { SeededRandom } from './random';

export interface Point {
  readonly x: number;
  readonly y: number;
}

export interface LayoutOptions {
  readonly width?: number;
  readonly height?: number;
  readonly iterations?: number;
  readonly seed?: number;
}

interface MutablePoint {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

/**
 * Deterministic force-directed layout for the knowledge graph.
 *
 * The algorithm is a compact Fruchterman–Reingold implementation: pairwise
 * repulsion, edge attraction, and weak center gravity. Starting positions are
 * seeded, so the same graph always renders identically.
 */
export function computeForceLayout(
  pages: readonly WebPage[],
  options: LayoutOptions = {},
): Record<string, Point> {
  const width = options.width ?? 960;
  const height = options.height ?? 620;
  const iterations = options.iterations ?? 260;
  const padding = 52;

  if (pages.length === 0) return {};
  if (pages.length === 1) {
    return { [pages[0].id]: { x: width / 2, y: height / 2 } };
  }

  const rng = new SeededRandom(options.seed ?? 1998);
  const ids = pages.map((page) => page.id);
  const index = new Map(ids.map((id, position) => [id, position]));
  const radius = Math.min(width, height) * 0.34;
  const points: MutablePoint[] = pages.map((_, position) => {
    const angle = (position / pages.length) * Math.PI * 2;
    const jitter = radius * 0.18;
    return {
      x: width / 2 + Math.cos(angle) * radius + (rng.next() - 0.5) * jitter,
      y: height / 2 + Math.sin(angle) * radius + (rng.next() - 0.5) * jitter,
      vx: 0,
      vy: 0,
    };
  });

  const edges: Array<{ source: number; target: number }> = [];
  pages.forEach((page, source) => {
    const seen = new Set<number>();
    page.links.forEach((targetId) => {
      const target = index.get(targetId);
      if (target !== undefined && target !== source && !seen.has(target)) {
        seen.add(target);
        edges.push({ source, target });
      }
    });
  });

  const area = width * height;
  const k = Math.sqrt(area / pages.length);
  const centerX = width / 2;
  const centerY = height / 2;

  for (let iteration = 0; iteration < iterations; iteration += 1) {
    // Repulsion.
    for (let i = 0; i < points.length; i += 1) {
      for (let j = i + 1; j < points.length; j += 1) {
        let dx = points[i].x - points[j].x;
        let dy = points[i].y - points[j].y;
        if (dx === 0 && dy === 0) {
          dx = (rng.next() - 0.5) * 0.01;
          dy = (rng.next() - 0.5) * 0.01;
        }
        const distance = Math.max(0.01, Math.hypot(dx, dy));
        const force = (k * k) / distance;
        const fx = (dx / distance) * force;
        const fy = (dy / distance) * force;
        points[i].vx += fx;
        points[i].vy += fy;
        points[j].vx -= fx;
        points[j].vy -= fy;
      }
    }

    // Attraction along directed edges (treated as undirected for layout).
    edges.forEach(({ source, target }) => {
      const dx = points[target].x - points[source].x;
      const dy = points[target].y - points[source].y;
      const distance = Math.max(0.01, Math.hypot(dx, dy));
      const force = (distance * distance) / k;
      const fx = (dx / distance) * force;
      const fy = (dy / distance) * force;
      points[source].vx += fx;
      points[source].vy += fy;
      points[target].vx -= fx;
      points[target].vy -= fy;
    });

    // Weak gravity keeps disconnected components on screen.
    points.forEach((point) => {
      point.vx += (centerX - point.x) * 0.018;
      point.vy += (centerY - point.y) * 0.018;
    });

    const temperature = Math.max(1, (width / 12) * (1 - iteration / iterations));
    points.forEach((point) => {
      const length = Math.max(0.001, Math.hypot(point.vx, point.vy));
      const displacement = Math.min(length, temperature * 4);
      point.x += (point.vx / length) * displacement;
      point.y += (point.vy / length) * displacement;
      point.x = Math.max(padding, Math.min(width - padding, point.x));
      point.y = Math.max(padding, Math.min(height - padding, point.y));
      point.vx = 0;
      point.vy = 0;
    });
  }

  const result: Record<string, Point> = {};
  pages.forEach((page, position) => {
    result[page.id] = {
      x: Math.round(points[position].x * 100) / 100,
      y: Math.round(points[position].y * 100) / 100,
    };
  });
  return result;
}

/**
 * Deterministic circular layout, useful for reading dense directed graphs as a
 * ring. Category groups remain adjacent because dataset page order is grouped.
 */
export function computeCircularLayout(
  pages: readonly WebPage[],
  options: LayoutOptions = {},
): Record<string, Point> {
  const width = options.width ?? 960;
  const height = options.height ?? 620;
  const radius = Math.min(width, height) * 0.4;
  const result: Record<string, Point> = {};
  pages.forEach((page, index) => {
    const angle = (index / Math.max(1, pages.length)) * Math.PI * 2 - Math.PI / 2;
    result[page.id] = {
      x: Math.round((width / 2 + Math.cos(angle) * radius) * 100) / 100,
      y: Math.round((height / 2 + Math.sin(angle) * radius) * 100) / 100,
    };
  });
  return result;
}
