import { vi, describe, it, expect, beforeEach } from 'vitest';
import { runEvaluation } from './engine';
import { EvaluationConfig } from './types';
import { FrozenSelectionPolicy } from '../selection/types';
import * as matrixWorkload from '../workloads/matrix';
import * as wasmWorkload from '../workloads/wasm';

vi.mock('../workloads/matrix', () => ({
  generateDeterministicMatrix: vi.fn(),
  multiplyMatricesJS: vi.fn(() => new Float32Array())
}));

vi.mock('../workloads/sort', () => ({
  generateSortInput: vi.fn(() => new Int32Array()),
  mergeSortJS: vi.fn(() => new Int32Array())
}));

vi.mock('../workloads/sha256', () => ({
  generateSha256Input: vi.fn(() => new Uint8Array()),
  sha256JS: vi.fn(() => new Uint8Array())
}));

vi.mock('../workloads/wasm', () => ({
  multiplyMatricesWasm: vi.fn(async () => new Float32Array()),
  mergeSortWasm: vi.fn(async () => new Int32Array()),
  sha256Wasm: vi.fn(async () => new Uint8Array())
}));

describe('Evaluation Engine - Execution Path Verification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('proves single-path dispatch for adaptive execution', async () => {
    const config: EvaluationConfig = {
      workloadId: 'matrix',
      evaluationGridSizes: [100],
      warmupIterations: 0,
      measurementIterations: 1,
      generationOffset: 0
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

    const iterator = runEvaluation(config, policy, 'eval-path-test');
    for await (const _ of iterator) {} // Execute fully

    // In JS-only mode, multiplyMatricesJS is called once
    // In Wasm-only mode, multiplyMatricesWasm is called once
    // In Adaptive mode (for size 100), rule picks 'javascript', so multiplyMatricesJS called a second time
    // Total calls expected: JS (2), Wasm (1)
    
    expect(matrixWorkload.multiplyMatricesJS).toHaveBeenCalledTimes(2);
    expect(wasmWorkload.multiplyMatricesWasm).toHaveBeenCalledTimes(1);
    
    // Now test a size that picks Wasm
    vi.clearAllMocks();
    config.evaluationGridSizes = [300]; // rule is max 200 JS, so falls back to default 'wasm'
    
    const iteratorWasm = runEvaluation(config, policy, 'eval-path-test-2');
    for await (const _ of iteratorWasm) {} // Execute fully
    
    // In JS-only mode, multiplyMatricesJS is called once
    // In Wasm-only mode, multiplyMatricesWasm is called once
    // In Adaptive mode (for size 300), fallback picks 'wasm', so multiplyMatricesWasm called a second time
    // Total calls expected: JS (1), Wasm (2)
    
    expect(matrixWorkload.multiplyMatricesJS).toHaveBeenCalledTimes(1);
    expect(wasmWorkload.multiplyMatricesWasm).toHaveBeenCalledTimes(2);
  });
});
