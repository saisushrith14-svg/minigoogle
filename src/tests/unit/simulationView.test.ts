import { describe, expect, it } from 'vitest';
import { keywordStuffingDataset } from '../../data/datasets';
import { rankPages } from '../../algorithms/rankingPipeline';
import { runSurferSimulation } from '../../simulation/surferSimulation';
import {
  buildTelemetryRows,
  chartLabel,
  countEventsByAction,
  describeNavigationPath,
  eventsForUser,
  summarizeRun,
} from '../../utils/simulationView';

const query = keywordStuffingDataset.defaultQuery ?? '';
const results = rankPages(keywordStuffingDataset.pages, query, { mode: 'hybrid' });
const run = runSurferSimulation({
  dataset: keywordStuffingDataset,
  query,
  results,
  rankingMode: 'hybrid',
  config: { userCount: 12, randomSeed: 7 },
});

describe('simulation view utilities', () => {
  it('builds one telemetry row per page and preserves recorded click totals', () => {
    const rows = buildTelemetryRows(run, keywordStuffingDataset.pages);
    const rowClicks = rows.reduce((total, row) => total + row.clicks, 0);
    const recordedClicks = Object.values(run.analytics.clicks).reduce(
      (total, value) => total + value,
      0,
    );
    expect(rows).toHaveLength(keywordStuffingDataset.pages.length);
    expect(rowClicks).toBe(recordedClicks);
  });

  it('derives run totals from the same maps used by the ranking pipeline', () => {
    const summary = summarizeRun(run);
    expect(summary.totalEvents).toBe(run.events.length);
    expect(summary.totalSessions).toBe(run.analytics.totalSessions);
    expect(summary.totalClicks).toBe(
      Object.values(run.analytics.clicks).reduce((total, value) => total + value, 0),
    );
    expect(summary.aggregateClickThroughRate).toBeGreaterThanOrEqual(0);
    expect(summary.aggregateClickThroughRate).toBeLessThanOrEqual(1);
  });

  it('counts every event exactly once per action', () => {
    const counts = countEventsByAction(run.events);
    const total = Object.values(counts).reduce((sum, value) => sum + value, 0);
    expect(total).toBe(run.events.length);
    expect(counts.SEARCH).toBe(run.config.userCount);
    expect(counts.SCROLL).toBeGreaterThanOrEqual(0);
  });

  it('filters events and resolves navigation paths without inventing pages', () => {
    const firstUser = run.events[0]?.userId;
    expect(firstUser).toBeDefined();
    if (!firstUser) return;
    const userEvents = eventsForUser(run.events, firstUser);
    expect(userEvents.length).toBeGreaterThan(0);
    expect(userEvents.every((event) => event.userId === firstUser)).toBe(true);

    const path = run.analytics.navigationPaths[0]?.path ?? [];
    const titles = describeNavigationPath(path, keywordStuffingDataset.pages);
    expect(titles).toHaveLength(path.length);
    expect(describeNavigationPath(['missing-page'], keywordStuffingDataset.pages)).toEqual([
      'missing-page',
    ]);
  });

  it('shortens chart labels without losing their page id suffix', () => {
    const label = chartLabel(
      'A very long page title that cannot fit in a compact chart axis',
      'page-1234',
      20,
    );
    expect(label.length).toBeLessThanOrEqual(20);
    expect(label.endsWith('1234')).toBe(true);
  });
});
