import { spawn } from 'child_process';
import path from 'path';

const command = process.argv[2];

const allowedTargets = {
    'pilot': 'e2e/pilot.spec.ts',
    'calibrate': 'e2e/calibration.spec.ts',
    'evaluate': 'e2e/phase5e-evaluation.spec.ts'
};

if (!allowedTargets[command]) {
    console.error(`Unknown target: ${command}. Allowed targets are: pilot, calibrate, evaluate.`);
    process.exit(1);
}

const targetFile = allowedTargets[command];

console.warn('================================================================================');
console.warn('WARNING: EXECUTING RESEARCH DATA ACQUISITION SUITE');
console.warn('This will collect evaluation data that forms the scientific record.');
console.warn('Ensure the environment is completely isolated before proceeding.');
console.warn('================================================================================');
console.log(`Starting Research Acquisition: ${command}`);
console.log(`File: ${targetFile}`);

const env = Object.assign({}, process.env, { WASWIT_RESEARCH_ACQUISITION: '1' });

const child = spawn('npx', ['playwright', 'test', targetFile], {
    env,
    stdio: 'inherit',
    shell: true
});

child.on('exit', (code) => {
    process.exit(code ?? 1);
});
