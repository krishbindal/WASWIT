import { CalibrationConfig, CalibrationRecord, CalibrationResultPoint } from './types';
import { WorkloadPolicy, SelectionRule } from '../selection/types';
import { RuntimeType } from '../types';
import { runBenchmark } from '../benchmark/engine';

export type BenchmarkRunner = (inputSize: number, runtime: RuntimeType) => Promise<unknown> | unknown;

/**
 * Performs a calibration sweep using provided runner functions over explicit grid sizes.
 * Does NOT modify the live policy. It produces a generic CalibrationRecord.
 */
export async function runCalibrationSweep(
  config: CalibrationConfig,
  runner: BenchmarkRunner
): Promise<CalibrationRecord> {
  const results: CalibrationResultPoint[] = [];

  for (const size of config.gridSizes) {
    let jsStats = null;
    let jsError = undefined;
    const jsRes = await runBenchmark(
      async () => runner(size, 'javascript'),
      undefined,
      {
        label: `Calibrate ${config.workloadId} JS ${size}`,
        warmupIterations: config.warmupIterations,
        measurementIterations: config.measurementIterations
      }
    );
    
    if (jsRes.success) {
      jsStats = jsRes.stats;
    } else {
      jsError = String(jsRes.error);
    }

    let wasmStats = null;
    let wasmError = undefined;
    const wasmRes = await runBenchmark(
      async () => runner(size, 'wasm'),
      undefined,
      {
        label: `Calibrate ${config.workloadId} Wasm ${size}`,
        warmupIterations: config.warmupIterations,
        measurementIterations: config.measurementIterations
      }
    );

    if (wasmRes.success) {
      wasmStats = wasmRes.stats;
    } else {
      wasmError = String(wasmRes.error);
    }

    // Explicit conservative decision procedure based on median timings
    let preferred: 'javascript' | 'wasm' | 'tie' = 'tie';
    if (jsStats && wasmStats) {
      if (jsStats.median < wasmStats.median) {
        preferred = 'javascript';
      } else if (wasmStats.median < jsStats.median) {
        preferred = 'wasm';
      }
    } else if (jsStats && !wasmStats) {
      preferred = 'javascript';
    } else if (!jsStats && wasmStats) {
      preferred = 'wasm';
    }

    results.push({
      inputSize: size,
      jsStats,
      wasmStats,
      jsError,
      wasmError,
      preferredRuntime: preferred
    });
  }

  return {
    config,
    timestamp: new Date().toISOString(),
    results
  };
}

/**
 * Derives a deterministic WorkloadPolicy from a completed CalibrationRecord.
 * Unseen sizes default to the closest known boundary's state. 
 * Any size above the maximum transition size falls back to the final observed state.
 */
export function deriveWorkloadPolicy(record: CalibrationRecord): WorkloadPolicy {
  // Sort sizes ascending to ensure ordered boundaries
  const sortedResults = [...record.results].sort((a, b) => a.inputSize - b.inputSize);
  
  if (sortedResults.length === 0) {
    return {
      workloadId: record.config.workloadId,
      rules: [],
      defaultRuntime: 'javascript'
    };
  }

  const rules: SelectionRule[] = [];
  let currentRuntime: RuntimeType | null = null;
  let lastSize = -1;

  for (let i = 0; i < sortedResults.length; i++) {
    const pt = sortedResults[i];
    
    // Resolve ties deterministically (default to current state, or JS if initial)
    const winner: RuntimeType = pt.preferredRuntime === 'tie' 
      ? (currentRuntime || 'javascript') 
      : pt.preferredRuntime;

    if (currentRuntime === null) {
      currentRuntime = winner;
    } else if (winner !== currentRuntime) {
      // Transition detected
      rules.push({
        maxInputSize: lastSize,
        runtime: currentRuntime
      });
      currentRuntime = winner;
    }
    lastSize = pt.inputSize;
  }

  // The last observed runtime becomes the defaultRuntime (for everything beyond the last rule).
  return {
    workloadId: record.config.workloadId,
    rules,
    defaultRuntime: currentRuntime || 'javascript'
  };
}
