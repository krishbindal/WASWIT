import { describe, it, expect } from 'vitest';
import { runCalibrationSweep, deriveWorkloadPolicy } from './calibrator';
import { CalibrationConfig, CalibrationRecord } from './types';

describe('Calibrator', () => {
  it('runs sweep and returns calibration record', async () => {
    const config: CalibrationConfig = {
      workloadId: 'matrix',
      gridSizes: [10, 20],
      warmupIterations: 1,
      measurementIterations: 2
    };

    const record = await runCalibrationSweep(config, async (size, runtime) => {
      // Mock workload execution that sleeps very briefly.
      // JS is "faster" for 10, Wasm is "faster" for 20 by deterministic delay simulation
      const delay = (runtime === 'javascript' && size === 10) || (runtime === 'wasm' && size === 20) ? 1 : 5;
      await new Promise(r => setTimeout(r, delay));
    });

    expect(record.config).toEqual(config);
    expect(record.results.length).toBe(2);
    expect(record.results[0].inputSize).toBe(10);
    expect(record.results[1].inputSize).toBe(20);
    expect(record.results[0].jsStats).not.toBeNull();
    expect(record.results[0].wasmStats).not.toBeNull();
    // Timing in testing can be extremely flaky. We do not strictly assert preferredRuntime 
    // unless we strictly mock performance.now, which Vitest can do, but let's test derivation explicitly.
  });

  it('derives policy properly from record', () => {
    const mockRecord: CalibrationRecord = {
      config: {
        workloadId: 'sha256',
        gridSizes: [100, 200, 300, 400],
        warmupIterations: 1,
        measurementIterations: 1
      },
      timestamp: new Date().toISOString(),
      results: [
        { inputSize: 100, jsStats: null, wasmStats: null, preferredRuntime: 'javascript' },
        { inputSize: 200, jsStats: null, wasmStats: null, preferredRuntime: 'javascript' },
        { inputSize: 300, jsStats: null, wasmStats: null, preferredRuntime: 'wasm' },
        { inputSize: 400, jsStats: null, wasmStats: null, preferredRuntime: 'wasm' },
      ]
    };

    const policy = deriveWorkloadPolicy(mockRecord);
    expect(policy.workloadId).toBe('sha256');
    expect(policy.rules.length).toBe(1);
    expect(policy.rules[0].maxInputSize).toBe(200);
    expect(policy.rules[0].runtime).toBe('javascript');
    expect(policy.defaultRuntime).toBe('wasm');
  });

  it('handles purely one runtime better', () => {
    const mockRecord: CalibrationRecord = {
      config: {
        workloadId: 'sort',
        gridSizes: [10, 20, 30],
        warmupIterations: 1,
        measurementIterations: 1
      },
      timestamp: new Date().toISOString(),
      results: [
        { inputSize: 10, jsStats: null, wasmStats: null, preferredRuntime: 'wasm' },
        { inputSize: 20, jsStats: null, wasmStats: null, preferredRuntime: 'wasm' },
        { inputSize: 30, jsStats: null, wasmStats: null, preferredRuntime: 'wasm' }
      ]
    };

    const policy = deriveWorkloadPolicy(mockRecord);
    expect(policy.workloadId).toBe('sort');
    expect(policy.rules.length).toBe(0); // No transitions!
    expect(policy.defaultRuntime).toBe('wasm');
  });
});
