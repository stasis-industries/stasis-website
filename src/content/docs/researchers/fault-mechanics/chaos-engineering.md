---
title: Fault Types
description: The five fault types in MAFIS organized in a 3-category taxonomy (Recoverable, Permanent-distributed, Permanent-localized) and how FaultSource distinguishes automatic from manual injection.
---

MAFIS supports five fault types organized in a **3-category taxonomy** based on duration and scope. All types go through the same cascade pipeline (ADG → BFS → replan), which makes their resilience metrics scientifically comparable regardless of how they were triggered.

## 3-Category Taxonomy

| Category | Types | Duration | Scope |
|---|---|---|---|
| **Recoverable** | TemporaryBlockage, Latency | Temporary (N ticks) | Cell or agent |
| **Permanent-distributed** | Overheat, Breakdown | Permanent | Individual agents, randomly distributed |
| **Permanent-localized** | PermanentZoneOutage | Permanent | Entire zone (contiguous area) |

This taxonomy is the basis for the paper's experimental design. Each category produces a distinct resilience signature:
- **Recoverable** faults test how quickly the system adapts and recovers.
- **Permanent-distributed** faults model fleet attrition. Individual agents die and become permanent obstacles, randomly distributed across the grid.
- **Permanent-localized** faults eliminate entire zones from the operational map, testing global replanning capacity.

## Full Fault Type Reference

| Type | Category | Agent State | Grid Effect | Duration | Recovery |
|---|---|---|---|---|---|
| **Overheat** | Permanent-distributed | Dead | Cell becomes obstacle | Permanent | None |
| **Breakdown** | Permanent-distributed | Dead | Cell becomes obstacle | Permanent | None |
| **TemporaryBlockage** | Recoverable | N/A (cell-based) | Cell becomes unwalkable | Configurable (N ticks) | Auto-removes after N ticks |
| **Latency** | Recoverable | Alive, degraded | None | Configurable (N ticks) | Agent resumes after N ticks |
| **PermanentZoneOutage** | Permanent-localized | Agents in zone die | Zone cells become obstacles | Permanent | None |

### Overheat

Triggered when an agent's accumulated heat exceeds `overheat_threshold` (see [Heat System](/docs/researchers/fault-mechanics/heat-faults)). The agent dies, its cell becomes a permanent obstacle, and all agents whose paths cross that cell must replan. Overheat faults are **automatic**, arising from sustained congestion and waiting.

### Breakdown

A hardware death fault triggered by `breakdown_probability` on each tick, configurable via `FaultConfig`. Like Overheat, the agent dies and becomes a permanent obstacle. The distinction matters for analysis: Breakdown is stochastic and uncorrelated with congestion; Overheat is caused by congestion. Both produce identical cascade consequences.

> [!WARNING] Overheat and Breakdown are **permanent**. The agent dies and its cell becomes an obstacle for the remainder of the simulation. Plan your fault intensity accordingly.

### TemporaryBlockage

A cell-based fault, not agent-based. A cell becomes unwalkable for a configurable number of ticks (e.g., simulating a human walking through an aisle, a spill, or a dropped package). After N ticks, the cell automatically becomes walkable again. This is a **new fault type** (not present in earlier versions of MAFIS).

Agents whose paths cross the blocked cell must replan around it. When the blockage clears, agents are not automatically rerouted. They continue on their current paths, which now naturally pass through the restored cell on the next replan cycle.

### Latency

An agent-level degradation fault. The affected agent executes `Action::Wait` for N consecutive ticks regardless of what PIBT would assign. After N ticks, the agent resumes normal operation. The agent is **alive and occupying a cell** during latency. It is not an obstacle, but it is unresponsive to the planner.

Real-world analogy: a robot's sensor system lags, a communication packet is dropped, or a software hang causes the robot to freeze briefly before recovering.

> [!NOTE] Latency faults are the mildest fault type. The agent is alive, occupies its cell, and recovers automatically. Use them to study congestion propagation without permanent fleet attrition.

### PermanentZoneOutage

A permanent, localized fault that blocks an entire zone at a configurable tick. The busiest zone is selected deterministically, and its walkable cells become permanent obstacles. Agents standing on blocked cells die immediately. All task assignments into the zone are invalidated.

Parameters:
- `at_tick`: when the blockage fires (e.g., tick 100)
- `block_percent`: fraction of zone cells to block (1–100%; default 100%)

Real-world analogy: a fire in a warehouse aisle permanently closes an entire section; a structural collapse blocks a storage zone; a water leak forces evacuation of a delivery area.

> [!WARNING] PermanentZoneOutage is the most destructive fault type. A 100% blockage removes all zone cells from the operational map for the remainder of the run.

This is the **Category 3 — Permanent-localized** fault in the paper's taxonomy. It was added to test a failure mode that prior work on *k*-robust MAPF and delay-based fault models does not cover.

## FaultSource

All faults carry a `FaultSource` tag:

```rust
pub enum FaultSource {
    Automatic,  // System-generated via heat/probability
    Manual,     // Researcher-injected via UI
}
```

Manual faults are injected while the simulation is paused (click a robot → "Kill" / "Block for N ticks" / "Slow for N ticks"). They are tagged `FaultSource::Manual` so they can be distinguished in analysis and export, but their metrics are computed through the same cascade pipeline as automatic faults. A manual kill produces the same cascade depth, spread, and recovery dynamics as an automatic breakdown.

> [!IMPORTANT] This ensures that manual injection experiments produce scientifically valid comparisons to automatic fault runs. Manual and automatic faults go through the identical cascade pipeline.

## Fault Intensity Configuration

The rate of automatic fault generation is controlled by `FaultConfig`:

| Parameter | Effect |
|---|---|
| `breakdown_probability` | Per-tick probability that any living agent suffers a Breakdown |
| `overheat_threshold` | Heat level that triggers Overheat (lower = more frequent) |
| `heat_per_wait` | Heat accumulated per tick an agent waits |
| `heat_per_move` | Heat accumulated per tick an agent moves |
| `congestion_heat_bonus` | Extra heat added per nearby agent within `congestion_heat_radius` |
| `heat_dissipation` | Heat lost per tick when not congested |

The UI exposes fault intensity presets (Off / Low / Medium / High) that set these parameters together.

## All Faults Through One Pipeline

Regardless of type or source, every fault goes through the same pipeline:

1. **Heat/FaultCheck** phase: fault is registered, agent state updated, cell obstacle status updated
2. **ADG construction**: Agent Dependency Graph identifies which agents' paths are blocked by the new state
3. **BFS propagation**: cascade depth and spread computed
4. **Replan** phase: affected agents get new plans from PIBT
5. **Metrics**: MTTR, cascade depth/spread, throughput delta computed in `AnalysisSet::Metrics`

See [Cascade Propagation](/docs/researchers/fault-mechanics/breakdown-faults) for the ADG pipeline in detail.
