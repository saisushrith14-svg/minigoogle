import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  BarChart3,
  BookOpen,
  Database,
  FileText,
  FlaskConical,
  GitCompare,
  Globe2,
  Layers,
  Link2,
  Network,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import type { RankingMode } from '../types';
import { useApp } from '../state/AppContext';
import { buildGraphTopology } from '../utils/graphUtils';
import { MODE_DESCRIPTIONS, MODE_LABELS, SCENARIO_LABELS, formatScore } from '../utils/format';
import { Badge, Button, Card, SectionHeading } from '../components/ui/Primitives';
import { SearchBar } from '../components/search/SearchBar';

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

const SCENARIO_ICONS = {
  'keyword-stuffing': FileText,
  'authority-problem': Globe2,
  'link-farm': Link2,
  'new-website': Sparkles,
  'relevance-vs-popularity': TrendingUp,
  'scientific-network': FlaskConical,
} as const;

const MODES: readonly RankingMode[] = ['keyword', 'pagerank', 'hybrid', 'experimental'];

export function HomePage() {
  const {
    dataset,
    datasets,
    setDatasetId,
    query,
    comparison,
    searchResponse,
    setMode,
    simulationIsCurrent,
  } = useApp();
  const navigate = useNavigate();
  const topology = buildGraphTopology(dataset.pages);
  const linkCount = Object.values(topology.outDegree).reduce((sum, value) => sum + value, 0);
  const pageMap = new Map(dataset.pages.map((page) => [page.id, page]));
  const topResult = searchResponse.results[0];
  const topPage = topResult ? pageMap.get(topResult.pageId) : undefined;

  const openDataset = (id: string) => {
    setDatasetId(id);
    navigate('/search');
  };

  return (
    <div className="page-section">
      <div className="page-shell space-y-10">
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:items-stretch">
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-100/70 blur-2xl" />
            <div className="relative">
              <Badge variant="blue">
                <Sparkles size={12} aria-hidden="true" /> Interactive search evolution lab
              </Badge>
              <h1 className="mt-4 max-w-2xl text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                See how search learned to <span className="text-blue-600">rank the web.</span>
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                Run the same query through 1990s keyword matching, 1998 PageRank, configurable
                hybrid ranking, and simulated surfer behaviour. Every score on this site comes
                from the algorithms in the repository, computed locally.
              </p>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/80 p-3">
                <SearchBar />
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <Link to="/search">
                  <Button>
                    Explore results <ArrowRight size={15} aria-hidden="true" />
                  </Button>
                </Link>
                <Link to="/compare">
                  <Button variant="secondary">
                    <GitCompare size={15} aria-hidden="true" /> Compare algorithms
                  </Button>
                </Link>
                <Link to="/learn">
                  <Button variant="ghost">
                    <BookOpen size={15} aria-hidden="true" /> Read the mathematics
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <Card className="flex flex-col justify-between gap-5 p-6">
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
                    Current corpus
                  </p>
                  <h2 className="mt-1 text-lg font-bold text-slate-950">
                    {dataset.name.replace(/^Scenario \d+: /, '')}
                  </h2>
                </div>
                <Badge variant="neutral">{SCENARIO_LABELS[dataset.scenario]}</Badge>
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-500">{dataset.description}</p>
            </div>

            <dl className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 p-3">
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Pages
                </dt>
                <dd className="mt-1 text-xl font-bold text-slate-950">{dataset.pages.length}</dd>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Hyperlinks
                </dt>
                <dd className="mt-1 text-xl font-bold text-slate-950">{linkCount}</dd>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  PageRank loops
                </dt>
                <dd className="mt-1 text-xl font-bold text-slate-950">
                  {searchResponse.pageRankComputation.iterations}
                </dd>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Surfer telemetry
                </dt>
                <dd className="mt-1 text-sm font-bold text-slate-950">
                  {simulationIsCurrent ? 'Current run available' : 'Not run yet'}
                </dd>
              </div>
            </dl>

            <div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Top result for “{query || 'empty query'}”
                </p>
                <Badge variant="green">Live</Badge>
              </div>
              {topPage && topResult ? (
                <div className="mt-2 rounded-xl border border-slate-200 p-3">
                  <p className="line-clamp-2 text-sm font-semibold text-slate-900">
                    {topPage.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    #{topResult.position} · score {formatScore(topResult.finalScore)} ·{' '}
                    {topPage.category}
                  </p>
                </div>
              ) : (
                <p className="mt-2 text-xs text-slate-500">No pages available to rank.</p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Link to="/graph">
                <Button size="sm" variant="secondary">
                  <Network size={13} aria-hidden="true" /> Open graph
                </Button>
              </Link>
              <Link to="/simulator">
                <Button size="sm" variant="secondary">
                  <Activity size={13} aria-hidden="true" /> Run surfers
                </Button>
              </Link>
              <Link to="/datasets">
                <Button size="sm" variant="ghost">
                  <Database size={13} aria-hidden="true" /> All datasets
                </Button>
              </Link>
            </div>
          </Card>
        </section>

        <section>
          <SectionHeading
            eyebrow="Same query, four worldviews"
            title="The ranking result changes with the model"
            description={`Live top three pages for “${query || 'empty query'}”. Expand any card to inspect the same algorithm on the search page.`}
            actions={
              <Link to="/compare">
                <Button variant="dark" size="sm">
                  <GitCompare size={14} aria-hidden="true" /> Full comparison
                </Button>
              </Link>
            }
          />
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {MODES.map((item) => {
              const Icon = MODE_ICONS[item];
              const results = comparison.resultsByMode[item].slice(0, 3);
              return (
                <Card key={item} className="flex flex-col p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="rounded-xl bg-slate-100 p-2 text-slate-600">
                        <Icon size={16} aria-hidden="true" />
                      </span>
                      <h3 className="text-sm font-bold text-slate-900">{MODE_LABELS[item]}</h3>
                    </div>
                    <Badge variant={MODE_TONES[item]}>{results.length} shown</Badge>
                  </div>
                  <p className="mt-2 min-h-[40px] text-[11px] leading-4 text-slate-500">
                    {MODE_DESCRIPTIONS[item]}
                  </p>
                  <ol className="mt-3 flex-1 space-y-2">
                    {results.map((result) => {
                      const page = pageMap.get(result.pageId);
                      return (
                        <li
                          key={result.pageId}
                          className="flex items-start gap-2 rounded-lg bg-slate-50 px-2.5 py-2"
                        >
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-white font-mono text-[10px] font-bold text-slate-500 ring-1 ring-slate-200">
                            {result.position}
                          </span>
                          <div className="min-w-0">
                            <p className="line-clamp-2 text-[11px] font-semibold leading-4 text-slate-700">
                              {page?.title ?? result.pageId}
                            </p>
                            <p className="mt-0.5 font-mono text-[10px] text-slate-400">
                              {formatScore(result.finalScore)}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                  <Link to="/search" className="mt-3 block">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="w-full"
                      onClick={() => setMode(item)}
                    >
                      View in search
                    </Button>
                  </Link>
                </Card>
              );
            })}
          </div>
        </section>

        <section>
          <SectionHeading
            eyebrow="Six curated scenarios"
            title="Each dataset isolates a classic failure mode"
            description="Select a corpus, then move between models to see which pages gain and lose rank."
            actions={
              <Link to="/datasets">
                <Button variant="secondary" size="sm">
                  <Database size={14} aria-hidden="true" /> Browse datasets
                </Button>
              </Link>
            }
          />
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {datasets.map((item) => {
              const Icon = SCENARIO_ICONS[item.scenario];
              const active = item.id === dataset.id;
              return (
                <Card
                  key={item.id}
                  className={
                    active
                      ? 'border-blue-300 p-5 ring-2 ring-blue-100'
                      : 'p-5 transition hover:border-slate-300'
                  }
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="rounded-xl bg-slate-100 p-2 text-slate-600">
                      <Icon size={17} aria-hidden="true" />
                    </span>
                    {active ? <Badge variant="blue">Selected</Badge> : null}
                  </div>
                  <h3 className="mt-3 text-sm font-bold text-slate-950">
                    {item.name.replace(/^Scenario \d+: /, '')}
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{item.description}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <Badge variant="neutral">{item.pages.length} pages</Badge>
                    <Badge variant="neutral">{SCENARIO_LABELS[item.scenario]}</Badge>
                    {item.defaultQuery ? (
                      <Badge variant="amber">“{item.defaultQuery}”</Badge>
                    ) : null}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" variant={active ? 'primary' : 'secondary'} onClick={() => openDataset(item.id)}>
                      {active ? 'Open search' : 'Use dataset'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setDatasetId(item.id);
                        navigate('/datasets');
                      }}
                    >
                      Details <ArrowRight size={12} aria-hidden="true" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
                The complete loop
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight">
                Query → rank → simulate → measure → re-rank
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
                The deterministic surfer simulation records every search, click, dwell, scroll and
                return. Analytics are derived from that event log, behaviour scores are derived
                from analytics, and behavioural ranking consumes those scores. There are no
                simulated metrics outside this loop.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to="/simulator">
                <Button variant="primary" size="sm">
                  <Activity size={14} aria-hidden="true" /> Simulator
                </Button>
              </Link>
              <Link to="/analytics">
                <Button variant="secondary" size="sm">
                  <BarChart3 size={14} aria-hidden="true" /> Analytics
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
