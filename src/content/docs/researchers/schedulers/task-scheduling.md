---
title: Task Scheduling
description: How MAFIS assigns tasks to agents in lifelong mode, why scheduler strategy is the primary research variable, and what schedulers are available.
---

In lifelong MAPF, agents continuously receive new tasks after completing their current ones. The component that decides which goal to assign to which agent is the **TaskScheduler**. Scheduler strategy, not solver algorithm, is the primary research variable in MAFIS.

## Why Scheduler Strategy Matters

The solver is held constant. What varies across research configurations is:

1. **Scheduler strategy** : how tasks are assigned
2. **Fault intensity** : how frequently and severely faults occur
3. **Grid topology** : the map structure (corridor width, bottlenecks, density)

> [!IMPORTANT] The same solver on the same map under the same fault intensity can produce radically different resilience profiles depending on how tasks are assigned. A scheduler that concentrates agents in narrow corridors produces high cascade depth and low fleet utilization under faults. A scheduler that distributes load broadly produces lower baseline throughput but better fault resilience.

## Available Schedulers

### Random

Picks any walkable cell uniformly at random as the next goal. Agents spread across the entire grid by task assignment alone.

- **Resilience profile:** Moderate cascade depth, good load distribution
- **Use case:** Baseline for all comparisons

### Closest-first

Assigns the nearest pickup or delivery cell by Manhattan distance. Falls back to random if all nearby cells are occupied.

- **Resilience profile:** Higher baseline throughput (shorter travel), but agents cluster around popular zones, leading to higher cascade depth under faults
- **Use case:** Tests whether optimizing for efficiency hurts fault resilience

### Balanced

Assigns tasks to the least-recently-used cell, breaking ties by distance. Tracks which cells have been assigned goals and biases future assignments toward under-occupied regions.

- **Resilience profile:** Lowest cascade depth of all schedulers, as load spread prevents bottleneck formation
- **Use case:** Tests whether uniform load distribution improves fault resilience relative to distance-optimal assignment

### Round-trip

Warehouse-aware scheduler that minimizes total round-trip distance. For pickups, selects the cell that minimizes `dist(agent → pickup) + min(dist(pickup → any delivery cell))`. For deliveries, selects the nearest delivery cell.

- **Resilience profile:** High baseline throughput with moderate resilience, optimizing full task cycles rather than individual legs
- **Use case:** Tests whether warehouse-realistic task assignment changes the resilience profile compared to leg-by-leg optimization

## Task Model

Agents follow a **2-leg task cycle** using zones defined by the topology:

1. **Idle** → Scheduler assigns a pickup cell from the topology's pickup zone
2. **Pickup** → Agent travels to pickup cell, then scheduler assigns a delivery cell
3. **Delivery** → Agent travels to delivery cell, throughput increments, cycle repeats

Each completed delivery = one throughput unit.

Each scheduler produces a distinct resilience profile under the same fault conditions, and that comparison is the research output MAFIS is built to generate.
