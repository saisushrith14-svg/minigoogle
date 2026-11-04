import { useMemo } from 'react';
import { Activity, CheckCircle2, FlaskConical, Info, Loader2, SearchX } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../state/AppContext';
import { buildGraphTopology } from '../utils/graphUtils';
import { formatClock, MODE_LABELS, SCENARIO_LABELS } from '../utils/format';
import { Badge, Button, Card, InfoNote, SectionHeading } from '../components/ui/Primitives';
import { SearchBar } from '../components/search/SearchBar';
import { ModeTabs } from '../components/search/ModeTabs';
import { ResultCard } from '../components/search/ResultCard';
import { RankingControls } from '../components/search/RankingControls';

export function SearchPage() {
  const {
    dataset,
    searchResponse,
    keywordWeights,
    query,
    mode,
    simulationRun,
    simulationIsCurrent,
    runSimulation,
  } = useApp();

  const topology = useMemo(() => buildGraphTopology(dataset.pages), [dataset.pages]);
  const pageMap = useMemo(
    () => new Map(dataset.pages.map((page) => [page.id, page])),
    [dataset.pages],
  );
  const keyPageIds = useMemo(() => new Set(dataset.keyPageIds ?? []), [dataset.keyPageIds]);

  const runBehaviours = () => {
    runSimulation();
  };

  return (
    <div className="page-section">
      <div className="page-shell">
        <SectionHeading
          eyebrow={`${SCENARIO_LABELS[dataset.scenario]} · ${dataset.pages.length} pages`}
          title={dataset.name.replace(/^Scenario \d+: /, '')}
          description={dataset.description}
          actions={
            <>
              <Link to="/graph">
                <Button variant="secondary" size="sm">
                  Open graph
                </Button>
              </Link>
              <Link to="/compare">
                <Button variant="dark" size="sm">
                  Compare rankings
                </Button>
              </Link>
            </>
          }
        />

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <SearchBar />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0">
            <Card className="p-4">
              <ModeTabs />
            </Card>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-slate-900">
                  {searchResponse.results.length} ranked pages
                </h2>
                <Badge variant="neutral">{MODE_LABELS[mode]}</Badge>
                {searchResponse.pageRankComputation.converged ? (
                  <Badge variant="green">
                    <CheckCircle2 size={11} aria-hidden="true" /> PageRank converged
                  </Badge>
                ) : (
                  <Badge variant="amber">PageRank at iteration cap</Badge>
                )}
              </div>
              <span className="text-xs text-slate-500">
                {searchResponse.pageRankComputation.iterations} iterations · Δ=
                {searchResponse.pageRankComputation.finalDelta.toExponential(1)}
              </span>
            </div>

            {query.trim().length === 0 ? (
              <div className="mt-3">
                <InfoNote tone="amber">
                  Enter a query to compute content relevance. PageRank and behaviour scores remain
                  defined because they do not depend on the query text.
                </InfoNote>
              </div>
            ) : null}

            {mode === 'experimental' ? (
              <div className="mt-3">
                {simulationIsCurrent && simulationRun ? (
                  <div className="flex flex-wrap items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-900">
                    <Activity size={15} aria-hidden="true" />
                    <span className="flex-1">
                      Behaviour scores from {simulationRun.config.userCount} surfers, seed{' '}
                      {simulationRun.config.randomSeed}, {formatClock(simulationRun.totalTimeMs)} of
                      telemetry.
                    </span>
                    <Link to="/analytics" className="font-semibold underline">
                      View analytics
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
                    <Info size={15} aria-hidden="true" />
                    <span className="flex-1">
                      Experimental ranking needs surfer telemetry for this exact dataset, query, and
                      base ranking. Until then the behaviour component contributes zero.
                    </span>
                    <Button size="sm" variant="secondary" onClick={runBehaviours}>
                      <Loader2 size={13} aria-hidden="true" /> Run simulation
                    </Button>
                  </div>
                )}
              </div>
            ) : null}

            <div className="mt-4 space-y-3">
              {searchResponse.results.length === 0 ? (
                <Card className="p-8 text-center">
                  <SearchX className="mx-auto text-slate-300" size={30} aria-hidden="true" />
                  <p className="mt-2 text-sm font-semibold text-slate-700">No pages to rank</p>
                </Card>
              ) : (
                searchResponse.results.map((result) => {
                  const page = pageMap.get(result.pageId);
                  if (!page) return null;
                  return (
                    <ResultCard
                      key={result.pageId}
                      result={result}
                      page={page}
                      query={query}
                      keywordWeights={keywordWeights}
                      isKeyPage={keyPageIds.has(page.id)}
                      incomingCount={topology.inDegree[page.id] ?? 0}
                      outgoingCount={topology.outDegree[page.id] ?? 0}
                      mode={mode}
                    />
                  );
                })
              )}
            </div>
          </div>

          <aside className="space-y-4">
            <RankingControls compact />
            <Card className="p-5">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <FlaskConical size={16} className="text-violet-600" aria-hidden="true" />
                Scenario briefing
              </h2>
              <p className="mt-2 text-xs leading-5 text-slate-600">{dataset.educationalNotes}</p>
              <div className="mt-4 space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Key pages
                </p>
                {(dataset.keyPageIds ?? []).map((pageId) => {
                  const page = pageMap.get(pageId);
                  if (!page) return null;
                  const result = searchResponse.results.find((item) => item.pageId === pageId);
                  return (
                    <div
                      key={pageId}
                      className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-2.5 py-2"
                    >
                      <span className="truncate text-xs text-slate-700">{page.title}</span>
                      <Badge variant="blue">#{result?.position ?? '—'}</Badge>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                <Badge variant="neutral">{dataset.pages.length} pages</Badge>
                <Badge variant="neutral">
                  {topology.danglingNodes.length} dangling
                </Badge>
                <Badge variant="neutral">
                  {Object.values(topology.outDegree).reduce((sum, value) => sum + value, 0)} links
                </Badge>
              </div>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
