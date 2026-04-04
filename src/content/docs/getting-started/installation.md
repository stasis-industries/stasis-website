---
title: Installation
description: Step-by-step guide to install and run MAFIS in web, desktop, and CLI modes.
---

MAFIS runs in three modes. Pick the one that fits your workflow.

---

## Web (Browser)

No installation needed. Open the simulator URL and start experimenting.

**Requirements:** A modern browser (Chrome, Firefox, Edge) with WebGL support.

> [!NOTE] The web version supports up to 1,000 agents. For larger experiments or batch runs, use the desktop version (up to 5,000 agents).

---

## Desktop (Native)

The desktop version has full performance: parallel computation via rayon, the complete Egui panel interface, and no WASM size constraints.

### Prerequisites

1. **Rust toolchain** (stable)
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

2. **Clone the repository**
   ```bash
   git clone https://github.com/stasis-industries/mafis.git
   cd mafis
   ```

### Run

```bash
cargo run --release
```

That's it. The desktop app opens with the full Egui interface: simulation controls, solver selection, fault injection panels, charts, and the resilience scorecard.

---

## CLI (Headless)

For batch experiments and scripted parameter sweeps without a graphical interface.

### Install

From the project root:

```bash
cargo install --path cli
```

### Run

```bash
mafis
```

This opens an interactive REPL where you can configure and run experiments, export results to CSV/JSON, and sweep over parameter combinations.

---

## Build for Web (WASM)

If you want to build the web version yourself:

### Prerequisites

```bash
rustup target add wasm32-unknown-unknown
cargo install wasm-bindgen-cli basic-http-server
```

### Build & Serve

```bash
# 1. Compile (~2-3 min)
cargo build --release --target wasm32-unknown-unknown

# 2. Generate JS bindings
wasm-bindgen --out-dir web --target web \
  target/wasm32-unknown-unknown/release/mafis.wasm

# 3. Serve locally (opens on http://localhost:4000)
basic-http-server web
```

### Quick Feedback Loop

For logic changes (solver, analysis, metrics), you don't need the full WASM build:

```bash
cargo check   # Type + borrow check (~5s)
cargo test    # Run all tests (~10s, 553 tests)
```

Only build WASM when touching rendering, the JS bridge, or visual elements.
