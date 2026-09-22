# Research Gap Analysis

## Overview of Existing Work
From our review of prior art and literature:
1. Extensive benchmarking exists comparing JavaScript and WebAssembly statically.
2. The overhead of the JS-Wasm boundary (memory transfer and serialization) is widely acknowledged in academia.
3. Adaptive routing exists in the browser, primarily for Machine Learning tasks (routing between CPU/Wasm and GPU/WebGL) or Edge/Cloud offloading.

## Preliminary Research Gap — Requires Further Validation
While developers intuitively know to use JavaScript for small, DOM-heavy tasks and WebAssembly for heavy computations, this decision is almost exclusively made at **compile-time**. A developer hardcodes the application to call either the JS function or the Wasm function.

**The Gap:** There is a lack of general-purpose, browser-side frameworks that make deterministic, **runtime** decisions to select between identical JavaScript and WebAssembly implementations based on the immediate input size and empirical crossover thresholds. 

Most research asks: *"Which is faster, JS or Wasm?"*
This project asks: *"Given an arbitrary input at runtime, can the system automatically route to the faster environment to optimize overall application efficiency?"*

By focusing on deterministic thresholding rather than complex ML, WASWIT aims to explore this specific execution-routing gap entirely within the local browser sandbox.
