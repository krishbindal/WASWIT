export type BenchmarkExecutor<TInput, TResult> = (input: TInput) => TResult | Promise<TResult>;

export interface BenchmarkConfig {
  /** Optional descriptive label for the benchmark run */
  label?: string;
  /** Number of warmup iterations to execute before measuring */
  warmupIterations: number;
  /** Number of measured iterations to execute */
  measurementIterations: number;
}

export interface BenchmarkSample {
  /** The 0-based index of the measurement iteration */
  iteration: number;
  /** Elapsed time in milliseconds, measured with performance.now() */
  elapsedMs: number;
}

export interface BenchmarkStats {
  /** Total number of measured samples */
  count: number;
  /** Minimum elapsed time (ms) */
  min: number;
  /** Maximum elapsed time (ms) */
  max: number;
  /** Arithmetic mean of elapsed times (ms) */
  mean: number;
  /** Median of elapsed times (ms) */
  median: number;
}

export type BenchmarkRunResult = 
  | { success: true; stats: BenchmarkStats; samples: BenchmarkSample[]; config: BenchmarkConfig }
  | { success: false; error: Error | string; samples: BenchmarkSample[]; config: BenchmarkConfig };

