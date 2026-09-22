/**
 * Provisional Type Contracts for WASWIT
 * These are minimal interfaces establishing architectural boundaries.
 * They will evolve as implementation begins.
 */

export type ExecutionMode = 'javascript' | 'wasm' | 'adaptive';
export type RuntimeType = 'javascript' | 'wasm';

export interface WorkloadMetadata {
  /** Uniquely identifies the workload type (e.g., 'matrix_multiplication') */
  id: string;
  /** Primary variable size (e.g., matrix dimension N, array length) */
  inputSize: number;
}

export interface Workload {
  metadata: WorkloadMetadata;
  execute(runtime: RuntimeType): Promise<unknown>;
}

export interface BenchmarkResult {
  executionMode: ExecutionMode;
  runtimeUsed: RuntimeType;
  totalTimeMs: number;
  // Further metrics (overhead, instantiation) will be added later.
}
