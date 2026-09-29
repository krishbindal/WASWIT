# Repository Integrity Audit & Remediation Report

## Overview
A comprehensive repository-wide audit was conducted to ensure scientific integrity, resolve engineering defects, align documentation, and rectify methodological phrasing before the final evidence package lock.

This audit addressed engineering bugs, stale documentation, methodological inconsistencies, provenance issues, overclaims, unsafe research-acquisition workflows, and reproducibility hazards.

**Important Note:** The scientific evidence (Phase 5E evaluation JSON, frozen policy, Phase 5F statistical outputs) remains strictly locked and unmodified. This audit was entirely restricted to reporting, documentation, and interface alignment.

## Audit Checklist & Remediation Log

### Part A: Baseline Verification
- [x] Verified current `main` HEAD commit.
- [x] Verified Phase 5H interpretation integrity JSON structure and base commit SHA.

### Part B: Scientific Limitations & Constraints
- [x] Documented the adaptive evaluation boundary limitation (no switch exercised in final grid).
- [x] Fixed Matrix Numerical Parity claim to explicitly note JS `f64` vs Rust `f32` precision limitations.
- [x] Documented that raw warmup placeholders (0) are explicitly unmeasured.
- [x] Documented that the sign-flip test relies on a sign-symmetry heuristic.
- [x] Fixed `frontend/e2e/parity.spec.ts` (and `page.tsx`) to use explicit rejection flags for negative dimensions.

### Part C: Engineering Bugs
- [x] Fixed `evaluation-runner` type/input parsing (preventing URL param NaN and handling adaptive instantiation).
- [x] Fixed `DashboardShell.tsx` to correctly display the "Policy Loaded" badge by using the `frozenPolicy` prop instead of `activeRun?.policy`.
- [x] Updated stale status badges in `DashboardShell.tsx` to current states: "Phase 5H Certified", "Evidence Locked", and "Interactive Harness".
- [x] Renamed UI to "Interactive Evaluation Harness" and fixed disjoint demo grids in `EvaluationControl.tsx` and `evaluation.spec.ts`.
- [x] Fixed Adaptive Visualization labels in `BenchmarkChart.tsx` and `VisualizationDataTable.tsx` to note exclusion of selection overhead.
- [x] Implemented `WASWIT_RESEARCH_ACQUISITION` safety guard skips in Playwright configuration/specs (`calibration.spec.ts`, `phase5e-evaluation.spec.ts`, `pilot.spec.ts`).
- [x] Added cross-platform Node runner `run-research-acquisition.mjs` and updated `package.json` scripts.
- [x] Fixed OS metadata fallbacks in Playwright to securely capture `Unknown` instead of assuming `Windows` if WMI fails.

### Part D: Documentation Consistency
- [x] Updated `README.md` and `progress.md` to reflect Phase 5H completion.
- [x] Updated Phase 5E plan vs actual deviation in `phase5e-evaluation-acquisition-plan.md` (fresh contexts vs fresh pages in one context).
- [x] Updated Phase 5C calibration report to remove the absolute OS claim and replace it with environment-provided WMI verification.
- [x] Appended the sign-symmetry testing heuristic to `research-assumptions.md`.

### Parts E & F: Claims Cleanup
- [x] Replaced instances of "pre-registered" with "pre-specified" to avoid implying external registry lock.
- [x] Toned down significance claims to accurately reflect Popperian falsification: "the experiment did not provide sufficient evidence to reject the null hypothesis".

### Part G: Generator Script
- [x] Updated `generate-phase5h.py` to correctly parse and validate inputs (e.g. checking length of `case_level_metrics.json`) instead of hardcoding `PASS`.

### Part H: Prior Art
- [x] Included the May 2026 Chaeeun Lee / Sanghoon Jeon paper in `prior-art.md`.
- [x] Narrowed the WASWIT research gap explicitly to CPU workloads without ML in `research-gap.md`.

### Parts I & J: Terminology
- [x] Added a comment to `phase5e-evaluation.spec.ts` explicitly identifying `policyIntegrityHash` as a semantic snapshot marker, not a cryptographic hash of the JSON payload.

### Part K: Errata Centralization
- [x] Created `docs/phase5-final-evidence-errata.md` centralizing all 14 listed limitations and transparency notes.

### Part M: Cargo Artifacts
- [x] Removed placeholder emails in `wasm/Cargo.toml`.

## Conclusion
The repository has been successfully audited and remediated. The codebase and documentation are now fully aligned with the certified Phase 5 evidence package.
