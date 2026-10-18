# WASWIT — Stage 2: Software Correctness, Architecture & Test Report

**Date:** 2026-10-18  
**Repository:** `https://github.com/krishbindal/WASWIT`  
**Git Commit Baseline:** `43100976d2dafa2e1a27d4ad208a50c6e1a5fba5`  
**Status:** Certified & Verified  

---

## 1. Overview and Scope

This document provides a comprehensive technical audit of the WASWIT software implementation across all layers:
- Algorithmic correctness and input validation of compute workloads (JavaScript and WebAssembly/Rust).
- Pure deterministic architecture of the workload feature analyzer and runtime selection engine.
- Developer SDK (`packages/waswit`) packaging, dual ESM/CJS distribution, and runtime type safety.
- Complete empirical test evidence from Rust unit tests, frontend Vitest suites, Next.js production compilation, and external consumer verification.

---

## 2. Workload Implementation & Algorithmic Audit

WASWIT benchmarks and dynamically routes three distinct compute workloads. Each workload is implemented in two independent runtime targets: **JavaScript (ES2022 / V8 JIT)** and **WebAssembly (Rust 2021 edition compiled via `wasm-bindgen`)**.

### 2.1 Matrix Multiplication (`matrix`)
- **Mathematical Specification:** Square matrix multiplication $C = A \times B$ where $A, B \in \mathbb{R}^{N \times N}$, with asymptotic complexity $O(N^3)$.
- **Memory Representation:** Flat 1D `Float32Array` of length $N^2$ in row-major order.
- **Source Files:**
  - JS: `frontend/src/core/workloads/matrix.ts` (`multiplyMatricesJS`)
  - Rust/WASM: `wasm/src/lib.rs` (`multiply_matrices`, `multiply_matrices_wasm`)
- **Guardrails & Edge-Case Handling:**
  - Both JS and Rust enforce strict dimension checks: `n < 0` triggers an explicit error (`"Matrix dimension cannot be negative."`).
  - Input buffer length validation: if `a.length !== n * n` or `b.length !== n * n`, both implementations throw/return `"Matrix dimensions do not match the provided N."`.
  - Deterministic test generator (`generateDeterministicMatrix`) uses an index-based linear formula `(i + offset) * 0.5` with exact IEEE-754 single-precision float representations to avoid floating-point drift in parity tests.

### 2.2 Merge Sort (`sort`)
- **Mathematical Specification:** Non-mutating stable merge sort operating on 32-bit signed integers with asymptotic complexity $O(N \log N)$.
- **Memory Representation:** `Int32Array` (JS) and `&[i32]` / `Vec<i32>` (Rust).
- **Source Files:**
  - JS: `frontend/src/core/workloads/sort.ts` (`mergeSortJS`)
  - Rust/WASM: `wasm/src/sort.rs` (`merge_sort_wasm`)
- **Guardrails & Edge-Case Handling:**
  - **Non-mutating guarantee:** The JS implementation copies the input buffer (`new Int32Array(input)`) before sorting; Rust creates an owned vector `input.to_vec()`. The caller's buffer is never mutated.
  - **No reliance on native engine sorting:** Neither implementation calls `Array.prototype.sort()` or Rust `slice::sort()`, guaranteeing identical $O(N \log N)$ recursion trees.
  - Verified edge cases:
    - Empty arrays ($N = 0$): returns empty array.
    - Single element ($N = 1$): returns single element unmodified.
    - All-identical and duplicate elements: stable order preserved.
    - Negative integers and zero crossings: correctly ordered from lowest to highest.
    - Reverse-sorted inputs: correctly ordered without stack overflow.

### 2.3 SHA-256 Cryptographic Hashing (`sha256`)
- **Mathematical Specification:** NIST FIPS 180-4 standard secure hash algorithm producing a 256-bit (32-byte) message digest.
- **Memory Representation:** `Uint8Array` (JS) and `&[u8]` (Rust), returning 32-byte byte arrays.
- **Source Files:**
  - JS: `frontend/src/core/workloads/sha256.ts` (`sha256JS`)
  - Rust/WASM: `wasm/src/sha256.rs` (`sha256_wasm`)
- **Guardrails & Edge-Case Handling:**
  - **Zero native cryptography dependencies:** Neither implementation uses `window.crypto.subtle` or third-party crates (like OpenSSL), isolating pure CPU compute characteristics.
  - **NIST FIPS 180-4 Test Vector Conformance:**
    - Empty message `""`: `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`
    - Standard vector `"abc"`: `ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad`
    - 448-bit and 512-bit message padding boundaries (tests crossing 55, 56, and 64 byte chunk boundaries).

---

## 3. Selection Engine & Architectural Determinism

The core selection pipeline translates arbitrary runtime requests into optimal execution targets with zero side effects:

$$\text{Workload Request} \xrightarrow{O(1)\text{ Feature Extraction}} \text{Characteristics} \xrightarrow{\text{Policy Evaluation}} \text{Runtime Target (JS / WASM)}$$

### 3.1 Feature Extraction Analyzer (`frontend/src/core/selection/analyzer.ts`)
- Pure function `analyzeWorkload(workloadId, inputSize)`.
- Input validation: checks `inputSize >= 0 && Number.isInteger(inputSize)`. Throws `"inputSize must be a non-negative integer"` if violated.
- Exhaustive compile-time switch (`TypeScript never check`) computing derived sizing metrics without inspecting or buffering actual data payloads.

### 3.2 Pure Deterministic Selector (`frontend/src/core/selection/selector.ts`)
- Pure function `selectRuntime(characteristics, policy)`.
- Evaluates against the frozen empirical policy rules.
- Contains no asynchronous promises, no network fetches, no timers, and no internal state mutations.
- Guaranteed $O(K)$ rule lookup time where $K$ is the number of calibrated size intervals (typically $K \le 5$).

