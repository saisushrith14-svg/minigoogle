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
  const {
    datasets,
    datasetId,
    setDatasetId,
    isAdvancedMode,
    toggleAdvancedMode,
    actionFeedback,
    setActionFeedback,
  } = useApp();

  return (
    <div className="flex min-h-screen flex-col bg-white text-black font-sans">
      <ScrollToTop />
      {/* 1998 Authentic Google / Stanford Header */}
      <header className="w-full bg-white pt-2">
        <div className="max-w-[820px] mx-auto px-4 flex flex-col sm:flex-row sm:items-center justify-between text-[13px] gap-2">
          <nav className="flex flex-wrap items-center gap-x-2 gap-y-1 font-sans" aria-label="Primary">
            <NavLink
              to="/tour"
              className={({ isActive }) =>
                `px-1.5 py-0.5 font-bold text-xs ${
                  isActive
                    ? 'bg-[#0000CC] text-white'
                    : 'bg-[#FFF9E6] text-[#B06000] border border-[#D0A600]'
                }`
              }
            >
              ★ Start Here
            </NavLink>
            <span className="text-[#808080]">|</span>
            <NavLink
              to="/search"
              aria-label="Search"
              className={({ isActive }) =>
                isActive ? 'font-bold text-[#0000CC] underline' : 'text-[#0000CC] underline'
              }
            >
              Search
            </NavLink>
            <span className="text-[#808080]">|</span>
            <NavLink
              to="/datasets"
              aria-label="Datasets"
              className={({ isActive }) =>
                isActive ? 'font-bold text-[#0000CC] underline' : 'text-[#0000CC] underline'
              }
            >
              Explore Websites
            </NavLink>
            <span className="text-[#808080]">|</span>
            <NavLink
              to="/compare"
              aria-label="Compare"
              className={({ isActive }) =>
                isActive ? 'font-bold text-[#0000CC] underline' : 'text-[#0000CC] underline'
              }
            >
              Compare Rankings
            </NavLink>
            <span className="text-[#808080]">|</span>
            <NavLink
              to="/simulator"
              aria-label="Simulation"
              className={({ isActive }) =>
                isActive ? 'font-bold text-[#0000CC] underline' : 'text-[#0000CC] underline'
              }
            >
              Browsing Simulator
            </NavLink>
            <span className="text-[#808080]">|</span>
            <NavLink
              to="/ocean"
              aria-label="Ocean Surfer"
              className={({ isActive }) =>
                isActive ? 'font-bold text-[#0000CC] underline' : 'text-[#0000CC] underline'
              }
            >
              🏄 Ocean Surfer
            </NavLink>
            <span className="text-[#808080]">|</span>
            <NavLink
              to="/learn"
              aria-label="Learn"
              className={({ isActive }) =>
                isActive ? 'font-bold text-[#0000CC] underline' : 'text-[#0000CC] underline'
              }
            >
              How It Works
            </NavLink>
          </nav>

          <div className="flex items-center space-x-2 self-end sm:self-auto">
            {/* Mode switch */}
            <button
              type="button"
              onClick={toggleAdvancedMode}
              className={`btn-retro text-xs py-0.5 px-2 ${
                isAdvancedMode ? 'bg-[#FFFFF0] border-[#0000CC] font-bold' : ''
              }`}
              title="Toggle between beginner qualitative view and raw algorithm details"
            >
              {isAdvancedMode ? '🔬 Advanced Mode' : '🌱 Beginner Mode'}
            </button>

            <label htmlFor="global-dataset" className="sr-only">
              Selected dataset
            </label>
            <select
              id="global-dataset"
              aria-label="Selected dataset"
              value={datasetId}
              onChange={(e) => setDatasetId(e.target.value)}
              className="select-retro max-w-[180px] text-xs"
            >
              {datasets.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name.replace(/^Scenario \d+: /, '')}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Feedback Notification Bar */}
        {actionFeedback && (
          <div className="max-w-[820px] mx-auto px-4 mt-2">
            <div className="p-1.5 bg-[#EDFFE1] border border-[#008000] text-xs flex justify-between items-center text-black font-sans">
              <span>
                <b className="text-[#006000]">Action:</b> {actionFeedback}
              </span>
              <button
                type="button"
                onClick={() => setActionFeedback(null)}
                className="text-xs text-[#808080] hover:text-black ml-2 font-bold"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <div className="max-w-[820px] mx-auto px-4 mt-2">
          <hr className="w-full border-t border-[#808080]" />
        </div>
      </header>

      {/* Main Page Area */}
      <main className="w-full flex-1 max-w-[820px] mx-auto px-4 py-4">
        <Outlet />
      </main>

      {/* 1998 Authentic Footer */}
      <footer className="w-full max-w-[820px] mx-auto px-4 pb-6 pt-4 text-center text-xs text-[#555555]">
        <hr className="w-full border-t border-[#808080] mb-3" />
        <p className="mb-2">Copyright ©1997-1998 Stanford University / MiniGoogle Prototype</p>
        <div className="flex items-center justify-center space-x-3">
          <Link to="/" className="text-[#0000CC] underline">
            About MiniGoogle
          </Link>
          <span className="text-[#808080]">|</span>
          <Link to="/tour" className="text-[#0000CC] underline font-bold">
            Guided Tour
          </Link>
          <span className="text-[#808080]">|</span>
          <Link to="/datasets" className="text-[#0000CC] underline">
            Example Websites
          </Link>
          <span className="text-[#808080]">|</span>
          <Link to="/learn" className="text-[#0000CC] underline">
            How It Works
          </Link>
          <span className="text-[#808080]">|</span>
          <button
            type="button"
            onClick={toggleAdvancedMode}
            className="text-[#0000CC] underline"
          >
            {isAdvancedMode ? 'Switch to Beginner' : 'Show Advanced Details'}
          </button>
        </div>
      </footer>
    </div>
  );
}
