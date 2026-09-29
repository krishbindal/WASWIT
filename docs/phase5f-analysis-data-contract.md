# Phase 5F Pre-Analysis Data Contract

This contract defines the explicit rules for data handling and derived-metric preparation for Phase 5F statistical inference. It does NOT define results, inferential conclusions, or statistical hypothesis test formulas (which are locked in Phase 5F itself).

## 1. Independent Experimental Unit
The fundamental unit of statistical independence is the **replicate** (`replicateId` 0..9). 

## 2. Primary Measured Observation
The primary scalar variable for performance is `elapsedMs`. 

## 3. Warmup Placeholder Exclusion
- All records where `isWarmup === true` MUST be aggressively excluded from all timing analysis.
- Their `elapsedMs` value (placeholder 0) is NEVER interpreted as a measured zero.
- Warmup placeholder values must NEVER enter medians, means, permutation tests, or confidence interval calculations.

## 4. Derived Case-Level Timing
For any given case (replicate/workload/size/mode), the primary case timing is strictly defined as the **median** of the 30 measured (`isWarmup === false`) `elapsedMs` observations.

## 5. Selection Overhead Definition
- **Static Cases** (JavaScript, Wasm): Have exactly `0ms` selection overhead.
- **Adaptive Cases**: The selection overhead (`selectionOverheadMs`) is a **CASE-LEVEL** acquisition cost. 
- There is exactly ONE logical overhead event per adaptive case.
- Under no circumstances will the recorded case-level `selectionOverheadMs` be multiplied by 30 or applied sequentially to every single measured trial for summary aggregation.

## 6. RQ3 Total Wall-Time Metric
For any subsequent analysis regarding the *overall* strategy runtime (RQ3):
- The explicit aggregation formula combining the 30-trial observation distribution and the singleton case-level overhead event remains strictly undefined here. 
- That formula MUST be formally mathematically locked in Phase 5F before observing inferential results. No post-hoc favorable treatment of overhead is permitted.
