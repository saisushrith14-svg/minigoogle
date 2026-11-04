import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Database,
  ExternalLink,
  FileText,
  FlaskConical,
  Globe2,
  Link2,
  Network,
  Search,
  Sparkles,
  Star,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../state/AppContext';
import { cn } from '../utils/cn';
import { buildGraphTopology } from '../utils/graphUtils';
import { SCENARIO_LABELS } from '../utils/format';
import { Badge, Button, Card, SectionHeading } from '../components/ui/Primitives';

const SCENARIO_ICONS = {
  'keyword-stuffing': FileText,
  'authority-problem': Globe2,
  'link-farm': Link2,
  'new-website': Sparkles,
  'relevance-vs-popularity': TrendingUp,
  'scientific-network': FlaskConical,
} as const;

export function DatasetsPage() {
  const { datasets, dataset, datasetId, setDatasetId, setQuery } = useApp();
  const navigate = useNavigate();
  const topology = useMemo(() => buildGraphTopology(dataset.pages), [dataset.pages]);
  const pageMap = useMemo(
    () => new Map(dataset.pages.map((page) => [page.id, page])),
    [dataset.pages],
  );
  const linkCount = Object.values(topology.outDegree).reduce((sum, value) => sum + value, 0);
  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    dataset.pages.forEach((page) => {
      counts.set(page.category, (counts.get(page.category) ?? 0) + 1);
    });
    return Array.from(counts.entries()).sort(
      (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
    );
  }, [dataset.pages]);

  const openSearch = (nextDatasetId: string) => {
    setDatasetId(nextDatasetId);
    navigate('/search');
  };

  const runQuery = (query: string) => {
    setQuery(query);
    navigate('/search');
  };

  return (
    <div className="page-section">
      <div className="page-shell">
        <SectionHeading
          eyebrow={`Dataset collection · ${datasets.length} scenarios`}
          title="Curated search corpora"
          description="Each corpus is a small, hand-built directed web graph designed to isolate one ranking phenomenon. Select a dataset to make it active everywhere in the lab."
          actions={
            <Link to="/search">
              <Button variant="dark" size="sm">
                <Search size={14} aria-hidden="true" /> Search current dataset
              </Button>
            </Link>
          }
        />

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {datasets.map((item) => {
            const Icon = SCENARIO_ICONS[item.scenario];
            const active = item.id === datasetId;
            return (
              <Card
                key={item.id}
                className={cn(
                  'flex flex-col p-5',
                  active ? 'border-blue-300 ring-2 ring-blue-100' : 'hover:border-slate-300',
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="rounded-xl bg-slate-100 p-2 text-slate-600">
                    <Icon size={17} aria-hidden="true" />
                  </span>
                  {active ? (
                    <Badge variant="blue">Active everywhere</Badge>
                  ) : (
                    <Badge variant="neutral">{SCENARIO_LABELS[item.scenario]}</Badge>
                  )}
                </div>
                <h2 className="mt-3 text-sm font-bold text-slate-950">
                  {item.name.replace(/^Scenario \d+: /, '')}
                </h2>
                <p className="mt-1 flex-1 text-xs leading-5 text-slate-500">{item.description}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <Badge variant="neutral">{item.pages.length} pages</Badge>
                  {item.defaultQuery ? (
                    <Badge variant="amber">“{item.defaultQuery}”</Badge>
                  ) : null}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={active ? 'primary' : 'secondary'}
                    onClick={() => setDatasetId(item.id)}
                    aria-label={`Use dataset: ${item.name.replace(/^Scenario \d+: /, '')}`}
                  >
                    {active ? 'Selected' : 'Select'}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openSearch(item.id)}
                  >
                    Open search <ArrowRight size={12} aria-hidden="true" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 space-y-4">
            <Card className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
                    {SCENARIO_LABELS[dataset.scenario]}
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-slate-950">
                    {dataset.name.replace(/^Scenario \d+: /, '')}
                  </h2>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                    {dataset.description}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link to="/search">
                    <Button size="sm">
                      <Search size={13} aria-hidden="true" /> Open search
                    </Button>
                  </Link>
                  <Link to="/graph">
                    <Button size="sm" variant="secondary">
                      <Network size={13} aria-hidden="true" /> Open graph
                    </Button>
                  </Link>
                </div>
              </div>

              {dataset.educationalNotes ? (
                <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
                  <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-blue-800">
                    <Sparkles size={13} aria-hidden="true" /> What to watch for
                  </p>
                  <p className="mt-1 text-sm leading-6 text-blue-900">{dataset.educationalNotes}</p>
                </div>
              ) : null}

              <div className="mt-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Test queries
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {[
                    dataset.defaultQuery,
                    ...(dataset.testQueries ?? []),
                  ]
                    .filter((value): value is string => Boolean(value))
                    .filter((value, index, values) => values.indexOf(value) === index)
                    .map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => runQuery(value)}
                        className={cn(
                          'rounded-full border px-2.5 py-1 text-xs font-medium transition',
                          value === dataset.defaultQuery
                            ? 'border-amber-200 bg-amber-50 text-amber-800 hover:border-amber-300'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900',
                        )}
                      >
                        {value}
                      </button>
                    ))}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Pages
                  </p>
                  <p className="mt-1 text-lg font-bold text-slate-950">{dataset.pages.length}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Links
                  </p>
                  <p className="mt-1 text-lg font-bold text-slate-950">{linkCount}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Dangling
                  </p>
                  <p className="mt-1 text-lg font-bold text-slate-950">
                    {topology.danglingNodes.length}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Categories
                  </p>
                  <p className="mt-1 text-lg font-bold text-slate-950">{categoryCounts.length}</p>
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-slate-900">Pages in this corpus</h2>
                <Badge variant="neutral">{dataset.pages.length} documents</Badge>
              </div>
              <div className="scrollbar-thin mt-3 overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-500">
                      <th className="px-2 py-2 font-semibold">Page</th>
                      <th className="px-2 py-2 font-semibold">Category</th>
                      <th className="px-2 py-2 text-right font-semibold">In</th>
                      <th className="px-2 py-2 text-right font-semibold">Out</th>
                      <th className="px-2 py-2 font-semibold">Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataset.pages.map((page) => {
                      const keyPage = (dataset.keyPageIds ?? []).includes(page.id);
                      return (
                        <tr key={page.id} className="border-b border-slate-100 last:border-0">
                          <td className="max-w-[300px] px-2 py-2.5">
                            <Link
                              to={`/graph?page=${encodeURIComponent(page.id)}`}
                              className="group block"
                            >
                              <span className="flex items-center gap-1.5">
                                {keyPage ? (
                                  <Star
                                    size={11}
                                    className="shrink-0 text-emerald-600"
                                    aria-hidden="true"
                                  />
                                ) : null}
                                <span className="line-clamp-1 font-medium text-slate-700 group-hover:text-blue-700">
                                  {page.title}
                                </span>
                              </span>
                              <span className="mt-0.5 flex items-center gap-1 break-all text-[10px] text-emerald-700">
                                <ExternalLink size={9} aria-hidden="true" /> {page.url}
                              </span>
                            </Link>
                          </td>
                          <td className="px-2 py-2.5">
                            <Badge variant="neutral">{page.category}</Badge>
                          </td>
                          <td className="px-2 py-2.5 text-right font-mono text-slate-600">
                            {topology.inDegree[page.id] ?? 0}
                          </td>
                          <td className="px-2 py-2.5 text-right font-mono text-slate-600">
                            {topology.outDegree[page.id] ?? 0}
                          </td>
                          <td className="max-w-[260px] px-2 py-2.5 text-[11px] leading-4 text-slate-500">
                            {page.educationalRole ?? '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          <aside className="space-y-4">
            <Card className="p-4">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Database size={15} className="text-blue-600" aria-hidden="true" /> Key pages
              </h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                These pages are highlighted in results and in the graph.
              </p>
              <div className="mt-3 space-y-2">
                {(dataset.keyPageIds ?? []).map((pageId) => {
                  const page = pageMap.get(pageId);
                  if (!page) return null;
                  return (
                    <Link
                      key={pageId}
                      to={`/graph?page=${encodeURIComponent(pageId)}`}
                      className="block rounded-xl border border-slate-200 p-3 transition hover:border-slate-300"
                    >
                      <p className="line-clamp-2 text-xs font-semibold leading-5 text-slate-800">
                        {page.title}
                      </p>
                      <p className="mt-1 text-[10px] text-slate-500">{page.category}</p>
                    </Link>
                  );
                })}
                {(dataset.keyPageIds ?? []).length === 0 ? (
                  <p className="text-xs text-slate-400">No key pages declared.</p>
                ) : null}
              </div>
            </Card>

            <Card className="p-4">
              <h2 className="text-sm font-semibold text-slate-900">Category distribution</h2>
              <div className="mt-3 space-y-2">
                {categoryCounts.map(([category, count]) => (
                  <div key={category}>
                    <div className="flex items-center justify-between gap-2 text-[11px]">
                      <span className="truncate text-slate-600">{category}</span>
                      <span className="font-mono text-slate-500">{count}</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-blue-500"
                        style={{ width: `${(count / Math.max(1, dataset.pages.length)) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4">
              <h2 className="text-sm font-semibold text-slate-900">Dataset facts</h2>
              <dl className="mt-2 space-y-2 text-xs">
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500">Identifier</dt>
                  <dd className="font-mono text-slate-700">{dataset.id}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500">Scenario</dt>
                  <dd className="text-right font-medium text-slate-700">
                    {SCENARIO_LABELS[dataset.scenario]}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500">Default query</dt>
                  <dd className="text-right font-medium text-slate-700">
                    {dataset.defaultQuery ?? '—'}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500">Key pages</dt>
                  <dd className="font-mono text-slate-700">{dataset.keyPageIds?.length ?? 0}</dd>
                </div>
              </dl>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