### 3.3 Frozen Empirical Policy (`frontend/src/core/selection/frozen-policy.ts`)
- Certified policy version: `1.0.0-final`, rule `median-crossover-consistent-v2`.
- Calibrated crossover thresholds:
  - `matrix`: JS for $N \le 60$, WASM for $N > 60$.
  - `sort`: JS for $N \le 10000$, WASM for $N > 10000$.
  - `sha256`: JS for $N \le 1000$ bytes, WASM for $N > 1000$ bytes.

---

## 4. Standalone Developer SDK Audit (`packages/waswit/`)

The standalone SDK enables third-party web applications to leverage WASWIT's dynamic routing engine without coupling to the Next.js benchmark UI.

### 4.1 Package Architecture
- **Package Name:** `waswit`
- **Version:** `0.1.0`
- **Package Directory:** `packages/waswit/`
- **Distribution Files:**
  - `dist/index.mjs` (ESM module, 19.81 kB)
  - `dist/index.js` (CommonJS module, 20.90 kB)
  - `dist/index.d.ts` & `dist/index.d.mts` (TypeScript type declarations, 1.42 kB)
  - `dist/waswit_wasm_bg.wasm` (Compiled WebAssembly binary, 20.3 kB)
- **External Dependencies:** Zero runtime dependencies (`dependencies: {}`). Dev dependencies strictly isolated to `tsup` and `typescript`.

### 4.2 Public API (`waswitRun`)
- Universal asynchronous entrypoint:
  ```typescript
  export async function waswitRun<T extends WaswitRunOptions>(
    options: T
  ): Promise<WaswitRunResult<WaswitRunResultType<T>>>
  ```
- Strict runtime input typing:
  - `matrix`: requires `{ a: Float32Array, b: Float32Array, n: number }`.
  - `sort`: requires `Int32Array`.
  - `sha256`: requires `Uint8Array`.
- Returns execution telemetry including `runtime`, `inputSize`, `selectionOverheadMs`, `executionTimeMs`, and `policyVersion`.
- Optional preload utility `waswitPreload()` allowing developers to initialize WebAssembly during idle time.

---

## 5. Automated Verification Evidence

The entire codebase has been verified locally through comprehensive automated test suites:

### 5.1 Rust Test Suite
```bash
cargo test --manifest-path wasm/Cargo.toml
```
- **Result:** 13 passed, 0 failed, 0 ignored.
- **Coverage:** Matrix 2x2, mismatched dimensions, merge sort (empty, 1-element, 2-elements, sorted, reverse, duplicates, negative), SHA-256 (NIST empty, "abc", long vector, padding boundaries).

### 5.2 WASM Compilation
```bash
npm run build:wasm
```
- **Tool:** wasm-pack 0.15.0 / wasm-bindgen 0.2.100.
- **Result:** Success in 0.49s. Output generated in `frontend/src/wasm/`.

### 5.3 Vitest Frontend Unit & Integration Tests
```bash
npx vitest run
```
- **Result:** 18 test files passed, 142 tests passed, 0 failed (11.53s).
- **Test File Distribution:**
  - `src/core/workloads/matrix.test.ts` (5 tests)
  - `src/core/workloads/sort.test.ts` (15 tests)
  - `src/core/workloads/sha256.test.ts` (13 tests)
  - `src/core/selection/analyzer.test.ts` (5 tests)
  - `src/core/selection/selector.test.ts` (7 tests)
  - `src/core/selection/policy.test.ts` (5 tests)
  - `src/core/selection/integration.test.ts` (1 test)
  - `src/core/sdk/index.test.ts` (7 tests)
  - `src/core/calibration/calibrator.test.ts` (27 tests)
  - `src/core/evaluation/config.test.ts` (11 tests)
  - `src/core/evaluation/dispatch.test.ts` (2 tests)
  - `src/core/evaluation/engine.test.ts` (6 tests)
  - `src/core/evaluation/phase5e-preflight.test.ts` (4 tests)
  - `src/core/benchmark/engine.test.ts` (10 tests)
  - `src/core/benchmark/stats.test.ts` (7 tests)
  - `src/core/fixtures/policy.test.ts` (4 tests)
  - `src/components/dashboard/dashboard.test.tsx` (12 tests)
  - `src/app/page.test.tsx` (1 test)

### 5.4 Production Build Verification
```bash
npm run build
```
- **Framework:** Next.js 16.3.5 (Turbopack).
- **Result:** Compiled cleanly in 3.6s. TypeScript verification clean. All 9 static routes prerendered without errors.

### 5.5 Package Build & External Consumer Verification
- `packages/waswit`: `tsup` generates clean dual ESM/CJS bundles.
- Tarball: `waswit-0.1.0.tgz` packed successfully (17.7 kB).
- External Consumer (`consumer_test/vite_consumer`): Imports `waswit-0.1.0.tgz`, compiles via Vite 8.3.0, and executes all 3 workloads cleanly in headless Chrome.

---

## 6. Summary of Architectural Soundness

| Layer | Correctness Criteria | Verification Result |
| :--- | :--- | :--- |
| **Compute Kernels** | Strict boundary validation, non-mutating buffers, NIST standard compliance | **PASSED** |
| **Selection Engine** | $O(1)$ feature extraction, zero side-effects, deterministic policy resolution | **PASSED** |
| **Developer SDK** | Dual ESM/CJS, zero runtime dependencies, full TypeScript typing | **PASSED** |
| **Test Coverage** | 13 Rust tests, 142 Vitest tests, Next.js static build, consumer app | **PASSED** |
