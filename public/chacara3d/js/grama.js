// Grama de verdade no gramado: folhinhas desenhadas pela placa de vídeo em volta de quem anda,
// com vento, variação de cor e as folhas se abrindo onde a gente pisa. Longe, fica a textura do chão.
import * as THREE from 'three';
import { U } from './materiais.js';

const X0 = 0, X1 = 31.6, Y0 = 0, Y1 = 10, PXM = 20;

// máscara: onde há grama (o resto do terreno que encosta no chão tira a grama de baixo dele)
export function mascaraDaGrama(meta, buf) {
  const W = Math.round((X1 - X0) * PXM), H = Math.round((Y1 - Y0) * PXM);
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  g.fillStyle = '#fff'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#000';
  const esc = meta.escala, B = meta.blocos;
  const pos = new Int16Array(buf, B.pos[0], B.pos[1] * 3), idx = new Uint32Array(buf, B.idx[0], B.idx[1]);
  const livre = m => m === 'grass' || /^(leaf_|flower_|fruit_|stem_|coconut)/.test(m);
  const px = (x, y) => [(x - X0) * PXM, (Y1 - y) * PXM];
  for (const gr of meta.groups) {
    if (livre(gr.m)) continue;
    const n = gr.s ? gr.ic / 3 : gr.vc / 3;
    for (let t = 0; t < n; t++) {
      let ok = true; const pts = [];
      for (let k = 0; k < 3; k++) {
        const vi = gr.vo + (gr.s ? idx[gr.io + t * 3 + k] : t * 3 + k);
        const x = pos[vi * 3] * esc, alt = pos[vi * 3 + 1] * esc, y = -pos[vi * 3 + 2] * esc;
        if (alt > 0.6 || alt < -0.1 || x < X0 - 1 || x > X1 + 1) { ok = false; break; }
        pts.push(px(x, y));
      }
      if (!ok) continue;
      g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); g.lineTo(pts[1][0], pts[1][1]); g.lineTo(pts[2][0], pts[2][1]); g.closePath(); g.fill();
    }
  }
  // borda macia: a grama baixa perto das pedras e dos canteiros
  const cv2 = document.createElement('canvas'); cv2.width = W; cv2.height = H;
  const g2 = cv2.getContext('2d'); g2.filter = 'blur(2px)'; g2.drawImage(cv, 0, 0);
  const t = new THREE.CanvasTexture(cv2);
  t.colorSpace = THREE.NoColorSpace; t.minFilter = THREE.LinearFilter; t.magFilter = THREE.LinearFilter; t.generateMipmaps = false;
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  return t;
}

