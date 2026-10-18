# Research Methodology

## Phase 5C Calibration

- **Matrix**: 50, 100, 150, 200, 250, 300
- **Merge Sort**: 1000, 2000, 3000, 4000, 5000
- **SHA-256**: 1000, 5000, 10000, 15000, 20000

**Calibration Settings**:
- 10 replicates
- 5 warmups
- 30 measured iterations

## Independent Evaluation

**13 workload-size cells**:
- **Matrix**: 75, 125, 175, 225, 275
- **Merge Sort**: 1500, 2500, 3500, 4500
- **SHA-256**: 2500, 7500, 12500, 17500

**Evaluation Settings**:
- 10 independent replicates per cell.
- 30 measured iterations per replicate.
- 5 warmups per replicate.
- Warmups excluded from primary timing.

## Statistical Analysis

- **39 confirmatory tests**:
  - 13 JS vs WASM
  - 13 Adaptive vs JS
  - 13 Adaptive vs WASM
- **Unit**: 10 replicate-level paired observations per cell.
- **Method**: Exact paired sign-permutation test.
- **Permutations**: 2^10 = 1,024 sign assignments.
- **Direction**: Two-sided p-values.
- **Multiplicity**: Holm-Bonferroni correction across all 39 tests.
- **Family-wise alpha**: 0.05
- **Confidence Intervals**: 10,000 percentile bootstrap resamples.

## Final Observation

0/39 statistically significant tests after Holm correction.

The specified analysis did not establish statistically significant differences under the multiplicity-adjusted testing procedure.

## Final Frozen Policy

The empirically derived routing thresholds are as follows:
- **Matrix**: default WASM (no explicit rules)
- **Sort**: default WASM (no explicit rules)
- **SHA-256**: input <= 1000 -> JavaScript; input > 1000 -> WebAssembly

**Policy Version**: `1.0.0-final`
**Derivation Strategy**: `median-crossover-consistent-v2`
**Policy SHA**: `c8c330ebb91abf7757d35a7bd0ad9a03214f0866f77d74107a21f0056b661ef9`

This policy is:
- deterministic
- empirical
- environment-specific
- workload-specific
- frozen

It is NOT:
- AI
- ML
- dynamically learned
- universally optimal
