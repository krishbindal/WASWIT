import React, { useState } from 'react';
import { VisualizationPoint } from '@/core/research/types';
import { EmptyState } from './EmptyState';

export function RawDataTable({ data }: { data: VisualizationPoint[] }) {
  const [expanded, setExpanded] = useState(false);

  if (!data || data.length === 0) {
    return <EmptyState message="No experimental results available yet" />;
  }

  const displayData = expanded ? data : data.slice(0, 5);

  return (
    <div className="p-4 border rounded bg-white shadow-sm overflow-x-auto">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold">Raw Measurement Summary</h3>
        {data.length > 5 && (
          <button 
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-blue-600 hover:underline"
          >
            {expanded ? 'Show Less' : `Show All (${data.length})`}
          </button>
        )}
      </div>
      <table className="w-full text-left border-collapse text-sm min-w-max">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="p-2">Input Size</th>
            <th className="p-2">JS Median (ms)</th>
            <th className="p-2">Wasm Median (ms)</th>
            <th className="p-2">WASWIT Median (ms)</th>
          </tr>
        </thead>
        <tbody>
          {displayData.map((pt, idx) => (
            <tr key={idx} className="border-b hover:bg-gray-50 transition-colors">
              <td className="p-2 font-mono">{pt.inputSize}</td>
              <td className="p-2 font-mono">{pt.jsMedian?.toFixed(4) ?? 'N/A'}</td>
              <td className="p-2 font-mono">{pt.wasmMedian?.toFixed(4) ?? 'N/A'}</td>
              <td className="p-2 font-mono">{pt.adaptiveMedian?.toFixed(4) ?? 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
