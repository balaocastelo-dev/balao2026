// Monta o terreno a partir do modelo exportado (chacara3d/modelo/export_rt.py) e guarda
// o que a caminhada precisa: o que barra a passagem e a altura do chão em cada ponto.
import * as THREE from 'three';
import { W3, dentroPoli } from './util.js';
import { remendar } from './materiais.js';

const BASE = '/chacara3d/';

export async function baixarModelo(progresso, aoLerMeta) {
  const meta = await fetch(BASE + 'dados/terreno.json').then(r => { if (!r.ok) throw new Error('terreno.json'); return r.json(); });
  if (aoLerMeta) aoLerMeta(meta); // os materiais já começam a baixar as texturas junto com a geometria
  const resp = await fetch(BASE + 'dados/terreno.txt');
  if (!resp.ok) throw new Error('terreno.txt');
  const total = +resp.headers.get('content-length') || 0;
  let txt;
  if (resp.body && resp.body.getReader && progresso) {
    const leitor = resp.body.getReader(), partes = []; let n = 0;
    for (;;) { const { done, value } = await leitor.read(); if (done) break; partes.push(value); n += value.length; progresso(total ? n / total : 0); }
    txt = new TextDecoder().decode(await new Blob(partes).arrayBuffer());
  } else txt = await resp.text();
  const buf = await (await fetch('data:application/octet-stream;base64,' + txt.trim())).arrayBuffer();
  return { meta, buf };
}

// eixo da fibra da madeira (u) por material
const EIXO_U = { wood_x: 'x', wood_y: 'y', wood_z: 'z', log: 'z' };
const PULAR = new Set(['water', 'water_pond', 'stream']);
// na sombra o three.js desenha o lado de trás das faces de um lado só
const LADO_DA_SOMBRA = { [THREE.FrontSide]: THREE.BackSide, [THREE.BackSide]: THREE.FrontSide, [THREE.DoubleSide]: THREE.DoubleSide };

function uvCaixa(pos, nrm, eixo) {
  const n = pos.length / 3, uv = new Float32Array(n * 2);
  for (let i = 0; i < n; i++) {
    const px = pos[i * 3], py = pos[i * 3 + 1], pz = pos[i * 3 + 2];
    const ax = Math.abs(nrm[i * 3]), ay = Math.abs(nrm[i * 3 + 1]), az = Math.abs(nrm[i * 3 + 2]);
    const X = px, Y = -pz, Z = py;           // eixos do terreno
    let u, v;
    if (ay >= ax && ay >= az) { u = X; v = Y; if (eixo === 'y') { u = Y; v = X; } }
    else if (ax >= az) { u = Y; v = Z; if (eixo === 'z') { u = Z; v = Y; } }
    else { u = X; v = Z; if (eixo === 'z') { u = Z; v = X; } }
    uv[i * 2] = u; uv[i * 2 + 1] = v;
  }
  return uv;
}

