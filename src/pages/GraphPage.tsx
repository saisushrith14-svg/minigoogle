import { useCallback, useMemo, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Activity,
  ArrowDownLeft,
  ArrowUpRight,
  CircleDot,
  FileText,
  Layers,
  Link2,
  Network,
  Search,
  Sparkles,
} from 'lucide-react';
import type { RankingMode, WebPage } from '../types';
import { useApp } from '../state/AppContext';
import { cn } from '../utils/cn';
import {
  formatScore,
  MODE_SHORT_LABELS,
  SCENARIO_LABELS,
} from '../utils/format';
import { buildGraphTopology, getIncomingLinks, getOutgoingLinks } from '../utils/graphUtils';
import { buildSnippet } from '../utils/snippet';
import { Badge, Button, Card, InfoNote, SectionHeading } from '../components/ui/Primitives';
import { SearchBar } from '../components/search/SearchBar';
import { KnowledgeGraph, type LayoutMode } from '../components/graph/KnowledgeGraph';

type GraphMetric = 'keyword' | 'pagerank' | 'hybrid' | 'behaviour';

const METRICS: ReadonlyArray<{
  readonly id: GraphMetric;
  readonly label: string;
  readonly short: string;
  readonly description: string;
  readonly icon: typeof Network;
}> = [
  {
    id: 'keyword',
    label: 'Keyword relevance',
    short: 'Keyword',
    description: 'Content-only score from the 1997 model.',
    icon: FileText,
  },
  {
    id: 'pagerank',
    label: 'Normalized PageRank',
    short: 'PageRank',
    description: 'Iterative link authority scaled to the corpus.',
    icon: Link2,
  },
  {
    id: 'hybrid',
    label: 'Hybrid score',
    short: 'Hybrid',
    description: 'Configured keyword and PageRank blend.',
    icon: Layers,
  },
  {
    id: 'behaviour',
    label: 'Behaviour score',
    short: 'Behaviour',
    description: 'Observed surfer engagement from simulation telemetry.',
    icon: Activity,
  },
];

const METRIC_COLORS: Readonly<Record<GraphMetric, string>> = {
  keyword: '#d97706',
  pagerank: '#7c3aed',
  hybrid: '#2563eb',
  behaviour: '#059669',
};

const MODES: readonly RankingMode[] = ['keyword', 'pagerank', 'hybrid', 'experimental'];

