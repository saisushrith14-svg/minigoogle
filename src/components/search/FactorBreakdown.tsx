import type { KeywordFactors, KeywordWeights } from '../../types';
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
    description: 'Saturating count of query terms in body.',
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
    description: 'Fraction of query terms present in title.',
    weighted: true,
  },
  {
    key: 'headingMatch',
    label: 'Heading match',
    description: 'Weighted H1–H3 coverage of query terms.',
    weighted: true,
  },
  {
    key: 'metaMatch',
    label: 'Meta description',
    description: 'Query coverage in meta description tag.',
    weighted: true,
  },
  {
    key: 'exactPhraseMatch',
    label: 'Exact phrase',
    description: 'Contiguous multi-word phrase appears in body.',
    weighted: true,
  },
  {
    key: 'proximity',
    label: 'Proximity',
    description: 'Closeness of all query terms in document text.',
    weighted: true,
  },
  {
    key: 'lengthNormalization',
    label: 'Length normalization',
    description: 'Correction preventing extreme short/long page skew.',
    weighted: false,
  },
];

export function FactorBreakdown({
  factors,
  weights,
  compact: _compact = false,
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
    <div className="w-full overflow-x-auto my-2">
      <table className="table-retro text-xs">
        <thead>
          <tr className="bg-[#EFEFEF] text-black">
            <th className="p-1 border border-[#808080]">Factor</th>
            <th className="p-1 border border-[#808080]">Description</th>
            <th className="p-1 border border-[#808080] text-right">Raw Value</th>
            <th className="p-1 border border-[#808080] text-right">Contribution</th>
          </tr>
        </thead>
        <tbody>
          {FACTOR_ROWS.map((row) => {
            const value = factors[row.key];
            const weight = row.weighted ? weights[row.key as keyof KeywordWeights] : 0;
            const share = row.weighted && totalWeight > 0 ? weight / totalWeight : 0;
            return (
              <tr key={row.key} className="hover:bg-[#F8F9FA]">
                <td className="p-1 border border-[#808080] font-bold text-black whitespace-nowrap">
                  {row.label}
                </td>
                <td className="p-1 border border-[#808080] text-[#555555]">
                  {row.description}
                </td>
                <td className="p-1 border border-[#808080] font-mono text-right text-black">
                  {formatScore(value, 3)}
                </td>
                <td className="p-1 border border-[#808080] font-mono text-right text-[#0000CC]">
                  {row.weighted ? `${formatPercent(share)} weight` : 'multiplier'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
