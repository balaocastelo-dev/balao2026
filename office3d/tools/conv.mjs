// usage: node tools/conv.mjs avatar <Name> <fbxUrlPath> | anim <outName> <fbxUrlPath> [json opts]
import fs from 'fs'; import path from 'path';
import { open } from './run.mjs';
const jobs = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const { browser, page } = await open('/tools/convert.html');
await page.waitForFunction('window.ready');
for (const j of jobs) {
  const dir = path.join('build/pack', j.kind === 'avatar' ? 'av' : 'an', j.name);
  if (fs.existsSync(path.join(dir, 'meta.json')) && !process.env.FORCE) continue;
  try {
    const r = await page.evaluate(([k, u, o]) => k === 'avatar' ? window.avatarPack(u) : window.animPack(u, o), [j.kind, j.url, j.opts || {}]);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify(r.meta));
    let tot = 0; for (const [n, b] of Object.entries(r.bufs)) { const buf = Buffer.from(b, 'base64'); tot += buf.length; fs.writeFileSync(path.join(dir, n), buf); }
    if (j.kind === 'avatar') console.log('avatar', j.name, 'verts', r.meta.verts, 'tris', r.meta.tris, 'bones', r.meta.bones.length, 'skel', r.meta.skel.length, 'mats', JSON.stringify(r.meta.matInfo), 'h', r.meta.height.toFixed(1), 'uv', r.meta.uvRange.map(v => v.toFixed(2)), 'bytes', tot, r.meta.warn.join(';'));
    else console.log('anim', j.name, 'dur', r.meta.duration.toFixed(2), '/', r.meta.srcDuration.toFixed(2), 'frames', r.meta.frames, 'missing', r.meta.missing.join(','), 'root0', r.meta.root0.map(v => v.toFixed(1)), 'end', r.meta.rootEnd.map(v => v.toFixed(1)), 'bytes', tot, 'blink', JSON.stringify(r.meta.face.Bip01_LEyeBlinkTop || null));
  } catch (e) { console.log('FAIL', j.name, e.message.slice(0, 300)); }
}
await browser.close();
