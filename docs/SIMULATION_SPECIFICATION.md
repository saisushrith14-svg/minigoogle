# MiniGoogle — Surfer Simulation Specification

## 1. Discrete-Event Simulation Model

MiniGoogle includes a deterministic, client-side web surfer simulation engine. It models the behavior of virtual web searchers interacting with a Search Engine Results Page (SERP) and navigating the resulting hyperlinked pages.

### 1.1 State Machine Lifecycle

```
[IDLE] ─── SEARCH ───> [SEARCHING] ─── SCAN ───> [VIEWING_RESULTS]
                                                      │
                       ┌──────────────────────────────┼──────────────────────────────┐
                       │                              │                              │
                       v (p_click * pos_decay)        v (1 - p_click)                v (timeout)
                CLICK_RESULT                     END_SESSION                    END_SESSION
                       │
                       v
               [BROWSING_PAGE] <───────────────────────┐
                       │                               │
       ┌───────────────┼───────────────┬───────────────┴───────────────┐
       │               │               │                               │
       v               v               v                               v
     DWELL          SCROLL        FOLLOW_LINK                  RETURN_TO_SEARCH
 (read content)  (engagement)    (outgoing link)                (bounce to SERP)
       │               │               │                               │
       └───────────────┼───────────────┘                               v
                       │                                      [VIEWING_RESULTS]
                       v (p_abandon or session limit)
                  END_SESSION
```

### 1.2 Surfer Parameters (`SimulationConfig`)

- `userCount` (1–1000): Number of virtual surfers dispatched.
- `clickProbability` (0.0–1.0, default 0.72): Baseline probability of clicking into a result.
- `attentionSpan` (2–3600s, default 60s): Maximum duration of an individual surfer session.
- `scrollProbability` (0.0–1.0, default 0.55): Probability that a user reads down the page.
- `returnProbability` (0.0–1.0, default 0.50): Probability of hitting "Back to Search" when unsatisfied.
- `followLinkProbability` (0.0–1.0, default 0.35): Probability of following an in-page outbound hyperlink.
- `speed` (0.25x–20x): Playback speed multiplier for UI visualization and step animations.
- `randomSeed` (integer): PRNG seed for deterministic execution.

### 1.3 Position-Dependent Click Attenuation
In real-world search engines, top-ranked results receive an overwhelming percentage of clicks regardless of quality (Position Bias). MiniGoogle models position bias using an empirical logarithmic decay:
$$P(\text{click} \mid \text{position } k) = \text{clickProbability} \times \frac{1}{\log_2(k + 1)}$$
- Position 1: $100\%$ of baseline click probability.
- Position 2: $63\%$ of baseline.
- Position 3: $50\%$ of baseline.
- Position 4: $43\%$ of baseline.

### 1.4 Deterministic Pseudo-Random Generation
All stochastic branching decisions use a `SeededRandom` instance initialized with `SimulationConfig.randomSeed`. Two runs with identical configuration and seed produce 100% bit-for-bit identical event logs, timestamps, and analytics.

---

## 2. Event Log & Analytics Derivation

### 2.1 Emitted Event Schema
Every simulated action emits an immutable `SimulationEvent`:
- `timestamp`: Elapsed simulation time in milliseconds.
- `userId`: Identifier (e.g., `surfer-001`).
- `action`: `SEARCH | SCAN | CLICK_RESULT | DWELL | SCROLL | FOLLOW_LINK | RETURN_TO_SEARCH | END_SESSION`.
- `sourcePageId`: Optional origin page ID.
- `destinationPageId`: Optional destination page ID.
- `dwellTimeMs`: Elapsed reading time in milliseconds.
- `metadata`: Contextual details (e.g., position clicked, query, result list).

### 2.2 Telemetry Computation (Pure Functions)
No metrics are faked or synthetic. All metrics are computed strictly from the recorded `SimulationEvent[]`:

1. **Click Counts**: Direct tally of `CLICK_RESULT` + `FOLLOW_LINK` targeting each page.
2. **Impressions**: Count of times a page appeared on the SERP during a `SCAN` event.
3. **Click-Through Rate (CTR)**: $\text{clicks}(i) / \max(1, \text{impressions}(i))$.
4. **Average Dwell Time**: Total duration of `DWELL` events on page $i$ divided by total visits.
5. **Bounce Rate**: Ratio of sessions where a user entered page $i$ and immediately performed `RETURN_TO_SEARCH` without scrolling or following an outbound link.
6. **Pages per Session**: Total unique page visits divided by total distinct sessions.

---

## 3. Behavioral Feedback & The Experimental Model

### 3.1 Strict Separation of Concerns
> [!CRITICAL]
> **PageRank Integrity Rule**: Classical PageRank is purely topological. Under no circumstances does simulated user activity mutate PageRank scores. PageRank represents structural web architecture; user telemetry represents behavioral engagement.

### 3.2 The Experimental Ranking Formula
To demonstrate modern feedback-augmented search, MiniGoogle provides a 4th ranking mode:
$$\text{FinalScore} = 0.50 \cdot \text{KeywordScore} + 0.30 \cdot PR_{\text{norm}} + 0.20 \cdot \text{BehaviourScore}$$
where:
$$\text{BehaviourScore}(i) = \text{clamp}(0.5 \cdot \frac{CTR(i)}{\max CTR} + 0.5 \cdot (1 - e^{-\text{dwell}(i)/20}) - 0.3 \cdot \text{bounce}(i), 0, 1)$$

If a page has no recorded telemetry, its $\text{BehaviourScore} = 0$.

