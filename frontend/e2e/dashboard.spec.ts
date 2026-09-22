import { test, expect } from '@playwright/test';

test.describe('WASWIT Phase 4A Dashboard', () => {
  test('dashboard renders completely with empty states by default', async ({ page }) => {
    await page.goto('/');

    // Verify main headers
    await expect(page.getByRole('heading', { name: 'Research Dashboard' })).toBeVisible();
    await expect(page.getByText('Phase 3 Certified')).toBeVisible();
    await expect(page.getByText('Phase 4A UI')).toBeVisible();

    // Verify Workload Selector
    await expect(page.getByRole('button', { name: 'Matrix Multiplication' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Merge Sort' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'SHA-256' })).toBeVisible();

    // Select Matrix
    await page.getByRole('button', { name: 'Matrix Multiplication' }).click();
    await expect(page.getByRole('heading', { name: 'matrix Workload' })).toBeVisible();
    await expect(page.getByText('Dense floating-point arithmetic (O(N³)).')).toBeVisible();
    
    // Select Sort
    await page.getByRole('button', { name: 'Merge Sort' }).click();
    await expect(page.getByRole('heading', { name: 'sort Workload' })).toBeVisible();

    // Verify multiple empty states
    // We expect "No experimental results available yet" multiple times (Policy, Table, Metadata, Calibration, Chart, Raw)
    const emptyStates = page.getByText('No experimental results available yet');
    const count = await emptyStates.count();
    expect(count).toBeGreaterThanOrEqual(4); // At least 4 components show this
  });
});
