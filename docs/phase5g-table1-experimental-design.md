# Table 1: Experimental Design & Environment

| Parameter | Captured Value |
|-----------|----------------|
| Workloads | Matrix Multiplication; Merge Sort; SHA-256 |
| Evaluation Replicates | 10 |
| Measured Iterations / Replicate | 30 |
| Warmups / Replicate | 5 |
| Primary Metric | Median case-level elapsedMs |
| Confirmatory Tests | 39 |
| Test Method | Exact paired sign permutation; 1024 permutations |
| Family-wise Alpha | 0.05 |
| Multiplicity | Holm-Bonferroni |
| Bootstrap | 10,000 percentile resamples |
| CI | 95% |
| Browser | chromium |
| Browser Version | 138.0.7204.102 |
| Browser Engine | Blink |
| OS | Unknown |
| Logical Processor Count | 12 |
| Device Memory | 8 GB |
| crossOriginIsolated | false |
| Node | v24.11.1 |
| Rustc | 1.98.1 |
| Cargo | 1.98.1 |
| wasm-pack | 0.15.0 |

*Environment metadata represents the captured experimental session. Browser-exposed hardware metadata may be privacy-limited.*
