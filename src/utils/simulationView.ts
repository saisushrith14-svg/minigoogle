import type {
  SimulationAction,
  SimulationEvent,
  SimulationRun,
  WebPage,
} from '../types';

/**
 * A single page row derived from simulation telemetry. Every value comes from
 * the recorded event log or the run's impression counts; nothing is estimated.
 */
export interface PageTelemetryRow {
  readonly pageId: string;
  readonly title: string;
  readonly category: string;
  readonly impressions: number;
  readonly clicks: number;
  readonly clickThroughRate: number;
  readonly dwellTime: number;
  readonly bounceRate: number;
  readonly behaviourScore: number;
  readonly hasTelemetry: boolean;
}

export interface RunSummary {
  readonly totalSessions: number;
  readonly totalEvents: number;
  readonly totalClicks: number;
  readonly totalImpressions: number;
  readonly aggregateClickThroughRate: number;
  readonly pagesPerSession: number;
  readonly activePages: number;
  readonly totalTimeMs: number;
}

export const SIMULATION_ACTION_LABELS: Readonly<Record<SimulationAction, string>> = {
  SEARCH: 'Search',
  SCAN: 'Scan SERP',
  CLICK_RESULT: 'Click result',
  DWELL: 'Dwell',
  SCROLL: 'Scroll',
  FOLLOW_LINK: 'Follow link',
  RETURN_TO_SEARCH: 'Return to SERP',
  END_SESSION: 'End session',
};

export const SIMULATION_ACTIONS: readonly SimulationAction[] = [
  'SEARCH',
  'SCAN',
  'CLICK_RESULT',
  'DWELL',
  'SCROLL',
  'FOLLOW_LINK',
  'RETURN_TO_SEARCH',
  'END_SESSION',
];

/** Combines the recorded telemetry maps into page rows that are easy to chart. */
export function buildTelemetryRows(
  run: SimulationRun,
  pages: readonly WebPage[],
): PageTelemetryRow[] {
  const pageMap = new Map(pages.map((page) => [page.id, page]));
  const behaviourByPage = new Map(
    run.behaviourScores.map((score) => [score.pageId, score.aggregateBehaviourScore]),
  );

  const pageIds = new Set<string>(Object.keys(run.impressions));
  Object.keys(run.analytics.clicks).forEach((pageId) => pageIds.add(pageId));
  Object.keys(run.analytics.dwellTime).forEach((pageId) => pageIds.add(pageId));
  run.behaviourScores.forEach((score) => pageIds.add(score.pageId));

  return Array.from(pageIds)
    .map((pageId) => {
      const page = pageMap.get(pageId);
      const impressions = run.impressions[pageId] ?? 0;
      const clicks = run.analytics.clicks[pageId] ?? 0;
      const dwellTime = run.analytics.dwellTime[pageId] ?? 0;
      const clickThroughRate = run.analytics.clickThroughRate[pageId] ?? 0;
      const bounceRate = run.analytics.bounceRate[pageId] ?? 0;
      const behaviourScore = behaviourByPage.get(pageId) ?? 0;
      return {
        pageId,
        title: page?.title ?? pageId,
        category: page?.category ?? 'Unknown category',
        impressions,
        clicks,
        clickThroughRate,
        dwellTime,
        bounceRate,
        behaviourScore,
        hasTelemetry:
          impressions > 0 || clicks > 0 || dwellTime > 0 || behaviourScore > 0,
      };
    })
    .sort(
      (a, b) =>
        b.clicks - a.clicks ||
        b.impressions - a.impressions ||
        a.title.localeCompare(b.title),
    );
}

/** Aggregates run-level metrics directly from the recorded maps and events. */
export function summarizeRun(run: SimulationRun): RunSummary {
  const clicks = Object.values(run.analytics.clicks);
  const impressions = Object.values(run.impressions);
  const totalClicks = clicks.reduce((total, value) => total + value, 0);
  const totalImpressions = impressions.reduce((total, value) => total + value, 0);
  const activePages = Object.values(run.impressions).filter((value) => value > 0).length;

  return {
    totalSessions: run.analytics.totalSessions,
    totalEvents: run.events.length,
    totalClicks,
    totalImpressions,
    aggregateClickThroughRate:
      totalImpressions > 0 ? totalClicks / totalImpressions : 0,
    pagesPerSession: run.analytics.pagesPerSession,
    activePages,
    totalTimeMs: run.totalTimeMs,
  };
}

/** Counts events per action for the simulator's telemetry summary. */
export function countEventsByAction(
  events: readonly SimulationEvent[],
): Record<SimulationAction, number> {
  const counts = {
    SEARCH: 0,
    SCAN: 0,
    CLICK_RESULT: 0,
    DWELL: 0,
    SCROLL: 0,
    FOLLOW_LINK: 0,
    RETURN_TO_SEARCH: 0,
    END_SESSION: 0,
  } satisfies Record<SimulationAction, number>;

  events.forEach((event) => {
    counts[event.action] += 1;
  });
  return counts;
}

/** Returns the ordered events for one surfer, preserving emission order. */
export function eventsForUser(
  events: readonly SimulationEvent[],
  userId: string,
): SimulationEvent[] {
  return events.filter((event) => event.userId === userId);
}

/** Returns a readable path description without inventing missing pages. */
export function describeNavigationPath(
  path: readonly string[],
  pages: readonly WebPage[],
): string[] {
  if (path.length === 0) return [];
  const pageMap = new Map(pages.map((page) => [page.id, page]));
  return path.map((pageId) => pageMap.get(pageId)?.title ?? pageId);
}

/** Shortens a title for dense chart axes while preserving a unique suffix. */
export function chartLabel(title: string, pageId: string, maxLength = 30): string {
  if (title.length <= maxLength) return title;
  const suffix = `… ${pageId.slice(-4)}`;
  if (maxLength <= suffix.length) return pageId.slice(-Math.max(0, maxLength));
  const prefix = title.slice(0, maxLength - suffix.length).trimEnd();
  return `${prefix}${suffix}`;
}
