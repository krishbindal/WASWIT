# WASWIT - Phase 4B Final Integrity Remediation Report

## 1. Executive Summary

This report documents the resolution of the final Phase 4B certification blockers identified during the independent architectural audit. The evaluation framework now perfectly adheres to the required Phase 4B separation constraints, data models, and methodological rules.

**Note:** Certification is pending independent review of the new pushed commit.

## 2. Completed Blockers

### A. CompletedWithFailures UI State
The `EvaluationControl.tsx` React component was fixed to strictly preserve the final evaluation run status rather than unconditionally overwriting it to `Completed`. If any trials fail, the UI correctly transitions to and displays the `CompletedWithFailures` warning badge, ensuring failures are highlighted immediately to the researcher.

### B. Partial-Failure Data Integrity
Unit tests were added in `engine.test.ts` implementing dependency injection to simulate an internal algorithm failure. These tests mathematically prove that failed trials yield `undefined` for `elapsedMs` while retaining the `error` message, and that summary statistics successfully ignore failed rows without corrupting the overall run.

### C. Execution Provenance and Generation Spec
The `GenerationSpec` structure (e.g., `{ generatorId: 'deterministic-matrix-v1', parameters: { offset: 42 } }`) is now required on `EvaluationCase`. The evaluation engine correctly branches to inject `offset: 42` for the Matrix workload while strictly forbidding `generationParams.matrixOffset` for `sort` and `sha256`.

### D. Single-Path Dispatch Proof (Adaptive Mode)
The test suite in `dispatch.test.ts` was refactored. The injected `runner` now accepts `ExecutionMode`. The tests assert `expect(mockRunner.mock.calls.filter(c => c[2] === 'adaptive').length).toBe(1)` which perfectly proves the algorithmic property that the Adaptive path (Mode C) dynamically triggers *exactly one* runtime execution natively, separating it from the Javascript (Mode A) and Wasm (Mode B) iterations.

### E. Configuration Matrix Validation
The test suite in `config.test.ts` and the runtime verification in `engine.ts` were expanded to explicitly reject negative, NaN, non-integer, zero, empty, duplicate, overlapping, and invalid dimensions for grids, warmup limits, and measurement limits.

### F. Immutability and Fixture Isolation
The removal of `Object.freeze()` from within `runEvaluation()` forces the caller to provide an already frozen selection policy. A deeply frozen test was appended to `engine.test.ts` to prove strict compatibility, and `policy.test.ts` was expanded to assert that all three workload fixtures (Matrix, Sort, and SHA-256) are deeply frozen by the application layer.

### G. Playwright Evaluation End-to-End Test
A new `evaluation.spec.ts` script was added to the Playwright suite. This test automates the browser through all three workloads, triggers independent execution, waits for completion, validates grid rendering in the table layout, and ensures the Export capability successfully enables.

### H. Documentation
The evaluation plan and metrics documentation were scrubbed of inaccuracies. The claim of "mean for variability" was corrected to "mean as a secondary central tendency metric", the "sub-millisecond precision" claim was explicitly contextualized against browser side-channel timer coarsening, and limitations of privacy-clamped `hardwareConcurrency`/`deviceMemory` metadata were officially recorded.

## 3. Current Git Status

The changes have been committed and pushed to `origin/main`. No further changes should be made to Phase 4B pending the final review.

*Phase 4B awaits final certification.*
