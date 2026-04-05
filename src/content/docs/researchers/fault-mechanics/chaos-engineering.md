---
title: Fault Types
description: The three fault types in MAFIS (Overheat, Breakdown, Latency), the four fault scenarios, and how FaultSource distinguishes automatic from manual injection.
---

MAFIS has three **fault types** that describe what happens to an agent, and four **fault scenarios** that describe how and when faults are triggered. All fault events go through the same cascade pipeline (ADG → BFS → replan), which makes their resilience metrics scientifically comparable regardless of how they were triggered.

## Fault Types (What Happens)

| Type | Agent State | Grid Effect | Duration |
|---|---|---|---|
| **Overheat** | Dead | Cell becomes obstacle | Permanent |
| **Breakdown** | Dead | Cell becomes obstacle | Permanent |
| **Latency** | Alive, degraded | None | Temporary (N ticks) |

### Overheat

Triggered when an agent's accumulated operational wear reaches its pre-sampled Weibull failure time (see [Wear & Heat System](/docs/researchers/fault-mechanics/heat-faults)). The agent dies, its cell becomes a permanent obstacle, and all agents whose paths cross that cell must replan. Overheat faults are **automatic**, arising from the Weibull wear model during continuous operation.

### Breakdown

A permanent death fault with the same consequences as Overheat — the agent dies and becomes a permanent obstacle. The distinction is in the trigger: Breakdown is used for scheduled burst events (e.g., "kill 20% of agents at tick 100"), while Overheat arises from the continuous Weibull wear model. Both produce identical cascade consequences.

> [!WARNING] Overheat and Breakdown are **permanent**. The agent dies and its cell becomes an obstacle for the remainder of the simulation. Plan your fault intensity accordingly.

### Latency

An agent-level degradation fault. The affected agent executes `Action::Wait` for N consecutive ticks regardless of what the solver would assign. After N ticks, the agent resumes normal operation. The agent is **alive and occupying a cell** during latency. It is not an obstacle, but it is unresponsive to the planner.

Real-world analogy: a robot's sensor system lags, a communication packet is dropped, or a software hang causes the robot to freeze briefly before recovering.

> [!NOTE] Latency faults are the mildest fault type. The agent is alive, occupies its cell, and recovers automatically. Use them to study congestion propagation without permanent fleet attrition.

## Fault Scenarios (When and How)

Scenarios define the injection pattern. Each scenario uses one or more fault types:

| Scenario | Mechanism | Fault Type Used | Duration |
|---|---|---|---|
| **BurstFailure** | Kill X% agents at tick T | Breakdown | Permanent |
| **WearBased** | Weibull model: agents die when `operational_age >= sampled failure tick` | Overheat | Permanent |
| **ZoneOutage** | Latency on all agents in a randomly-selected spatial strip for N ticks | Latency | Temporary |
| **IntermittentFault** | Per-agent recurring latency (exponential inter-arrival) | Latency | Temporary |

### BurstFailure

Kills a configurable percentage of agents at a specific tick. Agents are selected and killed simultaneously, creating a sudden mass-failure event. Useful for studying acute fleet attrition and system response to sudden capacity loss.

### WearBased

The continuous Weibull wear model. Each agent has a pre-sampled failure time. As agents move, their operational age increases. When `operational_age >= failure_tick`, the agent dies. This produces gradual, distributed fleet attrition over time.

### ZoneOutage

Injects latency on all agents currently within a randomly-selected vertical strip of the map for N ticks. The strip is chosen using the simulation's seeded RNG at fault-fire time — deterministic per seed and independent of solver routing behavior. Agents freeze temporarily but recover. Models a localized network dead zone or power failure in a specific warehouse aisle section.

Parameters:
- `zone_at_tick`: when the outage fires
- `zone_latency_duration`: how many ticks agents in the strip are frozen

### IntermittentFault

Per-agent recurring latency with exponential inter-arrival times. Each agent independently experiences temporary unavailability. Controlled by `intermittent_mtbf_ticks` (average time between faults) and `intermittent_recovery_ticks` (how long each episode lasts).

## FaultSource

All faults carry a `FaultSource` tag:

```rust
pub enum FaultSource {
    Automatic,  // System-generated via Weibull wear / intermittent model
    Manual,     // Researcher-injected via UI
    Scheduled,  // From a FaultSchedule scenario (burst, zone outage)
}
```

Manual faults are injected while the simulation is paused (click a robot → "Kill" / "Block for N ticks" / "Slow for N ticks"). They are tagged `FaultSource::Manual` so they can be distinguished in analysis and export, but their metrics are computed through the same cascade pipeline as automatic faults.

> [!IMPORTANT] This ensures that manual injection experiments produce scientifically valid comparisons to automatic fault runs. Manual and automatic faults go through the identical cascade pipeline.

## Fault Intensity Configuration

Fault generation is controlled by `FaultConfig`:

| Parameter | Effect |
|---|---|
| `weibull_enabled` | Enable Weibull wear model (continuous agent death) |
| `weibull_beta` | Shape parameter — higher = more clustered failures |
| `weibull_eta` | Scale parameter — higher = longer average lifespan |
| `intermittent_enabled` | Enable intermittent latency faults |
| `intermittent_mtbf_ticks` | Average ticks between latency episodes per agent |
| `intermittent_recovery_ticks` | Duration of each latency episode |

The UI exposes fault intensity presets (Off / Low / Medium / High) that set these parameters together.

## All Faults Through One Pipeline

Regardless of type or source, every fault goes through the same pipeline:

1. **Fault detection**: wear check or scheduled event triggers fault
2. **ADG construction**: Agent Dependency Graph identifies which agents' paths are blocked by the new state
3. **BFS propagation**: cascade depth and spread computed
4. **Replan** phase: affected agents get new plans from the active solver
5. **Metrics**: MTTR, cascade depth/spread, throughput delta computed in `AnalysisSet::Metrics`

See [Cascade Propagation](/docs/researchers/fault-mechanics/breakdown-faults) for the ADG pipeline in detail.
