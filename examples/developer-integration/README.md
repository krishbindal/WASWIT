# WASWIT Developer Integration Example

This directory contains a standalone example of how to integrate the **WASWIT** (Workload-Aware Intelligent Selection between JavaScript and WebAssembly) SDK into your application.

## 1. What WASWIT is
WASWIT is an empirically-driven runtime selection layer. It routes supported computational workloads to either JavaScript or WebAssembly execution engines based on input size, aiming for improved performance without developer intervention.

## 2. What problem it solves
Depending on input size and browser engine, JavaScript can sometimes outperform WebAssembly due to WASM's memory-boundary transfer costs and JIT optimization profiles. WASWIT eliminates the need to manually guess or benchmark the crossover point in production.

## 3. Supported workloads
- **Matrix Multiplication** (CPU/Memory bound)
- **Merge Sort** (Algorithm bound)
- **SHA-256** (Cryptographic bound)

## 4. How selection works
WASWIT uses a **frozen empirical policy** derived from controlled Phase 5 evaluation environments. 
It analyzes the workload characteristics (e.g., input size) deterministically in O(1) time and applies the policy.
It does **NOT** use machine learning, neural networks, or run-time benchmarking to make its decisions.

## 5. How to call the SDK
Use the unified `waswitRun` API:

```typescript
import { waswitRun } from 'waswit';
// Or within the monorepo: import { waswitRun } from '../../frontend/src/core/sdk';

const result = await waswitRun({
    workload: 'sort',
    input: new Int32Array([5, 3, 4, 1, 2])
});
```

## 6. What the returned result means
The SDK returns structured metadata alongside your result:
- `result`: The computed output (e.g., sorted array).
- `runtime`: Which engine was actually chosen (`"javascript"` or `"wasm"`).
- `selectionOverheadMs`: The exact O(1) time spent making the decision (excluding WASM init and actual execution).
- `executionTimeMs`: Time spent executing the workload.
- `policyVersion`: The frozen policy version applied (`1.0.0-final`).

## 7. Important Limitation
The included policy (`1.0.0-final`) is an **empirical frozen policy** calibrated for a specific evaluation environment (Blink/Chromium 138). It is **not universally optimal** across all hardware architectures or browsers. Developers deploying to production should treat this as a research-grade deterministic router rather than a guaranteed global maximum.
