// Folhas de contato e teste de multidão das pessoas (three.js r170, igual ao motor).
// A página expõe window.folha(spec) e window.multidao(spec); o previa.py chama e fotografa.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';

const erros = [];
window.__erros = erros;
window.addEventListener('error', e => erros.push(String(e.message || e)));

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.AgXToneMapping;
renderer.toneMappingExposure = 1.15;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setPixelRatio(1);
document.body.appendChild(renderer.domElement);

const cache = {};
async function carregar(url) {
  if (!cache[url]) cache[url] = await new GLTFLoader().loadAsync(url + '?v=' + Date.now());
  return cache[url];
}

// ------------------------------------------------------------ material com as máscaras (como o motor fará)
const lin = h => new THREE.Color(h);
export function materialPessoa(base, cores) {
  const m = base.clone();
  m.vertexColors = true;   // aqui mantido só para ter vColor (o motor pode declarar o próprio atributo)
  const u = {
    uCima: { value: lin(cores.cima) }, uBaixo: { value: lin(cores.baixo) }, uPele: { value: lin(cores.pele) },
    uCabelo: { value: lin(cores.cabelo) }, uAcess: { value: lin(cores.acess) },
  };
  m.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, u);
    sh.fragmentShader = 'uniform vec3 uCima; uniform vec3 uBaixo; uniform vec3 uPele; uniform vec3 uCabelo; uniform vec3 uAcess;\n' +
      sh.fragmentShader.replace('#include <color_fragment>', `
      #if defined( USE_COLOR_ALPHA )
        vec4 mk = vColor;
        float soma = mk.r + mk.g + mk.b + mk.a;
        vec3 c = mk.r * uCima + mk.g * uBaixo + mk.b * uPele + mk.a * uCabelo + max(0.0, 1.0 - soma) * uAcess;
        diffuseColor.rgb *= c;
      #endif`);
  };
  m.customProgramCacheKey = () => 'pessoa-mascara';
  m.userData.u = u;
  return m;
}

const PELES = ['#f1c9a5', '#e0ac85', '#c68863', '#a86d4a', '#8a5538', '#6b3f28', '#4e2c1c'];
const CABELOS = ['#1b1210', '#2b1a12', '#3d2616', '#5a3a22', '#8a6038', '#b58a55', '#d9bf8f', '#6e6e6e'];
const ROUPAS = ['#2f5d9e', '#c23b30', '#e8e3d6', '#2e2e33', '#3d7a4a', '#d9a520', '#7b4fa0', '#e07b9a', '#5a7fa6', '#8b5a2b', '#f0f0f0', '#1f3a5f', '#a3b86c'];
const ACESS = ['#f2f2f2', '#2a2a2a', '#7a5230', '#c7b48a', '#b03030', '#3a4a6a'];
function rnd(s) { let x = Math.sin(s * 9301 + 49297) * 233280; return x - Math.floor(x); }
export function coresAleatorias(seed) {
  const e = (l, k) => l[Math.floor(rnd(seed * 7 + k) * l.length) % l.length];
  return { pele: e(PELES, 1), cabelo: e(CABELOS, 2), cima: e(ROUPAS, 3), baixo: e(ROUPAS, 4), acess: e(ACESS, 5) };
}

// ------------------------------------------------------------ cena de dia
function cenaDia(chao = true) {
  const cena = new THREE.Scene();
  cena.background = new THREE.Color('#a9c4dd');
  const hemi = new THREE.HemisphereLight('#cfe3ff', '#6d6a55', 1.1);
  cena.add(hemi);
  const sol = new THREE.DirectionalLight('#fff4e0', 2.6);
  sol.position.set(3, 6, 4);
  sol.castShadow = true;
  sol.shadow.mapSize.set(1024, 1024);
  sol.shadow.camera.left = -3; sol.shadow.camera.right = 3; sol.shadow.camera.top = 3; sol.shadow.camera.bottom = -3;
  sol.shadow.bias = -0.0005;
  cena.add(sol);
  cena.userData.sol = sol;
  if (chao) {
    const g = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshStandardMaterial({ color: '#8f8a7c', roughness: 0.95 }));
    g.rotation.x = -Math.PI / 2;
    g.receiveShadow = true;
    cena.add(g);
    // grade de 10 cm para conferir pés no chão
    const grade = new THREE.GridHelper(4, 40, '#555', '#777');
    grade.position.y = 0.0015;
    cena.add(grade);
  }
  return cena;
}

