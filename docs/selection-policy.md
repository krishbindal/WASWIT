# WASWIT Selection Policy

## Conceptual Architecture
The WASWIT dynamic selection engine isolates execution overhead measurement from runtime switching through a strict three-phase separation:
1. **Workload Analyzer**: Converts raw workload metadata (e.g. matrix dimension `N`) into deterministic, comparable characteristics (like byte size or element count).
2. **Calibration Engine**: A completely distinct offline process that performs rigorous benchmark sweeps across predefined `gridSizes`. It explicitly measures `JS` vs `Wasm` end-to-end times (including boundary overhead) and derives conservative transition thresholds based on median performance.
3. **Selector**: A pure deterministic function that consumes a **frozen policy artifact** and workload characteristics to output `javascript` or `wasm`.

## Policy Structure
A selection policy is defined as a versioned, immutable snapshot. 
```typescript
interface SelectionPolicy {
  version: string;
  derivationRule: string;
  workloads: Record<WorkloadId, WorkloadPolicy>;
}
```
Each `WorkloadPolicy` contains ordered rules mapping a `maxInputSize` to a preferred `RuntimeType`, along with a fallback `defaultRuntime`.

## Calibration Provenance
Because WebAssembly instantiation overhead and boundary costs are browser-specific, policies must maintain clear provenance. 
- Policies are explicitly generated offline during a **Calibration Phase**. 
- They contain metadata identifying the exact derivation rule (`derivationRule`) and the `version`.
- Evaluation must never silently self-train or rewrite the policy. This guarantees a stable target for independent scientific evaluation.

## Threshold Semantics and Unseen Input Behavior
- Thresholds represent inclusive upper bounds (`<= maxInputSize`).
- The selector evaluates ordered rules linearly. The first matching rule dictates the runtime.
- **Interpolation**: There is no dynamic interpolation for unseen sizes between thresholds; boundaries are absolute.
- **Fallback**: Inputs exceeding the maximum calibrated threshold fall back to the workload's explicitly declared `defaultRuntime` (historically, the victor of the largest calibrated size). 

## Freeze Rule & Determinism
To prevent circular methodology (where the evaluation of the system modifies the system's behavior), the policy must be **deeply frozen**. The `Selector` itself:
- Performs **NO** benchmarking.
- Uses **NO** `performance.now()` calls.
- Triggers **NO** network requests or external dependencies.
- Has **NO** history-based self-correction.
- Returns identical decisions for identical inputs.
