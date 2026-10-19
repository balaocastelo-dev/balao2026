// Passeio 3D pela chácara: liga tudo (céu, terreno, água, grama, casas, bichos, som, cinema),
// cuida da caminhada, da foto, da gravação do vídeo e do menu.
import * as THREE from 'three';
import { $, W3, clamp, lerp, sstep, aviso, carimbo, estado } from './util.js';
import { criarCeu } from './ceu.js';
import { criarPipeline } from './pipeline.js';
import { prepararTexturas, criarMateriais, tex, texturasProntas, U, usarProjecao } from './materiais.js';
import { baixarModelo, construirTerreno, chaoDeFora, criarColisao, lugares, ondeEstou } from './mundo.js';
import { mascaraDaGrama, criarGrama } from './grama.js';
import { criarAgua } from './agua.js';
import { criarCasas } from './casas.js';
import { criarBichos } from './bichos.js';
import { criarSom } from './som.js';
import { criarCinema } from './cinema.js';
import { criarProjecoes } from './projecoes.js';
import { criarCenarios } from './cenarios.js';

const canvas = $('c');
const falha = (titulo, texto) => { $('enter').textContent = titulo; $('enter').disabled = true; $('loadInfo').textContent = texto; };

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance', stencil: false });
} catch (e) {
  falha('Sem 3D neste navegador', 'Este navegador não abriu o WebGL 2. Tente no Chrome ou Edge do computador.');
  throw e;
}
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.NoToneMapping;
renderer.setClearColor(0x000000, 1);

// qualidade inicial: alta no computador, baixa no celular
const celular = (navigator.maxTouchPoints || 0) > 0 && Math.min(screen.width, screen.height) < 900;
estado.qualidade = celular ? 0 : 2;
const qParam = new URLSearchParams(location.search).get('q');
if (qParam !== null && /^[012]$/.test(qParam)) estado.qualidade = +qParam;
$('qual').value = String(estado.qualidade);
usarProjecao(estado.qualidade >= 1);

const cena = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(66, 1, 0.08, 1500);
camera.rotation.order = 'YXZ';
camera.layers.enable(2);
camera.layers.enable(3);   // pessoas dos cenários

const pipeline = criarPipeline(renderer);
const ceu = criarCeu(renderer, cena);
const som = criarSom();
const cinema = criarCinema(cena, som);

// luminárias de fora (acesas à noite)
const LAMPS = [ // x, y, z no terreno, cor, força, alcance
  [39.5, 8.2, 2.3, 0xffc98a, 1.6, 12], [32.6, 4.4, 2.6, 0xffc98a, 1.0, 10], [8.5, 5.0, 2.3, 0xffc98a, 1.1, 11], [14.2, 5.0, 2.3, 0xffc98a, 1.1, 11],
  [20.6, 6.2, 0.7, 0xff7a2a, 1.6, 10], [39.0, 2.9, -0.4, 0x49d6ff, 1.2, 10], [48.6, 4.7, 0.3, 0xffc98a, 0.9, 9],
  [56.0, 8.0, 1.2, 0xffc98a, 0.8, 10], [2.2, 5.0, 2.2, 0xffc98a, 0.8, 10],
].map(l => { const p = new THREE.PointLight(l[3], 0, l[5], 2); p.position.copy(W3(l[0], l[1], l[2])); p.userData.k = l[4]; cena.add(p); return p; });
const fogueira = LAMPS[4];

let M = null, mundo = null, agua = null, grama = null, casas = null, bichos = null, extra = {}, LUGARES = [];
let projecoes = null, cenarios = null;
const eu = { x: 1.6, y: 4.7, pes: 0, vz: 0, rumo: 0, inclina: -0.03, vx: 0, vy: 0, chao: true, dist: 0, balanco: 0 };
const teclas = {}; const alavanca = { x: 0, y: 0 };
let comecou = false, modoToque = false;

// ---------------------------------------------------------------- tamanho e qualidade
function aplicarQualidade() {
  const q = estado.qualidade;
  pipeline.p.ao = q >= 1;
  pipeline.p.brilho = q >= 1;
  const sombra = q >= 2 ? 4096 : (q >= 1 ? 2048 : 1024);
  if (ceu.sol.shadow.mapSize.x !== sombra) { ceu.sol.shadow.mapSize.set(sombra, sombra); if (ceu.sol.shadow.map) { ceu.sol.shadow.map.dispose(); ceu.sol.shadow.map = null; } }
  U.uSombraNuvem.value = q >= 1 ? 1 : 0;
  if (agua) agua.qualidade.reflexo = q >= 2;
  if (bichos) bichos.todos.forEach(b => b.obj.traverse(o => { if (o.material && o.material.defines && 'PELO' in o.material.defines) o.visible = q >= 1; }));
  ajustar();
}
function ajustar() {
  const r = $('app').getBoundingClientRect();
  const q = estado.qualidade;
  const pr = Math.min(window.devicePixelRatio || 1, q >= 2 ? 1.5 : (q >= 1 ? 1.15 : 0.85));
  definirTamanho(Math.max(2, r.width), Math.max(2, r.height), pr);
}
function definirTamanho(w, h, pr) {
  renderer.setPixelRatio(pr);
  renderer.setSize(w, h, false);
  camera.aspect = w / h; camera.updateProjectionMatrix();
  pipeline.redimensionar(w * pr, h * pr);
  if (agua) agua.ajustarTela(h * pr);
  if (bichos) bichos.ajustarTela(h * pr);
}