function prepararPessoa(gltf, visual, cores) {
  const obj = SkeletonUtils.clone(gltf.scene);
  let alvo = null;
  obj.traverse(o => {
    if (o.isMesh) {
      o.castShadow = true; o.receiveShadow = true; o.frustumCulled = false;
      if (o.material.name === 'pessoa') o.material = materialPessoa(o.material, cores);
    }
  });
  const raiz = obj.children[0];
  for (const c of raiz.children) {
    if (c.isBone) continue;
    c.visible = (c.name === visual);
    if (c.visible) alvo = c;
  }
  return { obj, alvo };
}

function acharOsso(obj, nome) { let b = null; obj.traverse(o => { if (o.isBone && o.name === nome && !b) b = o; }); return b; }

// objeto de teste preso na pega
function objetoTeste(tipo) {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: tipo === 'copo' ? '#d8eef5' : '#b5803e', roughness: 0.4 });
  if (tipo === 'copo') {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.028, 0.11, 16), mat);
    c.position.y = 0.0; g.add(c);
    const liq = new THREE.Mesh(new THREE.CylinderGeometry(0.031, 0.027, 0.07, 16), new THREE.MeshStandardMaterial({ color: '#e0a020' }));
    liq.position.y = -0.015; g.add(liq);
  } else if (tipo.startsWith('cabo')) {
    // 'cabo:a:b' = cabo de y=a (ponta com a cabeça da ferramenta, vermelha) até y=b, no eixo +Y da pega
    const [, a = '-1.3', b = '0.2'] = tipo.split(':');
    const ya = parseFloat(a), yb = parseFloat(b);
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, Math.abs(yb - ya), 10), mat);
    c.position.y = (ya + yb) / 2; g.add(c);
    if (ya !== 0) {
      const esc = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.06, 0.05), new THREE.MeshStandardMaterial({ color: '#c33' }));
      esc.position.y = ya; g.add(esc);
    }
  } else if (tipo === 'eixos') {
    const L = 0.12;
    for (const [d, c] of [[[1, 0, 0], '#f00'], [[0, 1, 0], '#0c0'], [[0, 0, 1], '#00f']]) {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, L, 6), new THREE.MeshBasicMaterial({ color: c }));
      m.position.set(d[0] * L / 2, d[1] * L / 2, d[2] * L / 2);
      if (d[0]) m.rotation.z = -Math.PI / 2; if (d[2]) m.rotation.x = Math.PI / 2;
      g.add(m);
    }
  }
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return g;
}

