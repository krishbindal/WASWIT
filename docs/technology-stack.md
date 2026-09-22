# Technology Stack

## Frontend Application
- **Next.js**: v14/15+
  - *Why:* Provides a robust, component-based architecture for building the UI and managing the application state. Next.js offers easy project setup and fast builds.
  - *Status:* Configured and scaffolded (Phase 1A).
- **React**: v18/19+
  - *Status:* Configured and scaffolded (Phase 1A).
- **TypeScript**: v5+
  - *Why:* Ensures type safety, especially when passing data between the UI, the benchmarking engine, and the Wasm boundary.
  - *Status:* Configured with strict settings (Phase 1A).
- **Tailwind CSS**: v3+ (PostCSS)
  - *Why:* Rapid UI styling without the overhead of heavy CSS frameworks.
  - *Status:* Configured and scaffolded (Phase 1A).
- **Vitest** and **React Testing Library**:
  - *Why:* Replaces Jest for faster, Vite-based testing natively compatible with modern ESM modules and React.
  - *Status:* Configured and smoke-tested (Phase 1A).

## WebAssembly Layer
- **Rust**:
  - *Why:* Rust is the industry standard for modern WebAssembly development due to its lack of a garbage collector, predictable performance, and excellent tooling.
  - *Status:* Scaffolded (`wasm/` workspace created). Note: Pending Rust toolchain installation on local machine.
- **wasm-pack**:
  - *Why:* The official Rust toolchain for compiling to WebAssembly and automatically generating the JavaScript interop glue code.
  - *Status:* Scaffolded.

## Measurement & Visualization
- **Browser Performance API (`performance.now()`):**
  - *Why:* Provides sub-millisecond, high-resolution time stamps essential for accurate micro-benchmarking.
  - *Status:* Required.
- **Recharts:**
  - *Why:* A composable charting library built on React components. Excellent for plotting execution times across varying input sizes.
  - *Status:* Required.

## Version Control & Environment
- **Git & GitHub:** For source control and project tracking.
