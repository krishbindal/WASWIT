import { BenchmarkSample, BenchmarkStats } from './types';

/**
 * Calculates statistical summaries from an array of raw benchmark samples.
 */
export function calculateStats(samples: BenchmarkSample[]): BenchmarkStats {
  if (!samples || samples.length === 0) {
    throw new Error('Cannot calculate statistics for an empty sample array');
  }

  const count = samples.length;
  let sum = 0;
  let min = Infinity;
  let max = -Infinity;

  // Extract purely the elapsed times
  const times = samples.map(s => {
    if (s.elapsedMs < 0 || Number.isNaN(s.elapsedMs) || !Number.isFinite(s.elapsedMs)) {
      throw new Error(`Invalid sample value encountered: ${s.elapsedMs}`);
    }
    
    if (s.elapsedMs < min) min = s.elapsedMs;
    if (s.elapsedMs > max) max = s.elapsedMs;
    sum += s.elapsedMs;
    
    return s.elapsedMs;
  });

  const mean = sum / count;

  // Calculate median without mutating original array
  const sorted = [...times].sort((a, b) => a - b);
  const mid = Math.floor(count / 2);
  
  let median: number;
  if (count % 2 === 0) {
    // Even: average of the two middle values
    median = (sorted[mid - 1] + sorted[mid]) / 2.0;
  } else {
    // Odd: the exact middle value
    median = sorted[mid];
  }

  return {
    count,
    min,
    max,
    mean,
    median
  };
}
