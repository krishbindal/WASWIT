# Phase 5 Research Protocol

This document defines the formal experimental protocol for Phase 5 of the WASWIT project. It guarantees methodological consistency, reproducibility, and rigorous boundaries between calibration and evaluation data prior to any final empirical data collection.

## A. Research Objectives

The experimental protocol directly addresses the following research questions:

- **RQ1**: How does relative JS/Wasm performance vary across workload types and input sizes?
- **RQ2**: Which measurable workload characteristics support runtime selection?
- **RQ3**: Can the workload-aware selection mechanism achieve competitive or improved overall performance relative to static JS-only and Wasm-only execution?

## B. Experimental Units

The experimental hierarchy is defined as follows:

- **Experiment**: A complete suite of runs targeting a specific protocol version and environment.
- **Environment**: A single combination of browser, OS, and hardware execution context.
- **Calibration Run**: A sequence of executions on predefined calibration grids strictly used to generate a selection policy.
- **Frozen Policy**: The immutable, versioned artifact containing the decision thresholds derived from the Calibration Run.
- **Independent Evaluation Run**: A sequence of executions evaluating the static and adaptive execution modes using the Frozen Policy.
- **Evaluation Case**: An execution block targeting a single workload, a single independent input size, and a fully deterministic generation specification.
- **Trial**: A single measured or warmup execution of a specific execution mode (JS, Wasm, or Adaptive) within an Evaluation Case.
- **Replicate**: A statistically independent repeat of the entire Independent Evaluation Run to capture variance across time or process boundaries.

## C. Workloads

Exactly three workloads are evaluated. Workload implementations remain unmodified across the final evaluation.

1. **Matrix Multiplication**
   - **Characteristic**: Nested iterative math, linear memory traversal.
   - **Generator**: Deterministic cell-by-cell generation derived from input index and a stable offset.
   - **JS Implementation**: `Float32Array` backed flat row-major N x N storage.
   - **Wasm Implementation**: Rust `Vec<f32>` backed flat row-major N x N storage.
   - **Output Parity**: Identical `Float32Array` memory layout.
   - **JS↔Wasm Boundary**: Copies typed-array data into Wasm memory and returns copied result data.

2. **Merge Sort**
   - **Characteristic**: Recursive logic, deterministic array partitioning, frequent allocations.
   - **Generator**: Deterministic 32-bit linear congruential generator (LCG) over integer arrays.
   - **JS Implementation**: Explicit merge sort (Array.prototype.sort() is banned here).
   - **Wasm Implementation**: Explicit Rust merge sort.
   - **Output Parity**: Identical sorted `Int32Array` values.
   - **JS↔Wasm Boundary**: Copies `Int32Array` data and returns a new copied array.

3. **SHA-256**
   - **Characteristic**: Bitwise transformations, chunk-based streaming, high arithmetic density.
   - **Generator**: Deterministic sequence generation derived from size and indices.
   - **JS Implementation**: Pure JS bitwise computation.
   - **Wasm Implementation**: Pure Rust bitwise computation without external crates.
   - **Output Parity**: Identical 32-byte `Uint8Array` hash values.
   - **JS↔Wasm Boundary**: Copies `Uint8Array` to Wasm and extracts a 32-byte `Uint8Array`.

## D. Calibration / Evaluation Separation

**CALIBRATION DATA**: Used solely to derive the `SelectionPolicy`.
**POLICY FREEZE**: Once derived, the policy is strictly frozen, versioned, and deeply immutable.
**EVALUATION DATA**: Evaluation runs MUST use input sizes that have ZERO overlap with the calibration grid.

Evaluation results MUST NEVER modify or tune the policy used for that evaluation. There is absolutely no post-hoc threshold tuning. If a new policy is created based on evaluation observation, it constitutes a new experiment version and requires fully independent future evaluation.

## E. Pilot vs Final Data

Strict distinction is maintained between data classes:

1. **Engineering Pilot**:
   - Used only to identify operational issues and safe benchmark ranges.
   - Must NOT be used as final evidence or contribute to final statistical analysis.
2. **Final Calibration Dataset**:
   - Explicitly defined, recorded separately, and frozen before final evaluation begins.
