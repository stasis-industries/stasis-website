---
title: Resilience Scorecard
description: The four metrics that characterize a system's fault resilience profile — Robustness, Recoverability, Adaptability, and Degradation Slope.
---

The **Resilience Scorecard** is a set of four metrics computed during the fault injection phase. Together they give a complete characterization of how a (solver, scheduler, topology, fault intensity) configuration responds to sustained faults. The scorecard is displayed in the right sidebar and exported with every run.

```
RESILIENCE SCORECARD
  Robustness       0.87
  Recoverability   12 ticks
  Adaptability     0.64
  Degradation      -0.003/tick  (Stable)
```

---

## 1. Robustness

*How much does throughput drop per fault?*

```
robustness = 1 - (avg_throughput_loss_per_fault / baseline_throughput)
```

- After each fault, throughput is sampled over the next W ticks (default W=20). The dip below baseline is the loss for that event.
- Averaged across all fault events in the run.
- **Range:** 0.0 (throughput collapses on every fault) to 1.0 (throughput unaffected).
- **Data sources:** `FaultMetrics.throughput` + `ResilienceBaseline.baseline_throughput`

**Example:** Baseline throughput is 2.4 goals/tick. Each fault causes an average dip of 0.31 goals/tick. Robustness = 1 - (0.31 / 2.4) = 0.87.

---

## 2. Recoverability

*How fast does throughput return after a disruption?*

```
recoverability = avg ticks to recover from <80% to >90% of baseline throughput
```

- Per fault event: a disruption starts when throughput drops below 80% of baseline and ends when it returns above 90%.
- Averaged across all disruption events.
- **Unit:** ticks (lower = better).
- **Edge cases:** If throughput never drops below 80%, the event is recorded as "absorbed" (0 ticks). If throughput never returns above 90%, the event is "not recovered."
- **Data sources:** `FaultMetrics.throughput` time-series + `ResilienceBaseline`

**Example:** Over three faults, recovery took 8, 12, and 16 ticks respectively. Recoverability = 12 ticks.

---

## 3. Adaptability

*Does the system redistribute traffic after a fault?*

```
adaptability = normalized_heatmap_entropy_change after fault events
```

- Shannon entropy of the heatmap density is computed at `fault_tick` and again at `fault_tick + recovery_window`.
- If a blocked corridor causes traffic to redistibute → entropy increases → system adapted.
- If agents jam at the blockage → entropy stays concentrated → system did not adapt.
- **Range:** 0.0 (no redistribution) to 1.0 (full redistribution across the grid).
- **Normalized** by the maximum possible entropy for the grid size.
- **Data source:** `HeatmapState.density` — requires heatmap to be active during the fault phase.

**Note:** Adaptability is distinct from recoverability. A system can recover throughput quickly without redistributing routes (agents find a way around the specific blockage), or it can redistribute broadly while still showing throughput loss.

---

## 4. Degradation Slope

*Does the system degrade gracefully or collapse?*

```
slope = linear_regression(throughput over time during fault phase)
```

- Least-squares regression on the throughput time-series since fault injection began.
- Recomputed every 50 ticks (not every tick).
- **Labels:**

| Slope | Label |
|---|---|
| > −0.001/tick | **Stable** |
| −0.005 to −0.001/tick | **Degrading** |
| < −0.005/tick | **Collapsing** |
| > +0.001/tick | **Improving** |

**Interpretation:** Near-zero slope means the system reached a new equilibrium under faults and maintains it. A steep negative slope means each additional fault degrades capacity further — a sign of structural fragility that will eventually produce collapse.

---

## Export

All four scorecard values are included in the JSON/CSV export alongside the raw fault metrics. This allows offline analysis and cross-run comparison.

## Implementation

The scorecard is computed by the `update_resilience_scorecard` system in `AnalysisSet::Metrics`, running after `update_fault_metrics`. It reads from `FaultMetrics`, `ResilienceBaseline`, and `HeatmapState` — no new data collection systems are needed.

See [Simulation Phases](/docs/researchers/observatory/simulation-phases) for how the baseline is established, and [Fault Metrics](/docs/researchers/metrics/fault-metrics) for the raw metrics the scorecard builds on.
