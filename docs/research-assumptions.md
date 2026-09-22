# Research Assumptions

This document clearly lists the assumptions that form the basis of the WASWIT project design. These assumptions will be rigorously verified (or disproved) during the Experimental Calibration and Evaluation phases.

## 1. Boundary Overhead is Non-Trivial
**Assumption:** The time taken to transition from JavaScript to WebAssembly, including function-call boundary costs, data type conversion, and copying data into linear memory, is significant enough to make Wasm slower than JS for very small inputs.
**Verification:** We will measure JS↔Wasm data-handling overhead to determine its exact magnitude.

## 2. Threshold Stability
**Assumption:** There is a stable and identifiable "crossover point" (e.g., array size N) for specific algorithms where Wasm's computational speed overtakes the JS↔Wasm boundary overhead.
**Verification:** The Calibration Phase will sweep input sizes to locate these crossovers. If the crossover is highly volatile, this assumption is false.

## 3. JS JIT Effectiveness
**Assumption:** JavaScript's Just-In-Time (JIT) compilation will make "warm" JS executions significantly faster than "cold" JS executions, closing the gap with WebAssembly on certain workloads.
**Verification:** Experimental methodology strictly separates and measures cold vs. warm executions.

## 4. Measurement Precision
**Assumption:** The Browser Performance API (`performance.now()`) provides sufficient resolution (sub-millisecond) to accurately capture execution times and selection overhead.
**Verification:** If variance/standard deviation remains exceptionally high across all tests, it may indicate that background OS/Browser noise is drowning out the signal.
