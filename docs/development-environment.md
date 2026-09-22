# Development Environment

This document outlines the development environment, required toolchains, and commands to run the WASWIT project locally.

## Chosen Tool Versions
- **Node.js**: Expected v18+ (tested natively with npm)
- **Next.js**: v14/15+
- **React**: v18/19+
- **TypeScript**: v5+
- **Tailwind CSS**: v3+ (PostCSS setup)
- **Rust Toolchain**: rustc / cargo (Provisional, pending installation on target machine)
- **Wasm-Pack**: (Provisional)

## Installation Requirements
To develop locally, ensure you have:
1. **Node.js** & **npm**
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
- **Install dependencies:** `npm install`
- **Run development server:** `npm run dev`
- **Build production bundle:** `npm run build`
- **Run production server:** `npm run start`
- **Run unit tests:** `npx vitest run`
- **Run linter:** `npm run lint`

### WebAssembly (Rust)
Execute these commands from within the `wasm/` directory (once Rust is installed):
- **Build Wasm package:** `wasm-pack build --target web`
- **Run Rust tests:** `cargo test`

## Important Architectural Boundaries
- **UI vs Logic:** React components in `frontend/src/app` must NOT contain direct benchmarking or execution loops. They solely dispatch requests to `frontend/src/core/benchmark`.
- **Analyzer vs Selector:** The analyzer only categorizes data. The selector strictly uses predefined thresholds to route.

## Unresolved Implementation Decisions
- **Web Workers Integration:** Pending pilot benchmarks, we have not yet decided if the `benchmark` module will run inside a dedicated Web Worker to avoid blocking the React UI thread.
