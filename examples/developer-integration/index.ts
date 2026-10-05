import { waswitRun } from '../../frontend/src/core/sdk';

async function main() {
  console.log('Initializing WASWIT Developer Example...');

  const input = new Int32Array([100, 5, -2, 70, 3, 15]);

  console.log('\nExecuting Sort Workload (Size: 6)');
  const res = await waswitRun({
    workload: 'sort',
    input
  });

  console.log('\n--- WASWIT SDK RESULT ---');
  console.log('Workload:', res.workload);
  console.log('Selected Runtime:', res.runtime);
  console.log('Selection Overhead (ms):', res.selectionOverheadMs.toFixed(3));
  console.log('Execution Time (ms):', res.executionTimeMs.toFixed(3));
  console.log('Policy Version:', res.policyVersion);
  console.log('Policy Rule:', res.policyDerivationRule);
  console.log('Result (first 5):', res.result.slice(0, 5));
}

main().catch(console.error);

