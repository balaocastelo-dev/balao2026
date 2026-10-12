// Bichos andando pelo terreno: dois cachorros, galinhas e um galo, carpas no laguinho,
// passarinhos (bando no céu e bem-te-vis no gramado), borboletas e, à noite, vaga-lumes.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { W3, clamp, lerp, aleatorio, estado } from './util.js';
import { U } from './materiais.js';

const BASE = '/chacara3d/bichos/';
const r = aleatorio(2026);
const rnd = (a, b) => a + (b - a) * r();
const escolha = l => l[Math.floor(r() * l.length)];

// rumo no terreno (ângulo no plano x,y) -> rotação do modelo, que olha para +Z
const giroDe = rumo => Math.atan2(Math.cos(rumo), -Math.sin(rumo));
function difAng(a, b) { let d = b - a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d; }

// áreas onde bicho não entra (água)
const AGUA = [[34.1, 44.1, 1.0, 4.8], [31.9, 34.3, 1.0, 3.4], [46.0, 49.5, 2.9, 6.5]];
const naAgua = (x, y) => AGUA.some(a => x > a[0] && x < a[1] && y > a[2] && y < a[3]);

// ---------------------------------------------------------------- materiais com as máscaras de cor dos modelos
function matMascara(cores, o) {
  const m = new (o.fisico ? THREE.MeshPhysicalMaterial : THREE.MeshStandardMaterial)(Object.assign({ roughness: o.rug || 0.8, metalness: 0, vertexColors: true, side: o.dois ? THREE.DoubleSide : THREE.FrontSide }, o.props || {}));
  const u = { uCorA: { value: cores[0] }, uCorB: { value: cores[1] }, uCorC: { value: cores[2] || new THREE.Color(0.02, 0.015, 0.012) }, uCamada: { value: o.camada || 0 }, uComp: { value: o.comp || 0 } };
  m.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, u);
    sh.vertexShader = 'uniform float uCamada; uniform float uComp; varying vec3 vRest;\n' + sh.vertexShader
      .replace('#include <begin_vertex>', '#include <begin_vertex>\n vRest = position;')
      .replace('#include <skinning_vertex>', `#include <skinning_vertex>
      #ifdef PELO
      {
        #ifdef USE_COLOR_ALPHA
        float compr = vColor.a;
        #else
        float compr = 1.0;
        #endif
        transformed += normalize(objectNormal) * uCamada * uComp * compr;
        transformed.y -= uCamada * uCamada * uComp * compr * 0.35;
      }
      #endif`);
    sh.fragmentShader = 'uniform vec3 uCorA; uniform vec3 uCorB; uniform vec3 uCorC; uniform float uCamada; varying vec3 vRest;\n' +
      'float bHash(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }\n' + sh.fragmentShader
      .replace('#include <color_fragment>', `
      #ifdef USE_COLOR_ALPHA
      vec4 mk = vColor;
      #else
      vec4 mk = vec4(vColor, 0.0);
      #endif
      diffuseColor.rgb = uCorA * mk.r + uCorB * mk.g + uCorC * mk.b;
      {
        float pinta = bHash(floor(vRest * 160.0));
        diffuseColor.rgb *= 0.9 + 0.2 * pinta;
      }
      #ifdef PELO
      {
        float fio = bHash(floor(vRest * 430.0));
        diffuseColor.a = (fio > uCamada * 0.93 && mk.a > 0.05) ? 1.0 : 0.0;
        diffuseColor.rgb *= mix(0.55, 1.08, uCamada);
      }
      #endif`)
      .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
      roughnessFactor = mix(roughnessFactor, 0.35, mk.b);
      #ifdef BRILHO_A
      roughnessFactor = mix(roughnessFactor, 0.28, mk.a);
      #endif`);
  };
  m.defines = m.defines || {};
  if (o.pelo) { m.defines.PELO = ''; m.alphaTest = 0.5; m.alphaToCoverage = true; }
  if (o.brilhoA) m.defines.BRILHO_A = '';
  m.customProgramCacheKey = () => 'bicho' + (o.pelo ? 'p' : '') + (o.brilhoA ? 'b' : '') + (o.dois ? 'd' : '');
  m.userData.u = u;
  return m;
}

