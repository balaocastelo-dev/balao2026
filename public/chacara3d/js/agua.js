// Água: piscina, hidro e laguinho com ondinhas animadas, refração do fundo, cor pela espessura,
// reflexo do céu (e da cena, na piscina, com espelho plano), brilho do sol, espuma e anéis onde a água cai.
// Mais: a cascata caindo, as bolhas da hidro, as gotas e as folhas de ninfeia boiando no laguinho.
import * as THREE from 'three';
import { W3, aleatorio, dentroPoli } from './util.js';
import { U } from './materiais.js';

// mapa de normais das ondinhas, repetível (soma de ondas com frequências inteiras)
function mapaOndas() {
  const N = 256, alt = new Float32Array(N * N), r = aleatorio(4);
  const ondas = [];
  for (let k = 0; k < 48; k++) {
    const kx = Math.round((r() * 2 - 1) * (2 + k * 0.6)), ky = Math.round((r() * 2 - 1) * (2 + k * 0.6));
    if (!kx && !ky) continue;
    const f = Math.hypot(kx, ky);
    ondas.push([kx, ky, 1 / Math.pow(f, 1.25), r() * 6.283]);
  }
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    let h = 0;
    for (const o of ondas) h += o[2] * Math.sin(6.2831853 * (o[0] * x + o[1] * y) / N + o[3]);
    alt[y * N + x] = h;
  }
  const dados = new Uint8Array(N * N * 4);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const hx = alt[y * N + (x + 1) % N] - alt[y * N + (x + N - 1) % N];
    const hy = alt[((y + 1) % N) * N + x] - alt[((y + N - 1) % N) * N + x];
    const nx = -hx * 2.2, ny = -hy * 2.2, nz = 1, l = Math.hypot(nx, ny, nz);
    const i = (y * N + x) * 4;
    dados[i] = (nx / l * 0.5 + 0.5) * 255; dados[i + 1] = (ny / l * 0.5 + 0.5) * 255; dados[i + 2] = (nz / l * 0.5 + 0.5) * 255; dados[i + 3] = 255;
  }
  const t = new THREE.DataTexture(dados, N, N, THREE.RGBAFormat);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearMipmapLinearFilter; t.generateMipmaps = true;
  t.needsUpdate = true;
  return t;
}

const VERT_AGUA = /* glsl */`
uniform mat4 uMatRefl;
varying vec3 vPos; varying vec4 vRefl;
void main(){
  vec4 w = modelMatrix * vec4(position, 1.0);
  vPos = w.xyz;
  vRefl = uMatRefl * w;
  gl_Position = projectionMatrix * viewMatrix * w;
}`;

