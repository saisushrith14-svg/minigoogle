# MiniGoogle — Dataset Specification

## 1. Overview of Curated Datasets

MiniGoogle includes six curated, fully validated datasets designed to illustrate the progressive breakthroughs and failure modes of search engine ranking algorithms.

| ID | Title | Pages | Scenario Focus | Default Query | Key Pages |
|---|---|---|---|---|---|
| `keyword-stuffing` | Keyword Stuffing vs Authority | 7 | Manipulated TF vs Link Authority | `cheap flights` | `ks-spam`, `ks-authentic`, `ks-airline-hub` |
| `authority-problem` | The Authority Problem | 8 | Off-topic authority vs Deep topical match | `graph algorithms` | `ap-stanford-cs`, `ap-graph-tutorial` |
| `link-farm` | Link Farms & Artificial Collusion | 9 | Reciprocal link ring vs Organic citations | `seo marketing agency` | `farm-hub`, `farm-node-1`, `legit-agency` |
| `new-website` | New Website Cold Start | 7 | Zero backlinks vs Established authority | `quantum computing breakthrough` | `nw-fresh-paper`, `nw-legacy-encyclopedia` |
| `relevance-vs-popularity` | Relevance vs Popularity | 7 | Exact clinical monograph vs Generic portal | `kawasaki disease symptoms` | `rp-clinical-guide`, `rp-general-health` |
| `scientific-network` | Scientific Knowledge Network | 10 | Citation hierarchy, surveys & foundational papers | `pagerank random walk` | `sci-brin-page-1998`, `sci-survey-paper` |

---

## 2. Dataset Deep Dives

### 2.1 Scenario 1: Keyword Stuffing vs Authority (`keyword-stuffing`)
- **Pedagogical Goal**: Show how 1990s term frequency search was hijacked by keyword spam, and how PageRank's link graph permanently neutralized this tactic.
- **Graph Topology**:
  - `ks-authentic` receives 4 incoming links from trusted domains (`ks-airline-hub`, `ks-travel-forum`, `ks-consumer-watch`, `ks-budget-backpacker`).
  - `ks-spam` has 0 incoming links.
- **Expected Ranking Behavior**:
  - *Keyword Mode*: `ks-spam` is #1 ($Score \approx 0.85+$) due to 50+ repetitions of "cheap flights". `ks-authentic` ranks lower due to natural, un-stuffed editorial phrasing.
  - *PageRank Mode*: `ks-authentic` and `ks-airline-hub` dominate top positions ($PR > 0.25$). `ks-spam` drops to the very bottom (#7, $PR \approx 0.02$).
  - *Hybrid Mode*: `ks-authentic` rises to #1 because its combined relevance and high authority overcome `ks-spam`'s unverified text.

### 2.2 Scenario 2: The Authority Problem (`authority-problem`)
- **Pedagogical Goal**: Demonstrate that PageRank alone is insufficient because high-authority root domains (e.g., University homepages) can dominate queries even when their content mentions the query only casually.
- **Graph Topology**:
  - `ap-stanford-cs` has high incoming link volume from faculty, students, and research labs.
  - `ap-graph-tutorial` is a specialized tutorial page with in-depth explanations of Dijkstra, BFS, and DFS, but fewer backlinks.
- **Expected Ranking Behavior**:
  - *Keyword Mode*: `ap-graph-tutorial` ranks #1 with dense, precise algorithm explanations.
  - *PageRank Mode*: `ap-stanford-cs` ranks #1 due to massive institutional backlink weight.
  - *Hybrid Mode*: Rebalances both signals so the relevant tutorial achieves strong visibility without completely ignoring domain authority.

### 2.3 Scenario 3: Link Farms & Artificial Collusion (`link-farm`)
- **Pedagogical Goal**: Illustrate how early SEO manipulators formed closed reciprocal link rings ("link farms") to inflate PageRank, and how damping factors ($1-d$) and organic citation networks mitigate collusion.
- **Graph Topology**:
  - Circular ring of 5 collusion nodes (`farm-node-1` through `farm-node-4` linking cyclically to `farm-hub`).
  - Organic cluster centered on `legit-agency` with links from client reviews, industry awards, and business registries.
- **Expected Ranking Behavior**:
  - The link farm circulates rank among itself, but because it has no incoming links from the broader web, damping ($d = 0.85$) bleeds 15% of its mass to random teleports at every iteration.
  - Organic nodes with high external citations outrank the isolated farm.

### 2.4 Scenario 4: New Website Cold Start (`new-website`)
- **Pedagogical Goal**: Expose PageRank's fundamental weakness: newly published, highly relevant content starts with 0 backlinks and cannot rank under pure link analysis.
- **Graph Topology**:
  - `nw-fresh-paper`: Published yesterday, cutting-edge quantum breakthrough, 0 inbound links.
  - `nw-legacy-encyclopedia`: Established physics portal, dozens of old links, superficial coverage of modern quantum developments.
- **Expected Ranking Behavior**:
  - *PageRank Mode*: `nw-fresh-paper` is last (#7).
  - *Keyword Mode*: `nw-fresh-paper` is #1.
  - *Experimental Mode*: Once simulated surfers discover the fresh paper and engage (high dwell time, low bounce), its Behaviour Score elevates it in results.

### 2.5 Scenario 5: Relevance vs Popularity (`relevance-vs-popularity`)
- **Pedagogical Goal**: Highlight the trade-off in medical/technical search between a high-traffic general health portal and a specialized clinical diagnostic guide.
- **Graph Topology**:
  - `rp-general-health`: High in-degree, general wellness advice.
  - `rp-clinical-guide`: Low in-degree, exhaustive diagnostic symptom checklist for rare pediatric vasculitis.
- **Expected Ranking Behavior**:
  - Query: `kawasaki disease symptoms`
  - Keyword ranking places the clinical guide #1. PageRank places the general wellness portal #1. Hybrid ranking enables users to inspect how tuning weights ($w_{kw}$ vs $w_{pr}$) shifts the clinical diagnosis into the top 3.

### 2.6 Scenario 6: Scientific Knowledge Network (`scientific-network`)
- **Pedagogical Goal**: Emulate academic citation networks where seminal foundational papers (e.g., Brin & Page 1998) accumulate massive recursive authority from subsequent literature, surveys, and textbooks.
- **Graph Topology**:
  - 10 interconnected research documents including survey papers, foundational citations, implementation notes, and dangling conference abstracts.
- **Expected Ranking Behavior**:
  - `sci-brin-page-1998` accumulates the highest PageRank in the corpus as the foundational citation hub.

