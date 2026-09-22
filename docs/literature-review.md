# Literature Review

This section reviews established academic findings regarding WebAssembly performance and hybrid browser execution.

## 1. WebAssembly vs. JavaScript Performance
Current academic literature reveals a nuanced picture of WebAssembly performance compared to JavaScript:
- **Workload Dependency:** WebAssembly can provide substantial performance benefits for specific computational workloads, particularly those involving intensive integer arithmetic or predictable loop structures. However, researchers emphasize that Wasm's performance advantage varies significantly depending on the environment, compiler toolchain, and workload (Herrera et al., *"Understanding the Performance of WebAssembly Applications"*, ACM IMC 2021).
- **JIT Competitiveness:** JavaScript engines are highly optimized. For certain workloads—particularly those involving dynamic objects or floating-point calculations—JavaScript can be highly competitive (Macedo et al., *"WebAssembly versus JavaScript: Energy and Runtime Performance"*, IEEE ICT4S 2022). WebAssembly is NOT universally faster than native code or highly-JIT-optimized JavaScript (Jangda et al., *"Not So Fast: Analyzing the Performance of WebAssembly vs. Native Code"*, USENIX ATC 2019).

## 2. JS↔Wasm Boundary Overhead
A critical theme in Wasm research is the impact of the JS-Wasm boundary. Calling a Wasm function from JS is not free. 
- Research indicates that the boundary overhead—arising from function-call transitions, data representation mismatch, copying arrays to/from linear memory, and allocation costs—can create significant bottlenecks (Lehmann et al., *"SoK: Analysis Techniques for WebAssembly"*).
- For very fast algorithms or small input sizes, the overhead of invoking the Wasm module and managing its memory can take longer than simply executing the calculation directly in JavaScript.

## 3. Adaptive and Hybrid Execution
Hybrid execution architectures are actively researched, though they take varying forms:
- **Computation Offloading:** Much of the existing literature focuses on Edge-to-Cloud offloading, where the browser dynamically shifts workloads to a server based on network constraints.
- **Hardware Routing (Machine Learning):** In browser-based machine learning (e.g., TensorFlow.js, ONNX Runtime Web), frameworks dynamically select between execution backends (CPU via Wasm, or GPU via WebGL/WebGPU) based on hardware availability and tensor properties.
- **Local Adaptive Routing:** Using empirical thresholds to route purely computational, non-ML algorithms between local JavaScript and local WebAssembly based on input size remains an area that appears less systematically explored in general web development frameworks.
