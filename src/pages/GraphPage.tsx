import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { RankingMode } from '../types';
import { useApp } from '../state/AppContext';
import { formatScore, getPageRankQuality, MODE_SHORT_LABELS, SCENARIO_LABELS } from '../utils/format';
import { buildGraphTopology, getIncomingLinks, getOutgoingLinks } from '../utils/graphUtils';
import { SearchBar } from '../components/search/SearchBar';
import { KnowledgeGraph, type LayoutMode } from '../components/graph/KnowledgeGraph';

type GraphMetric = 'keyword' | 'pagerank' | 'hybrid' | 'behaviour';

const METRICS: ReadonlyArray<{
  readonly id: GraphMetric;
  readonly label: string;
  readonly short: string;
  readonly description: string;
}> = [
  {
    id: 'keyword',
    label: 'Keyword relevance',
    short: 'Keyword',
    description: 'Content-only score from 1997 model.',
  },
  {
    id: 'pagerank',
    label: 'Normalized PageRank',
    short: 'PageRank',
    description: 'Iterative link authority scaled to the corpus.',
  },
  {
    id: 'hybrid',
    label: 'Hybrid score',
    short: 'Hybrid',
    description: 'Configured keyword and PageRank blend.',
  },
  {
    id: 'behaviour',
    label: 'Behaviour score',
    short: 'Behaviour',
    description: 'Observed surfer engagement from simulation telemetry.',
  },
];

const MODES: readonly RankingMode[] = ['keyword', 'pagerank', 'hybrid', 'experimental'];

