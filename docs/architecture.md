# Preliminary Architecture

WASWIT is designed as a modular, browser-based framework. The architecture strictly separates the UI, the selection logic, the execution layers, and the evaluation engines.

## Conceptual Flow

```text
User / UI
  ↓
Workload Adapter
  ↓
Execution Interface
  ├── JavaScript Implementation
  └── WebAssembly Implementation (Rust/wasm-pack)
  ↓
Result Verification
```
*(Benchmarking, Workload Analyzer, and Runtime Selection Engine will be layered onto this execution path in future phases.)*

## Logical Modules

1. **Frontend / UI:** 
   Provides the interface for the user to configure experiments, view parity tests, and execute final evaluations.

2. **Workload Adapter & Execution Interface (Phase 1B):** 
   A clean abstraction for computational workloads providing deterministic input generation, data representation formats, and routing to specific runtimes.

3. **JavaScript / WebAssembly Execution Layers (Phase 1B):** 
   Isolated layers that contain the actual algorithmic implementations (e.g., Matrix Multiplication). Algorithmic parity is rigorously enforced across both layers.

4. **Workload Analyzer (Future):** 
   A lightweight pre-processing step that exclusively inspects the incoming data (e.g., array length, matrix dimensions) and passes this metadata forward. It does *not* make routing decisions.

5. **Runtime Selection Engine (WASWIT Core) (Future):** 
   Contains the decision logic. It consumes metadata from the Analyzer and uses empirical thresholds (determined during the separate Calibration Phase) to route the workload. It does *not* execute the workload.

6. **Benchmark & Calibration Engine (Future):** 
   A dedicated runner used to perform input sweeps, discover crossovers, and establish thresholds. This logic is strictly separated from the Evaluation Engine.

7. **Evaluation & Measurement Engine (Future):** 
   The runner used to test the frozen WASWIT logic against static baselines, utilizing the Browser Performance API to accurately record execution times and data-handling overhead.

8. **Visualization (Future):** 
   Consumes the raw metric data and plots comparative charts. It is entirely decoupled from the measurement process.

## Architectural Notes (Pending Pilot Experiments)
- **Threading:** Whether the Execution and Measurement layers reside on the main thread or within a Web Worker will be decided after pilot benchmarking, as Web Worker message-passing overhead may artificially inflate JS↔Wasm data-handling metrics.