const FRAG_AGUA = /* glsl */`
uniform sampler2D tCena; uniform sampler2D tProf; uniform sampler2D tNormal; uniform sampler2D tReflexo; uniform samplerCube tCeu;
uniform vec2 uRes; uniform mat4 uProjInv; uniform vec3 uSigma; uniform vec3 uCorAgua; uniform float uRefr; uniform float uOndas;
uniform vec4 uFontes[6]; uniform float uTemReflexo; uniform vec3 uSolDir; uniform vec3 uSolCor; uniform float uSolForca; uniform float uTempo;
uniform float uAmb; uniform float uEscala; uniform float uSubmerso;
varying vec3 vPos; varying vec4 vRefl;
float vz(float z){ vec4 v = uProjInv * vec4(0.0, 0.0, z * 2.0 - 1.0, 1.0); return -v.z / v.w; }
float hsh(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
void main(){
  vec2 suv = gl_FragCoord.xy / uRes;
  float zc = texture2D(tProf, suv).x;
  if (zc < gl_FragCoord.z - 1e-7) discard;
  vec2 p = vPos.xz * uEscala;
  vec2 g = (texture2D(tNormal, p * 0.31 + uTempo * vec2(0.021, 0.013)).xy * 2.0 - 1.0) * 0.5;
  g += (texture2D(tNormal, p * 0.77 + uTempo * vec2(-0.017, 0.029)).xy * 2.0 - 1.0) * 0.35;
  g += (texture2D(tNormal, p * 2.1 + uTempo * vec2(0.043, -0.031)).xy * 2.0 - 1.0) * 0.18;
  g *= uOndas;
  float espuma = 0.0;
  for (int i = 0; i < 6; i++) {
    vec4 f = uFontes[i];
    if (f.w <= 0.0) continue;
    vec2 d = vPos.xz - f.xy; float r = length(d);
    float a = f.w * exp(-r * f.z);
    g += d / max(r, 0.002) * cos(38.0 * r - 11.0 * uTempo + hsh(f.xy) * 6.0) * a * 0.22;
    float rr = r + (hsh(floor(vPos.xz * 40.0) + floor(uTempo * 12.0)) - 0.5) * 0.06;
    espuma += f.w * smoothstep(0.32, 0.02, rr) * (0.55 + 0.45 * sin(uTempo * 23.0 + r * 60.0));
  }
  vec3 N = normalize(vec3(g.x, 1.0, g.y));
  vec3 V = normalize(cameraPosition - vPos);
  if (uSubmerso > 0.5) N = -N;
  float cv = max(dot(N, V), 0.0);
  float F = 0.02 + 0.98 * pow(1.0 - cv, 5.0);
  float zf = vz(gl_FragCoord.z);
  float esp = max(vz(zc) - zf, 0.0);
  vec2 ruv = suv + N.xz * uRefr * clamp(esp, 0.0, 1.2) / max(zf * 0.35, 1.0);
  float zr = texture2D(tProf, ruv).x;
  if (zr < gl_FragCoord.z) { ruv = suv; zr = zc; }
  float dist = max(vz(zr) - zf, 0.0) / max(cv, 0.2) * 0.8 + 0.05;
  vec3 fundo = texture2D(tCena, ruv).rgb;
  vec3 T = exp(-uSigma * dist);
  vec3 refr = fundo * T + uCorAgua * uAmb * (1.0 - T);
  vec3 R = reflect(-V, N);
  vec3 refl = textureCube(tCeu, R).rgb;
  if (uTemReflexo > 0.5) {
    vec2 q = vRefl.xy / vRefl.w + N.xz * 0.035;
    refl = mix(refl, texture2D(tReflexo, q).rgb, 0.92);
  }
  float s = max(dot(R, uSolDir), 0.0);
  vec3 brilho = uSolCor * uSolForca * (pow(s, 1500.0) * 9.0 + pow(s, 180.0) * 0.06);
  vec3 cor = mix(refr, refl, F) + brilho;
  cor = mix(cor, vec3(0.92) * (uAmb * 1.2 + uSolForca * 0.18 * max(uSolDir.y, 0.0)), clamp(espuma, 0.0, 0.85));
  gl_FragColor = vec4(cor, 1.0);
}`;

const FRAG_SUBMERSO = /* glsl */`
uniform sampler2D tCena; uniform sampler2D tProf; uniform mat4 uProjInv; uniform vec3 uSigma; uniform vec3 uCorAgua; uniform float uAmb;
varying vec2 vUv;
float vz(float z){ vec4 v = uProjInv * vec4(0.0, 0.0, z * 2.0 - 1.0, 1.0); return -v.z / v.w; }
void main(){
  float d = min(vz(texture2D(tProf, vUv).x), 30.0);
  vec3 T = exp(-uSigma * d);
  gl_FragColor = vec4(texture2D(tCena, vUv).rgb * T + uCorAgua * uAmb * (1.0 - T), 1.0);
}`;

