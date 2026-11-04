import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ExternalLink, Network, Star } from 'lucide-react';
import type { KeywordWeights, RankingMode, RankingResult, WebPage } from '../../types';
import { cn } from '../../utils/cn';
import { buildSnippet, highlightSegments } from '../../utils/snippet';
import { formatPercent, formatScore, MODE_SHORT_LABELS } from '../../utils/format';
import { Badge } from '../ui/Primitives';
import { FactorBreakdown } from './FactorBreakdown';

function HighlightedText({ text, query }: { readonly text: string; readonly query: string }) {
  return (
    <>
      {highlightSegments(text, query).map((segment, index) =>
        segment.highlighted ? (
          <mark key={`${segment.text}-${index}`} className="mark-query">
            {segment.text}
          </mark>
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
  mode,
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
    <article className="fade-up rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 font-mono text-sm font-bold text-slate-600">
          {result.position}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-1.5">
            <Badge variant={mode === 'keyword' ? 'amber' : mode === 'pagerank' ? 'violet' : 'blue'}>
              {MODE_SHORT_LABELS[mode]}
            </Badge>
            <Badge variant="neutral">{page.category}</Badge>
            {isKeyPage ? (
              <Badge variant="green">
                <Star size={11} aria-hidden="true" /> Key page
              </Badge>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => setExpanded((open) => !open)}
            className="serp-title block text-left"
            aria-expanded={expanded}
          >
            {page.title}
          </button>
          <p className="serp-url">{page.url}</p>
          <p className="serp-snippet mt-1">
            <HighlightedText text={snippet} query={query} />
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-md bg-slate-900 px-2 py-1 font-mono font-semibold text-white">
              score {formatScore(result.finalScore)}
            </span>
            <span className="rounded-md bg-amber-50 px-2 py-1 font-mono text-amber-800">
              keyword {formatScore(result.keywordScore)}
            </span>
            <span className="rounded-md bg-violet-50 px-2 py-1 font-mono text-violet-800">
              pagerank {formatScore(result.pageRank, 4)}
            </span>
            {result.behaviourScore !== undefined ? (
              <span className="rounded-md bg-emerald-50 px-2 py-1 font-mono text-emerald-800">
                behaviour {formatScore(result.behaviourScore)}
              </span>
            ) : null}
            <span className="text-slate-400">
              {incomingCount} in · {outgoingCount} out
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setExpanded((open) => !open)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-800"
              aria-expanded={expanded}
            >
              {expanded ? 'Hide scoring details' : 'Why this rank?'}
              <ChevronDown
                size={14}
                className={cn('transition', expanded && 'rotate-180')}
                aria-hidden="true"
              />
            </button>
            <Link
              to={`/graph?page=${encodeURIComponent(page.id)}`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              <Network size={13} aria-hidden="true" /> Inspect in graph
            </Link>
            <span className="inline-flex items-center gap-1 text-xs text-slate-400">
              <ExternalLink size={12} aria-hidden="true" /> Simulated URL
            </span>
          </div>

          {expanded ? (
            <div className="fade-up mt-4 border-t border-slate-100 pt-4">
              <p className="text-sm leading-6 text-slate-700">{result.explanation}</p>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                <div className="rounded-lg bg-slate-50 p-2">
                  <dt className="text-slate-500">Normalized PageRank</dt>
                  <dd className="font-mono font-semibold text-slate-900">
                    {formatPercent(result.normalizedPageRank)}
                  </dd>
                </div>
                <div className="rounded-lg bg-slate-50 p-2">
                  <dt className="text-slate-500">Raw PageRank</dt>
                  <dd className="font-mono font-semibold text-slate-900">
                    {formatScore(result.pageRank, 6)}
                  </dd>
                </div>
                <div className="rounded-lg bg-slate-50 p-2">
                  <dt className="text-slate-500">Incoming links</dt>
                  <dd className="font-mono font-semibold text-slate-900">{incomingCount}</dd>
                </div>
                <div className="rounded-lg bg-slate-50 p-2">
                  <dt className="text-slate-500">Outgoing links</dt>
                  <dd className="font-mono font-semibold text-slate-900">{outgoingCount}</dd>
                </div>
              </dl>
              <div className="mt-3">
                <FactorBreakdown factors={result.factorBreakdown} weights={keywordWeights} compact />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
