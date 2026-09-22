import { SelectionPolicy, FrozenSelectionPolicy } from './types';
import { WorkloadId } from '../types';

/**
 * Validates a policy and ensures it is well-formed.
 * The rules within each workload policy must be strictly ordered by maxInputSize ascending.
 * There should be no duplicate maxInputSizes.
 */
export function validatePolicy(policy: SelectionPolicy): void {
  if (!policy.version) throw new Error('Policy must have a version');
  if (!policy.derivationRule) throw new Error('Policy must have a derivationRule');

  for (const [id, wp] of Object.entries(policy.workloads)) {
    if (!wp) continue;
    if (wp.workloadId !== id) {
      throw new Error(`Workload ID mismatch in policy mapping for ${id}`);
    }
    
    if (!wp.provenance) {
      throw new Error(`Missing calibration provenance for workload ${id}`);
    }

    if (wp.rules.length === 0 && !wp.defaultRuntime) {
      throw new Error(`Invalid policy: empty rules and no defaultRuntime for ${id}`);
    }

    let lastSize = -1;
    for (const rule of wp.rules) {
      if (rule.maxInputSize <= lastSize) {
        throw new Error(`Rules must be strictly ordered by maxInputSize. Found ${rule.maxInputSize} after ${lastSize} in ${id}.`);
      }
      if (rule.runtime !== 'javascript' && rule.runtime !== 'wasm') {
        throw new Error(`Invalid runtime in policy for ${id}: ${rule.runtime}`);
      }
      lastSize = rule.maxInputSize;
    }
    if (wp.defaultRuntime !== 'javascript' && wp.defaultRuntime !== 'wasm') {
      throw new Error(`Invalid defaultRuntime in policy for ${id}: ${wp.defaultRuntime}`);
    }
  }
}

/**
 * Deep freezes a selection policy to enforce immutability.
 * This guarantees the policy cannot be modified dynamically at runtime.
 */
export function freezePolicy(policy: SelectionPolicy): FrozenSelectionPolicy {
  validatePolicy(policy);
  
  const frozenWorkloads: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(policy.workloads)) {
    if (!value) continue;

    const frozenProvenance = Object.freeze({
      ...value.provenance,
      gridSizes: Object.freeze([...value.provenance.gridSizes])
    });

    const frozenRules = Object.freeze(
      value.rules.map(r => Object.freeze({ ...r }))
    );

    frozenWorkloads[key as WorkloadId] = Object.freeze({
      workloadId: value.workloadId,
      defaultRuntime: value.defaultRuntime,
      provenance: frozenProvenance,
      rules: frozenRules
    });
  }

  // TypeScript's native Object.freeze signature returns Readonly<T>, which is shallow. 
  // To enforce deep immutability at compile time, we cast to our custom FrozenSelectionPolicy 
  // (a DeepReadonly wrapper). The manual Object.freeze calls above ensure the object is 
  // actually deeply frozen at runtime. This cast is minimal and isolated.
  return Object.freeze({
    version: policy.version,
    derivationRule: policy.derivationRule,
    workloads: Object.freeze(frozenWorkloads)
  }) as FrozenSelectionPolicy;
}
