# Testing Strategy

Because WASWIT is a research-focused experimental framework, the testing strategy focuses heavily on algorithmic parity, measurement accuracy, and methodology enforcement.

## 1. Unit Testing
- **What:** Individual functions in both JS and Rust, as well as the Workload Analyzer and Selection Engine logic.
- **Verification:** Ensures that helper functions and routing logic behave exactly as configured by the established thresholds.

## 2. Integration / Algorithmic Parity Testing
- **What:** Comparing the output of the JS execution layer against the Wasm execution layer.
- **Verification:** Crucial for scientific integrity. For any given input, the JS algorithm and the Rust/Wasm algorithm *must* produce the exact same output. We utilize deterministic input generation (no pseudo-random numbers) to guarantee reliable, floating-point-perfect parity comparisons between environments. If they differ, the benchmark is mathematically invalid.
- **Strategy Note (Phase 1B Remediation):** We strictly prohibit "silent skips" in unit tests. Because Node/JSDOM environments lack native synchronous `fetch` required to seamlessly initialize WebAssembly, we removed the Wasm parity logic from Vitest. Instead, Playwright serves as the definitive JS/Wasm integration parity test, ensuring the Wasm module genuinely executes in a real browser context. Rust unit tests (`cargo test`) and JS unit tests (`vitest`) run independently to verify pure algorithmic correctness.

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
- **What:** Running the same benchmark suite multiple times on the same machine using deterministically generated inputs.
- **Verification:** Ensures that the variance between runs is statistically manageable and that raw data preservation functions correctly.
