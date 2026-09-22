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
5. **Threshold Calculation:** The calibrator derives a discrete transition boundary using a conservative median comparison rule. The output is an explicit policy artifact, distinguishing calibration bounds from evaluation parameters.

## 2. Freeze the Selection Policy (Phase 3 Implemented)
After Calibration, the derived boundaries are embedded into an explicit, deeply frozen `SelectionPolicy` object.
**Crucial Rule:** The live `Selector` is a pure function. It does not benchmark, it does not adapt to execution history, and no tuning of thresholds will occur based on the results of the subsequent Evaluation Phase.

## 3. Independent Evaluation Phase
The goal of this phase is to test the frozen WASWIT engine against the static baselines.

1. **Independent Workloads:** We will generate *new* workload instances (different seeds or varying mixed-size batches) that were not used during calibration.
2. **Execution Modes:** The workload batch will be executed entirely in:
   - Mode A: Static JavaScript-only
   - Mode B: Static WebAssembly-only
   - Mode C: WASWIT Adaptive
3. **Measurement Integrity:** We will measure Total Execution Time, explicitly recording cold executions (first run) separately from warm executions (subsequent runs).

## 4. Analysis and Handling of Results
- **Summary Statistics:** We will use the **Median** to represent typical execution time (to resist browser garbage collection spikes) and the **Mean with Standard Deviation** to report variability.
- **Outlier Handling:** Extreme outliers (e.g., caused by OS-level interrupts) will be retained in raw data but noted if they significantly skew the standard deviation.
- **Environment Recording:** Every test run will strictly log:
  - Browser name and version (e.g., Chrome 120.x)
  - Operating System
  - Hardware specifications (CPU tier, RAM)
- **Raw Data Preservation:** All raw JSON timing data will be saved to ensure reproducibility and transparency.
