# WASWIT: Workload-Aware Intelligent Selection between JavaScript and WebAssembly

## Project Purpose
WASWIT is a research project proposing a browser-based framework to intelligently select between JavaScript and WebAssembly for computational workloads. The goal is to investigate whether workload-aware runtime selection can improve efficiency compared to static execution.

## Research & Implementation Status: Phase 5H (Complete)
The project has successfully concluded its empirical evaluation phase.
- **Current Phase**: Phase 5H (Results Interpretation & Evidence Lock).
- **Workloads Evaluated**: Matrix Multiplication (CPU/Memory bound), Merge Sort (Algorithm bound), SHA-256 (Cryptographic bound).
- **Selection Mechanism**: Deterministic, empirical threshold-based routing (No ML/AI). The mechanism is calibrated via an independent warmup phase and strictly routes based on input size.
- **Evaluation Status**: Final evaluation complete. Phase 5E (Independent Acquisition), Phase 5F (Statistical Analysis), and Phase 5H (Interpretation) are locked and cryptographically hashed.
- **Research Status**: The experiment descriptively observed distinct timing profiles between runtimes and validated correct policy execution. However, rigorous paired permutation tests (with Holm-Bonferroni correction) did not yield statistically significant evidence to reject the null hypothesis of zero median paired difference.

## Reproducibility Status
- All evidence, artifacts, and policies are locked within `frontend/artifacts/`.
- Provenance hashes secure the raw data and frozen evaluation protocols.
- Experimental conditions (browser context per replicate) are formally documented.

## Major Limitations
- **OS/Engine specific**: Data was acquired on a single physical host and single browser engine (Blink/Chromium 138).
- **Adaptive Execution Boundary**: The independent evaluation grid validated policy-consistent routing but lacked an evaluation size within the JavaScript-selected region, meaning a runtime switch was not actively exercised in the final data.
- **Context Lifetime Mismatch**: Evaluation used one fresh browser context per replicate (with fresh pages per case) rather than complete per-case context isolation, exposing cases within a replicate to shared context lifetime effects.
- **No Machine Learning**: The project relies exclusively on deterministic empirical calibration thresholds.

## Major Technologies
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **WebAssembly**: Rust, wasm-pack
- **Measurement**: Browser Performance API (Performance.now)

## Important Scope Restrictions
- This project operates entirely in the browser environment.
- **NO AI or Machine Learning** is used for runtime selection; it relies on empirically calibrated thresholds.
- **NO external datasets** are utilized.
- **NO backend, serverless infrastructure, or database** is implemented.