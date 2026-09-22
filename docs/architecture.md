# Preliminary Architecture

WASWIT is designed as a modular, browser-based framework. The architecture strictly separates the UI, the selection logic, the execution layers, and the evaluation engines.

## Conceptual Flow

```text
User / UI
  |
Workload Adapter
  |
Workload Analyzer  --> (Extracts deterministic characteristics)
  |
Runtime Selection  <-- (Consumes characteristics + Frozen Selection Policy)
  |
Execution Interface
  +--> JavaScript Implementation
  +--> WebAssembly Implementation (Rust/wasm-pack)
  |
Result Verification
```
*(Calibration engine generates the frozen policy in a separate offline loop.)*

## Logical Modules

1. **Frontend / UI:** 
   Provides the interface for the user to configure experiments, view parity tests, and execute final evaluations.

2. **Workload Adapter & Execution Interface (Phase 1B):** 
   A clean abstraction for computational workloads providing deterministic input generation, data representation formats, and routing to specific runtimes.

3. **JavaScript / WebAssembly Execution Layers (Phase 1B & Phase 2):** 
   Isolated layers that contain the actual algorithmic implementations (Matrix Multiplication, Merge Sort, SHA-256). Algorithmic parity is rigorously enforced across both layers.

4. **Workload Analyzer (Phase 3):** 
   A lightweight pre-processing step that exclusively inspects incoming data configurations (e.g., array length, matrix dimensions) to produce deterministic workload characteristics. It does *not* make routing decisions and does *not* benchmark.

5. **Selection Policy & Runtime Selector (Phase 3):** 
   The core decision logic. Consumes characteristics from the Analyzer and a *frozen*, immutable policy to route the workload deterministically. It has no side effects, executes no benchmarks, and does not remember past behavior.

6. **Calibration Engine (Phase 3):** 
   A dedicated runner used to perform input sweeps, discover crossovers, and establish thresholds (producing the Selection Policy). This is strictly executed offline and its logic is decoupled from live selection.

7. **Evaluation & Measurement Engine (Future):** 
   The runner used to test the frozen WASWIT logic against static baselines, utilizing the Benchmark engine to accurately record final adaptive execution times.

8. **Visualization (Future):** 
   Consumes the raw metric data and plots comparative charts. It is entirely decoupled from the measurement process.

## Architectural Notes (Pending Pilot Experiments)
- **Threading:** Whether the Execution and Measurement layers reside on the main thread or within a Web Worker will be decided after pilot benchmarking, as Web Worker message-passing overhead may artificially inflate JS↔Wasm data-handling metrics.
