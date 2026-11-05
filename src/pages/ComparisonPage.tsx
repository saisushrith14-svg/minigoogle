import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { RankingMode } from '../types';
import { useApp } from '../state/AppContext';
import { formatPercent, formatScore, MODE_DESCRIPTIONS, MODE_LABELS, MODE_SHORT_LABELS } from '../utils/format';
import { SearchBar } from '../components/search/SearchBar';
import { FactorBreakdown } from '../components/search/FactorBreakdown';

const MODES: readonly RankingMode[] = ['keyword', 'pagerank', 'hybrid', 'experimental'];

function movementBetween(keywordRank: number, targetRank: number): number {
  return keywordRank - targetRank;
}

export function ComparisonPage() {
  const {
    dataset,
    comparison,
    keywordWeights,
    rankingWeights,
    setHybridSplit,
    mode,
    setMode,
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

  const selectedResults = selectedPage
    ? MODES.map((item) => ({
        mode: item,
        result: comparison.resultsByMode[item].find(
          (candidate) => candidate.pageId === selectedPage.id,
        ),
      }))
    : [];
  const selectedHybrid = selectedResults.find((entry) => entry.mode === 'hybrid')?.result;

  const currentKeywordShare =
    rankingWeights.keywordWeight /
    Math.max(0.0001, rankingWeights.keywordWeight + rankingWeights.pagerankWeight);

  const applyPreset = (kwShare: number) => {
    setHybridSplit(kwShare);
  };

  return (
    <div className="w-full flex flex-col font-sans text-black">
      {/* Document Header */}
      <div className="mb-3">
        <h1 className="text-xl font-bold font-serif text-black mb-1 leading-tight">
          Ranking comparison lab: Keyword Relevance vs Link Authority
        </h1>
        <p className="text-xs text-[#555555] italic">
          Empirical analysis of search result reordering under varying damping factors and link graph structures.
        </p>
      </div>

      <hr className="w-full border-t border-[#808080] mb-3" />

      {/* Formula & Theory Reference */}
      <div className="bg-[#F8F9FA] p-3 border border-[#808080] mb-3 text-xs">
        <div className="font-bold text-[11px] uppercase tracking-wider mb-1 text-black">
          Formula [Mathematical Formulation of the Hybrid Model]:
        </div>
        <pre className="font-mono text-xs bg-white p-2 border border-[#CCCCCC] text-black overflow-x-auto">
          S(p) = (1 - α) · Score_TFIDF(p) + α · PR(p)
        </pre>
        <div className="text-[11px] text-[#555555] mt-1">
          Where: <span className="font-mono">α ∈ [0.00, 1.00]</span> represents the link topology
          authority weighting coefficient. Default academic damping factor:{' '}
          <span className="font-mono">d = 0.85</span>.
        </div>
      </div>

      {/* Interactive Controls Section */}
      <div className="mb-4">
        <table className="table-retro text-xs w-full">
          <tbody>
            <tr>
              <td className="font-bold bg-[#EFEFEF] w-1/3" style={{ border: '1px solid #808080' }}>
                Weighting Slider (α)
              </td>
              <td style={{ border: '1px solid #808080' }}>
                <div className="flex flex-col space-y-1">
                  <div className="flex justify-between font-mono text-[11px] text-[#555555]">
                    <span>[ 0.0: Pure TF-IDF ]</span>
                    <span>[ 0.5: Hybrid ]</span>
                    <span>[ 1.0: Pure PageRank ]</span>
                  </div>
                  <label htmlFor="hybrid-slider" className="sr-only">
                    Keyword ↔ PageRank balance
                  </label>
                  <input
                    id="hybrid-slider"
                    aria-label="Keyword ↔ PageRank balance"
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={currentKeywordShare}
                    onChange={(e) => setHybridSplit(parseFloat(e.target.value))}
                    className="w-full cursor-pointer accent-[#0000CC]"
                  />
                  <div className="font-mono text-xs font-bold text-[#0000CC]">
                    Current Mixing Ratio: {formatPercent(currentKeywordShare)} keyword /{' '}
                    {formatPercent(1 - currentKeywordShare)} PageRank
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td className="font-bold bg-[#EFEFEF]" style={{ border: '1px solid #808080' }}>
                Experimental Presets
              </td>
              <td style={{ border: '1px solid #808080' }}>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => applyPreset(1.0)}
                    className="btn-retro text-xs py-0.5 px-2"
                  >
                    Pre-1998 Baseline (Pure TF-IDF)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset(0.5)}
                    className="btn-retro text-xs py-0.5 px-2"
                  >
                    1998 Stanford Hybrid (Default)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset(0.0)}
                    className="btn-retro text-xs py-0.5 px-2"
                  >
                    1998 Google Standard (Pure PageRank)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      applyPreset(1.0);
                      alert(
                        'ALERT: Pre-1998 TF-IDF baseline active (pure keyword). Notice how documents with inflated repetitions rank #1!',
                      );
                    }}
                    className="btn-retro text-xs py-0.5 px-2 text-[#BC0000] font-bold"
                  >
                    Stress Test: Extreme Spam Attack
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Query Bar */}
      <div className="p-2 border border-[#808080] bg-[#FFFFFF] mb-4">
        <SearchBar />
      </div>

      {/* Four Model Top 5 Columns (matches test headings) */}
      <div className="mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {MODES.map((item) => {
            const results = comparison.resultsByMode[item].slice(0, 5);
            const active = mode === item;
            return (
              <div
                key={item}
                className="p-2.5 bg-[#FFFFFF] text-xs flex flex-col justify-between"
                style={{
                  border: active ? '2px solid #0000CC' : '1px solid #808080',
                  backgroundColor: active ? '#FFFFF8' : '#FFFFFF',
                }}
              >
                <div>
                  <div className="flex justify-between items-baseline mb-1 border-b border-[#CCCCCC] pb-1">
                    <h2 className="font-bold text-xs text-black font-sans">
                      {MODE_LABELS[item]}
                    </h2>
                    <span className="font-mono text-[10px] text-[#777777]">
                      [{MODE_SHORT_LABELS[item]}]
                    </span>
                  </div>
                  <p className="text-[11px] text-[#555555] mb-2 leading-tight">
                    {MODE_DESCRIPTIONS[item]}
                  </p>
                  <ol className="space-y-1 font-mono text-[11px]">
                    {results.map((r) => {
                      const p = pageMap.get(r.pageId);
                      const isSelected = selectedPage?.id === r.pageId;
                      return (
                        <li key={r.pageId}>
                          <button
                            type="button"
                            onClick={() => setSelectedId(r.pageId)}
                            className={`w-full text-left truncate flex items-center space-x-1 p-0.5 ${
                              isSelected ? 'bg-[#E5ECF9] font-bold text-[#0000CC]' : 'hover:bg-[#F0F0F0]'
                            }`}
                          >
                            <span className="text-[#0000CC]">#{r.position}</span>
                            <span className="truncate flex-1 text-black">
                              {p?.title ?? r.pageId}
                            </span>
                            <span className="text-[#808080]">({formatScore(r.finalScore)})</span>
                          </button>
                        </li>
                      );
                    })}
                  </ol>
                </div>
                <div className="mt-2 pt-2 border-t border-[#EEEEEE]">
                  <button
                    type="button"
                    onClick={() => setMode(item)}
                    className="btn-retro text-[11px] py-0.5 px-2 w-full"
                  >
                    {active ? 'Active in Search' : 'Select Model'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Position Matrix Section (matches test) */}
      <div className="mb-4 p-3 bg-white border border-[#808080] text-xs">
        <div className="flex justify-between items-baseline mb-2">
          <h2 className="font-bold text-sm text-black font-serif">Position matrix</h2>
          <span className="text-[#777777] font-mono text-[11px]">{dataset.pages.length} pages</span>
        </div>
        <p className="text-[11px] text-[#555555] mb-2">
          Rows follow current hybrid ordering. Each cell displays the model position and calculated score.
        </p>
        <div className="overflow-x-auto">
          <table className="table-retro text-xs w-full">
            <thead>
              <tr className="bg-[#EFEFEF] text-black">
                <th className="p-1 border border-[#808080] text-left">Page</th>
                {MODES.map((item) => (
                  <th key={item} className="p-1 border border-[#808080] text-right">
                    {MODE_SHORT_LABELS[item]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrixRows.map((row) => (
                <tr
                  key={row.pageId}
                  className={`hover:bg-[#F8F9FA] ${
                    selectedPage?.id === row.pageId ? 'bg-[#FFFFE0]' : ''
                  }`}
                >
                  <td className="p-1 border border-[#808080]">
                    <button
                      type="button"
                      onClick={() => setSelectedId(row.pageId)}
                      className="text-left text-[#0000CC] underline hover:text-[#CC0000]"
                    >
                      {row.title}
                    </button>
                    <span className="text-[10px] text-[#777777] ml-1">({row.category})</span>
                  </td>
                  {row.byMode.map(({ mode: m, result }) => (
                    <td key={m} className="p-1 border border-[#808080] text-right font-mono">
                      <b>#{result?.position ?? '—'}</b>{' '}
                      <span className="text-[#808080]">
                        ({formatScore(result?.finalScore ?? 0)})
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Largest Rank Movements Section (matches test) */}
      <div className="mb-4 p-3 bg-white border border-[#808080] text-xs">
        <div className="flex justify-between items-baseline mb-2">
          <h2 className="font-bold text-sm text-black font-serif">Largest rank movements</h2>
          <div className="space-x-1 font-mono text-[11px]">
            {MODES.filter((m) => m !== 'keyword').map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMovementMode(m)}
                className={`btn-retro text-[10px] py-0.5 px-2 ${
                  movementMode === m ? 'font-bold bg-white text-[#0000CC]' : ''
                }`}
              >
                {MODE_SHORT_LABELS[m]}
              </button>
            ))}
          </div>
        </div>
        <p className="text-[11px] text-[#555555] mb-2">
          Rank movement relative to pre-1998 keyword baseline. Positive values gained rank; negative lost rank.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {movements.map((entry) => (
            <button
              key={entry.pageId}
              type="button"
              onClick={() => setSelectedId(entry.pageId)}
              className="text-left p-2 border border-[#808080] bg-[#FAFAFA] hover:bg-[#F0F0F0]"
            >
              <div className="font-bold text-black truncate">{entry.title}</div>
              <div className="font-mono text-[10px] text-[#555555] mt-1 flex justify-between">
                <span>Keyword #{entry.keywordRank} → {MODE_SHORT_LABELS[movementMode]} #{entry.targetRank}</span>
                <span className={entry.delta > 0 ? 'text-[#008000] font-bold' : entry.delta < 0 ? 'text-[#BC0000] font-bold' : ''}>
                  {entry.delta > 0 ? `▲ +${entry.delta}` : entry.delta < 0 ? `▼ ${entry.delta}` : '='}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Page Deep-Dive (matches test button search and selected page inspect) */}
      {selectedPage && (
        <div className="mb-4 p-3 bg-[#F8F9FA] border border-[#808080] text-xs">
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="font-bold text-[11px] uppercase tracking-wider text-[#0000CC]">
                Selected page
              </div>
              <h2 className="text-base font-bold font-serif text-black">{selectedPage.title}</h2>
              <div className="font-mono text-[11px] text-[#008000]">{selectedPage.url}</div>
            </div>
            <Link
              to={`/graph?page=${encodeURIComponent(selectedPage.id)}`}
              className="btn-retro text-xs py-0.5 px-2"
            >
              Inspect in graph »
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-2">
            {selectedResults.map(({ mode: m, result }) => (
              <div key={m} className="p-2 border border-[#CCCCCC] bg-white text-xs">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="font-bold text-black">{MODE_LABELS[m]}</span>
                  <span className="font-mono font-bold text-[#0000CC]">#{result?.position ?? '—'}</span>
                </div>
                <p className="text-[11px] text-[#444444] leading-normal mb-1">
                  {result?.explanation ?? 'No score available.'}
                </p>
                <div className="font-mono text-[10px] text-[#666666] flex justify-between border-t border-[#EEEEEE] pt-1">
                  <span>KW: {formatScore(result?.keywordScore ?? 0)}</span>
                  <span>PR: {formatPercent(result?.normalizedPageRank ?? 0)}</span>
                  <span>Final: {formatScore(result?.finalScore ?? 0)}</span>
                </div>
              </div>
            ))}
          </div>

          {selectedHybrid && (
            <div className="mt-2 pt-2 border-t border-[#CCCCCC]">
              <div className="font-bold text-xs text-black mb-1">Keyword Component Breakdown:</div>
              <FactorBreakdown
                factors={selectedHybrid.factorBreakdown}
                weights={keywordWeights}
                compact
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
