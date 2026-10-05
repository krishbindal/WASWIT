import { describe, it, expect, vi } from 'vitest';
import { waswitRun } from './index';

vi.mock('../workloads/wasm', () => ({
  initWasm: vi.fn().mockResolvedValue(undefined),
  multiplyMatricesWasm: vi.fn().mockResolvedValue(new Float32Array([19, 22, 43, 50])),
  mergeSortWasm: vi.fn().mockResolvedValue(new Int32Array([1, 2, 3, 4, 5])),
  sha256Wasm: vi.fn().mockResolvedValue(new Uint8Array(32).fill(0xff)),
}));

describe('Developer SDK (waswitRun)', () => {
  it('correctly executes Matrix Multiplication (wasm default)', async () => {
    const a = new Float32Array([1, 2, 3, 4]);
    const b = new Float32Array([5, 6, 7, 8]);
    const res = await waswitRun({
      workload: 'matrix',
      input: { a, b, n: 2 }
    });
    
    expect(res.workload).toBe('matrix');
    expect(res.runtime).toBe('wasm'); // based on frozen policy
    expect(res.inputSize).toBe(2);
    expect(res.result).toEqual(new Float32Array([19, 22, 43, 50]));
    expect(typeof res.selectionOverheadMs).toBe('number');
    expect(typeof res.executionTimeMs).toBe('number');
  });

  it('rejects invalid matrix inputs', async () => {
    const a = new Float32Array([1, 2]);
    const b = new Float32Array([3, 4]);
    
    await expect(waswitRun({ workload: 'matrix', input: { a, b, n: 2 } }))
      .rejects.toThrow('Matrix input length must be exactly n * n.');
      
    await expect(waswitRun({ workload: 'matrix', input: { a, b, n: -1 } as unknown as never }))
      .rejects.toThrow('Matrix dimension n must be a non-negative integer.');
  });

  it('correctly executes Sort (wasm default)', async () => {
    const input = new Int32Array([5, 3, 4, 1, 2]);
    const res = await waswitRun({ workload: 'sort', input });
    
    expect(res.workload).toBe('sort');
    expect(res.runtime).toBe('wasm');
    expect(res.inputSize).toBe(5);
    expect(res.result).toEqual(new Int32Array([1, 2, 3, 4, 5]));
  });

  it('rejects invalid sort inputs', async () => {
    await expect(waswitRun({ workload: 'sort', input: [1, 2, 3] as unknown as never }))
      .rejects.toThrow('Sort input must be an Int32Array.');
  });

  it('correctly executes SHA-256 (JavaScript path for <=1000)', async () => {
    const input = new TextEncoder().encode('abc'); // length 3
    const res = await waswitRun({ workload: 'sha256', input });
    
    expect(res.workload).toBe('sha256');
    expect(res.runtime).toBe('javascript');
    expect(res.inputSize).toBe(3);
    
    // convert to hex to check
    const hex = Array.from(res.result).map(b => b.toString(16).padStart(2, '0')).join('');
    expect(hex).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  });

  it('correctly executes SHA-256 (WebAssembly path for >1000)', async () => {
    const input = new Uint8Array(1500); 
    const res = await waswitRun({ workload: 'sha256', input });
    
    expect(res.workload).toBe('sha256');
    expect(res.runtime).toBe('wasm');
    expect(res.inputSize).toBe(1500);
    expect(res.result).toBeInstanceOf(Uint8Array);
    expect(res.result.length).toBe(32);
  });
  
  it('rejects invalid sha256 inputs', async () => {
    await expect(waswitRun({ workload: 'sha256', input: 'string' as unknown as never }))
      .rejects.toThrow('SHA-256 input must be a Uint8Array.');
  });
});

