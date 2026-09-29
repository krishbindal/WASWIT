# Phase 5H Results Interpretation

## 1. Executive Results Summary
This document interprets the certified, independent evaluation data collected in Phase 5E and analyzed in Phase 5F. Across the evaluated grid of 13 workload-size cells (Matrix Multiplication, Merge Sort, SHA-256), the descriptive performance profiles show varied execution times between JavaScript and WebAssembly baselines. The deterministic workload-aware adaptive selector successfully identified the designated baseline per the frozen calibration policy. However, the confirmatory statistical analysis (exact paired sign permutation tests with Holm-Bonferroni correction, N=39 tests, $\alpha=0.05$) did not reject the null hypothesis of zero median paired difference for any comparison. Thus, while descriptive timing variations exist, no statistically significant performance difference is established after rigorous multiplicity correction.

## 2. Experimental Evidence Context
- **Workloads**: Matrix Multiplication (sizes: 75, 125, 175, 225, 275), Merge Sort (sizes: 1500, 2500, 3500, 4500), SHA-256 (sizes: 2500, 7500, 12500, 17500).
- **Structure**: 10 independent replicates per cell; 30 measured iterations per replicate (plus 5 excluded warmups). Case-level timing defined as the median of the 30 measured iterations.
- **Statistical Model**: Family of 39 pre-registered tests evaluated via exact paired sign permutation (1024 permutations). Alpha adjusted family-wise using the Holm-Bonferroni step-down procedure. 95% confidence intervals constructed via 10,000 percentile bootstrap resamples.

## 3. RQ1 Results
*How does relative JavaScript/WebAssembly performance vary across workloads and input sizes?*
Descriptively, JavaScript and WebAssembly exhibit distinct scaling behaviors across the measured grid. However, none of the 13 pairwise confirmatory tests (JS vs Wasm) yielded a statistically significant difference after Holm-Bonferroni correction. Consequently, the evidence does not support a generalizable claim that one runtime strictly outperforms the other across these sizes.

## 4. RQ2 Exploratory Findings
*Which measurable workload characteristics support runtime selection?*
Exploratory analysis (based on the frozen calibration data, independently evaluated here) identifies workload identity and input size as measurable dimensions. The frozen policy successfully isolated a static size boundary for SHA-256 (JS for $\le 1000$, Wasm otherwise) and defaulted to Wasm for Matrix Multiplication and Merge Sort. While this heuristic successfully executed deterministically over the independent grid, the lack of confirmatory performance separation prevents concluding that these features universally guarantee optimal runtime selection.

## 5. RQ3 Results
*Can workload-aware selection achieve competitive overall performance relative to static JavaScript-only and WebAssembly-only execution?*
The adaptive total time descriptively tracks the targeted baseline (plus overhead). However, out of the 26 confirmatory comparisons for RQ3 (Adaptive Total vs JS, Adaptive Total vs Wasm), no test reached statistical significance after Holm adjustment. The data descriptively shows the selector tracking static Wasm (the designated policy output for all evaluated sizes), but the evidence does not confirm that adaptive selection provides a statistically significant improvement over static execution baselines.

## 6. Selection Overhead
The adaptive selection introduces a strictly logical overhead event evaluated once per case. Descriptively, this measured `selectionOverheadMs` was routinely captured (with exact zero measurements common due to timer resolution coarsening). The Adaptive Total correctly integrates a single overhead penalty per case median.

## 7. Descriptive vs Confirmatory Interpretation
- **Descriptive**: Observed timing disparities between runtimes represent valid in-sample measurements of the execution environment. Adaptive selection matched its programmed policy.
- **Confirmatory**: Zero out of 39 pre-registered hypotheses were rejected. The observed descriptive differences fall within the bounds of expected variance under the null hypothesis after correcting for multiple comparisons.

## 8. Threats to Validity / Limitations
1. **Single Environment**: Captured on a single physical host within a single browser engine (Blink/chromium 138.0.7204.102). OS and exact hardware metadata capture were blocked or obfuscated (logged as "Unknown") highlighting privacy-limited browser metadata constraints.
2. **Implementation Deviation**: The evaluation implementation used one fresh browser context per replicate, with fresh pages per case, rather than a fresh browser context per case. This exposes cases within a replicate to shared context lifetime effects.
3. **Timer Resolution**: High-resolution performance timers are coarsened/quantized by browser privacy mechanisms, resulting in exact zero measurements for microsecond-scale operations.
4. **Policy Grid Overlap**: The final evaluation grid does not overlap with the SHA-256 size 1000 crossover boundary, meaning the selector exclusively routed to Wasm during the independent evaluation.
5. **Runtime Noise**: Browser scheduling, garbage collection, and background thermal throttling contribute to high replicate variability.

## 9. What the Evidence Supports
- The deterministic execution of the workload-aware policy logic without failure.
- The descriptive presence of selection overhead.
- The descriptive observation that no runtime unconditionally eliminates execution cost across all workloads.
- The failure to reject the null hypotheses, demonstrating that adaptive selection in this specific environment and grid does not yield statistically distinguishable improvements.

## 10. What the Evidence Does Not Support
- The data **does not support** claims that Wasm is universally faster or superior to JavaScript.
- The data **does not support** claims that the adaptive method provides a significant performance improvement over static baselines.
- The data **does not support** broad generalizations beyond the evaluated chromium/V8 engine and specific input-size grid.

## 11. Reproducibility / Provenance
All interpretations rely entirely on the exact Phase 5F numerical artifacts. The raw dataset, the SAP, the frozen policy, and the resulting JSON summaries remain fully byte-locked. Any descriptive observation maps precisely to the independent evidence trace.

## 12. Publication Notes
Reviewers must distinguish between descriptive profiles (which may visually separate in plots) and confirmatory significance (which rigorously incorporates variability and multiplicity limits).
