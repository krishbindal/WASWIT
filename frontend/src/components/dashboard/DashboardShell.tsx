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
import { EvaluationControl } from './EvaluationControl';
import { ResearchRun, VisualizationPoint } from '@/core/research/types';
import { EvaluationRun } from '@/core/evaluation/types';
import { FrozenSelectionPolicy } from '@/core/selection/types';

interface DashboardShellProps {
  runs: Partial<Record<WorkloadId, ResearchRun>>;
  frozenPolicy: FrozenSelectionPolicy | null;
}

export function DashboardShell({ runs, frozenPolicy }: DashboardShellProps) {
  const [activeWorkload, setActiveWorkload] = useState<WorkloadId>('matrix');
  const [evalRuns, setEvalRuns] = useState<Partial<Record<WorkloadId, EvaluationRun>>>({});
  
  const activeRun = runs[activeWorkload];
  const activeEvalRun = evalRuns[activeWorkload];

  // Map evalRun to VisualizationPoints for the charts
  const evalVisualizations: VisualizationPoint[] = activeEvalRun ? activeEvalRun.cases.map(c => ({
    inputSize: c.inputSize,
    jsMedian: c.jsSummary?.median,
    wasmMedian: c.wasmSummary?.median,
    adaptiveMedian: c.adaptiveSummary?.median,
  })) : [];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 text-gray-800">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h2 className="text-3xl font-bold">Research Dashboard</h2>
          <div className="flex gap-2 mt-2">
            <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-semibold">Phase 3 Certified</span>
            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-semibold">Phase 4A UI</span>
            <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded text-xs font-semibold">Phase 4B Eval</span>
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
      
      <EvaluationControl 
        workloadId={activeWorkload} 
        policy={frozenPolicy} 
        onEvaluationComplete={(run) => setEvalRuns(prev => ({ ...prev, [run.config.workloadId]: run }))}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <PolicySummary 
            policy={frozenPolicy?.workloads[activeWorkload] || null} 
            version={frozenPolicy?.version || null}
            derivationRule={frozenPolicy?.derivationRule || null}
          />
          <PolicyThresholdTable policy={frozenPolicy?.workloads[activeWorkload] || null} />
          <ExperimentalMetadata metadata={activeEvalRun?.environmentMetadata || activeRun?.metadata || null} />
        </div>
        
        <div className="space-y-6">
          <CalibrationTable record={activeRun?.calibrationData || null} />
          <BenchmarkChart data={evalVisualizations.length > 0 ? evalVisualizations : (activeRun?.visualizations || [])} />
          <VisualizationDataTable data={evalVisualizations.length > 0 ? evalVisualizations : (activeRun?.visualizations || [])} />
        </div>
      </div>
    </div>
  );
}
