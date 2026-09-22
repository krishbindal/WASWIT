import React from 'react';
import { ExperimentMetadata } from '@/core/research/types';
import { EmptyState } from './EmptyState';

export function ExperimentalMetadata({ metadata }: { metadata: ExperimentMetadata | null }) {
  if (!metadata) {
    return <EmptyState message="No experimental results available yet" />;
  }

  return (
    <div className="p-4 border rounded bg-white shadow-sm">
      <h3 className="font-semibold mb-2">Experimental Metadata</h3>
      <table className="w-full text-left text-sm border-collapse">
        <tbody>
          <tr className="border-b"><th className="p-2 w-1/3 bg-gray-50 font-medium">Browser</th><td className="p-2">{metadata.browser}</td></tr>
          <tr className="border-b"><th className="p-2 bg-gray-50 font-medium">OS</th><td className="p-2">{metadata.os}</td></tr>
          <tr className="border-b"><th className="p-2 bg-gray-50 font-medium">CPU</th><td className="p-2">{metadata.cpu}</td></tr>
          <tr className="border-b"><th className="p-2 bg-gray-50 font-medium">RAM</th><td className="p-2">{metadata.ram}</td></tr>
          <tr><th className="p-2 bg-gray-50 font-medium">Timestamp</th><td className="p-2 font-mono">{metadata.timestamp}</td></tr>
        </tbody>
      </table>
    </div>
  );
}
