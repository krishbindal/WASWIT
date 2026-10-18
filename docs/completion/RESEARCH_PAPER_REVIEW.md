# WASWIT — Stage 5: Research Paper and Technical Documentation Review

**Date:** 2026-10-18  
**Repository:** `https://github.com/krishbindal/WASWIT`  
**Research Topic:** Workload-Aware Intelligent Selection Between JavaScript and WebAssembly  
**Status:** Reviewed & Methodologically Aligned  

---

## 1. Overview of Research Manuscript & Scientific Position

WASWIT addresses a foundational question in contemporary web engineering: **When should a browser-based application dispatch computational workloads to WebAssembly versus native JavaScript JIT?**

Prevailing developer heuristics assume that WebAssembly is universally superior for compute-intensive tasks, ignoring compilation overhead, memory boundary marshaling penalties, and V8 TurboFan optimization for small-to-medium datasets. WASWIT establishes an empirical, reproducible framework that models crossover points and dynamically selects runtimes at execution time.

This review synthesizes the project's documentation, empirical findings, and claims across Phase 5 and Phase 6 into an authoritative research review suitable for capstone submission and peer-reviewed publication.

---

## 2. Methodology & Evidence Audit

### 2.1 Experimental Protocol Soundness
The project adheres to the highest standards of empirical software engineering research:
1. **Separation of Calibration and Evaluation:** Crossover policies were trained on independent calibration runs (Phase 5C) and locked into a static JSON artifact (`phase5FrozenPolicy`, version `1.0.0-final`, rule `median-crossover-consistent-v2`) before evaluation data acquisition.
2. **Replicate & JIT Stabilization:** Every experimental condition executes across 10 independent browser replicates, each preceded by 5 discarded warmup iterations to stabilize JIT optimization tiers, followed by 30 timed measurement trials.
3. **Overhead Isolation:** Feature extraction and policy decision latencies are timed separately from kernel compute time, preventing measurement cross-contamination.
4. **FWER Multiplicity Control:** Confirmatory testing utilizes exact paired sign-permutation tests adjusted via the Holm-Bonferroni step-down procedure at Family-Wise Error Rate $\alpha = 0.05$.

### 2.2 Empirical Evidence Synthesis

| Milestone | Scope | Evaluated Conditions | Confirmatory Hypotheses ($m$) | Rejections ($p_{\text{Holm}} < 0.05$) | Formal Statistical Conclusion |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Phase 5 Independent Evaluation** | Matrix ($N \in [75, 275]$), Sort ($N \in [1500, 4500]$), SHA-256 ($N \in [2500, 17500]$) | 13 grid points $\times$ 3 modes $\times$ 10 replicates = 390 runs (13,650 trials) | $m = 39$ | **0 / 39** | *"The specified analysis did not establish statistically significant differences under the multiplicity-adjusted testing procedure."* |
| **Phase 6 Boundary Extension** | SHA-256 Boundary ($N \in [100, 2000]$ bytes) | 10 grid points $\times$ 3 modes $\times$ 10 replicates = 300 runs (10,500 trials) | $m = 20$ | **0 / 20** | *"The specified analysis did not establish statistically significant differences under the multiplicity-adjusted testing procedure."* |

---

## 3. Claims Ledger & Scientific Integrity

To maintain absolute academic defensibility, the manuscript strictly categorizes its claims:

### 3.1 Fully Supported Claims
- **Deterministic Routing:** The WASWIT selector deterministically maps arbitrary input characteristics to the empirical policy target in $O(1)$ time with zero side-effects.
- **Microsecond Decision Overhead:** Measured selector overhead exhibits a median of $\sim 0.100\text{ ms}$ (mean $0.092\text{ ms}$), demonstrating practical feasibility for client-side routing.
- **Descriptive Divergence:** Large-scale benchmarks show clear descriptive differences (e.g., in matrix multiplication and large merge sorts, WebAssembly consistently exhibits lower median raw compute times than JavaScript).
- **Exact Standard Conformance:** Both JS and Rust workloads adhere strictly to standard test vectors (NIST FIPS 180-4 for SHA-256; non-mutating stable sorting for merge sort; boundary checking for matrix multiplication).

### 3.2 Carefully Qualified Claims
- **Policy Heuristic Nature:** The frozen policy is an empirical heuristic calibrated on a specific hardware/browser profile (Chromium Blink). It must not be characterized as a globally optimal theoretical bound.
- **Boundary Sensitivity:** At small input sizes ($N \le 1000$ bytes for SHA-256), timing variations are dominated by browser timer quantization (`performance.now()`), rendering fine-grained runtime differences non-inferential.

### 3.3 Explicitly Prohibited / Unsupported Claims
- **DO NOT CLAIM:** *"WASWIT achieves statistically significant speedups across all benchmarks."* (Statistical tests yielded 0/39 and 0/20 rejections under FWER control).
- **DO NOT CLAIM:** *"WebAssembly is universally superior to JavaScript."* (Small workloads incur serialization overhead that offsets WASM gains).
- **DO NOT CLAIM:** *"Results generalize across all mobile and desktop web browsers without re-calibration."* (Tested explicitly on Chromium/Blink; Gecko and WebKit require their own calibration profiles).

---

## 4. Threats to Validity & Limitations

1. **Internal Validity:**
   - *Timer Precision:* Browser security mitigations (Spectre/Meltdown countermeasures) clamp `performance.now()` precision to $5\text{ µs} - 100\text{ µs}$, creating floor effects for sub-millisecond workloads.
   - *Garbage Collection:* While 5 warmup iterations stabilize JIT compilation, background V8 GC pauses can produce non-normal execution latency distributions. Non-parametric permutation tests were selected specifically to address this.

2. **External Validity:**
   - *Browser Scope:* Empirical data was collected under Google Chrome on x86-64 Windows. Cross-engine validation (Gecko/Firefox and JavaScriptCore/Safari) remains an area for future research.
   - *Workload Diversity:* Workloads represent CPU-bound linear algebra, sorting, and cryptography. IO-bound, DOM-interactive, or streaming workloads were deliberately excluded.

---

## 5. Institutional & Capstone Submission Checklist

| Criterion | Requirement | Verification Status |
| :--- | :--- | :--- |
| **Plagiarism & IPR** | Original implementation of all workloads, selector, and SDK; no external copy-paste or GPL violations | **CLEARED** |
| **Reproducibility** | All raw data, scripts, and statistical notebooks committed and verifiable via SHA-256 hashes | **CLEARED** |
| **Artifact Integrity** | Phase 5 locked artifacts verified unmodified against original checksums | **CLEARED** |
| **Multiplicity Correction** | Family-Wise Error Rate controlled at $\alpha = 0.05$ via Holm-Bonferroni | **CLEARED** |
| **Standalone Package** | Independent SDK package (`packages/waswit`) verified with external consumer | **CLEARED** |
| **Advisor / Guide Requirements** | Manuscript draft ready for institutional template formatting (IEEE Transactions / ACM format) | **READY** |
