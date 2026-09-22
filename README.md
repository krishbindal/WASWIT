# WASWIT: Workload-Aware Intelligent Selection between JavaScript and WebAssembly

## Project Purpose
WASWIT is a final-year B.Tech project that introduces a browser-based framework intended to select between JavaScript and WebAssembly for executing computational workloads. The primary goal is to investigate whether workload-aware runtime selection between JavaScript and WebAssembly can improve the overall efficiency of browser-based computational tasks.

## Current Development Status
**Phase 0: Foundation, Research & Specification** (Completed)
- Repository initialized
- Research foundation established
- Scope and architecture defined
- Experimental methodology documented

The actual runtime-selection algorithm and experimental workloads have not yet been implemented.

## Research Direction
Investigate whether workload-aware runtime selection between JavaScript and WebAssembly can improve the efficiency of browser-based computational workloads compared to static, always-JS or always-Wasm approaches.

## Major Technologies
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **WebAssembly**: Rust, wasm-pack
- **Measurement**: Browser Performance API
- **Visualization**: Recharts

## Important Scope Restrictions
- This project operates entirely in the browser.
- **NO AI or Machine Learning** is used for runtime selection.
- **NO external datasets** are utilized.
- **NO backend, serverless infrastructure, or database** is implemented; it is an isolated browser-side framework.