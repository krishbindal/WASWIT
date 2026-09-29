# Phase 5B: Engineering Pilot Report

> **ENGINEERING PILOT — NOT FINAL RESEARCH DATA**
>
> Pilot observations are engineering evidence only and are excluded from final research analysis.

## A. Pilot Objective
The objective of this pilot is to determine whether the locked Phase 5 research protocol is operationally feasible on the current development machine/browser environment. It answers engineering questions regarding computational practicality, warmup stability, iteration limits, and acquisition architecture, strictly without drawing any statistical or performance conclusions.

## B. Environment
- **Git Commit SHA**: `50b8cb6cd4154bb1d67521cbf372ca8e7441d5f2` (prior to pilot artifacts)
- **Node Version**: v24.11.1
- **npm Version**: 11.6.2
- **Rustc Version**: 1.98.1
- **Cargo Version**: 1.98.1
- **wasm-pack Version**: 0.15.0
- **Browser**: Google Chrome (via Playwright)
- **OS**: Windows
- **Logical Processor Count**: Unknown/Unavailable in Node shell context
- **Device Memory**: Unknown/Unavailable
- **crossOriginIsolated**: false (default local server)
- **performance.now Availability**: Confirmed
- **Timestamp**: 2026-09-29T21:05:00+05:30

## C. Build Verification
Before execution, build integrity was successfully verified using:
```bash
npm run build:wasm
npm run build
```
Both steps succeeded. The pilot leveraged the exact compiled artifact produced from the locked commit. No changes were made to certified implementations.

## D. Workload Feasibility
The pilot tested representative upper and lower bounds for the proposed grids:
- **Matrix (50, 150, 300)**: All sizes completed successfully. Size 300 executes in < 50ms, meaning memory pressure and browser responsiveness remain entirely safe.
- **Merge Sort (1000, 3000, 5000)**: All sizes completed successfully. Sub-millisecond execution times. No maximum call stack issues or OOM errors.
- **SHA-256 (1000, 10000, 20000)**: All sizes completed successfully. Extremely fast execution times (< 0.2ms), occasionally hitting 0ms measurements due to timer coarsening constraints, but no crashes.

**Classification**:
All proposed sizes across Matrix, Merge Sort, and SHA-256 are **FEASIBLE**.

## E. Candidate Iteration Feasibility
- **Warmups (3 vs 5)**: Both are easily accommodated since maximum execution time is < 50ms. 5 warmup iterations take barely any time and adequately saturate the JIT pipeline for these small operations.
- **Measurement Iterations (10, 30, 50)**: 30 iterations is computationally trivial for the browser (e.g., 30 * 50ms = 1500ms max per case). 50 iterations is also completely safe.

## F. Stability Observations
- **Successful completion**: 100% of tested cases completed without errors.
- **ElapsedMs validity**: Valid numbers returned. Zero or near-zero timing (0ms - 0.1ms) was observed frequently for SHA-256 and Merge Sort due to browser timer coarsening, which aligns with the known limitations documented in the Phase 5A protocol.
- **Extreme timing spikes**: Did not cause test runner timeouts; however, isolated GC spikes are inherently handled by median aggregation.
- **Memory/Wasm Init**: No initialization problems or memory exhaustion observed.

## G. Ordering-Strategy Feasibility
We evaluated Option A (Counterbalanced mode order) vs Option B (Separate fresh browser contexts per mode).
- **Option A**: Operationally complex to implement cleanly without breaking the Phase 4B `runEvaluation` signature, as it inherently executes `JS -> Wasm -> Adaptive`.
- **Option B**: Highly feasible via a Playwright orchestration layer. We can boot independent fresh contexts, inject exact workload specs, and isolate memory completely. 
**Recommendation**: Option B is the recommended acquisition strategy for Phase 5C-5E. It perfectly isolates JIT fatigue, thermal memory drift, and allows us to respect Phase 4B's locked state by orchestrating the bounds externally.

## H. Grid Recommendations
Based on the lack of memory pressure, all proposed sizes are deemed feasible.
- **Matrix**: 50, 75, 100, 125, 150, 175, 200, 225, 250, 275, 300
- **Merge Sort**: 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000
- **SHA-256**: 1000, 2500, 5000, 7500, 10000, 12500, 15000, 17500, 20000

## I. Iteration Recommendations
- **Final Warmup Iterations**: 5. (Minimal time cost, maximizes JIT stabilization).
- **Final Measurement Iterations**: 30. (Offers a solid distribution for median extraction while keeping total orchestration runtime fast).
- **Final Independent Replicates**: 10. (Since Option B means spinning up browser contexts, N=10 offers robust statistical resampling without making the test suite take hours).

## J. Protocol Issues
**Protocol Issues Identified by Pilot**:
- *Timer Quantization*: For SHA-256 at size 1000, execution is so fast that elapsed time frequently reports as exactly `0`. 
  - *Impact*: Median could be exactly `0`, confusing overhead/efficiency calculations in RQ3.
  - *Correction/Mitigation*: The protocol already states that precision is subject to coarsening. As this is an engineering reality of the browser, no protocol change is strictly required. Analysts must handle `0` elapsed time gracefully during Phase 5F.

## K. Exact Pilot Artifact Locations
- Runner Application Route: `frontend/src/app/pilot-test-runner/page.tsx`
- Orchestrator Spec: `frontend/e2e/pilot.spec.ts`
- Results Artifact: `frontend/artifacts/pilot/pilot_results.json`

## L. Explicit Declaration
**Pilot observations are engineering evidence only and are excluded from final research analysis.**
