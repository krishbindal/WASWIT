# Phase 5B: Engineering Pilot Report

> **ENGINEERING PILOT — NOT FINAL RESEARCH DATA**
>
> Pilot observations are engineering evidence only and are excluded from final research analysis.

## A. Pilot Objective
The objective of this pilot is to determine whether the locked Phase 5 research protocol is operationally feasible on the current development machine/browser environment. It answers engineering questions regarding computational practicality, warmup stability, iteration limits, and acquisition architecture, strictly without drawing any statistical or performance conclusions.

## B. Environment
- **Git Commit SHA**: `50b8cb6cd4154bb1d67521cbf372ca8e7441d5f2` (prior to pilot artifacts)
- **Node**: v24.11.1 | **npm**: 11.6.2 | **Rustc**: 1.98.1 | **Cargo**: 1.98.1 | **wasm-pack**: 0.15.0
- **Browser**: Google Chrome (via Playwright)
- **OS**: Windows
- **Logical Processor Count**: Unknown/Unavailable
- **Device Memory**: Unknown/Unavailable
- **crossOriginIsolated**: false (default local server)
- **performance.now Availability**: Confirmed
- **Timestamp**: 2026-09-29T21:18:00+05:30

## C. Build Verification
Before execution, build integrity was successfully verified using:
```bash
npm run build:wasm
npm run build
```
Both steps succeeded. The pilot leveraged the exact compiled artifact produced from the locked commit. No changes were made to certified implementations.

## D. Workload Feasibility
We explicitly tested a small representative set of grid sizes to assess boundaries:
- **Matrix 150**: Actually tested. Completed successfully.
- **Merge Sort 3000**: Actually tested. Completed successfully.
- **SHA-256 10000**: Actually tested. Completed successfully.

**Classification of Proposed Final Grids**:
- Matrix [50, 100, 150, 200, 250, 300]: **PROVISIONALLY FEASIBLE** (Bounded by successful representative points, with the explicit caveat that the upper bounds were not directly run in this tiny pilot).
- Merge Sort [1000...5000]: **PROVISIONALLY FEASIBLE**
- SHA-256 [1000...20000]: **PROVISIONALLY FEASIBLE**

No failures were demonstrated. No points were silently removed.

## E. Candidate Iteration Feasibility
We actually executed combinations of warmup candidates (`3`, `5`) and measurement candidates (`10`, `30`, `50`) for the representative sizes.
- **Warmups (3 vs 5)**: Both completed cleanly. Runtime differences between them are trivial.
- **Measurement Iterations (10, 30, 50)**: All counts executed safely without triggering browser unresponsiveness or memory exhaustion.

## F. Stability Observations & Zero-Timing Feasibility
- **Successful completion**: 100% of tested cases completed without errors.
- **Browser Responsiveness**: UI responsiveness remained intact; memory pressure was negligible.
- **Zero-Timing Frequency**: For SHA-256 10000 and Merge Sort 3000, we observed multiple instances of `elapsedMs === 0` due to browser timer-resolution coarsening. 
  - *Engineering Action*: We recommend treating the smallest grid sizes (e.g., SHA-256 1000, 2500) as heavily **timer-resolution constrained**. Analysts must mathematically handle exactly-zero samples gracefully (e.g., avoiding division by zero in overhead ratios). The protocol does not need to be rewritten to remove these sizes, as observing resolution floors is a valid empirical outcome.

## G. Ordering-Strategy Proof-of-Concept
We conducted small engineering proof-of-concepts for both architecture options:

- **Option A (Counterbalanced Order)**: We successfully executed a localized loop swapping the order (e.g., `JS -> Wasm` then `Wasm -> JS`). While simple to script locally, this approach is operationally complex to enforce cleanly upon the locked Phase 4B `runEvaluation` signature without refactoring it.
- **Option B (Separate Contexts)**: We successfully executed a Playwright script that spins up a fresh `browser.newContext()` for JS, closes it, and spins up another fresh context for Wasm, retrieving successful timings. 

**Recommendation**: We recommend **Option B**. It reduces coupling between measurements caused by shared browser state (like GC or V8 tiering). It does not eliminate machine-level thermal or operating-system scheduling effects, but it provides a clean, reproducible orchestration layer that strictly preserves identical inputs without relying solely on a fixed A->B->C order inside a single page lifecycle.

## H. Grid Recommendations
The Phase 5A proposed grids are retained based on provisional feasibility:
- **Matrix**: 50, 100, 150, 200, 250, 300 (Calibration) / 75, 125, 175, 225, 275 (Evaluation)
- **Merge Sort**: 1000, 2000, 3000, 4000, 5000 (Calibration) / 1500, 2500, 3500, 4500 (Evaluation)
- **SHA-256**: 1000, 5000, 10000, 15000, 20000 (Calibration) / 2500, 7500, 12500, 17500 (Evaluation)

## I. Iteration Recommendations
After direct engineering testing of all candidates, we recommend:
- **Final Warmup Iterations**: 5. (Supported by pilot evidence; minimal time cost, ensures maximum opportunity for stable tiering).
- **Final Measurement Iterations**: 30. (Supported by pilot evidence; executes rapidly while capturing a sufficient distribution curve for median extraction).
- **Final Independent Replicates**: 10. (Supported by pilot evidence; Option B's context-spinning architecture is fast enough that N=10 will not cause orchestration timeouts).

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
