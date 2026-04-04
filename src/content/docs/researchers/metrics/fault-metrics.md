---
title: Fault Metrics
description: The metrics MAFIS computes during fault injection, where each comes from, why it matters, and what it reveals about multi-agent system resilience.
---

MAFIS computes fault metrics during the fault injection phase. Each metric is measured against the fault-free baseline, so results are comparative, not absolute. The primary research variables swept against these metrics are **scheduler strategy**, **fault intensity**, and **grid topology**.

---

## MTTR (Mean Time To Recovery)

**Unit:** Ticks | **Lower is better**

How many ticks it takes for affected agents to resume productive movement after a fault.

**Origin:** Adapted from classical dependability theory (IEEE Std 762). Or (2025) extends MTTR to multi-agent cognitive systems, decomposing recovery into detection latency ($T_{detect}$) and execution latency ($T_{execute}$).

**Why it matters:** MTTR tells you how long your fleet is disrupted after each incident. Two systems can have identical throughput on average but very different MTTR. One recovers in 5 ticks (a brief hiccup), the other in 50 ticks (a sustained outage).

**Real-life example:** A warehouse robot breaks down in aisle 4. MTTR answers: "How long until the surrounding robots find new routes and resume deliveries?" A fleet with MTTR = 8 means an 8-tick disruption per incident. Multiply by fault frequency and you know your expected downtime per shift.

> [!TIP] **Animation:** An agent turns red (dead). Nearby agents freeze, then one by one start moving again. A timer counts the ticks until the last affected agent resumes. That timer value = MTTR.

---

## MTBF (Mean Time Between Faults)

**Unit:** Ticks | **Higher is better**

Average number of ticks between consecutive fault events.

**Origin:** Classical reliability engineering (MIL-HDBK-217). In MAFIS, MTBF is computed from inter-event intervals rather than failure rates, because fault injection is scenario-driven, not component-lifetime-driven.

**Why it matters:** MTBF sets the pace of disruption. Combined with MTTR, it determines operational uptime: if MTTR is 10 ticks and MTBF is 100 ticks, the system is operational ~90% of the time. If MTBF drops to 20 ticks, the system never fully recovers between faults.

**Real-life example:** A fleet experiences a breakdown every 200 ticks on average. That's MTBF = 200. If you increase fault intensity to "High," MTBF might drop to 50, meaning faults arrive four times faster. The question is whether your system can still recover between events.

> [!TIP] **Animation:** A timeline with fault markers (red dots). The gaps between dots = inter-fault intervals. MTBF = the average gap length.

---

## Recovery Rate

**Unit:** Percentage (0–100%) | **Higher is better**

Of all agents that were affected by a fault and needed to replan, what percentage successfully found a new path?

**Origin:** Standard availability metric. In MAFIS, "recovery" means the agent either found a valid new plan or reached its goal despite the disruption.

**Why it matters:** Recovery Rate separates *slow recovery* from *no recovery*. High MTTR + 100% recovery = slow but self-healing. Low MTTR + 80% recovery = fast response but some agents get permanently stuck and need intervention.

**Real-life example:** 10 robots are blocked by a breakdown. 8 find alternate routes, 2 deadlock and need human intervention. Recovery rate = 80%. A fleet operator uses this to estimate how many support staff they need on the floor.

> [!TIP] **Animation:** Affected agents (orange) fan out. Most turn green (recovered). A few stay orange (stuck). The counter shows "8/10 recovered = 80%."

---

## Cascade Depth

**Unit:** Levels (integer) | **Lower is better**

When an agent dies, it blocks other agents who must replan. Their new paths block others, who block others still. Cascade depth counts how many levels deep this chain reaction goes.

**Origin:** Graph-theoretic BFS traversal on the Action Dependency Graph (ADG). Each "level" is one hop in the dependency chain. Capped at 10 levels.

**Why it matters:** Depth reveals structural fragility. A cascade that reaches depth 5 means a single failure destabilized agents five dependency hops away. High depth = the system has long, fragile dependency chains, usually caused by narrow corridors where agents queue behind each other.

**Real-life example:** A highway pileup. One car stops, the car behind brakes, the next one brakes. Depth = 1 means only direct neighbors affected. Depth = 5 means the disruption traveled five cars back. In a warehouse, that's five robots deep in a single aisle.

> [!TIP] **Animation:** An agent turns red (dead). Level 1 neighbors flash orange. Level 2 (neighbors of neighbors) flash lighter orange. Each level ripples outward. A counter ticks: Depth 1 → 2 → 3 → 4.

---

## Cascade Spread

**Unit:** Agents (integer) | **Lower is better**

The total number of agents affected by a single fault event, not chain length, but total width.

**Origin:** BFS on the ADG, counting all reachable nodes from the fault source. Distinct from depth: a depth-2 cascade can have spread of 3 (narrow corridor) or 30 (wide intersection).

**Why it matters:** Spread identifies topological vulnerabilities. If one cell's failure consistently affects 30% of the fleet, that cell is critical infrastructure, a single point of failure in the map layout.

