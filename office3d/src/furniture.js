// Procedural furniture library. Every piece is a Group whose "front" faces +Z, origin on the floor.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import * as T from './tex.js';

const mats = new Map();
export function M(key, make) { if (!mats.has(key)) { const m = make(); m.name = key; mats.set(key, m); } return mats.get(key); }
export const allMaterials = () => [...mats.values()];
const std = (color, rough = 0.7, metal = 0, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, ...extra });
export const MAT = {
  white: () => M('white', () => std(0xf4f4f2, 0.55)),
  black: () => M('black', () => std(0x1b1d21, 0.55, 0.1)),
  blackMetal: () => M('blackMetal', () => std(0x202227, 0.38, 0.75)),
  steel: () => M('steel', () => std(0xb9bec6, 0.32, 0.9)),
  chrome: () => M('chrome', () => std(0xdfe3e8, 0.15, 1)),
  wood: () => M('wood', () => std(0xc9a57a, 0.6)),
  oak: () => M('oak', () => std(0xd9bd93, 0.62)),
  walnut: () => M('walnut', () => std(0x5b3d2a, 0.5)),
  darkWood: () => M('darkWood', () => std(0x33241b, 0.45)),
  leather: () => M('leather', () => std(0x2a211c, 0.42)),
  leatherTan: () => M('leatherTan', () => std(0x8a5a3a, 0.5)),
  fabricGray: () => M('fabricGray', () => std(0x6f757d, 0.95)),
  fabricDark: () => M('fabricDark', () => std(0x30343b, 0.95)),
  fabricRed: () => M('fabricRed', () => std(0xc9282e, 0.9)),
  fabricBeige: () => M('fabricBeige', () => std(0xd9d2c5, 0.95)),
  fabricBlue: () => M('fabricBlue', () => std(0x33506e, 0.95)),
  plastic: () => M('plastic', () => std(0xe6e8ea, 0.5)),
  rubber: () => M('rubber', () => std(0x111214, 0.9)),
  screenOff: () => M('screenOff', () => std(0x08090b, 0.2, 0.2)),
  leaf: () => M('leaf', () => std(0x3f7d4c, 0.8, 0, { side: THREE.DoubleSide })),
  leafDark: () => M('leafDark', () => std(0x2c6140, 0.8, 0, { side: THREE.DoubleSide })),
  pot: () => M('pot', () => std(0xe9e6e0, 0.7)),
  potDark: () => M('potDark', () => std(0x3a3d42, 0.7)),
  soil: () => M('soil', () => std(0x3b2d22, 1)),
  paper: () => M('paper', () => std(0xfafafa, 0.9)),
  brass: () => M('brass', () => std(0xc7a25a, 0.3, 0.9)),
  red: () => M('red', () => std(0xed3237, 0.5)),
  glassDark: () => M('glassDark', () => std(0x16191d, 0.08, 0.3)),
  color: (hex, rough = 0.7, metal = 0) => M('c' + hex + '_' + rough + '_' + metal, () => std(hex, rough, metal)),
  emissive: (hex, intensity = 1) => M('e' + hex + '_' + intensity, () => { const m = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: hex, emissiveIntensity: intensity, roughness: 0.4 }); m.userData.bloom = true; return m; }),
  basic: (hex) => M('b' + hex, () => new THREE.MeshBasicMaterial({ color: hex })),
};
export function texMat(key, canvasOrTex, { emissive = false, rough = 0.6, intensity = 1, transparent = false } = {}) {
  return M('t:' + key, () => { const map = canvasOrTex.isTexture ? canvasOrTex : T.toTex(canvasOrTex); if (emissive) { const v = Math.round(225 * Math.min(1, intensity)); const m = new THREE.MeshBasicMaterial({ map, toneMapped: false, color: new THREE.Color(`rgb(${v},${v},${v})`) }); m.userData.bloom = true; return m; } return new THREE.MeshStandardMaterial({ map, roughness: rough, metalness: 0, transparent }); });
}

const geo = new Map();
const G = (k, f) => { if (!geo.has(k)) geo.set(k, f()); return geo.get(k); };
export function box(w, h, d, mat, x = 0, y = 0, z = 0, opt = {}) {
  const g = opt.r ? G(`rb${w}_${h}_${d}_${opt.r}`, () => new RoundedBoxGeometry(w, h, d, 3, Math.min(opt.r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001))) : G(`b${w}_${h}_${d}`, () => new THREE.BoxGeometry(w, h, d));
  const m = new THREE.Mesh(g, mat); m.position.set(x, y, z); m.castShadow = opt.cast !== false; m.receiveShadow = opt.receive !== false; return m;
}
export function cyl(rt, rb, h, mat, x = 0, y = 0, z = 0, seg = 20, opt = {}) {
  const m = new THREE.Mesh(G(`c${rt}_${rb}_${h}_${seg}`, () => new THREE.CylinderGeometry(rt, rb, h, seg)), mat); m.position.set(x, y, z); m.castShadow = opt.cast !== false; m.receiveShadow = true; return m;
}
export function plane(w, h, mat, x = 0, y = 0, z = 0) { const m = new THREE.Mesh(G(`p${w}_${h}`, () => new THREE.PlaneGeometry(w, h)), mat); m.position.set(x, y, z); m.receiveShadow = true; return m; }
const grp = (...ch) => { const g = new THREE.Group(); ch.forEach(c => c && g.add(c)); return g; };

