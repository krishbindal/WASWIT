'use client';

import React, { useState } from 'react';
import { WorkloadId } from '@/core/types';
import { WorkloadSelector } from './WorkloadSelector';
import { WorkloadSummary } from './WorkloadSummary';
import { PolicySummary } from './PolicySummary';
import { PolicyThresholdTable } from './PolicyThresholdTable';
import { BenchmarkChart } from './BenchmarkChart';
import { CalibrationTable } from './CalibrationTable';
import { ExperimentalMetadata } from './ExperimentalMetadata';
import { VisualizationDataTable } from './VisualizationDataTable';
import { ResearchRun } from '@/core/research/types';

interface DashboardShellProps {
  runs: Partial<Record<WorkloadId, ResearchRun>>;
}

export function DashboardShell({ runs }: DashboardShellProps) {
  const [activeWorkload, setActiveWorkload] = useState<WorkloadId>('matrix');
  const activeRun = runs[activeWorkload];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 text-gray-800">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h2 className="text-3xl font-bold">Research Dashboard</h2>
          <div className="flex gap-2 mt-2">
            <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-semibold">Phase 3 Certified</span>
            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-semibold">Phase 4A UI</span>
            {activeRun?.policy ? (
              <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded text-xs font-semibold">Policy Loaded</span>
            ) : (
              <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-xs font-semibold">No Policy</span>
            )}
          </div>
        </div>
      </div>

      <WorkloadSelector selected={activeWorkload} onSelect={setActiveWorkload} />
      
      <WorkloadSummary workloadId={activeWorkload} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <PolicySummary 
            policy={activeRun?.policy || null} 
            version={activeRun?.policyVersion || null}
            derivationRule={activeRun?.policyDerivationRule || null}
          />
          <PolicyThresholdTable policy={activeRun?.policy || null} />
          <ExperimentalMetadata metadata={activeRun?.metadata || null} />
        </div>
        
        <div className="space-y-6">
          <CalibrationTable record={activeRun?.calibrationData || null} />
          <BenchmarkChart data={activeRun?.visualizations || []} />
          <VisualizationDataTable data={activeRun?.visualizations || []} />
        </div>
      </div>
    </div>
  );
}