function prepararModelo(gltf, cores, opc) {
  const obj = SkeletonUtils.clone(gltf.scene);
  const pelos = [];
  obj.traverse(o => {
    if (!o.isSkinnedMesh && !o.isMesh) return;
    o.castShadow = true; o.receiveShadow = true; o.frustumCulled = false;
    const nome = o.material && o.material.name;
    if (nome === 'pelo' || nome === 'penas') {
      o.material = matMascara(cores.pelo, { rug: nome === 'pelo' ? 0.85 : 0.72, dois: nome === 'penas', brilhoA: opc.brilhoA, fisico: nome === 'penas', props: nome === 'penas' ? { sheen: 0.6, sheenRoughness: 0.5, sheenColor: new THREE.Color(0.5, 0.45, 0.4) } : {} });
      if (opc.camadas && nome === 'pelo' && o.isSkinnedMesh) {
        for (let k = 1; k <= opc.camadas; k++) {
          const c = new THREE.SkinnedMesh(o.geometry, matMascara(cores.pelo, { rug: 0.9, pelo: true, camada: k / opc.camadas, comp: opc.comprPelo }));
          c.bind(o.skeleton, o.bindMatrix);
          c.frustumCulled = false; c.castShadow = false; c.receiveShadow = true;
          c.position.copy(o.position); c.quaternion.copy(o.quaternion); c.scale.copy(o.scale);
          pelos.push([o.parent, c]);
        }
      }
    } else if (nome === 'olho') {
      o.material = new THREE.MeshPhysicalMaterial({ color: cores.olho, roughness: 0.05, clearcoat: 1, clearcoatRoughness: 0.02 });
    } else if (nome === 'lingua') {
      o.material = new THREE.MeshStandardMaterial({ color: new THREE.Color('#cc616b'), roughness: 0.35 });
    } else if (nome === 'crista') {
      o.material = new THREE.MeshStandardMaterial({ color: cores.crista, roughness: 0.55 });
    } else if (nome === 'bico_pernas') {
      o.material = new THREE.MeshStandardMaterial({ color: cores.bico, roughness: 0.5 });
    }
  });
  for (const [pai, c] of pelos) pai.add(c);
  return obj;
}

class Bicho {
  constructor(gltf, cores, opc) {
    this.obj = prepararModelo(gltf, cores, opc);
    this.mixer = new THREE.AnimationMixer(this.obj);
    this.acoes = {};
    for (const c of gltf.animations) this.acoes[c.name] = this.mixer.clipAction(c);
    this.atual = null; this.nomeAtual = '';
    this.x = 0; this.y = 0; this.pes = 0; this.rumo = 0; this.vel = 0;
    this.opc = opc;
  }
  tocar(nome, fade, uma, escala) {
    const a = this.acoes[nome];
    if (!a || (nome === this.nomeAtual && !uma)) { if (a && escala) a.timeScale = escala; return a; }
    a.reset();
    a.timeScale = escala || 1;
    if (uma) { a.setLoop(THREE.LoopOnce, 1); a.clampWhenFinished = true; } else a.setLoop(THREE.LoopRepeat, Infinity);
    a.enabled = true;
    if (this.atual && this.atual !== a) a.crossFadeFrom(this.atual, fade === undefined ? 0.3 : fade, false);
    a.play();
    this.atual = a; this.nomeAtual = nome;
    return a;
  }
  pousar() {
    this.obj.position.copy(W3(this.x, this.y, this.pes));
    this.obj.rotation.y = giroDe(this.rumo);
  }
}

