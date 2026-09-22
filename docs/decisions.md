# Technical Decisions

This document serves as an architectural decision record (ADR) for the WASWIT project.

## 1. Choice of WebAssembly Source Language
**Decision:** Rust
**Rationale:** C++ and AssemblyScript were considered. Rust was chosen because of its robust ecosystem (`wasm-pack`), memory safety guarantees without a garbage collector (which prevents unpredictable pauses during benchmarking), and excellent community documentation for Wasm.

## 2. No Backend Infrastructure
**Decision:** Client-side only execution.
**Rationale:** To maintain a focused scope. Network latency would introduce uncontrollable variables into the performance benchmarking. The goal is to isolate and optimize local browser execution.

## 3. No Machine Learning for Selection Engine
**Decision:** Use deterministic, empirically calibrated thresholds rather than an ML model to select the runtime.
**Rationale:** WASWIT does not use AI or ML. Loading and running an ML model in the browser introduces massive overhead of its own, likely defeating the purpose of micro-optimizing the JS/Wasm decision. A deterministic lookup rule based on input size is faster, more transparent, and highly predictable.

## Unresolved Decisions
- **Web Workers:** Should benchmarks run on the main thread (risking UI freezes) or in a Web Worker (introducing messaging overhead)? This will be evaluated via pilot experiments during implementation.
- **Shared Memory (SharedArrayBuffer):** Should we use shared memory to minimize JS↔Wasm copying overhead? This requires specific HTTP headers (Cross-Origin Isolation), which may complicate the static web deployment. Pending pilot evaluation.
