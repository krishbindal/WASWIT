# Prior Art

An investigation into existing academic papers and technical frameworks reveals several approaches to JavaScript and WebAssembly performance optimization.

## 1. WebAssembly vs JavaScript Performance Analyses
- **Understanding the Performance of WebAssembly Applications (IMC '21)**
  - *What it does:* Analyzes Wasm performance across different compilers and execution environments.
  - *Execution Environment:* Browser and standalone runtimes.
  - *Relevance:* Demonstrates that Wasm's advantage varies wildly by workload and compiler toolchain, confirming that Wasm is not universally faster.

- **WebAssembly versus JavaScript: Energy and Runtime Performance (INESC TEC)**
  - *What it does:* Systematically compares the energy consumption and execution speed of JS and Wasm.
  - *Relevance:* Highlights that while Wasm is often more energy-efficient for computation, JS remains highly competitive for certain types of operations due to JIT optimization.

## 2. Adaptive Runtime Frameworks
- **ONNX Runtime Web / TensorFlow.js**
  - *What it does:* Executes machine learning models in the browser.
  - *Selection Mechanism:* Performs runtime selection between CPU (Wasm) and GPU (WebGL/WebGPU) backends based on hardware capabilities and model types.
  - *Relevance to WASWIT:* Demonstrates that runtime selection in the browser is feasible and beneficial, though these frameworks focus exclusively on ML tensors and GPU offloading rather than JS vs Wasm computational balancing.

- **Edge-to-Cloud Computation Offloading (Various academic papers)**
  - *What it does:* Dynamically decides whether to run a workload on the local browser or offload it to a cloud server based on network latency and local CPU availability.
  - *Relevance to WASWIT:* Uses similar theoretical models (profiling and threshold-based routing) but applied to network architecture rather than local language execution boundaries.

## Summary
Current prior art largely focuses on *comparing* JS and Wasm statically, or routing workloads between local CPU and local GPU. 
