import { test, expect } from '@playwright/test';

test('WASWIT application loads and displays correct metadata and headings', async ({ page }) => {
  // Navigate to the root
  await page.goto('/');

  // Verify the title
  await expect(page).toHaveTitle(/WASWIT/);

  // Verify the main heading is visible
  const heading = page.getByRole('heading', { name: 'WASWIT' });
  await expect(heading).toBeVisible();

});
