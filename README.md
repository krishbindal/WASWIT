# WASWIT: Workload-Aware Intelligent Selection between JavaScript and WebAssembly

## Project Purpose
WASWIT is a final-year B.Tech project that proposes a browser-based framework intended to select between JavaScript and WebAssembly for executing computational workloads. The primary goal is to investigate whether workload-aware runtime selection can improve the overall efficiency of browser-based computational tasks compared to statically picking one runtime.

## Current Development Status
**Phase 5H Certified**
- Scientific evidence is locked.
- Paper construction is the next stage.
- Note: This does not mean the entire paper is complete.
- 3 workloads evaluated (Matrix Multiplication, Merge Sort, SHA-256).
- Deterministic routing executed via a frozen policy.
- Phase 5E final evaluation, Phase 5F statistics, Phase 5G figures/tables, and Phase 5H interpretation are finalized.

## Research Direction
Investigate whether a deterministic, workload-aware runtime selection mechanism between JavaScript and WebAssembly can achieve competitive or improved performance relative to always using JavaScript or always using WebAssembly. 

## Major Technologies
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **WebAssembly**: Rust, wasm-pack
- **Measurement**: Browser Performance API
- **Visualization**: Recharts

## Important Scope Restrictions
- This project operates entirely in the browser environment.
- **NO AI or Machine Learning** is used for runtime selection; it relies on empirically calibrated thresholds.
- **NO external datasets** are utilized.
- **NO backend, serverless infrastructure, or database** is implemented.