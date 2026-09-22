import { WorkloadId, RuntimeType } from '../types';
import { FrozenSelectionPolicy } from '../selection/types';
import { selectRuntime } from '../selection/selector';
import { 
  EvaluationConfig, 
  EvaluationTrial, 
  EvaluationCase, 
  EvaluationRun,
  EvaluationSummaryStats 
} from './types';

import { generateDeterministicMatrix, multiplyMatricesJS } from '../workloads/matrix';
import { multiplyMatricesWasm } from '../workloads/wasm';

import { generateSortInput, mergeSortJS } from '../workloads/sort';
import { mergeSortWasm } from '../workloads/wasm';

import { generateSha256Input, sha256JS } from '../workloads/sha256';
import { sha256Wasm } from '../workloads/wasm';

import { analyzeWorkload } from '../selection/analyzer';

export function validateEvaluationConfig(config: EvaluationConfig, policy: FrozenSelectionPolicy) {
  if (config.warmupIterations < 0 || !Number.isInteger(config.warmupIterations)) throw new Error('Invalid warmupIterations');
  if (config.measurementIterations <= 0 || !Number.isInteger(config.measurementIterations)) throw new Error('Invalid measurementIterations');
  if (!config.evaluationGridSizes || config.evaluationGridSizes.length === 0) throw new Error('Grid must be non-empty');
  
  const calibGrid = policy.workloads[config.workloadId]?.provenance.gridSizes || [];
  
  for (let i = 0; i < config.evaluationGridSizes.length; i++) {
    const size = config.evaluationGridSizes[i];
    if (size < 0 || !Number.isInteger(size)) throw new Error('Invalid grid size');
    if (i > 0 && size <= config.evaluationGridSizes[i-1]) throw new Error('Grid must be strictly ascending with no duplicates');
    if (calibGrid.includes(size)) throw new Error(`Grid overlap with calibration: ${size}`);
  }
}

export function calculateSummary(trials: EvaluationTrial[]): EvaluationSummaryStats | null {
  // Only summarize warm trials that were NOT part of the warmup phase and didn't error
  const measurementTrials = trials.filter(t => t.phase === 'warm' && !t.isWarmup && !t.error && typeof t.elapsedMs === 'number');
  if (measurementTrials.length === 0) return null;

  const times = measurementTrials.map(t => {
    if (t.elapsedMs! < 0 || !Number.isFinite(t.elapsedMs)) throw new Error('Invalid elapsedMs');
    return t.elapsedMs!;
  }).sort((a, b) => a - b);
  
  const count = times.length;
  const min = times[0];
  const max = times[times.length - 1];
  const mean = times.reduce((acc, val) => acc + val, 0) / count;
  
  let median: number;
  const mid = Math.floor(count / 2);
  if (count % 2 === 0) {
    median = (times[mid - 1] + times[mid]) / 2;
  } else {
    median = times[mid];
  }

  return { count, min, max, mean, median };
}

function getWorkloadRunner(workloadId: WorkloadId, config: EvaluationConfig) {
  return async (size: number, runtime: RuntimeType) => {
    if (workloadId === 'matrix') {
      const a = generateDeterministicMatrix(size, config.generationOffset);
      const b = generateDeterministicMatrix(size, config.generationOffset + 1);
      if (runtime === 'javascript') {
        return multiplyMatricesJS(a, b, size);
      } else {
        return multiplyMatricesWasm(a, b, size);
      }
    } else if (workloadId === 'sort') {
      const input = generateSortInput(size);
      if (runtime === 'javascript') {
        return mergeSortJS(input);
      } else {
        return mergeSortWasm(input);
      }
    } else if (workloadId === 'sha256') {
      const input = generateSha256Input(size);
      if (runtime === 'javascript') {
        return sha256JS(input);
      } else {
        return sha256Wasm(input);
      }
    }
    throw new Error(`Unsupported workload ${workloadId}`);
  };
}

