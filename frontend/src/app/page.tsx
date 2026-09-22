'use client';

import React, { useEffect, useState } from 'react';
import { generateDeterministicMatrix, multiplyMatricesJS } from '@/core/workloads/matrix';
import { generateSortInput, mergeSortJS } from '@/core/workloads/sort';
import { generateSha256Input, sha256JS } from '@/core/workloads/sha256';
import { initWasm, multiplyMatricesWasm, mergeSortWasm, sha256Wasm } from '@/core/workloads/wasm';

export default function Home() {
  const [parityStatus, setParityStatus] = useState<string>('RUNNING');
  const [jsResultStr, setJsResultStr] = useState<string>('');
  const [wasmResultStr, setWasmResultStr] = useState<string>('');
  const [sortParityStatus, setSortParityStatus] = useState<string>('RUNNING');
  const [sha256ParityStatus, setSha256ParityStatus] = useState<string>('RUNNING');
  
  useEffect(() => {
    async function runParity() {
      try {
        await initWasm();
        
        let matrixPassed = true;
        let sortPassed = true;
        let sha256Passed = true;

        // --- MATRIX PARITY ---
        const n1 = 3;
        const a1 = generateDeterministicMatrix(n1, 0);
        const b1 = generateDeterministicMatrix(n1, 5);
        
        const jsResult1 = multiplyMatricesJS(a1, b1, n1);
        const wasmResult1 = await multiplyMatricesWasm(a1, b1, n1);
        
        const jsString1 = Array.from(jsResult1).join(', ');
        const wasmString1 = Array.from(wasmResult1).join(', ');
        
        setJsResultStr(`[ ${jsString1} ]`);
        setWasmResultStr(`[ ${wasmString1} ]`);
        
        if (jsString1 !== wasmString1) matrixPassed = false;

        const a2 = new Float32Array([42.0]);
        const b2 = new Float32Array([2.0]);
        const jsResult2 = multiplyMatricesJS(a2, b2, 1);
        const wasmResult2 = await multiplyMatricesWasm(a2, b2, 1);
        if (jsResult2[0] !== 84.0 || wasmResult2[0] !== 84.0) matrixPassed = false;

        try { multiplyMatricesJS(a1, b1, 2); } catch (_) {}
        try { await multiplyMatricesWasm(a1, b1, 2); } catch (_) {}
        
        setParityStatus(matrixPassed ? 'PASS' : 'FAIL');

        // --- SORT PARITY ---
        const sortInput = generateSortInput(20);
        const jsSortResult = mergeSortJS(sortInput);
        const wasmSortResult = await mergeSortWasm(sortInput);
        const jsSortStr = Array.from(jsSortResult).join(', ');
        const wasmSortStr = Array.from(wasmSortResult).join(', ');
        if (jsSortStr !== wasmSortStr) sortPassed = false;
        
        // Also check if actually sorted
        for (let i = 1; i < jsSortResult.length; i++) {
          if (jsSortResult[i] < jsSortResult[i-1]) sortPassed = false;
        }

        setSortParityStatus(sortPassed ? 'PASS' : 'FAIL');

        // --- SHA-256 PARITY ---
        const shaInput = generateSha256Input(100);
        const jsShaResult = sha256JS(shaInput);
        const wasmShaResult = await sha256Wasm(shaInput);
        const jsShaStr = Array.from(jsShaResult).join(',');
        const wasmShaStr = Array.from(wasmShaResult).join(',');
        if (jsShaStr !== wasmShaStr) sha256Passed = false;
        if (jsShaResult.length !== 32) sha256Passed = false;

        setSha256ParityStatus(sha256Passed ? 'PASS' : 'FAIL');

      } catch (e) {
        console.error(e);
        setParityStatus('ERROR');
        setSortParityStatus('ERROR');
        setSha256ParityStatus('ERROR');
      }
    }
    
    runParity();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center p-24 font-[family-name:var(--font-geist-sans)]">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">WASWIT</h1>
        <p className="text-xl text-gray-600">
          Workload-Aware Intelligent Selection between JavaScript and WebAssembly
        </p>
        <div className="mt-4 inline-block bg-yellow-100 text-yellow-800 px-4 py-2 rounded-md font-medium text-sm">
          System currently under development
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <section className="border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Workload Parity Tests</h2>
          
          <div className="mb-6 p-4 border rounded">
            <h3 className="font-semibold text-lg mb-2">Matrix Multiplication (N=3)</h3>
            <div className="mb-2 text-sm text-gray-600 font-mono break-all js-result">JS: {jsResultStr || 'Computing...'}</div>
            <div className="mb-3 text-sm text-gray-600 font-mono break-all wasm-result">Wasm: {wasmResultStr || 'Computing...'}</div>
            <div><strong>Parity: </strong><span className={`font-bold parity-status ${parityStatus === 'PASS' ? 'text-green-600' : 'text-red-600'}`}>{parityStatus}</span></div>
          </div>

          <div className="mb-6 p-4 border rounded">
            <h3 className="font-semibold text-lg mb-2">Merge Sort (N=20)</h3>
            <div><strong>Parity: </strong><span className={`font-bold sort-parity-status ${sortParityStatus === 'PASS' ? 'text-green-600' : 'text-red-600'}`}>{sortParityStatus}</span></div>
          </div>

          <div className="p-4 border rounded">
            <h3 className="font-semibold text-lg mb-2">SHA-256 Hash (N=100)</h3>
            <div><strong>Parity: </strong><span className={`font-bold sha256-parity-status ${sha256ParityStatus === 'PASS' ? 'text-green-600' : 'text-red-600'}`}>{sha256ParityStatus}</span></div>
          </div>
        </section>

        <section className="border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Results Dashboard</h2>
          <div className="text-gray-500 italic">
            <p>Placeholder: Measurement results and visualization will go here.</p>
            <p className="text-sm mt-2">(e.g., Execution Time, Throughput, Charts)</p>
          </div>
        </section>
      </div>
    </main>
  );
}
