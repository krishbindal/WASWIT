import React, { useState } from 'react';
import { WorkloadId } from '@/core/types';
import { EvaluationConfig, EvaluationRun } from '@/core/evaluation/types';
import { runEvaluation } from '@/core/evaluation/engine';
import { WorkloadPolicy, SelectionPolicy } from '@/core/selection/types';

interface EvaluationControlProps {
  workloadId: WorkloadId;
  policy: WorkloadPolicy | null;
  onEvaluationComplete: (run: EvaluationRun) => void;
}

export function EvaluationControl({ workloadId, policy, onEvaluationComplete }: EvaluationControlProps) {
  const [status, setStatus] = useState<'Idle' | 'Preparing' | 'Running' | 'Completed' | 'Failed'>('Idle');
  const [error, setError] = useState<string | null>(null);
  const [completedRun, setCompletedRun] = useState<EvaluationRun | null>(null);

  const defaultGrids: Record<WorkloadId, number[]> = {
    matrix: [50, 150, 250],
    sort: [1500, 2500, 3500],
    sha256: [1000, 5000, 10000]
  };

  const handleRun = async () => {
    if (!policy) {
      setError("No frozen policy available. Cannot run evaluation.");
      return;
    }
    
    setStatus('Preparing');
    setError(null);

    const config: EvaluationConfig = {
      workloadId,
      evaluationGridSizes: defaultGrids[workloadId],
      warmupIterations: 3,
      measurementIterations: 10,
      generationOffset: 42 
    };

    const fullPolicy: SelectionPolicy = {
      version: 'eval',
      derivationRule: 'eval',
      workloads: {
        [workloadId]: policy
      }
    };

    try {
      let finalRun: EvaluationRun | null = null;
      for await (const runUpdate of runEvaluation(config, fullPolicy, `eval-${Date.now()}`)) {
        setStatus(runUpdate.status);
        finalRun = runUpdate;
      }
      
      if (finalRun) {
        onEvaluationComplete(finalRun);
        setCompletedRun(finalRun);
        setStatus('Completed');
      }
    } catch (err) {
      setError(String(err));
      setStatus('Failed');
    }
  };

  const handleExport = () => {
    if (!completedRun) return;
    const blob = new Blob([JSON.stringify(completedRun, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `waswit-evaluation-${workloadId}-${completedRun.experimentRunId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 border rounded bg-white shadow-sm space-y-4">
      <div className="flex justify-between items-center border-b pb-2">
        <h3 className="font-semibold text-lg">Phase 4B: Independent Evaluation</h3>
        <span className={`px-2 py-1 rounded text-xs font-semibold ${
          status === 'Idle' ? 'bg-gray-100 text-gray-800' :
          status === 'Running' || status === 'Preparing' ? 'bg-blue-100 text-blue-800 animate-pulse' :
          status === 'Completed' ? 'bg-green-100 text-green-800' :
          'bg-red-100 text-red-800'
        }`}>
          {status}
        </span>
      </div>
      
      <div className="text-sm text-gray-600">
        <p>This engine performs an independent scientific evaluation of the selected workload using an explicitly defined evaluation grid separated from calibration data.</p>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={handleRun}
          disabled={status === 'Running' || status === 'Preparing' || !policy}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {status === 'Running' ? 'Evaluating...' : 'Run Independent Evaluation'}
        </button>

        {status === 'Completed' && completedRun && (
          <button
            onClick={handleExport}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
          >
            Export JSON
          </button>
        )}
      </div>

      {error && (
        <div className="p-2 bg-red-50 text-red-700 text-sm rounded border border-red-200">
          Error: {error}
        </div>
      )}
    </div>
  );
}
