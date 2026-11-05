import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { KeywordWeights, RankingMode, RankingResult, WebPage } from '../../types';
import { buildSnippet, highlightSegments } from '../../utils/snippet';
import { formatPercent, formatScore } from '../../utils/format';
import { FactorBreakdown } from './FactorBreakdown';

function HighlightedText({ text, query }: { readonly text: string; readonly query: string }) {
  return (
    <>
      {highlightSegments(text, query).map((segment, index) =>
        segment.highlighted ? (
          <b key={`${segment.text}-${index}`} className="font-bold text-black bg-[#FFFFD0]">
            {segment.text}
          </b>
        ) : (
          <span key={`${segment.text}-${index}`}>{segment.text}</span>
        ),
      )}
    </>
  );
}

export function ResultCard({
  result,
  page,
  query,
  keywordWeights,
  isKeyPage,
  incomingCount,
  outgoingCount,
  mode: _mode,
}: {
  readonly result: RankingResult;
  readonly page: WebPage;
  readonly query: string;
  readonly keywordWeights: KeywordWeights;
  readonly isKeyPage: boolean;
  readonly incomingCount: number;
  readonly outgoingCount: number;
  readonly mode: RankingMode;
}) {
  const [expanded, setExpanded] = useState(false);
  const snippet = buildSnippet(page.content, query);

  return (
    <article className="mb-4 text-left font-sans">
      {/* 1998 Blue Link Title */}
      <div>
        <button
          type="button"
          onClick={() => setExpanded((open) => !open)}
          className="serp-title block text-left cursor-pointer font-serif text-[18px] text-[#0000CC] underline hover:text-[#CC0000]"
          aria-expanded={expanded}
        >
          <b>{page.title}</b>
        </button>
      </div>

      {/* Snippet text */}
      <div className="font-sans text-[13px] text-black leading-snug mt-0.5">
        <HighlightedText text={snippet} query={query} />
      </div>

      {/* Green URL & Meta Line */}
      <div className="font-mono text-[12px] text-[#008000] mt-0.5">
        <span>{page.url}</span>
        <span className="text-[#555555] text-xs font-sans ml-1">
          - {page.category} -
          <button
            type="button"
            onClick={() => setExpanded((open) => !open)}
            className="text-[#0000CC] underline ml-1 hover:text-[#CC0000]"
          >
            [Cached copy]
          </button>
          <Link
            to={`/graph?page=${encodeURIComponent(page.id)}`}
            className="text-[#0000CC] underline ml-1 hover:text-[#CC0000]"
          >
            [Inspect in graph]
          </Link>
          {isKeyPage && (
            <span className="text-[#D0A600] font-bold ml-1 font-mono">[Key Anchor]</span>
          )}
        </span>
      </div>

      {/* Retro Technical Graph Metadata box */}
      <div
        className="font-mono text-[11px] text-[#444444] bg-[#F8F9FA] p-1.5 mt-1"
        style={{
          border:
            result.position > 3 && result.keywordScore > 0.8 && result.pageRank < 0.05
              ? '1px dotted #BC0000'
              : '1px dotted #808080',
          backgroundColor:
            result.position > 3 && result.keywordScore > 0.8 && result.pageRank < 0.05
              ? '#FFF2F2'
              : '#F8F9FA',
        }}
      >
        <span className="text-[#0000CC] font-bold font-sans">[Rank #{result.position}]</span>
        {' | '}
        <span>Score: <b>{formatScore(result.finalScore)}</b></span>
        {' | '}
        <span>Keyword: {formatScore(result.keywordScore)}</span>
        {' | '}
        <span>PageRank: {formatScore(result.pageRank, 4)}</span>
        {' | '}
        <span>Inlinks: {incomingCount}</span>
        {' | '}
        <span>Outlinks: {outgoingCount}</span>
        {result.behaviourScore !== undefined && (
          <>
            {' | '}
            <span className="text-[#008000]">Behaviour: {formatScore(result.behaviourScore)}</span>
          </>
        )}
      </div>

      {/* Diagnostic breakdown toggle */}
      <div className="mt-1 flex items-center space-x-2 text-xs">
        <button
          type="button"
          onClick={() => setExpanded((open) => !open)}
          className="btn-retro text-xs py-0.5 px-2"
          aria-expanded={expanded}
        >
          {expanded ? 'Hide scoring details' : 'Why this rank?'}
        </button>
      </div>

      {/* Expanded Factor Breakdown and Math */}
      {expanded ? (
        <div
          className="mt-2 p-2 bg-[#FAFAFA] text-xs font-sans"
          style={{ border: '1px solid #CCCCCC' }}
        >
          <p className="text-xs text-black leading-normal mb-2">
            <b>Explanation:</b> {result.explanation}
          </p>

          <table className="table-retro text-xs mb-2">
            <tbody>
              <tr>
                <td className="bg-[#EFEFEF] font-bold" width="25%">Normalized PageRank</td>
                <td className="font-mono">{formatPercent(result.normalizedPageRank)}</td>
                <td className="bg-[#EFEFEF] font-bold" width="25%">Raw PageRank (π)</td>
                <td className="font-mono">{formatScore(result.pageRank, 6)}</td>
              </tr>
              <tr>
                <td className="bg-[#EFEFEF] font-bold">Incoming Citations</td>
                <td className="font-mono">{incomingCount}</td>
                <td className="bg-[#EFEFEF] font-bold">Outgoing Citations</td>
                <td className="font-mono">{outgoingCount}</td>
              </tr>
            </tbody>
          </table>

          <div className="font-bold text-xs text-black mt-2 mb-1">
            Keyword Relevance 8-Factor Decomposition:
          </div>
          <FactorBreakdown factors={result.factorBreakdown} weights={keywordWeights} compact />
        </div>
      ) : null}
    </article>
  );
}
