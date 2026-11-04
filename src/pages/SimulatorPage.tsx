import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  CircleStop,
  Clock3,
  FastForward,
  Gauge,
  ListChecks,
  MousePointerClick,
  Pause,
  Play,
  RefreshCw,
  Rewind,
  Search,
  Sparkles,
  Users,
} from 'lucide-react';
import type { SimulationAction, SimulationEvent, WebPage } from '../types';
import { useApp } from '../state/AppContext';
import { cn } from '../utils/cn';
import {
  formatClock,
  formatNumber,
  formatPercent,
  MODE_LABELS,
  SCENARIO_LABELS,
} from '../utils/format';
import {
  SIMULATION_ACTIONS,
  SIMULATION_ACTION_LABELS,
  countEventsByAction,
  eventsForUser,
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
  Slider,
  TextInput,
} from '../components/ui/Primitives';
import { SearchBar } from '../components/search/SearchBar';

const ACTION_ICONS: Readonly<Record<SimulationAction, typeof Search>> = {
  SEARCH: Search,
  SCAN: ListChecks,
  CLICK_RESULT: MousePointerClick,
  DWELL: Clock3,
  SCROLL: Gauge,
  FOLLOW_LINK: ArrowRight,
  RETURN_TO_SEARCH: Rewind,
  END_SESSION: CircleStop,
};

const ACTION_TONES: Readonly<Record<SimulationAction, string>> = {
  SEARCH: 'bg-blue-50 text-blue-700',
  SCAN: 'bg-cyan-50 text-cyan-700',
  CLICK_RESULT: 'bg-violet-50 text-violet-700',
  DWELL: 'bg-emerald-50 text-emerald-700',
  SCROLL: 'bg-teal-50 text-teal-700',
  FOLLOW_LINK: 'bg-amber-50 text-amber-700',
  RETURN_TO_SEARCH: 'bg-rose-50 text-rose-700',
  END_SESSION: 'bg-slate-100 text-slate-600',
};

function eventDetail(
  event: SimulationEvent,
  pageMap: ReadonlyMap<string, WebPage>,
): string {
  const source = event.sourcePageId ? pageMap.get(event.sourcePageId)?.title ?? event.sourcePageId : null;
  const destination = event.destinationPageId
    ? pageMap.get(event.destinationPageId)?.title ?? event.destinationPageId
    : null;

  switch (event.action) {
    case 'SEARCH':
      return typeof event.metadata?.query === 'string'
        ? `Query “${event.metadata.query}”`
        : 'Opened the search box';
    case 'SCAN':
      return `${String(event.metadata?.serpDepth ?? '—')} ranked results scanned`;
    case 'CLICK_RESULT':
      return `${destination ?? 'A result'} · SERP position ${String(event.metadata?.position ?? '—')}`;
    case 'DWELL':
      return `${source ?? 'Page'} · ${formatNumber((event.dwellTimeMs ?? 0) / 1000, 1)}s dwell`;
    case 'SCROLL':
      return `${source ?? 'Page'} · depth ${formatPercent(Number(event.metadata?.depth ?? 0))}`;
    case 'FOLLOW_LINK':
      return `${source ?? 'Page'} → ${destination ?? 'target'}`;
    case 'RETURN_TO_SEARCH':
      return `${source ?? 'Page'} → SERP · satisfaction ${String(event.metadata?.satisfaction ?? '—')}`;
    case 'END_SESSION':
      return `${String(event.metadata?.reason ?? 'ended')} · satisfaction ${String(event.metadata?.satisfaction ?? '—')}`;
    default: {
      const exhaustive: never = event.action;
      return exhaustive;
    }
  }
}

