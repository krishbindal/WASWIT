# Experimental Methodology

## Objective
To conduct a fair, reproducible comparison between JavaScript-only, WebAssembly-only, and WASWIT adaptive execution models.

To ensure statistical validity and prevent circular logic, the methodology is strictly separated into a **Calibration Phase** and an **Independent Evaluation Phase**.

---

## 1. Calibration Phase (Threshold Discovery - Phase 3 Implemented)
The goal of this phase is to characterize the performance of JS and Wasm independently and establish the decision boundaries (thresholds) for the WASWIT engine. This phase is implemented as a standalone offline engine separate from live execution.

1. **Deterministic Input Generation:** Inputs (arrays, strings, matrices) are generated using exact fixed-seed algorithmic logic to ensure repeatable equality.
2. **Execution Sweeps:** For each workload, the calibrator runs explicit sweeps of defined grid sizes (e.g., Matrix N, Array Length, Byte Length).
3. **Warm-up:** For each input size, the function executes `warmupIterations` without recording metrics to allow JS JIT compilation and Wasm memory stabilization.
4. **Measurement:** Post warm-up, the function executes `measurementIterations` in pure JS and pure Wasm.
5. **Threshold Calculation:** The calibrator derives a discrete transition boundary using the explicit `median-crossover-consistent-v2` rule, requiring sustained evidence across at least two consecutive points to flip behavior, rejecting isolated noisy measurements. Empty or invalid parameters explicitly throw errors rather than falling back. The output is a `FrozenSelectionPolicy` containing full calibration provenance.

## 2. Freeze the Selection Policy (Phase 3 Implemented)
After Calibration, the derived boundaries are embedded into an explicit, deeply frozen `SelectionPolicy` object.
**Crucial Rule:** The live `Selector` is a pure function. It does not benchmark, it does not adapt to execution history, and no tuning of thresholds will occur based on the results of the subsequent Evaluation Phase.

## 3. Independent Evaluation Phase (Phase 4B Implemented)
The goal of this phase is to test the frozen WASWIT engine against the static baselines.

1. **Independent Workloads:** We generate *new* workload instances on explicit evaluation grids that have *zero overlap* with the calibration grids to prevent data contamination.
2. **Timing Integrity:** Deterministic input generation and equivalent cross-runtime representations are prepared exactly once per evaluation case, entirely outside the measured timing window. Both warmups and measured trials consume these pre-prepared inputs. The `elapsedMs` measurement strictly wraps computational execution only.
3. **Execution Modes:** The workload batch is executed entirely in:
   - Mode A: Static JavaScript-only
   - Mode B: Static WebAssembly-only
   - Mode C: WASWIT Adaptive
4. **Measurement Integrity:** We measure Execution Time using explicit warm-up iterations. Evaluation purely represents **warmed execution**. We do *not* label sequential Mode A/B/C trials as equivalent cold starts. No cold-start conclusions are made.
5. **Adaptive Constraints:** The adaptive branch (Mode C) dynamically executes *exactly one* selected runtime based solely on the frozen policy.

## 4. Analysis and Handling of Results
- **Summary Statistics:** We use the **Median** to represent typical execution time (to resist browser garbage collection spikes) and the **Mean** as a secondary central tendency metric. Warm-up trials and explicitly errored trials are strictly excluded from summaries.
- **Partial Failures:** Runs containing failed trials yield a `CompletedWithFailures` status. Elapsed times are not fabricated.
- **Environment Recording:** Every test run logs browser versions, OS, and hardware specifications (e.g. `hardwareConcurrency` and `deviceMemory`). Note that browser-exposed metadata is often heavily clamped or mocked due to anti-fingerprinting privacy protections and cannot be trusted as an absolute ground-truth reflection of the host hardware.
- **Raw Data Preservation:** All raw JSON timing data is saved to ensure reproducibility and transparency.

*Note: Phase 4B validates the evaluation framework and integrity rules. Final performance conclusions are reserved for Phase 5 data collection.*