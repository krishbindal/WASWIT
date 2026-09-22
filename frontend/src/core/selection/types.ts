import { RuntimeType, WorkloadId } from '../types';

export interface WorkloadCharacteristics {
  workloadId: WorkloadId;
  inputSize: number;
  /**
   * Derived logical or memory size.
   * e.g., matrix of size N has derivedSize N^2 elements or N^2 * 4 bytes.
   */
  derivedSize: number;
}

export interface SelectionRule {
  /** Inclusive upper bound for this rule. */
  maxInputSize: number;
  runtime: RuntimeType;
}

export interface WorkloadPolicy {
  workloadId: WorkloadId;
  /** Ordered list of thresholds. First rule where inputSize <= maxInputSize wins. */
  rules: SelectionRule[];
  /** Fallback runtime for sizes larger than the last rule's maxInputSize, or if rules array is empty. */
  defaultRuntime: RuntimeType;
}

export interface SelectionPolicy {
  version: string;
  derivationRule: string;
  workloads: Partial<Record<WorkloadId, WorkloadPolicy>>;
}
