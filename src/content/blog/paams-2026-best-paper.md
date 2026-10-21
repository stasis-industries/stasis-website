---
title: "MAFIS wins the Best Paper Award at AREA, PAAMS 2026"
description: "The talk, live and interactive, and the context behind the paper: how robot fleets cope when things go wrong."
date: "2026-10-21"
readTime: 4
tags: ["PAAMS 2026", "AREA", "award", "talk"]
image: "/blog/area-2026-best-paper.jpg"
imageAlt: "Best Paper Award, 6th AREA Workshop, PAAMS 2026, Napoli, 21 October 2026"
status: "published"
---

On 21 October 2026, in Napoli, the paper **"MAFIS: A Resilience Observatory for Lifelong Multi-Agent Path Finding"** received the Best Paper Award of the 6th Workshop on Agents and Robots for reliable Engineered Autonomy (AREA), held at PAAMS 2026. The paper is by Teddy Truong and Yannick Francillette, Université du Québec à Chicoutimi and the Multi-utilisateur Interaction Experience Lab.

## The talk

This is the deck presented at the workshop, running live in your browser. The robots are real MAFIS runs, replayed in 3D. Click the right side of the slides (or press →) to go forward and the left side (or ←) to go back. F gives full screen, N shows the speaker notes.

<iframe src="/talks/mafis-paams-2026.html" title="MAFIS talk at AREA, PAAMS 2026" allow="fullscreen" allowfullscreen style="width:100%;aspect-ratio:16/9;border:1px solid var(--border);display:block"></iframe>

[Open the slides in a new tab ↗](/talks/mafis-paams-2026.html)

## PAAMS and AREA

PAAMS, the International Conference on Practical Applications of Agents and Multi-Agent Systems, is a yearly conference on agent technology put to work in real applications. AREA, Agents and Robots for reliable Engineered Autonomy, is one of its workshops. It gathers people who build autonomous agents and robots and want them to be dependable: fault tolerance, verification and validation, and multi-agent coordination. The 2026 edition was organised by Angelo Ferrando and Rafael C. Cardoso.

## What the paper proposes

Planners for warehouse robot fleets are usually ranked on one number: tasks delivered when every robot moves exactly as planned. Real robots break down, wear out, freeze or run late. In 2026 the League of Robot Runners, the main competition in this field, started adding delays for the same reason.

MAFIS borrows the method of chaos engineering. Every run has a fault-free twin with the same map, robots and tasks. A fault is injected into one copy only, and the gap between the two is the cost of the fault. MAFIS tests four kinds of fault (a burst of failures, wear over time, a zone that freezes, robots that pause at random) and reports differential metrics: fault tolerance, critical time, a time-weighted throughput gap, attack rate, cascade depth and rapidity.

## What it shows

Being fast without faults does not mean being fast with them. On a small warehouse with 40 robots, PIBT delivers more than RHCR when nothing goes wrong, but fewer once robots pause at random. Across 30 random setups the order flips in 24. A fault-free benchmark would pick the wrong planner for that warehouse.

## Try it

The [simulator](/simulator) runs in the browser, no install. The code is open on [GitHub](https://github.com/stasis-industries/mafis).

Thank you to the AREA organisers and reviewers, and to everyone who came to talk after the session.
