# Phase 5F Statistical Analysis Plan (SAP)

## 1. Purpose
This Statistical Analysis Plan (SAP) formally locks the methodology for the final inferential analysis of the Phase 5E independent evaluation data. It explicitly resolves previously undefined methodological rules (such as the exact confirmatory hypothesis family, the RQ3 aggregation formula, and the specific non-parametric test) *before* any numerical outcomes are observed, computed, or interpreted.

## 2. Analysis Population
The analysis population consists solely of the pre-collected Phase 5E evaluation dataset.

## 3. Independent Unit
The independent experimental statistical unit is the **replicate** (`replicateId` 0..9). 

The 30 measured timing observations for a given replicate × workload × inputSize × mode are repeated measures within a single independent block. They MUST NOT be treated as 30 independent samples.

## 4. Primary Timing Definition
For every case (replicate × workload × inputSize × mode), the primary timing is defined as the case-level median:
`CaseMedianElapsedMs = median(30 records where isWarmup === false and elapsedMs is valid)`

No mean over raw timing iterations may replace the primary median.

## 5. Warmup Handling
Warmup records (`isWarmup === true`) are rigidly excluded from all primary timing calculations. The warmup placeholder `elapsedMs = 0` is NEVER interpreted as a measured observation.

## 6. RQ1 Hypotheses
The final evaluation grid contains 13 cells:
- **Matrix**: 75, 125, 175, 225, 275
- **Merge Sort**: 1500, 2500, 3500, 4500
- **SHA-256**: 2500, 7500, 12500, 17500

For EACH of the 13 cells, one confirmatory paired comparison is defined: **JS vs Wasm**
For replicate $r$:
$$d_r = \text{CaseMedianElapsedMs}(\text{JS}, r) - \text{CaseMedianElapsedMs}(\text{Wasm}, r)$$

This contributes exactly **13 confirmatory tests**.

## 7. RQ3 Formal Aggregation Equations and Hypotheses
For each adaptive case, the total wall-time is formally locked as:
$$\text{AdaptiveExecutionTime}_r = \text{median of the 30 measured adaptive elapsedMs values}$$
$$\text{AdaptiveSelectionOverhead}_r = \text{the SINGLE case-level selectionOverheadMs event}$$
$$\text{AdaptiveTotalTime}_r = \text{AdaptiveExecutionTime}_r + \text{AdaptiveSelectionOverhead}_r$$

The overhead MUST be added exactly once. It MUST NOT be multiplied by 30 or inserted into individual iterations.

For static execution:
$$\text{JavaScriptTotalTime}_r = \text{CaseMedianElapsedMs}(\text{JS}, r) + 0$$
$$\text{WasmTotalTime}_r = \text{CaseMedianElapsedMs}(\text{Wasm}, r) + 0$$

For EACH of the 13 cells, two confirmatory paired comparisons are defined:
- **Adaptive vs JavaScript**: $d_r = \text{AdaptiveTotalTime}_r - \text{JavaScriptTotalTime}_r$
- **Adaptive vs Wasm**: $d_r = \text{AdaptiveTotalTime}_r - \text{WasmTotalTime}_r$

This contributes exactly **26 confirmatory tests**.

## 8. Exact 39-Test Confirmatory Family
The combined confirmatory family consists of precisely:
13 RQ1 tests + 26 RQ3 tests = **39 total confirmatory hypothesis tests**.

No additional hypothesis tests may be added to the confirmatory family after results are observed.

## 9. Exact Paired Permutation-Test Algorithm
The primary hypothesis test for every confirmatory comparison is an **EXACT PAIRED PERMUTATION TEST**.
- **Input**: 10 paired replicate-level differences ($d_0, d_1, ..., d_9$).
- **Test Statistic**: $T_{obs} = \text{median}(d_0, d_1, ..., d_9)$
- **Null Distribution**: Construct the exact null distribution by independently assigning each replicate difference either $+d_r$ or $-d_r$. There are exactly $2^{10} = 1024$ possible sign assignments.
- **Permutation Statistic**: For each of the 1024 permutations, calculate $T_{perm} = \text{median}(\text{permuted differences})$.
- **P-value**: A two-sided p-value is calculated as:
  $$p = \frac{\text{count}(|T_{perm}| \ge |T_{obs}|)}{1024}$$

