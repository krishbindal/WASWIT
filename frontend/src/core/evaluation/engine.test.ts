import { describe, it, expect, vi } from 'vitest';
import { runEvaluation, calculateSummary } from './engine';
import { EvaluationConfig, EvaluationTrial } from './types';
import { SelectionPolicy } from '../selection/types';

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

describe('Evaluation Engine', () => {
  it('calculates summary correctly excluding warmups and errors', () => {
    const trials: EvaluationTrial[] = [
      { trialIndex: 0, isWarmup: true, executionMode: 'javascript', selectedRuntime: 'javascript', elapsedMs: 10, timestamp: '' },
      { trialIndex: 1, isWarmup: true, executionMode: 'javascript', selectedRuntime: 'javascript', elapsedMs: 5, timestamp: '' },
      { trialIndex: 2, isWarmup: false, executionMode: 'javascript', selectedRuntime: 'javascript', elapsedMs: 6, timestamp: '' },
      { trialIndex: 3, isWarmup: false, executionMode: 'javascript', selectedRuntime: 'javascript', elapsedMs: 4, timestamp: '' },
      { trialIndex: 4, isWarmup: false, executionMode: 'javascript', selectedRuntime: 'javascript', elapsedMs: 5, timestamp: '' },
      { trialIndex: 5, isWarmup: false, executionMode: 'javascript', selectedRuntime: 'javascript', elapsedMs: 0, error: 'fail', timestamp: '' }
    ];

    const summary = calculateSummary(trials);
    expect(summary).toBeDefined();
    expect(summary?.count).toBe(3); // indices 2, 3, 4
    expect(summary?.min).toBe(4);
    expect(summary?.max).toBe(6);
    expect(summary?.mean).toBe(5);
    expect(summary?.median).toBe(5);
  });

  it('calculateSummary strictly rejects invalid elapsedMs', () => {
    const makeTrial = (elapsedMs?: number): EvaluationTrial => ({
      trialIndex: 0, isWarmup: false, executionMode: 'javascript', elapsedMs, timestamp: ''
    });

    expect(() => calculateSummary([makeTrial(NaN)])).toThrow('Invalid elapsedMs');
    expect(() => calculateSummary([makeTrial(Infinity)])).toThrow('Invalid elapsedMs');
    expect(() => calculateSummary([makeTrial(-1)])).toThrow('Invalid elapsedMs');
    
    // undefined should simply be ignored as not having elapsedMs, so it returns null
    expect(calculateSummary([{ trialIndex: 0, isWarmup: false, executionMode: 'javascript', error: 'e', timestamp: '' }])).toBeNull();
  });

  it('runs evaluation loop without mutating policy', async () => {
    const config: EvaluationConfig = {
      workloadId: 'sort',
      evaluationGridSizes: [100],
      warmupIterations: 1,
      measurementIterations: 2,
      generationParams: { matrixOffset: 0 }
    };

    const policy: SelectionPolicy = {
      version: '1.0.0',
      derivationRule: 'test-rule',
      workloads: {
        sort: {
          workloadId: 'sort',
          defaultRuntime: 'javascript',
          rules: [{ maxInputSize: 50, runtime: 'javascript' }, { maxInputSize: 500, runtime: 'wasm' }],
          provenance: {
            gridSizes: [50, 500],
            warmupIterations: 1,
            measurementIterations: 2,
            timestamp: '2026-09-23T00:00:00Z'
          }
        }
      }
    };

    const snapshot = JSON.stringify(policy);
    const iterator = runEvaluation(config, policy, 'eval-id-123');
    for await (const _ of iterator) {}

    // Verify structural immutability
    expect(JSON.stringify(policy)).toBe(snapshot);
    
    // Mutation attempts on frozen policy should fail
    expect(() => {
      (policy as any).version = 'hacked';
    }).toThrow();
    
    expect(() => {
      (policy.workloads.sort!.rules as any).push({ maxInputSize: 9999, runtime: 'wasm' });
    }).toThrow();
  });

  it('runs evaluation loop properly yielding progress', async () => {
    const config: EvaluationConfig = {
      workloadId: 'sort',
      evaluationGridSizes: [100],
      warmupIterations: 1,
      measurementIterations: 2,
      generationParams: { matrixOffset: 0 }
    };

    const policy: SelectionPolicy = {
      version: '1.0.0',
      derivationRule: 'test-rule',
      workloads: {
        sort: {
          workloadId: 'sort',
          defaultRuntime: 'javascript',
          rules: [{ maxInputSize: 50, runtime: 'javascript' }, { maxInputSize: 500, runtime: 'wasm' }],
          provenance: {
            gridSizes: [50, 500],
            warmupIterations: 1,
            measurementIterations: 2,
            timestamp: '2026-09-23T00:00:00Z'
          }
        }
      }
    };

    const iterator = runEvaluation(config, policy, 'eval-id-123');
    
    const results = [];
    for await (const res of iterator) {
      results.push(res);
    }

    // Expect yields: Preparing -> Running -> 1 size completed -> Completed
    expect(results.length).toBe(4);
    
    const finalRun = results[results.length - 1];
    expect(finalRun.status).toBe('Completed');
    expect(finalRun.cases.length).toBe(1);
    
    const evalCase = finalRun.cases[0];
    expect(evalCase.inputSize).toBe(100);
    
    // 1 warmup + 2 measurements = 3 total iterations
    expect(evalCase.jsTrials.length).toBe(3);
    expect(evalCase.wasmTrials.length).toBe(3);
    expect(evalCase.adaptiveTrials.length).toBe(3);

    // Adaptive at size 100 falls into rule maxInputSize: 500 (since 100 > 50 and <= 500), so 'wasm'
    const adaptiveWarmTrials = evalCase.adaptiveTrials.filter(t => !t.isWarmup);
    expect(adaptiveWarmTrials[0].selectedRuntime).toBe('wasm');

    // Summaries exist
    expect(evalCase.jsSummary).toBeDefined();
    expect(evalCase.wasmSummary).toBeDefined();
    expect(evalCase.adaptiveSummary).toBeDefined();
  });
});
