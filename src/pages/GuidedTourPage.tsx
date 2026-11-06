import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../state/AppContext';
import { RetroLogo } from '../components/common/RetroLogo';

export function GuidedTourPage() {
  const navigate = useNavigate();
  const { setMode, setDatasetId, switchDatasetAndQuery, detectDatasetForQuery } = useApp();

  const [step, setStep] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('minigoogle_tour_step');
      return saved ? Math.min(5, Math.max(1, parseInt(saved, 10))) : 1;
    } catch {
      return 1;
    }
  });

  const [tourQuery, setTourQuery] = useState('black holes');

  useEffect(() => {
    try {
      localStorage.setItem('minigoogle_tour_step', String(step));
    } catch {
      // ignore
    }
  }, [step]);

  const restartTour = () => setStep(1);
  const skipTour = () => navigate('/search');

  const goToStep = (s: number) => setStep(Math.max(1, Math.min(5, s)));

  return (
    <div className="w-full flex flex-col font-sans text-black max-w-[760px] mx-auto py-2">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#808080] pb-2 mb-4 gap-2">
        <div className="flex items-center space-x-2">
          <RetroLogo size="sm" />
          <span className="font-serif font-bold text-base text-black">
            Guided Learning Journey: How Does a Search Engine Work?
          </span>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <button
            type="button"
            onClick={restartTour}
            className="text-[#555555] hover:text-black underline"
          >
            Restart Tour
          </button>
          <span className="text-[#808080]">|</span>
          <button
            type="button"
            onClick={skipTour}
            className="text-[#0000CC] font-bold underline"
          >
            Skip to Search »
          </button>
        </div>
      </div>

      {/* Progress Steps Indicator */}
      <div className="bg-[#F8F9FA] border border-[#808080] p-2 mb-4 text-xs flex justify-between items-center overflow-x-auto">
        {[
          { num: 1, title: '1. Search' },
          { num: 2, title: '2. Old Keyword Search' },
          { num: 3, title: '3. Google PageRank' },
          { num: 4, title: '4. Compare Both' },
          { num: 5, title: '5. Experiment' },
        ].map((item) => {
          const isActive = step === item.num;
          const isDone = step > item.num;
          return (
            <button
              key={item.num}
              type="button"
              onClick={() => goToStep(item.num)}
              className={`px-2 py-1 text-center font-bold ${
                isActive
                  ? 'bg-[#0000CC] text-white'
                  : isDone
                    ? 'text-[#008000] underline'
                    : 'text-[#808080]'
              }`}
            >
              {isDone ? `✓ ${item.title}` : item.title}
            </button>
          );
        })}
      </div>

      {/* STEP 1: Search for Something */}
      {step === 1 && (
        <div className="border border-[#808080] p-4 bg-white space-y-4">
          <div className="space-y-1">
            <span className="text-[11px] font-mono uppercase text-[#0000CC] font-bold">
              Step 1 of 5: The Challenge
            </span>
            <h1 className="text-xl font-bold font-serif text-black">
              Imagine you are searching for information about space.
            </h1>
            <p className="text-sm text-[#444444] leading-relaxed">
              Every day, billions of webpages compete for attention. When you type a query, a search engine has to decide which webpages to show first, and in what order.
            </p>
          </div>

          <div className="p-3 bg-[#FFFFF0] border border-[#D0A600] space-y-2 text-xs">
            <div className="font-bold text-black">What should we search for?</div>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={tourQuery}
                onChange={(e) => setTourQuery(e.target.value)}
                className="input-retro text-sm py-1 px-2 w-64"
                placeholder="e.g. black holes"
              />
              <span className="text-[#555555]">or try sample:</span>
              <button
                type="button"
                onClick={() => setTourQuery('black holes')}
                className="btn-retro text-xs py-0.5 px-2"
              >
                “black holes”
              </button>
              <button
                type="button"
                onClick={() => setTourQuery('cheap flights')}
                className="btn-retro text-xs py-0.5 px-2"
              >
                “cheap flights”
              </button>
            </div>
            <div className="text-[11px] text-[#555555]">
              Notice: A human knows that an astrophysics paper from NASA is more trustworthy than an ad-filled doorway site, but how does an automated algorithm know that?
            </div>
          </div>

          <div className="pt-2 flex justify-between items-center border-t border-[#CCCCCC]">
            <Link to="/" className="text-xs text-[#0000CC] underline">
              « Back to Home
            </Link>
            <button
              type="button"
              onClick={() => {
                const targetDatasetId = detectDatasetForQuery(tourQuery);
                switchDatasetAndQuery(targetDatasetId, tourQuery);
                setMode('keyword');
                setStep(2);
              }}
              className="btn-retro py-1 px-4 font-bold text-sm text-[#0000CC]"
            >
              Search Example Websites →
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: How Did Old Search Engines Rank Pages? */}
      {step === 2 && (
        <div className="border border-[#808080] p-4 bg-white space-y-4">
          <div className="space-y-1">
            <span className="text-[11px] font-mono uppercase text-[#0000CC] font-bold">
              Step 2 of 5: The Pre-1998 World
            </span>
            <h1 className="text-xl font-bold font-serif text-black">
              How did early search engines rank pages?
            </h1>
            <p className="text-sm text-[#444444] leading-relaxed">
              Early search engines (like AltaVista and Lycos in 1995–1997) mainly looked at the words written on each webpage. They counted how many times your search words appeared.
            </p>
          </div>

          <div className="p-3 bg-[#FFF0F0] border border-[#CC0000] space-y-2 text-xs">
            <div className="font-bold text-[#CC0000] text-sm">The Vulnerability: Keyword Stuffing</div>
            <p className="text-black leading-relaxed">
              If an unscrupulous author created a low-quality webpage and repeated the phrase{' '}
              <b className="bg-[#FFFFD0] px-1 font-mono">{tourQuery}</b> 100 times in invisible white text, early search engines thought: <i>“This page must be 100 times more relevant!”</i>
            </p>
            <div className="border border-[#CC0000] p-2 bg-white font-mono text-[11px]">
              <div className="font-bold text-[#0000CC] underline">
                {tourQuery.toLowerCase().includes('hole')
                  ? '[Rank #1 by Old Search] Free Black Holes Pictures & Black Holes Secrets!'
                  : `[Rank #1 by Old Search] Super Discount Deals: ${tourQuery} ${tourQuery} ${tourQuery}!`}
              </div>
              <div className="text-[#008000]">
                {tourQuery.toLowerCase().includes('hole')
                  ? 'https://www.black-holes-space-secrets-free.xyz/black-holes'
                  : 'http://www.cheap-junk-spammer.xyz/deals.html'}
              </div>
              <div className="text-black mt-1">
                {tourQuery.toLowerCase().includes('hole')
                  ? '“Black holes black holes black holes! Are you looking for black holes? We have black holes, super black holes, dark black holes…”'
                  : `“${tourQuery} ${tourQuery} ${tourQuery}. We offer the best ${tourQuery} for ${tourQuery} lovers…”`}
              </div>
              <div className="mt-1 text-[10px] text-[#CC0000] font-bold">
                Why this ranked #1: High word count, zero authority.
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-between items-center border-t border-[#CCCCCC]">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="btn-retro py-1 px-3 text-xs"
            >
              « Back to Step 1
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('pagerank');
                setStep(3);
              }}
              className="btn-retro py-1 px-4 font-bold text-sm text-[#0000CC]"
            >
              See What Google Changed →
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: How PageRank Changed Things */}
      {step === 3 && (
        <div className="border border-[#808080] p-4 bg-white space-y-4">
          <div className="space-y-1">
            <span className="text-[11px] font-mono uppercase text-[#0000CC] font-bold">
              Step 3 of 5: The Breakthrough
            </span>
            <h1 className="text-xl font-bold font-serif text-black">
              Google introduced PageRank: Links as Recommendations
            </h1>
            <p className="text-sm text-[#444444] leading-relaxed">
              In 1998 at Stanford University, Larry Page and Sergey Brin realized: <b>A link from Website A to Website B is like a vote of confidence.</b>
            </p>
          </div>

          {/* Simple Visual Graph Illustration */}
          <div className="p-4 bg-[#F8F9FA] border border-[#808080] space-y-3">
            <div className="font-bold text-xs text-black uppercase tracking-wider">
              Visual Demonstration: A Web of Four Websites
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2 bg-white border border-[#CCCCCC]">
                <div className="font-bold text-black">Website A</div>
                <div className="text-[10px] text-[#777777]">Personal Blog</div>
                <div className="text-xs text-[#0000CC] mt-1 font-bold">Links to C →</div>
              </div>
              <div className="p-2 bg-white border border-[#CCCCCC]">
                <div className="font-bold text-black">Website B</div>
                <div className="text-[10px] text-[#777777]">University Portal</div>
                <div className="text-xs text-[#0000CC] mt-1 font-bold">Links to C →</div>
              </div>
              <div className="p-2 bg-[#E8F0FE] border-2 border-[#0000CC] font-bold">
                <div className="text-sm text-[#0000CC]">★ Website C</div>
                <div className="text-[10px] text-[#008000]">Authoritative Guide</div>
                <div className="text-[11px] text-[#0000CC] mt-1 font-bold">
                  Receives 3 Inbound Links!
                </div>
              </div>
              <div className="p-2 bg-white border border-[#CCCCCC]">
                <div className="font-bold text-black">Website D</div>
                <div className="text-[10px] text-[#777777]">News Gazette</div>
                <div className="text-xs text-[#0000CC] mt-1 font-bold">Links to C →</div>
              </div>
            </div>
            <div className="p-2 bg-white border border-[#808080] text-xs space-y-1">
              <div><b>Key insight:</b> Anyone can write anything on their own page, but they cannot force reputable websites to link to them!</div>
              <div className="text-[#008000] font-bold">
                Result: Website C earns the highest PageRank score because trustworthy peers vouch for it.
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-between items-center border-t border-[#CCCCCC]">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="btn-retro py-1 px-3 text-xs"
            >
              « Back to Step 2
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('hybrid');
                setStep(4);
              }}
              className="btn-retro py-1 px-4 font-bold text-sm text-[#0000CC]"
            >
              Compare Both Methods →
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Compare the Rankings */}
      {step === 4 && (
        <div className="border border-[#808080] p-4 bg-white space-y-4">
          <div className="space-y-1">
            <span className="text-[11px] font-mono uppercase text-[#0000CC] font-bold">
              Step 4 of 5: The Showdown
            </span>
            <h1 className="text-xl font-bold font-serif text-black">
              Compare the two search paradigms side by side
            </h1>
            <p className="text-sm text-[#444444] leading-relaxed">
              Watch what happens to the same search results when we switch from pure word counting to Google's link-based PageRank.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Old Search Column */}
            <div className="border border-[#808080] p-3 bg-white">
              <div className="font-bold text-sm text-[#CC0000] mb-1">
                Old Search (Pre-1998)
              </div>
              <div className="text-[11px] text-[#555555] mb-2">
                Scores pages strictly by matching words.
              </div>
              <div className="space-y-2">
                <div className="p-2 bg-[#FFF0F0] border border-[#CC0000]">
                  <div className="font-bold text-black">
                    1. {tourQuery.toLowerCase().includes('hole') ? 'Free Black Holes Pictures Spam' : 'Discount Spammer Portal'}
                  </div>
                  <div className="text-[10px] text-[#555555]">
                    {tourQuery.toLowerCase().includes('hole') ? 'Repeated “black holes” 24 times.' : 'Repeated words 45 times.'}
                  </div>
                </div>
                <div className="p-2 bg-white border border-[#CCCCCC]">
                  <div className="font-bold text-black">
                    2. {tourQuery.toLowerCase().includes('hole') ? 'NASA Astrophysics Archive (HEASARC)' : 'Authentic Travel Guide'}
                  </div>
                  <div className="text-[10px] text-[#555555]">
                    {tourQuery.toLowerCase().includes('hole') ? 'Chandra X-Ray & Hubble observational data.' : 'High quality editorial prose.'}
                  </div>
                </div>
                <div className="p-2 bg-white border border-[#CCCCCC]">
                  <div className="font-bold text-black">
                    3. {tourQuery.toLowerCase().includes('hole') ? 'Cambridge DAMTP Theoretical Physics' : 'Official Airline Hub'}
                  </div>
                  <div className="text-[10px] text-[#555555]">
                    {tourQuery.toLowerCase().includes('hole') ? 'Stephen Hawking black hole thermodynamics.' : 'Official flight booking portal.'}
                  </div>
                </div>
              </div>
            </div>

            {/* Google PageRank Column */}
            <div className="border-2 border-[#0000CC] p-3 bg-[#F8F9FA]">
              <div className="font-bold text-sm text-[#0000CC] mb-1">
                Google PageRank (1998+)
              </div>
              <div className="text-[11px] text-[#555555] mb-2">
                Scores pages by inbound link recommendations.
              </div>
              <div className="space-y-2">
                <div className="p-2 bg-[#E8F0FE] border border-[#0000CC]">
                  <div className="font-bold text-black flex items-center justify-between">
                    <span>1. {tourQuery.toLowerCase().includes('hole') ? 'NASA Astrophysics Archive' : 'Authentic Travel Guide'}</span>
                    <span className="text-[#008000] font-bold">▲ Moved Up 1</span>
                  </div>
                  <div className="text-[10px] text-[#008000]">
                    {tourQuery.toLowerCase().includes('hole')
                      ? 'Linked by Cambridge, CERN, and Stanford researchers.'
                      : 'Linked by universities and consumer bureaus.'}
                  </div>
                </div>
                <div className="p-2 bg-[#E8F0FE] border border-[#0000CC]">
                  <div className="font-bold text-black flex items-center justify-between">
                    <span>2. {tourQuery.toLowerCase().includes('hole') ? 'Cambridge DAMTP Physics' : 'Official Airline Hub'}</span>
                    <span className="text-[#008000] font-bold">▲ Moved Up 1</span>
                  </div>
                  <div className="text-[10px] text-[#008000]">
                    {tourQuery.toLowerCase().includes('hole')
                      ? 'Foundational citations in general relativity.'
                      : 'Linked by airport transit authorities.'}
                  </div>
                </div>
                <div className="p-2 bg-[#FFF0F0] border border-[#CC0000]">
                  <div className="font-bold text-black flex items-center justify-between">
                    <span>3. {tourQuery.toLowerCase().includes('hole') ? 'Free Black Holes Pictures Spam' : 'Discount Spammer Portal'}</span>
                    <span className="text-[#CC0000] font-bold">▼ Plunged to Bottom</span>
                  </div>
                  <div className="text-[10px] text-[#CC0000]">
                    0 trustworthy websites link to this spam page!
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-2 bg-[#EDFFE1] border border-[#008000] text-xs">
            <b>Summary:</b> Keyword search is easy to trick. PageRank neutralizes spam by checking whether respected peers vouch for the page.
          </div>

          <div className="pt-2 flex justify-between items-center border-t border-[#CCCCCC]">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="btn-retro py-1 px-3 text-xs"
            >
              « Back to Step 3
            </button>
            <button
              type="button"
              onClick={() => setStep(5)}
              className="btn-retro py-1 px-4 font-bold text-sm text-[#0000CC]"
            >
              Explore the Full Website →
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Experiment Yourself */}
      {step === 5 && (
        <div className="border border-[#808080] p-4 bg-white space-y-4">
          <div className="space-y-1">
            <span className="text-[11px] font-mono uppercase text-[#0000CC] font-bold">
              Step 5 of 5: You're Ready!
            </span>
            <h1 className="text-xl font-bold font-serif text-black">
              Start experimenting with the MiniGoogle Laboratory
            </h1>
            <p className="text-sm text-[#444444] leading-relaxed">
              You now understand the fundamental problem search engines solve. Use our five interactive tools to explore real algorithms in action:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 border border-[#808080] bg-[#F8F9FA] space-y-1">
              <div className="font-bold text-sm text-[#0000CC]">1. Search Engine</div>
              <p className="text-[#555555]">
                Search example websites and inspect the exact mathematical breakdown of every result.
              </p>
              <Link to="/search" className="btn-retro inline-block text-xs py-0.5 px-2 font-bold">
                Open Search »
              </Link>
            </div>

            <div className="p-3 border border-[#808080] bg-[#F8F9FA] space-y-1">
              <div className="font-bold text-sm text-[#0000CC]">2. Compare Rankings</div>
              <p className="text-[#555555]">
                Adjust a mixing slider from 100% word-matching to 100% PageRank and watch rank positions shift.
              </p>
              <Link to="/compare" className="btn-retro inline-block text-xs py-0.5 px-2 font-bold">
                Open Compare »
              </Link>
            </div>

            <div className="p-3 border border-[#808080] bg-[#F8F9FA] space-y-1">
              <div className="font-bold text-sm text-[#0000CC]">3. Explore Websites (Graph)</div>
              <p className="text-[#555555]">
                See directed arrows connecting websites. Discover why hubs and authorities form naturally.
              </p>
              <Link to="/graph" className="btn-retro inline-block text-xs py-0.5 px-2 font-bold">
                Open Graph Map »
              </Link>
            </div>

            <div className="p-3 border border-[#808080] bg-[#F8F9FA] space-y-1">
              <div className="font-bold text-sm text-[#0000CC]">4. Browsing Simulator</div>
              <p className="text-[#555555]">
                Watch hundreds of virtual visitors click search results and navigate between websites.
              </p>
              <Link to="/simulator" className="btn-retro inline-block text-xs py-0.5 px-2 font-bold">
                Open Simulator »
              </Link>
            </div>

            <div className="p-3 border border-[#3182CE] bg-[#EBF8FF] space-y-1 sm:col-span-2">
              <div className="flex items-center space-x-1.5">
                <span className="text-base">🏄</span>
                <span className="font-bold text-sm text-[#0000CC]">5. Human Ocean Surfer (Interactive 2D World)</span>
              </div>
              <p className="text-[#2D3748]">
                Watch an actual human surfer physically ride waves between webpage islands and teleport through portals using the live Random Surfer algorithm!
              </p>
              <Link to="/ocean" className="btn-retro inline-block text-xs py-0.5 px-3 font-bold bg-white text-[#0000CC] border-[#3182CE]">
                Launch Human Ocean Surfer 🏄 »
              </Link>
            </div>
          </div>

          <div className="p-3 bg-[#EBF3FB] border border-[#0000CC] text-xs flex justify-between items-center">
            <div>
              <span className="font-bold text-black">Want to test other scenarios?</span> We have 6 curated datasets including Link Farms, Academic Citations, and Cold Start websites.
            </div>
            <button
              type="button"
              onClick={() => {
                setDatasetId('link-farm');
                navigate('/search');
              }}
              className="btn-retro text-xs py-1 px-3 ml-2 font-bold whitespace-nowrap"
            >
              Try Link Farm Scenario »
            </button>
          </div>

          <div className="pt-2 flex justify-between items-center border-t border-[#CCCCCC]">
            <button
              type="button"
              onClick={() => setStep(4)}
              className="btn-retro py-1 px-3 text-xs"
            >
              « Back to Step 4
            </button>
            <Link
              to="/search"
              className="btn-retro py-1.5 px-5 font-bold text-sm text-[#0000CC]"
            >
              Start Experimenting (Try a Search) →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

