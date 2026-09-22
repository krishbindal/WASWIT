'use client';
import React from 'react';
import { analyzeWorkload, freezePolicy, selectRuntime } from '../../core/selection';

export default function SelectorTestPage() {
  const rt = React.useMemo(() => {
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
      return selectRuntime(chars, policy);
    } catch (e) {
      return `error: ${e}`;
    }
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Selector Test Environment</h1>
      <p>This page verifies the pure selector executes without side effects in a browser environment.</p>
      <div id="selector-result" style={{ fontWeight: 'bold', marginTop: '10px' }}>
        Runtime: {rt}
      </div>
    </div>
  );
}