export function construirTerreno(meta, buf, M, cena) {
  const esc = meta.escala;
  const B = meta.blocos;
  const pos16 = new Int16Array(buf, B.pos[0], B.pos[1] * 3);
  const idx = new Uint32Array(buf, B.idx[0], B.idx[1]);
  const uv16 = B.uv[1] ? new Uint16Array(buf, B.uv[0], B.uv[1] * 2) : null;
  const nr8 = B.nrm[1] ? new Int8Array(buf, B.nrm[0], B.nrm[1] * 4) : null;
  const grupo = new THREE.Group(); grupo.name = 'terreno';
  const malhas = {};
  const reserva = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.8, side: THREE.DoubleSide });
  for (const g of meta.groups) {
    if (PULAR.has(g.m)) continue;
    const mat = M[g.m] || reserva;
    const geo = new THREE.BufferGeometry();
    const p = new Float32Array(g.vc * 3);
    for (let i = 0; i < g.vc * 3; i++) p[i] = pos16[g.vo * 3 + i] * esc;
    geo.setAttribute('position', new THREE.BufferAttribute(p, 3));
    if (g.s) geo.setIndex(new THREE.BufferAttribute(idx.slice(g.io, g.io + g.ic), 1));
    geo.computeVertexNormals();
    if (g.no !== undefined && nr8) {
      const n = geo.attributes.normal.array;
      for (let i = 0; i < g.vc; i++) {
        const a = nr8[(g.no + i) * 4], b = nr8[(g.no + i) * 4 + 1], c = nr8[(g.no + i) * 4 + 2];
        if (a || b || c) { const l = Math.hypot(a, b, c); n[i * 3] = a / l; n[i * 3 + 1] = b / l; n[i * 3 + 2] = c / l; }
      }
    }
    let uv;
    if (g.uvo !== undefined && uv16) {
      uv = new Float32Array(g.vc * 2);
      const su = g.uvs[0] / 65535, sv = g.uvs[1] / 65535;
      for (let i = 0; i < g.vc; i++) { uv[i * 2] = uv16[(g.uvo + i) * 2] * su; uv[i * 2 + 1] = uv16[(g.uvo + i) * 2 + 1] * sv; }
    } else uv = uvCaixa(p, geo.attributes.normal.array, EIXO_U[g.m]);
    if (g.m === 'quadro' && !g.s) {
      // o quadro pintado ocupa a face inteira de cada caixinha (36 vértices por caixa)
      for (let c0 = 0; c0 < g.vc; c0 += 36) {
        let u0 = 1e9, u1 = -1e9, v0 = 1e9, v1 = -1e9;
        const nn = geo.attributes.normal.array;
        for (let i = c0; i < Math.min(g.vc, c0 + 36); i++) {
          if (Math.abs(nn[i * 3 + 2]) < 0.9) continue;      // só as faces da frente e de trás (viradas para y do terreno)
          u0 = Math.min(u0, uv[i * 2]); u1 = Math.max(u1, uv[i * 2]); v0 = Math.min(v0, uv[i * 2 + 1]); v1 = Math.max(v1, uv[i * 2 + 1]);
        }
        for (let i = c0; i < Math.min(g.vc, c0 + 36); i++) { uv[i * 2] = (uv[i * 2] - u0) / Math.max(u1 - u0, 1e-4); uv[i * 2 + 1] = (uv[i * 2 + 1] - v0) / Math.max(v1 - v0, 1e-4); }
      }
    }
    geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    geo.computeBoundingSphere();
    const malha = new THREE.Mesh(geo, mat);
    malha.name = g.m;
    malha.castShadow = !(mat.transparent);
    malha.receiveShadow = true;
    malha.matrixAutoUpdate = false;
    const r = mat.userData && mat.userData.remendo;
    if (r && (r.vento || r.folha) || mat.alphaTest > 0) {
      // o lado é o mesmo que o three.js põe na hora da sombra (assim o programa já fica pronto antes)
      const lado = mat.shadowSide !== null ? mat.shadowSide : LADO_DA_SOMBRA[mat.side];
      const d = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: mat.map || null, alphaTest: mat.alphaTest || 0, side: lado });
      if (r) remendar(d, { vento: r.vento, folha: r.folha, trans: 1, semVirar: false, interior: false, nuvens: false });
      malha.customDepthMaterial = d;
    }
    if (g.m === 'vidro') malha.renderOrder = 5;
    grupo.add(malha);
    (malhas[g.m] = malhas[g.m] || []).push(malha);
  }
  cena.add(grupo);
  return { grupo, malhas };
}

