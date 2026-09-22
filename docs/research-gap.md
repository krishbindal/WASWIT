# Preliminary Research Gap

## Context
Based on the literature reviewed so far, the performance trade-offs between JavaScript and WebAssembly are well-documented (Herrera et al., 2021; Macedo et al., 2022). Furthermore, adaptive execution is actively used in specialized domains, such as routing ML models to GPUs (e.g., TensorFlow.js) or offloading mobile tasks to the cloud.

## Provisional Research Gap
An area that appears less explored is the application of deterministic, workload-aware runtime selection for general-purpose computational tasks *entirely within the local browser CPU environment*.

While the community acknowledges that JS is better for small tasks and Wasm for large, compute-heavy tasks (due to initialization and memory-boundary overhead), developers currently must make a static, compile-time decision on which language to use.

Subject to further validation, there is an opportunity to investigate whether a lightweight, local selection engine-using empirically calibrated thresholds based on input size-can automatically route a workload to the more appropriate environment at runtime, achieving lower aggregate execution time than a static decision.

## WASWIT's Proposed Contribution
WASWIT proposes exploring this specific gap by building and evaluating a framework that dynamically routes general computational algorithms to either JS or Wasm using measured thresholds. This is a proposed exploration, and the validity of this approach remains to be tested in the planned experiments.
