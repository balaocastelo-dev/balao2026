import { open } from './run.mjs';
const [id, cmd, ffs, out] = process.argv.slice(2);
const { browser, page } = await open('/app/dev.html?nointro&shot', { viewport: { width: 1100, height: 700 } });
await page.waitForFunction('window.__office && document.body.classList.contains("ready")', null, { timeout: 180000 });
const info = await page.evaluate(([id, cmd, ffs]) => { const o = window.__office; const a = o.sim.byId.get(id); o.sim.nextMeeting = 1e9; o.sim.command(a, cmd); o.ff(+ffs); document.querySelectorAll('.panel,#labels').forEach(e => e.style.display = 'none'); const f = [Math.sin(a.yaw), Math.cos(a.yaw)]; const r = [Math.cos(a.yaw), -Math.sin(a.yaw)]; o.sim.paused = true; window.__views = [[[a.pos.x + f[0] * 1.5, 1.45, a.pos.z + f[1] * 1.5], [a.pos.x, 1.35, a.pos.z]], [[a.pos.x + r[0] * 1.5, 1.45, a.pos.z + r[1] * 1.5], [a.pos.x, 1.35, a.pos.z]], [[a.pos.x - r[0] * 1.5 + f[0] * 0.5, 1.5, a.pos.z - r[1] * 1.5 + f[1] * 0.5], [a.pos.x, 1.35, a.pos.z]]]; return { status: a.status, role: a.curRole, clip: a.curName, state: a.state, prop: a.props.cur, pos: a.pos.toArray() }; }, [id, cmd, ffs]);
console.log(JSON.stringify(info));
for (let i = 0; i < 3; i++) { await page.evaluate((i) => { const v = window.__views[i]; window.__office.view(v[0], v[1], 42); }, i); await page.waitForTimeout(700); await page.screenshot({ path: `${out}_${i}.jpg`, type: 'jpeg', quality: 85 }); }
await browser.close();
