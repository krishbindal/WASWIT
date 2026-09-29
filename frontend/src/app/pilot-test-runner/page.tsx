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
          { name: 'matrix', size: 150, jsRun: multiplyMatricesJS, wasmRun: multiplyMatricesWasm, gen: (size: number) => [generateDeterministicMatrix(size, 0), generateDeterministicMatrix(size, 1)] },
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
              
              let zeroCount = 0;
              if (jsRes.success) zeroCount += jsRes.samples.filter(s => s.elapsedMs === 0).length;
              if (wasmRes.success) zeroCount += wasmRes.samples.filter(s => s.elapsedMs === 0).length;

              feasibilityResults.push({
                workload: wl.name,
                size: wl.size,
                warmup,
                measurement,
                jsMedian: jsRes.success ? jsRes.stats.median : null,
                wasmMedian: wasmRes.success ? wasmRes.stats.median : null,
                jsWallClockMs: jsEnd - jsStart,
                wasmWallClockMs: wasmEnd - wasmStart,
                totalZeros: zeroCount,
                success: jsRes.success && wasmRes.success
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
        
        const orders = [
          ['js', 'wasm'],    // We only have JS and Wasm in this direct runner without full Adaptive wiring
          ['wasm', 'js']
        ];
        
        for (let rep = 0; rep < orders.length; rep++) {
          const repRes: any = { rep, order: orders[rep], results: {} };
          for (const mode of orders[rep]) {
            const runner = mode === 'js' ? wl.jsRun : wl.wasmRun;
            const res = await runBenchmark(() => (runner as any)(...inputArgs), null, config);
            repRes.results[mode] = res.success ? res.stats.median : null;
          }
          optionAResults.push(repRes);
        }

        setResults({ feasibility: feasibilityResults, optionA: optionAResults });
        setStatus('Complete');
      } catch (err: any) {
        setStatus(`Failed: ${err.message}`);
      }
    }
    
    if (typeof window !== 'undefined' && window.location.search.includes('run=true')) {
        runPilot();
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
