import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

// Read the existing canonical analysis file
const existingPath = path.resolve(__dirname, 'phase6_analysis.json');
const existingBuf = fs.readFileSync(existingPath);
const existingHash = crypto.createHash('sha256').update(existingBuf).digest('hex');
const existingData = JSON.parse(existingBuf.toString('utf-8'));

console.log(`Existing phase6_analysis.json SHA-256: ${existingHash}`);
const expectedHash = "58009850f027b934bf3904be114fbab5dc944c2514dd64ed277031559fedd4c0";
console.log(`Expected SHA-256:                     ${expectedHash}`);
console.log(`Exact Hash Match: ${existingHash === expectedHash ? "PASS" : "FAIL"}`);

// Import the logic from run_phase6_analysis.ts by evaluating it with fixed timestamp
// and comparing the resulting JSON object key-by-key
const rawPath = path.resolve(__dirname, 'raw_phase6_evaluation.json');
const rawData = JSON.parse(fs.readFileSync(rawPath, 'utf-8'));

// We test if regenerating with the canonical timestamp reproduces the byte-for-byte SHA-256
const REPLICATES = 10;
const BOOTSTRAP_RESAMPLES = 10000;
const ALPHA = 0.05;
const SHA256_BOUNDARY_GRID = [100, 250, 500, 750, 900, 1000, 1100, 1250, 1500, 2000];

class LCG {
    private seed: number;
    constructor(seed: number) { this.seed = seed; }
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
    const tObs = median(differences);
    let extremeCount = 0;
    const totalPermutations = 1 << n;
    for (let i = 0; i < totalPermutations; i++) {
        const permuted = differences.map((d, index) => ((i & (1 << index)) ? d : -d));
        const tPerm = median(permuted);
        if (Math.abs(tPerm) >= Math.abs(tObs)) extremeCount++;
    }
    return extremeCount / totalPermutations;
}

function bootstrapCI(differences: number[], prng: LCG): [number, number] {
    const n = differences.length;
    const medians = new Float64Array(BOOTSTRAP_RESAMPLES);
    const sample = new Float64Array(n);
    for (let i = 0; i < BOOTSTRAP_RESAMPLES; i++) {
        for (let j = 0; j < n; j++) sample[j] = differences[Math.floor(prng.next() * n)];
        sample.sort();
        const mid = Math.floor(n / 2);
        medians[i] = n % 2 !== 0 ? sample[mid] : (sample[mid - 1] + sample[mid]) / 2;
    }
    medians.sort();
    return [medians[Math.floor(BOOTSTRAP_RESAMPLES * 0.025)], medians[Math.floor(BOOTSTRAP_RESAMPLES * 0.975)]];
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

const caseMap = new Map<string, { elapsedMs: number[], overheadMs: number | null, selectedRuntime: string | null }>();
for (const record of rawData.cases) {
    if (record.isWarmup) continue;
    const key = `${record.replicateId}|${record.inputSize}|${record.executionMode}`;
    if (!caseMap.has(key)) caseMap.set(key, { elapsedMs: [], overheadMs: null, selectedRuntime: null });
    const entry = caseMap.get(key)!;
    entry.elapsedMs.push(record.elapsedMs);
    if (record.selectionOverheadMs !== null) entry.overheadMs = record.selectionOverheadMs;
    if (record.selectedRuntime !== null) entry.selectedRuntime = record.selectedRuntime;
}

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
        gridData[size].js[r] = median(caseMap.get(`${r}|${size}|js`)!.elapsedMs);
        gridData[size].wasm[r] = median(caseMap.get(`${r}|${size}|wasm`)!.elapsedMs);
        gridData[size].adaptiveExecution[r] = median(caseMap.get(`${r}|${size}|adaptive`)!.elapsedMs);
        gridData[size].adaptiveOverhead[r] = caseMap.get(`${r}|${size}|adaptive`)!.overheadMs ?? 0;
        gridData[size].adaptiveTotal[r] = gridData[size].adaptiveExecution[r] + gridData[size].adaptiveOverhead[r];
        gridData[size].selectedRuntime = caseMap.get(`${r}|${size}|adaptive`)!.selectedRuntime;
    }
}

const prng = new LCG(42);
const tests: any[] = [];
for (const size of SHA256_BOUNDARY_GRID) {
    const d = gridData[size];
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

const m = tests.length;
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
for (let i = 0; i < m; i++) finalTests[sorted[i].originalIndex] = sorted[i];

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

// Using the exact canonical timestamp
const regeneratedReport = {
    classification: "phase6-statistical-analysis",
    timestamp: existingData.timestamp, // "2026-10-18T10:53:39.610Z"
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

const regeneratedString = JSON.stringify(regeneratedReport, null, 2);
const regeneratedHash = crypto.createHash('sha256').update(Buffer.from(regeneratedString, 'utf-8')).digest('hex');

console.log(`Deterministic Re-run SHA-256 (fixed timestamp): ${regeneratedHash}`);
console.log(`Deterministic Re-run Matches Canonical Exactly:    ${regeneratedHash === expectedHash ? "PASS (100% byte-for-byte)" : "FAIL"}`);
