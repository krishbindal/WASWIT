import { test, expect } from '@playwright/test';

test.describe('Developer Playground', () => {
  test('loads and executes a sort workload correctly', async ({ page }) => {
    await page.goto('/developer');
    
    // Verify page title / headers
    await expect(page.locator('h1')).toContainText('WASWIT Developer Integration');
    
    // Select Sort workload
    const select = page.locator('select');
    await select.selectOption('sort');
    
    // Set input size to 10
    const input = page.locator('input[type="number"]');
    await input.fill('10');
    
    // Run
    const runBtn = page.getByRole('button', { name: /Run with WASWIT/i });
    await runBtn.click();
    
    // Wait for result to appear
    await expect(page.locator('text=Selected Runtime')).toBeVisible({ timeout: 5000 });
    
    // The policy defaults sort to wasm
    await expect(page.locator('text=wasm').first()).toBeVisible();
  });
  
  test('displays limitations text indicating no AI', async ({ page }) => {
    await page.goto('/developer');
    
    // Verify constraints are visible
    const text = await page.textContent('body');
    expect(text).toContain('does not use machine learning');
    expect(text).toContain('empirical frozen policy');
  });
});
