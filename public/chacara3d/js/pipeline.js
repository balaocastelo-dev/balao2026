// Caminho da imagem a cada quadro:
//  1. cena opaca (com antisserrilhado de 4 amostras e mapa de profundidade) em cor HDR
//  2. oclusão de ambiente (SSAO) pela profundidade, em meia resolução, com desfoque que respeita bordas
//  3. água desenhada por cima, lendo a cena (refração) e a profundidade (cor pela espessura da água)
//  4. brilho (bloom) das partes muito claras
//  5. composição final: exposição, tom de filme (AgX), saturação, vinheta e conversão para sRGB
import * as THREE from 'three';

const VERT_TELA = /* glsl */`varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

const FRAG_AO = /* glsl */`
uniform sampler2D tProf; uniform mat4 uProj; uniform mat4 uProjInv; uniform vec2 uTexel; uniform float uRaio; uniform float uTempo;
uniform vec3 uNucleo[16];
varying vec2 vUv;
vec3 posVista(vec2 uv){ float z = texture2D(tProf, uv).x; vec4 n = vec4(uv * 2.0 - 1.0, z * 2.0 - 1.0, 1.0); vec4 v = uProjInv * n; return v.xyz / v.w; }
float ign(vec2 p){ return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715)))); }
void main(){
  float z = texture2D(tProf, vUv).x;
  if (z >= 0.99999) { gl_FragColor = vec4(1.0); return; }
  vec3 P = posVista(vUv);
  vec3 Pr = posVista(vUv + vec2(uTexel.x, 0.0)), Pl = posVista(vUv - vec2(uTexel.x, 0.0));
  vec3 Pu = posVista(vUv + vec2(0.0, uTexel.y)), Pd = posVista(vUv - vec2(0.0, uTexel.y));
  vec3 dx = abs(Pr.z - P.z) < abs(P.z - Pl.z) ? Pr - P : P - Pl;
  vec3 dy = abs(Pu.z - P.z) < abs(P.z - Pd.z) ? Pu - P : P - Pd;
  vec3 N = normalize(cross(dx, dy));
  if (dot(N, -P) < 0.0) N = -N;
  float ang = ign(gl_FragCoord.xy + uTempo * 37.0) * 6.2831853;
  vec3 rv = vec3(cos(ang), sin(ang), 0.0);
  vec3 T = normalize(rv - N * dot(rv, N)); vec3 B = cross(N, T);
  mat3 tbn = mat3(T, B, N);
  float raio = uRaio * clamp(-P.z / 6.0, 0.35, 1.6);
  float occ = 0.0;
  for (int i = 0; i < 16; i++) {
    vec3 s = P + tbn * uNucleo[i] * raio;
    vec4 c = uProj * vec4(s, 1.0); vec2 suv = c.xy / c.w * 0.5 + 0.5;
    if (suv.x < 0.0 || suv.y < 0.0 || suv.x > 1.0 || suv.y > 1.0) continue;
    float sz = posVista(suv).z;
    float alcance = smoothstep(0.0, 1.0, raio / abs(P.z - sz));
    occ += (sz >= s.z + 0.025 * raio ? 1.0 : 0.0) * alcance;
  }
  float ao = 1.0 - occ / 16.0;
  gl_FragColor = vec4(ao, ao, ao, 1.0);
}`;

const FRAG_DESFOQUE = /* glsl */`
uniform sampler2D tAO; uniform sampler2D tProf; uniform vec2 uDir; uniform mat4 uProjInv;
varying vec2 vUv;
float prof(vec2 uv){ float z = texture2D(tProf, uv).x; vec4 v = uProjInv * vec4(uv * 2.0 - 1.0, z * 2.0 - 1.0, 1.0); return -v.z / v.w; }
void main(){
  float d0 = prof(vUv);
  float soma = 0.0, peso = 0.0;
  for (int i = -4; i <= 4; i++) {
    vec2 uv = vUv + uDir * float(i);
    float w = exp(-float(i * i) / 10.0) * exp(-abs(prof(uv) - d0) / max(0.05 * d0, 0.02) * 2.0);
    soma += texture2D(tAO, uv).r * w; peso += w;
  }
  float a = soma / max(peso, 1e-4);
  gl_FragColor = vec4(a, a, a, 1.0);
}`;

const FRAG_APLICA_AO = /* glsl */`
uniform sampler2D tCena; uniform sampler2D tAO; uniform float uForca;
varying vec2 vUv;
void main(){
  vec4 c = texture2D(tCena, vUv);
  float ao = texture2D(tAO, vUv).r;
  ao = mix(1.0, ao, uForca);
  gl_FragColor = vec4(c.rgb * ao, c.a);
}`;

const FRAG_COPIA = /* glsl */`uniform sampler2D tCena; varying vec2 vUv; void main(){ gl_FragColor = texture2D(tCena, vUv); }`;

const FRAG_LIMIAR = /* glsl */`
uniform sampler2D tCena; uniform float uLimiar; uniform vec2 uTexel;
varying vec2 vUv;
void main(){
  vec3 c = vec3(0.0);
  c += texture2D(tCena, vUv + uTexel * vec2(-1., -1.)).rgb; c += texture2D(tCena, vUv + uTexel * vec2(1., -1.)).rgb;
  c += texture2D(tCena, vUv + uTexel * vec2(-1., 1.)).rgb; c += texture2D(tCena, vUv + uTexel * vec2(1., 1.)).rgb;
  c *= 0.25;
  float br = max(c.r, max(c.g, c.b));
  float joelho = uLimiar * 0.5;
  float s = clamp(br - uLimiar + joelho, 0.0, 2.0 * joelho); s = s * s / (4.0 * joelho + 1e-4);
  float k = max(s, br - uLimiar) / max(br, 1e-4);
  gl_FragColor = vec4(min(c * k, vec3(40.0)), 1.0);
}`;

const FRAG_DESCE = /* glsl */`
uniform sampler2D tFonte; uniform vec2 uTexel; varying vec2 vUv;
void main(){
  vec3 c = texture2D(tFonte, vUv).rgb * 4.0;
  c += texture2D(tFonte, vUv + uTexel * vec2(-1., -1.)).rgb; c += texture2D(tFonte, vUv + uTexel * vec2(1., -1.)).rgb;
  c += texture2D(tFonte, vUv + uTexel * vec2(-1., 1.)).rgb; c += texture2D(tFonte, vUv + uTexel * vec2(1., 1.)).rgb;
  gl_FragColor = vec4(c / 8.0, 1.0);
}`;

const FRAG_SOBE = /* glsl */`
uniform sampler2D tFonte; uniform sampler2D tMaior; uniform vec2 uTexel; uniform float uMistura; varying vec2 vUv;
void main(){
  vec3 c = vec3(0.0);
  c += texture2D(tFonte, vUv + uTexel * vec2(-1., 0.)).rgb * 2.0; c += texture2D(tFonte, vUv + uTexel * vec2(1., 0.)).rgb * 2.0;
  c += texture2D(tFonte, vUv + uTexel * vec2(0., -1.)).rgb * 2.0; c += texture2D(tFonte, vUv + uTexel * vec2(0., 1.)).rgb * 2.0;
  c += texture2D(tFonte, vUv + uTexel * vec2(-1., -1.)).rgb; c += texture2D(tFonte, vUv + uTexel * vec2(1., -1.)).rgb;
  c += texture2D(tFonte, vUv + uTexel * vec2(-1., 1.)).rgb; c += texture2D(tFonte, vUv + uTexel * vec2(1., 1.)).rgb;
  c /= 12.0;
  gl_FragColor = vec4(texture2D(tMaior, vUv).rgb + c * uMistura, 1.0);
}`;

const FRAG_FINAL = /* glsl */`
uniform sampler2D tCena; uniform sampler2D tBrilho; uniform float uExpo; uniform float uBrilho; uniform float uSat; uniform float uVinheta;
uniform float uTempo; uniform vec2 uRes; uniform vec3 uBalanco; uniform float uContraste;
varying vec2 vUv;
const mat3 REC2020_SRGB = mat3(vec3(1.6605, -0.1246, -0.0182), vec3(-0.5876, 1.1329, -0.1006), vec3(-0.0728, -0.0083, 1.1187));
const mat3 SRGB_REC2020 = mat3(vec3(0.6274, 0.0691, 0.0164), vec3(0.3293, 0.9195, 0.0880), vec3(0.0433, 0.0113, 0.8956));
vec3 agxContraste(vec3 x){ vec3 x2 = x * x; vec3 x4 = x2 * x2;
  return 15.5 * x4 * x2 - 40.14 * x4 * x + 31.96 * x4 - 6.868 * x2 * x + 0.4298 * x2 + 0.1191 * x - 0.00232; }
