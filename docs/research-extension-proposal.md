# Phase 6 Research Extension Proposal: Boundary Validation & Multi-Engine Generalization

**Document Status**: FORMAL PROPOSAL — PENDING AUTHORIZATION  
**Target Phase**: Phase 6A (Empirical Boundary Validation) & Phase 6B (Multi-Engine Generalization)  
**Parent Baseline**: Phase 5H Evidence Package (`e26be7d99266c17f...`)  
**Proposed Policy Version**: `2.0.0-draft` (Distinct from frozen `1.0.0-final`)  

---

## 1. Scientific Motivation & Context

In Phase 5, the derived frozen policy (`1.0.0-final`, rule `median-crossover-consistent-v2`) defined the following routing rules:
- **Matrix Multiplication**: Default WebAssembly (no explicit JS rule)
- **Merge Sort**: Default WebAssembly (no explicit JS rule)
- **SHA-256**: Input size $\le 1000$ bytes $\rightarrow$ JavaScript; Input size $> 1000$ bytes $\rightarrow$ WebAssembly

However, a known methodological limitation identified in the Phase 5H evidence package is:
> The Phase 5E independent evaluation grid for SHA-256 evaluated sizes **2,500, 7,500, 12,500, and 17,500 bytes**.

Because all evaluation grid points were strictly greater than 1,000 bytes, the independent evaluation exclusively exercised the WebAssembly execution path. Consequently:
1. The JavaScript routing branch ($\le 1000$ bytes) was **never exercised** during independent evaluation.
2. The crossover boundary ($N \approx 1000$ bytes) was **never directly tested** for out-of-sample validity.
3. The observation of a crossover point remains an exploratory calibration finding rather than a confirmatory independent finding.

Furthermore, Phase 5 was conducted exclusively within Google Chrome (Blink / V8) on Windows x64. It is unknown whether the crossover point shifts or disappears in Mozilla Firefox (Gecko / SpiderMonkey) or Apple Safari (WebKit / JavaScriptCore).

---

## 2. Research Questions (Phase 6)

- **RQ4 (Boundary Verification)**: Does JavaScript exhibit a statistically significant or descriptive execution time advantage over WebAssembly for SHA-256 at payload sizes $N \le 1000$ bytes on the reference platform?
- **RQ5 (Crossover Dynamics)**: Does a sharp, stable performance crossover point exist between JavaScript and WebAssembly within the neighborhood $N \in [500, 1500]$ bytes, or is runtime performance dominated by timer noise and JIT warmup variability?
- **RQ6 (Engine Sensitivity)**: Does the location of the SHA-256 crossover point vary systematically across distinct JavaScript/WASM browser engines (Blink vs Gecko vs WebKit)?

---

## 3. Experimental Design & Protocol

### 3.1 Workloads & Input Space
The experiment will evaluate SHA-256 cryptographic hashing using the certified implementations (`sha256JS` and `sha256_wasm`).

**Proposed Evaluation Grid (10 Grid Points)**:
- **Sub-boundary Domain**: $100, 250, 500, 750, 900\text{ bytes}$
- **Boundary Threshold**: $1000\text{ bytes}$
- **Post-boundary Domain**: $1100, 1250, 1500, 2000\text{ bytes}$

All inputs are deterministically synthesized using `generateSha256Input(N)`.

### 3.2 Independent Sampling Unit & Replication
- **Replicate Structure**: 10 independent replicates per grid point ($R = 10$).
- **Isolation Constraint**: Each replicate will execute in a fresh, isolated browser context.
- **Trial Structure per Replicate**:
  - 5 warmup iterations (strictly excluded from primary timing analysis).
  - 30 measured iterations per execution mode.
  - Execution modes:
    - Mode A: Static JavaScript (`sha256JS`)
    - Mode B: Static WebAssembly (`sha256_wasm`)
    - Mode C: Adaptive Selection via Policy (`waswitRun`)
- **Primary Metric**: Case median execution time (ms) computed across the 30 measured trials.
- **Overhead Accounting**: `selectionOverheadMs` captured once per case median and reported separately.

