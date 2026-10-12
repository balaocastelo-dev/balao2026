// Sobrados da vilinha: portas de entrada que abrem quando a gente chega (ou com a tecla E),
// ventiladores de teto girando e as luzes de dentro (acesas à noite).
import * as THREE from 'three';
import { W3, clamp } from './util.js';
import { U } from './materiais.js';

export function criarCasas(cena, extra, M, colisao) {
  const portas = [], ventiladores = [], luzes = [];
  const madeira = M.wood_x;
  // ---- portas
  for (const d of (extra.portas || [])) {
    const piv = new THREE.Group();
    piv.position.copy(W3(d.dobradica[0], d.dobradica[1], d.dobradica[2]));
    const ang0 = Math.atan2(d.fechada[1], d.fechada[0]);
    const cands = [ang0 + Math.PI / 2, ang0 - Math.PI / 2];
    const dentro = d.para_dentro;
    const angAberta = cands.reduce((m, a) => (Math.cos(a) * dentro[0] + Math.sin(a) * dentro[1] > Math.cos(m) * dentro[0] + Math.sin(m) * dentro[1] ? a : m), cands[0]);
    const folha = new THREE.Group();
    const cor = M[d.cor] || M.white;
    const L = d.largura, H = d.altura, E = 0.045;
    // porta pivotante lisa, na cor da casa, com puxador vertical comprido
    const placa = new THREE.Mesh(new THREE.BoxGeometry(L, H, E), cor);
    placa.position.set(L / 2, H / 2, 0); placa.castShadow = true; placa.receiveShadow = true; folha.add(placa);
    const metal = M.aluminio_preto || M.metal_dark;
    for (const s of [-1, 1]) {
      const pux = new THREE.Mesh(new THREE.BoxGeometry(0.03, 1.3, 0.03), metal);
      pux.position.set(L - 0.13, 1.05, s * (E / 2 + 0.04)); pux.castShadow = true; folha.add(pux);
      for (const yy of [0.47, 1.63]) { const p2 = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 0.04), metal); p2.position.set(L - 0.13, yy, s * (E / 2 + 0.02)); folha.add(p2); }
    }
    piv.add(folha);
    piv.rotation.y = ang0;
    cena.add(piv);
    // o que barra a passagem com a porta fechada
    const hx = d.dobradica[0], hy = d.dobradica[1];
    const fx = hx + d.fechada[0] * L, fy = hy + d.fechada[1] * L;
    const din = { ativo: true, c: [Math.min(hx, fx) - 0.03, Math.max(hx, fx) + 0.03, Math.min(hy, fy) - 0.05, Math.max(hy, fy) + 0.05] };
    colisao.dinamicos.push(din);
    portas.push({ d, piv, ang0, angAberta, abertura: 0, alvo: 0, din, centro: [(hx + fx) / 2, (hy + fy) / 2], manual: 0 });
  }
  // ---- ventiladores de teto
  const matPas = madeira, matMotor = M.white || M.armario;
  for (const v of (extra.ventiladores || [])) {
    const g = new THREE.Group();
    const p = W3(v.p[0], v.p[1], v.p[2]);
    g.position.copy(p);
    const haste = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, Math.max(0.05, v.teto - v.p[2]), 8), M.metal_dark);
    haste.position.y = (v.teto - v.p[2]) / 2; g.add(haste);
    const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.1, 20), matMotor); g.add(motor);
    const rotor = new THREE.Group(); g.add(rotor);
    for (let i = 0; i < 5; i++) {
      const pa = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.008, 0.11), matPas);
      pa.position.set(0.33, -0.03, 0); pa.rotation.x = 0.18;
      const braco = new THREE.Group(); braco.rotation.y = i / 5 * Math.PI * 2; braco.add(pa); rotor.add(braco);
      pa.castShadow = true;
    }
    const cupula = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), M.bulb);
    cupula.position.y = -0.06; g.add(cupula);
    cena.add(g);
    ventiladores.push({ g, rotor, vel: 2.6 + Math.random() * 0.4 });
  }
  // ---- luzes de dentro: são muitas (cada cômodo dos três sobrados e o mirante), então só algumas
  // luzes de verdade revezam entre as mais próximas de quem anda; o resto da casa recebe um brilho
  // quente no shader (uLuzCasa), que também faz as janelas acenderem de longe
  const fontes = (extra.luzes || []).map(l => ({ l, p: W3(l.p[0], l.p[1], l.p[2]), cor: new THREE.Color(l.cor[0], l.cor[1], l.cor[2]) }));
  const NPOOL = 6;
  const vaga = [];
  for (let i = 0; i < NPOOL; i++) {
    const pl = new THREE.PointLight(0xffffff, 0, 5, 2);
    cena.add(pl); luzes.push(pl);
    vaga.push({ pl, f: null, fade: 0, sai: false });
  }
  let tEscolha = 1;
  function escolher(cam) {
    const melhores = fontes.map(f => ({ f, s: f.p.distanceTo(cam) + Math.abs(f.p.y - cam.y) * 1.5 }))
      .sort((a, b) => a.s - b.s).slice(0, NPOOL).map(c => c.f);
    for (const v of vaga) v.sai = !!v.f && !melhores.includes(v.f);
    for (const f of melhores) {
      if (vaga.some(v => v.f === f)) continue;
      const livre = vaga.find(v => !v.f) || vaga.find(v => v.sai && v.fade < 0.05);
      if (!livre) continue;
      livre.f = f; livre.fade = 0; livre.sai = false;
      livre.pl.position.copy(f.p); livre.pl.color.copy(f.cor); livre.pl.distance = f.l.alcance;
    }
  }
  function maisPerto(x, y) {
    let m = null, dm = 1e9;
    for (const p of portas) { const d = Math.hypot(x - p.centro[0], y - p.centro[1]); if (d < dm) { dm = d; m = p; } }
    return { porta: m, dist: dm };
  }
  function alternar(x, y) {
    const { porta, dist } = maisPerto(x, y);
    if (!porta || dist > 2.2) return false;
    porta.manual = porta.alvo > 0.5 ? -1 : 1;
    porta.alvo = porta.manual > 0 ? 1 : 0;
    return true;
  }
  function atualizar(dt, eu, noite, outros, cam) {
    for (const p of portas) {
      const dx = eu.x - p.centro[0], dy = eu.y - p.centro[1], dist = Math.hypot(dx, dy) + (eu.pes > 1.2 ? 9 : 0);
      let perto = dist < 1.7;
      if (outros) for (const o of outros) if (Math.hypot(o.x - p.centro[0], o.y - p.centro[1]) < 1.0) perto = true;
      if (p.manual === 0) p.alvo = perto ? 1 : (dist > 3.5 ? 0 : p.alvo);
      else if (dist > 5) p.manual = 0;
      p.abertura += clamp(p.alvo - p.abertura, -dt * 1.4, dt * 1.4);
      const e = p.abertura * p.abertura * (3 - 2 * p.abertura);
      p.piv.rotation.y = p.ang0 + (p.angAberta - p.ang0) * e;
      p.din.ativo = p.abertura < 0.35;
    }
    for (const v of ventiladores) v.rotor.rotation.y += v.vel * dt;
    if (cam) { tEscolha += dt; if (tEscolha > 0.3) { tEscolha = 0; escolher(cam); } }
    for (const v of vaga) {
      v.fade = clamp(v.fade + (v.sai ? -dt * 3 : dt * 2.5), 0, 1);
      if (v.sai && v.fade <= 0) { v.f = null; v.sai = false; }
      v.pl.intensity = v.f ? v.f.l.forca * (0.95 * noite + 0.04) * v.fade : 0;
    }
    (extra.casas || []).forEach((c, i) => { if (U.uLuzCasa.value[i]) U.uLuzCasa.value[i].set(1.0, 0.68, 0.4).multiplyScalar(0.32 * noite); });
  }
  return { portas, ventiladores, luzes, alternar, maisPerto, atualizar };
}
