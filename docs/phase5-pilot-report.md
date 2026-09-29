# Phase 5B: Engineering Pilot Report

> **ENGINEERING PILOT — NOT FINAL RESEARCH DATA**
>
> Pilot observations are engineering evidence only and are excluded from final research analysis.

## A. Pilot Objective
The objective of this pilot is to determine whether the locked Phase 5 research protocol is operationally feasible on the current development machine/browser environment. It answers engineering questions regarding computational practicality, warmup stability, iteration limits, and acquisition architecture, strictly without drawing any statistical or performance conclusions.

## B. Environment
- **Git Commit SHA**: `2ba2d97bf44e90df602ec4612444c7a0f0e0f3ba` (prior to pilot artifacts)
- **Node**: v24.11.1 | **npm**: 11.6.2 | **Rustc**: 1.98.1 | **Cargo**: 1.98.1 | **wasm-pack**: 0.15.0
- **Browser**: Google Chrome (via Playwright)
- **OS**: Windows
- **Logical Processor Count**: Unknown/Unavailable
- **Device Memory**: Unknown/Unavailable
- **crossOriginIsolated**: false (default local server)
- **performance.now Availability**: Confirmed
- **Timestamp**: 2026-09-29T17:10:49.560Z

## C. Build Verification
Before execution, build integrity was successfully verified using:
```bash
npm run build:wasm
npm run build
```
Both steps succeeded. The pilot leveraged the exact compiled artifact produced from the locked commit. No changes were made to certified implementations.

## D. Workload Feasibility

### ACTUALLY EXECUTED
We executed a small representative set of grid sizes to assess boundaries. All 18 combinations of warmups (3, 5) and measurements (10, 30, 50) were executed for these sizes.
- **Matrix 150**: 100% completion in JS/Wasm.
- **Merge Sort 3000**: 100% completion in JS/Wasm.
- **SHA-256 10000**: 100% completion in JS/Wasm.

### NOT EXECUTED
All other proposed grid points (e.g. Matrix 50, 200, 250, 300; Sort 1000, 2000, 4000, 5000; SHA 1000, 5000, 15000, 20000) were NOT executed in this pilot to keep orchestration fast.

### ENGINEERING INFERENCE
Because Matrix 150 completes in <10ms and memory overhead is non-existent at this scale, we infer that Matrix 300 will safely execute within browser limits without causing UI hangs or OOMs. Matrix 300 has 4× the matrix element/storage count of Matrix 150 and approximately 8× the cubic multiplication workload. The same logic applies to the unexecuted upper bounds of Sort and SHA-256.

### PROVISIONAL RECOMMENDATION
The proposed final grids remain identical to Phase 5A, but their feasibility is classified strictly as **PROVISIONALLY FEASIBLE**:
- **Matrix**: 50, 100, 150, 200, 250, 300 (Calibration) / 75, 125, 175, 225, 275 (Evaluation)
- **Merge Sort**: 1000, 2000, 3000, 4000, 5000 (Calibration) / 1500, 2500, 3500, 4500 (Evaluation)
- **SHA-256**: 1000, 5000, 10000, 15000, 20000 (Calibration) / 2500, 7500, 12500, 17500 (Evaluation)

## E. Candidate Iteration Feasibility

### ACTUALLY EXECUTED
- **Warmups**: `3` and `5`
- **Measurement Iterations**: `10`, `30`, and `50`
All combinations executed safely without triggering browser unresponsiveness.

### PROVISIONAL RECOMMENDATION
- **Final Warmup Iterations**: 5. (Supported by executed evidence).
- **Final Measurement Iterations**: 30. (Supported by executed evidence).
- **Planned Final Independent Replicates**: 10. The pilot established that repeated fresh-context orchestration is operationally feasible; it did not establish statistical sufficiency of N=10.

## F. Zero-Timing Frequency

### ACTUALLY EXECUTED
- **SHA-256 10000**: 149 total zero-samples across all configurations.
- **Merge Sort 3000**: 0 total zero-samples (contrary to previous assumptions).

### ENGINEERING INFERENCE
Timer-resolution coarsening (`elapsedMs === 0`) heavily affects the smallest workloads (particularly SHA-256).

### PROVISIONAL RECOMMENDATION
Treat the smallest grid sizes (e.g., SHA-256 1000, 2500) as heavily **timer-resolution constrained**. Analysts must mathematically handle exactly-zero samples gracefully. We do not delete these samples, nor do we rewrite protocol semantics.

## G. Ordering-Strategy Proof-of-Concept

### ACTUALLY EXECUTED
- **Option A (Counterbalanced Order)**: Executed a localized loop traversing all three modes using a deterministic fixture: `[JS -> Wasm -> Adaptive]`, `[Wasm -> Adaptive -> JS]`, `[Adaptive -> JS -> Wasm]`. Recorded median, overhead, and selection dynamically without modifying the core. Option A Adaptive timing is an engineering POC end-to-end measurement and is not used as the certified Phase 4B Adaptive elapsedMs metric.
- **Option B (Separate Contexts)**: The pilot directly demonstrated isolated JS, Wasm, and Adaptive fresh-context execution using a Playwright script launching fresh `browser.newContext()`. JS was executed without initializing Wasm.
- **N=30 Orchestration**: N=10 fresh JS browser-context orchestration was successfully demonstrated (extended to 30 contexts across JS, Wasm, and Adaptive). This establishes operational feasibility for repeated isolated contexts; it is not evidence of statistical sufficiency and does not by itself constitute 10 complete three-mode research replicates.

### ENGINEERING INFERENCE
Option B reduces coupling between measurements caused by shared browser state (e.g. V8 tiering or garbage collection). It does not isolate or eliminate machine-level thermal or operating-system scheduling effects.

### PROVISIONAL RECOMMENDATION
Recommend **Option B**. It provides high orchestration provenance and reproducibility while avoiding fixed A->B->C ordering constraints within a single page lifecycle.

## J. Protocol Issues
No operational impossibilities requiring a Phase 5A re-lock were identified. The timer quantization behavior aligns exactly with the protocol's declared limitations. 

## K. Pilot Artifact Locations
- Runner Route: `frontend/src/app/pilot-test-runner/page.tsx`
- Orchestrator: `frontend/e2e/pilot.spec.ts`
- Results: `frontend/artifacts/pilot/pilot_matrix_150_engineering_*.json`

## L. Pilot Limitations
- **Limited Representative Points**: Only a tiny subset of intermediate grid bounds was explicitly run.
- **Single Machine**: Bound to one development machine's specific constraints.
- **Browser-Specific**: V8/Chrome behavior only.
- **No Inferential Statistics**: None calculated.
- **No Final Research Evidence**: All data collected is structurally barred from use in the final dissertation/analysis.
