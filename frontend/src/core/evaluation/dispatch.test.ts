import { vi, describe, it, expect, beforeEach } from 'vitest';
import { runEvaluation } from './engine';
import { EvaluationConfig } from './types';
import { FrozenSelectionPolicy } from '../selection/types';

describe('Evaluation Engine - Execution Path Verification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('proves single-path dispatch for adaptive execution (javascript)', async () => {
    const config: EvaluationConfig = {
      workloadId: 'matrix',
      evaluationGridSizes: [100],
      warmupIterations: 0,
      measurementIterations: 1,
      generationParams: { matrixOffset: 0 }
    };

    const policy: FrozenSelectionPolicy = {
      version: 'test-ver',
      derivationRule: 'test-rule',
      workloads: {
        matrix: {
          workloadId: 'matrix',
          defaultRuntime: 'wasm',
          rules: [{ maxInputSize: 200, runtime: 'javascript' }], // Size 100 will pick JS
          provenance: {
            gridSizes: [150],
            warmupIterations: 1,
            measurementIterations: 2,
            timestamp: '2026-09-23T00:00:00Z'
          }
        }
      }
    };

    const mockRunner = vi.fn(async (size: number, runtime: string) => new Float32Array());

    const iterator = runEvaluation(config, policy, 'eval-path-test', mockRunner);
    const results = [];
    for await (const res of iterator) {
      results.push(res);
    }
    const finalRun = results[results.length - 1];
    
    // Evaluate the trials produced in Mode C (adaptive)
    const adaptiveTrial = finalRun.cases[0].adaptiveTrials[0];
    expect(adaptiveTrial.selectedRuntime).toBe('javascript');

    // Filter mock calls that occurred exactly for Mode C
    // Since Mode A (JS) runs first, Mode B (Wasm) runs second, Mode C (Adaptive) runs third
    // The sequence for 1 iteration is: 
    // call 1: (100, 'javascript') [Mode A]
    // call 2: (100, 'wasm') [Mode B]
    // call 3: (100, 'javascript') [Mode C]
    
    expect(mockRunner.mock.calls[2]).toEqual([100, 'javascript']);
    expect(mockRunner).toHaveBeenCalledTimes(3);
  });

  it('proves single-path dispatch for adaptive execution (wasm)', async () => {
    const config: EvaluationConfig = {
      workloadId: 'matrix',
      evaluationGridSizes: [300],
      warmupIterations: 0,
      measurementIterations: 1,
      generationParams: { matrixOffset: 0 }
    };

    const policy: FrozenSelectionPolicy = {
      version: 'test-ver',
      derivationRule: 'test-rule',
      workloads: {
        matrix: {
          workloadId: 'matrix',
          defaultRuntime: 'wasm', // Size 300 will fall back to wasm
          rules: [{ maxInputSize: 200, runtime: 'javascript' }], 
          provenance: {
            gridSizes: [150],
            warmupIterations: 1,
            measurementIterations: 2,
            timestamp: '2026-09-23T00:00:00Z'
          }
        }
      }
    };

    const mockRunner = vi.fn(async (size: number, runtime: string) => new Float32Array());

    const iterator = runEvaluation(config, policy, 'eval-path-test-2', mockRunner);
    const results = [];
    for await (const res of iterator) {
      results.push(res);
    }
    const finalRun = results[results.length - 1];
    
    const adaptiveTrial = finalRun.cases[0].adaptiveTrials[0];
    expect(adaptiveTrial.selectedRuntime).toBe('wasm');

    // The sequence for 1 iteration is: 
    // call 1: (300, 'javascript') [Mode A]
    // call 2: (300, 'wasm') [Mode B]
    // call 3: (300, 'wasm') [Mode C]
    
    expect(mockRunner.mock.calls[2]).toEqual([300, 'wasm']);
    expect(mockRunner).toHaveBeenCalledTimes(3);
  });
});
