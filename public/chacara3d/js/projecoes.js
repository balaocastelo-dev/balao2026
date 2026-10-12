// Plano de iluminação noturna: projetores virtuais que lançam animações, cores de luz de jardim,
// vídeos do computador ou o YouTube sobre as copas das árvores, o muro da piscina, os portões
// e as paredes laterais lisas dos sobrados (projeção mapeada / video mapping).
//
// Como funciona: cada projetor ocupa um ladrilho de 512² de um atlas (2048 × 1536). A cada quadro
// o ladrilho é desenhado (animação procedural de projecoes_anim.js, vídeo do computador ou cor) e os
// materiais remendados (materiais.js, bloco PROJECAO) somam essa luz sobre a cor de cada superfície
// que estiver dentro do tronco de visão do projetor. Em superfície plana (parede, muro, portão) o
// tronco é fora do eixo, encaixado no retângulo da parede, então a imagem não sai torta. O YouTube
// não pode virar textura (o navegador não deixa ler o vídeo de outro site): nas superfícies planas
// ele aparece como no cineminha, por um "furo" na imagem com a janela do vídeo por trás.
import * as THREE from 'three';
import { $, W3, aviso, clamp } from './util.js';
import { U, NPROJ } from './materiais.js';
import { ANIMACOES, criarAnimador } from './projecoes_anim.js';

const ATLAS_W = 2048, ATLAS_H = 1536, LADO = 512;
const GUARDA = 'chacara3d.projecoes.v1';

// lugares: alvo de árvore (tronco de visão centrado) ou plano (retângulo vertical com normal)
function definirLugares(extra) {
  const L = [
    { id: 'mangueira', nome: 'Mangueira', tipo: 'arvore', de: [25.2, 6.8, 0.35], para: [30.3, 2.4, 5.8], raio: 4.6, ganho: 4.2 },
    { id: 'jabuticabeira', nome: 'Jabuticabeira', tipo: 'arvore', de: [14.0, 5.9, 0.25], para: [14.0, 2.2, 1.75], raio: 2.1, ganho: 4.0 },
    { id: 'coqueiros', nome: 'Coqueiros', tipo: 'arvore', de: [23.8, 4.3, 0.25], para: [23.6, 8.2, 6.0], raio: 4.3, ganho: 4.4 },
    { id: 'amendoeira', nome: 'Amendoeira', tipo: 'arvore', de: [51.4, 6.6, -0.7], para: [47.6, 1.7, 4.6], raio: 4.6, ganho: 4.2 },
    { id: 'muro_piscina', nome: 'Muro da piscina', tipo: 'plano', ret: { x0: 31.4, x1: 44.8, y0: 0.0, y1: 0.0, z0: -0.1, z1: 2.32 }, normal: [0, 1], de: [38.1, 6.25, 2.5], fundo: 1.1, ganho: 1.7 },
    { id: 'portao_gramado', nome: 'Portão do gramado', tipo: 'plano', ret: { x0: 0.0, x1: 0.0, y0: 2.55, y1: 6.85, z0: 0.0, z1: 3.5 }, normal: [1, 0], de: [6.4, 4.7, 1.1], fundo: 0.9, ganho: 1.8 },
    { id: 'portao_baixo', nome: 'Portão de baixo', tipo: 'plano', ret: { x0: 60.0, x1: 60.0, y0: 2.75, y1: 7.45, z0: -1.0, z1: 2.5 }, normal: [-1, 0], de: [54.4, 5.1, -0.1], fundo: 0.9, ganho: 1.8 },
  ];
  const cores = { 'Parede da casa azul': 'parede_azul', 'Parede da casa amarela': 'parede_amarela', 'Parede da casa verde': 'parede_verde' };
  for (const p of (extra.paredes_projecao || [])) {
    const id = cores[p.nome] || ('parede_' + L.length);
    const cx = (p.x0 + p.x1) / 2, cy = (p.y0 + p.y1) / 2;
    const dist = id === 'parede_verde' ? 2.7 : 4.4;
    L.push({ id, nome: p.nome, tipo: 'plano', ret: { x0: p.x0, x1: p.x1, y0: p.y0, y1: p.y1, z0: p.z0, z1: p.z1 }, normal: p.normal,
      de: [cx + p.normal[0] * dist, cy + p.normal[1] * dist + (id === 'parede_verde' ? -1.2 : 0), 0.25], fundo: 0.7, ganho: 1.5 });
  }
  return L.slice(0, NPROJ);
}

