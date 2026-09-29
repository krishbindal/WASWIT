# Phase 5G Figures and Tables

## Purpose
This document catalogs the publication-ready figures and tables generated in Phase 5G. These visual artifacts purely map the Phase 5F statistical results to human-readable summaries without altering any scientific metric or significance threshold. 

## Source Artifacts
The generation script consumed the pre-locked and certified Phase 5F output artifacts strictly:
- `frontend/artifacts/analysis/phase5f/case_level_metrics.json`
- `frontend/artifacts/analysis/phase5f/confirmatory_tests.json`
- `frontend/artifacts/analysis/phase5f/descriptive_summary.json`

## Figure List
All figures are provided in high-resolution PNG and SVG formats inside `frontend/artifacts/figures/phase5g/`.
1. **Figure 1**: `figure1-static-performance.[png/svg]` - Static performance profiles across evaluated inputs for Matrix Multiplication, Merge Sort, and SHA-256.
2. **Figure 2**: `figure2-adaptive-vs-static.[png/svg]` - RQ3 timing relationship showing Adaptive Total Time (including singleton selection overhead) versus static baseline thresholds.
3. **Figure 3**: `figure3-confirmatory-effects.[png/svg]` - Confirmatory effect estimates in a forest-plot layout showcasing the 39 pre-registered hypotheses and their respective 95% bootstrap confidence intervals.
4. **Figure 4**: `figure4-selection-policy.[png/svg]` - The execution of the deterministic frozen selection policy across the independent evaluation grid sizes.

## Table List
1. **Table 1**: `docs/phase5g-table1-experimental-design.md` - Experimental design boundaries and precise metadata logic.
2. **Table 2**: `docs/phase5g-table2-descriptive-performance.md` - Aggregated descriptive medians and practical overhead evaluations.
3. **Table 3**: `docs/phase5g-table3-confirmatory-results.md` - The exact 39-test confirmatory outcome registry, complete with paired effect estimates, permutation test p-values, and Holm-Bonferroni corrections.

## Conventions
- **Rounding Convention**: Medians and metrics in markdown tables are formatted to 3 decimal places for readability. Note that raw JSON provenance artifacts retain full double-precision floating-point values from Phase 5F.
- **Statistical Annotation Policy**: Only Holm-adjusted significance metrics are used to annotate statistical assertions. Star badges and colors denoting unadjusted exploratory significance are explicitly prohibited.
- **Terminology**: The execution boundaries are referred to consistently as *JavaScript*, *Wasm*, and *Adaptive Total*.

## Reproducibility and Provenance
Generation of these assets was executed deterministically via `frontend/scripts/generate-phase5g.py`. No sampling randomness, statistical bootstrapping, or test computation exists inside the generation phase. All graphs rigidly track `phase5g-figure-provenance.json` and `phase5g-table-provenance.json` respectively.

**Provenance Requirements:**
- **Captured OS Metadata:** The locked protocol explicitly logs the captured evaluation OS as **Unknown** (do not conflate physical host OS metadata with exact captured Chrome runtime execution strings).
- **Blob SHA Tracking:** The exact source-level Git blob SHA is explicitly documented for every figure and table in the provenance artifacts.
- The raw evaluation artifact SHA-256 remains strictly separately tracked.
- The frozen policy SHA-256 remains strictly separately tracked.
- The Phase 5F SAP commit SHA remains strictly separately tracked.

Figure generation is deterministic with respect to scientific numerical content; rendering metadata such as generation timestamps may differ between executions.

## Limitations
Due to graphic resolution constraints, exact zero metrics (as natively allowed by the locked timing framework) might visually coalesce along x-axes without log-scale transformations; readers are encouraged to consult Table 2 and Table 3 directly for minute millisecond bounds.
