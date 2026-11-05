import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../state/AppContext';
import { buildGraphTopology } from '../utils/graphUtils';
import { SCENARIO_LABELS } from '../utils/format';

export function DatasetsPage() {
  const { datasets, dataset, datasetId, setDatasetId, setQuery, searchResponse } = useApp();
  const navigate = useNavigate();

  const [showExport, setShowExport] = useState(false);
  const topology = useMemo(() => buildGraphTopology(dataset.pages), [dataset.pages]);
  const linkCount = Object.values(topology.outDegree).reduce((sum, value) => sum + value, 0);

  const openSearch = (nextDatasetId: string) => {
    setDatasetId(nextDatasetId);
    navigate('/search');
  };

  const runQuery = (q: string) => {
    setQuery(q);
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  // Generate ASCII adjacency matrix for export modal
  const asciiDump = useMemo(() => {
    const lines: string[] = [
      `# STANFORD CS276 LAB BENCHMARK DUMP: 1998-11-20`,
      `# DATASET: ${dataset.name}`,
      `# NODES = ${dataset.pages.length}, EDGES = ${linkCount}, DAMPING = 0.85`,
      `# FORMAT: SRC_INDEX DEST_INDEX TRANSITION_WEIGHT`,
    ];
    dataset.pages.forEach((page, srcIdx) => {
      const out = page.links;
      const weight = out.length > 0 ? (1 / out.length).toFixed(6) : '0.000000';
      out.forEach((destId) => {
        const destIdx = dataset.pages.findIndex((p) => p.id === destId);
        lines.push(`${srcIdx} ${destIdx} ${weight} # ${page.url} -> ${destId}`);
      });
    });
    lines.push(`# CONVERGED IN ${searchResponse.pageRankComputation.iterations} POWER ITERATIONS.`);
    return lines.join('\n');
  }, [dataset, linkCount, searchResponse.pageRankComputation.iterations]);

  return (
    <div className="w-full flex flex-col font-sans text-black">
      {/* Page Header */}
      <div className="mb-3">
        <div className="text-[11px] font-mono text-[#0000CC] font-bold uppercase mb-0.5">
          Stanford CS276 Lab: Benchmark Dataset Explorer (1998)
        </div>
        <h1 className="text-xl font-bold font-serif text-black leading-tight">
          Curated search corpora
        </h1>
        <p className="text-xs text-[#555555] italic">
          Anatomy of web hyperlink graphs under Markov random surfer stationary distributions.
          Host: <span className="font-bold text-[#0000CC]">navajo.stanford.edu:8080/pr-lab/</span> |
          Damping α = 0.850 | ε = 1.0e-7
        </p>
      </div>

      <hr className="w-full border-t border-[#808080] mb-3" />

      {/* Control Console Table */}
      <table className="table-retro text-xs w-full mb-4">
        <tbody>
          <tr className="bg-[#EFEFEF]">
            <td colSpan={2} className="font-bold text-black font-sans p-2">
              Control Console: Hyperlink Topology & Stochastic Transition Setup
            </td>
          </tr>
          <tr>
            <td className="w-1/3 font-bold bg-[#FAFAFA] p-2">Active Benchmark Corpus:</td>
            <td className="p-2">
              <select
                aria-label="Active benchmark dataset"
                className="select-retro w-full max-w-[420px] py-1 text-xs"
                value={datasetId}
                onChange={(e) => setDatasetId(e.target.value)}
              >
                {datasets.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </td>
          </tr>
          <tr>
            <td className="font-bold bg-[#FAFAFA] p-2">Stationary Execution:</td>
            <td className="p-2">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => openSearch(datasetId)}
                  className="btn-retro text-xs py-0.5 px-2"
                >
                  Search Corpus »
                </button>
                <Link to="/graph" className="btn-retro text-xs py-0.5 px-2">
                  View Graph Topology »
                </Link>
                <button
                  type="button"
                  onClick={() => setShowExport(true)}
                  className="btn-retro text-xs py-0.5 px-2"
                >
                  Export Matrix (ASCII)
                </button>
                <span className="font-mono text-[11px] text-[#0000CC] font-bold ml-1">
                  Status: Stationary (k={searchResponse.pageRankComputation.iterations}, Δ &lt; 1.0e-6)
                </span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ASCII Export Modal */}
      {showExport && (
        <div
          className="mb-4 p-3 bg-[#EEEEEE] text-xs font-sans"
          style={{ border: '2px solid #000000' }}
        >
          <div className="flex justify-between items-center mb-1">
            <span className="font-bold text-black font-mono">
              ASCII Hyperlink Adjacency Matrix Export:
            </span>
            <button
              type="button"
              onClick={() => setShowExport(false)}
              className="btn-retro text-xs py-0.5 px-2"
            >
              [Close Window]
            </button>
          </div>
          <pre className="bg-white p-2 border border-[#808080] font-mono text-[11px] overflow-x-auto max-h-48 leading-tight">
            {asciiDump}
          </pre>
        </div>
      )}

      {/* Active Corpus Detailed View */}
      <div className="mb-4 p-3 bg-[#F8F9FA] border border-[#808080] text-xs">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-2">
          <div>
            <div className="text-[11px] font-bold font-mono text-[#0000CC]">
              {SCENARIO_LABELS[dataset.scenario]}
            </div>
            <h2 className="text-base font-bold font-serif text-black">{dataset.name}</h2>
            <p className="text-xs text-[#555555]">{dataset.description}</p>
          </div>
          <div className="flex space-x-2">
            <Link to="/search" className="btn-retro text-xs py-0.5 px-2">
              Open Search »
            </Link>
            <Link to="/graph" className="btn-retro text-xs py-0.5 px-2">
              Open Graph »
            </Link>
          </div>
        </div>

        {/* What to watch for educational note (matches test) */}
        {dataset.educationalNotes && (
          <div
            className="p-2.5 bg-[#EDFFE1] mb-3 text-xs leading-normal"
            style={{ border: '1px solid #008000' }}
          >
            <b className="text-[#006000]">What to watch for:</b> {dataset.educationalNotes}
          </div>
        )}

        {/* Test Queries */}
        <div className="mb-3">
          <span className="font-bold text-black mr-2">Test queries:</span>
          <div className="inline-flex flex-wrap gap-1.5 mt-1">
            {[dataset.defaultQuery, ...(dataset.testQueries ?? [])]
              .filter((v): v is string => Boolean(v))
              .filter((v, i, a) => a.indexOf(v) === i)
              .map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => runQuery(q)}
                  className="btn-retro text-xs py-0.5 px-2 text-[#0000CC]"
                >
                  “{q}”
                </button>
              ))}
          </div>
        </div>

        {/* Quick Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-center">
          <div className="bg-white p-2 border border-[#CCCCCC]">
            <div className="text-[10px] text-[#777777]">PAGES</div>
            <div className="text-sm font-bold text-black">{dataset.pages.length}</div>
          </div>
          <div className="bg-white p-2 border border-[#CCCCCC]">
            <div className="text-[10px] text-[#777777]">HYPERLINKS</div>
            <div className="text-sm font-bold text-black">{linkCount}</div>
          </div>
          <div className="bg-white p-2 border border-[#CCCCCC]">
            <div className="text-[10px] text-[#777777]">DANGLING NODES</div>
            <div className="text-sm font-bold text-black">{topology.danglingNodes.length}</div>
          </div>
          <div className="bg-white p-2 border border-[#CCCCCC]">
            <div className="text-[10px] text-[#777777]">CONVERGENCE (k)</div>
            <div className="text-sm font-bold text-[#0000CC]">
              {searchResponse.pageRankComputation.iterations}
            </div>
          </div>
        </div>
      </div>

      {/* Pages in this Corpus Table */}
      <div className="mb-6">
        <h2 className="font-bold text-sm text-black font-serif mb-1">
          Pages in this corpus ({dataset.pages.length} documents)
        </h2>
        <div className="overflow-x-auto">
          <table className="table-retro text-xs w-full">
            <thead>
              <tr className="bg-[#EFEFEF] text-black">
                <th className="p-1 border border-[#808080] text-left">Document Title</th>
                <th className="p-1 border border-[#808080] text-left">URL</th>
                <th className="p-1 border border-[#808080] text-left">Category</th>
                <th className="p-1 border border-[#808080] text-right">In</th>
                <th className="p-1 border border-[#808080] text-right">Out</th>
                <th className="p-1 border border-[#808080] text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {dataset.pages.map((p) => {
                const isKey = (dataset.keyPageIds ?? []).includes(p.id);
                return (
                  <tr key={p.id} className="hover:bg-[#F8F9FA]">
                    <td className="p-1 border border-[#808080] font-bold text-black">
                      {p.title}
                      {isKey && (
                        <span className="ml-1 text-[10px] text-[#D0A600] font-mono">[Key Anchor]</span>
                      )}
                    </td>
                    <td className="p-1 border border-[#808080] font-mono text-[11px] text-[#008000]">
                      {p.url}
                    </td>
                    <td className="p-1 border border-[#808080] text-[#555555]">{p.category}</td>
                    <td className="p-1 border border-[#808080] text-right font-mono">
                      {topology.inDegree[p.id] ?? 0}
                    </td>
                    <td className="p-1 border border-[#808080] text-right font-mono">
                      {topology.outDegree[p.id] ?? 0}
                    </td>
                    <td className="p-1 border border-[#808080] text-center">
                      <Link
                        to={`/graph?page=${encodeURIComponent(p.id)}`}
                        className="text-[#0000CC] underline"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Six Scenarios Grid (matches test: "Use dataset: The New Website Cold Start") */}
      <div className="mb-6">
        <h2 className="font-bold text-sm text-black font-serif mb-2 border-b border-[#808080] pb-1">
          Select From All Curated Scenarios
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {datasets.map((item) => {
            const active = item.id === datasetId;
            const cleanName = item.name.replace(/^Scenario \d+: /, '');
            return (
              <div
                key={item.id}
                className={`p-3 text-xs flex flex-col justify-between ${
                  active ? 'bg-[#FFFFE0]' : 'bg-white'
                }`}
                style={{ border: active ? '2px solid #0000CC' : '1px solid #808080' }}
              >
                <div>
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-bold text-black">{cleanName}</span>
                    {active && (
                      <span className="font-mono text-[10px] text-[#0000CC] font-bold">[Active]</span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#555555] mb-2 leading-tight">
                    {item.description}
                  </p>
                  <div className="font-mono text-[10px] text-[#777777] mb-2">
                    {item.pages.length} pages · {SCENARIO_LABELS[item.scenario]}
                  </div>
                </div>
                <div className="flex space-x-2 pt-2 border-t border-[#EEEEEE]">
                  <button
                    type="button"
                    onClick={() => setDatasetId(item.id)}
                    aria-label={`Use dataset: ${cleanName}`}
                    className={`btn-retro text-xs py-0.5 px-2 ${active ? 'font-bold' : ''}`}
                  >
                    {active ? 'Selected' : 'Use Dataset'}
                  </button>
                  <button
                    type="button"
                    onClick={() => openSearch(item.id)}
                    className="btn-retro text-xs py-0.5 px-2"
                  >
                    Search »
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