export function GraphPage() {
  const {
    dataset,
    datasetId,
    query,
    comparison,
    behaviourScores,
    simulationIsCurrent,
  } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const metricParam = searchParams.get('metric');
  const layoutParam = searchParams.get('layout');
  const metric: GraphMetric =
    metricParam === 'keyword' ||
    metricParam === 'pagerank' ||
    metricParam === 'hybrid' ||
    metricParam === 'behaviour'
      ? metricParam
      : 'hybrid';
  const layout: LayoutMode = layoutParam === 'circular' ? 'circular' : 'force';
  const selectedId = searchParams.get('page');
  const selectedPage = selectedId ? dataset.pages.find((page) => page.id === selectedId) : undefined;

  const topology = useMemo(() => buildGraphTopology(dataset.pages), [dataset.pages]);
  const pageMap = useMemo(
    () => new Map(dataset.pages.map((page) => [page.id, page])),
    [dataset.pages],
  );

  const metricScores = useMemo<Record<string, number>>(() => {
    const scores: Record<string, number> = {};
    if (metric === 'behaviour') {
      dataset.pages.forEach((page) => {
        scores[page.id] = behaviourScores?.[page.id] ?? 0;
      });
      return scores;
    }
    const results = comparison.resultsByMode[metric === 'hybrid' ? 'hybrid' : metric];
    results.forEach((result) => {
      scores[result.pageId] =
        metric === 'keyword' ? result.keywordScore : metric === 'pagerank' ? result.normalizedPageRank : result.finalScore;
    });
    return scores;
  }, [behaviourScores, comparison.resultsByMode, dataset.pages, metric]);

  const metricInfo = METRICS.find((item) => item.id === metric) ?? METRICS[0];

  const rankedPages = useMemo(
    () =>
      dataset.pages
        .map((page) => ({ page, score: metricScores[page.id] ?? 0 }))
        .sort(
          (a, b) =>
            b.score - a.score ||
            a.page.title.localeCompare(b.page.title) ||
            a.page.id.localeCompare(b.page.id),
        ),
    [dataset.pages, metricScores],
  );

  const setParam = useCallback(
    (updates: Readonly<Record<string, string | null>>) => {
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous);
          Object.entries(updates).forEach(([key, value]) => {
            if (value === null) next.delete(key);
            else next.set(key, value);
          });
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const handleSelect = useCallback(
    (pageId: string | null) => {
      setParam({ page: pageId });
    },
    [setParam],
  );

  const modePositions = useMemo(() => {
    if (!selectedPage) return [];
    return MODES.map((item) => {
      const result = comparison.resultsByMode[item].find(
        (candidate) => candidate.pageId === selectedPage.id,
      );
      return { mode: item, result };
    });
  }, [comparison.resultsByMode, selectedPage]);

  const incoming = selectedPage
    ? getIncomingLinks(selectedPage.id, dataset.pages)
    : [];
  const outgoing = selectedPage
    ? getOutgoingLinks(selectedPage, new Set(dataset.pages.map((page) => page.id)))
    : [];

  const selectedScore = selectedPage ? (metricScores[selectedPage.id] ?? 0) : 0;
  const selectedRank = selectedPage
    ? rankedPages.findIndex((entry) => entry.page.id === selectedPage.id) + 1
    : 0;

  return (
    <div className="page-section">
      <div className="page-shell">
        <SectionHeading
          eyebrow={`${SCENARIO_LABELS[dataset.scenario]} · ${dataset.pages.length} nodes`}
          title="Interactive hyperlink graph"
          description="Nodes are pages, arrows are links, and colour encodes the selected ranking signal. Drag nodes, zoom, click a page, or follow the deep link from a search result."
          actions={
            <>
              <Link to="/search">
                <Button variant="secondary" size="sm">
                  <Search size={14} aria-hidden="true" /> Back to results
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

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <SearchBar />
          <p className="mt-2 text-xs text-slate-500">
            Current graph: <span className="font-semibold text-slate-700">{dataset.name}</span> ·
            query “{query || 'empty'}” · metric {metricInfo.label.toLowerCase()} ·{' '}
            {topology.danglingNodes.length} dangling nodes
          </p>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0">
            <Card className="p-3">
              <div className="flex flex-wrap items-center justify-between gap-3 px-1 pb-3">
                <div className="flex flex-wrap gap-1.5" role="group" aria-label="Graph colour metric">
                  {METRICS.map((item) => {
                    const Icon = item.icon;
                    const active = metric === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setParam({ metric: item.id })}
                        aria-pressed={active}
                        title={item.description}
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition',
                          active
                            ? 'border-slate-900 bg-slate-900 text-white'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900',
                        )}
                      >
                        <Icon size={13} aria-hidden="true" />
                        {item.short}
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Layout
                  </span>
                  <div className="flex rounded-lg border border-slate-200 p-0.5">
                    {(['force', 'circular'] as const).map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setParam({ layout: item })}
                        aria-pressed={layout === item}
                        className={cn(
                          'rounded-md px-2.5 py-1 text-xs font-semibold capitalize transition',
                          layout === item
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-slate-500 hover:text-slate-900',
                        )}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {metric === 'behaviour' && !simulationIsCurrent ? (
                <div className="px-1 pb-3">
                  <InfoNote tone="amber">
                    No current surfer telemetry exists for this dataset, query, and base ranking.
                    Behaviour scores are therefore zero. Run the deterministic simulation to
                    populate them.
                  </InfoNote>
                </div>
              ) : null}

              <KnowledgeGraph
                pages={dataset.pages}
                metricScores={metricScores}
                metric={metric}
                metricLabel={metricInfo.label}
                selectedId={selectedPage?.id ?? null}
                onSelect={handleSelect}
                layout={layout}
                keyPageIds={dataset.keyPageIds ?? []}
                height={620}
              />
            </Card>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Card className="p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Top signal
                </p>
                <p className="mt-1 line-clamp-2 text-sm font-bold text-slate-900">
                  {rankedPages[0]?.page.title ?? 'No pages'}
                </p>
                <p className="mt-1 font-mono text-xs text-slate-500">
                  {formatScore(rankedPages[0]?.score ?? 0)}
                </p>
              </Card>
              <Card className="p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Directed links
                </p>
                <p className="mt-1 text-xl font-bold text-slate-900">
                  {Object.values(topology.outDegree).reduce((sum, value) => sum + value, 0)}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {topology.danglingNodes.length} nodes have no valid outgoing links
                </p>
              </Card>
              <Card className="p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Colour scale
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="h-2.5 flex-1 rounded-full bg-slate-200" />
                  <span
                    className="h-2.5 flex-1 rounded-full"
                    style={{ backgroundColor: METRIC_COLORS[metric] }}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  low → high {metricInfo.short.toLowerCase()} score
                </p>
              </Card>
            </div>
          </div>

          <aside className="space-y-4">
            <Card className="p-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <CircleDot size={15} className="text-blue-600" aria-hidden="true" /> Page
                  inspector
                </h2>
                {selectedPage ? (
                  <Badge variant="blue">Rank #{selectedRank}</Badge>
                ) : (
                  <Badge variant="neutral">Nothing selected</Badge>
                )}
              </div>

              {selectedPage ? (
                <div className="mt-3 space-y-4">
                  <div>
                    <p className="text-sm font-bold leading-5 text-slate-900">
                      {selectedPage.title}
                    </p>
                    <p className="mt-1 break-all text-[11px] text-emerald-700">
                      {selectedPage.url}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Badge variant="neutral">{selectedPage.category}</Badge>
                      {(dataset.keyPageIds ?? []).includes(selectedPage.id) ? (
                        <Badge variant="green">
                          <Sparkles size={11} aria-hidden="true" /> Key page
                        </Badge>
                      ) : null}
                    </div>
                    {selectedPage.educationalRole ? (
                      <p className="mt-2 text-xs leading-5 text-slate-600">
                        {selectedPage.educationalRole}
                      </p>
                    ) : null}
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        {metricInfo.label}
                      </span>
                      <span className="font-mono text-sm font-bold text-slate-900">
                        {formatScore(selectedScore)}
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.max(0, Math.min(1, selectedScore)) * 100}%`,
                          backgroundColor: METRIC_COLORS[metric],
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      Rank in each model
                    </p>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {modePositions.map(({ mode, result }) => (
                        <div key={mode} className="rounded-lg border border-slate-200 p-2">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                            {MODE_SHORT_LABELS[mode]}
                          </p>
                          <p className="mt-1 font-mono text-sm font-bold text-slate-900">
                            #{result?.position ?? '—'}
                          </p>
                          <p className="font-mono text-[10px] text-slate-400">
                            {formatScore(result?.finalScore ?? 0)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      Content preview
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-600">
                      {buildSnippet(selectedPage.content, query, 220)}
                    </p>
                  </div>

                  <LinkList
                    title="Incoming links"
                    icon={<ArrowDownLeft size={13} aria-hidden="true" />}
                    pageIds={incoming}
                    pageMap={pageMap}
                    onSelect={handleSelect}
                  />
                  <LinkList
                    title="Outgoing links"
                    icon={<ArrowUpRight size={13} aria-hidden="true" />}
                    pageIds={outgoing}
                    pageMap={pageMap}
                    onSelect={handleSelect}
                  />

                  <Link to={`/graph?page=${encodeURIComponent(selectedPage.id)}&metric=${metric}&layout=${layout}`}>
                    <Button size="sm" variant="secondary" className="w-full">
                      Permalink to this node
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="mt-3">
                  <p className="text-xs leading-5 text-slate-500">
                    Click a node to inspect its inbound and outbound links. The list below is
                    ordered by the current metric.
                  </p>
                  <ol className="mt-3 space-y-1.5">
                    {rankedPages.slice(0, 8).map(({ page, score }, index) => (
                      <li key={page.id}>
                        <button
                          type="button"
                          onClick={() => handleSelect(page.id)}
                          className="flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-slate-50"
                        >
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-slate-100 font-mono text-[10px] font-bold text-slate-500">
                            {index + 1}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="line-clamp-2 block text-[11px] font-semibold leading-4 text-slate-700">
                              {page.title}
                            </span>
                            <span className="font-mono text-[10px] text-slate-400">
                              {formatScore(score)}
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </Card>

            <Card className="p-4">
              <h2 className="text-sm font-semibold text-slate-900">How to read this graph</h2>
              <ul className="mt-2 space-y-2 text-xs leading-5 text-slate-600">
                <li>
                  <strong className="text-slate-800">Arrows</strong> follow hyperlink direction:
                  source → target.
                </li>
                <li>
                  <strong className="text-slate-800">Colour</strong> encodes {metricInfo.short.toLowerCase()};
                  rank labels are recomputed for the selected metric.
                </li>
                <li>
                  <strong className="text-slate-800">Edges</strong> touching the selected node are
                  highlighted; the others fade.
                </li>
                <li>
                  <strong className="text-slate-800">Deep links</strong> use{' '}
                  <code className="rounded bg-slate-100 px-1">?page=</code>,{' '}
                  <code className="rounded bg-slate-100 px-1">?metric=</code>, and{' '}
                  <code className="rounded bg-slate-100 px-1">?layout=</code>.
                </li>
              </ul>
              <p className="mt-3 text-[11px] text-slate-400">Dataset id: {datasetId}</p>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}

function LinkList({
  title,
  icon,
  pageIds,
  pageMap,
  onSelect,
}: {
  readonly title: string;
  readonly icon: ReactNode;
  readonly pageIds: readonly string[];
  readonly pageMap: ReadonlyMap<string, WebPage>;
  readonly onSelect: (pageId: string | null) => void;
}) {
  return (
    <div>
      <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        {icon} {title} · {pageIds.length}
      </p>
      {pageIds.length === 0 ? (
        <p className="mt-1 text-xs text-slate-400">None in this corpus.</p>
      ) : (
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {pageIds.map((pageId) => {
            const page = pageMap.get(pageId);
            return (
              <button
                key={pageId}
                type="button"
                onClick={() => onSelect(pageId)}
                className="max-w-full truncate rounded-full border border-slate-200 bg-white px-2 py-1 text-[10px] font-medium text-slate-600 hover:border-blue-300 hover:text-blue-700"
                title={page?.title ?? pageId}
              >
                {page?.title ?? pageId}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
