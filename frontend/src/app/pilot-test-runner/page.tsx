'use client';
import { useEffect, useState } from 'react';
import { runBenchmark } from '@/core/benchmark/engine';
import { multiplyMatricesJS, generateDeterministicMatrix } from '@/core/workloads/matrix';
import { mergeSortJS, generateSortInput } from '@/core/workloads/sort';
import { sha256JS, generateSha256Input } from '@/core/workloads/sha256';
import { initWasm, multiplyMatricesWasm, mergeSortWasm, sha256Wasm } from '@/core/workloads/wasm';

export default function PilotTestRunner() {
  const [results, setResults] = useState<any[]>([]);
  const [status, setStatus] = useState('Idle');

  useEffect(() => {
    async function runPilot() {
      setStatus('Running');
      try {
        await initWasm();
        const res: any[] = [];
        const sizes = {
          matrix: [50, 150, 300],
          sort: [1000, 3000, 5000],
          sha256: [1000, 10000, 20000]
        };
        const config = { warmupIterations: 3, measurementIterations: 10 };

        for (const size of sizes.matrix) {
          const inputA = generateDeterministicMatrix(size, 0);
          const inputB = generateDeterministicMatrix(size, 1);
          const js = await runBenchmark(() => multiplyMatricesJS(inputA, inputB, size), null, config);
          const wasm = await runBenchmark(() => multiplyMatricesWasm(inputA, inputB, size), null, config);
          res.push({ workload: 'matrix', size, js: js.success ? js.stats.median : null, wasm: wasm.success ? wasm.stats.median : null });
        }

        for (const size of sizes.sort) {
          const input = generateSortInput(size);
          const js = await runBenchmark(() => mergeSortJS(input), null, config);
          const wasm = await runBenchmark(() => mergeSortWasm(input), null, config);
          res.push({ workload: 'sort', size, js: js.success ? js.stats.median : null, wasm: wasm.success ? wasm.stats.median : null });
        }

        for (const size of sizes.sha256) {
          const input = generateSha256Input(size);
          const js = await runBenchmark(() => sha256JS(input), null, config);
          const wasm = await runBenchmark(() => sha256Wasm(input), null, config);
          res.push({ workload: 'sha256', size, js: js.success ? js.stats.median : null, wasm: wasm.success ? wasm.stats.median : null });
        }

        setResults(res);
        setStatus('Complete');
      } catch (err: any) {
        setStatus(`Failed: ${err.message}`);
      }
    }
    
    // Auto-run if URL param triggers it
    if (typeof window !== 'undefined' && window.location.search.includes('run=true')) {
        runPilot();
    }
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Phase 5B Engineering Pilot Runner</h1>
      <p id="pilot-status">Status: {status}</p>
      <pre id="pilot-results" className="bg-gray-100 p-4 mt-4">
        {JSON.stringify(results, null, 2)}
      </pre>
    </div>
  );
}
