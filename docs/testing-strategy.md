# Testing Strategy

Because WASWIT is a research-focused experimental framework, the testing strategy focuses heavily on algorithmic parity, measurement accuracy, and methodology enforcement.

## 1. Unit Testing
- **What:** Individual functions in both JS and Rust, as well as the Workload Analyzer and Selection Engine logic.
- **Verification:** Ensures that helper functions and routing logic behave exactly as configured by the established thresholds.

## 2. Integration / Algorithmic Parity Testing
- **What:** Comparing the output of the JS execution layer against the Wasm execution layer.
- **Verification:** Crucial for scientific integrity. For any given input, the JS algorithm and the Rust/Wasm algorithm *must* produce the exact same output. We utilize deterministic input generation (no pseudo-random numbers) to guarantee reliable, floating-point-perfect parity comparisons between environments. If they differ, the benchmark is mathematically invalid.

## 3. End-to-End (E2E) Testing
- **What:** Simulating a user configuring an experiment, running the calibration phase, freezing thresholds, and running the evaluation phase.
- **Verification:** Ensures the UI correctly triggers the separate engines without crossover state contamination.

## 4. Browser Compatibility Testing
- **What:** Running the framework across different browser engines (e.g., Chromium, Gecko, WebKit).
- **Verification:** Ensures that Wasm instantiation and the Performance API behave consistently, documenting any browser-specific performance anomalies.

## 5. Error & Failure Testing
- **What:** Providing extremely large inputs or malformed data.
- **Verification:** Ensures the application handles out-of-memory errors gracefully (especially WebAssembly memory allocation limits) without crashing the entire browser tab.

## 6. Performance Benchmarking & Reproducibility
- **What:** Running the same benchmark suite multiple times on the same machine using fixed-seed deterministic inputs.
- **Verification:** Ensures that the variance between runs is statistically manageable and that raw data preservation functions correctly.
