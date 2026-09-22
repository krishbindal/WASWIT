'use client';

import React, { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { mockPolicyFixture } from '@/core/fixtures/policy';
import { generateDeterministicMatrix, multiplyMatricesJS } from '@/core/workloads/matrix';
import { generateSortInput, mergeSortJS } from '@/core/workloads/sort';
import { generateSha256Input, sha256JS } from '@/core/workloads/sha256';
import { initWasm, multiplyMatricesWasm, mergeSortWasm, sha256Wasm } from '@/core/workloads/wasm';

function toHex(buffer: Uint8Array): string {
  return Array.from(buffer)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export default function Home() {
  const [parityStatus, setParityStatus] = useState<string>('RUNNING');
  const [jsResultStr, setJsResultStr] = useState<string>('');
  const [wasmResultStr, setWasmResultStr] = useState<string>('');
  
  const [sortParityStatus, setSortParityStatus] = useState<string>('RUNNING');
  const [sortJsResultStr, setSortJsResultStr] = useState<string>('');
  const [sortWasmResultStr, setSortWasmResultStr] = useState<string>('');

  const [sha256ParityStatus, setSha256ParityStatus] = useState<string>('RUNNING');
  const [sha256JsResultStr, setSha256JsResultStr] = useState<string>('');
  const [sha256WasmResultStr, setSha256WasmResultStr] = useState<string>('');
  
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

        try { multiplyMatricesJS(a1, b1, 2); } catch {}
        try { await multiplyMatricesWasm(a1, b1, 2); } catch {}
        
        setParityStatus(matrixPassed ? 'PASS' : 'FAIL');

        // --- SORT PARITY ---
        const sortNs = [0, 1, 2, 20, 100];
        const sortJsOut: string[] = [];
        const sortWasmOut: string[] = [];

        for (const n of sortNs) {
          const sortInput = generateSortInput(n);
          const jsSortResult = mergeSortJS(sortInput);
          const wasmSortResult = await mergeSortWasm(sortInput);
          
          const jsSortStr = Array.from(jsSortResult).join(',');
          const wasmSortStr = Array.from(wasmSortResult).join(',');
          
          sortJsOut.push(`N${n}:[${jsSortStr}]`);
          sortWasmOut.push(`N${n}:[${wasmSortStr}]`);

          if (jsSortStr !== wasmSortStr) sortPassed = false;
          
          for (let i = 1; i < jsSortResult.length; i++) {
            if (jsSortResult[i] < jsSortResult[i-1]) sortPassed = false;
          }
        }
        
        setSortJsResultStr(sortJsOut.join(' | '));
        setSortWasmResultStr(sortWasmOut.join(' | '));
        setSortParityStatus(sortPassed ? 'PASS' : 'FAIL');

        // --- SHA-256 PARITY ---
        const shaNs = [0, 3, 55, 56, 57, 64, 65, 100, 127, 128, 129];
        const shaJsOut: string[] = [];
        const shaWasmOut: string[] = [];

        for (const n of shaNs) {
          const shaInput = generateSha256Input(n);
          const jsShaResult = sha256JS(shaInput);
          const wasmShaResult = await sha256Wasm(shaInput);
          
          const jsShaStr = toHex(jsShaResult);
          const wasmShaStr = toHex(wasmShaResult);
          
          shaJsOut.push(`N${n}:${jsShaStr}`);
          shaWasmOut.push(`N${n}:${wasmShaStr}`);
          
          if (jsShaStr !== wasmShaStr) sha256Passed = false;
          if (jsShaResult.length !== 32) sha256Passed = false;
        }

        setSha256JsResultStr(shaJsOut.join(' | '));
        setSha256WasmResultStr(shaWasmOut.join(' | '));
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
    <main className="flex min-h-screen flex-col items-center p-8 font-[family-name:var(--font-geist-sans)]">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">WASWIT</h1>
        <p className="text-xl text-gray-600">
          Workload-Aware Intelligent Selection between JavaScript and WebAssembly
        </p>
      </header>

      <div className="w-full max-w-6xl space-y-12">
        <DashboardShell runs={{}} frozenPolicy={mockPolicyFixture} />

        <section className="border border-gray-200 rounded-lg p-6 shadow-sm bg-white">
          <h2 className="text-2xl font-semibold mb-4">Workload Parity Tests</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 border rounded">
              <h3 className="font-semibold text-lg mb-2">Matrix Multiplication (N=3)</h3>
              <div className="mb-2 text-sm text-gray-600 font-mono break-all js-result">JS: {jsResultStr || 'Computing...'}</div>
              <div className="mb-3 text-sm text-gray-600 font-mono break-all wasm-result">Wasm: {wasmResultStr || 'Computing...'}</div>
              <div><strong>Parity: </strong><span className={`font-bold parity-status ${parityStatus === 'PASS' ? 'text-green-600' : 'text-red-600'}`}>{parityStatus}</span></div>
            </div>

            <div className="p-4 border rounded overflow-hidden">
              <h3 className="font-semibold text-lg mb-2">Merge Sort (Multi-N)</h3>
              <div className="mb-2 text-xs text-gray-600 font-mono truncate sort-js-result">JS: {sortJsResultStr || 'Computing...'}</div>
              <div className="mb-3 text-xs text-gray-600 font-mono truncate sort-wasm-result">Wasm: {sortWasmResultStr || 'Computing...'}</div>
              <div><strong>Parity: </strong><span className={`font-bold sort-parity-status ${sortParityStatus === 'PASS' ? 'text-green-600' : 'text-red-600'}`}>{sortParityStatus}</span></div>
            </div>

            <div className="p-4 border rounded overflow-hidden">
              <h3 className="font-semibold text-lg mb-2">SHA-256 Hash (Multi-N)</h3>
              <div className="mb-2 text-xs text-gray-600 font-mono truncate sha256-js-result">JS: {sha256JsResultStr || 'Computing...'}</div>
              <div className="mb-3 text-xs text-gray-600 font-mono truncate sha256-wasm-result">Wasm: {sha256WasmResultStr || 'Computing...'}</div>
              <div><strong>Parity: </strong><span className={`font-bold sha256-parity-status ${sha256ParityStatus === 'PASS' ? 'text-green-600' : 'text-red-600'}`}>{sha256ParityStatus}</span></div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