// ------------------------------------------------------------ cenários de apoio (só para conferir)
function cenario(tipo, k = 1) {
  const g = new THREE.Group();
  const mad = new THREE.MeshStandardMaterial({ color: '#9a7b56', roughness: 0.8 });
  const caixa = (sx, sy, sz, x, y, z, m = mad) => { const b = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), m); b.position.set(x, y, z); b.castShadow = b.receiveShadow = true; g.add(b); return b; };
  if (tipo === 'cadeira') {
    caixa(0.46, 0.04, 0.42, 0, 0.43, 0.03);
    caixa(0.46, 0.5, 0.04, 0, 0.7, -0.2);
    for (const [x, z] of [[-0.2, -0.16], [0.2, -0.16], [-0.2, 0.22], [0.2, 0.22]]) caixa(0.03, 0.43, 0.03, x, 0.215, z);
  } else if (tipo === 'borda') {
    caixa(3, 0.3, 1.5, 0, -0.15, -0.75, new THREE.MeshStandardMaterial({ color: '#d8d0c0', roughness: 0.9 }));
    const agua = new THREE.Mesh(new THREE.BoxGeometry(3, 1.2, 1.5), new THREE.MeshStandardMaterial({ color: '#3a9ad0', transparent: true, opacity: 0.35 }));
    agua.position.set(0, -0.75, 0.75); g.add(agua);
  } else if (tipo === 'espreguicadeira') {
    caixa(0.6, 0.04, 1.1, 0, 0.30, 0.45);
    const enc = caixa(0.6, 0.04, 0.9, 0, 0, 0);
    enc.rotation.x = 35 * Math.PI / 180; enc.position.set(0, 0.30 + Math.sin(35 * Math.PI / 180) * 0.45, -Math.cos(35 * Math.PI / 180) * 0.45);
    for (const [x, z] of [[-0.27, -0.3], [0.27, -0.3], [-0.27, 0.95], [0.27, 0.95]]) caixa(0.03, 0.3, 0.03, x, 0.15, z);
  } else if (tipo === 'bancada') {
    const hb = (k && k !== 1) ? k : 0.9;
    caixa(1.2, hb, 0.6, 0, hb / 2, 0.62);
    caixa(0.5, 0.02, 0.35, 0, hb + 0.01, 0.55, new THREE.MeshStandardMaterial({ color: '#333' }));
  } else if (tipo === 'agua') {
    const agua = new THREE.Mesh(new THREE.BoxGeometry(3, 2, 3), new THREE.MeshStandardMaterial({ color: '#3a9ad0', transparent: true, opacity: 0.3, depthWrite: false }));
    agua.position.set(0, (k || 1.2) - 1, 0); g.add(agua);
  } else if (tipo === 'mesa_dj') {
    const hm = (k && k !== 1) ? k : 0.95;
    caixa(1.0, hm, 0.5, 0, hm / 2, 0.55);
  }
  return g;
}
window.__cenario = cenario;

// ------------------------------------------------------------ folha de contato
// spec: { arquivo, celulas: [{visual, anim, t, vista, cores, rotulo, objetos:{pega_d:'copo'}}], larg, alt, colunas, alturaCam }
window.folha = async function (spec) {
  const gltf = await carregar(spec.arquivo);
  const L = spec.larg || 220, A = spec.alt || 330, col = spec.colunas || 6;
  const n = spec.celulas.length, lin = Math.ceil(n / col);
  renderer.setSize(L * col, A * lin);
  renderer.setScissorTest(true);
  const rot = document.getElementById('rotulos');
  rot.innerHTML = '';
  const cena = cenaDia(true);
  const altura = spec.alturaCena || 1.9;
  for (let i = 0; i < n; i++) {
    const c = spec.celulas[i];
    const { obj } = prepararPessoa(gltf, c.visual, c.cores || coresAleatorias(i + 3));
    if (c.dois_lados) obj.traverse(o => { if (o.isMesh) o.material.side = THREE.DoubleSide; });
    cena.add(obj);
    let cen = null;
    if (c.cenario) { cen = cenario(c.cenario, c.cenario_k); cena.add(cen); }
    if (c.chao_y !== undefined) cena.children.forEach(o => { if (o.isMesh && o.geometry.type === 'PlaneGeometry') o.position.y = c.chao_y; });
    const mix = new THREE.AnimationMixer(obj);
    if (c.anim) {
      const clip = gltf.animations.find(a => a.name === c.anim);
      if (clip) { const ac = mix.clipAction(clip); ac.play(); mix.setTime(c.t || 0); }
      else erros.push('animação ausente: ' + c.anim);
    } else { obj.updateMatrixWorld(true); }
    const extras = [];
    for (const [osso, tipo] of Object.entries(c.objetos || {})) {
      const b = acharOsso(obj, osso);
      if (b) { const o = objetoTeste(tipo); b.add(o); extras.push(o); }
    }
    for (const o of (c.marcas || [])) {
      const m = new THREE.Mesh(new THREE.SphereGeometry(o.r || 0.03, 12, 8), new THREE.MeshStandardMaterial({ color: o.cor || '#ff0' }));
      m.position.set(...o.pos); cena.add(m); extras.push(m);
    }
    obj.updateMatrixWorld(true);
    // câmera
    const cy = c.alvoY ?? altura * 0.5;
    const dist = c.dist ?? 4.2;
    const cam = new THREE.PerspectiveCamera(c.fov || 28, L / A, 0.05, 50);
    const ang = { frente: 0, lado: Math.PI / 2, costas: Math.PI, tres_quartos: Math.PI / 4, lado_d: -Math.PI / 2, cima: 0 }[c.vista || 'frente'];
    const cx = c.alvoX || 0, cz = c.alvoZ || 0;
    cam.position.set(cx + Math.sin(ang) * dist, cy + (c.camY || 0.15), cz + Math.cos(ang) * dist);
    cam.lookAt(cx, cy, cz);
    const x = (i % col) * L, y = (lin - 1 - Math.floor(i / col)) * A;
    renderer.setViewport(x, y, L, A); renderer.setScissor(x, y, L, A);
    renderer.render(cena, cam);
    cena.remove(obj);
    if (cen) cena.remove(cen);
    for (const e of extras) if (e.parent === cena) cena.remove(e);
    if (c.chao_y !== undefined) cena.children.forEach(o => { if (o.isMesh && o.geometry.type === 'PlaneGeometry') o.position.y = 0; });
    const d = document.createElement('div');
    d.className = 'rot'; d.style.left = (i % col) * L + 'px'; d.style.top = Math.floor(i / col) * A + 'px';
    d.textContent = c.rotulo || '';
    rot.appendChild(d);
  }
  renderer.setScissorTest(false);
  return { largura: L * col, altura: A * lin, erros };
};

