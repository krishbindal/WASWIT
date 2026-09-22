/**
 * Matrix Multiplication Workload - WebAssembly Adapter
 * 
 * Provides an interface to interact with the generated WebAssembly module.
 */

// Import the generated Wasm functions from the local directory
import init, { multiply_matrices_wasm, merge_sort_wasm, sha256_wasm } from '../../wasm/waswit_wasm';

let initialized = false;

/**
 * Ensures the WebAssembly module is initialized before calling functions.
 * Must be called at least once before executing Wasm logic.
 */
export async function initWasm() {
  if (!initialized) {
    await init();
    initialized = true;
  }
}

/**
 * Performs matrix multiplication on two flat N x N matrices using WebAssembly.
 * 
 * @param a Flat Float32Array representing N x N matrix
 * @param b Flat Float32Array representing N x N matrix
 * @param n Dimension of the matrices
 * @returns Flat Float32Array representing the result N x N matrix
 */
export async function multiplyMatricesWasm(a: Float32Array, b: Float32Array, n: number): Promise<Float32Array> {
  await initWasm();
  return multiply_matrices_wasm(a, b, n);
}

/**
 * Sorts an Int32Array using Merge Sort in WebAssembly.
 */
export async function mergeSortWasm(input: Int32Array): Promise<Int32Array> {
  await initWasm();
  return merge_sort_wasm(input);
}

/**
 * Computes SHA-256 digest of a Uint8Array using WebAssembly.
 */
export async function sha256Wasm(message: Uint8Array): Promise<Uint8Array> {
  await initWasm();
  return sha256_wasm(message);
}
