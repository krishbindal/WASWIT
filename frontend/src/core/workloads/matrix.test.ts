import { describe, it, expect } from 'vitest';
import { generateDeterministicMatrix, multiplyMatricesJS } from './matrix';

describe('JavaScript Matrix Multiplication Workload', () => {
  it('correctly multiplies 1x1 matrices', () => {
    const a = new Float32Array([2.0]);
    const b = new Float32Array([3.0]);
    const result = multiplyMatricesJS(a, b, 1);
    expect(result).toEqual(new Float32Array([6.0]));
  });

  it('correctly multiplies 2x2 matrices', () => {
    // A = [1, 2]
    //     [3, 4]
    const a = new Float32Array([1, 2, 3, 4]);
    
    // B = [5, 6]
    //     [7, 8]
    const b = new Float32Array([5, 6, 7, 8]);
    
    // C = A * B
    // C00 = 1*5 + 2*7 = 5 + 14 = 19
    // C01 = 1*6 + 2*8 = 6 + 16 = 22
    // C10 = 3*5 + 4*7 = 15 + 28 = 43
    // C11 = 3*6 + 4*8 = 18 + 32 = 50
    // C = [19, 22, 43, 50]
    
    const result = multiplyMatricesJS(a, b, 2);
    expect(result).toEqual(new Float32Array([19, 22, 43, 50]));
  });

  it('generates deterministic inputs correctly', () => {
    const mat = generateDeterministicMatrix(2, 1); // offset 1
    // i=0 -> (0+1)*0.5 = 0.5
    // i=1 -> (1+1)*0.5 = 1.0
    // i=2 -> (2+1)*0.5 = 1.5
    // i=3 -> (3+1)*0.5 = 2.0
    expect(mat).toEqual(new Float32Array([0.5, 1.0, 1.5, 2.0]));
  });

  it('throws an error if dimensions are mismatched', () => {
    const a = new Float32Array(4); // 2x2
    const b = new Float32Array(9); // 3x3
    expect(() => multiplyMatricesJS(a, b, 2)).toThrow();
  });
});
