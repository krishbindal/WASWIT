import { test, expect } from '@playwright/test';

test('WASWIT application computes Matrix Multiplication parity correctly', async ({ page }) => {
  await page.goto('/');

  // Wait for the parity computation to complete
  const parityStatus = page.locator('.parity-status');
  await expect(parityStatus).toHaveText('PASS', { timeout: 10000 });

  // Ensure JS and Wasm results exist and are identical
  const jsResult = page.locator('.js-result');
  const wasmResult = page.locator('.wasm-result');
  
  const jsText = await jsResult.textContent();
  const wasmText = await wasmResult.textContent();
  
  expect(jsText).toBeTruthy();
  expect(jsText).not.toBe('Computing...');
  expect(jsText).toEqual(wasmText);
});
