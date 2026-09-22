import { describe, it, expect } from 'vitest';
import { validatePolicy, freezePolicy } from './policy';
import { SelectionPolicy } from './types';

describe('Policy Validation', () => {
  const validPolicy: SelectionPolicy = {
    version: '1.0',
    derivationRule: 'median-crossover-consistent-v2',
    workloads: {
      matrix: {
        workloadId: 'matrix',
        rules: [
          { maxInputSize: 10, runtime: 'javascript' },
          { maxInputSize: 100, runtime: 'wasm' }
        ],
        defaultRuntime: 'wasm',
        provenance: { gridSizes: [10, 100], warmupIterations: 1, measurementIterations: 1, timestamp: '' }
      }
    }
  };

  it('validates a well-formed policy', () => {
    expect(() => validatePolicy(validPolicy)).not.toThrow();
  });

  it('rejects missing version', () => {
    const policy = { ...validPolicy, version: '' } as unknown as SelectionPolicy;
    expect(() => validatePolicy(policy)).toThrow(/version/);
  });
  
  it('rejects missing provenance', () => {
    const policy = { ...validPolicy, workloads: { matrix: { ...validPolicy.workloads.matrix, provenance: undefined } } } as unknown as SelectionPolicy;
    expect(() => validatePolicy(policy)).toThrow(/Missing calibration provenance/);
  });

  it('rejects out of order maxInputSize', () => {
    const policy: SelectionPolicy = {
      ...validPolicy,
      workloads: {
        sort: {
          workloadId: 'sort',
          rules: [
            { maxInputSize: 100, runtime: 'javascript' },
            { maxInputSize: 10, runtime: 'wasm' }
          ],
          defaultRuntime: 'wasm',
          provenance: { gridSizes: [], warmupIterations: 1, measurementIterations: 1, timestamp: '' }
        }
      }
    };
    expect(() => validatePolicy(policy)).toThrow(/strictly ordered/);
  });

  it('freezes the policy deeply', () => {
    const frozen = freezePolicy(validPolicy);
    expect(Object.isFrozen(frozen)).toBe(true);
    expect(Object.isFrozen(frozen.workloads.matrix)).toBe(true);
    expect(Object.isFrozen(frozen.workloads.matrix?.rules)).toBe(true);
    expect(Object.isFrozen(frozen.workloads.matrix?.provenance)).toBe(true);
    
    // Demonstrate mutation attempt throws in strict mode
    expect(() => {
      // @ts-expect-error - explicitly violating types for test
      frozen.version = '1.1';
    }).toThrow();
    
    expect(() => {
      (frozen.workloads.matrix as unknown as Record<string, string>).defaultRuntime = 'javascript';
    }).toThrow();
  });
});
