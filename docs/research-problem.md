# Research Problem

## Background
Modern web applications increasingly execute heavy computational workloads in the browser. Developers typically have two primary choices for high-performance execution: JavaScript (JS) and WebAssembly (Wasm).

## The Complexity of Performance
While WebAssembly is designed for near-native execution speed, academic literature indicates that it should not be assumed to be universally faster than JavaScript. JavaScript engines feature highly optimized Just-In-Time (JIT) compilers that can perform competitively for many workloads, particularly small or floating-point-heavy tasks (Herrera et al., "Understanding the Performance of WebAssembly Applications", ACM IMC 2021).

Furthermore, executing WebAssembly in a browser involves overhead. This overhead does not exclusively mean serialization/deserialization, but can arise from:
1. **Function-call boundary costs:** The overhead of transitioning execution context between JS and the Wasm sandbox.
2. **Data manipulation & copying:** The cost of copying data into and out of WebAssembly's linear memory when zero-copy representations (like SharedArrayBuffer) are unavailable or impractical.
3. **Allocation and instantiation:** The time required to initialize the module, compile it, and allocate linear memory.

For specific input sizes or workload profiles, the cumulative overhead of invoking WebAssembly may exceed the computational time saved, rendering a highly optimized JavaScript implementation faster end-to-end.

## The Proposed Solution Approach (WASWIT)
Currently, the decision to route a workload to JS or Wasm is generally made statically at compile time by the developer. 

WASWIT explores a PROPOSED browser-side, deterministic mechanism that selects between equivalent JavaScript and WebAssembly implementations at runtime. By utilizing measurable workload characteristics (such as input array length or matrix dimensions) and empirically validated decision boundaries, WASWIT aims to investigate whether dynamic routing can provide better overall efficiency than static selection.
