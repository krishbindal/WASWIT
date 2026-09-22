# Preliminary Architecture

WASWIT is designed as a modular, browser-based framework. The architecture strictly separates the UI, the selection logic, the execution layers, and the evaluation engines.

## Conceptual Flow

```text
User
  ↓
WASWIT Web Interface (Next.js/React)
  ↓
Workload Analyzer
  ↓
Runtime Selection Engine (The core WASWIT logic)
  ↓
  ├──→ JavaScript Execution Layer
  └──→ WebAssembly Execution Layer (Rust/wasm-pack)
  ↓
Performance Measurement Module
  ↓
Results Dashboard (Recharts)
```

## Logical Modules

1. **Frontend / UI:** 
   Provides the interface for the user to configure experiments, view calibration data, and execute final evaluations.
   
2. **Workload Analyzer:** 
   A lightweight pre-processing step that exclusively inspects the incoming data (e.g., array length, matrix dimensions) and passes this metadata forward. It does *not* make routing decisions.

3. **Runtime Selection Engine (WASWIT Core):** 
   Contains the decision logic. It consumes metadata from the Analyzer and uses empirical thresholds (determined during the separate Calibration Phase) to route the workload. It does *not* execute the workload.

4. **JavaScript / WebAssembly Execution Layers:** 
   Isolated layers that contain the actual algorithmic implementations.

5. **Benchmark & Calibration Engine:** 
   A dedicated runner used to perform input sweeps, discover crossovers, and establish thresholds. This logic is strictly separated from the Evaluation Engine.

6. **Evaluation & Measurement Engine:** 
   The runner used to test the frozen WASWIT logic against static baselines, utilizing the Browser Performance API to accurately record execution times and data-handling overhead.

7. **Visualization:** 
   Consumes the raw metric data and plots comparative charts. It is entirely decoupled from the measurement process.

## Architectural Notes (Pending Pilot Experiments)
- **Threading:** Whether the Execution and Measurement layers reside on the main thread or within a Web Worker will be decided after pilot benchmarking, as Web Worker message-passing overhead may artificially inflate JS↔Wasm data-handling metrics.
