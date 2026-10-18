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

## Runtime Environment & Limitations

- **Designed for Browser Bundlers**: WASWIT is designed for modern frontend build tools and bundlers (including Vite, Webpack 5, Next.js, Rollup, and Parcel). The WebAssembly module is loaded via standard asset patterns (`new URL('waswit_wasm_bg.wasm', import.meta.url)`).
- **Unbundled Node.js Execution Not Supported Out-of-the-Box**: Direct execution in standalone, unbundled Node.js without a bundler is not supported out-of-the-box because Node.js does not support `fetch()` on `file://` URLs in native ESM and does not define `import.meta.url` in unbundled CommonJS. Server-side or standalone Node.js environments require custom Wasm initialization or bundling.
- **Empirical Policy**: The selection engine utilizes a frozen empirical policy calibrated on Google Chrome (Blink/Chromium 138) on a dedicated host. It is deterministic and threshold-based, but not guaranteed to be universally optimal across all hardware architectures, devices, or non-Chromium browsers.
