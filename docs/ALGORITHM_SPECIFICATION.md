# MiniGoogle — Algorithm Specification

## 1. Pre-1998 Keyword Relevance Engine

### 1.1 Philosophy & Educational Intent
In early web search (1990–1997, e.g., Lycos, AltaVista, WebCrawler), search engines ranked pages primarily by scanning textual HTML contents. Because these systems lacked link analysis, content creators learned to exploit term frequency formulas through "keyword stuffing"—repeating search queries dozens of times in the body or meta tags to force their page to the top of results.

### 1.2 Mathematical Formulation
For a document $D$ and query $Q$ tokenized into terms $q_1, q_2, \dots, q_k$:

1. **Term Frequency ($TF$)**:
   $$\text{occurrences} = \sum_{q \in Q} \text{count}(q, \text{bodyTokens}(D))$$
   $$TF = 1 - \exp\left(-\frac{\text{occurrences}}{2}\right)$$
   This exponential saturation curve rewards relevant pages while naturally diminishing returns on extreme counts.

2. **Keyword Density ($KD$)**:
   $$\text{density} = \frac{\text{occurrences}}{\max(1, |\text{bodyTokens}(D)|)}$$
   $$KD = \text{clamp}\left(\frac{\text{density}}{0.06}, 0, 1\right)$$
   A density of 6% or higher achieves the maximum density score of 1.0.

3. **Title Match ($TM$)**:
   $$TM = \frac{|\{q \in Q : q \in \text{titleTokens}(D)\}|}{|Q|}$$

4. **Heading Match ($HM$)**:
   For headings $H_1, H_2, \dots, H_m$ with hierarchical weights $w_j = \max(0.35, 1 - 0.18 \cdot j)$:
   $$HM = \frac{1}{|Q|} \sum_{q \in Q} \max_{j : q \in H_j} (w_j)$$

5. **Meta Description Match ($MM$)**:
   $$MM = \frac{|\{q \in Q : q \in \text{metaTokens}(D)\}|}{|Q|}$$

6. **Exact Phrase Match ($EPM$)**:
   $$EPM = \begin{cases} 1 & \text{if } |Q| > 1 \text{ and } Q \text{ appears contiguously in body} \\ 0 & \text{otherwise} \end{cases}$$

7. **Proximity Window ($PRX$)**:
   For $|Q| = 1$: $PRX = 1$ if query is present, else $0$.
   For $|Q| > 1$: Let $W$ be the minimal contiguous token span containing all unique query terms:
   $$\text{averageGap} = \frac{\text{span}(W) - |Q|}{|Q| - 1}$$
   $$PRX = \frac{1}{1 + \max(0, \text{averageGap})}$$

8. **Document Length Normalization ($LN$)**:
   To prevent severe bias against either short abstracts or comprehensive deep guides:
   $$\text{lengthRatio} = \frac{|\text{bodyTokens}(D)| + 1}{\text{avgTokens}(\text{Corpus}) + 1}$$
   $$LN = \text{clamp}\left(\frac{1}{1 + 0.3 \cdot |\ln(\text{lengthRatio})|}, 0.25, 1.0\right)$$

### 1.3 Composite Keyword Score
$$\text{RawWeighted} = \frac{\sum_{i} w_i \cdot \text{Factor}_i}{\sum_{i} w_i}$$
$$\text{KeywordScore}(D, Q) = \text{clamp}(\text{RawWeighted} \times LN, 0, 1)$$

Default weights:
$w_{TF} = 0.18, w_{KD} = 0.17, w_{TM} = 0.20, w_{HM} = 0.15, w_{MM} = 0.10, w_{EPM} = 0.12, w_{PRX} = 0.08$.

---

## 2. 1998 PageRank Algorithm

### 2.1 Classical Formulation
PageRank models a random web surfer navigating a directed hyperlink graph of $N$ pages. With probability $d$ (damping factor, typically $0.85$), the surfer clicks an outgoing link uniformly at random. With probability $1 - d$, the surfer teleports to an arbitrary page chosen uniformly at random across the entire web.

For page $i$:
$$PR(i) = \frac{1 - d}{N} + d \sum_{j \in \text{In}(i)} \frac{PR(j)}{C(j)}$$
where $\text{In}(i)$ is the set of pages linking to $i$, and $C(j)$ is the out-degree of page $j$.

### 2.2 Dangling Node Redistribution
A page with no outgoing links within the corpus ($C(j) = 0$) is a **dangling node** (sink). Without correction, rank mass flows into dangling nodes and drains from the system during iterative multiplication.

To maintain a true stochastic probability vector ($\sum_{i=1}^N PR(i) = 1$):
$$\text{danglingMass} = \sum_{j : C(j) = 0} PR(j)$$
The corrected iterative update equation is:
$$PR^{(t+1)}(i) = \frac{1 - d}{N} + \frac{d \cdot \text{danglingMass}^{(t)}}{N} + d \sum_{j \in \text{In}(i), C(j) > 0} \frac{PR^{(t)}(j)}{C(j)}$$

