import React from 'react';
import { WorkloadId } from '@/core/types';
import { WorkloadCharacteristics } from '@/core/selection/types';
import { analyzeWorkload } from '@/core/selection/analyzer';

export function WorkloadSummary({ workloadId }: { workloadId: WorkloadId }) {
  // We can analyze a sample small workload to show characteristics
  let chars: WorkloadCharacteristics | null = null;
  try {
    chars = analyzeWorkload(workloadId, 100);
  } catch {
    // Ignore if not supported
  }

  const descriptions: Record<WorkloadId, string> = {
    matrix: 'Dense floating-point arithmetic (O(N³)).',
    sort: 'Branch-heavy integer manipulation and memory movement (O(N log N)).',
    sha256: 'Bitwise operations and hashing algorithms over byte arrays (O(N)).'
  };

  return (
    <div className="p-4 border rounded bg-white shadow-sm mb-6">
      <h3 className="font-semibold text-lg mb-2 capitalize">{workloadId} Workload</h3>
      <p className="text-sm text-gray-600 mb-4">{descriptions[workloadId]}</p>
      
      {chars && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500 block">Derived Size</span>
            <span className="font-mono text-gray-800">{chars.derivedSize}</span>
          </div>
        </div>
      )}
    </div>
  );
}