// ---------------------------------------------------------------- desks
export function desk({ w = 1.6, d = 0.75, h = 0.74, top = MAT.white(), frame = MAT.blackMetal(), modesty = true, drawers = false } = {}) {
  const g = grp();
  g.add(box(w, 0.03, d, top, 0, h - 0.015, 0, { r: 0.008 }));
  for (const sx of [-1, 1]) { g.add(box(0.05, h - 0.03, 0.05, frame, sx * (w / 2 - 0.07), (h - 0.03) / 2, d / 2 - 0.08)); g.add(box(0.05, h - 0.03, 0.05, frame, sx * (w / 2 - 0.07), (h - 0.03) / 2, -d / 2 + 0.08)); g.add(box(0.05, 0.03, d - 0.12, frame, sx * (w / 2 - 0.07), 0.015, 0)); g.add(box(0.05, 0.04, d - 0.2, frame, sx * (w / 2 - 0.07), h - 0.05, 0)); }
  if (modesty) g.add(box(w - 0.2, 0.34, 0.018, frame, 0, h - 0.24, d / 2 - 0.1));
  if (modesty) { g.add(box(w * 0.55, 0.05, 0.11, MAT.color(0x2a2d33, 0.6, 0.3), 0, h - 0.1, d / 2 - 0.2, { cast: false })); g.add(box(0.014, h - 0.14, 0.014, MAT.rubber(), w / 2 - 0.1, (h - 0.14) / 2, d / 2 - 0.1, { cast: false })); g.add(box(0.26, 0.035, 0.06, MAT.white(), w / 2 - 0.3, 0.02, d / 2 - 0.12, { cast: false })); }
  if (drawers) { const dx = w / 2 - 0.3; g.add(box(0.4, 0.56, d - 0.2, MAT.white(), dx, 0.31, 0, { r: 0.01 })); for (let i = 0; i < 3; i++) g.add(box(0.14, 0.012, 0.012, frame, dx, 0.14 + i * 0.18, -(d - 0.2) / 2 - 0.008)); }
  g.userData.size = [w, d];
  return g;
}
export function execDesk() {
  // large executive desk, user sits at -Z side... (front = +Z faces visitors)
  const g = grp(); const w = 2.3, d = 1.0, h = 0.75;
  g.add(box(w + 0.06, 0.05, d + 0.04, MAT.walnut(), 0, h - 0.025, 0, { r: 0.012 }));
  g.add(box(w - 0.5, 0.012, d - 0.35, MAT.leather(), 0, h + 0.004, -0.05, { r: 0.004 }));   // leather inlay
  g.add(box(w - 0.1, h - 0.07, 0.04, MAT.darkWood(), 0, (h - 0.05) / 2, d / 2 - 0.06));      // front panel
  g.add(box(w - 0.3, 0.02, 0.012, MAT.brass(), 0, 0.42, d / 2 - 0.035));
  for (const sx of [-1, 1]) { g.add(box(0.5, h - 0.07, d - 0.14, MAT.darkWood(), sx * (w / 2 - 0.29), (h - 0.05) / 2, -0.02, { r: 0.01 })); for (let i = 0; i < 3; i++) { g.add(box(0.44, 0.19, 0.015, MAT.walnut(), sx * (w / 2 - 0.29), 0.13 + i * 0.21, -d / 2 + 0.045)); g.add(box(0.12, 0.012, 0.014, MAT.brass(), sx * (w / 2 - 0.29), 0.13 + i * 0.21, -d / 2 + 0.034)); } }
  g.userData.size = [w, d];
  return g;
}
export function officeChair({ fabric = MAT.fabricDark(), exec = false } = {}) {
  // origin at seat centre on the floor, faces +Z
  const g = grp(); const sh = 0.49; const fr = MAT.blackMetal();
  for (let i = 0; i < 5; i++) { const a = i * Math.PI * 2 / 5; const leg = box(0.045, 0.03, 0.3, fr, Math.sin(a) * 0.15, 0.075, Math.cos(a) * 0.15); leg.rotation.y = a; g.add(leg); g.add(cyl(0.028, 0.028, 0.045, MAT.rubber(), Math.sin(a) * 0.29, 0.028, Math.cos(a) * 0.29, 10)); }
  g.add(cyl(0.028, 0.035, sh - 0.14, MAT.chrome(), 0, (sh - 0.14) / 2 + 0.07, 0, 12));
  g.add(box(0.3, 0.035, 0.3, fr, 0, sh - 0.085, 0));
  g.add(box(exec ? 0.54 : 0.48, 0.085, exec ? 0.52 : 0.47, fabric, 0, sh - 0.042, 0, { r: 0.035 }));
  const bh = exec ? 0.78 : 0.52;
  const back = box(exec ? 0.52 : 0.45, bh, 0.075, fabric, 0, sh + 0.09 + bh / 2, exec ? -0.27 : -0.245, { r: 0.035 }); back.rotation.x = -0.1; g.add(back);
  const spine = box(0.06, 0.34, 0.03, fr, 0, sh + 0.08, -0.25); spine.rotation.x = -0.12; g.add(spine);
  if (exec) { const head = box(0.34, 0.16, 0.08, fabric, 0, sh + 0.09 + bh + 0.06, -0.345, { r: 0.035 }); head.rotation.x = -0.1; g.add(head); }
  for (const sx of [-1, 1]) { g.add(box(0.035, 0.2, 0.035, fr, sx * (exec ? 0.29 : 0.26), sh + 0.08, -0.05)); g.add(box(0.06, 0.03, 0.26, exec ? fabric : MAT.rubber(), sx * (exec ? 0.29 : 0.26), sh + 0.19, 0.0, { r: 0.012 })); }
  return g;
}
export function guestChair(fabric = MAT.fabricGray()) {
  const g = grp(); const sh = 0.49, fr = MAT.blackMetal();
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(cyl(0.014, 0.014, sh - 0.04, fr, sx * 0.21, (sh - 0.04) / 2, sz * 0.2, 8));
  g.add(box(0.48, 0.08, 0.46, fabric, 0, sh - 0.04, 0, { r: 0.03 }));
  const back = box(0.46, 0.4, 0.06, fabric, 0, sh + 0.26, -0.22, { r: 0.03 }); back.rotation.x = -0.12; g.add(back);
  for (const sx of [-1, 1]) g.add(box(0.02, 0.26, 0.02, fr, sx * 0.19, sh + 0.08, -0.2));
  return g;
}
export function stool(fabric = MAT.oak()) {
  const g = grp(); g.add(cyl(0.17, 0.17, 0.04, fabric, 0, 0.74, 0, 20)); g.add(cyl(0.02, 0.02, 0.7, MAT.blackMetal(), 0, 0.37, 0, 10)); g.add(cyl(0.2, 0.22, 0.02, MAT.blackMetal(), 0, 0.01, 0, 20));
  const ring = new THREE.Mesh(G('stoolring', () => new THREE.TorusGeometry(0.14, 0.01, 6, 20)), MAT.blackMetal()); ring.rotation.x = Math.PI / 2; ring.position.y = 0.28; g.add(ring); return g;
}
export function sofa({ w = 1.9, fabric = MAT.fabricGray(), legs = MAT.oak() } = {}) {
  const g = grp(); const d = 0.86;
  g.add(box(w, 0.14, d, fabric, 0, 0.22, 0, { r: 0.04 }));
  const n = w > 1.5 ? (w > 2.4 ? 3 : 2) : 1; const cw = (w - 0.36) / n;
  for (let i = 0; i < n; i++) { g.add(box(cw - 0.02, 0.16, d - 0.26, fabric, -w / 2 + 0.18 + cw * (i + 0.5), 0.36, 0.08, { r: 0.05 })); const b = box(cw - 0.02, 0.4, 0.17, fabric, -w / 2 + 0.18 + cw * (i + 0.5), 0.6, -d / 2 + 0.2, { r: 0.06 }); b.rotation.x = -0.14; g.add(b); }
  g.add(box(w, 0.5, 0.16, fabric, 0, 0.5, -d / 2 + 0.08, { r: 0.05 }));
  for (const sx of [-1, 1]) { g.add(box(0.17, 0.42, d, fabric, sx * (w / 2 - 0.085), 0.4, 0, { r: 0.05 })); for (const sz of [-1, 1]) g.add(cyl(0.022, 0.016, 0.15, legs, sx * (w / 2 - 0.12), 0.075, sz * (d / 2 - 0.1), 8)); }
  return g;
}
export function armchair(fabric = MAT.leatherTan()) { return sofa({ w: 0.92, fabric }); }
export function coffeeTable({ w = 1.1, d = 0.6, top = MAT.walnut() } = {}) {
  const g = grp(); g.add(box(w, 0.035, d, top, 0, 0.4, 0, { r: 0.012 })); for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(cyl(0.016, 0.012, 0.38, MAT.blackMetal(), sx * (w / 2 - 0.08), 0.19, sz * (d / 2 - 0.07), 8));
  g.add(box(0.26, 0.02, 0.19, MAT.color(0x1f4e79), -0.2, 0.43, 0.02)); g.add(box(0.24, 0.02, 0.17, MAT.color(0xf2efe6), -0.19, 0.45, 0.03)); return g;
}
export function roundTable({ r = 0.45, h = 0.74, top = MAT.white() } = {}) { const g = grp(); g.add(cyl(r, r, 0.03, top, 0, h - 0.015, 0, 36)); g.add(cyl(0.035, 0.035, h - 0.05, MAT.blackMetal(), 0, (h - 0.05) / 2 + 0.02, 0, 12)); g.add(cyl(r * 0.6, r * 0.62, 0.02, MAT.blackMetal(), 0, 0.01, 0, 28)); return g; }
export function meetingTable({ w = 3.6, d = 1.3 } = {}) {
  const g = grp(); g.add(box(w, 0.045, d, MAT.oak(), 0, 0.735, 0, { r: 0.02 })); g.add(box(w * 0.5, 0.012, 0.16, MAT.blackMetal(), 0, 0.762, 0));
  for (const sx of [-1, 1]) { g.add(box(0.08, 0.7, d * 0.62, MAT.blackMetal(), sx * (w / 2 - 0.5), 0.36, 0)); g.add(box(0.1, 0.02, d * 0.8, MAT.blackMetal(), sx * (w / 2 - 0.5), 0.01, 0)); }
  g.add(box(w - 1.0, 0.06, 0.06, MAT.blackMetal(), 0, 0.66, 0)); return g;
}

