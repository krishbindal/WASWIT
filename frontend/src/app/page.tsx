'use client';

import React, { useEffect, useState } from 'react';
import { generateDeterministicMatrix, multiplyMatricesJS } from '@/core/workloads/matrix';
import { initWasm, multiplyMatricesWasm } from '@/core/workloads/wasm';

export default function Home() {
  const [parityStatus, setParityStatus] = useState<string>('RUNNING');
  const [jsResultStr, setJsResultStr] = useState<string>('');
  const [wasmResultStr, setWasmResultStr] = useState<string>('');
  
  useEffect(() => {
    async function runParity() {
      try {
        await initWasm();
        
        let allPassed = true;

        // Test 1: 3x3 Deterministic
        const n1 = 3;
        const a1 = generateDeterministicMatrix(n1, 0);
        const b1 = generateDeterministicMatrix(n1, 5);
        
        const jsResult1 = multiplyMatricesJS(a1, b1, n1);
        const wasmResult1 = await multiplyMatricesWasm(a1, b1, n1);
        
        const jsString1 = Array.from(jsResult1).join(', ');
        const wasmString1 = Array.from(wasmResult1).join(', ');
        
        setJsResultStr(`[ ${jsString1} ]`);
        setWasmResultStr(`[ ${wasmString1} ]`);
        
        if (jsString1 !== wasmString1) allPassed = false;

        // Test 2: 1x1 Edge Case
        const a2 = new Float32Array([42.0]);
        const b2 = new Float32Array([2.0]);
        const jsResult2 = multiplyMatricesJS(a2, b2, 1);
        const wasmResult2 = await multiplyMatricesWasm(a2, b2, 1);
        if (jsResult2[0] !== 84.0 || wasmResult2[0] !== 84.0) allPassed = false;

        // Test 3: Invalid dimensions (Error handling parity)
        let jsError = false;
        let wasmError = false;
        try {
          multiplyMatricesJS(a1, b1, 2); // n=2 but arrays are length 9
        } catch (e) {
          jsError = true;
        }
        try {
          await multiplyMatricesWasm(a1, b1, 2);
        } catch (e) {
          wasmError = true;
        }
        if (jsError !== wasmError) allPassed = false;

        if (allPassed) {
          setParityStatus('PASS');
        } else {
          setParityStatus('FAIL');
        }
      } catch (e) {
        console.error(e);
        setParityStatus('ERROR');
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
          <h2 className="text-2xl font-semibold mb-4">Workload Parity Test</h2>
          <div className="mb-4">
            <strong>Workload:</strong> Matrix Multiplication<br/>
            <strong>N = </strong> 3
          </div>
          <div className="mb-2">
            <strong>JavaScript Result:</strong><br/>
            <span className="text-sm text-gray-600 font-mono break-all js-result">{jsResultStr || 'Computing...'}</span>
          </div>
          <div className="mb-4">
            <strong>WebAssembly Result:</strong><br/>
            <span className="text-sm text-gray-600 font-mono break-all wasm-result">{wasmResultStr || 'Computing...'}</span>
          </div>
          <div className="p-3 bg-gray-50 rounded border">
            <strong>Parity: </strong>
            <span className={`font-bold parity-status ${parityStatus === 'PASS' ? 'text-green-600' : 'text-red-600'}`}>
              {parityStatus}
            </span>
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
