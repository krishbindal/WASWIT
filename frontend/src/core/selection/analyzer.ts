import { WorkloadCharacteristics } from './types';
import { WorkloadId } from '../types';

/**
 * Deterministically analyzes workload metadata to produce measurable characteristics
 * without executing the workload or relying on runtime timing.
 */
export function analyzeWorkload(workloadId: WorkloadId, inputSize: number): WorkloadCharacteristics {
  if (inputSize < 0 || !Number.isInteger(inputSize)) {
    throw new Error('inputSize must be a non-negative integer');
  }

  let derivedSize = 0;
  switch (workloadId) {
    case 'matrix':
      // Matrix multiplication uses an N x N Float32Array.
      // Total elements = N^2.
      derivedSize = inputSize * inputSize;
      break;
    case 'sort':
      // Merge sort uses an array of length N.
      derivedSize = inputSize;
      break;
    case 'sha256':
      // SHA-256 uses a Uint8Array of length N bytes.
      derivedSize = inputSize;
      break;
    default:
      // Typescript exhaustive check protection
      const _exhaustiveCheck: never = workloadId;
      throw new Error(`Unknown workloadId: ${workloadId}`);
  }

  return {
    workloadId,
    inputSize,
    derivedSize
  };
}
