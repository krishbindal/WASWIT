import { CalibrationConfig, CalibrationRecord, CalibrationResultPoint } from './types';
import { WorkloadPolicy, SelectionRule } from '../selection/types';
import { RuntimeType } from '../types';
import { runBenchmark } from '../benchmark/engine';
import { BenchmarkStats } from '../benchmark/types';

export type BenchmarkRunner = (inputSize: number, runtime: RuntimeType) => Promise<unknown> | unknown;

export const DERIVATION_RULE_VERSION = 'median-crossover-consistent-v2';

/**
 * Validates the calibration configuration constraints deterministically.
 */
export function validateCalibrationConfig(config: CalibrationConfig): void {
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

  if (!Array.isArray(config.gridSizes) || config.gridSizes.length === 0) {
    throw new Error('gridSizes must be a non-empty array');
  }

  let lastSize = -1;
  for (const size of config.gridSizes) {
    if (typeof size !== 'number' || !Number.isInteger(size) || size < 0 || !Number.isFinite(size)) {
      throw new Error(`Invalid grid size: ${size}. Must be a non-negative finite integer.`);
    }
    if (size <= lastSize) {
      throw new Error(`gridSizes must be strictly ascending and unique. Found ${size} after ${lastSize}`);
    }
    lastSize = size;
  }
}

/**
 * Performs a calibration sweep using provided runner functions over explicit grid sizes.
 * Does NOT modify the live policy. It produces a generic CalibrationRecord.
 */
export async function runCalibrationSweep(
  config: CalibrationConfig,
  runner: BenchmarkRunner
): Promise<CalibrationRecord> {
  validateCalibrationConfig(config);
  
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
 * Derives the preferred runtime purely based on deterministic measurements.
 * JS median < Wasm median -> javascript
 * Wasm median < JS median -> wasm
 * Equal -> tie
 */
export function derivePreferredRuntime(jsStats: BenchmarkStats, wasmStats: BenchmarkStats): RuntimeType | 'tie' {
  if (jsStats.median < wasmStats.median) {
    return 'javascript';
  } else if (wasmStats.median < jsStats.median) {
    return 'wasm';
  }
  return 'tie';
}

function validateBenchmarkStats(stats: BenchmarkStats, label: string): void {
  if (typeof stats.count !== 'number' || !Number.isInteger(stats.count) || stats.count <= 0) {
    throw new Error(`Invalid count in ${label}: must be a positive integer, got ${stats.count}`);
  }
  
  const validateMetric = (name: string, value: number) => {
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
      throw new Error(`Invalid ${name} in ${label}: must be a non-negative finite number, got ${value}`);
    }
  };

  validateMetric('min', stats.min);
  validateMetric('max', stats.max);
  validateMetric('mean', stats.mean);
  validateMetric('median', stats.median);
  
  if (stats.min > stats.max) {
    throw new Error(`Invalid stats in ${label}: min (${stats.min}) cannot be greater than max (${stats.max})`);
  }
  
  if (stats.mean < stats.min || stats.mean > stats.max) {
    throw new Error(`Invalid stats in ${label}: mean (${stats.mean}) must be between min (${stats.min}) and max (${stats.max})`);
  }

  if (stats.median < stats.min || stats.median > stats.max) {
    throw new Error(`Invalid stats in ${label}: median (${stats.median}) must be between min (${stats.min}) and max (${stats.max})`);
  }
}

/**
 * Strictly validates that a CalibrationRecord is completely consistent with its configuration.
 */
export function validateCalibrationRecord(record: CalibrationRecord): void {
  validateCalibrationConfig(record.config);

  if (record.results.length !== record.config.gridSizes.length) {
    throw new Error(`Calibration record result length (${record.results.length}) does not match gridSizes length (${record.config.gridSizes.length})`);
  }

  for (let i = 0; i < record.results.length; i++) {
    const pt = record.results[i];
    const expectedSize = record.config.gridSizes[i];

    if (pt.inputSize !== expectedSize) {
      throw new Error(`Calibration record size mismatch at index ${i}. Expected ${expectedSize}, got ${pt.inputSize}`);
    }

    if (!pt.jsStats || !pt.wasmStats) {
      throw new Error(`Missing required JS or Wasm measurements for size ${pt.inputSize}`);
    }
    
    validateBenchmarkStats(pt.jsStats, `jsStats at size ${pt.inputSize}`);
    validateBenchmarkStats(pt.wasmStats, `wasmStats at size ${pt.inputSize}`);
  }
}

