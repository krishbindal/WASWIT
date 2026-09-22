/**
 * Deterministically generates an Int32Array of a given size.
 * Uses a simple linear congruential formula to ensure identical arrays
 * across JS and WebAssembly without relying on Math.random().
 */
export function generateSortInput(size: number): Int32Array {
  const arr = new Int32Array(size);
  let seed = 12345;
  for (let i = 0; i < size; i++) {
    // Basic LCG: seed = (seed * 1103515245 + 12345) % 2^31
    seed = (seed * 1103515245 + 12345) & 0x7FFFFFFF;
    // We want some negative numbers, some duplicates, and unsorted behavior.
    // Map to a range like -10000 to 10000
    arr[i] = (seed % 20000) - 10000;
  }
  return arr;
}

/**
 * Pure JavaScript implementation of Merge Sort for Int32Array.
 * Does not mutate the original array; returns a new sorted Int32Array.
 * Does not use Array.prototype.sort.
 */
export function mergeSortJS(input: Int32Array): Int32Array {
  // Create a copy so we don't mutate the caller's input
  const arr = new Int32Array(input);
  const temp = new Int32Array(input.length);
  
  function splitMerge(start: number, end: number, a: Int32Array, b: Int32Array) {
    if (end - start <= 1) return;
    const middle = Math.floor((start + end) / 2);
    
    // Sort left half
    splitMerge(start, middle, a, b);
    // Sort right half
    splitMerge(middle, end, a, b);
    // Merge
    merge(start, middle, end, a, b);
  }

  function merge(start: number, middle: number, end: number, a: Int32Array, b: Int32Array) {
    let i = start;
    let j = middle;
    
    // Copy into temp array
    for (let k = start; k < end; k++) {
      if (i < middle && (j >= end || a[i] <= a[j])) {
        b[k] = a[i];
        i++;
      } else {
        b[k] = a[j];
        j++;
      }
    }
    
    // Copy back into original array
    for (let k = start; k < end; k++) {
      a[k] = b[k];
    }
  }

  splitMerge(0, arr.length, arr, temp);
  return arr;
}