export function GraphPage() {
  const {
    dataset,
    comparison,
    behaviourScores,
    isAdvancedMode,
  } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'graph' | 'table'>('graph');

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
        metric === 'keyword'
          ? result.keywordScore
          : metric === 'pagerank'
            ? result.normalizedPageRank
            : result.finalScore;
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

  const maxScore = useMemo(() => {
    return Math.max(...Object.values(metricScores), 0.0001);
  }, [metricScores]);

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

  const handleResetView = useCallback(() => {
    setParam({ page: null, layout: 'force', metric: 'hybrid' });
  }, [setParam]);

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

  const selectedQuality = selectedPage
    ? getPageRankQuality(selectedScore, maxScore)
    : null;

  return (
    <div className="w-full flex flex-col font-sans text-black">
      {/* Beginner Self-Explaining Banner */}
      <div className="mb-3 p-3 bg-[#F0F4FF] border border-[#7F9DB9] text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="text-base font-bold text-[#0000CC] font-serif leading-tight">
              See How Websites Connect
            </div>
            <p className="text-xs text-[#333333] mt-0.5">
              Websites link to one another. Search engines can use these connections to estimate which pages are important.
            </p>
          </div>
          <div className="text-[11px] text-[#555555] bg-white px-2 py-1 border border-[#CCCCCC] sm:max-w-xs">
            👉 <b>Instruction:</b> Click any circle to inspect a website. Follow the arrows to see which websites link to others.
          </div>
        </div>
      </div>

      {/* Page Header */}
      <div className="mb-3">
        <div className="text-[11px] font-mono text-[#0000CC] font-bold uppercase mb-0.5">
          {SCENARIO_LABELS[dataset.scenario]} · {dataset.pages.length} nodes
        </div>
        <h1 className="text-xl font-bold font-serif text-black leading-tight">
          Interactive hyperlink graph
        </h1>
        <p className="text-xs text-[#555555] italic">
          Nodes represent web documents, arrows represent directed hypertext links, and node sizes/colors
          encode ranking signals. Drag nodes, click to inspect, or observe link authority flow.
        </p>
      </div>

      <hr className="w-full border-t border-[#808080] mb-3" />

      {/* Query Bar */}
      <div className="p-2 border border-[#808080] bg-white mb-3">
        <SearchBar />
      </div>

      {/* Prominent Visual Legend Box */}
      <div className="mb-3 p-2.5 bg-[#FFFDE6] border border-[#E6DB55] text-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-bold text-black uppercase text-[11px]">Map Legend:</span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-full bg-[#0000CC]" />
              <b>Circle</b> = Website
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="font-mono text-sm font-bold text-[#666666]">→</span>
              <b>Arrow</b> = Link from one site to another
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-block w-4 h-4 rounded-full border-2 border-[#0000CC] bg-[#E5ECF9]" />
              <b>Larger circle</b> = Higher PageRank importance
            </span>
            <span className="inline-flex items-center gap-1 text-[#555555]">
              👉 <i>Click any circle to inspect</i>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetView}
              className="btn-retro text-xs py-0.5 px-2 bg-white"
            >
              ↺ Reset View
            </button>
            <div className="border-l border-[#D0D0D0] pl-2 flex items-center space-x-1">
              <span className="text-[11px] text-[#555555]">View:</span>
              <button
                type="button"
                onClick={() => setViewMode('graph')}
                className={`btn-retro text-xs py-0.5 px-2 ${viewMode === 'graph' ? 'font-bold bg-white text-[#0000CC]' : ''}`}
              >
                Graph
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`btn-retro text-xs py-0.5 px-2 ${viewMode === 'table' ? 'font-bold bg-white text-[#0000CC]' : ''}`}
              >
                Table
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Bar: Metric selection and Layout mode */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-[#EFEFEF] border border-[#808080] mb-3 text-xs">
        <div className="flex items-center space-x-1" role="group" aria-label="Graph colour metric">
          <span className="font-bold text-black mr-1">Signal Metric:</span>
          {METRICS.map((item) => {
            const active = metric === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setParam({ metric: item.id })}
                aria-pressed={active}
                className={`btn-retro text-xs py-0.5 px-2 ${
                  active ? 'font-bold bg-white text-[#0000CC]' : ''
                }`}
              >
                {item.short}
              </button>
            );
          })}
        </div>

        {viewMode === 'graph' && (
          <div className="flex items-center space-x-1">
            <span className="font-bold text-black mr-1">Layout:</span>
            {(['force', 'circular'] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setParam({ layout: item })}
                aria-pressed={layout === item}
                className={`btn-retro text-xs py-0.5 px-2 ${
                  layout === item ? 'font-bold bg-white text-[#0000CC]' : ''
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main View: Graph or Accessible Table + Inspector Column */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        {viewMode === 'graph' ? (
          <div>
            <KnowledgeGraph
              pages={dataset.pages}
              scores={metricScores}
              selectedId={selectedId}
              metric={metric}
              metricLabel={metricInfo.short}
              layout={layout}
              onSelectPage={handleSelect}
              keyPageIds={dataset.keyPageIds}
            />
            <div className="text-[11px] text-[#555555] bg-[#F8F9FA] p-2 border border-t-0 border-[#808080] flex justify-between font-mono">
              <span>Graph: {dataset.pages.length} nodes · {topology.danglingNodes.length} dangling</span>
              <span>Click any node to inspect details</span>
            </div>
          </div>
        ) : (
          /* Accessible Table View */
          <div className="overflow-x-auto border border-[#808080] bg-white p-2">
            <div className="text-xs font-bold text-black mb-2">Websites in this network ({dataset.pages.length}):</div>
            <table className="table-retro text-xs w-full">
              <thead>
                <tr className="bg-[#EFEFEF]">
                  <th className="p-1.5 border border-[#808080] text-left">Website</th>
                  <th className="p-1.5 border border-[#808080] text-center">Inlinks (Votes)</th>
                  <th className="p-1.5 border border-[#808080] text-center">Outlinks</th>
                  <th className="p-1.5 border border-[#808080] text-left">Importance</th>
                  {isAdvancedMode && <th className="p-1.5 border border-[#808080] text-right">Score</th>}
                  <th className="p-1.5 border border-[#808080] text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {rankedPages.map(({ page, score }) => {
                  const inCount = topology.inDegree[page.id] ?? 0;
                  const outCount = topology.outDegree[page.id] ?? 0;
                  const q = getPageRankQuality(score, maxScore);
                  const isSel = page.id === selectedId;
                  return (
                    <tr key={page.id} className={isSel ? 'bg-[#E5ECF9]' : ''}>
                      <td className="p-1.5 border border-[#808080]">
                        <div className="font-bold text-[#0000CC]">{page.title}</div>
                        <div className="font-mono text-[10px] text-[#008000] truncate max-w-[200px]">{page.url}</div>
                      </td>
                      <td className="p-1.5 border border-[#808080] text-center font-bold font-mono">
                        {inCount}
                      </td>
                      <td className="p-1.5 border border-[#808080] text-center font-mono">
                        {outCount}
                      </td>
                      <td className="p-1.5 border border-[#808080]">
                        <span
                          className="px-1.5 py-0.5 text-[10px] font-bold"
                          style={{ backgroundColor: q.badgeColor, color: q.textColor }}
                        >
                          {q.label}
                        </span>
                      </td>
                      {isAdvancedMode && (
                        <td className="p-1.5 border border-[#808080] text-right font-mono">
                          {formatScore(score)}
                        </td>
                      )}
                      <td className="p-1.5 border border-[#808080] text-center">
                        <button
                          type="button"
                          onClick={() => handleSelect(page.id)}
                          className="btn-retro text-[10px] py-0.5 px-1.5"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Page Inspector Panel (matches test) */}
        <aside className="space-y-3 font-sans text-xs">
          <div className="p-3 bg-white border border-[#808080]">
            <div className="font-bold text-sm text-black font-serif mb-1 border-b border-[#CCCCCC] pb-1">
              Page inspector
            </div>

            {selectedPage ? (
              <div>
                <h3 className="font-bold text-xs text-[#0000CC] font-serif mb-0.5">
                  {selectedPage.title}
                </h3>
                <div className="font-mono text-[11px] text-[#008000] break-all mb-2">
                  {selectedPage.url}
                </div>

                {/* Qualitative Plain-English Assessment */}
                {selectedQuality && (
                  <div className="mb-2 p-2 bg-[#F8F9FA] border border-[#CCCCCC]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-black">Website Importance:</span>
                      <span
                        className="px-1.5 py-0.5 text-[10px] font-bold"
                        style={{ backgroundColor: selectedQuality.badgeColor, color: selectedQuality.textColor }}
                      >
                        {selectedQuality.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#444444] leading-tight">
                      {incoming.length > 0
                        ? `This website receives ${incoming.length} incoming link${incoming.length > 1 ? 's' : ''} from other pages, acting as recommendations that boost its standing.`
                        : `This website receives 0 incoming links. Its importance comes entirely from the baseline probability of visitors typing the address directly.`}
                    </p>
                  </div>
                )}

                <div className="bg-[#F8F9FA] p-2 border border-[#CCCCCC] mb-2 font-mono text-[11px]">
                  <div>Metric: <b>{metricInfo.short}</b></div>
                  <div>Rank: <b>#{selectedRank}</b> of {dataset.pages.length}</div>
                  {isAdvancedMode && <div>Score: <b>{formatScore(selectedScore)}</b></div>}
                </div>

                {/* Rank in each model (matches test) */}
                <div className="mb-2">
                  <div className="font-bold text-black mb-1">Rank in each model:</div>
                  <table className="table-retro text-[11px] w-full">
                    <thead>
                      <tr className="bg-[#EFEFEF]">
                        <th className="p-1 border border-[#808080] text-left">Model</th>
                        <th className="p-1 border border-[#808080] text-right">Pos</th>
                        <th className="p-1 border border-[#808080] text-right">Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modePositions.map(({ mode: m, result }) => (
                        <tr key={m}>
                          <td className="p-1 border border-[#808080]">{MODE_SHORT_LABELS[m]}</td>
                          <td className="p-1 border border-[#808080] text-right font-mono font-bold text-[#0000CC]">
                            #{result?.position ?? '—'}
                          </td>
                          <td className="p-1 border border-[#808080] text-right font-mono">
                            {formatScore(result?.finalScore ?? 0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Hyperlinks: Incoming & Outgoing */}
                <div className="space-y-2 mt-3 pt-2 border-t border-[#CCCCCC]">
                  <div>
                    <div className="font-bold text-black mb-0.5">
                      Incoming Citations ({incoming.length}):
                    </div>
                    <div className="text-[10px] text-[#555555] mb-1">
                      Websites recommending this page:
                    </div>
                    {incoming.length > 0 ? (
                      <ul className="space-y-0.5 font-mono text-[10px] max-h-24 overflow-y-auto">
                        {incoming.map((srcId) => {
                          const p = pageMap.get(srcId);
                          return (
                            <li key={srcId}>
                              <button
                                type="button"
                                onClick={() => handleSelect(srcId)}
                                className="text-[#0000CC] underline truncate block text-left"
                              >
                                ← {p?.title ?? srcId}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <span className="text-[#808080] italic">No incoming citations.</span>
                    )}
                  </div>

                  <div>
                    <div className="font-bold text-black mb-0.5">
                      Outgoing Links ({outgoing.length}):
                    </div>
                    <div className="text-[10px] text-[#555555] mb-1">
                      Websites this page links to:
                    </div>
                    {outgoing.length > 0 ? (
                      <ul className="space-y-0.5 font-mono text-[10px] max-h-24 overflow-y-auto">
                        {outgoing.map((destId) => {
                          const p = pageMap.get(destId);
                          return (
                            <li key={destId}>
                              <button
                                type="button"
                                onClick={() => handleSelect(destId)}
                                className="text-[#0000CC] underline truncate block text-left"
                              >
                                → {p?.title ?? destId}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <span className="text-[#808080] italic">Dangling node (0 outlinks).</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-[#777777] italic">
                Select any node on the graph canvas or table to inspect its link topology and cross-model scores.
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