// ---------------------------------------------------------------- tech
export function monitor({ w = 0.62, h = 0.36, tex = null, key = 'mon' } = {}) {
  const g = grp(); const y = 0.24 + h / 2;
  g.add(box(w + 0.02, h + 0.02, 0.022, MAT.black(), 0, y, 0, { r: 0.006 }));
  const scr = plane(w - 0.012, h - 0.012, tex ? texMat(key, tex, { emissive: true, intensity: 0.92 }) : MAT.screenOff(), 0, y, 0.0125); scr.castShadow = false; g.add(scr); if (tex && tex.getContext) scr.userData.screen = { canvas: tex, w: w - 0.012, h: h - 0.012 }; g.userData.screenMesh = scr;
  g.add(box(0.05, 0.24, 0.03, MAT.blackMetal(), 0, 0.13, -0.03)); g.add(box(0.24, 0.012, 0.17, MAT.blackMetal(), 0, 0.006, -0.02, { r: 0.004 }));
  return g;
}
export function keyboardMouse(dark = true) {
  const g = grp(); g.add(box(0.42, 0.016, 0.13, dark ? MAT.black() : MAT.plastic(), 0, 0.008, 0, { r: 0.005, cast: false })); g.add(box(0.38, 0.004, 0.1, dark ? MAT.color(0x2c2f35) : MAT.color(0xcfd3d8), 0, 0.018, 0, { cast: false })); g.add(box(0.06, 0.028, 0.1, dark ? MAT.black() : MAT.plastic(), 0.32, 0.014, 0.0, { r: 0.012, cast: false })); return g;
}
export function laptop(tex, key = 'lap') {
  const g = grp(); g.add(box(0.34, 0.016, 0.24, MAT.steel(), 0, 0.008, 0, { r: 0.004 })); g.add(box(0.3, 0.002, 0.11, MAT.color(0x30333a), 0, 0.017, -0.035, { cast: false }));
  const lid = grp(); lid.add(box(0.34, 0.225, 0.008, MAT.steel(), 0, 0.1125, 0)); const s = plane(0.32, 0.2, tex ? texMat(key, tex, { emissive: true, intensity: 0.9 }) : MAT.screenOff(), 0, 0.115, 0.0045); lid.add(s); lid.position.set(0, 0.014, -0.118); lid.rotation.x = -0.28; g.add(lid); return g;
}
export function phoneDesk() { const g = grp(); g.add(box(0.17, 0.05, 0.2, MAT.black(), 0, 0.03, 0, { r: 0.01 })); const h = box(0.05, 0.035, 0.2, MAT.black(), -0.05, 0.07, 0, { r: 0.012 }); g.add(h); g.add(box(0.07, 0.003, 0.09, MAT.color(0x3b4250), 0.035, 0.057, 0.02, { cast: false })); return g; }
export function deskLamp(color = MAT.brass()) { const g = grp(); g.add(cyl(0.08, 0.09, 0.02, color, 0, 0.01, 0, 20)); const a = cyl(0.008, 0.008, 0.36, color, 0, 0.19, 0, 8); g.add(a); const arm = cyl(0.008, 0.008, 0.26, color, 0, 0.4, 0.1, 8); arm.rotation.x = 1.1; g.add(arm); const sh = cyl(0.03, 0.08, 0.1, color, 0, 0.42, 0.22, 16); sh.rotation.x = 0.5; g.add(sh); const bulb = cyl(0.06, 0.06, 0.01, MAT.emissive(0xfff0d0, 1.6), 0, 0.378, 0.243, 16); bulb.rotation.x = 0.5; bulb.castShadow = false; g.add(bulb); return g; }
export function papers(n = 3) { const g = grp(); for (let i = 0; i < n; i++) { const p = box(0.21, 0.004, 0.297, MAT.paper(), (i % 2) * 0.012, 0.004 + i * 0.004, (i % 3) * 0.008, { cast: false }); p.rotation.y = (i - 1) * 0.09; g.add(p); } return g; }
export function mug(color = 0xffffff) { const g = grp(); g.add(cyl(0.04, 0.035, 0.09, MAT.color(color, 0.4), 0, 0.045, 0, 14)); g.add(cyl(0.034, 0.034, 0.004, MAT.color(0x3a2314, 0.3), 0, 0.086, 0, 14, { cast: false })); const h = new THREE.Mesh(G('mugh', () => new THREE.TorusGeometry(0.026, 0.007, 6, 12, Math.PI)), MAT.color(color, 0.4)); h.rotation.z = -Math.PI / 2; h.position.set(0.04, 0.045, 0); g.add(h); return g; }
export function brandMug(logoMat) { const g = mug(0xffffff); const p = plane(0.062, 0.062 * 154 / 500, logoMat, 0, 0.047, 0.0412); p.castShadow = false; g.add(p); return g; }
export function bottle(color = 0x4aa3df) { const g = grp(); g.add(cyl(0.032, 0.032, 0.17, M('bottle' + color, () => new THREE.MeshStandardMaterial({ color, transparent: true, opacity: 0.55, roughness: 0.15 })), 0, 0.085, 0, 12, { cast: false })); g.add(cyl(0.018, 0.03, 0.035, M('bottle' + color), 0, 0.187, 0, 12, { cast: false })); g.add(cyl(0.02, 0.02, 0.022, MAT.color(0xffffff, 0.5), 0, 0.214, 0, 10, { cast: false })); return g; }
export function notepad(color = 0xf2c94c) { const g = grp(); g.add(box(0.13, 0.012, 0.19, MAT.color(color, 0.8), 0, 0.006, 0, { cast: false })); g.add(box(0.12, 0.004, 0.18, MAT.paper(), 0.002, 0.014, 0, { cast: false })); const pen = cyl(0.005, 0.005, 0.14, MAT.color(0x1f4e79, 0.4), 0.1, 0.006, 0.01, 6, { cast: false }); pen.rotation.x = Math.PI / 2; pen.rotation.z = 0.3; g.add(pen); return g; }
export function headphones() { const g = grp(); const band = new THREE.Mesh(G('hpband', () => new THREE.TorusGeometry(0.085, 0.008, 6, 18, Math.PI)), MAT.black()); band.rotation.set(Math.PI / 2 - 0.25, 0, 0); band.position.set(0, 0.045, 0); band.castShadow = true; g.add(band); for (const sx of [-1, 1]) { const c = cyl(0.04, 0.04, 0.03, MAT.black(), sx * 0.085, 0.03, 0.01, 14); c.rotation.z = Math.PI / 2; g.add(c); const pad = cyl(0.036, 0.036, 0.012, MAT.fabricDark(), sx * 0.066, 0.03, 0.01, 14); pad.rotation.z = Math.PI / 2; g.add(pad); } return g; }
export function pendant({ color = MAT.black(), r = 0.2, drop = 0.75, warm = 0xffe6c2 } = {}) { // hangs from y=0 (ceiling) downwards
  const g = grp(); g.add(cyl(0.004, 0.004, drop, MAT.rubber(), 0, -drop / 2, 0, 5, { cast: false })); g.add(cyl(0.045, 0.045, 0.02, color, 0, -0.01, 0, 12, { cast: false })); g.add(cyl(0.06, r, 0.2, color, 0, -drop - 0.1, 0, 22)); const b = cyl(r - 0.012, r - 0.012, 0.006, MAT.emissive(warm, 2.2), 0, -drop - 0.199, 0, 22, { cast: false }); g.add(b); return g; }
