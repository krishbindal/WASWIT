# Metrics & Measurement Approach

## 1. Primary Metrics
- **Median Execution Time (ms):** The primary metric for cross-runtime comparison, calculated per workload per input size across the `measurementIterations` window. Median is prioritized because browser-based execution is highly susceptible to non-deterministic latency spikes caused by background garbage collection or JIT pauses.
- **Mean Execution Time (ms):** Retained as a secondary metric.
- **Min/Max Execution Time (ms):** Tracks the best and worst-case boundaries for variability analysis.

## 2. Timing Accuracy
- All execution durations are captured using `performance.now()`. Note that actual timer precision is subject to browser-level side-channel mitigations (e.g. timers are typically coarsened to 1ms-2ms resolution).
- The `elapsedMs` timing boundary strictly wraps the computational algorithm only.
- Input generation and equivalent cross-runtime representation preparation happen exactly once per evaluation case, entirely outside the measured timing window.

## 3. Warm-up Methodology
- **Calibration (Phase 3):** Discards `warmupIterations` before accumulating metric timings to allow JS JIT stabilization and Wasm memory allocation to settle.
- **Evaluation (Phase 4B):** Explicitly applies a warmed-execution model using identical `warmupIterations` exclusions. Initial sequential executions are tracked as `isWarmup` rather than being improperly classified as true, isolated "cold starts." No cold-start conclusions are made.
- Both warmup trials and measured trials use the same pre-prepared deterministic input arrays.

## 4. Derived & Analytical Metrics
- **Workload Parity:** Absolute bit-for-bit equality validation across JS and Wasm implementations for identical deterministic inputs.
- **Selection Overhead (ms):** Measured exclusively during Adaptive execution (Mode C), wrapping the Analyzer extraction and Selector rule evaluation prior to dispatching the actual algorithm.
- **Partial Failure Tracking:** The framework records distinct statuses such as `CompletedWithFailures` rather than fabricating zero elapsed times, ensuring bad data does not skew research statistics.