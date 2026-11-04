import type {
  Dataset,
  RankingMode,
  RankingResult,
  SimulationAnalytics,
  SimulationConfig,
  SimulationEvent,
  SimulationRun,
  WebPage,
} from '../types';
import { clamp } from '../utils/normalization';
import { SeededRandom } from '../utils/random';
import { computeBehaviourScores } from '../algorithms/behaviourScoring';

export const DEFAULT_SIMULATION_CONFIG: SimulationConfig = {
  userCount: 20,
  clickProbability: 0.72,
  attentionSpan: 60,
  scrollProbability: 0.55,
  returnProbability: 0.5,
  followLinkProbability: 0.35,
  speed: 1,
  randomSeed: 42,
};

export interface SimulationInput {
  readonly dataset: Dataset;
  readonly query: string;
  readonly results: readonly RankingResult[];
  readonly rankingMode: RankingMode;
  readonly config?: Partial<SimulationConfig>;
}

/** Clamps every simulation parameter to a safe, deterministic range. */
export function sanitizeSimulationConfig(
  overrides: Partial<SimulationConfig> = {},
): SimulationConfig {
  const merged = { ...DEFAULT_SIMULATION_CONFIG, ...overrides };
  const finite = (value: number, fallback: number): number =>
    Number.isFinite(value) ? value : fallback;

  return {
    userCount: Math.round(clamp(finite(merged.userCount, 20), 1, 1000)),
    clickProbability: clamp(finite(merged.clickProbability, 0.72), 0, 1),
    attentionSpan: clamp(finite(merged.attentionSpan, 60), 2, 3600),
    scrollProbability: clamp(finite(merged.scrollProbability, 0.55), 0, 1),
    returnProbability: clamp(finite(merged.returnProbability, 0.5), 0, 1),
    followLinkProbability: clamp(finite(merged.followLinkProbability, 0.35), 0, 1),
    speed: clamp(finite(merged.speed, 1), 0.25, 20),
    randomSeed: Math.abs(Math.round(finite(merged.randomSeed, 42))) % 4294967296,
  };
}

