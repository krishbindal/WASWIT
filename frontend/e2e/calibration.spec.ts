import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

test.describe('Phase 5C Final Calibration', () => {
    test.setTimeout(600000); // 10 minutes

    test('Collect Final Calibration Data', async ({ browser, browserName }) => {
        const GRIDS = {
            matrix: [50, 100, 150, 200, 250, 300],
            sort: [1000, 2000, 3000, 4000, 5000],
            sha256: [1000, 5000, 10000, 15000, 20000]
        };

        const REPLICATES = 10;
        const MODES = ['js', 'wasm'];

        // Get environment provenance via shell
        const getCmd = (cmd: string) => {
            try {
                return execSync(cmd).toString().trim();
            } catch (e) {
                return 'Unknown';
            }
        };

        const acquisitionSourceGitSha = getCmd('git rev-parse HEAD');
        const rustcVersion = getCmd('rustc --version');
        const cargoVersion = getCmd('cargo --version');
        const wasmPackVersion = getCmd('wasm-pack --version');
        const nodeVersion = getCmd('node --version');

        let browserVersion = 'Unknown';
        let osInfo = getCmd('wmic os get Caption,Version /value') || 'Windows';
        
        let logicalProcessorCount: any = 'Unknown';
        let deviceMemory: any = 'Unknown';
        let crossOriginIsolated: any = 'Unknown';
        let userAgent = 'Unknown';

        // 1. SMOKE TEST & BROWSER METADATA (not saved to final results array)
        console.log('--- STARTING SMOKE TEST ---');
        const ctxSmoke = await browser.newContext();
        const pSmoke = await ctxSmoke.newPage();
        await pSmoke.goto(`http://localhost:3000/calibration-runner?workload=matrix&size=50&mode=js`);
        await expect(pSmoke.locator('#calib-status')).toContainText('Calibration_Complete', { timeout: 30000 });
        
        // Extract metadata
        const navMeta = await pSmoke.evaluate(() => {
            return {
                ua: navigator.userAgent,
                hw: navigator.hardwareConcurrency || 'Unknown',
                mem: (navigator as any).deviceMemory || 'Unknown',
                coi: window.crossOriginIsolated
            };
        });
        browserVersion = browser.version();
        userAgent = navMeta.ua;
        logicalProcessorCount = navMeta.hw;
        deviceMemory = navMeta.mem;
        crossOriginIsolated = navMeta.coi;
        
        await ctxSmoke.close();
        console.log('--- SMOKE TEST PASSED ---');

        // 2. FULL CALIBRATION COLLECTION
        console.log('--- STARTING FINAL CALIBRATION ---');
        
        const timestamp = new Date().toISOString();
        const timestampFile = timestamp.replace(/[:.]/g, '-');
        const artifact: any = {
            classification: "final-calibration",
            timestamp,
            protocolVersion: "Phase 5A",
            protocolGitSha: "50b8cb6cd4154bb1d67521cbf372ca8e7441d5f2", // Phase 5A locked protocol
            acquisitionSourceGitSha,
            policyVersion: "Not Applicable",
            derivationRule: "Not Applicable",
            environment: {
                browser: browserName,
                browserVersion,
                browserEngine: "Blink", // Assuming Chrome
                userAgent,
                operatingSystem: osInfo,
                logicalProcessorCount,
                deviceMemory,
                crossOriginIsolated,
                nodeVersion,
                rustcVersion,
                cargoVersion,
                wasmPackVersion
            },
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

        const outPath = path.join(outDir, `final_calibration_${timestampFile}.json`);
        fs.writeFileSync(outPath, JSON.stringify(artifact, null, 2));
        
        console.log(`CALIBRATION COMPLETED. Artifact written to: ${path.basename(outPath)}`);
        
        expect(completedCases).toBe(expectedCases);
    });
});
