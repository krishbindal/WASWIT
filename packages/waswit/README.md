# WASWIT Developer SDK

**Workload-Aware Intelligent Selection between JavaScript and WebAssembly**

WASWIT is a deterministic, browser-oriented JavaScript and WebAssembly runtime-selection toolkit. It dynamically selects the optimal execution engine (JavaScript or WebAssembly) for supported computational workloads based on a frozen, empirically calibrated threshold policy.

## Features

- **Deterministic Selection**: Decides between native JavaScript and WebAssembly based on workload size thresholds, incurring sub-millisecond selection overhead without Machine Learning runtime costs.
- **Preload Support**: Exposes `waswitPreload()` to asynchronously fetch and compile WebAssembly modules ahead of execution, avoiding cold-start latency.
- **Zero Configuration**: Fully embedded empirical threshold engine ready out of the box.
- **Full TypeScript Support**: Precise type inference for inputs and results across all supported workloads.
- **Supported Workloads**:
  - `matrix`: Square matrix multiplication (\(O(n^3)\)) with `Float32Array`.
  - `sort`: Merge sort (\(O(n \log n)\)) with `Int32Array`.
  - `sha256`: Cryptographic hashing with `Uint8Array`.

## Installation

```bash
npm install waswit
```

*(Note: Prior to public npm registry publication, install directly from the packaged tarball: `npm install ./waswit-0.1.0.tgz`)*

## Quick Start

### 1. Basic Execution

```typescript
import { waswitRun } from "waswit";

// 1. Sort workload (Int32Array)
const sortData = new Int32Array([42, 3, 17, -5, 0, 99, -5]);
const sortResult = await waswitRun({
  workload: "sort",
  input: sortData,
});

console.log(sortResult.runtime);           // "wasm" or "javascript"
console.log(sortResult.result);            // Int32Array [-5, -5, 0, 3, 17, 42, 99]
console.log(sortResult.executionTimeMs);   // Execution duration in milliseconds
console.log(sortResult.selectionOverheadMs);// Policy selection overhead in milliseconds

// 2. Matrix multiplication (n x n Float32Array)
const n = 2;
const a = new Float32Array([1, 2, 3, 4]); // [[1, 2], [3, 4]]
const b = new Float32Array([2, 0, 1, 2]); // [[2, 0], [1, 2]]
const matrixResult = await waswitRun({
  workload: "matrix",
  input: { a, b, n },
});
console.log(matrixResult.result);          // Float32Array [4, 4, 10, 8]

// 3. SHA-256 cryptographic hashing (Uint8Array)
const message = new TextEncoder().encode("Hello, WASWIT!");
const hashResult = await waswitRun({
  workload: "sha256",
  input: message,
});
console.log(hashResult.result);            // Uint8Array(32) digest
```

### 2. Eliminating Cold-Start Latency with `waswitPreload()`

WebAssembly modules are lazily compiled upon the first workload that routes to WebAssembly. To eliminate first-invocation compilation latency during time-sensitive tasks, call `waswitPreload()` during application bootstrapping or route initialization:

```typescript
import { waswitPreload, waswitRun } from "waswit";

// Call during app startup, splash screen, or route transition
await waswitPreload();

// Subsequent waswitRun() calls execute immediately without compilation delay
```

## Result Structure

Every call to `waswitRun` returns a typed `WaswitRunResult<T>`:

| Field | Type | Description |
| :--- | :--- | :--- |
| `result` | `T` (`Float32Array` \| `Int32Array` \| `Uint8Array`) | Output typed array from the selected execution engine. |
| `workload` | `"matrix"` \| `"sort"` \| `"sha256"` | Identifier of the executed workload. |
| `runtime` | `"wasm"` \| `"javascript"` | Runtime selected by the empirical policy. |
| `inputSize` | `number` | Workload input scale (\(n\) for matrix, element count for sort, byte length for sha256). |
| `executionTimeMs` | `number` | Pure compute duration measured via `performance.now()`. |
| `selectionOverheadMs` | `number` | Time taken to evaluate the threshold policy and select the runtime. |
| `policyVersion` | `string` | Version of the active frozen decision policy (e.g. `"1.0.0-final"`). |
| `policyDerivationRule`| `string` | Provenance summary of the policy calibration. |

## Exported TypeScript Types

The package exports all relevant interfaces for strict type checking:

```typescript
import type {
  WaswitWorkload,
  MatrixInput,
  MatrixOptions,
  SortOptions,
  Sha256Options,
  WaswitRunOptions,
  WaswitRunResult,
  RuntimeType,
} from "waswit";
```

## Runtime Environment & Limitations

- **Designed for Browser Bundlers**: WASWIT is designed for modern frontend bundlers (such as Vite, Webpack 5, Next.js, Rollup, and Parcel). The WebAssembly asset is imported using standard ECMAScript asset patterns (`new URL('waswit_wasm_bg.wasm', import.meta.url)`), which browser bundlers automatically resolve into hashed assets and serve via HTTP.
- **Unbundled Node.js Limitations**: Direct execution in standalone, unbundled Node.js without a bundler is not supported out-of-the-box for WebAssembly routes. Node's native `fetch()` implementation does not support `file://` URLs, and unbundled CommonJS lacks native `import.meta.url`. Pure JavaScript routes (e.g. smaller inputs where JavaScript is faster) will execute cleanly in Node.js, but full dual-runtime execution requires a bundler or browser environment.
- **Empirical Policy Characteristics**: The runtime selection policy is deterministic and threshold-based, derived from extensive Phase 5 and Phase 6 empirical benchmarking on Blink/V8 (Chromium 138) on dedicated host hardware. The policy is not machine-learning-based and does not adapt online. While it reliably avoids suboptimal runtimes under standard browser workloads, exact performance cross-over boundaries may vary across non-Chromium engines (e.g., Safari JavaScriptCore or Firefox SpiderMonkey) and distinct CPU microarchitectures.

## License

MIT © 2026 Krish Bindal and WASWIT Contributors. See [LICENSE](LICENSE) for details.
