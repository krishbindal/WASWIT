# Experimental Methodology

## Objective
To conduct a fair, reproducible comparison between JavaScript-only, WebAssembly-only, and WASWIT adaptive execution models.

## Execution Modes
For every workload and input size, the system will run in three distinct modes:
1. **Static JavaScript:** The task is executed entirely using the JavaScript implementation.
2. **Static WebAssembly:** The task is executed entirely using the Rust-compiled Wasm implementation.
3. **WASWIT Adaptive:** The WASWIT engine evaluates the input size and routes to either JS or Wasm based on pre-defined empirical thresholds.

## Testing Procedure
1. **Input Generation:** For a specific workload, generate input data deterministically (e.g., seeded random arrays or fixed-pattern matrices).
2. **Warm-up Phase:** Execute the function 5-10 times without recording metrics. This allows the JS engine to JIT-compile the code and the Wasm module to stabilize in memory.
3. **Measurement Phase:** Execute the function $N$ times (e.g., 50 iterations) for each mode.
4. **Data Collection:** Record the execution time for every iteration using `performance.now()`.
5. **Threshold Discovery (Calibration):** Before testing the Adaptive mode, an initial sweep of input sizes will be performed to identify the "crossover point" (the threshold where Wasm becomes faster than JS).

## Controlling Variables
- **Environment:** Tests will be run locally without other intensive applications running.
- **Browser:** The specific browser version (e.g., Chrome 120+) will be documented and kept consistent.
- **Data Integrity:** We will verify that both JS and Wasm implementations return the exact same output for the same input to ensure algorithmic parity.

## Reporting
Results will be preserved as raw JSON data and summarized using statistical measures (mean, median, standard deviation) to mitigate outliers caused by browser garbage collection.