interface EventExtras {
  readonly sourcePageId?: string;
  readonly destinationPageId?: string;
  readonly dwellTimeMs?: number;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

interface VisitStats {
  visits: number;
  bounces: number;
}

interface OpenVisit {
  readonly pageId: string;
  engaged: boolean;
}

function resultPageIds(event: SimulationEvent): string[] {
  const value = event.metadata?.resultPageIds;
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

/**
 * Derives every analytics value from the emitted event log. No synthetic
 * metrics are introduced: a value is present only when telemetry supports it.
 */
export function computeSimulationAnalytics(
  events: readonly SimulationEvent[],
  pageIds: readonly string[],
): SimulationAnalytics {
  const clicks: Record<string, number> = {};
  const impressions: Record<string, number> = {};
  const dwellTotals: Record<string, number> = {};
  const dwellCounts: Record<string, number> = {};
  const visits: Record<string, VisitStats> = {};
  const paths = new Map<string, string[]>();
  const sessionUsers = new Set<string>();
  const openVisits = new Map<string, OpenVisit>();
  let totalTimeMs = 0;

  pageIds.forEach((id) => {
    clicks[id] = 0;
    impressions[id] = 0;
    dwellTotals[id] = 0;
    dwellCounts[id] = 0;
    visits[id] = { visits: 0, bounces: 0 };
  });

  const ensurePage = (id: string): void => {
    if (!(id in clicks)) {
      clicks[id] = 0;
      impressions[id] = 0;
      dwellTotals[id] = 0;
      dwellCounts[id] = 0;
      visits[id] = { visits: 0, bounces: 0 };
    }
  };

  // Events are sorted chronologically for per-session reconstruction.
  const ordered = events.slice().sort((a, b) => a.timestamp - b.timestamp);

  const closeVisit = (userId: string, bounced: boolean): void => {
    const open = openVisits.get(userId);
    if (!open) return;
    ensurePage(open.pageId);
    visits[open.pageId].visits += 1;
    if (bounced && !open.engaged) visits[open.pageId].bounces += 1;
    openVisits.delete(userId);
  };

  ordered.forEach((event) => {
    totalTimeMs = Math.max(totalTimeMs, event.timestamp);

    switch (event.action) {
      case 'SEARCH': {
        sessionUsers.add(event.userId);
        if (!paths.has(event.userId)) paths.set(event.userId, []);
        break;
      }
      case 'SCAN': {
        resultPageIds(event).forEach((pageId) => {
          ensurePage(pageId);
          impressions[pageId] += 1;
        });
        break;
      }
      case 'CLICK_RESULT': {
        if (event.destinationPageId) {
          ensurePage(event.destinationPageId);
          clicks[event.destinationPageId] += 1;
          const path = paths.get(event.userId) ?? [];
          path.push(event.destinationPageId);
          paths.set(event.userId, path);
          closeVisit(event.userId, false);
          openVisits.set(event.userId, {
            pageId: event.destinationPageId,
            engaged: false,
          });
        }
        break;
      }
      case 'FOLLOW_LINK': {
        if (event.destinationPageId) {
          ensurePage(event.destinationPageId);
          const path = paths.get(event.userId) ?? [];
          path.push(event.destinationPageId);
          paths.set(event.userId, path);
          closeVisit(event.userId, false);
          openVisits.set(event.userId, {
            pageId: event.destinationPageId,
            engaged: false,
          });
        }
        break;
      }
      case 'DWELL': {
        if (event.sourcePageId) {
          ensurePage(event.sourcePageId);
          dwellTotals[event.sourcePageId] += Math.max(0, event.dwellTimeMs ?? 0);
          dwellCounts[event.sourcePageId] += 1;
        }
        break;
      }
      case 'SCROLL': {
        const open = openVisits.get(event.userId);
        if (open) open.engaged = true;
        break;
      }
      case 'RETURN_TO_SEARCH': {
        closeVisit(event.userId, true);
        break;
      }
      case 'END_SESSION': {
        closeVisit(event.userId, false);
        break;
      }
      default: {
        const exhaustive: never = event.action;
        return exhaustive;
      }
    }
  });

  const clickThroughRate: Record<string, number> = {};
  const dwellTime: Record<string, number> = {};
  const bounceRate: Record<string, number> = {};

  Object.keys(clicks).forEach((pageId) => {
    const shown = impressions[pageId] ?? 0;
    clickThroughRate[pageId] = shown > 0 ? clamp(clicks[pageId] / shown, 0, 1) : 0;
    const dwellCount = dwellCounts[pageId] ?? 0;
    dwellTime[pageId] =
      dwellCount > 0 ? dwellTotals[pageId] / dwellCount / 1000 : 0;
    const stats = visits[pageId] ?? { visits: 0, bounces: 0 };
    bounceRate[pageId] = stats.visits > 0 ? clamp(stats.bounces / stats.visits, 0, 1) : 0;
  });

  const navigationPaths = Array.from(paths.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([userId, path]) => ({ userId, path }));

  const distinctPages = navigationPaths.reduce(
    (total, entry) => total + new Set(entry.path).size,
    0,
  );
  const pagesPerSession =
    navigationPaths.length > 0 ? distinctPages / navigationPaths.length : 0;

  return {
    clicks,
    clickThroughRate,
    dwellTime,
    bounceRate,
    pagesPerSession,
    navigationPaths,
    totalSessions: sessionUsers.size,
    totalTimeMs,
  };
}

/**
 * Runs a deterministic multi-user surfer simulation against a ranked SERP.
 *
 * User decisions come from a single seeded Mulberry32 stream. The same config
 * and SERP therefore always produce byte-for-byte identical events.
 */
export function runSurferSimulation(input: SimulationInput): SimulationRun {
  const config = sanitizeSimulationConfig(input.config);
  const rng = new SeededRandom(config.randomSeed);
  const pages = input.dataset.pages;
  const pageMap = new Map<string, WebPage>(pages.map((page) => [page.id, page]));
  const validIds = new Set(pages.map((page) => page.id));
  const serp = input.results.slice(0, Math.min(5, input.results.length));
  const resultByPage = new Map(input.results.map((result) => [result.pageId, result]));
  const events: SimulationEvent[] = [];
  const impressions: Record<string, number> = {};
  const attentionMs = config.attentionSpan * 1000;

  pages.forEach((page) => {
    impressions[page.id] = 0;
  });

  for (let userIndex = 0; userIndex < config.userCount; userIndex += 1) {
    const userId = `surfer-${String(userIndex + 1).padStart(3, '0')}`;
    let clock = 0;
    let ended = false;
    let currentPageId: string | null = null;
    let serpScanned = false;
    let satisfaction = 0;
    const clicked = new Set<string>();
    const visited = new Set<string>();

    const emit = (action: SimulationEvent['action'], extras: EventExtras = {}): void => {
      events.push({
        timestamp: Math.round(clock),
        userId,
        action,
        ...extras,
      });
    };

    const finish = (reason: string): void => {
      if (ended) return;
      ended = true;
      emit('END_SESSION', {
        sourcePageId: currentPageId ?? undefined,
        metadata: { reason, satisfaction: Number(satisfaction.toFixed(2)) },
      });
    };

    emit('SEARCH', { metadata: { query: input.query } });

    let steps = 0;
    while (!ended && steps < 100) {
      steps += 1;

      if (clock >= attentionMs) {
        finish('attention_span_exhausted');
        break;
      }

      if (currentPageId === null) {
        if (!serpScanned) {
          clock += 600;
          serpScanned = true;
          emit('SCAN', {
            metadata: {
              resultPageIds: serp.map((result) => result.pageId),
              serpDepth: serp.length,
            },
          });
          serp.forEach((result) => {
            impressions[result.pageId] = (impressions[result.pageId] ?? 0) + 1;
          });
        }

        const candidate = serp.find((result) => {
          if (clicked.has(result.pageId)) return false;
          const positionFactor = 1 / (1 + 0.22 * (result.position - 1));
          const engagementFactor = 0.65 + 0.35 * clamp(result.finalScore, 0, 1);
          return rng.chance(
            clamp(config.clickProbability * positionFactor * engagementFactor, 0, 1),
          );
        });

        if (!candidate) {
          finish('no_result_clicked');
          break;
        }

        clicked.add(candidate.pageId);
        clock += 350;
        emit('CLICK_RESULT', {
          destinationPageId: candidate.pageId,
          metadata: { position: candidate.position, query: input.query },
        });
        visited.add(candidate.pageId);
        currentPageId = candidate.pageId;
        continue;
      }

      const page = pageMap.get(currentPageId);
      if (!page) {
        finish('page_missing');
        break;
      }

      const relevance = resultByPage.get(page.id)?.keywordScore ?? 0.15;
      const pace = 0.75 + rng.next() * 0.5;
      const remaining = attentionMs - clock;
      const desiredDwell = Math.round((4 + relevance * 20) * pace * 1000);
      const dwellMs = Math.max(0, Math.min(desiredDwell, remaining));
      if (dwellMs > 0) {
        clock += dwellMs;
        emit('DWELL', {
          sourcePageId: page.id,
          dwellTimeMs: dwellMs,
          metadata: { relevance: Number(relevance.toFixed(3)) },
        });
        satisfaction = clamp(satisfaction + relevance * 22, 0, 100);
      }

      const scrollRemaining = attentionMs - clock;
      if (scrollRemaining > 800) {
        const scrollChance = config.scrollProbability * (0.5 + 0.5 * relevance);
        if (rng.chance(clamp(scrollChance, 0, 1))) {
          const scrollMs = Math.round(Math.min(scrollRemaining, (1.5 + rng.next() * 4) * 1000));
          clock += scrollMs;
          emit('SCROLL', {
            sourcePageId: page.id,
            dwellTimeMs: scrollMs,
            metadata: { depth: Number((0.3 + rng.next() * 0.7).toFixed(2)) },
          });
          satisfaction = clamp(satisfaction + relevance * 8, 0, 100);
        }
      }

      if (clock >= attentionMs) {
        finish('attention_span_exhausted');
        break;
      }

      const outgoing = page.links.filter((target) => validIds.has(target));
      const followChance = config.followLinkProbability * (0.35 + satisfaction / 150);
      if (
        outgoing.length > 0 &&
        rng.chance(clamp(followChance, 0, 1)) &&
        visited.size < 12
      ) {
        const target = rng.pick(outgoing);
        if (target) {
          clock += 500;
          emit('FOLLOW_LINK', {
            sourcePageId: page.id,
            destinationPageId: target,
            metadata: { satisfaction: Number(satisfaction.toFixed(2)) },
          });
          visited.add(target);
          currentPageId = target;
          continue;
        }
      }

      if (rng.chance(config.returnProbability)) {
        clock += 400;
        emit('RETURN_TO_SEARCH', {
          sourcePageId: page.id,
          metadata: { satisfaction: Number(satisfaction.toFixed(2)) },
        });
        currentPageId = null;
        serpScanned = false;
        continue;
      }

      finish('satisfied');
      break;
    }

    if (!ended) finish('step_limit');
  }

  // Stable chronological order; ties keep their deterministic emission order.
  events.sort((a, b) => a.timestamp - b.timestamp);

  const analytics = computeSimulationAnalytics(
    events,
    pages.map((page) => page.id),
  );
  const behaviourScores = computeBehaviourScores(
    analytics,
    pages.map((page) => page.id),
  );

  return {
    id: `sim-${input.dataset.id}-${config.randomSeed}-${config.userCount}`,
    datasetId: input.dataset.id,
    query: input.query,
    rankingMode: input.rankingMode,
    config,
    events,
    analytics,
    impressions,
    behaviourScores,
    totalTimeMs: analytics.totalTimeMs,
  };
}

export { runSurferSimulation as runSimulation };

