import { describe, it, expect } from 'vitest';
import { calculateStats } from './stats';
import { BenchmarkSample } from './types';

describe('calculateStats', () => {
  it('calculates min, max, mean, and median for an odd number of samples', () => {
    // 5 samples (odd)
    // Times: 10, 20, 30, 40, 50 (already sorted)
    // Mean: (150) / 5 = 30
    // Median: 30
    const samples: BenchmarkSample[] = [
      { iteration: 0, elapsedMs: 10 },
      { iteration: 1, elapsedMs: 30 },
      { iteration: 2, elapsedMs: 50 },
      { iteration: 3, elapsedMs: 20 },
      { iteration: 4, elapsedMs: 40 },
    ];

    const stats = calculateStats(samples);
    
    expect(stats.count).toBe(5);
    expect(stats.min).toBe(10);
    expect(stats.max).toBe(50);
    expect(stats.mean).toBe(30);
    expect(stats.median).toBe(30);
  });

  it('calculates median for an even number of samples', () => {
    // 4 samples (even)
    // Times: 10, 20, 30, 40
    // Mean: (100) / 4 = 25
    // Median: (20 + 30) / 2 = 25
    const samples: BenchmarkSample[] = [
      { iteration: 0, elapsedMs: 40 },
      { iteration: 1, elapsedMs: 10 },
      { iteration: 2, elapsedMs: 30 },
      { iteration: 3, elapsedMs: 20 },
    ];

    const stats = calculateStats(samples);
    
    expect(stats.median).toBe(25);
    expect(stats.mean).toBe(25);
  });

  it('does not mutate the original raw sample array', () => {
    const samples: BenchmarkSample[] = [
      { iteration: 0, elapsedMs: 30 },
      { iteration: 1, elapsedMs: 10 },
      { iteration: 2, elapsedMs: 20 },
    ];

    calculateStats(samples);

    // Ensure the array order is unmodified
    expect(samples[0].elapsedMs).toBe(30);
    expect(samples[1].elapsedMs).toBe(10);
    expect(samples[2].elapsedMs).toBe(20);
  });

  it('throws an error if the sample array is empty', () => {
    expect(() => calculateStats([])).toThrowError('Cannot calculate statistics for an empty sample array');
  });

  it('throws an error if a sample is negative', () => {
    const samples: BenchmarkSample[] = [{ iteration: 0, elapsedMs: -5 }];
    expect(() => calculateStats(samples)).toThrowError(/Invalid sample value/);
  });

  it('throws an error if a sample is NaN', () => {
    const samples: BenchmarkSample[] = [{ iteration: 0, elapsedMs: NaN }];
    expect(() => calculateStats(samples)).toThrowError(/Invalid sample value/);
  });

  it('throws an error if a sample is Infinity', () => {
    const samples: BenchmarkSample[] = [{ iteration: 0, elapsedMs: Infinity }];
    expect(() => calculateStats(samples)).toThrowError(/Invalid sample value/);
  });
});
