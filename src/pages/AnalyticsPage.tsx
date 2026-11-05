import { useMemo } from 'react';
import { useApp } from '../state/AppContext';
import {
  formatClock,
  formatNumber,
  formatPercent,
  formatScore,
  SCENARIO_LABELS,
} from '../utils/format';
import {
  buildTelemetryRows,
  describeNavigationPath,
  summarizeRun,
} from '../utils/simulationView';

export function AnalyticsPage() {
  const {
    dataset,
    query,
    simulationRun,
    simulationIsCurrent,
    runSimulation,
  } = useApp();

  const behaviorByPage = useMemo(
    () =>
      new Map(
        (simulationRun?.behaviourScores ?? []).map((score) => [score.pageId, score]),
      ),
    [simulationRun],
  );

  const telemetryRows = useMemo(
    () => (simulationRun ? buildTelemetryRows(simulationRun, dataset.pages) : []),
    [dataset.pages, simulationRun],
  );

  const summary = simulationRun ? summarizeRun(simulationRun) : null;

  if (!simulationRun || !summary) {
    return (
      <div className="w-full flex flex-col font-sans text-black">
        <div className="mb-3">
          <div className="text-[11px] font-mono text-[#0000CC] font-bold uppercase mb-0.5">
            {SCENARIO_LABELS[dataset.scenario]} · Telemetry-derived metrics
          </div>
          <h1 className="text-xl font-bold font-serif text-black leading-tight">
            Behaviour analytics
          </h1>
          <p className="text-xs text-[#555555] italic">
            Metrics are computed dynamically from simulated surfer event logs. There are no fabricated metrics.
          </p>
        </div>
        <hr className="w-full border-t border-[#808080] mb-3" />

        <div className="p-8 border border-dashed border-[#808080] bg-[#FAFAFA] text-center text-xs">
          <div className="font-bold text-sm text-black font-serif mb-1">
            No simulation telemetry recorded
          </div>
          <p className="text-[#555555] max-w-md mx-auto mb-3">
            Run the deterministic surfer simulation for “{query || 'the current query'}” on{' '}
            {dataset.name} to generate click, dwell, scroll, and bounce metrics.
          </p>
          <button
            type="button"
            onClick={() => runSimulation()}
            className="btn-retro font-bold text-xs py-1 px-4 text-[#0000CC]"
          >
            Run simulation now »
          </button>
        </div>
      </div>
    );
  }

  const telemetryCount = telemetryRows.filter((row) => row.hasTelemetry).length;
  const rankedBehaviour = telemetryRows
    .filter((row) => row.hasTelemetry)
    .slice()
    .sort((a, b) => b.behaviourScore - a.behaviourScore);

  return (
    <div className="w-full flex flex-col font-sans text-black">
      {/* Header */}
      <div className="mb-3">
        <div className="text-[11px] font-mono text-[#0000CC] font-bold uppercase mb-0.5">
          {SCENARIO_LABELS[dataset.scenario]} · {simulationRun.events.length} recorded events
        </div>
        <h1 className="text-xl font-bold font-serif text-black leading-tight">
          Behaviour analytics
        </h1>
        <p className="text-xs text-[#555555] italic">
          Empirical telemetry derived from {simulationRun.config.userCount} virtual agents on “
          {query || 'the current query'}”, seed {simulationRun.config.randomSeed}.
        </p>
      </div>

      <hr className="w-full border-t border-[#808080] mb-3" />

      {/* Status Alert Note (matches test) */}
      <div className="mb-3">
        {!simulationIsCurrent ? (
          <div
            className="p-2.5 bg-[#FFFFE0] text-[#745B00] text-xs font-sans leading-normal"
            style={{ border: '1px solid #D0A600' }}
          >
            <b>Notice:</b> This telemetry no longer matches the current dataset, query, or base
            ranking. Re-run the simulator before applying its behaviour scores to experimental
            rankings.
          </div>
        ) : (
          <div
            className="p-2.5 bg-[#EDFFE1] text-[#006000] text-xs font-sans leading-normal font-bold"
            style={{ border: '1px solid #008000' }}
          >
            ✓ This run is current. Behavioural weights are actively applicable in the Comparison Lab
            and Experimental search mode.
          </div>
        )}
      </div>

      {/* Aggregate Metric KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-center mb-4">
        <div className="bg-white p-2 border border-[#808080]">
          <div className="text-[10px] text-[#777777]">SESSIONS</div>
          <div className="text-base font-bold text-black">{summary.totalSessions}</div>
          <div className="text-[10px] text-[#888888]">{telemetryCount} pages visited</div>
        </div>
        <div className="bg-white p-2 border border-[#808080]">
          <div className="text-[10px] text-[#777777]">AGGREGATE CTR</div>
          <div className="text-base font-bold text-[#0000CC]">
            {formatPercent(summary.aggregateClickThroughRate, 1)}
          </div>
          <div className="text-[10px] text-[#888888]">
            {summary.totalClicks} clicks / {summary.totalImpressions} imps
          </div>
        </div>
        <div className="bg-white p-2 border border-[#808080]">
          <div className="text-[10px] text-[#777777]">PAGES / SESSION</div>
          <div className="text-base font-bold text-black">{formatNumber(summary.pagesPerSession, 2)}</div>
          <div className="text-[10px] text-[#888888]">
            {simulationRun.analytics.navigationPaths.length} distinct paths
          </div>
        </div>
        <div className="bg-white p-2 border border-[#808080]">
          <div className="text-[10px] text-[#777777]">RECORDED DWELL</div>
          <div className="text-base font-bold text-black">{formatClock(summary.totalTimeMs)}</div>
          <div className="text-[10px] text-[#888888]">{summary.totalEvents} total actions</div>
        </div>
      </div>

      {/* Click-through Rate & Average Dwell Time Breakdown (matches test) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Click-through Rate Table */}
        <div className="p-3 bg-white border border-[#808080] text-xs">
          <h2 className="font-bold text-sm text-black font-serif mb-1">Click-through rate</h2>
          <p className="text-[11px] text-[#555555] mb-2 leading-tight">
            Clicks divided by SERP impressions. Pages appearing higher on the SERP receive naturally higher scans.
          </p>
          <table className="table-retro text-xs w-full">
            <thead>
              <tr className="bg-[#EFEFEF]">
                <th className="p-1 border border-[#808080] text-left">Document Title</th>
                <th className="p-1 border border-[#808080] text-right">Imps</th>
                <th className="p-1 border border-[#808080] text-right">Clicks</th>
                <th className="p-1 border border-[#808080] text-right">CTR (%)</th>
              </tr>
            </thead>
            <tbody>
              {telemetryRows.slice(0, 6).map((row) => (
                <tr key={row.pageId} className="hover:bg-[#F8F9FA]">
                  <td className="p-1 border border-[#808080] truncate max-w-[140px] text-black">
                    {row.title}
                  </td>
                  <td className="p-1 border border-[#808080] text-right font-mono">{row.impressions}</td>
                  <td className="p-1 border border-[#808080] text-right font-mono font-bold text-[#0000CC]">
                    {row.clicks}
                  </td>
                  <td className="p-1 border border-[#808080] text-right font-mono">
                    {formatPercent(row.clickThroughRate, 1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Average Dwell Time Table */}
        <div className="p-3 bg-white border border-[#808080] text-xs">
          <h2 className="font-bold text-sm text-black font-serif mb-1">Average dwell time</h2>
          <p className="text-[11px] text-[#555555] mb-2 leading-tight">
            Mean time spent reading the document content in seconds before returning to search or following another link.
          </p>
          <table className="table-retro text-xs w-full">
            <thead>
              <tr className="bg-[#EFEFEF]">
                <th className="p-1 border border-[#808080] text-left">Document Title</th>
                <th className="p-1 border border-[#808080] text-right">Clicks</th>
                <th className="p-1 border border-[#808080] text-right">Bounce</th>
                <th className="p-1 border border-[#808080] text-right">Mean Dwell</th>
              </tr>
            </thead>
            <tbody>
              {telemetryRows.slice(0, 6).map((row) => (
                <tr key={row.pageId} className="hover:bg-[#F8F9FA]">
                  <td className="p-1 border border-[#808080] truncate max-w-[140px] text-black">
                    {row.title}
                  </td>
                  <td className="p-1 border border-[#808080] text-right font-mono">{row.clicks}</td>
                  <td className="p-1 border border-[#808080] text-right font-mono text-[#BC0000]">
                    {formatPercent(row.bounceRate, 0)}
                  </td>
                  <td className="p-1 border border-[#808080] text-right font-mono font-bold text-[#008000]">
                    {formatNumber(row.dwellTime, 1)}s
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Behaviour Score Derivation Section (matches test) */}
      <div className="p-3 bg-white border border-[#808080] text-xs mb-4">
        <div className="flex justify-between items-baseline mb-2">
          <h2 className="font-bold text-sm text-black font-serif">
            Behaviour score derivation
          </h2>
          <span className="font-mono text-[11px] text-[#555555]">{rankedBehaviour.length} scored pages</span>
        </div>
        <p className="text-[11px] text-[#555555] mb-2 leading-tight">
          Calculated via normalized CTR contribution (40%), saturating dwell score (35%), and bounce penalty (25%).
        </p>

        <div className="overflow-x-auto">
          <table className="table-retro text-xs w-full">
            <thead>
              <tr className="bg-[#EFEFEF]">
                <th className="p-1 border border-[#808080] text-left">Target Webpage</th>
                <th className="p-1 border border-[#808080] text-right">CTR Score</th>
                <th className="p-1 border border-[#808080] text-right">Dwell Score</th>
                <th className="p-1 border border-[#808080] text-right">Bounce Penalty</th>
                <th className="p-1 border border-[#808080] text-right">Aggregate Behaviour Score</th>
              </tr>
            </thead>
            <tbody>
              {rankedBehaviour.map((row) => {
                const breakdown = behaviorByPage.get(row.pageId);
                return (
                  <tr key={row.pageId} className="hover:bg-[#F8F9FA]">
                    <td className="p-1 border border-[#808080]">
                      <b className="text-black">{row.title}</b>
                      <span className="text-[10px] text-[#777777] ml-1">({row.category})</span>
                    </td>
                    <td className="p-1 border border-[#808080] text-right font-mono text-[#0000CC]">
                      {formatScore(breakdown?.ctrScore ?? 0, 2)}
                    </td>
                    <td className="p-1 border border-[#808080] text-right font-mono text-[#008000]">
                      {formatScore(breakdown?.dwellScore ?? 0, 2)}
                    </td>
                    <td className="p-1 border border-[#808080] text-right font-mono text-[#BC0000]">
                      −{formatScore(breakdown?.bouncePenalty ?? 0, 2)}
                    </td>
                    <td className="p-1 border border-[#808080] text-right font-mono font-bold text-black">
                      {formatScore(row.behaviourScore)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Navigation Paths Table */}
      <div className="p-3 bg-[#F8F9FA] border border-[#808080] text-xs mb-4">
        <div className="font-bold text-sm text-black font-serif mb-1">
          Sample Navigation Paths (Recorded Surfer Sessions)
        </div>
        <p className="text-[11px] text-[#555555] mb-2 leading-tight">
          Traces the actual sequence of pages visited by individual simulated users before ending their session.
        </p>
        <div className="space-y-1 font-mono text-[11px] max-h-40 overflow-y-auto bg-white p-2 border border-[#CCCCCC]">
          {simulationRun.analytics.navigationPaths.slice(0, 8).map((session, idx) => (
            <div key={session.userId || idx} className="truncate text-black">
              <span className="font-bold text-[#0000CC]">User {session.userId}:</span>{' '}
              {describeNavigationPath(session.path, dataset.pages).join(' → ')}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