export function linearLight(len = 2.6, drop = 0.6) { const g = grp(); g.add(box(len, 0.045, 0.07, MAT.black(), 0, -drop, 0)); g.add(box(len - 0.04, 0.008, 0.055, MAT.emissive(0xfff6e8, 2.0), 0, -drop - 0.026, 0, { cast: false })); for (const sx of [-1, 1]) g.add(cyl(0.003, 0.003, drop, MAT.rubber(), sx * (len / 2 - 0.25), -drop / 2, 0, 5, { cast: false })); return g; }
export function ringLight() { const g = grp(); for (let i = 0; i < 3; i++) { const l = cyl(0.009, 0.009, 0.9, MAT.blackMetal(), 0.14, 0.4, 0, 6); l.rotation.z = 0.32; const p = new THREE.Group(); p.rotation.y = i * 2.094; p.add(l); g.add(p); } g.add(cyl(0.012, 0.012, 0.95, MAT.blackMetal(), 0, 1.25, 0, 8)); const ring = new THREE.Mesh(G('ringlight', () => new THREE.TorusGeometry(0.2, 0.022, 10, 36)), MAT.emissive(0xfff3e0, 2.4)); ring.position.set(0, 1.78, 0); ring.castShadow = false; g.add(ring); const back = new THREE.Mesh(G('ringback', () => new THREE.TorusGeometry(0.2, 0.03, 8, 30)), MAT.black()); back.position.set(0, 1.78, -0.012); g.add(back); return g; }
export function pcParts() { const g = grp(); const pcb = MAT.color(0x1f6b45, 0.5); g.add(box(0.3, 0.008, 0.24, pcb, 0, 0.004, 0, { cast: false })); g.add(box(0.045, 0.03, 0.045, MAT.steel(), -0.04, 0.02, -0.03)); g.add(cyl(0.045, 0.045, 0.04, MAT.color(0x2a2d33, 0.4, 0.5), -0.04, 0.055, -0.03, 16)); for (let i = 0; i < 4; i++) g.add(box(0.006, 0.03, 0.13, MAT.color(i % 2 ? 0x15171a : 0xc9282e, 0.4), 0.04 + i * 0.012, 0.02, -0.03, { cast: false })); g.add(box(0.2, 0.012, 0.012, MAT.color(0x15171a), -0.02, 0.012, 0.07, { cast: false })); for (let i = 0; i < 6; i++) g.add(cyl(0.008, 0.008, 0.02, MAT.color(0x2b2f36), -0.13 + i * 0.016, 0.016, -0.1, 8, { cast: false }));
  const gpu = grp(); gpu.add(box(0.27, 0.04, 0.115, MAT.color(0x1b1d21, 0.35, 0.4), 0, 0.02, 0, { r: 0.006 })); for (const sx of [-0.07, 0.07]) { const fan = cyl(0.042, 0.042, 0.004, MAT.color(0x33373e, 0.4), sx, 0.042, 0, 16, { cast: false }); gpu.add(fan); } gpu.add(box(0.27, 0.004, 0.012, MAT.emissive(0x38bdf8, 1.6), 0, 0.03, 0.058, { cast: false })); gpu.position.set(0.36, 0, 0.02); gpu.rotation.y = 0.25; g.add(gpu);
  const sd = grp(); const h = cyl(0.014, 0.014, 0.09, MAT.red(), 0, 0, 0, 10); h.rotation.z = Math.PI / 2; sd.add(h); const sh = cyl(0.004, 0.004, 0.11, MAT.steel(), 0.1, 0, 0, 6); sh.rotation.z = Math.PI / 2; sd.add(sh); sd.position.set(0.1, 0.014, 0.19); sd.rotation.y = -0.4; g.add(sd);
  g.add(box(0.1, 0.02, 0.1, MAT.color(0x15171a, 0.3, 0.6), -0.26, 0.01, 0.1, { cast: false })); return g; }