// chão de fora do lote (fica fora do lote para a piscina e o laguinho continuarem vazados)
export function chaoDeFora(cena, mat) {
  const g = new THREE.Group();
  const ret = (x0, x1, y0, y1, z) => {
    const geo = new THREE.PlaneGeometry(x1 - x0, y1 - y0, 1, 1);
    geo.rotateX(-Math.PI / 2);
    const uv = geo.attributes.uv.array;
    for (let i = 0; i < uv.length; i += 2) { uv[i] = uv[i] * (x1 - x0) + x0; uv[i + 1] = uv[i + 1] * (y1 - y0) + y0; }
    const m = new THREE.Mesh(geo, mat);
    m.position.copy(W3((x0 + x1) / 2, (y0 + y1) / 2, z));
    m.receiveShadow = true;
    g.add(m);
  };
  ret(-400, 46, -400, -0.15, -0.045); ret(-400, 46, 10.15, 400, -0.045); ret(-400, -0.15, -0.15, 10.15, -0.045);
  ret(46, 400, -400, -0.15, -1.045); ret(46, 400, 10.15, 400, -1.045); ret(60.15, 400, -0.15, 10.15, -1.045);
  cena.add(g);
  return g;
}

// ---------------------------------------------------------------- o que barra a passagem e a altura do chão
const BOX_FIXO = [ // x0, x1, y0, y1, z0, z1 (sem as tiny houses, que vêm do modelo)
  [0.35, 2.3, 7.5, 10, 0, 2.5], [2.3, 5.35, 7.5, 7.62, 0, 2.5], [5.25, 5.35, 7.5, 10, 0, 2.5],
  [33.75, 34.98, 7.0, 9.8, 0, 0.5], [32, 34.2, 1.1, 3.3, -0.4, 0.55], [38.6, 40.2, 0.8, 1.1, -1.4, 1.7], [31.6, 44.3, 0, 0.72, -0.2, 2.3],
  [35, 35.2, 6.71, 10, 0, 3], [35, 35.42, 6.29, 6.71, 0, 3], [38.29, 38.71, 6.29, 6.71, 0, 3], [41.59, 42.01, 6.29, 6.71, 0, 3], [44.79, 45.21, 6.29, 6.71, 0, 3], [44.79, 45.21, 9.58, 10, 0, 3],
  [35.5, 41.6, 6.3, 7.02, 0, 1.1], [35.2, 42.9, 9.0, 10, 0, 2.2],
  // guarda-corpos da beira da laje e do deck, pilares do deck, lago, poço e amendoeira vêm do modelo (extra.quintal)
  [52.5, 55.5, 3.05, 3.85, -1, -0.1], [46.55, 48.75, 0.3, 2.65, 1.0, 2.3], [44.6, 45.0, 0, 0.4, 0, 0.5],
];
const CIR = [ // x, y, raio, z0, z1
  [30.3, 2.1, 1.2, 0, 2], [21.2, 8.3, 0.28, 0, 8], [23.7, 8.95, 0.25, 0, 8], [26.4, 8.55, 0.28, 0, 8], [30.4, 8.75, 0.15, 0, 2],
  [6.9, 8.9, 0.45, 0, 3], [20.6, 6.2, 0.7, 0, 0.4], [50.2, 9.15, 0.15, -1, 2],
];

const SUBIDA = 0.5;   // o que a pessoa consegue subir num passo (degrau, meio-fio)

// degraus da escada caracol: o mais alto que não passa de `lim` naquele ângulo (ou null)
function degrauEspiral(e, x, y, lim) {
  const dx = x - e.cx, dy = y - e.cy, r = Math.hypot(dx, dy);
  if (r > e.r1 + 0.02) return null;
  if (r < e.r0) return null;                                // o poste
  const porVolta = Math.round(2 * Math.PI / Math.abs(e.passo));
  let u = (Math.atan2(dy, dx) - e.ang0) / e.passo;
  u = ((u % porVolta) + porVolta) % porVolta;
  let melhor = null;
  for (let i = Math.floor(u); i < e.n; i += porVolta) {
    const z = e.z0 + (i + 1) * e.espelho;
    if (z <= lim) melhor = z; else break;
  }
  return melhor;
}

// quintal de baixo (deck, escada e lago) com as medidas do modelo; sem o dado, as medidas antigas
const QUINTAL_PADRAO = { deck: [46, 48, 3.2, 6.2, 0], escada: { x0: 46.08, piso: 0.3, n: 5, y: [7.7, 9.3], espelho: 1 / 6 }, lago: null };

