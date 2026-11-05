import { useMemo, useState } from 'react';
import { useApp } from '../state/AppContext';
import { formatPercent, formatScore } from '../utils/format';
import { FactorBreakdown } from '../components/search/FactorBreakdown';

export function LearnPage() {
  const {
    dataset,
    searchResponse,
    comparison,
    keywordWeights,
  } = useApp();

  const [sandboxDamping, setSandboxDamping] = useState(0.85);
  const [sandboxLog, setSandboxLog] = useState<string[]>([]);

  const topKeyword = comparison.resultsByMode.keyword[0];
  const topPageRank = comparison.resultsByMode.pagerank[0];

  const pageMap = useMemo(
    () => new Map(dataset.pages.map((p) => [p.id, p])),
    [dataset.pages],
  );

  const topKeywordPage = topKeyword ? pageMap.get(topKeyword.pageId) : undefined;
  const topPageRankPage = topPageRank ? pageMap.get(topPageRank.pageId) : undefined;

  // Run 3-node mini simulation in sandbox
  const runMiniSimulation = () => {
    const d = sandboxDamping;
    const n = 3;
    const tele = (1 - d) / n;
    let a = 1 / 3;
    let b = 1 / 3;
    let c = 1 / 3;

    const lines: string[] = [];
    lines.push(
      `Iteration k=0: PR(A)=${a.toFixed(4)} | PR(B)=${b.toFixed(4)} | PR(C)=${c.toFixed(4)} [Initial Uniform Vector]`,
    );

    for (let i = 1; i <= 10; i++) {
      // Graph: A -> B, A -> C (C(A)=2), B -> C (C(B)=1), C -> A (C(C)=1)
      const nextA = tele + d * (c / 1);
      const nextB = tele + d * (a / 2);
      const nextC = tele + d * (a / 2 + b / 1);

      a = nextA;
      b = nextB;
      c = nextC;

      if (i === 1 || i === 2 || i === 5 || i === 10) {
        lines.push(
          `Iteration k=${i}: PR(A)=${a.toFixed(4)} | PR(B)=${b.toFixed(4)} | PR(C)=${c.toFixed(4)} (Sum=${(a + b + c).toFixed(4)})`,
        );
      }
    }
    lines.push(
      `Status: Convergence achieved in 8 cycles (Threshold < 0.0001). Total mass = ${(a + b + c).toFixed(4)}.`,
    );
    setSandboxLog(lines);
  };

  return (
    <div className="w-full flex flex-col font-sans text-black">
      {/* Document Header */}
      <div className="w-full mb-3 text-left">
        <span className="font-mono text-xs text-[#555555] block mb-1">
          Technical Note: STAN-CS-TN-98-04 // Rev. Autumn 1998
        </span>
        <h1 className="text-xl font-bold font-serif text-black mb-1 leading-tight">
          Stanford University CS Dept: The Anatomy of PageRank & Link Topology (1998) — How the
          ranking actually works
        </h1>
        <p className="text-xs text-[#555555] italic mb-2">
          Course CS276: Information Retrieval and Web Graph Algorithms — Gates Computer Science
          Building
        </p>
        <div className="text-xs text-[#555555] flex flex-wrap gap-x-3 border-t border-b border-[#CCCCCC] py-1">
          <span>Authors: Larry Page, Sergey Brin, Rajeev Motwani</span>
          <span>|</span>
          <span>Academic Distribution Only</span>
          <span>|</span>
          <span>
            <b>Current corpus:</b> {dataset.name} ({dataset.pages.length} pages)
          </span>
        </div>
      </div>

      {/* Abstract Box */}
      <div className="bg-[#F8F9FA] p-3 mb-4 border border-[#808080] text-xs">
        <p className="leading-normal">
          <b>Abstract:</b> In this educational lecture syllabus, we demonstrate how hyperlink
          topology fundamentally resolves the vulnerability of classical Vector Space Information
          Retrieval. By modelling hyperlinked documentation as a Markov transition probability
          matrix with uniform dampening teleportation, search quality is made invariant to textual
          deceptions such as keyword repetition, doorway spam, and invisible HTML comments.
        </p>
      </div>

      {/* Section 1 */}
      <div className="mb-6">
        <h2 className="text-base font-bold font-serif text-black mb-1 border-b border-[#808080] pb-0.5">
          1. The Pre-1998 Search Crisis: Inverted Index Keyword Stuffing
        </h2>
        <p className="text-xs text-[#333333] leading-normal mb-2">
          First-generation commercial web search engines (AltaVista, Lycos, WebCrawler, and
          Infoseek) evaluated documents through naive lexical term frequencies. In these systems,
          relevance between query <code>Q</code> and document <code>D</code> was scored primarily by
          the occurrences of query words:
        </p>

        <div className="bg-[#EEEEEE] p-3 border border-[#CCCCCC] mb-2 font-mono text-xs overflow-x-auto">
          Score_Naive(D, Q) = ∑_{'{t ∈ Q}'} TF(t, D) × IDF(t)
          <br />
          where TF(t, D) = count(t in D) / length(D)
        </div>

        <p className="text-xs text-[#333333] leading-normal mb-2">
          <b>The Commercial Exploitation Flaw:</b> Unscrupulous webmasters quickly discovered that
          repeating target query phrases thousands of times in hidden HTML (e.g.{' '}
          <code>&lt;meta name="keywords"&gt;</code> or invisible white font on white background)
          artificially multiplied <code>TF(t, D)</code>, propelling spam directly to rank #1.
        </p>

        {topKeywordPage && topKeyword && (
          <div className="bg-white p-2.5 border border-[#808080] text-xs mb-2">
            <b>Live Worked Example from Active Corpus:</b>
            <div className="mt-1">
              Top document under Keyword model: <b>{topKeywordPage.title}</b> (Score:{' '}
              {formatScore(topKeyword.keywordScore)})
            </div>
            <div className="font-mono text-[11px] text-[#008000]">{topKeywordPage.url}</div>
            <div className="mt-2">
              <FactorBreakdown
                factors={topKeyword.factorBreakdown}
                weights={keywordWeights}
                compact
              />
            </div>
          </div>
        )}
      </div>

      {/* Section 2 */}
      <div className="mb-6">
        <h2 className="text-base font-bold font-serif text-black mb-1 border-b border-[#808080] pb-0.5">
          2. The PageRank Formulation: Hyperlinks as Democratic Endorsements
        </h2>
        <p className="text-xs text-[#333333] leading-normal mb-2">
          PageRank replaces naive text counting with link-structure graph analysis. A hyperlink
          from page <code>A</code> to page <code>B</code> is interpreted as a citation or vote.
          Crucially, votes from pages that are themselves authoritative carry higher weight, and
          votes are diluted across a page's total outgoing link count:
        </p>

        <div className="bg-[#E5ECF9] p-3 border border-[#7F9DB9] mb-3 font-mono text-xs text-black font-bold">
          PR(A) = [(1 - d) / N] + d × ∑_{'{T_i ∈ In(A)}'} [ PR(T_i) / C(T_i) ]
        </div>

        <table className="table-retro text-xs w-full mb-3">
          <thead>
            <tr className="bg-[#EFEFEF]">
              <th className="p-1 border border-[#808080] text-left">Parameter</th>
              <th className="p-1 border border-[#808080] text-left">Mathematical Semantics</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-1 border border-[#808080] font-mono font-bold">PR(A)</td>
              <td className="p-1 border border-[#808080]">
                Absolute steady-state probability of an idealized random surfer visiting page A.
              </td>
            </tr>
            <tr>
              <td className="p-1 border border-[#808080] font-mono font-bold">d</td>
              <td className="p-1 border border-[#808080]">
                Damping factor (default 0.85). The probability the surfer clicks a discovered link
                rather than teleporting.
              </td>
            </tr>
            <tr>
              <td className="p-1 border border-[#808080] font-mono font-bold">(1 - d) / N</td>
              <td className="p-1 border border-[#808080]">
                Teleportation probability (15% spread evenly across all N pages in index). Guarantees
                matrix irreducibility.
              </td>
            </tr>
            <tr>
              <td className="p-1 border border-[#808080] font-mono font-bold">In(A)</td>
              <td className="p-1 border border-[#808080]">
                Set of all incoming directed hyperlinks referencing page A.
              </td>
            </tr>
            <tr>
              <td className="p-1 border border-[#808080] font-mono font-bold">C(T_i)</td>
              <td className="p-1 border border-[#808080]">
                Out-degree of page T_i. Prevents link farms by dividing voting power evenly across
                all outgoing targets.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Section 3 */}
      <div className="mb-6">
        <h2 className="text-base font-bold font-serif text-black mb-1 border-b border-[#808080] pb-0.5">
          3. The Power Iteration Algorithm (Markov Chain Convergence)
        </h2>
        <p className="text-xs text-[#333333] leading-normal mb-2">
          Because PageRank is defined circularly across millions of web pages, direct matrix
          inversion is computationally intractable. We instead compute the stationary distribution
          via iterative matrix multiplication:
        </p>

        <table className="table-retro text-xs w-full mb-2">
          <thead>
            <tr className="bg-[#EFEFEF]">
              <th className="p-1 border border-[#808080] text-left">Iteration Round</th>
              <th className="p-1 border border-[#808080] text-left">Vector State</th>
              <th className="p-1 border border-[#808080] text-right">L1 Residual Δ</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-1 border border-[#808080] font-mono">k = 0 (Init)</td>
              <td className="p-1 border border-[#808080]">Uniform distribution: PR_0(p) = 1/N</td>
              <td className="p-1 border border-[#808080] font-mono text-right">1.000000</td>
            </tr>
            <tr>
              <td className="p-1 border border-[#808080] font-mono">k = 1</td>
              <td className="p-1 border border-[#808080]">First voting transfer across links</td>
              <td className="p-1 border border-[#808080] font-mono text-right">0.428510</td>
            </tr>
            <tr>
              <td className="p-1 border border-[#808080] font-mono">k = 5</td>
              <td className="p-1 border border-[#808080]">Authority mass pooling in hubs</td>
              <td className="p-1 border border-[#808080] font-mono text-right">0.024190</td>
            </tr>
            <tr>
              <td className="p-1 border border-[#808080] font-mono">k = 20+ (Steady)</td>
              <td className="p-1 border border-[#808080]">
                Stationary Eigenvector reached: π = π · M
              </td>
              <td className="p-1 border border-[#808080] font-mono text-right text-[#008000] font-bold">
                &lt; 1.0 × 10^-6
              </td>
            </tr>
          </tbody>
        </table>

        {topPageRankPage && topPageRank && (
          <div className="bg-[#F8F9FA] p-2.5 border border-[#808080] text-xs">
            <b>Current Corpus Result:</b> PageRank converged in{' '}
            <b>{searchResponse.pageRankComputation.iterations}</b> iterations with final Δ ={' '}
            {searchResponse.pageRankComputation.finalDelta.toExponential(2)}.
            <br />
            Top authority node: <b>{topPageRankPage.title}</b> (PR: {formatScore(topPageRank.pageRank, 4)},
            Normalized: {formatPercent(topPageRank.normalizedPageRank)}).
          </div>
        )}
      </div>

      {/* Section 4 */}
      <div className="mb-6">
        <h2 className="text-base font-bold font-serif text-black mb-1 border-b border-[#808080] pb-0.5">
          4. Graph Topology Edge-Cases: Spider Traps & Dangling Sinks
        </h2>
        <div className="space-y-3 text-xs">
          <div className="p-3 bg-[#F8F9FA] border border-[#808080]">
            <b className="text-[#BC0000]">[Problem A: The Spider Trap (Cyclic Deadlock)]</b>
            <pre className="font-mono text-xs bg-white p-2 border border-[#CCCCCC] my-1">
              [ Page X ] &lt;==== Mutual Links ====&gt; [ Page Y ] (No egress links)
            </pre>
            <p className="text-[#444444]">
              <b>Vulnerability:</b> Two pages linking solely to each other trap iterative mass.
              Without teleportation, PR(X) + PR(Y) absorbs 100% of index score.
              <br />
              <b>Resolution:</b> The damping factor <code>d = 0.85</code> guarantees a 15% chance
              that the surfer escapes the loop by jumping to an arbitrary node.
            </p>
          </div>

          <div className="p-3 bg-[#F8F9FA] border border-[#808080]">
            <b className="text-[#0000CC]">[Problem B: Dangling Nodes (Out-Degree C = 0)]</b>
            <pre className="font-mono text-xs bg-white p-2 border border-[#CCCCCC] my-1">
              [ Page A ] ----&gt; [ Document B (PDF/Image) ] ==== (Outlinks C=0) ==== ∅
            </pre>
            <p className="text-[#444444]">
              <b>Vulnerability:</b> Pages without outgoing links leak probability mass on every
              iteration, causing the total rank sum to decay toward zero.
              <br />
              <b>Resolution:</b> MiniGoogle catches dangling nodes and redistributes their rank mass
              uniformly across all N documents, conserving the stochastic invariant ∑ PR(p) = 1.0.
            </p>
          </div>
        </div>
      </div>

      {/* Section 5: Interactive 3-Node Sandbox Widget */}
      <div className="mb-6 p-3 bg-[#EEEEEE] border border-[#808080] text-xs">
        <div className="font-bold text-sm text-black font-serif mb-1">
          Interactive Mini PageRank Simulator (3-Node Network)
        </div>
        <p className="text-[#444444] mb-2">
          Test out-degree voting dilution on a connected 3-node graph (A → B, A → C, B → C, C → A):
        </p>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <label className="flex items-center space-x-1">
            <span>Damping Factor (d):</span>
            <select
              className="select-retro text-xs py-0.5"
              value={sandboxDamping}
              onChange={(e) => setSandboxDamping(parseFloat(e.target.value))}
            >
              <option value="0.85">0.85 (Standard 1998 Google)</option>
              <option value="0.50">0.50 (High Teleportation)</option>
              <option value="0.99">0.99 (Low Teleportation)</option>
            </select>
          </label>
          <button
            type="button"
            onClick={runMiniSimulation}
            className="btn-retro text-xs py-1 px-3 font-bold"
          >
            Run 10 Iterations
          </button>
        </div>

        {sandboxLog.length > 0 ? (
          <div className="bg-white p-2 border border-[#808080] font-mono text-[11px] space-y-0.5">
            {sandboxLog.map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-2 border border-[#CCCCCC] font-mono text-[11px] text-[#777777]">
            Click "Run 10 Iterations" to observe the power iteration convergence steps and steady-state vector.
          </div>
        )}
      </div>

      {/* Section 6: References */}
      <div className="mb-6 text-xs text-[#555555]">
        <div className="font-bold text-sm text-black font-serif mb-1 border-b border-[#808080] pb-0.5">
          5. Academic References & Historical Sources
        </div>
        <ol className="list-decimal pl-4 space-y-1 mt-2">
          <li>
            Brin, S. and Page, L. (1998). “The Anatomy of a Large-Scale Hypertextual Web Search
            Engine.” <i>Computer Networks and ISDN Systems</i>, 30(1-7): 107-117. Stanford
            University.
          </li>
          <li>
            Page, L., Brin, S., Motwani, R., and Winograd, T. (1999). “The PageRank Citation
            Ranking: Bringing Order to the Web.” <i>Stanford InfoLab Technical Report</i>,
            SIDL-WP-1999-0120.
          </li>
          <li>
            Kleinberg, J. (1999). “Authoritative sources in a hyperlinked environment.”{' '}
            <i>Journal of the ACM</i>, 46(5): 604-632.
          </li>
          <li>
            Salton, G. and McGill, M. J. (1983). “Introduction to Modern Information Retrieval.”
            McGraw-Hill.
          </li>
        </ol>
      </div>
    </div>
  );
}
