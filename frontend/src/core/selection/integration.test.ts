import { describe, it, expect } from 'vitest';
import { analyzeWorkload } from './analyzer';
import { freezePolicy } from './policy';
import { selectRuntime } from './selector';
import { SelectionPolicy } from './types';

describe('Selection Engine Integration', () => {
  it('correctly processes workload through analyzer, policy, and selector', () => {
    // 1. Load an explicit frozen policy artifact (simulating loading from experiments/processed)
    const policyFixture: SelectionPolicy = freezePolicy({
      version: 'v1.0-test',
      derivationRule: 'median-crossover',
      workloads: {
        matrix: {
          workloadId: 'matrix',
          rules: [
            { maxInputSize: 50, runtime: 'javascript' },
            { maxInputSize: 200, runtime: 'wasm' }
          ],
          defaultRuntime: 'wasm'
        },
        sort: {
          workloadId: 'sort',
          rules: [],
          defaultRuntime: 'wasm'
        },
        sha256: {
          workloadId: 'sha256',
          rules: [
            { maxInputSize: 1024, runtime: 'javascript' }
          ],
          defaultRuntime: 'javascript'
        }
      }
    });

    // 2. Client inputs
    const req1 = { id: 'matrix' as const, size: 25 };
    const req2 = { id: 'matrix' as const, size: 100 };
    const req3 = { id: 'matrix' as const, size: 500 };

    // 3. Analyzer
    const chars1 = analyzeWorkload(req1.id, req1.size);
    const chars2 = analyzeWorkload(req2.id, req2.size);
    const chars3 = analyzeWorkload(req3.id, req3.size);

    // 4. Selector
    expect(selectRuntime(chars1, policyFixture)).toBe('javascript');
    expect(selectRuntime(chars2, policyFixture)).toBe('wasm');
    expect(selectRuntime(chars3, policyFixture)).toBe('wasm'); // fallback to default after 200

    // Other workloads
    expect(selectRuntime(analyzeWorkload('sort', 5000), policyFixture)).toBe('wasm');
    expect(selectRuntime(analyzeWorkload('sha256', 512), policyFixture)).toBe('javascript');
    expect(selectRuntime(analyzeWorkload('sha256', 4096), policyFixture)).toBe('javascript');
  });
});