vec3 agx(vec3 c){
  const mat3 ins = mat3(vec3(0.856627153315983, 0.137318972929847, 0.11189821299995), vec3(0.0951212405381588, 0.761241990602591, 0.0767994186031903), vec3(0.0482516061458583, 0.101439036467562, 0.811302368396859));
  const mat3 outs = mat3(vec3(1.1271005818144368, -0.1413297634984383, -0.14132976349843826), vec3(-0.11060664309660323, 1.157823702216272, -0.11060664309660294), vec3(-0.016493938717834573, -0.016493938717834257, 1.2519364065950405));
  c = SRGB_REC2020 * c; c = ins * c;
  c = max(c, 1e-10); c = log2(c); c = (c + 12.47393) / (4.026069 + 12.47393); c = clamp(c, 0.0, 1.0);
  c = agxContraste(c);
  // "olhar" um pouco mais vivo que o padrão (punchy suave)
  float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
  c = mix(vec3(l), c, uSat);
  c = pow(max(c, 0.0), vec3(uContraste));
  c = outs * c;
  c = pow(max(vec3(0.0), c), vec3(2.2));
  c = REC2020_SRGB * c;
  return clamp(c, 0.0, 1.0);
}
vec3 srgb(vec3 c){ return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c)); }
float hash(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
void main(){
  vec4 cena = texture2D(tCena, vUv);
  vec3 c = cena.rgb + texture2D(tBrilho, vUv).rgb * uBrilho;
  c *= uExpo * uBalanco;
  c = agx(c);
  vec2 q = vUv - 0.5; q.x *= uRes.x / uRes.y;
  c *= mix(1.0, smoothstep(1.15, 0.25, length(q)), uVinheta);
  c = srgb(c);
  c += (hash(gl_FragCoord.xy + fract(uTempo) * 117.0) - 0.5) / 255.0;
  // só o furo do cineminha fica transparente (folhas escrevem alfa parcial por causa do antisserrilhado)
  float a = smoothstep(0.02, 0.3, cena.a);
  gl_FragColor = vec4(c * a, a);
}`;

function nucleoAO() {
  const k = [];
  let s = 7;
  const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  for (let i = 0; i < 16; i++) {
    const v = new THREE.Vector3(r() * 2 - 1, r() * 2 - 1, r() * 0.9 + 0.1).normalize();
    let e = (i + r()) / 16; e = 0.1 + 0.9 * e * e;
    k.push(v.multiplyScalar(e));
  }
  return k;
}

export function criarPipeline(renderer) {
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
  quad.frustumCulled = false;
  const camQuad = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const cenaQuad = new THREE.Scene(); cenaQuad.add(quad);
  const mat = (frag, uniforms) => new THREE.ShaderMaterial({ vertexShader: VERT_TELA, fragmentShader: frag, uniforms, depthTest: false, depthWrite: false, toneMapped: false });
  const mAO = mat(FRAG_AO, { tProf: { value: null }, uProj: { value: new THREE.Matrix4() }, uProjInv: { value: new THREE.Matrix4() }, uTexel: { value: new THREE.Vector2() }, uRaio: { value: 0.55 }, uTempo: { value: 0 }, uNucleo: { value: nucleoAO() } });
  const mDesf = mat(FRAG_DESFOQUE, { tAO: { value: null }, tProf: { value: null }, uDir: { value: new THREE.Vector2() }, uProjInv: { value: new THREE.Matrix4() } });
  const mAplica = mat(FRAG_APLICA_AO, { tCena: { value: null }, tAO: { value: null }, uForca: { value: 0.9 } });
  const mCopia = mat(FRAG_COPIA, { tCena: { value: null } });
  const mLimiar = mat(FRAG_LIMIAR, { tCena: { value: null }, uLimiar: { value: 1.6 }, uTexel: { value: new THREE.Vector2() } });
  const mDesce = mat(FRAG_DESCE, { tFonte: { value: null }, uTexel: { value: new THREE.Vector2() } });
  const mSobe = mat(FRAG_SOBE, { tFonte: { value: null }, tMaior: { value: null }, uTexel: { value: new THREE.Vector2() }, uMistura: { value: 1 } });
  const mFinal = mat(FRAG_FINAL, { tCena: { value: null }, tBrilho: { value: null }, uExpo: { value: 1 }, uBrilho: { value: 0.05 }, uSat: { value: 1.16 }, uVinheta: { value: 0.35 }, uTempo: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) }, uBalanco: { value: new THREE.Vector3(1, 1, 1) }, uContraste: { value: 1.07 } });

  const p = { amostras: 4, ao: true, brilho: true, w: 1, h: 1 };
  let rtCena = null, rtA = null, rtB = null, rtAO1 = null, rtAO2 = null, cadeia = [];
  const hdr = { type: THREE.HalfFloatType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false };
  function liberar() {
    [rtCena, rtA, rtB, rtAO1, rtAO2, ...cadeia.flat()].forEach(r => r && r.dispose());
    cadeia = [];
  }
  function redimensionar(w, h) {
    w = Math.max(2, Math.floor(w)); h = Math.max(2, Math.floor(h));
    if (rtCena && w === p.w && h === p.h) return;
    liberar();
    p.w = w; p.h = h;
    const prof = new THREE.DepthTexture(w, h); prof.type = THREE.UnsignedIntType;
    rtCena = new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType, samples: p.amostras, depthTexture: prof, depthBuffer: true, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });
    rtA = new THREE.WebGLRenderTarget(w, h, hdr);
    rtB = new THREE.WebGLRenderTarget(w, h, hdr);
    const hw = Math.max(2, w >> 1), hh = Math.max(2, h >> 1);
    rtAO1 = new THREE.WebGLRenderTarget(hw, hh, { type: THREE.UnsignedByteType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false });
    rtAO2 = rtAO1.clone();
    let cw = hw, ch = hh;
    for (let i = 0; i < 5; i++) {
      cadeia.push([new THREE.WebGLRenderTarget(cw, ch, hdr), new THREE.WebGLRenderTarget(cw, ch, hdr)]);
      cw = Math.max(2, cw >> 1); ch = Math.max(2, ch >> 1);
    }
    mFinal.uniforms.uRes.value.set(w, h);
  }
  function passo(material, destino) {
    quad.material = material;
    renderer.setRenderTarget(destino);
    renderer.render(cenaQuad, camQuad);
  }
  // ganchos: { antes(renderer, camera), agua(renderer, camera, texCena, texProf, w, h) }
  function renderizar(cena, camera, ganchos, destino, opcoes) {
    const o = opcoes || {};
    const ac = renderer.autoClear;
    if (ganchos && ganchos.antes) ganchos.antes(renderer, camera);
    renderer.setRenderTarget(rtCena);
    renderer.setClearColor(0x000000, 1);
    renderer.autoClear = true;
    renderer.clear(true, true, true);
    renderer.render(cena, camera);
    const prof = rtCena.depthTexture;
    let fonte = rtCena;
    if (p.ao) {
      mAO.uniforms.tProf.value = prof;
      mAO.uniforms.uProj.value.copy(camera.projectionMatrix);
      mAO.uniforms.uProjInv.value.copy(camera.projectionMatrixInverse);
      mAO.uniforms.uTexel.value.set(1 / p.w, 1 / p.h);
      mAO.uniforms.uTempo.value = (mAO.uniforms.uTempo.value + 1) % 64;
      passo(mAO, rtAO1);
      mDesf.uniforms.tProf.value = prof; mDesf.uniforms.uProjInv.value.copy(camera.projectionMatrixInverse);
      mDesf.uniforms.tAO.value = rtAO1.texture; mDesf.uniforms.uDir.value.set(1.5 / rtAO1.width, 0); passo(mDesf, rtAO2);
      mDesf.uniforms.tAO.value = rtAO2.texture; mDesf.uniforms.uDir.value.set(0, 1.5 / rtAO1.height); passo(mDesf, rtAO1);
      mAplica.uniforms.tCena.value = rtCena.texture; mAplica.uniforms.tAO.value = rtAO1.texture;
      passo(mAplica, rtA);
      fonte = rtA;
    } else {
      mCopia.uniforms.tCena.value = rtCena.texture; passo(mCopia, rtA); fonte = rtA;
    }
    // água: copia a cena e desenha a água por cima, lendo a cena e a profundidade
    mCopia.uniforms.tCena.value = fonte.texture; passo(mCopia, rtB);
    if (ganchos && ganchos.agua) {
      renderer.setRenderTarget(rtB);
      renderer.autoClear = false;
      ganchos.agua(renderer, camera, fonte.texture, prof, p.w, p.h);
    }
    // brilho
    let brilho = null;
    if (p.brilho) {
      mLimiar.uniforms.tCena.value = rtB.texture; mLimiar.uniforms.uTexel.value.set(0.5 / p.w, 0.5 / p.h);
      passo(mLimiar, cadeia[0][0]);
      for (let i = 1; i < cadeia.length; i++) {
        const a = cadeia[i - 1][0];
        mDesce.uniforms.tFonte.value = a.texture; mDesce.uniforms.uTexel.value.set(1 / a.width, 1 / a.height);
        passo(mDesce, cadeia[i][0]);
      }
      let cima = cadeia[cadeia.length - 1][0];
      for (let i = cadeia.length - 2; i >= 0; i--) {
        mSobe.uniforms.tFonte.value = cima.texture; mSobe.uniforms.tMaior.value = cadeia[i][0].texture;
        mSobe.uniforms.uTexel.value.set(1 / cima.width, 1 / cima.height); mSobe.uniforms.uMistura.value = 0.85;
        passo(mSobe, cadeia[i][1]);
        cima = cadeia[i][1];
      }
      brilho = cima.texture;
    }
    mFinal.uniforms.tCena.value = rtB.texture;
    mFinal.uniforms.tBrilho.value = brilho || rtAO1.texture;
    mFinal.uniforms.uBrilho.value = brilho ? (o.brilho !== undefined ? o.brilho : 0.045) : 0;
    mFinal.uniforms.uExpo.value = o.exposicao || 1;
    mFinal.uniforms.uTempo.value = (mFinal.uniforms.uTempo.value + 0.618) % 1;
    passo(mFinal, destino || null);
    renderer.autoClear = ac;
  }
  return { redimensionar, renderizar, p, final: mFinal, get rtCena() { return rtCena; }, get largura() { return p.w; }, get altura() { return p.h; } };
}
