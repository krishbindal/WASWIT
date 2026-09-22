import { describe, it, expect } from 'vitest';
import { analyzeWorkload } from './analyzer';

describe('Workload Analyzer', () => {
  it('correctly derives matrix size', () => {
    const chars = analyzeWorkload('matrix', 100);
    expect(chars.workloadId).toBe('matrix');
    expect(chars.inputSize).toBe(100);
    expect(chars.derivedSize).toBe(10000); // 100^2
  });

  it('correctly derives sort size', () => {
    const chars = analyzeWorkload('sort', 500);
    expect(chars.workloadId).toBe('sort');
    expect(chars.inputSize).toBe(500);
    expect(chars.derivedSize).toBe(500);
  });

  it('correctly derives sha256 size', () => {
    const chars = analyzeWorkload('sha256', 2048);
    expect(chars.workloadId).toBe('sha256');
    expect(chars.inputSize).toBe(2048);
    expect(chars.derivedSize).toBe(2048);
  });

  it('rejects negative input sizes', () => {
    expect(() => analyzeWorkload('matrix', -1)).toThrow(/non-negative integer/);
  });

  it('rejects non-integer input sizes', () => {
    expect(() => analyzeWorkload('sort', 1.5)).toThrow(/non-negative integer/);
  });
});