// ---------------------------------------------------------------- cachorros
function cerebroCachorro(b, mundo) {
  const st = { estado: 'parado', t: rnd(2, 5), alvo: null, marcha: 'andando', fase: 0 };
  const LUGARES_DESCANSO = [[42.5, 8.2], [37, 8.0], [30.2, 3.0], [16.5, 7.2], [11.0, 3.4], [22.0, 2.2], [44.2, 5.4], [5.0, 5.0]];
  function novoAlvo(longe) {
    for (let i = 0; i < 30; i++) {
      const x = rnd(1.0, 45.0), y = rnd(0.9, 9.2);
      if (naAgua(x, y) || mundo.colisao.barra(x, y, mundo.colisao.chaoEm(x, y), 0.32)) continue;
      if (longe && Math.hypot(x - b.x, y - b.y) < 6) continue;
      return [x, y];
    }
    return null;
  }
  function decidir(eu) {
    const noite = estado.noite > 0.5;
    const dEu = Math.hypot(eu.x - b.x, eu.y - b.y);
    const p = r();
    if (dEu < 3.2 && p < 0.45) { st.estado = 'festa'; st.t = rnd(3, 6); b.tocar('abanando', 0.3); if (r() < 0.35) b.latir = true; return; }
    if (dEu > 7 && dEu < 22 && p < 0.25) { st.estado = 'seguir'; st.t = rnd(8, 16); return; }
    if (p < (noite ? 0.45 : 0.18)) {
      const l = escolha(LUGARES_DESCANSO);
      st.estado = 'ir_deitar'; st.alvo = l; st.marcha = 'andando'; st.t = 40; return;
    }
    if (p < 0.32) { st.estado = 'sentar'; st.fase = 0; st.t = 0.8; b.tocar('sentando', 0.25, true); return; }
    st.alvo = novoAlvo(p > 0.7);
    if (!st.alvo) { st.estado = 'parado'; st.t = 2; b.tocar('parado'); return; }
    st.estado = 'andar'; st.t = 30;
    st.marcha = p > 0.9 ? 'correndo' : (p > 0.75 ? 'trotando' : (p > 0.55 ? 'farejando' : 'andando'));
  }
  const VEL = { andando: 0.95, trotando: 2.2, correndo: 5.0, farejando: 0.4 };
  function andarPara(dt, ax, ay, marcha, perto) {
    const dx = ax - b.x, dy = ay - b.y, d = Math.hypot(dx, dy);
    if (d < (perto || 0.35)) return true;
    const rumo = Math.atan2(dy, dx);
    b.rumo += clamp(difAng(b.rumo, rumo), -3 * dt, 3 * dt);
    const v = VEL[marcha] * (d < 1 ? Math.max(0.4, d) : 1);
    const nx = b.x + Math.cos(b.rumo) * v * dt, ny = b.y + Math.sin(b.rumo) * v * dt;
    const pes = mundo.colisao.chaoEm(nx, ny);
    if (naAgua(nx, ny) || mundo.colisao.barra(nx, ny, b.pes, 0.26) || Math.abs(pes - b.pes) > 0.45) return 'barrado';
    b.x = nx; b.y = ny; b.pes = lerp(b.pes, pes, Math.min(1, dt * 10));
    b.tocar(marcha, 0.25, false, v / VEL[marcha]);
    return false;
  }
  return function (dt, eu) {
    st.t -= dt;
    const dEu = Math.hypot(eu.x - b.x, eu.y - b.y);
    switch (st.estado) {
      case 'parado':
        b.tocar('parado');
        if (st.t <= 0) decidir(eu);
        break;
      case 'andar': {
        const ok = andarPara(dt, st.alvo[0], st.alvo[1], st.marcha);
        if (ok === true || ok === 'barrado' || st.t <= 0) { st.estado = 'parado'; st.t = rnd(1.5, 5); }
        break;
      }
      case 'seguir': {
        const marcha = dEu > 6 ? 'trotando' : 'andando';
        const ok = dEu < 1.8 ? true : andarPara(dt, eu.x, eu.y, marcha, 1.6);
        if (ok === true) { st.estado = 'festa'; st.t = rnd(2, 5); b.tocar('abanando'); }
        else if (ok === 'barrado' || st.t <= 0) { st.estado = 'parado'; st.t = 2; }
        break;
      }
      case 'festa': {
        const rumo = Math.atan2(eu.y - b.y, eu.x - b.x);
        b.rumo += clamp(difAng(b.rumo, rumo), -2 * dt, 2 * dt);
        b.tocar('abanando');
        if (st.t <= 0 || dEu > 5) { st.estado = 'parado'; st.t = rnd(1, 3); }
        break;
      }
      case 'ir_deitar': {
        const ok = andarPara(dt, st.alvo[0], st.alvo[1], 'andando', 0.4);
        if (ok === true || ok === 'barrado' || st.t <= 0) { st.estado = 'deitar'; st.fase = 0; st.t = 1.4; b.tocar('deitando', 0.25, true); }
        break;
      }
      case 'sentar':
        if (st.fase === 0 && st.t <= 0) { st.fase = 1; st.t = rnd(5, 14); b.tocar('sentado', 0.2); }
        else if (st.fase === 1 && (st.t <= 0 || (dEu < 1.2 && r() < 0.01))) { st.fase = 2; st.t = 0.7; b.tocar('levantando', 0.2, true); }
        else if (st.fase === 2 && st.t <= 0) { st.estado = 'parado'; st.t = rnd(0.5, 2); b.tocar('parado', 0.2); }
        break;
      case 'deitar':
        if (st.fase === 0 && st.t <= 0) { st.fase = 1; st.t = estado.noite > 0.5 ? rnd(40, 120) : rnd(12, 40); b.tocar('deitado', 0.2); }
        else if (st.fase === 1 && (st.t <= 0 || (dEu < 1.0 && r() < 0.02))) { st.fase = 2; st.t = 1.0; b.tocar('levantando_do_chao', 0.2, true); }
        else if (st.fase === 2 && st.t <= 0) { st.estado = 'parado'; st.t = rnd(0.5, 2); b.tocar('parado', 0.2); }
        break;
    }
  };
}

