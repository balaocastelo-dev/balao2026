import { open } from './run.mjs';
const q = process.argv[2] || '&q=high&pr=1&hora=tarde';
const { browser, page } = await open('/app/dev.html?nointro&shot' + q, { viewport: { width: 1600, height: 900 } });

await page.waitForFunction('window.__office && document.body.classList.contains("ready")', null, { timeout: 180000 });
if (process.argv[3]) await page.evaluate('window.__hide=1');
const r = await page.evaluate(async () => { const o = window.__office; o.renderer.setAnimationLoop(null); const t = []; if (window.__hide) o.world.lamps.forEach(l => l.visible = false); for (let i = 0; i < 4; i++) { const a = performance.now(); o.frame(1/30); { const gl = o.renderer.getContext(); gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array(4)); } t.push(Math.round(performance.now() - a)); }
  const i = o.renderer.info; return { t, calls: i.render.calls, tris: i.render.triangles, lamps: o.world.lamps.length, vis: o.world.lamps.filter(l => l.visible).length, types: o.world.lamps.reduce((m, l) => (m[l.type] = (m[l.type] || 0) + 1, m), {}), progs: i.programs.length }; });
console.log(JSON.stringify(r));
await browser.close();
