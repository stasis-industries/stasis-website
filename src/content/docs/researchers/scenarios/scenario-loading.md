---
title: Scenarios & Configuration
description: "How to configure a MAFIS simulation run: topology selection, agent count, fault intensity, scheduler, and deterministic seeding."
---

A MAFIS simulation run is defined by a combination of configuration parameters set before starting. All randomness is controlled by `SeededRng`, ensuring that any run can be reproduced exactly by reusing the same seed.

## Deterministic Seeding

All randomness in MAFIS flows through a single seeded random number generator (ChaCha8). The seed controls:

- Topology obstacle placement
- Initial agent positions
- Task assignment (scheduler decisions)
- Fault probability rolls

> [!TIP] With the same seed and configuration, two runs produce identical fault events at identical ticks with identical cascade consequences. This is required for reproducible research. Any result can be independently verified.

## Configuration Parameters

| Parameter | Options | Effect |
|---|---|---|
| **Topology** | Warehouse Medium, Kiva Large, Sorting Center, Compact Grid | Grid layout and zone definitions |
| **Agent count** | Slider | Number of agents spawned |
| **Seed** | Input | RNG seed for reproducibility |
| **Scheduler** | Random, Closest-first, Balanced, RoundTrip | Task assignment strategy |
| **Solver** | PIBT, RHCR (3 variants), Token Passing | Path planning algorithm |
| **Fault intensity** | Off / Low / Medium / High | Fault frequency and severity |
| **Baseline ticks** | Input (default: configurable) | Duration of headless fault-free baseline |
| **Task limit** | Optional | Stop condition on total tasks completed |

## Grid Topologies

MAFIS provides pre-built topologies that define grid layout, obstacle placement, and **zone maps** (pickup, delivery, and corridor zones for the task scheduler). All topologies are stored as JSON files in `topologies/` with a `manifest.json`.

| Topology | Size | Suggested agents | Characteristic |
|---|---|---|---|
| **Warehouse Medium** | 32 × 21 | 30–100 | Balanced for most research |
| **Kiva Large** | 57 × 33 | 100–300 | Stress testing, cascade analysis |
| **Sorting Center** | 40 × 20 | 30–120 | Linear flow layout |
| **Compact Grid** | 24 × 24 | 20–80 | Dense grid, high congestion |

## Fault Scenarios

Beyond manual fault injection (clicking on agents during a run), MAFIS supports **scheduled fault scenarios**, which are pre-configured sequences of fault events at specific ticks:

- Kill agent at tick T
- Place obstacle at position (x, y) at tick T
- Inject latency for N ticks at tick T
- Temporary blockage for N ticks at tick T

Scheduled scenarios ensure identical fault conditions across comparison runs with different scheduler or topology configurations.

## Reproducible Research

To reproduce a result:

1. Record: seed, topology, agent count, scheduler, solver, fault intensity, and any scheduled fault scenario.
2. Set all parameters identically.
3. The simulation will produce identical results, bit-for-bit deterministic.
