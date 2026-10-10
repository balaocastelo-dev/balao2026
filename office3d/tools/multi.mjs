// usage: node tools/multi.mjs '<query>' '<json steps>'   step: {name, ff, mode, view, js, hud, frames, opt, w, h}
import { open } from './run.mjs';
const q = process.argv[2] || ''; const steps = JSON.parse(process.argv[3]);
const vp = { width: +(process.env.W || 1280), height: +(process.env.H || 720) };
const { browser, page } = await open((process.env.PAGE || '/app/dev.html') + '?nointro&shot' + q, { viewport: vp, base: process.env.BASE });
try {
  await page.waitForFunction('window.__office && document.body.classList.contains("ready")', null, { timeout: 240000 });
  await page.evaluate(() => window.__office.renderer.setAnimationLoop(null));
  for (const s of steps) {
    const t0 = Date.now();
    if (s.ff) await page.evaluate((x) => window.__office.ff(x), s.ff);
    if (s.mode) await page.evaluate((m) => window.__office.setMode(m, { force: true, home: true }), s.mode);
    if (s.view) await page.evaluate((v) => window.__office.view(v[0], v[1], v[2]), s.view);
    await page.evaluate((h) => document.body.classList.toggle('nohud', !h), !!s.hud);
    if (s.js) { const r = await page.evaluate(s.js); if (r !== undefined && r !== null) console.log(s.name, 'js:', JSON.stringify(r)); }
    await page.evaluate((n) => window.__office.still(n), s.frames || 2);
    if (s.js2) { const r = await page.evaluate(s.js2); if (r !== undefined) console.log(s.name, 'js2:', JSON.stringify(r)); }
    await page.waitForTimeout(150);
    await page.screenshot({ path: `build/${s.name}.jpg`, type: 'jpeg', quality: 85 });
    console.log('shot', s.name, Date.now() - t0, 'ms');
  }
} catch (e) { console.log('ERR', e.message.slice(0, 600)); }
await browser.close();