// ------------------------------------------------------------ multidão
window.multidao = async function (spec) {
  const arquivos = spec.arquivos;
  const gl = {};
  for (const a of arquivos) gl[a] = await carregar(a);
  renderer.setSize(spec.larg || 1280, spec.alt || 720);
  renderer.setScissorTest(false);
  renderer.setViewport(0, 0, spec.larg || 1280, spec.alt || 720);
  const cena = cenaDia(true);
  const s = cena.userData.sol; s.shadow.camera.left = -8; s.shadow.camera.right = 8; s.shadow.camera.top = 8; s.shadow.camera.bottom = -8; s.shadow.camera.updateProjectionMatrix();
  const mixers = [];
  const info = [];
  for (let i = 0; i < spec.pessoas.length; i++) {
    const p = spec.pessoas[i];
    const g = gl[p.arquivo];
    const { obj, alvo } = prepararPessoa(g, p.visual, coresAleatorias(i * 13 + 5));
    if (!alvo) erros.push('visual ausente: ' + p.visual);
    obj.position.set(p.x, 0, p.z);
    obj.rotation.y = p.giro || 0;
    obj.scale.setScalar(p.escala || 1);
    cena.add(obj);
    const mix = new THREE.AnimationMixer(obj);
    const clip = g.animations.find(a => a.name === p.anim);
    if (!clip) erros.push('animação ausente: ' + p.anim);
    else { mix.clipAction(clip).play(); mix.setTime(p.t || 0); }
    for (const [osso, tipo] of Object.entries(p.objetos || {})) {
      const b = acharOsso(obj, osso); if (b) b.add(objetoTeste(tipo));
    }
    mixers.push(mix);
    info.push(p.arquivo.split('/').pop() + ':' + p.visual + ':' + p.anim);
  }
  const cam = new THREE.PerspectiveCamera(40, (spec.larg || 1280) / (spec.alt || 720), 0.1, 100);
  cam.position.set(...(spec.cam || [0, 3.2, 9.5]));
  cam.lookAt(...(spec.olhar || [0, 0.9, 0]));
  // alguns quadros, para exercitar o laço de animação
  for (let k = 0; k < (spec.quadros || 10); k++) { mixers.forEach(m => m.update(1 / 30)); renderer.render(cena, cam); }
  return { erros, info, chamadas: renderer.info.render.calls, triangulos: renderer.info.render.triangles, programas: renderer.info.programs.length };
};

window.__pronto = true;
