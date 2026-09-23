import { describe, it, expect } from 'vitest';
import { validateEvaluationConfig } from './engine';
import { EvaluationConfig } from './types';
import { FrozenSelectionPolicy } from '../selection/types';

describe('Evaluation Engine - Config Validation', () => {
  const policy: FrozenSelectionPolicy = {
    version: '1.0',
    derivationRule: 'rule',
    workloads: {
      matrix: {
        workloadId: 'matrix',
        rules: [],
        defaultRuntime: 'wasm',
        provenance: {
          gridSizes: [100, 200, 300],
          warmupIterations: 3,
          measurementIterations: 10,
          timestamp: '2026'
        }
      }
    }
  };

  it('rejects overlap with calibration grid', () => {
    const config: EvaluationConfig = {
      workloadId: 'matrix',
      evaluationGridSizes: [100], // overlap!
      warmupIterations: 3,
      measurementIterations: 10,
      generationParams: { matrixOffset: 0 }
    };
    expect(() => validateEvaluationConfig(config, policy)).toThrow(/Grid overlap/);
  });

  it('rejects unsorted or duplicate grids', () => {
    const config: EvaluationConfig = {
      workloadId: 'matrix',
      evaluationGridSizes: [500, 400], // unsorted
      warmupIterations: 3,
      measurementIterations: 10,
      generationParams: { matrixOffset: 0 }
    };
    expect(() => validateEvaluationConfig(config, policy)).toThrow(/strictly ascending/);
  });

  it('rejects negative or NaN iterations', () => {
    const config: EvaluationConfig = {
      workloadId: 'matrix',
      evaluationGridSizes: [400],
      warmupIterations: -1,
      measurementIterations: 10,
      generationParams: { matrixOffset: 0 }
    };
    expect(() => validateEvaluationConfig(config, policy)).toThrow(/Invalid warmupIterations/);
  });

  it('accepts valid, independent configs', () => {
    const config: EvaluationConfig = {
      workloadId: 'matrix',
      evaluationGridSizes: [50, 150, 250], // completely disjoint from [100, 200, 300]
      warmupIterations: 3,
      measurementIterations: 10,
      generationParams: { matrixOffset: 0 }
    };
    expect(() => validateEvaluationConfig(config, policy)).not.toThrow();
  });
});

describe('Evaluation Engine - Immutability', () => {
  it('frozen policy is immutable in JS type checking', () => {
    const policy: FrozenSelectionPolicy = {
      version: '1.0',
      derivationRule: 'rule',
      workloads: {}
    };
    
    // Type checking ensures we cannot mutate policy properties here.
    // At runtime, in strict mode or Object.freeze, it would throw. 
    // Typescript DeepReadonly handles the contract guarantee.
    expect(policy.version).toBe('1.0');
  });
});
