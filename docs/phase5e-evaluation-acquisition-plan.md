# Phase 5E Evaluation Acquisition Plan

## Preflight Configuration
- **Replicate Count**: 10
- **Warmups**: 5
- **Measurements**: 30
- **Isolation Strategy**: 
  - *Planned*: Each evaluation case runs in a fresh Playwright browser context.
  - *Actual Deviation*: The final implementation used one fresh browser context per replicate. Individual evaluation cases used fresh pages within that context. This isolates document-level state but does NOT fully isolate OS-level, process-level, or cross-page V8/Wasm-engine JIT optimization state.
- **Timing Boundary**: From immediately before runtime invocation to immediately after return.
- **Failure Handling**: If an observation fails (NaN, negative, missing), the replicate fails and must be re-collected. No failures will be replaced with zeroes or fabricated timings.
- **Policy Modification**: The `frozen-policy.ts` is used exclusively by the adaptive selector.
- **Calibration/Evaluation Overlap**: Zero overlap with Phase 5C grids.

## Grids
- **Matrix**: [75, 125, 175, 225, 275]
- **Merge Sort**: [1500, 2500, 3500, 4500]
- **SHA-256**: [2500, 7500, 12500, 17500]

## Mode Permutations (6 possibilities)
Replicates are assigned specific mode ordering to counterbalance bias:
1. `javascript -> wasm -> adaptive` (Replicates: 0, 6)
2. `javascript -> adaptive -> wasm` (Replicates: 1, 7)
3. `wasm -> javascript -> adaptive` (Replicates: 2, 8)
4. `wasm -> adaptive -> javascript` (Replicates: 3, 9)
5. `adaptive -> javascript -> wasm` (Replicates: 4)
6. `adaptive -> wasm -> javascript` (Replicates: 5)

## Artifact Schema
The final artifact will be saved at `frontend/artifacts/evaluation/final_evaluation_<timestamp>.json` and explicitly classified as `"final-independent-evaluation"`. It will include rigorous environmental and methodological provenance SHAs mapping to Phase 5D remediation, dataset recording, CDP audits, and protocol definitions.
