import type { KeywordFactors, KeywordWeights } from '../../types';
import { cn } from '../../utils/cn';
import { formatPercent, formatScore } from '../../utils/format';

const FACTOR_ROWS: ReadonlyArray<{
  readonly key: keyof KeywordFactors;
  readonly label: string;
  readonly description: string;
  readonly weighted: boolean;
}> = [
  {
    key: 'termFrequency',
    label: 'Term frequency',
    description: 'Saturating count of query terms in the body.',
    weighted: true,
  },
  {
    key: 'keywordDensity',
    label: 'Keyword density',
    description: 'Query occurrences relative to document length.',
    weighted: true,
  },
  {
    key: 'titleMatch',
    label: 'Title match',
    description: 'Fraction of query terms present in the title.',
    weighted: true,
  },
  {
    key: 'headingMatch',
    label: 'Heading match',
    description: 'Weighted H1–H3 coverage of the query terms.',
    weighted: true,
  },
  {
    key: 'metaMatch',
    label: 'Meta match',
    description: 'Query coverage in the meta description.',
    weighted: true,
  },
  {
    key: 'exactPhraseMatch',
    label: 'Exact phrase',
    description: 'Contiguous multi-word phrase appears in the body.',
    weighted: true,
  },
  {
    key: 'proximity',
    label: 'Proximity',
    description: 'Closeness of all query terms in the body.',
    weighted: true,
  },
  {
    key: 'lengthNormalization',
    label: 'Length normalization',
    description: 'Symmetric correction for unusually short or long pages.',
    weighted: false,
  },
];

export function FactorBreakdown({
  factors,
  weights,
  compact = false,
}: {
  readonly factors: KeywordFactors;
  readonly weights: KeywordWeights;
  readonly compact?: boolean;
}) {
  const totalWeight = FACTOR_ROWS.filter((row) => row.weighted).reduce(
    (total, row) => total + weights[row.key as keyof KeywordWeights],
    0,
  );

  return (
    <div className={cn('grid gap-2.5', compact ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-4')}>
      {FACTOR_ROWS.map((row) => {
        const value = factors[row.key];
        const weight = row.weighted ? weights[row.key as keyof KeywordWeights] : 0;
        const share = row.weighted && totalWeight > 0 ? weight / totalWeight : 0;
        return (
          <div key={row.key} className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-xs font-semibold text-slate-700">{row.label}</span>
              <span className="font-mono text-xs font-semibold text-slate-500">
                {formatScore(value, 2)}
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className={cn(
                  'h-full rounded-full',
                  row.weighted ? 'bg-blue-500' : 'bg-slate-400',
                )}
                style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%` }}
              />
            </div>
            <div className="mt-1.5 flex items-center justify-between gap-2">
              <span className="text-[11px] leading-4 text-slate-500">{row.description}</span>
              <span className="shrink-0 font-mono text-[10px] text-slate-400">
                {row.weighted ? `${formatPercent(share)} weight` : 'multiplier'}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
