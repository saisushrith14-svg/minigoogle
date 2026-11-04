# MiniGoogle — OpenCode Engineering Handoff

## 1. Project Overview & Mandatory Instructions

MiniGoogle is an interactive, purely client-side educational search engine simulator demonstrating the evolution of information retrieval:
1. **Pre-1998 Keyword Matching** (Term frequency, density, headings, proximity, length normalization).
2. **1998 PageRank** (Power iteration, random surfer model, dangling node redistribution).
3. **Hybrid Search** (Linear convex combination of relevance and link authority).
4. **Experimental Telemetry-Informed Search** (Surfer telemetry feedback without corrupting classical PageRank).

### Mandatory Engineering Directives

> [!IMPORTANT]
> - **Read all documentation in `/docs` before modifying code.**
> - **Follow the implementation roadmap sequentially.**
> - **Do not invent alternative architecture without a documented technical reason.**
> - **Do not hardcode ranking outputs or simulated analytics.**
> - **All calculations must be mathematically correct and independently testable.**
> - **Run tests after each implementation phase (`npm test`).**
> - **Do not leave placeholder implementations, TODOs, or fake functionality in completed phases.**
> - **Update implementation progress in `IMPLEMENTATION_STATUS.md`.**
> - **Preserve all existing functionality when modifying existing modules.**
> - **Do not silently change shared TypeScript contracts.**
> - **At the end of every phase, report changed files, tests executed, results, and outstanding issues.**

---

## 2. Technical Stack & Standards

- **Language**: TypeScript 5.8 (Strict mode enabled, `noImplicitAny: true`, zero `any`).
- **Framework**: React 19 with Vite 6.
- **Styling**: Tailwind CSS 3.4 with custom Google 1998 palettes.
- **Visualization**: Recharts 2.15 (Bar charts, scatter, histograms) and interactive SVG graph layouts.
- **Routing**: React Router 7 (`BrowserRouter` in app, `MemoryRouter` in tests).
- **Validation**: Zod 3.24 for runtime corpus and configuration integrity.
- **Testing**: Vitest 3.0 and React Testing Library with `@testing-library/jest-dom`.

---

## 3. Directory Layout & Module Responsibilities

```
src/
├── algorithms/
│   ├── keyword/               # Keyword relevance scoring (8 factors)
│   ├── pagerank/              # Power-iteration PageRank ($d=0.85$)
│   ├── hybrid/                # Convex combination ranking pipeline
│   ├── surfer/                # Behaviour score derivation
│   └── tokenizer.ts           # Suffix-stripping tokenizer & proximity calculation
├── simulation/
│   └── surferSimulation.ts    # Deterministic discrete-event surfer engine
├── data/
│   ├── datasets/              # All 6 curated datasets
│   └── datasetRegistry.ts     # Dataset catalog and lookup
├── types/                     # Shared TypeScript contracts (zero `any`)
├── utils/                     # Graph utils, normalization, PRNG, and validation
├── state/
│   └── AppContext.tsx         # Unified reactive state container
├── components/                # Presentation components (search, graph, results)
└── pages/                     # Search, Graph, Simulator, Analytics, Compare, Learn, Datasets
```

---

## 4. Key Algorithm Specifications

### 4.1 Keyword Scoring
- Formula: $\text{KeywordScore} = \text{clamp}\left(\frac{\sum w_i F_i}{\sum w_i} \times LN, 0, 1\right)$
- Factors: $TF$ (exponential decay), $KD$ (density clamped at 6%), $TM$ (title match), $HM$ (heading match), $MM$ (meta description match), $EPM$ (exact phrase match bonus), $PRX$ (term proximity gap), $LN$ (symmetric log-ratio length normalization).

### 4.2 PageRank
- Formula: $PR(i) = \frac{1 - d}{N} + \frac{d \cdot \text{danglingMass}}{N} + d \sum_{j \in \text{In}(i), C(j) > 0} \frac{PR(j)}{C(j)}$
- Parameters: $d = 0.85$, $\epsilon = 10^{-6}$ (or $10^{-8}$), $\max = 100$ iterations.
- Invariant: $\sum_{i=1}^N PR(i) \approx 1.000000$ at all times.

### 4.3 Hybrid & Experimental Models
- Hybrid: $Score = 0.60 \cdot Keyword + 0.40 \cdot PR_{\text{norm}}$
- Experimental: $Score = 0.50 \cdot Keyword + 0.30 \cdot PR_{\text{norm}} + 0.20 \cdot BehaviourScore$
- **Rule**: PageRank must remain purely link-topological; simulated telemetry applies strictly to the Experimental model.

---

## 5. Curated Scenarios Checklist

Every dataset must satisfy its pedagogical guarantee:
1. `keyword-stuffing`: Spammer dominates Keyword ranking; drops to bottom in PageRank.
2. `authority-problem`: Institutional homepage dominates PageRank; tutorial dominates Keyword.
3. `link-farm`: Reciprocal farm is mitigated by damping factor; organic citations win.
4. `new-website`: Zero-backlink breakthrough paper ranks last in PageRank; promoted by simulated user engagement in Experimental mode.
5. `relevance-vs-popularity`: Clinical monograph outranks general wellness portal for diagnostic symptoms.
6. `scientific-network`: Seminal 1998 paper accumulates recursive citation dominance.

---

## 6. Verification & Quality Gates

Before committing any modification:
```bash
npm run lint         # TypeScript compilation check
npm test             # Run all unit, integration, and component tests
npm run build        # Production bundle build
```
All checks must exit with code 0. Zero warnings, zero errors.

