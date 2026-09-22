/**
 * Matrix Multiplication Workload - WebAssembly Adapter
 * 
 * Provides an interface to interact with the generated WebAssembly module.
 */

// Import the generated Wasm functions
import init, { multiply_matrices_wasm } from 'waswit-wasm';

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
  
  // The wasm_bindgen generated function takes Float32Array and returns Float32Array natively
  return multiply_matrices_wasm(a, b, n);
}
