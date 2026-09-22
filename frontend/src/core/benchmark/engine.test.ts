import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { runBenchmark } from './engine';
import { BenchmarkConfig } from './types';

describe('runBenchmark engine', () => {
  let perfNowSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Mock performance.now to increment predictably
    let time = 0;
    perfNowSpy = vi.spyOn(performance, 'now').mockImplementation(() => {
      time += 10;
      return time;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('runs a synchronous executor properly', async () => {
    const executor = vi.fn((input: number) => input * 2);
    const config: BenchmarkConfig = { warmupIterations: 1, measurementIterations: 2 };

    const result = await runBenchmark(executor, 5, config);

    expect(result.success).toBe(true);
    if (!result.success) return; // for type guarding

    expect(executor).toHaveBeenCalledTimes(3); // 1 warmup + 2 measured
    expect(result.samples).toHaveLength(2);
    
    // Each measurement calls performance.now twice.
    // Given the mock, start=10, end=20, elapsed = 10.
    expect(result.samples[0].elapsedMs).toBe(10);
    expect(result.stats.count).toBe(2);
  });

  it('runs an asynchronous executor properly', async () => {
    const executor = vi.fn(async (input: string) => {
      return input.toUpperCase();
    });
    const config: BenchmarkConfig = { warmupIterations: 0, measurementIterations: 1 };

    const result = await runBenchmark(executor, 'test', config);

    expect(result.success).toBe(true);
    expect(executor).toHaveBeenCalledTimes(1);
    expect(executor).toHaveBeenCalledWith('test');
  });

  it('correctly excludes warmup from the sample counts', async () => {
    const executor = vi.fn();
    const config: BenchmarkConfig = { warmupIterations: 5, measurementIterations: 2 };

    const result = await runBenchmark(executor, null, config);

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(executor).toHaveBeenCalledTimes(7);
    expect(result.samples).toHaveLength(2); // Only measured iterations are captured
    expect(result.samples[0].iteration).toBe(0); // Iteration counter resets after warmup
  });

  it('preserves raw sample data', async () => {
    const executor = vi.fn();
    const config: BenchmarkConfig = { warmupIterations: 0, measurementIterations: 3 };

    const result = await runBenchmark(executor, null, config);

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.samples).toEqual([
      { iteration: 0, elapsedMs: 10 },
      { iteration: 1, elapsedMs: 10 },
      { iteration: 2, elapsedMs: 10 },
    ]);
  });

  it('returns a failed result if the executor throws and preserves previous samples', async () => {
    let calls = 0;
    const executor = vi.fn(() => {
      if (calls === 2) {
        throw new Error('Executor failure');
      }
      calls++;
    });
    const config: BenchmarkConfig = { warmupIterations: 0, measurementIterations: 3 };

    const result = await runBenchmark(executor, null, config);

    expect(result.success).toBe(false);
    if (result.success) return; // for type guarding

    expect(result.error).toBeInstanceOf(Error);
    expect((result.error as Error).message).toMatch(/Measurement iteration 2 failed: Executor failure/);
    
    // Partial samples should be preserved
    expect(result.samples).toHaveLength(2);
    expect(result.samples[0].iteration).toBe(0);
    expect(result.samples[1].iteration).toBe(1);
  });

  it('fails during warmup without inventing measured samples', async () => {
    let calls = 0;
    const executor = vi.fn(() => {
      if (calls === 1) {
        throw new Error('Warmup failure');
      }
      calls++;
    });
    const config: BenchmarkConfig = { warmupIterations: 3, measurementIterations: 5 };

    const result = await runBenchmark(executor, null, config);

    expect(result.success).toBe(false);
    if (result.success) return;

    expect((result.error as Error).message).toMatch(/Warmup iteration 1 failed: Warmup failure/);
    
    // Samples should be completely empty
    expect(result.samples).toHaveLength(0);
  });

  it('fails clearly on invalid configuration values (negative warmup)', async () => {
    const executor = vi.fn();
    const config: BenchmarkConfig = { warmupIterations: -1, measurementIterations: 1 };

    const result = await runBenchmark(executor, null, config);

    expect(result.success).toBe(false);
    if (result.success) return;
    expect((result.error as Error).message).toMatch(/warmupIterations must be/);
  });

  it('fails clearly on invalid configuration values (zero measurement)', async () => {
    const executor = vi.fn();
    const config: BenchmarkConfig = { warmupIterations: 0, measurementIterations: 0 };

    const result = await runBenchmark(executor, null, config);

    expect(result.success).toBe(false);
    if (result.success) return;
    expect((result.error as Error).message).toMatch(/measurementIterations must be a positive integer/);
  });

  it('fails clearly on invalid configuration values (non-integer iterations)', async () => {
    const executor = vi.fn();
    const config: BenchmarkConfig = { warmupIterations: 1.5, measurementIterations: 1 };

    const result = await runBenchmark(executor, null, config);

    expect(result.success).toBe(false);
    if (result.success) return;
    expect((result.error as Error).message).toMatch(/warmupIterations must be a non-negative integer/);
  });

  it('detects and flags invalid timing results (negative time)', async () => {
    const executor = vi.fn();
    
    // Create a time travel bug (end time is smaller than start time)
    let flip = false;
    perfNowSpy.mockImplementation(() => {
      flip = !flip;
      return flip ? 100 : 50; // start=100, end=50, elapsed=-50
    });

    const config: BenchmarkConfig = { warmupIterations: 0, measurementIterations: 1 };
    const result = await runBenchmark(executor, null, config);

    expect(result.success).toBe(false);
    if (result.success) return;
    expect((result.error as Error).message).toMatch(/Invalid elapsed time/);
  });
});
