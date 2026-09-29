# Phase 5H Evidence Package

This document maps specific publication claims to their underlying, immutable scientific artifacts to prevent overclaiming and ensure strict adherence to the data.

| Claim | Supporting Artifact | Exact Source | Status Type | Qualification |
|-------|---------------------|--------------|-------------|---------------|
| JS/Wasm exhibit descriptive timing variance across input sizes | `descriptive_summary.json`, Figure 1 | Case medians across 13 cells | Descriptive | Specific to the evaluated sizes and Chrome/Blink engine. |
| The WASWIT adaptive selector incurs a measurable baseline overhead | `descriptive_summary.json` | `adaptiveOverhead` medians | Descriptive | A single logical event cost per case. Heavy quantization/exact zeros present. |
| No statistically significant difference was detected after Holm-Bonferroni correction | `confirmatory_tests.json` | 13 RQ1 test rows (Holm-adjusted p > 0.05) | Confirmatory | Null hypothesis not rejected. |
| The adaptive selector routed all independent evaluation cases according to the frozen policy | `frozen_policy_*.json`, `case_level_metrics.json` | Derived alignment of `adaptiveTotal` | Exploratory | SHA-256 evaluation sizes fell strictly above the $\le 1000$ boundary. |
| Workload-aware selection did not achieve statistically significant competitive advantage | `confirmatory_tests.json` | 26 RQ3 test rows (Holm-adjusted p > 0.05) | Confirmatory | Confirmed lack of statistical significance after correcting for 39 simultaneous tests. |
| Context lifetime implementation deviation occurred | Phase 5E/5F Protocol Audit Logs | Experimental Design Docs | Methodological | Fresh pages per case were used, but fresh browser contexts were restricted to replicate boundaries. |
| Hardware environment metadata captures are incomplete | `final_evaluation_*.json` | `environment.operatingSystem: "Unknown"` | Methodological | Browser privacy protections restrict hardware transparency. |
