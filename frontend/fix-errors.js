const fs = require('fs');

function replaceFile(path, replacer) {
  let c = fs.readFileSync(path, 'utf8');
  c = replacer(c);
  fs.writeFileSync(path, c);
}

replaceFile('frontend/src/components/dashboard/EvaluationControl.tsx', c => {
  c = c.replace(/generationOffset:\s*\d+/g, 'generationParams: { matrixOffset: 42 }');
  c = c.replace(/useState<'Idle' \| 'Preparing' \| 'Running' \| 'Completed' \| 'Failed'>/g, "useState<'Idle' | 'Preparing' | 'Running' | 'Completed' | 'CompletedWithFailures' | 'Failed'>");
  c = c.replace(/status === 'Completed'/g, "(status === 'Completed' || status === 'CompletedWithFailures')");
  c = c.replace(/matrix:\s*\[50, 150, 250\]/, 'matrix: [75, 175, 275]');
  c = c.replace(/sort:\s*\[1500, 2500, 3500\]/, 'sort: [1500, 2500, 3500]');
  c = c.replace(/sha256:\s*\[1000, 5000, 10000\]/, 'sha256: [1250, 5000, 10000]');
  return c;
});

replaceFile('frontend/src/core/evaluation/config.test.ts', c => {
  return c.replace(/generationOffset:\s*\d+/g, 'generationParams: { matrixOffset: 0 }');
});

replaceFile('frontend/src/core/evaluation/dispatch.test.ts', c => {
  return c.replace(/generationOffset:\s*\d+/g, 'generationParams: { matrixOffset: 0 }');
});

replaceFile('frontend/src/core/evaluation/engine.test.ts', c => {
  c = c.replace(/generationOffset:\s*\d+/g, 'generationParams: { matrixOffset: 0 }');
  // fix phase
  c = c.replace(/phase: 'cold', /g, '');
  c = c.replace(/phase: 'warm', /g, '');
  return c;
});
