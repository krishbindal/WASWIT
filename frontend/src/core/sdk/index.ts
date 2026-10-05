import { analyzeWorkload } from '../selection/analyzer';
import { selectRuntime } from '../selection/selector';
import { phase5FrozenPolicy } from '../selection/frozen-policy';
import { multiplyMatricesJS } from '../workloads/matrix';
import { multiplyMatricesWasm, initWasm, mergeSortWasm, sha256Wasm } from '../workloads/wasm';
import { mergeSortJS } from '../workloads/sort';
import { sha256JS } from '../workloads/sha256';
import { 
  WaswitRunOptions, 
  WaswitRunResult, 
  WaswitRunResultType 
} from './types';

function measureSelectionOverhead(workloadId: import('../types').WorkloadId, inputSize: number) {
  const start = performance.now();
  const characteristics = analyzeWorkload(workloadId, inputSize);
  const runtime = selectRuntime(characteristics, phase5FrozenPolicy);
  const end = performance.now();
  
  return {
    runtime,
    selectionOverheadMs: end - start
  };
}

export async function waswitRun<T extends WaswitRunOptions>(
  options: T
): Promise<WaswitRunResult<WaswitRunResultType<T>>> {
  // We strictly use the frozen policy for developer SDK
  const policy = phase5FrozenPolicy;
  
  let runtimeResult: unknown;
  let executionTimeMs = 0;
  
  if (options.workload === 'matrix') {
    const { a, b, n } = options.input;
    if (!Number.isInteger(n) || n < 0) throw new Error('Matrix dimension n must be a non-negative integer.');
    if (a?.constructor?.name !== 'Float32Array' || b?.constructor?.name !== 'Float32Array') throw new Error('Matrix inputs must be Float32Array.');
    if (a.length !== n * n || b.length !== n * n) throw new Error('Matrix input length must be exactly n * n.');

    const { runtime, selectionOverheadMs } = measureSelectionOverhead('matrix', n);
    
    const startExec = performance.now();
    if (runtime === 'wasm') {
      runtimeResult = await multiplyMatricesWasm(a, b, n);
    } else {
      runtimeResult = multiplyMatricesJS(a, b, n);
    }
    executionTimeMs = performance.now() - startExec;
    
    return {
      result: runtimeResult,
      workload: 'matrix',
      runtime,
      inputSize: n,
      selectionOverheadMs,
      executionTimeMs,
      policyVersion: policy.version,
      policyDerivationRule: policy.derivationRule
    } as unknown as WaswitRunResult<WaswitRunResultType<T>>;
    
  } else if (options.workload === 'sort') {
    const input = options.input;
    if (input?.constructor?.name !== 'Int32Array') throw new Error('Sort input must be an Int32Array.');
    
    const { runtime, selectionOverheadMs } = measureSelectionOverhead('sort', input.length);
    
    const startExec = performance.now();
    if (runtime === 'wasm') {
      runtimeResult = await mergeSortWasm(input);
    } else {
      runtimeResult = mergeSortJS(input);
    }
    executionTimeMs = performance.now() - startExec;
    
    return {
      result: runtimeResult,
      workload: 'sort',
      runtime,
      inputSize: input.length,
      selectionOverheadMs,
      executionTimeMs,
      policyVersion: policy.version,
      policyDerivationRule: policy.derivationRule
    } as unknown as WaswitRunResult<WaswitRunResultType<T>>;
    
  } else if (options.workload === 'sha256') {
    const input = options.input;
    if (input?.constructor?.name !== 'Uint8Array') throw new Error('SHA-256 input must be a Uint8Array.');
    
    const { runtime, selectionOverheadMs } = measureSelectionOverhead('sha256', input.length);
    
    const startExec = performance.now();
    if (runtime === 'wasm') {
      runtimeResult = await sha256Wasm(input);
    } else {
      runtimeResult = sha256JS(input);
    }
    executionTimeMs = performance.now() - startExec;
    
    return {
      result: runtimeResult,
      workload: 'sha256',
      runtime,
      inputSize: input.length,
      selectionOverheadMs,
      executionTimeMs,
      policyVersion: policy.version,
      policyDerivationRule: policy.derivationRule
    } as unknown as WaswitRunResult<WaswitRunResultType<T>>;
  }
  
  throw new Error('Unsupported workload type.');
}

// Ensure developers can manually initialize WASM before first execution
// if they want to exclude lazy-load initialization from their app startup metrics.
export { initWasm as waswitPreload };