// ---------------------------------------------------------------- carregamento
const barra = v => { $('carga').firstElementChild.style.width = Math.round(clamp(v, 0, 1) * 100) + '%'; };
const gerenciador = new THREE.LoadingManager();
let progTex = 0, progModelo = 0;
gerenciador.onProgress = (url, n, total) => { progTex = n / Math.max(total, 1); barra(progTex * 0.4 + progModelo * 0.4); };

// tempos do carregamento (para conferir em window.__chacara.tempos)
const tempos = { marcas: [], travadas: [] };
const marcar = nome => tempos.marcas.push([nome, Math.round(performance.now())]);
try {
  new PerformanceObserver(l => l.getEntries().forEach(e => {
    tempos.travadas.push([Math.round(e.startTime), Math.round(e.duration)]);
    if (tempos.travadas.length > 40) { tempos.travadas.sort((a, b) => b[1] - a[1]); tempos.travadas.length = 20; }
  })).observe({ type: 'longtask', buffered: true });
} catch (e) { /* navegador sem longtask */ }
// dá a vez para a página (desenhar, responder ao mouse); com a aba escondida o navegador
// não chama requestAnimationFrame, então usa uma mensagem (que não fica parada)
const proximoQuadro = () => new Promise(ok => {
  if (!document.hidden) { requestAnimationFrame(() => ok()); return; }
  const canal = new MessageChannel(); canal.port1.onmessage = () => ok(); canal.port2.postMessage(0);
});
const avisoCarga = t => { $('enter').textContent = t; };

// Compila os programas da placa de vídeo sem travar a página: o Chrome compila em paralelo
// (KHR_parallel_shader_compile) e a gente só espera ficarem prontos. Compila já para o alvo
// de verdade (a cena em HDR) e também a versão da sombra de cada objeto.
const LADO_DA_SOMBRA = { [THREE.FrontSide]: THREE.BackSide, [THREE.BackSide]: THREE.FrontSide, [THREE.DoubleSide]: THREE.DoubleSide };
function grupoDaSombra(raiz) {
  const g = new THREE.Group(), vistos = new Map();
  raiz.traverse(o => {
    if (!o.isMesh || !o.castShadow || Array.isArray(o.material)) return;
    let d = o.customDepthMaterial;
    if (!d) { // o material de profundidade padrão do three.js, com o que ele copia do material
      const m = o.material, lado = m.shadowSide !== null ? m.shadowSide : LADO_DA_SOMBRA[m.side];
      const chave = [!!m.map, m.alphaTest > 0, lado, !!o.isSkinnedMesh, !!o.isInstancedMesh].join();
      if (vistos.has(chave)) return;
      d = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: m.map || null, alphaTest: m.alphaTest, side: lado });
      vistos.set(chave, d);
    }
    // cópia "de mentira" do objeto (herda geometria, esqueleto, instâncias) com o material da sombra;
    // entra direto na lista para não tirar o original do lugar
    const proxy = Object.create(o);
    proxy.material = d;
    g.children.push(proxy);
  });
  return g;
}
async function prepararProgramas(raiz, alvo = cena) {
  const anterior = renderer.getRenderTarget();
  let promessas;
  renderer.setRenderTarget(pipeline.rtCena);
  try {
    promessas = [renderer.compileAsync(raiz, camera, alvo), renderer.compileAsync(grupoDaSombra(raiz), camera, alvo)];
  } finally { renderer.setRenderTarget(anterior); }
  await Promise.all(promessas);
}

