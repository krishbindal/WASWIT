'use client';
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import { useEffect, useState } from 'react';
import { runBenchmark } from '@/core/benchmark/engine';
import { multiplyMatricesJS } from '@/core/workloads/matrix';
import { multiplyMatricesWasm } from '@/core/workloads/wasm';
import { mergeSortJS } from '@/core/workloads/sort';
import { mergeSortWasm } from '@/core/workloads/wasm';
import { sha256JS } from '@/core/workloads/sha256';
import { sha256Wasm } from '@/core/workloads/wasm';
import { generateDeterministicMatrix } from '@/core/workloads/matrix';
import { generateSortInput } from '@/core/workloads/sort';
import { generateSha256Input } from '@/core/workloads/sha256';
import initWasm from '@/wasm/waswit_wasm';
import { selectRuntime } from '@/core/selection/selector';
import { phase5FrozenPolicy } from '@/core/selection/frozen-policy';
import { WorkloadId, RuntimeType } from '@/core/types';

export default function EvaluationRunner() {
  const [results, setResults] = useState<any>(null);
  const [status, setStatus] = useState('Idle');

  useEffect(() => {
    async function runEval(workload: WorkloadId, size: number, mode: string) {
        setStatus(`Running Evaluation: ${workload} ${size} ${mode}`);
        try {
            // Adaptive mode will use Wasm for some workloads, so we must always init Wasm
            // to allow deterministic invocation if Wasm is selected. (Or we can conditionally 
            // init Wasm. We'll just init Wasm anyway to be safe since Phase 4B semantics apply).
            if (mode === 'wasm' || mode === 'adaptive') {
                await initWasm();
            }

            let jsRun: any;
            let wasmRun: any;
            let inputArgs: any[];

            // GENERATION OUTSIDE TIMING
            if (workload === 'matrix') {
                jsRun = multiplyMatricesJS;
                wasmRun = multiplyMatricesWasm;
                // Preserve Phase 5E explicit offset logic: matrix offset is 0 for matrix A and 1 for matrix B
                inputArgs = [generateDeterministicMatrix(size, 0), generateDeterministicMatrix(size, 1), size];
            } else if (workload === 'sort') {
                jsRun = mergeSortJS;
                wasmRun = mergeSortWasm;
                inputArgs = [generateSortInput(size)];
            } else if (workload === 'sha256') {
                jsRun = sha256JS;
                wasmRun = sha256Wasm;
                inputArgs = [generateSha256Input(size)];
            } else {
                throw new Error('Unknown workload');
            }

            const config = { warmupIterations: 5, measurementIterations: 30 };
            
            let res: any;
            let selectedRuntime: RuntimeType | null = null;
            let selectionOverheadMs: number | null = null;

            if (mode === 'js') {
                res = await runBenchmark(() => jsRun(...inputArgs), null, config);
                selectedRuntime = 'javascript';
            } else if (mode === 'wasm') {
                res = await runBenchmark(() => wasmRun(...inputArgs), null, config);
                selectedRuntime = 'wasm';
            } else if (mode === 'adaptive') {
                const t0 = performance.now();
                const sel = selectRuntime({ workloadId: workload, inputSize: size }, phase5FrozenPolicy);
                const t1 = performance.now();
                selectionOverheadMs = t1 - t0;
                selectedRuntime = sel;

                if (sel === 'javascript') {
                    res = await runBenchmark(() => jsRun(...inputArgs), null, config);
                } else {
                    res = await runBenchmark(() => wasmRun(...inputArgs), null, config);
                }
            } else {
                throw new Error('Unknown mode');
            }

            if (!res.success) {
                throw new Error(res.error?.toString() || "Unknown error");
            }

            setResults({ 
                workload,
                size,
                mode,
                warmup: config.warmupIterations,
                measurement: config.measurementIterations,
                success: res.success,
                selectedRuntime,
                selectionOverheadMs,
                sampleCount: res.samples.length,
                samples: res.samples
            });
            setStatus('Evaluation_Complete');
        } catch (err: any) {
            setResults({
                workload,
                size,
                mode,
                success: false,
                error: err.message
            });
            setStatus(`Evaluation_Failed: ${err.message}`);
        }
    }
    
    if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const workload = params.get('workload') as WorkloadId | null;
        const size = params.get('size');
        const mode = params.get('mode');
        
        if (workload && size && mode) {
            runEval(workload, parseInt(size, 10), mode);
        }
    }
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Phase 5E Evaluation Runner</h1>
      <p id="eval-status">Status: {status}</p>
      <pre id="eval-results" className="bg-gray-100 p-4 mt-4 text-xs overflow-auto h-96">
        {JSON.stringify(results, null, 2)}
      </pre>
    </div>
  );
}
