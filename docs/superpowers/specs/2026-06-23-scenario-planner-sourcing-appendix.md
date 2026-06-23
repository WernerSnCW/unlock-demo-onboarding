# Scenario Planner — Sourcing & Provenance Appendix

**Status:** cited-but-unverified illustrative values (demo). Awaiting §13 gate sign-off.
**Date:** 2026-06-23
**Branch:** `feat/v2-scenario-stress-engine`
**Scope:** Human-readable provenance record for the Scenario Planner episode library. Tasks 3–4 (episode-library code + golden tests) are derived from this document. This appendix is documentation, not code.

Per design §5/§13, figures must trace to **free deep-history sources**:

- **Shiller** (Robert Shiller, online dataset) — US S&P composite, nominal + real (CPI-adjusted), monthly back to 1871; long-government-bond yields.
- **JST Macrohistory Database** (Jordà–Schularick–Taylor) — cross-country annual total returns (equity, bonds, bills, housing) for 18 advanced economies, 1870– annual.
- **FRED** (Federal Reserve Bank of St. Louis) — index levels and supporting series (e.g. S&P 500, indices used to cross-check).

For a **demo**, illustrative cited data from these free sources is sufficient. Full redistribution-licensing diligence (e.g. for FTSE All-Share, MSCI World, REIT indices used as cross-checks) is a **production** concern, not a demo blocker.

---

## Roster (locked, §5)

The locked episode roster is:

`1929–32` · `1973–74` · `1987` · `2000–02` · `2008–09` · `2020` · `2022`

