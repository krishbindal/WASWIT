/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
'use client';
import { useEffect, useState } from 'react';
import { runBenchmark } from '@/core/benchmark/engine';
import { multiplyMatricesJS, generateDeterministicMatrix } from '@/core/workloads/matrix';
import { mergeSortJS, generateSortInput } from '@/core/workloads/sort';
import { sha256JS, generateSha256Input } from '@/core/workloads/sha256';
import { initWasm, multiplyMatricesWasm, mergeSortWasm, sha256Wasm } from '@/core/workloads/wasm';
import { EvaluationCase } from '@/core/evaluation/types';

export default function PilotTestRunner() {
  const [results, setResults] = useState<any>(null);
  const [status, setStatus] = useState('Idle');

  useEffect(() => {
    async function runPilot() {
      setStatus('Running Candidate Feasibility');
      try {
        await initWasm();
        const feasibilityResults: any[] = [];
        
        // Representative Workloads
        const workloads = [
          { name: 'matrix', size: 150, jsRun: multiplyMatricesJS, wasmRun: multiplyMatricesWasm, gen: (size: number) => [generateDeterministicMatrix(size, 0), generateDeterministicMatrix(size, 1), size] },
          { name: 'sort', size: 3000, jsRun: mergeSortJS, wasmRun: mergeSortWasm, gen: (size: number) => [generateSortInput(size)] },
          { name: 'sha256', size: 10000, jsRun: sha256JS, wasmRun: sha256Wasm, gen: (size: number) => [generateSha256Input(size)] }
        ];

        // 1. Warmup and Measurement candidates
        for (const wl of workloads) {
          const inputArgs = wl.gen(wl.size);
          
          for (const warmup of [3, 5]) {
            for (const measurement of [10, 30, 50]) {
              const config = { warmupIterations: warmup, measurementIterations: measurement };
              
              const jsStart = performance.now();
              const jsRes = await runBenchmark(() => (wl.jsRun as any)(...inputArgs), null, config);
              const jsEnd = performance.now();
              
              const wasmStart = performance.now();
              const wasmRes = await runBenchmark(() => (wl.wasmRun as any)(...inputArgs), null, config);
              const wasmEnd = performance.now();
              
              let totalZeros = 0;
              let jsCount = 0;
              let wasmCount = 0;
              if (jsRes.success) {
                  const zeros = jsRes.samples.filter((s: any) => s.elapsedMs === 0).length;
                  totalZeros += zeros;
                  jsCount = jsRes.samples.length;
              }
              if (wasmRes.success) {
                  const zeros = wasmRes.samples.filter((s: any) => s.elapsedMs === 0).length;
                  totalZeros += zeros;
                  wasmCount = wasmRes.samples.length;
              }

              feasibilityResults.push({
                workload: wl.name,
                size: wl.size,
                warmup,
                measurement,
                jsSuccess: jsRes.success,
                wasmSuccess: wasmRes.success,
                jsError: !jsRes.success ? (jsRes as any).error.toString() : null,
                wasmError: !wasmRes.success ? (wasmRes as any).error.toString() : null,
                jsMedian: jsRes.success ? jsRes.stats.median : null,
                wasmMedian: wasmRes.success ? wasmRes.stats.median : null,
                jsMeasurementCount: jsCount,
                wasmMeasurementCount: wasmCount,
                totalZeros
              });
            }
          }
        }
        
        // 2. Option A: Counterbalanced mode order (Engineering test)
        setStatus('Running Option A PoC');
        const optionAResults: any[] = [];
        const wl = workloads[0]; // Matrix 150
        const inputArgs = wl.gen(wl.size);
        const config = { warmupIterations: 5, measurementIterations: 30 };
        
        // Import adaptive components dynamically to avoid top-level issues
        const { analyzeWorkload } = await import('@/core/selection/analyzer');
        const { selectRuntime } = await import('@/core/selection/selector');
        // We need a frozen policy. Since we shouldn't change core, we can just construct one here.
        // Or import the existing one from Phase 3 fixture.
        const { uiPolicyFixture } = await import('@/core/fixtures/policy');
        
        const orders = [
          ['js', 'wasm', 'adaptive'],
          ['wasm', 'adaptive', 'js'],
          ['adaptive', 'js', 'wasm']
        ];
        
        for (let rep = 0; rep < orders.length; rep++) {
          const repRes: any = { order: orders[rep], results: {} };
          for (const mode of orders[rep]) {
            let res: any;
            let selection: string | null = null;
            let overhead: number | null = null;
            let error: string | null = null;

            if (mode === 'js') {
                res = await runBenchmark(() => (wl.jsRun as any)(...inputArgs), null, config);
            } else if (mode === 'wasm') {
                res = await runBenchmark(() => (wl.wasmRun as any)(...inputArgs), null, config);
            } else if (mode === 'adaptive') {
                res = await runBenchmark(async () => {
                    const startOv = performance.now();
                    const profile = analyzeWorkload('matrix', wl.size);
                    const selected = selectRuntime(profile, uiPolicyFixture);
                    const endOv = performance.now();
                    if (!overhead) {
                        overhead = endOv - startOv;
                        selection = selected;
                    }
                    if (selected === 'wasm') {
                        return (wl.wasmRun as any)(...inputArgs);
                    } else {
                        return (wl.jsRun as any)(...inputArgs);
                    }
                }, null, config);
            }

            repRes.results[mode] = {
                success: res.success,
                median: res.success ? res.stats.median : null,
                selection,
                overheadMs: overhead,
                error: !res.success ? res.error.toString() : null
            };
          }
          optionAResults.push(repRes);
        }

        setResults({ feasibility: feasibilityResults, optionA: optionAResults });
        setStatus('Complete');
      } catch (err: any) {
        setStatus(`Failed: ${err.message}`);
      }
    }

    async function runOptionB(mode: string) {
        setStatus(`Running Option B mode: ${mode}`);
        try {
            await initWasm();
            const wl = { name: 'matrix', size: 150, jsRun: multiplyMatricesJS, wasmRun: multiplyMatricesWasm, gen: (size: number) => [generateDeterministicMatrix(size, 0), generateDeterministicMatrix(size, 1), size] };
            const inputArgs = wl.gen(wl.size);
            const config = { warmupIterations: 5, measurementIterations: 30 };
            
            let res: any;
            if (mode === 'js') {
                res = await runBenchmark(() => (wl.jsRun as any)(...inputArgs), null, config);
            } else if (mode === 'wasm') {
                res = await runBenchmark(() => (wl.wasmRun as any)(...inputArgs), null, config);
            }

            setResults({ 
                workload: wl.name,
                size: wl.size,
                mode,
                warmup: config.warmupIterations,
                measurement: config.measurementIterations,
                success: res.success,
                median: res.success ? res.stats.median : null,
                sampleCount: res.success ? res.samples.length : 0,
                error: !res.success ? res.error.toString() : null
            });
            setStatus('OptionB_Complete');
        } catch (err: any) {
            setStatus(`OptionB_Failed: ${err.message}`);
        }
    }
    
    if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        if (params.get('run') === 'true') {
            runPilot();
        } else if (params.get('optionB')) {
            runOptionB(params.get('optionB')!);
        }
    }
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Phase 5B Engineering Pilot Runner</h1>
      <p id="pilot-status">Status: {status}</p>
      <pre id="pilot-results" className="bg-gray-100 p-4 mt-4 text-xs overflow-auto h-96">
        {JSON.stringify(results, null, 2)}
      </pre>
    </div>
  );
}