3. **Final Independent Evaluation Dataset**:
   - Completely independent from calibration inputs.
   - Preserved permanently as the sole research evidence for statistical claims.

## F. Environment Recording

Final JSON results must include mandatory environment metadata. The values must reflect true runtime state (or explicitly "Unknown"/"Unavailable"). Hardware values must not be fabricated. Browser-exposed hardware metadata can be privacy-limited and should not automatically be treated as ground truth.

Target capture parameters:
- Browser name, version, and engine/family.
- Operating system.
- Logical processor count (`navigator.hardwareConcurrency`).
- Device memory (`navigator.deviceMemory`).
- Application version / Git commit SHA.
- Wasm build/compiler version.
- Experiment protocol version.
- Policy version and derivation-rule version.
- Calibration and evaluation timestamps.
- `crossOriginIsolated` state.

## G. Timing Definition

The certified Phase 4B definition remains in effect:
> `elapsedMs` measures the wall-clock duration from immediately before invocation of the selected runtime workload operation until the resulting operation returns, excluding deterministic input generation and input preparation.

**For WebAssembly:**
Adapter/binding overhead remains included. TypedArray data movement involved in the selected invocation remains included unless separately instrumented. No claims of "raw Rust-only" or "algorithm-only time" are made. `performance.now()` provides a monotonic high-resolution timestamp. Actual effective precision is subject to browser security/privacy behavior which can coarsen timing precision. Therefore, the actual runtime environment and `crossOriginIsolated` state must be recorded. Median aggregation reduces sensitivity to individual timing spikes, but timer precision remains a fundamental measurement limitation.

## H. Warmup Protocol

Final research configuration MUST specify: `warmupIterations > 0`.
Warmup trials:
- Execute before measured trials.
- Use the identical pre-prepared deterministic input.
- Are excluded from summary statistics entirely.
- Are not treated as independent cold-start measurements.

Phase 5 MUST NOT claim to measure cold-start performance.

## I. Measurement Replication

Browser execution is inherently noisy. The protocol requires an established sample size:
- **Number of independent runs (replicates)**: (To be validated by Pilot; proposed N=5 to N=10).
- **Warmup iterations**: (To be validated by Pilot; proposed N=3 to N=5).
- **Measured iterations per case**: (To be validated by Pilot; proposed N=30 to N=50).

Failed trials are explicitly captured and isolated. If a run crashes completely, it is excluded and a fresh independent run (in a fresh browser context) is required to replace it.

## J. Execution Ordering

Fixed execution order (Mode A -> Mode B -> Mode C) could introduce systematic bias through JIT fatigue, thermal throttling, or garbage collection timing.

**Chosen Strategy:**
To preserve Phase 4B certification without modifying the evaluation engine, execution ordering bias will be handled at the **research orchestration layer**:
- The Phase 4B validation engine remains untouched and retains its certified A -> B -> C loop.
- Phase 5 research acquisition must use a dedicated orchestration/acquisition layer.
- That layer must obtain mode-specific measurements without relying on a single fixed A -> B -> C sequence as the only research evidence.
- Mode order must be counterbalanced across independent acquisition runs OR each mode must be acquired in separate fresh browser sessions/contexts using the same frozen policy and identical workload-generation specification.
- The exact implementation will be designed in Phase 5B and must preserve timing semantics and provenance.
- No final data may be collected until the acquisition strategy is frozen.

## K. Experimental Grid Design

The pilot phase will validate the following proposed (but non-final) structures for computational feasibility.
*Rule: Calibration and Evaluation grids MUST NOT overlap.*

**Proposed Table (To Be Confirmed):**
| Workload | Calibration Sizes | Evaluation Sizes |
|---|---|---|
| Matrix Multiplication | 50, 100, 150, 200, 250, 300 | 75, 125, 175, 225, 275 |
| Merge Sort | 1000, 2000, 3000, 4000, 5000 | 1500, 2500, 3500, 4500 |
| SHA-256 | 1000, 5000, 10000, 15000, 20000 | 2500, 7500, 12500, 17500 |

## L. Statistical Analysis Plan

**Primary Metric**: Median `elapsedMs`.
**Secondary Metrics**: Mean `elapsedMs`, Min/Max ranges, Selection Overhead, and Failure Rates.

