import { test, expect } from '@playwright/test';

test.describe('WASWIT Phase 4B Evaluation', () => {
  // Use a longer timeout for full suite
  test.setTimeout(120000);

  test('executes independent evaluations for all workloads', async ({ page }) => {
    await page.goto('/');

    const workloads = [
      { name: 'Matrix Multiplication', grid: '75, 175, 275' },
      { name: 'Merge Sort', grid: '1500, 2500, 3500' },
      { name: 'SHA-256', grid: '1250, 5000, 10000' }
    ];

    for (const wl of workloads) {
      // 1. Select workload
      await page.getByRole('button', { name: wl.name }).click();

      // 2. Confirm Evaluation Control is enabled
      const evalHeader = page.getByRole('heading', { name: 'Phase 4B: Independent Evaluation' });
      await expect(evalHeader).toBeVisible();

      // Ensure the test policy is loaded
      await expect(page.getByText('Evaluation Test Policy Loaded')).toBeVisible();

      // 3. Start evaluation
      const runButton = page.getByRole('button', { name: 'Run Independent Evaluation' });
      await expect(runButton).toBeEnabled();
      await runButton.click();

      // 4. Wait for completion (status becomes Completed)
      // We look for the "Completed" badge in the UI
      const statusBadge = page.locator('span', { hasText: 'Completed' }).first();
      await expect(statusBadge).toBeVisible({ timeout: 60000 });

      // 5. Verify result data appears in the tables
      // E.g. we should see some numbers, and the grid sizes should be represented
      const gridSizes = wl.grid.split(',').map(s => s.trim());
      for (const size of gridSizes) {
        await expect(page.getByRole('cell', { name: size, exact: true }).first()).toBeVisible();
      }

      // 6. Verify export control becomes available
      const exportButton = page.getByRole('button', { name: 'Export JSON' });
      await expect(exportButton).toBeVisible();
      await expect(exportButton).toBeEnabled();
    }
  });
});
