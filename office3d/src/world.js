// Builds the office: shell (walls / glass / floors / ceiling), furniture, work stations and stand spots.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import * as T from './tex.js';
import * as F from './furniture.js';
import { BLOOM_LAYER } from './post.js';
const { MAT, M, box, cyl, plane, texMat } = F;

export const H = 2.9;            // ceiling height
export const B = { x1: -18, x2: 18, z1: -8.5, z2: 8.5, c1: -1.5, c2: 1.5 };
export const ROOMS = {
  presidencia: { name: 'Presidência', sub: 'Thiago Herrera', x1: -18, x2: -8, z1: -8.5, z2: -1.5, accent: 0xed3237, door: -10.2 },
  vendas: { name: 'Vendas & Atendimento', sub: 'Bling ERP · CRM WhatsApp', x1: -8, x2: 3, z1: -8.5, z2: -1.5, accent: 0x10b981, door: 0.8 },
  reuniao: { name: 'Sala de Reunião', sub: '', x1: 3, x2: 10, z1: -8.5, z2: -1.5, accent: 0x64748b, door: 4.0 },
  recepcao: { name: 'Recepção', sub: 'Balão da Informática', x1: 10, x2: 18, z1: -8.5, z2: -1.5, accent: 0xed3237, door: null },
  operacoes: { name: 'Operações', sub: 'Hermes · orquestração', x1: -18, x2: -11, z1: 1.5, z2: 8.5, accent: 0x06b6d4, door: -12.3 },
  mercado: { name: 'Inteligência de Mercado', sub: 'Preços e concorrência', x1: -11, x2: -5, z1: 1.5, z2: 8.5, accent: 0xf59e0b, door: -6.2 },
  criativo: { name: 'Estúdio Criativo', sub: 'Artes e vídeos', x1: -5, x2: 2, z1: 1.5, z2: 8.5, accent: 0xd946ef, door: -1.2 },
  ti: { name: 'TI & Servidores', sub: 'VPS · deploy · rede', x1: 2, x2: 9, z1: 1.5, z2: 8.5, accent: 0x3b82f6, door: 6.3 },
  financeiro: { name: 'Financeiro', sub: 'PIX · cobranças', x1: 9, x2: 14, z1: 1.5, z2: 8.5, accent: 0x14b8a6, door: 12.6 },
  copa: { name: 'Copa', sub: 'Café', x1: 14, x2: 18, z1: 1.5, z2: 8.5, accent: 0xb45309, door: null },
};
const DOOR_W = 1.2;
const OFF = new THREE.Color(0x0a0c0e), ALERT = new THREE.Color(0xff5a1f), ALERT2 = new THREE.Color(0xff2a2a), TMPC = new THREE.Color();
const fwd = (yaw) => new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
const hex = (n) => '#' + n.toString(16).padStart(6, '0');

