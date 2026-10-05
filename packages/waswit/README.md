# WASWIT Developer SDK

**Workload-Aware Intelligent Selection between JavaScript and WebAssembly**

WASWIT is a deterministic, browser-oriented JavaScript/WebAssembly runtime-selection toolkit. It intelligently routes supported computational workloads to the optimal runtime (JavaScript or WebAssembly) based on a frozen empirical policy.

## Features
- **Deterministic Routing**: Selects execution paths based on workload size thresholds, without Machine Learning overhead.
- **Zero Configuration**: Fully embedded empirical threshold engine out-of-the-box.
- **Supported Workloads**: `matrix` (Float32Array multiplication), `sort` (Int32Array Merge Sort), `sha256` (Uint8Array hashing).

## Installation

**Planned public installation after npm publication:**
```bash
npm install waswit
```

## Usage

```typescript
import { waswitRun } from "waswit";

const data = new Int32Array([4, 1, 3, 2, 5]);

const result = await waswitRun({
  workload: "sort",
  input: data
});

console.log(result.runtime); // e.g., "wasm" or "javascript"
console.log(result.result);  // Int32Array(5) [1, 2, 3, 4, 5]
console.log(result.executionTimeMs); // Execution time measured in ms
```

## Limitations

- **Browser-Oriented**: WASWIT bindings use `import.meta.url` native to Webpack/Vite/ESM bundlers. Direct usage in unbundled Node.js CommonJS environments will require manual polyfilling or ESM execution.
- **Empirical Policy**: The selection engine uses a frozen policy derived from Blink/Chromium 138. It is not guaranteed universally optimal for all hardware or Node.js environments.