export function blinds(w, h, { tilt = 0.6, step = 0.085 } = {}) { // venetian blinds; origin at the window centre, slats run along X, room side is +Z
  const g = grp(); const m = MAT.color(0xf1efe9, 0.6); const n = Math.floor(h / step); for (let i = 0; i <= n; i++) { const s = box(w - 0.04, 0.004, 0.05, m, 0, -h / 2 + i * step, 0.05); s.rotation.x = tilt; g.add(s); } g.add(box(w, 0.05, 0.06, m, 0, h / 2 + 0.02, 0.05)); for (const sx of [-1, 1]) g.add(cyl(0.0025, 0.0025, h, MAT.color(0xdddddd), sx * (w / 2 - 0.25), 0, 0.05, 4, { cast: false })); return g; }
export function nameplate(text, sub) { const g = grp(); const b = box(0.46, 0.085, 0.05, MAT.darkWood(), 0, 0.0425, 0, { r: 0.006 }); b.rotation.x = -0.25; g.add(b); const p = plane(0.43, 0.068, texMat('np:' + text, T.textTex(text, { w: 860, h: 136, bg: '#c7a25a', color: '#241a10', size: 62, weight: 800, sub, letter: 2 }), { rough: 0.35 }), 0, 0.047, 0.0265); p.rotation.x = -0.25; p.castShadow = false; g.add(p); return g; }
export function tv({ w = 1.6, h = 0.9, tex, key, intensity = 1 } = {}) {
  // wall mounted: origin at centre of the back plane, faces +Z
  const g = grp(); g.add(box(w + 0.04, h + 0.04, 0.045, MAT.black(), 0, 0, 0.0225, { r: 0.008 })); const s = plane(w, h, tex ? (tex.isMaterial ? tex : texMat(key, tex, { emissive: true, intensity })) : MAT.screenOff(), 0, 0, 0.047); s.castShadow = false; g.add(s); g.userData.screenMesh = s; if (tex && tex.getContext) s.userData.screen = { canvas: tex, w, h }; return g;
}
export function whiteboard({ w = 2.0, h = 1.1, seed = 1, accent } = {}) {
  const g = grp(); g.add(box(w + 0.05, h + 0.05, 0.025, MAT.steel(), 0, 0, 0.0125)); const s = plane(w, h, texMat('wb' + seed, T.whiteboardTex(seed, accent), { rough: 0.25 }), 0, 0, 0.027); g.add(s); g.add(box(w * 0.5, 0.02, 0.07, MAT.steel(), 0, -h / 2 - 0.03, 0.05)); g.add(box(0.1, 0.03, 0.03, MAT.red(), -0.2, -h / 2 - 0.008, 0.06)); g.add(box(0.1, 0.03, 0.03, MAT.color(0x2563eb), 0.0, -h / 2 - 0.008, 0.06)); return g;
}
export function framed({ w, h, tex, key, frame = MAT.black(), mat = 0.0, fw = 0.035, depth = 0.035, glass = false, emissive = false } = {}) {
  // framed picture, origin at centre on the wall plane, faces +Z. `mat` = passe-partout width
  const g = grp(); const W = w + mat * 2, Hh = h + mat * 2;
  g.add(box(W + fw * 2, Hh + fw * 2, depth, frame, 0, 0, depth / 2, { r: 0.006 }));
  if (mat) { const p = plane(W, Hh, MAT.color(0xf6f3ea, 0.9), 0, 0, depth + 0.001); g.add(p); }
  const p = plane(w, h, texMat(key, tex, { rough: 0.55, emissive, intensity: 0.5 }), 0, 0, depth + 0.002); g.add(p);
  if (glass) { const gl = plane(W, Hh, M('pictureGlass', () => new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.08, roughness: 0.02, metalness: 0.0, depthWrite: false })), 0, 0, depth + 0.006); gl.castShadow = false; g.add(gl); }
  return g;
}
export function printer() { const g = grp(); g.add(box(0.5, 0.86, 0.52, MAT.plastic(), 0, 0.43, 0, { r: 0.02 })); g.add(box(0.46, 0.06, 0.4, MAT.color(0x3a3f47), 0, 0.89, 0.02, { r: 0.01 })); g.add(box(0.2, 0.012, 0.12, MAT.screenOff(), 0.1, 0.925, 0.16)); g.add(box(0.36, 0.012, 0.26, MAT.color(0x9aa0a8, 0.6), 0, 0.716, 0.33, { r: 0.004 })); for (let i = 0; i < 3; i++) g.add(box(0.42, 0.008, 0.01, MAT.color(0xc9ccd1), 0, 0.14 + i * 0.18, 0.262)); return g; }
export function serverRack(seed = 1) {
  const g = grp(); const r = T.rng(seed * 31); const w = 0.7, h = 2.05, d = 1.0;
  g.add(box(w, h, d, MAT.color(0x16181c, 0.4, 0.5), 0, h / 2, 0, { r: 0.012 }));
  g.add(box(w - 0.08, h - 0.14, 0.01, MAT.color(0x0b0c0e, 0.3, 0.3), 0, h / 2, d / 2 + 0.002));
  const leds = [];
  for (let u = 0; u < 15; u++) { const y = 0.16 + u * 0.122; g.add(box(w - 0.12, 0.1, 0.012, MAT.color(u % 4 === 3 ? 0x2a2e35 : 0x1e2126, 0.5, 0.6), 0, y, d / 2 + 0.008)); for (let k = 0; k < 4; k++) { const col = r() > 0.75 ? 0xf59e0b : r() > 0.5 ? 0x38bdf8 : 0x22c55e; leds.push({ pos: [-w / 2 + 0.1 + k * 0.035, y + 0.02, d / 2 + 0.016], color: col, phase: r() * 10, rate: 1.5 + r() * 9 }); } }
  const glass = plane(w - 0.1, h - 0.16, M('rackGlass', () => new THREE.MeshStandardMaterial({ color: 0x9fb4c8, transparent: true, opacity: 0.12, roughness: 0.05, depthWrite: false })), 0, h / 2, d / 2 + 0.03); glass.castShadow = false; g.add(glass);
  g.userData.leds = leds; return g;
}
// ---------------------------------------------------------------- storage / decor
export function bookshelf({ w = 1.8, h = 2.1, d = 0.34, wood = MAT.walnut(), seed = 1, decor = true } = {}) {
  const g = grp(); const r = T.rng(seed * 101);
  g.add(box(w, h, 0.02, wood, 0, h / 2, -d / 2 + 0.01)); for (const sx of [-1, 1]) g.add(box(0.03, h, d, wood, sx * (w / 2 - 0.015), h / 2, 0));
  const rows = Math.round(h / 0.4); const cols = Math.max(1, Math.round(w / 0.9));
  for (let i = 0; i <= rows; i++) g.add(box(w - 0.06, 0.028, d, wood, 0, 0.014 + i * (h - 0.028) / rows, 0));
  for (let c = 1; c < cols; c++) g.add(box(0.025, h, d - 0.02, wood, -w / 2 + c * w / cols, h / 2, 0));
  const pal = [0x8d2b2b, 0x1f3b57, 0x2f5d50, 0xd9c7a3, 0x3a3a3a, 0xa8562a, 0xe8e4da, 0x6b2d4f, 0x244a7a, 0xc8a24a];
  for (let i = 0; i < rows; i++) for (let c = 0; c < cols; c++) {
    const y0 = 0.028 + i * (h - 0.028) / rows, x0 = -w / 2 + c * w / cols + 0.04, cw = w / cols - 0.08, mode = r();
    if (decor && mode > 0.78) { if (r() > 0.5) { const p = plant({ h: 0.3, small: true }); p.position.set(x0 + cw / 2, y0, 0); g.add(p); } else { g.add(box(0.16, 0.2, 0.03, MAT.brass(), x0 + cw * 0.4, y0 + 0.1, 0)); g.add(cyl(0.07, 0.05, 0.16, MAT.pot(), x0 + cw * 0.75, y0 + 0.08, 0, 14)); } continue; }
    let x = x0; const lim = x0 + cw * (0.55 + r() * 0.45);
    while (x < lim) { const bw = 0.025 + r() * 0.035, bh = 0.2 + r() * 0.1; g.add(box(bw, bh, 0.2 + r() * 0.04, MAT.color(pal[(r() * pal.length) | 0], 0.75), x + bw / 2, y0 + bh / 2, 0.02, { cast: false })); x += bw + 0.003; }
  }
  return g;
}
export function credenza({ w = 1.8, h = 0.72, d = 0.45, wood = MAT.walnut(), front = MAT.darkWood() } = {}) { const g = grp(); g.add(box(w, h - 0.12, d, wood, 0, (h - 0.12) / 2 + 0.12, 0, { r: 0.012 })); const n = Math.round(w / 0.6); for (let i = 0; i < n; i++) { g.add(box(w / n - 0.02, h - 0.18, 0.015, front, -w / 2 + (i + 0.5) * w / n, (h - 0.12) / 2 + 0.12, d / 2 + 0.004)); g.add(box(0.012, 0.14, 0.014, MAT.brass(), -w / 2 + (i + 0.5) * w / n + (i % 2 ? -1 : 1) * (w / n / 2 - 0.05), h * 0.58, d / 2 + 0.016)); } for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(cyl(0.02, 0.015, 0.12, MAT.blackMetal(), sx * (w / 2 - 0.1), 0.06, sz * (d / 2 - 0.07), 8)); return g; }
export function fileCabinet({ w = 0.5, h = 1.32, d = 0.6, color = MAT.color(0xdfe2e6, 0.5, 0.3) } = {}) { const g = grp(); g.add(box(w, h, d, color, 0, h / 2, 0, { r: 0.008 })); const n = Math.round(h / 0.33); for (let i = 0; i < n; i++) { g.add(box(w - 0.04, h / n - 0.03, 0.012, MAT.color(0xeef0f2, 0.5, 0.2), 0, (i + 0.5) * h / n, d / 2 + 0.004)); g.add(box(0.14, 0.018, 0.016, MAT.steel(), 0, (i + 0.5) * h / n + 0.06, d / 2 + 0.014)); } return g; }
export function safe() { const g = grp(); g.add(box(0.62, 0.86, 0.6, MAT.color(0x2b3138, 0.35, 0.7), 0, 0.43, 0, { r: 0.02 })); g.add(box(0.52, 0.74, 0.02, MAT.color(0x353c45, 0.3, 0.8), 0, 0.43, 0.305, { r: 0.01 })); const dial = cyl(0.07, 0.07, 0.03, MAT.chrome(), 0, 0.5, 0.33, 24); dial.rotation.x = Math.PI / 2; g.add(dial); const hd = box(0.03, 0.2, 0.03, MAT.chrome(), 0.17, 0.43, 0.33); g.add(hd); return g; }
export function plant({ h = 1.5, small = false, pot = MAT.pot(), kind = 0 } = {}) {
  const g = grp(); const ph = small ? 0.1 : 0.36, pr = small ? 0.06 : 0.19;
  g.add(cyl(pr, pr * 0.78, ph, pot, 0, ph / 2, 0, 20)); g.add(cyl(pr * 0.92, pr * 0.92, 0.01, MAT.soil(), 0, ph - 0.004, 0, 16, { cast: false }));
  const r = T.rng(Math.round(h * 1000) + kind * 7 + (small ? 3 : 0)); const n = small ? 7 : 16; const leafG = G('leaf', () => { const s = new THREE.Shape(); s.moveTo(0, 0); s.bezierCurveTo(0.34, 0.25, 0.3, 0.75, 0, 1); s.bezierCurveTo(-0.3, 0.75, -0.34, 0.25, 0, 0); const ge = new THREE.ShapeGeometry(s, 8); const p = ge.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i), x = p.getX(i); p.setZ(i, -y * y * 0.35 + Math.abs(x) * 0.25); } ge.computeVertexNormals(); return ge; });
  if (!small && kind !== 1) g.add(cyl(0.016, 0.022, h * 0.5, MAT.color(0x5c4631, 0.9), 0, ph + h * 0.25, 0, 6));
  for (let i = 0; i < n; i++) { const leaf = new THREE.Mesh(leafG, i % 3 ? MAT.leaf() : MAT.leafDark()); const a = i * 2.399 + r() * 0.4; const t = i / n; const L = (small ? 0.16 : 0.42 + r() * 0.3) * (kind === 1 ? 1.5 : kind === 2 ? 0.8 : 1); leaf.scale.set(L * (kind === 1 ? 0.35 : kind === 2 ? 1.25 : 0.8), L, L); const piv = new THREE.Group(); piv.position.set(0, small ? ph : (kind === 1 ? ph : ph + h * (0.25 + 0.3 * t)), 0); piv.rotation.y = a; leaf.rotation.x = kind === 1 ? 0.12 + r() * 0.35 : 0.5 + t * 0.6 + r() * 0.3; piv.add(leaf); leaf.castShadow = true; g.add(piv); }
  return g;
}
export function rug(w, d, color = 0x3a3d44, border = null) { const g = grp(); const m = M('rug' + color, () => new THREE.MeshStandardMaterial({ map: T.toTex(T.carpetTex('#' + color.toString(16).padStart(6, '0'), 9, false), { repeat: [w, d] }), roughness: 1 })); const b = box(w, 0.012, d, m, 0, 0.006, 0, { cast: false }); g.add(b); if (border !== null) { const bm = MAT.color(border, 0.95); g.add(box(w, 0.013, 0.07, bm, 0, 0.0065, d / 2 - 0.035, { cast: false })); g.add(box(w, 0.013, 0.07, bm, 0, 0.0065, -d / 2 + 0.035, { cast: false })); g.add(box(0.07, 0.013, d, bm, w / 2 - 0.035, 0.0065, 0, { cast: false })); g.add(box(0.07, 0.013, d, bm, -w / 2 + 0.035, 0.0065, 0, { cast: false })); } return g; }
export function floorLamp() { const g = grp(); g.add(cyl(0.15, 0.16, 0.02, MAT.blackMetal(), 0, 0.01, 0, 20)); g.add(cyl(0.012, 0.012, 1.55, MAT.brass(), 0, 0.78, 0, 8)); const sh = cyl(0.16, 0.22, 0.28, M('lampShade', () => { const m = new THREE.MeshStandardMaterial({ color: 0xfff3dc, emissive: 0xffe2b0, emissiveIntensity: 0.7, roughness: 0.9, side: THREE.DoubleSide }); m.userData.bloom = true; return m; }), 0, 1.62, 0, 24); g.add(sh); return g; }
export function bin() { const g = grp(); g.add(cyl(0.13, 0.1, 0.3, MAT.color(0x3a3d42, 0.6, 0.3), 0, 0.15, 0, 14)); return g; }
export function clock() { const g = grp(); const c = cyl(0.17, 0.17, 0.03, MAT.black(), 0, 0, 0.015, 28); c.rotation.x = Math.PI / 2; g.add(c); const f = cyl(0.155, 0.155, 0.005, MAT.white(), 0, 0, 0.032, 28); f.rotation.x = Math.PI / 2; g.add(f); const hh = box(0.012, 0.085, 0.004, MAT.black(), 0, 0.04, 0.037); hh.geometry = hh.geometry.clone(); const hp = new THREE.Group(); hp.add(hh); hp.position.z = 0; g.add(hp); const mh = box(0.008, 0.125, 0.004, MAT.black(), 0, 0.06, 0.039); const mp = new THREE.Group(); mp.add(mh); g.add(mp); hp.userData.dynamic = mp.userData.dynamic = true; hh.userData.dynamic = mh.userData.dynamic = true; g.userData.hands = [hp, mp]; return g; }
// ---------------------------------------------------------------- kitchen / misc
export function kitchenCounter({ w = 3.2 } = {}) {
  const g = grp(); const d = 0.62;
  g.add(box(w, 0.86, d - 0.04, MAT.color(0xf0eee9, 0.6), 0, 0.43, -0.02)); g.add(box(w + 0.02, 0.04, d + 0.02, MAT.color(0x2e3035, 0.25, 0.1), 0, 0.88, 0, { r: 0.006 })); g.add(box(w, 0.09, d - 0.1, MAT.color(0x24262a), 0, 0.045, -0.04));
  const n = Math.round(w / 0.6); for (let i = 0; i < n; i++) { g.add(box(w / n - 0.016, 0.7, 0.014, MAT.white(), -w / 2 + (i + 0.5) * w / n, 0.47, d / 2 - 0.035)); g.add(box(0.012, 0.12, 0.014, MAT.steel(), -w / 2 + (i + 0.5) * w / n + (w / n / 2 - 0.05), 0.72, d / 2 - 0.022)); }
  // wall cabinets + backsplash
  g.add(box(w, 0.56, 0.02, texMat('backsplash', T.tileTex('#f6f4ef', '#d9d4ca'), { rough: 0.25 }), 0, 1.2, -d / 2 + 0.012)); g.add(box(w, 0.62, 0.34, MAT.white(), 0, 1.82, -d / 2 + 0.17, { r: 0.006 })); for (let i = 1; i < n; i++) g.add(box(0.006, 0.6, 0.006, MAT.color(0xc9ccd1), -w / 2 + i * w / n, 1.82, -d / 2 + 0.342));
  const strip = box(w - 0.1, 0.012, 0.03, MAT.emissive(0xfff1d6, 1.4), 0, 1.5, -d / 2 + 0.3, { cast: false }); g.add(strip);
  return g;
}
export function coffeeMachine() { const g = grp(); g.add(box(0.3, 0.4, 0.42, MAT.color(0x23262b, 0.3, 0.5), 0, 0.2, 0, { r: 0.02 })); g.add(box(0.3, 0.07, 0.42, MAT.chrome(), 0, 0.43, 0, { r: 0.015 })); g.add(box(0.22, 0.02, 0.16, MAT.steel(), 0, 0.03, 0.14)); g.add(cyl(0.02, 0.016, 0.08, MAT.chrome(), -0.04, 0.27, 0.17, 8)); g.add(cyl(0.02, 0.016, 0.08, MAT.chrome(), 0.04, 0.27, 0.17, 8)); g.add(box(0.12, 0.05, 0.004, MAT.emissive(0x38bdf8, 1), 0, 0.36, 0.212, { cast: false })); const m = mug(0xffffff); m.position.set(0, 0.04, 0.16); m.scale.setScalar(0.85); g.add(m); return g; }
export function microwave() { const g = grp(); g.add(box(0.5, 0.29, 0.36, MAT.steel(), 0, 0.145, 0, { r: 0.01 })); g.add(box(0.33, 0.21, 0.006, MAT.glassDark(), -0.06, 0.145, 0.182)); g.add(box(0.09, 0.21, 0.006, MAT.color(0x23262b), 0.185, 0.145, 0.182)); return g; }
export function fridge() { const g = grp(); g.add(box(0.72, 1.86, 0.68, MAT.steel(), 0, 0.93, 0, { r: 0.015 })); g.add(box(0.7, 0.012, 0.01, MAT.color(0x70757d), 0, 1.18, 0.341)); g.add(box(0.025, 0.5, 0.03, MAT.chrome(), -0.28, 1.5, 0.36)); g.add(box(0.025, 0.7, 0.03, MAT.chrome(), -0.28, 0.72, 0.36)); return g; }
export function waterCooler() { const g = grp(); g.add(box(0.32, 0.98, 0.32, MAT.white(), 0, 0.49, 0, { r: 0.02 })); g.add(cyl(0.13, 0.14, 0.4, M('waterJug', () => new THREE.MeshStandardMaterial({ color: 0x8fd0ff, transparent: true, opacity: 0.55, roughness: 0.1 })), 0, 1.19, 0, 18)); g.add(box(0.2, 0.12, 0.02, MAT.color(0xd9dde2), 0, 0.72, 0.165)); g.add(box(0.03, 0.03, 0.03, MAT.color(0x2563eb), -0.05, 0.75, 0.185)); g.add(box(0.03, 0.03, 0.03, MAT.red(), 0.05, 0.75, 0.185)); return g; }
export function highTable({ w = 1.5, d = 0.6 } = {}) { const g = grp(); g.add(box(w, 0.04, d, MAT.oak(), 0, 1.06, 0, { r: 0.012 })); for (const sx of [-1, 1]) { g.add(box(0.04, 1.02, 0.04, MAT.blackMetal(), sx * (w / 2 - 0.1), 0.52, 0)); g.add(box(0.05, 0.02, d - 0.08, MAT.blackMetal(), sx * (w / 2 - 0.1), 0.01, 0)); } g.add(box(w - 0.2, 0.03, 0.03, MAT.blackMetal(), 0, 0.3, 0)); return g; }
export function receptionDesk(logoTex) {
  const g = grp(); const w = 2.8;
  g.add(box(w, 1.08, 0.12, MAT.white(), 0, 0.54, 0.34, { r: 0.012 })); g.add(box(w + 0.08, 0.04, 0.36, MAT.walnut(), 0, 1.1, 0.24, { r: 0.012 }));
  g.add(box(w, 0.03, 0.78, MAT.white(), 0, 0.74, -0.08, { r: 0.008 })); for (const sx of [-1, 1]) g.add(box(0.1, 1.08, 0.8, MAT.white(), sx * (w / 2 - 0.05), 0.54, -0.02, { r: 0.012 }));
  g.add(box(w - 0.3, 0.72, 0.014, MAT.red(), 0, 0.5, 0.404)); const lp = plane(1.85, 0.57, M('logoWhite', () => new THREE.MeshBasicMaterial({ map: logoTex, transparent: true, color: 0xffffff })), 0, 0.5, 0.413); lp.castShadow = false; g.add(lp);
  g.add(box(w - 0.2, 0.016, 0.02, MAT.emissive(0xffffff, 1.2), 0, 0.09, 0.405, { cast: false }));
  return g;
}
export function softbox() { const g = grp(); for (let i = 0; i < 3; i++) { const l = cyl(0.01, 0.01, 1.0, MAT.blackMetal(), 0, 0.45, 0, 6); l.rotation.z = 0.32; const p = new THREE.Group(); p.rotation.y = i * 2.094; l.position.x = 0.15; p.add(l); g.add(p); } g.add(cyl(0.014, 0.014, 1.0, MAT.blackMetal(), 0, 1.38, 0, 8)); const h = grp(); h.add(box(0.62, 0.62, 0.3, MAT.black(), 0, 0, -0.15)); const f = plane(0.58, 0.58, MAT.emissive(0xfff6e6, 1.5), 0, 0, 0.002); f.castShadow = false; h.add(f); h.position.set(0, 1.85, 0); h.rotation.x = 0.28; g.add(h); return g; }
export function tripodCamera() { const g = grp(); for (let i = 0; i < 3; i++) { const l = cyl(0.01, 0.008, 1.35, MAT.blackMetal(), 0.2, 0.62, 0, 6); l.rotation.z = 0.3; const p = new THREE.Group(); p.rotation.y = i * 2.094 + 0.5; p.add(l); g.add(p); } g.add(box(0.15, 0.1, 0.09, MAT.black(), 0, 1.33, 0, { r: 0.012 })); const lens = cyl(0.04, 0.045, 0.1, MAT.black(), 0, 1.33, 0.09, 16); lens.rotation.x = Math.PI / 2; g.add(lens); const gl = cyl(0.034, 0.034, 0.004, MAT.color(0x23364f, 0.05, 0.6), 0, 1.33, 0.142, 16); gl.rotation.x = Math.PI / 2; g.add(gl); return g; }
export function pcTower(rgb = true) { const g = grp(); g.add(box(0.22, 0.46, 0.46, MAT.color(0x15171a, 0.35, 0.4), 0, 0.23, 0, { r: 0.012 })); const side = plane(0.4, 0.4, M('pcGlass', () => { const m = new THREE.MeshStandardMaterial({ color: 0x0c0e12, roughness: 0.05, metalness: 0.4, emissive: 0x6b21a8, emissiveIntensity: 0.5 }); m.userData.bloom = true; m.userData.rgb = 0.5; return m; }), 0.112, 0.23, 0); side.rotation.y = Math.PI / 2; g.add(side); if (rgb) { for (let i = 0; i < 3; i++) { const fm = M('pcFan' + i, () => { const m = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: [0xff3d7f, 0x38bdf8, 0x7c3aed][i], emissiveIntensity: 1.8, roughness: 0.4 }); m.userData.bloom = true; m.userData.rgb = i * 0.12; return m; }); const f = new THREE.Mesh(G('fanring', () => new THREE.TorusGeometry(0.05, 0.008, 6, 20)), fm); f.position.set(0, 0.1 + i * 0.13, 0.232); f.castShadow = false; g.add(f); } } return g; }
export function pedestal(h = 0.9) { const g = grp(); g.add(box(0.5, h, 0.5, MAT.white(), 0, h / 2, 0, { r: 0.01 })); return g; }
export function bench(w = 1.6) { const g = grp(); g.add(box(w, 0.07, 0.42, MAT.oak(), 0, 0.44, 0, { r: 0.02 })); for (const sx of [-1, 1]) { g.add(box(0.04, 0.42, 0.36, MAT.blackMetal(), sx * (w / 2 - 0.16), 0.21, 0)); } return g; }