export function criarColisao(extra) {
  const BOX = BOX_FIXO.concat(extra.colisores || []);
  const CIRC = CIR.concat(extra.circulos || []);
  const Q = extra.quintal || QUINTAL_PADRAO;
  const lago = Q.lago;
  const pisos = extra.pisos || [];
  const espirais = (extra.espirais || []).map(e => Object.assign({ topo: e.z0 + e.n * e.espelho }, e));
  const dinamicos = [];   // portas
  const moveis = [];      // pessoas dos cenários: { x, y, z, r, ativo }
  function chaoBase(x, y) {
    if (x > 34.2 && x < 44 && y > 1.1 && y < 4.7) {
      if (y < 3.4) return x > 41.5 ? -0.38 : -1.4;
      const i = Math.floor((44 - x) / 0.6); return i < 4 ? [-0.25, -0.55, -0.85, -1.15][i] : -1.4;
    }
    if (x < 46) return 0;
    const d = Q.deck, e = Q.escada;
    if (x <= d[1] && y >= d[2] && y <= d[3]) return d[4];
    if (y > e.y[0] && y < e.y[1] && x < e.x0 + e.n * e.piso) { const i = Math.floor((x - e.x0) / e.piso); return i < 0 ? 0 : -(i + 1) * e.espelho; }
    return -1;
  }
  // altura do chão em (x, y) para quem está com os pés em `pes`: a superfície mais alta que dá para
  // alcançar dali (as casas têm pisos empilhados: o de dentro, o terraço em cima e os degraus da escada)
  function chaoEm(x, y, pes) {
    const lim = (pes === undefined ? 0 : pes) + SUBIDA;
    let z = chaoBase(x, y);
    for (const p of pisos) if (p[4] > z && p[4] <= lim && x >= p[0] && x <= p[1] && y >= p[2] && y <= p[3]) z = p[4];
    for (const e of espirais) { const v = degrauEspiral(e, x, y, lim); if (v !== null && v > z) z = v; }
    return z;
  }
  // a escada caracol em que (x, y) está, se estiver
  function espiralEm(x, y) {
    for (const e of espirais) {
      const dx = x - e.cx, dy = y - e.cy, r = Math.hypot(dx, dy);
      if (r < e.r1 + 0.35) return { e, r, a: Math.atan2(dy, dx) };
    }
    return null;
  }
  // corrimão do caracol: barra a faixa do corrimão, menos na entrada (embaixo) e na saída (em cima)
  function barraEspiral(x, y, pes, R) {
    for (const e of espirais) {
      const dx = x - e.cx, dy = y - e.cy, r = Math.hypot(dx, dy);
      if (r > e.r1 + R) continue;
      if (r < 0.06 + Math.min(R, 0.22)) return true;                       // poste
      if (r < e.r1 - Math.min(R, 0.18)) continue;                        // dentro, longe do corrimão
      let u = (Math.atan2(dy, dx) - e.ang0) / e.passo;
      const porVolta = Math.round(2 * Math.PI / Math.abs(e.passo));
      u = ((u % porVolta) + porVolta) % porVolta;
      if (pes < 0.45 && (u < 1.6 || u > porVolta - 0.3)) continue;       // entrada, no chão
      const ultimo = (e.n - 1) % porVolta;
      if (pes > e.topo - 0.45 && Math.abs(u - (ultimo + 0.5)) < 0.75) continue;   // saída para o deck
      if (pes > e.topo + 0.3 || pes + 1.7 < e.z0) continue;
      return true;
    }
    return false;
  }
  function barra(x, y, pes, raio, ignorar) {
    const R = raio === undefined ? 0.27 : raio;
    if (x < 0.32 || x > 59.72 || y < 0.32 || y > 9.68) return true;
    for (const b of BOX) if (x > b[0] - R && x < b[1] + R && y > b[2] - R && y < b[3] + R && pes + 1.7 > b[4] && pes + 0.35 < b[5]) return true;
    for (const b of dinamicos) if (b.ativo && x > b.c[0] - R && x < b.c[1] + R && y > b.c[2] - R && y < b.c[3] + R && pes < (b.z1 === undefined ? 2.2 : b.z1)) return true;
    for (const c of CIRC) if (pes + 1.7 > c[3] && pes + 0.35 < c[4] && Math.hypot(x - c[0], y - c[1]) < c[2] + R) return true;
    if (lago && pes < lago.nivel + 0.6 && x > lago.ret[0] && x < lago.ret[1] && y > lago.ret[2] && y < lago.ret[3] && dentroPoli(x, y, lago.contorno)) return true;
    if (espirais.length && barraEspiral(x, y, pes, R)) return true;
    // gente parada ou dançando: dá para passar espremido entre duas pessoas
    for (const m of moveis) if (m !== ignorar && m.ativo && Math.abs(pes - m.z) < 1.4 && Math.hypot(x - m.x, y - m.y) < m.r + R * 0.45) return true;
    return chaoEm(x, y, pes) - pes > SUBIDA;
  }
  return { BOX, CIR: CIRC, chaoEm, barra, dinamicos, moveis, espiralEm, espirais };
}

