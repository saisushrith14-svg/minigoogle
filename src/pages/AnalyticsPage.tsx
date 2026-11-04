import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  BarChart3,
  Clock3,
  Gauge,
  GitCompare,
  MousePointerClick,
  Play,
  Sparkles,
  Users,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
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
  chartLabel,
  countEventsByAction,
  describeNavigationPath,
  summarizeRun,
} from '../utils/simulationView';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  InfoNote,
  MetricCard,
  SectionHeading,
} from '../components/ui/Primitives';

function percentTick(value: number): string {
  return formatPercent(value);
}

export function AnalyticsPage() {
  const {
    dataset,
    query,
    simulationRun,
    simulationIsCurrent,
    runSimulation,
  } = useApp();

  const pageMap = useMemo(
    () => new Map(dataset.pages.map((page) => [page.id, page])),
    [dataset.pages],
  );
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
  const chartRows = useMemo(
    () =>
      telemetryRows
        .filter((row) => row.impressions > 0)
        .slice(0, 9)
        .map((row) => ({
          ...row,
          label: chartLabel(row.title, row.pageId, 26),
        })),
    [telemetryRows],
  );
  const summary = simulationRun ? summarizeRun(simulationRun) : null;
  const eventCounts = simulationRun ? countEventsByAction(simulationRun.events) : null;

  if (!simulationRun || !summary) {
    return (
      <div className="page-section">
        <div className="page-shell">
          <SectionHeading
            eyebrow={`${SCENARIO_LABELS[dataset.scenario]} · telemetry-derived metrics`}
            title="Behaviour analytics"
            description="Every chart on this page is computed from the recorded surfer event log. Generate telemetry first, then inspect CTR, dwell time, bounce rate, navigation paths, and the resulting behaviour scores."
            actions={
              <Link to="/simulator">
                <Button variant="secondary" size="sm">
                  <Users size={14} aria-hidden="true" /> Configure surfers
                </Button>
              </Link>
            }
          />
          <div className="mt-6">
            <EmptyState
              icon={<BarChart3 size={34} aria-hidden="true" />}
              title="No simulation telemetry"
              description={`Run the deterministic simulator for “${query || 'the current query'}” on ${dataset.name}. There are no synthetic fallback charts: analytics appear only after real events exist.`}
              action={
                <Button onClick={() => runSimulation()}>
                  <Play size={14} aria-hidden="true" /> Run simulation now
                </Button>
              }
            />
          </div>
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
    <div className="page-section">
      <div className="page-shell">
        <SectionHeading
          eyebrow={`${SCENARIO_LABELS[dataset.scenario]} · ${simulationRun.events.length} recorded events`}
          title="Behaviour analytics"
          description={`Derived from ${simulationRun.config.userCount} simulated surfers on “${query || 'the current query'}”, seed ${simulationRun.config.randomSeed}. Impressions come from SCAN events; clicks, dwell time, bounces, and paths come from the event log.`}
          actions={
            <>
              <Button size="sm" onClick={() => runSimulation()}>
                <Play size={14} aria-hidden="true" /> Run again
              </Button>
              <Link to="/simulator">
                <Button variant="secondary" size="sm">
                  <Users size={14} aria-hidden="true" /> Replay log
                </Button>
              </Link>
              <Link to="/compare">
                <Button variant="dark" size="sm">
                  <GitCompare size={14} aria-hidden="true" /> Use in ranking
                </Button>
              </Link>
            </>
          }
        />

        <div className="mt-5">
          {!simulationIsCurrent ? (
            <InfoNote tone="amber">
              This telemetry no longer matches the current dataset, query, or base ranking. The
              charts below still describe the recorded run; re-run the simulator before using its
              behaviour scores for ranking.
            </InfoNote>
          ) : (
            <InfoNote tone="green">
              This run is current. Its behaviour scores are available to the behavioural ranking
              model and to the comparison lab.
            </InfoNote>
          )}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Sessions"
            value={String(summary.totalSessions)}
            helper={`${telemetryCount} pages with telemetry`}
            icon={<Users size={18} />}
            tone="blue"
          />
          <MetricCard
            label="Aggregate CTR"
            value={formatPercent(summary.aggregateClickThroughRate, 1)}
            helper={`${summary.totalClicks} clicks / ${summary.totalImpressions} impressions`}
            icon={<MousePointerClick size={18} />}
            tone="green"
          />
          <MetricCard
            label="Pages / session"
            value={formatNumber(summary.pagesPerSession, 2)}
            helper={`${simulationRun.analytics.navigationPaths.length} recorded paths`}
            icon={<Gauge size={18} />}
            tone="violet"
          />
          <MetricCard
            label="Recorded time"
            value={formatClock(summary.totalTimeMs)}
            helper={`${summary.totalEvents} total events`}
            icon={<Clock3 size={18} />}
            tone="amber"
          />
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-2">
          <Card className="p-4">
            <h2 className="text-sm font-semibold text-slate-900">Click-through rate</h2>
            <p className="mt-1 text-xs text-slate-500">
              Clicks divided by SERP impressions for each page. Only pages that appeared in a
              scanned SERP are charted.
            </p>
            <div className="mt-3 h-[300px]">
              {chartRows.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartRows}
                    layout="vertical"
                    margin={{ left: 4, right: 20, top: 4, bottom: 4 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tickFormatter={percentTick} fontSize={10} />
                    <YAxis type="category" dataKey="label" width={150} tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(value) => formatPercent(Number(value), 1)} />
                    <Bar
                      dataKey="clickThroughRate"
                      name="CTR"
                      fill="#2563eb"
                      radius={[0, 4, 4, 0]}
                      isAnimationActive={false}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-xs text-slate-500">No SERP impressions were recorded.</p>
              )}
            </div>
          </Card>

          <Card className="p-4">
            <h2 className="text-sm font-semibold text-slate-900">Average dwell time</h2>
            <p className="mt-1 text-xs text-slate-500">
              Mean DWELL duration per page in seconds. Long dwell is treated as engagement, not
              automatically as relevance.
            </p>
            <div className="mt-3 h-[300px]">
              {chartRows.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartRows}
                    layout="vertical"
                    margin={{ left: 4, right: 20, top: 4, bottom: 4 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis
                      type="number"
                      tickFormatter={(value: number) => `${formatNumber(value, 1)}s`}
                      fontSize={10}
                    />
                    <YAxis type="category" dataKey="label" width={150} tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(value) => `${formatNumber(Number(value), 1)} seconds`} />
                    <Bar
                      dataKey="dwellTime"
                      name="Dwell"
                      fill="#059669"
                      radius={[0, 4, 4, 0]}
                      isAnimationActive={false}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-xs text-slate-500">No dwell events were recorded.</p>
              )}
            </div>
          </Card>

          <Card className="p-4">
            <h2 className="text-sm font-semibold text-slate-900">Bounce rate</h2>
            <p className="mt-1 text-xs text-slate-500">
              A bounce is an immediate return to the SERP without a scroll or followed link. The
              denominator is visits to the page.
            </p>
            <div className="mt-3 h-[300px]">
              {chartRows.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartRows}
                    layout="vertical"
                    margin={{ left: 4, right: 20, top: 4, bottom: 4 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tickFormatter={percentTick} fontSize={10} domain={[0, 1]} />
                    <YAxis type="category" dataKey="label" width={150} tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(value) => formatPercent(Number(value), 1)} />
                    <Bar
                      dataKey="bounceRate"
                      name="Bounce rate"
                      fill="#e11d48"
                      radius={[0, 4, 4, 0]}
                      isAnimationActive={false}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-xs text-slate-500">No page visits were recorded.</p>
              )}
            </div>
          </Card>

          <Card className="p-4">
            <h2 className="text-sm font-semibold text-slate-900">Behaviour score</h2>
            <p className="mt-1 text-xs text-slate-500">
              Aggregate of normalized CTR, saturating dwell, and the bounce penalty. Pages with no
              telemetry remain at zero.
            </p>
            <div className="mt-3 h-[300px]">
              {chartRows.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartRows}
                    layout="vertical"
                    margin={{ left: 4, right: 20, top: 4, bottom: 4 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis
                      type="number"
                      tickFormatter={(value: number) => formatScore(value, 2)}
                      fontSize={10}
                      domain={[0, 1]}
                    />
                    <YAxis type="category" dataKey="label" width={150} tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(value) => formatScore(Number(value))} />
                    <Bar
                      dataKey="behaviourScore"
                      name="Behaviour"
                      fill="#7c3aed"
                      radius={[0, 4, 4, 0]}
                      isAnimationActive={false}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-xs text-slate-500">No behaviour scores are available.</p>
              )}
            </div>
          </Card>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
          <Card className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Sparkles size={15} className="text-violet-600" aria-hidden="true" /> Behaviour
                score derivation
              </h2>
              <Badge variant="violet">{rankedBehaviour.length} pages</Badge>
            </div>
            <div className="scrollbar-thin mt-3 overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-500">
                    <th className="px-2 py-2 font-semibold">Page</th>
                    <th className="px-2 py-2 text-right font-semibold">CTR score</th>
                    <th className="px-2 py-2 text-right font-semibold">Dwell score</th>
                    <th className="px-2 py-2 text-right font-semibold">Bounce penalty</th>
                    <th className="px-2 py-2 text-right font-semibold">Aggregate</th>
                  </tr>
                </thead>
                <tbody>
                  {rankedBehaviour.map((row) => {
                    const breakdown = behaviorByPage.get(row.pageId);
                    return (
                      <tr key={row.pageId} className="border-b border-slate-100 last:border-0">
                        <td className="max-w-[260px] px-2 py-2">
                          <span className="line-clamp-1 font-medium text-slate-700">
                            {row.title}
                          </span>
                          <span className="text-[10px] text-slate-400">{row.category}</span>
                        </td>
                        <td className="px-2 py-2 text-right font-mono text-slate-600">
                          {formatScore(breakdown?.ctrScore ?? 0, 2)}
                        </td>
                        <td className="px-2 py-2 text-right font-mono text-slate-600">
                          {formatScore(breakdown?.dwellScore ?? 0, 2)}
                        </td>
                        <td className="px-2 py-2 text-right font-mono text-rose-600">
                          −{formatScore(breakdown?.bouncePenalty ?? 0, 2)}
                        </td>
                        <td className="px-2 py-2 text-right font-mono font-bold text-slate-900">
                          {formatScore(row.behaviourScore)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {rankedBehaviour.length === 0 ? (
              <p className="mt-3 text-xs text-slate-500">No page received click or dwell telemetry.</p>
            ) : null}
          </Card>

          <div className="space-y-4">
            <Card className="p-4">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Activity size={15} className="text-blue-600" aria-hidden="true" /> Event mix
              </h2>
              <div className="mt-3 grid grid-cols-2 gap-1.5">
                {eventCounts
                  ? Object.entries(eventCounts).map(([action, count]) => (
                      <div
                        key={action}
                        className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-2 py-1.5"
                      >
                        <span className="text-[10px] font-medium text-slate-600">
                          {action.replaceAll('_', ' ').toLowerCase()}
                        </span>
                        <span className="font-mono text-[10px] font-bold text-slate-900">
                          {count}
                        </span>
                      </div>
                    ))
                  : null}
              </div>
            </Card>

            <Card className="p-4">
              <h2 className="text-sm font-semibold text-slate-900">Run identity</h2>
              <dl className="mt-2 space-y-2 text-xs">
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500">Run id</dt>
                  <dd className="break-all text-right font-mono text-slate-700">
                    {simulationRun.id}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500">Dataset</dt>
                  <dd className="text-right font-medium text-slate-700">{dataset.id}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500">Base ranking</dt>
                  <dd className="text-right font-medium capitalize text-slate-700">
                    {simulationRun.rankingMode}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500">Seed</dt>
                  <dd className="font-mono text-slate-700">{simulationRun.config.randomSeed}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500">Surfers</dt>
                  <dd className="font-mono text-slate-700">{simulationRun.config.userCount}</dd>
                </div>
              </dl>
            </Card>
          </div>
        </div>

        <Card className="mt-5 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-slate-900">Navigation paths</h2>
            <Badge variant="neutral">
              {simulationRun.analytics.navigationPaths.length} surfers
            </Badge>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Exact click and link-follow sequences reconstructed from the event log. Empty paths mean
            the surfer ended without clicking a result.
          </p>
          <div className="scrollbar-thin mt-3 max-h-[360px] space-y-2 overflow-y-auto pr-1">
            {simulationRun.analytics.navigationPaths.map((entry) => {
              const titles = describeNavigationPath(entry.path, dataset.pages);
              return (
                <div
                  key={entry.userId}
                  className="rounded-xl border border-slate-200 px-3 py-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-semibold text-slate-700">
                      {entry.userId}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {entry.path.length} page{entry.path.length === 1 ? '' : 's'}
                    </span>
                  </div>
                  {entry.path.length > 0 ? (
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      {entry.path.map((pageId, index) => (
                        <span key={`${pageId}-${index}`} className="flex items-center gap-1.5">
                          {index > 0 ? (
                            <ArrowRight size={11} className="text-slate-300" aria-hidden="true" />
                          ) : null}
                          <span
                            className="max-w-[220px] truncate rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600"
                            title={pageMap.get(pageId)?.title ?? pageId}
                          >
                            {pageMap.get(pageId)?.title ?? titles[index]}
                          </span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-1 text-[10px] text-slate-400">No clicks recorded.</p>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
