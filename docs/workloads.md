# Representative Workloads

To effectively test the WASWIT selection engine, algorithms must be implemented cleanly in both JavaScript and WebAssembly (via Rust) with strict algorithmic parity.

**Note:** We do not assume that all workloads will inherently favor WebAssembly; some may strongly favor JavaScript due to JIT optimizations or memory handling.

## 1. Matrix Multiplication (Implemented - Phase 1B)
- **Nature:** Heavy integer/float arithmetic, tight nested loops.
- **Variable:** Matrix dimensions (N x N).
- **Justification:** A classic compute-intensive algorithm. It provides an excellent baseline for measuring raw CPU performance against the overhead of copying flat array data into Wasm linear memory.
- **Data Representation:** Flat row-major array (`Float32Array`). For an N x N matrix, the length is N*N. This flat structure minimizes JS-object serialization costs.
- **JS/Wasm Boundary:** When arrays are passed to WebAssembly using `wasm-bindgen` (`&[f32]`), Wasm linear memory is allocated, and the JavaScript `Float32Array` values are copied in. When the Wasm function returns a `Vec<f32>`, `wasm-bindgen` copies those values back out into a newly allocated JS `Float32Array`. Thus, execution incurs memory allocation and copying overhead across the boundary. It is **not** zero-copy. We intentionally defer optimization of this overhead to later benchmarking phases to scientifically measure the impact of strict boundary serialization.
- **Input Strategy:** Deterministically generated numeric values to guarantee perfect testability without introducing pseudo-random seed logic.

## Future Provisional Workloads
To keep the scope manageable for a single developer, we recommend selecting **2** additional workloads for the final evaluation from the following candidates:

### 2. Array Sorting (e.g., QuickSort or MergeSort)
- **Nature:** Recursive logic, high memory manipulation.
- **Variable:** Array length (N).
- **Justification:** JavaScript engines are highly optimized for sorting native JS arrays. This will test whether the cost of transferring an array to Wasm, sorting it, and returning it can outpace JS's native engine optimizations at larger scales.

### 3. Cryptographic Hashing (e.g., SHA-256)
- **Nature:** Bitwise operations, integer mathematics.
- **Variable:** String/buffer length in bytes.
- **Justification:** Historically, JS struggled with bitwise operations compared to compiled languages. This workload provides a distinct computational profile from matrix math.
