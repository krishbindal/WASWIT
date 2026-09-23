# Testing Strategy

Given the strict requirement for algorithmic parity, determinism, and research integrity, the testing strategy covers multiple layers.

## 1. Unit Testing (Vitest)
Unit tests operate in a simulated Node.js/JSDOM environment.
- **Goal:** Verify logic components independent of the browser.
- **Coverage:**
  - `analyzer`, `selector`, `calibrator` and `engine` logic.
  - Verification that the `calibrator` rejects noisy data and adheres strictly to crossover rules.
  - Proof that the evaluation `engine` maintains immutable snapshots of the `FrozenSelectionPolicy` and blocks configuration overlaps.
  - Direct execution mock validations confirming the exact single-path invocation of Adaptive dispatch without conflating global calls.
  - Independent JS algorithms ensuring baseline deterministic output.
  - Statistics module checking for mathematical invariants.

## 2. WebAssembly Core Testing (Cargo Test)
Rust unit tests compiled natively (not Wasm).
- **Goal:** Verify that the core algorithms in Rust behave correctly before being compiled to WebAssembly.
- **Coverage:** Native matrix multiplication, merge sort, and SHA-256 logic.

## 3. End-to-End Parity & Smoke Testing (Playwright)
Integration tests running in a real headless browser.
- **Goal:** Prove that the compiled WebAssembly and the JavaScript implementations produce *exactly identical* outputs when given identical deterministic inputs in a real browser environment.
- **Coverage:**
  - `parity.spec.ts`: Executes across all workload types across sample bounds.
  - `selector.spec.ts`: End-to-end validation of the runtime selector routing against an immutable fixture.
  - `dashboard.spec.ts`: Validates that empty state UI elements render and function as expected before experimental data collection begins.

## 4. Continuous Integration / Static Auditing (CLI Pipeline)
Scripts enforce architectural integrity directly via Git checks.
- **Goal:** Maintain zero drift between Phase structures.
- **Coverage:**
  - Banning of `Math.random` usage across the repository.
  - Banning of the native `Array.prototype.sort` to preserve standard sorting comparisons.
  - Pre-commit verifications confirming `npm run build:wasm` and `next build` compile successfully.
