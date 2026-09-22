# Research Questions

The primary goal of WASWIT is to evaluate the effectiveness of workload-aware execution selection. The project is guided by the following objective research questions:

## RQ1
**How does the relative performance of JavaScript and WebAssembly vary across selected computational workloads and input sizes?**
*Context:* This requires empirically documenting the execution times of both languages, specifically accounting for JS JIT optimizations and the JS↔Wasm data-handling boundary overhead.

## RQ2
**Which measurable workload characteristics are useful for dynamically selecting between JavaScript and WebAssembly?**
*Context:* We must identify variables (such as array length, buffer byte size, or matrix dimensions) that can be measured at runtime with negligible latency to serve as inputs for a decision threshold.

## RQ3
**Can a workload-aware runtime-selection mechanism achieve competitive or improved overall performance relative to always using JavaScript or always using WebAssembly?**
*Context:* This question evaluates the proposed WASWIT architecture. It asks whether the overhead of the selection logic combined with the chosen thresholds actually results in a measurable, aggregate efficiency gain.
