import { useState } from 'react';
import { RotateCcw, SlidersHorizontal } from 'lucide-react';
import type { KeywordWeights } from '../../types';
import { useApp } from '../../state/AppContext';
import { cn } from '../../utils/cn';
import { formatPercent } from '../../utils/format';
import { Badge, Button, Card, InfoNote, Slider } from '../ui/Primitives';

const KEYWORD_FACTORS: ReadonlyArray<{
  readonly key: keyof KeywordWeights;
  readonly label: string;
}> = [
  { key: 'termFrequency', label: 'Term frequency' },
  { key: 'keywordDensity', label: 'Keyword density' },
  { key: 'titleMatch', label: 'Title match' },
  { key: 'headingMatch', label: 'Heading match' },
  { key: 'metaMatch', label: 'Meta description' },
  { key: 'exactPhraseMatch', label: 'Exact phrase' },
  { key: 'proximity', label: 'Proximity' },
];

export function RankingControls({ compact = false }: { readonly compact?: boolean }) {
  const {
    mode,
    rankingWeights,
    setHybridSplit,
    setRankingWeights,
    keywordWeights,
    setKeywordWeight,
    resetKeywordWeights,
    simulationIsCurrent,
    runSimulation,
  } = useApp();
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const behaviourWeight = rankingWeights.behaviourWeight ?? 0;
  const total =
    rankingWeights.keywordWeight + rankingWeights.pagerankWeight + behaviourWeight;
  const normalized = {
    keyword: total > 0 ? rankingWeights.keywordWeight / total : 0,
    pagerank: total > 0 ? rankingWeights.pagerankWeight / total : 0,
    behaviour: total > 0 ? behaviourWeight / total : 0,
  };

  return (
    <Card className={cn('p-5', compact && 'p-4')}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <SlidersHorizontal size={16} className="text-blue-600" aria-hidden="true" />
            Ranking controls
          </h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Weights are normalized by their sum, so only relative influence matters.
          </p>
        </div>
        <Badge variant="blue">{mode === 'experimental' ? '3 signals' : '2 signals'}</Badge>
      </div>

      {mode === 'hybrid' ? (
        <div className="mt-4 space-y-4">
          <Slider
            label="Keyword ↔ PageRank balance"
            value={rankingWeights.keywordWeight / Math.max(0.0001, rankingWeights.keywordWeight + rankingWeights.pagerankWeight)}
            min={0}
            max={1}
            step={0.05}
            onChange={setHybridSplit}
            formatValue={(value) =>
              `${formatPercent(value)} keyword / ${formatPercent(1 - value)} PageRank`
            }
            hint="At 0% the hybrid behaves exactly like PageRank; at 100% it behaves like keyword ranking."
          />
        </div>
      ) : null}

      {mode === 'experimental' ? (
        <div className="mt-4 space-y-4">
          <Slider
            label="Keyword weight"
            value={rankingWeights.keywordWeight}
            min={0}
            max={1}
            step={0.05}
            onChange={(value) =>
              setRankingWeights({ ...rankingWeights, keywordWeight: value })
            }
            formatValue={() => `${formatPercent(normalized.keyword)} effective`}
          />
          <Slider
            label="PageRank weight"
            value={rankingWeights.pagerankWeight}
            min={0}
            max={1}
            step={0.05}
            onChange={(value) =>
              setRankingWeights({ ...rankingWeights, pagerankWeight: value })
            }
            formatValue={() => `${formatPercent(normalized.pagerank)} effective`}
          />
          <Slider
            label="Surfer behaviour weight"
            value={behaviourWeight}
            min={0}
            max={1}
            step={0.05}
            onChange={(value) =>
              setRankingWeights({ ...rankingWeights, behaviourWeight: value })
            }
            formatValue={() => `${formatPercent(normalized.behaviour)} effective`}
          />
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
            <span>
              {simulationIsCurrent
                ? 'Behaviour scores are current for this dataset and query.'
                : 'No current simulation run — behaviour contributes zero until you run one.'}
            </span>
            {!simulationIsCurrent ? (
              <Button size="sm" variant="secondary" onClick={() => runSimulation()}>
                Run simulation
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}

      {mode === 'keyword' || mode === 'pagerank' ? (
        <div className="mt-4">
          <InfoNote tone="blue">
            {mode === 'keyword'
              ? 'This mode ignores links entirely. Only the seven content weights below affect the result.'
              : 'This mode ignores page content entirely. Every result is ordered by the iterative PageRank score.'}
          </InfoNote>
        </div>
      ) : null}

      {mode !== 'pagerank' ? (
        <div className="mt-5 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={() => setAdvancedOpen((open) => !open)}
            className="flex w-full items-center justify-between text-left"
            aria-expanded={advancedOpen}
          >
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Advanced keyword factors
            </span>
            <span className="text-xs font-medium text-blue-700">
              {advancedOpen ? 'Hide' : 'Configure'}
            </span>
          </button>
          {advancedOpen ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {KEYWORD_FACTORS.map((factor) => (
                <Slider
                  key={factor.key}
                  label={factor.label}
                  value={keywordWeights[factor.key]}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(value) => setKeywordWeight(factor.key, value)}
                  formatValue={(value) => formatPercent(value)}
                />
              ))}
              <div className="sm:col-span-2">
                <Button size="sm" variant="secondary" onClick={resetKeywordWeights}>
                  <RotateCcw size={13} aria-hidden="true" /> Reset factor weights
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}