export function criarGrama(cena, mascara, texChao, qualidade) {
  const passo = qualidade >= 2 ? 0.042 : 0.06;
  const raio = qualidade >= 2 ? 17 : 12;
  const N = Math.ceil(2 * raio / passo);
  // folhinha: 7 vértices, afinando até a ponta
  const geo = new THREE.InstancedBufferGeometry();
  const alturas = [0, 0.35, 0.7, 1.0], larg = [1.0, 0.82, 0.5, 0.0];
  const p = [], uv = [];
  for (let i = 0; i < 4; i++) {
    if (i < 3) { p.push(-0.5 * larg[i], alturas[i], 0, 0.5 * larg[i], alturas[i], 0); uv.push(0, alturas[i], 1, alturas[i]); }
    else { p.push(0, 1, 0); uv.push(0.5, 1); }
  }
  geo.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex([0, 1, 3, 0, 3, 2, 2, 3, 5, 2, 5, 4, 4, 5, 6]);
  geo.instanceCount = N * N;
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e4);
  const un = {
    uCentro: { value: new THREE.Vector2() }, uPasso: { value: passo }, uN: { value: N }, uRaio: { value: raio },
    uMascara: { value: mascara }, uPisadas: { value: [new THREE.Vector4(), new THREE.Vector4(), new THREE.Vector4(), new THREE.Vector4()] },
  };
  const mat = new THREE.MeshStandardMaterial({ map: texChao, roughness: 0.75, metalness: 0, side: THREE.DoubleSide, color: 0xffffff });
  mat.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, U, un);
    const comum = /* glsl */`
uniform vec2 uCentro; uniform float uPasso; uniform float uN; uniform float uRaio; uniform sampler2D uMascara; uniform vec4 uPisadas[4];
uniform float uTempo; uniform vec2 uVento;
varying float vBase; varying float vVar;
float gh(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
vec3 folhinha(out vec3 nrm, out float alt, out float variacao, out vec2 pm){
  float id = float(gl_InstanceID);
  float i = mod(id, uN), j = floor(id / uN);
  vec2 cel = floor(uCentro / uPasso) - uN * 0.5 + vec2(i, j);
  vec2 r = vec2(gh(cel), gh(cel + 17.3));
  pm = (cel + r) * uPasso;                              // posição em x e z do three
  vec2 lote = vec2(pm.x, -pm.y);
  vec2 muv = vec2(lote.x / ${(X1 - X0).toFixed(2)}, lote.y / ${(Y1 - Y0).toFixed(2)});
  float m = (muv.x < 0.0 || muv.x > 1.0 || muv.y < 0.0 || muv.y > 1.0) ? 0.0 : texture2D(uMascara, vec2(muv.x, muv.y)).r;
  float d = distance(pm, uCentro);
  float corte = smoothstep(uRaio, uRaio * 0.7, d) * step(0.3, m);
  float rr = gh(cel + 3.7);
  if (rr > 0.55 + 0.45 * smoothstep(uRaio, 4.0, d)) corte = 0.0;     // menos folhas longe
  variacao = gh(cel + 9.1);
  alt = (0.055 + 0.075 * variacao * variacao) * corte * (0.55 + 0.45 * m);
  float ang = gh(cel + 5.3) * 6.2831;
  vec3 dirF = vec3(cos(ang), 0.0, sin(ang));
  nrm = normalize(vec3(-dirF.z, 0.0, dirF.x));
  return dirF;
}
`;
    sh.vertexShader = comum + sh.vertexShader
      .replace('#include <beginnormal_vertex>', 'vec3 nF; float altF; float varF; vec2 pmF; vec3 dirF = folhinha(nF, altF, varF, pmF);\nvec3 objectNormal = normalize(mix(nF, vec3(0.0, 1.0, 0.0), 0.65));')
      .replace('#include <begin_vertex>', /* glsl */`
vec3 transformed;
{
  float t = position.y;
  float largura = 0.0045 + 0.003 * varF;
  vec3 base = vec3(pmF.x, -0.002, pmF.y);
  vec3 lateral = dirF * position.x * largura;
  // curvatura natural + vento + pisadas
  float s = sin(uTempo * 1.7 + pmF.x * 0.45 + pmF.y * 0.3) * 0.5 + sin(uTempo * 3.1 + pmF.x * 1.3) * 0.25 + 0.35;
  vec2 empurra = uVento * s * 0.55;
  for (int k = 0; k < 4; k++) {
    vec4 q = uPisadas[k];
    vec2 dd = pmF - q.xy; float dist = length(dd);
    empurra += dd / max(dist, 0.001) * q.w * smoothstep(q.z, 0.0, dist) * 1.6;
  }
  vec2 curva = (vec2(gh(pmF * 7.1), gh(pmF * 3.3)) - 0.5) * 0.9 + empurra;
  vec3 desl = vec3(curva.x, 0.0, curva.y) * altF * t * t;
  float h = altF * t * (1.0 - 0.25 * dot(curva, curva));
  transformed = base + lateral * (altF > 0.0 ? 1.0 : 0.0) + vec3(0.0, h, 0.0) + desl;
  vBase = t; vVar = varF;
  #ifdef USE_MAP
  vMapUv = vec2(pmF.x, -pmF.y) * 0.5;
  #endif
}`)
;
    sh.fragmentShader = 'varying float vBase; varying float vVar;\n' + sh.fragmentShader
      .replace('#include <map_fragment>', /* glsl */`#include <map_fragment>
diffuseColor.rgb *= mix(vec3(0.42, 0.5, 0.36), vec3(1.15, 1.12, 0.85), vBase) * (0.85 + 0.3 * vVar);
diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(1.25, 1.1, 0.6), smoothstep(0.85, 1.0, vVar) * vBase);`);
  };
  mat.customProgramCacheKey = () => 'grama' + qualidade;
  const malha = new THREE.Mesh(geo, mat);
  malha.frustumCulled = false; malha.receiveShadow = true; malha.castShadow = false;
  cena.add(malha);
  function atualizar(camPos, pisadas) {
    un.uCentro.value.set(camPos.x, camPos.z);
    for (let k = 0; k < 4; k++) {
      const q = pisadas[k];
      if (q) un.uPisadas.value[k].set(q[0], q[1], q[2], q[3]); else un.uPisadas.value[k].set(0, 0, 0.01, 0);
    }
  }
  return { malha, atualizar };
}
