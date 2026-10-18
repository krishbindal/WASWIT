# WASWIT: Comprehensive Project Audit Report

**Audit Date**: October 18, 2026  
**Auditor**: Senior Software Architect, WebAssembly Engineer & Research Integrity Reviewer  
**Target Repository**: `https://github.com/krishbindal/WASWIT`  
**Current Local HEAD**: `5c530f6f548f23e9f18a5f7b562c187eeeef024c`  
**Remote `origin/main` HEAD**: `a3582c0fd17a9700d7ee0321203cd5a6fa8b9ddb`  
**Certification Status**: CERTIFIED / MTE READY  

---

## 1. Executive Summary

This comprehensive audit independently verified the entire WASWIT repository, assessing:
1. **Scientific Evidence Integrity**: The byte-level immutability of raw datasets, calibration artifacts, frozen policy definitions, and statistical outputs.
2. **Implementation vs. Architectural Claims**: Determinism of the selection engine, equivalence of JavaScript and WebAssembly workload outputs, safe input validation, and absence of runtime profiling.
3. **Developer SDK & Packaging**: The TypeScript interfaces, compilation of CJS/ESM distribution bundles, prebuilt WASM inclusion, and validation against a clean external Vite consumer.
4. **Git Provenance & Baseline Synchronization**: Analysis of the branch divergence between the local working branch and the GitHub remote.

All core scientific and engineering claims have been verified against the physical artifacts and command executions.

---

## 2. Git Provenance & Baseline Alignment

### Commit Hierarchy & Synchronization
```text
5c530f6 (HEAD -> main) docs: generate v0.1.0 release record
  │
954ea43 chore: final release freeze v0.1.0
  │
a3582c0 (origin/main) docs: finalize post-audit documentation and validate constraints
  │
5a39593 fix: resolve post-audit matrix validation findings
  │
56e022c fix: audit and harden research repository integrity
```

- **Research Baseline Commit**: `a3582c0fd17a9700d7ee0321203cd5a6fa8b9ddb`  
  This commit marks the completion of the Phase 5 research integrity audit on GitHub. A research-paper draft identifies this commit as its baseline revision.
- **Engineering Baseline Commit**: `5c530f6f548f23e9f18a5f7b562c187eeeef024c`  
  Local HEAD is ahead of `origin/main` by exactly 2 commits (`954ea43` and `5c530f6`), which added the developer SDK layer, package configuration (`packages/waswit`), developer playground (`/developer`), and release freeze records.
- **Divergence Analysis**: The local repository has not diverged from `origin/main` via alternative history; it is directly ahead by 2 linear commits that augment the project with engineering tools without altering frozen research evidence. Per non-negotiable rules, these commits have not been pushed to remote pending explicit authorization.

---

## 3. Cryptographic Research Hash Verification

All core scientific artifacts were hashed using SHA-256 and compared against locked ledger records:

| Artifact / Milestone | Locked Expected Value | Computed Actual Value | Status |
|---|---|---|---|
| **Raw Evaluation Artifact** (`final_evaluation_2026-09-29T18-16-18-546Z.json`) | `e26be7d99266c17f8aa4f80ae62a364904720d32393bc276caeedc68e3901220` | `e26be7d99266c17f8aa4f80ae62a364904720d32393bc276caeedc68e3901220` | **MATCH (LOCKED)** |
| **Frozen Selection Policy** (`frozen_policy_2026-09-29T17-33-07-945Z.json`) | `c8c330ebb91abf7757d35a7bd0ad9a03214f0866f77d74107a21f0056b661ef9` | `c8c330ebb91abf7757d35a7bd0ad9a03214f0866f77d74107a21f0056b661ef9` | **MATCH (LOCKED)** |
| **Statistical Analysis Plan (SAP) Commit** | `06b5aa20dbd43f3dacb2dd096db1c89cca95b530` | `06b5aa20dbd43f3dacb2dd096db1c89cca95b530` | **VERIFIED IN GIT** |
| **Phase 5F Analysis Commit** | `129419e2c231b1c59a05cedb3ff9be62fe27ea98` | `129419e2c231b1c59a05cedb3ff9be62fe27ea98` | **VERIFIED IN GIT** |
| **Verification Base Commit** | `c9f0025c4ca08337d90a7681c3647d64b4f4d554` | `c9f0025c4ca08337d90a7681c3647d64b4f4d554` | **VERIFIED IN GIT** |