**Derived Comparisons**:
- JS vs Wasm (RQ1)
- Adaptive vs JS / Wasm (RQ3)

**Methods**:
The analysis hierarchy is defined as follows:
- Individual timing iterations are repeated observations within a case/run.
- The independent experimental replicate is the primary independent unit.
- For each workload/input-size/mode, measured iterations are summarized within each replicate.
- Comparisons between JS/Wasm/Adaptive should be performed on matched replicate-level observations for the same workload and input size.

Because timing data is rarely normally distributed, use paired non-parametric analysis for paired comparisons (e.g., Wilcoxon signed-rank test or an explicitly defined paired permutation test). Mann-Whitney U may only be used where observations are genuinely independent and that assumption is explicitly justified. 

Bootstrap confidence intervals must resample independent replicates, not pretend every timing iteration is independent.

No statistical test will be chosen after looking at final results. The significance level is fixed at alpha = 0.05 for all confirmatory statistical tests. Multiplicity across the predefined confirmatory comparison family will be controlled using the Holm–Bonferroni step-down procedure at family-wise alpha = 0.05. The confirmatory family is defined as the predefined primary pairwise comparisons established before data analysis. Any analyses outside the predefined confirmatory comparison family are exploratory and will be explicitly labelled as such; they will not be presented as confirmatory hypothesis tests.

## M. Practical Efficiency Metric

RQ3 is evaluated by verifying if:
`Adaptive Execution Time + Selection Overhead <= Best Static Execution Time`

Selection overhead will be tracked as a distinct `selectionOverheadMs` metric but must be integrated into the total adaptive wall-clock metric for fair overall performance claims.

## N. Reproducibility

Every final data record is entirely traceable via explicit IDs mapping to:
- Git commit SHA
- Protocol version
- Policy derivation rules
- Environment metadata

Filenames for exported JSON artifacts will follow a deterministic convention:
`<timestamp>_<experiment_id>_evaluation.json`

## O. Data Integrity

- Original raw data is immutable and never overwritten.
- Measured timing values are never manually edited.
- Failed trials are preserved with error strings.
- Re-analysis must be functionally reproducible purely from the raw JSON artifacts.

## P. Stopping / Exclusion Rules

- **Invalid Timing Sample**: Any `NaN`, negative, or unrecorded time is automatically excluded from the summary math and preserved as a failure.
- **Environment Change**: If the browser updates or hardware switches power states mid-run, the run is discarded.
- **Failed Run**: A run that consistently throws exceptions before finishing the matrix is halted and excluded.

## Q. Threats to Validity

- **Browser scheduling noise & GC**: Mitigated via positive warmups and median aggregation.
- **Thermal throttling**: Addressed by strictly spacing execution sessions and tracking independent replicates.
- **Hardware heterogeneity**: Findings are strictly bound to the specific captured environments; broad generalization requires multi-device runs.
- **Wasm binding overhead**: Admitted as a structural component of the evaluated architecture.
- **Fixed ordering effects**: Mitigated by research orchestration layer refreshes.
- **Limited workload diversity**: Acknowledged as a scoping limitation for this research phase.

## 4. Methodological Basis

- **performance.now()**: Defined by the W3C High Resolution Time specification. Known to be vulnerable to privacy coarsening (e.g., 1ms-2ms rounding on modern browsers).
- **WebAssembly JavaScript API**: Execution models follow standard MDN/W3C constraints, verifying synchronous invocation bridging.
- **Warmup Justification**: Supported by JS engine architectures (V8/SpiderMonkey) requiring iterative passes to reach tiered JIT compilation stability.

## 5. Phase 5 Workflow

1. **Phase 5A**: Protocol lock (This document).
2. **Phase 5B**: Engineering pilot (Validation of grids and sample sizes).
3. **Phase 5C**: Final calibration data collection.
4. **Phase 5D**: Policy freeze and provenance lock.
5. **Phase 5E**: Independent evaluation data collection.
6. **Phase 5F**: Statistical analysis.
7. **Phase 5G**: Figures/tables.
8. **Phase 5H**: Research interpretation.

*No stage may silently modify an earlier stage's frozen artifacts.*
