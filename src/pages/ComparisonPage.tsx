import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  FileText,
  GitCompare,
  Layers,
  Link2,
  Minus,
  Network,
  Search,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import type { RankingMode } from '../types';
import { useApp } from '../state/AppContext';
import { cn } from '../utils/cn';
import {
  formatPercent,
  formatScore,
  MODE_DESCRIPTIONS,
  MODE_LABELS,
  MODE_SHORT_LABELS,
  SCENARIO_LABELS,
} from '../utils/format';
import {
  Badge,
  Button,
  Card,
  InfoNote,
  SectionHeading,
} from '../components/ui/Primitives';
import { SearchBar } from '../components/search/SearchBar';
import { RankingControls } from '../components/search/RankingControls';
import { FactorBreakdown } from '../components/search/FactorBreakdown';

const MODES: readonly RankingMode[] = ['keyword', 'pagerank', 'hybrid', 'experimental'];

const MODE_ICONS: Readonly<Record<RankingMode, typeof FileText>> = {
  keyword: FileText,
  pagerank: Link2,
  hybrid: Layers,
  experimental: Activity,
};

const MODE_TONES: Readonly<Record<RankingMode, 'amber' | 'violet' | 'blue' | 'green'>> = {
  keyword: 'amber',
  pagerank: 'violet',
  hybrid: 'blue',
  experimental: 'green',
};

function movementBetween(keywordRank: number, targetRank: number): number {
  return keywordRank - targetRank;
}

function MovementBadge({ delta }: { readonly delta: number }) {
  if (delta === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 rounded-full bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-500">
        <Minus size={10} aria-hidden="true" /> 0
      </span>
    );
  }
  const improved = delta > 0;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-mono text-[10px] font-semibold',
        improved ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700',
      )}
    >
      {improved ? (
        <ArrowUp size={10} aria-hidden="true" />
      ) : (
        <ArrowDown size={10} aria-hidden="true" />
      )}
      {Math.abs(delta)}
    </span>
  );
}

