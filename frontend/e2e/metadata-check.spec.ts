import { test, expect } from '@playwright/test';
import * as os from 'os';

test('Metadata check', async ({ browser, browserName }) => {
    const ctx = await browser.newContext();
    const p = await ctx.newPage();
    await p.goto('about:blank');
    const navMeta = await p.evaluate(() => {
        return {
            ua: navigator.userAgent,
            brands: (navigator as any).userAgentData?.brands,
        };
    });
    
    console.log("browserName:", browserName);
    console.log("browser.version():", browser.version());
    console.log("navigator.userAgent:", navMeta.ua);
    console.log("brands:", JSON.stringify(navMeta.brands));
    console.log("os.type():", os.type());
    console.log("os.release():", os.release());
    console.log("os.platform():", os.platform());
    await ctx.close();
});