export function buildWorld({ scene, tex, config }) {
  const W = { rooms: ROOMS, obstacles: [], seats: new Map(), spots: new Map(), leds: [], chairs: [], planes: {}, caps: {}, tick: [], H, lamps: [], screens: [], serverAlert: 0 };
  const staticRoot = new THREE.Group(); staticRoot.name = 'static';
  const dynRoot = new THREE.Group(); dynRoot.name = 'dynamic';
  scene.add(staticRoot, dynRoot);

  // ---- cutaway clipping groups (N,S,E,W exterior walls, P partitions, G glass fronts)
  for (const k of ['N', 'S', 'E', 'W', 'P', 'G']) { W.planes[k] = new THREE.Plane(new THREE.Vector3(0, -1, 0), 50); W.caps[k] = []; }
  const clipCache = new Map();
  const clipM = (mat, grp) => { if (!grp) return mat; const key = mat.uuid + grp; if (!clipCache.has(key)) { const m = mat.clone(); m.name = (mat.name || 'm') + '@' + grp; m.clippingPlanes = [W.planes[grp]]; m.clipShadows = true; clipCache.set(key, m); } return clipCache.get(key); };
  const mount = (obj, grp) => { obj.traverse(o => { if (o.isMesh) o.material = clipM(o.material, grp); }); return obj; };
  const capMat = new THREE.MeshBasicMaterial({ color: 0x2b2f36 });

  const add = (obj, x = 0, z = 0, yaw = 0, { nav = false, y = 0, dyn = false, pad = 0 } = {}) => {
    obj.position.set(x, y, z); obj.rotation.y = yaw; (dyn ? dynRoot : staticRoot).add(obj);
    if (nav) { obj.updateMatrixWorld(true); const b = new THREE.Box3().setFromObject(obj); W.obstacles.push({ x1: b.min.x - pad, x2: b.max.x + pad, z1: b.min.z - pad, z2: b.max.z + pad, h: b.max.y }); }
    return obj;
  };
  const obstacle = (x1, z1, x2, z2, h = H) => W.obstacles.push({ x1: Math.min(x1, x2), x2: Math.max(x1, x2), z1: Math.min(z1, z2), z2: Math.max(z1, z2), h, wall: true });

  // ---- materials
  const wallWhite = M('wallWhite', () => new THREE.MeshStandardMaterial({ color: 0xf5f4f0, roughness: 0.92 }));
  const wallExt = M('wallExt', () => new THREE.MeshStandardMaterial({ color: 0xe9e7e2, roughness: 0.95 }));
  const frameMat = MAT.blackMetal();
  const glassMat = M('glass', () => new THREE.MeshPhysicalMaterial({ color: 0xbfe3ee, transparent: true, opacity: 0.15, roughness: 0.03, metalness: 0, ior: 1.5, reflectivity: 0.6, clearcoat: 1, clearcoatRoughness: 0.04, depthWrite: false, envMapIntensity: 1.7 }));
  const frostMat = M('frost', () => new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.42, roughness: 0.9, depthWrite: false }));
  const skyTex = [0, 1, 2].map(i => T.toTex(T.skyTex(i))); const skyMat = M('sky', () => { const m = new THREE.MeshBasicMaterial({ map: skyTex[0], toneMapped: false }); m.userData.bloom = true; return m; });
  W.setSky = (i) => { if (skyMat.map !== skyTex[i]) { skyMat.map = skyTex[i]; skyMat.needsUpdate = true; for (const m of clipCache.values()) if (m.name.startsWith('sky@')) { m.map = skyTex[i]; m.needsUpdate = true; } if (W.backdrop) { W.backdrop.material.map = skyTex[i]; W.backdrop.material.needsUpdate = true; } } };
  const floorMat = (key, canvasOrTex, sx, sz, tile, color = 0xffffff, rough = 0.8) => M('floor:' + key, () => { const t = canvasOrTex.isTexture ? canvasOrTex.clone() : T.toTex(canvasOrTex); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(sx / tile[0], sz / tile[1]); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.needsUpdate = true; return rough >= 0.9 ? new THREE.MeshStandardMaterial({ map: t, color, roughness: rough, metalness: 0 }) : new THREE.MeshPhysicalMaterial({ map: t, color, roughness: rough, metalness: 0, clearcoat: 0.35, clearcoatRoughness: 0.28, envMapIntensity: 1.25 }); });

  // ---- shell helpers
  // axis aligned solid wall between two points; t = thickness, off = shift of the centre line
  function wall(x1, z1, x2, z2, grp, mat = wallWhite, { t = 0.12, y0 = 0, y1 = H, nav = true, cap = true, cast = true } = {}) {
    const alongX = Math.abs(z1 - z2) < 1e-6; const len = alongX ? Math.abs(x2 - x1) : Math.abs(z2 - z1); if (len < 0.01) return;
    const m = box(alongX ? len : t, y1 - y0, alongX ? t : len, clipM(mat, grp), (x1 + x2) / 2, (y0 + y1) / 2, (z1 + z2) / 2, { cast }); staticRoot.add(m);
    if (nav && y0 < 1.0) obstacle(alongX ? x1 : x1 - t / 2, alongX ? z1 - t / 2 : z1, alongX ? x2 : x2 + t / 2, alongX ? z2 + t / 2 : z2);
    if (cap && grp && y0 < 0.5) { const c = new THREE.Mesh(new THREE.PlaneGeometry(alongX ? len : t, alongX ? t : len), capMat); c.rotation.x = -Math.PI / 2; c.position.set((x1 + x2) / 2, 0, (z1 + z2) / 2); c.visible = false; c.userData.dynamic = true; dynRoot.add(c); W.caps[grp].push(c); }
  }
  // wall along an axis with door gaps: gaps = [[a,b],...] in the running coordinate
  function wallWithGaps(axis, fixed, a, b, gaps, grp, mat, opt = {}) {
    let cur = a; const gs = [...gaps].sort((p, q) => p[0] - q[0]);
    const seg = (s, e, extra) => axis === 'x' ? wall(s, fixed, e, fixed, grp, mat, { ...opt, ...extra }) : wall(fixed, s, fixed, e, grp, mat, { ...opt, ...extra });
    for (const [g1, g2] of gs) { seg(cur, g1); seg(g1, g2, { y0: 2.15, nav: false, cap: false }); cur = g2; }
    seg(cur, b);
  }
  // glass front along X at z, from xa to xb, with door gaps (centres); inside = +1 if the room is at +z side
  function glassFront(z, xa, xb, doors, inside, room) {
    const t = 0.05; const rail = (x1, x2, y, h = 0.06) => staticRoot.add(box(Math.abs(x2 - x1), h, t + 0.02, clipM(frameMat, 'G'), (x1 + x2) / 2, y, z));
    const post = (x, y0 = 0, y1 = H) => staticRoot.add(box(0.05, y1 - y0, t + 0.02, clipM(frameMat, 'G'), x, (y0 + y1) / 2, z));
    rail(xa, xb, H - 0.03); post(xa + 0.025); post(xb - 0.025);
    const cuts = [xa]; for (const d of doors) { cuts.push(d - DOOR_W / 2, d + DOOR_W / 2); } cuts.push(xb);
    for (let i = 0; i < cuts.length - 1; i++) {
      const a = cuts[i], b = cuts[i + 1]; const isDoor = i % 2 === 1;
      if (isDoor) {
        post(a); post(b); rail(a, b, 2.15, 0.05);
        const tr = box(b - a - 0.05, H - 2.15 - 0.09, 0.012, clipM(glassMat, 'G'), (a + b) / 2, (2.15 + H) / 2 - 0.02, z, { cast: false }); staticRoot.add(tr);
        // door leaf, swung open into the room
        const leaf = new THREE.Group(); const lw = b - a - 0.06; leaf.add(box(lw, 2.08, 0.012, glassMat, lw / 2, 1.06, 0, { cast: false })); leaf.add(box(lw, 0.05, 0.03, frameMat, lw / 2, 2.1, 0)); leaf.add(box(lw, 0.05, 0.03, frameMat, lw / 2, 0.03, 0)); leaf.add(box(0.04, 2.1, 0.03, frameMat, 0.02, 1.06, 0)); leaf.add(box(0.04, 2.1, 0.03, frameMat, lw - 0.02, 1.06, 0)); leaf.add(box(0.025, 0.3, 0.07, MAT.chrome(), lw - 0.09, 1.05, 0));
        leaf.position.set(a + 0.03, 0, z); leaf.rotation.y = inside > 0 ? -1.42 : 1.42; mount(leaf, 'G'); staticRoot.add(leaf);
        const lx = a + 0.03 + Math.cos(1.42) * lw / 2, lz = z + inside * Math.sin(1.42) * lw / 2; W.obstacles.push({ x1: lx - 0.12, x2: lx + 0.12, z1: lz - lw / 2, z2: lz + lw / 2, h: 2.1, wall: true });
        // door plate on the corridor side
        if (room) { const pl = plane(0.62, 0.2, texMat('plate:' + room.name, T.textTex(room.name, { w: 620, h: 200, bg: '#ffffff', color: '#1c1f24', size: 64, weight: 700, radius: 22, border: hex(room.accent), sub: room.sub || null }), { rough: 0.4 }), b + 0.5, 1.58, z - inside * (t / 2 + 0.014)); pl.rotation.y = inside > 0 ? Math.PI : 0; pl.material = clipM(pl.material, 'G'); pl.castShadow = false; staticRoot.add(pl); }
        continue;
      }
      if (b - a < 0.06) continue;
      rail(a, b, 0.03);
      const n = Math.max(1, Math.round((b - a) / 1.6)); const bw = (b - a) / n;
      for (let k = 0; k < n; k++) { const x1 = a + k * bw, x2 = x1 + bw; if (k > 0) post(x1); const g = box(bw - 0.05, H - 0.12, 0.012, clipM(glassMat, 'G'), (x1 + x2) / 2, H / 2, z, { cast: false }); staticRoot.add(g); const fr = box(bw - 0.05, 0.36, 0.014, clipM(frostMat, 'G'), (x1 + x2) / 2, 1.12, z, { cast: false }); staticRoot.add(fr); }
      obstacle(a, z - t / 2, b, z + t / 2); W.obstacles[W.obstacles.length - 1].glass = true;
    }
  }
  function floor(key, x1, z1, x2, z2, mat) { const m = plane(x2 - x1, z2 - z1, mat, (x1 + x2) / 2, 0, (z1 + z2) / 2); m.rotation.x = -Math.PI / 2; m.castShadow = false; staticRoot.add(m); return m; }
  // items hung on walls ---------------------------------------------------
  const onWall = (obj, side, a, y, grp, c) => { // side: N,S,E,W exterior or 'pw'/'pe' partition faces (c = partition x)
    if (side === 'N') { obj.position.set(a, y, B.z1 + 0.002); obj.rotation.y = 0; }
    else if (side === 'S') { obj.position.set(a, y, B.z2 - 0.002); obj.rotation.y = Math.PI; }
    else if (side === 'W') { obj.position.set(B.x1 + 0.002, y, a); obj.rotation.y = Math.PI / 2; }
    else if (side === 'E') { obj.position.set(B.x2 - 0.012, y, a); obj.rotation.y = -Math.PI / 2; }
    else if (side === 'pw') { obj.position.set(c - 0.072, y, a); obj.rotation.y = -Math.PI / 2; }   // partition face looking west
    else if (side === 'pe') { obj.position.set(c + 0.062, y, a); obj.rotation.y = Math.PI / 2; }    // partition face looking east
    mount(obj, grp || (side.length === 1 ? side : 'P')); staticRoot.add(obj); return obj;
  };
  const windowPanel = (w, h) => { const g = new THREE.Group(); g.add(box(w + 0.12, h + 0.12, 0.05, MAT.white(), 0, 0, 0.025)); const s = plane(w, h, skyMat, 0, 0, 0.052); s.castShadow = false; g.add(s); const n = Math.max(1, Math.round(w / 1.2)); for (let i = 1; i < n; i++) g.add(box(0.04, h, 0.03, MAT.white(), -w / 2 + i * w / n, 0, 0.06)); g.add(box(w + 0.2, 0.04, 0.14, MAT.white(), 0, -h / 2 - 0.06, 0.07)); return g; };
  const wallText = (text, w, h, color = '#1c1f24', weight = 800) => { const p = plane(w, h, M('wt:' + text + color, () => new THREE.MeshBasicMaterial({ map: T.toTex(T.textTex(text, { w: Math.round(1024 * Math.min(2, w / h / 4)), h: 256, color, size: 170, weight, letter: 4 })), transparent: true, depthWrite: false })), 0, 0, 0.004); p.castShadow = false; p.receiveShadow = false; const g = new THREE.Group(); g.add(p); return g; };
  const accentBand = (side, a1, a2, color, grp, c) => { const len = Math.abs(a2 - a1); const g = new THREE.Group(); g.add(box(len, H, 0.012, MAT.color(color, 0.9), 0, 0, 0.006, { cast: false })); return onWall(g, side, (a1 + a2) / 2, H / 2, grp, c); };

  // ================================================================== SHELL
  // ground + plinth
  W.groundMat = M('ground', () => new THREE.MeshStandardMaterial({ color: 0xd9dde0, roughness: 1 })); const ground = plane(160, 160, W.groundMat, 0, -0.16, 0); ground.rotation.x = -Math.PI / 2; ground.castShadow = false; staticRoot.add(ground);
  staticRoot.add(box(B.x2 - B.x1 + 1.6, 0.16, B.z2 - B.z1 + 1.6, M('plinth', () => new THREE.MeshStandardMaterial({ color: 0xc4c8cc, roughness: 0.9 })), 0, -0.081, 0, { cast: false }));
  const lawn = plane(B.x2 - B.x1 + 14, B.z2 - B.z1 + 14, M('lawn', () => new THREE.MeshStandardMaterial({ color: 0xc9d6c3, roughness: 1 })), 0, -0.155, 0); lawn.rotation.x = -Math.PI / 2; lawn.castShadow = false; staticRoot.add(lawn);
  const path = plane(7, 3.2, M('path', () => new THREE.MeshStandardMaterial({ color: 0xcfd2d4, roughness: 1 })), B.x2 + 4.3, -0.15, 0); path.rotation.x = -Math.PI / 2; path.castShadow = false; staticRoot.add(path);

  // floors
  const woodDark = floorMat('walnut', tex.wood, 10, 7, [2.4, 1.2], 0x8a6a52, 0.42);
  const woodOak = floorMat('oak', tex.wood, 7, 7, [2.4, 1.2], 0xf0dcc0, 0.45);
  const terr = (k, sx, sz) => floorMat('terr' + k, T.terrazzoTex(), sx, sz, [1.2, 1.2], 0xffffff, 0.35);
  const carpet = (k, col, sx, sz) => floorMat('carpet' + k, T.carpetTex(col, k.length * 7 + 3), sx, sz, [0.6, 0.6], 0xffffff, 1);
  const R = ROOMS;
  floor('pres', R.presidencia.x1, R.presidencia.z1, R.presidencia.x2, R.presidencia.z2, woodDark);
  floor('vendas', R.vendas.x1, R.vendas.z1, R.vendas.x2, R.vendas.z2, carpet('vendas', '#8fa3b3', 11, 7));
  floor('reuniao', R.reuniao.x1, R.reuniao.z1, R.reuniao.x2, R.reuniao.z2, woodOak);
  floor('recepcao', R.recepcao.x1, R.recepcao.z1, R.recepcao.x2, R.recepcao.z2, terr('rec', 8, 7));
  floor('corredor', B.x1, B.c1, B.x2, B.c2, terr('cor', 36, 3));
  floor('ops', R.operacoes.x1, R.operacoes.z1, R.operacoes.x2, R.operacoes.z2, carpet('ops', '#5d6b78', 7, 7));
  floor('mercado', R.mercado.x1, R.mercado.z1, R.mercado.x2, R.mercado.z2, carpet('mercado', '#b3a89a', 6, 7));
  floor('criativo', R.criativo.x1, R.criativo.z1, R.criativo.x2, R.criativo.z2, floorMat('conc1', T.concreteTex(3, '#d6d8da'), 7, 7, [3.5, 3.5], 0xffffff, 0.45));
  floor('ti', R.ti.x1, R.ti.z1, R.ti.x2, R.ti.z2, floorMat('conc2', T.concreteTex(8, '#b9bec4'), 7, 7, [3.5, 3.5], 0xffffff, 0.4));
  floor('fin', R.financeiro.x1, R.financeiro.z1, R.financeiro.x2, R.financeiro.z2, carpet('fin', '#9db0a6', 5, 7));
  floor('copa', R.copa.x1, R.copa.z1, R.copa.x2, R.copa.z2, floorMat('tile', T.tileTex(), 4, 7, [0.6, 0.6], 0xffffff, 0.3));
  // brand red inlay lines along the corridor
  for (const zz of [-1.32, 1.32]) { const l = plane(B.x2 - B.x1 - 0.4, 0.05, MAT.basic(0xed3237), 0, 0.004, zz); l.rotation.x = -Math.PI / 2; l.castShadow = false; staticRoot.add(l); }

  // exterior walls (inner faces exactly on the building bounds)
  const eT = 0.22;
  wall(B.x1 - eT, B.z1 - eT / 2, B.x2 + eT, B.z1 - eT / 2, 'N', wallWhite, { t: eT, cast: false });
  wall(B.x1 - eT, B.z2 + eT / 2, B.x2 + eT, B.z2 + eT / 2, 'S', wallWhite, { t: eT, cast: false });
  wallWithGaps('z', B.x2 + eT / 2, B.z1, B.z2, [[-1.15, 1.15]], 'E', wallWhite, { t: eT, cast: false });
  // west wall has real window openings: the afternoon sun comes in through them (and through the blinds)
  const wallW = clipM(wallWhite, 'W'); wallW.clipShadows = false;
  const WIN = [{ z: -6.6, w: 2.2, y0: 0.9, y1: 2.4, blinds: true }, { z: -3.4, w: 2.2, y0: 0.9, y1: 2.4, blinds: true }, { z: 0, w: 2.0, y0: 0.85, y1: 2.45 }, { z: 5.0, w: 2.4, y0: 0.9, y1: 2.4 }];
  { let cur = B.z1; const X = B.x1 - eT / 2; const seg = (a, b, o) => wall(X, a, X, b, 'W', wallWhite, { t: eT, ...o });
    for (const o of WIN) { const a = o.z - o.w / 2, b = o.z + o.w / 2; seg(cur, a); seg(a, b, { y1: o.y0 }); seg(a, b, { y0: o.y1, cap: false, nav: false }); cur = b;
      const fr = new THREE.Group(); const hh = o.y1 - o.y0; const fm = MAT.white();
      fr.add(box(0.06, 0.06, o.w + 0.1, fm, 0, o.y0 - 0.02, 0)); fr.add(box(0.26, 0.035, o.w + 0.16, fm, 0.1, o.y0 - 0.005, 0)); fr.add(box(0.06, 0.06, o.w + 0.1, fm, 0, o.y1 + 0.02, 0)); for (const s of [-1, 1]) fr.add(box(0.06, hh, 0.06, fm, 0, o.y0 + hh / 2, s * (o.w / 2 + 0.02)));
      const n = Math.max(1, Math.round(o.w / 1.1)); for (let i = 1; i < n; i++) fr.add(box(0.04, hh, 0.035, fm, 0, o.y0 + hh / 2, -o.w / 2 + i * o.w / n));
      fr.add(box(0.01, hh, o.w, glassMat, -0.02, o.y0 + hh / 2, 0, { cast: false }));
      if (o.blinds) { const bl = F.blinds(o.w, hh - 0.06, { tilt: -0.55 }); bl.rotation.y = Math.PI / 2; bl.position.set(0.02, o.y0 + hh / 2, 0); fr.add(bl); }
      fr.position.set(B.x1 - 0.04, 0, o.z); mount(fr, 'W'); fr.traverse(m => { if (m.isMesh) { m.material.clipShadows = false; } }); staticRoot.add(fr); }
    seg(cur, B.z2); }
  for (const m of clipCache.values()) if (m.name.endsWith('@W')) m.clipShadows = false;
  // skyline seen through the west windows (only shown from inside)
  { const bd = plane(110, 30, skyMat, B.x1 - 34, 11.5, 0); bd.rotation.y = Math.PI / 2; bd.castShadow = false; bd.receiveShadow = false; bd.userData.dynamic = true; bd.layers.set(0); bd.material = new THREE.MeshBasicMaterial({ map: skyTex[0], toneMapped: false }); W.backdrop = bd; dynRoot.add(bd); }
  // partitions
  for (const x of [-8, 3, 10]) wall(x, B.z1, x, B.c1, 'P');
  for (const x of [-11, -5, 2, 9, 14]) wall(x, B.c2, x, B.z2, 'P');
  // glass fronts
  glassFront(B.c1, -18, -8, [R.presidencia.door], -1, R.presidencia);
  glassFront(B.c1, -8, 3, [R.vendas.door], -1, R.vendas);
  glassFront(B.c1, 3, 10, [R.reuniao.door], -1, R.reuniao);
  glassFront(B.c2, -18, -11, [R.operacoes.door], 1, R.operacoes);
  glassFront(B.c2, -11, -5, [R.mercado.door], 1, R.mercado);
  glassFront(B.c2, -5, 2, [R.criativo.door], 1, R.criativo);
  glassFront(B.c2, 2, 9, [R.ti.door], 1, R.ti);
  glassFront(B.c2, 9, 14, [R.financeiro.door], 1, R.financeiro);
  // one tinted wall per room (east side), so every office reads as its own place
  for (const [x, z1, z2, col] of [[3, B.z1, B.c1, 0xdcefe6], [10, B.z1, B.c1, 0xdfe4ea], [-11, B.c2, B.z2, 0x1f2937], [-5, B.c2, B.z2, 0xfbe8c4], [2, B.c2, B.z2, 0xf3d9f8], [9, B.c2, B.z2, 0xd9e6fb], [14, B.c2, B.z2, 0xd3efe9]]) { const g = new THREE.Group(); g.add(box(Math.abs(z2 - z1) - 0.12, H, 0.008, MAT.color(col, 0.92), 0, 0, 0.004, { cast: false })); g.position.set(x - 0.062, H / 2, (z1 + z2) / 2); g.rotation.y = -Math.PI / 2; mount(g, 'P'); staticRoot.add(g); }
  { const g = new THREE.Group(); g.add(box(B.z2 - B.c2 - 0.3, H, 0.008, MAT.color(0xf3dccb, 0.92), 0, 0, 0.004, { cast: false })); g.position.set(B.x2 - 0.003, H / 2, (B.c2 + B.z2) / 2); g.rotation.y = -Math.PI / 2; mount(g, 'E'); staticRoot.add(g); }
  // columns at the open rooms
  for (const [x, z] of [[10, B.c1], [14, B.c2]]) { staticRoot.add(box(0.3, H, 0.3, clipM(wallWhite, 'P'), x, H / 2, z)); obstacle(x - 0.15, z - 0.15, x + 0.15, z + 0.15); }
  // entrance: glass doors on the east wall
  { const g = new THREE.Group(); for (const s of [-1, 1]) { const leaf = new THREE.Group(); leaf.add(box(0.012, 2.1, 1.08, glassMat, 0, 1.06, s * 0.55, { cast: false })); leaf.add(box(0.03, 0.05, 1.1, frameMat, 0, 2.1, s * 0.55)); leaf.add(box(0.03, 0.05, 1.1, frameMat, 0, 0.03, s * 0.55)); leaf.add(box(0.03, 2.1, 0.04, frameMat, 0, 1.06, s * 0.02)); leaf.add(box(0.03, 2.1, 0.04, frameMat, 0, 1.06, s * 1.09)); leaf.add(box(0.07, 0.5, 0.03, MAT.chrome(), 0, 1.1, s * 0.13)); g.add(leaf); } g.position.set(B.x2 + 0.1, 0, 0); mount(g, 'E'); staticRoot.add(g); obstacle(B.x2 + 0.05, -1.15, B.x2 + 0.2, 1.15); }
  // ceiling (only shown when the camera is inside)
  const ceiling = new THREE.Group(); ceiling.userData.dynamic = true; dynRoot.add(ceiling);
  { const c = plane(B.x2 - B.x1, B.z2 - B.z1, new THREE.MeshStandardMaterial({ color: 0xf7f7f5, roughness: 0.95, side: THREE.DoubleSide, emissive: 0xffffff, emissiveIntensity: 0.32 }), 0, H, 0); c.rotation.x = Math.PI / 2; c.castShadow = false; c.receiveShadow = false; ceiling.add(c);
    const pm = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }); pm.userData.bloom = true; const pg = new THREE.BoxGeometry(1.2, 0.02, 0.3); const pts = [];
    for (let x = B.x1 + 2; x < B.x2; x += 3) { pts.push([x, 0, 0]); for (const z of [-6.6, -3.6, 3.6, 6.6]) pts.push([x, z, 1]); }
    const im = new THREE.InstancedMesh(pg, pm, pts.length); const mtx = new THREE.Matrix4(); pts.forEach((p, i) => { mtx.makeRotationY(p[2] ? 0 : 0); mtx.setPosition(p[0], H - 0.012, p[1]); im.setMatrixAt(i, mtx); }); im.layers.enable(BLOOM_LAYER); ceiling.add(im); }
  W.ceiling = ceiling;

  // ================================================================== LIGHT FIXTURES & HELPERS
  const lamp = (x, y, z, color, intensity, dist = 7, spotTarget = null) => { const l = spotTarget ? new THREE.SpotLight(color, intensity, dist, 0.62, 0.65, 1.5) : new THREE.PointLight(color, intensity, dist, 1.7); l.position.set(x, y, z); if (spotTarget) { l.target.position.set(...spotTarget); scene.add(l.target); } l.userData.base = intensity; scene.add(l); W.lamps.push(l); return l; };
  const hang = (obj, x, z, yaw = 0) => add(obj, x, z, yaw, { y: H });
  const logoMat = M('logoRed', () => new THREE.MeshBasicMaterial({ map: tex.logo, transparent: true }));
  const hashId = (s) => { let h = 7; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };
  const titled = (obj, title, extra = {}) => { const m = obj.userData.screenMesh; if (m) m.userData.screen = Object.assign(m.userData.screen || {}, { title }, extra); return obj; };

  // ================================================================== STATIONS
  // A desk seat: pos = pelvis position while working, yaw = facing. Desk is placed in front automatically.
  function seat(id, room, x, z, yaw, { chair = F.officeChair(), rollBack = 0.5, kind = 'desk', visitor = null } = {}) {
    const f = fwd(yaw); const hs = hashId(id); const s = { id, room, pos: new THREE.Vector3(x, 0, z), yaw, rollBack, kind, by: null, visitor, chair, rolled: 1, free: true, rest: ((hs % 100) / 100 - 0.5) * 0.62, swivel: ((hs % 100) / 100 - 0.5) * 0.62 };
    compact(chair); chair.userData.dynamic = true; chair.traverse(o => { o.userData.dynamic = true; });
    add(chair, 0, 0, yaw, { dyn: true }); W.chairs.push(s); W.seats.set(id, s); placeChair(s); return s;
  }
  function placeChair(s) { const f = fwd(s.yaw); const k = 0.09 - s.rollBack * s.rolled; s.chair.position.set(s.pos.x + f.x * k, 0, s.pos.z + f.z * k); s.chair.rotation.y = s.yaw + (s.swivel || 0); }
  W.placeChair = placeChair;
  function deskFor(s, deskObj, d) { const f = fwd(s.yaw); const k = 0.34 + d / 2; add(deskObj, s.pos.x + f.x * k, s.pos.z + f.z * k, s.yaw, { nav: true }); return deskObj; }
  // put an object on a desk in desk-local coords (lx to the user's right is -x in desk space when yaw=0 ... handled by the group)
  const onDesk = (deskObj, obj, lx, lz, ry = 0, h = 0.74) => { obj.position.set(lx, h, lz); obj.rotation.y = ry; deskObj.add(obj); return obj; };
  // where the wrists go when this seat's user types / uses the mouse (desk-local: the user sits at -z, their right hand is -x)
  const hands = (s, dk, edge, { mouse = true, dx = 0.1, y = 0.795 } = {}) => { dk.updateMatrixWorld(true); const P = (x, yy, z) => dk.localToWorld(new THREE.Vector3(x, yy, z)); s.kb = [P(dx, y, edge + 0.035), P(-dx, y, edge + 0.035)]; s.mouse = mouse ? P(-0.32, y - 0.005, edge + 0.05) : null; };
  function spot(id, room, x, z, yaw, kind = 'stand') { const s = { id, room, pos: new THREE.Vector3(x, 0, z), yaw, kind, by: null }; W.spots.set(id, s); return s; }
  const mon = (key, kind, opt = {}) => F.monitor({ w: opt.w || 0.6, h: opt.h || 0.34, tex: T.screenTex(kind, opt), key });
  function workDesk(id, room, x, z, yaw, { w = 1.6, screens = [['crm', 1]], accent, top, extras = true, visitor } = {}) {
    const s = seat(id, room, x, z, yaw, { visitor }); const d = 0.75; const dk = deskFor(s, F.desk({ w, d, top: top || MAT.white() }), d);
    const n = screens.length; screens.forEach(([kind, seed], i) => { const m = mon(`${id}:${i}`, kind, { seed, accent: hex(accent || 0xed3237) }); const off = (i - (n - 1) / 2) * 0.64; onDesk(dk, m, off, 0.16, Math.PI + (n > 1 ? -(i - (n - 1) / 2) * 0.22 : 0)); });
    onDesk(dk, F.keyboardMouse(), 0, -0.265, Math.PI);
    dk.traverse(o => { if (o.userData.screen) { o.userData.screen.owner = id; } });
    hands(s, dk, -d / 2);
    s.monitors = screens.map((_, i) => dk.localToWorld(new THREE.Vector3((i - (n - 1) / 2) * 0.64, 1.16, 0.16)));
    if (extras) { const h = hashId(id);
      onDesk(dk, h % 3 === 0 ? F.brandMug(logoMat) : F.mug([0xffffff, 0xed3237, 0x1c1f24, 0xf59e0b][h % 4]), -w / 2 + 0.17, -0.2, (h % 7) * 0.4);
      if (h % 2) onDesk(dk, F.bottle([0x4aa3df, 0x6fcf97, 0xbdbdbd][h % 3]), w / 2 - 0.1, 0.22);
      if (h % 3 === 1) onDesk(dk, F.headphones(), w / 2 - 0.3, -0.16, 0.5 + (h % 5) * 0.2); else if (h % 3 === 2) onDesk(dk, F.notepad([0xf2c94c, 0xed3237, 0x2f80ed][h % 3]), w / 2 - 0.27, -0.16, 0.25); else onDesk(dk, F.papers(2), w / 2 - 0.25, -0.12, 0.3); }
    return s;
  }

  // ------------------------------------------------------------- PRESIDÊNCIA
  {
    const r = R.presidencia; const cx = -12.8;
    // feature wall: wood slats + illuminated logo
    const slat = new THREE.Group(); const sm = M('slats', () => new THREE.MeshStandardMaterial({ map: (() => { const t = T.toTex(T.slatTex()); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(14, 1); return t; })(), roughness: 0.55 }));
    slat.add(box(5.6, H - 0.02, 0.05, sm, 0, 0, 0.025, { cast: false })); onWall(slat, 'N', cx, H / 2);
    const lb = new THREE.Group();
    lb.add(box(4.1, 1.42, 0.07, MAT.color(0x15171a, 0.4, 0.4), 0, 0, 0.035, { r: 0.02 }));
    const face = plane(4.0, 1.32, M('lightbox', () => { const m = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.62, roughness: 0.5 }); m.userData.bloom = true; return m; }), 0, 0, 0.072); face.castShadow = false; lb.add(face);
    const lg = plane(3.6, 3.6 * 154 / 500, logoMat, 0, 0, 0.078); lg.castShadow = false; lb.add(lg);
    const glow = plane(4.9, 2.1, M('glow', () => new THREE.MeshBasicMaterial({ map: T.toTex((() => { const c = T.canvas(256, 128), g = c.getContext('2d'); const gr = g.createRadialGradient(128, 64, 10, 128, 64, 128); gr.addColorStop(0, 'rgba(255,240,225,0.55)'); gr.addColorStop(1, 'rgba(255,240,225,0)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 128); return c; })()), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })), 0, 0, 0.052); glow.castShadow = false; lb.add(glow);
    onWall(lb, 'N', cx, 2.02); W.logoWall = new THREE.Vector3(cx, 2.02, B.z1);
    // framed dollar bill with picture light
    const bw = 1.2, bh = bw * 505 / 1200; const fr = F.framed({ w: bw, h: bh, tex: tex.dollar, key: 'dollar', frame: MAT.brass(), mat: 0.13, fw: 0.05, depth: 0.045, glass: true });
    const pl = new THREE.Group(); pl.add(box(0.7, 0.03, 0.05, MAT.brass(), 0, bh / 2 + 0.32, 0.17)); pl.add(box(0.03, 0.03, 0.17, MAT.brass(), 0, bh / 2 + 0.32, 0.085)); const st = box(0.62, 0.008, 0.035, MAT.emissive(0xfff0cf, 2.2), 0, bh / 2 + 0.303, 0.17, { cast: false }); pl.add(st); fr.add(pl);
    onWall(fr, 'N', -9.12, 1.62); W.dollar = new THREE.Vector3(-9.12, 1.62, B.z1);
    // desk + executive chair
    const s = seat('thiago', 'presidencia', cx, -6.75, 0, { chair: F.officeChair({ fabric: MAT.leather(), exec: true }), visitor: [[cx, -4.4], [cx + 1.75, -4.95]] });
    const dk = deskFor(s, F.execDesk(), 1.0);
    onDesk(dk, F.laptop(T.screenTex('chart', { seed: 4, accent: '#ed3237', title: 'Balão · visão geral' }), 'lap:thiago'), 0.0, -0.3, Math.PI, 0.755); hands(s, dk, -0.5, { mouse: false, dx: 0.085, y: 0.8 }); dk.traverse(o => { if (o.userData.screen) o.userData.screen.owner = 'thiago'; }); s.monitors = [dk.localToWorld(new THREE.Vector3(0, 0.9, -0.2))];
    onDesk(dk, F.nameplate(config.president.name.toUpperCase(), config.president.title.toUpperCase()), 0, 0.4, 0, 0.75);
    onDesk(dk, F.deskLamp(), 0.92, 0.12, 2.4, 0.75); onDesk(dk, F.phoneDesk(), 0.62, -0.1, Math.PI + 0.3, 0.75); onDesk(dk, F.papers(4), -0.62, -0.08, 0.2, 0.755); onDesk(dk, F.brandMug(logoMat), -0.92, 0.15, 0.6, 0.75); onDesk(dk, F.notepad(0x1c1f24), 0.55, -0.3, -0.2, 0.755);
    add(F.rug(4.6, 3.3, 0x34373d, 0xb12a2f), cx, -5.7);
    add(F.guestChair(MAT.leatherTan()), cx - 0.85, -4.8, Math.PI + 0.14, { nav: true }); add(F.guestChair(MAT.leatherTan()), cx + 0.85, -4.8, Math.PI - 0.14, { nav: true });
    // lounge
    add(F.rug(3.2, 3.0, 0x8d8f93), -16.25, -3.45);
    add(F.sofa({ w: 2.3, fabric: MAT.leather() }), -17.42, -3.45, Math.PI / 2, { nav: true });
    add(F.coffeeTable({}), -16.05, -3.45, Math.PI / 2, { nav: true });
    add(F.armchair(MAT.leatherTan()), -15.05, -2.7, -Math.PI / 2 - 0.25, { nav: true }); add(F.armchair(MAT.leatherTan()), -15.05, -4.15, -Math.PI / 2 + 0.25, { nav: true });
    add(F.floorLamp(), -17.45, -1.95);
    add(F.credenza({ w: 2.0 }), -17.72, -6.6, Math.PI / 2, { nav: true });
    { const g = new THREE.Group(); g.add(cyl(0.06, 0.08, 0.04, MAT.darkWood(), 0, 0.02, 0, 16)); g.add(cyl(0.02, 0.02, 0.14, MAT.brass(), 0, 0.11, 0, 8)); const cup = cyl(0.07, 0.035, 0.14, MAT.brass(), 0, 0.25, 0, 16); g.add(cup); add(g, -17.72, -6.1, 0, { y: 0.72 }); const gl = new THREE.Mesh(new THREE.SphereGeometry(0.15, 24, 16), MAT.color(0x2a5d8f, 0.4)); gl.position.set(-17.72, 0.72 + 0.22, -7.15); gl.castShadow = true; staticRoot.add(gl); staticRoot.add(cyl(0.08, 0.1, 0.05, MAT.brass(), -17.72, 0.745, -7.15, 16)); }
    add(F.bookshelf({ w: 2.6, h: 2.2, seed: 3 }), -8.24, -4.6, -Math.PI / 2, { nav: true });
    add(F.plant({ h: 1.7, pot: MAT.potDark() }), -17.4, -8.0); add(F.plant({ h: 1.4, pot: MAT.potDark(), kind: 1 }), -8.55, -2.05);
    lamp(-17.4, 1.55, -1.95, 0xffd9a8, 5.5, 6.5); lamp(-11.85, 1.15, -5.75, 0xffe2b8, 2.6, 3.6); lamp(-9.12, 2.72, -7.55, 0xfff0d6, 22, 4.5, [-9.12, 1.6, -8.5]); lamp(cx, 2.7, -7.3, 0xfff3e2, 20, 6, [cx, 1.2, -8.4]);
    add(F.plant({ h: 1.5, pot: MAT.potDark(), kind: 2 }), -10.6, -8.0);
    spot('pres.window', 'presidencia', -16.4, -5.1, -Math.PI / 2, 'phone');
    spot('pres.lounge', 'presidencia', -15.9, -5.6, -2.4, 'stand');
  }
  // ------------------------------------------------------------- VENDAS
  {
    const r = R.vendas; const a = r.accent;
    accentBand('N', -8 + 0.06, 3 - 0.06, 0xe9f5f0);
    const scr = (k, s) => [k, s];
    workDesk('julia', 'vendas', -5.9, -7.15, 0, { screens: [scr('crm', 2), scr('chart', 3)], accent: a, visitor: [[-5.9, -5.25]] });
    workDesk('vendas', 'vendas', -2.5, -7.15, 0, { w: 1.8, screens: [scr('chart', 5), scr('crm', 6)], accent: a, visitor: [[-2.5, -5.25]] });
    workDesk('vitoria', 'vendas', 0.9, -7.15, 0, { screens: [scr('crm', 7), scr('sheet', 8)], accent: a, visitor: [[0.9, -5.25]] });
    workDesk('claudia', 'vendas', -5.9, -3.0, Math.PI, { screens: [scr('crm', 9), scr('pix', 10)], accent: a, visitor: [[-4.65, -3.2]] });
    workDesk('maria', 'vendas', -2.5, -3.0, Math.PI, { screens: [scr('chart', 11), scr('sheet', 12)], accent: a, visitor: [[-1.25, -3.2]] });
    onWall(titled(F.tv({ w: 2.0, h: 1.12, tex: T.screenTex('chart', { seed: 21, accent: hex(a), title: 'Painel de vendas' }), key: 'tv:vendas' }), 'Painel de vendas'), 'N', -2.5, 2.02);
    hang(F.linearLight(3.0, 0.62), -4.2, -6.45); hang(F.linearLight(3.0, 0.62), -0.8, -6.45); hang(F.linearLight(3.4, 0.62), -4.2, -3.7); lamp(-2.5, 2.2, -6.3, 0xf4f7ff, 7.5, 8); lamp(-4.2, 2.2, -3.6, 0xf4f7ff, 6.5, 7);
    onWall(wallText('VENDAS', 1.9, 0.42, hex(a)), 'N', -6.3, 2.3);
    onWall(F.whiteboard({ w: 2.0, h: 1.1, seed: 4, accent: hex(a) }), 'pw', -4.0, 1.55, 'P', 3);
    add(F.highTable({ w: 1.4 }), 1.6, -3.4, 0, { nav: true }); add(F.stool(), 1.1, -2.85); add(F.stool(), 2.1, -2.85);
    { const pr = add(F.printer(), 2.62, -5.6, -Math.PI / 2, { nav: true }); const pg = new THREE.Group(); pg.position.copy(pr.position); pg.rotation.y = pr.rotation.y; pg.userData.dynamic = true; dynRoot.add(pg); W.printer = { group: pg, sheets: [] }; }
    add(F.plant({ h: 1.5, kind: 2 }), -7.5, -2.05); add(F.plant({ h: 1.3, kind: 1 }), 2.55, -7.95); add(F.bin(), -4.2, -7.9); add(F.plant({ h: 1.2 }), -7.5, -4.9);
    spot('vendas.board', 'vendas', 1.9, -4.5, Math.PI / 2, 'present');
    spot('vendas.t1', 'vendas', 1.15, -4.0, 0, 'table'); spot('vendas.t2', 'vendas', 2.1, -4.0, 0, 'table');
    spot('vendas.printer', 'vendas', 1.95, -5.6, Math.PI / 2, 'docs');
  }
  // ------------------------------------------------------------- REUNIÃO
  {
    const tx = 6.5, tz = -5.1, tw = 3.4, td = 1.2;
    add(F.rug(5.0, 3.6, 0x55606b), tx, tz);
    add(F.meetingTable({ w: tw, d: td }), tx, tz, 0, { nav: true });
    let i = 1; const mk = (x, z, yaw) => seat('reuniao.s' + (i++), 'reuniao', x, z, yaw, { chair: F.officeChair({ fabric: MAT.fabricGray() }), kind: 'meeting', rollBack: 0.45 });
    for (const x of [5.4, 6.5, 7.6]) mk(x, tz - td / 2 - 0.34, 0);
    for (const x of [5.4, 6.5, 7.6]) mk(x, tz + td / 2 + 0.34, Math.PI);
    mk(tx - tw / 2 - 0.34, tz, Math.PI / 2);
    for (const sd of W.chairs.filter(c => c.kind === 'meeting')) { sd.rolled = 0.35; placeChair(sd); }
    onWall(titled(F.tv({ w: 2.3, h: 1.3, tex: T.screenTex('dash', { seed: 31, accent: '#ed3237', title: 'Pauta da reunião' }), key: 'tv:reuniao' }), 'Pauta da reunião'), 'N', 6.5, 1.8);
    for (const x of [5.4, 6.5, 7.6]) hang(F.pendant({ r: 0.19, drop: 0.78 }), x, tz); lamp(tx, 1.85, tz, 0xffe2bd, 9.5, 8);
    onWall(F.whiteboard({ w: 2.2, h: 1.15, seed: 9 }), 'pw', -5.2, 1.55, 'P', 10);
    add(F.credenza({ w: 1.8, wood: MAT.oak(), front: MAT.white() }), 3.34, -6.4, Math.PI / 2, { nav: true }); add(F.plant({ h: 1.6 }), 9.45, -8.0); add(F.plant({ h: 1.3, kind: 1 }), 9.4, -2.1);
    { const m = F.mug(0xffffff); add(m, tx - 0.5, tz + 0.2, 0, { y: 0.76 }); add(F.papers(3), tx + 0.6, tz - 0.15, 0.4, { y: 0.76 }); add(F.laptop(T.screenTex('sheet', { seed: 2 }), 'lap:reuniao'), tx - 0.2, tz - 0.25, Math.PI, { y: 0.76 }); }
    spot('reuniao.present', 'reuniao', 8.45, -7.55, 0.15, 'present');
  }
  // ------------------------------------------------------------- RECEPÇÃO
  {
    accentBand('N', 10.06, 18, 0xffffff);
    const lg = new THREE.Group(); lg.add(box(4.6, 1.7, 0.05, MAT.color(0xffffff, 0.5), 0, 0, 0.025, { r: 0.02 })); const lp = plane(4.1, 4.1 * 154 / 500, M('logoRed2', () => new THREE.MeshBasicMaterial({ map: tex.logo, transparent: true })), 0, 0, 0.056); lp.castShadow = false; lg.add(lp); lg.add(box(4.6, 0.05, 0.06, MAT.red(), 0, -0.88, 0.03));
    onWall(lg, 'N', 14.3, 1.95);
    const dk = F.receptionDesk(tex.logoWhite); add(dk, 14.3, -5.0, 0, { nav: true });
    const s = seat('recepcao', 'recepcao', 14.3, -5.81, 0, { visitor: [[14.3, -3.75]] });
    const m1 = mon('rec:0', 'crm', { seed: 41 }); m1.position.set(-0.5, 0.755, -0.05); m1.rotation.y = Math.PI - 0.25; dk.add(m1); const kb = F.keyboardMouse(false); kb.position.set(0, 0.755, -0.36); kb.rotation.y = Math.PI; dk.add(kb); hands(s, dk, -0.47, { y: 0.8 }); s.monitors = [dk.localToWorld(new THREE.Vector3(-0.5, 1.15, -0.05))]; const ph = F.phoneDesk(); ph.position.set(0.7, 0.755, -0.25); ph.rotation.y = Math.PI; dk.add(ph);
    for (const x of [13.5, 15.1]) hang(F.pendant({ color: MAT.red(), r: 0.21, drop: 0.72 }), x, -4.72); lamp(14.3, 1.9, -4.55, 0xffe6c8, 8.5, 8);
    add(F.rug(3.6, 3.0, 0xb7b2a8), 11.9, -5.4);
    add(F.sofa({ w: 2.3, fabric: MAT.fabricRed() }), 10.52, -5.4, Math.PI / 2, { nav: true }); add(F.coffeeTable({ top: MAT.white() }), 11.95, -5.4, Math.PI / 2, { nav: true }); add(F.armchair(MAT.fabricGray()), 11.9, -7.35, 0.0, { nav: true });
    add(F.plant({ h: 1.8, kind: 2 }), 10.5, -8.0); add(F.plant({ h: 1.6, kind: 1 }), 17.45, -8.0); add(F.plant({ h: 1.4 }), 17.45, -1.95); add(F.waterCooler(), 17.6, -6.4, -Math.PI / 2, { nav: true });
    onWall(windowPanel(2.6, 1.6), 'E', -4.4, 1.65);
    { const mat = box(1.6, 0.012, 2.0, MAT.color(0x3a3d42, 1), 16.9, 0.006, 0, { cast: false }); staticRoot.add(mat); }
    onWall(F.clock(), 'E', -6.9, 2.15);
    spot('recepcao.wait', 'recepcao', 12.9, -3.2, 2.4, 'stand');
  }
  // ------------------------------------------------------------- OPERAÇÕES (HERMES)
  {
    const r = R.operacoes; const a = r.accent;
    const vc = T.canvas(1024, 576); const vt = T.toTex(vc); const vm = new THREE.MeshBasicMaterial({ map: vt, toneMapped: false }); vm.name = 'videowall'; vm.userData.bloom = true;
    const vw = F.tv({ w: 3.5, h: 1.97, tex: vm }); vw.userData.screenMesh.userData.screen = { canvas: vc, w: 3.5, h: 1.97, title: 'Central de orquestração', live: true }; onWall(vw, 'pw', 5.0, 1.72, 'P', -11); W.videoWall = { canvas: vc, tex: vt };
    lamp(-12.1, 1.7, 5.0, 0x7fd0ff, 5.5, 6.5); hang(F.pendant({ r: 0.22, drop: 0.8 }), -16.4, 3.3); lamp(-16.4, 1.8, 3.3, 0xffe2bd, 6, 6);
    const s = seat('hermes', 'operacoes', -14.35, 5.0, Math.PI / 2, { visitor: [[-14.2, 3.35], [-14.2, 6.7]] });
    const dk = deskFor(s, F.desk({ w: 2.3, d: 0.8, top: MAT.color(0x23262b, 0.5) }), 0.8);
    [['dash', 51], ['terminal', 52], ['chart', 53]].forEach(([k, sd], i) => { const m = mon('ops:' + i, k, { seed: sd, accent: hex(a) }); onDesk(dk, m, (i - 1) * 0.66, 0.18, Math.PI - (i - 1) * 0.3); });
    dk.traverse(o => { if (o.userData.screen) o.userData.screen.owner = 'hermes'; }); hands(s, dk, -0.4); s.monitors = [-1, 0, 1].map(i => dk.localToWorld(new THREE.Vector3(i * 0.66, 1.16, 0.18))); onDesk(dk, F.headphones(), 0.95, 0.15, 0.4); onDesk(dk, F.bottle(0x4aa3df), -1.02, 0.2);
    onDesk(dk, F.keyboardMouse(), 0, -0.29, Math.PI); onDesk(dk, F.mug(0x1c1f24), -0.9, -0.15); onDesk(dk, F.phoneDesk(), 0.9, -0.12, Math.PI);
    add(F.roundTable({ r: 0.5, h: 1.06, top: MAT.oak() }), -16.4, 3.3, 0, { nav: true });
    spot('ops.t1', 'operacoes', -16.4, 2.5, 0, 'table'); spot('ops.t2', 'operacoes', -17.15, 3.6, 1.9, 'table');
    spot('ops.wall', 'operacoes', -12.6, 6.9, 1.2, 'think');
    add(F.bookshelf({ w: 2.0, h: 1.3, wood: MAT.white(), seed: 8 }), -17.8, 6.6, Math.PI / 2, { nav: true }); add(F.plant({ h: 1.6 }), -17.4, 8.0); add(F.plant({ h: 1.3, kind: 1 }), -11.5, 2.05);
    add(F.sofa({ w: 1.9, fabric: MAT.fabricBlue() }), -14.6, 8.02, Math.PI, { nav: true });
  }
  // ------------------------------------------------------------- MERCADO
  {
    const a = R.mercado.accent;
    workDesk('mercado', 'mercado', -8.6, 4.3, 0, { w: 1.8, screens: [['prices', 61], ['sheet', 62]], accent: a, visitor: [[-8.6, 6.45]] });
    onWall(titled(F.tv({ w: 1.9, h: 1.07, tex: T.screenTex('prices', { seed: 63, accent: hex(a), title: 'Monitor de preços' }), key: 'tv:mercado' }), 'Monitor de preços'), 'pw', 5.3, 1.72, 'P', -5);
    hang(F.pendant({ r: 0.2, drop: 0.8 }), -8.6, 5.0); lamp(-8.6, 1.8, 5.0, 0xffe2bd, 6.5, 6.5);
    onWall(F.whiteboard({ w: 1.8, h: 1.0, seed: 6, accent: hex(a) }), 'pe', 6.2, 1.55, 'P', -11);
    add(F.bookshelf({ w: 2.2, h: 1.9, wood: MAT.oak(), seed: 12 }), -8.3, 8.3, Math.PI, { nav: true });
    add(F.plant({ h: 1.5 }), -10.5, 8.0); add(F.plant({ h: 1.2, kind: 1 }), -5.55, 2.1); add(F.bin(), -10.1, 4.1);
    spot('mercado.tv', 'mercado', -6.35, 5.3, Math.PI / 2, 'think');
    spot('mercado.board', 'mercado', -9.9, 6.2, -Math.PI / 2, 'present');
  }
  // ------------------------------------------------------------- CRIATIVO
  {
    const a = R.criativo.accent;
    const s = workDesk('criativo', 'criativo', -3.3, 4.3, 0, { w: 1.9, screens: [['design', 71]], accent: a, top: MAT.oak(), visitor: [[-3.3, 6.5]] });
    // photo set against the east partition
    const sweepMat = MAT.color(0xffb23e, 0.9);
    const back = box(0.03, 2.5, 2.8, sweepMat, 1.9, 1.25, 5.7, { cast: false }); staticRoot.add(back);
    const fl = box(1.7, 0.012, 2.8, sweepMat, 1.05, 0.006, 5.7, { cast: false }); staticRoot.add(fl);
    const roll = cyl(0.05, 0.05, 2.9, MAT.blackMetal(), 1.88, 2.52, 5.7, 12); roll.rotation.x = Math.PI / 2; staticRoot.add(roll);
    add(F.pedestal(0.8), 1.15, 5.7, 0, { nav: true }); add(F.pcTower(), 1.15, 5.7, -Math.PI / 2 - 0.5, { y: 0.8 });
    add(F.softbox(), -0.05, 4.2, 0.95, { nav: true }); add(F.softbox(), -0.05, 7.2, 2.2, { nav: true }); add(F.tripodCamera(), -0.55, 5.7, Math.PI / 2, { nav: true }); add(F.ringLight(), 0.45, 4.55, 0.9, { nav: true });
    lamp(0.0, 1.9, 4.25, 0xfff2de, 26, 6, [1.15, 1.0, 5.7]); lamp(0.0, 1.9, 7.15, 0xfff2de, 22, 6, [1.15, 1.0, 5.7]); hang(F.pendant({ color: MAT.color(0xd946ef, 0.5), r: 0.2, drop: 0.8 }), -3.3, 5.0); lamp(-3.3, 1.8, 5.0, 0xffe2bd, 6, 6.5);
    spot('criativo.photo', 'criativo', -1.15, 5.7, Math.PI / 2, 'work');
    [0, 1, 2].forEach(i => onWall(F.framed({ w: 0.62, h: 0.87, tex: T.posterTex(i + 2), key: 'poster' + i, frame: MAT.black() }), 'pe', 3.2 + i * 0.95, 1.7, 'P', -5));
    add(F.bookshelf({ w: 1.6, h: 1.5, wood: MAT.white(), seed: 5 }), -3.6, 8.3, Math.PI, { nav: true });
    add(F.plant({ h: 1.6, kind: 1 }), -4.5, 8.0); add(F.plant({ h: 1.3, kind: 2 }), 1.5, 2.1); add(F.armchair(MAT.color(0xd946ef, 0.9)), -4.35, 6.5, Math.PI / 2 + 0.3, { nav: true });
    spot('criativo.posters', 'criativo', -3.95, 2.6, -Math.PI / 2, 'think');
  }
  // ------------------------------------------------------------- TI
  {
    const a = R.ti.accent;
    workDesk('ti', 'ti', 4.2, 4.3, 0, { w: 2.0, screens: [['terminal', 81], ['code', 82], ['dash', 83]], accent: a, top: MAT.color(0x2b2e33, 0.5), visitor: [[4.2, 6.5]] });
    for (let i = 0; i < 4; i++) { const rk = F.serverRack(i + 1); add(rk, 8.48, 3.75 + i * 0.76, -Math.PI / 2, { nav: i === 0 }); rk.updateMatrixWorld(true); for (const l of rk.userData.leds) W.leds.push({ ...l, m: new THREE.Matrix4().makeTranslation(l.pos[0], l.pos[1], l.pos[2]).premultiply(rk.matrixWorld) }); }
    obstacle(7.95, 3.35, 9, 6.45, 2.05);
    { const g = new THREE.Group(); g.add(box(0.06, 0.012, 3.3, MAT.color(0xf59e0b, 0.8), 0, 0.006, 0, { cast: false })); add(g, 7.72, 4.9); }
    const bench = F.desk({ w: 1.9, d: 0.7, h: 0.92, top: MAT.oak(), modesty: false }); add(bench, 2.48, 6.7, Math.PI / 2, { nav: true });
    { const parts = F.pcParts(); parts.position.set(0.05, 0.92, 0.12); parts.rotation.y = 0.2; bench.add(parts); }
    W.rackLight = lamp(7.55, 1.3, 4.9, 0x5fb0ff, 4.5, 5.5); hang(F.pendant({ r: 0.2, drop: 0.8 }), 4.2, 5.0); lamp(4.2, 1.8, 5.0, 0xf1f5ff, 6.5, 6.5);
    { const p = F.pcTower(false); p.position.set(-0.62, 0.92, 0); p.rotation.z = Math.PI / 2; p.position.y = 0.92 + 0.11; bench.add(p); const lp = F.laptop(T.screenTex('terminal', { seed: 85 }), 'lap:ti'); lp.position.set(0.66, 0.92, -0.16); lp.rotation.y = -0.3; bench.add(lp); }
    onWall(titled(F.tv({ w: 1.7, h: 0.96, tex: T.screenTex('dash', { seed: 84, accent: hex(a), title: 'Monitoramento · VPS' }), key: 'tv:ti' }), 'Monitoramento dos servidores'), 'pe', 3.9, 1.85, 'P', 2);
    add(F.fileCabinet({ w: 0.6, h: 1.0, color: MAT.color(0x3a3f47, 0.5, 0.4) }), 2.42, 8.1, Math.PI / 2, { nav: true }); add(F.plant({ h: 1.3 }), 8.45, 8.0); add(F.bin(), 5.6, 4.1);
    spot('ti.rack', 'ti', 7.3, 5.25, Math.PI / 2, 'workMid'); spot('ti.bench', 'ti', 3.25, 6.7, -Math.PI / 2, 'work');
  }
  // ------------------------------------------------------------- FINANCEIRO
  {
    const a = R.financeiro.accent;
    workDesk('financeiro', 'financeiro', 11.1, 4.3, 0, { w: 1.7, screens: [['pix', 91], ['sheet', 92]], accent: a, visitor: [[11.1, 6.45]] });
    for (let i = 0; i < 3; i++) add(F.fileCabinet({}), 13.66, 4.6 + i * 0.56, -Math.PI / 2, { nav: i === 0 });
    obstacle(13.3, 4.3, 14, 6.05, 1.3);
    add(F.safe(), 13.62, 7.7, -Math.PI / 2, { nav: true }); hang(F.pendant({ r: 0.2, drop: 0.8 }), 11.1, 5.0); lamp(11.1, 1.8, 5.0, 0xffe2bd, 6.5, 6.5);
    onWall(F.framed({ w: 1.5, h: 0.85, tex: T.screenTex('chart', { seed: 93, accent: hex(a), title: 'Fluxo de caixa' }), key: 'fr:fin', frame: MAT.white(), mat: 0.04 }), 'pe', 5.3, 1.65, 'P', 9);
    add(F.plant({ h: 1.5 }), 9.5, 8.0); add(F.plant({ h: 1.1, kind: 1 }), 9.5, 2.1); add(F.printer(), 9.42, 6.9, Math.PI / 2, { nav: true });
    spot('fin.files', 'financeiro', 12.85, 5.15, Math.PI / 2, 'docs');
  }
  // ------------------------------------------------------------- COPA
  {
    const c = F.kitchenCounter({ w: 3.4 }); add(c, 17.68, 4.6, -Math.PI / 2, { nav: true });
    { const cm = F.coffeeMachine(); cm.position.set(-0.75, 0.9, 0.0); c.add(cm); const mw = F.microwave(); mw.position.set(0.85, 0.9, -0.05); c.add(mw); [0, 1, 2].forEach(i => { const m = i === 0 ? F.brandMug(logoMat) : F.mug([0xffffff, 0xed3237, 0x1c1f24][i]); m.position.set(-0.2 + i * 0.13, 0.9, 0.1 - (i % 2) * 0.1); m.rotation.y = Math.PI / 2; c.add(m); }); }
    add(F.fridge(), 17.6, 7.2, -Math.PI / 2, { nav: true }); hang(F.pendant({ color: MAT.color(0xb45309, 0.5), r: 0.24, drop: 0.7 }), 15.35, 5.2); lamp(15.35, 1.85, 5.2, 0xffd9a8, 7.5, 6.5);
    add(F.highTable({ w: 1.5 }), 15.35, 5.2, Math.PI / 2, { nav: true }); add(F.stool(), 14.75, 4.7); add(F.stool(), 14.75, 5.7);
    add(F.waterCooler(), 14.38, 8.05, 0, { nav: true }); add(F.plant({ h: 1.5 }), 17.45, 8.05); add(F.bin(), 16.9, 2.4);
    onWall(windowPanel(1.6, 1.0), 'E', 7.7, 2.0, 'E');
    onWall(wallText('CAFÉ', 1.1, 0.34, '#b45309'), 'pe', 3.6, 2.25, 'P', 14);
    spot('copa.machine', 'copa', 16.85, 3.85, Math.PI / 2, 'coffee');
    spot('copa.t1', 'copa', 14.72, 5.2, Math.PI / 2, 'drink'); spot('copa.t2', 'copa', 15.98, 4.75, -Math.PI / 2, 'drink'); spot('copa.t3', 'copa', 15.98, 5.65, -Math.PI / 2, 'drink');
    spot('copa.water', 'copa', 14.5, 7.35, 0.25, 'drink');
  }
  // ------------------------------------------------------------- CORREDOR
  {
    add(F.plant({ h: 1.7, pot: MAT.potDark() }), -17.5, -1.0); add(F.plant({ h: 1.7, pot: MAT.potDark() }), -17.5, 1.0);
    add(F.bench(1.5), -3.2, -1.2, 0, { nav: true }); add(F.bench(1.5), 7.4, 1.2, 0, { nav: true });
    add(F.plant({ h: 1.4, kind: 1 }), -6.6, -1.15); add(F.plant({ h: 1.4, kind: 1 }), 0.4, 1.15); add(F.plant({ h: 1.4 }), 10.6, 1.15);
    spot('cor.a1', 'corredor', -9.0, 0.5, Math.PI / 2, 'chat'); spot('cor.a2', 'corredor', -7.9, 0.5, -Math.PI / 2, 'chat');
    spot('cor.b1', 'corredor', 3.2, -0.5, Math.PI / 2, 'chat'); spot('cor.b2', 'corredor', 4.3, -0.5, -Math.PI / 2, 'chat');
  }

  // ================================================================== finish
  W.clock = null; staticRoot.traverse(o => { if (o.userData.hands) W.clock = o.userData.hands; });
  { const im = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.018, 0.018), new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }), W.leds.length); im.layers.enable(BLOOM_LAYER); const c = new THREE.Color(); W.leds.forEach((l, i) => { im.setMatrixAt(i, l.m); im.setColorAt(i, c.set(l.color)); l.c = new THREE.Color(l.color); }); im.userData.dynamic = true; im.frustumCulled = false; dynRoot.add(im); W.ledMesh = im; }
  // clickable screens: an invisible plane in front of every TV / monitor
  staticRoot.updateMatrixWorld(true);
  { const pm = new THREE.MeshBasicMaterial({ visible: false }); staticRoot.traverse(o => { if (!o.isMesh || !o.userData.screen) return; const s = o.userData.screen; const px = new THREE.Mesh(new THREE.PlaneGeometry(s.w, s.h), pm); o.matrixWorld.decompose(px.position, px.quaternion, px.scale); px.userData.dynamic = true; px.userData.screenInfo = s; W.screens.push({ mesh: px, info: s }); dynRoot.add(px); }); }
  mergeStatic(staticRoot, dynRoot);
  dynRoot.traverse(o => { if (o.isMesh && o.material && o.material.userData && o.material.userData.bloom) o.layers.enable(BLOOM_LAYER); });
  W.rgbMats = F.allMaterials().filter(m => m.userData.rgb !== undefined);
  W.staticRoot = staticRoot; W.dynRoot = dynRoot;

  // per-frame world animation
  W.update = (t, dt) => {
    W.alertShown = (W.alertShown || 0) + (W.serverAlert - (W.alertShown || 0)) * Math.min(1, dt * 2.5); const al = W.alertShown;
    { const im = W.ledMesh; for (let i = 0; i < W.leds.length; i++) { const l = W.leds[i]; const on = Math.sin(t * l.rate * (1 + al * 2.2) + l.phase) > -0.55 + al * 0.5; if (!on) { im.setColorAt(i, OFF); continue; } if (al > 0.02) { TMPC.copy(l.c).lerp(i % 3 ? ALERT : ALERT2, al); im.setColorAt(i, TMPC); } else im.setColorAt(i, l.c); } im.instanceColor.needsUpdate = true; }
    if (W.rackLight) { W.rackLight.color.setHex(0x5fb0ff).lerp(ALERT, al); }
    for (const m of W.rgbMats) m.emissive.setHSL((t * 0.07 + m.userData.rgb) % 1, 0.95, 0.55);
    for (const s of W.chairs) if (s.free && Math.abs((s.swivel || 0) - s.rest) > 0.002) { s.swivel += (s.rest - s.swivel) * Math.min(1, dt * 2.5); placeChair(s); }
    if (W.printer) for (const sh of W.printer.sheets) if (sh.userData.t < 1) { sh.userData.t = Math.min(1, sh.userData.t + dt / 2.6); const e = sh.userData.t; sh.position.z = 0.1 + 0.25 * e; sh.position.y = 0.727 + sh.userData.n * 0.0025 + (1 - e) * 0.004; }
    if (W.clock) { const d = new Date(); const m = d.getMinutes() + d.getSeconds() / 60, h = (d.getHours() % 12) + m / 60; W.clock[0].rotation.z = -h / 12 * Math.PI * 2; W.clock[1].rotation.z = -m / 60 * Math.PI * 2; }
  };
  // a sheet comes out of the sales printer
  W.print = () => { const P = W.printer; if (!P) return; if (P.sheets.length >= 8) { for (const s of P.sheets) P.group.remove(s); P.sheets.length = 0; } const sh = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.0016, 0.297), MAT.paper()); sh.userData = { t: 0, n: P.sheets.length, dynamic: true }; sh.position.set((Math.random() - 0.5) * 0.02, 0.73, 0.1); sh.rotation.y = (Math.random() - 0.5) * 0.12; sh.castShadow = false; P.group.add(sh); P.sheets.push(sh); };
  // cutaway: cut[k] = target height (>= H means not cut)
  const cur = { N: 50, S: 50, E: 50, W: 50, P: 50, G: 50 };
  W.setCut = (target, dt, instant = false) => {
    for (const k in cur) { const tg = target[k] ?? 50; const a = instant ? 1 : 1 - Math.exp(-dt * 7); const from = Math.min(cur[k], H + 0.25), to = Math.min(tg, H + 0.25); let v = from + (to - from) * a; if (Math.abs(v - to) < 0.004) v = to; cur[k] = v >= H + 0.24 ? 50 : v; W.planes[k].constant = cur[k]; const cut = cur[k] < H - 0.01; for (const c of W.caps[k]) { c.visible = cut; c.position.y = cur[k] + 0.001; } }
  };
  return W;
}

