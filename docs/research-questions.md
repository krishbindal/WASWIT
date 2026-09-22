# Research Questions

The primary goal of WASWIT is to evaluate the effectiveness of workload-aware execution selection. To guide the methodology and experiments, this project will answer the following research questions:

## RQ1
**How does the relative performance of JavaScript and WebAssembly vary across different computational workloads and input sizes?**
*Purpose:* To empirically determine the performance cross-over points where WebAssembly becomes more efficient than JavaScript (and vice-versa) for specific algorithms, accounting for boundary overhead.

## RQ2
**Which measurable workload characteristics are useful for selecting between JavaScript and WebAssembly?**
*Purpose:* To identify deterministic variables (e.g., array length, byte size, matrix dimensions) that can be reliably measured in the browser at runtime with minimal latency to inform the selection engine.

## RQ3
**Can workload-aware runtime selection provide better overall execution efficiency than always selecting JavaScript or always selecting WebAssembly?**
*Purpose:* To evaluate the proposed WASWIT architecture. We will compare the total execution time of the adaptive system against static JS-only and static Wasm-only baselines.
