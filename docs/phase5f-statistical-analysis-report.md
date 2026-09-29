# Phase 5F Statistical Analysis Report

## 1. Analysis Provenance
- **Raw Artifact SHA-256**: `e26be7d99266c17f8aa4f80ae62a364904720d32393bc276caeedc68e3901220`
- **Frozen Policy SHA-256**: `c8c330ebb91abf7757d35a7bd0ad9a03214f0866f77d74107a21f0056b661ef9`
- **SAP Commit SHA**: `06b5aa20dbd43f3dacb2dd096db1c89cca95b530`
- **Data Source**: Final independent evaluation data only. No calibration or pilot data was used for inference.

## 2. Dataset Integrity
- All 13 pre-specified evaluation cells strictly contained exactly 10 independent replicate-level observations.
- Exactly 1,950 warmup rows were successfully excluded.
- Valid raw zero values were strictly preserved as observations per the SAP.
- Exactly 39 confirmatory tests were successfully resolved.

## 3. Analysis Population
The population consisted of 13 evaluation cells distributed across 3 distinct workloads (Matrix Multiplication, Merge Sort, SHA-256) at sizes strictly separated from previous Phase 5C calibration thresholds.

## 4. Case-Level Aggregation
Per the locked SAP, for each independent replicate case, the primary timing was calculated exactly as the **median** of the 30 non-warmup iterations. For Adaptive total time, the singleton `selectionOverheadMs` event was added identically once to the median execution time. The overhead event was verified to be a singleton per adaptive case and was never multiplied by 30.

## 5. RQ1 Results (JS vs Wasm)
A total of 13 paired confirmatory hypothesis tests evaluated the baseline timing differences between pure JavaScript and Wasm executions via Exact Paired Sign Permutation Tests (1024 permutations). Full numeric results, exact raw p-values, median paired differences, and percentile bootstrap confidence intervals are permanently retained in `frontend/artifacts/analysis/phase5f/confirmatory_tests.json`.

## 6. RQ3 Results (Adaptive vs Baseline)
A total of 26 paired confirmatory tests assessed Adaptive Total Time vs JavaScript Total Time and Adaptive Total Time vs Wasm Total Time across the 13 sizes. Exact permutations were applied identically, capturing the formal aggregation formula defined in the SAP.

## 7. Multiplicity Correction
The complete family of exactly 39 raw p-values was subjected to the **Holm-Bonferroni step-down correction** strictly enforcing a family-wise alpha threshold of 0.05. Tests were ordered by significance and strictly adjusted against the global family size.

## 8. Confidence Intervals
Bootstrap confidence intervals were produced using precisely 10,000 percentile resamples of the independent replicate paired differences ($d_r$), fully avoiding pseudoreplication of the underlying 30 iterations. A fixed deterministic LCG seed (42) was recorded in the script implementation to guarantee exact reproducibility of CI bounds.

## 9. Descriptive Results
Detailed descriptive summaries are provided in `frontend/artifacts/analysis/phase5f/descriptive_summary.json`. The summaries include case-median distributions, bounds, and practical performance indicators evaluating the incidence of adaptive wall-time matching or beating the best static baseline constraint without presenting it as an explicit inferential hypothesis.

## 10. RQ2 Evidence Boundary
Following the SAP constraints, no new confirmatory inferential models were derived regarding workload characteristics supporting runtime selection. This confirms the previously established Phase 4B/Phase 5D selection model architecture operates strictly on a descriptive deterministic mapping boundary. Any further modelling is restricted to exploratory analysis.

## 11. Limitations Relevant to Interpretation
- Generalizations are bound to the exact hardware capabilities, memory parameters, and Chromium architecture captured in the environment metadata artifact.
- Performance limits and boundaries evaluated here are inherently dependent on the specific Wasm bridging overhead behavior observed.
- Interpretation must rigorously adhere to the Holm-adjusted p-values and not isolate unadjusted subsets to claim broad statistical victory.

## 12. Reproducibility Information
This entire statistical analysis is entirely deterministically reproducible. By executing the exact Phase 5F analysis script locked with this commit against the immutable JSON artifacts, all reported p-values, permutations, and resampled bounds are guaranteed to match byte-for-byte.