---

## 4. Methodological Findings & Statistical Review

The Phase 5 experimental architecture and resulting statistical tests were audited:
- **Design Structure**:
  - 13 independent evaluation cells (Matrix: 75, 125, 175, 225, 275; Merge Sort: 1500, 2500, 3500, 4500; SHA-256: 2500, 7500, 12500, 17500).
  - 10 independent replicates per cell.
  - 30 measured iterations per replicate (+ 5 warmups excluded from primary timing).
  - Total measured observation rows: exactly 11,700 rows.
  - Total warmup rows: exactly 1,950 rows.
  - Zero recorded failures or missing trials.
- **Statistical Model**:
  - 39 confirmatory pairwise comparisons:
    - 13 JS vs WASM (RQ1)
    - 13 Adaptive vs JS (RQ3)
    - 13 Adaptive vs WASM (RQ3)
  - Unit of analysis: 10 replicate-level paired medians per cell.
  - Exact paired sign-permutation test ($2^{10} = 1,024$ sign assignments).
  - Multiplicity control: Holm–Bonferroni step-down adjustment across all 39 tests ($\alpha_{\text{FWER}} = 0.05$).
  - Confidence Intervals: 10,000 percentile bootstrap resamples.
- **Empirical Observation**:
  - Exactly **0 of 39 tests** achieved statistical significance after Holm–Bonferroni correction.
- **Authoritative Interpretation**:
  > *"The specified analysis did not establish statistically significant differences under the multiplicity-adjusted testing procedure."*
  
  Claims of "equality proven", "null hypothesis proven true", or "universal adaptive superiority" are explicitly rejected and forbidden.

---

## 5. Architectural & Implementation Verification

### Determinism of Selector
- `selectRuntime(characteristics, policy)` in `frontend/src/core/selection/selector.ts` is purely synchronous and deterministic.
- Operates in $O(1)$ time over array length / dimension.
- Performs zero runtime benchmarking, zero JIT profiling, and zero network calls.
- The developer SDK (`waswitRun`) directly references `phase5FrozenPolicy` (`version: "1.0.0-final"`).

### Cross-Runtime Workload Correctness
- **Matrix Multiplication**:
  - JavaScript (`multiplyMatricesJS`) and Rust WebAssembly (`multiply_matrices_wasm`) enforce strict dimension bounds ($N \ge 0$, flat length $= N^2$).
  - Negative dimensions are explicitly rejected with errors in both runtimes.
- **Merge Sort**:
  - JavaScript (`mergeSortJS`) and Rust WebAssembly (`merge_sort_wasm`) implement identical non-mutating merge sort algorithms for `Int32Array`.
  - Negative values and duplicate values are handled identically.
- **SHA-256**:
  - JavaScript (`sha256JS`) and Rust WebAssembly (`sha256_wasm`) implement standard FIPS 180-4 SHA-256 hashing without external dependencies.
  - Tested across standard NIST vectors ("abc", empty string, 56-byte vector) and padding boundary lengths (55, 56, 57, 63, 64, 65, 127, 128, 129 bytes).

### Developer SDK & Packaging
- **SDK Interface**: `waswitRun({ workload, input })` and `waswitPreload()`.
- **Overhead Isolation**: `selectionOverheadMs` is captured separately from `executionTimeMs` via high-resolution performance timers.
- **Package (`packages/waswit`)**:
  - Built via `tsup` into ESM (`dist/index.mjs`), CJS (`dist/index.js`), and TypeScript declarations (`dist/index.d.ts`).
  - Precompiled WebAssembly binary (`dist/waswit_wasm_bg.wasm`) copied during postbuild.
  - `npm pack` creates a clean 17.7 kB archive (`waswit-0.1.0.tgz`) with no leaked node_modules, build configs, or research data.
