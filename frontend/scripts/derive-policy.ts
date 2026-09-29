import * as fs from 'fs';
import * as path from 'path';
import { deriveWorkloadPolicy } from '../src/core/calibration/calibrator';
import { CalibrationRecord } from '../src/core/calibration/types';
import { SelectionPolicy } from '../src/core/selection/types';
import { freezePolicy } from '../src/core/selection/policy';
import { WorkloadId } from '../src/core/types';
import { BenchmarkStats } from '../src/core/benchmark/types';
import assert from 'assert';

const artifactDir = path.join(__dirname, '../artifacts/calibration');
const exactArtifactName = 'final_calibration_2026-09-29T17-33-07-945Z.json';
const data = require(path.join(artifactDir, exactArtifactName));

// Deterministic validation
assert.strictEqual(data.classification, 'final-calibration');
assert.strictEqual(data.protocolVersion, 'Phase 5A');
assert.strictEqual(data.protocolGitSha, '50b8cb6cd4154bb1d67521cbf372ca8e7441d5f2');
assert.strictEqual(data.acquisitionSourceGitSha, '7e069fa8c4281e52619c34198bda1c6bb72c29d3');
assert.strictEqual(data.expectedReplicates, 10);
assert.strictEqual(data.warmups, 5);
assert.strictEqual(data.measurements, 30);
assert.strictEqual(data.completedCases, 320);
assert.strictEqual(data.expectedCases, 320);
assert.strictEqual(data.integrity, 'PASS');
assert.strictEqual(data.environment.browserVersion, '138.0.7204.102');
assert.strictEqual(data.environment.crossOriginIsolated, false);

const GRIDS = {
    matrix: [50, 100, 150, 200, 250, 300],
    sort: [1000, 2000, 3000, 4000, 5000],
    sha256: [1000, 5000, 10000, 15000, 20000]
};

const policy: SelectionPolicy = {
    version: '1.0.0-final',
    derivationRule: 'median-crossover-consistent-v2',
    workloads: {
        matrix: null as any,
        sort: null as any,
        sha256: null as any
    }
};

let invarianceFailed = false;

for (const wl of Object.keys(GRIDS) as WorkloadId[]) {
    const record: CalibrationRecord = {
        config: {
            workloadId: wl,
            gridSizes: GRIDS[wl],
            warmupIterations: data.warmups,
            measurementIterations: data.measurements
        },
        timestamp: data.timestamp,
        results: []
    };

    for (const size of GRIDS[wl]) {
        const jsReps = data.data[wl][size.toString()].js;
        const wasmReps = data.data[wl][size.toString()].wasm;

        assert.strictEqual(jsReps.length, 10);
        assert.strictEqual(wasmReps.length, 10);

        const validateReps = (reps: any[]) => {
            const seen = new Set();
            for (const r of reps) {
                assert.ok(!seen.has(r.replicate));
                seen.add(r.replicate);
                assert.ok(r.replicate >= 0 && r.replicate <= 9);
                assert.strictEqual(r.success, true);
                assert.strictEqual(r.warmup, 5);
                assert.strictEqual(r.measurement, 30);
                assert.strictEqual(r.sampleCount, 30);
                assert.strictEqual(r.samples.length, 30);
                
                let sum = 0;
                let min = Infinity;
                let max = -Infinity;
                const sorted = [];
                for (const s of r.samples) {
                    assert.ok(Number.isFinite(s.elapsedMs) && s.elapsedMs >= 0);
                    sum += s.elapsedMs;
                    if (s.elapsedMs < min) min = s.elapsedMs;
                    if (s.elapsedMs > max) max = s.elapsedMs;
                    sorted.push(s.elapsedMs);
                }
                sorted.sort((a,b) => a - b);
                const calcMean = sum / 30;
                const calcMedian = (sorted[14] + sorted[15]) / 2;
                
                assert.ok(Math.abs(calcMean - r.mean) < 1e-9);
                assert.ok(Math.abs(calcMedian - r.median) < 1e-9);
                assert.strictEqual(r.min, min);
                assert.strictEqual(r.max, max);
            }
        };

        validateReps(jsReps);
        validateReps(wasmReps);

        const computeHierarchical = (reps: any[]): BenchmarkStats => {
            const medians = reps.map(r => r.median);
            medians.sort((a,b) => a - b);
            const sum = medians.reduce((a,b) => a + b, 0);
            return {
                min: medians[0],
                max: medians[medians.length - 1],
                mean: sum / medians.length,
                median: (medians[4] + medians[5]) / 2,
                count: medians.length
            };
        };

        const computePooled = (reps: any[]) => {
            const allSamples = [];
            for (const r of reps) {
                allSamples.push(...r.samples.map((s:any) => s.elapsedMs));
            }
            allSamples.sort((a,b) => a - b);
            return (allSamples[149] + allSamples[150]) / 2;
        };

        const jsHierarchical = computeHierarchical(jsReps);
        const wasmHierarchical = computeHierarchical(wasmReps);

        const jsPooledMedian = computePooled(jsReps);
        const wasmPooledMedian = computePooled(wasmReps);

        let prefHierarchical: 'javascript' | 'wasm' | 'tie' = 'tie';
        if (jsHierarchical.median < wasmHierarchical.median) prefHierarchical = 'javascript';
        else if (wasmHierarchical.median < jsHierarchical.median) prefHierarchical = 'wasm';

        let prefPooled: 'javascript' | 'wasm' | 'tie' = 'tie';
        if (jsPooledMedian < wasmPooledMedian) prefPooled = 'javascript';
        else if (wasmPooledMedian < jsPooledMedian) prefPooled = 'wasm';

        if (prefHierarchical !== prefPooled) {
            console.error(`INVARIANCE FAILED at ${wl} size ${size}`);
            console.error(`Pooled pref: ${prefPooled}, Hierarchical pref: ${prefHierarchical}`);
            invarianceFailed = true;
        }

        record.results.push({
            inputSize: size,
            jsStats: jsHierarchical,
            wasmStats: wasmHierarchical,
            preferredRuntime: prefHierarchical
        });
    }

    const wp = deriveWorkloadPolicy(record);
    policy.workloads[wl] = wp;
}

if (invarianceFailed) {
    console.error("Stopping due to invariance failure.");
    process.exit(1);
}

const frozen = freezePolicy(policy);
const outPath = path.join(__dirname, '../artifacts/policy', `frozen_policy_2026-09-29T17-33-07-945Z.json`);

const existing = fs.readFileSync(outPath, 'utf8');
if (existing !== JSON.stringify(frozen, null, 2)) {
    console.error("FROZEN POLICY DIFFERS FROM COMMITTED ARTIFACT.");
    process.exit(1);
}

const NEW_COMMIT_SHA = process.env.COMMIT_SHA || 'TBD';

console.log("PHASE5D_POLICY_DERIVATION=PASS");
console.log(`SOURCE_ARTIFACT=${exactArtifactName}`);
console.log(`PROTOCOL_SHA=50b8cb6cd4154bb1d67521cbf372ca8e7441d5f2`);
console.log(`ACQUISITION_SOURCE_SHA=7e069fa8c4281e52619c34198bda1c6bb72c29d3`);
console.log(`DATASET_COMMIT_SHA=81c76001c68d0387858a78fb46cdfda1dbcc9ee5`);
console.log(`CDP_AUDIT_COMMIT_SHA=5b9b27081374a2ad29cc677508f5704d812fa95e`);
console.log(`AGGREGATION=median_of_10_replicate_medians`);
console.log("POLICY_INVARIANCE=PASS");
console.log(`POLICY_ARTIFACT=${outPath}`);
