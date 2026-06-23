# Scenario Planner — Logic, Reasoning & Formulas

**Created:** 2026-06-23 · **Companion to:** the design spec (`2026-06-23-scenario-planner-design.md`) and its audit.
**Audience:** anyone who needs to understand *how the numbers are produced and why* — Tom, compliance, a reviewer, the next developer. No code required to read it; precise enough to build from.

> **One-line summary:** we take the user's real holdings, replay what *actually happened* to each kind of asset during real historical crashes, add it up, and show the resulting path. Every number traces to a cited historical series. Nothing is forecast, simulated, or invented.

---

## 1. Why this design (the reasoning)

A scenario planner can be built three ways. We rejected two:

- **Forward Monte-Carlo** ("30% chance of −15% next year") — needs invented probabilities and a correlation matrix; it's a forecast, which a non-advice tool must not make. *This was the deleted engine.*
- **Abstract named scenarios** — credible but give no sense of how an episode unfolds or how bad it got.

We chose **empirical replay**: descriptive statistics of the real past. It is *more* credible than invented probabilities (real history is unarguable), it gives real cross-asset behaviour **for free** (because we replay episodes where all assets moved together as they actually did), and it stays firmly on the "intelligence, not advice" side of the line — we describe what happened, never predict what will.

**Two invariants follow, and nothing below may break them:**
1. **No invented numbers.** Every figure is a cited historical observation or a value-weighted sum of them.
2. **No extrapolation.** We never show a loss deeper than markets actually reached in the episodes on screen.

---

## 2. The inputs

| Symbol | Meaning | Source |
|---|---|---|
| `H` | The user's holdings, each with a £ value, an `asset_class`, and a `region` | the user |
| `w` | A **mix vector**: weight per bucket, summing to 1 | derived from `H` (below) |
| `E` | An **episode**: for each bucket, a cited return path over time | the episode library (§5 of the spec) |
| `r` | The **read-position** (0 = typical … 1 = worst markets reached) | the user's slider |
| `b` | **Blend weights**: how much of each chosen episode to combine | the user |

### 2.1 Mix vector — turning holdings into bucket weights
Value-weighting (the verified logic reused from the stress lens):

```
w[bucket] = (Σ £value of holdings in that bucket) / (Σ £value of all holdings)
```

So a £842k portfolio with £210k UK equity gives `w[uk-equity] = 210/842 = 0.249`. Cash and unmapped holdings get a bucket too; weights always sum to 1.

The **comparison ("what-if") mix** is the *same shape* of vector, derived from the step-7 allocation **bands** by taking each band's midpoint and normalising to sum to 1. (The bands are ranges, not a single vector — deriving the vector is new work, and presenting a midpoint as a "comparison mix" is a framing point compliance must clear.)

---

## 3. The core formula — one mix through one episode

For a single episode `E`, the **portfolio path** at each time-step `t` is the value-weighted sum of what each bucket did:

```
portfolioReturn(t) = Σ over buckets i of   w[i] × E.path[i][t]
portfolioValue(t)  = startValue × (1 + portfolioReturn(t))
```

In words: at each month (or year), every bucket has a known historical return; we weight each by how much of the user's money sits in it, and add them up. That curve **is** the replay.

From that path we read two headline numbers:

```
drawdown      = min over t of portfolioReturn(t)          // the deepest point, e.g. −0.34
recoveryTime  = (first t where portfolioValue(t) ≥ startValue, after the trough) − troughTime
```

`recoveryTime` is defined **once, globally** (nominal-to-prior-peak vs real-terms; with/without contributions) and shown in **real terms for inflation episodes** — because a "recovered in N months" that ignores 20% inflation (1973) is true-but-misleading.

### Buckets with no data
For deep episodes, some buckets (emerging, global, property pre-1970) have **no comparable series**. They are rendered as *"no comparable series"* and **excluded from the sum** — never zero-filled, which would silently pretend the asset was unaffected.

---

## 4. Blending several episodes

When the user combines episodes (e.g. 50% GFC + 30% COVID + 20% 2022):

```
centralPath(t) = Σ over episodes j of   b[j] × portfolioPath_j(t)        // weighted average path
band(t)        = [ min_j portfolioPath_j(t) ,  max_j portfolioPath_j(t) ] // the actually-observed envelope
```

