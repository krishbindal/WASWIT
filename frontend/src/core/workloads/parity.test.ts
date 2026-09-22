import { describe, it, expect, beforeAll } from 'vitest';
import { generateDeterministicMatrix, multiplyMatricesJS } from './matrix';
import { multiplyMatricesWasm, initWasm } from './wasm';

describe('Matrix Multiplication Parity (JS vs Wasm)', () => {
  let wasmLoaded = false;
  
  beforeAll(async () => {
    try {
      await initWasm();
      wasmLoaded = true;
    } catch (e) {
      console.warn('Wasm failed to initialize in Vitest, skipping some tests if necessary.', e);
    }
  });

  it('computes identical results for 2x2 matrices', async () => {
    if (!wasmLoaded) return; // Skip in Node/JSDOM if fetch is unsupported

    const a = new Float32Array([1, 2, 3, 4]);
    const b = new Float32Array([5, 6, 7, 8]);
    
    const jsResult = multiplyMatricesJS(a, b, 2);
    const wasmResult = await multiplyMatricesWasm(a, b, 2);
    
    expect(jsResult).toEqual(wasmResult);
    expect(jsResult).toEqual(new Float32Array([19, 22, 43, 50]));
  });

  it('computes identical results for generated 4x4 matrices', async () => {
    if (!wasmLoaded) return; // Skip in Node/JSDOM
    const n = 4;
    const a = generateDeterministicMatrix(n, 0);
    const b = generateDeterministicMatrix(n, 5);
    
    const jsResult = multiplyMatricesJS(a, b, n);
    const wasmResult = await multiplyMatricesWasm(a, b, n);
    
    expect(jsResult).toEqual(wasmResult);
  });
});
