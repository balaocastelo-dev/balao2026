// Time-of-day lighting. Keyframes are interpolated by the hour (0..24).
import * as THREE from 'three';
const C = (h) => new THREE.Color(h);
// h, sun direction, sun colour, sun intensity, hemisphere sky/ground/intensity, lamps (0..1), env intensity, background top/bottom, ground tint, exposure, sky panel id, beams
const KEYS = [
  { h: 0.0, dir: [-0.10, 1.0, 0.16], sun: 0xfff0dc, si: 1.2, sky: 0xa9bbdc, gnd: 0x5f564d, hi: 0.62, lamp: 1.4, env: 0.26, gt: 0.17, top: 0x0a1220, bot: 0x1b2433, exp: 1.12, pan: 2, beam: 0 },
  { h: 5.2, dir: [-0.10, 1.0, 0.16], sun: 0xfff0dc, si: 1.2, sky: 0xa9bbdc, gnd: 0x5f564d, hi: 0.62, lamp: 1.4, env: 0.26, gt: 0.17, top: 0x0a1220, bot: 0x1b2433, exp: 1.12, pan: 2, beam: 0 },
  { h: 6.6, dir: [0.92, 0.36, 0.42], sun: 0xffc79c, si: 1.9, sky: 0xffdcc2, gnd: 0xb8aa9c, hi: 0.8, lamp: 0.5, env: 0.34, top: 0x9fc3e8, bot: 0xf7dcc6, exp: 1.0, gt: 0.7, pan: 1, beam: 0 },
  { h: 9.0, dir: [0.72, 0.82, 0.56], sun: 0xfff1de, si: 2.9, sky: 0xf2f6ff, gnd: 0xcfc8bd, hi: 1.0, lamp: 0.2, env: 0.42, top: 0xbdd9f2, bot: 0xeef3f6, exp: 1.0, gt: 1.0, pan: 0, beam: 0 },
  { h: 12.5, dir: [0.08, 1.0, 0.46], sun: 0xffffff, si: 3.2, sky: 0xffffff, gnd: 0xcfc8bd, hi: 1.0, lamp: 0.16, env: 0.44, top: 0xc3dcf3, bot: 0xeef3f6, exp: 1.0, gt: 1.0, pan: 0, beam: 0.25 },
  { h: 15.5, dir: [-0.45, 0.86, 0.5], sun: 0xfff1dc, si: 3.1, sky: 0xffffff, gnd: 0xcfc8bd, hi: 1.0, lamp: 0.2, env: 0.42, top: 0xcfe3f3, bot: 0xeef3f6, exp: 1.0, gt: 1.0, pan: 0, beam: 0.7 },
  { h: 17.5, dir: [-0.86, 0.46, 0.4], sun: 0xffb469, si: 2.9, sky: 0xffd9b5, gnd: 0xc9b39f, hi: 0.82, lamp: 0.55, env: 0.36, top: 0x8fb2dc, bot: 0xffc79a, exp: 1.0, gt: 0.86, pan: 1, beam: 1 },
  { h: 18.5, dir: [-0.9, 0.3, 0.34], sun: 0xff8d5c, si: 1.5, sky: 0xdcc0c0, gnd: 0x8f8078, hi: 0.7, lamp: 0.95, env: 0.3, top: 0x3d4f78, bot: 0xf09a78, exp: 1.02, gt: 0.5, pan: 1, beam: 0.6 },
  { h: 19.4, dir: [-0.10, 1.0, 0.16], sun: 0xfff0dc, si: 1.2, sky: 0xa9bbdc, gnd: 0x5f564d, hi: 0.62, lamp: 1.4, env: 0.26, gt: 0.17, top: 0x0a1220, bot: 0x1b2433, exp: 1.12, pan: 2, beam: 0 },
  { h: 24.0, dir: [-0.10, 1.0, 0.16], sun: 0xfff0dc, si: 1.2, sky: 0xa9bbdc, gnd: 0x5f564d, hi: 0.62, lamp: 1.4, env: 0.26, gt: 0.17, top: 0x0a1220, bot: 0x1b2433, exp: 1.12, pan: 2, beam: 0 },
];
export const PRESETS = { auto: null, manha: 9.5, tarde: 15.5, por: 17.6, noite: 21 };
export const PRESET_LABELS = { auto: 'Hora real', manha: 'Manhã', tarde: 'Tarde', por: 'Pôr do sol', noite: 'Noite' };
const tmpA = new THREE.Color(), tmpB = new THREE.Color();
export function dayState(hour, out = {}) {
  let i = 0; while (i < KEYS.length - 2 && hour >= KEYS[i + 1].h) i++;
  const a = KEYS[i], b = KEYS[i + 1]; let t = (hour - a.h) / Math.max(1e-6, b.h - a.h); t = t * t * (3 - 2 * t);
  const L = (k) => a[k] + (b[k] - a[k]) * t; const col = (k, o) => (o || new THREE.Color()).copy(tmpA.set(a[k])).lerp(tmpB.set(b[k]), t);
  out.dir = (out.dir || new THREE.Vector3()).set(a.dir[0] + (b.dir[0] - a.dir[0]) * t, a.dir[1] + (b.dir[1] - a.dir[1]) * t, a.dir[2] + (b.dir[2] - a.dir[2]) * t).normalize();
  out.sun = col('sun', out.sun); out.si = L('si'); out.sky = col('sky', out.sky); out.gnd = col('gnd', out.gnd); out.hi = L('hi'); out.lamp = L('lamp'); out.env = L('env'); out.top = col('top', out.top); out.bot = col('bot', out.bot); out.exp = L('exp'); out.gt = L('gt'); out.beam = L('beam');
  out.pan = t < 0.5 ? a.pan : b.pan; out.night = out.lamp > 1.2 && a.pan === 2 && b.pan === 2; out.hour = hour;
  return out;
}
export function realHour() { const d = new Date(); return d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600; }
