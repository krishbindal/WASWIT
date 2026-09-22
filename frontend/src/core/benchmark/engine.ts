import { 
  BenchmarkConfig, 
  BenchmarkExecutor, 
  BenchmarkRunResult, 
  BenchmarkSample 
} from './types';
import { calculateStats } from './stats';

/**
 * Validates the benchmark configuration constraints.
 * Throws an Error if configuration is invalid.
 */
function validateConfig(config: BenchmarkConfig): void {
  if (
    typeof config.warmupIterations !== 'number' || 
    !Number.isInteger(config.warmupIterations) || 
    config.warmupIterations < 0
  ) {
    throw new Error('warmupIterations must be a non-negative integer');
  }

  if (
    typeof config.measurementIterations !== 'number' ||
    !Number.isInteger(config.measurementIterations) ||
    config.measurementIterations <= 0
  ) {
    throw new Error('measurementIterations must be a positive integer');
  }
}

/**
 * Executes a benchmark against the provided executor and input.
 * Handles warmup phases, measurement phases, and high-resolution timing.
 * 
 * @param executor The function representing the workload to benchmark
 * @param input The input to provide to the executor
 * @param config Benchmark configuration (iterations, etc.)
 * @returns A BenchmarkRunResult containing raw samples and summary statistics, or an error.
 */
export async function runBenchmark<TInput, TResult>(
  executor: BenchmarkExecutor<TInput, TResult>,
  input: TInput,
  config: BenchmarkConfig
): Promise<BenchmarkRunResult> {
  try {
    validateConfig(config);

    // Warmup phase (executions are discarded)
    for (let i = 0; i < config.warmupIterations; i++) {
      await executor(input);
    }

    const samples: BenchmarkSample[] = [];

    // Measurement phase
    for (let i = 0; i < config.measurementIterations; i++) {
      const start = performance.now();
      await executor(input);
      const end = performance.now();

      const elapsedMs = end - start;

      // Validate timing result
      if (elapsedMs < 0 || Number.isNaN(elapsedMs) || !Number.isFinite(elapsedMs)) {
        throw new Error(`Invalid elapsed time generated during iteration ${i}: ${elapsedMs}ms`);
      }

      samples.push({
        iteration: i,
        elapsedMs
      });
    }

    const stats = calculateStats(samples);

    return {
      success: true,
      stats,
      samples,
      config
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : String(error),
      config
    };
  }
}
