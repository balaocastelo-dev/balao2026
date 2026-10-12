// Céu físico (espalhamento de Preetham) com nuvens, estrelas e lua; sol e luar com sombra;
// mapa de ambiente (luz do céu nos materiais) refeito quando o sol anda.
import * as THREE from 'three';
import { W3, clamp, lerp, sstep, estado } from './util.js';

// ruído e nuvens: o mesmo código serve para o céu e para a sombra das nuvens no chão
export const GLSL_NUVENS = /* glsl */`
float cHash(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float cRuido(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3. - 2. * f);
  return mix(mix(cHash(i), cHash(i + vec2(1., 0.)), u.x), mix(cHash(i + vec2(0., 1.)), cHash(i + vec2(1., 1.)), u.x), u.y); }
float cFbm(vec2 p){ float s = 0., a = .5; mat2 m = mat2(1.6, 1.2, -1.2, 1.6); for (int i = 0; i < 5; i++){ s += a * cRuido(p); p = m * p; a *= .5; } return s; }
float densidadeNuvem(vec2 p, float t, float cob){
  vec2 q = p + vec2(t * 0.010, t * 0.0035);
  float n = cFbm(q * 0.55);
  n += 0.45 * cFbm(q * 2.3 + n * 1.7);
  return smoothstep(1.05 - cob, 1.05 - cob + 0.32, n * 0.82);
}`;

const VERT = /* glsl */`
varying vec3 vPos;
void main(){
  vec4 w = modelMatrix * vec4(position, 1.0);
  vPos = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
  gl_Position.z = gl_Position.w;
}`;