// ---------------------------------------------------------------- galinhas e galo
function cerebroGalinha(b, mundo, galo, cacs) {
  const st = { estado: 'parada', t: rnd(0.5, 4), alvo: null };
  const area = [0.7, 13.5, 4.4, 9.5];
  const pode = (x, y) => x > area[0] && x < area[1] && y > area[2] && y < area[3] && !mundo.colisao.barra(x, y, 0, 0.15);
  function decidir() {
    const p = r();
    if (galo && estado.hora > 5.2 && estado.hora < 7.5 && p < 0.25) { st.estado = 'cantar'; st.t = 2.5; b.tocar('cantando', 0.2, true); b.cantou = true; return; }
    if (galo && p < 0.04) { st.estado = 'cantar'; st.t = 2.5; b.tocar('cantando', 0.2, true); b.cantou = true; return; }
    if (p < 0.3) { st.estado = 'bicar'; st.t = rnd(2, 6); b.tocar('bicando', 0.25); return; }
    if (p < 0.5) { st.estado = 'ciscar'; st.t = rnd(3.2, 6.4); b.tocar('ciscando', 0.25); return; }
    if (p < 0.55) { st.estado = 'sacudir'; st.t = 1.2; b.tocar('sacudindo', 0.2, true); return; }
    for (let i = 0; i < 12; i++) {
      const a = r() * 6.283, d = rnd(0.4, 2.5);
      const x = b.x + Math.cos(a) * d, y = b.y + Math.sin(a) * d;
      if (pode(x, y)) { st.alvo = [x, y]; st.estado = 'andar'; st.t = 12; return; }
    }
    st.estado = 'parada'; st.t = rnd(1, 3); b.tocar('parada');
  }
  const velAndar = galo ? 0.3 : 0.26, velCorrer = galo ? 1.8 : 1.6;
  function mover(dt, rumo, v, nomeAnim, velAnim) {
    b.rumo += clamp(difAng(b.rumo, rumo), -5 * dt, 5 * dt);
    const nx = b.x + Math.cos(b.rumo) * v * dt, ny = b.y + Math.sin(b.rumo) * v * dt;
    if (!pode(nx, ny)) return false;
    b.x = nx; b.y = ny;
    b.tocar(nomeAnim, 0.15, false, v / velAnim);
    return true;
  }
  return function (dt, eu) {
    st.t -= dt;
    // foge da gente e dos cachorros
    let fx = 0, fy = 0, medo = 0;
    const ameacas = [[eu.x, eu.y, 1.9]].concat(cacs.map(c => [c.x, c.y, 2.2]));
    for (const a of ameacas) { const dx = b.x - a[0], dy = b.y - a[1], d = Math.hypot(dx, dy); if (d < a[2]) { fx += dx / (d + 0.01); fy += dy / (d + 0.01); medo = 1; } }
    if (medo && st.estado !== 'fugir') { st.estado = 'fugir'; st.t = rnd(1.2, 2.4); }
    switch (st.estado) {
      case 'fugir':
        if (!mover(dt, Math.atan2(fy || Math.sin(b.rumo), fx || Math.cos(b.rumo)), velCorrer, 'correndo', velCorrer)) b.rumo += dt * 4;
        if (st.t <= 0 && !medo) { st.estado = 'parada'; st.t = rnd(0.5, 2); b.tocar('parada', 0.2); }
        break;
      case 'andar': {
        const dx = st.alvo[0] - b.x, dy = st.alvo[1] - b.y;
        if (Math.hypot(dx, dy) < 0.08 || st.t <= 0 || !mover(dt, Math.atan2(dy, dx), velAndar, 'andando', velAndar)) { st.estado = 'parada'; st.t = rnd(0.3, 2.5); b.tocar('parada', 0.2); }
        break;
      }
      default:
        if (st.t <= 0) decidir();
    }
  };
}

