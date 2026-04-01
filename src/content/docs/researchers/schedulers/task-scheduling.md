---
title: Task Scheduling
description: How MAFIS assigns tasks to agents in lifelong mode and what schedulers are available.
---

In lifelong MAPF, agents continuously receive new tasks after completing their current ones. The component that decides which goal to assign to which agent is the **TaskScheduler**.

## Available Schedulers

### Random

Picks a pickup or delivery cell uniformly at random. Serves as the baseline scheduler.

### Closest-first

Two-phase batch assignment. Phase 1 creates random task candidates from all pickup cells. Phase 2 assigns each agent the nearest task from the pool via greedy matching. Preserves locality benefit without positional convergence.

### Balanced

Assigns tasks to the least-recently-used cell, breaking ties by distance. Biases future assignments toward under-occupied regions.

### Round-trip

Minimizes total round-trip distance. For pickups, selects the cell that minimizes `dist(agent → pickup) + min(dist(pickup → any delivery cell))`. For deliveries, selects the nearest delivery cell.

## Task Model

Agents follow an **8-state task cycle** using zones defined by the topology:

1. **Free** → Scheduler assigns a pickup cell from the topology's pickup zone
2. **TravelEmpty** → Agent travels to pickup cell (no cargo)
3. **Loading** → Agent loads cargo at pickup cell (1-tick minimum dwell)
4. **TravelToQueue** → Agent travels to the back of a delivery queue line
5. **Queuing** → Agent shuffles forward in queue (one slot per tick)
6. **TravelLoaded** → Agent travels to delivery cell (promoted from queue front)
7. **Unloading** → Agent unloads cargo at delivery cell
8. **Free** → Task complete (throughput increments), cycle repeats

Each completed delivery = one throughput unit. If the topology has no queue lines, agents skip steps 4-5 and go directly from Loading to TravelLoaded.
