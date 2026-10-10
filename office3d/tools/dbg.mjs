import { open } from './run.mjs';
const code = process.argv[2];
const { browser, page } = await open('/app/dev.html?nointro&shot', { viewport: { width: 800, height: 500 } });
await page.waitForFunction('window.__office && document.body.classList.contains("ready")', null, { timeout: 180000 });
const r = await page.evaluate(code);
console.log(typeof r === 'string' ? r : JSON.stringify(r, null, 0));
await browser.close();
