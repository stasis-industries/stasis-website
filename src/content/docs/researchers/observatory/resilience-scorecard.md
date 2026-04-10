---
title: Resilience Scorecard
description: "Four indicators that characterize how a multi-agent system behaves under sustained faults: Fault Tolerance, NRR, Survival Rate, and Critical Time."
---

The **Resilience Scorecard** is computed live during the fault injection phase. It distills raw metrics into research-backed indicators that together answer: *is this system resilient, degrading, or collapsing?*

```
RESILIENCE SCORECARD
  Fault Tolerance    0.82
  NRR                0.91
  Survival Rate      0.88
  Critical Time      0.15

  Composite Score    0.86  →  RESILIENT
```

---

## 1. Fault Tolerance (FT)

*How much throughput does the system retain under faults?*

$$FT = \frac{P_{\text{fault}}}{P_{\text{nominal}}}$$

| Variable | Meaning |
|---|---|
| $P_{\text{fault}}$ | Average throughput during fault injection |
| $P_{\text{nominal}}$ | Baseline throughput (fault-free) |

- **Range:** 0 (no throughput under faults) → 1+ (throughput matches or exceeds baseline)
- **Weight in composite:** 40%

**Origin:** Adapted from Milner (2023), *"Quantifying Fault Tolerance in Autonomous Multi-Robot Systems"*, which defines fault tolerance as the ratio of degraded performance to nominal performance.

**Real-life example:** A warehouse fleet delivers 100 packages/hour normally. Under faults, it delivers 82/hour. FT = 0.82. A fleet manager uses this to decide: "Can I absorb a 3-robot failure during peak hours without missing SLAs?"

> [!TIP] **Animation concept:** Two throughput bars side by side: a tall "baseline" bar and a shorter "under faults" bar. The ratio between them fills a gauge labeled "Fault Tolerance."

---

## 2. NRR (Normalized Recovery Ratio)

*How much time does the system spend recovering versus operating?*

$$NRR = 1 - \frac{MTTR}{MTBF}$$

| Variable | Meaning |
|---|---|
| $MTTR$ | Mean Time To Recovery (ticks to resume after a fault) |
| $MTBF$ | Mean Time Between Faults (ticks between fault events) |

- **Range:** 0 (always recovering) → 1 (recovers instantly relative to fault frequency)
- **Weight in composite:** 35% (redistributed to other metrics when N/A)
- **Requires** at least 2 fault events to compute MTBF, and at least one cascade-affected agent for MTTR.
- **N/A when:** all fault events occur at the same tick (burst, zone outage) — MTBF is undefined with no inter-arrival intervals. Also N/A for permanent deaths with no cascade neighbors. When N/A, the composite score redistributes NRR's weight: FT 65%, CT 35%.

**Origin:** Or (2025), *"MTTR-A: Measuring Cognitive Recovery Latency in Multi-Agent Systems"*, which defines NRR as the uptime bound, proving that steady-state operational fraction satisfies $\pi_{up} \geq NRR$.

**Real-life example:** If a fleet takes 10 ticks to recover and faults occur every 100 ticks, NRR = 0.90, meaning the fleet is operational 90%+ of the time. If recovery takes 50 ticks with faults every 60 ticks, NRR = 0.17, meaning the fleet is almost always recovering and rarely productive.

> [!TIP] **Animation concept:** A timeline with alternating green (operational) and red (recovering) segments. The ratio of green to total fills a gauge labeled "NRR." High NRR = mostly green.

---

## 3. Survival Rate (SR)

*What fraction of the initial fleet is still alive?*

$$SR = \frac{\text{alive agents (post-fault)}}{\text{initial fleet size}}$$

| Variable | Meaning |
|---|---|
| alive agents | Agents not permanently killed by a fault |
| initial fleet size | Total agents at simulation start |

- **Range:** 0 (all agents dead) → 1 (no deaths)
- **Displayed in scorecard UI but not included in the composite score** — SR is a supporting indicator, not a composite input.

**Interpretation:** Survival Rate is a direct headcount. It separates fleet attrition (agents lost to faults) from throughput degradation (performance lost without deaths). A system can have high SR (few deaths) but low Fault Tolerance (widespread cascade stalls), or low SR (many deaths) but high FT if surviving agents absorb the work efficiently.

**Real-life example:** A warehouse fleet starts with 100 robots. After a wear-based fault wave, 88 remain alive. SR = 0.88. A fleet manager uses this alongside FT to distinguish: "Did my throughput drop because robots died, or because the survivors got stuck?"

> [!TIP] **Animation concept:** A fleet health bar showing alive agents (green) versus dead agents (red) as a fraction of the original fleet. Faults chip away at the bar as agents die. SR = the green fraction.

---

## 4. Critical Time (CT)

*How much time does the system spend in a critical state?*

$$CT = \frac{t_{\text{below}}}{t_{\text{fault}}}$$

| Variable | Meaning |
|---|---|
| $t_{\text{below}}$ | Ticks where throughput < 50% of baseline |
| $t_{\text{fault}}$ | Total ticks since first fault |

- **Range:** 0 (never critical) → 1 (always critical)
- **Weight in composite:** 25% (inverted: $1 - CT$)
- **Threshold:** 50% of baseline throughput

**Origin:** Adapted from Ghasemieh (2024), *"Transient Analysis of Fault-Tolerant Systems"*, which uses time-below-threshold as a measure of system criticality during transient degradation.

**Real-life example:** After a cascade failure, throughput drops to 30% of baseline for 45 out of 300 ticks. CT = 0.15. A reliability engineer asks: "How often is my system dangerously degraded?" CT = 0.15 means "only 15% of the time," which is acceptable. CT = 0.60 means "more often than not," and redesign is needed.

> [!TIP] **Animation concept:** A throughput curve over time with a dashed red line at 50% baseline. The segments below the line flash red. CT = the red fraction of the total timeline.

---

## Composite Score

Three metrics combine into a single resilience score. Survival Rate is shown in the UI but not included in the composite.

**When NRR is available** (recurring faults, 2+ events with distinct ticks):

$$\text{Score} = 0.40 \times FT + 0.35 \times NRR + 0.25 \times (1 - CT)$$

**When NRR is N/A** (burst/zone outage, or no cascade neighbors):

$$\text{Score} = 0.65 \times FT + 0.35 \times (1 - CT)$$

The verdict banner classifies the result:

| Score | Verdict | Meaning |
|---|---|---|
| $\geq 0.75$ | **RESILIENT** | System absorbs faults and recovers |
| $0.55 - 0.75$ | **MODERATE** | System is partially degraded |
| $0.35 - 0.55$ | **DEGRADED** | System is losing ground over time |
| $< 0.35$ | **FRAGILE** | System cannot sustain operation |

---

## Export

All scorecard values plus the composite score are included in JSON/CSV exports for offline analysis and cross-run comparison.
