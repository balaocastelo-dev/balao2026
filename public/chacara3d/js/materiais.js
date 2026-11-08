// Materiais físicos (PBR) com as texturas geradas para a chácara, e os "remendos" de shader:
// vento nas plantas, translucidez das folhas, sombra das nuvens, cáusticas no fundo da água
// e luz de ambiente reduzida dentro das casinhas.
import * as THREE from 'three';
import { GLSL_NUVENS } from './ceu.js';
import { corLinear } from './util.js';

const BASE = '/chacara3d/';

// uniforms compartilhados por todos os materiais remendados
export const U = {
  uTempo: { value: 0 },
  uVento: { value: new THREE.Vector2(0.8, 0.45) },
  uCasas: { value: [new THREE.Vector4(), new THREE.Vector4(), new THREE.Vector4()] },
  uFrente: { value: [0, 0, 0] },
  uFatorInt: { value: 0.36 },
  uSolVista: { value: new THREE.Vector3(0, 1, 0) },
  uSolMundo: { value: new THREE.Vector3(0, 1, 0) },
  uCorSol: { value: new THREE.Color(1, 1, 1) },
  uForcaSol: { value: 3 },
  uCobertura: { value: 0.42 },
  uSombraNuvem: { value: 1 },
  uAguaPiscina: { value: new THREE.Vector4(34.2, 44.0, -4.7, -1.1) },
  uNivelPiscina: { value: -0.07 },
  uAguaLago: { value: new THREE.Vector4(46.08, 49.2, -6.25, -3.15) },
  uNivelLago: { value: -0.64 },
  uAguaHidro: { value: new THREE.Vector4(32.22, 33.98, -3.08, -1.32) },
  uNivelHidro: { value: 0.42 },
  // casas da vilinha: até onde vai a caixa de cada casa e o brilho quente de dentro à noite
  uTopoCasa: { value: 5.5 },
  uLuzCasa: { value: [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()] },
  // projeção mapeada: até NPROJ projetores que lançam um ladrilho do atlas sobre o que estiver
  // dentro do seu tronco de visão (o perto/longe do projetor limita a fatia iluminada)
  uProjAtlas: { value: null },
  uProjMat: { value: Array.from({ length: 12 }, () => new THREE.Matrix4()) },
  uProjTile: { value: Array.from({ length: 12 }, () => new THREE.Vector4(0, 0, 1, 1)) },
  uProjCor: { value: Array.from({ length: 12 }, () => new THREE.Vector4(0, 0, 0, 0)) },
  uProjPos: { value: Array.from({ length: 12 }, () => new THREE.Vector4()) },
  uProjRep: { value: Array.from({ length: 12 }, () => new THREE.Vector4(1, 1, 0, 0)) },
};
export const NPROJ = 12;
let projecaoLigada = true;      // sem projeção no celular (economiza conta e uniforms)
export function usarProjecao(sim) { projecaoLigada = sim; }
{
  const preto = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1); preto.needsUpdate = true;
  U.uProjAtlas.value = preto;
}

const GLSL_COMUM = /* glsl */`
uniform float uTempo; uniform vec2 uVento; uniform float uVentoK; uniform float uTransK;
uniform vec4 uCasas[3]; uniform float uFrente[3]; uniform float uFatorInt; uniform float uTopoCasa; uniform vec3 uLuzCasa[3];
uniform vec3 uSolVista; uniform vec3 uSolMundo; uniform vec3 uCorSol; uniform float uForcaSol;
uniform float uCobertura; uniform float uSombraNuvem;
uniform vec4 uAguaPiscina; uniform float uNivelPiscina; uniform vec4 uAguaLago; uniform float uNivelLago; uniform vec4 uAguaHidro; uniform float uNivelHidro;
varying vec3 vPosMundoR;
`;

