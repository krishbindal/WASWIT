import { test, expect } from '@playwright/test';

test('Executable path', async ({ browser }) => {
    console.log("browser type:", browser.browserType().name());
    console.log("browser type executablePath:", browser.browserType().executablePath());
});