// o que dá para pôr em cada lugar
const LUZES = ANIMACOES.filter(a => a.tipo === 'luz');
const ANIMS = ANIMACOES.filter(a => a.tipo === 'animacao');

export const PRESETS = {
  desligado: {},
  jardim: { mangueira: 'luz_branca_quente', jabuticabeira: 'luz_ambar', coqueiros: 'luz_ambar', amendoeira: 'luz_branca_quente', muro_piscina: 'luz_verde', portao_gramado: 'luz_ambar', portao_baixo: 'luz_ambar' },
  show: { mangueira: 'galaxia', jabuticabeira: 'vagalumes', coqueiros: 'aurora', amendoeira: 'borboletas', muro_piscina: 'carpas', portao_gramado: 'boas_vindas', portao_baixo: 'neon', parede_azul: 'cachoeira', parede_amarela: 'fogo', parede_verde: 'folhas' },
  aniversario: { mangueira: 'luz_magenta', jabuticabeira: 'coracoes', coqueiros: 'luz_cores', amendoeira: 'fogos', muro_piscina: 'ondas', portao_gramado: 'aniversario', portao_baixo: 'aniversario', parede_azul: 'aniversario', parede_amarela: 'fogos', parede_verde: 'aniversario' },
  rave: { mangueira: 'estrobo_cores', jabuticabeira: 'luz_batida', coqueiros: 'luz_batida', amendoeira: 'luz_cores', muro_piscina: 'equalizador', portao_gramado: 'neon', portao_baixo: 'neon', parede_azul: 'equalizador', parede_amarela: 'mandala', parede_verde: 'equalizador' },
  piscina: { mangueira: 'luz_ambar', jabuticabeira: 'luz_ambar', coqueiros: 'luz_cores', amendoeira: 'luz_verde', muro_piscina: 'ondas', portao_gramado: 'luz_ambar', portao_baixo: 'luz_ambar' },
  cinema: { mangueira: 'luz_azul', coqueiros: 'luz_roxa', amendoeira: 'galaxia', muro_piscina: 'luz_azul' },
};

