import { describe, it, expect } from 'vitest';
import { mergeSortJS, generateSortInput } from './sort';

describe('mergeSortJS', () => {
  it('sorts an empty array', () => {
    const input = new Int32Array(0);
    const sorted = mergeSortJS(input);
    expect(sorted).toEqual(new Int32Array(0));
  });

  it('sorts a single-element array', () => {
    const input = new Int32Array([42]);
    const sorted = mergeSortJS(input);
    expect(sorted).toEqual(new Int32Array([42]));
  });

  it('sorts a two-element array', () => {
    const input = new Int32Array([42, 10]);
    const sorted = mergeSortJS(input);
    expect(sorted).toEqual(new Int32Array([10, 42]));
  });

  it('handles already sorted arrays', () => {
    const input = new Int32Array([1, 2, 3, 4, 5]);
    const sorted = mergeSortJS(input);
    expect(sorted).toEqual(new Int32Array([1, 2, 3, 4, 5]));
  });

  it('handles reverse sorted arrays', () => {
    const input = new Int32Array([5, 4, 3, 2, 1]);
    const sorted = mergeSortJS(input);
    expect(sorted).toEqual(new Int32Array([1, 2, 3, 4, 5]));
  });

  it('handles duplicates', () => {
    const input = new Int32Array([3, 1, 2, 1, 3, 2]);
    const sorted = mergeSortJS(input);
    expect(sorted).toEqual(new Int32Array([1, 1, 2, 2, 3, 3]));
  });

  it('handles negative numbers', () => {
    const input = new Int32Array([3, -1, -5, 0, 2]);
    const sorted = mergeSortJS(input);
    expect(sorted).toEqual(new Int32Array([-5, -1, 0, 2, 3]));
  });

  it('does not mutate the original input', () => {
    const input = new Int32Array([5, 3, 4]);
    mergeSortJS(input);
    expect(input).toEqual(new Int32Array([5, 3, 4]));
  });

  it('sorts deterministically generated arrays', () => {
    const input = generateSortInput(100);
    const sorted = mergeSortJS(input);
    
    // Check it is sorted
    let isSorted = true;
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] < sorted[i - 1]) {
        isSorted = false;
        break;
      }
    }
    expect(isSorted).toBe(true);
  });

  describe('generateSortInput', () => {
    it('is deterministic', () => {
      const input1 = generateSortInput(20);
      const input2 = generateSortInput(20);
      expect(input1).toEqual(input2);
    });

    it('outputs length exactly N', () => {
      const input = generateSortInput(20);
      expect(input.length).toBe(20);
    });

    it('contains negative and positive values', () => {
      const input = generateSortInput(20);
      const hasNeg = Array.from(input).some(v => v < 0);
      const hasPos = Array.from(input).some(v => v > 0);
      expect(hasNeg).toBe(true);
      expect(hasPos).toBe(true);
    });

    it('contains duplicates for representative size N=20', () => {
      const input = generateSortInput(20);
      const uniqueCount = new Set(input).size;
      expect(uniqueCount).toBeLessThan(input.length);
    });

    it('generated values stay inside the exact documented range [-5000, 5000]', () => {
      const input = generateSortInput(1000);
      let inRange = true;
      for (let i = 0; i < input.length; i++) {
        if (input[i] < -5000 || input[i] > 5000) {
          inRange = false;
          break;
        }
      }
      expect(inRange).toBe(true);
    });

    it('generates specific exact deterministic values', () => {
      const input = generateSortInput(10);
      // exact expected values verifying 32-bit integer logic and range formula
      expect(input[0]).toBe(-2962);
      expect(input[1]).toBe(-1353);
      expect(input[2]).toBe(-2149);
      expect(input[3]).toBe(2726);
      expect(input[4]).toBe(-882);
      expect(input[5]).toBe(191);
      expect(input[6]).toBe(-3754);
      expect(input[7]).toBe(-3754); // Duplicate by deterministic rule i % 7 === 0
      expect(input[8]).toBe(3095);
      expect(input[9]).toBe(-4749);
    });
  });
});
