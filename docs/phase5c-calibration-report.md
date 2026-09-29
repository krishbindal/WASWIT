# Phase 5C: Final Calibration Data Collection

## Status
- **Protocol used**: Phase 5A locked protocol (`50b8cb6cd4154bb1d67521cbf372ca8e7441d5f2`)
- **Warmups**: 5
- **Measurements**: 30
- **Planned independent replicates**: 10
- **Acquisition architecture**: Option B (separate fresh browser contexts via Playwright)

## Process
A pre-collection smoke test was conducted for a single point (Matrix 50) and discarded.
Following this, the complete 320-context final calibration was successfully executed.
Data was properly saved to `frontend/artifacts/calibration/final_calibration_<timestamp>.json` and contains no pilot contamination.

## Integrity Verification
- **Smoke test**: PASS
- **Final calibration collection**: COMPLETE
- **Expected calibration cases**: 320
- **Completed calibration cases**: 320
- **Raw measurement integrity**: PASS (9,600 valid samples verified)
- **Environment provenance**: PASS (includes browser, memory, logical processors, cargo/rust/node/wasm-pack versions)
- **Calibration/evaluation separation**: PASS
- **Pilot contamination**: PASS (classification explicitly final-calibration)
- **Source Provenance Git SHA**: PASS (`7e069fa8c4281e52619c34198bda1c6bb72c29d3`)

### Environment Provenance Diagnosis (Phase 5C Metadata Verification)
An internal inconsistency in the generated artifact's metadata (browserVersion = "138.0.7204.102" vs userAgent = "Chrome/153.0.8010.12") was audited via a strict metadata-only verification script querying the Chromium CDP (`Browser.getVersion`).
- **CDP Evidence**: 
  - `CDP product`: `Chrome/138.0.7204.102`
  - `CDP jsVersion`: `13.8.500258`
  - `CDP userAgent`: `HeadlessChrome/138.0.0.0`
  - `navigator.userAgent` (Page level): `Chrome/153.0.8010.12`
- **Diagnosis**: Playwright executed its local bundled Chromium binary, whose true engine version is `138.0.7204.102`.
- **UserAgent Spoofing**: The page-level `userAgent` string containing "153.0.8010.12" is a known artifact of Playwright's `devices['Desktop Chrome']` preset, which forcibly spoofs the user agent inside the browser context while the underlying physical engine remains unchanged.
- **Conclusion**: The actual execution environment (Chromium 138.0.7204.102 on Windows) was successfully and deterministically recorded. The existing 17:33 calibration dataset accurately reflects the true execution engine and is sealed as perfectly valid without requiring a rerun.

All observations accurately reflect pure elapsedMs timing with input generation/preparation fully excluded. Invalid samples were not modified or zeros fabricated.

## Artifact Locations
- **Orchestrator**: `frontend/e2e/calibration.spec.ts`
- **Runner Route**: `frontend/src/app/calibration-runner/page.tsx`
- **Artifact**: `frontend/artifacts/calibration/final_calibration_2026-09-29T17-33-07-945Z.json`
