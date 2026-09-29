# Phase 5E Evidence Isolation Details

## Collection Design Clarification
The final independent evaluation dataset correctly bounded execution and preserved strict statistical independence.

- **Independent Replicates**: Each of the 10 replicates used precisely one fresh Playwright browser context (`browser.newContext()`).
- **Context Boundary**: All 13 case-size combinations (39 execution conditions total) belonging to a single replicate executed sequentially within that single isolated browser context. 
- **Page Boundary**: Individual case executions instantiated a fresh browser tab/page (`context.newPage()`), but did not spawn a completely new underlying browser process or context.
- **Counterbalancing**: The exact mode-execution ordering (e.g., `js -> wasm -> adaptive`) was mathematically counterbalanced across replicates and recorded accurately in the final provenance artifact. 
- **Disclaimer**: We do not claim a fresh browser context per *individual case execution*, only per *independent replicate block*. This ensures replicates represent completely distinct environments, satisfying the protocol requirement for block independence.