export function criarProjecoes(renderer, cena, camera, extra, M) {
  const lugares = definirLugares(extra);
  const atlas = new THREE.WebGLRenderTarget(ATLAS_W, ATLAS_H, { depthBuffer: false, generateMipmaps: false, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });
  U.uProjAtlas.value = atlas.texture;
  const anim = criarAnimador(renderer);
  let pronto = false;
  const preparo = anim.preparar().then(() => { pronto = true; }).catch(e => console.warn('projeções', e));

  // ---- quadro para desenhar vídeo no ladrilho (com faixas pretas para não deformar)
  const camQuad = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const matVideo = new THREE.ShaderMaterial({
    uniforms: { map: { value: null }, uEsc: { value: new THREE.Vector4(1, 1, 0, 0) }, uGanho: { value: 1 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: `uniform sampler2D map; uniform vec4 uEsc; uniform float uGanho; varying vec2 vUv;
      void main(){ vec2 q = (vUv - 0.5) / uEsc.xy + 0.5;
        if (q.x < 0.0 || q.x > 1.0 || q.y < 0.0 || q.y > 1.0) { gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); return; }
        vec3 c = texture2D(map, q).rgb; gl_FragColor = vec4(c * uGanho, 1.0); }`,
    depthTest: false, depthWrite: false,
  });
  const cenaQuad = new THREE.Scene();
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), matVideo); quad.frustumCulled = false; cenaQuad.add(quad);

  // ---- furo para o YouTube (como no cineminha)
  const matFuro = new THREE.ShaderMaterial({ vertexShader: 'void main(){ gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }', fragmentShader: 'void main(){ gl_FragColor = vec4(0.0); }', blending: THREE.NoBlending, side: THREE.DoubleSide });

  // ---- projetores: geometria de cada um e o aparelho na cena
  const corpoMat = new THREE.MeshStandardMaterial({ color: 0x15171a, roughness: 0.45, metalness: 0.5 });
  const lenteMat = new THREE.MeshStandardMaterial({ color: 0x050505, emissive: new THREE.Color(1, 0.95, 0.85), emissiveIntensity: 0, roughness: 0.1 });
  const v1 = new THREE.Vector3(), v2 = new THREE.Vector3(), v3 = new THREE.Vector3();
  const P = lugares.map((l, i) => {
    const eye = W3(l.de[0], l.de[1], l.de[2]);
    const view = new THREE.Matrix4(), proj = new THREE.Matrix4(), mundo = new THREE.Matrix4();
    let aspecto = 1, cantos = null, cantosTela = null, cantosYT = null, alvo;
    if (l.tipo === 'plano') {
      const r = l.ret, n = l.normal;
      const cx = (r.x0 + r.x1) / 2, cy = (r.y0 + r.y1) / 2;
      alvo = W3(l.de[0] - n[0] * 3, l.de[1] - n[1] * 3, l.de[2]);   // olha reto para dentro da parede (plano da imagem paralelo a ela)
      mundo.lookAt(eye, alvo, new THREE.Vector3(0, 1, 0)); mundo.setPosition(eye); view.copy(mundo).invert();
      // cantos da parede (com 1 cm para fora)
      const ex = n[0] * 0.012, ey = n[1] * 0.012;
      const horiz = Math.abs(r.x1 - r.x0) > Math.abs(r.y1 - r.y0);
      const a0 = horiz ? [r.x0, r.y0] : [r.x0, r.y0], a1 = horiz ? [r.x1, r.y0] : [r.x0, r.y1];
      cantos = [W3(a0[0] + ex, a0[1] + ey, r.z0), W3(a1[0] + ex, a1[1] + ey, r.z0), W3(a1[0] + ex, a1[1] + ey, r.z1), W3(a0[0] + ex, a0[1] + ey, r.z1)];
      let xmin = 1e9, xmax = -1e9, ymin = 1e9, ymax = -1e9, d = 0;
      const vis = [];
      for (const c of cantos) { v1.copy(c).applyMatrix4(view); vis.push([v1.x, v1.y, c]); xmin = Math.min(xmin, v1.x); xmax = Math.max(xmax, v1.x); ymin = Math.min(ymin, v1.y); ymax = Math.max(ymax, v1.y); d = Math.max(d, -v1.z); }
      // cantos na ordem de quem olha de frente: sup. esq., sup. dir., inf. dir., inf. esq.
      const xm = (xmin + xmax) / 2, ym = (ymin + ymax) / 2;
      // o YouTube não pode esticar: usa um retângulo 16:9 dentro da parede, perto da altura dos olhos
      // e centrado no projetor
      const largura = Math.hypot(a1[0] - a0[0], a1[1] - a0[1]), altura = r.z1 - r.z0;
      let lw = largura, lh = largura * 9 / 16;
      if (lh > altura) { lh = altura; lw = altura * 16 / 9; }
      const ux = (a1[0] - a0[0]) / largura, uy = (a1[1] - a0[1]) / largura;
      const tc = clamp((l.de[0] - a0[0]) * ux + (l.de[1] - a0[1]) * uy, lw / 2, largura - lw / 2);
      const zc = clamp(r.z0 + 2.4, r.z0 + lh / 2, r.z1 - lh / 2);
      const ponto = (t, z) => W3(a0[0] + ux * t + n[0] * 0.02, a0[1] + uy * t + n[1] * 0.02, z);
      cantosYT = [ponto(tc - lw / 2, zc - lh / 2), ponto(tc + lw / 2, zc - lh / 2), ponto(tc + lw / 2, zc + lh / 2), ponto(tc - lw / 2, zc + lh / 2)];
      const visYT = cantosYT.map(c => { v1.copy(c).applyMatrix4(view); return [v1.x, v1.y, c]; });
      const xmY = visYT.reduce((s, q) => s + q[0], 0) / 4, ymY = visYT.reduce((s, q) => s + q[1], 0) / 4;
      const pega = (sx, sy) => visYT.find(q => Math.sign(q[0] - xmY) === sx && Math.sign(q[1] - ymY) === sy)[2];
      cantosTela = [pega(-1, 1), pega(1, 1), pega(1, -1), pega(-1, -1)];
      const near = Math.max(0.1, d - l.fundo), far = d + 0.25;
      proj.makePerspective(xmin * near / d, xmax * near / d, ymax * near / d, ymin * near / d, near, far);
      aspecto = (xmax - xmin) / Math.max(0.01, ymax - ymin);
    } else {
      alvo = W3(l.para[0], l.para[1], l.para[2]);
      mundo.lookAt(eye, alvo, new THREE.Vector3(0, 1, 0)); mundo.setPosition(eye); view.copy(mundo).invert();
      const d = eye.distanceTo(alvo), near = Math.max(0.2, d - l.raio * 1.15), far = d + l.raio * 1.15;
      const t = near * l.raio / d;
      proj.makePerspective(-t, t, t, -t, near, far);
    }
    const mat = new THREE.Matrix4().multiplyMatrices(proj, view);
    // o aparelho: caixinha preta com lente, num espeto curto, virada para o alvo
    const g = new THREE.Group();
    const corpo = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.14, 0.3), corpoMat); g.add(corpo);
    const lente = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.03, 16), lenteMat); lente.rotation.x = Math.PI / 2; lente.position.z = -0.16; g.add(lente);
    corpo.castShadow = true;
    g.position.copy(eye); g.lookAt(alvo); g.rotateY(Math.PI);
    const chao = l.de[0] > 46 ? -1 : 0, hPe = Math.max(0.05, l.de[2] - chao - 0.06);
    const pe = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, hPe, 6), corpoMat);
    pe.position.copy(W3(l.de[0], l.de[1], chao + hPe / 2));
    g.visible = false; pe.visible = false; cena.add(g); cena.add(pe);
    // repetição do ladrilho em superfícies compridas
    const rep = aspecto > 1.6 ? [Math.max(1, Math.round(aspecto / 1.15)), 1] : [1, 1];
    // furo do YouTube (só nos planos)
    let furo = null;
    if (cantosYT) {
      const geo = new THREE.BufferGeometry().setFromPoints(cantosYT); geo.setIndex([0, 1, 2, 0, 2, 3]);
      furo = new THREE.Mesh(geo, matFuro); furo.visible = false; furo.renderOrder = 2; cena.add(furo);
    }
    const tile = new THREE.Vector4((i % 4) * LADO / ATLAS_W, Math.floor(i / 4) * LADO / ATLAS_H, LADO / ATLAS_W, LADO / ATLAS_H);
    return { l, i, mat, eye, rep, aspecto, cantos, cantosTela, furo, aparelho: g, pe, tile, escolha: null, video: null, vtex: null, url: null, yt: null, semente: i * 7.31 + 1 };
  });
  // uniforms fixos de cada projetor
  P.forEach(p => {
    U.uProjMat.value[p.i].copy(p.mat);
    U.uProjTile.value[p.i].copy(p.tile);
    U.uProjPos.value[p.i].set(p.eye.x, p.eye.y, p.eye.z, 0);
    U.uProjRep.value[p.i].set(p.rep[0], p.rep[1], p.l.tipo === 'arvore' ? 1 : 0, 0);
  });

  // ---- escolhas
  const estadoP = { soNoite: true, intensidade: 1 };
  function pararMidia(p) {
    if (p.video) { p.video.pause(); p.video.removeAttribute('src'); p.video.load(); }
    if (p.url) { URL.revokeObjectURL(p.url); p.url = null; }
    if (p.yt) { p.yt.remove(); p.yt = null; }
    if (p.furo) p.furo.visible = false;
  }
  function escolher(id, valor, opcoes) {
    const p = P.find(q => q.l.id === id); if (!p) return;
    pararMidia(p);
    p.escolha = valor || null;
    if (valor === 'youtube') {
      if (!p.cantos) { aviso('O YouTube só dá nas paredes, no muro e nos portões.'); p.escolha = null; return; }
      const idv = idYT(opcoes && opcoes.url);
      if (!idv) { aviso('Não reconheci esse link do YouTube.'); p.escolha = null; return; }
      const f = document.createElement('iframe');
      f.className = 'ytProj'; f.title = 'Projeção em ' + p.l.nome; f.width = 1280; f.height = 720;
      f.allow = 'autoplay; encrypted-media'; f.referrerPolicy = 'strict-origin-when-cross-origin';
      const org = /^https?:/.test(location.protocol) ? '&origin=' + encodeURIComponent(location.origin) : '';
      f.src = 'https://www.youtube.com/embed/' + idv + '?autoplay=1&mute=1&playsinline=1&rel=0&controls=0&loop=1&playlist=' + idv + org;
      $('app').insertBefore(f, $('c'));
      p.yt = f; p.ytId = idv;
    }
    if (valor === 'video' && opcoes && opcoes.arquivo) {
      if (!p.video) {
        const v = document.createElement('video'); v.loop = true; v.muted = true; v.playsInline = true; v.crossOrigin = 'anonymous';
        p.video = v; p.vtex = new THREE.VideoTexture(v); p.vtex.colorSpace = THREE.SRGBColorSpace;
      }
      p.url = URL.createObjectURL(opcoes.arquivo); p.video.src = p.url;
      p.video.play().catch(() => { aviso('Este vídeo não abriu. Tente um arquivo MP4.'); p.escolha = null; });
    }
    salvar();
  }
  function aplicar(preset) {
    const tab = typeof preset === 'string' ? (PRESETS[preset] || {}) : preset;
    for (const p of P) escolher(p.l.id, tab[p.l.id] || null);
    atualizarMenu();
  }
  function salvar() {
    try {
      const o = { soNoite: estadoP.soNoite, lugares: {} };
      for (const p of P) if (p.escolha && p.escolha !== 'video') o.lugares[p.l.id] = p.escolha === 'youtube' ? { yt: p.ytId } : p.escolha;
      localStorage.setItem(GUARDA, JSON.stringify(o));
    } catch (e) { /* sem armazenamento: tudo bem */ }
  }
  function carregar() {
    let o = null;
    try { o = JSON.parse(localStorage.getItem(GUARDA) || 'null'); } catch (e) { o = null; }
    if (!o) { aplicar('jardim'); return; }
    estadoP.soNoite = o.soNoite !== false;
    for (const p of P) {
      const v = o.lugares && o.lugares[p.l.id];
      if (v && typeof v === 'object' && v.yt) escolher(p.l.id, 'youtube', { url: v.yt });
      else if (typeof v === 'string' && ANIMACOES.some(a => a.id === v)) escolher(p.l.id, v);
    }
  }

  // ---- menu
  function montarMenu() {
    const box = $('projLista'); if (!box) return;
    box.textContent = '';
    for (const p of P) {
      const linha = document.createElement('div'); linha.className = 'projItem';
      const rot = document.createElement('label'); rot.textContent = p.l.nome; rot.htmlFor = 'proj_' + p.l.id;
      const sel = document.createElement('select'); sel.id = 'proj_' + p.l.id;
      const op = (v, t, pai) => { const o = document.createElement('option'); o.value = v; o.textContent = t; (pai || sel).appendChild(o); };
      op('', 'Desligado');
      const ga = document.createElement('optgroup'); ga.label = 'Animações'; ANIMS.forEach(a => op(a.id, a.nome, ga)); sel.appendChild(ga);
      const gl = document.createElement('optgroup'); gl.label = 'Luz de jardim'; LUZES.forEach(a => op(a.id, a.nome, gl)); sel.appendChild(gl);
      const gm = document.createElement('optgroup'); gm.label = 'Mídia'; op('video', 'Vídeo do computador…', gm); if (p.cantos) op('youtube', 'YouTube…', gm); sel.appendChild(gm);
      const extraRow = document.createElement('div'); extraRow.className = 'row'; extraRow.hidden = true;
      const url = document.createElement('input'); url.type = 'text'; url.placeholder = 'Link do YouTube'; url.setAttribute('aria-label', 'Link do YouTube para ' + p.l.nome);
      const ir = document.createElement('button'); ir.className = 'ghost'; ir.textContent = 'Projetar';
      extraRow.append(url, ir);
      const arq = document.createElement('input'); arq.type = 'file'; arq.accept = 'video/*'; arq.hidden = true;
      sel.addEventListener('change', () => {
        const v = sel.value;
        extraRow.hidden = v !== 'youtube';
        if (v === 'video') { arq.click(); return; }
        if (v === 'youtube') { url.focus(); return; }
        escolher(p.l.id, v || null);
      });
      arq.addEventListener('change', () => { const f = arq.files && arq.files[0]; if (f) { escolher(p.l.id, 'video', { arquivo: f }); aviso('Vídeo projetado em ' + p.l.nome.toLowerCase() + '.'); } else sel.value = p.escolha || ''; arq.value = ''; });
      ir.addEventListener('click', () => { escolher(p.l.id, 'youtube', { url: url.value }); if (p.escolha === 'youtube') aviso('YouTube em ' + p.l.nome.toLowerCase() + ' (sem som; não sai na foto).'); });
      linha.append(rot, sel, extraRow, arq);
      box.appendChild(linha);
      p.ui = { sel, extraRow };
    }
    atualizarMenu();
  }
  function atualizarMenu() {
    for (const p of P) if (p.ui) { p.ui.sel.value = p.escolha || ''; p.ui.extraRow.hidden = p.escolha !== 'youtube'; }
    const sn = $('projNoite'); if (sn) sn.setAttribute('aria-pressed', String(estadoP.soNoite));
  }
  if ($('projNoite')) $('projNoite').addEventListener('click', () => { estadoP.soNoite = !estadoP.soNoite; atualizarMenu(); salvar(); });
  document.querySelectorAll('[data-proj]').forEach(b => b.addEventListener('click', () => { aplicar(b.dataset.proj); salvar(); aviso(b.textContent + '.'); }));

  // ---- ladrilhos extras (telas do cineminha e do painel de LED) e projetor de palco dos cenários
  const telas = new Map();          // índice do ladrilho -> { id da animação, extras }
  // material de tela que mostra um ladrilho do atlas (a textura de um alvo de desenho não pode ser
  // clonada com outro recorte, então o recorte vai no próprio shader)
  function materialTela(indice, brilho, inverteV) {
    return new THREE.ShaderMaterial({
      uniforms: { map: { value: atlas.texture }, uTile: { value: new THREE.Vector4((indice % 4) * LADO / ATLAS_W, Math.floor(indice / 4) * LADO / ATLAS_H, LADO / ATLAS_W, LADO / ATLAS_H) }, uBrilho: { value: brilho || 1.5 } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: 'uniform sampler2D map; uniform vec4 uTile; uniform float uBrilho; varying vec2 vUv; void main(){ vec2 q = clamp(vUv, 0.002, 0.998); ' + (inverteV ? 'q.y = 1.0 - q.y; ' : '') + 'gl_FragColor = vec4(texture2D(map, uTile.xy + q * uTile.zw).rgb * uBrilho, 1.0); }',
    });
  }
  function tela(indice, id, extras) { if (id) telas.set(indice, { id, extras: extras || {} }); else telas.delete(indice); }
  const palco = { ativo: false, i: 10, escolha: null, ganho: 3 };
  function projetorPalco(cfg) {
    const i = palco.i;
    if (!cfg) { palco.ativo = false; palco.escolha = null; U.uProjCor.value[i].set(0, 0, 0, 0); return; }
    const eye = W3(cfg.de[0], cfg.de[1], cfg.de[2]), alvo = W3(cfg.para[0], cfg.para[1], cfg.para[2]);
    const mundo = new THREE.Matrix4().lookAt(eye, alvo, new THREE.Vector3(0, 1, 0)); mundo.setPosition(eye);
    const view = mundo.clone().invert(), d = eye.distanceTo(alvo);
    const near = Math.max(0.3, d - cfg.raio * 1.3), far = d + cfg.raio * 1.3, t = near * cfg.raio / d;
    const proj = new THREE.Matrix4().makePerspective(-t * (cfg.aspecto || 1), t * (cfg.aspecto || 1), t, -t, near, far);
    U.uProjMat.value[i].multiplyMatrices(proj, view);
    U.uProjTile.value[i].set((i % 4) * LADO / ATLAS_W, Math.floor(i / 4) * LADO / ATLAS_H, LADO / ATLAS_W, LADO / ATLAS_H);
    U.uProjPos.value[i].set(eye.x, eye.y, eye.z, 0);
    U.uProjRep.value[i].set(1, 1, cfg.duasFaces ? 1 : 0, 0);   // só ilumina a face voltada para o projetor
    palco.ativo = true; palco.escolha = cfg.anim; palco.ganho = cfg.ganho || 3; palco.extras = cfg.extras || {};
  }
  function animPalco(id, extras) { palco.escolha = id; if (extras) palco.extras = extras; }

  // ---- a cada quadro
  function atualizar(tempo, noite, extras) {
    const ligar = estadoP.soNoite ? clamp((noite - 0.15) / 0.35, 0, 1) : 1;
    const ext = { batida: extras && extras.batida, energia: extras && extras.energia };
    // telas e palco (independem do plano de iluminação)
    if (pronto && (telas.size || palco.ativo)) {
      const antes = renderer.getRenderTarget();
      for (const [i, tl] of telas) anim.desenhar(tl.id, atlas, { x: (i % 4) * LADO, y: Math.floor(i / 4) * LADO, w: LADO, h: LADO }, tempo, Object.assign({}, ext, tl.extras));
      if (palco.ativo && palco.escolha) {
        anim.desenhar(palco.escolha, atlas, { x: (palco.i % 4) * LADO, y: Math.floor(palco.i / 4) * LADO, w: LADO, h: LADO }, tempo, Object.assign({}, ext, palco.extras));
        U.uProjCor.value[palco.i].set(1, 1, 1, palco.ganho);
      }
      renderer.setRenderTarget(antes);
    }
    if (!palco.ativo) U.uProjCor.value[palco.i].set(0, 0, 0, 0);
    const qualquer = P.some(p => p.escolha);
    lenteMat.emissiveIntensity = 3 * ligar;
    for (const p of P) {
      const ativo = !!p.escolha && ligar > 0;
      p.aparelho.visible = p.pe.visible = !!p.escolha;
      const cor = U.uProjCor.value[p.i];
      if (!ativo || p.escolha === 'youtube' || !pronto && p.escolha !== 'video') { cor.set(0, 0, 0, 0); }
      else cor.set(1, 1, 1, p.l.ganho * ligar * estadoP.intensidade);
      if (p.furo) p.furo.visible = p.escolha === 'youtube' && ligar > 0;
    }
    if (!qualquer || !ligar) return;
    // desenha os ladrilhos
    const antes = renderer.getRenderTarget(), autoAntes = renderer.autoClear;
    for (const p of P) {
      if (!p.escolha || p.escolha === 'youtube') continue;
      const x = (p.i % 4) * LADO, y = Math.floor(p.i / 4) * LADO;
      if (p.escolha === 'video') {
        if (!p.video || p.video.readyState < 2) continue;
        const va = p.video.videoWidth / Math.max(1, p.video.videoHeight), ta = p.aspecto;
        matVideo.uniforms.map.value = p.vtex;
        matVideo.uniforms.uEsc.value.set(va > ta ? 1 : va / ta, va > ta ? ta / va : 1, 0, 0);
        matVideo.uniforms.uGanho.value = 1.15;
        U.uProjRep.value[p.i].x = 1; U.uProjRep.value[p.i].y = 1;
        atlas.viewport.set(x, y, LADO, LADO); atlas.scissor.set(x, y, LADO, LADO); atlas.scissorTest = true;
        renderer.setRenderTarget(atlas); renderer.autoClear = false; renderer.render(cenaQuad, camQuad);
        atlas.scissorTest = false; atlas.viewport.set(0, 0, ATLAS_W, ATLAS_H);
        continue;
      }
      U.uProjRep.value[p.i].x = p.rep[0]; U.uProjRep.value[p.i].y = p.rep[1];
      if (!pronto) continue;
      anim.desenhar(p.escolha, atlas, { x, y, w: LADO, h: LADO }, tempo, { batida: extras && extras.batida, energia: extras && extras.energia, semente: p.semente });
    }
    atlas.viewport.set(0, 0, ATLAS_W, ATLAS_H);
    renderer.setRenderTarget(antes); renderer.autoClear = autoAntes;
  }
  // janelas do YouTube acompanhando as paredes
  const v4 = new THREE.Vector3();
  function posicionarYT(cam, w, h) {
    for (const p of P) {
      if (!p.yt) continue;
      const f = p.yt, pts = [];
      if (!p.furo.visible) { f.style.visibility = 'hidden'; continue; }
      let ok = true;
      for (const k of p.cantosTela) { v4.copy(k).applyMatrix4(cam.matrixWorldInverse); if (v4.z > -0.2) { ok = false; break; } v4.copy(k).project(cam); pts.push([(v4.x * 0.5 + 0.5) * w, (-v4.y * 0.5 + 0.5) * h]); }
      if (!ok) { f.style.visibility = 'hidden'; continue; }
      // homografia do retângulo 1280×720 para o quadrilátero da parede na tela
      const m = homografia([[0, 0], [1280, 0], [1280, 720], [0, 720]], pts);
      if (!m) { f.style.visibility = 'hidden'; continue; }
      f.style.transform = 'matrix3d(' + m.join(',') + ')';
      f.style.visibility = 'visible';
    }
  }
  function paraFoto(sim) { for (const p of P) if (p.furo && p.escolha === 'youtube') p.furo.visible = !sim; }
  function tem(id) { const p = P.find(q => q.l.id === id); return p ? p.escolha : null; }

  montarMenu();
  carregar();
  atualizarMenu();
  return { lugares: P, atualizar, aplicar, escolher, posicionarYT, paraFoto, tem, estado: estadoP, preparo, atlas, materialTela, tela, projetorPalco, animPalco,
    get escolhas() { const o = {}; for (const p of P) if (p.escolha && p.escolha !== 'video' && p.escolha !== 'youtube') o[p.l.id] = p.escolha; return o; } };
}

