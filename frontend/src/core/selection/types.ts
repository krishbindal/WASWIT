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

export interface CalibrationProvenance {
  gridSizes: number[];
  warmupIterations: number;
  measurementIterations: number;
  timestamp: string;
}

export interface WorkloadPolicy {
  workloadId: WorkloadId;
  /** Ordered list of thresholds. First rule where inputSize <= maxInputSize wins. */
  rules: SelectionRule[];
  /** Fallback runtime for sizes larger than the last rule's maxInputSize, or if rules array is empty. */
  defaultRuntime: RuntimeType;
  /** Preserved provenance of the calibration run that generated this policy */
  provenance: CalibrationProvenance;
}

export interface SelectionPolicy {
  version: string;
  derivationRule: string;
  workloads: Partial<Record<WorkloadId, WorkloadPolicy>>;
}

/** 
 * Deep Readonly utility type to enforce deep immutability at the compiler level 
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends (infer U)[]
    ? ReadonlyArray<DeepReadonly<U>>
    : T[P] extends object
      ? DeepReadonly<T[P]>
      : T[P];
};

/**
 * The frozen representation of a SelectionPolicy.
 * The Selector must ONLY accept this type.
 */
export type FrozenSelectionPolicy = DeepReadonly<SelectionPolicy>;
