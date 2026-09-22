# WASWIT Benchmarking Engine

The Benchmarking Engine (`frontend/src/core/benchmark/`) provides a highly controlled, statistically valid measurement harness for executing and timing computational workloads.

## Core Responsibilities

The engine's sole purpose is to exactly measure the provided executor block.
It **does not**:
- Implement calibration logic
- Implement adaptive selection rules
- Make any JS vs. Wasm performance claims
- Perform automatic UI rendering

### The Executor Abstraction

Executors are defined as a contract taking a predefined generic input and producing a synchronous or asynchronous result. 

```typescript
export type BenchmarkExecutor<TInput, TResult> = (input: TInput) => TResult | Promise<TResult>;
```

The engine abstracts whether the workload is running JavaScript or Rust/WebAssembly. It handles synchronous and asynchronous returns uniformly.

## Measurement and Timing

- **High-Resolution Timing:** The engine strictly utilizes the browser's `performance.now()` for sub-millisecond precision.
- **Overhead Discipline:** Any data copying (e.g., passing TypedArrays to WebAssembly) required within the executor's boundary is purposefully included in the timing. We do not artificially subtract guessed execution overhead. This ensures the benchmark measures the true end-to-end impact of using the runtime.
- **Timing Validation:** Any negative, `NaN`, or `Infinity` elapsed time values are explicitly rejected and flagged as failed benchmarks. They are not silently suppressed.

## Execution Phases

### Warmup

To avoid artifacts caused by JIT compilation (JavaScript engine warming) or WebAssembly instantiation caches, the engine runs a configurable number of **warmup iterations**.

Warmup execution outputs and timings are immediately discarded and do not pollute the raw sample array.

### Measurement and Representation

After warmup, the engine runs the configured **measurement iterations**.

Each iteration's timing is saved as a raw `BenchmarkSample`, representing the `iteration` index and `elapsedMs`. Raw samples are explicitly preserved within the result object (`BenchmarkRunResult`) so that future detailed statistical analysis or visualization can be performed without losing granularity.

## Summary Statistics

The engine calculates core summary statistics deterministically without mutating the original raw data arrays.

- `count`: Total measured iterations.
- `min`: Fastest iteration.
- `max`: Slowest iteration.
- `mean`: Arithmetic mean.
- `median`: Deterministic median. If the sample count is even, the engine explicitly calculates the exact average of the two middle values.

## Error Handling

If an executor throws an error, or if timing boundaries produce invalid values, the benchmark immediately halts and yields a failed result (`{ success: false, error: ... }`). It avoids polluting the UI with partial or corrupted datasets.
