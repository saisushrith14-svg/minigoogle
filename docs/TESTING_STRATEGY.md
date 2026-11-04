# MiniGoogle — Testing Strategy & Verification Plan

## 1. Testing Philosophy

MiniGoogle implements a zero-mock, mathematically verifiable testing strategy. Because the application is 100% client-side, unit and integration tests execute against the exact same pure functions and components that run in the production browser.

Automated verification is partitioned into four distinct tiers:
1. **Mathematical Unit Tests**: Verification of pure algebraic formulas, numerical convergence, graph topology solvers, and PRNG reproducibility.
2. **Integration Tests**: Dataset integrity validation, cross-model ranking assertions, and scenario verification.
3. **Component & User-Journey Tests**: React Testing Library tests verifying search workflows, weight slider reactivity, route transitions, and simulation replay.
4. **Scalability & Performance Tests**: Stress tests executing simulations with 1, 100, 500, and 1000 concurrent virtual users.

---

## 2. Test Suite Architecture

```
src/tests/
├── setup.ts                           # jsdom global mocks (ResizeObserver, matchMedia)
├── fixtures/
│   └── sampleGraphs.ts                # Canonical topologies (cyclic, dangling, disconnected, single-node)
├── algorithms/
│   └── pageRankFixtures.test.ts       # Mathematical validation against textbook graph fixtures
├── integration/
│   ├── datasetValidation.test.ts      # Zod validation and graph link integrity across all 6 datasets
│   └── rankingScenarios.test.ts       # Educational assertions for each of the 6 scenario corpora
├── unit/
│   ├── behaviourScoring.test.ts       # CTR normalization, saturating dwell, and bounce penalty
│   ├── graphUtils.test.ts             # Adjacency matrices, in-degree/out-degree, dangling nodes
│   ├── keywordScoring.test.ts         # 8-factor keyword relevance engine and factor weighting
│   ├── normalization.test.ts          # Min-max scaling, sum-to-1 vectors, and numeric clamping
│   ├── pageRank.test.ts               # Iterative power-iteration solver and stochastic invariants
│   ├── random.test.ts                 # Mulberry32 PRNG determinism and distribution checks
│   ├── rankingPipeline.test.ts        # Unified ranking pipeline, hybrid blending, and explanations
│   ├── simulation.test.ts             # Event emission, telemetry derivation, and state transitions
│   ├── simulationScalability.test.ts  # Multi-user scalability benchmarks (1, 100, 500, 1000 users)
│   ├── simulationView.test.ts         # Replay state, speed formatting, and telemetry validity
│   └── tokenizer.ts                   # Token extraction, punctuation stripping, phrase & proximity
└── components/
    ├── appNavigation.test.tsx         # Route transitions and shell integrity
    ├── comparisonLab.test.tsx         # Four-model comparison rendering and page selection
    ├── datasetsPage.test.tsx          # Dataset browser switching and educational notes display
    ├── graphPage.test.tsx             # Interactive graph rendering and node inspector
    ├── searchExperience.test.tsx      # Query submission, mode tabs, and weight sliders
    └── simulatorAnalytics.test.tsx    # Simulation execution, event playback, and telemetry sharing
```

---

## 3. Detailed Test Specifications

### 3.1 Keyword Ranking Engine Tests (`keywordScoring.test.ts`)
- **Single Keyword**: Scores document correctly with basic term frequency.
- **Multiple Keywords**: Accurately computes partial and full intersection matches.
- **Exact Phrase Matching**: Grants bonus multiplier if and only if terms appear in contiguous order.
- **No Matches / Empty Query**: Returns 0 score with no NaN or infinite values.
- **Keyword Stuffing**: Verifies that extreme repetition increases $TF$ and $KD$ up to saturation without numerical overflow.
- **Document Length Normalization**: Validates that neither 10-word snippets nor 10,000-word documents receive distortive score inflations.
- **Weight Customization**: Adjusting individual factor weights changes scores predictably; zeroing out a weight eliminates its contribution.

### 3.2 PageRank Engine Tests (`pageRank.test.ts`, `pageRankFixtures.test.ts`)
- **Simple Directed Graph**: Page with highest incoming citations receives highest PageRank.
- **Dangling Nodes**: Pages with 0 outbound links do not leak probability mass; total score sums to $1.000000 \pm 10^{-5}$.
- **Cyclic Graph**: A symmetric ring ($A \to B \to C \to A$) produces mathematically identical scores ($1/3$ each).
- **Single Node Graph**: Isolated node receives PageRank of $1.0$.
- **Disconnected Graph**: Multiple isolated graph components converge stably and preserve stochastic properties.
- **Convergence Rate**: Verifies convergence within $\le 100$ iterations under default $\epsilon = 10^{-8}$.
- **Damping Factor Sensitivity**: Setting $d = 0$ yields a perfectly uniform distribution ($1/N$); setting $d = 1.0$ removes teleportation.

### 3.3 Surfer Simulation Tests (`simulation.test.ts`, `simulationScalability.test.ts`)
- **Single User**: Dispatches 1 user, completes session, and records valid timestamps and event sequences.
- **Multi-User Scalability**: Dispatches 100, 500, and 1000 virtual surfers; all runs execute in $< 50\text{ms}$ with zero memory leaks.
- **Deterministic Reproducibility**: Running simulation twice with `randomSeed: 42` produces identical event counts, event types, timestamps, and analytics.
- **Navigation Transitions**: Ensures surfers only follow valid outbound links present on the active page.
- **Bounce Rate Accuracy**: Users who immediately return to search without engaging increment the bounce counter accurately.

### 3.4 Integration & Scenario Tests (`rankingScenarios.test.ts`, `datasetValidation.test.ts`)
- **Dataset Referential Integrity**: Every link across all 6 datasets resolves to an existing page ID (0 broken links).
- **Scenario 1 Verification**: In `keyword-stuffing`, `ks-spam` ranks #1 in Keyword mode and last in PageRank mode.
- **Scenario 2 Verification**: In `authority-problem`, the high-authority root ranks #1 in PageRank, while the specific tutorial ranks #1 in Keyword mode.
- **Scenario 3 Verification**: In `link-farm`, organic business nodes outrank the artificial link farm under hybrid search.
- **Scenario 4 Verification**: In `new-website`, the zero-backlink paper is invisible under PageRank but promoted by user engagement in Experimental mode.
- **Scenario 5 Verification**: In `relevance-vs-popularity`, the clinical diagnosis monograph outranks the popular wellness portal in Keyword and Hybrid mode.

---

## 4. Execution Commands

```bash
# Run complete test suite (unit + integration + components)
npm test

# Run tests in watch mode during development
npm run test:watch

# Execute only dataset validation
npm run validate:datasets

# Run type check and verify zero compilation errors
npm run lint

# Run production build
npm run build
```