async function carregar() {
  marcar('início');
  ajustar();
  ceu.atualizar(0, true);
  renderUmQuadro();
  marcar('céu');
  await prepararTexturas(renderer, gerenciador);
  // a geometria e as texturas baixam ao mesmo tempo
  const dados = await baixarModelo(v => { progModelo = v; barra(progTex * 0.4 + progModelo * 0.4); },
    meta => { M = criarMateriais(meta.mats); });
  marcar('modelo baixado');
  extra = dados.meta.extra || {};
  const terreno = construirTerreno(dados.meta, dados.buf, M, cena);
  chaoDeFora(cena, criarChaoDeFora());
  const colisao = criarColisao(extra);
  mundo = { terreno, colisao, extra };
  LUGARES = lugares(extra);
  // casinhas: caixas para a luz de ambiente baixar lá dentro
  (extra.casas || []).forEach((c, i) => {
    U.uCasas.value[i].set(c.x[0], c.x[1], -c.y[1], -c.y[0]);
    const frente = c.y[0] < 1 ? c.y[1] : c.y[0];
    U.uFrente.value[i] = -frente;
  });
  // a luz de dentro só baixa até o forro (o terraço em cima do container fica com a luz de fora)
  U.uTopoCasa.value = Math.max(...(extra.casas || []).map(c => (c.teto || 3.3) + 0.05), 0);
  casas = criarCasas(cena, extra, M, colisao);
  agua = criarAgua(cena, ceu, { reflexo: estado.qualidade >= 2, nivel: estado.qualidade }, extra.quintal);
  if (estado.qualidade >= 1) {
    const masc = mascaraDaGrama(dados.meta, dados.buf);
    grama = criarGrama(cena, masc, M.grass.map, estado.qualidade);
    grama.malha.layers.set(2);
  }
  if (estado.qualidade >= 1) { try { projecoes = criarProjecoes(renderer, cena, camera, extra, M); } catch (e) { console.warn('projeções', e); } }
  else if ($('projInfo')) $('projInfo').textContent = 'Na qualidade baixa as projeções e a luz de jardim ficam desligadas.';
  montarLugares();
  colocar(0);
  aplicarQualidade();
  ceu.atualizar(0, true);
  marcar('montado');

  // os bichos baixam enquanto o resto termina; entram na cena só com os programas prontos
  const antesDosBichos = new Set(cena.children);
  criarBichos(cena, mundo, estado.qualidade).then(async b => {
    const novos = cena.children.filter(o => !antesDosBichos.has(o));
    const espera = new THREE.Group();
    novos.forEach(o => espera.add(o));
    await prepararProgramas(espera);
    novos.forEach(o => cena.add(o));
    bichos = b; aplicarQualidade();
    marcar('bichos');
  }).catch(e => console.warn('bichos', e));

  // os programas compilam enquanto as últimas texturas chegam
  const programas = prepararProgramas(cena)
    .then(() => prepararProgramas(agua.cenaAgua, agua.cenaAgua))
    .then(() => marcar('programas prontos'));
  avisoCarga('Baixando as texturas…');
  const texturas = await texturasProntas();
  marcar('texturas baixadas');
  avisoCarga('Preparando os gráficos…'); barra(0.85);
  await programas;
  // sobe as texturas para a placa aos poucos, sem travar a página
  for (let i = 0; i < texturas.length; i++) {
    renderer.initTexture(texturas[i]);
    if (i % 6 === 5) { barra(0.9 + 0.1 * i / texturas.length); await proximoQuadro(); }
  }
  marcar('texturas na placa');
  renderUmQuadro();
  marcar('primeiro quadro');
  cenarios = criarCenarios({ cena, colisao: mundo.colisao, som, projecoes, cinema, prepararProgramas, mudarHora, irPara });
  $('enter').disabled = false; avisoCarga('Entrar no terreno'); barra(1);
  requestAnimationFrame(quadro);
}
function criarChaoDeFora() {
  const m = M.grass.clone();
  const t = tex('chao_externo_c.webp', true, true);
  t.repeat.set(0.25, 0.25);
  m.map = t; m.normalMap = null; m.roughnessMap = null; m.aoMap = null; m.roughness = 0.95;
  return m;
}

function mudarHora(h) { estado.hora = h; estado.mudouHora = true; estado.auto = false; $('tod').value = h; $('auto').setAttribute('aria-pressed', 'false'); }
function irPara(v) {
  eu.x = v[0]; eu.y = v[1]; eu.rumo = v[2]; eu.inclina = -0.06; eu.vx = eu.vy = eu.vz = 0;
  eu.pes = mundo ? mundo.colisao.chaoEm(eu.x, eu.y, v[3] || 0) : (v[3] || 0);
}

