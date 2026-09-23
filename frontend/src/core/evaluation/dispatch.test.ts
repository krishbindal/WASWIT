import { vi, describe, it, expect, beforeEach } from 'vitest';
import { runEvaluation } from './engine';
import { EvaluationConfig, ExecutionMode } from './types';
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

    const jsSpy = vi.fn();
    const wasmSpy = vi.fn();

    const mockRunner = vi.fn(async (size: number, runtime: string, executionMode: ExecutionMode) => {
      if (executionMode === 'adaptive') {
        if (runtime === 'javascript') jsSpy();
        if (runtime === 'wasm') wasmSpy();
      }
      return new Float32Array();
    });

    const iterator = runEvaluation(config, policy, 'eval-path-test', mockRunner as any);
    for await (const res of iterator) {}

    // Verify adaptive strictly executed only JS
    expect(jsSpy).toHaveBeenCalledTimes(1);
    expect(wasmSpy).toHaveBeenCalledTimes(0);

    // Keep existing semantic proof
    const adaptiveCalls = mockRunner.mock.calls.filter(call => call[2] === 'adaptive');
    expect(adaptiveCalls.length).toBe(1);
    expect(adaptiveCalls[0][1]).toBe('javascript');
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

    const jsSpy = vi.fn();
    const wasmSpy = vi.fn();

    const mockRunner = vi.fn(async (size: number, runtime: string, executionMode: ExecutionMode) => {
      if (executionMode === 'adaptive') {
        if (runtime === 'javascript') jsSpy();
        if (runtime === 'wasm') wasmSpy();
      }
      return new Float32Array();
    });

    const iterator = runEvaluation(config, policy, 'eval-path-test-2', mockRunner as any);
    for await (const res of iterator) {}

    // Verify adaptive strictly executed only Wasm
    expect(wasmSpy).toHaveBeenCalledTimes(1);
    expect(jsSpy).toHaveBeenCalledTimes(0);

    const adaptiveCalls = mockRunner.mock.calls.filter(call => call[2] === 'adaptive');
    expect(adaptiveCalls.length).toBe(1);
    expect(adaptiveCalls[0][1]).toBe('wasm');
  });
});
