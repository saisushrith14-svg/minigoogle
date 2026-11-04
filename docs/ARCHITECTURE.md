# MiniGoogle — System Architecture

## 1. Architectural Blueprint

MiniGoogle is structured around a modular, unidirectional data flow separating immutable corpora, pure mathematical algorithms, discrete-event simulation, global state management, and declarative React presentation.

```
                  +-----------------------------------+
                  |         Curated Datasets          |
                  |  (keywordStuffing, authority...)  |
                  +-----------------+-----------------+
                                    |
                                    v
+-----------------------+     +-----+-----+     +-----------------------+
|  Keyword Scoring TF   | --> |  Ranking  | <-- |   Iterative PageRank  |
|  (8-factor algorithm) |     |  Pipeline |     | (Power-iteration 100) |
+-----------------------+     +-----+-----+     +-----------------------+
                                    |
                                    v
                          +---------+---------+
                          |   Search Responses |
                          +---------+---------+
                                    |
            +-----------------------+-----------------------+
            |                                               |
            v                                               v
+-----------+-----------+                       +-----------+-----------+
|  Surfer Simulation    |                       | Presentation Layer    |
|  (Deterministic PRNG) |                       | - Search Experience   |
+-----------+-----------+                       | - Comparison Lab      |
            |                                   | - Knowledge Graph     |
            v                                   | - Telemetry Dashboard |
+-----------+-----------+                       | - Learn / Mathematics |
|  Telemetry Analytics  | --------------------> | - Dataset Browser     |
| (CTR, Dwell, Bounces) |   (Experimental Mode) +-----------------------+
+-----------------------+
```

## 2. Directory Structure & Layer Responsibilities

```
src/
├── algorithms/                 # Pure mathematical functions and ranking engines
│   ├── keyword/               # Pre-1998 term frequency & content relevance
│   │   ├── keywordScoring.ts  # 8-factor scoring implementation
│   │   ├── keywordRanking.ts  # Corpus-level scoring & ranking
│   │   └── keywordNormalization.ts # Weight sanitization & length normalization
│   ├── pagerank/              # 1998 Google link-structure analysis
│   │   ├── pageRank.ts        # Power-iteration solver & history tracking
│   │   ├── convergence.ts     # L1 delta norm & tolerance evaluation
│   │   └── danglingNodes.ts   # Uniform mass redistribution for dangling sinks
│   ├── hybrid/                # Convex combination ranking models
│   │   └── hybridRanking.ts   # Blending weights & SERP ordering
│   ├── surfer/                # Surfer engagement scoring
│   │   ├── behaviourScoring.ts# CTR, saturating dwell, and bounce penalty
│   │   ├── userBehaviour.ts   # Finite state machine transitions
│   │   └── analytics.ts       # Telemetry aggregation
│   └── tokenizer.ts           # Stemming-neutral tokenization & proximity windows
├── simulation/
│   └── surferSimulation.ts    # Discrete-event simulation runner & state tracking
├── data/
│   ├── datasets/              # Real educational corpora with valid hyperlink graphs
│   │   ├── keywordStuffing.ts
│   │   ├── authorityProblem.ts
│   │   ├── linkFarm.ts
│   │   ├── newWebsite.ts
│   │   ├── relevanceVsPopularity.ts
│   │   └── scientificNetwork.ts
│   └── datasetRegistry.ts     # Global catalog, metadata accessors, and validators
├── types/                     # Shared TypeScript contracts (zero `any`)
│   ├── webpage.ts             # WebPage document structure
│   ├── dataset.ts             # Corpus definition & metadata
│   ├── ranking.ts             # Factors, weights, PageRank results, SERP items
│   ├── simulation.ts          # Simulation configurations, actions, events
│   └── analytics.ts           # Telemetry metrics and score breakdowns
├── utils/                     # Algorithmic utilities & mathematical primitives
│   ├── graphUtils.ts          # Adjacency matrices, in/out degrees, dangling sinks
│   ├── normalization.ts       # Min-Max scaling, sum-to-1, clamp
│   ├── random.ts              # Seedable Mulberry32 PRNG
│   └── validation.ts          # Zod schemas & graph integrity checkers
├── state/
│   └── AppContext.tsx         # Global application state (dataset, query, mode, telemetry)
├── components/                # Modular React visual components
│   ├── common/                # Shared buttons, badges, primitives
│   ├── layout/                # Responsive navigation shell & footer
│   ├── search/                # Search bar, result cards, factor breakdowns
│   └── graph/                 # Interactive directed graph (SVG / React Flow)
└── pages/                     # Routed view controllers
    ├── HomePage.tsx           # Landing portal with live overview across all 4 models
    ├── SearchPage.tsx         # Nostalgic 1998 search experience & result inspector
    ├── ComparisonPage.tsx     # Side-by-side 4-model alignment & rank shift matrix
    ├── GraphPage.tsx          # Directed graph explorer & page node inspector
    ├── SimulatorPage.tsx      # Surfer simulation studio & live event log
    ├── AnalyticsPage.tsx      # Recharts telemetry visualization & score derivations
    ├── LearnPage.tsx          # Interactive textbook with worked formulas
    └── DatasetsPage.tsx       # Corpus browser with scenario documentation
```

## 3. Data Flow & State Management

1. **Active Dataset & Query State**: Managed centrally by `AppContext`. When a user selects a dataset or updates a query, changes cascade reactively to all views.
2. **Deterministic Pipelines**:
   - `rankPages(pages, query, options)` computes ranking deterministically.
   - In `keyword` mode, link structure is ignored.
   - In `pagerank` mode, text content is ignored; ranking is derived purely from link topology.
   - In `hybrid` mode, $Score = w_{kw} \cdot Keyword + w_{pr} \cdot PageRank$.
   - In `experimental` mode, recorded simulation telemetry contributes to final score.
3. **Telemetry Boundary**:
   - User simulation runs produce immutable `SimulationRun` records containing an event log.
   - Analytics are computed via pure functions from events.
   - If a user changes dataset, query, or base ranking, existing telemetry is flagged as stale, preventing stale behavioral data from polluting new queries.