const VENTO_VERT = /* glsl */`
#include <begin_vertex>
#ifdef VENTO
{
  vec3 pw = (modelMatrix * vec4(transformed, 1.0)).xyz;
  float base = pw.x > 46.0 ? -1.0 : 0.0;
  float h = max(pw.y - base, 0.0);
  float fase = dot(pw.xz, vec2(0.23, 0.17));
  float s = sin(uTempo * 1.1 + fase) * 0.55 + sin(uTempo * 2.3 + fase * 1.7) * 0.25 + sin(uTempo * 0.31 + fase * 0.4) * 0.6;
  vec2 d = uVento * s * h * h * uVentoK;
  transformed.x += d.x; transformed.z += d.y;
  #ifdef FOLHA
  {
    float pv = fract(sin(dot(floor(pw * 3.0), vec3(12.9898, 78.233, 37.719))) * 43758.5453) * 6.2831;
    float k = 0.016 * clamp(uv.y, 0.0, 1.0) * (0.6 + 0.4 * length(uVento));
    transformed += vec3(sin(uTempo * 6.3 + pv), sin(uTempo * 7.9 + pv * 1.3), sin(uTempo * 5.7 + pv * 0.7)) * k;
  }
  #endif
}
#endif
`;

// luz direta do sol com sombra das nuvens e translucidez das folhas
function chunkLuzes() {
  return THREE.ShaderChunk.lights_physical_pars_fragment.replace(
    'void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {',
    /* glsl */`
float sombraDasNuvens(vec3 p){
  #ifdef NUVENS
  vec3 s = normalize(uSolMundo);
  if (s.y < 0.02) return 1.0;
  vec2 q = (p.xz + s.xz / s.y * (1600.0 - p.y)) / 1000.0;
  q = vec2(q.x, q.y);
  float d = densidadeNuvem(q, uTempo, uCobertura);
  return 1.0 - 0.72 * d * uSombraNuvem;
  #else
  return 1.0;
  #endif
}
void RE_Direct_Physical( const in IncidentLight directLight0, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
  IncidentLight directLight = directLight0;
  #ifdef FOLHA
  {
    float tras = saturate(dot(-geometryNormal, directLight.direction));
    float contra = pow(saturate(dot(geometryViewDir, -directLight.direction)), 4.0);
    reflectedLight.directDiffuse += directLight.color * uTransCor * (tras * 0.45 + contra * 0.9) * uTransK;
  }
  #endif
`);
}

const NUVEM_DEF = '\n' + GLSL_NUVENS + '\n';

// luz dos projetores (projeção mapeada e luz de jardim): soma como luz difusa sobre a cor do material
const GLSL_PROJECAO = /* glsl */`
#ifdef PROJECAO
{
  vec3 pw = vPosMundoR;
  vec3 nw = normalize(inverseTransformDirection(normal, viewMatrix));
  for (int i = 0; i < NPROJ; i++) {
    vec4 pc = uProjCor[i];
    if (pc.a <= 0.0) continue;
    vec4 cl = uProjMat[i] * vec4(pw, 1.0);
    if (cl.w <= 0.0) continue;
    vec3 nd = cl.xyz / cl.w;
    if (abs(nd.x) > 1.0 || abs(nd.y) > 1.0 || abs(nd.z) > 1.0) continue;
    vec4 rp = uProjRep[i];
    vec2 q = nd.xy * 0.5 + 0.5;
    vec2 bq = smoothstep(vec2(0.0), vec2(0.03), q) * smoothstep(vec2(0.0), vec2(0.03), 1.0 - q);
    vec2 qt = clamp(fract(q * rp.xy), vec2(0.002), vec2(0.998));
    vec4 tl = uProjTile[i];
    vec3 luz = texture2D(uProjAtlas, tl.xy + qt * tl.zw).rgb;
    float ndl = dot(nw, normalize(uProjPos[i].xyz - pw));
    float fac = rp.z > 0.5 ? (0.35 + 0.65 * abs(ndl)) : max(ndl, 0.0);
    float fz = smoothstep(1.0, 0.85, abs(nd.z));
    totalEmissiveRadiance += diffuseColor.rgb * luz * pc.rgb * (pc.a * fac * bq.x * bq.y * fz);
  }
}
#endif
`;

const GLSL_PROJ_UNI = `#ifdef PROJECAO
uniform sampler2D uProjAtlas; uniform mat4 uProjMat[NPROJ]; uniform vec4 uProjTile[NPROJ]; uniform vec4 uProjCor[NPROJ]; uniform vec4 uProjPos[NPROJ]; uniform vec4 uProjRep[NPROJ];
#endif
`;

