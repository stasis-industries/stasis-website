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
| **Topology** | Warehouse Medium, Warehouse Large, Compact Grid, Kiva Warehouse, Sorting Center, Fulfillment Center | Grid layout and zone definitions |
| **Agent count** | Slider | Number of agents spawned |
| **Seed** | Input | RNG seed for reproducibility |
| **Scheduler** | Random, Closest | Task assignment strategy |
| **Solver** | PIBT, RHCR (3 variants), Token Passing, RT-LaCAM, TPTS | Path planning algorithm |
| **Fault intensity** | Off / Low / Medium / High | Fault frequency and severity |
| **Baseline ticks** | Input (default: configurable) | Duration of headless fault-free baseline |
| **Task limit** | Optional | Stop condition on total tasks completed |

## Grid Topologies

MAFIS provides pre-built topologies that define grid layout, obstacle placement, and **zone maps** (pickup, delivery, and corridor zones for the task scheduler). All topologies are stored as JSON files in `topologies/` with a `manifest.json`.

| Topology | Size | Agents | Characteristic |
|---|---|---|---|
| **Warehouse Medium** | 30 × 15 | 13 | Balanced for most research |
| **Warehouse Large** | 57 × 33 | 60 | Stress testing, cascade analysis |
| **Compact Grid** | 26 × 26 | 25 | Dense grid, high congestion |
| **Kiva Warehouse** | 48 × 48 | 80 | Large-scale Kiva-style layout |
| **Sorting Center** | 45 × 20 | 40 | Linear flow layout |
| **Fulfillment Center** | 54 × 24 | 36 | Multi-dock fulfillment facility |

## Fault Scenarios

Beyond manual fault injection (clicking on agents during a run), MAFIS supports **scheduled fault scenarios**, which are pre-configured sequences of fault events at specific ticks:

- Kill agent at tick T
- Place obstacle at position (x, y) at tick T
- Inject latency for N ticks at tick T
- Temporary blockage for N ticks at tick T
- Permanent zone outage at tick T (block N% of busiest zone cells)

Scheduled scenarios ensure identical fault conditions across comparison runs with different scheduler or topology configurations.

## Reproducible Research

To reproduce a result:

1. Record: seed, topology, agent count, scheduler, solver, fault intensity, and any scheduled fault scenario.
2. Set all parameters identically.
3. The simulation will produce identical results, bit-for-bit deterministic.