export function SimulatorPage() {
  const {
    dataset,
    query,
    mode,
    simulationConfig,
    updateSimulationConfig,
    simulationRun,
    simulationIsCurrent,
    runSimulation,
    clearSimulation,
  } = useApp();
  const [eventIndex, setEventIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  const pageMap = useMemo(
    () => new Map(dataset.pages.map((page) => [page.id, page])),
    [dataset.pages],
  );
  const events = simulationRun?.events ?? [];
  const safeIndex = events.length === 0 ? 0 : Math.min(eventIndex, events.length - 1);
  const currentEvent = events[safeIndex];
  const baseMode = mode === 'experimental' ? 'hybrid' : mode;
  const summary = simulationRun ? summarizeRun(simulationRun) : null;
  const eventCounts = simulationRun ? countEventsByAction(simulationRun.events) : null;
  const configChanged = simulationRun
    ? JSON.stringify(simulationRun.config) !== JSON.stringify(simulationConfig)
    : false;
  const activeUserId = currentEvent?.userId ?? null;
  const activePath = activeUserId
    ? simulationRun?.analytics.navigationPaths.find((entry) => entry.userId === activeUserId)?.path ?? []
    : [];
  const activeSessionEvents = activeUserId ? eventsForUser(events, activeUserId) : [];

  useEffect(() => {
    setEventIndex(0);
    setPlaying(false);
  }, [simulationRun]);

  useEffect(() => {
    if (!playing || !simulationRun || simulationRun.events.length === 0) return;
    const interval = Math.max(90, Math.round(750 / Math.max(0.25, simulationConfig.speed)));
    const timer = window.setInterval(() => {
      setEventIndex((index) => Math.min(index + 1, simulationRun.events.length - 1));
    }, interval);
    return () => window.clearInterval(timer);
  }, [playing, simulationConfig.speed, simulationRun]);

  useEffect(() => {
    if (playing && simulationRun && safeIndex >= simulationRun.events.length - 1) {
      setPlaying(false);
    }
  }, [playing, safeIndex, simulationRun]);

  const run = () => {
    runSimulation();
    setEventIndex(0);
    setPlaying(false);
  };

  const maxVisible = 16;
  const windowStart =
    events.length <= maxVisible
      ? 0
      : Math.max(0, Math.min(safeIndex - 4, events.length - maxVisible));
  const visibleEvents = events.slice(windowStart, windowStart + maxVisible);

  return (
    <div className="page-section">
      <div className="page-shell">
        <SectionHeading
          eyebrow={`${SCENARIO_LABELS[dataset.scenario]} · deterministic surfer replay`}
          title="Surfer simulation"
          description="Every surfer decision is drawn from one seeded pseudo-random stream. The same configuration and ranked SERP always produce identical events — replay the log, inspect each session, then derive analytics and behaviour scores from it."
          actions={
            <>
              <Button onClick={run}>
                <Play size={14} aria-hidden="true" /> Run deterministic simulation
              </Button>
              {simulationRun ? (
                <Button variant="secondary" onClick={clearSimulation}>
                  <RefreshCw size={14} aria-hidden="true" /> Clear run
                </Button>
              ) : null}
            </>
          }
        />

        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <SearchBar />
          <p className="mt-2 text-xs text-slate-500">
            Simulating “{query || 'empty query'}” on {dataset.name} using{' '}
            <span className="font-semibold text-slate-700">{MODE_LABELS[baseMode]}</span>
            {mode === 'experimental'
              ? ' as the base ranking (telemetry cannot depend on itself).'
              : '.'}
          </p>
        </div>

        {!simulationRun ? (
          <div className="mt-6">
            <EmptyState
              icon={<Users size={34} aria-hidden="true" />}
              title="No telemetry yet"
              description="Configure the surfers below and run the simulation. The run will record every search, click, dwell, scroll, link follow, return, and session end as an inspectable event."
              action={
                <Button size="md" onClick={run}>
                  <Play size={14} aria-hidden="true" /> Run simulation
                </Button>
              }
            />
          </div>
        ) : null}

        <div className="mt-6 grid gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="space-y-4">
            <Card className="p-4">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Users size={16} className="text-blue-600" aria-hidden="true" /> Simulation config
              </h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                These parameters are sanitized into valid ranges before a run. Re-running with the
                same seed reproduces the log exactly.
              </p>

              <div className="mt-4 space-y-4">
                <Slider
                  label="Surfers"
                  value={simulationConfig.userCount}
                  min={1}
                  max={200}
                  step={1}
                  onChange={(value) => updateSimulationConfig({ userCount: value })}
                  formatValue={(value) => `${value} users`}
                />
                <Slider
                  label="Click probability"
                  value={simulationConfig.clickProbability}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(value) => updateSimulationConfig({ clickProbability: value })}
                  formatValue={(value) => formatPercent(value)}
                  hint="Baseline chance of clicking a result, weighted by position and score."
                />
                <Slider
                  label="Attention span"
                  value={simulationConfig.attentionSpan}
                  min={5}
                  max={240}
                  step={5}
                  onChange={(value) => updateSimulationConfig({ attentionSpan: value })}
                  formatValue={(value) => `${value}s`}
                />
                <Slider
                  label="Scroll probability"
                  value={simulationConfig.scrollProbability}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(value) => updateSimulationConfig({ scrollProbability: value })}
                  formatValue={(value) => formatPercent(value)}
                  hint="Engaged sessions avoid the bounce penalty."
                />
                <Slider
                  label="Return to SERP"
                  value={simulationConfig.returnProbability}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(value) => updateSimulationConfig({ returnProbability: value })}
                  formatValue={(value) => formatPercent(value)}
                />
                <Slider
                  label="Follow outgoing link"
                  value={simulationConfig.followLinkProbability}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(value) => updateSimulationConfig({ followLinkProbability: value })}
                  formatValue={(value) => formatPercent(value)}
                />
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Random seed</span>
                  <TextInput
                    type="number"
                    min={0}
                    max={4294967295}
                    step={1}
                    className="mt-1.5"
                    value={simulationConfig.randomSeed}
                    onChange={(event) =>
                      updateSimulationConfig({ randomSeed: Number(event.target.value) })
                    }
                  />
                  <span className="mt-1 block text-xs leading-5 text-slate-500">
                    Integer seed for the Mulberry32 stream. Change it to get a different but still
                    reproducible world.
                  </span>
                </label>
                <Slider
                  label="Replay speed"
                  value={simulationConfig.speed}
                  min={0.25}
                  max={10}
                  step={0.25}
                  onChange={(value) => updateSimulationConfig({ speed: value })}
                  formatValue={(value) => `${formatNumber(value, 2)}×`}
                  hint="Only changes playback pacing; telemetry is unaffected."
                />
              </div>

              <div className="mt-5 space-y-2">
                <Button className="w-full" onClick={run}>
                  <Play size={14} aria-hidden="true" /> Run with this config
                </Button>
                {simulationRun ? (
                  <Button className="w-full" variant="secondary" onClick={clearSimulation}>
                    Clear current run
                  </Button>
                ) : null}
              </div>
            </Card>

            {simulationRun && eventCounts ? (
              <Card className="p-4">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <ListChecks size={15} className="text-violet-600" aria-hidden="true" /> Event mix
                </h2>
                <div className="mt-3 grid grid-cols-2 gap-1.5">
                  {SIMULATION_ACTIONS.map((action) => (
                    <div
                      key={action}
                      className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-2 py-1.5"
                    >
                      <span className="text-[10px] font-medium text-slate-600">
                        {SIMULATION_ACTION_LABELS[action]}
                      </span>
                      <span className="font-mono text-[10px] font-bold text-slate-900">
                        {eventCounts[action]}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-[11px] leading-4 text-slate-400">
                  Total: {simulationRun.events.length} events across{' '}
                  {simulationRun.config.userCount} configured surfers.
                </p>
              </Card>
            ) : null}
          </aside>

          <div className="min-w-0 space-y-4">
            {simulationRun && summary ? (
              <>
                {!simulationIsCurrent || configChanged ? (
                  <InfoNote tone="amber">
                    {!simulationIsCurrent
                      ? 'This run no longer matches the current dataset, query, or base ranking. Re-run before using its telemetry for behavioural ranking.'
                      : 'The configuration changed after this run. The replay and analytics below still describe the recorded run, not the new settings.'}
                  </InfoNote>
                ) : (
                  <InfoNote tone="green">
                    This run matches the current dataset, query, and base ranking. Its behaviour
                    scores are available to the behavioural ranking model.
                  </InfoNote>
                )}

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <MetricCard
                    label="Sessions"
                    value={String(summary.totalSessions)}
                    helper={`${simulationRun.config.userCount} configured surfers`}
                    icon={<Users size={18} />}
                    tone="blue"
                  />
                  <MetricCard
                    label="Clicks"
                    value={String(summary.totalClicks)}
                    helper={`${formatPercent(summary.aggregateClickThroughRate)} of ${summary.totalImpressions} impressions`}
                    icon={<MousePointerClick size={18} />}
                    tone="green"
                  />
                  <MetricCard
                    label="Pages / session"
                    value={formatNumber(summary.pagesPerSession, 2)}
                    helper={`${summary.activePages} pages received impressions`}
                    icon={<Gauge size={18} />}
                    tone="violet"
                  />
                  <MetricCard
                    label="Simulated time"
                    value={formatClock(summary.totalTimeMs)}
                    helper={`Seed ${simulationRun.config.randomSeed}`}
                    icon={<Clock3 size={18} />}
                    tone="amber"
                  />
                </div>

                <Card className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                        <Sparkles size={15} className="text-amber-500" aria-hidden="true" /> Replay
                        the recorded event log
                      </h2>
                      <p className="mt-1 text-xs text-slate-500">
                        Event {safeIndex + 1} of {events.length} · {formatClock(currentEvent?.timestamp ?? 0)}{' '}
                        simulated time
                      </p>
                    </div>
                    <Badge variant="neutral">{simulationRun.rankingMode}</Badge>
                  </div>

                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all"
                      style={{
                        width: `${events.length === 0 ? 0 : ((safeIndex + 1) / events.length) * 100}%`,
                      }}
                    />
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setPlaying(false);
                        setEventIndex(0);
                      }}
                      aria-label="Jump to first event"
                      disabled={events.length === 0}
                    >
                      <Rewind size={14} aria-hidden="true" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setPlaying(false);
                        setEventIndex((index) => Math.max(0, index - 1));
                      }}
                      aria-label="Previous event"
                      disabled={safeIndex === 0}
                    >
                      <ChevronLeft size={14} aria-hidden="true" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        if (safeIndex >= events.length - 1) setEventIndex(0);
                        setPlaying((value) => !value);
                      }}
                      disabled={events.length === 0}
                    >
                      {playing ? (
                        <>
                          <Pause size={14} aria-hidden="true" /> Pause
                        </>
                      ) : (
                        <>
                          <Play size={14} aria-hidden="true" /> Play
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setPlaying(false);
                        setEventIndex((index) => Math.min(events.length - 1, index + 1));
                      }}
                      aria-label="Next event"
                      disabled={safeIndex >= events.length - 1}
                    >
                      <ChevronRight size={14} aria-hidden="true" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setPlaying(false);
                        setEventIndex(Math.max(0, events.length - 1));
                      }}
                      aria-label="Jump to last event"
                      disabled={events.length === 0}
                    >
                      <FastForward size={14} aria-hidden="true" />
                    </Button>
                    <span className="ml-1 text-xs text-slate-500">
                      Replay {formatNumber(simulationConfig.speed, 2)}×
                    </span>
                  </div>

                  {currentEvent ? (
                    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            'rounded-lg px-2 py-1 text-xs font-bold',
                            ACTION_TONES[currentEvent.action],
                          )}
                        >
                          {SIMULATION_ACTION_LABELS[currentEvent.action]}
                        </span>
                        <span className="font-mono text-xs text-slate-500">
                          {currentEvent.userId}
                        </span>
                        <span className="font-mono text-xs text-slate-400">
                          {formatClock(currentEvent.timestamp)}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        {eventDetail(currentEvent, pageMap)}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-400">
                        {activeSessionEvents.length} events in this surfer's session
                      </p>
                    </div>
                  ) : null}

                  <div className="scrollbar-thin mt-3 max-h-[420px] space-y-1 overflow-y-auto pr-1">
                    {visibleEvents.map((event, offset) => {
                      const index = windowStart + offset;
                      const Icon = ACTION_ICONS[event.action];
                      const active = index === safeIndex;
                      return (
                        <button
                          key={`${event.timestamp}-${event.userId}-${event.action}-${index}`}
                          type="button"
                          onClick={() => {
                            setPlaying(false);
                            setEventIndex(index);
                          }}
                          className={cn(
                            'flex w-full items-start gap-2 rounded-lg border px-2.5 py-2 text-left transition',
                            active
                              ? 'border-blue-300 bg-blue-50'
                              : 'border-transparent hover:bg-slate-50',
                          )}
                        >
                          <span className="mt-0.5 text-slate-400">
                            <Icon size={14} aria-hidden="true" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex flex-wrap items-center gap-2">
                              <span className="text-[11px] font-bold text-slate-700">
                                {SIMULATION_ACTION_LABELS[event.action]}
                              </span>
                              <span className="font-mono text-[10px] text-slate-400">
                                {event.userId} · {formatClock(event.timestamp)}
                              </span>
                            </span>
                            <span className="mt-0.5 block truncate text-[10px] text-slate-500">
                              {eventDetail(event, pageMap)}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {events.length > maxVisible ? (
                    <p className="mt-2 text-center text-[10px] text-slate-400">
                      Showing events {windowStart + 1}–{Math.min(windowStart + maxVisible, events.length)}{' '}
                      of {events.length}
                    </p>
                  ) : null}
                </Card>

                <Card className="p-4">
                  <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <Activity size={15} className="text-emerald-600" aria-hidden="true" /> Active
                    surfer session
                  </h2>
                  {activeUserId ? (
                    <>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Badge variant="green">{activeUserId}</Badge>
                        <span className="text-xs text-slate-500">
                          {activeSessionEvents.length} events · {activePath.length} clicked pages
                        </span>
                      </div>
                      {activePath.length > 0 ? (
                        <div className="mt-3 flex flex-wrap items-center gap-1.5">
                          {activePath.map((pageId, index) => (
                            <span key={`${pageId}-${index}`} className="flex items-center gap-1.5">
                              {index > 0 ? (
                                <ArrowRight size={12} className="text-slate-300" aria-hidden="true" />
                              ) : null}
                              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-medium text-slate-700">
                                {pageMap.get(pageId)?.title ?? pageId}
                              </span>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-2 text-xs text-slate-500">
                          This surfer has not clicked a result yet.
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="mt-2 text-xs text-slate-500">
                      Step through the event log to inspect a surfer session.
                    </p>
                  )}
                </Card>

                <div className="flex flex-wrap gap-2">
                  <Link to="/analytics">
                    <Button variant="dark" size="sm">
                      <BarChart3 size={14} aria-hidden="true" /> Open analytics
                    </Button>
                  </Link>
                  <Link to="/search">
                    <Button variant="secondary" size="sm">
                      <Search size={14} aria-hidden="true" /> Back to results
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <Card className="p-6">
                <h2 className="text-sm font-semibold text-slate-900">What will be recorded?</h2>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {SIMULATION_ACTIONS.map((action) => {
                    const Icon = ACTION_ICONS[action];
                    return (
                      <div
                        key={action}
                        className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2"
                      >
                        <span className={cn('rounded-md p-1.5', ACTION_TONES[action])}>
                          <Icon size={13} aria-hidden="true" />
                        </span>
                        <span className="text-xs font-medium text-slate-700">
                          {SIMULATION_ACTION_LABELS[action]}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-4 text-xs leading-5 text-slate-500">
                  Every event carries a timestamp, user id, action, source and destination pages,
                  and action-specific metadata. Analytics never invent a value that the event log
                  cannot support.
                </p>
                <div className="mt-4">
                  <Button onClick={run}>
                    <Play size={14} aria-hidden="true" /> Generate telemetry
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
