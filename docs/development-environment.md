# Development Environment

This document outlines the development environment, required toolchains, and commands to run the WASWIT project locally.

## Chosen Tool Versions
- **Node.js**: v24.11.1 (tested natively with npm 11.6.2)
- **Next.js**: v16.3.5
- **React**: v19.2.8
- **TypeScript**: v5.x
- **Tailwind CSS**: v4.x (PostCSS setup)
- **Rust Toolchain**: rustc 1.98.1 / cargo 1.98.1
- **Wasm-Pack**: v0.15.0

## Installation Requirements
To develop locally, ensure you have:
1. **Node.js** & **npm** (v24+ recommended)
2. **Rustup** (to install `cargo` and `rustc`)
3. **wasm-pack** (`cargo install wasm-pack`)

## Project Structure
```text
/
├── frontend/             # Next.js React application (UI, Measurement, Analysis)
│   ├── src/
│   │   ├── app/          # Next.js App Router (Pages, UI)
│   │   └── core/         # WASWIT Logic 
│   │       ├── analyzer/ # Workload parsing logic
│   │       ├── selector/ # Adaptive decision thresholds
│   │       ├── benchmark/# Measurement engine
│   │       └── types/    # Core TS interfaces
│   ├── e2e/              # Playwright E2E tests
│   └── package.json
├── wasm/                 # Rust workspace for WebAssembly algorithms
│   ├── src/              # Rust implementations
│   └── Cargo.toml
├── experiments/          # Raw data and run configurations
│   ├── raw/
│   ├── processed/
│   └── configs/
└── docs/                 # Research and architectural documentation
```

## Commands

### Frontend (Next.js)
Execute these commands from within the `frontend/` directory:
- **Install dependencies:** `npm install --legacy-peer-deps`
- **Run development server:** `npm run dev`
- **Build production bundle:** `npm run build`
- **Run production server:** `npm run start`
- **Run unit tests:** `npx vitest run`
- **Run E2E tests:** `npx playwright test`
- **Run linter:** `npm run lint`

### WebAssembly (Rust)
Execute these commands from within the `wasm/` directory (Rust is verified and installed):
- **Build Wasm package:** `wasm-pack build --target web`
- **Run Rust tests:** `cargo test`
- **Check Rust syntax/types:** `cargo check`

## Important Architectural Boundaries
- **UI vs Logic:** React components in `frontend/src/app` must NOT contain direct benchmarking or execution loops. They solely dispatch requests to `frontend/src/core/benchmark`.
- **Analyzer vs Selector:** The analyzer only categorizes data. The selector strictly uses predefined thresholds to route.

## Unresolved Implementation Decisions
- **Web Workers Integration:** Pending pilot benchmarks, we have not yet decided if the `benchmark` module will run inside a dedicated Web Worker to avoid blocking the React UI thread.
