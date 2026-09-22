# Representative Workloads

To effectively test the WASWIT selection engine, we need algorithms that can be implemented cleanly in both JavaScript and WebAssembly, and where the computational complexity scales cleanly with the input size.

## Proposed Workloads — Final Selection Pending Implementation Validation

### 1. Matrix Multiplication
- **Why:** Highly compute-intensive with $O(N^3)$ time complexity. It relies heavily on tight loops and array access, which traditionally favors WebAssembly.
- **Variable:** Matrix dimensions (N x N).
- **Measurement:** Highlights pure CPU performance vs. memory boundary overhead.

### 2. Large-scale Array Sorting
- **Why:** Sorting is a common operation. Implementing algorithms like QuickSort or MergeSort allows testing recursive logic and memory manipulation. 
- **Variable:** Array length (N).
- **Measurement:** Tests how boundary overhead (copying the array to Wasm linear memory) affects tasks with $O(N \log N)$ complexity. JS might win on smaller arrays due to zero-copy overhead.

### 3. Cryptographic Hashing (e.g., SHA-256)
- **Why:** Relies on bitwise operations and integer mathematics, where JavaScript's Number type (Float64) historically struggled before BigInt and JIT improvements. Rust/Wasm handles bitwise operations natively.
- **Variable:** String/buffer length in bytes.
- **Measurement:** Excellent for observing boundary overhead vs. bitwise computation speed.

### 4. Prime Number Generation (Sieve of Eratosthenes)
- **Why:** A classic integer and boolean array manipulation workload.
- **Variable:** The maximum limit (N) to find primes up to.
- **Measurement:** Tests memory allocation limits and iterative computational speed.

## Evaluation Criteria for Finalization
Before full implementation, these workloads will be validated against:
1. Ease of equivalent implementation in both JS and Rust.
2. Ability to cleanly isolate the timing of the boundary crossing from the timing of the raw computation.
3. Reproducibility across multiple browser runs.
