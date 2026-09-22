import React from 'react';
import { WorkloadPolicy } from '@/core/selection/types';
import { EmptyState } from './EmptyState';

export function PolicySummary({ policy }: { policy: WorkloadPolicy | null }) {
  if (!policy) {
    return <EmptyState message="No experimental results available yet" />;
  }

  return (
    <div className="p-4 border rounded bg-white shadow-sm space-y-2">
      <h3 className="font-semibold text-lg border-b pb-2">Frozen Selection Policy</h3>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-500 block">Policy Version</span>
          <span className="font-mono text-gray-800">median-crossover-consistent-v2</span>
        </div>
        <div>
          <span className="text-gray-500 block">Default Runtime</span>
          <span className="font-medium text-gray-800">
            {policy.defaultRuntime === 'javascript' ? 'JavaScript' : 'WebAssembly'}
          </span>
        </div>
        <div>
          <span className="text-gray-500 block">Grid Sizes</span>
          <span className="font-mono text-gray-800 break-words">
            {policy.provenance.gridSizes.join(', ')}
          </span>
        </div>
        <div>
          <span className="text-gray-500 block">Iterations (Warmup / Measurement)</span>
          <span className="font-mono text-gray-800">
            {policy.provenance.warmupIterations} / {policy.provenance.measurementIterations}
          </span>
        </div>
      </div>
    </div>
  );
}
