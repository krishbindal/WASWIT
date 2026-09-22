# Technical Decisions

This document serves as an architectural decision record (ADR) for the WASWIT project.

## 1. Choice of WebAssembly Source Language
**Decision:** Rust
**Rationale:** C++ and AssemblyScript were considered. Rust was chosen because of its robust ecosystem (`wasm-pack`), memory safety guarantees without a garbage collector (which prevents unpredictable pauses during benchmarking), and excellent community documentation for Wasm.

## 2. No Backend Infrastructure
**Decision:** Client-side only execution.
**Rationale:** To maintain a focused scope. Network latency would introduce uncontrollable variables into the performance benchmarking. The goal is to optimize local browser execution, not distributed systems.

## 3. No Machine Learning for Selection Engine
**Decision:** Use deterministic, empirical thresholds rather than an ML model to select the runtime.
**Rationale:** Loading and running an ML model in the browser introduces massive overhead of its own, likely defeating the purpose of micro-optimizing the JS/Wasm decision. A deterministic lookup table based on input size is faster and predictable.

## Unresolved Decisions
- **Web Workers:** Should benchmarks run on the main thread (risking UI freezes) or in a Web Worker (introducing messaging overhead)? This will be tested and decided during the implementation phase.
- **Shared Memory (SharedArrayBuffer):** Should we use shared memory to eliminate JS-Wasm serialization overhead? Requires specific HTTP headers (Cross-Origin Isolation) which may complicate deployment. Pending validation.
