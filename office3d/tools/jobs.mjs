import fs from 'fs';
import { ROLES, FAST } from '../src/manifest.js';
const names = [...new Set(Object.values(ROLES).flat())];
const jobs = [];
for (const g of ['m', 'f']) for (const n of names) {
  const f = `raw/anim/${g}_${n}.fbx`;
  if (!fs.existsSync(f)) { console.log('MISSING', f); continue; }
  jobs.push({ kind: 'anim', name: `${g}_${n}`, url: '/' + f, opts: FAST.includes(n) ? { fps: 30 } : { fps: 20, maxDur: 12 } });
}
fs.writeFileSync('build/jobs_final.json', JSON.stringify(jobs));
console.log(jobs.length, 'jobs');