export async function* runEvaluation(
  config: EvaluationConfig,
  policy: FrozenSelectionPolicy,
  experimentRunId: string
): AsyncGenerator<EvaluationRun, EvaluationRun, void> {
  validateEvaluationConfig(config, policy);

  const run: EvaluationRun = {
    experimentRunId,
    config,
    environmentMetadata: {
      browser: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
      os: 'Unknown', 
      cpuModel: 'Unavailable',
      logicalProcessorCount: typeof navigator !== 'undefined' ? navigator.hardwareConcurrency : 'Unknown',
      approximateDeviceMemoryGB: typeof navigator !== 'undefined' && 'deviceMemory' in navigator 
           ? ((navigator as unknown) as { deviceMemory: number }).deviceMemory
           : 'Unknown',
      timestamp: new Date().toISOString(),
      warmupIterations: config.warmupIterations,
      measurementIterations: config.measurementIterations,
      gridSizes: config.evaluationGridSizes
    },
    policyVersion: policy.version,
    policyDerivationRule: policy.derivationRule,
    calibrationTimestamp: policy.workloads[config.workloadId]?.provenance.timestamp || null,
    cases: [],
    status: 'Preparing'
  };

  yield { ...run };

  run.status = 'Running';
  yield { ...run };

  const runner = getWorkloadRunner(config.workloadId, config);

  for (const size of config.evaluationGridSizes) {
    // Deterministic evaluation case ID based on generation parameters
    const evalCase: EvaluationCase = {
      evaluationCaseId: `${config.workloadId}-sz${size}-off${config.generationOffset}`,
      workloadId: config.workloadId,
      inputSize: size,
      jsTrials: [],
      wasmTrials: [],
      adaptiveTrials: [],
      jsSummary: null,
      wasmSummary: null,
      adaptiveSummary: null,
    };

    const totalIterations = config.warmupIterations + config.measurementIterations;

    // --- Mode A: JS Only ---
    for (let i = 0; i < totalIterations; i++) {
      const isCold = (i === 0);
      const phase = isCold ? 'cold' : 'warm';
      const isWarmup = i < config.warmupIterations;
      try {
        const start = performance.now();
        await runner(size, 'javascript');
        const end = performance.now();
        
        evalCase.jsTrials.push({
          trialIndex: i,
          phase,
          isWarmup,
          executionMode: 'javascript',
          selectedRuntime: 'javascript',
          elapsedMs: end - start,
          timestamp: new Date().toISOString()
        });
      } catch (err) {
        evalCase.jsTrials.push({
          trialIndex: i,
          phase,
          isWarmup,
          executionMode: 'javascript',
          selectedRuntime: 'javascript',
          error: String(err),
          timestamp: new Date().toISOString()
        });
      }
    }
    
    // --- Mode B: Wasm Only ---
    for (let i = 0; i < totalIterations; i++) {
      const isCold = (i === 0);
      const phase = isCold ? 'cold' : 'warm';
      const isWarmup = i < config.warmupIterations;
      try {
        const start = performance.now();
        await runner(size, 'wasm');
        const end = performance.now();
        
        evalCase.wasmTrials.push({
          trialIndex: i,
          phase,
          isWarmup,
          executionMode: 'wasm',
          selectedRuntime: 'wasm',
          elapsedMs: end - start,
          timestamp: new Date().toISOString()
        });
      } catch (err) {
        evalCase.wasmTrials.push({
          trialIndex: i,
          phase,
          isWarmup,
          executionMode: 'wasm',
          selectedRuntime: 'wasm',
          error: String(err),
          timestamp: new Date().toISOString()
        });
      }
    }

    // --- Mode C: Adaptive ---
    for (let i = 0; i < totalIterations; i++) {
      const isCold = (i === 0);
      const phase = isCold ? 'cold' : 'warm';
      const isWarmup = i < config.warmupIterations;
      
      let selectedRuntime: RuntimeType | undefined = undefined;
      try {
        // Selection overhead measurement
        const sStart = performance.now();
        const characteristics = analyzeWorkload(config.workloadId, size);
        selectedRuntime = selectRuntime(characteristics, policy);
        const sEnd = performance.now();
        const selectionOverheadMs = sEnd - sStart;

        // Execution
        const eStart = performance.now();
        await runner(size, selectedRuntime);
        const eEnd = performance.now();

        evalCase.adaptiveTrials.push({
          trialIndex: i,
          phase,
          isWarmup,
          executionMode: 'adaptive',
          selectedRuntime,
          selectionOverheadMs,
          elapsedMs: eEnd - eStart,
          timestamp: new Date().toISOString()
        });
      } catch (err) {
        evalCase.adaptiveTrials.push({
          trialIndex: i,
          phase,
          isWarmup,
          executionMode: 'adaptive',
          selectedRuntime,
          error: String(err),
          timestamp: new Date().toISOString()
        });
      }
    }

    evalCase.jsSummary = calculateSummary(evalCase.jsTrials);
    evalCase.wasmSummary = calculateSummary(evalCase.wasmTrials);
    evalCase.adaptiveSummary = calculateSummary(evalCase.adaptiveTrials);

    run.cases.push(evalCase);
    
    // Yield progress after each size
    yield { ...run };
  }

  run.status = 'Completed';
  yield { ...run };
  return run;
}
