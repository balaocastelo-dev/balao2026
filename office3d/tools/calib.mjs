import { open } from './run.mjs';
import fs from 'fs';
const [id, cmd, ffs, prop, out, variantsJson, dist] = process.argv.slice(2);
const variants = JSON.parse(variantsJson);
const { browser, page } = await open('/app/dev.html?nointro&shot', { viewport: { width: 520, height: 520 } });
await page.waitForFunction('window.__office && document.body.classList.contains("ready")', null, { timeout: 180000 });
const info = await page.evaluate(([id, cmd, ffs]) => { const o = window.__office; const a = o.sim.byId.get(id); o.sim.nextMeeting = 1e9; o.sim.command(a, cmd); o.ff(+ffs); document.querySelectorAll('.panel,#labels').forEach(e => e.style.display = 'none'); o.sim.paused = true; return { status: a.status, role: a.curRole, clip: a.curName, t: a.cur.time, prop: a.props.cur }; }, [id, cmd, ffs]);
console.log(JSON.stringify(info));
const files = [];
for (let i = 0; i < variants.length; i++) for (const side of [0, 1]) {
  await page.evaluate(([id, prop, v, side, dist]) => { const o = window.__office; const a = o.sim.byId.get(id); const c = o.sim.propCfg[prop]; c.pos = v.pos; c.rot = v.rot; if (v.hand) c.hand = v.hand; a.props.cur = null; a.setProp(prop); const f = [Math.sin(a.yaw), Math.cos(a.yaw)]; const r = [Math.cos(a.yaw), -Math.sin(a.yaw)]; const d = +dist || 1.0; const h = a.headPos; const cx = side ? h.x - r[0] * d * (v.hand === 'L' ? -1 : 1) + f[0] * 0.25 : h.x + f[0] * d; const cz = side ? h.z - r[1] * d * (v.hand === 'L' ? -1 : 1) + f[1] * 0.25 : h.z + f[1] * d; o.view([cx, h.y - 0.02, cz], [h.x, h.y - (prop === 'cup' ? 0.22 : 0.05), h.z], 40); }, [id, prop, variants[i], side, dist]);
  await page.waitForTimeout(450); const f = `${out}_${i}_${side}.png`; await page.screenshot({ path: f }); files.push(f);
}
await browser.close(); fs.writeFileSync(out + '.list', files.join('\n'));
