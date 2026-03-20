# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Website for **Stasis AI** and its product **MAFIS** (Multi-Agent Fault Injection Simulator) — a Rust/Bevy/WASM simulator for chaos engineering in MAPF (Multi-Agent Path Finding) networks. This repo is the marketing site and documentation hub, not the simulator itself.

MAFIS is a **research project** (not a thesis) by a 5th-year CS student. It may be submitted for peer review and potential publication.

## Commands

```bash
npm run dev        # Dev server at localhost:4321
npm run build      # Production build to ./dist/
npm run preview    # Preview production build locally

# E2E tests (Playwright, Chromium only)
npx playwright test                    # Run all tests (auto-starts dev server)
npx playwright test tests/home.spec.ts # Run single test file
npx playwright test --headed           # Run with visible browser
```

## Architecture

**Framework**: Astro 5 (Static Site Generation) with `ClientRouter` for SPA-like view transitions.

**Layouts**:
- `src/layouts/Layout.astro` — Base layout. Defines all CSS variables (`:root` and `html.dark`), theme persistence script, SEO meta tags, Google Fonts loading.
- `src/layouts/DocsLayout.astro` — Three-column docs layout (sidebar nav + content + TOC). Handles pagination, pagefind search integration, mobile off-canvas sidebar, and code block copy buttons.

**Pages**: `src/pages/` — Astro file-based routing. Docs use `[...slug].astro` with `getStaticPaths()` from the `docs` content collection. `/simulator`, `/blog`, `/about` are WIP draft pages.

**Content**: `src/content/docs/` — Markdown files for documentation. Schema defined in `src/content.config.ts` (title, description). Navigation structure is hardcoded in `DocsLayout.astro`'s `navGroups` array — new docs must be added there manually.

**Components**:
- `src/components/Header.astro` — Fixed header (height: 70px, hardcoded). Handles theme toggle, mobile burger menu. Docs mobile sticky topbar uses `top: 70px`.
- `src/components/KineticGrid.jsx` — React + @react-three/fiber 3D visualization on homepage. Implements A* pathfinding and PIBT-style agent simulation with fault injection wave propagation. Loaded via `client:only="react"`.

## Styling Conventions

**Dual system**: Core structural CSS uses vanilla CSS with CSS variables defined in `Layout.astro`. Tailwind CSS v4 is available via Vite plugin (`src/styles/global.css`), mainly used for utility overrides and the `@theme` token bridge.

**Theme engine**: Light/Dark mode via `html.dark` class on `<html>`. In Astro components, target dark mode with `:global(html.dark) .my-class`. Theme state persists in `localStorage.theme` and survives view transitions via `astro:after-swap` event.

**Design tokens** (CSS variables):
- Backgrounds: `--bg`, `--surface` (never pure white/black — light uses `#F5F2EE`, dark uses `#111111`)
- Text: `--text`, `--text-sec`, `--dark` (inverts between themes)
- Borders: `--border`, `--dark-border`
- Fonts: `--serif` (Playfair Display), `--mono` (DM Mono), `--sans` (Inter)
- Accents: `--red` (#991B1B), `--green` (#047857)

**Typography pattern**: Headings use `var(--serif)`, labels/tags/nav use `var(--mono)` uppercase with letter-spacing, body text uses `var(--sans)`. Buttons have `border-radius: 0`.

**Dark sections**: The homepage has hardcoded dark sections (`background: #080808; color: #F0EDE9`) that are independent of the theme toggle.

## Key Patterns

- **View transitions**: All interactive scripts must use `document.addEventListener('astro:page-load', ...)` instead of `DOMContentLoaded` to work after SPA navigations. Clone-and-replace pattern used in Header.astro to avoid duplicate event listeners.
- **Homepage scroll snap**: `index.astro` uses `scroll-snap-type: y proximity` on `.snap-container`. Each section is a snap point. Header auto-hides on scroll. Back-to-top temporarily disables snap for smooth scroll.
- **Inline scripts**: Scripts that must run before paint (theme detection) use `<script is:inline>`. Others use standard `<script>` for bundling.

## Companion Rust/WASM Project

The actual simulator lives at `/Users/teddyadmin/Developments/Research-Project/mafis`. It is a **Bevy 0.18** app with both WASM (web) and native desktop targets.

**Build pipeline** (run from the Rust project root):
```bash
cargo check                                                            # ~5s type/borrow check
cargo test                                                             # ~7s logic tests
cargo build --release --target wasm32-unknown-unknown                  # WASM compile (~2-3 min)
wasm-bindgen --out-dir web --target web \
  target/wasm32-unknown-unknown/release/mafis.wasm                    # Generate JS bindings
basic-http-server web                                                  # Serve on port 4000
```

**Solvers**: PIBT, RHCR (PBS/PIBT-Window/Priority A*), Token Passing. All lifelong-capable. `LifelongSolver` trait in `src/solver/lifelong.rs`.

**Schedulers**: Random, Closest-first. `TaskScheduler` trait in `src/core/task.rs`.

**Topologies**: WarehouseTopology (S/M/L), OpenFloorTopology. `Topology` trait in `src/core/topology.rs`.

**Dual-twin simulation**: Headless Baseline (instant, fault-free reference) → Fault Injection (live sim with faults active from tick 1, metrics computed as deltas from baseline). No warmup phase.

**Resilience Scorecard**: Fault Tolerance (Milner 2023), NRR (Or 2025), Adaptability (Shannon entropy), Critical Time (Ghasemieh 2024).

**Observatory identity**: MAFIS is a fault resilience observatory, not a solver benchmark. It measures how lifelong multi-agent systems degrade, recover, and adapt under faults.

## Documentation Structure

Docs have two sections (no developer docs — kept simple):

**Getting Started**: Introduction, Installation
**Research**: Observatory (Simulation Phases, Resilience Scorecard), Metrics (Fault Metrics), Fault Mechanics (Fault Types, Cascade Propagation, Heat System), Schedulers (Task Scheduling), Scenarios (Configuration, Tick Rewind)

Navigation is hardcoded in `DocsLayout.astro`'s `navGroups` array.

## CI/CD

GitHub Actions (`.github/workflows/ci.yml`): `npm audit` security scan → build → Playwright E2E. Runs on push/PR to `main` and `dev`. Node 22.
