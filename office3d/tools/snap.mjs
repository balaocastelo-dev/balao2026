// usage: node tools/snap.mjs <out.jpg> [json: {ff, view:[p,t,fov], mode, wait, w, h, js}]
import { open } from './run.mjs';
const out = process.argv[2]; const o = JSON.parse(process.argv[3] || '{}');
const { browser, page } = await open((o.url || '/app/dev.html') + '?nointro&shot' + (o.q || ''), { viewport: { width: o.w || 1280, height: o.h || 720 }, base: o.base });
try {
  await page.waitForFunction('window.__office && document.body.classList.contains("ready")', null, { timeout: 180000 });
  if (o.ff) await page.evaluate((s) => window.__office.ff(s), o.ff);
  if (o.mode) await page.evaluate((m) => window.__office.setMode(m, { force: true }), o.mode);
  if (o.view) await page.evaluate((v) => window.__office.view(v[0], v[1], v[2]), o.view);
  if (o.js) console.log('js:', JSON.stringify(await page.evaluate(o.js)));
  await page.evaluate((n) => window.__office.still(n), o.frames || 2);
  await page.waitForTimeout(o.wait || 300);
  if (o.js2) console.log('js2:', JSON.stringify(await page.evaluate(o.js2)));
  await page.screenshot({ path: out, type: 'jpeg', quality: 86 });
} catch (e) { console.log('ERR', e.message.slice(0, 500)); try { await page.screenshot({ path: out, type: 'jpeg', quality: 70 }); } catch (e2) {} }
await browser.close();