// ---------------------------------------------------------------- caminhada
function colocar(i) {
  const p = LUGARES[i]; if (!p) return;
  const z = p[4] || 0;
  eu.x = p[1]; eu.y = p[2]; eu.rumo = p[3]; eu.inclina = -0.03; eu.pes = mundo ? mundo.colisao.chaoEm(eu.x, eu.y, z) : z; eu.vz = 0; eu.vx = eu.vy = 0;
}
function andar(dt) {
  const C = mundo.colisao;
  let f = (teclas.KeyW || teclas.ArrowUp ? 1 : 0) - (teclas.KeyS || teclas.ArrowDown ? 1 : 0) - alavanca.y;
  let s = (teclas.KeyD || teclas.ArrowRight ? 1 : 0) - (teclas.KeyA || teclas.ArrowLeft ? 1 : 0) + alavanca.x;
  const l = Math.hypot(f, s); if (l > 1) { f /= l; s /= l; }
  const naAgua = eu.pes < -0.2 && eu.x > 34.2 && eu.x < 44 && eu.y > 1.1 && eu.y < 4.7;
  const vel = (teclas.ShiftLeft || teclas.ShiftRight ? 5.2 : 1.55) * (naAgua ? 0.45 : 1);
  const ca = Math.cos(eu.rumo), sa = Math.sin(eu.rumo);
  let tx = (ca * f + sa * s) * vel, ty = (sa * f - ca * s) * vel;
  const k = Math.min(1, dt * 9);
  // escada caracol: no meio dela, andar para a frente segue o giro da escada (sobe ou desce
  // conforme o lado para onde se olha) e a vista acompanha a curva
  const esp = C.espiralEm(eu.x, eu.y);
  if (esp && esp.r < esp.e.r1 && eu.pes > 0.25 && eu.pes < esp.e.topo - 0.1 && (tx || ty)) {
    const sg = Math.sign(esp.e.passo), ux = -Math.sin(esp.a) * sg, uy = Math.cos(esp.a) * sg;   // tangente de quem sobe
    const proj = (tx * ux + ty * uy) >= 0 ? 1 : -1, vv = Math.min(Math.hypot(tx, ty), 1.3);
    const rx = Math.cos(esp.a), ry = Math.sin(esp.a), mola = (0.55 - esp.r) * 3;
    tx = ux * proj * vv + rx * mola; ty = uy * proj * vv + ry * mola;
    if (f > 0.3) {
      let d = Math.atan2(uy * proj, ux * proj) - eu.rumo; d = Math.atan2(Math.sin(d), Math.cos(d));
      eu.rumo += d * Math.min(1, dt * 3.5);
    }
  }
  eu.vx += (tx - eu.vx) * k; eu.vy += (ty - eu.vy) * k;
  const nx = eu.x + eu.vx * dt, ny = eu.y + eu.vy * dt, ox = eu.x, oy = eu.y;
  const R = estado.dentroDeCasa ? 0.2 : 0.27;     // dentro das casas os vãos são justos
  if (!C.barra(nx, ny, eu.pes, R)) { eu.x = nx; eu.y = ny; }
  else if (!C.barra(nx, eu.y, eu.pes, R)) { eu.x = nx; eu.vy = 0; }
  else if (!C.barra(eu.x, ny, eu.pes, R)) { eu.y = ny; eu.vx = 0; }
  else { eu.vx = eu.vy = 0; }
  const g = C.chaoEm(eu.x, eu.y, eu.pes);
  if (eu.pes > g + 0.002) { eu.vz -= 9.8 * dt; eu.pes += eu.vz * dt; eu.chao = false; if (eu.pes <= g) { eu.pes = g; if (eu.vz < -3 || g < -0.2) som.passo(g < -0.2 ? 2 : 1); eu.vz = 0; eu.chao = true; } }
  else { eu.pes += (g - eu.pes) * Math.min(1, dt * 14); eu.chao = true; eu.vz = 0; }
  if (teclas.Space && eu.chao && !naAgua) { eu.vz = 3.3; eu.pes += 0.01; eu.chao = false; }
  const mov = Math.hypot(eu.x - ox, eu.y - oy); eu.dist += mov;
  if (eu.chao && mov > 0) {
    eu.balanco += mov;
    if (eu.dist > 0.68) { eu.dist = 0; som.passo(naAgua ? 2 : (estado.dentroDeCasa || (eu.pes > 0.3 && eu.x < 31.6) ? 3 : (eu.x > 31.6 ? 1 : 0))); }
  }
}
function posicionarCamera() {
  const b = Math.sin(eu.balanco * 4.3) * 0.018;
  camera.position.copy(W3(eu.x, eu.y, eu.pes + 1.62 + b));
  camera.rotation.set(eu.inclina, eu.rumo - Math.PI / 2, 0);
  camera.updateMatrixWorld();
}

