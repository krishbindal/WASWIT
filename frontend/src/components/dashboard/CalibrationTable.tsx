import React from 'react';
import { CalibrationRecord } from '@/core/calibration/types';
import { EmptyState } from './EmptyState';

export function CalibrationTable({ record }: { record: CalibrationRecord | null }) {
  if (!record) {
    return <EmptyState message="No experimental results available yet" />;
  }

  return (
    <div className="p-4 border rounded bg-white shadow-sm overflow-x-auto">
      <h3 className="font-semibold mb-2">Calibration Evidence</h3>
      <table className="w-full text-left border-collapse text-sm min-w-max">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="p-2">Input Size</th>
            <th className="p-2">JS Median (ms)</th>
            <th className="p-2">Wasm Median (ms)</th>
            <th className="p-2">Derived Preference</th>
          </tr>
        </thead>
        <tbody>
          {record.results.map((pt, idx) => (
            <tr key={idx} className="border-b hover:bg-gray-50 transition-colors">
              <td className="p-2 font-mono">{pt.inputSize}</td>
              <td className="p-2 font-mono">{pt.jsStats?.median?.toFixed(4) ?? 'N/A'}</td>
              <td className="p-2 font-mono">{pt.wasmStats?.median?.toFixed(4) ?? 'N/A'}</td>
              <td className="p-2 capitalize">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  pt.preferredRuntime === 'javascript' ? 'bg-yellow-100 text-yellow-800' :
                  pt.preferredRuntime === 'wasm' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {pt.preferredRuntime === 'javascript' ? 'JavaScript' : pt.preferredRuntime === 'wasm' ? 'WebAssembly' : 'Tie'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