function remendar(material, o) {
  o = o || {};
  const defs = [];
  // força do vento e da translucidez vão como valores (uniform), não como #define:
  // assim todas as plantas usam o mesmo programa
  if (o.vento) defs.push('#define VENTO');
  if (o.folha) defs.push('#define FOLHA');
  if (o.semVirar) defs.push('#define SEM_VIRAR');
  if (o.interior !== false) defs.push('#define INTERIOR');
  if (o.nuvens !== false) defs.push('#define NUVENS');
  if (o.causticas) defs.push('#define CAUSTICAS');
  if (projecaoLigada && o.projecao !== false) defs.push('#define PROJECAO\n#define NPROJ ' + NPROJ);
  const prefixo = defs.join('\n') + '\n';
  material.onBeforeCompile = shader => {
    Object.assign(shader.uniforms, U);
    shader.uniforms.uVentoK = { value: o.vento || 0 };
    shader.uniforms.uTransK = { value: o.trans || 1 };
    if (o.folha) shader.uniforms.uTransCor = { value: o.transCor || new THREE.Color(0.4, 0.55, 0.12) };
    shader.vertexShader = prefixo + GLSL_COMUM + shader.vertexShader
      .replace('#include <begin_vertex>', VENTO_VERT)
      .replace('#include <project_vertex>', '#include <project_vertex>\n vPosMundoR = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    let f = prefixo + GLSL_COMUM + (o.folha ? 'uniform vec3 uTransCor;\n' : '') + GLSL_PROJ_UNI + NUVEM_DEF + shader.fragmentShader;
    f = f.replace('#include <lights_physical_pars_fragment>', chunkLuzes());
    // sombra das nuvens só na luz do sol (uma conta por pixel, não uma por lâmpada)
    f = f.replace('#include <lights_fragment_begin>', THREE.ShaderChunk.lights_fragment_begin.replace(
      'getDirectionalLightInfo( directionalLight, directLight );',
      'getDirectionalLightInfo( directionalLight, directLight );\n\t\tdirectLight.color *= sombraDasNuvens( vPosMundoR );'));
    if (o.semVirar) f = f.replace('#include <normal_fragment_begin>', THREE.ShaderChunk.normal_fragment_begin.replace('normal *= faceDirection;', ''));
    f = f.replace('#include <lights_fragment_maps>', /* glsl */`#include <lights_fragment_maps>
#ifdef INTERIOR
{
  vec3 p = vPosMundoR; float fi = 1.0; vec3 brilho = vec3(0.0);
  for (int i = 0; i < 3; i++) {
    vec4 c = uCasas[i];
    if (p.x > c.x + 0.05 && p.x < c.y - 0.05 && p.z > c.z + 0.05 && p.z < c.w - 0.05 && p.y < uTopoCasa) {
      float dfr = abs(p.z - uFrente[i]);
      fi = mix(uFatorInt, 0.85, smoothstep(1.4, 0.0, dfr));
      brilho = uLuzCasa[i];
    }
  }
  iblIrradiance = iblIrradiance * fi + brilho; radiance *= mix(1.0, fi, 0.8);
}
#endif`);
    f = f.replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n' + GLSL_PROJECAO);
    if (o.causticas) {
      f = f.replace('#include <emissivemap_fragment>', /* glsl */`#include <emissivemap_fragment>
{
  vec3 p = vPosMundoR; float k = 0.0; float prof = 0.0;
  if (p.x > uAguaPiscina.x && p.x < uAguaPiscina.y && p.z > uAguaPiscina.z && p.z < uAguaPiscina.w && p.y < uNivelPiscina - 0.02) { k = 1.0; prof = uNivelPiscina - p.y; }
  if (p.x > uAguaLago.x - 0.1 && p.x < uAguaLago.y + 0.1 && p.z > uAguaLago.z - 0.1 && p.z < uAguaLago.w + 0.1 && p.y < uNivelLago - 0.02) { k = 0.45; prof = uNivelLago - p.y; }
  if (p.x > uAguaHidro.x - 0.02 && p.x < uAguaHidro.y + 0.02 && p.z > uAguaHidro.z - 0.02 && p.z < uAguaHidro.w + 0.02 && p.y < uNivelHidro - 0.02) { k = 0.6; prof = uNivelHidro - p.y; }
  if (k > 0.0) {
    vec2 q = (p.xz + vec2(p.y * 0.35, -p.y * 0.2)) * 0.9;
    vec2 pp = mod(q * 6.28318, 6.28318) - 250.0; vec2 ii = pp; float cc = 1.0;
    for (int n = 0; n < 4; n++) {
      float tt = uTempo * 0.55 * (1.0 - (3.5 / float(n + 1)));
      ii = pp + vec2(cos(tt - ii.x) + sin(tt + ii.y), sin(tt - ii.y) + cos(tt + ii.x));
      cc += 1.0 / length(vec2(pp.x / (sin(ii.x + tt) / 0.005), pp.y / (cos(ii.y + tt) / 0.005)));
    }
    cc /= 4.0; cc = 1.17 - pow(cc, 1.4);
    float c = pow(abs(cc), 7.0);
    float sol = max(normalize(uSolMundo).y, 0.0);
    totalEmissiveRadiance += uCorSol * uForcaSol * sol * c * 0.32 * k * diffuseColor.rgb * exp(-prof * 0.45) * sombraDasNuvens(p);
  }
}`);
    }
    shader.fragmentShader = f;
  };
  // o programa só depende das chaves acima: materiais com as mesmas chaves dividem o mesmo
  // programa (menos programas = muito menos tempo compilando na placa de vídeo)
  material.customProgramCacheKey = () => prefixo;
  material.userData.remendo = o;
  return material;
}

// ---------------------------------------------------------------- texturas
let carregador = null, aniso = 8, manifesto = {}, folhasMan = {};
const cache = new Map();
const pendentes = [];
export async function prepararTexturas(renderer, gerenciador) {
  // as imagens são decodificadas fora da linha principal (createImageBitmap), já viradas;
  // assim a página não trava quando as texturas sobem para a placa de vídeo
  carregador = new THREE.ImageBitmapLoader(gerenciador);
  carregador.setOptions({ imageOrientation: 'flipY', premultiplyAlpha: 'none', colorSpaceConversion: 'none' });
  aniso = Math.min(16, renderer.capabilities.getMaxAnisotropy());
  const [a, b] = await Promise.all([fetch(BASE + 'tex/superficies.json').then(r => r.json()), fetch(BASE + 'tex/folhas.json').then(r => r.json())]);
  manifesto = a; folhasMan = b;
}
export function tex(arquivo, cor, repetir) {
  const chave = arquivo + (repetir ? '|r' : '');
  if (cache.has(chave)) return cache.get(chave);
  const t = new THREE.Texture();
  t.flipY = false; // já vem virada do createImageBitmap
  t.colorSpace = cor ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.anisotropy = aniso;
  if (repetir) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  pendentes.push(new Promise(ok => carregador.load(BASE + 'tex/' + arquivo,
    imagem => { t.image = imagem; t.needsUpdate = true; ok(t); },
    undefined,
    erro => { console.warn('textura', arquivo, erro); ok(null); })));
  cache.set(chave, t);
  return t;
}
// espera todas as texturas pedidas até agora e devolve as que chegaram
export function texturasProntas() {
  return Promise.all(pendentes.slice()).then(l => l.filter(Boolean));
}
function conjunto(nome, tamanho) {
  const m = manifesto[nome] || folhasMan[nome] || {};
  const tam = tamanho || m.tamanho_m || [1, 1];
  const r = new THREE.Vector2(1 / tam[0], 1 / tam[1]);
  const c = tex(nome + '_c.webp', true, true); c.repeat.copy(r);
  const n = tex(nome + '_n.webp', false, true); n.repeat.copy(r);
  const o = tex(nome + '_orm.webp', false, true); o.repeat.copy(r);
  return { c, n, o };
}

// material de superfície com textura (UV em metros)
function superficie(nome, extra) {
  const e = extra || {};
  const t = conjunto(nome, e.tamanho);
  const m = new THREE.MeshStandardMaterial({
    map: t.c, normalMap: t.n, roughnessMap: t.o, aoMap: e.semAO ? null : t.o, aoMapIntensity: e.ao !== undefined ? e.ao : 0.7,
    roughness: e.rug !== undefined ? e.rug : 1, metalness: 0, color: e.cor || 0xffffff, side: THREE.DoubleSide,
    normalScale: new THREE.Vector2(e.relevo || 1, e.relevo || 1), envMapIntensity: e.amb !== undefined ? e.amb : 1,
  });
  return remendar(m, { causticas: e.causticas, vento: e.vento, chave: nome });
}
function liso(cor, rug, extra) {
  const e = extra || {};
  const P = e.fisico ? THREE.MeshPhysicalMaterial : THREE.MeshStandardMaterial;
  const m = new P(Object.assign({ color: cor, roughness: rug, metalness: e.metal || 0, side: THREE.DoubleSide }, e.props || {}));
  return remendar(m, { vento: e.vento, chave: 'liso' });
}
function folha(nome, extra) {
  const e = extra || {};
  const man = folhasMan[nome] || {};
  const m = new THREE.MeshStandardMaterial({
    map: tex('folhas/' + nome + '.webp', true, false),
    normalMap: (man.arquivos && man.arquivos.normal) ? tex('folhas/' + nome + '_n.webp', false, false) : null,
    normalScale: new THREE.Vector2(0.7, 0.7),
    alphaTest: 0.45, alphaToCoverage: true, side: THREE.DoubleSide, roughness: man.rugosidade || 0.5, metalness: 0,
    color: e.cor || 0xffffff, envMapIntensity: 0.85,
  });
  const tc = man.translucidez_cor || [0.5, 0.65, 0.15];
  return remendar(m, { vento: e.vento || 0.0016, folha: true, semVirar: e.semVirar, trans: e.trans || 0.55, transCor: corLinear(tc[0], tc[1], tc[2]), chave: nome });
}
function casca(nome, extra) {
  const e = extra || {};
  const t = conjunto(nome);
  const m = new THREE.MeshStandardMaterial({ map: t.c, normalMap: t.n, roughnessMap: t.o, aoMap: t.o, aoMapIntensity: 0.6, roughness: 1, metalness: 0, color: e.cor || 0xffffff, side: THREE.DoubleSide });
  return remendar(m, { vento: e.vento || 0.0016, chave: nome });
}

// tabela: nome do material no modelo -> material do three
export function criarMateriais(info) {
  const M = {};
  const reboco = cor => superficie('reboco', { cor, relevo: 0.8 });
  const madeira = () => superficie('madeira', { relevo: 0.8 });
  Object.assign(M, {
    caco: superficie('caco'),
    stone_cut: superficie('pedra_reta'),
    stone_step: superficie('pedra_natural'),
    filete: superficie('filete', { relevo: 1.2 }),
    brick: superficie('tijolinho'),
    rooftile: superficie('telha'),
    wood_x: madeira(), wood_y: madeira(), wood_z: madeira(),
    log: casca('casca_escura', { vento: 0.00001 }),
    house_white: reboco(0xffffff),
    wall_white: reboco(new THREE.Color(0.97, 0.94, 0.88)),
    wall_sand: reboco(new THREE.Color(0.86, 0.72, 0.52)),
    wall_out: reboco(new THREE.Color(0.55, 0.53, 0.5)),
    wall_moss: reboco(new THREE.Color(0.2, 0.3, 0.18)),
    concrete: superficie('concreto'),
    grass: superficie('grama_chao', { ao: 0.6, relevo: 0.6 }),
    pedrisco: superficie('pedrisco', { ao: 0.7 }),
    seixo: superficie('seixo', { ao: 0.8 }),
    mulch: superficie('terra', { ao: 0.7 }),
    tile: superficie('pastilha', { causticas: true }),
    ladrilho: superficie('ladrilho'),
    pond_floor: superficie('fundo_lago', { causticas: true }),
    // laguinho orgânico e muro de arrimo de pedra (pedras arredondadas em três tons, juntas de argamassa)
    pedra_cinza: superficie('pedra_natural', { cor: new THREE.Color(0.62, 0.62, 0.6), relevo: 1.1, causticas: true }),
    pedra_bege: superficie('pedra_natural', { cor: new THREE.Color(1.05, 0.9, 0.7), relevo: 1.1, causticas: true }),
    pedra_ferrugem: superficie('pedra_natural', { cor: new THREE.Color(0.95, 0.62, 0.4), relevo: 1.1, causticas: true }),
    argamassa: superficie('concreto', { cor: new THREE.Color(0.62, 0.58, 0.52), relevo: 0.6 }),
    granite: superficie('granito'),
    pot_clay: superficie('barro'),
    clay_dome: superficie('barro', { cor: new THREE.Color(1.15, 1.05, 0.95) }),
    pot_fiber: superficie('fibra'),
    rope: superficie('fibra', { cor: new THREE.Color(0.9, 0.85, 0.75) }),
    cushion: superficie('tecido', { cor: new THREE.Color(0.9, 0.86, 0.78) }),
    cushion_teal: superficie('tecido', { cor: new THREE.Color(0.08, 0.36, 0.4) }),
    piso_madeira: superficie('porcelanato_madeira'),
    azulejo: superficie('azulejo_banho'),
    forro: superficie('forro_madeira'),
    tecido_branco: superficie('tecido', { cor: new THREE.Color(0.95, 0.94, 0.9) }),
    tecido_cinza: superficie('tecido', { cor: new THREE.Color(0.42, 0.42, 0.44) }),
    tecido_terra: superficie('tecido', { cor: new THREE.Color(0.62, 0.3, 0.17) }),
    tecido_azul: superficie('tecido', { cor: new THREE.Color(0.13, 0.25, 0.48) }),
    tecido_amarelo: superficie('tecido', { cor: new THREE.Color(0.85, 0.6, 0.18) }),
    tecido_verde: superficie('tecido', { cor: new THREE.Color(0.22, 0.42, 0.3) }),
    cortina: superficie('tecido', { cor: new THREE.Color(0.93, 0.9, 0.82) }),
    // casas da vilinha (interior)
    deck_ipe: superficie('deck', { relevo: 0.9 }),
    porcelanato: superficie('concreto', { cor: new THREE.Color(1.05, 1.03, 1.0), rug: 0.45, relevo: 0.4 }),
    madeira_clara: superficie('madeira', { relevo: 0.6, cor: new THREE.Color(1.45, 1.25, 1.0) }),
    tecido_grafite: superficie('tecido', { cor: new THREE.Color(0.2, 0.2, 0.21) }),
    tapete: superficie('tecido', { cor: new THREE.Color(0.5, 0.48, 0.45) }),
    aluminio_preto: liso(new THREE.Color(0.03, 0.03, 0.032), 0.38, { metal: 0.6 }),
    corten: liso(new THREE.Color(0.36, 0.13, 0.045), 0.78, { metal: 0.25 }),
    gesso: liso(new THREE.Color(0.9, 0.89, 0.86), 0.92),
    laca_grafite: liso(new THREE.Color(0.06, 0.064, 0.07), 0.5),
    quartzo: liso(new THREE.Color(0.88, 0.87, 0.85), 0.2),
    tela_tv: liso(new THREE.Color(0.008, 0.009, 0.011), 0.08),
    vidro_jateado: liso(new THREE.Color(0.82, 0.86, 0.86), 0.55),
    couro: liso(new THREE.Color(0.4, 0.19, 0.08), 0.5),
    // pintura, metal, louça, vidro
    gate_green: liso(new THREE.Color(0.02, 0.13, 0.06), 0.45),
    metal_dark: liso(new THREE.Color(0.05, 0.05, 0.05), 0.42, { metal: 0.7 }),
    inox: liso(new THREE.Color(0.78, 0.78, 0.76), 0.22, { metal: 1 }),
    copper: liso(new THREE.Color(0.85, 0.48, 0.3), 0.3, { metal: 1 }),
    white: liso(new THREE.Color(0.86, 0.86, 0.84), 0.45),
    armario: liso(new THREE.Color(0.88, 0.87, 0.84), 0.32),
    screen: liso(new THREE.Color(0.9, 0.9, 0.89), 0.95),
    soot: liso(new THREE.Color(0.02, 0.018, 0.016), 0.95),
    louca: liso(new THREE.Color(0.93, 0.93, 0.92), 0.06, { fisico: true, props: { clearcoat: 1, clearcoatRoughness: 0.05 } }),
    espelho: liso(new THREE.Color(0.95, 0.95, 0.95), 0.02, { metal: 1 }),
    glass_dark: liso(new THREE.Color(0.02, 0.04, 0.05), 0.05),
    acc_blue: liso(new THREE.Color(0.03, 0.17, 0.42), 0.4),
    acc_yellow: liso(new THREE.Color(0.78, 0.45, 0.04), 0.4),
    acc_green: liso(new THREE.Color(0.04, 0.3, 0.23), 0.4),
    // casas container da vilinha: chapa pintada, quinas, caixilhos brancos
    chapa_azul: liso(new THREE.Color(0.024, 0.038, 0.082), 0.5),
    chapa_amarela: liso(new THREE.Color(0.83, 0.46, 0.021), 0.5),
    chapa_verde: liso(new THREE.Color(0.026, 0.127, 0.07), 0.5),
    pintura_amarela: liso(new THREE.Color(0.95, 0.6, 0.012), 0.45),
    pintura_marinho: liso(new THREE.Color(0.022, 0.036, 0.08), 0.45),
    esquadria_branca: liso(new THREE.Color(0.86, 0.86, 0.84), 0.35),
    mesh: null,
    leaf_core: liso(new THREE.Color(0.012, 0.03, 0.01), 1, { vento: 0.0016 }),
    leaf_core_big: liso(new THREE.Color(0.01, 0.025, 0.009), 1, { vento: 0.0016 }),
    leaf_palm_base: liso(new THREE.Color(0.24, 0.24, 0.1), 0.8, { vento: 0.003 }),
    leaf_palm_rachis: liso(new THREE.Color(0.32, 0.36, 0.12), 0.6, { vento: 0.003 }),
    stem_green: liso(new THREE.Color(0.1, 0.24, 0.06), 0.6, { vento: 0.004 }),
    stem_purple: liso(new THREE.Color(0.12, 0.03, 0.09), 0.6, { vento: 0.004 }),
    fruit_black: liso(new THREE.Color(0.01, 0.005, 0.015), 0.18, { vento: 0.0016 }),
    fruit_red: liso(new THREE.Color(0.62, 0.02, 0.03), 0.3, { vento: 0.0016 }),
    coconut: liso(new THREE.Color(0.32, 0.38, 0.08), 0.45, { vento: 0.003 }),
  });
  // frutas que no modelo são do tipo "folha" (duas cores): usa a cor madura
  for (const k of ['fruit_mango', 'fruit_goiaba', 'fruit_orange', 'fruit_lemon', 'fruit_banana']) {
    const c = (info[k] && info[k].c2) || [0.5, 0.5, 0.1];
    M[k] = liso(new THREE.Color(c[0], c[1], c[2]).multiplyScalar(0.8), 0.4, { vento: 0.0016 });
  }
  // cascas
  M.bark_dark = casca('casca_escura'); M.bark_palm = casca('casca_coqueiro', { vento: 0.003 });
  M.bark_goiaba = casca('casca_goiaba'); M.bark_jabu = casca('casca_jabuticaba'); M.bark_cane = casca('cana', { vento: 0.004 });
  M.stem_banana = casca('cana', { vento: 0.004, cor: new THREE.Color(0.8, 0.95, 0.6) });
  // folhas: cachos (normais para fora da copa, sem virar), tiras e frondes
  const cachos = { leaf_mango: 'manga', leaf_amend: 'amendoeira', leaf_amend_red: 'amendoeira_vermelha', leaf_jabu: 'jabuticaba', leaf_goiaba: 'goiaba', leaf_citrus: 'citrico', leaf_bg: 'fundo' };
  for (const [k, n] of Object.entries(cachos)) M[k] = folha(n, { semVirar: true });
  M.leaf_vine = folha('trepadeira', { vento: 0.0006 });
  M.leaf_vine_light = folha('maracuja', { vento: 0.0006 });
  const tiras = { leaf_banana: 'banana', leaf_trop: 'tropical_larga', leaf_trop2: 'tropical', leaf_lime: 'lima', leaf_dracena: 'dracena', leaf_rafis: 'rafis', leaf_strap: 'capim', leaf_black: 'grama_preta', leaf_purple: 'taioba_roxa', leaf_brom: 'bromelia', leaf_fern: 'samambaia', flower_red: 'flor_vermelha', flower_orange: 'flor_laranja' };
  for (const [k, n] of Object.entries(tiras)) M[k] = folha(n, { vento: 0.004 });
  M.leaf_palm = folha('coqueiro', { vento: 0.003, trans: 0.7 });
  M.leaf_areca = folha('areca', { vento: 0.004, trans: 0.7 });
  // emissivos (lâmpadas, brasa, abajur) e o quadro
  M.bulb = new THREE.MeshStandardMaterial({ color: 0xfff1d8, emissive: new THREE.Color(1.0, 0.72, 0.42), emissiveIntensity: 0.5, roughness: 0.3 });
  M.ember = new THREE.MeshStandardMaterial({ color: 0x220800, emissive: new THREE.Color(1.0, 0.28, 0.04), emissiveIntensity: 2, roughness: 0.9 });
  M.abajur = remendar(new THREE.MeshStandardMaterial({ color: new THREE.Color(0.92, 0.84, 0.68), emissive: new THREE.Color(1.0, 0.7, 0.4), emissiveIntensity: 0, roughness: 0.9, side: THREE.DoubleSide }), { chave: 'abajur' });
  M.quadro = remendar(new THREE.MeshStandardMaterial({ map: quadroPintado(), roughness: 0.7, side: THREE.DoubleSide }), { chave: 'quadro' });
  M.veu_agua = new THREE.MeshStandardMaterial({ color: new THREE.Color(0.85, 0.93, 0.96), roughness: 0.05, metalness: 0, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false });
  M.vidro = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.03, metalness: 0, transparent: true, opacity: 0.12, side: THREE.DoubleSide, depthWrite: false, envMapIntensity: 1.2 });
  M.mesh = new THREE.MeshStandardMaterial({ map: telaGalinheiro(), alphaTest: 0.5, alphaToCoverage: true, side: THREE.DoubleSide, roughness: 0.5, metalness: 0.6, color: 0x9a9a9a });
  return M;
}

