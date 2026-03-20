---
title: Simulation Phases
description: "The dual-twin simulation model: a headless fault-free baseline computed instantly, then a live fault injection run measured against it."
---

MAFIS uses a **dual-twin model**: a headless fault-free baseline is computed first, then the live simulation runs with faults active from tick 1. All resilience metrics are computed as deviations between the two. This is what makes measurements quantitative, not absolute.

## Phase 1: Headless Baseline

Before the visible simulation starts, MAFIS runs a **deterministic fault-free simulation** headlessly: pure Rust, no rendering, no ECS overhead. This baseline uses the same seed, topology, solver, and scheduler as the live run. The only difference: faults are disabled.

The baseline runs instantly (or near-instantly) and produces per-tick reference data:

| Baseline data | Description |
|---|---|
| Throughput per tick | Goals completed at each tick with no faults |
| Cumulative tasks | Running total of completed tasks |
| Idle counts | Wait actions per tick |

> [!IMPORTANT] The baseline matches the live simulation **bit-for-bit** until the first fault fires. This is guaranteed by deterministic seeding and shared core functions. The deviation after a fault is the core research output.

## Phase 2: Fault Injection

The live simulation starts immediately with faults enabled. There is no warmup period. Fault injection is active from tick 1. The configured fault sources are active from the start: heat accumulation, automatic breakdown probability, scheduled fault scenarios, and manual injection.

> [!IMPORTANT] All resilience metrics are computed as **deviations from the headless baseline** at each tick. The deviation can be negative (fault degraded performance) or positive (fault improved performance by relieving over-saturation, i.e. Braess's paradox).

## Baseline Differential Tracking

During the live run, MAFIS tracks the gap between live and baseline at every tick:

| Differential metric | What it shows |
|---|---|
| Throughput delta | Live throughput − baseline throughput at same tick |
| Tasks delta | Cumulative tasks completed gap |
| Deficit integral | Accumulated throughput shortfall over time |
| Surplus integral | Accumulated throughput surplus (Braess's paradox) |
| Recovery tick | First tick where live throughput exceeds baseline |

## Why This Model

The dual-twin model replaced an earlier warmup-based approach. The advantage: the baseline is computed once, instantly, and is available from tick 1. There is no "warm up and wait." The researcher sees fault impact immediately.

The question is never "what is the throughput?" in isolation. It is "how much does throughput deviate from what it would have been without faults, under this (scheduler, topology, fault intensity) configuration?"

See [Resilience Scorecard](/docs/researchers/observatory/resilience-scorecard) for the four metrics computed from the baseline differential.
