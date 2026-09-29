# Phase 5H Publication Claims Ledger

## SUPPORTED CLAIMS
- **Policy Determinism**: The system deterministically executes workload-aware routing rules defined by prior calibration sets.
- **Descriptive Divergence**: At specific input scales within the Blink engine, JavaScript and Wasm exhibit observable descriptive median differences.
- **Overhead Presence**: Evaluating policy boundaries imposes a non-zero computational overhead.
- **Strict Methodological Rigor**: The evaluation isolates calibration from evaluation, correctly separates single-event selection overhead, uses 10 independent replicates, and enforces a strict $\alpha=0.05$ FWER constraint via Holm-Bonferroni correction over exact permutation distributions.

## CAREFULLY QUALIFIED CLAIMS
- **Crossover Identification (RQ2)**: While the frozen calibration identified a size-based crossover for SHA-256 (size 1000), the independent evaluation grid (starting at 2500) strictly evaluated the post-crossover domain. The existence of the crossover is exploratory and specific to this environment.
- **Adaptive Tracing (RQ3)**: Descriptively, adaptive selection tracks the performance of the static Wasm baseline (plus overhead) for these specific evaluation ranges.

## UNSUPPORTED CLAIMS TO AVOID
- **"Statistically Significant Performance Improvement"**: Absolutely no pre-registered hypothesis test yielded statistical significance. Do not claim WASWIT improves performance inferentially.
- **"WebAssembly is universally faster"**: The evidence does not confirm this.
- **"JavaScript is optimal for small inputs"**: The independent evaluation grid does not confirm this.
- **"Optimal Routing"**: Do not claim the selector is optimal. It acts strictly as a frozen heuristic.
- **"Generalizes to all browsers"**: Evidence is restricted strictly to Chromium 138.
- **"Overhead is negligible"**: Descriptive zero timings are artifacts of timer resolution, not true zero-cost execution.
