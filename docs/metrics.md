# Performance Metrics

To evaluate WASWIT's methodology rigorously, we separate our metrics into Primary and Secondary categories. All time-based metrics will be measured using the high-resolution Browser Performance API (`performance.now()`).

## Primary Metrics

1. **Total Execution Time (ms)**
   - *What it means:* The end-to-end wall-clock time from the moment the user/system requests the computation to the moment the final result is returned to the main JS thread.
   - *Why it matters:* This is the ultimate metric for user experience.
   - *How it is measured:* `performance.now()` logged immediately before invocation and immediately after the result is returned.

2. **Adaptive-Mode Effectiveness**
   - *What it means:* The overall execution time of a mixed suite of tasks running through the WASWIT adaptive engine compared against the total execution time of the same suite running exclusively on JS or exclusively on Wasm.
   - *Why it matters:* This directly answers whether adaptive routing provides an aggregate benefit.
   - *How it is measured:* Summing the Total Execution Time of $N$ varying workloads in each mode.

## Secondary Metrics

1. **JS↔Wasm Data-Handling Overhead (ms)**
   - *What it means:* The time required to convert JS types, allocate memory, copy data into Wasm linear memory, and read the result back.
   - *Why it matters:* Understanding this overhead is critical for explaining *why* a crossover threshold exists.
   - *How it is measured:* By comparing the end-to-end execution time against internal timing mechanisms placed exclusively around the raw Rust computation, subtracting the latter from the former.

2. **Selection Overhead (ms)**
   - *What it means:* The time taken by the WASWIT engine to evaluate input characteristics and execute the deterministic routing logic using the frozen policy.
   - *Why it matters:* If the routing logic is too slow, it negates the benefit of adaptive execution. This metric is strictly separate from the workload execution time itself.
   - *How it is measured:* Timing the Workload Analyzer and Runtime Selector sequence independently before the execution layer is invoked.

3. **Initialization/Instantiation Overhead (ms)**
   - *What it means:* The cost of fetching, validating, and compiling the Wasm module upon first load.
   - *Why it matters:* This cost is incurred once (cold start). It is vital to separate cold starts from warm executions.
   - *How it is measured:* Timing the module instantiation API calls.
