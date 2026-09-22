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
    expect(sorted.length).toBe(100);
  });

  it('generates deterministic exact 32-bit values with negatives and duplicates', () => {
    const input1 = generateSortInput(5);
    const input2 = generateSortInput(5);
    expect(input1).toEqual(input2);

    // Assert exact values to verify fixed-width integer logic
    // Using formula: seed = (Math.imul(seed, 1103515245) + 12345) | 0
    // arr[i] = (seed % 20000) - 10000
    // seed starts at 12345
    expect(input1[0]).toBe(-21042);
    expect(input1[1]).toBe(-29873);
    expect(input1[2]).toBe(-26724);
    expect(input1[3]).toBe(-6427);
    expect(input1[4]).toBe(-18470);

    // Verify it contains negatives
    expect(Array.from(input1).some(v => v < 0)).toBe(true);
  });
});
