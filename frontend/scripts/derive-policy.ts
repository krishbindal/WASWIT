import * as fs from 'fs';
import * as path from 'path';
import { deriveWorkloadPolicy } from '../src/core/calibration/calibrator';
import { CalibrationRecord } from '../src/core/calibration/types';
import { SelectionPolicy } from '../src/core/selection/types';
import { freezePolicy } from '../src/core/selection/policy';
import { WorkloadId } from '../src/core/types';
import { BenchmarkStats } from '../src/core/benchmark/types';

const artifactDir = path.join(__dirname, '../artifacts/calibration');
const files = fs.readdirSync(artifactDir).filter(f => f.startsWith('final_calibration_'));
const data = require(path.join(artifactDir, files[0]));

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

        // Combine all 300 samples across the 10 replicates to form the aggregate stat for the derivation
        const computeAgg = (reps: any[]): BenchmarkStats => {
            const allSamples = [];
            for (const r of reps) {
                allSamples.push(...r.samples.map((s:any) => s.elapsedMs));
            }
            allSamples.sort((a,b) => a - b);
            const sum = allSamples.reduce((a,b) => a+b, 0);
            return {
                min: allSamples[0],
                max: allSamples[allSamples.length-1],
                mean: sum / allSamples.length,
                median: (allSamples[149] + allSamples[150]) / 2,
                count: allSamples.length
            };
        };

        const jsStats = computeAgg(jsReps);
        const wasmStats = computeAgg(wasmReps);

        let pref: 'javascript' | 'wasm' | 'tie' = 'tie';
        if (jsStats.median < wasmStats.median) pref = 'javascript';
        else if (wasmStats.median < jsStats.median) pref = 'wasm';

        record.results.push({
            inputSize: size,
            jsStats,
            wasmStats,
            preferredRuntime: pref
        });
    }

    const wp = deriveWorkloadPolicy(record);
    policy.workloads[wl] = wp;
}

const frozen = freezePolicy(policy);
const outDir = path.join(__dirname, '../artifacts/policy');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, `frozen_policy_${data.timestamp.replace(/[:.]/g, '-')}.json`);
fs.writeFileSync(outPath, JSON.stringify(frozen, null, 2));

console.log("FROZEN_POLICY_GENERATED=" + outPath);
console.log(JSON.stringify(frozen, null, 2));
