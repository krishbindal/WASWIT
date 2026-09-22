# Prior Art

An investigation into existing academic literature and technical implementations reveals several approaches to performance optimization and execution selection.

## 1. Browser ML Runtimes (e.g., ONNX Runtime Web, TensorFlow.js)
- **Problem solved:** Efficiently running machine learning models in the browser.
- **Environment:** Local web browser.
- **Runtimes involved:** JavaScript, WebAssembly, WebGL, WebGPU.
- **Selection mechanism:** Primarily hardware capability detection (falling back from WebGPU to WebGL to Wasm) and tensor characteristic profiling.
- **How it differs from WASWIT:** These systems are highly specialized for ML tensors and focus heavily on GPU offloading. WASWIT focuses on general-purpose computational algorithms executed strictly on the CPU, balancing JS against Wasm based on input size.

## 2. Static Performance Benchmarks (e.g., Herrera et al., 2021)
- **Problem solved:** Systematically comparing Wasm and JS to understand architectural trade-offs.
- **Environment:** Browsers and standalone runtimes (V8, SpiderMonkey, Wasmtime).
- **Runtimes involved:** JavaScript and WebAssembly.
- **Selection mechanism:** N/A (Static benchmarking).
- **How it differs from WASWIT:** These papers provide the foundational metrics confirming that JS is sometimes faster than Wasm depending on the workload and overhead. However, they do not attempt to build a runtime framework that automatically switches between them.

## 3. Mobile-Cloud Offloading Systems
- **Problem solved:** Saving battery or increasing speed on mobile devices by sending tasks to the cloud.
- **Environment:** Mobile browser / Cloud servers.
- **Runtimes involved:** Local JavaScript/Wasm vs. Remote Node/Native.
- **Selection mechanism:** Network latency and local CPU availability thresholds.
- **How it differs from WASWIT:** These systems route over a network. WASWIT routes entirely within the local sandbox, avoiding network unreliability and focusing strictly on the local JS-Wasm boundary overhead.
