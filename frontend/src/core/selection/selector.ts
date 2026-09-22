import { WorkloadCharacteristics, FrozenSelectionPolicy } from './types';
import { RuntimeType } from '../types';

/**
 * Pure deterministic runtime selection engine.
 * Selects between javascript and wasm strictly based on pre-calibrated frozen policies.
 * Contains NO side effects, makes NO network requests, and does NOT execute benchmarks.
 */
export function selectRuntime(characteristics: WorkloadCharacteristics, policy: FrozenSelectionPolicy): RuntimeType {
  const workloadPolicy = policy.workloads[characteristics.workloadId];
  
  if (!workloadPolicy) {
    throw new Error(`No policy defined for workload: ${characteristics.workloadId}`);
  }

  // Find the first rule whose maxInputSize encompasses the current inputSize.
  for (const rule of workloadPolicy.rules) {
    if (characteristics.inputSize <= rule.maxInputSize) {
      return rule.runtime;
    }
  }

  // If input size is larger than all explicit calibration regions,
  // fall back to the workload's default runtime (usually the last observed winning state).
  return workloadPolicy.defaultRuntime;
}