No Monte Carlo approximations. No random sampling of permutations.

## 10. Multiplicity Control
The family-wise alpha is **0.05**.
The **Holm-Bonferroni** step-down correction is applied across ALL 39 confirmatory tests. Do not run separate Holm families for individual workloads.

## 11. Effect-Estimate Definition
For every confirmatory comparison, report the paired replicate-level effect using:
`MedianDifference = median(d_0 ... d_9)`
The direction is descriptive:
- Negative $d$: First-named strategy has lower measured time.
- Positive $d$: First-named strategy has higher measured time.

## 12. Bootstrap CI Methodology
- **Input**: 10 paired replicate differences $d_r$.
- **Method**: Percentile bootstrap.
- **Resamples**: 10,000.
- **Confidence Level**: 95%.
- **Resampling Unit**: Paired replicate difference $d_r$ (do NOT bootstrap the 30 individual iterations).
- **Seed**: A deterministic fixed random seed must be utilized and documented in the analysis implementation.

## 13. Zero / Tie Handling
Exact zero `elapsedMs` values or exactly zero paired differences ($d_r = 0$) are valid observations and must NOT be removed, modified, or arbitrary $\epsilon$ values added. The paired permutation enumeration naturally preserves zero differences.

## 14. Missing / Invalid-Data Handling
If any confirmatory cell does not contain exactly 10 valid independent replicate-level case medians (e.g., due to failures), analysis for that specific hypothesis MUST STOP and the data-integrity issue must be reported. No silent imputation or replacement observations are permitted.

## 15. RQ2 Analysis Boundary
The frozen selection policy, deterministic analyzer, and evaluation-time policy-consistency checks remain the primary evidence for the selection mechanism. Any statistical analysis of workload characteristics is exploratory and excluded from the 39-test confirmatory family.

## 16. Exploratory-Analysis Rules
All analyses outside the predefined 39-test confirmatory family (including predictive characteristic modeling, subgroup testing, etc.) must be explicitly labelled exploratory and must not be presented as confirmatory hypothesis tests.

## 17. Descriptive Analysis
Descriptive summaries (e.g., median timing, mean, min/max, dispersion, exact-zero counts, failure counts, overhead, BestStatic comparison) may be reported but MUST NOT be labeled as statistically significant or used to rank strategies outside the statistical bounds.

## 18. Provenance / Reproducibility Rules
Every analysis record must retain the raw artifact SHA-256, evidence-lock commit, acquisition source SHA, protocol version, policy version, and environment metadata. The SAP itself MUST NEVER alter raw evidence.

## 19. Lock Statement
**This Statistical Analysis Plan is formally locked BEFORE any inferential results have been calculated or observed.**

---

PHASE5F_SAP_STATUS=LOCKED
INDEPENDENT_UNIT=REPLICATE
REPLICATES_PER_CELL=10
MEASUREMENTS_PER_REPLICATE=30
PRIMARY_METRIC=CASE_MEDIAN_ELAPSED_MS
RQ1_CONFIRMATORY_TESTS=13
RQ3_CONFIRMATORY_TESTS=26
TOTAL_CONFIRMATORY_TESTS=39
RQ3_FORMULA=ADAPTIVE_MEDIAN_30_PLUS_SINGLE_OVERHEAD
TEST=EXACT_PAIRED_SIGN_PERMUTATION
PERMUTATIONS=1024
TAIL=TWO_SIDED
ALPHA=0.05
MULTIPLICITY=HOLM_BONFERRONI
BOOTSTRAP=10,000
CI_LEVEL=0.95
CI_METHOD=PERCENTILE
BOOTSTRAP_UNIT=PAIRED_REPLICATE_DIFFERENCES
RAW_DATA_MODIFIED=NO
POLICY_MODIFIED=NO
RESULTS_ANALYZED=NO
