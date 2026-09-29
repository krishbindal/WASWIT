# Phase 5D: Frozen Selection Policy Certificate

## Artifact Provenance
- **Source Calibration Dataset**: `frontend/artifacts/calibration/final_calibration_2026-09-29T17-33-07-945Z.json`
- **Calibration Protocol SHA**: `50b8cb6cd4154bb1d67521cbf372ca8e7441d5f2`
- **Data Acquisition SHA**: `81c76001c68d0387858a78fb46cdfda1dbcc9ee5`
- **Generated Policy Artifact**: `frontend/artifacts/policy/frozen_policy_2026-09-29T17-33-07-945Z.json`
- **Derivation Rule**: `median-crossover-consistent-v2`
- **Aggregation Strategy**: Cross-replicate pool combination (N=300 samples per calibration point) mapped to a single aggregate median.

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