// ---------------------------------------------------------------- carpas (feitas aqui mesmo)
function criarCarpas(cena, n) {
  const grupo = new THREE.Group();
  const lista = [];
  const L = 0.42, seg = 24, voltas = 12;
  function geometria(semente) {
    const rr = aleatorio(semente);
    const pos = [], cor = [], idx = [];
    const padrao = Math.floor(rr() * 4);
    const laranja = [0.95, 0.32, 0.03], branco = [0.93, 0.92, 0.88], preto = [0.03, 0.03, 0.035], ouro = [0.95, 0.7, 0.25];
    const ruido = (u, a) => Math.sin(u * 13 + semente) * Math.sin(a * 3 + semente * 1.7) + Math.sin(u * 7 - semente * 0.3);
    for (let i = 0; i <= seg; i++) {
      const u = i / seg;
      const perfil = Math.pow(Math.sin(Math.PI * Math.min(1, Math.pow(u, 0.62) * 0.98 + 0.02)), 0.75);
      const h = 0.055 * perfil, w = 0.04 * perfil;
      for (let j = 0; j < voltas; j++) {
        const a = j / voltas * Math.PI * 2;
        pos.push(Math.cos(a) * w, Math.sin(a) * h, u * L - L * 0.35);
        let c;
        const n = ruido(u, a);
        if (padrao === 0) c = n > 0.2 ? laranja : branco;
        else if (padrao === 1) c = ouro;
        else if (padrao === 2) c = n > 0.6 ? preto : (n > -0.2 ? laranja : branco);
        else c = laranja;
        if (Math.sin(a) < -0.3) c = c.map(v => v * 0.85 + 0.1);
        cor.push(...c);
      }
    }
    for (let i = 0; i < seg; i++) for (let j = 0; j < voltas; j++) {
      const a = i * voltas + j, b2 = i * voltas + (j + 1) % voltas;
      idx.push(a, b2, a + voltas, b2, b2 + voltas, a + voltas);
    }
    // cauda e nadadeiras
    const base = pos.length / 3;
    const zc = -L * 0.35;
    pos.push(0, 0, zc + 0.01, 0, 0.07, zc - 0.11, 0, -0.07, zc - 0.11, 0, 0.0, zc - 0.07);
    for (let k = 0; k < 4; k++) cor.push(...(padrao === 1 ? ouro : laranja).map(v => v * 0.9));
    idx.push(base, base + 1, base + 3, base, base + 3, base + 2);
    const b3 = pos.length / 3;
    pos.push(0.03, -0.02, 0.09, 0.09, -0.04, 0.03, 0.03, -0.025, 0.04, -0.03, -0.02, 0.09, -0.09, -0.04, 0.03, -0.03, -0.025, 0.04);
    for (let k = 0; k < 6; k++) cor.push(...branco.map(v => v * 0.9));
    idx.push(b3, b3 + 1, b3 + 2, b3 + 3, b3 + 4, b3 + 5);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(cor, 3));
    g.setIndex(idx); g.computeVertexNormals();
    return g;
  }
  for (let i = 0; i < n; i++) {
    const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.3, metalness: 0.05, side: THREE.DoubleSide });
    const un = { uFase: { value: r() * 6.28 }, uVelNado: { value: 1 } };
    mat.onBeforeCompile = sh => {
      sh.uniforms.uTempo = U.uTempo; Object.assign(sh.uniforms, un);
      sh.vertexShader = 'uniform float uTempo; uniform float uFase; uniform float uVelNado;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
        float tz = clamp((0.15 - transformed.z) / 0.4, 0.0, 1.0);
        transformed.x += sin(transformed.z * 14.0 - uTempo * 6.0 * uVelNado + uFase) * 0.03 * tz * tz;`);
    };
    const m = new THREE.Mesh(geometria(17 + i * 7), mat);
    m.castShadow = false; m.receiveShadow = true;
    grupo.add(m);
    lista.push({ m, un, x: rnd(47.2, 48.8), y: rnd(3.6, 5.8), z: rnd(-1.25, -0.95), rumo: r() * 6.28, v: rnd(0.08, 0.2), t: r() * 100, sobe: 0 });
  }
  cena.add(grupo);
  return function (dt, fontes) {
    for (const k of lista) {
      k.t += dt;
      const cx = 47.65, cy = 4.7;
      let alvoRumo = k.rumo + Math.sin(k.t * 0.3 + k.un.uFase.value) * 0.6 * dt * 3;
      // volta para o meio quando chega perto da borda
      const bx = k.x < 46.45 || k.x > 48.9, by = k.y < 3.45 || k.y > 5.95;
      if (bx || by) alvoRumo = Math.atan2(cy - k.y, cx - k.x);
      k.rumo += clamp(difAng(k.rumo, alvoRumo), -1.2 * dt, 1.2 * dt);
      k.x += Math.cos(k.rumo) * k.v * dt; k.y += Math.sin(k.rumo) * k.v * dt;
      if (r() < dt * 0.02) k.sobe = 4;
      k.sobe = Math.max(0, k.sobe - dt);
      const zAlvo = k.sobe > 0 ? -0.72 : -1.1 + Math.sin(k.t * 0.2) * 0.12;
      k.z = lerp(k.z, zAlvo, dt * 0.6);
      k.m.position.copy(W3(k.x, k.y, k.z));
      k.m.rotation.y = giroDe(k.rumo);
      k.un.uVelNado.value = 0.6 + k.v * 4;
      if (k.z > -0.78 && fontes.length < 3) fontes.push([k.x, k.y, 6.0, 0.35]);
    }
  };
}

// ---------------------------------------------------------------- passarinhos
function corpoDePassaro(cores, esc) {
  const g = new THREE.Group();
  const corpo = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), new THREE.MeshStandardMaterial({ color: cores.corpo, roughness: 0.8 }));
  corpo.scale.set(1, 0.85, 1.6); g.add(corpo);
  const barriga = new THREE.Mesh(new THREE.SphereGeometry(0.047, 10, 8), new THREE.MeshStandardMaterial({ color: cores.barriga, roughness: 0.8 }));
  barriga.scale.set(0.95, 0.8, 1.4); barriga.position.set(0, -0.008, 0.008); g.add(barriga);
  const cab = new THREE.Mesh(new THREE.SphereGeometry(0.033, 10, 8), new THREE.MeshStandardMaterial({ color: cores.cabeca, roughness: 0.7 }));
  cab.position.set(0, 0.035, 0.07); g.add(cab);
  if (cores.faixa) { const f = new THREE.Mesh(new THREE.SphereGeometry(0.034, 10, 6, 0, 6.3, 0.9, 0.5), new THREE.MeshStandardMaterial({ color: cores.faixa, roughness: 0.7 })); f.position.copy(cab.position); g.add(f); }
  const bico = new THREE.Mesh(new THREE.ConeGeometry(0.009, 0.035, 6), new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.5 }));
  bico.rotation.x = Math.PI / 2; bico.position.set(0, 0.03, 0.11); g.add(bico);
  const cauda = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 0.09), new THREE.MeshStandardMaterial({ color: cores.corpo, roughness: 0.8, side: THREE.DoubleSide }));
  cauda.rotation.x = Math.PI / 2 - 0.3; cauda.position.set(0, 0.0, -0.11); g.add(cauda);
  const asas = [];
  for (const s of [-1, 1]) {
    const piv = new THREE.Group(); piv.position.set(s * 0.03, 0.02, 0.01);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0.04, s * 0.14, 0, -0.01, 0, 0, -0.06, s * 0.1, 0, -0.07], 3));
    geo.setIndex([0, 1, 2, 2, 1, 3]); geo.computeVertexNormals();
    const asa = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: cores.asa || cores.corpo, roughness: 0.8, side: THREE.DoubleSide }));
    piv.add(asa); g.add(piv); asas.push([piv, s]);
  }
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  g.scale.setScalar(esc || 1);
  return { g, asas };
}

function criarPassaros(cena, mundo) {
  // bando de andorinhas cruzando o céu de vez em quando
  const bando = [];
  for (let i = 0; i < 9; i++) {
    const p = corpoDePassaro({ corpo: 0x0b0f1c, barriga: 0xd8d4c8, cabeca: 0x0b0f1c, asa: 0x0a0d18 }, 1.3);
    p.g.visible = false; cena.add(p.g);
    bando.push(Object.assign(p, { off: new THREE.Vector3(rnd(-3, 3), rnd(-1.5, 1.5), rnd(-3, 3)), fase: r() * 6.28 }));
  }
  const voo = { ativo: false, t: 0, espera: rnd(15, 40), a: new THREE.Vector3(), b: new THREE.Vector3(), dur: 10 };
  // bem-te-vis no chão do gramado
  const chao = [];
  for (let i = 0; i < 3; i++) {
    const p = corpoDePassaro({ corpo: 0x5a4a2c, barriga: 0xf2d21b, cabeca: 0x111111, faixa: 0xf5f5f0, asa: 0x4a3c22 }, 1.6);
    cena.add(p.g);
    chao.push(Object.assign(p, { x: rnd(4, 28), y: rnd(2, 8), rumo: r() * 6.28, estado: 'chao', t: rnd(1, 3), alt: 0, vx: 0, vy: 0, vz: 0, ausente: 0 }));
  }
  return function (dt, t, eu) {
    // bando
    if (!voo.ativo) {
      voo.espera -= dt;
      if (voo.espera <= 0 && estado.dia > 0.5) {
        voo.ativo = true; voo.t = 0; voo.dur = rnd(9, 15);
        const lado = r() < 0.5 ? -1 : 1, h = rnd(10, 22);
        voo.a.copy(W3(-30, rnd(-10, 20), h)); voo.b.copy(W3(90, rnd(-10, 20), h + rnd(-4, 4)));
        if (lado < 0) { const tmp = voo.a.clone(); voo.a.copy(voo.b); voo.b.copy(tmp); }
        bando.forEach(p => { p.g.visible = true; });
      }
    } else {
      voo.t += dt;
      const k = voo.t / voo.dur;
      const dir = voo.b.clone().sub(voo.a).normalize();
      bando.forEach((p, i) => {
        const pos = voo.a.clone().lerp(voo.b, k).add(p.off).add(new THREE.Vector3(Math.sin(t * 1.3 + p.fase) * 1.2, Math.sin(t * 2.1 + p.fase) * 0.6, Math.cos(t * 1.1 + p.fase) * 1.2));
        p.g.position.copy(pos);
        p.g.lookAt(pos.clone().add(dir));
        const bat = Math.sin(t * 22 + p.fase) * 0.9;
        p.asas.forEach(([piv, s]) => { piv.rotation.z = s * bat; });
      });
      if (k >= 1) { voo.ativo = false; voo.espera = rnd(25, 70); bando.forEach(p => { p.g.visible = false; }); }
    }
    // bem-te-vis
    for (const p of chao) {
      p.t -= dt;
      if (p.estado === 'chao') {
        const d = Math.hypot(eu.x - p.x, eu.y - p.y);
        if (d < 3.5 || estado.dia < 0.3) {
          p.estado = 'voando'; const a = Math.atan2(p.y - eu.y, p.x - eu.x) + rnd(-0.6, 0.6);
          p.vx = Math.cos(a) * 4; p.vy = Math.sin(a) * 4; p.vz = 2.2; p.t = 3;
        } else if (p.t <= 0) {
          p.t = rnd(0.4, 2.5);
          if (r() < 0.6) { // pulinho
            const a = p.rumo + rnd(-1.2, 1.2), d2 = rnd(0.1, 0.35);
            const nx = p.x + Math.cos(a) * d2, ny = p.y + Math.sin(a) * d2;
            if (nx > 1 && nx < 30 && ny > 1 && ny < 9 && !mundo.colisao.barra(nx, ny, 0, 0.05)) { p.rumo = a; p.x = nx; p.y = ny; p.pulo = 0.22; }
          }
        }
        p.pulo = Math.max(0, (p.pulo || 0) - dt);
        p.alt = Math.sin((0.22 - p.pulo) / 0.22 * Math.PI) * 0.05 * (p.pulo > 0 ? 1 : 0);
        p.g.position.copy(W3(p.x, p.y, p.alt + 0.035));
        p.g.rotation.set(0, giroDe(p.rumo), 0);
        const bica = (Math.sin(t * 3 + p.x) > 0.95) ? 0.5 : 0;
        p.g.children[2].position.y = 0.035 - bica * 0.03;
        p.asas.forEach(([piv]) => { piv.rotation.z = 0; });
        p.g.visible = true;
      } else if (p.estado === 'voando') {
        p.x += p.vx * dt; p.y += p.vy * dt; p.alt += p.vz * dt; p.vz += 0.3 * dt;
        p.rumo = Math.atan2(p.vy, p.vx);
        p.g.position.copy(W3(p.x, p.y, p.alt));
        p.g.rotation.set(-0.3, giroDe(p.rumo), 0);
        const bat = Math.sin(t * 28) * 1.0;
        p.asas.forEach(([piv, s]) => { piv.rotation.z = s * bat; });
        if (p.t <= 0 || p.alt > 14) { p.estado = 'longe'; p.g.visible = false; p.ausente = rnd(20, 60); }
      } else {
        p.ausente -= dt;
        if (p.ausente <= 0 && estado.dia > 0.4) {
          for (let i = 0; i < 10; i++) {
            const x = rnd(3, 29), y = rnd(1.5, 8.5);
            if (Math.hypot(x - eu.x, y - eu.y) > 8 && !mundo.colisao.barra(x, y, 0, 0.05)) { p.x = x; p.y = y; p.estado = 'chao'; p.alt = 0; p.t = 1; break; }
          }
        }
      }
    }
  };
}

// ---------------------------------------------------------------- borboletas
function texBorboleta(tipo) {
  const c = document.createElement('canvas'); c.width = 128; c.height = 128;
  const g = c.getContext('2d');
  const cores = [['#1b6fe0', '#0a1f4a', '#9fd3ff'], ['#f2d22c', '#7a5a08', '#fff6b0'], ['#e86f1a', '#2a1406', '#fff1d8']][tipo];
  const asa = (cx, cy, rx, ry, rot) => {
    const gr = g.createRadialGradient(cx, cy, 2, cx, cy, Math.max(rx, ry));
    gr.addColorStop(0, cores[2]); gr.addColorStop(0.35, cores[0]); gr.addColorStop(0.9, cores[0]); gr.addColorStop(1, cores[1]);
    g.save(); g.translate(cx, cy); g.rotate(rot); g.fillStyle = gr; g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0, 7); g.fill();
    g.strokeStyle = cores[1]; g.lineWidth = 4; g.stroke(); g.restore();
  };
  asa(70, 42, 48, 30, -0.5); asa(62, 92, 34, 26, 0.5);
  g.fillStyle = cores[1];
  for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(100 + Math.sin(i) * 6, 30 + i * 7, 3, 0, 7); g.fill(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function criarBorboletas(cena) {
  const pontos = [[33.5, 0.4, 0.6], [36.5, 0.5, 0.7], [40.5, 0.4, 0.6], [43.0, 0.5, 0.5], [1.2, 1.2, 1.2], [2.0, 1.0, 1.0], [5.0, 3.3, 1.0], [17.5, 3.3, 1.0], [11.0, 6.6, 1.0], [54, 2.0, 1.2], [49, 6.6, 0.4]];
  const lista = [];
  const geo = new THREE.PlaneGeometry(0.06, 0.06); geo.translate(0.03, 0, 0);
  for (let i = 0; i < 8; i++) {
    const tipo = i % 3;
    const mat = new THREE.MeshStandardMaterial({ map: texBorboleta(tipo), alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.6 });
    const g = new THREE.Group();
    const asas = [];
    for (const s of [-1, 1]) { const piv = new THREE.Group(); const m = new THREE.Mesh(geo, mat); m.rotation.x = -Math.PI / 2; if (s < 0) m.scale.x = -1; piv.add(m); g.add(piv); asas.push([piv, s]); }
    cena.add(g);
    const p0 = escolha(pontos);
    lista.push({ g, asas, p: W3(p0[0], p0[1], p0[2]), alvo: W3(p0[0], p0[1], p0[2]), t: r() * 10, pouso: 0 });
  }
  return function (dt, t) {
    for (const b of lista) {
      b.t += dt;
      if (b.p.distanceTo(b.alvo) < 0.08) {
        if (b.pouso <= 0 && r() < 0.5) b.pouso = rnd(1.5, 5);
        const q = escolha(pontos);
        b.alvo = W3(q[0] + rnd(-0.8, 0.8), q[1] + rnd(-0.3, 0.3), q[2] + rnd(-0.2, 0.6));
      }
      if (b.pouso > 0) { b.pouso -= dt; const bat = Math.sin(t * 3) * 0.5 + 0.6; b.asas.forEach(([piv, s]) => { piv.rotation.z = s * bat; }); }
      else {
        const dir = b.alvo.clone().sub(b.p); const d = dir.length(); dir.normalize();
        b.p.addScaledVector(dir, Math.min(d, dt * 0.9));
        b.p.y += Math.sin(b.t * 9) * 0.006;
        b.g.position.copy(b.p);
        b.g.rotation.y = Math.atan2(dir.x, dir.z);
        const bat = Math.sin(b.t * 30) * 1.1; b.asas.forEach(([piv, s]) => { piv.rotation.z = s * bat; });
      }
      b.g.visible = estado.dia > 0.35;
    }
  };
}

// ---------------------------------------------------------------- vaga-lumes
function criarVagalumes(cena) {
  const n = 46, g = new THREE.BufferGeometry(), sem = new Float32Array(n * 4), pos = new Float32Array(n * 3);
  const areas = [[46.3, 49.5, 2.5, 7.0, -0.8], [31.8, 44, 0.1, 0.9, 0.2], [1, 30, 0.6, 9.4, 0.3], [50, 59, 6.5, 9.5, -0.7]];
  for (let i = 0; i < n; i++) {
    const a = areas[i % areas.length];
    const p = W3(rnd(a[0], a[1]), rnd(a[2], a[3]), a[4] + rnd(0.2, 1.4));
    pos.set([p.x, p.y, p.z], i * 3);
    for (let k = 0; k < 4; k++) sem[i * 4 + k] = r();
  }
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('aSem', new THREE.BufferAttribute(sem, 4));
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
    uniforms: { uTempo: U.uTempo, uNoite: { value: 0 }, uEsc: { value: 400 } },
    vertexShader: `attribute vec4 aSem; uniform float uTempo; uniform float uNoite; uniform float uEsc; varying float vA;
      void main(){
        vec3 p = position + vec3(sin(uTempo * 0.3 + aSem.x * 20.0), sin(uTempo * 0.45 + aSem.y * 20.0) * 0.4, cos(uTempo * 0.25 + aSem.z * 20.0)) * 0.6;
        float pisca = pow(max(sin(uTempo * (0.7 + aSem.w) + aSem.x * 40.0), 0.0), 6.0);
        vA = pisca * uNoite;
        vec4 mv = viewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = uEsc * 0.03 / -mv.z;
      }`,
    fragmentShader: `varying float vA; void main(){ vec2 c = gl_PointCoord - 0.5; float a = exp(-dot(c, c) * 26.0) * vA; gl_FragColor = vec4(vec3(2.6, 3.2, 0.9) * a, a); }`,
  });
  const pts = new THREE.Points(g, mat); pts.frustumCulled = false; pts.renderOrder = 8;
  cena.add(pts);
  return { pts, mat };
}

// ---------------------------------------------------------------- tudo junto
export async function criarBichos(cena, mundo, qualidade, progresso) {
  const loader = new GLTFLoader();
  const carregar = n => new Promise((ok, erro) => loader.load(BASE + n + '.glb', ok, undefined, erro));
  const [gC, gG, gGalo] = await Promise.all([carregar('cachorro'), carregar('galinha'), carregar('galo')]);
  if (progresso) progresso();
  const camadas = qualidade >= 2 ? 12 : (qualidade >= 1 ? 6 : 0);
  const c = s => new THREE.Color(s);
  const cachorros = [
    new Bicho(gC, { pelo: [c('#c78545'), c('#edd4a8'), c('#291c1a')], olho: c('#1a0e08') }, { camadas, comprPelo: 0.011 }),
    new Bicho(gC, { pelo: [c('#1c1712'), c('#e9e2d4'), c('#1a1210')], olho: c('#1a0e08') }, { camadas, comprPelo: 0.012 }),
  ];
  cachorros[0].x = 18; cachorros[0].y = 5.2; cachorros[1].x = 40; cachorros[1].y = 8.0; cachorros[1].rumo = 2;
  cachorros.forEach(b => { b.obj.scale.setScalar(b === cachorros[1] ? 0.93 : 1); cena.add(b.obj); b.tocar('parado'); b.pousar(); });
  const galinhas = [];
  const coresG = [['#8c421c', '#291a0f'], ['#8c421c', '#291a0f'], ['#d8cdb7', '#7a6b55'], ['#3a2a1e', '#120c08'], ['#a5622a', '#3a2412']];
  for (let i = 0; i < 5; i++) {
    const b = new Bicho(gG, { pelo: [c(coresG[i][0]), c(coresG[i][1])], olho: c('#8c4c0d'), crista: c('#c71a14'), bico: c('#ebb840') }, {});
    b.x = rnd(2, 12); b.y = rnd(5, 9.3); b.rumo = r() * 6.28;
    if (mundo.colisao.barra(b.x, b.y, 0, 0.15)) { b.x = 6 + i * 0.5; b.y = 6.2; }
    cena.add(b.obj); b.tocar('parada'); b.pousar(); galinhas.push(b);
  }
  const galo = new Bicho(gGalo, { pelo: [c('#cc5414'), c('#0f170f')], olho: c('#99520d'), crista: c('#d1140f'), bico: c('#edbd42') }, { brilhoA: true });
  galo.x = 7.5; galo.y = 6.5; cena.add(galo.obj); galo.tocar('parada'); galo.pousar();
  const cerebros = cachorros.map(b => cerebroCachorro(b, mundo))
    .concat(galinhas.map(b => cerebroGalinha(b, mundo, false, cachorros)))
    .concat([cerebroGalinha(galo, mundo, true, cachorros)]);
  const todos = cachorros.concat(galinhas, [galo]);
  const carpas = criarCarpas(cena, 8);
  const passaros = criarPassaros(cena, mundo);
  const borboletas = criarBorboletas(cena);
  const vaga = criarVagalumes(cena);
  const fontesLago = [];
  function atualizar(dt, t, eu, camPos) {
    for (let i = 0; i < todos.length; i++) {
      const b = todos[i];
      const longe = camPos.distanceTo(b.obj.position) > 45;
      cerebros[i](dt, eu);
      b.mixer.update(longe ? dt * 0.5 : dt);
      b.pousar();
    }
    fontesLago.length = 0;
    carpas(dt, fontesLago);
    passaros(dt, t, eu);
    borboletas(dt, t);
    vaga.mat.uniforms.uNoite.value = estado.noite;
  }
  function ajustarTela(alt) { vaga.mat.uniforms.uEsc.value = alt; }
  // posições para a grama se abrir e as portas abrirem
  const pisadas = () => cachorros.map(b => [b.obj.position.x, b.obj.position.z, 0.35, 0.6]);
  return { atualizar, ajustarTela, cachorros, galinhas, galo, fontesLago, pisadas, todos };
}
