import { describe, it, expect } from 'vitest';
import { validatePolicy, freezePolicy } from './policy';
import { SelectionPolicy } from './types';

describe('Policy Validation', () => {
  it('validates a well-formed policy', () => {
    const policy: SelectionPolicy = {
      version: '1.0',
      derivationRule: 'median-crossover',
      workloads: {
        matrix: {
          workloadId: 'matrix',
          rules: [
            { maxInputSize: 10, runtime: 'javascript' },
            { maxInputSize: 100, runtime: 'wasm' }
          ],
          defaultRuntime: 'wasm'
        }
      }
    };
    expect(() => validatePolicy(policy)).not.toThrow();
  });

  it('rejects missing version', () => {
    const policy = { derivationRule: 'test', workloads: {} } as unknown as SelectionPolicy;
    expect(() => validatePolicy(policy)).toThrow(/version/);
  });

  it('rejects out of order maxInputSize', () => {
    const policy: SelectionPolicy = {
      version: '1.0',
      derivationRule: 'test',
      workloads: {
        sort: {
          workloadId: 'sort',
          rules: [
            { maxInputSize: 100, runtime: 'javascript' },
            { maxInputSize: 10, runtime: 'wasm' }
          ],
          defaultRuntime: 'wasm'
        }
      }
    };
    expect(() => validatePolicy(policy)).toThrow(/strictly ordered/);
  });

  it('freezes the policy deeply', () => {
    const policy: SelectionPolicy = {
      version: '1.0',
      derivationRule: 'test',
      workloads: {
        sha256: {
          workloadId: 'sha256',
          rules: [
            { maxInputSize: 50, runtime: 'javascript' }
          ],
          defaultRuntime: 'wasm'
        }
      }
    };
    const frozen = freezePolicy(policy);
    expect(Object.isFrozen(frozen)).toBe(true);
    expect(Object.isFrozen(frozen.workloads.sha256)).toBe(true);
    expect(Object.isFrozen(frozen.workloads.sha256?.rules)).toBe(true);
  });
});
