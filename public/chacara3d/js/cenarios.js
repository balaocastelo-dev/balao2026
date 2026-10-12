// Cenários do passeio: festa de aniversário, reunião no cineminha à noite, trabalhadores cuidando
// da chácara, festa na piscina com a churrasqueira lotada e uma rave lotada à noite.
// Cada cenário põe pessoas animadas (pessoas/*.glb, corpo do MakeHuman) e adereços
// (cenarios/aderecos.glb), acerta a hora, toca a música pelas caixas de som do cenário, liga as
// luzes de festa e escolhe as projeções. Tudo sai igual a cada vez (sorteio com semente).
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { $, W3, clamp, aviso, estado } from './util.js';
import { remendar } from './materiais.js';
import { criarMusica } from './musica.js';

const BASE = '/chacara3d/';
const difAng = (a, b) => Math.atan2(Math.sin(a - b), Math.cos(a - b));
function sorteio(semente) {
  let a = semente >>> 0;
  return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const cor = h => new THREE.Color(h);

// ---------------------------------------------------------------- paletas (sRGB)
const PELES = ['#f3cfb0', '#ebbd9b', '#dfa985', '#d09772', '#bf8460', '#a8704e', '#90603f', '#7a4e33', '#643f29', '#4d2f1f'];
const CABELOS = ['#120d0a', '#1c130e', '#271910', '#352216', '#4a2f1c', '#6b4527', '#8c6038', '#b28a57', '#d3b383', '#8d8a85', '#cfc9bf'];
const R_DIA = ['#2f5d9e', '#c23b30', '#ece7da', '#2e2e33', '#3d7a4a', '#d9a520', '#7b4fa0', '#e07b9a', '#5a7fa6', '#f4f4f2', '#1f3a5f', '#a3b86c', '#d96c3f', '#5bb3b0', '#f2d16b', '#9a3b5a'];
const R_BAIXO = ['#2b3a55', '#3a4a6a', '#1f2a40', '#c9b48e', '#e8e3d6', '#2e2e33', '#6b7f4f', '#8b5a2b', '#556677', '#a9b5c4', '#3d3d42'];
const R_PRAIA = ['#e63946', '#f4a261', '#2a9d8f', '#264653', '#e9c46a', '#ff70a6', '#70d6ff', '#ffd670', '#8338ec', '#06d6a0', '#ef476f', '#118ab2', '#111111', '#f7f7f7'];
const R_NOITE = ['#111114', '#1d1d24', '#2b2b33', '#3a1050', '#0f3a4f', '#5c0f2e', '#e6e6e6', '#9cff3a', '#ff3bd6', '#24e2ff', '#f0f04a', '#141414'];
const ACESS = ['#f2f2f2', '#262626', '#7a5230', '#c7b48a', '#b03030', '#3a4a6a', '#dcdcdc', '#c9c2b0'];

export function criarCenarios(ctx) {
  const { cena, colisao: C, som, projecoes, cinema, prepararProgramas, mudarHora, irPara } = ctx;
  const musica = criarMusica(som);
  let rec = null, carregando = null;
  let atual = null, ativando = false;
  let escolhasAntes = null;

  // ---------------------------------------------------------------- recursos (carregados na primeira vez)
  function recursos(progresso) {
    if (rec) return Promise.resolve(rec);
    if (carregando) return carregando;
    const loader = new GLTFLoader();
    const arqs = ['pessoas/homem.glb', 'pessoas/mulher.glb', 'pessoas/crianca.glb', 'cenarios/aderecos.glb'];
    const prog = arqs.map(() => 0);
    const um = (u, i) => new Promise((ok, erro) => loader.load(BASE + u, ok, e => { if (e.total) { prog[i] = e.loaded / e.total; if (progresso) progresso(prog.reduce((a, b) => a + b, 0) / prog.length); } }, erro));
    carregando = Promise.all([fetch(BASE + 'pessoas/pessoas.json').then(r => r.json()), ...arqs.map(um)]).then(([info, h, m, c, a]) => {
      rec = { info, pessoas: { homem: h, mulher: m, crianca: c }, aderecos: a, clips: {} };
      for (const [k, g] of Object.entries(rec.pessoas)) { rec.clips[k] = {}; for (const cl of g.animations) rec.clips[k][cl.name] = cl; }
      return rec;
    });
    return carregando;
  }

  // ---------------------------------------------------------------- material das pessoas (máscaras de cor)
  function materialPessoa(base, cores) {
    const m = new THREE.MeshStandardMaterial({ map: base.map, roughness: 0.78, metalness: 0, vertexColors: true });
    remendar(m, { interior: true, nuvens: true });
    const obc = m.onBeforeCompile, chave = m.customProgramCacheKey;
    const u = { uCima: { value: cores.cima }, uBaixo: { value: cores.baixo }, uPele: { value: cores.pele }, uCabelo: { value: cores.cabelo }, uAcess: { value: cores.acess } };
    m.onBeforeCompile = (sh, r) => {
      obc(sh, r);
      Object.assign(sh.uniforms, u);
      sh.fragmentShader = 'uniform vec3 uCima; uniform vec3 uBaixo; uniform vec3 uPele; uniform vec3 uCabelo; uniform vec3 uAcess;\n' +
        sh.fragmentShader.replace('#include <color_fragment>', `
        #if defined( USE_COLOR_ALPHA )
        {
          vec4 mk = vColor;
          float soma = mk.r + mk.g + mk.b + mk.a;
          diffuseColor.rgb *= mk.r * uCima + mk.g * uBaixo + mk.b * uPele + mk.a * uCabelo + max(0.0, 1.0 - soma) * uAcess;
        }
        #endif`).replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
        #if defined( USE_COLOR_ALPHA )
        roughnessFactor = mix(roughnessFactor, 0.55, vColor.b * 0.7) * mix(1.0, 0.75, vColor.a);
        #endif`);
    };
    m.customProgramCacheKey = () => chave() + '|pessoa';
    return m;
  }

  // ---------------------------------------------------------------- pessoa
  function pessoa(tipo, visual, cores, o) {
    o = o || {};
    const g = rec.pessoas[tipo];
    const obj = SkeletonUtils.clone(g.scene);
    const raiz = obj.children[0];
    let malha = null;
    for (const c of [...raiz.children]) { if (c.isBone) continue; if (c.name === visual && !malha) malha = c; else raiz.remove(c); }
    const mats = [];
    obj.traverse(k => {
      if (!k.isMesh) return;
      k.castShadow = !!o.sombra; k.receiveShadow = true; k.frustumCulled = false;
      if (k.material && k.material.name === 'pessoa') { k.material = materialPessoa(k.material, cores); mats.push(k.material); }
    });
    const esc = o.escala || 1;
    obj.scale.setScalar(esc);
    // camada 3: as pessoas não entram no reflexo da piscina (economiza um desenho inteiro da multidão)
    obj.traverse(k => k.layers.set(3));
    const mixer = new THREE.AnimationMixer(obj);
    const info = rec.info.pessoas[tipo];
    const p = { tipo, visual, obj, mixer, acoes: {}, atual: null, anim: null, x: 0, y: 0, z: 0, rumo: 0, rumoAlvo: 0, esc, info, ossos: {}, mats, tt: Math.random() * 4, mov: null };
    obj.traverse(b => { if (b.isBone) p.ossos[b.name] = b; });
    p.tocar = (nome, op) => {
      op = op || {};
      const clip = rec.clips[tipo][nome] || rec.clips[tipo].parado;
      let a = p.acoes[nome]; if (!a) a = p.acoes[nome] = mixer.clipAction(clip);
      if (p.atual === a) { if (op.escala !== undefined) a.timeScale = op.escala; return; }
      a.reset(); a.enabled = true; a.setEffectiveWeight(1); a.timeScale = op.escala === undefined ? 1 : op.escala;
      a.time = (op.fase === undefined ? Math.random() : op.fase) * clip.duration;
      a.play();
      if (p.atual) p.atual.crossFadeTo(a, op.fade === undefined ? 0.45 : op.fade, false);
      p.atual = a; p.anim = nome;
    };
    p.colocar = (x, y, z, rumo) => { p.x = x; p.y = y; p.z = z; if (rumo !== undefined) { p.rumo = p.rumoAlvo = rumo; } p.aplicar(); };
    p.aplicar = () => { obj.position.copy(W3(p.x, p.y, p.z)); obj.rotation.y = p.rumo + Math.PI / 2; if (p.mov) { p.mov.x = p.x; p.mov.y = p.y; p.mov.z = p.z; } };
    p.segurar = (ad, osso, pos) => { const b = p.ossos[osso || 'pega_d']; if (!b) return; ad.traverse(k => k.layers.set(3)); b.add(ad); if (pos) ad.position.set(pos[0], pos[1], pos[2]); return ad; };
    p.noColo = (ad, pos) => { ad.traverse(k => k.layers.set(3)); obj.add(ad); ad.position.set(pos[0], pos[1], pos[2]); return ad; };
    // ponto de apoio de um objeto segundo as notas da animação (centro -> base do objeto)
    p.notaPos = (anim, chave, meiaAltura) => { const a = info.animacoes[anim] || {}; const v = a[chave] || [0, 1, 0.3]; return [v[0], v[1] - (meiaAltura || 0), v[2]]; };
    p.chapeu = ad => {
      const b = p.ossos.cabeca; if (!b) return;
      obj.updateMatrixWorld(true);
      const v = new THREE.Vector3(); b.getWorldPosition(v);
      const base = obj.position.y, topo = info.medidas.altura_m * esc;
      ad.traverse(k => k.layers.set(3)); b.add(ad); ad.position.set(0, (topo - (v.y - base)) / esc - 0.035, 0.01); ad.rotation.x = -0.12;
    };
    p.descartar = () => { for (const m of mats) m.dispose(); mixer.stopAllAction(); };
    return p;
  }
  function velAnim(p, nome) { const a = p.info.animacoes[nome]; return (a && a.velocidade_m_s) || 1; }

  // ---------------------------------------------------------------- adereços
  function aderecoBruto(nome) {
    const src = rec.aderecos.scene.getObjectByName(nome);
    if (!src) { console.warn('adereço não achado:', nome); return new THREE.Group(); }
    const o = src.clone(true);
    o.position.set(0, 0, 0); o.rotation.set(0, 0, 0); o.scale.set(1, 1, 1);
    o.traverse(k => { if (k.isMesh) { k.castShadow = true; k.receiveShadow = true; } });
    return o;
  }
  // põe um adereço no terreno: (x, y, z) do build, ângulo para onde a frente (+Z do objeto) olha
  function por(grupo, nome, x, y, z, ang) {
    const o = aderecoBruto(nome);
    o.position.copy(W3(x, y, z || 0)); o.rotation.y = (ang || 0) + Math.PI / 2;
    grupo.add(o); return o;
  }
  function materiaisPorNome(raiz, nome) { const l = []; raiz.traverse(k => { if (k.isMesh) for (const m of [].concat(k.material)) if (m.name === nome && !l.includes(m)) l.push(m); }); return l; }

  // ---------------------------------------------------------------- comportamento
  function andarAte(p, ax, ay, vel, dt) {
    const dx = ax - p.x, dy = ay - p.y, d = Math.hypot(dx, dy);
    if (d < 0.1) return 'chegou';
    const ang = Math.atan2(dy, dx), passo = Math.min(d, vel * dt);
    for (const desvio of [0, 0.45, -0.45, 0.9, -0.9]) {
      const a = ang + desvio, nx = p.x + Math.cos(a) * passo, ny = p.y + Math.sin(a) * passo;
      if (!C.barra(nx, ny, p.z, 0.2, p.mov)) { p.x = nx; p.y = ny; p.z = C.chaoEm(nx, ny, p.z); p.rumoAlvo = a; return 'andou'; }
    }
    return 'preso';
  }
  const escolher = (l, r) => l[Math.floor((r || Math.random)() * l.length) % l.length];

  // fica no lugar trocando de animação de tempos em tempos
  const fixo = (lista, troca) => (p, dt) => { p.tt -= dt; if (p.tt <= 0) { p.tt = (troca || 6) * (0.6 + Math.random() * 0.8); p.tocar(escolher(lista)); } };
  // anda entre pontos (com pausas), desviando do que estiver no caminho
  function passeio(pontos, o) {
    o = o || {};
    return (p, dt) => {
      if (!p.alvo) { p.alvo = escolher(pontos); p.preso = 0; }
      if (p.pausa > 0) { p.pausa -= dt; if (p.pausa <= 0) p.alvo = null; return; }
      const vel = o.vel || 0.9, anim = o.anim || 'andando_devagar';
      const r = andarAte(p, p.alvo[0], p.alvo[1], vel, dt);
      if (r === 'andou') { p.tocar(anim, { escala: vel / velAnim(p, anim) }); p.preso = 0; }
      else if (r === 'preso') { p.tocar(o.parado || 'parado'); p.preso += dt; if (p.preso > 1.5) p.alvo = null; }
      else { p.pausa = (o.pausa || 4) * (0.5 + Math.random()); p.tocar(escolher(o.parados || ['parado', 'parado_2'])); if (p.alvo[2] !== undefined) p.rumoAlvo = p.alvo[2]; }
    };
  }
  // dança no tempo da música (a animação acompanha a batida)
  function danca(lista, o) {
    o = o || {};
    return (p, dt, c) => {
      if (c.compasso !== p.ultCompasso) {
        p.ultCompasso = c.compasso;
        if (--p.compassos <= 0 || !p.anim) {
          p.compassos = 4 + Math.floor(Math.random() * 6);
          const l = c.energia < 0.5 && o.calma ? o.calma : lista;
          p.tocar(escolher(l), { escala: 0, fade: 0.3 });
          p.atual.timeScale = 0;
        }
      }
      const a = p.atual; if (!a) return;
      const cl = a.getClip(), batidas = 8;
      const b = (((c.batidas + p.offBatida) % batidas) + batidas) % batidas;
      a.time = b / batidas * cl.duration;
      if (o.olhar) p.rumoAlvo = Math.atan2(o.olhar[1] - p.y, o.olhar[0] - p.x) + p.desvioOlhar;
    };
  }
  // roda de conversa: um fala, os outros escutam, bebem, às vezes todo mundo ri
  function roda(membros) {
    const r = { membros, t: Math.random() * 2 };
    r.atualizar = dt => {
      r.t -= dt; if (r.t > 0) return;
      r.t = 4 + Math.random() * 5;
      const risada = Math.random() < 0.18, falante = Math.floor(Math.random() * membros.length);
      membros.forEach((p, i) => {
        if (p.ocupado) return;
        if (risada && i !== falante) p.tocar('rindo');
        else if (i === falante) p.tocar('conversando');
        else p.tocar(p.copo ? (Math.random() < 0.55 ? 'bebendo' : 'ouvindo') : (Math.random() < 0.7 ? 'ouvindo' : 'parado'));
      });
    };
    return r;
  }

  // ---------------------------------------------------------------- montagem genérica
  function novoCenario(id) {
    return { id, grupo: new THREE.Group(), pessoas: [], rodas: [], extras: [], fontes: [], atualizarExtra: null, sair: [] };
  }
  function coresPara(r, estilo, tipo, visual) {
    const pele = cor(escolher(PELES, r)), cabelo = cor(escolher(CABELOS, r));
    let cima, baixo, acess = cor(escolher(ACESS, r));
    if (estilo === 'trabalho') { cima = cor('#3f5e3a'); baixo = cor('#4a4f57'); acess = cor(tipo === 'homem' ? '#c8a96b' : '#2d3f5c'); }
    else if (estilo === 'piscina') { cima = cor(escolher(R_PRAIA, r)); baixo = (tipo === 'mulher' && visual === 'praia' && r() < 0.6) ? cima.clone() : cor(escolher(R_PRAIA, r)); }
    else if (estilo === 'noite') { cima = cor(escolher(R_NOITE, r)); baixo = cor(escolher(['#1b1b22', '#2b3a55', '#141418', '#3a3a44', '#1f2a40'], r)); }
    else { cima = cor(escolher(R_DIA, r)); baixo = cor(escolher(R_BAIXO, r)); if (visual === 'vestido' || visual === 'menina') baixo = cima.clone(); }
    if (cabelo.r > 0.5 && r() < 0.5) cabelo.copy(cor(escolher(CABELOS.slice(0, 6), r)));
    return { pele, cabelo, cima, baixo, acess };
  }
  // cria a pessoa, põe no lugar e na lista do cenário
  function gente(cn, r, tipo, visual, estilo, x, y, rumo, cerebro, o) {
    o = o || {};
    const p = pessoa(tipo, visual, coresPara(r, estilo, tipo, visual), { escala: o.escala || (0.95 + r() * 0.1), sombra: o.sombra !== undefined ? o.sombra : cn.sombras });
    const z = o.z !== undefined ? o.z : C.chaoEm(x, y, 0);
    p.mov = { x, y, z, r: o.raio || 0.2, ativo: o.bloqueia !== false };
    C.moveis.push(p.mov);
    p.colocar(x, y, z, rumo);
    p.cerebro = cerebro; p.offBatida = Math.floor(r() * 2) * 4 + (r() - 0.5) * 0.12; p.desvioOlhar = (r() - 0.5) * 0.5; p.compassos = 0;
    if (o.anim) p.tocar(o.anim); else p.tocar('parado');
    cn.grupo.add(p.obj); cn.pessoas.push(p);
    return p;
  }
  const livre = (x, y, z, R) => !C.barra(x, y, z || 0, R || 0.25);
  // sorteia posições livres numa área, a pelo menos `dist` uma da outra
  function espalhar(r, n, area, dist, peso, extraOk) {
    const pts = []; let tent = 0;
    while (pts.length < n && tent < n * 400) {
      tent++;
      const x = area[0] + r() * (area[1] - area[0]), y = area[2] + r() * (area[3] - area[2]);
      if (peso && r() > peso(x, y)) continue;
      if (extraOk && !extraOk(x, y)) continue;
      if (!livre(x, y, 0, 0.26)) continue;
      if (pts.some(q => Math.hypot(q[0] - x, q[1] - y) < dist)) continue;
      pts.push([x, y]);
    }
    return pts;
  }
  const tipoAdulto = r => r() < 0.5 ? 'homem' : 'mulher';
  const VIS = {
    festa: { homem: ['casual', 'camisa', 'regata', 'casual'], mulher: ['casual', 'vestido', 'vestido', 'casual'], crianca: ['menino', 'menina'] },
    noite: { homem: ['noite', 'casual', 'regata', 'noite', 'camisa'], mulher: ['noite', 'casual', 'vestido', 'noite'], crianca: ['menino', 'menina'] },
    piscina: { homem: ['praia', 'praia_2', 'praia', 'regata'], mulher: ['praia', 'praia_2', 'praia', 'vestido'], crianca: ['praia_menino', 'praia_menina'] },
  };
  function qtd(n) { const q = estado.qualidade; return Math.max(1, Math.round(n * (q >= 2 ? 1 : q === 1 ? 0.7 : 0.4))); }

  // ================================================================ 1. FESTA DE ANIVERSÁRIO
  function aniversario() {
    const cn = novoCenario('aniversario'); cn.sombras = true;
    const r = sorteio(2026), G = cn.grupo;
    const MESA = [14.0, 4.05];
    por(G, 'arco_baloes', 14.0, 3.35, 0, Math.PI / 2);
    por(G, 'faixa_parabens', 14.0, 3.32, 2.72, Math.PI / 2);
    por(G, 'mesa_bolo', MESA[0], MESA[1], 0, Math.PI / 2);
    const bolo = por(G, 'bolo', MESA[0], MESA[1] - 0.05, 0.758, Math.PI / 2);
    por(G, 'bandeja_doces', 13.35, 4.0, 0.758, Math.PI / 2); por(G, 'bandeja_doces', 14.65, 4.02, 0.758, Math.PI / 2);
    for (const [x, y] of [[13.0, 4.25], [13.15, 3.85], [14.95, 4.25], [15.05, 3.88]]) por(G, 'copo_festa', x, y, 0.758, 0);
    por(G, 'presentes', 15.75, 4.25, 0, Math.PI / 2 + 0.3);
    for (const [x, y] of [[12.75, 4.45], [15.3, 4.6], [17.3, 3.6], [10.3, 4.0], [24.4, 4.1], [27.9, 6.2]]) por(G, 'cacho_baloes', x, y, 0, r() * 6);
    const caixa = por(G, 'caixa_som', 12.2, 4.75, 0, Math.PI / 2 - 0.4);
    const chamas = materiaisPorNome(bolo, 'chama');
    const ledSom = materiaisPorNome(caixa, 'led_som');
    // mesas redondas com cadeiras
    const MESAS = [[17.4, 5.85], [24.1, 6.2], [26.6, 4.7], [10.1, 5.1]];
    const assentos = [];
    MESAS.forEach(([mx, my], k) => {
      por(G, 'mesa_redonda_festa', mx, my, 0, 0);
      por(G, 'pratinho_bolo', mx + 0.25, my + 0.1, 0.758, r() * 6); por(G, 'copo_festa', mx - 0.2, my - 0.15, 0.758, 0);
      for (let i = 0; i < 4; i++) {
        const a = i * Math.PI / 2 + Math.PI / 4 + k * 0.3, cx = mx + Math.cos(a) * 0.95, cy = my + Math.sin(a) * 0.95, olha = a + Math.PI;
        por(G, 'cadeira_festa', cx, cy, 0, olha);
        assentos.push([cx - Math.cos(olha) * 0.06, cy - Math.sin(olha) * 0.06, olha]);
      }
    });
    C.BOX.push(...MESAS.map(([x, y]) => [x - 0.62, x + 0.62, y - 0.62, y + 0.62, 0, 0.78]), [MESA[0] - 1.0, MESA[0] + 1.0, MESA[1] - 0.48, MESA[1] + 0.48, 0, 0.78]);
    cn.sair.push(() => { C.BOX.splice(C.BOX.length - MESAS.length - 1, MESAS.length + 1); });
    // gente sentada nas mesas
    const sentados = assentos.filter((_, i) => i % 2 === 0).slice(0, qtd(8));
    sentados.forEach(([x, y, a]) => {
      const t = tipoAdulto(r);
      const p = gente(cn, r, t, escolher(VIS.festa[t], r), 'festa', x, y, a, fixo(['sentado_conversando', 'sentado', 'sentado_conversando'], 7), { bloqueia: true });
      p.tocar('sentado_conversando');
    });
    // rodas de conversa
    const RODAS = [[11.6, 5.9, 3], [19.6, 4.1, 4], [25.4, 7.2, 3], [22.4, 3.9, 3]];
    RODAS.slice(0, estado.qualidade >= 1 ? 4 : 2).forEach(([cx, cy, n]) => {
      const membros = [];
      for (let i = 0; i < n; i++) {
        const a = i / n * Math.PI * 2 + r(), x = cx + Math.cos(a) * 0.72, y = cy + Math.sin(a) * 0.72;
        if (!livre(x, y, 0, 0.22)) continue;
        const t = tipoAdulto(r), p = gente(cn, r, t, escolher(VIS.festa[t], r), 'festa', x, y, a + Math.PI, null);
        if (r() < 0.6) { p.segurar(aderecoBruto('copo_festa')); p.copo = true; }
        membros.push(p);
      }
      cn.rodas.push(roda(membros));
    });
    // anfitriões perto do bolo
    const anf = [gente(cn, r, 'mulher', 'vestido', 'festa', 12.75, 4.95, -0.9, fixo(['conversando', 'parado', 'acenando'], 6)),
      gente(cn, r, 'homem', 'camisa', 'festa', 15.25, 5.05, -2.3, fixo(['conversando', 'ouvindo', 'parado'], 6))];
    // crianças: três na mesa do bolo, o resto correndo pelo gramado
    const AREA_CORRE = [16.8, 29.0, 3.5, 7.4];
    const pontosCorre = espalhar(sorteio(7), 18, AREA_CORRE, 0.8, null, (x, y) => Math.hypot(x - 20.6, y - 6.2) > 1.9);
    const criancas = [];
    [[13.45, 4.72], [14.1, 4.78], [14.75, 4.7]].forEach(([x, y]) => criancas.push(gente(cn, r, 'crianca', escolher(VIS.festa.crianca, r), 'festa', x, y, -Math.PI / 2, fixo(['parado', 'batendo_palmas', 'parado_2'], 5))));
    for (let i = 0; i < qtd(6); i++) {
      const [x, y] = pontosCorre[i] || [20, 4];
      criancas.push(gente(cn, r, 'crianca', escolher(VIS.festa.crianca, r), 'festa', x, y, r() * 6, passeio(pontosCorre, { vel: 2.4, anim: 'correndo', pausa: 1.2, parados: ['parado', 'acenando', 'rindo'] }), { raio: 0.16 }));
    }
    criancas.forEach(c => c.chapeu(aderecoBruto('chapeu_festa')));
    // dois adultos andando com copo
    const pontosAnda = espalhar(sorteio(11), 10, [9.5, 28.0, 3.6, 7.0], 1.0, null, (x, y) => Math.hypot(x - 20.6, y - 6.2) > 2.0);
    for (let i = 0; i < qtd(2); i++) { const t = tipoAdulto(r), [x, y] = pontosAnda[i]; const p = gente(cn, r, t, escolher(VIS.festa[t], r), 'festa', x, y, 0, passeio(pontosAnda, { vel: 0.85, pausa: 6, parados: ['bebendo', 'parado'] })); p.segurar(aderecoBruto('copo_festa')); p.copo = true; }
    cn.hora = 18.6; cn.proj = 'aniversario';
    cn.musica = { estilo: 'aniversario', pontos: [[12.2, 4.75, 0.4]], volume: 0.5 };
    cn.vista = [21.5, 5.0, 3.22, 0];   // atrás da roda de conversa, olhando a mesa do bolo
    cn.burburinho = [16.5, 5.2, cn.pessoas.length];
    cn.atualizarExtra = (dt, t, c) => {
      for (const m of chamas) m.emissiveIntensity = 2.2 + 0.8 * Math.sin(t * 23) * Math.sin(t * 13.7);
      for (const m of ledSom) m.emissiveIntensity = 1 + 1.5 * Math.pow(1 - c.batida, 3);
    };
    // "Parabéns": todo mundo que está em pé vai para perto do bolo e canta
    cn.parabens = () => {
      const dur = musica.parabens();
      const quem = cn.pessoas.filter(p => !/sentado/.test(p.anim || ''));
      quem.forEach((p, i) => {
        const a = 0.25 + (i / Math.max(1, quem.length - 1)) * (Math.PI - 0.5), rr = (p.tipo === 'crianca' ? 1.15 : 1.9) + (i % 2) * 0.45;
        const ax = MESA[0] + Math.cos(a) * rr, ay = MESA[1] + 0.25 + Math.sin(a) * rr;
        p.guardado = p.guardado || p.cerebro; p.ocupado = true; p.alvoP = [ax, ay]; p.tParabens = dur + 5;
        p.cerebro = (q, dt) => {
          q.tParabens -= dt;
          if (q.tParabens <= 0) { q.ocupado = false; q.cerebro = q.guardado; q.guardado = null; q.alvo = null; return; }
          if (q.alvoP) {
            const res = andarAte(q, q.alvoP[0], q.alvoP[1], 1.3, dt);
            if (res === 'andou') q.tocar('andando', { escala: 1.3 / velAnim(q, 'andando') });
            else { q.alvoP = null; q.rumoAlvo = Math.atan2(MESA[1] - q.y, MESA[0] - q.x); }
          } else q.tocar(q.tParabens > 5 ? 'cantando_parabens' : 'batendo_palmas');
        };
      });
      aviso('Parabéns pra você! 🎂', 4000);
    };
    return cn;
  }

  // ================================================================ 2. REUNIÃO NO CINEMINHA (noite)
  function cineminha() {
    const cn = novoCenario('cinema'); cn.sombras = false;
    const r = sorteio(77), G = cn.grupo, Z = -1, ASS = -Math.PI / 2;   // todo mundo olha para a tela (y = 0)
    por(G, 'manta', 54.05, 0.95, Z, -Math.PI / 2);
    por(G, 'puff', 51.95, 2.55, Z, ASS + 0.35); por(G, 'puff', 56.05, 2.55, Z, ASS - 0.35);
    for (const x of [52.7, 54.0, 55.3]) por(G, 'cadeira_dobravel', x, 4.55, Z, ASS);
    const proj = por(G, 'projetor', 54.0, 5.2, Z, ASS);
    por(G, 'cooler', 56.75, 3.35, Z, Math.PI); por(G, 'balde_pipoca', 54.0, 2.2, Z + 0.36, 0);
    for (const m of materiaisPorNome(proj, 'lente_projetor')) m.emissiveIntensity = 3;
    const pipoca = p => { p.noColo(aderecoBruto('balde_pipoca'), p.notaPos('sentado_comendo', 'balde_m', 0.28)); };
    const sentar = (t, vis, x, y, z, a, anims) => gente(cn, r, t, vis, 'festa', x, y, a, fixo(anims, 9), { z, anim: anims[0] });
    // sofá (assento a 0,44 m)
    [52.95, 53.65, 54.35, 55.05].forEach((x, i) => {
      const t = i % 2 ? 'mulher' : 'homem';
      const p = sentar(t, escolher(VIS.festa[t], r), x, 3.6, Z - 0.01, ASS, i === 1 ? ['sentado_comendo'] : i === 3 ? ['sentado_conversando', 'sentado_assistindo'] : ['sentado_assistindo']);
      if (i === 1) pipoca(p);
    });
    // pufes redondos (crianças) e pufes grandes (adultos)
    [[53.0, 1.85], [55.0, 1.85]].forEach(([x, y]) => sentar('crianca', escolher(VIS.festa.crianca, r), x, y, Z - 0.06, ASS, ['sentado_assistindo']));
    [[51.95, 2.62, ASS + 0.35], [56.05, 2.62, ASS - 0.35]].forEach(([x, y, a], i) => { const t = i ? 'mulher' : 'homem'; const p = sentar(t, escolher(VIS.noite[t], r), x, y, Z - 0.1, a, ['sentado_comendo']); pipoca(p); });
    // manta: duas crianças e um adulto sentados no chão
    [[53.45, 1.0, 'crianca'], [54.15, 0.92, 'crianca'], [54.85, 1.05, 'mulher']].forEach(([x, y, t]) => sentar(t, escolher(VIS.festa[t], r), x, y, Z, ASS, ['sentado_chao']));
    // cadeiras de trás
    if (estado.qualidade >= 1) [52.7, 54.0, 55.3].forEach((x, i) => { const t = i === 1 ? 'mulher' : 'homem'; sentar(t, escolher(VIS.noite[t], r), x, 4.5, Z, ASS, ['sentado_assistindo', 'sentado_conversando']); });
    cn.hora = 20.8; cn.proj = 'cinema'; cn.vista = [54.0, 6.6, -Math.PI / 2, -1];
    cn.telaCinema = 'boas_vindas'; cn.telaExtras = { texto: 'SESSÃO DE|CINEMA' };
    return cn;
  }

  // ================================================================ 3. TRABALHADORES
  function trabalho() {
    const cn = novoCenario('trabalho'); cn.sombras = true;
    const r = sorteio(5150), G = cn.grupo;
    // cortador de grama: faixas no gramado, longe da fogueira, da mangueira e dos coqueiros
    const faixas = [];
    for (let k = 0; k < 8; k++) { const y = 3.65 + k * 0.5; faixas.push(k % 2 ? [29.0, y] : [24.6, y]); faixas.push(k % 2 ? [24.6, y] : [29.0, y]); }
    const cortador = por(G, 'cortador_grama', 26, 3.65, 0, 0);
    const pc = gente(cn, r, 'homem', 'trabalho', 'trabalho', 24.6, 3.65, 0, null);
    let iF = 1, pausaF = 0;
    pc.cerebro = (p, dt) => {
      if (pausaF > 0) { pausaF -= dt; p.tocar('parado'); return; }
      const alvo = faixas[iF];
      const res = andarAte(p, alvo[0], alvo[1], 0.8, dt);
      if (res === 'andou') p.tocar('cortando_grama', { escala: 1 });
      else if (res === 'chegou') { iF = (iF + 1) % faixas.length; pausaF = iF % 2 ? 0.2 : 1.2; }
      else { p.tocar('parado'); }
    };
    pc.extraAtualizar = p => { const f = 1.31; cortador.position.copy(W3(p.x + Math.cos(p.rumo) * f, p.y + Math.sin(p.rumo) * f, p.z)); cortador.rotation.y = p.rumo + Math.PI / 2; };
    // rastelo perto da mangueira, com o monte de folhas e o carrinho de mão
    por(G, 'monte_folhas', 31.15, 5.9, 0, 0); por(G, 'carrinho_mao', 30.75, 6.75, 0, Math.PI); por(G, 'saco_lixo', 30.0, 6.3, 0, 0.4);
    const spotsR = [[30.9, 4.7, Math.PI / 2], [31.05, 5.2, 2.2], [30.6, 4.4, 1.2]];
    const pr = gente(cn, r, 'homem', 'trabalho', 'trabalho', 30.9, 4.7, Math.PI / 2, passeio(spotsR, { vel: 0.7, pausa: 22, parados: ['rastelando'], parado: 'rastelando' }));
    pr.segurar(aderecoBruto('rastelo'));
    // varrendo o piso entre a piscina e a churrasqueira
    const spotsV = [[36.0, 5.5, Math.PI], [37.6, 5.45, Math.PI], [39.2, 5.5, 0], [40.8, 5.45, 0]];
    const pv = gente(cn, r, 'mulher', 'trabalho', 'trabalho', 36.0, 5.5, Math.PI, passeio(spotsV, { vel: 0.6, pausa: 12, parados: ['varrendo'], parado: 'varrendo' }));
    pv.segurar(aderecoBruto('vassoura'));
    // colhendo goiaba com o cesto
    const pg = gente(cn, r, 'mulher', 'trabalho', 'trabalho', 19.25, 7.45, Math.PI / 2, fixo(['colhendo_alto'], 30), { anim: 'colhendo_alto' });
    pg.noColo(aderecoBruto('cesto_frutas'), pg.notaPos('colhendo_alto', 'cesto_m', 0.22));
    // na escada, colhendo manga
    por(G, 'escada_aluminio', 28.55, 2.75, 0, 0);
    const pe = gente(cn, r, 'homem', 'trabalho', 'trabalho', 28.7, 2.75, 0, fixo(['colhendo_alto'], 30), { z: 0.86, anim: 'colhendo_alto', bloqueia: false });
    pe.noColo(aderecoBruto('cesto_frutas'), pe.notaPos('colhendo_alto', 'cesto_m', 0.22));
    // limpando a piscina
    const spotsP = [[36.6, 4.95, -Math.PI / 2], [38.4, 4.95, -Math.PI / 2], [40.2, 4.95, -Math.PI / 2]];
    const pp = gente(cn, r, 'homem', 'trabalho', 'trabalho', 36.6, 4.95, -Math.PI / 2, passeio(spotsP, { vel: 0.6, pausa: 16, parados: ['limpando_piscina'], parado: 'limpando_piscina' }));
    pp.segurar(aderecoBruto('peneira_piscina'));
    // carregando o cesto entre a goiabeira e o carrinho
    if (estado.qualidade >= 1) {
      const rota = [[19.9, 7.05], [22.4, 7.75], [29.4, 7.75], [30.1, 7.0], [29.4, 7.75], [22.4, 7.75]];
      let iR = 0, espera = 0;
      const pk = gente(cn, r, 'homem', 'trabalho', 'trabalho', 19.9, 7.05, 0, (p, dt) => {
        if (espera > 0) { espera -= dt; p.tocar('parado'); return; }
        const res = andarAte(p, rota[iR][0], rota[iR][1], 1.0, dt);
        if (res === 'andou') p.tocar('carregando_cesto', { escala: 1 });
        else if (res === 'chegou') { iR = (iR + 1) % rota.length; if (iR === 0 || iR === 4) espera = 5; }
        else p.tocar('parado');
      });
      pk.noColo(aderecoBruto('cesto_frutas'), pk.notaPos('carregando_cesto', 'cesto_m', 0.22));
    }
    por(G, 'mangueira_enrolada', 31.6, 7.9, 0, Math.PI); por(G, 'saco_lixo', 1.0, 2.6, 0, 1.0);
    cn.hora = 8.6; cn.proj = null; cn.vista = [22.6, 5.2, 0.15, 0];
    cn.motor = pc;
    return cn;
  }

  // ================================================================ 4. FESTA NA PISCINA E CHURRASCO
  function piscina() {
    const cn = novoCenario('piscina'); cn.sombras = true;
    const r = sorteio(4242), G = cn.grupo, N = -0.07;
    // boias boiando
    const boias = [por(G, 'boia_colchao', 37.2, 2.55, N - 0.05, 0.4), por(G, 'boia_rosquinha', 39.8, 1.95, N - 0.08, 0), por(G, 'boia_flamingo', 35.7, 3.75, N - 0.1, 2.2), por(G, 'bola_praia', 38.7, 3.95, N - 0.2, 0)];
    boias.forEach((b, i) => { b.userData.base = b.position.clone(); b.userData.fase = i * 1.7; });
    // guarda-sóis e espreguiçadeiras no gramado, perto da hidro
    por(G, 'guarda_sol', 28.9, 7.6, 0, 0);
    por(G, 'espreguicadeira', 28.3, 6.7, 0, Math.PI); por(G, 'espreguicadeira', 29.5, 6.7, 0, Math.PI);
    por(G, 'toalha', 29.5, 6.95, 0.38, Math.PI);
    // som
    const cx1 = por(G, 'caixa_som', 44.75, 5.65, 0, Math.PI + 0.4), cx2 = por(G, 'caixa_som', 36.1, 6.66, 1.1, -Math.PI / 2);
    const leds = [...materiaisPorNome(cx1, 'led_som'), ...materiaisPorNome(cx2, 'led_som')];
    // churrasqueira: espetos na grelha, tábua de carne, bebidas no balcão
    for (let k = 0; k < 4; k++) { const e = por(G, k % 2 ? 'espeto_linguica' : 'espeto_carne', 37.6, 9.36 + k * 0.13, 1.1, 0); e.rotation.set(0, 0, -Math.PI / 2); }
    por(G, 'travessa_carne', 36.7, 9.55, 0.905, Math.PI);
    for (const x of [35.9, 36.8, 38.3, 39.5, 40.9]) por(G, r() < 0.5 ? 'lata' : 'copo_drink', x, 6.62 + (r() - 0.5) * 0.3, 1.1, r() * 6);
    por(G, 'cooler', 43.9, 8.4, 0, Math.PI);
    // fumaça da grelha
    const fumaca = criarFumaca(38.0, 9.6, 1.15);
    G.add(fumaca.obj);
    // churrasqueiro
    const pc = gente(cn, r, 'homem', 'regata', 'piscina', 38.0, 8.88, Math.PI / 2, fixo(['grelhando'], 40), { anim: 'grelhando' });
    pc.segurar(aderecoBruto('pegador'));
    // rodas dentro da churrasqueira
    const RODAS = [[36.3, 7.95, 3], [40.15, 7.95, 4], [43.4, 7.85, 3]];
    RODAS.forEach(([cx, cy, n]) => {
      const membros = [];
      for (let i = 0; i < n; i++) {
        const a = i / n * Math.PI * 2 + 0.4, x = cx + Math.cos(a) * 0.68, y = cy + Math.sin(a) * 0.68;
        if (!livre(x, y, 0, 0.2)) continue;
        const t = tipoAdulto(r), p = gente(cn, r, t, escolher(VIS.piscina[t], r), 'piscina', x, y, a + Math.PI, null);
        p.segurar(aderecoBruto(r() < 0.5 ? 'lata' : 'copo_drink')); p.copo = true; membros.push(p);
      }
      cn.rodas.push(roda(membros));
    });
    // no balcão, do lado da piscina
    [36.3, 37.5, 38.7, 39.9].slice(0, qtd(4)).forEach(x => { const t = tipoAdulto(r); const p = gente(cn, r, t, escolher(VIS.piscina[t], r), 'piscina', x, 5.78, Math.PI / 2, fixo(['bebendo', 'conversando', 'ouvindo', 'bebendo'], 6)); p.segurar(aderecoBruto(r() < 0.5 ? 'lata' : 'copo_drink')); p.copo = true; });
    // na água (parte funda: fundo a -1,4)
    [[35.3, 2.0], [36.2, 2.85], [37.9, 1.75], [39.2, 3.25], [40.6, 2.2]].slice(0, qtd(5)).forEach(([x, y], i) => {
      const t = tipoAdulto(r);
      gente(cn, r, t, escolher(['praia', 'praia_2'], r), 'piscina', x, y, r() * 6, fixo(['na_agua'], 20), { z: -1.4, anim: 'na_agua', sombra: false });
    });
    [[36.9, 3.95], [38.3, 2.35]].slice(0, qtd(2)).forEach(([x, y]) => gente(cn, r, tipoAdulto(r), 'praia', 'piscina', x, y, r() * 6, fixo(['nadando_parado'], 20), { z: N - 1.5, anim: 'nadando_parado', sombra: false }));
    // crianças nos degraus da prainha
    [[43.62, 3.72], [43.62, 4.32]].forEach(([x, y]) => gente(cn, r, 'crianca', escolher(VIS.piscina.crianca, r), 'piscina', x, y, Math.PI, fixo(['sentado_chao'], 20), { z: -0.25, anim: 'sentado_chao', sombra: false }));
    // nas espreguiçadeiras da prainha
    [[43.0, 1.63], [43.0, 2.61]].forEach(([x, y]) => gente(cn, r, 'mulher', escolher(['praia', 'praia_2'], r), 'piscina', x, y, Math.PI, fixo(['deitado'], 30), { z: -0.32, anim: 'deitado' }));
    // sentados na borda, com as pernas na água
    [35.0, 35.75, 39.35].slice(0, qtd(3)).forEach(x => gente(cn, r, tipoAdulto(r), escolher(['praia', 'praia_2'], r), 'piscina', x, 4.74, -Math.PI / 2, fixo(['sentado_borda'], 20), { z: 0, anim: 'sentado_borda', bloqueia: false }));
    // na hidro
    [[32.85, 1.95], [33.45, 2.7]].forEach(([x, y]) => gente(cn, r, tipoAdulto(r), 'praia', 'piscina', x, y, x < 33 ? 0.6 : -2.4, fixo(['sentado_chao'], 20), { z: -0.32, anim: 'sentado_chao', sombra: false }));
    // nas espreguiçadeiras do gramado
    [[28.45, 6.7], [29.65, 6.7]].forEach(([x, y]) => gente(cn, r, tipoAdulto(r), 'praia', 'piscina', x, y, Math.PI, fixo(['deitado'], 30), { z: 0.0, anim: 'deitado', bloqueia: false }));
    // dançando perto da caixa de som
    [[44.95, 4.95], [45.35, 5.55], [44.55, 5.95]].slice(0, qtd(3)).forEach(([x, y]) => { const t = tipoAdulto(r); const p = gente(cn, r, t, escolher(VIS.piscina[t], r), 'piscina', x, y, 0, danca(['dancando_2', 'dancando_1'], { olhar: [44.75, 5.65] })); p.desvioOlhar = 0; });
    // deck, olhando o laguinho
    [[46.6, 4.2], [47.4, 5.4]].slice(0, qtd(2)).forEach(([x, y]) => { const t = tipoAdulto(r); const p = gente(cn, r, t, escolher(VIS.piscina[t], r), 'piscina', x, y, 0.1, fixo(['bebendo', 'parado', 'conversando'], 7)); p.segurar(aderecoBruto('copo_drink')); p.copo = true; });
    // crianças correndo no gramado
    const pontosCorre = espalhar(sorteio(9), 14, [17.0, 30.5, 3.5, 7.4], 0.9, null, (x, y) => Math.hypot(x - 20.6, y - 6.2) > 1.9);
    for (let i = 0; i < qtd(3); i++) { const [x, y] = pontosCorre[i]; gente(cn, r, 'crianca', escolher(VIS.piscina.crianca, r), 'piscina', x, y, r() * 6, passeio(pontosCorre, { vel: 2.3, anim: 'correndo', pausa: 1.5, parados: ['parado', 'acenando'] }), { raio: 0.16 }); }
    cn.hora = 13.2; cn.proj = 'piscina'; cn.vista = [44.6, 3.9, Math.PI + 0.05, 0];
    cn.musica = { estilo: 'piscina', pontos: [[44.75, 5.65, 0.4], [36.1, 6.66, 1.3]], volume: 0.55 };
    cn.burburinho = [39.5, 6.8, cn.pessoas.length];
    cn.atualizarExtra = (dt, t, c) => {
      boias.forEach(b => { const u = b.userData, f = u.fase; b.position.set(u.base.x + Math.sin(t * 0.13 + f) * 0.35, u.base.y + Math.sin(t * 1.3 + f) * 0.018, u.base.z + Math.cos(t * 0.11 + f) * 0.3); b.rotation.y += dt * 0.05 * (f % 2 ? 1 : -1); });
      for (const m of leds) m.emissiveIntensity = 0.6 + 1.6 * Math.pow(1 - c.batida, 3);
      fumaca.atualizar(dt, t);
    };
    return cn;
  }

  // ================================================================ 5. RAVE LOTADA (noite)
  function rave() {
    const cn = novoCenario('rave'); cn.sombras = false;
    const r = sorteio(128), G = cn.grupo;
    const PALCO = [29.0, 5.9], DJ = [29.6, 5.9];
    const cab = por(G, 'cabine_dj', PALCO[0], PALCO[1], 0, Math.PI);
    const tre = por(G, 'trelica_luzes', 29.95, 5.9, 0, Math.PI);
    const pan = por(G, 'painel_led', 30.4, 5.9, 0, Math.PI);
    const cxs = [por(G, 'caixa_som_grande', 29.0, 3.4, 0, Math.PI), por(G, 'caixa_som_grande', 29.0, 8.35, 0, Math.PI)];
    const las = [por(G, 'emissor_laser', 29.0, 3.4, 1.9, Math.PI), por(G, 'emissor_laser', 29.0, 8.35, 1.9, Math.PI)];
    por(G, 'maquina_fumaca', 28.4, 4.35, 0, Math.PI - 0.3);
    C.BOX.push([PALCO[0] - 0.4, PALCO[0] + 0.4, PALCO[1] - 1.1, PALCO[1] + 1.1, 0, 1.3], [28.65, 29.35, 3.05, 3.75, 0, 1.9], [28.65, 29.35, 8.0, 8.7, 0, 1.9]);
    cn.sair.push(() => C.BOX.splice(C.BOX.length - 3, 3));
    // tela de LED e luzes da cabine
    const ledCab = materiaisPorNome(cab, 'led_cabine'), lentes = materiaisPorNome(tre, 'lente_movel'), janelas = [].concat(...las.map(l => materiaisPorNome(l, 'abertura_laser')));
    if (projecoes) {
      const mt = projecoes.materialTela(11, 2.4, true);
      pan.traverse(k => { if (k.isMesh && [].concat(k.material).some(m => m.name === 'tela_led')) k.material = mt; });
      projecoes.tela(11, 'equalizador');
      cn.sair.push(() => projecoes.tela(11, null));
      projecoes.projetorPalco({ de: [29.4, 5.9, 3.7], para: [23.0, 5.6, 0.4], raio: 5.2, aspecto: 1.4, anim: 'luz_batida', ganho: 1.1 });
      cn.sair.push(() => projecoes.projetorPalco(null));
    }
    // DJ
    const dj = gente(cn, r, 'homem', 'noite', 'noite', DJ[0], DJ[1], Math.PI, danca(['dj']), { anim: 'dj' });
    // público: mais denso perto do palco, longe da fogueira e das árvores
    const n = qtd(70);
    const pos = espalhar(sorteio(3), n, [19.6, 28.1, 3.35, 7.8], 0.52, (x) => 0.35 + 0.65 * clamp((x - 19.6) / 8.5, 0, 1), (x, y) => Math.hypot(x - 20.6, y - 6.2) > 1.8 && Math.hypot(x - 26.4, y - 8.55) > 0.7 && Math.hypot(x - 23.7, y - 8.95) > 0.7 && Math.hypot(x - 21.2, y - 8.3) > 0.7);
    const DANCAS = ['pulando', 'pulando', 'pulando', 'dancando_3', 'dancando_3', 'dancando_1', 'dancando_2'];
    pos.forEach(([x, y], i) => {
      const t = r() < 0.52 ? 'homem' : 'mulher';
      const p = gente(cn, r, t, escolher(VIS.noite[t], r), 'noite', x, y, Math.atan2(DJ[1] - y, DJ[0] - x), danca(DANCAS, { olhar: DJ, calma: ['dancando_3', 'dancando_1', 'parado'] }), { raio: 0.17 });
      if (r() < 0.16) p.segurar(aderecoBruto('bastao_neon')); else if (r() < 0.2) p.segurar(aderecoBruto('copo_festa'));
    });
    const neons = []; G.traverse(k => { if (k.isMesh) for (const m of [].concat(k.material)) if (m.name === 'neon' && !neons.includes(m)) neons.push(m); });
    // fachos das cabeças móveis e lasers
    const fx = criarLuzesDePalco(tre, las);
    G.add(fx.obj);
    cn.hora = 22.6; cn.proj = 'rave'; cn.vista = [17.0, 5.0, 0.08, 0];   // no fundo da pista, ao lado da fogueira, olhando o palco
    cn.musica = { estilo: 'rave', pontos: [[29.0, 3.4, 1.4], [29.0, 8.35, 1.4]], volume: 0.75, ref: 6 };
    cn.burburinho = [23.5, 5.6, Math.round(n * 0.6)];
    let ultimaEnergia = 0.7;
    const corPalco = new THREE.Color(), PAL_PALCO = [[1, 0.15, 0.55], [0.25, 0.4, 1], [0.15, 0.9, 0.85], [0.75, 0.25, 1]].map(k => new THREE.Color(k[0], k[1], k[2]));
    cn.atualizarExtra = (dt, t, c) => {
      fx.atualizar(dt, t, c);
      const pulso = Math.pow(1 - c.batida, 2.5);
      for (const m of ledCab) m.emissiveIntensity = 1.5 + 3 * pulso;
      for (const m of lentes) m.emissiveIntensity = 4 * c.energia;
      for (const m of janelas) m.emissiveIntensity = c.energia > 0.8 ? 4 : 0.5;
      for (const m of neons) m.emissiveIntensity = 3.5;
      if (projecoes) {
        // a cor do foco no chão acompanha a dos fachos e troca a cada compasso
        const comp = Math.max(0, Math.floor(c.batidas / 4));
        corPalco.copy(PAL_PALCO[comp % PAL_PALCO.length]);
        projecoes.animPalco(c.energia > 0.95 ? 'estrobo_cores' : c.energia < 0.5 ? 'luz_cores' : 'luz_batida', { cor: corPalco });
      }
      if (c.energia > 0.95 && ultimaEnergia <= 0.95) gritaria(23.5, 5.6);
      ultimaEnergia = c.energia;
    };
    return cn;
  }

  // ---------------------------------------------------------------- efeitos
  function texturaFumaca() {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 2, 32, 32, 31);
    gr.addColorStop(0, 'rgba(255,255,255,0.55)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.2)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    const t = new THREE.CanvasTexture(c); return t;
  }
  function criarFumaca(x, y, z) {
    const obj = new THREE.Group(), tex = texturaFumaca(), parts = [];
    for (let i = 0; i < 14; i++) {
      const m = new THREE.SpriteMaterial({ map: tex, color: 0xd8d4cc, transparent: true, depthWrite: false, opacity: 0 });
      const s = new THREE.Sprite(m); obj.add(s); parts.push({ s, t: i / 14 * 4 });
    }
    const base = W3(x, y, z);
    return {
      obj,
      atualizar(dt) {
        for (const p of parts) {
          p.t = (p.t + dt) % 4; const k = p.t / 4;
          p.s.position.set(base.x + Math.sin(p.t * 1.7 + k * 6) * 0.15 * k, base.y + k * 1.6, base.z - k * 0.25);
          const sc = 0.25 + k * 0.9; p.s.scale.set(sc, sc, sc);
          p.s.material.opacity = 0.22 * Math.sin(Math.PI * k);
        }
      },
    };
  }
  function criarLuzesDePalco(trelica, emissores) {
    const obj = new THREE.Group();
    const geoF = new THREE.CylinderGeometry(0.05, 1.1, 15, 28, 1, true); geoF.translate(0, -7.5, 0);
    const matF = () => new THREE.ShaderMaterial({
      uniforms: { uCor: { value: new THREE.Color(1, 1, 1) }, uForca: { value: 1 } },
      vertexShader: 'varying float vT; varying vec3 vN; varying vec3 vV; void main(){ vT = clamp(-position.y / 15.0, 0.0, 1.0); vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
      fragmentShader: 'uniform vec3 uCor; uniform float uForca; varying float vT; varying vec3 vN; varying vec3 vV; void main(){ float b = pow(abs(dot(normalize(vN), normalize(vV))), 1.6); float a = uForca * pow(1.0 - vT, 2.2) * b * b * 0.22; gl_FragColor = vec4(uCor * a, 1.0); }',
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
    });
    const cabecas = [];
    for (let i = 1; i <= 6; i++) {
      const cab = trelica.getObjectByName('cabeca_movel_' + i), inc = trelica.getObjectByName('inclina_' + i);
      if (!cab || !inc) continue;
      const f = new THREE.Mesh(geoF, matF()); f.position.y = -0.12; f.frustumCulled = false; f.renderOrder = 3; inc.add(f);
      cabecas.push({ cab, inc, f, i });
    }
    const lasers = [];
    const geoL = new THREE.BoxGeometry(0.012, 0.012, 24); geoL.translate(0, 0, 12);
    for (const em of emissores) {
      const s = em.getObjectByName('saida') || em;
      const leque = new THREE.Group(); s.add(leque);
      for (let k = 0; k < 9; k++) {
        const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.2, 4.0, 0.4), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
        const l = new THREE.Mesh(geoL, m); l.frustumCulled = false; leque.add(l); lasers.push({ l, k, leque });
      }
    }
    const PAL = [[1, 0.1, 0.6], [0.2, 0.4, 1], [0.1, 1, 0.9], [1, 0.6, 0.1], [0.7, 0.2, 1], [1, 1, 1]].map(c => new THREE.Color(c[0], c[1], c[2]));
    return {
      obj,
      atualizar(dt, t, c) {
        const comp = Math.max(0, Math.floor(c.batidas / 4)), padrao = Math.floor(comp / 8) % 3, e = c.energia;
        for (const h of cabecas) {
          const ph = h.i * 0.9, sw = c.batidas * Math.PI / 8;
          let pan, tilt;
          if (padrao === 0) { pan = Math.sin(sw + ph) * 0.55; tilt = -0.55 - 0.25 * Math.sin(sw * 0.5 + ph); }
          else if (padrao === 1) { pan = (h.i % 2 ? 1 : -1) * (0.2 + 0.4 * Math.sin(sw)); tilt = -0.35 - 0.4 * Math.abs(Math.sin(sw + ph)); }
          else { pan = Math.sin(t * 0.7 + ph) * 0.8; tilt = -0.7 + 0.3 * Math.cos(t * 0.9 + ph); }
          h.cab.rotation.y += (pan - h.cab.rotation.y) * Math.min(1, dt * 4);
          h.inc.rotation.x += (tilt - h.inc.rotation.x) * Math.min(1, dt * 4);
          const corB = PAL[(((comp + (padrao === 1 ? h.i : 0)) % PAL.length) + PAL.length) % PAL.length];
          h.f.material.uniforms.uCor.value.copy(corB);
          const estrobo = e > 0.95 ? (Math.floor(c.batidas * 4 + h.i) % 2 ? 1 : 0.15) : 1;
          h.f.material.uniforms.uForca.value = (0.14 + 0.4 * e) * estrobo;
        }
        const ligados = e > 0.8;
        for (const L of lasers) {
          L.l.visible = ligados;
          if (!ligados) continue;
          const a = (L.k - 4) / 4 * (0.45 + 0.25 * Math.sin(t * 0.6));
          L.l.rotation.set(-0.05 - 0.06 * Math.sin(t * 1.3 + L.k), a + Math.sin(t * 0.8) * 0.3, 0);
          L.l.material.color.setRGB(comp % 2 ? 3.6 : 0.3, comp % 2 ? 0.2 : 4.0, 0.35);
          L.l.material.opacity = 0.9;
        }
      },
    };
  }

  // ---------------------------------------------------------------- sons do cenário (burburinho, motor, gritaria)
  let burb = null, motor = null;
  function ligarBurburinho(x, y, n) {
    const A = som.ctx; if (!A || !som.ruido) return;
    const p = som.painel(x, y, 1.4, 5, 0.9);
    const g = A.createGain(); g.gain.value = clamp(0.02 * Math.sqrt(n), 0.03, 0.16); g.connect(p);
    const fontes = [];
    for (const [f, q] of [[420, 1.2], [900, 1.6], [1700, 2.2], [2600, 3]]) {
      const s = A.createBufferSource(); s.buffer = som.ruido; s.loop = true; s.playbackRate.value = 0.7 + Math.random() * 0.5;
      const b = A.createBiquadFilter(); b.type = 'bandpass'; b.frequency.value = f; b.Q.value = q;
      const am = A.createGain(); am.gain.value = 0.5;
      const lfo = A.createOscillator(), lg = A.createGain(); lfo.frequency.value = 2.5 + Math.random() * 4; lg.gain.value = 0.35; lfo.connect(lg); lg.connect(am.gain);
      s.connect(b); b.connect(am); am.connect(g); s.start(); lfo.start(); fontes.push(s, lfo);
    }
    burb = { g, p, fontes };
  }
  function ligarMotor() {
    const A = som.ctx; if (!A) return;
    const p = som.painel(26, 4, 0.4, 2.2, 1.3);
    const g = A.createGain(); g.gain.value = 0.11; g.connect(p);
    const lp = A.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900; lp.Q.value = 1.5; lp.connect(g);
    const o1 = A.createOscillator(); o1.type = 'sawtooth'; o1.frequency.value = 92;
    const o2 = A.createOscillator(); o2.type = 'square'; o2.frequency.value = 46;
    const g2 = A.createGain(); g2.gain.value = 0.5; o1.connect(lp); o2.connect(g2); g2.connect(lp);
    const lfo = A.createOscillator(), lg = A.createGain(); lfo.frequency.value = 11; lg.gain.value = 6; lfo.connect(lg); lg.connect(o1.frequency);
    const s = A.createBufferSource(); s.buffer = som.ruido; s.loop = true; const hp = A.createBiquadFilter(); hp.type = 'bandpass'; hp.frequency.value = 3000; const gn = A.createGain(); gn.gain.value = 0.25; s.connect(hp); hp.connect(gn); gn.connect(g);
    o1.start(); o2.start(); lfo.start(); s.start();
    motor = { p, g, fontes: [o1, o2, lfo, s] };
  }
  function gritaria(x, y) {
    const A = som.ctx; if (!A || !som.ruido) return;
    const p = som.painel(x, y, 1.6, 6, 0.8), t = A.currentTime;
    for (const f of [700, 1100, 1600]) {
      const s = A.createBufferSource(); s.buffer = som.ruido; const b = A.createBiquadFilter(); b.type = 'bandpass'; b.frequency.value = f; b.Q.value = 2.5;
      const g = A.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.25, t + 0.35); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.4);
      s.connect(b); b.connect(g); g.connect(p); s.start(t, Math.random(), 2.5);
    }
  }
  function pararSons() {
    for (const s of [burb, motor]) if (s) { for (const f of s.fontes) { try { f.stop(); } catch (e) { /* já parado */ } } try { s.g.disconnect(); s.p.disconnect(); } catch (e) { /* já solto */ } }
    burb = motor = null;
    musica.parar();
  }

  // ---------------------------------------------------------------- ativar e desativar
  const MONTAR = { aniversario, cinema: cineminha, trabalho, piscina, rave };
  const NOMES = { aniversario: 'Festa de aniversário', cinema: 'Reunião no cineminha', trabalho: 'Trabalhadores na chácara', piscina: 'Festa na piscina e churrasco', rave: 'Rave lotada' };
  function desativar() {
    if (!atual) return;
    pararSons();
    cena.remove(atual.grupo);
    for (const p of atual.pessoas) { p.descartar(); const i = C.moveis.indexOf(p.mov); if (i >= 0) C.moveis.splice(i, 1); }
    for (const f of atual.sair) f();
    if (atual.telaCinema && cinema && atual.telaOriginal) { cinema.c.tela.material = atual.telaOriginal; if (projecoes) projecoes.tela(11, null); }
    if (projecoes && escolhasAntes) { projecoes.aplicar(escolhasAntes); escolhasAntes = null; }
    atual = null;
    marcarMenu();
  }
  async function ativar(id) {
    if (ativando) return;
    if (!id || (atual && atual.id === id)) { desativar(); aviso('Cenários desligados.'); return; }
    ativando = true;
    try {
      desativar();
      $('cenInfo').textContent = 'Carregando as pessoas e os objetos…';
      await recursos(v => { $('cenInfo').textContent = 'Carregando as pessoas e os objetos… ' + Math.round(v * 100) + '%'; });
      const cn = MONTAR[id]();
      $('cenInfo').textContent = 'Preparando o cenário…';
      await prepararProgramas(cn.grupo);
      cena.add(cn.grupo);
      atual = cn;
      if (cn.hora !== undefined) mudarHora(cn.hora);
      if (projecoes) { escolhasAntes = projecoes.escolhas; if (cn.proj) projecoes.aplicar(cn.proj); }
      som.iniciar();
      if (cn.musica) musica.tocar(cn.musica.estilo, cn.musica.pontos, cn.musica.volume);
      if (cn.burburinho) ligarBurburinho(...cn.burburinho);
      if (cn.motor) ligarMotor();
      if (cn.telaCinema && cinema && cinema.c.modo === 'parada' && projecoes) {
        cn.telaOriginal = cinema.c.tela.material;
        cinema.c.tela.material = projecoes.materialTela(11, 1.5, false);
        projecoes.tela(11, cn.telaCinema, cn.telaExtras);
      }
      if (cn.vista && irPara) irPara(cn.vista);
      marcarMenu();
      aviso(NOMES[id] + (cn.telaCinema ? '. Para passar um filme, escolha um vídeo em "Cineminha".' : '.'), 4500);
    } catch (e) {
      console.error(e); aviso('O cenário não carregou. Tente de novo.');
    }
    ativando = false;
  }
  function marcarMenu() {
    document.querySelectorAll('[data-cen]').forEach(b => b.setAttribute('aria-pressed', String(!!atual && b.dataset.cen === atual.id)));
    const pb = $('parabensBtn'); if (pb) pb.hidden = !(atual && atual.id === 'aniversario');
    if ($('cenInfo')) $('cenInfo').textContent = atual ? NOMES[atual.id] + ': ' + atual.pessoas.length + ' pessoas.' : 'Escolha um cenário para encher a chácara de gente.';
  }
  document.querySelectorAll('[data-cen]').forEach(b => b.addEventListener('click', () => ativar(b.dataset.cen)));
  if ($('cenNada')) $('cenNada').addEventListener('click', () => ativar(null));
  if ($('parabensBtn')) $('parabensBtn').addEventListener('click', () => { if (atual && atual.parabens) atual.parabens(); });

  // ---------------------------------------------------------------- a cada quadro
  const ctxQ = { batida: 0, batidas: 0, compasso: 0, energia: 0.7 };
  function atualizar(dt, t, camPos) {
    if (!atual) return null;
    const f = musica.fase();
    ctxQ.batida = f.batida; ctxQ.batidas = f.n + f.batida; ctxQ.compasso = Math.floor(ctxQ.batidas / 4); ctxQ.energia = f.energia;
    for (const r of atual.rodas) r.atualizar(dt);
    for (const p of atual.pessoas) {
      if (p.cerebro) p.cerebro(p, dt, ctxQ);
      const d = difAng(p.rumoAlvo, p.rumo); p.rumo += d * Math.min(1, dt * 5);
      p.aplicar();
      if (p.extraAtualizar) p.extraAtualizar(p);
      // quem está longe atualiza a animação com menos frequência
      const longe = camPos && camPos.distanceTo(p.obj.position) > 26;
      p.acum = (p.acum || 0) + dt;
      if (!longe || p.acum > 0.06) { p.mixer.update(p.acum); p.acum = 0; }
    }
    if (atual.atualizarExtra) atual.atualizarExtra(dt, t, ctxQ);
    if (motor && atual.motor) { const m = atual.motor, v = W3(m.x, m.y, m.z + 0.4); const pp = motor.p; if (pp.positionX) { pp.positionX.value = v.x; pp.positionY.value = v.y; pp.positionZ.value = v.z; } }
    return ctxQ;
  }
  // pisadas na grama (as pessoas perto de quem anda amassam a grama)
  function pisadas(camPos, max) {
    if (!atual) return [];
    const l = [];
    for (const p of atual.pessoas) {
      if (p.z < -0.05 || p.z > 0.2) continue;
      const v = p.obj.position; if (camPos && Math.abs(v.x - camPos.x) + Math.abs(v.z - camPos.z) > 18) continue;
      l.push([v.x, v.z, 0.32, 0.8]); if (l.length >= (max || 30)) break;
    }
    return l;
  }
  marcarMenu();
  return { ativar, desativar, atualizar, pisadas, get atual() { return atual; }, musica };
}
