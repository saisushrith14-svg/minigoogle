# MiniGoogle — UI/UX Specification

## 1. Visual Design Architecture

MiniGoogle employs a deliberate dual-personality interface:

1. **The 1998 Search Portal (`/search`)**:
   - Faithful homage to early web minimalism: pure white background (`#ffffff`), high-contrast classic blue links (`#1a0dab`), serif typography (`Times New Roman` headers), green destination URLs (`#006621`), and subtle grey meta descriptions (`#545454`).
   - Evokes the original Google search interface launched in 1998 at Stanford University.
2. **The Modern Analytics Workstation (`/graph`, `/simulator`, `/analytics`, `/compare`, `/learn`, `/datasets`)**:
   - Technical workbench designed for university computer science classrooms and engineering labs.
   - White/slate palette, crisp 1px borders (`#e2e8f0`), monospace formula callouts (`JetBrains Mono`), interactive SVG network graphs, and responsive Recharts dashboards.

---

## 2. Page Specifications

### 2.1 Home Page (`/`)
- **Purpose**: Welcoming landing page displaying high-level system overview and live 4-model result previews for the active dataset.
- **Components**:
  - `Hero`: Introductory description and quick links to Search, Graph, Simulator, and Comparison Lab.
  - `DatasetStrip`: Direct carousel to switch between the 6 educational scenarios.
  - `ModelMatrixCards`: 4 cards displaying live top-3 ranked results under Keyword, PageRank, Hybrid, and Experimental ranking for the default query.

### 2.2 Search Experience (`/search`)
- **Purpose**: Interactive search engine results page (SERP) demonstrating algorithmic ranking shifts in real time.
- **Components**:
  - `SearchBar`: Clean query input with instant submission on Enter or Search click, including prefilled test query pills.
  - `ModeTabs`: Toggle between Keyword (Pre-1998), PageRank (1998), Hybrid (60/40), and Experimental (+Telemetry).
  - `RankingControls`: Expandable weight sliders allowing users to dynamically adjust Keyword vs PageRank weights, damping factor ($d$), and keyword factor sub-weights.
  - `ResultCard`: Nostalgic search result item displaying:
    - Position badge (1st, 2nd, etc.).
    - Title link with deep-link navigation to the Graph explorer.
    - Destination URL in classic green.
    - Snippet preview with matched query term highlighting.
    - Final composite score pill and clickable "Factor Breakdown" accordion.
  - `FactorBreakdown`: Monospace telemetry audit revealing individual contributions ($TF$, $KD$, $TM$, $HM$, $MM$, $EPM$, $PRX$, $LN$, $PR$).

### 2.3 Knowledge Graph Explorer (`/graph`)
- **Purpose**: Interactive visualization of the directed hyperlink web graph.
- **Components**:
  - `GraphCanvas`: Force-directed or circular layout rendering pages as nodes and directed hyperlinks as arrows.
  - `NodeStyling`: Node radius dynamically scaled proportional to PageRank score. Node color mapped to category or ranking position.
  - `InteractionControls`: Zoom in/out, pan, layout toggle (Force vs Circle), metric coloring toggle.
  - `NodeInspector`: Side drawer displaying selected node metadata, inbound links, outbound links, PageRank, and individual keyword factor scores.

### 2.4 Surfer Simulation Studio (`/simulator`)
- **Purpose**: Interactive control deck to dispatch virtual web surfers and watch browsing behavior unfold.
- **Components**:
  - `ConfigDeck`: Sliders and numeric inputs for User Count (1–1000), Click Probability, Attention Span, Scroll Probability, Return/Bounce Probability, Follow Link Probability, and Random Seed.
  - `PresetToolbar`: Quick buttons for "Balanced Surfer", "High Bounce / Skeptical", "Deep Reader", and "Link Explorer".
  - `ControlBar`: "Run Simulation", "Reset", Play/Pause, Step Forward, and Speed Multiplier (0.5x, 1x, 2x, 5x, 10x).
  - `LiveEventFeed`: Monospace chronological stream of emitted events (`SEARCH`, `SCAN`, `CLICK_RESULT`, `DWELL`, `FOLLOW_LINK`, `RETURN_TO_SEARCH`).
  - `SessionTracker`: Card displaying active virtual surfers, current locations, and session progress.

### 2.5 Telemetry Analytics Dashboard (`/analytics`)
- **Purpose**: Rigorous visualization of simulation metrics and behavioral derivations.
- **Components**:
  - `KpiBar`: Total Sessions, Total Clicks, Average CTR, Average Dwell Time, Average Bounce Rate.
  - `CtrBarChart`: Recharts bar chart of Click-Through Rate per page.
  - `DwellHistogram`: Average reading dwell time in seconds per page.
  - `BounceRateChart`: Immediate bounce percentage per page.
  - `BehaviourScoreDerivationTable`: Full mathematical audit displaying raw CTR, normalized CTR, saturating dwell score, bounce penalty, and resulting composite `BehaviourScore`.
  - `NavigationSankeyPaths`: Chronological list of multi-step browsing journeys taken by virtual surfers.

### 2.6 Ranking Comparison Lab (`/compare`)
- **Purpose**: Side-by-side alignment of all four ranking paradigms over the exact same corpus and query.
- **Components**:
  - `FourColumnSerp`: Side-by-side results listing for Keyword, PageRank, Hybrid, and Experimental.
  - `PositionMatrix`: Table mapping each document's rank across all four models ($1 \to 7$, etc.).
  - `MovementHighlights`: Visual indicators highlighting the biggest winners and losers between paradigms (e.g., `ks-spam` dropping from #1 in Keyword to #7 in PageRank).
  - `WeightBlendSimulator`: Real-time dual slider allowing live continuous morphing between 100% Keyword and 100% PageRank.

### 2.7 Interactive Textbook / Learn Page (`/learn`)
- **Purpose**: Educational deep-dive explaining the underlying mathematics, history, and algorithms.
- **Components**:
  - Mathematical derivations rendered in monospace and LaTeX notations.
  - Interactive worked examples using the active corpus.
  - Historical timelines from 1990 Archie/Gopher to 1998 Google.

### 2.8 Dataset Browser (`/datasets`)
- **Purpose**: Corpus inspection studio for exploring the 6 educational scenarios.
- **Components**:
  - Scenario cards detailing learning objectives, graph characteristics, and key pages.
  - Complete document list with full text, meta tags, and directed link tables.
  - Graph integrity indicator (zero broken links verified).

---

## 3. Responsive & Accessible Engineering

- **Mobile & Tablet**: Layout gracefully condenses to single-column card feeds on screens $< 768\text{px}$. Top navigation collapses into an accessible mobile drawer.
- **Keyboard Navigation**: Full tab index support across search inputs, mode tabs, graph nodes, and result accordions.
- **State Preservation**: Active dataset, query, and ranking weights persist seamlessly across route transitions via `AppContext`.

