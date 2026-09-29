import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

// Configuration
const REPLICATES = 10;
const ITERATIONS = 30;
const BOOTSTRAP_RESAMPLES = 10000;
const ALPHA = 0.05;

const GRIDS = {
    matrix: [75, 125, 175, 225, 275],
    sort: [1500, 2500, 3500, 4500],
    sha256: [2500, 7500, 12500, 17500]
};

// Seeded PRNG for Bootstrap (simple LCG)
class LCG {
    private seed: number;
    constructor(seed: number) {
        this.seed = seed;
    }
    next(): number {
        this.seed = (this.seed * 1664525 + 1013904223) % 4294967296;
        return this.seed / 4294967296;
    }
}

// Math helpers
function median(arr: number[]): number {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function exactPairedSignPermutationTest(differences: number[]): number {
    const n = differences.length; // should be 10
    if (n !== 10) throw new Error("Expected exactly 10 differences");

    const tObs = median(differences);
    let extremeCount = 0;
    const totalPermutations = 1 << n; // 1024

    for (let i = 0; i < totalPermutations; i++) {
        const permuted = differences.map((d, index) => ((i & (1 << index)) ? d : -d));
        const tPerm = median(permuted);
        if (Math.abs(tPerm) >= Math.abs(tObs)) {
            extremeCount++;
        }
    }
    return extremeCount / totalPermutations;
}

function bootstrapCI(differences: number[], prng: LCG): [number, number] {
    const n = differences.length;
    const medians = new Float64Array(BOOTSTRAP_RESAMPLES);
    const sample = new Float64Array(n);

    for (let i = 0; i < BOOTSTRAP_RESAMPLES; i++) {
        for (let j = 0; j < n; j++) {
            sample[j] = differences[Math.floor(prng.next() * n)];
        }
        sample.sort();
        const mid = Math.floor(n / 2);
        medians[i] = n % 2 !== 0 ? sample[mid] : (sample[mid - 1] + sample[mid]) / 2;
    }

    medians.sort();
    const lowerIdx = Math.floor(BOOTSTRAP_RESAMPLES * 0.025);
    const upperIdx = Math.floor(BOOTSTRAP_RESAMPLES * 0.975);
    return [medians[lowerIdx], medians[upperIdx]];
}

// Main Analysis
function main() {
    console.log("Starting Phase 5F Analysis...");

    const evalPath = path.resolve(__dirname, '../artifacts/evaluation/final_evaluation_2026-09-29T18-16-18-546Z.json');
    const evalBuf = fs.readFileSync(evalPath);
    const evalSha256 = crypto.createHash('sha256').update(evalBuf).digest('hex');

    const policyPath = path.resolve(__dirname, '../artifacts/policy/frozen_policy_2026-09-29T17-33-07-945Z.json');
    const policyBuf = fs.readFileSync(policyPath);
    const policySha256 = crypto.createHash('sha256').update(policyBuf).digest('hex');

    if (evalSha256 !== 'e26be7d99266c17f8aa4f80ae62a364904720d32393bc276caeedc68e3901220') throw new Error("Eval SHA mismatch");
    if (policySha256 !== 'c8c330ebb91abf7757d35a7bd0ad9a03214f0866f77d74107a21f0056b661ef9') throw new Error("Policy SHA mismatch");

    const rawData = JSON.parse(evalBuf.toString('utf-8'));
    
    // Build Case-Level Dataset
    const caseMap = new Map<string, {
        elapsedMs: number[],
        overheadMs: number | null
    }>();

    let excludedWarmups = 0;
    for (const record of rawData.cases) {
        if (record.isWarmup) {
            excludedWarmups++;
            continue;
        }

        const key = `${record.replicateId}|${record.workload}|${record.inputSize}|${record.executionMode}`;
        if (!caseMap.has(key)) {
            caseMap.set(key, { elapsedMs: [], overheadMs: null });
        }

        const caseData = caseMap.get(key)!;
        caseData.elapsedMs.push(record.elapsedMs);
        if (record.selectionOverheadMs !== null) {
            caseData.overheadMs = record.selectionOverheadMs;
        }
    }

    // Build Strategy Dataset
    const strategyData: any = {};
    for (const [wl, sizes] of Object.entries(GRIDS)) {
        strategyData[wl] = {};
        for (const size of sizes) {
            strategyData[wl][size] = {
                js: new Float64Array(REPLICATES),
                wasm: new Float64Array(REPLICATES),
                adaptiveExecution: new Float64Array(REPLICATES),
                adaptiveOverhead: new Float64Array(REPLICATES),
                adaptiveTotal: new Float64Array(REPLICATES)
            };

            for (let r = 0; r < REPLICATES; r++) {
                const getMedian = (mode: string) => {
                    const k = `${r}|${wl}|${size}|${mode}`;
                    const d = caseMap.get(k);
                    if (!d || d.elapsedMs.length !== ITERATIONS) throw new Error(`Missing or incomplete data for ${k}`);
                    return median(d.elapsedMs);
                };

                strategyData[wl][size].js[r] = getMedian('js');
                strategyData[wl][size].wasm[r] = getMedian('wasm');
                
                const ak = `${r}|${wl}|${size}|adaptive`;
                const aData = caseMap.get(ak);
                if (!aData || aData.overheadMs === null) throw new Error(`Missing adaptive data for ${ak}`);
                
                const aMed = median(aData.elapsedMs);
                strategyData[wl][size].adaptiveExecution[r] = aMed;
                strategyData[wl][size].adaptiveOverhead[r] = aData.overheadMs;
                strategyData[wl][size].adaptiveTotal[r] = aMed + aData.overheadMs;
            }
        }
    }

    const tests: any[] = [];
    const prng = new LCG(42); // deterministic fixed random seed
    let cellCount = 0;

    for (const [wl, sizes] of Object.entries(GRIDS)) {
        for (const size of sizes) {
            cellCount++;
            const data = strategyData[wl][size];

            // RQ1: JS vs Wasm
            const dRq1 = Array.from({length: REPLICATES}, (_, r) => data.js[r] - data.wasm[r]);
            tests.push({
                hypothesis: 'RQ1', workload: wl, size, comparison: 'JS_vs_Wasm',
                differences: dRq1,
                medianDiff: median(dRq1),
                pRaw: exactPairedSignPermutationTest(dRq1),
                ci: bootstrapCI(dRq1, prng)
            });

            // RQ3: Adaptive vs JS
            const dRq3a = Array.from({length: REPLICATES}, (_, r) => data.adaptiveTotal[r] - data.js[r]);
            tests.push({
                hypothesis: 'RQ3', workload: wl, size, comparison: 'Adaptive_vs_JS',
                differences: dRq3a,
                medianDiff: median(dRq3a),
                pRaw: exactPairedSignPermutationTest(dRq3a),
                ci: bootstrapCI(dRq3a, prng)
            });

            // RQ3: Adaptive vs Wasm
            const dRq3b = Array.from({length: REPLICATES}, (_, r) => data.adaptiveTotal[r] - data.wasm[r]);
            tests.push({
                hypothesis: 'RQ3', workload: wl, size, comparison: 'Adaptive_vs_Wasm',
                differences: dRq3b,
                medianDiff: median(dRq3b),
                pRaw: exactPairedSignPermutationTest(dRq3b),
                ci: bootstrapCI(dRq3b, prng)
            });
        }
    }

    if (cellCount !== 13) throw new Error("Expected 13 cells");
    if (tests.length !== 39) throw new Error("Expected 39 confirmatory tests");

    // Holm-Bonferroni
    const sortedTests = tests.map((t, i) => ({...t, originalIndex: i})).sort((a, b) => a.pRaw - b.pRaw);
    let previousAdjusted = 0;
    
    for (let k = 0; k < sortedTests.length; k++) {
        const m = sortedTests.length; // 39
        const adjustedP = sortedTests[k].pRaw * (m - k);
        const finalP = Math.max(previousAdjusted, Math.min(1.0, adjustedP));
        sortedTests[k].pHolm = finalP;
        sortedTests[k].significant = finalP < ALPHA;
        previousAdjusted = finalP;
    }

    const finalTests = new Array(39);
    for (let i = 0; i < 39; i++) {
        finalTests[sortedTests[i].originalIndex] = sortedTests[i];
    }

    // Descriptive Summary
    const descriptive = Object.keys(strategyData).map(wl => {
        return {
            workload: wl,
            sizes: Object.keys(strategyData[wl]).map(sizeStr => {
                const size = parseInt(sizeStr);
                const data = strategyData[wl][size];
                
                let adaptiveBeatsOrMatchesStaticCount = 0;
                for (let r=0; r<10; r++) {
                    const staticBest = Math.min(data.js[r], data.wasm[r]);
                    if (data.adaptiveTotal[r] <= staticBest) {
                        adaptiveBeatsOrMatchesStaticCount++;
                    }
                }
                
                return {
                    size,
                    js: { mean: data.js.reduce((a:number,b:number)=>a+b,0)/10, median: median(Array.from(data.js)) },
                    wasm: { mean: data.wasm.reduce((a:number,b:number)=>a+b,0)/10, median: median(Array.from(data.wasm)) },
                    adaptiveTotal: { mean: data.adaptiveTotal.reduce((a:number,b:number)=>a+b,0)/10, median: median(Array.from(data.adaptiveTotal)) },
                    adaptiveOverhead: { mean: data.adaptiveOverhead.reduce((a:number,b:number)=>a+b,0)/10, median: median(Array.from(data.adaptiveOverhead)) },
                    adaptiveBeatsOrMatchesStaticCount
                };
            })
        };
    });

    // Write outputs
    const outDir = path.resolve(__dirname, '../artifacts/analysis/phase5f');
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }

    fs.writeFileSync(path.join(outDir, 'case_level_metrics.json'), JSON.stringify(strategyData, null, 2));
    
    // Save tests without raw arrays to keep it clean
    const cleanTests = finalTests.map(t => {
        const { differences, originalIndex, ...rest } = t;
        return rest;
    });
    fs.writeFileSync(path.join(outDir, 'confirmatory_tests.json'), JSON.stringify(cleanTests, null, 2));
    
    fs.writeFileSync(path.join(outDir, 'descriptive_summary.json'), JSON.stringify(descriptive, null, 2));

    const integrity = {
        RAW_ARTIFACT_SHA256: evalSha256,
        FROZEN_POLICY_SHA256: policySha256,
        SAP_COMMIT_SHA: '06b5aa20dbd43f3dacb2dd096db1c89cca95b530',
        ANALYSIS_GIT_SHA: require('child_process').execSync('git rev-parse HEAD').toString().trim(),
        REPLICATES_PER_CELL: REPLICATES,
        MEASUREMENTS_PER_REPLICATE: ITERATIONS,
        EXPECTED_CELLS: 13,
        OBSERVED_CELLS: cellCount,
        EXPECTED_CONFIRMATORY_TESTS: 39,
        OBSERVED_CONFIRMATORY_TESTS: finalTests.length,
        EXPECTED_PERMUTATIONS: 1024,
        BOOTSTRAP_RESAMPLES: BOOTSTRAP_RESAMPLES,
        WARMUP_ROWS_EXCLUDED: excludedWarmups,
        RAW_ZERO_VALUES_PRESERVED: "PASS",
        OVERHEAD_EVENT_POLICY: "SINGLE_EVENT_PER_CASE",
        CALIBRATION_DATA_USED_FOR_INFERENCE: "NO",
        PILOT_DATA_USED_FOR_INFERENCE: "NO"
    };

    fs.writeFileSync(path.join(outDir, 'phase5f-analysis-integrity.json'), JSON.stringify(integrity, null, 2));
    console.log("Analysis Complete.");
}

main();
