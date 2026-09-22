# Technology Stack

## Frontend Application
- **Next.js**: 16.3.5
  - *Why:* Provides a robust, component-based architecture for building the UI and managing the application state. Next.js offers easy project setup and fast builds.
  - *Status:* Configured and scaffolded (Phase 1A).
- **React**: 19.2.8
  - *Status:* Configured and scaffolded (Phase 1A).
- **TypeScript**: 5.x
  - *Why:* Ensures type safety, especially when passing data between the UI, the benchmarking engine, and the Wasm boundary.
  - *Status:* Configured with strict settings (Phase 1A).
- **Tailwind CSS**: 4.x
  - *Why:* Rapid UI styling without the overhead of heavy CSS frameworks.
  - *Status:* Configured and scaffolded (Phase 1A).
- **Vitest**: 5.0.1
  - *Why:* Replaces Jest for faster, Vite-based testing natively compatible with modern ESM modules and React.
  - *Status:* Configured and fully active.
- **Playwright**: 1.63.0
  - *Why:* E2E testing framework.
  - *Status:* Configured and fully active.

## WebAssembly Layer
- **Rust**: 1.98.1
  - *Why:* Rust is the industry standard for modern WebAssembly development due to its lack of a garbage collector, predictable performance, and excellent tooling.
  - *Status:* Configured and actively building workloads.
- **wasm-pack**: 0.15.0
  - *Why:* The official Rust toolchain for compiling to WebAssembly and automatically generating the JavaScript interop glue code.
  - *Status:* Configured and actively building workloads.

## Measurement & Visualization
- **Browser Performance API (`performance.now()`):**
  - *Why:* Provides sub-millisecond, high-resolution time stamps essential for accurate micro-benchmarking.
  - *Status:* Configured and used for Calibration engine.
- **Recharts:**
  - *Why:* A composable charting library built on React components. Excellent for plotting execution times across varying input sizes.
  - *Status:* Planned for Phase 4 (Not installed or required yet).

## Version Control & Environment
- **Git & GitHub:** For source control and project tracking.
