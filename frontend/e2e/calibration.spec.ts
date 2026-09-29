import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Phase 5C Final Calibration', () => {
    test.setTimeout(600000); // 10 minutes

    test('Collect Final Calibration Data', async ({ browser }) => {
        const GRIDS = {
            matrix: [50, 100, 150, 200, 250, 300],
            sort: [1000, 2000, 3000, 4000, 5000],
            sha256: [1000, 5000, 10000, 15000, 20000]
        };

        const REPLICATES = 10;
        const MODES = ['js', 'wasm'];

        // 1. SMOKE TEST (not saved)
        console.log('--- STARTING SMOKE TEST ---');
        for (const mode of MODES) {
            const ctx = await browser.newContext();
            const p = await ctx.newPage();
            await p.goto(`http://localhost:3000/calibration-runner?workload=matrix&size=50&mode=${mode}`);
            await expect(p.locator('#calib-status')).toContainText('Calibration_Complete', { timeout: 30000 });
            await ctx.close();
        }
        console.log('--- SMOKE TEST PASSED ---');

        // 2. FULL CALIBRATION COLLECTION
        console.log('--- STARTING FINAL CALIBRATION ---');
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const artifact: any = {
            classification: "final-calibration",
            timestamp,
            protocolGitSha: "50b8cb6cd4154bb1d67521cbf372ca8e7441d5f2", // Phase 5A locked protocol
            browser: "Google Chrome",
            os: "Windows",
            expectedReplicates: REPLICATES,
            warmups: 5,
            measurements: 30,
            data: {
                matrix: {},
                sort: {},
                sha256: {}
            }
        };

        // Initialize structure
        for (const [workload, sizes] of Object.entries(GRIDS)) {
            for (const size of sizes) {
                artifact.data[workload][size] = { js: [], wasm: [] };
            }
        }

        let completedCases = 0;
        const expectedCases = (6 + 5 + 5) * 2 * REPLICATES; // 320

        for (let replicate = 0; replicate < REPLICATES; replicate++) {
            for (const [workload, sizes] of Object.entries(GRIDS)) {
                for (const size of sizes) {
                    for (const mode of MODES) {
                        try {
                            const ctx = await browser.newContext();
                            const p = await ctx.newPage();
                            await p.goto(`http://localhost:3000/calibration-runner?workload=${workload}&size=${size}&mode=${mode}`);
                            await expect(p.locator('#calib-status')).toContainText('Calibration_Complete', { timeout: 60000 });
                            const resText = await p.locator('#calib-results').textContent();
                            const res = JSON.parse(resText || '{}');
                            
                            artifact.data[workload][size][mode].push({
                                replicate,
                                mode: res.mode,
                                success: res.success,
                                warmup: res.warmup,
                                measurement: res.measurement,
                                median: res.median,
                                min: res.min,
                                max: res.max,
                                mean: res.mean,
                                sampleCount: res.sampleCount,
                                zeroCount: res.zeroCount,
                                samples: res.samples,
                                error: res.error
                            });
                            completedCases++;
                            await ctx.close();
                        } catch(e: any) {
                            console.error(`Failed ${workload} ${size} ${mode} replicate ${replicate}: ${e.message}`);
                            artifact.data[workload][size][mode].push({
                                replicate,
                                mode,
                                success: false,
                                error: e.message
                            });
                        }
                    }
                }
            }
        }

        artifact.completedCases = completedCases;
        artifact.expectedCases = expectedCases;
        artifact.integrity = completedCases === expectedCases ? 'PASS' : 'FAIL';

        const outDir = path.join(__dirname, '../artifacts/calibration');
        if (!fs.existsSync(outDir)) {
            fs.mkdirSync(outDir, { recursive: true });
        }

        const outPath = path.join(outDir, `final_calibration_${timestamp}.json`);
        fs.writeFileSync(outPath, JSON.stringify(artifact, null, 2));
        
        console.log(`CALIBRATION COMPLETED. Artifact written to: ${path.basename(outPath)}`);
        
        expect(completedCases).toBe(expectedCases);
    });
});
