# WASWIT — Stage 4: Phase 6 Research Extension Protocol

**Date:** 2026-10-18  
**Status:** PRE-REGISTERED & LOCKED  
**Author:** WASWIT Research Team  
**Scope:** SHA-256 Boundary Evaluation ($N \in [100, 2000]$ bytes)  

---

## 1. Background & Scientific Rationale

In Phase 5, the WASWIT empirical policy was derived and frozen (`phase5FrozenPolicy`, version `1.0.0-final`, rule `median-crossover-consistent-v2`). The policy established the following routing threshold for cryptographic hashing:

$$\text{Decision}(\text{SHA-256}, N) = \begin{cases} \text{JavaScript}, & N \le 1000\text{ bytes} \\ \text{WebAssembly}, & N > 1000\text{ bytes} \end{cases}$$

However, the Phase 5E independent evaluation grid for SHA-256 tested input sizes starting at 2,500 bytes ($N \in [2500, 50000]$ bytes). Consequently:
- All Phase 5E evaluation instances for SHA-256 fell into the $N > 1000$ region where the policy routed to WebAssembly.
- The policy's JavaScript branch ($N \le 1000$ bytes) was never independently evaluated in Phase 5E.

The purpose of Phase 6 is to execute an empirical investigation specifically targeting the boundary region $N \in [100, 2000]$ bytes, systematically evaluating both sides of the 1,000-byte threshold without modifying or overwriting any Phase 5 research artifacts.

---

## 2. Research Questions & Hypotheses

### Research Question 4 (RQ4)
*Does the workload-aware dynamic selection engine achieve execution time non-inferior or superior to fixed baseline runtimes (pure JavaScript and pure WebAssembly) in the boundary region $N \in [100, 2000]$ bytes of SHA-256?*

- **Hypothesis $H_{4,0}$ (Null):** There is no difference in median execution time between the adaptive selection engine and fixed runtimes (or adaptive is slower) across evaluated sizes:
  $$H_{4,0}: \Delta_{\text{adaptive} - \text{baseline}} \ge 0$$
- **Hypothesis $H_{4,1}$ (Alternative):** The adaptive selection engine achieves lower median execution time than the non-optimal runtime at each boundary point:
  $$H_{4,1}: \Delta_{\text{adaptive} - \text{suboptimal}} < 0$$

### Research Question 5 (RQ5)
*What is the empirical decision overhead of the feature extraction analyzer and pure deterministic selector, and does it remain negligible ($< 0.05\text{ ms}$) relative to workload execution time?*

- **Descriptive Metric:** Distribution (median, IQR, min, max) of selection overhead time $T_{\text{overhead}}$ across all boundary evaluations.

---

## 3. Experimental Design & Parameters

### 3.1 Input Size Grid
Ten evaluation points spanning both sides of the 1,000-byte boundary:
- **Sub-crossover (Policy selects JavaScript):**
  - $N = 100\text{ bytes}$
  - $N = 250\text{ bytes}$
  - $N = 500\text{ bytes}$
  - $N = 750\text{ bytes}$
  - $N = 900\text{ bytes}$
  - $N = 1000\text{ bytes}$
- **Supra-crossover (Policy selects WebAssembly):**
  - $N = 1100\text{ bytes}$
  - $N = 1250\text{ bytes}$
  - $N = 1500\text{ bytes}$
  - $N = 2000\text{ bytes}$

### 3.2 Repetitions and Measurement Protocol
To guarantee high statistical power and control for thermal throttling, garbage collection, and CPU scheduling variance:
1. **Replicates:** $R = 10$ independent replicates per input size condition.
2. **Warmup Iterations:** $W = 5$ warmup executions per replicate (data strictly discarded to ensure JIT compiler stabilization).
3. **Measurement Iterations:** $M = 30$ timed measurement executions per replicate.
4. **Summary Statistic:** Median execution time of the 30 measurements taken as the replicate observation $X_{r}$.
5. **Runtimes Evaluated:**
   - Fixed JavaScript (`javascript`)
   - Fixed WebAssembly (`wasm`)
   - Adaptive WASWIT Selection (`adaptive`)

### 3.3 Timing Harness Integrity
- Timing measured via `performance.now()` with high-resolution timestamps.
- Zero-allocation inner loops where possible; input arrays pre-generated before timing starts.
- Execution time isolated strictly to workload computation.
- Analyzer + selector overhead measured separately and recorded in the telemetry.

---

## 4. Multiplicity-Adjusted Statistical Analysis Plan

To prevent Type I error inflation across the evaluation grid:
1. **Pairwise Test:** Exact two-sided paired sign-permutation test between Adaptive vs Fixed JS, and Adaptive vs Fixed WASM at each evaluation size.
2. **Family-Wise Error Rate (FWER):** Controlled at $\alpha = 0.05$.
3. **Adjustment Method:** Holm-Bonferroni step-down procedure applied across all simultaneous hypothesis tests.
4. **Effect Size:** Non-parametric Cliff's Delta ($\delta$) and median difference $\Delta = \text{Median}(T_A) - \text{Median}(T_B)$ with 95% bootstrap confidence intervals.

---

## 5. Non-Negotiable Artifact Integrity Rules

1. All Phase 6 raw measurements will be saved to `research/phase6/raw_phase6_evaluation.json`.
2. All Phase 6 statistical outputs will be saved to `research/phase6/phase6_analysis.json`.
3. The locked Phase 5 artifacts:
   - `frontend/artifacts/evaluation/final_evaluation_2026-09-29T18-16-18-546Z.json`
   - `frontend/artifacts/policy/frozen_policy_2026-09-29T17-33-07-945Z.json`  
   MUST REMAIN ENTIRELY UNTOUCHED.
