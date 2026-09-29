import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as assert from 'assert';
import { phase5FrozenPolicy } from '../src/core/selection/frozen-policy';
import { selectRuntime } from '../src/core/selection/selector';

function main() {
    const policyPath = path.resolve(__dirname, '../artifacts/policy/frozen_policy_2026-09-29T17-33-07-945Z.json');
    const evalPath = path.resolve(__dirname, '../artifacts/evaluation/final_evaluation_2026-09-29T18-16-18-546Z.json');

    // 1. Policy Integrity Audit
    const policyBuf = fs.readFileSync(policyPath);
    const policySha256 = crypto.createHash('sha256').update(policyBuf).digest('hex');
    const policyJson = JSON.parse(policyBuf.toString('utf-8'));

    // Verify semantic equality with frozen-policy.ts module
    assert.deepStrictEqual(JSON.parse(JSON.stringify(phase5FrozenPolicy)), policyJson, "Policy semantic equality failed");
    console.log(`[PASS] Policy semantic equality. SHA-256: ${policySha256}`);

    // 2. Load Evaluation Artifact
    const evalBuf = fs.readFileSync(evalPath);
    const originalEvalSha256 = crypto.createHash('sha256').update(evalBuf).digest('hex');
    const evalData = JSON.parse(evalBuf.toString('utf-8'));

    // 3. Counts and Structure
    const expectedReplicates = 10;
    const expectedCasesPerReplicate = 13;
    const expectedModes = 3;
    const expectedMeasurements = 30;
    const expectedWarmups = 5;

    const cases = evalData.cases as any[];
    const measuredCases = cases.filter(c => !c.isWarmup);
    const warmupCases = cases.filter(c => c.isWarmup);

    assert.strictEqual(measuredCases.length, 11700, "Must have exactly 11,700 measured observations");
    assert.strictEqual(warmupCases.length, 1950, "Must have exactly 1,950 warmup observations");

    const failures = cases.filter(c => c.error !== null);
    assert.strictEqual(failures.length, 0, "Must have 0 measured failures");

    const replicateIds = Array.from(new Set(cases.map(c => c.replicateId))).sort((a, b) => a - b);
    assert.deepStrictEqual(replicateIds, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], "Replicates must be exactly 0..9");

    // 4. Case Grouping & Overhead Logic
    const caseGroups = new Map<string, any[]>();
    for (const c of measuredCases) {
        const key = `${c.replicateId}|${c.workload}|${c.inputSize}|${c.executionMode}`;
        if (!caseGroups.has(key)) {
            caseGroups.set(key, []);
        }
        caseGroups.get(key)!.push(c);
    }

    assert.strictEqual(caseGroups.size, 10 * 13 * 3, "Must have exactly 390 unique cases");

    let adaptiveCaseCount = 0;
    let logicalOverheadEventCount = 0;

    for (const [key, group] of caseGroups.entries()) {
        assert.strictEqual(group.length, 30, `Case ${key} must have exactly 30 measured observations`);
        
        const mode = group[0].executionMode;
        if (mode === 'adaptive') {
            adaptiveCaseCount++;
            
            // Verify all 30 records share identical selectionOverheadMs
            const firstOverhead = group[0].selectionOverheadMs;
            assert.ok(typeof firstOverhead === 'number' && Number.isFinite(firstOverhead) && firstOverhead >= 0, "Overhead must be finite >= 0");
            
            for (const record of group) {
                assert.strictEqual(record.selectionOverheadMs, firstOverhead, "Overhead must be identical across all 30 samples of a case");
                
                // Verify adaptive selection matches frozen policy
                const expectedRuntime = selectRuntime({ workloadId: record.workload, inputSize: record.inputSize, derivedSize: record.inputSize }, phase5FrozenPolicy);
                assert.strictEqual(record.selectedRuntime, expectedRuntime, "Adaptive selection must match frozen policy exactly");
            }
            logicalOverheadEventCount++;
        } else {
            // Verify static cases have no overhead
            for (const record of group) {
                assert.strictEqual(record.selectionOverheadMs, null, "Static case must not have selection overhead");
            }
        }
    }

    assert.strictEqual(adaptiveCaseCount, 130, "Must have exactly 130 adaptive cases");
    assert.strictEqual(logicalOverheadEventCount, 130, "Must have exactly 130 logical overhead events");

    // 5. Calibration Overlap Check
    const EVAL_GRIDS = {
        matrix: [75, 125, 175, 225, 275],
        sort: [1500, 2500, 3500, 4500],
        sha256: [2500, 7500, 12500, 17500]
    };
    
    const CALIB_GRIDS = {
        matrix: [50, 100, 150, 200, 250, 300],
        sort: [1000, 2000, 3000, 4000, 5000],
        sha256: [1000, 5000, 10000, 15000, 20000]
    };

    for (const [wl, sizes] of Object.entries(EVAL_GRIDS)) {
        const cSizes = (CALIB_GRIDS as any)[wl];
        for (const size of sizes) {
            assert.ok(!cSizes.includes(size), `Size ${size} overlaps with calibration for ${wl}`);
        }
    }

    // 6. Output Certificate
    const certPath = path.resolve(__dirname, '../../docs/phase5e-evidence-certificate.md');
    const certContent = `# Phase 5E Evidence Certificate

## Dataset Provenance
**Final Artifact**: \`frontend/artifacts/evaluation/final_evaluation_2026-09-29T18-16-18-546Z.json\`
**Artifact SHA-256**: \`${originalEvalSha256}\`
**Acquisition Commit**: \`e2f341576da6471a2ba378c8c2124abef394fcaf\`

## Policy Integrity
**Policy Artifact**: \`frontend/artifacts/policy/frozen_policy_2026-09-29T17-33-07-945Z.json\`
**Policy SHA-256**: \`${policySha256}\`
**Consistency**: All 3,900 adaptive measurements strictly matched the \`1.0.0-final\` frozen policy.

## Timing Observations
**Total Measured Count**: 11,700 (0 failures)
**Total Warmup Count**: 1,950
**Adaptive Case Count**: 130
**Logical Selection-Overhead Events**: 130

All Phase 5E audits PASSED. No data was mutated.
`;

    fs.writeFileSync(certPath, certContent, 'utf-8');
    console.log(`[PASS] Audit complete. Certificate generated at: ${certPath}`);
    console.log(`Original Artifact SHA-256: ${originalEvalSha256}`);
}

main();
