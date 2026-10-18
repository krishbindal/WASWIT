# WASWIT Frontend & Interactive Evaluation Harness

This directory contains the Next.js / React / TypeScript web interface and research test harness for **WASWIT** (Workload-Aware Intelligent Selection between JavaScript and WebAssembly).

## Getting Started

### 1. Prerequisites
- Node.js >= 20 (v24.x verified)
- Rust & `wasm-pack` (for compiling WebAssembly workloads)

### 2. Build WebAssembly Module
Ensure the Rust-based WebAssembly artifacts are built before running the application:
```bash
npm run build:wasm
```
This compiles the Rust crate in `../wasm` and places web-target bindings into `src/wasm/`.

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

## Key Routes

- **`/` (Research Dashboard)**: Real-time system information, workload verification, and cross-runtime parity testing.
- **`/developer` (Developer Playground)**: Interactive demo for testing deterministic runtime selection using the `waswit` SDK.
- **`/calibration-runner`**: Calibration acquisition interface (Phase 5C).
- **`/evaluation-runner`**: Independent evaluation harness (Phase 5E).
- **`/pilot-test-runner`**: Feasibility pilot testing interface (Phase 5B).
- **`/selector-test`**: Unit-level selector testing interface (Phase 3).

## Verification & Testing

```bash
# Run unit tests (142 tests)
npx vitest run

# Run end-to-end tests (13 test suites via Chromium)
npx playwright test

# Production build & type-check
npm run build
```

## Structure
- `src/app/`: Next.js App Router pages and layouts.
- `src/components/`: UI components (dashboard, charts, workload cards).
- `src/core/`:
  - `benchmark/`: Micro-benchmarking execution and statistical engines.
  - `calibration/`: Policy calibration algorithms.
  - `evaluation/`: Independent evaluation harness and dispatchers.
  - `sdk/`: Developer-facing SDK implementation (`waswitRun`, `waswitPreload`).
  - `selection/`: Pure deterministic selector, analyzer, and frozen empirical policy.
  - `workloads/`: Implementations for Matrix Multiplication, Merge Sort, and SHA-256.
- `src/wasm/`: Generated WebAssembly bindings from `wasm-pack`.
- `artifacts/`: Cryptographically locked scientific datasets, policies, and analyses.
