import { describe, it, expect } from 'vitest';
import { selectRuntime } from './selector';
import { SelectionPolicy } from './types';
import { freezePolicy } from './policy';

describe('Runtime Selector', () => {
  const rawPolicy: SelectionPolicy = {
    version: '1.0',
    derivationRule: 'test',
    workloads: {
      matrix: {
        workloadId: 'matrix',
        rules: [
          { maxInputSize: 10, runtime: 'javascript' },
          { maxInputSize: 100, runtime: 'wasm' },
          { maxInputSize: 500, runtime: 'javascript' }
        ],
        defaultRuntime: 'wasm',
        provenance: { gridSizes: [10, 100, 500], warmupIterations: 1, measurementIterations: 1, timestamp: '1' }
      },
      sort: {
        workloadId: 'sort',
        rules: [],
        defaultRuntime: 'javascript',
        provenance: { gridSizes: [100], warmupIterations: 1, measurementIterations: 1, timestamp: '1' }
      }
    }
  };

  const frozenPolicy = freezePolicy(rawPolicy);

  it('selects javascript for size below first threshold', () => {
    expect(selectRuntime({ workloadId: 'matrix', inputSize: 5, derivedSize: 25 }, frozenPolicy)).toBe('javascript');
  });

  it('selects javascript for size exactly at first threshold', () => {
    expect(selectRuntime({ workloadId: 'matrix', inputSize: 10, derivedSize: 100 }, frozenPolicy)).toBe('javascript');
  });

  it('selects wasm for size just above first threshold', () => {
    expect(selectRuntime({ workloadId: 'matrix', inputSize: 11, derivedSize: 121 }, frozenPolicy)).toBe('wasm');
  });

  it('selects javascript for size above second threshold', () => {
    expect(selectRuntime({ workloadId: 'matrix', inputSize: 150, derivedSize: 22500 }, frozenPolicy)).toBe('javascript');
  });

  it('falls back to default runtime if above all thresholds', () => {
    expect(selectRuntime({ workloadId: 'matrix', inputSize: 1000, derivedSize: 1000000 }, frozenPolicy)).toBe('wasm');
  });

  it('falls back to default runtime if rules array is empty', () => {
    expect(selectRuntime({ workloadId: 'sort', inputSize: 50, derivedSize: 50 }, frozenPolicy)).toBe('javascript');
  });

  it('throws if workload policy does not exist', () => {
    expect(() => selectRuntime({ workloadId: 'sha256', inputSize: 50, derivedSize: 50 }, frozenPolicy)).toThrow(/No policy defined/);
  });
});
