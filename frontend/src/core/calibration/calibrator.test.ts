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
    const results: CalibrationResultPoint[] = prefs.map((p, i) => {
      let jsMedian = 100;
      let wasmMedian = 100;
      if (p === 'javascript') {
        jsMedian = 50;
      } else if (p === 'wasm') {
        wasmMedian = 50;
      }
      return {
        inputSize: sizes[i],
        jsStats: { count: 1, min: jsMedian, max: jsMedian, mean: jsMedian, median: jsMedian },
        wasmStats: { count: 1, min: wasmMedian, max: wasmMedian, mean: wasmMedian, median: wasmMedian },
        preferredRuntime: p
      };
    });
    return {
      config: { workloadId: 'sha256', gridSizes: sizes.slice(0, prefs.length), warmupIterations: 1, measurementIterations: 1 },
      timestamp: '2023-01-01',
      results
    };
  }

  it('throws on empty calibration record', () => {
    expect(() => deriveWorkloadPolicy({ config: { workloadId: 'matrix', gridSizes: [], warmupIterations: 1, measurementIterations: 1 }, timestamp: '', results: [] })).toThrow(/non-empty array/);
  });

  it('throws on missing results with valid gridSizes', () => {
    expect(() => deriveWorkloadPolicy({ config: { workloadId: 'matrix', gridSizes: [10], warmupIterations: 1, measurementIterations: 1 }, timestamp: '', results: [] })).toThrow(/Calibration record result length/);
  });

  it('throws on missing measurements', () => {
    const record = makeRecord(['javascript']);
    record.results[0].wasmStats = null;
    expect(() => deriveWorkloadPolicy(record)).toThrow(/Missing required/);
  });

  describe('Invalid Benchmark Statistics', () => {
    it('throws on NaN median', () => {
      const record = makeRecord(['javascript']);
      record.results[0].jsStats!.median = NaN;
      expect(() => deriveWorkloadPolicy(record)).toThrow(/Invalid median/);
    });

    it('throws on Infinity median', () => {
      const record = makeRecord(['javascript']);
      record.results[0].wasmStats!.median = Infinity;
      expect(() => deriveWorkloadPolicy(record)).toThrow(/Invalid median/);
    });

    it('throws on negative median', () => {
      const record = makeRecord(['javascript']);
      record.results[0].jsStats!.median = -5;
      expect(() => deriveWorkloadPolicy(record)).toThrow(/Invalid median/);
    });

    it('throws on NaN mean', () => {
      const record = makeRecord(['javascript']);
      record.results[0].wasmStats!.mean = NaN;
      expect(() => deriveWorkloadPolicy(record)).toThrow(/Invalid mean/);
    });

    it('throws on Infinity mean', () => {
      const record = makeRecord(['javascript']);
      record.results[0].jsStats!.mean = Infinity;
      expect(() => deriveWorkloadPolicy(record)).toThrow(/Invalid mean/);
    });

    it('throws on invalid count (0)', () => {
      const record = makeRecord(['javascript']);
      record.results[0].jsStats!.count = 0;
      expect(() => deriveWorkloadPolicy(record)).toThrow(/Invalid count/);
    });

    it('throws on negative count', () => {
      const record = makeRecord(['javascript']);
      record.results[0].wasmStats!.count = -1;
      expect(() => deriveWorkloadPolicy(record)).toThrow(/Invalid count/);
    });

    it('throws on min > max', () => {
      const record = makeRecord(['javascript']);
      record.results[0].jsStats!.min = 100;
      record.results[0].jsStats!.max = 50;
      expect(() => deriveWorkloadPolicy(record)).toThrow(/cannot be greater than max/);
    });
    
    it('throws on negative min', () => {
      const record = makeRecord(['javascript']);
      record.results[0].jsStats!.min = -1;
      expect(() => deriveWorkloadPolicy(record)).toThrow(/Invalid min/);
    });
  });

  it('throws on contradictory preferredRuntime', () => {
    const record = makeRecord(['javascript']);
    // Fake the measurement to disagree with the stored preference
    record.results[0].wasmStats!.median = 10;
    record.results[0].jsStats!.median = 100;
    expect(() => deriveWorkloadPolicy(record)).toThrow(/Contradictory preferredRuntime/);
  });

  it('throws if result length does not match gridSizes length', () => {
    const record = makeRecord(['javascript', 'wasm']);
    record.results.pop(); // Remove one result
    expect(() => deriveWorkloadPolicy(record)).toThrow(/Calibration record result length/);
  });

  it('throws if result inputSize does not match gridSizes expected size', () => {
    const record = makeRecord(['javascript', 'wasm']);
    record.results[1].inputSize = 999;
    expect(() => deriveWorkloadPolicy(record)).toThrow(/size mismatch at index 1/i);
  });

  it('is completely deterministic regardless of timestamp', () => {
    const record1 = makeRecord(['javascript', 'javascript', 'wasm', 'wasm']);
    record1.timestamp = '2020-01-01T00:00:00Z';
    
    const record2 = makeRecord(['javascript', 'javascript', 'wasm', 'wasm']);
    record2.timestamp = '2099-12-31T23:59:59Z';
    
    const policy1 = deriveWorkloadPolicy(record1);
    const policy2 = deriveWorkloadPolicy(record2);

    // Timestamps in provenance will differ
    expect(policy1.provenance.timestamp).toBe('2020-01-01T00:00:00Z');
    expect(policy2.provenance.timestamp).toBe('2099-12-31T23:59:59Z');
    
    // BUT the deterministic routing logic must be perfectly identical
    expect(policy1.rules).toEqual(policy2.rules);
    expect(policy1.defaultRuntime).toEqual(policy2.defaultRuntime);
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
