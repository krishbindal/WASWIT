# Table 1: Experimental Design & Environment

| Parameter | Value |
|-----------|-------|
| Workloads | Matrix Multiplication, Merge Sort, SHA-256 |
| Independent Replicates | 10 |
| Measured Iterations per Replicate | 30 |
| Warmups (Excluded) | 5 |
| Primary Metric | Median case-level elapsedMs |
| Confirmatory Tests | 39 |
| Test Method | Exact Paired Sign Permutation (1024) |
| Family-wise Alpha | 0.05 (Holm-Bonferroni correction) |
| Bootstrap Method | Percentile (10,000 resamples), 95% CI |
| Calibration/Evaluation Separation | Strict (Zero Overlap) |

**Environment Metadata (from artifacts):**
- Browser: Chromium (Google Chrome branded)
- Engine: Blink
- OS: Unknown
- Device Memory / Processors: (See metadata JSON)
