import { describe, it, expect } from 'vitest';
import { deriveWorkloadPolicy, validateCalibrationConfig } from './calibrator';
import { CalibrationRecord, CalibrationResultPoint } from './types';
import { BenchmarkStats } from '../benchmark/types';

describe('Calibrator - Validation', () => {
  it('rejects empty grid sizes', () => {
    expect(() => validateCalibrationConfig({ workloadId: 'sort', gridSizes: [], warmupIterations: 1, measurementIterations: 1 })).toThrow(/non-empty array/);
  });

  it('rejects negative grid sizes', () => {
    expect(() => validateCalibrationConfig({ workloadId: 'sort', gridSizes: [-1, 10], warmupIterations: 1, measurementIterations: 1 })).toThrow(/non-negative/);
  });

  it('rejects duplicate or unordered grid sizes', () => {
    expect(() => validateCalibrationConfig({ workloadId: 'sort', gridSizes: [10, 10], warmupIterations: 1, measurementIterations: 1 })).toThrow(/strictly ascending/);
    expect(() => validateCalibrationConfig({ workloadId: 'sort', gridSizes: [20, 10], warmupIterations: 1, measurementIterations: 1 })).toThrow(/strictly ascending/);
  });
});

describe('Calibrator - Derivation', () => {
  const mockStats: BenchmarkStats = { count: 1, min: 1, max: 1, mean: 1, median: 1 };

  function makeRecord(prefs: ('javascript'|'wasm'|'tie')[], sizes = [10, 20, 30, 40, 50, 60]): CalibrationRecord {
    const results: CalibrationResultPoint[] = prefs.map((p, i) => ({
      inputSize: sizes[i],
      jsStats: mockStats,
      wasmStats: mockStats,
      preferredRuntime: p
    }));
    return {
      config: { workloadId: 'sha256', gridSizes: sizes.slice(0, prefs.length), warmupIterations: 1, measurementIterations: 1 },
      timestamp: '2023-01-01',
      results
    };
  }

  it('throws on empty calibration record', () => {
    expect(() => deriveWorkloadPolicy({ config: { workloadId: 'matrix', gridSizes: [], warmupIterations: 1, measurementIterations: 1 }, timestamp: '', results: [] })).toThrow(/empty/);
  });

  it('throws on missing measurements', () => {
    const record = makeRecord(['javascript']);
    record.results[0].wasmStats = null;
    expect(() => deriveWorkloadPolicy(record)).toThrow(/Missing required/);
  });

  it('derives clean JS -> Wasm transition when evidence is sustained', () => {
    const record = makeRecord(['javascript', 'javascript', 'wasm', 'wasm']);
    const policy = deriveWorkloadPolicy(record);
    expect(policy.rules.length).toBe(1);
    expect(policy.rules[0].maxInputSize).toBe(20); // The point before evidence started
    expect(policy.rules[0].runtime).toBe('javascript');
    expect(policy.defaultRuntime).toBe('wasm');
  });

  it('ignores isolated noisy flips', () => {
    // JS, JS, Wasm, JS, JS
    const record = makeRecord(['javascript', 'javascript', 'wasm', 'javascript', 'javascript']);
    const policy = deriveWorkloadPolicy(record);
    expect(policy.rules.length).toBe(0); // No transition sustained for 2 points
    expect(policy.defaultRuntime).toBe('javascript');
  });

  it('handles sustained reverse transition', () => {
    // JS, JS, Wasm, Wasm, JS, JS
    const record = makeRecord(['javascript', 'javascript', 'wasm', 'wasm', 'javascript', 'javascript']);
    const policy = deriveWorkloadPolicy(record);
    expect(policy.rules.length).toBe(2);
    expect(policy.rules[0].maxInputSize).toBe(20);
    expect(policy.rules[0].runtime).toBe('javascript');
    
    expect(policy.rules[1].maxInputSize).toBe(40);
    expect(policy.rules[1].runtime).toBe('wasm');
    
    expect(policy.defaultRuntime).toBe('javascript');
  });

  it('treats ties as continuing current state', () => {
    // JS, JS, tie, Wasm, Wasm
    const record = makeRecord(['javascript', 'javascript', 'tie', 'wasm', 'wasm']);
    const policy = deriveWorkloadPolicy(record);
    expect(policy.rules.length).toBe(1);
    expect(policy.rules[0].maxInputSize).toBe(30); // At 30 it was a tie, so current was JS.
    expect(policy.rules[0].runtime).toBe('javascript');
    expect(policy.defaultRuntime).toBe('wasm');
  });
});
