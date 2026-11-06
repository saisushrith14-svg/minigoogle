import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { RankingMode } from '../types';
import { useApp } from '../state/AppContext';
import { RetroLogo } from '../components/common/RetroLogo';
import { MODE_DESCRIPTIONS, MODE_LABELS, SCENARIO_LABELS, formatScore } from '../utils/format';

const CURIOUS_QUERIES: readonly { query: string; datasetId: string }[] = [
  { query: 'Stanford University computer science', datasetId: 'scientific-network' },
  { query: 'black holes', datasetId: 'scientific-network' },
  { query: 'cheap flights', datasetId: 'keyword-stuffing' },
  { query: 'cancer treatments', datasetId: 'authority-problem' },
  { query: 'sourdough starter guide', datasetId: 'new-website' },
  { query: 'online casino bonus', datasetId: 'link-farm' },
  { query: 'climate change solutions', datasetId: 'relevance-vs-popularity' },
  { query: 'The PageRank Citation Ranking: Bringing Order to the Web', datasetId: 'scientific-network' },
];

export const HOMEPAGE_EXAMPLE_SEARCHES = [
  { label: '🔭 black holes', query: 'black holes', datasetId: 'scientific-network' },
  { label: '🎓 Stanford CS', query: 'Stanford University computer science', datasetId: 'scientific-network' },
  { label: '✈️ cheap flights', query: 'cheap flights', datasetId: 'keyword-stuffing' },
  { label: '🏥 cancer treatments', query: 'cancer treatments', datasetId: 'authority-problem' },
  { label: '🥖 sourdough starter', query: 'sourdough starter guide', datasetId: 'new-website' },
  { label: '🎰 online casino', query: 'online casino bonus', datasetId: 'link-farm' },
  { label: '🌍 climate solutions', query: 'climate change solutions', datasetId: 'relevance-vs-popularity' },
] as const;

const MODES: readonly RankingMode[] = ['keyword', 'pagerank', 'hybrid', 'experimental'];