export function ComparisonPage() {
  const {
    dataset,
    query,
    comparison,
    keywordWeights,
    rankingWeights,
    mode,
    setMode,
    simulationIsCurrent,
  } = useApp();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [movementMode, setMovementMode] = useState<RankingMode>('hybrid');

  const pageMap = useMemo(
    () => new Map(dataset.pages.map((page) => [page.id, page])),
    [dataset.pages],
  );
  const keywordPositions = useMemo(
    () =>
      new Map(
        comparison.resultsByMode.keyword.map((result) => [result.pageId, result.position]),
      ),
    [comparison.resultsByMode.keyword],
  );

  const selectedPage =
    (selectedId ? pageMap.get(selectedId) : undefined) ??
    (comparison.resultsByMode.hybrid[0]
      ? pageMap.get(comparison.resultsByMode.hybrid[0].pageId)
      : dataset.pages[0]);

  const matrixRows = useMemo(
    () =>
      comparison.resultsByMode.hybrid.map((hybridResult) => {
        const page = pageMap.get(hybridResult.pageId);
        return {
          pageId: hybridResult.pageId,
          title: page?.title ?? hybridResult.pageId,
          category: page?.category ?? '',
          byMode: MODES.map((item) => ({
            mode: item,
            result: comparison.resultsByMode[item].find(
              (candidate) => candidate.pageId === hybridResult.pageId,
            ),
          })),
        };
      }),
    [comparison.resultsByMode, pageMap],
  );

  const movements = useMemo(() => {
    if (movementMode === 'keyword') return [];
    return comparison.resultsByMode[movementMode]
      .map((result) => {
        const keywordRank = keywordPositions.get(result.pageId) ?? result.position;
        return {
          pageId: result.pageId,
          title: pageMap.get(result.pageId)?.title ?? result.pageId,
          keywordRank,
          targetRank: result.position,
          delta: movementBetween(keywordRank, result.position),
        };
      })
      .sort(
        (a, b) =>
          Math.abs(b.delta) - Math.abs(a.delta) ||
          b.delta - a.delta ||
          a.pageId.localeCompare(b.pageId),
      )
      .slice(0, 6);
  }, [comparison.resultsByMode, keywordPositions, movementMode, pageMap]);

  const behaviourWeight = rankingWeights.behaviourWeight ?? 0;
  const totalWeight = rankingWeights.keywordWeight + rankingWeights.pagerankWeight + behaviourWeight;
  const effective = {
    keyword: totalWeight > 0 ? rankingWeights.keywordWeight / totalWeight : 0,
    pagerank: totalWeight > 0 ? rankingWeights.pagerankWeight / totalWeight : 0,
    behaviour: totalWeight > 0 ? behaviourWeight / totalWeight : 0,
  };

  const selectedResults = selectedPage
    ? MODES.map((item) => ({
        mode: item,
        result: comparison.resultsByMode[item].find(
          (candidate) => candidate.pageId === selectedPage.id,
        ),
      }))
    : [];
  const selectedHybrid = selectedResults.find((entry) => entry.mode === 'hybrid')?.result;

  return (
    <div className="page-section">
      <div className="page-shell">
        <SectionHeading
          eyebrow={`${SCENARIO_LABELS[dataset.scenario]} · four ranking models`}
          title="Ranking comparison lab"
          description="The same corpus and query are scored by content-only ranking, iterative PageRank, the configurable hybrid, and behavioural ranking. Compare positions, score components, and rank movement side by side."
          actions={
            <>
              <Link to="/search">
                <Button variant="secondary" size="sm">
                  <Search size={14} aria-hidden="true" /> Search results
                </Button>
              </Link>
              <Link to="/graph">
                <Button variant="secondary" size="sm">
                  <Network size={14} aria-hidden="true" /> Open graph
                </Button>
              </Link>
            </>
          }
        />

        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <SearchBar />
          <p className="mt-2 text-xs text-slate-500">
            Comparing “{query || 'empty query'}” across {dataset.pages.length} pages. Configurable
            weights affect hybrid and behavioural scores only.
          </p>
        </div>

        {!simulationIsCurrent ? (
          <div className="mt-4">
            <InfoNote tone="amber">
              No current surfer telemetry is available for this dataset, query, and base ranking.
              The behavioural column is therefore computed with a behaviour component of zero. Run
              the simulator to populate it.
            </InfoNote>
          </div>
        ) : null}

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {MODES.map((item) => {
            const Icon = MODE_ICONS[item];
            const results = comparison.resultsByMode[item].slice(0, 5);
            const active = mode === item;
            return (
              <Card key={item} className={cn('flex flex-col p-4', active && 'ring-2 ring-blue-100')}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded-xl bg-slate-100 p-2 text-slate-600">
                      <Icon size={15} aria-hidden="true" />
                    </span>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">{MODE_LABELS[item]}</h2>
                      <p className="text-[10px] uppercase tracking-wide text-slate-400">
                        top five
                      </p>
                    </div>
                  </div>
                  <Badge variant={MODE_TONES[item]}>{MODE_SHORT_LABELS[item]}</Badge>
                </div>
                <p className="mt-2 min-h-[40px] text-[11px] leading-4 text-slate-500">
                  {MODE_DESCRIPTIONS[item]}
                </p>
                <ol className="mt-3 flex-1 space-y-1.5">
                  {results.map((result) => {
                    const keywordRank = keywordPositions.get(result.pageId) ?? result.position;
                    return (
                      <li key={result.pageId}>
                        <button
                          type="button"
                          onClick={() => setSelectedId(result.pageId)}
                          className={cn(
                            'flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left transition',
                            selectedPage?.id === result.pageId
                              ? 'bg-blue-50'
                              : 'hover:bg-slate-50',
                          )}
                        >
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-white font-mono text-[10px] font-bold text-slate-500 ring-1 ring-slate-200">
                            {result.position}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="line-clamp-2 block text-[11px] font-semibold leading-4 text-slate-700">
                              {pageMap.get(result.pageId)?.title ?? result.pageId}
                            </span>
                            <span className="mt-0.5 flex items-center gap-1.5">
                              <span className="font-mono text-[10px] text-slate-400">
                                {formatScore(result.finalScore)}
                              </span>
                              <MovementBadge
                                delta={movementBetween(keywordRank, result.position)}
                              />
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ol>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <Button
                    size="sm"
                    variant={active ? 'primary' : 'secondary'}
                    onClick={() => setMode(item)}
                  >
                    {active ? 'Active model' : 'Use in search'}
                  </Button>
                  <span className="text-[10px] text-slate-400">vs keyword rank</span>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 space-y-4">
            <Card className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <GitCompare size={15} className="text-blue-600" aria-hidden="true" /> Position
                    matrix
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Rows follow hybrid order. Each cell shows the model's position and final score.
                  </p>
                </div>
                <Badge variant="neutral">{dataset.pages.length} pages</Badge>
              </div>

              <div className="scrollbar-thin mt-3 overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-500">
                      <th className="px-2 py-2 font-semibold">Page</th>
                      {MODES.map((item) => (
                        <th
                          key={item}
                          className={cn(
                            'px-2 py-2 text-right font-semibold',
                            mode === item && 'text-blue-700',
                          )}
                        >
                          {MODE_SHORT_LABELS[item]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {matrixRows.map((row) => (
                      <tr
                        key={row.pageId}
                        className={cn(
                          'border-b border-slate-100 last:border-0',
                          selectedPage?.id === row.pageId && 'bg-blue-50/60',
                        )}
                      >
                        <td className="max-w-[280px] px-2 py-2">
                          <button
                            type="button"
                            onClick={() => setSelectedId(row.pageId)}
                            className="text-left"
                          >
                            <span className="line-clamp-1 font-medium text-slate-700 hover:text-blue-700">
                              {row.title}
                            </span>
                            <span className="text-[10px] text-slate-400">{row.category}</span>
                          </button>
                        </td>
                        {row.byMode.map(({ mode: item, result }) => (
                          <td
                            key={item}
                            className={cn(
                              'px-2 py-2 text-right',
                              mode === item && 'bg-blue-50/70',
                            )}
                          >
                            <span className="block font-mono font-bold text-slate-800">
                              #{result?.position ?? '—'}
                            </span>
                            <span className="block font-mono text-[10px] text-slate-400">
                              {formatScore(result?.finalScore ?? 0)}
                            </span>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Sparkles size={15} className="text-amber-500" aria-hidden="true" /> Largest rank
                  movements
                </h2>
                <div className="flex rounded-lg border border-slate-200 p-0.5">
                  {MODES.filter((item) => item !== 'keyword').map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setMovementMode(item)}
                      aria-pressed={movementMode === item}
                      className={cn(
                        'rounded-md px-2 py-1 text-[10px] font-semibold transition',
                        movementMode === item
                          ? 'bg-slate-900 text-white'
                          : 'text-slate-500 hover:text-slate-900',
                      )}
                    >
                      {MODE_SHORT_LABELS[item]}
                    </button>
                  ))}
                </div>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Change in position relative to content-only keyword ranking. Positive values moved
                up; negative values moved down.
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {movements.map((entry) => (
                  <button
                    key={entry.pageId}
                    type="button"
                    onClick={() => setSelectedId(entry.pageId)}
                    className={cn(
                      'flex items-start justify-between gap-3 rounded-xl border px-3 py-2 text-left transition',
                      selectedPage?.id === entry.pageId
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300',
                    )}
                  >
                    <span className="min-w-0">
                      <span className="line-clamp-2 block text-[11px] font-semibold leading-4 text-slate-700">
                        {entry.title}
                      </span>
                      <span className="mt-0.5 block font-mono text-[10px] text-slate-400">
                        keyword #{entry.keywordRank} → {MODE_SHORT_LABELS[movementMode]} #{entry.targetRank}
                      </span>
                    </span>
                    <MovementBadge delta={entry.delta} />
                  </button>
                ))}
              </div>
              {movements.length === 0 ? (
                <p className="mt-3 text-xs text-slate-500">No rank movements to display.</p>
              ) : null}
            </Card>

            {selectedPage ? (
              <Card className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">Selected page</h2>
                    <p className="mt-1 text-base font-bold leading-6 text-slate-950">
                      {selectedPage.title}
                    </p>
                    <p className="mt-0.5 break-all text-[11px] text-emerald-700">
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
                  </div>
                  <Link to={`/graph?page=${encodeURIComponent(selectedPage.id)}`}>
                    <Button size="sm" variant="secondary">
                      <Network size={13} aria-hidden="true" /> Inspect links
                    </Button>
                  </Link>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {selectedResults.map(({ mode: item, result }) => (
                    <div
                      key={item}
                      className={cn(
                        'rounded-xl border p-3',
                        mode === item ? 'border-blue-300 bg-blue-50/60' : 'border-slate-200',
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                          {MODE_SHORT_LABELS[item]}
                        </span>
                        <Badge variant={MODE_TONES[item]}>#{result?.position ?? '—'}</Badge>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-slate-600">
                        {result?.explanation ?? 'No result available.'}
                      </p>
                      <div className="mt-2 grid grid-cols-3 gap-1.5 text-center">
                        <div className="rounded-lg bg-white px-1.5 py-1 ring-1 ring-slate-200">
                          <p className="text-[9px] uppercase text-slate-400">keyword</p>
                          <p className="font-mono text-[11px] font-semibold text-slate-700">
                            {formatScore(result?.keywordScore ?? 0)}
                          </p>
                        </div>
                        <div className="rounded-lg bg-white px-1.5 py-1 ring-1 ring-slate-200">
                          <p className="text-[9px] uppercase text-slate-400">PageRank</p>
                          <p className="font-mono text-[11px] font-semibold text-slate-700">
                            {formatPercent(result?.normalizedPageRank ?? 0)}
                          </p>
                        </div>
                        <div className="rounded-lg bg-white px-1.5 py-1 ring-1 ring-slate-200">
                          <p className="text-[9px] uppercase text-slate-400">behaviour</p>
                          <p className="font-mono text-[11px] font-semibold text-slate-700">
                            {result?.behaviourScore === undefined
                              ? '—'
                              : formatScore(result.behaviourScore)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedHybrid ? (
                  <div className="mt-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Keyword factor breakdown
                    </h3>
                    <div className="mt-2">
                      <FactorBreakdown
                        factors={selectedHybrid.factorBreakdown}
                        weights={keywordWeights}
                        compact
                      />
                    </div>
                  </div>
                ) : null}
              </Card>
            ) : null}
          </div>

          <aside className="space-y-4">
            <RankingControls />

            <Card className="p-4">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <SlidersHorizontal size={15} className="text-blue-600" aria-hidden="true" /> Effective
                blend
              </h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Weights are divided by their sum. Keyword-only and PageRank-only models ignore this
                configuration by definition.
              </p>
              <div className="mt-3 space-y-2">
                {[
                  { label: 'Keyword', value: effective.keyword, color: 'bg-amber-500' },
                  { label: 'PageRank', value: effective.pagerank, color: 'bg-violet-600' },
                  { label: 'Behaviour', value: effective.behaviour, color: 'bg-emerald-600' },
                ].map((entry) => (
                  <div key={entry.label}>
                    <div className="flex items-center justify-between gap-2 text-[11px]">
                      <span className="font-medium text-slate-600">{entry.label}</span>
                      <span className="font-mono text-slate-500">
                        {formatPercent(entry.value)}
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={cn('h-full rounded-full', entry.color)}
                        style={{ width: `${Math.max(0, Math.min(1, entry.value)) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500">
                Behaviour applies only to the experimental model. If no current telemetry exists,
                its component contributes zero even when the weight is positive.
              </div>
            </Card>

            <Link to="/learn" className="block">
              <Card className="p-4 transition hover:border-slate-300">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <ArrowRight size={15} className="text-blue-600" aria-hidden="true" /> See the
                  equations
                </h2>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  The Learn page derives keyword scoring, PageRank, hybrid blending, and behaviour
                  scoring, using the current corpus as a worked example.
                </p>
              </Card>
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
