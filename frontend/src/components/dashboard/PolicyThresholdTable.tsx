import React from 'react';
import { WorkloadPolicy } from '@/core/selection/types';
import { EmptyState } from './EmptyState';

export function PolicyThresholdTable({ policy }: { policy: WorkloadPolicy | null }) {
  if (!policy) {
    return <EmptyState message="No experimental results available yet" />;
  }

  const rules = policy.rules;
  if (rules.length === 0) {
    return (
      <div className="p-4 border rounded bg-white shadow-sm">
        <h3 className="font-semibold mb-2">Threshold Table</h3>
        <p className="text-sm">Default Runtime: <strong>{policy.defaultRuntime === 'javascript' ? 'JavaScript' : 'WebAssembly'}</strong> for all sizes.</p>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded bg-white shadow-sm">
      <h3 className="font-semibold mb-2">Threshold Table</h3>
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="p-2">Input Range</th>
            <th className="p-2">Selected Runtime</th>
          </tr>
        </thead>
        <tbody>
          {rules.map((rule, idx) => {
            const range = idx === 0 ? `<= ${rule.maxInputSize}` : `> ${rules[idx - 1].maxInputSize} and <= ${rule.maxInputSize}`;
            const runtimeLabel = rule.runtime === 'javascript' ? 'JavaScript' : 'WebAssembly';
            return (
              <tr key={idx} className="border-b">
                <td className="p-2 font-mono">{range}</td>
                <td className="p-2">{runtimeLabel}</td>
              </tr>
            );
          })}
          <tr>
            <td className="p-2 font-mono">{`> ${rules[rules.length - 1].maxInputSize}`}</td>
            <td className="p-2">{policy.defaultRuntime === 'javascript' ? 'JavaScript' : 'WebAssembly'}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
