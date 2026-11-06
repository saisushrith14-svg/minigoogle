import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../state/AppContext';
import { formatPercent, formatScore, getPageRankQuality } from '../utils/format';
import {
  calculateConvergenceMetric,
  computeNextSurferStep,
  retroSound,
  type HumanSurferState,
  type TransitionType,
} from '../simulation/humanSurferEngine';
import { OceanSurferCanvas } from '../components/ocean/OceanSurferCanvas';

type SimSpeed = 'slow' | 'normal' | 'fast' | 'insane';

const SPEED_DELAYS: Record<SimSpeed, number> = {
  slow: 1500,
  normal: 800,
  fast: 350,
  insane: 100,
};

export function OceanSurferPage() {
  const { dataset, searchResponse } = useApp();

  const pages = dataset.pages;
  const pageMap = useMemo(() => new Map(pages.map((p) => [p.id, p])), [pages]);
  const theoreticalPR = searchResponse.pageRankComputation.scores;

  // Simulation controls state
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<SimSpeed>('normal');
  const [dampingFactor, setDampingFactor] = useState(0.85);
  const [followMode, setFollowMode] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);

  // Surfer State
  const [surfer, setSurfer] = useState<HumanSurferState>(() => ({
    currentPageId: pages[0]?.id ?? '',
    animationState: 'IDLE',
    targetPageId: null,
    progress: 0,
    visitCounts: pages.reduce((acc, p) => ({ ...acc, [p.id]: 0 }), {}),
    totalSteps: 0,
    hyperlinkSteps: 0,
    teleportSteps: 0,
    history: [],
    speechText: 'Ready to surf the Web!',
    speechTimer: 3000,
    celebrationCount: 0,
  }));

  const [currentTransitionType, setCurrentTransitionType] = useState<TransitionType>('HYPERLINK');

  // Activity Log
  const [logs, setLogs] = useState<string[]>([
    `[09:00:01] OCEAN ENGINE: Initialized internet ocean with ${pages.length} webpage islands.`,
    `[09:00:02] DAMPING: Hyperlink follow prob d=${dampingFactor.toFixed(2)}, Random portal teleport prob 1-d=${(1 - dampingFactor).toFixed(2)}.`,
    `[09:00:03] SURFER: Ready on surfboard at "${pages[0]?.title ?? 'Home'}". Click START to begin surfing!`,
  ]);

  // Keep sound setting synced
  useEffect(() => {
    retroSound.enabled = soundEnabled;
  }, [soundEnabled]);

  // Reset simulation when dataset changes
  useEffect(() => {
    setSurfer({
      currentPageId: pages[0]?.id ?? '',
      animationState: 'IDLE',
      targetPageId: null,
      progress: 0,
      visitCounts: pages.reduce((acc, p) => ({ ...acc, [p.id]: 0 }), {}),
      totalSteps: 0,
      hyperlinkSteps: 0,
      teleportSteps: 0,
      history: [],
      speechText: `Ready on ${pages[0]?.title ?? 'island'}!`,
      speechTimer: 3000,
      celebrationCount: 0,
    });
    setIsPlaying(false);
  }, [pages]);

  // Execute one step of the Random Surfer model
  const executeStep = () => {
    const next = computeNextSurferStep(surfer.currentPageId, pages, dampingFactor);
    setCurrentTransitionType(next.type);

    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    // Log step
    setLogs((prev) => [
      ...prev.slice(-25),
      `[${timeStr}] STEP #${surfer.totalSteps + 1}: ${next.message}`,
    ]);

    // Audio cue
    if (next.type === 'HYPERLINK') {
      retroSound.playSurfingWhoosh();
    } else {
      retroSound.playTeleportPortal();
    }

    // Set transition state
    setSurfer((prev) => ({
      ...prev,
      targetPageId: next.targetPageId,
      animationState: next.type === 'HYPERLINK' ? 'SURFING' : 'TELEPORTING',
      progress: 0,
      speechText: next.speech,
      speechTimer: 2500,
    }));
  };

  // Animation progress timer
  const animRef = useRef<number | null>(null);
  useEffect(() => {
    if (surfer.animationState === 'IDLE' || surfer.animationState === 'CELEBRATING') return;

    const duration = SPEED_DELAYS[speed] * 0.85;
    const startTime = performance.now();

    const frame = (time: number) => {
      const elapsed = time - startTime;
      const prog = Math.min(1, elapsed / duration);

      setSurfer((prev) => ({
        ...prev,
        progress: prog,
      }));

      if (prog < 1) {
        animRef.current = requestAnimationFrame(frame);
      } else {
        // Transition finished!
        const nextId = surfer.targetPageId ?? surfer.currentPageId;
        const newTotal = surfer.totalSteps + 1;
        const isHyperlink = currentTransitionType === 'HYPERLINK';

        // Play arrival splash
        retroSound.playWaveSplash();

        // Check for milestone celebration
        const isMilestone = newTotal === 25 || newTotal === 50 || newTotal === 100;
        if (isMilestone) {
          retroSound.playFanfare();
        }

        setSurfer((prev) => {
          const nextCounts = {
            ...prev.visitCounts,
            [nextId]: (prev.visitCounts[nextId] ?? 0) + 1,
          };
          return {
            ...prev,
            currentPageId: nextId,
            targetPageId: null,
            animationState: isMilestone ? 'CELEBRATING' : 'IDLE',
            progress: 0,
            totalSteps: newTotal,
            hyperlinkSteps: prev.hyperlinkSteps + (isHyperlink ? 1 : 0),
            teleportSteps: prev.teleportSteps + (isHyperlink ? 0 : 1),
            speechText: isMilestone ? `🎉 Milestone: ${newTotal} visits!` : prev.speechText,
            celebrationCount: prev.celebrationCount + (isMilestone ? 1 : 0),
            visitCounts: nextCounts,
          };
        });
      }
    };

    animRef.current = requestAnimationFrame(frame);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [currentTransitionType, speed, surfer.animationState, surfer.currentPageId, surfer.targetPageId, surfer.totalSteps]);

  // Automatic running interval
  useEffect(() => {
    if (!isPlaying) return;
    if (surfer.animationState !== 'IDLE' && surfer.animationState !== 'CELEBRATING') return;

    const timeout = setTimeout(() => {
      executeStep();
    }, SPEED_DELAYS[speed] * 0.35);

    return () => clearTimeout(timeout);
  });

  // Calculate live convergence metric
  const convergence = useMemo(() => {
    return calculateConvergenceMetric(surfer.visitCounts, surfer.totalSteps, theoreticalPR, pages);
  }, [pages, surfer.totalSteps, surfer.visitCounts, theoreticalPR]);

  // Selected island info
  const selectedPage = selectedPageId ? pageMap.get(selectedPageId) : undefined;
  const currentIsland = pageMap.get(surfer.currentPageId);

  // Most visited page
  const mostVisitedId = useMemo(() => {
    let topId = pages[0]?.id;
    let maxV = -1;
    Object.entries(surfer.visitCounts).forEach(([id, count]) => {
      if (count > maxV) {
        maxV = count;
        topId = id;
      }
    });
    return topId;
  }, [pages, surfer.visitCounts]);

  const mostVisitedPage = mostVisitedId ? pageMap.get(mostVisitedId) : undefined;

  const handleReset = () => {
    setIsPlaying(false);
    setSurfer({
      currentPageId: pages[0]?.id ?? '',
      animationState: 'IDLE',
      targetPageId: null,
      progress: 0,
      visitCounts: pages.reduce((acc, p) => ({ ...acc, [p.id]: 0 }), {}),
      totalSteps: 0,
      hyperlinkSteps: 0,
      teleportSteps: 0,
      history: [],
      speechText: 'Reset to home island!',
      speechTimer: 3000,
      celebrationCount: 0,
    });
    setLogs((prev) => [
      ...prev.slice(-20),
      `[SIM:RESET] Simulation counters reset. Surfer returned to "${pages[0]?.title ?? 'Home'}".`,
    ]);
  };

  return (
    <div className="w-full flex flex-col font-sans text-black">
      {/* Top Banner & Introduction */}
      <div className="mb-3 p-3 bg-[#EBF8FF] border border-[#3182CE] text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl">🏄</span>
              <h1 className="text-base font-bold text-[#0000CC] font-serif leading-tight">
                MiniGoogle: The Human Random Surfer
              </h1>
            </div>
            <p className="text-xs text-[#2D3748] mt-0.5">
              Watch an actual human surfer physically ride waves between webpage islands. Their movement is driven by Google's real Random Surfer PageRank algorithm!
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setSoundEnabled((s) => !s)}
              className={`btn-retro text-xs py-1 px-2.5 font-bold ${
                soundEnabled ? 'bg-[#EDFFE1] text-[#006000] border-[#008000]' : 'text-[#666666]'
              }`}
            >
              {soundEnabled ? '🔊 Sound ON' : '🔇 Sound OFF'}
            </button>
            <Link to="/simulator" className="btn-retro text-xs py-1 px-2.5">
              Switch to Netscape View »
            </Link>
          </div>
        </div>
      </div>

      {/* Control Console (Retro 1990s Game Software Bar) */}
      <div className="p-2.5 bg-[#E2E8F0] border-2 border-[#718096] mb-3 text-xs shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Main Action Buttons */}
          <div className="flex items-center space-x-1.5">
            <button
              type="button"
              onClick={() => setIsPlaying((p) => !p)}
              className={`btn-retro text-xs py-1 px-3.5 font-bold ${
                isPlaying ? 'bg-[#FFF2F2] text-[#C53030]' : 'bg-[#EBF8FF] text-[#0000CC]'
              }`}
            >
              {isPlaying ? '⏸ PAUSE' : '▶ START SIMULATION'}
            </button>
            <button
              type="button"
              onClick={executeStep}
              disabled={isPlaying || surfer.animationState !== 'IDLE'}
              className="btn-retro text-xs py-1 px-2.5 font-bold"
              title="Execute exactly one Random Surfer step"
            >
              ⏭ STEP FORWARD
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="btn-retro text-xs py-1 px-2 text-[#C53030]"
            >
              ↺ RESET
            </button>
          </div>

          {/* Speed Selector */}
          <div className="flex items-center space-x-1">
            <span className="font-bold text-[#4A5568]">Speed:</span>
            {(['slow', 'normal', 'fast', 'insane'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSpeed(s)}
                className={`btn-retro text-[11px] py-0.5 px-2 capitalize ${
                  speed === s ? 'font-bold bg-white text-[#0000CC] border-[#0000CC]' : ''
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Damping Factor Slider */}
          <div className="flex items-center space-x-2">
            <label htmlFor="damping-slider" className="font-bold text-[#4A5568] whitespace-nowrap">
              Damping (d): <span className="font-mono text-[#0000CC]">{dampingFactor.toFixed(2)}</span>
            </label>
            <input
              id="damping-slider"
              type="range"
              min="0.1"
              max="0.99"
              step="0.05"
              value={dampingFactor}
              onChange={(e) => setDampingFactor(parseFloat(e.target.value))}
              className="w-24 cursor-pointer accent-[#0000CC]"
            />
            <span className="text-[10px] text-[#718096] whitespace-nowrap">
              ({((1 - dampingFactor) * 100).toFixed(0)}% jump prob)
            </span>
          </div>

          {/* Camera Follow Mode Toggle */}
          <div className="flex items-center space-x-1 border-l border-[#CBD5E0] pl-2">
            <button
              type="button"
              onClick={() => setFollowMode((f) => !f)}
              className={`btn-retro text-[11px] py-0.5 px-2 ${
                followMode ? 'font-bold bg-white text-[#0000CC]' : ''
              }`}
            >
              {followMode ? '🎥 Following Surfer' : '🗺️ Free World Roam'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Ocean Canvas */}
      <div className="mb-3">
        <OceanSurferCanvas
          pages={pages}
          pageRankScores={theoreticalPR}
          currentPageId={surfer.currentPageId}
          targetPageId={surfer.targetPageId}
          animationState={surfer.animationState}
          progress={surfer.progress}
          transitionType={currentTransitionType}
          speechText={surfer.speechText}
          followMode={followMode}
          onSelectPage={(id) => setSelectedPageId(id)}
          selectedPageId={selectedPageId}
          visitCounts={surfer.visitCounts}
          totalVisits={surfer.totalSteps}
        />
      </div>

      {/* Live Statistics & Real-Time Convergence Banner */}
      <div className="mb-3 p-3 bg-white border border-[#808080] text-xs">
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 text-center mb-3">
          <div className="p-2 bg-[#F7FAFC] border border-[#E2E8F0]">
            <div className="text-[10px] text-[#718096] uppercase">Current Island</div>
            <div className="font-bold text-xs text-[#0000CC] truncate mt-0.5" title={currentIsland?.title}>
              {currentIsland?.title ?? '—'}
            </div>
            <div className="font-mono text-[10px] text-[#008000]">
              PR: {formatScore(theoreticalPR[surfer.currentPageId] ?? 0)}
            </div>
          </div>

          <div className="p-2 bg-[#F7FAFC] border border-[#E2E8F0]">
            <div className="text-[10px] text-[#718096] uppercase">Total Transitions</div>
            <div className="font-bold text-base text-black font-mono mt-0.5">
              {surfer.totalSteps}
            </div>
            <div className="text-[10px] text-[#718096]">iterations</div>
          </div>

          <div className="p-2 bg-[#F7FAFC] border border-[#E2E8F0]">
            <div className="text-[10px] text-[#718096] uppercase">Wave Rides vs Jumps</div>
            <div className="font-bold text-xs text-black font-mono mt-0.5">
              🌊 {surfer.hyperlinkSteps} | 🌀 {surfer.teleportSteps}
            </div>
            <div className="text-[10px] text-[#718096]">
              {surfer.totalSteps > 0
                ? `${((surfer.hyperlinkSteps / surfer.totalSteps) * 100).toFixed(0)}% link / ${((surfer.teleportSteps / surfer.totalSteps) * 100).toFixed(0)}% teleport`
                : 'awaiting steps'}
            </div>
          </div>

          <div className="p-2 bg-[#F7FAFC] border border-[#E2E8F0]">
            <div className="text-[10px] text-[#718096] uppercase">Most Visited Island</div>
            <div className="font-bold text-xs text-[#0000CC] truncate mt-0.5" title={mostVisitedPage?.title}>
              {mostVisitedPage?.title ?? '—'}
            </div>
            <div className="font-mono text-[10px] text-[#718096]">
              {surfer.visitCounts[mostVisitedId ?? ''] ?? 0} visits (
              {surfer.totalSteps > 0
                ? (((surfer.visitCounts[mostVisitedId ?? ''] ?? 0) / surfer.totalSteps) * 100).toFixed(1)
                : 0}
              %)
            </div>
          </div>

          <div className="col-span-2 p-2 bg-[#F7FAFC] border border-[#E2E8F0] text-left flex flex-col justify-between">
            <div className="flex justify-between items-center text-[10px]">
              <span className="font-bold text-[#2D3748] uppercase">
                Empirical Convergence to PageRank:
              </span>
              <span className="font-bold font-mono text-[#0000CC]">
                {convergence.similarityPercent}% alignment
              </span>
            </div>
            {/* Visual Convergence Progress Bar */}
            <div className="w-full h-3 bg-[#E2E8F0] border border-[#CBD5E0] mt-1 relative overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#3182CE] to-[#38A169] transition-all duration-300"
                style={{ width: `${convergence.similarityPercent}%` }}
              />
            </div>
            <div className="text-[10px] text-[#718096] mt-1">
              As the human surfer rides more waves, visit frequencies mathematically converge to Larry Page's 1998 eigenvector vector!
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-side: Activity Log and Selected Island Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-3">
        {/* Real-time Retro Activity Log */}
        <div
          className="w-full bg-black text-[#00FF41] p-3 font-mono text-xs shadow-md"
          style={{ border: '2px solid #555555' }}
        >
          <div className="flex justify-between border-b border-[#333333] pb-1 mb-2 text-[10px] text-[#888888]">
            <span>STANFORD-RANDOM-SURFER-OCEAN // TELEMETRY.LOG</span>
            <span className="text-[#00FF41]">STATUS: {surfer.animationState}</span>
          </div>
          <div className="h-40 overflow-y-auto space-y-0.5 text-[11px] leading-tight select-all">
            {logs.map((log, idx) => (
              <div key={idx}>{log}</div>
            ))}
          </div>
        </div>

        {/* Selected Island Inspector */}
        <div className="p-3 bg-white border border-[#808080] text-xs">
          <div className="font-bold text-sm text-black font-serif border-b border-[#CCCCCC] pb-1 mb-2 flex justify-between items-center">
            <span>Island Inspector</span>
            {selectedPage && (
              <span className="text-[10px] font-mono text-[#718096]">
                ID: {selectedPage.id}
              </span>
            )}
          </div>

          {selectedPage ? (
            <div className="space-y-2">
              <div>
                <h3 className="font-bold text-sm text-[#0000CC] font-serif leading-tight">
                  {selectedPage.title}
                </h3>
                <div className="font-mono text-[10px] text-[#008000] truncate">
                  {selectedPage.url}
                </div>
              </div>

              {/* PageRank & Visits Quality Pill */}
              {(() => {
                const pr = theoreticalPR[selectedPage.id] ?? 0;
                const maxPR = Math.max(...(Object.values(theoreticalPR) as number[]), 0.0001);
                const quality = getPageRankQuality(pr, maxPR);
                const visits = surfer.visitCounts[selectedPage.id] ?? 0;
                const percent = surfer.totalSteps > 0 ? ((visits / surfer.totalSteps) * 100).toFixed(1) : '0';

                return (
                  <div className="p-2 bg-[#F8F9FA] border border-[#CCCCCC] text-[11px] space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-black">PageRank Quality:</span>
                      <span
                        className="px-1.5 py-0.5 text-[10px] font-bold"
                        style={{ backgroundColor: quality.badgeColor, color: quality.textColor }}
                      >
                        {quality.label}
                      </span>
                    </div>
                    <div>PageRank Score: <b className="font-mono">{formatScore(pr, 4)}</b> ({formatPercent(pr)})</div>
                    <div>Surfer Visits: <b className="font-mono">{visits}</b> ({percent}% of all steps)</div>
                  </div>
                );
              })()}

              {/* Hyperlink Connections */}
              <div className="space-y-1.5 pt-1 border-t border-[#EEEEEE]">
                <div>
                  <div className="font-bold text-black text-[11px]">
                    Outgoing Wave Links ({selectedPage.links.length}):
                  </div>
                  {selectedPage.links.length > 0 ? (
                    <ul className="max-h-20 overflow-y-auto space-y-0.5 font-mono text-[10px]">
                      {selectedPage.links.map((targetId) => {
                        const target = pageMap.get(targetId);
                        return (
                          <li key={targetId} className="truncate">
                            <button
                              type="button"
                              onClick={() => setSelectedPageId(targetId)}
                              className="text-[#0000CC] underline hover:text-[#CC0000] truncate block text-left"
                            >
                              → {target?.title ?? targetId}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <span className="text-[#BC0000] italic text-[10px]">
                      Dangling Island (0 outgoing links). Surfer teleports out!
                    </span>
                  )}
                </div>

                <div>
                  <div className="font-bold text-black text-[11px]">
                    Incoming Recommenders:
                  </div>
                  <div className="text-[10px] text-[#555555]">
                    {pages.filter((p) => p.links.includes(selectedPage.id)).length} websites recommend this island.
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-[#718096] italic text-xs">
              Click any island in the digital ocean to inspect its links, PageRank, and visit telemetry.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
