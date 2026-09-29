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

export default function CalibrationRunner() {
  const [results, setResults] = useState<any>(null);
  const [status, setStatus] = useState('Idle');

  useEffect(() => {
    async function runCalib(workload: string, size: number, mode: string) {
        setStatus(`Running Calibration: ${workload} ${size} ${mode}`);
        try {
            if (mode === 'wasm') {
                await initWasm();
            }

            let jsRun: any;
            let wasmRun: any;
            let inputArgs: any[];

            if (workload === 'matrix') {
                jsRun = multiplyMatricesJS;
                wasmRun = multiplyMatricesWasm;
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
            if (mode === 'js') {
                res = await runBenchmark(() => jsRun(...inputArgs), null, config);
            } else if (mode === 'wasm') {
                res = await runBenchmark(() => wasmRun(...inputArgs), null, config);
            } else {
                throw new Error('Unknown mode');
            }

            let zeroCount = 0;
            if (res && res.success) {
                zeroCount = res.samples.filter((s: any) => s.elapsedMs === 0).length;
            }

            setResults({ 
                workload,
                size,
                mode,
                warmup: config.warmupIterations,
                measurement: config.measurementIterations,
                success: res.success,
                median: res.success ? res.stats.median : null,
                min: res.success ? res.stats.min : null,
                max: res.success ? res.stats.max : null,
                mean: res.success ? res.stats.mean : null,
                sampleCount: res.success ? res.samples.length : 0,
                zeroCount,
                samples: res.success ? res.samples : [],
                error: !res.success ? res.error.toString() : null
            });
            setStatus('Calibration_Complete');
        } catch (err: any) {
            setStatus(`Calibration_Failed: ${err.message}`);
        }
    }
    
    if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const workload = params.get('workload');
        const size = params.get('size');
        const mode = params.get('mode');
        
        if (workload && size && mode) {
            runCalib(workload, parseInt(size, 10), mode);
        }
    }
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Phase 5C Calibration Runner</h1>
      <p id="calib-status">Status: {status}</p>
      <pre id="calib-results" className="bg-gray-100 p-4 mt-4 text-xs overflow-auto h-96">
        {JSON.stringify(results, null, 2)}
      </pre>
    </div>
  );
}
