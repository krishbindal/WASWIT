# Representative Workloads

To effectively test the WASWIT selection engine, algorithms must be implemented cleanly in both JavaScript and WebAssembly (via Rust) with strict algorithmic parity.

**Note:** We do not assume that all workloads will inherently favor WebAssembly; some may strongly favor JavaScript due to JIT optimizations or memory handling.

## 1. Matrix Multiplication (Implemented - Phase 1B)
- **Nature:** Heavy integer/float arithmetic, tight nested loops.
- **Variable:** Matrix dimensions (N x N).
- **Justification:** A classic compute-intensive algorithm. It provides an excellent baseline for measuring raw CPU performance against the overhead of copying flat array data into Wasm linear memory.
- **Data Representation:** Flat row-major array (`Float32Array`). For an N x N matrix, the length is N*N. This flat structure avoids complex JavaScript object serialization entirely.
- **JS/Wasm Boundary:** When arrays are passed to WebAssembly using `wasm-bindgen` (`&[f32]`), Wasm linear memory is allocated, and the raw JavaScript `Float32Array` values are copied in. When the Wasm function returns a `Vec<f32>`, `wasm-bindgen` copies those memory values back out into a newly allocated JS `Float32Array`. Thus, execution incurs memory allocation and direct TypedArray-to-Wasm memory copying overhead across the boundary. It is **not** zero-copy, but it completely bypasses the overhead of JS-object serialization/deserialization. We intentionally defer optimization of this copying overhead to later benchmarking phases to scientifically measure its impact.
- **Input Strategy:** Deterministically generated numeric values to guarantee perfect testability without introducing pseudo-random seed logic.

## 2. Array Sorting — Merge Sort (Implemented - Phase 2)
- **Nature:** Recursive logic, high memory manipulation, deterministic array partitioning.
- **Variable:** Array length (`N`).
- **Justification:** Implementing an explicit algorithm (Merge Sort) in both environments avoids relying on browser-native optimizations like `Array.prototype.sort`. This tests raw algorithmic performance across the JS/Wasm divide, distinct from numeric matrix math.
- **Data Representation:** `Int32Array`. Returns a new `Int32Array` containing the sorted elements without mutating the caller's input.
- **JS/Wasm Boundary:** Like Matrix Multiplication, copies typed array data into Wasm memory and copies the sorted result back out.
- **Input Strategy:** Deterministically generated elements containing negatives and duplicates, computed via a linear congruential formula from indices.

## 3. Cryptographic Hashing — SHA-256 (Implemented - Phase 2)
- **Nature:** Extensive bitwise operations, 32-bit integer arithmetic.
- **Variable:** Input length in bytes (`N`).
- **Justification:** SHA-256 requires precise 32-bit arithmetic, a known historical weak point of JavaScript compared to compiled languages like Rust. This workload provides a distinct, heavy bitwise computational profile.
- **Data Representation:** Input `Uint8Array`, output `Uint8Array(32)`.
- **JS/Wasm Boundary:** Copies byte chunks to WebAssembly and returns a fixed 32-byte digest array.
- **Implementation Strategy:** Pure implementations in both JS and Rust. Does not use native browser APIs (like `crypto.subtle`) or external Rust crates.
- **Input Strategy:** Deterministically generated `Uint8Array` bytes derived from index-based formulas to ensure strict reproducible equality across JS and Rust tests.
