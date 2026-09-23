import { WorkloadId, RuntimeType } from '../types';
import { ExperimentMetadata } from '../research/types';

export type ExecutionMode = 'javascript' | 'wasm' | 'adaptive';

export interface EvaluationConfig {
  workloadId: WorkloadId;
  /** The specific input sizes to evaluate. Must be independent from the calibration grid sizes. */
  evaluationGridSizes: number[];
  warmupIterations: number;
  measurementIterations: number;
  /** 
   * Explicit deterministic generation parameters.
   * Sort and SHA256 have purely size-based deterministic generation and use no parameters.
   * Matrix uses an explicit offset parameter.
   */
  generationParams?: {
    matrixOffset?: number;
  };
}

export interface EvaluationTrial {
  trialIndex: number;
  /** True if this trial was executed during the warmup phase (should be excluded from summaries) */
  isWarmup: boolean;
  executionMode: ExecutionMode;
  /** The actual runtime executed. For Mode A/B it is fixed; for Mode C it is chosen by the selector. Undefined if selector failed. */
  selectedRuntime?: RuntimeType;
  /** The overhead of running the analyzer and selector (only present in adaptive mode) */
  selectionOverheadMs?: number;
  /** The execution time in milliseconds. Preserved explicitly only on successful execution. */
  elapsedMs?: number;
  error?: string;
  timestamp: string;
}

export interface EvaluationSummaryStats {
  count: number;
  min: number;
  max: number;
  mean: number;
  median: number;
}

export interface GenerationSpec {
  generatorId: string;
  parameters?: Record<string, number | string | boolean>;
}

export interface EvaluationCase {
  evaluationCaseId: string;
  workloadId: WorkloadId;
  inputSize: number;
  generationSpec: GenerationSpec;
  
  /** Raw trial observations preserved explicitly */
  jsTrials: EvaluationTrial[];
  wasmTrials: EvaluationTrial[];
  adaptiveTrials: EvaluationTrial[];

  /** Derived summary statistics across warm measurements */
  jsSummary: EvaluationSummaryStats | null;
  wasmSummary: EvaluationSummaryStats | null;
  adaptiveSummary: EvaluationSummaryStats | null;
}

export interface EvaluationRun {
  experimentRunId: string;
  config: EvaluationConfig;
  environmentMetadata: ExperimentMetadata;
  policyVersion: string | null;
  policyDerivationRule: string | null;
  calibrationTimestamp: string | null;
  
  cases: EvaluationCase[];
  status: 'Idle' | 'Preparing' | 'Running' | 'Completed' | 'CompletedWithFailures' | 'Failed';
  error?: string;
}
