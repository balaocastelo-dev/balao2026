// long simulated run with mode switches, events and sound; reports errors and stuck agents
import { open } from './run.mjs';
const minutes = +(process.argv[2] || 20); const q = process.argv[3] || '&q=high&pr=0.4&hora=tarde';
const { browser, page } = await open((process.env.PAGE || '/app/dev.html') + '?nointro&shot' + q, { viewport: { width: 900, height: 560 }, base: process.env.BASE });
let errs = 0; page.on('pageerror', () => errs++); page.on('console', m => { if (m.type() === 'error') errs++; });
await page.waitForFunction('window.__office && document.body.classList.contains("ready")', null, { timeout: 240000 });
const r = await page.evaluate(async (minutes) => {
  const o = window.__office; o.renderer.setAnimationLoop(null); try { o.ui.toggleSound(); } catch (e) { console.error('sound', e.message); }
  const modes = ['overview', 'fpv', 'tour', 'cctv', 'maquete', 'overview', 'follow']; const times = ['manha', 'tarde', 'por', 'noite', 'auto'];
  const stuck = new Map(); const report = { away: 0, samples: 0, stuck: [], meetings: 0, maxSame: 0, bubbles: 0, modes: {} }; let lastMeeting = false;
  for (let i = 0; i < minutes * 6; i++) {
    const m = modes[i % modes.length]; o.setMode(m, { force: true }); report.modes[m] = (report.modes[m] || 0) + 1;
    if (i % 5 === 0) o.setTime(times[(i / 5) % times.length | 0]);
    if (i % 7 === 3) o.officeEvent({ type: 'pedido', titulo: 'teste ' + i });
    if (i % 11 === 5) o.officeEvent({ type: 'servidor', carga: 0.95 }); if (i % 11 === 8) o.officeEvent({ type: 'servidor', status: 'ok' });
    if (i % 13 === 6) o.officeEvent({ type: 'mensagem', agente: 'julia', texto: 'Cliente perguntou do prazo de entrega' });
    if (i % 17 === 9) o.ui.meeting();
    if (i % 9 === 4) { const a = o.sim.agents[i % o.sim.agents.length]; o.ui.select(a); o.sim.command(a, ['coffee', 'president', 'phone', 'home', 'visit'][i % 5]); }
    if (i % 19 === 2) o.setQuality(o.st.quality === 'high' ? 'low' : 'high');
    o.skip(10, 1 / 20);
    if (i % 6 === 0) o.still(1);
    const away = o.sim.agents.filter(a => a.state !== 'seated' || a.busy).length; report.away += away; report.samples++;
    report.bubbles += o.sim.agents.filter(a => a.bubble).length;
    if (!!o.sim.meeting && !lastMeeting) report.meetings++; lastMeeting = !!o.sim.meeting;
    for (const a of o.sim.agents) { const key = a.state + '|' + a.status.text + '|' + a.pos.x.toFixed(1) + '|' + a.pos.z.toFixed(1); const s = stuck.get(a.id) || { key: '', n: 0 }; if (s.key === key && a.state !== 'seated') s.n++; else { s.key = key; s.n = 0; } stuck.set(a.id, s); report.maxSame = Math.max(report.maxSame, s.n); if (s.n === 9) report.stuck.push(a.def.name + ': ' + key); }
    await new Promise(r => setTimeout(r, 0));
  }
  report.away = +(report.away / report.samples).toFixed(2); report.simTime = Math.round(o.sim.time); report.final = o.sim.agents.map(a => a.def.id + ':' + a.state).join(' ');
  for (const a of o.sim.agents) { if (!isFinite(a.pos.x) || !isFinite(a.pos.z)) report.stuck.push('NaN ' + a.def.id); if (a.pos.x < -18.2 || a.pos.x > 21 || Math.abs(a.pos.z) > 8.7) report.stuck.push('out ' + a.def.id + ' ' + a.pos.x.toFixed(1) + ',' + a.pos.z.toFixed(1)); }
  return report;
}, minutes);
console.log(JSON.stringify(r, null, 1)); console.log('errors:', errs);
await browser.close();
