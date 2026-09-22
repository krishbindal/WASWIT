# Performance Metrics

To rigorously evaluate the relative performance and the efficiency of the WASWIT adaptive approach, we will capture the following metrics using the standard Browser Performance API (`performance.now()`).

## Primary Metrics
1. **Total Execution Time (ms):** The end-to-end time taken from function invocation to result retrieval. This is the primary metric for comparing JS, Wasm, and WASWIT adaptive modes.
2. **Adaptive Mode Throughput:** Over a series of mixed workloads, the total time taken by the adaptive engine compared to static execution routes.

## Secondary Metrics
1. **JS↔Wasm Boundary Overhead (ms):** The time taken to serialize, transfer, and deserialize data between the JavaScript environment and WebAssembly linear memory. (Derived by subtracting raw computation time from total execution time where feasible).
2. **Initialization Time (ms):** The time taken to fetch, compile, and instantiate the WebAssembly module on initial load (cold start).
3. **Selection Engine Overhead (ms):** The time taken by the WASWIT logic to evaluate the workload characteristics and decide the execution route.

## Measurement Methodologies
- **Reliability:** Metrics must be averaged over multiple iterations to account for browser background tasks, garbage collection pauses, and OS-level interruptions.
- **Cold vs. Warm:** We must measure both "cold" executions (initial runs, tracking JIT compilation in JS and instantiation in Wasm) and "warm" executions (subsequent runs after the engine is optimized).
- **Environment Logging:** Results must record the browser version, operating system, and hardware tier to ensure reproducibility.