/**
 * Derives a deterministic WorkloadPolicy from a completed CalibrationRecord.
 * Uses the 'median-crossover-consistent-v2' rule, which requires evidence of a new runtime
 * to be sustained across at least two consecutive points before creating a transition boundary.
 * 
 * Empty calibrations or calibrations failing to establish a base state explicitly throw errors.
 */
export function deriveWorkloadPolicy(record: CalibrationRecord): WorkloadPolicy {
  validateCalibrationRecord(record);

  // Determine absolute preferences per point
  const prefs = record.results.map(pt => {
    // validateCalibrationRecord already checks existence of stats, we can safely non-null assert
    const measuredPref = derivePreferredRuntime(pt.jsStats!, pt.wasmStats!);
    if (measuredPref !== pt.preferredRuntime) {
      throw new Error(`Contradictory preferredRuntime for size ${pt.inputSize}. Stored: ${pt.preferredRuntime}, Measured: ${measuredPref}`);
    }
    return measuredPref;
  });

  const firstPref = prefs[0];
  let currentRuntime: RuntimeType = firstPref === 'tie' ? 'javascript' : (firstPref as RuntimeType);
  const rules: SelectionRule[] = [];
  
  let candidateRuntime: RuntimeType | null = null;
  let evidenceCount = 0;

  for (let i = 0; i < record.results.length; i++) {
    const rawPref = prefs[i];
    // Treat ties as continuing the current established runtime
    const pref: RuntimeType = rawPref === 'tie' ? currentRuntime : (rawPref as RuntimeType);

    if (pref !== currentRuntime) {
      // Disagreement with current state
      if (candidateRuntime === pref) {
        evidenceCount++;
      } else {
        candidateRuntime = pref;
        evidenceCount = 1;
      }

      // If we have 2 consecutive wins for the new runtime, we transition
      if (evidenceCount >= 2) {
        // The boundary is set at the last size where the old currentRuntime was valid
        // Since evidenceCount == 2, the candidate started at i-1.
        // So the last confirmed point of currentRuntime was i-2.
        // Wait, if i=1 is candidate and i=2 is candidate, i=0 was currentRuntime.
        // The boundary maxInputSize should be the size at i-1? No, i-1 is the FIRST point of candidate.
        // We want sizes <= the point before the evidence started to remain currentRuntime.
        // So i-2 is the point. Wait, what if i=1 is the second evidence? (i.e. i=0 was candidate 1)
        // If i=0 is candidate 1, that means the base state was never confirmed!
        // But the base state was established at i=0. So i=0 cannot disagree with base state (unless prefs[0] was a tie, then base state is JS, and pref is JS, which agrees).
        // Wait, prefs[0] === currentRuntime is always true for i=0!
        // Proof: currentRuntime = prefs[0] === 'tie' ? 'js' : prefs[0].
        // At i=0, pref = prefs[0] === 'tie' ? currentRuntime ('js') : prefs[0].
        // So at i=0, pref === currentRuntime.
        // Thus, disagreement can only start at i=1 or later!
        // So if disagreement starts at i=1, the first evidence is i=1. The second is i=2.
        // The last point confirming currentRuntime is i=0.
        // Boundary maxInputSize = size at i-evidenceCount (i.e. i-2).
        
        const boundarySize = record.results[i - evidenceCount].inputSize;
        
        rules.push({
          maxInputSize: boundarySize,
          runtime: currentRuntime
        });
        
        currentRuntime = candidateRuntime;
        candidateRuntime = null;
        evidenceCount = 0;
      }
    } else {
      // Agrees with current state, reset candidate
      candidateRuntime = null;
      evidenceCount = 0;
    }
  }

  return {
    workloadId: record.config.workloadId,
    rules,
    defaultRuntime: currentRuntime,
    provenance: {
      gridSizes: record.config.gridSizes,
      warmupIterations: record.config.warmupIterations,
      measurementIterations: record.config.measurementIterations,
      timestamp: record.timestamp
    }
  };
}
