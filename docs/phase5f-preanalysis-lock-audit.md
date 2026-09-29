# Phase 5F Pre-Analysis Lock Audit

## 1. Evidence-Lock Verification
- Current commit is `f552a530e326ad69ba74233e6dc0f00f02a7f02b`.
- **Status**: PASS

## 2. Raw Artifact Integrity Verification
- `frontend/artifacts/evaluation/final_evaluation_2026-09-29T18-16-18-546Z.json` exists.
- SHA-256 equals `e26be7d99266c17f8aa4f80ae62a364904720d32393bc276caeedc68e3901220`.
- **Status**: PASS

## 3. Data-Contract Verification
- `docs/phase5f-analysis-data-contract.md` is present and dictates data handling rules.
- **Status**: PASS

## 4. Independent-Unit Verification
- `replicateId` is strictly confirmed as the independent statistical unit.
- **Status**: PASS

## 5. Warmup Handling Verification
- Warmup placeholders (`isWarmup === true`) are excluded from aggregation and statistical inference.
- **Status**: PASS

## 6. Case-Level Median Definition
- The case-level timing is strictly defined as the median of the 30 non-warmup measured iterations.
- **Status**: PASS

## 7. Adaptive Overhead Semantics
- Exactly one logical overhead event per adaptive case. Not multiplied by 30.
- **Status**: PASS

## 8. Confirmatory Comparison Family Status
- The protocol in `docs/phase5-research-protocol.md` states: "The confirmatory family is defined as the predefined primary pairwise comparisons established before data analysis."
- However, the document completely fails to list the *exact* primary pairwise comparisons (e.g., whether it compares every size, or only overall workload medians). 
- **Status**: FAIL

## 9. RQ3 Total Wall-Time Aggregation Status
- The protocol in `docs/phase5-research-protocol.md` and data contract in `docs/phase5f-analysis-data-contract.md` both leave the explicit mathematical aggregation formula for integrating the 30-trial adaptive timing median with the singleton `selectionOverheadMs` event entirely undefined.
- **Status**: FAIL

## 10. Statistical-Test Pre-Specification Status
- The protocol in `docs/phase5-research-protocol.md` states: "use paired non-parametric analysis for paired comparisons (e.g., Wilcoxon signed-rank test or an explicitly defined paired permutation test)."
- The test is merely suggested via an "e.g." and "or". Neither the exact test nor the specific Bootstrap CI method (BCa vs percentile, number of resamples) is locked.
- **Status**: FAIL

## 11. Multiplicity-Control Status
- Holm-Bonferroni step-down procedure at family-wise alpha = 0.05 is locked in `docs/phase5-research-protocol.md`.
- **Status**: PASS

## 12. Bootstrap/CI Independence Status
- Resampling is restricted to replicate-level units, ensuring independence.
- **Status**: PASS

## 13. Pseudoreplication Audit
- 30 iterations are not treated as independent. Paired comparisons use matched replicates.
- **Status**: PASS

## 14. Calibration/Evaluation Separation Audit
- Zero overlap between Phase 5C calibration grids and Phase 5E evaluation grids.
- **Status**: PASS

## 15. Unresolved Methodological Blockers
1. **Confirmatory Family**: The exact list of pairwise comparisons must be explicitly enumerated in a statistical analysis plan document.
2. **RQ3 Aggregation Rule**: A formal mathematical formula combining case-level median and singleton `selectionOverheadMs` must be defined.
3. **Statistical Test Lock**: The exact hypothesis test (Wilcoxon vs permutation) and confidence interval methodology (method, iterations) must be chosen and locked.

## 16. Final Status Block

PHASE5F_PREANALYSIS_LOCK_STATUS=FAIL
EVIDENCE_LOCK=PASS
RAW_ARTIFACT_INTEGRITY=PASS
DATA_CONTRACT=PASS
INDEPENDENT_UNIT=PASS
CONFIRMATORY_FAMILY_LOCK=FAIL
RQ3_AGGREGATION_LOCK=FAIL
STATISTICAL_TEST_LOCK=FAIL
MULTIPLICITY_LOCK=PASS
PSEUDOREPLICATION_AUDIT=PASS
CALIBRATION_EVALUATION_SEPARATION=PASS