const FRAG = /* glsl */`
uniform vec3 uSol; uniform vec3 uLua; uniform float uTurbidez; uniform float uRayleigh; uniform float uMie; uniform float uMieG;
uniform float uTempo; uniform float uCobertura; uniform float uNoite; uniform float uEsc; uniform vec3 uCorSol; uniform vec3 uChao;
uniform float uSemSol; uniform float uForcaSol; uniform float uDesat;
varying vec3 vPos;
const float pi = 3.141592653589793;
const vec3 totalRayleigh = vec3(5.804542996261093E-6, 1.3562911419845635E-5, 3.0265902468824876E-5);
const vec3 MieConst = vec3(1.8399918514433978E14, 2.7798023919660528E14, 4.0790479543861094E14);
${GLSL_NUVENS}
float sunIntensity(float c){ c = clamp(c, -1.0, 1.0); return 1000.0 * max(0.0, 1.0 - exp(-((1.6110731556870734 - acos(c)) / 1.5))); }
vec3 ceuPreetham(vec3 dir, vec3 sol, out vec3 Fex){
  vec3 up = vec3(0., 1., 0.);
  float sunE = sunIntensity(dot(sol, up));
  float sunfade = 1.0 - clamp(1.0 - exp(sol.y), 0.0, 1.0);
  float rc = uRayleigh - (1.0 - sunfade);
  vec3 betaR = totalRayleigh * rc;
  vec3 betaM = 0.434 * (0.2 * uTurbidez) * 10E-18 * MieConst * uMie;
  float zen = acos(max(0.0, dot(up, dir)));
  float inv = 1.0 / (cos(zen) + 0.15 * pow(93.885 - zen * 180.0 / pi, -1.253));
  Fex = exp(-(betaR * 8.4E3 * inv + betaM * 1.25E3 * inv));
  float ct = dot(dir, sol);
  float rPh = 0.05968310365946075 * (1.0 + pow(ct * 0.5 + 0.5, 2.0));
  float g2 = uMieG * uMieG;
  float mPh = 0.07957747154594767 * (1.0 - g2) / pow(1.0 - 2.0 * uMieG * ct + g2, 1.5);
  vec3 bt = (betaR * rPh + betaM * mPh) / (betaR + betaM);
  vec3 Lin = pow(sunE * bt * (1.0 - Fex), vec3(1.5));
  Lin *= mix(vec3(1.0), pow(sunE * bt * Fex, vec3(0.5)), clamp(pow(1.0 - dot(up, sol), 5.0), 0.0, 1.0));
  vec3 L0 = vec3(0.1) * Fex;
  return (Lin + L0) * 0.04 + vec3(0.0, 0.0003, 0.00075);
}
void main(){
  vec3 d = normalize(vPos - cameraPosition);
  vec3 dc = vec3(d.x, max(d.y, 0.0), d.z); dc = normalize(dc + vec3(0., 0.0001, 0.));
  vec3 Fex;
  float sunfade = 1.0 - clamp(1.0 - exp(uSol.y), 0.0, 1.0);
  float gama = 1.0 / (1.2 + 1.2 * sunfade);
  vec3 ceu = pow(max(ceuPreetham(dc, uSol, Fex), vec3(0.0)), vec3(gama)) * uEsc * (1.0 - uSemSol);
  vec3 zen = pow(max(ceuPreetham(vec3(0., 1., 0.), uSol, Fex), vec3(0.0)), vec3(gama)) * uEsc * (1.0 - uSemSol);
  // noite: azul profundo, estrelas, lua
  vec3 noite = mix(vec3(0.0035, 0.006, 0.016), vec3(0.0015, 0.0025, 0.008), sqrt(max(d.y, 0.0)));
  vec3 q = floor(d * 260.0); float r = fract(sin(dot(q, vec3(12.9898, 78.233, 37.719))) * 43758.5453);
  float est = step(0.9978, r) * (0.4 + 0.6 * fract(r * 91.7)) * smoothstep(0.02, 0.25, d.y);
  est *= 0.75 + 0.25 * sin(uTempo * (2.0 + 6.0 * fract(r * 13.1)) + r * 40.0);
  noite += vec3(0.9, 0.95, 1.0) * est * 0.35;
  float m = dot(d, uLua);
  noite += vec3(0.9, 0.93, 1.0) * (smoothstep(0.99955, 0.99975, m) * 2.2 + pow(max(m, 0.0), 80.0) * 0.05);
  vec3 cor = ceu + noite * uNoite;
  // disco do sol
  float ct = dot(d, uSol);
  cor += uCorSol * smoothstep(0.99996, 0.999985, ct) * 60.0 * (1.0 - uSemSol);
  // nuvens numa camada a ~1,6 km, iluminadas pelo sol (brancas e brilhantes) e pelo céu
  if (d.y > 0.0) {
    vec2 p = d.xz / (d.y + 0.06) * 1.6;
    float c = densidadeNuvem(p, uTempo, uCobertura);
    if (c > 0.001) {
      float c2 = densidadeNuvem(p + uSol.xz * 0.25, uTempo, uCobertura);
      float fase = 0.6 + 0.8 * pow(max(ct, 0.0), 6.0);
      vec3 luz = uCorSol * uForcaSol * 0.24 * (1.0 - 0.65 * c2) * fase * max(uSol.y + 0.1, 0.0) / (uSol.y + 0.1 + 0.02) * (1.0 - uSemSol);
      luz += zen * 1.4 + vec3(0.010, 0.011, 0.014) * uNoite * (1.0 - 0.5 * c2);
      float fundo = smoothstep(0.0, 0.18, d.y);
      cor = mix(cor, luz, c * fundo * 0.96);
    }
  }
  // abaixo do horizonte: chão iluminado (é o que rebate de baixo no ambiente)
  if (d.y < 0.0) {
    vec3 ch = uChao * (uCorSol * uForcaSol * max(uSol.y, 0.0) * (1.0 - uSemSol) + zen * 3.6 + vec3(0.004, 0.005, 0.01) * uNoite) / 3.14159;
    cor = mix(cor, ch, smoothstep(0.0, -0.06, d.y));
  }
  // o ambiente que ilumina os materiais é menos saturado que o céu que a gente vê
  float l = dot(cor, vec3(0.2126, 0.7152, 0.0722));
  cor = mix(cor, vec3(l), uDesat);
  gl_FragColor = vec4(cor, 1.0);
}`;

// posição do sol para Campinas (latitude -22,9°) em meados de outubro (declinação ~ -7,5°)
const LAT = -22.9 * Math.PI / 180, DEC = -7.5 * Math.PI / 180;
export function direcaoDoSol(hora, leste) {
  const H = (hora - 12) * 15 * Math.PI / 180;
  const se = Math.sin(LAT) * Math.sin(DEC) + Math.cos(LAT) * Math.cos(DEC) * Math.cos(H);
  const el = Math.asin(clamp(se, -1, 1));
  let cA = (Math.sin(DEC) - se * Math.sin(LAT)) / (Math.max(1e-4, Math.cos(el)) * Math.cos(LAT));
  let A = Math.acos(clamp(cA, -1, 1));
  if (H > 0) A = 2 * Math.PI - A;
  const E = [Math.cos(leste), Math.sin(leste)], N = [-E[1], E[0]];
  const ch = Math.cos(el);
  const x = ch * (Math.sin(A) * E[0] + Math.cos(A) * N[0]);
  const y = ch * (Math.sin(A) * E[1] + Math.cos(A) * N[1]);
  return { el, mundo: [x, y, Math.sin(el)] };
}

