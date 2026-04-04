---
title: Resilience Scorecard
description: "Four research-backed metrics that characterize how a multi-agent system behaves under sustained faults: Fault Tolerance, NRR, Fleet Utilization, and Critical Time."
---

The **Resilience Scorecard** is computed live during the fault injection phase. It distills raw metrics into four research-backed indicators that together answer: *is this system resilient, degrading, or collapsing?*

```
RESILIENCE SCORECARD
  Fault Tolerance    0.82
  NRR                0.91
  Fleet Utilization  0.64
  Critical Time      0.15

  Composite Score    0.80  →  RESILIENT
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
- **Weight in composite:** 30%

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
- **Weight in composite:** 25%
- **Requires** at least 2 fault events to compute.

**Origin:** Or (2025), *"MTTR-A: Measuring Cognitive Recovery Latency in Multi-Agent Systems"*, which defines NRR as the uptime bound, proving that steady-state operational fraction satisfies $\pi_{up} \geq NRR$.

**Real-life example:** If a fleet takes 10 ticks to recover and faults occur every 100 ticks, NRR = 0.90, meaning the fleet is operational 90%+ of the time. If recovery takes 50 ticks with faults every 60 ticks, NRR = 0.17, meaning the fleet is almost always recovering and rarely productive.

> [!TIP] **Animation concept:** A timeline with alternating green (operational) and red (recovering) segments. The ratio of green to total fills a gauge labeled "NRR." High NRR = mostly green.

---

## 3. Fleet Utilization (FU)

*How much of the fleet remains productive after faults?*

$$FU = \frac{\text{alive and tasked agents (post-fault average)}}{\text{initial fleet size}}$$

| Variable | Meaning |
|---|---|
| alive and tasked agents | Agents that are alive AND currently executing a task (not idle/free) |
| initial fleet size | Total agents at simulation start |

- **Range:** 0 (all agents dead or idle) → 1 (full fleet operational and productive)
- **Weight in composite:** 25%

**Interpretation:** Fleet Utilization separates two failure modes: agents killed by faults (fleet shrinkage) versus agents stalled by cascade effects (idle queuing). A system that loses few agents but sees widespread task stalls still scores low. A system that loses agents but immediately reassigns work to surviving agents scores high.

**Real-life example:** A warehouse fleet starts with 100 robots. A fault cascade kills 10 and stalls 20 more. FU = (90 alive, 70 tasked) / 100 = 0.70. A fleet manager asks: "After a fault, how much of my fleet is still doing useful work?" FU = 0.70 means 30 robots are either dead or blocked, a meaningful operational signal even if throughput partially recovers.

> [!TIP] **Animation concept:** A fleet health bar showing alive agents (grey) and tasked agents (green) as a fraction of the original fleet. Faults chip away at the bar: dead agents turn red, stalled agents turn amber.

---

## 4. Critical Time (CT)

*How much time does the system spend in a critical state?*

$$CT = \frac{t_{\text{below}}}{t_{\text{fault}}}$$

| Variable | Meaning |
|---|---|
| $t_{\text{below}}$ | Ticks where throughput < 50% of baseline |
| $t_{\text{fault}}$ | Total ticks since first fault |

- **Range:** 0 (never critical) → 1 (always critical)
- **Weight in composite:** 20% (inverted: $1 - CT$)
- **Threshold:** 50% of baseline throughput

**Origin:** Adapted from Ghasemieh (2024), *"Transient Analysis of Fault-Tolerant Systems"*, which uses time-below-threshold as a measure of system criticality during transient degradation.

**Real-life example:** After a cascade failure, throughput drops to 30% of baseline for 45 out of 300 ticks. CT = 0.15. A reliability engineer asks: "How often is my system dangerously degraded?" CT = 0.15 means "only 15% of the time," which is acceptable. CT = 0.60 means "more often than not," and redesign is needed.

> [!TIP] **Animation concept:** A throughput curve over time with a dashed red line at 50% baseline. The segments below the line flash red. CT = the red fraction of the total timeline.

---

## Composite Score

The four metrics combine into a single resilience score:

$$\text{Score} = 0.30 \times FT + 0.25 \times NRR + 0.25 \times FU + 0.20 \times (1 - CT)$$

The verdict banner classifies the result:

| Score | Verdict | Meaning |
|---|---|---|
| $\geq 0.7$ | **RESILIENT** | System absorbs faults and recovers |
| $0.4 - 0.7$ | **DEGRADING** | System is losing ground over time |
| $< 0.4$ | **COLLAPSING** | System cannot sustain operation |

---

## Export

All four scorecard values plus the composite score are included in JSON/CSV exports for offline analysis and cross-run comparison.
