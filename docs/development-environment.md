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

### Clean Clone Setup Sequence
To verify reproducible builds on a fresh clone, run the following sequence:

```bash
# 1. Clone and enter directory
git clone https://github.com/krishbindal/WASWIT.git
cd WASWIT/frontend

# 2. Install dependencies strictly from package-lock.json
npm ci

# 3. Build WebAssembly module (Compiles Rust directly to frontend/src/wasm)
npm run build:wasm

# 4. Check formatting and linting
npm run lint

# 5. Run JS unit tests
npx vitest run

# 6. Verify Rust logic
cd ../wasm
cargo check
cargo test

# 7. Run JS/Wasm browser parity tests
cd ../frontend
npx playwright test

# 8. Build production Next.js app
npm run build
```

*(Note: `frontend/src/wasm` is a generated artifact directory created by `npm run build:wasm` and is intentionally ignored by version control to ensure each environment builds the Wasm module natively).*

### Running the application
After the setup above, you can run the application with:
- **Development server:** `npm run dev`
- **Production server:** `npm run start` (Requires `npm run build` first)
- **Analyzer vs Selector:** The analyzer only categorizes data. The selector strictly uses predefined thresholds to route.

## Unresolved Implementation Decisions
- **Web Workers Integration:** Pending pilot benchmarks, we have not yet decided if the `benchmark` module will run inside a dedicated Web Worker to avoid blocking the React UI thread.
