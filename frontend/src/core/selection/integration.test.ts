import { describe, it, expect } from 'vitest';
import { analyzeWorkload } from './analyzer';
import { freezePolicy } from './policy';
import { selectRuntime } from './selector';
import { SelectionPolicy } from './types';

describe('Selection Engine Integration', () => {
  it('correctly processes workload through analyzer, policy, and selector', () => {
    const rawPolicy: SelectionPolicy = {
      version: 'v1.0-test',
      derivationRule: 'median-crossover-consistent-v2',
      workloads: {
        matrix: {
          workloadId: 'matrix',
          rules: [
            { maxInputSize: 50, runtime: 'javascript' },
            { maxInputSize: 200, runtime: 'wasm' }
          ],
          defaultRuntime: 'wasm',
          provenance: { gridSizes: [50, 200], warmupIterations: 1, measurementIterations: 1, timestamp: '1' }
        },
        sort: {
          workloadId: 'sort',
          rules: [],
          defaultRuntime: 'wasm',
          provenance: { gridSizes: [100], warmupIterations: 1, measurementIterations: 1, timestamp: '1' }
        },
        sha256: {
          workloadId: 'sha256',
          rules: [
            { maxInputSize: 1024, runtime: 'javascript' }
          ],
          defaultRuntime: 'javascript',
          provenance: { gridSizes: [1024], warmupIterations: 1, measurementIterations: 1, timestamp: '1' }
        }
      }
    };

    const frozenPolicy = freezePolicy(rawPolicy);

    const req1 = { id: 'matrix' as const, size: 25 };
    const req2 = { id: 'matrix' as const, size: 100 };
    const req3 = { id: 'matrix' as const, size: 500 };

    const chars1 = analyzeWorkload(req1.id, req1.size);
    const chars2 = analyzeWorkload(req2.id, req2.size);
    const chars3 = analyzeWorkload(req3.id, req3.size);

    expect(selectRuntime(chars1, frozenPolicy)).toBe('javascript');
    expect(selectRuntime(chars2, frozenPolicy)).toBe('wasm');
    expect(selectRuntime(chars3, frozenPolicy)).toBe('wasm'); 

    expect(selectRuntime(analyzeWorkload('sort', 5000), frozenPolicy)).toBe('wasm');
    expect(selectRuntime(analyzeWorkload('sha256', 512), frozenPolicy)).toBe('javascript');
    expect(selectRuntime(analyzeWorkload('sha256', 4096), frozenPolicy)).toBe('javascript');
  });
});