export function HomePage() {
  const {
    dataset,
    datasets,
    setDatasetId,
    switchDatasetAndQuery,
    detectDatasetForQuery,
    query,
    mode,
    setMode,
    comparison,
  } = useApp();
  const navigate = useNavigate();

  const [inputVal, setInputVal] = useState(query || 'Stanford University computer science');
  const [resultCount, setResultCount] = useState('20');
  const [email, setEmail] = useState('');
  const [subscribedMsg, setSubscribedMsg] = useState(false);

  const handleSearch = (e?: FormEvent) => {
    if (e) e.preventDefault();
    const q = inputVal.trim() || dataset.defaultQuery || 'Stanford University computer science';
    const targetDatasetId = detectDatasetForQuery(q);
    switchDatasetAndQuery(targetDatasetId, q);
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const handleFeelingCurious = () => {
    const pick = CURIOUS_QUERIES[Math.floor(Math.random() * CURIOUS_QUERIES.length)];
    setInputVal(pick.query);
    switchDatasetAndQuery(pick.datasetId, pick.query);
    navigate(`/search?q=${encodeURIComponent(pick.query)}`);
  };

  const handleQuickSearch = (targetDatasetId: string, targetQuery: string) => {
    setInputVal(targetQuery);
    switchDatasetAndQuery(targetDatasetId, targetQuery);
    navigate(`/search?q=${encodeURIComponent(targetQuery)}`);
  };

  const handleSubscribe = (e: FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribedMsg(true);
      setEmail('');
    }
  };

  const pageMap = new Map(dataset.pages.map((page) => [page.id, page]));

  return (
    <div className="w-full flex flex-col items-center font-sans text-black">
      {/* 5-SECOND RULE HERO SECTION */}
      <div className="w-full max-w-[700px] mx-auto text-center mt-2 mb-6 space-y-3">
        <RetroLogo size="xl" showTagline={false} />
        
        <h2 className="text-base sm:text-lg font-serif italic text-black font-normal">
          Discover how search engines decide what you see first.
        </h2>

        <p className="text-xs sm:text-sm text-[#444444] max-w-[560px] mx-auto leading-relaxed">
          Before Google, search engines mainly looked for matching words. Google's PageRank helped identify important pages by examining how websites linked to one another. Explore both approaches and see the difference yourself.
        </p>

        {/* Primary Call to Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to="/tour"
            className="btn-retro py-2 px-5 text-sm font-bold text-[#0000CC] bg-[#FFFBEA] border-2 border-[#0000CC] shadow-sm hover:bg-[#FFF2B2]"
          >
            Start Exploring →
          </Link>
          <button
            type="button"
            onClick={() => handleSearch()}
            className="btn-retro py-2 px-4 text-sm font-bold text-black"
          >
            Try a Search
          </button>
        </div>
      </div>

      {/* WHAT WOULD YOU LIKE TO EXPLORE? - 4 CARDS */}
      <div className="w-full max-w-[720px] mx-auto mb-8">
        <div className="text-center mb-3">
          <h2 className="text-base font-bold font-serif text-black uppercase tracking-wider">
            What would you like to explore?
          </h2>
          <p className="text-xs text-[#666666]">
            Choose a starting point below, or follow the guided tour above.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
          {/* Option 1: Try a Search */}
          <div className="p-3 bg-[#F8F9FA] border border-[#808080] flex flex-col justify-between space-y-2">
            <div>
              <div className="flex items-center space-x-1.5 mb-1">
                <span className="text-lg">🔍</span>
                <span className="font-bold text-sm text-[#0000CC] font-serif">1. Try a Search</span>
              </div>
              <p className="text-xs text-[#444444] leading-relaxed">
                Search a collection of example websites and see why certain pages appear first.
              </p>
            </div>
            <Link
              to="/search"
              className="btn-retro text-xs py-1 px-3 text-center font-bold text-[#0000CC]"
            >
              Try Searching »
            </Link>
          </div>

          {/* Option 2: Compare Old Search vs Google */}
          <div className="p-3 bg-[#F8F9FA] border border-[#808080] flex flex-col justify-between space-y-2">
            <div>
              <div className="flex items-center space-x-1.5 mb-1">
                <span className="text-lg">⚖️</span>
                <span className="font-bold text-sm text-[#0000CC] font-serif">2. Compare Old Search vs Google</span>
              </div>
              <p className="text-xs text-[#444444] leading-relaxed">
                See how keyword-based search and PageRank can rank the same websites differently.
              </p>
            </div>
            <Link
              to="/compare"
              className="btn-retro text-xs py-1 px-3 text-center font-bold text-[#0000CC]"
            >
              Compare Rankings »
            </Link>
          </div>

          {/* Option 3: Explore the Web */}
          <div className="p-3 bg-[#F8F9FA] border border-[#808080] flex flex-col justify-between space-y-2">
            <div>
              <div className="flex items-center space-x-1.5 mb-1">
                <span className="text-lg">🌐</span>
                <span className="font-bold text-sm text-[#0000CC] font-serif">3. Explore the Web</span>
              </div>
              <p className="text-xs text-[#444444] leading-relaxed">
                Discover how websites connect to each other and why links affect their importance.
              </p>
            </div>
            <Link
              to="/datasets"
              className="btn-retro text-xs py-1 px-3 text-center font-bold text-[#0000CC]"
            >
              Explore Websites »
            </Link>
          </div>

          {/* Option 4: Watch People Browse */}
          <div className="p-3 bg-[#F8F9FA] border border-[#808080] flex flex-col justify-between space-y-2">
            <div>
              <div className="flex items-center space-x-1.5 mb-1">
                <span className="text-lg">🚶</span>
                <span className="font-bold text-sm text-[#0000CC] font-serif">4. Watch People Browse</span>
              </div>
              <p className="text-xs text-[#444444] leading-relaxed">
                Simulate people searching, clicking, and navigating between websites.
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                to="/simulator"
                className="btn-retro text-xs py-1 px-2.5 text-center font-bold text-[#0000CC] flex-1"
              >
                Start Simulation »
              </Link>
              <Link
                to="/ocean"
                className="btn-retro text-xs py-1 px-2.5 text-center font-bold bg-[#EBF8FF] text-[#0000CC] border-[#3182CE]"
                title="Watch an actual human surfer physically ride waves between islands!"
              >
                🏄 Surf Ocean »
              </Link>
            </div>
          </div>
        </div>
      </div>

      <hr className="w-full max-w-[720px] border-t border-[#808080] mb-6" />

      {/* 1998 Authentic Google Main Search Component */}
      <div className="w-full max-w-[620px] mx-auto flex flex-col items-center text-center mb-6">

        {/* Vintage Search Form */}
        <form
          className="w-full flex flex-col items-center mb-3"
          id="vintage-search-form"
          onSubmit={handleSearch}
        >
          {/* Search Input Line */}
          <div className="w-full flex justify-center mb-2">
            <input
              type="text"
              aria-label="Search query"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="input-retro w-full max-w-[440px] text-base py-1"
              placeholder="Search query..."
            />
          </div>

          {/* Controls & Buttons Row */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
            <select
              className="select-retro py-0.5"
              value={resultCount}
              onChange={(e) => setResultCount(e.target.value)}
              aria-label="Result count"
            >
              <option value="10">10 results</option>
              <option value="20">20 results</option>
              <option value="50">50 results</option>
              <option value="100">100 results</option>
            </select>

            <button type="submit" className="btn-retro font-sans py-1 px-3">
              MiniGoogle Search
            </button>

            <button
              type="button"
              className="btn-retro font-sans py-1 px-3"
              onClick={handleFeelingCurious}
            >
              I'm Feeling Curious
            </button>
          </div>

          {/* Index Size Meta */}
          <p className="text-xs text-[#555555] mb-2 font-sans">
            Index contains ~25,481,209 pages (CS276 Stanford Research Prototype)
          </p>

          {/* Algorithm Mode Radio Selector */}
          <div className="p-1 bg-white text-xs text-black flex items-center justify-center space-x-3 mb-2">
            <span className="font-bold">Algorithm:</span>
            <label className="cursor-pointer inline-flex items-center space-x-1">
              <input
                type="radio"
                name="algo"
                value="pagerank"
                checked={mode === 'pagerank'}
                onChange={() => setMode('pagerank')}
                className="cursor-pointer"
              />
              <span>PageRank (1998)</span>
            </label>
            <label className="cursor-pointer inline-flex items-center space-x-1">
              <input
                type="radio"
                name="algo"
                value="keyword"
                checked={mode === 'keyword'}
                onChange={() => setMode('keyword')}
                className="cursor-pointer"
              />
              <span>Keyword Density (Pre-1998)</span>
              <span className="sr-only">Keyword (1997)</span>
            </label>
            <label className="cursor-pointer inline-flex items-center space-x-1">
              <input
                type="radio"
                name="algo"
                value="hybrid"
                checked={mode === 'hybrid'}
                onChange={() => setMode('hybrid')}
                className="cursor-pointer"
              />
              <span>Hybrid</span>
            </label>
          </div>

          {/* Quick Example Searches */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 mb-3 text-xs">
            <span className="font-bold text-[#555555]">Try searches:</span>
            {HOMEPAGE_EXAMPLE_SEARCHES.map((item) => (
              <button
                key={item.query}
                type="button"
                onClick={() => handleQuickSearch(item.datasetId, item.query)}
                className="px-2 py-0.5 bg-white border border-[#7F9DB9] hover:bg-[#E5ECF9] text-[#0000CC] cursor-pointer text-xs"
              >
                {item.label}
              </button>
            ))}
          </div>
        </form>

        {/* 1998 Feature Container: About MiniGoogle! */}
        <div
          className="w-full max-w-[500px] bg-[#EEEEEE] p-3 text-center mb-4 text-xs font-sans"
          style={{ border: '1px solid #808080' }}
        >
          <div className="font-serif text-base mb-1">
            <Link to="/learn" className="text-[#0000CC] underline font-bold">
              About MiniGoogle!
            </Link>
          </div>
          <div className="text-xs text-black mb-3 space-x-2">
            <button
              type="button"
              onClick={() => handleQuickSearch('scientific-network', 'Stanford University computer science')}
              className="text-[#0000CC] underline bg-transparent border-0 p-0 cursor-pointer text-xs"
            >
              Stanford Search
            </button>
            <span>|</span>
            <button
              type="button"
              onClick={() => handleQuickSearch('scientific-network', 'black holes')}
              className="text-[#0000CC] underline bg-transparent border-0 p-0 cursor-pointer text-xs"
            >
              Astrophysics Search
            </button>
            <span>|</span>
            <Link to="/learn" className="text-[#0000CC] underline">
              Why PageRank Works
            </Link>
          </div>

          {/* Newsletter Box */}
          <form className="flex flex-col items-center" onSubmit={handleSubscribe}>
            <label className="text-xs text-black mb-1" htmlFor="newsletter-email">
              Get MiniGoogle updates monthly!
            </label>
            <div className="flex items-center space-x-1">
              <input
                id="newsletter-email"
                type="text"
                placeholder="your e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-retro text-xs py-0.5"
              />
              <input type="submit" value="Subscribe" className="btn-retro text-xs py-0.5 px-2" />
              <Link to="/learn" className="text-[#0000CC] text-xs underline ml-1">
                Archive
              </Link>
            </div>
            {subscribedMsg && (
              <p className="text-[11px] text-[#008000] mt-1">
                Subscribed to Stanford CS Newsletter Archive!
              </p>
            )}
          </form>
        </div>

        {/* Historical Architectural Contrast Box */}
        <div
          className="w-full text-left bg-white p-3 text-xs leading-normal text-black mb-4"
          style={{ border: '1px solid #CCCCCC' }}
        >
          <div className="font-bold text-sm text-black mb-1 font-serif">
            Search Paradigm Comparison (1997 vs. 1998):
          </div>
          <p className="mb-2 text-[#444444]">
            <b className="text-black">Before Google (Pre-1998):</b> Portals ranked documents
            strictly by keyword frequency and occurrences in invisible HTML meta tags. Unscrupulous
            webmasters flooded pages with hidden keywords, rendering indices noisy and highly
            vulnerable to spam.
          </p>
          <p className="text-[#444444]">
            <b className="text-black">After Google (1998+):</b> The PageRank algorithm (Larry Page &
            Sergey Brin) converts the World Wide Web link topology into a democratic citation matrix.
            Documents are weighted by link graph eigenvector centrality, modeling the stochastic
            movement of a theoretical “random surfer.”
          </p>
        </div>
      </div>

      <hr className="w-full border-t border-[#808080] my-4" />

      {/* Educational Exploration Section */}
      <div className="w-full max-w-[760px] text-left">
        <h1 className="text-2xl font-bold font-serif text-black mb-2">
          See how search learned to rank the web.
        </h1>
        <p className="text-xs text-[#444444] leading-relaxed mb-4">
          Run queries through 1990s keyword density matching, 1998 PageRank, configurable hybrid
          ranking, and simulated surfer behaviour. Every score on this site comes from actual
          algorithms computed locally in your browser.
        </p>

        {/* Same query, four worldviews */}
        <div className="mb-6">
          <div className="flex items-center justify-between border-b border-[#808080] pb-1 mb-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0000CC]">
                Same query, four worldviews
              </span>
              <h2 className="text-base font-bold font-serif text-black">
                The ranking result changes with the model
              </h2>
            </div>
            <Link to="/compare" className="text-xs text-[#0000CC] underline">
              Full comparison lab »
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {MODES.map((item) => {
              const results = comparison.resultsByMode[item].slice(0, 3);
              return (
                <div
                  key={item}
                  className="bg-[#F8F9FA] p-3 text-xs"
                  style={{ border: '1px solid #808080' }}
                >
                  <div className="font-bold text-sm text-black mb-1">
                    {MODE_LABELS[item]}
                  </div>
                  <p className="text-[11px] text-[#555555] mb-2 leading-tight">
                    {MODE_DESCRIPTIONS[item]}
                  </p>
                  <ol className="space-y-1 mb-2 font-mono text-[11px]">
                    {results.map((r) => {
                      const p = pageMap.get(r.pageId);
                      return (
                        <li key={r.pageId} className="truncate">
                          <span className="font-bold text-[#0000CC]">#{r.position}</span>{' '}
                          <span className="text-black">{p?.title ?? r.pageId}</span>{' '}
                          <span className="text-[#808080]">({formatScore(r.finalScore)})</span>
                        </li>
                      );
                    })}
                  </ol>
                  <Link
                    to="/search"
                    onClick={() => setMode(item)}
                    className="btn-retro text-[11px] py-0.5 px-2 w-full text-center block mt-1"
                  >
                    View in search
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* Six curated scenarios */}
        <div className="mb-6">
          <div className="flex items-center justify-between border-b border-[#808080] pb-1 mb-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0000CC]">
                Six curated scenarios
              </span>
              <h2 className="text-base font-bold font-serif text-black">
                Each dataset isolates a classic failure mode
              </h2>
            </div>
            <Link to="/datasets" className="text-xs text-[#0000CC] underline">
              All datasets »
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {datasets.map((item) => {
              const active = item.id === dataset.id;
              return (
                <div
                  key={item.id}
                  className={`p-3 text-xs ${active ? 'bg-[#FFFFE0]' : 'bg-[#FFFFFF]'}`}
                  style={{ border: active ? '2px solid #0000CC' : '1px solid #808080' }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-black">{item.name.replace(/^Scenario \d+: /, '')}</span>
                    {active && (
                      <span className="text-[10px] font-bold text-[#0000CC]">[Active]</span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#555555] mb-2 leading-tight">
                    {item.description}
                  </p>
                  <div className="text-[10px] text-[#777777] mb-2">
                    <span>{item.pages.length} pages</span> ·{' '}
                    <span>{SCENARIO_LABELS[item.scenario]}</span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      className="btn-retro text-[11px] py-0.5 px-2"
                      onClick={() => {
                        setDatasetId(item.id);
                        navigate('/search');
                      }}
                    >
                      {active ? 'Open search' : 'Use dataset'}
                    </button>
                    <Link
                      to="/datasets"
                      onClick={() => setDatasetId(item.id)}
                      className="btn-retro text-[11px] py-0.5 px-2"
                    >
                      Details »
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* The complete loop */}
        <div
          className="bg-[#EEEEEE] p-3 text-xs mb-4"
          style={{ border: '1px solid #808080' }}
        >
          <div className="font-bold text-sm text-black mb-1 font-serif">
            The complete loop: Query → rank → simulate → measure → re-rank
          </div>
          <p className="text-[#444444] leading-relaxed mb-2">
            The deterministic surfer simulation records every search, click, dwell, scroll, and
            return. Analytics are derived from that event log, behaviour scores are derived from
            analytics, and behavioural ranking consumes those scores. There are no simulated metrics
            outside this loop.
          </p>
          <div className="flex space-x-2">
            <Link to="/simulator" className="btn-retro text-xs py-0.5 px-2">
              Surfer Simulator »
            </Link>
            <Link to="/analytics" className="btn-retro text-xs py-0.5 px-2">
              Behaviour Analytics »
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