The **band is not a confidence interval and not a multiplier** — it is literally the best and worst that the *selected real episodes* did at each point. That is why it can never imply a loss markets didn't reach.

---

## 5. The read-position (replaces "severity")

The slider does **not** scale anything. It chooses *where you read* inside the already-observed band:

```
readValue(t) = centralPath(t) + r × ( worstEdge(t) − centralPath(t) )      // r ∈ [0,1]
   where worstEdge(t) = band(t).min
```

- `r = 0` → "typical": the weighted-central path.
- `r = 1` → "worst markets reached": the worst edge the chosen episodes actually hit.
- **Default is `r = 0` (typical)**, not the worst edge — so a loss-averse user isn't dropped onto the single darkest outcome by default.

This is the formula that honours invariant #2: `readValue` is always a point *between two real observations*, never beyond `worstEdge`. The deleted `{0.7, 1.4}` multiplier is gone and must not return as the band.

**Degenerate case:** if only one episode is selected, `band` collapses to a line and the slider has nothing to traverse — the UI disables it or switches to a within-episode peak-to-trough read, never a silent no-op.

---

## 6. Contributors — "what drove this"

For the deepest point, rank buckets by their **signed £ contribution** to the move (reused, verified logic):

```
contribution[i] = w[i] × E.path[i][troughTime] × startValue
```

Sort most-negative first. A **protective** holding (one that *rose* while the portfolio fell) is correctly shown as a positive contributor and excluded from the "what hurt you" list — the bug found and fixed in Workstream B.

---

## 7. Salience — connecting the user's answers to the episodes

An episode surfaces first when it matches something the user told us (the coherence rule, §7A of the spec):

```
isSalient(episode) = any axis in episode.beliefSalience has userScore(axis) > 0.20
```

Plus a **horizon / circumstance** input that doesn't change the maths but changes the *emphasis*: a short-horizon or decumulating user gets the recovery-time counter-beat foregrounded (because a multi-year recovery may not be survivable for them). Every question maps to either an allocation tilt or a scenario salience/outcome; no orphan questions, no orphan episodes.

---

## 8. Worked example (trace the whole thing)

Portfolio: **£500k** — £300k global equity (0.60), £150k govt bonds (0.30), £50k cash (0.10). Episode: **2008 GFC** (illustrative monthly path; trough at month 14).

At the trough, the cited bucket returns are: global equity **−0.45**, govt bonds **+0.06**, cash **0.00**.

```
portfolioReturn(trough) = 0.60×(−0.45) + 0.30×(+0.06) + 0.10×(0.00)
                        = −0.270 + 0.018 + 0.000
                        = −0.252                      →  drawdown = −25.2%
portfolioValue(trough)  = 500,000 × (1 − 0.252) = £374,000

Contributions (× £500k):
  global equity:  0.60 × −0.45 × 500k = −£135,000   (the driver)
  govt bonds:     0.30 × +0.06 × 500k =  +£9,000     (protective — excluded from "what hurt")
  cash:           0.10 ×  0.00 × 500k =   £0
```

If the user then **blends** in COVID (which troughed at −0.20 for this mix), the band at the trough becomes `[−0.252, −0.20]`, central (50/50) ≈ −0.226, and dragging read-position to 1 shows −0.252 — **never worse than the −0.252 the GFC actually delivered.** That is the whole safety property, visible in one number.

---

## 9. What the logic deliberately does NOT do

- **No probabilities / no forecast.** There is no "chance of" anything. Every output is past-tense and cited.
- **No modelled correlation.** Cross-asset behaviour is whatever really happened in the episode — we never assemble a correlation matrix (the deleted engine's flaw).
- **No extrapolation beyond observed history** (§5).
- **No advice.** The comparison mix is shown as a neutral alternative with symmetric trade-offs (it draws down *more* in some episodes), never as a recommended/"better" option — and that surface is human-gated by compliance before it ships.

---

## 10. Traceability

Every on-screen number can be walked back: `figure → portfolio path → bucket path × weight → cited episode series (provider, series ID) in the episode library`. Golden-case unit tests pin each bucket's episode drawdown/recovery to its published index figure, so the data can never silently drift from its source.
