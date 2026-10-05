import { WorkloadId, RuntimeType } from '../types';

export type WaswitWorkload = WorkloadId;

export interface MatrixInput {
  a: Float32Array;
  b: Float32Array;
  n: number;
}

export interface MatrixOptions {
  workload: 'matrix';
  input: MatrixInput;
}

export interface SortOptions {
  workload: 'sort';
  input: Int32Array;
}

export interface Sha256Options {
  workload: 'sha256';
  input: Uint8Array;
}

export type WaswitRunOptions = MatrixOptions | SortOptions | Sha256Options;

export type WaswitRunResultType<T extends WaswitRunOptions> = 
  T['workload'] extends 'matrix' ? Float32Array :
  T['workload'] extends 'sort' ? Int32Array :
  T['workload'] extends 'sha256' ? Uint8Array :
  never;

export interface WaswitRunResult<T> {
  result: T;
  workload: WaswitWorkload;
  runtime: RuntimeType;
  inputSize: number;
  selectionOverheadMs: number;
  executionTimeMs: number;
  policyVersion: string;
  policyDerivationRule: string;
}