function idYT(u) {
  const s = String(u || '').trim();
  const m = s.match(/(?:youtu\.be\/|v=|\/shorts\/|\/embed\/|\/live\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : (/^[A-Za-z0-9_-]{11}$/.test(s) ? s : null);
}

// matriz CSS (matrix3d, coluna por coluna) que leva o retângulo de origem ao quadrilátero de destino
function homografia(de, para) {
  const A = [], b = [];
  for (let i = 0; i < 4; i++) {
    const [x, y] = de[i], [u, v] = para[i];
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]); b.push(u);
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y]); b.push(v);
  }
  const h = resolver(A, b); if (!h) return null;
  const [a, bb, c, d, e, f, g, hh] = h;
  return [a, d, 0, g, bb, e, 0, hh, 0, 0, 1, 0, c, f, 0, 1];
}
function resolver(A, b) {
  const n = b.length, M = A.map((r, i) => r.concat([b[i]]));
  for (let c = 0; c < n; c++) {
    let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    if (Math.abs(M[p][c]) < 1e-10) return null;
    [M[c], M[p]] = [M[p], M[c]];
    for (let r = 0; r < n; r++) if (r !== c) { const k = M[r][c] / M[c][c]; for (let k2 = c; k2 <= n; k2++) M[r][k2] -= k * M[c][k2]; }
  }
  return M.map((r, i) => r[n] / r[i]);
}
