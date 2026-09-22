import { test, expect } from '@playwright/test';

test('WASWIT application computes Workload Parity correctly for all workloads', async ({ page }) => {
  await page.goto('/');

  // Wait for the parity computation to complete
  const matrixParityStatus = page.locator('.parity-status');
  await expect(matrixParityStatus).toHaveText('PASS', { timeout: 10000 });

  const sortParityStatus = page.locator('.sort-parity-status');
  await expect(sortParityStatus).toHaveText('PASS', { timeout: 10000 });

  const sha256ParityStatus = page.locator('.sha256-parity-status');
  await expect(sha256ParityStatus).toHaveText('PASS', { timeout: 10000 });

  // Ensure JS and Wasm results exist and are identical for Matrix
  const jsResult = page.locator('.js-result');
  const wasmResult = page.locator('.wasm-result');
  
  const jsText = await jsResult.textContent();
  const wasmText = await wasmResult.textContent();
  
  expect(jsText).toBeTruthy();
  expect(jsText).not.toBe('JS: Computing...');
  expect(jsText?.replace('JS: ', '')).toEqual(wasmText?.replace('Wasm: ', ''));
});
