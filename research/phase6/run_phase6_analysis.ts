import * as fs from 'fs';
import * as path from 'path';

const REPLICATES = 10;
const ITERATIONS = 30;
const BOOTSTRAP_RESAMPLES = 10000;
const ALPHA = 0.05;

const SHA256_BOUNDARY_GRID = [100, 250, 500, 750, 900, 1000, 1100, 1250, 1500, 2000];

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

function median(arr: number[]): number {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function exactPairedSignPermutationTest(differences: number[]): number {
    const n = differences.length;
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

function calculateCliffsDelta(a: number[], b: number[]): number {
    let greater = 0;
    let less = 0;
    for (let i = 0; i < a.length; i++) {
        for (let j = 0; j < b.length; j++) {
            if (a[i] > b[j]) greater++;
            else if (a[i] < b[j]) less++;
        }
    }
    return (greater - less) / (a.length * b.length);
}

function runAnalysis() {
    console.log("Reading Phase 6 raw evaluation dataset...");
    const rawPath = path.resolve(__dirname, 'raw_phase6_evaluation.json');
    const rawData = JSON.parse(fs.readFileSync(rawPath, 'utf-8'));

    const caseMap = new Map<string, { elapsedMs: number[], overheadMs: number | null, selectedRuntime: string | null }>();

    for (const record of rawData.cases) {
        if (record.isWarmup) continue;

        const key = `${record.replicateId}|${record.inputSize}|${record.executionMode}`;
        if (!caseMap.has(key)) {
            caseMap.set(key, { elapsedMs: [], overheadMs: null, selectedRuntime: null });
        }
        const caseEntry = caseMap.get(key)!;
        caseEntry.elapsedMs.push(record.elapsedMs);
        if (record.selectionOverheadMs !== null) {
            caseEntry.overheadMs = record.selectionOverheadMs;
        }
        if (record.selectedRuntime !== null) {
            caseEntry.selectedRuntime = record.selectedRuntime;
        }
    }

    // Build strategy per size and replicate
    const gridData: any = {};
    for (const size of SHA256_BOUNDARY_GRID) {
        gridData[size] = {
            js: new Float64Array(REPLICATES),
            wasm: new Float64Array(REPLICATES),
            adaptiveExecution: new Float64Array(REPLICATES),
            adaptiveOverhead: new Float64Array(REPLICATES),
            adaptiveTotal: new Float64Array(REPLICATES),
            selectedRuntime: ''
        };

        for (let r = 0; r < REPLICATES; r++) {
            const jsEntry = caseMap.get(`${r}|${size}|js`);
            const wasmEntry = caseMap.get(`${r}|${size}|wasm`);
            const adaptEntry = caseMap.get(`${r}|${size}|adaptive`);

            if (!jsEntry || !wasmEntry || !adaptEntry) {
                throw new Error(`Incomplete replicate data for size=${size} r=${r}`);
            }

            gridData[size].js[r] = median(jsEntry.elapsedMs);
            gridData[size].wasm[r] = median(wasmEntry.elapsedMs);
            gridData[size].adaptiveExecution[r] = median(adaptEntry.elapsedMs);
            gridData[size].adaptiveOverhead[r] = adaptEntry.overheadMs ?? 0;
            gridData[size].adaptiveTotal[r] = median(adaptEntry.elapsedMs) + (adaptEntry.overheadMs ?? 0);
            gridData[size].selectedRuntime = adaptEntry.selectedRuntime;
        }
    }

    const prng = new LCG(42);
    const tests: any[] = [];

    // Hypotheses:
    // RQ4: Adaptive Total vs Fixed JS, and Adaptive Total vs Fixed WASM across all 10 sizes (20 tests)
    for (const size of SHA256_BOUNDARY_GRID) {
        const d = gridData[size];

        // 1. Adaptive vs JS
        const diffAdaptiveVsJS = Array.from({ length: REPLICATES }, (_, r) => d.adaptiveTotal[r] - d.js[r]);
        tests.push({
            hypothesis: 'RQ4',
            size,
            comparison: 'Adaptive_vs_JS',
            policySelectedRuntime: d.selectedRuntime,
            differences: diffAdaptiveVsJS,
            medianDiff: median(diffAdaptiveVsJS),
            cliffsDelta: calculateCliffsDelta(Array.from(d.adaptiveTotal), Array.from(d.js)),
            pRaw: exactPairedSignPermutationTest(diffAdaptiveVsJS),
            ci: bootstrapCI(diffAdaptiveVsJS, prng)
        });

        // 2. Adaptive vs WASM
        const diffAdaptiveVsWASM = Array.from({ length: REPLICATES }, (_, r) => d.adaptiveTotal[r] - d.wasm[r]);
        tests.push({
            hypothesis: 'RQ4',
            size,
            comparison: 'Adaptive_vs_Wasm',
            policySelectedRuntime: d.selectedRuntime,
            differences: diffAdaptiveVsWASM,
            medianDiff: median(diffAdaptiveVsWASM),
            cliffsDelta: calculateCliffsDelta(Array.from(d.adaptiveTotal), Array.from(d.wasm)),
            pRaw: exactPairedSignPermutationTest(diffAdaptiveVsWASM),
            ci: bootstrapCI(diffAdaptiveVsWASM, prng)
        });
    }

    // Apply Holm-Bonferroni across all 20 tests
    const m = tests.length; // 20
    const sorted = tests.map((t, idx) => ({ ...t, originalIndex: idx })).sort((a, b) => a.pRaw - b.pRaw);
    let prevAdjusted = 0;

    for (let k = 0; k < m; k++) {
        const raw = sorted[k].pRaw;
        const adj = Math.max(prevAdjusted, Math.min(1.0, raw * (m - k)));
        sorted[k].pHolm = adj;
        sorted[k].significant = adj < ALPHA;
        prevAdjusted = adj;
    }

    const finalTests = new Array(m);
    for (let i = 0; i < m; i++) {
        finalTests[sorted[i].originalIndex] = sorted[i];
    }

    // Descriptive table & overhead stats
    const allOverheads: number[] = [];
    const summaryRows = SHA256_BOUNDARY_GRID.map(size => {
        const d = gridData[size];
        for (let r = 0; r < REPLICATES; r++) allOverheads.push(d.adaptiveOverhead[r]);

        return {
            size,
            policySelectedRuntime: d.selectedRuntime,
            jsMedianMs: median(Array.from(d.js)),
            wasmMedianMs: median(Array.from(d.wasm)),
            adaptiveMedianMs: median(Array.from(d.adaptiveExecution)),
            adaptiveOverheadMedianMs: median(Array.from(d.adaptiveOverhead)),
            adaptiveTotalMedianMs: median(Array.from(d.adaptiveTotal))
        };
    });

    const overheadSorted = [...allOverheads].sort((a, b) => a - b);
    const overheadStats = {
        min: overheadSorted[0],
        max: overheadSorted[overheadSorted.length - 1],
        median: median(overheadSorted),
        p25: overheadSorted[Math.floor(overheadSorted.length * 0.25)],
        p75: overheadSorted[Math.floor(overheadSorted.length * 0.75)],
        mean: allOverheads.reduce((a, b) => a + b, 0) / allOverheads.length
    };

    const significantCount = finalTests.filter(t => t.significant).length;

    const analysisReport = {
        classification: "phase6-statistical-analysis",
        timestamp: new Date().toISOString(),
        grid: SHA256_BOUNDARY_GRID,
        totalConfirmatoryTests: m,
        fwerAlpha: ALPHA,
        significantCount,
        holmStatement: significantCount === 0
            ? "The specified analysis did not establish statistically significant differences under the multiplicity-adjusted testing procedure."
            : `${significantCount} of ${m} tests demonstrated statistically significant differences under Holm-Bonferroni correction.`,
        overheadStats,
        summaryRows,
        confirmatoryTests: finalTests
    };

    const outPath = path.resolve(__dirname, 'phase6_analysis.json');
    fs.writeFileSync(outPath, JSON.stringify(analysisReport, null, 2), 'utf-8');
    console.log(`Phase 6 statistical analysis complete! Saved to ${outPath}`);
    console.log(`Significant tests: ${significantCount}/${m}`);
    console.log(`Overhead median: ${overheadStats.median.toFixed(5)} ms (max: ${overheadStats.max.toFixed(5)} ms)`);
}

runAnalysis();