### 3.3 Multi-Engine Testing Environment
Phase 6B will execute the identical protocol across three automated Playwright browser channels on identical physical hardware:
1. **Chromium** (Blink / V8, channel: `chrome`)
2. **Firefox** (Gecko / SpiderMonkey, channel: `firefox`)
3. **WebKit** (WebKit / JavaScriptCore, channel: `webkit`)

---

## 4. Pre-Specified Statistical Analysis Plan (SAP)

### 4.1 Statistical Hypotheses
For each grid size $i \in \{1..10\}$:
- $H_{0, \text{JS-WASM}}^{(i)}$: The median paired difference in execution time between JS and WASM equals zero ($\Delta_{\text{JS-WASM}} = 0$).
- $H_{0, \text{Adaptive-JS}}^{(i)}$: The median paired difference in total adaptive time versus JS equals zero.
- $H_{0, \text{Adaptive-WASM}}^{(i)}$: The median paired difference in total adaptive time versus WASM equals zero.

Total number of pre-specified confirmatory tests:
$$\text{Single Engine}: 10 \times 3 = 30 \text{ tests}$$
$$\text{Three Engines}: 30 \times 3 = 90 \text{ tests}$$

### 4.2 Test Statistic & Permutation Procedure
- **Non-Parametric Permutation**: Exact paired sign-permutation test.
- **Permutations**: With $N = 10$ paired replicate medians, the exact reference distribution consists of $2^{10} = 1,024$ sign assignments.
- **Two-Sided P-Values**: Computed exactly from the permutation distribution.
- **Multiplicity Adjustment**: Holm–Bonferroni step-down correction applied family-wise at $\alpha_{\text{FWER}} = 0.05$.
- **Confidence Intervals**: 95% two-sided confidence intervals estimated via 10,000 percentile bootstrap resamples.

---

## 5. Stopping Criteria & Data Integrity Safeguards

1. **Pre-Registration Lock**: Data acquisition cannot commence until this protocol is committed and its SHA-256 recorded in the repository.
2. **Complete Acquisition Requirement**: All 10 replicates across all grid points must complete without unhandled exceptions. If a browser crash occurs, the entire replicate must be discarded and re-run.
3. **Immutability of Phase 5**:
   - Phase 6 data will be output strictly to `frontend/artifacts/phase6/` or `experiments/phase6/`.
   - Phase 5 artifacts (`final_evaluation_2026-09-29T18-16-18-546Z.json`, `frozen_policy_2026-09-29T17-33-07-945Z.json`) will **never** be merged with, overwritten by, or re-analyzed with Phase 6 data.
4. **Independent Policy Versioning**:
   - If Phase 6 results suggest an updated threshold, it will be designated `policy version 2.0.0`.
   - `phase5FrozenPolicy` (`1.0.0-final`) will remain permanently available for historical reproducibility.

---

## 6. Risks & Mitigation Strategies

| Risk | Impact | Mitigation Strategy |
|---|---|---|
| **Timer Quantization Noise** | Sub-millisecond execution times at $N \le 1000$ bytes may measure as 0.000 ms due to browser timer coarsening. | Use high-iteration batch loops (e.g. 50 inner iterations per measurement) if raw single-call timings exhibit heavy zero-clumping, documenting the batch multiplier explicitly in the protocol. |
| **JIT Optimization De-optimizations** | High variance across replicates if V8 optimizes during measurement. | 5 warmups per replicate allow JIT baseline optimization to stabilize prior to measured runs. |
| **Engine Availability Constraints** | WebKit on Windows relies on Playwright bundled WebKit builds rather than native macOS Safari. | Document exact Playwright WebKit build revision; avoid overgeneralizing to native Apple Silicon Safari without physical hardware testing. |
| **Data Contamination** | Accidental overwriting of locked Phase 5 files. | Place Phase 6 acquisition scripts in a distinct directory with hardcoded read-only checks asserting Phase 5 file hashes before execution. |

---

## 7. Immediate Next Steps & Approvals

- [ ] Obtain explicit user approval on this research proposal.
- [ ] Create `frontend/scripts/run-phase6-acquisition.mjs`.
- [ ] Implement pre-flight hash assertion securing Phase 5 artifacts.
- [ ] Execute pilot feasibility check (1 replicate) across the 10 grid sizes.
- [ ] Proceed to full 10-replicate data acquisition upon confirmation.
