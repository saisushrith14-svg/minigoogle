# MiniGoogle — Implementation Roadmap

This roadmap establishes the 12 sequential engineering phases required to build, audit, and verify the MiniGoogle application.

---

### Phase 1: Project Setup and TypeScript Foundations
- **Objective**: Establish the build toolchain, testing harness, styling system, and shared TypeScript contracts.
- **Files**: `package.json`, `tsconfig.json`, `vite.config.ts`, `tailwind.config.js`, `src/types/*.ts`, `src/utils/normalization.ts`, `src/utils/random.ts`.
- **Dependencies**: None.
- **Acceptance Criteria**: Strict mode enabled with zero errors; Vitest runner configured; base contracts defined with zero `any`.
- **Tests**: `src/tests/unit/normalization.test.ts`, `src/tests/unit/random.test.ts`.

### Phase 2: Dataset Validation and Registry
- **Objective**: Implement all six educational datasets with realistic textual content and verified directed link graphs.
- **Files**: `src/data/datasets/*.ts`, `src/data/datasetRegistry.ts`, `src/utils/validation.ts`.
- **Dependencies**: Phase 1.
- **Acceptance Criteria**: All 6 datasets parse through Zod schemas; graph link validation verifies zero broken links across all datasets.
- **Tests**: `src/tests/integration/datasetValidation.test.ts`.

### Phase 3: Keyword Ranking Engine
- **Objective**: Implement the pre-1998 8-factor content relevance engine.
- **Files**: `src/algorithms/tokenizer.ts`, `src/algorithms/keywordScoring.ts`, `src/algorithms/keyword/*.ts`.
- **Dependencies**: Phase 1, Phase 2.
- **Acceptance Criteria**: Satiated TF, keyword density, title/heading/meta matches, exact phrase matching, proximity window, and length normalization compute deterministically.
- **Tests**: `src/tests/unit/tokenizer.test.ts`, `src/tests/unit/keywordScoring.test.ts`.

### Phase 4: PageRank Engine
- **Objective**: Implement Larry Page and Sergey Brin's 1998 power-iteration algorithm.
- **Files**: `src/utils/graphUtils.ts`, `src/algorithms/pageRank.ts`, `src/algorithms/pagerank/*.ts`.
- **Dependencies**: Phase 1, Phase 2.
- **Acceptance Criteria**: Power-iteration with $d=0.85$ converges within 100 iterations; dangling nodes redistribute mass uniformly; scores sum to $1.000000 \pm 10^{-5}$.
- **Tests**: `src/tests/unit/pageRank.test.ts`, `src/tests/unit/graphUtils.test.ts`, `src/tests/algorithms/pageRankFixtures.test.ts`.

### Phase 5: Hybrid Ranking Engine
- **Objective**: Blend keyword relevance and normalized PageRank into a unified search pipeline.
- **Files**: `src/algorithms/rankingPipeline.ts`, `src/algorithms/hybrid/*.ts`.
- **Dependencies**: Phase 3, Phase 4.
- **Acceptance Criteria**: Weights normalize dynamically; PageRank values min-max scale cleanly into $[0, 1]$; explanations reflect true factor contributions.
- **Tests**: `src/tests/unit/rankingPipeline.test.ts`, `src/tests/integration/rankingScenarios.test.ts`.

### Phase 6: Search Interface & Results
- **Objective**: Build the nostalgic 1998 Google-inspired search experience.
- **Files**: `src/pages/SearchPage.tsx`, `src/components/search/*.tsx`, `src/state/AppContext.tsx`.
- **Dependencies**: Phase 5.
- **Acceptance Criteria**: Instant search on Enter/click; mode toggle tabs (Keyword, PageRank, Hybrid, Experimental); expandable factor breakdowns.
- **Tests**: `src/tests/components/searchExperience.test.tsx`.

### Phase 7: Dataset Explorer & Graph Visualization
- **Objective**: Render an interactive directed graph of web hyperlinks and document inspection drawers.
- **Files**: `src/pages/GraphPage.tsx`, `src/pages/DatasetsPage.tsx`, `src/components/graph/*.tsx`.
- **Dependencies**: Phase 2, Phase 4.
- **Acceptance Criteria**: SVG/canvas graph renders nodes sized by PageRank; clicking a node inspects inbound/outbound links; switching datasets redraws graph.
- **Tests**: `src/tests/components/graphPage.test.tsx`, `src/tests/components/datasetsPage.test.tsx`.

### Phase 8: Surfer Simulation Engine
- **Objective**: Build a deterministic discrete-event simulation model of user browsing and telemetry derivation.
- **Files**: `src/simulation/surferSimulation.ts`, `src/algorithms/behaviourScoring.ts`, `src/algorithms/surfer/*.ts`.
- **Dependencies**: Phase 1, Phase 5.
- **Acceptance Criteria**: Emits `SimulationEvent[]`; computes real CTR, dwell, bounce rate, and paths; strictly leaves classical PageRank unmodified.
- **Tests**: `src/tests/unit/simulation.test.ts`, `src/tests/unit/behaviourScoring.test.ts`, `src/tests/unit/simulationScalability.test.ts`.

### Phase 9: Simulation Interface & Analytics
- **Objective**: Build playback controls, active session inspectors, and Recharts telemetry dashboards.
- **Files**: `src/pages/SimulatorPage.tsx`, `src/pages/AnalyticsPage.tsx`, `src/utils/simulationView.ts`.
- **Dependencies**: Phase 8.
- **Acceptance Criteria**: Play/pause/step simulation replay; CTR/dwell/bounce charts update reactively from real events.
- **Tests**: `src/tests/components/simulatorAnalytics.test.tsx`, `src/tests/unit/simulationView.test.ts`.

### Phase 10: Comparison Lab
- **Objective**: Provide side-by-side alignment across all 4 search paradigms with rank shift metrics.
- **Files**: `src/pages/ComparisonPage.tsx`.
- **Dependencies**: Phase 5, Phase 8.
- **Acceptance Criteria**: 4-column SERP matrix; visual delta indicators for rank winners/losers; interactive weight blending slider.
- **Tests**: `src/tests/components/comparisonLab.test.tsx`.

### Phase 11: Educational Mathematics Section
- **Objective**: Author an interactive textbook explaining formulas, worked examples, and historical timelines.
- **Files**: `src/pages/LearnPage.tsx`.
- **Dependencies**: Phase 3, Phase 4, Phase 8.
- **Acceptance Criteria**: Accurate mathematical notation for TF, PageRank, and behavioral feedback; worked numerical examples match code outputs.
- **Tests**: `src/tests/components/appNavigation.test.tsx`.

### Phase 12: Integration, Accessibility, and Polish
- **Objective**: End-to-end verification, responsive styling, keyboard navigation, and production bundle optimization.
- **Files**: `src/App.tsx`, `src/components/layout/Layout.tsx`, `src/pages/HomePage.tsx`, `dist/*`.
- **Dependencies**: All prior phases.
- **Acceptance Criteria**: Zero TypeScript errors; zero failing tests; production build completes under 3 seconds; clean responsive layout.
- **Tests**: Complete test suite execution (`npm test`), production build verification (`npm run build`).

