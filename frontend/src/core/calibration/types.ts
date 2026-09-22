import { WorkloadId } from '../types';
import { BenchmarkStats } from '../benchmark/types';

export interface CalibrationConfig {
  workloadId: WorkloadId;
  /** Explicit set of input sizes to sweep during calibration */
  gridSizes: number[];
  warmupIterations: number;
  measurementIterations: number;
}

export interface CalibrationResultPoint {
  inputSize: number;
  jsStats: BenchmarkStats | null;
  wasmStats: BenchmarkStats | null;
  jsError?: string;
  wasmError?: string;
  /** The runtime identified as strictly preferred according to the derivation rule */
  preferredRuntime: 'javascript' | 'wasm' | 'tie';
}

export interface CalibrationRecord {
  config: CalibrationConfig;
  /** ISO timestamp of when the calibration sweep concluded */
  timestamp: string;
  results: CalibrationResultPoint[];
}