### 2.3 Convergence Criteria
- **Initial State**: $PR^{(0)}(i) = \frac{1}{N}$ for all $i \in \{1, \dots, N\}$.
- **Stopping Condition**:
  $$\Delta^{(t)} = \sum_{i=1}^N |PR^{(t)}(i) - PR^{(t-1)}(i)| < \epsilon$$
  where $\epsilon = 10^{-6}$ (default threshold, evaluated up to $\max = 100$ iterations).
- **Invariance**: At every iteration $t$, $\sum_{i=1}^N PR^{(t)}(i) \approx 1.0$.

### 2.4 Worked Numerical Example
Consider a 3-page graph:
- Page A links to Page B ($C(A) = 1$)
- Page B links to Page C ($C(B) = 1$)
- Page C links to Page A ($C(C) = 1$)

$N = 3$, $d = 0.85$.
Initial state $t=0$:
$$PR(A) = 1/3, \quad PR(B) = 1/3, \quad PR(C) = 1/3$$
Iteration $t=1$:
$$PR(A) = \frac{1 - 0.85}{3} + 0.85 \cdot \frac{PR(C)}{1} = 0.05 + 0.85 \cdot \frac{1}{3} = 0.333333$$
By cyclic symmetry, all pages remain exactly at $1/3 \approx 0.333333$, confirming immediate convergence for symmetric rings.

Now consider:
- Page A links to B and C ($C(A) = 2$)
- Page B links to C ($C(B) = 1$)
- Page C is a dangling node ($C(C) = 0$)

$N = 3, d = 0.85$.
Initial state $PR^{(0)} = [1/3, 1/3, 1/3]$.
$\text{danglingMass} = PR(C) = 1/3$.
Teleport + Dangling Share for every node:
$$\text{base} = \frac{1 - 0.85}{3} + \frac{0.85 \cdot (1/3)}{3} = 0.05 + 0.094444 = 0.144444$$
Updates:
$$PR^{(1)}(A) = 0.144444 + 0 = 0.144444$$
$$PR^{(1)}(B) = 0.144444 + 0.85 \cdot \frac{PR^{(0)}(A)}{2} = 0.144444 + 0.85 \cdot \frac{1/6} = 0.144444 + 0.141667 = 0.286111$$
$$PR^{(1)}(C) = 0.144444 + 0.85 \cdot \frac{PR^{(0)}(A)}{2} + 0.85 \cdot \frac{PR^{(0)}(B)}{1} = 0.144444 + 0.141667 + 0.283333 = 0.569444$$
Sum: $0.144444 + 0.286111 + 0.569444 = 1.000000$.
Page C receives the highest PageRank because both A and B direct their link flow toward C.

---

## 3. Hybrid Ranking Engine

### 3.1 Motivation
Pure Keyword Relevance is vulnerable to spam and lacks authority signals. Pure PageRank is query-independent and measures popularity regardless of topic. Hybrid ranking combines both signals into a single score.

### 3.2 Formulation
Let $PR_{\text{norm}}(i)$ be the Min-Max normalized PageRank score across corpus $P$:
$$PR_{\text{norm}}(i) = \frac{PR(i) - \min_{p \in P} PR(p)}{\max_{p \in P} PR(p) - \min_{p \in P} PR(p)}$$
If all pages have identical PageRank, $PR_{\text{norm}}(i) = 0.5$.

$$\text{FinalScore}_{\text{hybrid}}(i) = w_{kw} \cdot \text{KeywordScore}(i, Q) + w_{pr} \cdot PR_{\text{norm}}(i)$$
Normalized weights:
$$w_{kw} = \frac{0.60}{0.60 + 0.40} = 0.60, \quad w_{pr} = \frac{0.40}{0.60 + 0.40} = 0.40$$

---

## 4. Experimental Surfer-Behavior Ranking

### 4.1 Telemetry Aggregation
Simulated user sessions generate interaction telemetry:
- **Click-Through Rate ($CTR$)**:
  $$CTR(i) = \frac{\text{clicks}(i)}{\max(1, \text{impressions}(i))}$$
  $$CTR_{\text{score}}(i) = \frac{CTR(i)}{\max_{p \in P} CTR(p)}$$
- **Saturating Dwell Score**:
  $$Dwell_{\text{score}}(i) = 1 - \exp\left(-\frac{\text{avgDwellSeconds}(i)}{20}\right)$$
- **Bounce Rate Penalty**:
  $$\text{BouncePenalty}(i) = \text{bounceRate}(i) = \frac{\text{immediateReturns}(i)}{\max(1, \text{visits}(i))}$$
- **Behaviour Score ($BS$)**:
  $$BS(i) = \text{clamp}(0.5 \cdot CTR_{\text{score}}(i) + 0.5 \cdot Dwell_{\text{score}}(i) - 0.3 \cdot \text{BouncePenalty}(i), 0, 1)$$
  *(Pages with 0 telemetry receive $BS(i) = 0$)*

### 4.2 Experimental Blend
$$\text{FinalScore}_{\text{experimental}}(i) = 0.50 \cdot \text{KeywordScore}(i) + 0.30 \cdot PR_{\text{norm}}(i) + 0.20 \cdot BS(i)$$
*(Weights are dynamically normalized if adjusted by user sliders).*

