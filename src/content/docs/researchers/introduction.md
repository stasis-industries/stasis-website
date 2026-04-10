---
title: Introduction to MAFIS
description: What MAFIS is, why lifelong fault resilience matters, and how to get started.
---

**MAFIS** (Multi-Agent Fault Injection Simulator) is a **fault resilience observatory** for lifelong multi-agent path finding (MAPF). It measures how multi-agent systems degrade, recover, and adapt under faults, congestion, and cascading failures sustained over continuous operation.

MAFIS is a research project built in Rust using the Bevy engine, compiled to both WebAssembly (browser) and native desktop. It runs deterministic simulations where every fault event, cascade, and recovery is reproducible from a seed.

## The Research Question

> *What happens to a multi-agent fleet under sustained fault injection?*

Different solvers, fault types, and topologies produce different degradation and recovery patterns. MAFIS makes those differences observable and measurable.

## Research Variables

| Variable | Options |
|---|---|
| **Solver** | PIBT, RHCR (PBS, PIBT-Window, Priority A*), Token Passing, TPTS, RT-LaCAM |
| **Fault type** | Burst, Wear-based (Weibull), Spatial zone outage, Intermittent |
| **Grid topology** | Warehouse Medium, Warehouse Large, Compact Grid, Kiva Warehouse, Sorting Center, Fulfillment Center |
| **Agent density** | Configurable (up to 1,000 agents in WASM, 5,000 native) |
| **Scheduler strategy** | Random, Closest |

MAFIS is built to study how solver architecture, fault type, and topology interact under sustained fault conditions.

## Resilience Scorecard

Every fault injection run produces a four-metric **Resilience Scorecard**:

- **Fault Tolerance** — throughput retained under faults
- **NRR** — operational uptime ratio, recovery speed vs fault frequency (requires recurring faults)
- **Survival Rate** — fraction of the initial fleet still alive after faults
- **Critical Time** — fraction of time spent in a critically degraded state
- **Cascade Depth / Spread** — how far fault effects propagate through the dependency graph

See [Resilience Scorecard](/docs/researchers/observatory/resilience-scorecard) for formulas and examples.

## Two Versions

| | Web (WASM) | Desktop (Native) |
|---|---|---|
| **Install** | None (runs in browser) | Download binary |
| **Performance** | 1,000 agents, 60 FPS | 5,000 agents, parallel computation |
| **Interface** | HTML/CSS/JS controls | Full Egui panel system |
| **Use case** | Quick experiments, demos | Batch experiments, parameter sweeps |

Both versions share the same simulation core. Same seed = identical results.

A **CLI tool** (`mafis`) is also available for headless batch experiments and scripted parameter sweeps without any graphical interface.

## What MAFIS Is NOT

> [!WARNING] **Not a solver benchmark.** MAFIS does not compare algorithms against each other. Algorithm comparisons are [MAPF Tracker](https://tracker.pathfinding.ai/)'s domain.

> [!WARNING] **Not a static testbed.** For standardized 2D grid environments, see [MovingAI MAPF Benchmarks](https://movingai.com/benchmarks/mapf.html).

> [!WARNING] **Not a one-shot simulator.** MAFIS measures degradation under continuous operation, not time-to-completion for a fixed set of goals.

## Getting Oriented

- [Simulation Phases](/docs/researchers/observatory/simulation-phases)
- [Resilience Scorecard](/docs/researchers/observatory/resilience-scorecard)
- [Fault Metrics](/docs/researchers/metrics/fault-metrics)
- [Fault Types](/docs/researchers/fault-mechanics/chaos-engineering)
- [Installation](/docs/getting-started/installation)
