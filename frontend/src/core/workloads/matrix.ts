/**
 * Matrix Multiplication Workload - JavaScript Implementation
 * 
 * Uses a flat row-major array representation for matrices.
 * For an N x N matrix, the array length is N * N.
 * 
 * C[i, j] = SUM(A[i, k] * B[k, j]) for k=0..N-1
 */

/**
 * Generates a deterministic flat N x N matrix.
 * Values are populated based on their indices to ensure reproducibility 
 * without relying on Math.random(), enabling perfect JS/Wasm parity checks.
 */
export function generateDeterministicMatrix(n: number, offset: number = 0): Float32Array {
  const size = n * n;
  const matrix = new Float32Array(size);
  for (let i = 0; i < size; i++) {
    // Generate values like 1.5, 2.5, etc., that can be represented exactly
    // in both JS numbers (f64) and Wasm f32 to avoid precision mismatch in simple tests.
    matrix[i] = (i + offset) * 0.5;
  }
  return matrix;
}

/**
 * Performs matrix multiplication on two flat N x N matrices.
 * 
 * @param a Flat Float32Array representing N x N matrix
 * @param b Flat Float32Array representing N x N matrix
 * @param n Dimension of the matrices
 * @returns Flat Float32Array representing the result N x N matrix
 */
export function multiplyMatricesJS(a: Float32Array, b: Float32Array, n: number): Float32Array {
  if (a.length !== n * n || b.length !== n * n) {
    throw new Error('Matrix dimensions do not match the provided N.');
  }

  const c = new Float32Array(n * n);

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let sum = 0;
      for (let k = 0; k < n; k++) {
        sum += a[i * n + k] * b[k * n + j];
      }
      c[i * n + j] = sum;
    }
  }

  return c;
}
