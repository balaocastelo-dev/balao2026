// Post-processing: scene -> HDR target (MSAA + depth) -> AO (from depth) + selective bloom (layer 1) -> grade/tone-map to screen.
import * as THREE from 'three';

export const BLOOM_LAYER = 1;
const VERT = /* glsl */`varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

const AO_FRAG = /* glsl */`
precision highp float;
uniform sampler2D tDepth; uniform mat4 uProjInv; uniform mat4 uProj; uniform vec2 uRes; uniform float uRadius; uniform float uNear; uniform float uFar;
varying vec2 vUv;
vec3 viewPos(vec2 uv){ float d = texture2D(tDepth, uv).x; vec4 c = vec4(uv * 2.0 - 1.0, d * 2.0 - 1.0, 1.0); vec4 v = uProjInv * c; return v.xyz / v.w; }
float ign(vec2 p){ return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715)))); }
void main(){
  float d0 = texture2D(tDepth, vUv).x; if (d0 >= 0.99999) { gl_FragColor = vec4(1.0); return; }
  vec2 px = 1.0 / uRes; vec3 P = viewPos(vUv);
  // normal from the closest depth neighbours (avoids halos at edges)
  vec3 l = viewPos(vUv - vec2(px.x, 0.0)), r = viewPos(vUv + vec2(px.x, 0.0)), dn = viewPos(vUv - vec2(0.0, px.y)), up = viewPos(vUv + vec2(0.0, px.y));
  vec3 dx = abs(l.z - P.z) < abs(r.z - P.z) ? P - l : r - P; vec3 dy = abs(dn.z - P.z) < abs(up.z - P.z) ? P - dn : up - P;
  vec3 N = normalize(cross(dx, dy));
  float ang = ign(gl_FragCoord.xy) * 6.2831853; float occ = 0.0; const int NS = 12;
  float rad = uRadius * clamp(-P.z / 12.0, 0.75, 1.5);
  for (int i = 0; i < NS; i++) {
    float fi = float(i); float a = ang + fi * 2.39996323; float rr = sqrt((fi + 0.5) / float(NS));
    vec3 t = normalize(cross(N, abs(N.y) < 0.9 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0))); vec3 b = cross(N, t);
    float h = 0.25 + 0.75 * fract(fi * 0.618 + ang); vec3 dir = normalize(t * cos(a) * rr + b * sin(a) * rr + N * h);
    vec3 S = P + dir * rad * (0.35 + 0.65 * rr);
    vec4 c = uProj * vec4(S, 1.0); vec2 suv = c.xy / c.w * 0.5 + 0.5; if (suv.x < 0.0 || suv.x > 1.0 || suv.y < 0.0 || suv.y > 1.0) continue;
    float sz = viewPos(suv).z; float range = smoothstep(0.0, 1.0, rad / max(abs(P.z - sz), 1e-4));
    occ += (sz >= S.z + 0.02 ? 1.0 : 0.0) * range;
  }
  float ao = 1.0 - occ / float(NS); ao = pow(clamp(ao, 0.0, 1.0), 2.6);
  gl_FragColor = vec4(vec3(ao), 1.0);
}`;
const AO_BLUR = /* glsl */`
precision highp float; uniform sampler2D tAO; uniform sampler2D tDepth; uniform vec2 uDir; uniform float uNear; uniform float uFar; varying vec2 vUv;
float lin(float d){ float z = d * 2.0 - 1.0; return 2.0 * uNear * uFar / (uFar + uNear - z * (uFar - uNear)); }
void main(){ float c = lin(texture2D(tDepth, vUv).x); float sum = 0.0, w = 0.0;
  for (int i = -3; i <= 3; i++) { vec2 uv = vUv + uDir * float(i); float d = lin(texture2D(tDepth, uv).x); float k = exp(-float(i * i) / 6.0) * (abs(d - c) < 0.02 * c + 0.04 ? 1.0 : 0.02); sum += texture2D(tAO, uv).r * k; w += k; }
  gl_FragColor = vec4(vec3(sum / w), 1.0); }`;
const BLUR = /* glsl */`
precision highp float; uniform sampler2D tMap; uniform vec2 uDir; varying vec2 vUv;
void main(){ vec3 c = texture2D(tMap, vUv).rgb * 0.227027; c += (texture2D(tMap, vUv + uDir * 1.3846).rgb + texture2D(tMap, vUv - uDir * 1.3846).rgb) * 0.316216; c += (texture2D(tMap, vUv + uDir * 3.2308).rgb + texture2D(tMap, vUv - uDir * 3.2308).rgb) * 0.070270; gl_FragColor = vec4(c, 1.0); }`;
const FINAL = /* glsl */`
precision highp float;
uniform sampler2D tMain, tAO, tB0, tB1, tB2, tB3; uniform vec2 uRes; uniform float uAO, uBloom, uExposure, uTilt, uFocus, uCctv, uTime, uVignette, uSat, uContrast, uGrade, uDebug; uniform vec3 uShadowTint, uHighTint;
varying vec2 vUv;
vec3 rrtFit(vec3 v){ vec3 a = v * (v + 0.0245786) - 0.000090537; vec3 b = v * (0.983729 * v + 0.4329510) + 0.238081; return a / b; }
vec3 acesMap(vec3 color){ const mat3 I = mat3(vec3(0.59719, 0.07600, 0.02840), vec3(0.35458, 0.90834, 0.13383), vec3(0.04823, 0.01566, 0.83777)); const mat3 O = mat3(vec3(1.60475, -0.10208, -0.00327), vec3(-0.53108, 1.10813, -0.07276), vec3(-0.07367, -0.00605, 1.07602)); color *= uExposure / 0.6; color = I * color; color = rrtFit(color); color = O * color; return clamp(color, 0.0, 1.0); }
float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
void main(){
  vec2 uv = vUv; vec3 col;
  if (uCctv > 0.5) { vec2 c = uv - 0.5; uv = 0.5 + c * (1.0 + 0.10 * dot(c, c)); }
  if (uTilt > 0.001) { float r = uTilt * smoothstep(0.06, 0.5, abs(uv.y - uFocus)); vec3 acc = vec3(0.0); float a0 = hash(gl_FragCoord.xy) * 6.2831; for (int i = 0; i < 16; i++) { float fi = float(i); float a = a0 + fi * 2.39996; float rr = sqrt((fi + 0.5) / 16.0) * r; acc += texture2D(tMain, uv + vec2(cos(a), sin(a) * uRes.x / uRes.y) * rr).rgb; } col = acc / 16.0; }
  else col = texture2D(tMain, uv).rgb;
  float ao = mix(1.0, texture2D(tAO, uv).r, uAO); col *= ao;
  vec3 bloom = texture2D(tB0, uv).rgb * 0.9 + texture2D(tB1, uv).rgb * 0.8 + texture2D(tB2, uv).rgb * 0.7 + texture2D(tB3, uv).rgb * 0.6; col += bloom * uBloom;
  if (uDebug > 1.5) col = vec3(ao) * 0.6; else if (uDebug > 0.5) col = bloom * uBloom;
  col = acesMap(col);
  float luma = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col = mix(col, col * mix(uShadowTint, uHighTint, smoothstep(0.12, 0.85, luma)), uGrade);
  col = mix(vec3(luma), col, uSat); col = (col - 0.5) * uContrast + 0.5;
  vec2 vc = vUv - 0.5; col *= 1.0 - uVignette * smoothstep(0.25, 0.95, dot(vc, vc) * 2.2);
  if (uCctv > 0.5) { float l2 = dot(col, vec3(0.299, 0.587, 0.114)); col = mix(col, vec3(l2) * vec3(0.92, 1.0, 0.95), 0.55); col *= 0.94 + 0.06 * sin(vUv.y * uRes.y * 1.6); col += (hash(vUv * uRes + uTime * 60.0) - 0.5) * 0.045; col *= 1.0 - 0.5 * smoothstep(0.3, 1.0, dot(vc, vc) * 2.6); }
  col = clamp(col, 0.0, 1.0);
  gl_FragColor = vec4(mix(col * 12.92, 1.055 * pow(col, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, col)), 1.0);
}`;

export class Post {
  constructor(renderer, { msaa = 4, ao = true } = {}) {
    this.r = renderer; this.msaa = msaa; this.aoOn = ao; this.ok = true;
    this.cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1); this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), null); this.quad.frustumCulled = false; this.qs = new THREE.Scene(); this.qs.add(this.quad);
    const mk = (frag, uniforms) => new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: frag, uniforms, depthTest: false, depthWrite: false });
    this.mAO = mk(AO_FRAG, { tDepth: { value: null }, uProjInv: { value: new THREE.Matrix4() }, uProj: { value: new THREE.Matrix4() }, uRes: { value: new THREE.Vector2() }, uRadius: { value: 0.32 }, uNear: { value: 0.1 }, uFar: { value: 400 } });
    this.mAOB = mk(AO_BLUR, { tAO: { value: null }, tDepth: { value: null }, uDir: { value: new THREE.Vector2() }, uNear: { value: 0.1 }, uFar: { value: 400 } });
    this.mBlur = mk(BLUR, { tMap: { value: null }, uDir: { value: new THREE.Vector2() } });
    this.mFinal = mk(FINAL, { tMain: { value: null }, tAO: { value: null }, tB0: { value: null }, tB1: { value: null }, tB2: { value: null }, tB3: { value: null }, uRes: { value: new THREE.Vector2() }, uAO: { value: 0.85 }, uBloom: { value: 0.55 }, uExposure: { value: 1.0 }, uTilt: { value: 0 }, uFocus: { value: 0.5 }, uCctv: { value: 0 }, uTime: { value: 0 }, uVignette: { value: 0.22 }, uSat: { value: 1.06 }, uContrast: { value: 1.07 }, uGrade: { value: 1.0 }, uDebug: { value: 0 }, uShadowTint: { value: new THREE.Vector3(0.95, 0.99, 1.07) }, uHighTint: { value: new THREE.Vector3(1.035, 1.0, 0.955) } });
    this.white = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1); this.white.needsUpdate = true;
    this.black = new THREE.Color(0x000000); this.tmpC = new THREE.Color();
  }
  setSize(w, h) {
    w = Math.max(2, Math.floor(w)); h = Math.max(2, Math.floor(h)); if (this.w === w && this.h === h) return; this.w = w; this.h = h; this.dispose();
    const depth = new THREE.DepthTexture(w, h); depth.type = THREE.UnsignedIntType; depth.minFilter = depth.magFilter = THREE.NearestFilter;
    this.rtMain = new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType, samples: this.msaa, depthBuffer: true, depthTexture: depth });
    this.rtEm = new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType, depthBuffer: true, depthTexture: depth });
    const half = (d) => new THREE.WebGLRenderTarget(Math.max(2, w >> d), Math.max(2, h >> d), { type: THREE.HalfFloatType, depthBuffer: false });
    this.bl = [1, 2, 3, 4].map(d => [half(d), half(d)]);
    this.rtAO = [new THREE.WebGLRenderTarget(w >> 1, h >> 1, { depthBuffer: false }), new THREE.WebGLRenderTarget(w >> 1, h >> 1, { depthBuffer: false })];
  }
  dispose() { for (const t of [this.rtMain, this.rtEm, ...(this.bl || []).flat(), ...(this.rtAO || [])]) if (t) t.dispose(); }
  pass(mat, target) { this.quad.material = mat; this.r.setRenderTarget(target); this.r.render(this.qs, this.cam); }
  render(scene, camera, o = {}) {
    const r = this.r, u = this.mFinal.uniforms;
    // 1. scene
    r.setRenderTarget(this.rtMain); r.render(scene, camera);
    // 2. emissive layer only, depth-tested against the scene depth that pass 1 produced (shared depth texture)
    const bg = scene.background, mask = camera.layers.mask, auto = r.shadowMap.autoUpdate, ac = r.autoClear; r.shadowMap.autoUpdate = false;
    scene.background = null; r.setRenderTarget(this.rtEm); r.getClearColor(this.tmpC); const ca = r.getClearAlpha(); r.setClearColor(0x000000, 1); r.autoClear = false; r.clear(true, false, false);
    camera.layers.set(BLOOM_LAYER); r.render(scene, camera);
    camera.layers.mask = mask; scene.background = bg; r.shadowMap.autoUpdate = auto; r.autoClear = ac; r.setClearColor(this.tmpC, ca);
    // 3. blur chain
    let src = this.rtEm.texture; for (const [a, b] of this.bl) { this.mBlur.uniforms.tMap.value = src; this.mBlur.uniforms.uDir.value.set(1 / a.width, 0); this.pass(this.mBlur, a); this.mBlur.uniforms.tMap.value = a.texture; this.mBlur.uniforms.uDir.value.set(0, 1 / a.height); this.pass(this.mBlur, b); src = b.texture; }
    // 4. ambient occlusion from depth
    const useAO = this.aoOn && o.ao !== false;
    if (useAO) { const m = this.mAO.uniforms; m.tDepth.value = this.rtMain.depthTexture; m.uProj.value.copy(camera.projectionMatrix); m.uProjInv.value.copy(camera.projectionMatrixInverse); m.uRes.value.set(this.rtAO[0].width, this.rtAO[0].height); m.uNear.value = camera.near; m.uFar.value = camera.far; this.pass(this.mAO, this.rtAO[0]);
      const b = this.mAOB.uniforms; b.tDepth.value = this.rtMain.depthTexture; b.uNear.value = camera.near; b.uFar.value = camera.far; b.tAO.value = this.rtAO[0].texture; b.uDir.value.set(1 / this.rtAO[0].width, 0); this.pass(this.mAOB, this.rtAO[1]); b.tAO.value = this.rtAO[1].texture; b.uDir.value.set(0, 1 / this.rtAO[0].height); this.pass(this.mAOB, this.rtAO[0]); }
    // 5. final
    u.tMain.value = this.rtMain.texture; u.tAO.value = useAO ? this.rtAO[0].texture : this.white; u.tB0.value = this.bl[0][1].texture; u.tB1.value = this.bl[1][1].texture; u.tB2.value = this.bl[2][1].texture; u.tB3.value = this.bl[3][1].texture; u.uRes.value.set(this.w, this.h);
    u.uExposure.value = o.exposure ?? 1; u.uTilt.value = o.tilt ?? 0; u.uFocus.value = o.focus ?? 0.5; u.uCctv.value = o.cctv ? 1 : 0; u.uTime.value = o.time ?? 0; u.uBloom.value = o.bloom ?? 0.55; u.uAO.value = o.aoStrength ?? 0.85; u.uVignette.value = o.vignette ?? 0.22; u.uSat.value = o.sat ?? 1.06; u.uDebug.value = this.debug || 0;
    this.pass(this.mFinal, null);
  }
}
