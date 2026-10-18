'use client';

import React, { useState } from 'react';
import { waswitRun, waswitPreload } from '../../core/sdk';
import { WaswitRunResult } from '../../core/sdk/types';
import { generateSortInput } from '../../core/workloads/sort';
import { generateSha256Input } from '../../core/workloads/sha256';
import { generateDeterministicMatrix } from '../../core/workloads/matrix';

export default function DeveloperPage() {
  const [workload, setWorkload] = useState<'matrix' | 'sort' | 'sha256'>('sort');
  const [inputSize, setInputSize] = useState<number>(5000);
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<WaswitRunResult<unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRun = async () => {
    setIsExecuting(true);
    setResult(null);
    setError(null);
    
    // Warm up the WASM module if this is the very first time
    await waswitPreload();

    try {
      let res: WaswitRunResult<unknown> | null = null;
      if (workload === 'matrix') {
        const n = Math.floor(inputSize);
        const a = generateDeterministicMatrix(n, 0);
        const b = generateDeterministicMatrix(n, 1);
        res = await waswitRun({
          workload: 'matrix',
          input: { a, b, n }
        });
      } else if (workload === 'sort') {
        const input = generateSortInput(Math.floor(inputSize));
        res = await waswitRun({
          workload: 'sort',
          input
        });
      } else if (workload === 'sha256') {
        const input = generateSha256Input(Math.floor(inputSize));
        res = await waswitRun({
          workload: 'sha256',
          input
        });
      }
      setResult(res);
    } catch (err: unknown) {
      setError((err as Error).message || 'An unknown error occurred.');
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50 text-gray-900">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="border-b pb-6">
          <h1 className="text-3xl font-bold">WASWIT Developer Integration</h1>
          <p className="text-gray-600 mt-2">
            Automatically select JavaScript or WebAssembly for supported computational workloads using a deterministic frozen policy.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Interactive Runner</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Workload</label>
                <select 
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
                  value={workload}
                  onChange={(e) => setWorkload(e.target.value as 'matrix' | 'sort' | 'sha256')}
                >
                  <option value="matrix">Matrix Multiplication</option>
                  <option value="sort">Merge Sort</option>
                  <option value="sha256">SHA-256</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Input Size (N or Length)</label>
                <input 
                  type="number" 
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
                  value={inputSize}
                  onChange={(e) => setInputSize(Number(e.target.value))}
                />
              </div>

              <button 
                onClick={handleRun}
                disabled={isExecuting}
                className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {isExecuting ? 'Executing...' : 'Run with WASWIT'}
              </button>

              {error && (
                <div className="p-3 bg-red-100 text-red-800 rounded text-sm">
                  {error}
                </div>
              )}
            </div>
          </section>

          <section className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Result</h2>
            {result ? (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Workload</span>
                  <span className="font-mono font-medium">{result.workload}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Input Size</span>
                  <span className="font-mono font-medium">{result.inputSize}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Selected Runtime</span>
                  <span className="font-mono font-medium text-blue-600">{result.runtime}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Selection Overhead</span>
                  <span className="font-mono font-medium">{result.selectionOverheadMs.toFixed(3)} ms</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Execution Time</span>
                  <span className="font-mono font-medium">{result.executionTimeMs.toFixed(3)} ms</span>
                </div>
                <div className="flex justify-between pb-2">
                  <span className="text-gray-600">Policy Version</span>
                  <span className="font-mono font-medium text-purple-600">{result.policyVersion}</span>
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-sm italic">
                Execute a workload to see results.
              </div>
            )}
          </section>
        </div>

        <section className="bg-gray-800 text-gray-100 p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Integration Example</h2>
          <p className="text-sm text-gray-300 mb-4">
            The developer supplies the workload and input. WASWIT analyzes the workload characteristics and applies its frozen empirical policy to select JavaScript or WebAssembly.
          </p>
          <pre className="bg-gray-900 p-4 rounded text-sm overflow-x-auto text-green-400">
            <code>
{`import { waswitRun } from 'waswit-sdk';

const result = await waswitRun({
  workload: 'sort',
  input: new Int32Array([5, 3, 4, 1, 2])
});

console.log(result.runtime); // e.g. "wasm"
console.log(result.result);  // sorted array`}
            </code>
          </pre>
        </section>

        <section className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Policy Scope &amp; Limitations</h2>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-2">
            <li>WASWIT does <strong>not</strong> use machine learning or artificial intelligence for runtime selection.</li>
            <li>The current policy is an <strong>empirical frozen policy</strong> derived from a specific evaluation environment (Blink/Chromium 138).</li>
            <li>The policy is deterministic and threshold-based. It is <strong>not guaranteed universally optimal</strong> across all hardware architectures or browsers.</li>
            <li>Developers deploying to production should recalibrate for their specific deployment environment before making production performance claims.</li>
            <li>Only supported computational workloads are currently exposed.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

