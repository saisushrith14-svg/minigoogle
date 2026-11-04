import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  BookOpen,
  Braces,
  CheckCircle2,
  GitCompare,
  Hash,
  Layers,
  Link2,
  Play,
  Search,
  Sigma,
  Sparkles,
  Workflow,
} from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useApp } from '../state/AppContext';
import { extractPhraseTerms, extractQueryTerms, tokenize } from '../algorithms/tokenizer';
import {
  formatClock,
  formatNumber,
  formatPercent,
  formatScore,
  MODE_SHORT_LABELS,
  SCENARIO_LABELS,
} from '../utils/format';
import {
  SIMULATION_ACTION_LABELS,
  summarizeRun,
} from '../utils/simulationView';
import {
  Badge,
  Button,
  Card,
  Formula,
  InfoNote,
  SectionHeading,
} from '../components/ui/Primitives';
import { FactorBreakdown } from '../components/search/FactorBreakdown';

export function LearnPage() {
  const {
    dataset,
    query,
    searchResponse,
    comparison,
    keywordWeights,
    rankingWeights,
    behaviourScores,
    simulationRun,
    simulationIsCurrent,
    simulationConfig,
  } = useApp();

  const pageMap = useMemo(
    () => new Map(dataset.pages.map((page) => [page.id, page])),
    [dataset.pages],
  );
  const topKeyword = comparison.resultsByMode.keyword[0];
  const topPageRank = comparison.resultsByMode.pagerank[0];
  const topHybrid = comparison.resultsByMode.hybrid[0];
  const topExperimental = comparison.resultsByMode.experimental[0];
  const topKeywordPage = topKeyword ? pageMap.get(topKeyword.pageId) : undefined;

  const queryTerms = useMemo(() => extractQueryTerms(query), [query]);
  const phraseTerms = useMemo(() => extractPhraseTerms(query), [query]);
  const bodyTokenCount = useMemo(
    () => (topKeywordPage ? tokenize(topKeywordPage.content).length : 0),
    [topKeywordPage],
  );

  const topPrIndex = topPageRank
    ? dataset.pages.findIndex((page) => page.id === topPageRank.pageId)
    : -1;
  const convergenceData = useMemo(
    () =>
      searchResponse.pageRankComputation.history.map((vector, index) => ({
        iteration: index,
        score: topPrIndex >= 0 ? (vector[topPrIndex] ?? 0) : 0,
      })),
    [searchResponse.pageRankComputation.history, topPrIndex],
  );

  const behaviourWeight = rankingWeights.behaviourWeight ?? 0;
  const hybridDenominator = Math.max(
    1e-9,
    rankingWeights.keywordWeight + rankingWeights.pagerankWeight,
  );
  const alpha = rankingWeights.keywordWeight / hybridDenominator;
  const beta = rankingWeights.pagerankWeight / hybridDenominator;
  const experimentalDenominator = Math.max(
    1e-9,
    rankingWeights.keywordWeight + rankingWeights.pagerankWeight + behaviourWeight,
  );
  const expAlpha = rankingWeights.keywordWeight / experimentalDenominator;
  const expBeta = rankingWeights.pagerankWeight / experimentalDenominator;
  const expGamma = behaviourWeight / experimentalDenominator;

  const workedHybridScore = topHybrid
    ? alpha * topHybrid.keywordScore + beta * topHybrid.normalizedPageRank
    : 0;
  const workedExperimentalScore = topExperimental
    ? expAlpha * topExperimental.keywordScore +
      expBeta * topExperimental.normalizedPageRank +
      expGamma * (topExperimental.behaviourScore ?? 0)
    : 0;
  const runSummary = simulationRun ? summarizeRun(simulationRun) : null;

  return (
    <div className="page-section">
      <div className="page-shell">
        <SectionHeading
          eyebrow={`Mathematics · ${SCENARIO_LABELS[dataset.scenario]}`}
          title="How the ranking actually works"
          description="Each formula below is the one executed by this repository. The worked numbers come from the current dataset, query, and configuration — not from a precomputed example."
          actions={
            <>
              <Link to="/search">
                <Button variant="secondary" size="sm">
                  <Search size={14} aria-hidden="true" /> Search results
                </Button>
              </Link>
              <Link to="/compare">
                <Button variant="dark" size="sm">
                  <GitCompare size={14} aria-hidden="true" /> Compare models
                </Button>
              </Link>
            </>
          }
        />

        <div className="mt-5">
          <InfoNote tone="blue">
            Current corpus: <strong>{dataset.name}</strong>. Query:{' '}
            <strong>“{query || 'empty'}”</strong>. Every score is deterministic for these inputs,
            except for consciously configurable weights and the seeded simulation.
          </InfoNote>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <Card className="p-5">
            <div className="flex items-center gap-2">
              <span className="rounded-xl bg-amber-50 p-2 text-amber-600">
                <Hash size={17} aria-hidden="true" />
              </span>
              <h2 className="text-base font-bold text-slate-950">1. Tokenization</h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Text is Unicode-normalized, lowercased, stripped of punctuation, split on whitespace,
              and passed through a small suffix normalizer. Query terms remove common stop words;
              phrase matching keeps them.
            </p>
            <div className="mt-3 space-y-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Query terms
                </p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {queryTerms.length > 0 ? (
                    queryTerms.map((term) => (
                      <Badge key={term} variant="amber">
                        {term}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">Empty query</span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Phrase tokens
                </p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {phraseTerms.length > 0 ? (
                    phraseTerms.map((term, index) => (
                      <Badge key={`${term}-${index}`} variant="neutral">
                        {term}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">No phrase tokens</span>
                  )}
                </div>
              </div>
              <p className="text-xs text-slate-500">
                The current top keyword page contains {formatNumber(bodyTokenCount, 0)} body tokens.
              </p>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2">
              <span className="rounded-xl bg-blue-50 p-2 text-blue-600">
                <Sigma size={17} aria-hidden="true" />
              </span>
              <h2 className="text-base font-bold text-slate-950">2. Content relevance (1997)</h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Seven factors are weighted and averaged, then multiplied by a gentle symmetric length
              correction. The public weight contract has no length-normalization weight, so it is a
              multiplier rather than an eighth weighted term.
            </p>
            <Formula className="mt-3">
              <span className="var">score</span>(q,d) <span className="op">=</span> L(d)
              <span className="op">·</span>
              <span className="frac">
                <span>Σ<sub>f</sub> w<sub>f</sub> · f(q,d)</span>
                <span>Σ<sub>f</sub> w<sub>f</sub></span>
              </span>
            </Formula>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Factors: term frequency, keyword density, title match, heading match, meta match,
              exact phrase, and proximity.
            </p>
          </Card>
        </div>

        {topKeyword && topKeywordPage ? (
          <Card className="mt-5 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-slate-950">
                  Worked example: top keyword result
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  “{topKeywordPage.title}” · keyword score {formatScore(topKeyword.keywordScore)}.
                </p>
              </div>
              <Badge variant="amber">#{topKeyword.position} keyword</Badge>
            </div>
            <div className="mt-4">
              <FactorBreakdown factors={topKeyword.factorBreakdown} weights={keywordWeights} />
            </div>
          </Card>
        ) : null}

        <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <Card className="p-5">
            <div className="flex items-center gap-2">
              <span className="rounded-xl bg-violet-50 p-2 text-violet-600">
                <Link2 size={17} aria-hidden="true" />
              </span>
              <h2 className="text-base font-bold text-slate-950">3. Iterative PageRank (1998)</h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              PageRank models a random surfer. With damping d, the score of page i is the teleport
              probability plus the damped sum of rank flowing along incoming links. Dangling mass is
              redistributed uniformly so the vector stays stochastic.
            </p>
            <Formula className="mt-3">
              <span className="var">PR</span>(i) <span className="op">=</span>
              <span className="frac">
                <span>1 − d</span>
                <span>N</span>
              </span>
              <span className="op">+</span> d
              <span className="op">·</span>
              <span className="frac">
                <span>Σ<sub>j→i</sub> PR(j)/out(j) + D/N</span>
                <span>1</span>
              </span>
            </Formula>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-slate-50 p-2">
                <p className="text-[10px] uppercase tracking-wide text-slate-400">Damping</p>
                <p className="font-mono text-sm font-bold text-slate-900">
                  {searchResponse.pageRankConfig.dampingFactor}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-2">
                <p className="text-[10px] uppercase tracking-wide text-slate-400">Iterations</p>
                <p className="font-mono text-sm font-bold text-slate-900">
                  {searchResponse.pageRankComputation.iterations}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-2">
                <p className="text-[10px] uppercase tracking-wide text-slate-400">Final Δ</p>
                <p className="font-mono text-sm font-bold text-slate-900">
                  {searchResponse.pageRankComputation.finalDelta.toExponential(1)}
                </p>
              </div>
            </div>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
              {searchResponse.pageRankComputation.converged ? (
                <CheckCircle2 size={13} className="text-emerald-600" aria-hidden="true" />
              ) : (
                <Activity size={13} className="text-amber-600" aria-hidden="true" />
              )}
              {searchResponse.pageRankComputation.converged
                ? 'Converged below the configured L1 threshold.'
                : 'Stopped at the maximum iteration cap.'}{' '}
              {searchResponse.pageRankComputation.danglingNodes.length} dangling nodes.
            </p>
            <div className="mt-3 h-[210px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={convergenceData}
                  margin={{ left: 8, right: 14, top: 8, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="iteration" fontSize={10} label={{ value: 'iteration', position: 'insideBottom', offset: -2, fontSize: 10 }} />
                  <YAxis
                    fontSize={10}
                    tickFormatter={(value: number) => value.toFixed(4)}
                    width={54}
                  />
                  <Tooltip formatter={(value) => formatScore(Number(value), 6)} />
                  <Line
                    type="monotone"
                    dataKey="score"
                    name={topPageRank ? 'Top PageRank score' : 'PageRank score'}
                    stroke="#7c3aed"
                    dot={false}
                    strokeWidth={2}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              {topPageRank
                ? `Convergence of ${pageMap.get(topPageRank.pageId)?.title ?? topPageRank.pageId}, the top PageRank page.`
                : 'No PageRank history available.'}
            </p>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2">
              <span className="rounded-xl bg-blue-50 p-2 text-blue-600">
                <Layers size={17} aria-hidden="true" />
              </span>
              <h2 className="text-base font-bold text-slate-950">4. Hybrid blend</h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Hybrid ranking combines normalized content relevance and normalized PageRank. The
              configured weights are divided by their sum, so only relative influence matters.
            </p>
            <Formula className="mt-3">
              <span className="var">S</span>(d) <span className="op">=</span> α
              <span className="op">·</span>K(d) <span className="op">+</span> β
              <span className="op">·</span>P(d)
            </Formula>
            <div className="mt-3 grid grid-cols-2 gap-2 text-center">
              <div className="rounded-xl bg-amber-50 p-2">
                <p className="text-[10px] uppercase tracking-wide text-amber-700">α keyword</p>
                <p className="font-mono text-sm font-bold text-amber-900">{formatPercent(alpha)}</p>
              </div>
              <div className="rounded-xl bg-violet-50 p-2">
                <p className="text-[10px] uppercase tracking-wide text-violet-700">β PageRank</p>
                <p className="font-mono text-sm font-bold text-violet-900">{formatPercent(beta)}</p>
              </div>
            </div>
            {topHybrid ? (
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Recomputed worked example
                </p>
                <p className="mt-1 line-clamp-2 text-xs font-semibold text-slate-800">
                  {pageMap.get(topHybrid.pageId)?.title ?? topHybrid.pageId}
                </p>
                <p className="mt-2 font-mono text-[11px] leading-5 text-slate-600">
                  {formatPercent(alpha)} × {formatScore(topHybrid.keywordScore)} +{' '}
                  {formatPercent(beta)} × {formatScore(topHybrid.normalizedPageRank)} ={' '}
                  <span className="font-bold text-slate-900">
                    {formatScore(workedHybridScore)}
                  </span>
                </p>
                <p className="mt-1 text-[10px] text-slate-400">
                  Pipeline final score: {formatScore(topHybrid.finalScore)}. Differences are
                  floating-point rounding.
                </p>
              </div>
            ) : null}
          </Card>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <Card className="p-5">
            <div className="flex items-center gap-2">
              <span className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
                <Activity size={17} aria-hidden="true" />
              </span>
              <h2 className="text-base font-bold text-slate-950">5. Behavioural ranking</h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Behaviour scores are derived only from observed telemetry. CTR is min-max normalized
              across pages, dwell uses a saturating curve, and bounce rate subtracts a penalty.
            </p>
            <Formula className="mt-3">
              <span className="var">B</span>(d) <span className="op">=</span> 0.5
              <span className="op">·</span>CTR̂(d) <span className="op">+</span> 0.5
              <span className="op">·</span>
              <span className="op">(</span>1 − e<sup>−D/20</sup><span className="op">)</span>
              <span className="op">−</span> 0.3
              <span className="op">·</span>bounce(d)
            </Formula>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              The result is clamped to [0, 1]. Pages with no clicks, dwell, or CTR receive exactly
              zero — there is no synthetic baseline.
            </p>
            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Experimental blend
              </p>
              <p className="mt-2 font-mono text-[11px] leading-5 text-slate-600">
                γ = {formatPercent(expGamma)} behaviour · α = {formatPercent(expAlpha)} keyword ·
                β = {formatPercent(expBeta)} PageRank
              </p>
              {topExperimental && simulationIsCurrent ? (
                <p className="mt-2 font-mono text-[11px] leading-5 text-slate-600">
                  {formatPercent(expAlpha)} × {formatScore(topExperimental.keywordScore)} +{' '}
                  {formatPercent(expBeta)} × {formatScore(topExperimental.normalizedPageRank)} +{' '}
                  {formatPercent(expGamma)} × {formatScore(topExperimental.behaviourScore ?? 0)} ={' '}
                  <span className="font-bold text-slate-900">
                    {formatScore(workedExperimentalScore)}
                  </span>
                </p>
              ) : (
                <p className="mt-2 text-[11px] leading-5 text-amber-700">
                  No current telemetry: the behaviour component is zero. Run the simulator to make
                  this worked example complete.
                </p>
              )}
            </div>
            {simulationRun && runSummary ? (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-slate-50 p-2 text-center">
                  <p className="text-[10px] uppercase tracking-wide text-slate-400">Sessions</p>
                  <p className="font-mono text-sm font-bold text-slate-900">{runSummary.totalSessions}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-2 text-center">
                  <p className="text-[10px] uppercase tracking-wide text-slate-400">Events</p>
                  <p className="font-mono text-sm font-bold text-slate-900">{runSummary.totalEvents}</p>
                </div>
              </div>
            ) : null}
            <div className="mt-3">
              <Link to="/simulator">
                <Button size="sm" variant="secondary">
                  <Play size={13} aria-hidden="true" /> Open simulator
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2">
              <span className="rounded-xl bg-slate-100 p-2 text-slate-600">
                <Workflow size={17} aria-hidden="true" />
              </span>
              <h2 className="text-base font-bold text-slate-950">6. Deterministic simulation</h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              One Mulberry32 stream drives every decision. Surfers scan the SERP, click with a
              position-and-score-weighted probability, dwell proportionally to relevance, scroll,
              follow links, return to the SERP, or end the session at the attention boundary.
            </p>
            <Formula className="mt-3">
              <span className="var">next</span> <span className="op">=</span> Mulberry32(seed)
              <span className="op">,</span> <span className="var">click</span>
              <span className="op">≈</span> p<sub>base</sub>
              <span className="op">·</span>
              <span className="frac">
                <span>1</span>
                <span>1 + 0.22(position − 1)</span>
              </span>
              <span className="op">·</span>(0.65 + 0.35·score)
            </Formula>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-slate-50 p-2">
                <p className="text-[10px] uppercase tracking-wide text-slate-400">Seed</p>
                <p className="font-mono font-semibold text-slate-800">{simulationConfig.randomSeed}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2">
                <p className="text-[10px] uppercase tracking-wide text-slate-400">Surfers</p>
                <p className="font-mono font-semibold text-slate-800">{simulationConfig.userCount}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2">
                <p className="text-[10px] uppercase tracking-wide text-slate-400">Attention</p>
                <p className="font-mono font-semibold text-slate-800">{formatClock(simulationConfig.attentionSpan * 1000)}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2">
                <p className="text-[10px] uppercase tracking-wide text-slate-400">Event types</p>
                <p className="font-mono font-semibold text-slate-800">
                  {Object.keys(SIMULATION_ACTION_LABELS).length}
                </p>
              </div>
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">
              The event log is the source of truth. CTR, dwell, bounce rate, navigation paths, and
              behaviour scores are all derived from that same log.
            </p>
          </Card>
        </div>

        <Card className="mt-5 p-5">
          <div className="flex items-start gap-3">
            <span className="rounded-xl bg-slate-100 p-2 text-slate-600">
              <Braces size={17} aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-950">Reading the current comparison</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                In this corpus, the keyword leader is{' '}
                <strong>{topKeywordPage?.title ?? '—'}</strong>. The PageRank leader is{' '}
                <strong>
                  {topPageRank
                    ? pageMap.get(topPageRank.pageId)?.title ?? topPageRank.pageId
                    : '—'}
                </strong>
                . The hybrid leader is{' '}
                <strong>
                  {topHybrid ? pageMap.get(topHybrid.pageId)?.title ?? topHybrid.pageId : '—'}
                </strong>
                . Behavioural ranking {simulationIsCurrent ? 'currently uses live telemetry' : 'is waiting for a current simulation run'}.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="amber">
                  Keyword #{topKeyword?.position ?? '—'} ·{' '}
                  {formatScore(topKeyword?.finalScore ?? 0)}
                </Badge>
                <Badge variant="violet">
                  PageRank #{topPageRank?.position ?? '—'} ·{' '}
                  {formatScore(topPageRank?.finalScore ?? 0)}
                </Badge>
                <Badge variant="blue">
                  Hybrid #{topHybrid?.position ?? '—'} · {formatScore(topHybrid?.finalScore ?? 0)}
                </Badge>
                <Badge variant="green">
                  {MODE_SHORT_LABELS.experimental} #{topExperimental?.position ?? '—'} ·{' '}
                  {formatScore(topExperimental?.finalScore ?? 0)}
                </Badge>
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-500">
                Behaviour scores currently available: {behaviourScores ? Object.keys(behaviourScores).length : 0}{' '}
                pages. The ranking pipeline uses model-specific scores: keyword-only and
                PageRank-only ignore weights, hybrid uses α and β, and experimental adds γ.
              </p>
            </div>
          </div>
        </Card>

        <div className="mt-5 flex flex-wrap gap-2">
          <Link to="/search">
            <Button variant="secondary" size="sm">
              <Search size={13} aria-hidden="true" /> Try another query
            </Button>
          </Link>
          <Link to="/datasets">
            <Button variant="secondary" size="sm">
              <BookOpen size={13} aria-hidden="true" /> Browse scenarios
            </Button>
          </Link>
          <Link to="/compare">
            <Button variant="dark" size="sm">
              <Sparkles size={13} aria-hidden="true" /> Open comparison lab{' '}
              <ArrowRight size={13} aria-hidden="true" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
