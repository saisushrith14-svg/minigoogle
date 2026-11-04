import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  BarChart3,
  BookOpen,
  Database,
  GitCompare,
  Menu,
  Network,
  Search,
  Users,
  X,
} from 'lucide-react';
import { useApp } from '../../state/AppContext';
import { cn } from '../../utils/cn';
import { SCENARIO_LABELS } from '../../utils/format';

const NAV_ITEMS = [
  { to: '/search', label: 'Search', icon: Search },
  { to: '/graph', label: 'Graph', icon: Network },
  { to: '/simulator', label: 'Simulator', icon: Users },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/compare', label: 'Compare', icon: GitCompare },
  { to: '/learn', label: 'Learn', icon: BookOpen },
  { to: '/datasets', label: 'Datasets', icon: Database },
] as const;

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

export function Layout() {
  const { datasets, datasetId, setDatasetId } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="page-shell flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex shrink-0 items-center gap-2.5" aria-label="MiniGoogle home">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-lg font-bold text-white shadow-sm">
              <span className="bg-gradient-to-br from-blue-400 via-emerald-300 to-amber-300 bg-clip-text text-transparent">
                G
              </span>
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-lg font-bold tracking-tight text-slate-950">
                Mini<span className="text-blue-600">Google</span>
              </span>
              <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Search evolution lab
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Primary">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition',
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                    )
                  }
                >
                  <Icon size={14} aria-hidden="true" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <label htmlFor="global-dataset" className="sr-only">
              Selected dataset
            </label>
            <select
              id="global-dataset"
              value={datasetId}
              onChange={(event) => setDatasetId(event.target.value)}
              className="max-w-[220px] rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {datasets.map((dataset) => (
                <option key={dataset.id} value={dataset.id}>
                  {SCENARIO_LABELS[dataset.scenario]}: {dataset.name.replace(/^Scenario \d+: /, '')}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            onClick={() => setMobileOpen((open) => !open)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {mobileOpen ? (
          <div id="mobile-navigation" className="border-t border-slate-200 bg-white lg:hidden">
            <div className="page-shell grid grid-cols-2 gap-2 py-3">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold',
                        isActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-slate-700 hover:bg-slate-100',
                      )
                    }
                  >
                    <Icon size={16} aria-hidden="true" />
                    {item.label}
                  </NavLink>
                );
              })}
              <label className="col-span-2 mt-1 block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Dataset
                </span>
                <select
                  value={datasetId}
                  onChange={(event) => setDatasetId(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                >
                  {datasets.map((dataset) => (
                    <option key={dataset.id} value={dataset.id}>
                      {SCENARIO_LABELS[dataset.scenario]}: {dataset.name.replace(/^Scenario \d+: /, '')}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        ) : null}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="mt-12 border-t border-slate-200 bg-white">
        <div className="page-shell flex flex-col gap-4 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">MiniGoogle</p>
            <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500">
              An educational, fully local search-engine evolution simulator. Every score, event,
              and chart is computed from the real algorithms in this repository — no network
              requests and no synthetic metrics.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-500">
            <Link to="/learn" className="hover:text-blue-700">
              Mathematics
            </Link>
            <Link to="/datasets" className="hover:text-blue-700">
              Datasets
            </Link>
            <Link to="/compare" className="hover:text-blue-700">
              Ranking lab
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
