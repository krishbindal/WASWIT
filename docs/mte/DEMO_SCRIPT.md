# WASWIT Live Demo Script

## Recommended Sequence (3-5 minutes)

**STEP 1:**
Open WASWIT homepage.

**STEP 2:**
Explain the research problem: Web developers struggle to know whether JS or WASM is faster for a specific workload and input size.

**STEP 3:**
Open: `/developer`

**STEP 4:**
Select: `Merge Sort`

**STEP 5:**
Use an example input size such as: `5000`

**STEP 6:**
Run the workload.

**STEP 7:**
Show the outputs:
- Selected Runtime
- Input Size
- Selection Overhead
- Execution Time
- Policy Version

**STEP 8:**
Explain that the runtime was selected using the frozen empirical policy (`1.0.0-final`).

**STEP 9:**
Show developer integration code:
```typescript
import { waswitRun } from "waswit";

const result = await waswitRun({
  workload: "sort",
  input: data
});
```

**STEP 10:**
Explain that a developer does not need to manually call `analyzeWorkload()`, `selectRuntime()`, load the frozen policy, or handle WASM initialization manually.

**STEP 11:**
Explain package validation: `waswit-0.1.0.tgz` was tested using an isolated external Vite consumer.

## Live Demo Fallback Procedure

If the live browser fails during the demonstration:
1. Show the prevalidated developer integration code.
2. Show the package structure.
3. Show the external consumer validation evidence.
4. Explain the execution flow conceptually.
5. **CRITICAL**: Do NOT fabricate live timing results. Never claim a live result that was not actually produced.
