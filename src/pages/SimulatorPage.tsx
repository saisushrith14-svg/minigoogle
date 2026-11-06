import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../state/AppContext';
import { formatClock } from '../utils/format';

export function SimulatorPage() {
  const {
    dataset,
    query,
    simulationConfig,
    updateSimulationConfig,
    simulationRun,
    simulationIsCurrent,
    runSimulation,
    clearSimulation,
  } = useApp();

  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [liveLocation, setLiveLocation] = useState(
    'http://www-db.stanford.edu/research/cs276/pagerank-demo.html',
  );
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    '[09:00:01] SEED: Initializing random surfers across indexed web nodes...',
    '[09:00:02] STOCHASTIC: Teleportation factor α=0.850, uniform jump prob (1-α)=0.150',
    '[09:00:03] READY: Awaiting simulation command.',
  ]);

  const pageMap = useMemo(
    () => new Map(dataset.pages.map((p) => [p.id, p])),
    [dataset.pages],
  );

  const events = simulationRun?.events ?? [];
  const currentEvent = events[currentEventIndex];

  // Replay timer
  useEffect(() => {
    if (!isPlaying || events.length === 0) return;
    const interval = setInterval(() => {
      setCurrentEventIndex((prev) => {
        if (prev >= events.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 400);
    return () => clearInterval(interval);
  }, [isPlaying, events.length]);

  // Log active event
  useEffect(() => {
    if (!currentEvent) return;
    const dest = currentEvent.destinationPageId
      ? pageMap.get(currentEvent.destinationPageId)?.url ?? currentEvent.destinationPageId
      : null;
    const src = currentEvent.sourcePageId
      ? pageMap.get(currentEvent.sourcePageId)?.url ?? currentEvent.sourcePageId
      : null;

    if (dest) setLiveLocation(`http://${dest}`);

    setTerminalLogs((prev) => [
      ...prev.slice(-20),
      `[USER #${String(currentEvent.userId).padStart(3, '0')}] ${currentEvent.action}: ${
        src ? src + ' → ' : ''
      }${dest ?? ''} (${currentEvent.dwellTimeMs ? currentEvent.dwellTimeMs + 'ms' : ''})`,
    ]);
  }, [currentEvent, pageMap]);

  const handleRunDeterministic = () => {
    const run = runSimulation();
    setCurrentEventIndex(0);
    setIsPlaying(false);
    setTerminalLogs((prev) => [
      ...prev.slice(-15),
      `[SIM:START] Executed deterministic simulation: ${run.config.userCount} users, seed ${run.config.randomSeed}. Generated ${run.events.length} events.`,
    ]);
  };

  const handleReset = () => {
    setIsPlaying(false);
    clearSimulation();
    setCurrentEventIndex(0);
    setTerminalLogs((prev) => [
      ...prev.slice(-10),
      '[SIM:RESET] Simulation cleared. Parameters reset.',
    ]);
  };

  const activePage = currentEvent?.destinationPageId
    ? pageMap.get(currentEvent.destinationPageId)
    : currentEvent?.sourcePageId
      ? pageMap.get(currentEvent.sourcePageId)
      : dataset.pages[0];

  // Plain-English description of current event action
  const friendlyActionDescription = useMemo(() => {
    if (!currentEvent) {
      return 'No active visitor. Press "Run deterministic simulation" below to start watching people browse!';
    }
    const destTitle = currentEvent.destinationPageId
      ? pageMap.get(currentEvent.destinationPageId)?.title ?? currentEvent.destinationPageId
      : 'a website';
    const srcTitle = currentEvent.sourcePageId
      ? pageMap.get(currentEvent.sourcePageId)?.title ?? currentEvent.sourcePageId
      : 'a website';

    switch (currentEvent.action) {
      case 'SEARCH':
        return `Visitor #${currentEvent.userId} typed a search query into MiniGoogle.`;
      case 'SCAN':
        return `Visitor #${currentEvent.userId} is scanning the search results list.`;
      case 'CLICK_RESULT':
        return `Visitor #${currentEvent.userId} clicked search result: "${destTitle}".`;
      case 'DWELL':
        return `Visitor #${currentEvent.userId} is reading "${destTitle}" for ${currentEvent.dwellTimeMs} milliseconds.`;
      case 'SCROLL':
        return `Visitor #${currentEvent.userId} scrolled down to read more of "${destTitle}".`;
      case 'FOLLOW_LINK':
        return `Visitor #${currentEvent.userId} clicked a hyperlink on "${srcTitle}" and moved to "${destTitle}".`;
      case 'RETURN_TO_SEARCH':
        return `Visitor #${currentEvent.userId} hit Back in their browser and returned to search results.`;
      case 'END_SESSION':
        return `Visitor #${currentEvent.userId} finished browsing and closed their browser.`;
      default:
        return `Visitor #${currentEvent.userId} engaged with ${destTitle}.`;
    }
  }, [currentEvent, pageMap]);

  return (
    <div className="w-full flex flex-col font-sans text-black">
      {/* Beginner Self-Explaining Banner */}
      <div className="mb-3 p-3 bg-[#F0F4FF] border border-[#7F9DB9] text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="text-base font-bold text-[#0000CC] font-serif leading-tight">
              Watch How People Search the Web
            </div>
            <p className="text-xs text-[#333333] mt-0.5">
              See how simulated visitors search, click results, and move between websites.
            </p>
          </div>
          <div className="text-[11px] text-[#555555] bg-white px-2 py-1 border border-[#CCCCCC] sm:max-w-xs">
            👉 <b>Action:</b> Pick how many visitors you want to simulate, then press <b>Run deterministic simulation</b> below!
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="mb-3">
        <div className="text-[11px] font-mono text-[#0000CC] font-bold uppercase mb-0.5">
          Stanford CS276 Lab: Monte Carlo Surfer Simulator (1998)
        </div>
        <h1 className="text-xl font-bold font-serif text-black leading-tight">
          Surfer behaviour simulator
        </h1>
        <p className="text-xs text-[#555555] italic">
          Models the stochastic movement of human users browsing the hypertext web graph.
          Corpus: <b>{dataset.name}</b> · Query: “<b>{query || 'empty'}</b>”.
        </p>
      </div>

      <hr className="w-full border-t border-[#808080] mb-3" />

      {/* Real-Time Plain-English Activity Box */}
      <div className="mb-4 p-3 bg-[#FFFDE6] border-2 border-[#E6DB55] text-xs">
        <div className="flex items-center justify-between mb-1">
          <span className="font-bold text-black uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${isPlaying ? 'bg-[#008000] animate-pulse' : 'bg-[#808080]'}`} />
            Live Visitor Activity
          </span>
          {events.length > 0 && (
            <span className="font-mono text-[11px] text-[#555555]">
              Step {currentEventIndex + 1} of {events.length}
            </span>
          )}
        </div>
        <p className="text-sm font-serif font-bold text-[#0000CC] m-0">
          {friendlyActionDescription}
        </p>
      </div>

      {/* 1998 Netscape Communicator Window Frame */}
      <div
        className="w-full bg-[#C0C0C0] text-black font-sans p-1 shadow-sm select-none mb-4"
        style={{ border: '2px outset #FFFFFF' }}
      >
        {/* Title Bar */}
        <div className="bg-[#00008B] text-white px-2 py-0.5 flex items-center justify-between text-xs font-bold font-sans">
          <div className="flex items-center space-x-1">
            <span className="w-3.5 h-3.5 bg-white text-[#00008B] text-[10px] font-bold flex items-center justify-center font-mono mr-1">
              N
            </span>
            <span>Netscape Communicator - [Random Walk Surfer Simulation: PageRank v0.81b]</span>
          </div>
          <div className="flex items-center space-x-1">
            <button type="button" className="w-4 h-4 bg-[#C0C0C0] text-black font-mono text-[10px] border border-outset border-white">
              _
            </button>
            <button type="button" className="w-4 h-4 bg-[#C0C0C0] text-black font-mono text-[10px] border border-outset border-white">
              □
            </button>
            <button type="button" className="w-4 h-4 bg-[#C0C0C0] text-black font-mono text-[10px] border border-outset border-white">
              ✕
            </button>
          </div>
        </div>

        {/* Menu Bar */}
        <div className="flex items-center space-x-3 px-2 py-0.5 text-xs border-b border-[#808080] bg-[#C0C0C0]">
          <span className="cursor-pointer hover:bg-[#00008B] hover:text-white px-1">
            <span className="underline">F</span>ile
          </span>
          <span className="cursor-pointer hover:bg-[#00008B] hover:text-white px-1">
            <span className="underline">E</span>dit
          </span>
          <span className="cursor-pointer hover:bg-[#00008B] hover:text-white px-1">
            <span className="underline">V</span>iew
          </span>
          <span className="cursor-pointer hover:bg-[#00008B] hover:text-white px-1">
            <span className="underline">G</span>o
          </span>
          <span className="cursor-pointer hover:bg-[#00008B] hover:text-white px-1">
            <span className="underline">C</span>ommunicator
          </span>
          <span className="cursor-pointer hover:bg-[#00008B] hover:text-white px-1">
            <span className="underline">H</span>elp
          </span>
        </div>

        {/* Browser Tool Buttons Bar */}
        <div className="flex items-center space-x-1 p-1 bg-[#C0C0C0] border-b border-[#808080] text-[11px]">
          <button
            type="button"
            onClick={() => setCurrentEventIndex((i) => Math.max(0, i - 1))}
            className="px-2 py-0.5 bg-[#D4D0C8] active:bg-[#B0ACA5] border-2 border-outset border-white flex items-center space-x-1 cursor-pointer"
          >
            <span>◀ Back</span>
          </button>
          <button
            type="button"
            onClick={() => setCurrentEventIndex((i) => Math.min(events.length - 1, i + 1))}
            className="px-2 py-0.5 bg-[#D4D0C8] active:bg-[#B0ACA5] border-2 border-outset border-white flex items-center space-x-1 cursor-pointer"
          >
            <span>Forward ▶</span>
          </button>
          <button
            type="button"
            onClick={() => setCurrentEventIndex(0)}
            className="px-2 py-0.5 bg-[#D4D0C8] active:bg-[#B0ACA5] border-2 border-outset border-white cursor-pointer"
          >
            ↻ Reload
          </button>
          <Link
            to="/"
            className="px-2 py-0.5 bg-[#D4D0C8] active:bg-[#B0ACA5] border-2 border-outset border-white text-black no-underline"
          >
            Home
          </Link>
          <Link
            to="/search"
            className="px-2 py-0.5 bg-[#D4D0C8] active:bg-[#B0ACA5] border-2 border-outset border-white text-black no-underline"
          >
            Search
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-2 py-0.5 bg-[#D4D0C8] active:bg-[#B0ACA5] border-2 border-outset border-white cursor-pointer"
          >
            Print
          </button>
          <button
            type="button"
            onClick={() => setIsPlaying(false)}
            className="px-2 py-0.5 bg-[#D4D0C8] active:bg-[#B0ACA5] border-2 border-outset border-white text-[#BC0000] font-bold cursor-pointer"
          >
            ■ Stop
          </button>
        </div>

        {/* Location URL Bar with animated "N" Throbber Box */}
        <div className="flex items-center px-1 py-1 bg-[#C0C0C0] space-x-1 border-b border-[#808080]">
          <span className="font-bold text-[11px] whitespace-nowrap">Location:</span>
          <div
            className="flex-1 bg-white px-2 py-0.5 text-xs font-mono text-black overflow-hidden truncate"
            style={{ border: '2px inset #808080' }}
          >
            <span>{liveLocation}</span>
          </div>
          <div
            className={`w-6 h-6 flex items-center justify-center font-bold text-xs border border-[#808080] ${
              isPlaying ? 'bg-[#004080] text-[#00FFFF]' : 'bg-black text-[#00FFCC]'
            }`}
            title="Netscape Throbber"
          >
            N
          </div>
        </div>

        {/* Browser Content Viewport */}
        <div
          className="bg-white text-black p-3 min-h-[220px] overflow-y-auto"
          style={{ border: '2px inset #808080' }}
        >
          {activePage ? (
            <div>
              <div className="flex justify-between items-start border-b border-[#808080] pb-1 mb-2">
                <div>
                  <h2 className="font-serif text-lg font-bold text-[#0000CC] m-0">
                    {activePage.title}
                  </h2>
                  <div className="text-[11px] text-[#555555] font-mono">{activePage.url}</div>
                </div>
                <div className="bg-[#EFEFEF] px-2 py-1 border border-[#808080] text-right font-mono text-[10px]">
                  <div>SURFER TELEMETRY</div>
                  <div className="font-bold text-[#0000CC]">
                    DWELL: {currentEvent?.dwellTimeMs ? `${currentEvent.dwellTimeMs} ms` : '412 ms'}
                  </div>
                </div>
              </div>

              <p className="text-xs text-[#333333] leading-relaxed mb-3">
                {activePage.content}
              </p>

              {/* Candidate Hyperlinks on this page */}
              <div className="bg-[#F8F9FA] p-2 border border-[#CCCCCC] text-xs mb-2">
                <div className="font-bold text-black mb-1">
                  Candidate Outgoing Links (Surfer Transitions):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 font-sans">
                  {activePage.links.map((targetId) => {
                    const targetPage = pageMap.get(targetId);
                    return (
                      <div
                        key={targetId}
                        className="p-1 bg-white border border-[#CCCCCC] flex justify-between items-center"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            if (targetPage) setLiveLocation(`http://${targetPage.url}`);
                          }}
                          className="text-[#0000CC] underline truncate text-left"
                        >
                          → {targetPage?.title ?? targetId}
                        </button>
                        <span className="font-mono text-[10px] text-[#777777] ml-1">
                          P(jump)={(0.85 / Math.max(1, activePage.links.length)).toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                  {activePage.links.length === 0 && (
                    <span className="text-[11px] text-[#BC0000] italic">
                      Dangling Node: No egress links. Random surfer teleports with prob (1-d)=0.15.
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-[#777777] italic text-xs">
              Load and start the surfer simulation to observe virtual agents walking the web graph.
            </div>
          )}
        </div>

        {/* Netscape Status Bar */}
        <div className="bg-[#C0C0C0] px-2 py-0.5 text-[11px] flex justify-between items-center border-t border-[#808080]">
          <div className="flex items-center space-x-1">
            <span>🔒</span>
            <span>Document: Done (HTTP/1.0 200 OK - 8,421 bytes)</span>
          </div>
          <div className="font-mono text-[10px]">
            <span>Host: elib.stanford.edu | </span>
            <span className="text-[#006000] font-bold">
              {simulationConfig.userCount} Agents Configured
            </span>
          </div>
        </div>
      </div>

      {/* Monte Carlo Parameters & Simulation Controls (matches test) */}
      <fieldset
        className="p-3 bg-[#EFEFEF] mb-4 text-xs font-sans"
        style={{ border: '2px solid #808080' }}
      >
        <legend className="font-bold text-xs text-[#0000CC] px-2 bg-[#EFEFEF] border border-[#808080]">
          Monte Carlo Simulation Parameters (Markov Web Graph)
        </legend>

        {/* Quick Presets for Visitors */}
        <div className="mb-2 p-1.5 bg-white border border-[#CCCCCC] flex flex-wrap items-center gap-2">
          <span className="font-bold text-[#555555]">Quick Presets:</span>
          {[10, 25, 50, 100].map((count) => (
            <button
              key={count}
              type="button"
              onClick={() => updateSimulationConfig({ userCount: count })}
              className={`btn-retro text-xs py-0.5 px-2 ${
                simulationConfig.userCount === count ? 'font-bold bg-[#E5ECF9] text-[#0000CC]' : ''
              }`}
            >
              {count} Visitors
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-1 mb-3">
          <div>
            <label className="block font-bold mb-0.5">Random Surfers (N):</label>
            <input
              type="number"
              min="10"
              max="1000"
              step="50"
              value={simulationConfig.userCount}
              onChange={(e) =>
                updateSimulationConfig({ userCount: parseInt(e.target.value, 10) || 100 })
              }
              className="input-retro w-full py-0.5 font-mono text-xs"
            />
          </div>
          <div>
            <label className="block font-bold mb-0.5">Damping Factor (d):</label>
            <input
              type="number"
              min="0.1"
              max="0.99"
              step="0.05"
              value={0.85}
              readOnly
              className="input-retro w-full py-0.5 font-mono text-xs bg-[#F0F0F0]"
            />
          </div>
          <div>
            <label className="block font-bold mb-0.5">PRNG Random Seed:</label>
            <input
              type="number"
              value={simulationConfig.randomSeed}
              onChange={(e) =>
                updateSimulationConfig({ randomSeed: parseInt(e.target.value, 10) || 1998 })
              }
              className="input-retro w-full py-0.5 font-mono text-xs"
            />
          </div>
          <div>
            <label className="block font-bold mb-0.5">Teleport Jump Prob (%):</label>
            <input
              type="text"
              readOnly
              value="15.0%"
              className="input-retro w-full py-0.5 font-mono text-xs bg-[#F0F0F0]"
            />
          </div>
        </div>

        {/* Buttons matching tests */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#CCCCCC]">
          <button
            type="button"
            onClick={handleRunDeterministic}
            className="btn-retro font-bold text-xs py-1 px-3 text-[#0000CC]"
          >
            Run deterministic simulation
          </button>
          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            disabled={events.length === 0}
            className="btn-retro text-xs py-1 px-3"
          >
            {isPlaying ? 'Pause' : 'Play Replay'}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="btn-retro text-xs py-1 px-3 text-[#BC0000]"
          >
            Reset
          </button>
          <Link to="/analytics" aria-label="Analytics" className="btn-retro text-xs py-1 px-3">
            Analytics »
          </Link>
          <span className="ml-auto font-mono text-[11px] text-[#555555]">
            Iterations: {events.length} events recorded
          </span>
        </div>
      </fieldset>

      {/* Replay Recorded Event Log Section (matches simulatorAnalytics.test.tsx) */}
      <div className="mb-4 p-3 bg-white border border-[#808080] text-xs font-sans">
        <div className="flex justify-between items-baseline mb-2">
          <h2 className="font-bold text-sm text-black font-serif">
            Replay the recorded event log
          </h2>
          {simulationIsCurrent && simulationRun ? (
            <span className="font-mono text-[11px] text-[#008000] font-bold">
              ✓ This run matches the current dataset
            </span>
          ) : (
            <span className="font-mono text-[11px] text-[#808080]">
              No telemetry yet. Click “Run deterministic simulation” above.
            </span>
          )}
        </div>

        {events.length > 0 ? (
          <div>
            <div className="flex items-center justify-between bg-[#F8F9FA] p-2 border border-[#CCCCCC] mb-2 font-mono">
              <span className="font-bold text-black">
                Event {currentEventIndex + 1} of {events.length}
              </span>
              <div className="space-x-1">
                <button
                  type="button"
                  onClick={() => setCurrentEventIndex((i) => Math.max(0, i - 1))}
                  disabled={currentEventIndex === 0}
                  className="btn-retro text-xs py-0.5 px-2"
                >
                  Previous event
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentEventIndex((i) => Math.min(events.length - 1, i + 1))}
                  disabled={currentEventIndex >= events.length - 1}
                  className="btn-retro text-xs py-0.5 px-2 font-bold"
                >
                  Next event
                </button>
              </div>
            </div>

            {currentEvent && (
              <div className="p-2 border border-[#CCCCCC] bg-white font-mono text-[11px] space-y-1">
                <div>User ID: <b>#{currentEvent.userId}</b></div>
                <div>Action: <b>{currentEvent.action}</b></div>
                <div>Time: {currentEvent.timestamp} ms ({formatClock(currentEvent.timestamp)})</div>
                <div>
                  Target: {currentEvent.destinationPageId ? pageMap.get(currentEvent.destinationPageId)?.title ?? currentEvent.destinationPageId : '—'}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 text-center text-[#777777] italic">
            Event stream empty. Configure parameters and run surfers to record telemetry events.
          </div>
        )}
      </div>

      {/* Green on Black Retro Terminal Log */}
      <div
        className="w-full bg-black text-[#00FF41] p-3 font-mono text-xs shadow-md mb-4"
        style={{ border: '2px solid #555555' }}
      >
        <div className="flex justify-between border-b border-[#333333] pb-1 mb-2 text-[10px] text-[#888888]">
          <span>STANFORD-AI-LAB // MC_RANDOM_SURFER_LOG.TXT</span>
          <span>BUFFER: TTY/COM1 [9600 BAUD]</span>
        </div>
        <div className="h-28 overflow-y-auto space-y-0.5 text-[11px] leading-tight select-all">
          {terminalLogs.map((log, idx) => (
            <div key={idx}>{log}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
