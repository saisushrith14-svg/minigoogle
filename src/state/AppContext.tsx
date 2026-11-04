import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  compareRankingModes,
  DEFAULT_KEYWORD_WEIGHTS,
  DEFAULT_RANKING_WEIGHTS,
  rankPages,
  resolveRankingWeights,
  searchDataset,
  type RankingComparison,
  type SearchResponse,
} from '../algorithms/rankingPipeline';
import { normalizeKeywordWeights } from '../algorithms/keywordScoring';
import { DEFAULT_PAGERANK_CONFIG } from '../algorithms/pageRank';
import { DEFAULT_DATASET, datasets, getDatasetById } from '../data/datasets';
import {
  DEFAULT_SIMULATION_CONFIG,
  runSurferSimulation,
  sanitizeSimulationConfig,
} from '../simulation/surferSimulation';
import type {
  Dataset,
  KeywordWeights,
  PageRankConfig,
  RankingMode,
  RankingWeights,
  SimulationConfig,
  SimulationRun,
} from '../types';

interface SimulationState {
  readonly run: SimulationRun;
  readonly key: string;
}

export interface AppContextValue {
  readonly datasets: readonly Dataset[];
  readonly dataset: Dataset;
  readonly datasetId: string;
  readonly setDatasetId: (id: string) => void;
  readonly query: string;
  readonly setQuery: (query: string) => void;
  readonly mode: RankingMode;
  readonly setMode: (mode: RankingMode) => void;
  readonly keywordWeights: KeywordWeights;
  readonly setKeywordWeight: (key: keyof KeywordWeights, value: number) => void;
  readonly resetKeywordWeights: () => void;
  readonly rankingWeights: RankingWeights;
  readonly setRankingWeights: (weights: RankingWeights) => void;
  readonly setHybridSplit: (keywordShare: number) => void;
  readonly pageRankConfig: PageRankConfig;
  readonly searchResponse: SearchResponse;
  readonly comparison: RankingComparison;
  readonly simulationConfig: SimulationConfig;
  readonly updateSimulationConfig: (partial: Partial<SimulationConfig>) => void;
  readonly simulationRun: SimulationRun | null;
  readonly simulationIsCurrent: boolean;
  readonly behaviourScores?: Readonly<Record<string, number>>;
  readonly runSimulation: () => SimulationRun;
  readonly clearSimulation: () => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { readonly children: ReactNode }) {
  const [datasetId, setDatasetIdState] = useState(DEFAULT_DATASET.id);
  const dataset = getDatasetById(datasetId) ?? DEFAULT_DATASET;
  const [query, setQuery] = useState(DEFAULT_DATASET.defaultQuery ?? '');
  const [mode, setMode] = useState<RankingMode>('hybrid');
  const [keywordWeights, setKeywordWeightsState] = useState<KeywordWeights>({
    ...DEFAULT_KEYWORD_WEIGHTS,
  });
  const [rankingWeights, setRankingWeightsState] = useState<RankingWeights>({
    ...DEFAULT_RANKING_WEIGHTS,
  });
  const [simulationConfig, setSimulationConfig] = useState<SimulationConfig>({
    ...DEFAULT_SIMULATION_CONFIG,
  });
  const [simulation, setSimulation] = useState<SimulationState | null>(null);

  const setDatasetId = useCallback((id: string) => {
    const next = getDatasetById(id);
    if (!next) return;
    setDatasetIdState(id);
    setQuery(next.defaultQuery ?? '');
    setSimulation(null);
  }, []);

  const setKeywordWeight = useCallback(
    (key: keyof KeywordWeights, value: number) => {
      setKeywordWeightsState((previous) =>
        normalizeKeywordWeights({ ...previous, [key]: value }),
      );
    },
    [],
  );

  const resetKeywordWeights = useCallback(() => {
    setKeywordWeightsState({ ...DEFAULT_KEYWORD_WEIGHTS });
  }, []);

  const setRankingWeights = useCallback((next: RankingWeights) => {
    setRankingWeightsState(resolveRankingWeights(next));
  }, []);

  const setHybridSplit = useCallback((keywordShare: number) => {
    const share = Math.max(0, Math.min(1, keywordShare));
    setRankingWeightsState((previous) =>
      resolveRankingWeights({
        keywordWeight: share,
        pagerankWeight: 1 - share,
        behaviourWeight: previous.behaviourWeight,
      }),
    );
  }, []);

  const updateSimulationConfig = useCallback((partial: Partial<SimulationConfig>) => {
    setSimulationConfig((previous) =>
      sanitizeSimulationConfig({ ...previous, ...partial }),
    );
  }, []);

  const baseMode: RankingMode = mode === 'experimental' ? 'hybrid' : mode;
  const simulationKey = useMemo(
    () =>
      JSON.stringify({
        datasetId,
        query,
        baseMode,
        keywordWeights,
        rankingWeights,
      }),
    [baseMode, datasetId, keywordWeights, query, rankingWeights],
  );

  const activeSimulation =
    simulation !== null && simulation.key === simulationKey ? simulation.run : null;

  const behaviourScores = useMemo(() => {
    if (!activeSimulation) return undefined;
    const map: Record<string, number> = {};
    activeSimulation.behaviourScores.forEach((score) => {
      map[score.pageId] = score.aggregateBehaviourScore;
    });
    return map;
  }, [activeSimulation]);

  const searchResponse = useMemo(
    () =>
      searchDataset(dataset, query, {
        mode,
        keywordWeights,
        rankingWeights,
        behaviorScores: behaviourScores,
      }),
    [behaviourScores, dataset, keywordWeights, mode, query, rankingWeights],
  );

  const comparison = useMemo(
    () =>
      compareRankingModes(dataset.pages, query, {
        keywordWeights,
        rankingWeights,
        behaviorScores: behaviourScores,
      }),
    [behaviourScores, dataset.pages, keywordWeights, query, rankingWeights],
  );

  const runSimulation = useCallback((): SimulationRun => {
    const baseResults = rankPages(dataset.pages, query, {
      mode: baseMode,
      keywordWeights,
      rankingWeights,
    });
    const run = runSurferSimulation({
      dataset,
      query,
      results: baseResults,
      rankingMode: baseMode,
      config: simulationConfig,
    });
    setSimulation({ run, key: simulationKey });
    return run;
  }, [
    baseMode,
    dataset,
    keywordWeights,
    query,
    rankingWeights,
    simulationConfig,
    simulationKey,
  ]);

  const clearSimulation = useCallback(() => setSimulation(null), []);

  const value = useMemo<AppContextValue>(
    () => ({
      datasets,
      dataset,
      datasetId,
      setDatasetId,
      query,
      setQuery,
      mode,
      setMode,
      keywordWeights,
      setKeywordWeight,
      resetKeywordWeights,
      rankingWeights,
      setRankingWeights,
      setHybridSplit,
      pageRankConfig: DEFAULT_PAGERANK_CONFIG,
      searchResponse,
      comparison,
      simulationConfig,
      updateSimulationConfig,
      simulationRun: simulation?.run ?? null,
      simulationIsCurrent: activeSimulation !== null,
      behaviourScores,
      runSimulation,
      clearSimulation,
    }),
    [
      activeSimulation,
      behaviourScores,
      clearSimulation,
      comparison,
      dataset,
      datasetId,
      keywordWeights,
      mode,
      query,
      rankingWeights,
      resetKeywordWeights,
      runSimulation,
      searchResponse,
      setDatasetId,
      setHybridSplit,
      setKeywordWeight,
      setRankingWeights,
      simulation?.run,
      simulationConfig,
      updateSimulationConfig,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used inside an AppProvider');
  }
  return context;
}
