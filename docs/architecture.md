# Preliminary Architecture

WASWIT is designed as a modular, browser-based framework. The architecture separates the UI, the selection logic, and the execution layers.

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
   Provides the interface for the user to configure experiments (select workload, set input ranges, choose execution mode) and view results.
   
2. **Workload Analyzer:** 
   A lightweight pre-processing step that inspects the incoming data (e.g., array length, matrix dimensions) and passes this metadata to the selection engine.

3. **Runtime Selection Engine (WASWIT Core):** 
   Contains the decision logic. It uses empirical thresholds (determined during a calibration phase) to route the workload to the optimal environment.

4. **JavaScript Execution Layer:** 
   Contains the pure JS implementations of the benchmark algorithms.

5. **WebAssembly Execution Layer:** 
   Contains the WebAssembly module, compiled from Rust, and the JS glue code necessary to pass data across the boundary.

6. **Benchmark Engine & Measurement:** 
   A dedicated runner that manages iterations, warm-ups, and utilizes the Browser Performance API to accurately record execution times.

7. **Visualization:** 
   Consumes the raw metric data and plots comparative charts (e.g., JS vs Wasm execution times over varying input sizes).
