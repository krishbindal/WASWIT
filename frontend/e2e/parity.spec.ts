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

  // Ensure JS and Wasm results exist and are identical for Sort
  const sortJsResult = page.locator('.sort-js-result');
  const sortWasmResult = page.locator('.sort-wasm-result');
  const sortJsText = await sortJsResult.textContent();
  const sortWasmText = await sortWasmResult.textContent();
  
  expect(sortJsText).toBeTruthy();
  expect(sortJsText).not.toBe('JS: Computing...');
  expect(sortJsText?.replace('JS: ', '')).toEqual(sortWasmText?.replace('Wasm: ', ''));

  // Ensure JS and Wasm results exist and are identical for SHA256
  const sha256JsResult = page.locator('.sha256-js-result');
  const sha256WasmResult = page.locator('.sha256-wasm-result');
  const sha256JsText = await sha256JsResult.textContent();
  const sha256WasmText = await sha256WasmResult.textContent();

  expect(sha256JsText).toBeTruthy();
  expect(sha256JsText).not.toBe('JS: Computing...');
  expect(sha256JsText?.replace('JS: ', '')).toEqual(sha256WasmText?.replace('Wasm: ', ''));
});
