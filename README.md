# WASWIT: Workload-Aware Intelligent Selection between JavaScript and WebAssembly

## Project Purpose
WASWIT is a final-year B.Tech project that proposes a browser-based framework intended to select between JavaScript and WebAssembly for executing computational workloads. The primary goal is to investigate whether workload-aware runtime selection can improve the overall efficiency of browser-based computational tasks compared to statically picking one runtime.

## Current Development Status
**Phase 0: Research Correction & Methodology Revision** (Completed)
- Research foundation rigorously reviewed and documented.
- Scope and architecture defined.
- Experimental methodology separated into Calibration and Evaluation phases.
- No application code or benchmarking logic has been implemented yet.

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