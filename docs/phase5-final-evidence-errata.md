# Phase 5 Final Evidence Errata & Transparent Limitations

This document centralizes all known methodological limitations, deviations, and environmental constraints related to the final Phase 5 evidence package.

## 1. Adaptive Evaluation Boundary Limitation
The independent evaluation grid did not contain any input size within the JavaScript-selected SHA-256 region of the frozen policy (SHA-256 $\le$ 1000). Matrix Multiplication and Merge Sort also defaulted to WebAssembly across their evaluation grids. Consequently, the final independent evaluation validated policy-consistent routing but **did not empirically exercise a runtime switch** between JavaScript and WebAssembly during execution.

## 2. Matrix Multiplication Numerical Precision
JavaScript uses double-precision floats (`Number`, f64 semantics) for accumulation, while the Rust implementation strictly uses single-precision floats (`f32`). While deterministic indices ensure exact parity for small matrices (e.g., N=3), exact bitwise output equivalence at large evaluation scales is theoretically unbounded due to differential accumulation precision. This is a cross-runtime correctness limitation, not perfect mathematical parity.

## 3. Warmup Measurement Placeholders
In the raw JSON evaluation artifacts, warmup iterations are recorded with execution time `0`. These are explicitly **unmeasured placeholders**, not instances of instantaneous execution.

## 4. Sign-Symmetry Heuristic in Testing
The negative-dimension error rejection test inside `parity.spec.ts` assumes a sign-symmetry heuristic (that a workload handles `-N` equivalently to `N`). This was a software engineering test assertion and is not an inherent mathematical property of the workload.

## 5. Playwright User-Agent Spoofing
Playwright's `devices['Desktop Chrome']` preset forcibly spoofs the page-level `navigator.userAgent` string (e.g., reporting Chrome 153.x). The true underlying physical browser engine was verified via the CDP protocol as Chromium 138.0.7204.102.

## 6. OS Metadata Retrieval
Initial documentation claimed the operating system was guaranteed to be Windows 11. The finalized evaluation metadata actually captures an environment-provided WMI Caption, which was *manually verified* as Windows 11 by the researcher, but is not cryptographically assured by the runtime.

## 7. Phase 5E Context Isolation Deviation
The Phase 5E Acquisition Plan called for each evaluation case to execute in a completely fresh Playwright browser context. To conserve system memory during continuous evaluation, the final implementation used **one fresh browser context per replicate**, with individual cases using fresh pages within that context.

## 8. JIT State Isolation
Because multiple pages were executed within the same browser context during a replicate, this design isolates document-level state but **does not fully isolate OS-level, process-level, or cross-page V8/Wasm-engine JIT optimization state**.

## 9. Terminology: "Pre-specified" vs "Pre-registered"
Initial drafts of the analysis used the term "Pre-registered". Because the WASWIT project was not formally registered in an external, time-locked registry (like OSF), the correct terminology is **Pre-specified Methodological Controls**.

## 10. Statistical Interpretation Constraints
Descriptive differences between WebAssembly and JavaScript were observed, but the final paired exact permutation tests with Holm-Bonferroni correction yielded 0 rejected hypotheses. The experiment **did not provide sufficient evidence to reject the null hypothesis** of no performance difference.

## 11. Semantic Provenance Hashes
The `policyIntegrityHash` in the final evaluation payload is recorded as `"DETERMINISTIC_SNAPSHOT_VERIFIED"`. This is a semantic snapshot marker intended to assert that the policy was locked, not a cryptographic hash of the JSON artifact itself.

## 12. Verification Base Commit Recursion
The integrity manifest itself is committed into Git, making it impossible to record its own final commit SHA. The manifest instead uses `VERIFICATION_BASE_COMMIT_SHA` to record the state immediately prior to the final documentation pass.

## 13. Dynamic ML vs Static CPU Gap
The literature review acknowledges advanced dynamic selection in web-based ML (e.g., Lee & Jeon, May 2026). WASWIT's contribution gap is strictly narrowed to general-purpose, non-ML CPU workloads where JS/Wasm engine boundary friction is the primary consideration.

## 14. Interactive Harness Disclaimer
The UI Dashboard's "Interactive Evaluation Harness" executes small disjoint grids (e.g., SHA-256 up to 12,500) and plots descriptive medians that *exclude* routing overhead. This is for interactive visualization only and is strictly divorced from the locked Phase 5E scientific evidence.