**Real-life example:** One robot breaks down at a warehouse intersection. Cascade depth is only 2 (short chain), but spread is 23 (many agents queued in multiple directions). The intersection is a bottleneck. Redesigning the layout to add parallel paths would reduce spread.

> [!TIP] **Animation:** Same ripple as cascade depth, but instead of counting levels, count total agents affected. A wide intersection lights up many agents at each level. Counter shows: Spread 3 → 8 → 15 → 23.

---

## Propagation Rate

**Unit:** Ratio (0–1) | **Lower is better**

Fraction of the live fleet affected per fault event, averaged across all events. Normalizes cascade spread by fleet size.

**Origin:** Normalized version of cascade spread. A spread of 20 agents means something very different in a 50-agent fleet (40% affected) versus a 500-agent fleet (4% affected).

**Why it matters:** Propagation rate makes results comparable across different fleet sizes and configurations. It answers: "What fraction of my operational fleet gets disrupted by each incident?"

**Real-life example:** A 200-robot warehouse has propagation rate 0.08, meaning each fault disrupts 8% of the fleet. Scaling to 400 robots, if propagation rate stays at 0.08, each fault still disrupts 8% (now 32 robots). If propagation rate increases, the larger fleet has worse fault isolation.

> [!TIP] **Animation:** A fleet grid where affected agents light up. A fraction gauge fills to show what percentage of the total fleet was hit.

---

## Throughput

**Unit:** Goals per tick | **Higher is better**

Number of tasks completed at each tick. The instantaneous count of agents that reached their delivery destination at tick T.

**Origin:** Standard operations research KPI. In MAFIS, throughput is tracked both as instantaneous counts (for charts) and as a rolling window average (for metric comparisons).

**Why it matters:** Throughput under faults versus baseline throughput = the fault penalty. The headless baseline provides the reference automatically. The deviation after a fault is the core research output.

**Real-life example:** "Packages delivered per minute." Normally 2.4/tick. Under faults, drops to 1.8/tick. The fault penalty is 0.6/tick. That's the cost of each incident. Different scheduling strategies produce different penalties.

> [!TIP] **Animation:** A line chart drawing in real-time. A solid line (live) and a dashed line (baseline) diverge when a fault fires. The live line dips while the baseline continues steady. The gap between them = the fault penalty.

---

## Idle Ratio

**Unit:** Percentage (0–100%) | **Lower is better**

Fraction of ticks where agents wait instead of moving. Measures fleet utilization.

**Origin:** Standard utilization metric. Dead agents are **excluded** from the calculation — their fleet loss is captured by survival rate and fleet utilization. Counting dead agents as permanently idle would make this metric unresponsive to late-stage events (old deaths would dominate the cumulative sum).

**Why it matters:** Two configurations can have identical throughput but different idle ratios. One achieves it with fluid movement (10% idle), the other with stop-and-go waves (50% idle). Idle ratio reveals the congestion signature of each scheduler.

**Real-life example:** 500 robots, 40% idle ratio among the alive fleet = your operational robots spend 40% of their time waiting. Under faults, idle ratio spikes because surviving agents queue behind new blockages. A fleet operator asks: "Are my surviving robots working efficiently, or are they mostly stuck?"

> [!TIP] **Animation:** A grid of agents. Moving agents are green, waiting agents are grey. Dead agents are red (not counted in ratio). The ratio of grey to green+grey fills a bar labeled "Idle Ratio." After a fault, the grey ratio spikes then slowly recovers.

---

## Survival Rate

**Unit:** Percentage (0–100%), time-series | **Higher is better**

Fraction of agents still alive (not permanently broken down) at each tick.

**Origin:** Fleet attrition tracking. Plotted as a curve over time, not a single number.

**Why it matters:** Survival rate is the baseline context for all other metrics. The key question: does the system degrade linearly (lose 10% agents → lose 10% throughput) or collapse nonlinearly (lose 10% agents → lose 50% throughput due to cascades)? Nonlinear collapse is the dangerous regime MAFIS is designed to expose.

**Real-life example:** After 1000 ticks, 85% of robots are still operational. If you need 400 active robots at all times and survival at T=1000 is 80%, you need to deploy 500 to maintain capacity. Survival rate drives fleet sizing decisions.

> [!TIP] **Animation:** A survival curve drawing left to right. Starts at 100%, drops in steps as agents die. Alongside it, a throughput curve. If both drop at the same rate = linear degradation (manageable). If throughput drops faster than survival = nonlinear collapse (dangerous).

---

## How Metrics Feed the Scorecard

These raw metrics flow into the [Resilience Scorecard](/docs/researchers/observatory/resilience-scorecard):

| Raw Metric | Feeds Into |
|---|---|
| Throughput + Baseline | Fault Tolerance (FT) |
| MTTR + MTBF | NRR |
| Fleet attrition + task stalls | Fleet Utilization (FU) |
| Throughput below threshold | Critical Time (CT) |
