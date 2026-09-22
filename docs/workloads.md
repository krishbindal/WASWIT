# Representative Workloads

To effectively test the WASWIT selection engine, we need algorithms that can be implemented cleanly in both JavaScript and WebAssembly (via Rust).

**Note:** The following workloads are *Provisional* and are subject to implementation and pilot benchmark validation. We do not assume that all workloads will inherently favor WebAssembly; some may strongly favor JavaScript due to JIT optimizations or memory handling.

## Provisional Workload Candidates

To keep the scope manageable for a single developer, we recommend selecting **3** of the following workloads for the final evaluation.

### 1. Matrix Multiplication
- **Nature:** Heavy integer/float arithmetic, tight nested loops.
- **Variable:** Matrix dimensions (N x N).
- **Justification:** A classic compute-intensive algorithm. It provides an excellent baseline for measuring raw CPU performance against the overhead of copying multi-dimensional data into Wasm linear memory.

### 2. Array Sorting (e.g., QuickSort or MergeSort)
- **Nature:** Recursive logic, high memory manipulation.
- **Variable:** Array length (N).
- **Justification:** JavaScript engines are highly optimized for sorting native JS arrays. This will test whether the cost of transferring an array to Wasm, sorting it, and returning it can outpace JS's native engine optimizations at larger scales.

### 3. Cryptographic Hashing (e.g., SHA-256)
- **Nature:** Bitwise operations, integer mathematics.
- **Variable:** String/buffer length in bytes.
- **Justification:** Historically, JS struggled with bitwise operations compared to compiled languages. This workload provides a distinct computational profile from matrix math.

### 4. Prime Number Generation (Sieve of Eratosthenes)
- **Nature:** Boolean array manipulation, iterative processing.
- **Variable:** Maximum integer limit (N).
- **Justification:** Useful for testing memory allocation and boundary overhead when returning potentially large arrays of integers back to JavaScript.