**Optional 8th: `1920–21`** (US-only equity + bond). Default **IN** per memory, but this is **the one item awaiting the §13 sourcing decision** (Tom's call). It is included below and flagged accordingly.

---

## Global return basis (stated once — §5 / P2-2)

All returns in this appendix are expressed on a single, consistent basis:

> **Total return, GBP, gross.**

- **Total return** — capital + reinvested income (dividends for equity, coupons for bonds). Price-only series are not used as the headline basis.
- **GBP** — for the UK audience. Local-currency series (notably **Shiller USD** for US equity and US bonds) **must be GBP-converted**. The GBP/USD adjustment is noted per episode where it materially changes the UK-investor experience. Notably **GBP fell ~25% against USD in 2008**, which *reduces* a UK investor's loss on USD-denominated assets (the local-currency S&P drop overstates the GBP loss).
- **Gross** — before fees, charges and tax.

Any bucket left in **local currency** (i.e. not yet GBP-converted at the data-entry stage) **must be flagged** in its row's notes. At the time of writing, all US-sourced (Shiller USD) buckets require GBP conversion and are flagged accordingly.

---

## Recovery definition (stated once — §5 / P2-3)

> **Recovery = the point at which nominal cumulative return returns to ≥ 0 (i.e. back to the prior peak), holding the same asset mix, with no further contributions.**

Additionally:

> For any episode flagged **`inflationEpisode`**, **real-terms recovery is shown** (or the inflation gap is footnoted). A nominal "recovered in N months" figure for an inflation episode (1973, 2022, 1920) is **true-but-misleading**, because the nominal level can recover while real purchasing power has not.

Inflation episodes in this roster: **1973–74**, **2022**, **1920–21**.

Buckets: `uk-equity` · `us-equity` · `europe-equity` · `global-equity` · `emerging-equity` · `govt-bonds` · `property` · `cash`. Every episode table below lists all eight; buckets with no free deep-history series for that era are marked **"no comparable series" = YES**.

---

## 1929–32 (keystone)

Granularity: **annual** · Inflation episode: **no** · The complacency anchor (§5, P1-6).

| bucket | provider | seriesId | basis (total-return) | currency | granularity | trough (cum. return) | recovery (steps; real for inflation eps) | "no comparable series"? |
|---|---|---|---|---|---|---|---|---|
| uk-equity | — | — | — | — | annual | — | — | **YES** |
| us-equity | Shiller | S&P composite, real TR | total return (real) | USD → **convert to GBP** | annual | **~ −0.79 real** | **~25yr** real recovery (Shiller real S&P) | no |
| europe-equity | — | — | — | — | annual | — | — | **YES** |
| global-equity | — | — | — | — | annual | — | — | **YES** |
| emerging-equity | — | — | — | — | annual | — | — | **YES** |
| govt-bonds | Shiller / JST | US long govt bond TR | total return | USD → **convert to GBP** | annual | **~ +0.10** | n/a (positive through) | no |
| property | — | — | — | — | annual | — | — | **YES** |
| cash | Shiller / JST | US T-bill / bills | total return | USD → **convert to GBP** | annual | **~ 0** | n/a | no |

Notes: europe / global / emerging / property = **no comparable series** for this era. US-equity / bonds / cash sourced from Shiller (and JST cross-check). All USD — **GBP conversion required**.

---

## 1973–74

Granularity: **annual** (UK monthly from 1962 exists) · Inflation episode: **YES** · Real-terms recovery shown.

| bucket | provider | seriesId | basis (total-return) | currency | granularity | trough (cum. return) | recovery (steps; real for inflation eps) | "no comparable series"? |
|---|---|---|---|---|---|---|---|---|
| uk-equity | FTSE / JST | FTSE All-Share TR (Dec72–Dec74) | total return | GBP | annual (monthly avail. from 1962) | **~ −0.73 nominal** (real worse) | **real-terms** recovery shown; nominal recovery understates the loss | no |
| us-equity | Shiller | S&P composite TR | total return | USD → **convert to GBP** | annual | **~ −0.48** (S&P) | real-terms recovery shown | no |
| europe-equity | JST | cross-country equity TR | total return | local → **convert to GBP** | annual | (use JST if entered; else mark no series) | real-terms | no |
| global-equity | — | — | — | — | annual | — | — | **YES** |
| emerging-equity | — | — | — | — | annual | — | — | **YES** |
| govt-bonds | JST / Shiller | UK gilts TR | total return | GBP | annual | **negative real** | real-terms recovery shown (high inflation erodes nominal) | no |
| property | — | — | — | — | annual | — | — | **YES** |
| cash | JST / BoE | UK bills | total return | GBP | annual | **+ nominal, − real** | real-terms: cash lost purchasing power | no |

Notes: emerging / global / property = **no comparable series**. Inflation episode — **real-terms recovery shown** for all buckets; a nominal "recovered in N years" is true-but-misleading here. US buckets USD — **GBP conversion required**.

---

## 1987

Granularity: **monthly** · Inflation episode: **no**.

| bucket | provider | seriesId | basis (total-return) | currency | granularity | trough (cum. return) | recovery (steps; real for inflation eps) | "no comparable series"? |
|---|---|---|---|---|---|---|---|---|
| uk-equity | FTSE | FTSE All-Share TR | total return | GBP | monthly | **~ −0.35** | recovery in months | no |
| us-equity | Shiller / FRED | S&P 500 TR (Aug–Dec 87) | total return | USD → **convert to GBP** | monthly | **~ −0.33** (S&P Aug–Dec 87) | **~20 months** | no |
| europe-equity | JST / index | Europe equity TR | total return | local → **convert to GBP** | monthly | (enter if available) | recovery in months | no |
| global-equity | MSCI | MSCI World TR | total return | local → **convert to GBP** | monthly | (enter if available) | recovery in months | no |
| emerging-equity | — | — | — | — | monthly | — | — | **YES** |
| govt-bonds | Shiller / FRED | US/UK long govt TR | total return | USD → **convert to GBP** | monthly | **small +** | n/a (positive through) | no |
| property | — | — | — | — | monthly | — | — | no |
| cash | FRED / BoE | bills | total return | mixed → **GBP** | monthly | **~0 to small +** | n/a | no |

Notes: EM = **no comparable series**. US buckets USD — **GBP conversion required**.

---

## 2000–02

Granularity: **monthly** · Inflation episode: **no** · Episode-specific dotcom-vs-tech caveat (§5).

| bucket | provider | seriesId | basis (total-return) | currency | granularity | trough (cum. return) | recovery (steps; real for inflation eps) | "no comparable series"? |
|---|---|---|---|---|---|---|---|---|
| uk-equity | FTSE | FTSE All-Share TR | total return | GBP | monthly | (enter; broad UK fell less than US tech) | ~ to mid-2000s | no |
| us-equity | Shiller / FRED | S&P 500 TR | total return | USD → **convert to GBP** | monthly | **~ −0.49** (S&P) | **~ to 2007** | no |
| europe-equity | MSCI / JST | Europe equity TR | total return | local → **convert to GBP** | monthly | (enter if available) | ~ to mid-2000s | no |
| global-equity | MSCI | MSCI World TR | total return | local → **convert to GBP** | monthly | (enter if available) | ~ to 2007 | no |
| emerging-equity | — | — | — | — | monthly | — | — | **YES** |
| govt-bonds | Shiller / FRED | US/UK long govt TR | total return | USD → **convert to GBP** | monthly | **+** | n/a (positive) | no |
| property | index / JST | listed property / housing | total return | local → **convert to GBP** | monthly | **~ resilient** | n/a (held up) | no |
| cash | FRED / BoE | bills | total return | mixed → **GBP** | monthly | **+** | n/a | no |

**Tech caveat (§5):** broad `us-equity` (S&P) understates the concentrated tech drawdown — **Nasdaq ~ −0.78** over the same window. The episode narrative must surface that a tech-heavy investor experienced far worse than the broad index, but the `us-equity` bucket itself uses the broad S&P figure.

Notes: EM = **no comparable series**. US buckets USD — **GBP conversion required**.

---

## 2008–09

Granularity: **monthly** · Inflation episode: **no**.

| bucket | provider | seriesId | basis (total-return) | currency | granularity | trough (cum. return) | recovery (steps; real for inflation eps) | "no comparable series"? |
|---|---|---|---|---|---|---|---|---|
| uk-equity | FTSE | FTSE All-Share TR | total return | GBP | monthly | **~ −0.41** | recovery (post-2009 rally) | no |
| us-equity | Shiller / FRED | S&P 500 TR | total return | USD → **convert to GBP** | monthly | **~ −0.55** (S&P TR) | **~53 months** | no |
| europe-equity | MSCI | MSCI Europe TR | total return | local → **convert to GBP** | monthly | (enter if available; broadly ~ World) | recovery | no |
| global-equity | MSCI | MSCI World TR | total return | local → **convert to GBP** | monthly | **~ −0.54** (MSCI World) | recovery | no |
| emerging-equity | MSCI | MSCI EM TR | total return | local → **convert to GBP** | monthly | (enter if available) | recovery | no |
| govt-bonds | Shiller / FRED | US/UK long govt TR | total return | USD/GBP → **GBP** | monthly | **~ +0.06** | n/a (positive — flight to quality) | no |
| property | listed REIT | listed property / REIT TR | total return | local → **convert to GBP** | monthly | **~ −0.50** | recovery | no |
| cash | FRED / BoE | bills | total return | mixed → **GBP** | monthly | **~0** | n/a | no |

**REIT caveat (§5):** listed property fell **~as hard as equity** (~ −0.50), *not* the −34% from the old prose. **Audit P2-1: do NOT use the −34% figure.** Listed `property` here is REIT-based, so it behaves like equity, not like the smoothed direct-property index.

**Currency note (P2-2):** GBP fell **~25%** vs USD in 2008. A UK investor in USD assets saw a *smaller* GBP loss than the local-USD S&P figure implies — the GBP conversion materially softens the US-equity and global drawdown for the UK audience.

Notes: all four equity regions + REIT property + bonds + cash have series this era; none marked "no comparable series".

---

## 2020

Granularity: **monthly** · Inflation episode: **no** · Fastest recovery — pairs with 1929 for the symmetric beat.

| bucket | provider | seriesId | basis (total-return) | currency | granularity | trough (cum. return) | recovery (steps; real for inflation eps) | "no comparable series"? |
|---|---|---|---|---|---|---|---|---|
| uk-equity | FTSE | FTSE All-Share TR | total return | GBP | monthly | (enter; ~ World region) | months | no |
| us-equity | Shiller / FRED | S&P 500 TR | total return | USD → **convert to GBP** | monthly | (enter; ~ World) | ~5 months | no |
| europe-equity | MSCI | MSCI Europe TR | total return | local → **convert to GBP** | monthly | (enter if available) | ~5 months | no |
| global-equity | MSCI | MSCI World TR (Feb–Mar 2020) | total return | local → **convert to GBP** | monthly | **~ −0.34** (MSCI World Feb–Mar) | **~5 months** | no |
| emerging-equity | MSCI | MSCI EM TR | total return | local → **convert to GBP** | monthly | (enter if available) | ~months | no |
| govt-bonds | Shiller / FRED | US/UK long govt TR | total return | USD/GBP → **GBP** | monthly | **~ +0.03** | n/a (positive — flight to quality) | no |
| property | listed REIT | listed property / REIT TR | total return | local → **convert to GBP** | monthly | (enter if available; fell with equity) | months | no |
| cash | FRED / BoE | bills | total return | mixed → **GBP** | monthly | **~0** | n/a | no |

Notes: fastest recovery of the roster. US buckets USD — **GBP conversion required**.

---

## 2022

Granularity: **monthly** · Inflation episode: **YES** · Real-terms shown · "Bonds and equities fell together."

| bucket | provider | seriesId | basis (total-return) | currency | granularity | trough (cum. return) | recovery (steps; real for inflation eps) | "no comparable series"? |
|---|---|---|---|---|---|---|---|---|
| uk-equity | FTSE | FTSE All-Share TR | total return | GBP | monthly | **~ −0.02** | **real-terms** shown (high inflation erodes nominal) | no |
| us-equity | Shiller / FRED | S&P 500 TR | total return | USD → **convert to GBP** | monthly | (enter; ~ World region) | real-terms shown | no |
| europe-equity | MSCI | MSCI Europe TR | total return | local → **convert to GBP** | monthly | (enter if available) | real-terms shown | no |
| global-equity | MSCI | MSCI World TR | total return | local → **convert to GBP** | monthly | **~ −0.18** | real-terms shown | no |
| emerging-equity | MSCI | MSCI EM TR | total return | local → **convert to GBP** | monthly | (enter if available) | real-terms shown | no |
| govt-bonds | Bloomberg Global Agg / FTSE Gilts | global agg / UK gilts TR | total return | local/GBP → **GBP** | monthly | **~ −0.16 (global agg); ~ −0.20 (UK gilts)** | real-terms shown — bonds did **not** cushion | no |
| property | listed REIT | listed property / REIT TR | total return | local → **convert to GBP** | monthly | (enter if available; fell with rates) | real-terms shown | no |
| cash | FRED / BoE | bills | total return | mixed → **GBP** | monthly | **+ nominal, − real** | real-terms: cash lost purchasing power | no |

Notes: **bonds-and-equities-fell-together** is the defining feature — `govt-bonds` was a loss, not a cushion. Inflation episode — **real-terms recovery shown** for all buckets. US buckets USD — **GBP conversion required**.

---

## 1920–21 (OPTIONAL — awaiting §13 decision)

Granularity: **annual** · Inflation episode: **YES** (deflationary depression) · **US-only** · Default IN per memory, **awaiting §13 in/out decision**.

| bucket | provider | seriesId | basis (total-return) | currency | granularity | trough (cum. return) | recovery (steps; real for inflation eps) | "no comparable series"? |
|---|---|---|---|---|---|---|---|---|
| uk-equity | — | — | — | — | annual | — | — | **YES** |
| us-equity | Shiller | S&P composite, real TR | total return (real) | USD → **convert to GBP** | annual | **~ −0.47 (real)** | real-terms recovery shown | no |
| europe-equity | — | — | — | — | annual | — | — | **YES** |
| global-equity | — | — | — | — | annual | — | — | **YES** |
| emerging-equity | — | — | — | — | annual | — | — | **YES** |
| govt-bonds | Shiller / JST | US long govt bond TR | total return | USD → **convert to GBP** | annual | **+** | n/a (positive — deflation aided bonds) | no |
| property | — | — | — | — | annual | — | — | **YES** |
| cash | Shiller / JST | US bills | total return | USD → **convert to GBP** | annual | **+ nominal** (deflation → + real) | n/a | no |

Notes: **US-only** — uk / europe / global / emerging / property = **no comparable series**. Inflation episode (deflation) — **real-terms recovery shown**. US buckets USD — **GBP conversion required**. **This entire episode is awaiting the §13 in/out decision.**

---

## §13 GATE

Figures above are **cited-but-unverified illustrative values**. Counsel/Tom sign-off on **(a)** the citations and **(b)** the **1920–21 in/out decision** is **required before production**.

The engine pins whatever is entered via **golden tests** (Task 3), so figures **cannot silently drift**: any change to a trough or recovery value will break a golden test and force a deliberate, reviewed update.

**Open items for the gate:**
1. Verify each cited trough/recovery against its free source (Shiller / JST / FRED) — replace placeholder "(enter if available)" cells with verified values or confirm "no comparable series".
2. Confirm GBP conversion has been applied to every USD/local-currency bucket flagged above (P2-2).
3. Confirm real-terms recovery (or footnoted inflation gap) is rendered for every `inflationEpisode` (1973, 2022, 1920) (P2-3).
4. Confirm the 2008 `property` bucket uses the **REIT ~ −0.50** figure, **not** the retired −34% prose figure (P2-1).
5. Decide **1920–21 IN or OUT** (default IN per memory).
6. Production only: redistribution-licensing diligence for any non-free cross-check series (FTSE All-Share, MSCI World, Bloomberg Global Agg, REIT indices).