// quadro: uma paisagem pintada no navegador (morros, céu, coqueiro)
function quadroPintado() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 512;
  const g = c.getContext('2d');
  const ceu = g.createLinearGradient(0, 0, 0, 300); ceu.addColorStop(0, '#5b8fc4'); ceu.addColorStop(1, '#f2c79a');
  g.fillStyle = ceu; g.fillRect(0, 0, 512, 512);
  g.fillStyle = '#f7e2b8'; g.beginPath(); g.arc(360, 210, 34, 0, 7); g.fill();
  const morro = (y, cor, a) => { g.fillStyle = cor; g.beginPath(); g.moveTo(0, 512); for (let x = 0; x <= 512; x += 16) g.lineTo(x, y + Math.sin(x * a) * 26 + Math.sin(x * a * 2.7) * 9); g.lineTo(512, 512); g.fill(); };
  morro(300, '#6f8a5a', 0.012); morro(350, '#4c6b3c', 0.02); morro(410, '#35532c', 0.016);
  g.strokeStyle = '#3a2a1a'; g.lineWidth = 7; g.beginPath(); g.moveTo(130, 470); g.quadraticCurveTo(150, 360, 120, 250); g.stroke();
  g.strokeStyle = '#2f5a24'; g.lineWidth = 5;
  for (let i = 0; i < 9; i++) { const a = i / 9 * 6.28; g.beginPath(); g.moveTo(120, 250); g.quadraticCurveTo(120 + Math.cos(a) * 50, 250 + Math.sin(a) * 20 - 30, 120 + Math.cos(a) * 90, 260 + Math.abs(Math.sin(a)) * 40); g.stroke(); }
  for (let i = 0; i < 4000; i++) { g.fillStyle = 'rgba(255,255,255,' + (Math.random() * 0.05) + ')'; g.fillRect(Math.random() * 512, Math.random() * 512, 2, 2); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
// tela hexagonal do galinheiro
function telaGalinheiro() {
  const c = document.createElement('canvas'); c.width = 128; c.height = 128;
  const g = c.getContext('2d');
  g.clearRect(0, 0, 128, 128); g.strokeStyle = '#ffffff'; g.lineWidth = 3;
  const hex = (cx, cy, r) => { g.beginPath(); for (let i = 0; i <= 6; i++) { const a = Math.PI / 3 * i + Math.PI / 6; g.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a)); } g.stroke(); };
  const r = 32 / Math.sqrt(3);
  for (let y = -1; y < 6; y++) for (let x = -1; x < 6; x++) hex(x * 32 + (y % 2 ? 16 : 0), y * r * 1.5, r);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(10, 10); return t;
}

export { remendar };
