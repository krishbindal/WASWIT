import { test, expect } from '@playwright/test';

test('CDP Verification', async ({ browser, browserName }) => {
    // We must connect to the browser CDP session
    // Note: browser.newBrowserCDPSession() might not exist in all playwright versions, but page.context().newCDPSession(page) does.
    // Wait, Playwright has browser.newBrowserCDPSession() in newer versions for Chromium.
    
    let cdp;
    try {
        cdp = await (browser as any).newBrowserCDPSession();
    } catch (e) {
        console.error("Failed to get browser CDP session, trying page CDP session...");
    }

    const ctx = await browser.newContext();
    const p = await ctx.newPage();
    
    if (!cdp) {
        cdp = await ctx.newCDPSession(p);
    }
    
    const version = await cdp.send('Browser.getVersion');
    
    await p.goto('about:blank');
    const navMeta = await p.evaluate(() => {
        return {
            ua: navigator.userAgent,
            brands: (navigator as any).userAgentData?.brands,
        };
    });

    console.log("--- CDP VERIFICATION ---");
    console.log("browserName:", browserName);
    console.log("browser.version():", browser.version());
    console.log("CDP product:", version.product);
    console.log("CDP revision:", version.revision);
    console.log("CDP userAgent:", version.userAgent);
    console.log("CDP jsVersion:", version.jsVersion);
    console.log("CDP protocolVersion:", version.protocolVersion);
    console.log("navigator.userAgent:", navMeta.ua);
    console.log("brands:", JSON.stringify(navMeta.brands));

    await ctx.close();
});