export function lugares(extra) {
  const L = [['Portão do gramado', 1.6, 4.7, 0], ['Vilinha', 10.6, 4.9, -0.5], ['Gramado', 26, 5.2, 3.14], ['Piscina', 45.1, 3.6, 3.14], ['Churrasqueira', 43.4, 5.7, 2.2],
    ['Deck', 46.4, 4.7, 0], ['Lago', 50.4, 5.0, 3.14], ['Cineminha', 54, 2.7, -1.5708], ['Portão de baixo', 58.6, 5.1, 3.14]];
  const ql = (extra.quintal || {}).lugares || {};
  for (const l of L) if (ql[l[0]]) l.splice(1, 3, ...ql[l[0]]);
  for (const l of (extra.lugares || [])) L.splice(2, 0, l);
  return L;
}

export function ondeEstou(x, y, extra, pes) {
  pes = pes || 0;
  for (const c of (extra.casas || [])) if (x > c.x[0] && x < c.x[1] && y > c.y[0] && y < c.y[1]) {
    const nome = c.nome.toLowerCase();
    if (c.deck && pes > c.deck - 0.4) return 'Terraço da ' + nome;
    if (c.z1 && pes > c.z1 - 0.4) return 'Andar de cima da ' + nome;
    return 'Dentro da ' + nome;
  }
  for (const e of (extra.espirais || [])) if (pes > 0.4 && Math.hypot(x - e.cx, y - e.cy) < 1.3) return 'Escada do mirante (' + e.casa.toLowerCase() + ')';
  for (const e of (extra.escadas || [])) if (pes > 0.15 && x > e.x[0] && x < e.x[1] && y > e.y[0] && y < e.y[1]) return 'Escada do terraço (' + e.casa.toLowerCase() + ')';
  for (const c of (extra.casas || [])) if (c.deck && pes > c.deck - 0.4 && x > c.x[0] - 0.6 && x < c.x[1] + 0.6 && y > c.y[0] - 0.6 && y < c.y[1] + 0.6) return 'Terraço da ' + c.nome.toLowerCase();
  if (x < 21) return x < 2.6 ? 'Portão do gramado' : 'Vilinha';
  if (x < 31.6) return 'Gramado';
  if (x < 46) return y > 6.2 ? 'Churrasqueira' : (x > 34.2 && x < 44 && y > 1.1 && y < 4.7 ? 'Dentro da piscina' : 'Piscina');
  const Q = extra.quintal || QUINTAL_PADRAO, d = Q.deck;
  if (x <= d[1] && y >= d[2] && y <= d[3] && pes > d[4] - 0.4) return 'Deck';
  if (Q.lago && Math.hypot(x - (Q.lago.ret[0] + Q.lago.ret[1]) / 2, y - (Q.lago.ret[2] + Q.lago.ret[3]) / 2) < 3.2) return 'Laguinho';
  if (y < 4.5 && x > 51) return 'Cineminha';
  return 'Parte de baixo';
}
