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
      },
      sort: {
        workloadId: 'sort',
        rules: [],
        defaultRuntime: 'wasm',
        provenance: {
          gridSizes: [1000],
          warmupIterations: 3,
          measurementIterations: 10,
          timestamp: '2026'
        }
      }
    }
  };

  const baseConfig: EvaluationConfig = {
    workloadId: 'matrix',
    evaluationGridSizes: [400],
    warmupIterations: 3,
    measurementIterations: 10,
    generationParams: { matrixOffset: 0 }
  };

  // --- Grid Tests ---
  it('rejects empty grid', () => {
    expect(() => validateEvaluationConfig({ ...baseConfig, evaluationGridSizes: [] }, policy)).toThrow(/empty/);
  });
  
  it('rejects NaN, Infinity, negative, and non-integer grid values', () => {
    expect(() => validateEvaluationConfig({ ...baseConfig, evaluationGridSizes: [NaN] }, policy)).toThrow(/valid integer/);
    expect(() => validateEvaluationConfig({ ...baseConfig, evaluationGridSizes: [Infinity] }, policy)).toThrow(/valid integer/);
    expect(() => validateEvaluationConfig({ ...baseConfig, evaluationGridSizes: [-50] }, policy)).toThrow(/greater than 0/);
    expect(() => validateEvaluationConfig({ ...baseConfig, evaluationGridSizes: [1.5] }, policy)).toThrow(/valid integer/);
  });

  it('rejects duplicate or unsorted grids', () => {
    expect(() => validateEvaluationConfig({ ...baseConfig, evaluationGridSizes: [400, 400] }, policy)).toThrow(/strictly ascending/);
    expect(() => validateEvaluationConfig({ ...baseConfig, evaluationGridSizes: [500, 400] }, policy)).toThrow(/strictly ascending/);
  });

  it('rejects overlap with calibration grid', () => {
    expect(() => validateEvaluationConfig({ ...baseConfig, evaluationGridSizes: [100] }, policy)).toThrow(/Grid overlap/);
  });

  // --- Warmup Tests ---
  it('rejects invalid warmup iterations', () => {
    expect(() => validateEvaluationConfig({ ...baseConfig, warmupIterations: -1 }, policy)).toThrow(/Invalid warmupIterations/);
    expect(() => validateEvaluationConfig({ ...baseConfig, warmupIterations: NaN }, policy)).toThrow(/Invalid warmupIterations/);
    expect(() => validateEvaluationConfig({ ...baseConfig, warmupIterations: Infinity }, policy)).toThrow(/Invalid warmupIterations/);
    expect(() => validateEvaluationConfig({ ...baseConfig, warmupIterations: 1.5 }, policy)).toThrow(/Invalid warmupIterations/);
  });
  
  it('accepts valid zero or positive warmup iterations', () => {
    expect(() => validateEvaluationConfig({ ...baseConfig, warmupIterations: 0 }, policy)).not.toThrow();
    expect(() => validateEvaluationConfig({ ...baseConfig, warmupIterations: 5 }, policy)).not.toThrow();
  });

  // --- Measurement Tests ---
  it('rejects invalid measurement iterations', () => {
    expect(() => validateEvaluationConfig({ ...baseConfig, measurementIterations: 0 }, policy)).toThrow(/Invalid measurementIterations/);
    expect(() => validateEvaluationConfig({ ...baseConfig, measurementIterations: -5 }, policy)).toThrow(/Invalid measurementIterations/);
    expect(() => validateEvaluationConfig({ ...baseConfig, measurementIterations: NaN }, policy)).toThrow(/Invalid measurementIterations/);
    expect(() => validateEvaluationConfig({ ...baseConfig, measurementIterations: Infinity }, policy)).toThrow(/Invalid measurementIterations/);
    expect(() => validateEvaluationConfig({ ...baseConfig, measurementIterations: 2.5 }, policy)).toThrow(/Invalid measurementIterations/);
  });
  
  it('accepts valid measurement iterations', () => {
    expect(() => validateEvaluationConfig({ ...baseConfig, measurementIterations: 1 }, policy)).not.toThrow();
  });

  // --- Policy Tests ---
  it('rejects missing workload policy', () => {
    expect(() => validateEvaluationConfig({ ...baseConfig, workloadId: 'sha256' }, policy)).toThrow(/Missing workload policy/);
  });

  // --- Generation Tests ---
  it('rejects invalid matrix offsets', () => {
    expect(() => validateEvaluationConfig({ ...baseConfig, generationParams: { matrixOffset: NaN } }, policy)).toThrow(/Invalid generationParams.matrixOffset/);
    expect(() => validateEvaluationConfig({ ...baseConfig, generationParams: { matrixOffset: Infinity } }, policy)).toThrow(/Invalid generationParams.matrixOffset/);
    expect(() => validateEvaluationConfig({ ...baseConfig, generationParams: { matrixOffset: 1.5 } }, policy)).toThrow(/Invalid generationParams.matrixOffset/);
  });
  
  it('rejects irrelevant matrix parameters for sort and sha256', () => {
    const sortConfig: EvaluationConfig = { ...baseConfig, workloadId: 'sort', evaluationGridSizes: [2000], generationParams: { matrixOffset: 5 } };
    expect(() => validateEvaluationConfig(sortConfig, policy)).toThrow(/matrixOffset is not supported/);
  });
});