// ---------------------------------------------------------------- foto e vídeo
const capt = { caminho: null, gravando: false, t0: 0, ult: 0, renderizando: false, blob: null, nome: '', durac: 0, rec: null, tocarT0: 0 };
const dlP = (window.claude && window.claude.use) ? window.claude.use('downloads').catch(() => null) : Promise.resolve(null);
function modal(titulo, no, nota, salvar) {
  $('mTitle').textContent = titulo; const b = $('mBody'); b.textContent = ''; if (no) b.appendChild(no);
  $('mNote').textContent = nota || ''; $('mSave').hidden = !salvar; $('bar').hidden = true; $('modal').hidden = false;
  if (document.pointerLockElement) document.exitPointerLock();
}
async function salvarArquivo() {
  if (!capt.blob) return;
  const dl = await dlP;
  if (dl) { try { await dl.save({ filename: capt.nome, data: capt.blob }); aviso('Arquivo salvo.'); } catch (e) { aviso(e && e.code === 'declined' ? 'Você cancelou o salvamento.' : 'Não foi possível salvar aqui.'); } return; }
  const a = document.createElement('a'); a.href = URL.createObjectURL(capt.blob); a.download = capt.nome; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
function foto() {
  if (capt.renderizando || !mundo) return;
  const wh = $('photoRes').value.split('x').map(Number);
  const max = Math.min(renderer.capabilities.maxRenderbufferSize || 4096, renderer.capabilities.maxTextureSize || 4096);
  const k = Math.min(1, max / wh[0], max / wh[1]), w = Math.round(wh[0] * k), h = Math.round(wh[1] * k);
  const ytLigado = cinema.c.modo === 'yt' || (projecoes && projecoes.lugares.some(p => p.escolha === 'youtube'));
  cinema.paraFoto(true); if (projecoes) projecoes.paraFoto(true);
  try {
    definirTamanho(w, h, 1);
    posicionarCamera();
    renderUmQuadro(); renderUmQuadro();
    canvas.toBlob(blob => {
      if (!blob) { aviso('A foto não pôde ser gerada neste tamanho. Tente um tamanho menor.'); return; }
      capt.blob = blob; capt.nome = 'chacara-foto-' + carimbo() + '.jpg';
      const img = new Image(); img.alt = 'Foto renderizada'; img.src = URL.createObjectURL(blob);
      modal('Foto renderizada', img, w + ' × ' + h + ' pixels' + (ytLigado ? '. O vídeo do YouTube não sai na foto.' : ''), true);
    }, 'image/jpeg', 0.94);
  } catch (e) { aviso('A foto falhou neste tamanho. Tente um menor.'); }
  cinema.paraFoto(false); if (projecoes) projecoes.paraFoto(false);
  ajustar();
}
function alternarGravacao() {
  if (capt.renderizando) return;
  if (!capt.gravando) {
    capt.caminho = []; capt.gravando = true; capt.t0 = performance.now(); $('rec').hidden = false;
    $('recBtn').textContent = 'Parar gravação (R)'; $('recBtn').setAttribute('aria-pressed', 'true'); aviso('Gravando o trajeto. Aperte R para parar.');
  } else {
    capt.gravando = false; $('rec').hidden = true; $('recBtn').textContent = 'Gravar caminhada (R)'; $('recBtn').setAttribute('aria-pressed', 'false');
    const d = capt.caminho.length ? capt.caminho[capt.caminho.length - 1][0] : 0;
    if (d < 1) { capt.caminho = null; $('renderBtn').disabled = true; aviso('Gravação curta demais.'); return; }
    $('renderBtn').disabled = false; $('recInfo').textContent = 'Trajeto de ' + d.toFixed(0) + ' s gravado. Clique em "Renderizar vídeo" para gerar o arquivo.';
    if (document.pointerLockElement) document.exitPointerLock(); mostrarPainel(true); aviso('Trajeto gravado. Agora é só renderizar o vídeo.');
  }
}
function amostra(t) {
  const p = capt.caminho; let i = capt.ult || 0; while (i < p.length - 2 && p[i + 1][0] < t) i++; capt.ult = i;
  const a = p[i], b = p[Math.min(i + 1, p.length - 1)], k = b[0] > a[0] ? clamp((t - a[0]) / (b[0] - a[0]), 0, 1) : 0;
  eu.x = lerp(a[1], b[1], k); eu.y = lerp(a[2], b[2], k); eu.pes = lerp(a[3], b[3], k); eu.rumo = lerp(a[4], b[4], k); eu.inclina = lerp(a[5], b[5], k); eu.balanco = lerp(a[6], b[6], k);
  const h = lerp(a[7], b[7], k); if (Math.abs(h - estado.hora) > 1e-4) { estado.hora = h; estado.mudouHora = true; }
}
function renderizarVideo() {
  if (!capt.caminho || capt.renderizando) return;
  if (!canvas.captureStream || !window.MediaRecorder) { aviso('Este navegador não grava vídeo da página. Use Chrome ou Edge no computador.', 5000); return; }
  const tipos = ['video/mp4;codecs=avc1.640028,mp4a.40.2', 'video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];
  const mime = tipos.find(t => MediaRecorder.isTypeSupported(t)); if (!mime) { aviso('Este navegador não tem um formato de vídeo para gravar.'); return; }
  const wh = $('vidRes').value.split('x').map(Number), guarda = { x: eu.x, y: eu.y, pes: eu.pes, rumo: eu.rumo, inclina: eu.inclina, hora: estado.hora };
  const dur = capt.caminho[capt.caminho.length - 1][0];
  definirTamanho(wh[0], wh[1], 1);
  const fluxo = canvas.captureStream(30), fa = som.fluxoGravacao; if (fa && fa.getAudioTracks().length) fluxo.addTrack(fa.getAudioTracks()[0]);
  let rec; try { rec = new MediaRecorder(fluxo, { mimeType: mime, videoBitsPerSecond: wh[0] >= 1920 ? 16e6 : 9e6 }); } catch (e) { aviso('A gravação não pôde começar neste navegador.'); ajustar(); return; }
  const partes = []; rec.ondataavailable = e => { if (e.data && e.data.size) partes.push(e.data); };
  rec.onstop = () => {
    capt.renderizando = false; Object.assign(eu, { x: guarda.x, y: guarda.y, pes: guarda.pes, rumo: guarda.rumo, inclina: guarda.inclina });
    estado.hora = guarda.hora; estado.mudouHora = true; $('tod').value = estado.hora;
    ajustar();
    const ext = mime.indexOf('mp4') > 0 ? 'mp4' : 'webm'; capt.blob = new Blob(partes, { type: mime.split(';')[0] }); capt.nome = 'chacara-video-' + carimbo() + '.' + ext;
    const v = document.createElement('video'); v.controls = true; v.playsInline = true; v.src = URL.createObjectURL(capt.blob);
    modal('Vídeo renderizado', v, wh[0] + ' × ' + wh[1] + ', ' + dur.toFixed(0) + ' s, ' + (capt.blob.size / 1048576).toFixed(1) + ' MB (.' + ext + ')', true);
  };
  capt.renderizando = true; capt.ult = 0; capt.tocarT0 = performance.now() + 250; capt.durac = dur; capt.rec = rec;
  modal('Renderizando o vídeo', null, 'O caminho está sendo refeito em tempo real. Deixe esta aba aberta e visível até terminar.', false); $('bar').hidden = false; $('mClose').textContent = 'Cancelar';
  mostrarPainel(false); rec.start(500);
}

// ---------------------------------------------------------------- interface
function mostrarPainel(v) { $('panel').hidden = !v; $('menuBtn').hidden = v || !comecou; $('hint').hidden = v || !comecou || modoToque; $('dot').hidden = v || !comecou; }
function entrar() {
  comecou = true; $('start').hidden = true; $('chips').hidden = false; mostrarPainel(false); som.iniciar(); canvas.focus();
  if (!modoToque && canvas.requestPointerLock) { try { const p = canvas.requestPointerLock(); if (p && p.catch) p.catch(() => {}); } catch (e) { /* sem travar o mouse, olha-se arrastando */ } }
}
function montarLugares() {
  $('tp').textContent = '';
  LUGARES.forEach((p, i) => { const b = document.createElement('button'); b.className = 'ghost'; b.textContent = p[0]; b.addEventListener('click', () => { colocar(i); aviso(p[0]); }); $('tp').appendChild(b); });
}
$('enter').addEventListener('click', entrar);
$('back').addEventListener('click', entrar);
$('menuBtn').addEventListener('click', () => { if (document.pointerLockElement) document.exitPointerLock(); mostrarPainel(true); });
canvas.addEventListener('click', () => { if (comecou && $('panel').hidden && !modoToque && !document.pointerLockElement && canvas.requestPointerLock) { try { const p = canvas.requestPointerLock(); if (p && p.catch) p.catch(() => {}); } catch (e) { /* sem importância */ } } });
document.addEventListener('pointerlockchange', () => { if (!document.pointerLockElement && comecou && !capt.renderizando && $('modal').hidden) mostrarPainel(true); });
let arrasto = null;
canvas.addEventListener('mousemove', e => {
  if (document.pointerLockElement === canvas) { eu.rumo -= e.movementX * 0.0023; eu.inclina = clamp(eu.inclina - e.movementY * 0.0023, -1.45, 1.45); }
  else if (arrasto) { eu.rumo -= (e.clientX - arrasto[0]) * 0.005; eu.inclina = clamp(eu.inclina - (e.clientY - arrasto[1]) * 0.005, -1.45, 1.45); arrasto = [e.clientX, e.clientY]; }
});
canvas.addEventListener('mousedown', e => { if (!document.pointerLockElement) arrasto = [e.clientX, e.clientY]; });
window.addEventListener('mouseup', () => { arrasto = null; });
function porta() { if (casas && !casas.alternar(eu.x, eu.y)) aviso('Chegue perto de uma porta das casinhas.'); }
window.addEventListener('keydown', e => {
  if (e.target && /INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
  teclas[e.code] = true; if (!comecou) return;
  if (e.code === 'Space' || e.code.indexOf('Arrow') === 0) e.preventDefault();
  if (e.repeat) return;
  if (e.code === 'KeyF') foto(); else if (e.code === 'KeyR') alternarGravacao();
  else if (e.code === 'KeyE') porta();
  else if (e.code === 'KeyN') { estado.hora = estado.dia > 0.5 ? 21 : 10; estado.mudouHora = true; $('tod').value = estado.hora; }
});
window.addEventListener('keyup', e => { teclas[e.code] = false; });
window.addEventListener('blur', () => { for (const k in teclas) teclas[k] = false; });
// toque: o círculo da esquerda anda, arrastar no resto da tela olha
const toques = {};
canvas.addEventListener('touchstart', e => {
  if (!modoToque) { modoToque = true; $('touch').hidden = false; $('hint').hidden = true; }
  for (const t of e.changedTouches) { const r = $('stick').getBoundingClientRect(), naAlavanca = t.clientX < r.right + 30 && t.clientY > r.top - 30; toques[t.identifier] = { alav: naAlavanca, x: t.clientX, y: t.clientY, cx: r.left + r.width / 2, cy: r.top + r.height / 2 }; }
  e.preventDefault();
}, { passive: false });
canvas.addEventListener('touchmove', e => {
  for (const t of e.changedTouches) {
    const o = toques[t.identifier]; if (!o) continue;
    if (o.alav) { alavanca.x = clamp((t.clientX - o.cx) / 50, -1, 1); alavanca.y = clamp((t.clientY - o.cy) / 50, -1, 1); $('stick').firstElementChild.style.transform = 'translate(' + alavanca.x * 30 + 'px,' + alavanca.y * 30 + 'px)'; }
    else { eu.rumo -= (t.clientX - o.x) * 0.006; eu.inclina = clamp(eu.inclina - (t.clientY - o.y) * 0.006, -1.45, 1.45); o.x = t.clientX; o.y = t.clientY; }
  }
  e.preventDefault();
}, { passive: false });
const fimToque = e => { for (const t of e.changedTouches) { const o = toques[t.identifier]; if (o && o.alav) { alavanca.x = alavanca.y = 0; $('stick').firstElementChild.style.transform = ''; } delete toques[t.identifier]; } };
canvas.addEventListener('touchend', fimToque); canvas.addEventListener('touchcancel', fimToque);
$('portaBtn').addEventListener('click', porta);

$('tod').addEventListener('input', e => { estado.hora = +e.target.value; estado.mudouHora = true; });
document.querySelectorAll('[data-tod]').forEach(b => b.addEventListener('click', () => { estado.hora = +b.dataset.tod; $('tod').value = estado.hora; estado.mudouHora = true; }));
$('auto').addEventListener('click', e => { estado.auto = !estado.auto; e.currentTarget.setAttribute('aria-pressed', String(estado.auto)); });
$('east').addEventListener('change', e => { estado.leste = +e.target.value; estado.mudouHora = true; });
$('nuvens').addEventListener('input', e => { const v = +e.target.value; ceu.uniforms.uCobertura.value = v; U.uCobertura.value = v; estado.mudouHora = true; ceu.atualizar(0, true); });
$('shot').addEventListener('click', foto);
$('recBtn').addEventListener('click', () => { if (!capt.gravando) entrar(); alternarGravacao(); });
$('renderBtn').addEventListener('click', renderizarVideo);
$('pick').addEventListener('click', () => $('file').click());
$('file').addEventListener('change', e => { const f = e.target.files && e.target.files[0]; if (f) { som.iniciar(); cinema.arquivo(f); } e.target.value = ''; });
$('ytGo').addEventListener('click', () => { som.iniciar(); cinema.youtube($('ytUrl').value); });
$('cineStop').addEventListener('click', () => { cinema.parar(); $('cineInfo').textContent = 'Tela desligada.'; });
$('vol').addEventListener('input', e => som.volume(+e.target.value));
$('qual').addEventListener('change', e => {
  const antes = estado.qualidade;
  estado.qualidade = +e.target.value;
  aplicarQualidade();
  if ((antes === 0) !== (estado.qualidade === 0) || (antes >= 2) !== (estado.qualidade >= 2)) aviso('A grama e o pelo dos cachorros mudam por completo ao recarregar a página.', 4500);
  if (grama) grama.malha.visible = estado.qualidade >= 1;
});
$('full').addEventListener('click', () => { const el = $('app'); try { const p = document.fullscreenElement ? document.exitFullscreen() : el.requestFullscreen(); if (p && p.catch) p.catch(() => aviso('Tela cheia não está disponível aqui.')); } catch (e) { aviso('Tela cheia não está disponível aqui.'); } });
$('mSave').addEventListener('click', salvarArquivo);
$('mClose').addEventListener('click', () => {
  if (capt.renderizando) { const r = capt.rec; capt.durac = 0; if (r && r.state !== 'inactive') r.stop(); }
  $('modal').hidden = true; $('mClose').textContent = 'Fechar'; $('mBody').textContent = ''; if (comecou) mostrarPainel(true);
});
window.addEventListener('resize', () => { if (!capt.renderizando) ajustar(); });

// ---------------------------------------------------------------- laço principal
const relogio = { anterior: 0, acc: 0, quadros: 0, tFps: 0, lentos: 0 };
const v4 = new THREE.Vector3();
let exposicao = 1;
function atualizarMundo(dt) {
  if (estado.auto) { estado.hora = (estado.hora + dt * 0.4) % 24; estado.mudouHora = true; $('tod').value = estado.hora; }
  const mudou = ceu.atualizar(dt);
  const info = ceu.info;
  U.uTempo.value = estado.tempo;
  U.uSolMundo.value.copy(info.dirLuz || info.solV);
  U.uSolVista.value.copy(info.dirLuz || info.solV).transformDirection(camera.matrixWorldInverse);
  U.uCorSol.value.copy(info.corSol); U.uForcaSol.value = info.forcaSol;
  U.uVento.value.set(0.75 + 0.35 * Math.sin(estado.tempo * 0.07), 0.4 + 0.25 * Math.sin(estado.tempo * 0.05 + 1));
  if (mudou) {
    const hh = Math.floor(estado.hora) % 24, mm = Math.floor((estado.hora % 1) * 60);
    $('clock').textContent = (hh < 10 ? '0' : '') + hh + ':' + (mm < 10 ? '0' : '') + mm;
  }
  const n = estado.noite;
  LAMPS.forEach(p => { p.intensity = p.userData.k * 1.3 * n; });
  fogueira.intensity = fogueira.userData.k * 1.4 * n * (0.75 + 0.25 * Math.sin(estado.tempo * 11) * Math.sin(estado.tempo * 7.3));
  if (M) {
    M.bulb.emissiveIntensity = lerp(0.25, 7.5, n);
    M.abajur.emissiveIntensity = 2.2 * n;
    M.ember.emissiveIntensity = (1.2 + 2.5 * n) * (0.8 + 0.2 * Math.sin(estado.tempo * 9));
  }
  if (casas) casas.atualizar(dt, eu, n, bichos ? bichos.cachorros : null, camera.position);
  if (bichos) bichos.atualizar(dt, estado.tempo, eu, camera.position);
  if (bichos && comecou) {
    // vozes dos bichos
    for (const g of bichos.galinhas) if (Math.random() < dt * 0.05 && Math.hypot(g.x - eu.x, g.y - eu.y) < 30) som.cacarejo(g.x, g.y, false);
    const galo = bichos.galo;
    if (galo.cantou) { galo.cantou = false; som.canto(galo.x, galo.y); }
    else if (Math.random() < dt * 0.02) som.cacarejo(galo.x, galo.y, true);
    for (const c of bichos.cachorros) if (c.latir) { c.latir = false; som.latido(c.x, c.y); }
  }
  if (agua) agua.atualizar(estado.tempo, info, { lago: bichos ? bichos.fontesLago : [] });
  const cc = cenarios ? cenarios.atualizar(dt, estado.tempo, camera.position) : null;
  if (projecoes) projecoes.atualizar(estado.tempo, n, cc ? { batida: cc.batida, energia: cc.energia } : null);
  if (grama) {
    const pis = [[camera.position.x, camera.position.z, 0.45, eu.chao ? 0.9 : 0]];
    if (bichos) pis.push(...bichos.pisadas());
    if (cenarios) pis.push(...cenarios.pisadas(camera.position, 24));
    grama.atualizar(camera.position, pis);
  }
  cinema.atualizar(estado.tempo, n);
  // dentro de casa de dia: o olho se acostuma com a pouca luz
  let dentro = null;
  for (const c of (extra.casas || [])) if (eu.x > c.x[0] && eu.x < c.x[1] && eu.y > c.y[0] && eu.y < c.y[1] && eu.pes < (c.deck || 9) - 0.4) dentro = c.nome;
  estado.dentroDeCasa = dentro;
  const alvo = info.exposicao * (dentro ? lerp(1.0, 2.3, estado.dia) : 1);
  exposicao += (alvo - exposicao) * Math.min(1, dt * 1.5);
}
function renderUmQuadro() {
  ceu.seguirCamera(camera);
  pipeline.renderizar(cena, camera, {
    antes: agua ? (r, c) => agua.prepararReflexo(r, cena, c, pipeline.largura, pipeline.altura) : null,
    agua: agua ? agua.desenhar : null,
  }, null, { exposicao });
}
function quadro(agora) {
  requestAnimationFrame(quadro);
  if (window.__chacara && window.__chacara.pausa) return;
  const dt = Math.min(0.05, (agora - relogio.anterior) / 1000 || 0.016); relogio.anterior = agora;
  estado.tempo += dt;
  if (capt.renderizando) {
    const t = (agora - capt.tocarT0) / 1000;
    if (t >= 0) amostra(Math.min(t, capt.durac));
    $('bar').firstElementChild.style.width = clamp(t / Math.max(capt.durac, 0.01), 0, 1) * 100 + '%';
    if (t >= capt.durac + 0.2 && capt.rec.state !== 'inactive') capt.rec.stop();
  } else if (comecou && $('modal').hidden && mundo) {
    andar(dt);
    if (capt.gravando) {
      const t = (agora - capt.t0) / 1000; capt.caminho.push([t, eu.x, eu.y, eu.pes, eu.rumo, eu.inclina, eu.balanco, estado.hora]);
      const s = Math.floor(t); $('rec').textContent = '● Gravando ' + Math.floor(s / 60) + ':' + (s % 60 < 10 ? '0' : '') + s % 60; if (t > 300) alternarGravacao();
    }
  }
  posicionarCamera();
  atualizarMundo(dt);
  if (!capt.renderizando) {
    const r = canvas.getBoundingClientRect();
    if (cinema.c.modo === 'yt') cinema.posicionarYT(camera, r.width, r.height);
    if (projecoes) projecoes.posicionarYT(camera, r.width, r.height);
  }
  som.quadro(camera, v4);
  renderUmQuadro();
  relogio.acc += dt;
  if (relogio.acc > 0.4) {
    relogio.acc = 0;
    if (mundo) $('where').textContent = ondeEstou(eu.x, eu.y, extra, eu.pes);
    cinema.volumeYT(camera.position, +$('vol').value);
    const p = casas && casas.maisPerto(eu.x, eu.y);
    $('portaBtn').hidden = !(modoToque && p && p.dist < 2.2);
  }
  // se ficar lento demais nos primeiros segundos, baixa a qualidade sozinho
  relogio.quadros++; relogio.tFps += dt;
  if (comecou && relogio.tFps > 4) {
    const fps = relogio.quadros / relogio.tFps; relogio.quadros = 0; relogio.tFps = 0;
    if (fps < 22 && estado.qualidade > 0 && relogio.lentos < 2 && !capt.renderizando) {
      relogio.lentos++; estado.qualidade--; $('qual').value = String(estado.qualidade); aplicarQualidade();
      aviso('Baixei a qualidade para ficar mais leve (' + ['baixa', 'média', 'alta'][estado.qualidade] + '). Dá para mudar no menu.', 4500);
    }
  }
}

// gancho para testes automáticos
window.__chacara = {
  THREE, renderer, cena, camera, ceu, eu, estado, pipeline, pausa: false, U, tempos,
  get bichos() { return bichos; }, get casas() { return casas; }, get mundo() { return mundo; }, get agua() { return agua; },
  get projecoes() { return projecoes; }, get cenarios() { return cenarios; }, irPara, mudarHora,
  colocar, foto: () => foto(), cinema, teclas,
  andar(dt, t) { for (const k in teclas) teclas[k] = false; Object.assign(teclas, t || {}); andar(dt); for (const k in teclas) teclas[k] = false; },
  quadro(passos) { for (let i = 0; i < (passos || 1); i++) { estado.tempo += 0.033; posicionarCamera(); atualizarMundo(0.033); } renderUmQuadro(); return true; },
  snap() { posicionarCamera(); atualizarMundo(0.001); renderUmQuadro(); return canvas.toDataURL('image/jpeg', 0.9); },
};

carregar().catch(e => { console.error(e); falha('Não foi possível carregar', 'Algum arquivo do terreno não chegou (' + (e && e.message || e) + '). Recarregue a página.'); });
