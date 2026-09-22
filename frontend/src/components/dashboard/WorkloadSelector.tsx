import React from 'react';
import { WorkloadId } from '@/core/types';

interface WorkloadSelectorProps {
  selected: WorkloadId;
  onSelect: (id: WorkloadId) => void;
}

export function WorkloadSelector({ selected, onSelect }: WorkloadSelectorProps) {
  const workloads: { id: WorkloadId; label: string }[] = [
    { id: 'matrix', label: 'Matrix Multiplication' },
    { id: 'sort', label: 'Merge Sort' },
    { id: 'sha256', label: 'SHA-256' },
  ];

  return (
    <div className="flex space-x-2 mb-6">
      {workloads.map((wl) => (
        <button
          key={wl.id}
          onClick={() => onSelect(wl.id)}
          className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
            selected === wl.id
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-gray-700 border hover:bg-gray-50'
          }`}
        >
          {wl.label}
        </button>
      ))}
    </div>
  );
}
