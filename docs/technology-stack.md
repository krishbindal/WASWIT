# Technology Stack

## Frontend Application
- **Next.js & React:**
  - *Why:* Provides a robust, component-based architecture for building the UI and managing the application state. Next.js offers easy project setup and fast builds.
  - *Status:* Required.
- **TypeScript:**
  - *Why:* Ensures type safety, especially when passing data between the UI, the benchmarking engine, and the Wasm boundary.
  - *Status:* Required.
- **Tailwind CSS:**
  - *Why:* Rapid UI styling without the overhead of heavy CSS frameworks.
  - *Status:* Required.

## WebAssembly Layer
- **Rust:**
  - *Why:* Rust is the industry standard for modern WebAssembly development due to its lack of a garbage collector, predictable performance, and excellent tooling.
  - *Status:* Required.
- **wasm-pack:**
  - *Why:* The official Rust toolchain for compiling to WebAssembly and automatically generating the JavaScript interop glue code.
  - *Status:* Required.

## Measurement & Visualization
- **Browser Performance API (`performance.now()`):**
  - *Why:* Provides sub-millisecond, high-resolution time stamps essential for accurate micro-benchmarking.
  - *Status:* Required.
- **Recharts:**
  - *Why:* A composable charting library built on React components. Excellent for plotting execution times across varying input sizes.
  - *Status:* Required.

## Version Control & Environment
- **Git & GitHub:** For source control and project tracking.
- **Optional - Web Workers:**
  - *Why:* May be considered later to prevent heavy computational benchmarks from blocking the main UI thread, though this introduces worker messaging overhead which must be factored into measurements.
  - *Status:* Optional (pending implementation phase evaluation).