export function criarAgua(cenaPrincipal, ceu, qualidade, quintal) {
  const cenaAgua = new THREE.Scene();
  const normais = mapaOndas();
  const corpos = [];
  const geoRet = (x0, x1, y0, y1, z) => {
    const g = new THREE.PlaneGeometry(x1 - x0, y1 - y0, 1, 1); g.rotateX(-Math.PI / 2);
    g.translate((x0 + x1) / 2, z, -(y0 + y1) / 2);
    return g;
  };
  function corpo(nome, ret, nivel, o) {
    const u = {
      tCena: { value: null }, tProf: { value: null }, tNormal: { value: normais }, tReflexo: { value: null }, tCeu: { value: ceu.cuboCeu.texture },
      uRes: { value: new THREE.Vector2(1, 1) }, uProjInv: { value: new THREE.Matrix4() }, uSigma: { value: o.sigma }, uCorAgua: { value: o.cor },
      uRefr: { value: o.refr || 0.035 }, uOndas: { value: o.ondas || 0.5 }, uFontes: { value: [0, 1, 2, 3, 4, 5].map(() => new THREE.Vector4()) },
      uTemReflexo: { value: 0 }, uSolDir: { value: new THREE.Vector3() }, uSolCor: { value: new THREE.Color() }, uSolForca: { value: 3 }, uTempo: { value: 0 },
      uAmb: { value: 0.3 }, uEscala: { value: o.escala || 1 }, uSubmerso: { value: 0 }, uMatRefl: { value: new THREE.Matrix4() },
    };
    const mat = new THREE.ShaderMaterial({ uniforms: u, vertexShader: VERT_AGUA, fragmentShader: FRAG_AGUA, depthTest: false, depthWrite: false, side: THREE.DoubleSide, toneMapped: false });
    const m = new THREE.Mesh(geoRet(ret[0], ret[1], ret[2], ret[3], nivel), mat);
    cenaAgua.add(m);
    const c = { nome, ret, nivel, u, malha: m, fontes: [] };
    corpos.push(c);
    return c;
  }
  const piscina = corpo('piscina', [34.2, 44.0, 1.1, 4.7], -0.07, { sigma: new THREE.Vector3(0.32, 0.075, 0.055), cor: new THREE.Color(0.02, 0.22, 0.30), ondas: 0.45 });
  const hidro = corpo('hidro', [32.22, 33.98, 1.32, 3.08], 0.42, { sigma: new THREE.Vector3(0.35, 0.09, 0.07), cor: new THREE.Color(0.03, 0.22, 0.3), ondas: 0.9, escala: 1.6 });
  // laguinho: retângulo em volta do contorno, no nível da água do modelo; o chão e as pedras de fora ficam acima da
  // água e tapam o que sobra do retângulo
  const QL = (quintal && quintal.lago) || { ret: [46.08, 49.2, 3.15, 6.25], nivel: -0.64 };
  const lago = corpo('lago', [QL.ret[0] - 0.05, QL.ret[1] + 0.05, QL.ret[2] - 0.05, QL.ret[3] + 0.05], QL.nivel, { sigma: new THREE.Vector3(1.1, 0.55, 0.75), cor: new THREE.Color(0.03, 0.09, 0.05), ondas: 0.3, refr: 0.02 });
  U.uAguaLago.value.set(QL.ret[0], QL.ret[1], -QL.ret[3], -QL.ret[2]); U.uNivelLago.value = QL.nivel;
  // fontes fixas: as duas bicas da cascata e os três jatos da hidro
  piscina.fontes = [[39.0, 1.85, 3.5, 1.0], [39.8, 1.85, 3.5, 1.0]];
  hidro.fontes = [[32.6, 1.45, 3.0, 0.8], [33.1, 1.45, 3.0, 0.8], [33.6, 1.45, 3.0, 0.8]];

  // espelho plano da piscina (só na qualidade alta)
  let rtRefl = null;
  const camRefl = new THREE.PerspectiveCamera();
  const plano = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0.07 + 0.01);
  const planoRefl = new THREE.Plane(), _cima = new THREE.Vector3(0, 1, 0), _pontoAgua = new THREE.Vector3();
  const _corte = new THREE.Vector4(), _q = new THREE.Vector4();
  const matBias = new THREE.Matrix4().set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1);
  function prepararReflexo(renderer, cena, camera, w, h) {
    if (qualidade.reflexo === false) { piscina.u.uTemReflexo.value = 0; return; }
    const W = Math.max(2, w >> 1), H = Math.max(2, h >> 1);
    if (!rtRefl || rtRefl.width !== W || rtRefl.height !== H) {
      if (rtRefl) rtRefl.dispose();
      rtRefl = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 0 });
    }
    // câmera espelhada em y = -0,07
    const nivel = -0.07;
    camRefl.copy(camera);
    camRefl.layers.disable(2); camRefl.layers.disable(3);
    const p = camera.position.clone(); p.y = 2 * nivel - p.y;
    const alvo = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).add(camera.position); alvo.y = 2 * nivel - alvo.y;
    const cima = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion); cima.y = -cima.y;
    camRefl.position.copy(p); camRefl.up.copy(cima); camRefl.lookAt(alvo);
    camRefl.updateMatrixWorld(); camRefl.projectionMatrix.copy(camera.projectionMatrix);
    piscina.u.uMatRefl.value.copy(matBias).multiply(camRefl.projectionMatrix).multiply(camRefl.matrixWorldInverse);
    const vis = camera.position.y > nivel && camera.position.x > 30 && camera.position.x < 60;
    piscina.u.uTemReflexo.value = vis ? 1 : 0;
    if (!vis) return;
    // corta o que fica abaixo da água mudando o plano de perto da câmera (plano oblíquo),
    // em vez de plano de corte do three.js: plano de corte faria outra versão de cada programa
    planoRefl.setFromNormalAndCoplanarPoint(_cima, _pontoAgua.set(0, nivel + 0.005, 0)).applyMatrix4(camRefl.matrixWorldInverse);
    _corte.set(planoRefl.normal.x, planoRefl.normal.y, planoRefl.normal.z, planoRefl.constant);
    const pm = camRefl.projectionMatrix.elements;
    _q.set((Math.sign(_corte.x) + pm[8]) / pm[0], (Math.sign(_corte.y) + pm[9]) / pm[5], -1, (1 + pm[10]) / pm[14]);
    _corte.multiplyScalar(2 / _corte.dot(_q));
    pm[2] = _corte.x; pm[6] = _corte.y; pm[10] = _corte.z + 1; pm[14] = _corte.w;
    camRefl.projectionMatrixInverse.copy(camRefl.projectionMatrix).invert();
    // a sombra do sol já foi feita neste quadro ou no anterior: não refaz para o reflexo
    const sombraAuto = renderer.shadowMap.autoUpdate;
    renderer.shadowMap.autoUpdate = false;
    renderer.setRenderTarget(rtRefl);
    renderer.clear();
    renderer.render(cena, camRefl);
    renderer.shadowMap.autoUpdate = sombraAuto;
    piscina.u.tReflexo.value = rtRefl.texture;
  }

  // cascata: duas lâminas de água em arco, com riscos descendo
  const cascata = new THREE.Group();
  const matCasc = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, side: THREE.DoubleSide, toneMapped: false,
    uniforms: { uTempo: { value: 0 }, uLuz: { value: new THREE.Color(1, 1, 1) } },
    vertexShader: 'varying vec2 vUv; varying vec3 vN; varying vec3 vP; void main(){ vUv = uv; vec4 w = modelMatrix * vec4(position, 1.0); vP = w.xyz; vN = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * viewMatrix * w; }',
    fragmentShader: /* glsl */`uniform float uTempo; uniform vec3 uLuz; varying vec2 vUv; varying vec3 vN; varying vec3 vP;
      float h(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5); }
      float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f); return mix(mix(h(i), h(i + vec2(1., 0.)), f.x), mix(h(i + vec2(0., 1.)), h(i + vec2(1., 1.)), f.x), f.y); }
      void main(){
        float riscos = n(vec2(vUv.x * 22.0, vUv.y * 3.0 - uTempo * 7.0)) * 0.6 + n(vec2(vUv.x * 55.0, vUv.y * 9.0 - uTempo * 13.0)) * 0.4;
        float borda = smoothstep(0.0, 0.25, vUv.x) * smoothstep(1.0, 0.75, vUv.x);
        vec3 V = normalize(cameraPosition - vP);
        float fr = 0.25 + 0.75 * pow(1.0 - abs(dot(normalize(vN), V)), 2.0);
        float a = borda * (0.25 + 0.55 * riscos) * (0.6 + 0.4 * fr);
        gl_FragColor = vec4(uLuz * (0.55 + 0.6 * riscos), a);
      }`,
  });
  for (const xs of [39.0, 39.8]) {
    const pts = [];
    for (let i = 0; i <= 16; i++) { const t = i / 16; pts.push(W3(xs, 1.3 + 0.55 * t, 1.27 - 1.34 * t * t)); }
    const curva = new THREE.CatmullRomCurve3(pts);
    const g = new THREE.TubeGeometry(curva, 32, 0.028, 8, false);
    // achata o tubo numa lâmina mais larga na horizontal
    const pa = g.attributes.position;
    for (let i = 0; i < pa.count; i++) { const x = pa.getX(i); pa.setX(i, xs + (x - xs) * 2.2); }
    g.computeVertexNormals();
    const m = new THREE.Mesh(g, matCasc); m.renderOrder = 6; cascata.add(m);
  }
  cenaPrincipal.add(cascata);

  // gotas: respingos na queda da cascata e bolhas da hidro
  function particulas(n, cor, tam) {
    const g = new THREE.BufferGeometry();
    const sem = new Float32Array(n * 4), r = aleatorio(n);
    for (let i = 0; i < n * 4; i++) sem[i] = r();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    g.setAttribute('aSem', new THREE.BufferAttribute(sem, 4));
    return g;
  }
  const matGotas = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, toneMapped: false,
    uniforms: { uTempo: { value: 0 }, uLuz: { value: new THREE.Color(1, 1, 1) }, uEsc: { value: 400 } },
    vertexShader: /* glsl */`attribute vec4 aSem; uniform float uTempo; uniform float uEsc; varying float vA;
      void main(){
        float bica = aSem.x < 0.5 ? 39.0 : 39.8;
        float t = fract(uTempo * (0.9 + aSem.y * 0.6) + aSem.z);
        float ang = aSem.w * 6.2831;
        vec3 base = vec3(bica + (aSem.y - 0.5) * 0.1, -0.07, -1.85);
        vec3 v = vec3(cos(ang) * 0.5, 1.2 + aSem.y * 0.9, sin(ang) * 0.5) * (0.4 + aSem.z * 0.6);
        vec3 p = base + v * t + vec3(0.0, -4.9 * t * t, 0.0);
        if (p.y < -0.07) p.y = -0.07;
        vA = (1.0 - t) * step(-0.069, p.y);
        vec4 mv = viewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = uEsc * 0.012 / -mv.z;
      }`,
    fragmentShader: 'uniform vec3 uLuz; varying float vA; void main(){ vec2 c = gl_PointCoord - 0.5; float a = smoothstep(0.5, 0.15, length(c)) * vA * 0.7; gl_FragColor = vec4(uLuz, a); }',
  });
  const gotas = new THREE.Points(particulas(qualidade.nivel >= 1 ? 260 : 80), matGotas);
  gotas.frustumCulled = false; gotas.renderOrder = 7; cenaPrincipal.add(gotas);
  const matBolhas = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, toneMapped: false,
    uniforms: { uTempo: { value: 0 }, uLuz: { value: new THREE.Color(1, 1, 1) }, uEsc: { value: 400 } },
    vertexShader: /* glsl */`attribute vec4 aSem; uniform float uTempo; uniform float uEsc; varying float vA;
      void main(){
        float jato = floor(aSem.x * 3.0);
        float t = fract(uTempo * (0.5 + aSem.y * 0.5) + aSem.z);
        vec3 base = vec3(32.6 + jato * 0.5, 0.23, -1.36);
        vec3 p = base + vec3((aSem.w - 0.5) * 0.25 * t + sin(uTempo * 6.0 + aSem.w * 30.0) * 0.015, t * 0.19, -t * (0.25 + aSem.y * 0.55));
        vA = smoothstep(0.0, 0.1, t) * smoothstep(1.0, 0.8, t);
        vec4 mv = viewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = uEsc * (0.008 + aSem.y * 0.01) / -mv.z;
      }`,
    fragmentShader: 'uniform vec3 uLuz; varying float vA; void main(){ vec2 c = gl_PointCoord - 0.5; float r = length(c); float a = (smoothstep(0.5, 0.35, r) - smoothstep(0.35, 0.1, r) * 0.6) * vA * 0.8; gl_FragColor = vec4(uLuz, a); }',
  });
  const bolhas = new THREE.Points(particulas(qualidade.nivel >= 1 ? 220 : 60), matBolhas);
  bolhas.frustumCulled = false; bolhas.renderOrder = 7; cenaPrincipal.add(bolhas);

  // ninfeias boiando no laguinho
  const ninfeias = new THREE.Group();
  const matNinf = new THREE.MeshStandardMaterial({ color: new THREE.Color(0.08, 0.22, 0.05), roughness: 0.35, side: THREE.DoubleSide });
  const matFlor = new THREE.MeshStandardMaterial({ color: new THREE.Color(0.95, 0.75, 0.82), roughness: 0.6, side: THREE.DoubleSide, emissive: new THREE.Color(0.08, 0.04, 0.05) });
  const rn = aleatorio(31), listaNinf = [];
  // lugar de cada folha: dentro do contorno do lago, longe da borda e fora de baixo do deck
  const deckX1 = quintal && quintal.deck ? quintal.deck[1] : 48.0;
  const livre = (x, y, r) => !QL.contorno || ([0, 1, 2, 3, 4, 5, 6, 7].every(k => dentroPoli(x + Math.cos(k * 0.785) * (r + 0.12), y + Math.sin(k * 0.785) * (r + 0.12), QL.contorno)) && x > deckX1 + r);
  const nivelNinf = QL.nivel + 0.008;
  for (let i = 0; i < 9; i++) {
    const r = 0.1 + rn() * 0.09;
    const g = new THREE.CircleGeometry(r, 20, 0.25, Math.PI * 2 - 0.25); g.rotateX(-Math.PI / 2);
    const m = new THREE.Mesh(g, matNinf);
    let x = 47.9 + rn() * 1.2, y = 3.4 + rn() * 2.6;
    for (let t = 0; t < 60 && !livre(x, y, r); t++) { x = QL.ret[0] + rn() * (QL.ret[1] - QL.ret[0]); y = QL.ret[2] + rn() * (QL.ret[3] - QL.ret[2]); }
    m.position.copy(W3(x, y, nivelNinf)); m.rotation.y = rn() * 6.28;
    m.receiveShadow = true;
    ninfeias.add(m); listaNinf.push({ m, x, y, f: rn() * 6.28 });
    if (i % 3 === 0) {
      const fl = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.05, 8, 1, true), matFlor);
      fl.position.set(0.02, 0.03, 0.02); fl.rotation.x = Math.PI; m.add(fl);
    }
  }
  cenaPrincipal.add(ninfeias);

  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }', fragmentShader: FRAG_SUBMERSO, depthTest: false, depthWrite: false,
    uniforms: { tCena: { value: null }, tProf: { value: null }, uProjInv: { value: new THREE.Matrix4() }, uSigma: { value: new THREE.Vector3() }, uCorAgua: { value: new THREE.Color() }, uAmb: { value: 0.3 } },
  }));
  quad.frustumCulled = false;
  const cenaQuad = new THREE.Scene(); cenaQuad.add(quad);
  const camQuad = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  // dentro de qual corpo d'água a câmera está (para o efeito submerso)
  function submerso(cam) {
    for (const c of corpos) {
      const x = cam.position.x, y = -cam.position.z;
      if (x > c.ret[0] && x < c.ret[1] && y > c.ret[2] && y < c.ret[3] && cam.position.y < c.nivel) return c;
    }
    return null;
  }

  // chamado pelo caminho da imagem, com o alvo já preso na cópia da cena
  function desenhar(renderer, camera, texCena, texProf, w, h) {
    const sub = submerso(camera);
    for (const c of corpos) {
      c.u.tCena.value = texCena; c.u.tProf.value = texProf; c.u.uRes.value.set(w, h);
      c.u.uProjInv.value.copy(camera.projectionMatrixInverse);
      c.u.uSubmerso.value = sub === c ? 1 : 0;
    }
    renderer.render(cenaAgua, camera);
    if (sub) {
      const qm = quad.material.uniforms;
      qm.tCena.value = texCena; qm.tProf.value = texProf; qm.uProjInv.value.copy(camera.projectionMatrixInverse);
      qm.uSigma.value.copy(sub.u.uSigma.value); qm.uCorAgua.value.copy(sub.u.uCorAgua.value); qm.uAmb.value = sub.u.uAmb.value;
      renderer.render(cenaQuad, camQuad);
    }
  }

  function atualizar(t, info, extras) {
    const solDir = info.dirLuz || info.solV;
    const amb = 0.04 + 0.42 * Math.max(0, info.solV.y) + 0.01;
    for (const c of corpos) {
      c.u.uTempo.value = t;
      c.u.uSolDir.value.copy(solDir); c.u.uSolCor.value.copy(info.corSol); c.u.uSolForca.value = info.forcaSol;
      c.u.uAmb.value = amb;
      const fs = c.fontes.concat((extras && extras[c.nome]) || []);
      for (let i = 0; i < 6; i++) {
        const f = fs[i];
        if (f) c.u.uFontes.value[i].set(f[0], -f[1], f[2], f[3]); else c.u.uFontes.value[i].set(0, 0, 1, 0);
      }
    }
    const luz = new THREE.Color().setRGB(1, 1, 1).multiplyScalar(0.35 + 0.65 * Math.max(0.05, info.solV.y));
    matCasc.uniforms.uTempo.value = t; matCasc.uniforms.uLuz.value.copy(luz).multiplyScalar(1.2);
    matGotas.uniforms.uTempo.value = t; matGotas.uniforms.uLuz.value.copy(luz);
    matBolhas.uniforms.uTempo.value = t; matBolhas.uniforms.uLuz.value.copy(luz);
    for (const n of listaNinf) {
      n.m.position.copy(W3(n.x + Math.sin(t * 0.05 + n.f) * 0.06, n.y + Math.cos(t * 0.04 + n.f) * 0.05, nivelNinf + Math.sin(t * 0.9 + n.f) * 0.002));
      n.m.rotation.y = n.f + Math.sin(t * 0.03 + n.f) * 0.3;
    }
  }
  function ajustarTela(alt) { matGotas.uniforms.uEsc.value = alt; matBolhas.uniforms.uEsc.value = alt; }
  return { cenaAgua, desenhar, prepararReflexo, atualizar, ajustarTela, corpos, piscina, hidro, lago, qualidade };
}
