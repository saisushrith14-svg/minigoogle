import { useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useApp } from '../../state/AppContext';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

export function Layout() {
  const { datasets, datasetId, setDatasetId } = useApp();

  return (
    <div className="flex min-h-screen flex-col bg-white text-black font-sans">
      <ScrollToTop />
      {/* 1998 Authentic Google / Stanford Header */}
      <header className="w-full bg-white pt-2">
        <div className="max-w-[780px] mx-auto px-4 flex items-center justify-between text-[13px]">
          <nav className="flex items-center space-x-2 font-sans" aria-label="Primary">
            <NavLink
              to="/search"
              className={({ isActive }) =>
                isActive ? 'font-bold text-[#0000CC] underline' : 'text-[#0000CC] underline'
              }
            >
              Search
            </NavLink>
            <span className="text-[#808080]">|</span>
            <NavLink
              to="/datasets"
              className={({ isActive }) =>
                isActive ? 'font-bold text-[#0000CC] underline' : 'text-[#0000CC] underline'
              }
            >
              Datasets
            </NavLink>
            <span className="text-[#808080]">|</span>
            <NavLink
              to="/graph"
              className={({ isActive }) =>
                isActive ? 'font-bold text-[#0000CC] underline' : 'text-[#0000CC] underline'
              }
            >
              Graph
            </NavLink>
            <span className="text-[#808080]">|</span>
            <NavLink
              to="/simulator"
              className={({ isActive }) =>
                isActive ? 'font-bold text-[#0000CC] underline' : 'text-[#0000CC] underline'
              }
            >
              Simulation
            </NavLink>
            <span className="text-[#808080]">|</span>
            <NavLink
              to="/analytics"
              className={({ isActive }) =>
                isActive ? 'font-bold text-[#0000CC] underline' : 'text-[#0000CC] underline'
              }
            >
              Analytics
            </NavLink>
            <span className="text-[#808080]">|</span>
            <NavLink
              to="/compare"
              aria-label="Compare"
              className={({ isActive }) =>
                isActive ? 'font-bold text-[#0000CC] underline' : 'text-[#0000CC] underline'
              }
            >
              Compare
            </NavLink>
            <span className="text-[#808080]">|</span>
            <NavLink
              to="/learn"
              className={({ isActive }) =>
                isActive ? 'font-bold text-[#0000CC] underline' : 'text-[#0000CC] underline'
              }
            >
              Learn
            </NavLink>
          </nav>

          <div className="flex items-center space-x-2">
            <label htmlFor="global-dataset" className="sr-only">
              Selected dataset
            </label>
            <select
              id="global-dataset"
              aria-label="Selected dataset"
              value={datasetId}
              onChange={(e) => setDatasetId(e.target.value)}
              className="select-retro max-w-[200px]"
            >
              {datasets.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <div
              className="w-7 h-7 rounded-full bg-[#00008B] flex items-center justify-center text-white text-xs select-none"
              title="Stanford CS276 Research User"
            >
              👤
            </div>
          </div>
        </div>
        <div className="max-w-[780px] mx-auto px-4 mt-2">
          <hr className="w-full border-t border-[#808080]" />
        </div>
      </header>

      {/* Main Page Area */}
      <main className="w-full flex-1 max-w-[780px] mx-auto px-4 py-4">
        <Outlet />
      </main>

      {/* 1998 Authentic Footer */}
      <footer className="w-full max-w-[780px] mx-auto px-4 pb-6 pt-4 text-center text-xs text-[#555555]">
        <hr className="w-full border-t border-[#808080] mb-3" />
        <p className="mb-2">Copyright ©1997-1998 Stanford University / MiniGoogle Prototype</p>
        <div className="flex items-center justify-center space-x-3">
          <Link to="/" className="text-[#0000CC] underline">
            About MiniGoogle
          </Link>
          <span className="text-[#808080]">|</span>
          <Link to="/datasets" className="text-[#0000CC] underline">
            Stanford Search
          </Link>
          <span className="text-[#808080]">|</span>
          <Link to="/learn" className="text-[#0000CC] underline">
            How PageRank Works
          </Link>
          <span className="text-[#808080]">|</span>
          <Link to="/learn" className="text-[#0000CC] underline">
            Help
          </Link>
        </div>
      </footer>
    </div>
  );
}
