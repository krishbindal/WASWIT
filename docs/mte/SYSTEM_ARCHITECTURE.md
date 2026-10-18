# System Architecture

## Developer Integration Flow

The following architecture demonstrates how WASWIT executes in a developer application natively using the pre-compiled Developer SDK package. Research-time calibration is **not** performed during developer execution.

``mermaid
flowchart TD
    App[Developer Application] --> |waswitRun| SDK[waswitRun]
    SDK --> Validation[Input Validation]
    Validation --> Analyze[analyzeWorkload]
    Analyze --> Policy[Frozen Empirical Policy]
    Policy --> Select[selectRuntime]
    Select --> Branch{Runtime}
    Branch -->|JavaScript| JS[JavaScript Implementation]
    Branch -->|WebAssembly| WASM[WebAssembly Implementation]
    JS --> Result[Result + Metadata]
    WASM --> Result
``

## Research Pipeline

The following architecture demonstrates how the empirical policy was rigorously generated, evaluated, and frozen before SDK integration.

``mermaid
flowchart TD
    Design[Workload Design] --> Calibration[Calibration]
    Calibration --> Derivation[Policy Derivation]
    Derivation --> Freeze[Policy Freeze]
    Freeze --> Eval[Independent Evaluation]
    Eval --> Stats[Statistical Analysis]
    Stats --> Evidence[Research Evidence]
``
