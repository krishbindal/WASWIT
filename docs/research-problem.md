# Research Problem

## Background
Modern web applications increasingly execute heavy computational workloads in the browser (e.g., image processing, cryptography, simulations). Developers typically have two choices for execution: JavaScript (JS) and WebAssembly (Wasm).

## The Misconception
There is a prevailing assumption in the web development community that WebAssembly is universally faster than JavaScript. While WebAssembly offers near-native performance for many compute-heavy tasks due to its compiled nature and predictable execution model, it is not a silver bullet. 

## The Problem
JavaScript's Just-In-Time (JIT) compilers have become highly optimized, making JS competitive for many tasks. Conversely, WebAssembly introduces specific overheads:
1. **Bridge Overhead:** Passing data between the JavaScript environment and the WebAssembly sandbox requires serialization, deserialization, or shared memory manipulation.
2. **Initialization Overhead:** Loading, parsing, and instantiating Wasm modules takes time.

For smaller input sizes or specific types of algorithms (e.g., heavily DOM-dependent or dynamically typed data manipulation), the overhead of crossing the JS-Wasm boundary can exceed the computational time saved by WebAssembly. Therefore, statically compiling everything to WebAssembly or exclusively relying on JavaScript can lead to suboptimal performance.

## The Proposed Solution (WASWIT)
There is a need to investigate whether performance can be improved by introducing a workload-aware runtime selection mechanism. Instead of a static decision at compile time, WASWIT proposes a dynamic decision at runtime, routing tasks to either JS or Wasm depending on measurable characteristics like input size and computational complexity.
