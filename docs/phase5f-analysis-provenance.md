# Phase 5F Analysis Provenance

This document clarifies the Git provenance of the final Phase 5F statistical analysis artifacts.

## Scientific Result Files (Unchanged)
The following files were originally computed during the exact Phase 5F analysis and **were strictly not regenerated or altered** by this provenance clarification:
- `frontend/artifacts/analysis/phase5f/case_level_metrics.json`
- `frontend/artifacts/analysis/phase5f/confirmatory_tests.json`
- `frontend/artifacts/analysis/phase5f/descriptive_summary.json`
- `docs/phase5f-statistical-analysis-report.md`

## Provenance Tracking
- **SAP Commit SHA**: `06b5aa20dbd43f3dacb2dd096db1c89cca95b530`
- **Execution-Base SHA**: `06b5aa20dbd43f3dacb2dd096db1c89cca95b530` 
  *(The repository HEAD at the moment the analysis script was executed).*
- **Final Analysis Commit SHA**: `129419e2c231b1c59a05cedb3ff9be62fe27ea98` 
  *(The commit containing the computed scientific results).*

## Raw Evidence Tracking
- **Final Evaluation Artifact SHA-256**: `e26be7d99266c17f8aa4f80ae62a364904720d32393bc276caeedc68e3901220`
- **Frozen Policy SHA-256**: `c8c330ebb91abf7757d35a7bd0ad9a03214f0866f77d74107a21f0056b661ef9`

The `frontend/artifacts/analysis/phase5f/phase5f-analysis-integrity.json` file was strictly updated to use explicit `ANALYSIS_EXECUTION_BASE_SHA` and `ANALYSIS_COMMIT_SHA` keys for clarity. No statistical calculation, test output, or result was modified.