- **Clean External Consumer Test**:
  - Validated using an isolated Vite browser consumer (`consumer_test/vite_consumer`).
  - Successfully imported `{ waswitRun } from "waswit"` and executed Sort, Matrix, and SHA-256 inside a headless Chromium instance.

---

## 6. Full Test Matrix Results

All verification suites were executed against the codebase:

| Test Suite | Command | Total Tests / Suites | Result | Notes |
|---|---|---|---|---|
| **Rust Unit Tests** | `cargo test` in `wasm/` | 13 tests | **PASS (13/13)** | Algorithmic parity, edge cases, dimension checks |
| **WASM Build** | `npm run build:wasm` | 1 compilation | **PASS** | `wasm-pack` release profile + `wasm-opt` optimization |
| **Next.js Production Build** | `npm run build` in `frontend/` | 9 routes | **PASS** | Turbopack compilation + static page generation |
| **Vitest Unit Suite** | `npx vitest run` in `frontend/` | 18 files, 142 tests | **PASS (142/142)** | SDK, selector, analyzer, workload, stats tests |
| **Playwright E2E Suite** | `npx playwright test` in `frontend/` | 13 test suites | **PASS (10 passed, 3 skipped)** | 3 skipped are long-running research acquisition specs |
| **Package Bundling** | `npm run build` in `packages/waswit/` | ESM, CJS, DTS | **PASS** | Clean distribution generation |
| **Package Archival** | `npm pack` in `packages/waswit/` | 1 archive | **PASS** | `waswit-0.1.0.tgz` generated without bloat |
| **External Consumer** | Playwright test on `vite_consumer` | 3 workloads | **PASS** | Verified in Chromium browser |
| **Research Dataset Audit** | `npx tsx scripts/audit-phase5e.ts` | 11,700 observations | **PASS** | Hash and structure certificate verified |

---

## 7. Inventory of Discrepancies & Remediations

During the audit, the following minor documentation discrepancies were identified and resolved:
1. **Developer Page Typing**: In `frontend/src/app/developer/page.tsx`, state was typed as `unknown` which broke Next.js type checking. Fixed by explicitly typing with `WaswitRunResult<unknown>`.
2. **Root `README.md`**: Fixed broken syntax in the Developer Integration code snippet and added clear navigation pointers.
3. **Developer Integration Documentation**: In `docs/developer-integration.md`, import statements erroneously referenced `'waswit-sdk'` instead of the registered package name `'waswit'`. Corrected.
4. **Developer Example Documentation**: Fixed markdown escaping backslash issues in `examples/developer-integration/README.md`.
5. **Frontend `README.md`**: Replaced standard Next.js template text with actual WASWIT setup, architecture, and testing instructions.

---

## 8. Critical Threats to Validity & Research Limitations

1. **Hardware & Engine Specificity**: Calibrated and evaluated exclusively on Google Chrome / Blink 138 on Windows x64. Thresholds cannot be generalized to Gecko (Firefox), JavaScriptCore (Safari), or mobile ARM devices.
2. **Evaluation Grid Asymmetry for SHA-256**: The frozen policy routes SHA-256 inputs $\le 1000$ bytes to JavaScript and $> 1000$ bytes to WebAssembly. However, the Phase 5E evaluation grid tested sizes $2500, 7500, 12500, 17500$. Consequently, the independent evaluation exclusively exercised the WASM branch and did not empirically validate the JavaScript branch or the crossover threshold.
3. **Timer Quantization**: Browser high-resolution privacy mitigations quantize `performance.now()`, causing microsecond-scale operations to occasionally register as 0.000 ms.
4. **Context Lifetime Effects**: Evaluations utilized fresh browser pages per case within a shared browser context per replicate, rather than full browser context destruction per case.
5. **Node.js CommonJS Limitation**: The WebAssembly loader uses web-standard `import.meta.url`. In unbundled Node.js CommonJS execution, manual polyfilling or an ESM bundler is required.

---

## 9. Final Audit Verdict

**CERTIFIED — REPRODUCIBLE & READY FOR MTE PRESENTATION**
