# MiniGoogle — Project Overview

## 1. Vision & Purpose

MiniGoogle is an interactive, browser-based educational simulator designed to teach computer science students, software engineers, and search practitioners how search engines evolved over the pivotal decade between 1990 and 2000—and how modern behavioural feedback loops interact with classical ranking algorithms.

The application demonstrates four paradigms side-by-side:

1. **Pre-1998 Keyword Relevance**: Document matching based on Term Frequency (TF), Keyword Density, Title/Heading weighting, Exact Phrase Matching, Proximity Windows, and Document Length Normalization.
2. **1998 PageRank Algorithm**: Larry Page and Sergey Brin's revolutionary random-surfer model that measures the recursive hyperlink topology of the web to compute intrinsic document authority.
3. **Hybrid Search Engine**: Linear convex combination of content relevance and link authority ($0.60 \times \text{Keyword} + 0.40 \times \text{PageRank}$), resolving the tension between content and authority.
4. **Experimental Surfer-Behavior Ranking**: Modern feedback loop incorporating simulated telemetry (Click-Through Rate, Dwell Time, Bounce Rate) without corrupting classical PageRank.

## 2. Key Pedagogical Scenarios

MiniGoogle ships with six curated datasets, each designed to demonstrate a distinct algorithmic phenomenon:

- **Scenario 1: Keyword Stuffing vs Authority**: An aggressive keyword-repeating spam portal dominates 1990s TF models but drops to the bottom under PageRank because reputable sites link to authoritative travel guides instead.
- **Scenario 2: The Authority Problem**: A high-PageRank homepage mentioning a search query once outranks a specialized deep page under pure PageRank, demonstrating why keyword relevance and link authority must be blended.
- **Scenario 3: Link Farms & Artificial Cliques**: A syndicate of spam sites forming a reciprocal link ring attempts to game PageRank, illustrating damping factor effects and organic citation contrast.
- **Scenario 4: The New Website Cold-Start Problem**: A groundbreaking research paper published today with 0 inbound links is invisible under PageRank, showing why pure link-based ranking penalizes fresh content.
- **Scenario 5: Perfect Relevance vs Popularity**: A clinical medical monograph containing the exact diagnostic symptom list versus a high-traffic wellness portal.
- **Scenario 6: Scientific Knowledge Network**: A directed citation graph representing foundational papers, survey papers, niche studies, and dangling references.

## 3. Architectural Constraints & Design Principles

- **100% Client-Side Execution**: Zero backend dependencies, external search APIs, or databases. All graph algorithms, tokenizers, power-iteration solvers, and discrete-event simulations execute in the browser.
- **Mathematical Correctness**: PageRank follows the exact stochastic power-iteration formulation with $d = 0.85$, uniform dangling mass redistribution, and $L_1$ convergence verification.
- **Strict Separation of Concerns**: Classical PageRank is purely topological; user telemetry never mutates PageRank scores. Telemetry is consumed strictly in the separate Experimental ranking mode.
- **Deterministic Reproducibility**: The surfer simulation uses a seedable Mulberry32 pseudo-random number generator, guaranteeing identical event logs and metrics across identical runs.
- **Dual Visual Theme**:
  - *Search Interface*: Nostalgic, clean 1998 Google-inspired minimalist layout with blue hyperlinks, serif titles, and minimal clutter.
  - *Analytics Dashboard*: Modern, technical workstation interface featuring interactive directed graphs, Recharts dashboards, matrix position comparisons, and LaTeX formula breakdowns.

