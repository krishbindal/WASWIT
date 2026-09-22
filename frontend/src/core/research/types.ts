import { WorkloadId } from '@/core/types';
import { CalibrationRecord } from '@/core/calibration/types';
import { WorkloadPolicy } from '@/core/selection/types';

export interface ExperimentMetadata {
  browser: string;
  os: string;
  cpu: string;
  ram: string;
  timestamp: string;
  warmupIterations: number;
  measurementIterations: number;
  gridSizes: number[];
}

export interface VisualizationPoint {
  inputSize: number;
  jsMedian?: number;
  wasmMedian?: number;
  adaptiveMedian?: number;
}

export interface ResearchRun {
  workloadId: WorkloadId;
  metadata: ExperimentMetadata;
  calibrationData: CalibrationRecord | null;
  policy: WorkloadPolicy | null;
  visualizations: VisualizationPoint[];
}