// extinção da luz do sol pela atmosfera (mesma conta do céu) -> cor do sol
function corDoSol(el) {
  const zen = Math.PI / 2 - Math.max(el, -0.02);
  const zd = zen * 180 / Math.PI;
  const inv = 1 / (Math.cos(zen) + 0.15 * Math.pow(Math.max(93.885 - zd, 0.01), -1.253));
  const br = [5.804542996261093E-6, 1.3562911419845635E-5, 3.0265902468824876E-5].map(v => v * 1.2);
  const mc = [1.8399918514433978E14, 2.7798023919660528E14, 4.0790479543861094E14];
  const bm = mc.map(v => 0.434 * 0.2 * 2.6 * 10E-18 * v * 0.005);
  const f = br.map((b, i) => Math.exp(-(b * 8.4E3 * inv + bm[i] * 1.25E3 * inv)));
  const n = Math.max(f[0], f[1], f[2]);
  return [f[0] / n, f[1] / n, f[2] / n];
}

export function criarCeu(renderer, cena) {
  const uniforms = {
    uSol: { value: new THREE.Vector3(0, 1, 0) }, uLua: { value: new THREE.Vector3(0, 1, 0) },
    uTurbidez: { value: 2.6 }, uRayleigh: { value: 1.2 }, uMie: { value: 0.005 }, uMieG: { value: 0.8 },
    uTempo: { value: 0 }, uCobertura: { value: 0.42 }, uNoite: { value: 0 }, uEsc: { value: 0.17 },
    uCorSol: { value: new THREE.Color(1, 1, 1) }, uChao: { value: new THREE.Color(0.14, 0.16, 0.09) }, uSemSol: { value: 0 }, uForcaSol: { value: 3.4 }, uDesat: { value: 0 },
  };
  const mat = new THREE.ShaderMaterial({ uniforms, vertexShader: VERT, fragmentShader: FRAG, side: THREE.BackSide, depthWrite: false, depthTest: false, fog: false, toneMapped: false });
  const geo = new THREE.SphereGeometry(1, 64, 32);
  const ceu = new THREE.Mesh(geo, mat);
  ceu.scale.setScalar(900); ceu.frustumCulled = false; ceu.renderOrder = -100;
  cena.add(ceu);
  // cena só com o céu, para o mapa de ambiente
  const cenaCeu = new THREE.Scene();
  const ceu2 = new THREE.Mesh(geo, mat); ceu2.scale.setScalar(900); cenaCeu.add(ceu2);
  const pmrem = new THREE.PMREMGenerator(renderer);
  let ambiente = null;
  const cubo = new THREE.WebGLCubeRenderTarget(128, { type: THREE.HalfFloatType, generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter });
  const camCubo = new THREE.CubeCamera(0.5, 2000, cubo);
  cenaCeu.add(camCubo);

  // sol (ou luar) com sombra suave
  const sol = new THREE.DirectionalLight(0xffffff, 3);
  sol.castShadow = true;
  sol.shadow.mapSize.set(4096, 4096);
  sol.shadow.bias = -0.00025; sol.shadow.normalBias = 0.025;
  sol.shadow.camera.near = 1; sol.shadow.camera.far = 260;
  cena.add(sol); cena.add(sol.target);
  cena.fog = new THREE.FogExp2(0x9fbfe0, 0.0012);

  const caixaLote = new THREE.Box3(W3(-3, 13, -1.6), W3(63, -3, 9.5));
  const cantos = [];
  for (let i = 0; i < 8; i++) cantos.push(new THREE.Vector3());
  const m4 = new THREE.Matrix4(), v = new THREE.Vector3();
  function enquadrarSombra(dir) {
    const c = new THREE.Vector3(); caixaLote.getCenter(c);
    sol.target.position.copy(c);
    sol.position.copy(c).addScaledVector(dir, 120);
    sol.updateMatrixWorld(); sol.target.updateMatrixWorld();
    m4.lookAt(sol.position, sol.target.position, new THREE.Vector3(0, 1, 0)).setPosition(sol.position);
    m4.invert();
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9, z0 = 1e9, z1 = -1e9;
    for (let i = 0; i < 8; i++) {
      v.set(i & 1 ? caixaLote.max.x : caixaLote.min.x, i & 2 ? caixaLote.max.y : caixaLote.min.y, i & 4 ? caixaLote.max.z : caixaLote.min.z).applyMatrix4(m4);
      x0 = Math.min(x0, v.x); x1 = Math.max(x1, v.x); y0 = Math.min(y0, v.y); y1 = Math.max(y1, v.y); z0 = Math.min(z0, v.z); z1 = Math.max(z1, v.z);
    }
    const cam = sol.shadow.camera;
    cam.left = x0; cam.right = x1; cam.bottom = y0; cam.top = y1; cam.near = Math.max(0.5, -z1 - 5); cam.far = -z0 + 5;
    cam.updateProjectionMatrix();
  }

  const info = { el: 0.5, solV: new THREE.Vector3(), luaV: new THREE.Vector3(), corSol: new THREE.Color(), forcaSol: 3, exposicao: 1, ambienteUlt: null };
  let ultimoAmb = -10, ultimaHora = -99;

  function atualizar(dt, forcar) {
    uniforms.uTempo.value = estado.tempo;
    if (!estado.mudouHora && !forcar) return false;
    estado.mudouHora = false;
    const s = direcaoDoSol(estado.hora, estado.leste);
    const el = s.el;
    info.el = el;
    const solV = W3(s.mundo[0], s.mundo[1], s.mundo[2]).normalize();
    // lua cheia do lado oposto, sempre um pouco acima do horizonte de noite
    const luaV = W3(-s.mundo[0] * 0.7 + 0.25, -s.mundo[1] * 0.7 + 0.2, Math.max(0.45, -s.mundo[2])).normalize();
    const dia = sstep(-0.10, 0.12, Math.sin(el));
    const noite = 1 - sstep(-0.16, 0.04, Math.sin(el));
    estado.dia = dia; estado.noite = noite;
    const cs = corDoSol(el);
    info.corSol.setRGB(cs[0], cs[1], cs[2]);
    uniforms.uSol.value.copy(solV); uniforms.uLua.value.copy(luaV);
    uniforms.uCorSol.value.copy(info.corSol);
    uniforms.uNoite.value = noite;
    uniforms.uSemSol.value = 1 - sstep(-0.12, 0.0, Math.sin(el));
    // luz direcional: sol de dia, luar de noite
    const usaSol = el > -0.035;
    const dir = usaSol ? solV : luaV;
    enquadrarSombra(dir);
    if (usaSol) {
      sol.color.copy(info.corSol);
      sol.intensity = 3.9 * sstep(-0.035, 0.22, Math.sin(el));
    } else {
      sol.color.setRGB(0.62, 0.72, 1.0);
      sol.intensity = 0.2 * sstep(0.0, 0.3, luaV.y);
    }
    info.solV.copy(solV); info.luaV.copy(luaV); info.forcaSol = sol.intensity; info.dirLuz = dir;
    uniforms.uForcaSol.value = usaSol ? sol.intensity : 0;
    // névoa leve na cor do horizonte
    const hz = new THREE.Color().setRGB(0.55, 0.68, 0.85).multiplyScalar(lerp(0.004, 0.55, dia)).lerp(new THREE.Color(0.85, 0.55, 0.32).multiplyScalar(0.4), Math.exp(-Math.pow(Math.sin(el) / 0.12, 2)) * dia * 0.6);
    cena.fog.color.copy(hz);
    // exposição: a noite é escura de verdade, mas o olho se acostuma
    info.exposicao = lerp(3.0, 1.12, sstep(-0.05, 0.25, Math.sin(el)));
    // mapa de ambiente: refeito quando a hora mudou o bastante
    if (forcar || Math.abs(estado.hora - ultimaHora) > 0.05 || estado.tempo - ultimoAmb > 4) {
      ultimaHora = estado.hora; ultimoAmb = estado.tempo;
      refazerAmbiente();
    }
    return true;
  }
  function refazerAmbiente() {
    uniforms.uDesat.value = 0.4;
    const novo = pmrem.fromScene(cenaCeu, 0.02, 0.5, 2000);
    uniforms.uDesat.value = 0;
    cena.environment = novo.texture;
    if (ambiente) ambiente.dispose();
    ambiente = novo;
    camCubo.update(renderer, cenaCeu);
  }
  function seguirCamera(cam) { ceu.position.copy(cam.position); }
  return { ceu, sol, uniforms, atualizar, seguirCamera, info, cuboCeu: cubo, refazerAmbiente };
}
