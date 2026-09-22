'use client';
import React from 'react';
import { analyzeWorkload, freezePolicy, selectRuntime } from '../../core/selection';

export default function SelectorTestPage() {
  const result = React.useMemo(() => {
    try {
      const policy = freezePolicy({
        version: '1.0',
        derivationRule: 'test',
        workloads: {
          matrix: {
            workloadId: 'matrix',
            rules: [{ maxInputSize: 50, runtime: 'javascript' }],
            defaultRuntime: 'wasm',
            provenance: { gridSizes: [50, 100], warmupIterations: 1, measurementIterations: 1, timestamp: '1' }
          }
        }
      });

      const chars = analyzeWorkload('matrix', 10);
      const rt = selectRuntime(chars, policy);

      let jsCount = 0;
      let wasmCount = 0;

      const javascriptExecutor = () => { jsCount++; };
      const wasmExecutor = () => { wasmCount++; };

      if (rt === 'javascript') {
        javascriptExecutor();
      } else if (rt === 'wasm') {
        wasmExecutor();
      }

      return { type: 'success', data: { rt, js: jsCount, wasm: wasmCount } };
    } catch (e) {
      return { type: 'error', message: String(e) };
    }
  }, []);

  if (result.type === 'error') return <div>Error: {result.message}</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Selector Test Environment</h1>
      <p>This page verifies the pure selector executes exactly one execution path.</p>
      <div id="selector-result" style={{ fontWeight: 'bold', marginTop: '10px' }}>
        <div id="selector-runtime">Runtime: {result.data?.rt}</div>
        <div id="js-calls">JS Calls: {result.data?.js}</div>
        <div id="wasm-calls">Wasm Calls: {result.data?.wasm}</div>
      </div>
    </div>
  );
}
