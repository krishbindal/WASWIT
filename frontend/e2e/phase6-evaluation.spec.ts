import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { execSync } from 'child_process';
import { phase5FrozenPolicy } from '../src/core/selection/frozen-policy';

const SHA256_BOUNDARY_GRID = [100, 250, 500, 750, 900, 1000, 1100, 1250, 1500, 2000];

const MODE_PERMUTATIONS = [
    ['js', 'wasm', 'adaptive'], // 0, 6
    ['js', 'adaptive', 'wasm'], // 1, 7
    ['wasm', 'js', 'adaptive'], // 2, 8
    ['wasm', 'adaptive', 'js'], // 3, 9
    ['adaptive', 'js', 'wasm'], // 4
    ['adaptive', 'wasm', 'js']  // 5
];

function getReplicateModeOrder(replicate: number): string[] {
    return MODE_PERMUTATIONS[replicate % MODE_PERMUTATIONS.length];
}

test.describe('Phase 6 SHA-256 Boundary Evaluation', () => {
    test.setTimeout(1800000); // 30 mins

    test('Collect Phase 6 Boundary Data', async ({ browser, browserName }) => {
        const REPLICATES = 10;

        const getCmd = (cmd: string) => {
            try {
                return execSync(cmd).toString().trim();
            } catch {
                return 'Unknown';
            }
        };

        const acquisitionSourceGitSha = getCmd('git rev-parse HEAD');
        const rustcVersion = getCmd('rustc --version');
        const cargoVersion = getCmd('cargo --version');
        const wasmPackVersion = getCmd('wasm-pack --version');
        const nodeVersion = getCmd('node --version');

        let browserVersion = 'Unknown';
        // Cross-platform OS capture using node:os (replaces deprecated wmic)
        const osVersionStr = typeof os.version === 'function' ? os.version() : os.platform();
        const osInfo = `${os.type()} ${os.release()} (${osVersionStr}) [${os.arch()}]`;

        // 1. Smoke test and environment extraction
        console.log('--- Phase 6: Smoke Test & System Metadata ---');
        const ctxSmoke = await browser.newContext();
        const pSmoke = await ctxSmoke.newPage();
        await pSmoke.goto('http://localhost:3000/evaluation-runner?workload=sha256&size=100&mode=adaptive');
        await expect(pSmoke.locator('#eval-status')).toContainText('Evaluation_Complete', { timeout: 30000 });

        const navMeta = await pSmoke.evaluate(() => {
            return {
                ua: navigator.userAgent,
                hw: navigator.hardwareConcurrency || 'Unknown',
                mem: (navigator as any).deviceMemory || 'Unknown',
                coi: window.crossOriginIsolated
            };
        });
        browserVersion = browser.version();
        await ctxSmoke.close();
        console.log('--- Smoke Test Passed ---');

        // 2. Artifact structure
        const timestamp = new Date().toISOString();
        const artifact: any = {
            classification: "phase6-boundary-evaluation",
            experimentRunId: `phase6-${Date.now()}`,
            timestamp,
            protocolVersion: "Phase 6 Pre-registered",
            protocolPath: "docs/completion/PHASE6_PROTOCOL.md",
            policyVersion: phase5FrozenPolicy.version,
            policyDerivationRule: phase5FrozenPolicy.derivationRule,
            acquisitionSourceGitSha,
            environment: {
                browser: browserName,
                browserVersion,
                browserEngine: browserName === 'chromium' ? 'Blink' : 'Unknown',
                userAgent: navMeta.ua,
                operatingSystem: osInfo,
                logicalProcessorCount: navMeta.hw,
                deviceMemory: navMeta.mem,
                crossOriginIsolated: navMeta.coi,
                nodeVersion,
                rustcVersion,
                cargoVersion,
                wasmPackVersion
            },
            replicateConfiguration: {
                replicateCount: REPLICATES,
                warmups: 5,
                measurements: 30
            },
            grid: SHA256_BOUNDARY_GRID,
            modeOrderPerReplicate: {},
            cases: []
        };

        for (let r = 0; r < REPLICATES; r++) {
            artifact.modeOrderPerReplicate[r] = getReplicateModeOrder(r);
        }

        console.log(`--- Starting Phase 6 Acquisition across ${SHA256_BOUNDARY_GRID.length} sizes, 3 modes, ${REPLICATES} replicates ---`);

        for (let replicate = 0; replicate < REPLICATES; replicate++) {
            const modeOrder = getReplicateModeOrder(replicate);
            console.log(`Replicate ${replicate + 1}/${REPLICATES} (Order: ${modeOrder.join(' -> ')})`);
            const ctx = await browser.newContext();

            for (const size of SHA256_BOUNDARY_GRID) {
                for (const mode of modeOrder) {
                    try {
                        const p = await ctx.newPage();
                        await p.goto(`http://localhost:3000/evaluation-runner?workload=sha256&size=${size}&mode=${mode}`);
                        await expect(p.locator('#eval-status')).toContainText('Evaluation_Complete', { timeout: 30000 });
                        const resText = await p.locator('#eval-results').textContent();
                        const res = JSON.parse(resText || '{}');

                        if (!res.success) {
                            throw new Error(res.error || "Unknown Failure");
                        }

                        // Record measurements
                        for (let i = 0; i < res.samples.length; i++) {
                            const sample = res.samples[i];
                            artifact.cases.push({
                                replicateId: replicate,
                                workload: 'sha256',
                                inputSize: size,
                                executionMode: mode,
                                trialIndex: i,
                                isWarmup: false,
                                selectedRuntime: res.selectedRuntime,
                                selectionOverheadMs: res.selectionOverheadMs,
                                elapsedMs: sample.elapsedMs,
                                error: null,
                                timestamp: sample.timestamp
                            });
                        }

                        // Record warmup placeholders
                        for (let w = 0; w < res.warmup; w++) {
                            artifact.cases.push({
                                replicateId: replicate,
                                workload: 'sha256',
                                inputSize: size,
                                executionMode: mode,
                                trialIndex: w,
                                isWarmup: true,
                                selectedRuntime: res.selectedRuntime,
                                selectionOverheadMs: null,
                                elapsedMs: 0,
                                error: null,
                                timestamp: null
                            });
                        }

                        await p.close();
                    } catch (e: any) {
                        console.error(`Failed sha256 size=${size} mode=${mode} replicate=${replicate}: ${e.message}`);
                        artifact.cases.push({
                            replicateId: replicate,
                            workload: 'sha256',
                            inputSize: size,
                            executionMode: mode,
                            trialIndex: 0,
                            isWarmup: false,
                            selectedRuntime: null,
                            selectionOverheadMs: null,
                            elapsedMs: null,
                            error: e.message,
                            timestamp: new Date().toISOString()
                        });
                    }
                }
            }
            await ctx.close();
        }

        // Write artifact to research/phase6/raw_phase6_evaluation.json
        const outDir = path.resolve(__dirname, '../../research/phase6');
        if (!fs.existsSync(outDir)) {
            fs.mkdirSync(outDir, { recursive: true });
        }
        const outPath = path.join(outDir, 'raw_phase6_evaluation.json');
        fs.writeFileSync(outPath, JSON.stringify(artifact, null, 2), 'utf-8');
        console.log(`Phase 6 raw evaluation saved to: ${outPath} (${artifact.cases.length} cases recorded)`);

        expect(artifact.cases.length).toBeGreaterThan(0);
    });
});
