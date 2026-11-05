import { useMemo, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../state/AppContext';
import { buildGraphTopology } from '../utils/graphUtils';
import { MODE_LABELS } from '../utils/format';
import { RetroLogo } from '../components/common/RetroLogo';
import { ModeTabs } from '../components/search/ModeTabs';
import { ResultCard } from '../components/search/ResultCard';
import { RankingControls } from '../components/search/RankingControls';

export function SearchPage() {
  const {
    dataset,
    searchResponse,
    keywordWeights,
    query,
    setQuery,
    mode,
    setMode,
  } = useApp();

  const topology = useMemo(() => buildGraphTopology(dataset.pages), [dataset.pages]);
  const pageMap = useMemo(
    () => new Map(dataset.pages.map((page) => [page.id, page])),
    [dataset.pages],
  );
  const keyPageIds = useMemo(() => new Set(dataset.keyPageIds ?? []), [dataset.keyPageIds]);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="w-full flex flex-col font-sans text-black">
      {/* Top Search Query Form & Vintage Logo Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center space-x-3">
          <Link to="/" className="no-underline inline-block" title="Back to MiniGoogle Home">
            <RetroLogo size="sm" />
          </Link>

          <form onSubmit={handleSearchSubmit} className="flex items-center space-x-1">
            <label htmlFor="search-input" className="sr-only">
              Search query
            </label>
            <input
              id="search-input"
              aria-label="Search query"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input-retro text-sm py-1 w-48 sm:w-64"
            />
            <button type="submit" className="btn-retro text-xs py-1 px-3">
              Google Search
            </button>
          </form>
        </div>

        {/* Quick Meta Links */}
        <div className="text-xs text-right space-x-1 text-[#555555]">
          <Link to="/compare" className="text-[#0000CC] underline hover:text-[#CC0000]">
            Advanced Search
          </Link>
          <span className="text-[#808080]">|</span>
          <Link to="/graph" className="text-[#0000CC] underline hover:text-[#CC0000]">
            Preferences
          </Link>
          <span className="text-[#808080]">|</span>
          <Link to="/learn" className="text-[#0000CC] underline hover:text-[#CC0000]">
            Search Tips
          </Link>
        </div>
      </div>

      {/* Search Status & Vintage Ranking Algorithm Bar */}
      <div
        className="py-1 px-2 mb-3 bg-[#E5ECF9]"
        style={{ borderTop: '1px solid #7F9DB9', borderBottom: '1px solid #7F9DB9' }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
          <div>
            Searched the web for <b>{query || 'empty query'}</b>.{' '}
            <span className="text-[#555555]">
              Results 1 - {searchResponse.results.length} of {dataset.pages.length}. Search took{' '}
              <b>0.04</b> seconds.
            </span>
          </div>
          <div className="flex items-center space-x-1 whitespace-nowrap">
            <span className="text-[#555555]">Model:</span>
            <button
              type="button"
              onClick={() => setMode('pagerank')}
              className={`px-1.5 py-0.5 text-xs cursor-pointer ${
                mode === 'pagerank'
                  ? 'font-bold bg-white text-black border border-[#7F9DB9]'
                  : 'text-[#0000CC] underline hover:text-[#CC0000]'
              }`}
            >
              [ PageRank (1998) ]
            </button>
            <button
              type="button"
              onClick={() => setMode('keyword')}
              className={`px-1.5 py-0.5 text-xs cursor-pointer ${
                mode === 'keyword'
                  ? 'font-bold bg-white text-black border border-[#7F9DB9]'
                  : 'text-[#0000CC] underline hover:text-[#CC0000]'
              }`}
            >
              [ Keyword (1997) ]
            </button>
            <button
              type="button"
              onClick={() => setMode('hybrid')}
              className={`px-1.5 py-0.5 text-xs cursor-pointer ${
                mode === 'hybrid'
                  ? 'font-bold bg-white text-black border border-[#7F9DB9]'
                  : 'text-[#0000CC] underline hover:text-[#CC0000]'
              }`}
            >
              [ Hybrid ]
            </button>
            <button
              type="button"
              onClick={() => setMode('experimental')}
              className={`px-1.5 py-0.5 text-xs cursor-pointer ${
                mode === 'experimental'
                  ? 'font-bold bg-white text-black border border-[#7F9DB9]'
                  : 'text-[#0000CC] underline hover:text-[#CC0000]'
              }`}
            >
              [ Behavioural ]
            </button>
          </div>
        </div>
      </div>

      {/* Warning banner when Pre-1998 Keyword Density is active */}
      {mode === 'keyword' && (
        <div
          className="mb-3 p-2 text-xs font-mono bg-[#FFF2F2] text-[#93000A]"
          style={{ border: '1px dashed #BA1A1A' }}
        >
          ⚠️ <b>Pre-1998 Raw Keyword Density Model Engaged:</b> Spammed and repeated keyword
          documents without authoritative graph citations are artificially elevated to Top ranks.
        </div>
      )}

      {/* Algorithm Mode Tabs bar for accessible test selection */}
      <div className="mb-3 p-2 bg-[#FAFAFA]" style={{ border: '1px solid #CCCCCC' }}>
        <ModeTabs />
      </div>

      {/* Results Header Meta */}
      <div className="flex items-center justify-between text-xs mb-3 text-[#555555]">
        <div className="flex items-center space-x-2">
          <h2 className="text-xs font-bold text-black uppercase">
            {searchResponse.results.length} ranked pages
          </h2>
          <span>·</span>
          <span>{MODE_LABELS[mode]}</span>
          <span>·</span>
          {searchResponse.pageRankComputation.converged ? (
            <span className="text-[#008000] font-bold">✓ PageRank converged</span>
          ) : (
            <span className="text-[#D0A600] font-bold">PageRank at iteration cap</span>
          )}
        </div>
        <span className="font-mono text-[11px]">
          {searchResponse.pageRankComputation.iterations} iterations · Δ=
          {searchResponse.pageRankComputation.finalDelta.toExponential(1)}
        </span>
      </div>

      {/* Main Results Listing with Aside Scenario Briefing */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-6">
        <div className="space-y-4">
          {searchResponse.results.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-[#808080] text-xs text-[#555555]">
              No documents matched the query in this dataset.
            </div>
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

        {/* Aside: Controls & Scenario Briefing */}
        <aside className="space-y-4 text-xs font-sans">
          <RankingControls compact />

          <div className="p-3 bg-[#F8F9FA]" style={{ border: '1px solid #808080' }}>
            <div className="font-bold text-sm text-black mb-1 font-serif">Scenario Briefing</div>
            <p className="text-xs text-[#555555] mb-2 leading-tight">
              {dataset.educationalNotes}
            </p>
            <div className="font-bold text-[11px] uppercase tracking-wider text-[#0000CC] mb-1">
              Key Pages in this Corpus:
            </div>
            <div className="space-y-1 mb-2 font-mono text-[11px]">
              {(dataset.keyPageIds ?? []).map((pageId) => {
                const page = pageMap.get(pageId);
                if (!page) return null;
                const result = searchResponse.results.find((item) => item.pageId === pageId);
                return (
                  <div key={pageId} className="flex justify-between items-center text-black">
                    <span className="truncate max-w-[170px]">{page.title}</span>
                    <span className="font-bold text-[#0000CC]">#{result?.position ?? '—'}</span>
                  </div>
                );
              })}
            </div>
            <div className="text-[10px] text-[#777777] border-t border-[#CCCCCC] pt-1 mt-1">
              Corpus: {dataset.pages.length} pages · {topology.danglingNodes.length} dangling ·{' '}
              {Object.values(topology.outDegree).reduce((s, v) => s + v, 0)} links
            </div>
          </div>
        </aside>
      </div>

      {/* Bottom Interactive Search Box Repeat (Standard 1998 SERP pattern) */}
      <div className="mt-8 pt-4 text-center" style={{ borderTop: '1px solid #7F9DB9' }}>
        <form onSubmit={handleSearchSubmit} className="inline-flex items-center space-x-1">
          <input
            id="search-input-bottom"
            aria-label="Search query bottom"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input-retro text-sm py-1 w-64"
          />
          <button type="submit" className="btn-retro text-xs py-1 px-3">
            Google Search
          </button>
        </form>
        <div className="mt-1 text-xs text-[#555555]">
          Search within results: <input type="checkbox" className="align-middle" />
        </div>
      </div>

      {/* Authentic 1998 Multi-'o' Google Pagination */}
      <div className="my-6 text-center select-none font-serif">
        <div className="text-3xl tracking-widest inline-flex items-baseline mb-1">
          <span style={{ color: '#0000CC' }}>G</span>
          <span style={{ color: '#CC0000' }} className="font-bold">o</span>
          <span style={{ color: '#D0A600' }} className="font-bold">o</span>
          <span style={{ color: '#0000CC' }} className="font-bold">o</span>
          <span style={{ color: '#0000CC' }} className="font-bold">o</span>
          <span style={{ color: '#CC0000' }} className="font-bold">o</span>
          <span style={{ color: '#D0A600' }} className="font-bold">o</span>
          <span style={{ color: '#0000CC' }} className="font-bold">g</span>
          <span style={{ color: '#008000' }} className="font-bold">l</span>
          <span style={{ color: '#CC0000' }} className="font-bold">e</span>
        </div>
        <div className="font-sans text-xs space-x-2">
          <span className="font-bold text-black">1</span>
          <a href="#" className="text-[#0000CC] underline">2</a>
          <a href="#" className="text-[#0000CC] underline">3</a>
          <a href="#" className="text-[#0000CC] underline">4</a>
          <a href="#" className="text-[#0000CC] underline font-bold">Next &gt;&gt;</a>
        </div>
      </div>

      {/* Vintage Meta Citation Callout */}
      <div
        className="pt-2 text-center text-xs text-[#555555] space-x-2 font-sans"
        style={{ borderTop: '1px dotted #808080' }}
      >
        <Link to="/learn" className="text-[#0000CC] underline hover:text-[#CC0000]">
          Give us feedback
        </Link>
        <span className="text-[#808080]">|</span>
        <Link to="/datasets" className="text-[#0000CC] underline hover:text-[#CC0000]">
          Stanford BackRub Archive
        </Link>
        <span className="text-[#808080]">|</span>
        <Link to="/learn" className="text-[#0000CC] underline hover:text-[#CC0000]">
          PageRank Research Paper (1998)
        </Link>
        <span className="text-[#808080]">|</span>
        <span>Indexing ~24,000,000 URLs</span>
      </div>
    </div>
  );
}