// merge the meshes of one movable object (in its own space) so it costs a handful of draw calls
function compact(obj) {
  obj.position.set(0, 0, 0); obj.rotation.set(0, 0, 0); obj.updateMatrixWorld(true);
  const buckets = new Map();
  obj.traverse(o => { if (!o.isMesh) return; const k = o.material.uuid; if (!buckets.has(k)) buckets.set(k, { mat: o.material, geos: [] }); const g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone(); for (const a of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(a)) g.deleteAttribute(a); g.applyMatrix4(o.matrixWorld); buckets.get(k).geos.push(g); });
  while (obj.children.length) obj.remove(obj.children[0]);
  for (const b of buckets.values()) { const m = new THREE.Mesh(mergeGeometries(b.geos, false), b.mat); m.castShadow = true; m.receiveShadow = true; obj.add(m); }
  return obj;
}
// merge all static meshes that share a material into one geometry each (keeps draw calls low)
function mergeStatic(root, dynRoot) {
  root.updateMatrixWorld(true);
  const buckets = new Map(); const keep = [];
  root.traverse(o => {
    if (!o.isMesh) return;
    let dyn = false; for (let p = o; p; p = p.parent) if (p.userData && p.userData.dynamic) { dyn = true; break; }
    if (dyn || o.isInstancedMesh) { keep.push(o); return; }
    const key = o.material.uuid + (o.castShadow ? 'c' : 'n') + (o.receiveShadow ? 'r' : 'n');
    if (!buckets.has(key)) buckets.set(key, { mat: o.material, cast: o.castShadow, recv: o.receiveShadow, geos: [] });
    let g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
    for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(k)) g.deleteAttribute(k);
    if (!g.attributes.uv) g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
    if (!g.attributes.normal) g.computeVertexNormals();
    g.applyMatrix4(o.matrixWorld);
    buckets.get(key).geos.push(g);
  });
  // detach dynamic meshes preserving world transform
  for (const o of keep) { const m = o.matrixWorld.clone(); let top = o; while (top.parent && top.parent !== root && top.parent.userData && top.parent.userData.dynamic) top = top.parent; if (top.userData.__moved) continue; const tm = top.matrixWorld.clone(); dynRoot.add(top); tm.decompose(top.position, top.quaternion, top.scale); top.userData.__moved = true; }
  while (root.children.length) root.remove(root.children[0]);
  for (const b of buckets.values()) { const g = mergeGeometries(b.geos, false); if (!g) continue; const m = new THREE.Mesh(g, b.mat); m.castShadow = b.cast; m.receiveShadow = b.recv; m.matrixAutoUpdate = false; if (b.mat.userData && b.mat.userData.bloom) m.layers.enable(BLOOM_LAYER); root.add(m); b.geos.forEach(x => x.dispose()); }
}
