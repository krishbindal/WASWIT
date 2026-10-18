# WASWIT — Workload-Aware Intelligent Selection between JavaScript and WebAssembly

## Problem Statement
Web developers face uncertainty when deciding whether to execute computational workloads in JavaScript or WebAssembly (WASM). While WebAssembly is often assumed to be universally faster, the overhead of crossing the JS-WASM boundary, memory allocation, and varying input sizes can sometimes make JavaScript execution more performant for specific or small-scale workloads.

## Motivation & Research Gap
Currently, developers must manually benchmark and hardcode runtime selection logic for every new feature or workload. There is a lack of deterministic, empirically-backed frameworks that can automatically and transparently route workloads to the most performant runtime in the browser context without introducing heavy dynamic profiling overhead.

## Proposed Solution
WASWIT provides an "intelligent" (deterministic, workload-aware, and threshold-based) runtime selection engine. It evaluates workload characteristics—specifically the workload type and input size—and routes execution to either JavaScript or WebAssembly using a frozen empirical policy derived from rigorous benchmarking. 

## Objectives
- Empirically compare the performance of JS vs WASM across distinct computational workloads.
- Derive a deterministic runtime selection policy based on execution thresholds and selection overhead.
- Independently evaluate the validity of the derived policy using statistically rigorous paired non-parametric testing.
- Deliver an accessible Developer SDK that applies this frozen policy natively in browser-based applications.

## Contributions

### Research Contribution
- A rigorous empirical runtime comparison identifying cross-over points between JS and WASM performance.
- A frozen empirical policy generated through disciplined calibration (Phase 5C).
- An independent statistical evaluation (Phase 5E & 5F) proving that adaptive selection prevents significant performance degradation under worst-case scenarios, applying Holm–Bonferroni adjusted paired sign-permutation testing.

### Engineering Contribution
- A developer-facing SDK (waswitRun()) enabling zero-configuration runtime selection.
- A packaged library (waswit-0.1.0.tgz) optimized for modern ESM/Vite browser applications.
- An interactive Developer Playground for real-world demonstration and integration testing.

## Supported Workloads
1. **Matrix Multiplication** (matrix): Float32Array matrix multiplication.
2. **Merge Sort** (sort): Int32Array sorting algorithm.
3. **SHA-256** (sha256): Uint8Array cryptographic hashing.

## Technology Stack
- **Languages**: TypeScript, Rust, WebAssembly, JavaScript
- **Frameworks**: Next.js (Research UI), Vite (Consumer Validation)
- **Tooling**: Playwright, Vitest, wasm-pack, tsup

## Current Limitations
- The selection policy is strictly environment-specific (calibrated against Blink/Chromium 138) and is not guaranteed universally optimal for all possible hardware or mobile architectures.
- The SDK utilizes Web-Target WebAssembly bindings (import.meta.url), which may cause execution limitations in unbundled Node.js CommonJS backend environments.
- Only three specific computational workload families are currently supported.

## Future Work
- Dynamic, on-device recalibration to adapt the empirical policy to unique user hardware.
- Expanded support for diverse workload families (e.g., image processing, machine learning inference).
- Further adaptation of WASM instantiation bindings for broader Node.js and Edge/Serverless environments.
