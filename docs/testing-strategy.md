# Testing Strategy

Because WASWIT is a research-focused experimental framework, the testing strategy focuses heavily on algorithmic parity and measurement accuracy.

## 1. Unit Testing
- **What:** Individual functions in both JS and Rust.
- **Verification:** Ensures that helper functions, workload analyzers, and selection logic perform as expected.

## 2. Integration / Parity Testing
- **What:** Comparing the output of the JS execution layer against the Wasm execution layer.
- **Verification:** Crucial for scientific integrity. For any given input, the JS algorithm and the Rust/Wasm algorithm *must* produce the exact same output. If they differ, the benchmark is invalid.

## 3. End-to-End (E2E) Testing
- **What:** Simulating a user configuring an experiment, running it, and viewing results.
- **Verification:** Ensures the UI correctly triggers the benchmarking engine and visualizes the results without crashing.

## 4. Browser Compatibility Testing
- **What:** Running the framework across different browser engines (e.g., Chromium, Gecko, WebKit).
- **Verification:** Ensures that Wasm instantiation and the Performance API behave consistently, and documents any browser-specific performance anomalies.

## 5. Error & Failure Testing
- **What:** Providing extremely large inputs or malformed data.
- **Verification:** Ensures the application handles out-of-memory errors gracefully (especially WebAssembly memory limits) without crashing the entire browser tab.

## 6. Performance Benchmarking & Reproducibility
- **What:** Running the same benchmark suite multiple times on the same machine.
- **Verification:** Ensures that the variance between runs is statistically acceptable and that crossover thresholds remain relatively stable.
