# Literature Review

## 1. WebAssembly Fundamentals
WebAssembly (Wasm) is a binary instruction format designed as a portable compilation target for high-level languages like C, C++, and Rust. The browser execution model guarantees isolation (sandboxing) while achieving near-native execution speed. However, Wasm relies on JavaScript for DOM manipulation and Web API access. Passing data between JS and Wasm involves writing to and reading from WebAssembly's linear memory, which introduces serialization/deserialization overhead.

## 2. JavaScript vs WebAssembly Performance
Academic literature generally agrees on the following performance characteristics:
- **Compute-Intensive Tasks:** WebAssembly consistently outperforms JavaScript in CPU-bound tasks such as heavy integer operations, cryptographic hashing, and media encoding.
- **The JS-Wasm Bridge:** Research emphasizes that the performance cost of boundary crossing between JS and Wasm is non-trivial. For small payloads or low-intensity calculations, this overhead often negates Wasm's computational speed advantage.
- **Initialization Cost:** Loading, validating, and compiling Wasm modules incurs a startup cost that must be amortized over the execution time. JavaScript, aided by advanced JIT compilation, often performs better for very short, instantaneous tasks.

## 3. Workload-Aware and Adaptive Execution
The concept of adaptive execution is prevalent in distributed systems and cloud computing (e.g., edge-vs-cloud offloading). In the browser environment:
- Frameworks like ONNX Runtime Web utilize a hybrid approach, dynamically routing AI inference workloads to different backends (Wasm, WebGL, WebGPU) based on hardware availability and model requirements.
- However, for general-purpose browser execution, the decision to use JS or Wasm is largely made at compile-time by the developer. Dynamic, deterministic runtime selection for standard computational algorithms based on input size remains an underexplored optimization in standard web development.
