---
title: Wear & Heat System
description: How the Weibull wear model determines agent lifespan, how heat visualizes wear progress, and how the heatmap shows congestion.
---

The wear system models mechanical degradation in MAFIS. Each agent has a pre-sampled failure time drawn from a Weibull distribution at simulation start. As agents move, their operational age increases. When an agent's operational age reaches its sampled failure time, it dies permanently. The **heat** value is a visual indicator of how close each agent is to failure.

## Weibull Wear Model

At initialization, each agent is assigned a failure time using the Weibull inverse CDF:

$$t_{\text{fail}} = \eta \cdot (-\ln U)^{1/\beta}$$

where $U \sim \text{Uniform}(0, 1)$, $\beta$ is the shape parameter, and $\eta$ is the scale parameter.

| Parameter | Effect |
|---|---|
| $\beta$ (shape) | Controls failure clustering. Higher $\beta$ = more agents fail around the same time |
| $\eta$ (scale) | Controls average lifespan. Higher $\eta$ = longer average time to failure |

These failure times are sampled once per agent at simulation start using the dedicated `fault_rng` stream. No per-tick RNG is consumed for wear detection.

### Wear Presets

| Preset | $\beta$ | $\eta$ | Behavior |
|---|---|---|---|
| Low | 2.0 | 900 | Long-lived fleet, gradual attrition |
| Medium | 2.5 | 500 | Moderate degradation |
| High | 3.5 | 150 | Rapid, clustered failures |

### Death Trigger

Each tick, agents that move increment their `operational_age`. When `operational_age >= weibull_failure_ticks[i]`, the agent dies:

1. Agent state → Dead
2. Agent's cell → permanent obstacle in `GridMap`
3. Cascade pipeline fires (ADG → BFS → replan)
4. `FaultType::Overheat` event recorded

> [!IMPORTANT] Wear detection is a simple deterministic comparison — no per-tick probability roll. This makes wear-based death fully reproducible from the seed.

## Heat (Visual Indicator)

Heat is **not** a fault trigger. It is a visual indicator showing each agent's progress toward its sampled failure time:

$$\text{heat} = \frac{\text{operational\_age}}{\text{failure\_tick}}$$

- `heat = 0.0` → fresh agent, far from failure
- `heat = 1.0` → agent at or past its failure time

Heat is displayed as a color gradient on agents in the 3D viewport: cool colors for low heat, warm colors for agents approaching failure.

> [!NOTE] Heat shows individual agent progress, not population-level Weibull CDF. Two agents with heat 0.8 are each 80% toward their own (different) failure times.

## Heatmap

The heatmap is a spatial density grid updated each tick. It provides a real-time overlay in the 3D viewport showing congestion hot spots. Cells where agents frequently wait show high density; lightly trafficked cells show low density. The heatmap has two modes: density (decaying warm gradient) and traffic (cumulative blue).

## Configuration

Wear parameters live in `FaultConfig` (`src/fault/config.rs`):

```rust
pub struct FaultConfig {
    pub enabled: bool,
    pub weibull_enabled: bool,
    pub weibull_beta: f32,
    pub weibull_eta: f32,
    pub intermittent_enabled: bool,
    pub intermittent_mtbf_ticks: u64,
    pub intermittent_recovery_ticks: u32,
}
```

The Weibull model is activated when `weibull_enabled` is true. Intermittent faults (temporary latency) are controlled separately.

## Code Location

- `src/core/runner/mod.rs` : `sample_weibull_ticks()`, `update_agent_wear()`, `detect_weibull_faults()`
- `src/fault/config.rs` : `FaultConfig` resource
- `src/fault/heat.rs` : `HeatmapState` resource, heatmap overlay
- `src/analysis/fault_metrics.rs` : fault metrics computation
