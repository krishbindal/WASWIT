# Phase 5D: Frozen Selection Policy Certificate

## Artifact Provenance
- **Calibration Protocol SHA**: `50b8cb6cd4154bb1d67521cbf372ca8e7441d5f2`
- **Acquisition Source SHA**: `7e069fa8c4281e52619c34198bda1c6bb72c29d3`
- **Calibration Dataset Commit**: `81c76001c68d0387858a78fb46cdfda1dbcc9ee5`
- **CDP Provenance Audit Commit**: `5b9b27081374a2ad29cc677508f5704d812fa95e`
- **Policy Derivation/Remediation Commit**: `8c73b26d7671e6b77ab13988f163b304d21da1a7`

## Methodological Clarification
- Phase 5A established replicate as the independent experimental unit but did not explicitly specify the calibration-point aggregation formula.
- Before Phase 5E, Phase 5D remediation fixed the calibration-point statistic as the median of the 10 replicate-level medians.
- Each replicate-level median is computed from its 30 measured iterations.
- This preserves replicate-level independence for the calibration derivation.
- The raw 300 measurements per runtime/point remain untouched and retained.
- The old pooled-300 median was evaluated only as a sensitivity/invariance audit.
- **Derivation Rule**: `median-crossover-consistent-v2`

## Derivation Summary

### Matrix Multiplication
- **Default Runtime**: `wasm`
- **Transition Rules**: None. (Wasm consistently dominated across the entire calibration sweep from N=50 to N=300).

### Merge Sort
- **Default Runtime**: `wasm`
- **Transition Rules**: None. (Wasm consistently dominated across the entire calibration sweep from N=1000 to N=5000).

### SHA-256
- **Default Runtime**: `wasm`
- **Transition Rules**: 
  - `maxInputSize: 1000 -> javascript`
- **Observation**: JavaScript demonstrated lower median execution times at N=1000, while Wasm achieved dominance at N=5000 and beyond. The consistent crossover logic placed the boundary at N=1000.

## Integrity Lock
This derived policy is completely deterministic based on the underlying raw performance samples. The policy structure adheres to the Phase 4B Validation Engine's `SelectionPolicy` interface and is certified ready for Phase 5E independent evaluation orchestration.

The `frozen_policy` artifact and its derivation code are sealed. No further calibration or policy derivation will be conducted.
