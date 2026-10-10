import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Pack, unpackBase64Gzip } from './pack.js';
import { avatarTemplate, instantiateAvatar, loadTexture, texOpts } from './avatar.js';
import { buildWorld, ROOMS, B, H } from './world.js';
import { Nav } from './nav.js';
import { Sim } from './agents.js';
import { DEFAULT_CONFIG } from './config.js';
import { Post } from './post.js';
import { dayState, realHour, PRESETS, PRESET_LABELS } from './daylight.js';
import { Ambience } from './audio.js';
import * as T from './tex.js';

const $ = (s) => document.querySelector(s);
const config = Object.assign({}, DEFAULT_CONFIG, window.OFFICE_CONFIG || {});
const qs = new URLSearchParams(location.search);
const store = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
const setLoad = (p, msg) => { const b = $('#load-bar'); if (b) b.style.width = Math.round(p * 100) + '%'; const m = $('#load-msg'); if (m && msg) m.textContent = msg; };
const TOUCH = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;

async function loadPack() {
  if (window.OFFICE_ASSETS_B64) { const p = await unpackBase64Gzip(window.OFFICE_ASSETS_B64); window.OFFICE_ASSETS_B64 = null; return p; }
  const url = window.OFFICE_ASSETS_URL || qs.get('pack') || '../build/assets.bin'; const gz = /\.(gz|pack)(\?|$)/.test(url);
  const r = await fetch(url); if (!r.ok) throw new Error('não consegui baixar os modelos (' + r.status + ')');
  const total = +r.headers.get('content-length') || window.OFFICE_ASSETS_SIZE || 0; let bytes;
  if (r.body && total) { const rd = r.body.getReader(); const parts = []; let got = 0; for (;;) { const { done, value } = await rd.read(); if (done) break; parts.push(value); got += value.length; setLoad(0.03 + 0.17 * Math.min(1, got / total), `Baixando os modelos… ${(got / 1048576).toFixed(1)} de ${(total / 1048576).toFixed(1)} MB`); } bytes = new Blob(parts); }
  else bytes = await r.blob();
  const ab = gz ? await new Response(bytes.stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer() : await bytes.arrayBuffer();
  return new Pack(ab);
}

async function start() {
  setLoad(0.03, 'Abrindo os arquivos…');
  const pack = await loadPack();
  setLoad(0.22, 'Montando o escritório…');
  if (TOUCH) document.body.classList.add('touch');
  const canvas = $('#scene');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', preserveDrawingBuffer: qs.has('shot') });
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.02;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.localClippingEnabled = true;

  const scene = new THREE.Scene();
  const bgC = T.canvas(4, 256), bgTex = T.toTex(bgC); scene.background = bgTex;
  const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.42;
  const hemi = new THREE.HemisphereLight(0xffffff, 0xcfc8bd, 1.0); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff1dc, 3.1); sun.target.position.set(0, 0, 0); scene.add(sun, sun.target);
  sun.castShadow = true; const sc = sun.shadow.camera; sc.left = -27; sc.right = 27; sc.top = 27; sc.bottom = -27; sc.near = 4; sc.far = 110; sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.035; sun.shadow.radius = 2.5;
  const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.08, 500);

  // textures
  const tex = { logo: await loadTexture(pack, 'img/logo.webp'), dollar: await loadTexture(pack, 'img/dollar.webp'), wood: await loadTexture(pack, 'img/wood.webp') };
  { const img = tex.logo.image; const c = T.canvas(img.width, img.height), g = c.getContext('2d'); g.drawImage(img, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); tex.logoWhite = T.toTex(c); tex.logoWhite.flipY = false; }
  tex.logo.wrapS = tex.logo.wrapT = THREE.ClampToEdgeWrapping; tex.dollar.wrapS = tex.dollar.wrapT = THREE.ClampToEdgeWrapping;

  const world = buildWorld({ scene, tex, config });
  const nav = new Nav({ x1: B.x1, x2: B.x2, z1: B.z1, z2: B.z2 }, world.obstacles);
  for (const s of world.chairs) { const f = new THREE.Vector3(Math.sin(s.yaw), 0, Math.cos(s.yaw)); for (let i = 0; i <= 4; i++) { const k = 0.12 - (s.rollBack + 0.08) * i / 4; nav.blockCircle(s.pos.x + f.x * k, s.pos.z + f.z * k, 0.3); } }
  const sim = new Sim({ world, nav, pack, config });

  // avatars (phones and low-memory devices get half-size skins)
  if (TOUCH || (navigator.deviceMemory && navigator.deviceMemory <= 4) || qs.has('lite')) texOpts.max = 1024;
  const people = config.people; let n = 0;
  for (const def of people) {
    setLoad(0.26 + 0.7 * (n++ / people.length), `Chamando a equipe… ${def.name}`);
    def.gender = /Female/.test(def.avatar) ? 'f' : 'm';
    const av = instantiateAvatar(await avatarTemplate(pack, def.avatar)); scene.add(av.rig); av.mesh.receiveShadow = false;
    const a = sim.add(def, av);
    const proxy = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.33, 1.8, 8), new THREE.MeshBasicMaterial({ visible: false })); proxy.userData.agent = a; a.proxy = proxy; scene.add(proxy);
    await new Promise(r => setTimeout(r, 0));
  }
  // a little head start so the office is already alive on the first frame
  { const th = sim.byId.get('thiago'), he = sim.byId.get('hermes'); he.nextPlan = 0; sim.visit(he, th, { dur: 22, topic: 'Alinhando prioridades com o Presidente' }); const p = th.home.visitor[0]; he.state = 'idle'; he.seat = null; he.pos.set(p[0], 0, p[1] + 0.9); he.yaw = Math.PI; he.play('idle', { fade: 0 }); he.home.rolled = 1; he.home.free = true; world.placeChair(he.home); he.yOff = 0;
    sim.agents.forEach((a, i) => { if (a !== th && a !== he) a.nextPlan = 3 + i * 3.1 + Math.random() * 4; }); th.nextPlan = 45; }

  const ring = new THREE.Mesh(new THREE.RingGeometry(0.42, 0.5, 40), new THREE.MeshBasicMaterial({ color: 0xed3237, transparent: true, opacity: 0.9, depthWrite: false })); ring.rotation.x = -Math.PI / 2; ring.visible = false; ring.renderOrder = 5; scene.add(ring);

  // ------------------------------------------------------------------ state
  const orbit = new OrbitControls(camera, canvas); orbit.enableDamping = true; orbit.dampingFactor = 0.08; orbit.minDistance = 4; orbit.maxDistance = 85; orbit.maxPolarAngle = 1.42; orbit.screenSpacePanning = false; orbit.zoomSpeed = 0.9; orbit.rotateSpeed = 0.55;
  const HOME0 = { pos: new THREE.Vector3(-7.2, 23.5, 25.5), target: new THREE.Vector3(-0.9, 0, -0.5) }; const HOME = { pos: HOME0.pos.clone(), target: HOME0.target.clone(), k: 1 };
  // on tall screens (phones held upright) the starting camera steps back so more of the office fits
  const fitHome = () => { const a = window.innerWidth / Math.max(1, window.innerHeight); HOME.k = THREE.MathUtils.clamp(1.45 / a, 1, 2.1); HOME.pos.copy(HOME0.pos).sub(HOME0.target).multiplyScalar(HOME.k).add(HOME0.target); }; fitHome();
  const MAQ = { target: new THREE.Vector3(0, 0, 0), dir: new THREE.Vector3(-0.42, 0.72, 0.78).normalize(), dist: 150 };
  const st = { mode: 'overview', selected: null, follow: null, intro: null, tourT: 0, keys: {}, yaw: -Math.PI / 2, pitch: 0, fpPos: new THREE.Vector3(16.2, 1.68, 0), locked: false, labels: true, time: 0, flight: null, joy: { x: 0, y: 0 }, cam: 0, camT: 0, camAuto: true, cine: null, quality: null, save: {} };
  camera.position.copy(HOME.pos); orbit.target.copy(HOME.target); orbit.update();

  // ------------------------------------------------------------------ quality & post-processing
  let post = null;
  function setQuality(q, save = true) {
    st.quality = q; if (save) store.set('office3d.q', q); const high = q === 'high', lite = !high && st.lite;
    renderer.setPixelRatio(+qs.get('pr') || Math.min(window.devicePixelRatio || 1, high ? 2 : lite ? 1 : 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    const size = high ? 4096 : lite ? 1024 : 2048; if (sun.shadow.mapSize.x !== size) { sun.shadow.mapSize.set(size, size); if (sun.shadow.map) { sun.shadow.map.dispose(); sun.shadow.map = null; } }
    if (high && !post) { try { post = new Post(renderer, { msaa: 4, ao: true }); } catch (e) { console.warn('pós-processamento indisponível', e); post = null; } }
    if (post) { const v = renderer.getDrawingBufferSize(new THREE.Vector2()); post.setSize(v.x, v.y); }
    st.post = high && !!post; sim.detail = !lite;
    world.lamps.forEach((l, i) => { l.visible = high || (!lite && i % 3 === 0); });
    const ql = $('#quality-label'); if (ql) ql.textContent = high ? 'Alta' : 'Leve'; if (day.shown > -90) applyDay(true);
  }
  // if the machine can't keep up, step the quality down by itself (once per level) instead of leaving a slideshow on screen
  const perf = { t: 0, n: 0, acc: 0, done: qs.has('shot') };
  st.perfOff = () => { perf.done = true; };
  function watchPerf(dtIn) {
    if (perf.done || dtIn > 0.5 || document.visibilityState !== 'visible') return; perf.t += dtIn; if (perf.t < 4) return; perf.acc += dtIn; if (++perf.n < 90) return;
    const avg = perf.acc / perf.n; perf.t = 1.5; perf.n = 0; perf.acc = 0;
    if (avg > 1 / 27 && st.quality === 'high') { setQuality('low'); ui.toast('Ajustei para a qualidade leve para ficar fluido neste aparelho. Para voltar: ⋯ → Qualidade gráfica.'); }
    else if (avg > 1 / 22 && st.quality === 'low' && !st.lite) { st.lite = true; setQuality('low'); perf.done = true; }
    else perf.done = true;
  }

  // ------------------------------------------------------------------ time of day
  const day = { preset: store.get('office3d.time') || 'auto', hour: 0, shown: -99, s: {}, exposure: 1 }; if (!(day.preset in PRESETS)) day.preset = 'auto';
  if (qs.get('hora')) day.preset = qs.get('hora') in PRESETS ? qs.get('hora') : 'auto';
  const targetHour = () => day.preset === 'auto' ? realHour() : PRESETS[day.preset]; day.hour = targetHour();
  function applyDay(force) {
    if (!force && Math.abs(day.hour - day.shown) < 0.004) return; day.shown = day.hour; const s = dayState(day.hour, day.s);
    sun.position.copy(s.dir).multiplyScalar(50); sun.color.copy(s.sun); sun.intensity = s.si; hemi.color.copy(s.sky); hemi.groundColor.copy(s.gnd); hemi.intensity = s.hi * (st.quality === 'low' ? 1 + 0.22 * Math.min(1, s.lamp) : 1); scene.environmentIntensity = s.env;
    for (const l of world.lamps) l.intensity = l.userData.base * s.lamp;
    const g = bgC.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#' + s.top.getHexString()); gr.addColorStop(0.62, '#' + s.bot.getHexString()); gr.addColorStop(1, '#' + s.bot.clone().multiplyScalar(0.9).getHexString()); g.fillStyle = gr; g.fillRect(0, 0, 4, 256); bgTex.needsUpdate = true;
    world.setSky(s.pan); world.groundMat.color.setHex(0xd9dde0).multiplyScalar(s.gt); day.exposure = s.exp; renderer.toneMappingExposure = 1.02 * s.exp;
    document.body.dataset.day = s.night ? 'night' : 'day';
    const chip = $('#day-chip'); if (chip) { const h = day.hour; chip.textContent = s.night ? 'noite' : h < 12 ? 'manhã' : h < 17 ? 'tarde' : 'pôr do sol'; }
  }
  function setTime(p) { if (!(p in PRESETS)) return; day.preset = p; store.set('office3d.time', p); document.querySelectorAll('[data-time]').forEach(b => b.classList.toggle('on', b.dataset.time === p)); $('#time-label').textContent = PRESET_LABELS[p]; }

  // ------------------------------------------------------------------ cameras
  const flyTo = (pos, target, dur = 1.4) => { st.flight = { p0: camera.position.clone(), t0: orbit.target.clone(), p1: pos.clone(), t1: target.clone(), t: 0, dur }; };
  const TOUR = [
    [[19.5, 1.7, 0.2], [10, 1.5, -1.2], 5], [[14.2, 1.7, -1.6], [14.3, 1.6, -8.5], 5], [[9.5, 1.75, 0], [0, 1.4, -0.6], 5], [[4.2, 1.7, -0.2], [6.5, 1.2, -5.5], 5],
    [[0.9, 1.7, -0.6], [-2.5, 1.2, -6.5], 6], [[-1.4, 1.7, 0.4], [-0.5, 1.2, 5.5], 5], [[5.8, 1.7, 0.6], [7.6, 1.1, 5.2], 5], [[-6.4, 1.7, 0.5], [-8.4, 1.1, 5.2], 5],
    [[-12.2, 1.7, 0.6], [-13.5, 1.3, 5], 5], [[-10.2, 1.7, -0.2], [-12.0, 1.5, -5.5], 5], [[-10.4, 1.72, -3.0], [-12.8, 1.75, -8.5], 7], [[-11.9, 1.7, -4.6], [-9.12, 1.62, -8.5], 6],
    [[-14.6, 1.7, -5.4], [-12.6, 1.5, -7.0], 6], [[-10.0, 1.8, -1.0], [-4, 1.4, 0], 4],
  ];
  const tourDur = TOUR.reduce((s, k) => s + k[2], 0);
  const cr = (a, b, c, d, t) => 0.5 * ((2 * b) + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t);
  const tourAt = (time, out, look) => { let t = ((time % tourDur) + tourDur) % tourDur, i = 0; while (t > TOUR[i][2]) { t -= TOUR[i][2]; i++; } const u = t / TOUR[i][2], n = TOUR.length, k = (j) => TOUR[(i + j + n) % n]; const e = u * u * (3 - 2 * u) * 0.6 + u * 0.4; for (let a = 0; a < 3; a++) { out.setComponent(a, cr(k(-1)[0][a], k(0)[0][a], k(1)[0][a], k(2)[0][a], e)); look.setComponent(a, cr(k(-1)[1][a], k(0)[1][a], k(1)[1][a], k(2)[1][a], e)); } };
  const CAMS = [
    ['RECEPÇÃO', [17.55, 2.62, -8.05], [13.4, 0.9, -4.4]], ['PRESIDÊNCIA', [-8.45, 2.62, -1.95], [-13.4, 0.8, -6.6]], ['VENDAS & ATENDIMENTO', [2.55, 2.62, -1.95], [-3.4, 0.7, -5.6]], ['SALA DE REUNIÃO', [9.55, 2.62, -1.95], [6.2, 0.7, -5.5]],
    ['CORREDOR', [17.4, 2.62, 1.15], [0, 0.6, -0.1]], ['OPERAÇÕES', [-17.55, 2.62, 8.05], [-13.2, 0.8, 4.6]], ['INTELIGÊNCIA DE MERCADO', [-10.55, 2.62, 8.05], [-7.6, 0.7, 4.4]], ['ESTÚDIO CRIATIVO', [-4.55, 2.62, 8.05], [-0.8, 0.7, 4.9]],
    ['TI & SERVIDORES', [2.45, 2.62, 8.05], [6.2, 0.8, 4.6]], ['FINANCEIRO', [9.45, 2.62, 8.05], [11.9, 0.7, 4.8]], ['COPA', [14.45, 2.62, 8.05], [16.4, 0.8, 4.6]],
  ];
  const HINTS = { overview: TOUCH ? 'Arraste para girar · pinça aproxima · dois dedos movem · toque numa pessoa ou numa tela' : 'Arraste para girar · roda do mouse aproxima · botão direito move · clique numa pessoa ou numa tela', fpv: TOUCH ? 'Use o controle à esquerda para andar · arraste a tela para olhar' : 'Clique na cena para olhar com o mouse · W A S D para andar · Shift corre · Esc solta o mouse', tour: 'Tour automático pelo escritório · escolha outra visão para sair', maquete: TOUCH ? 'Maquete: arraste para girar · pinça aproxima' : 'Maquete: arraste para girar · roda do mouse aproxima', cine: TOUCH ? 'Acompanhando a reunião geral · toque para voltar' : 'Acompanhando a reunião geral · clique para voltar', follow: '' };

  function applyOffset() { const w = window.innerWidth, h = window.innerHeight; const off = (st.mode === 'overview' || st.mode === 'maquete') && w > 1100 && !document.body.classList.contains('team-off') ? Math.round(Math.min(160, w * 0.1)) : 0; if (off) camera.setViewOffset(w, h, -off, 0, w, h); else camera.clearViewOffset(); }
  st.applyOffset = applyOffset;
  function setMode(m, opt = {}) {
    if (m === st.mode && !opt.force) return; const prev = st.mode;
    if (prev === 'overview' || prev === 'maquete') st.save[prev] = { pos: camera.position.clone(), target: orbit.target.clone() };
    st.mode = m; st.flight = null; st.intro = null; if (m !== 'cine') st.cine = null;
    document.body.dataset.mode = m; document.querySelectorAll('[data-mode-btn]').forEach(b => b.classList.toggle('on', b.dataset.modeBtn === m));
    if (m !== 'fpv' && document.pointerLockElement) document.exitPointerLock();
    orbit.enabled = m === 'overview' || m === 'maquete';
    if (m === 'overview') { const s = st.save.overview || HOME; camera.fov = 38; orbit.minDistance = 4; orbit.maxDistance = 85 * HOME.k; if (prev !== 'overview' || opt.home) { camera.position.copy(opt.home ? HOME.pos : s.pos); orbit.target.copy(opt.home ? HOME.target : s.target); } }
    if (m === 'maquete') { const s = st.save.maquete; camera.fov = 12.5; orbit.minDistance = 70; orbit.maxDistance = 300; orbit.target.copy(s ? s.target : MAQ.target); camera.position.copy(s ? s.pos : MAQ.target.clone().addScaledVector(MAQ.dir, MAQ.dist)); }
    if (m === 'fpv') { camera.fov = 68; if (prev === 'follow' && st.follow) st.fpPos.set(st.follow.pos.x, 1.68, st.follow.pos.z + 1.2); st.pitch = 0; }
    if (m === 'tour') { camera.fov = 62; st.tourT = opt.at || 0; }
    if (m === 'cctv') { camera.fov = 78; st.camT = 0; if (opt.cam !== undefined) st.cam = opt.cam; }
    if (m === 'cine') { camera.fov = 42; }
    if (m === 'follow') { camera.fov = 55; st.follow = opt.agent || st.selected || sim.byId.get('thiago'); st.followYaw = undefined; hint(`Seguindo ${st.follow.def.name} · escolha outra visão para sair`); }
    if (HINTS[m]) hint(HINTS[m]); else if (m !== 'follow') { const h = $('#hint'); if (h) h.classList.remove('show'); }
    applyOffset(); camera.updateProjectionMatrix(); if (m === 'overview' || m === 'maquete') orbit.update();
  }
  let hintTimer = 0; const hint = (text) => { const h = $('#hint'); if (!h) return; h.textContent = text; h.classList.add('show'); clearTimeout(hintTimer); hintTimer = setTimeout(() => h.classList.remove('show'), 8000); };

  // first person controls
  canvas.addEventListener('click', () => { if (st.mode === 'fpv' && !st.locked && !TOUCH && canvas.requestPointerLock) { try { const r = canvas.requestPointerLock(); if (r && r.catch) r.catch(() => {}); } catch (e) {} } });
  document.addEventListener('pointerlockchange', () => { st.locked = document.pointerLockElement === canvas; document.body.classList.toggle('locked', st.locked); });
  let drag = null;
  canvas.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY, moved: 0 }; if (st.mode === 'cine') { setMode('overview', { home: true }); } });
  window.addEventListener('pointermove', (e) => {
    if (st.mode === 'fpv') { let dx = 0, dy = 0; if (st.locked) { dx = e.movementX; dy = e.movementY; } else if (drag && (e.buttons || e.pointerType === 'touch')) { dx = -(e.clientX - drag.x) * 1.4; dy = -(e.clientY - drag.y) * 1.4; drag.moved += Math.abs(dx) + Math.abs(dy); drag.x = e.clientX; drag.y = e.clientY; } st.yaw -= dx * 0.0022; st.pitch = THREE.MathUtils.clamp(st.pitch - dy * 0.0022, -1.2, 1.2); }
    else if (drag && e.buttons) drag.moved += Math.abs(e.movementX) + Math.abs(e.movementY);
  });
  window.addEventListener('keydown', (e) => {
    if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return; st.keys[e.code] = true;
    const m = { Digit1: 'overview', Digit2: 'fpv', Digit3: 'tour', Digit4: 'cctv', Digit5: 'maquete' }[e.code]; if (m) setMode(m);
    if (e.code === 'KeyR') ui.meeting(); if (e.code === 'KeyL') ui.toggleLabels(); if (e.code === 'KeyM') ui.toggleSound(); if (e.code === 'Digit0') { setMode('overview', { force: true, home: true }); }
    if (st.mode === 'cctv') { if (e.code === 'ArrowRight') ui.cam(1); if (e.code === 'ArrowLeft') ui.cam(-1); }
    if (e.code === 'Escape') { $('#pip').classList.remove('show'); closePops(); }
    if (e.code === 'Space' && st.mode === 'fpv') e.preventDefault();
  });
  window.addEventListener('keyup', (e) => { st.keys[e.code] = false; });
  window.addEventListener('blur', () => { st.keys = {}; });
  { const stick = $('#stick'), knob = stick.querySelector('i'); let id = null; const set = (e) => { const r = stick.getBoundingClientRect(); let x = (e.clientX - r.left - r.width / 2) / (r.width / 2), y = (e.clientY - r.top - r.height / 2) / (r.height / 2); const l = Math.hypot(x, y); if (l > 1) { x /= l; y /= l; } st.joy.x = x; st.joy.y = y; knob.style.transform = `translate(${x * 32}px,${y * 32}px)`; };
    stick.addEventListener('pointerdown', (e) => { id = e.pointerId; stick.setPointerCapture(id); set(e); e.preventDefault(); }); stick.addEventListener('pointermove', (e) => { if (e.pointerId === id) set(e); }); const end = (e) => { if (e.pointerId !== id) return; id = null; st.joy.x = st.joy.y = 0; knob.style.transform = ''; }; stick.addEventListener('pointerup', end); stick.addEventListener('pointercancel', end); }
  function moveFP(dt) {
    const k = st.keys; let f = (k.KeyW || k.ArrowUp ? 1 : 0) - (k.KeyS || k.ArrowDown ? 1 : 0) - st.joy.y, s = (k.KeyD || k.ArrowRight ? 1 : 0) - (k.KeyA || k.ArrowLeft ? 1 : 0) + st.joy.x;
    if (k.KeyQ) st.yaw += dt * 1.8; if (k.KeyE) st.yaw -= dt * 1.8;
    const mag = Math.hypot(f, s);
    if (mag > 0.05) { const sp = (k.ShiftLeft || k.ShiftRight ? 5.2 : 2.6) * dt * Math.min(1, mag) / mag; const sx = Math.sin(st.yaw), cz = Math.cos(st.yaw); const nx = st.fpPos.x + (sx * f - cz * s) * sp, nz = st.fpPos.z + (cz * f + sx * s) * sp; const R = 0.3;
      const hit = (x, z) => { if (x < B.x1 - 14 || x > B.x2 + 14 || z < B.z1 - 12 || z > B.z2 + 12) return true; for (const o of world.obstacles) { if (o.h < 0.5) continue; if (x > o.x1 - R && x < o.x2 + R && z > o.z1 - R && z < o.z2 + R) return true; } return false; };
      if (!hit(nx, st.fpPos.z)) st.fpPos.x = nx; if (!hit(st.fpPos.x, nz)) st.fpPos.z = nz; }
    camera.position.copy(st.fpPos); camera.rotation.set(st.pitch, st.yaw + Math.PI, 0, 'YXZ');
  }

  // ------------------------------------------------------------------ picking (people and screens)
  const ray = new THREE.Raycaster(); const ndc = new THREE.Vector2();
  const pickAt = (cx, cy) => { if (st.mode === 'fpv' && st.locked) ndc.set(0, 0); else ndc.set((cx / window.innerWidth) * 2 - 1, -(cy / window.innerHeight) * 2 + 1); ray.setFromCamera(ndc, camera);
    const ha = ray.intersectObjects(sim.agents.map(a => a.proxy), false)[0]; const hs = ray.intersectObjects(world.screens.map(s => s.mesh), false)[0];
    if (ha && (!hs || ha.distance <= hs.distance + 0.4)) return { agent: ha.object.userData.agent }; if (hs && hs.face && hs.face.normal.clone().transformDirection(hs.object.matrixWorld).dot(ray.ray.direction) < 0) return { screen: hs.object.userData.screenInfo }; return null; };
  canvas.addEventListener('pointerup', (e) => { if (!drag || drag.moved > 6) { drag = null; return; } drag = null; if (st.mode === 'cctv' || st.mode === 'tour' || st.mode === 'cine') return; const h = pickAt(e.clientX, e.clientY); if (h && h.agent) ui.select(h.agent); else if (h && h.screen) ui.pip(h.screen); else if (st.mode === 'overview' || st.mode === 'maquete') ui.select(null); });

  // ------------------------------------------------------------------ UI
  const audio = new Ambience();
  const closePops = () => document.querySelectorAll('.pop').forEach(p => p.classList.remove('show'));
  const ui = buildUI({ sim, st, config, setMode, flyTo, camera, orbit, HOME, world, audio, setTime, setQuality, closePops, CAMS, day });
  sim.onStatus = (a) => ui.status(a);
  sim.onSay = (a, icon, text) => ui.say(a, text);

  // labels
  const labelLayer = $('#labels'); const tmp = new THREE.Vector3();
  for (const a of sim.agents) { const el = document.createElement('button'); el.className = 'tag'; el.style.setProperty('--c', a.def.color); el.innerHTML = '<i></i><b></b><span></span><div class="say"></div>'; el.querySelector('b').textContent = a.def.kind === 'president' ? `${a.def.name} · ${a.def.role}` : a.def.name; if (a.def.kind === 'president') el.classList.add('boss'); el.addEventListener('click', () => ui.select(a)); labelLayer.appendChild(el); a.tag = el; a.tagIcon = el.querySelector('span'); a.tagSay = el.querySelector('.say'); }
  const roomTags = Object.entries(ROOMS).map(([id, r]) => { const el = document.createElement('div'); el.className = 'room'; el.innerHTML = `<i style="background:#${r.accent.toString(16).padStart(6, '0')}"></i>${r.name}`; labelLayer.appendChild(el); return { el, pos: new THREE.Vector3((r.x1 + r.x2) / 2, 0.02, r.z1 < 0 ? r.z2 - 0.35 : r.z2 - 0.45) }; });
  const solid = world.obstacles.filter(o => o.wall && !o.glass && o.h > 2.2);
  function walled(a, b) { const dx = b.x - a.x, dz = b.z - a.z; for (const o of solid) { let t0 = 0, t1 = 1; let ok = true; for (const [p, d, lo, hi] of [[a.x, dx, o.x1, o.x2], [a.z, dz, o.z1, o.z2]]) { if (Math.abs(d) < 1e-9) { if (p < lo || p > hi) { ok = false; break; } } else { let u0 = (lo - p) / d, u1 = (hi - p) / d; if (u0 > u1) [u0, u1] = [u1, u0]; t0 = Math.max(t0, u0); t1 = Math.min(t1, u1); if (t0 > t1) { ok = false; break; } } } if (ok) return true; } return false; }
  function updateLabels(now) {
    const w = window.innerWidth, h = window.innerHeight; const inside = camera.position.y < H + 0.3; const show = st.labels && st.mode !== 'cctv';
    for (const a of sim.agents) {
      tmp.copy(a.headPos); tmp.y += 0.3; const d = tmp.distanceTo(camera.position); tmp.project(camera); const vis = show && tmp.z < 1 && tmp.z > -1 && Math.abs(tmp.x) < 1.05 && Math.abs(tmp.y) < 1.05 && (!inside || d < 16) && d > 0.9; const el = a.tag;
      if (!vis) { if (el.style.display !== 'none') el.style.display = 'none'; continue; }
      el.style.display = ''; el.style.transform = `translate(-50%,-100%) translate(${((tmp.x * 0.5 + 0.5) * w).toFixed(1)}px,${((-tmp.y * 0.5 + 0.5) * h).toFixed(1)}px)`; el.style.zIndex = String(100000 - Math.round(d * 100));
      const far = !inside && d > (st.mode === 'maquete' ? 190 : 46); el.classList.toggle('sel', st.selected === a); el.classList.toggle('far', far); el.classList.toggle('dim', inside && walled(camera.position, a.headPos)); el.classList.toggle('busy', a.state !== 'seated' || a.busy || !!a.conv);
      if (a.tagIcon.textContent !== a.status.icon) a.tagIcon.textContent = a.status.icon;
      const bb = a.bubble; if (bb) { const k = Math.min(bb.text.length, Math.floor((now - bb.t0) * 42)); if (k !== bb.k) { bb.k = k; a.tagSay.textContent = bb.text.slice(0, k); a.tagSay.classList.add('on'); a.tagSay.classList.toggle('done', k >= bb.text.length); } if (now > bb.t0 + bb.dur || far) { a.tagSay.classList.remove('on'); a.bubble = null; } }
    }
    for (const r of roomTags) { tmp.copy(r.pos).project(camera); const vis = show && !inside && st.mode !== 'maquete' && tmp.z < 1 && Math.abs(tmp.x) < 1 && Math.abs(tmp.y) < 1 && camera.position.distanceTo(r.pos) < 75; if (!vis) { if (r.el.style.display !== 'none') r.el.style.display = 'none'; continue; } r.el.style.display = ''; r.el.style.transform = `translate(-50%,-50%) translate(${((tmp.x * 0.5 + 0.5) * w).toFixed(1)}px,${((-tmp.y * 0.5 + 0.5) * h).toFixed(1)}px)`; }
  }

  // ------------------------------------------------------------------ cutaway
  const cut = {}; const look = new THREE.Vector3();
  function updateCut(dt, instant) {
    const p = camera.position; const inside = p.y < H + 0.35;
    if (inside) { cut.N = cut.S = cut.E = cut.W = cut.P = cut.G = 50; }
    else { camera.getWorldDirection(look); const hl = Math.hypot(look.x, look.z) || 1; const elev = Math.atan2(-look.y, hl); const low = 0.32; const far = st.mode === 'maquete' ? 9 : 1.5;
      cut.S = p.z > B.z2 - far ? low : 50; cut.N = p.z < B.z1 + far ? low : 50; cut.E = p.x > B.x2 - far ? low : 50; cut.W = p.x < B.x1 + far ? low : 50;
      const side = Math.abs(look.x) / hl; cut.P = (side > 0.6 && elev < 1.1) ? 1.15 : 50; cut.G = (elev < 0.5 && side < 0.75) ? 1.15 : 50; }
    world.setCut(cut, dt, instant); world.ceiling.visible = inside; if (world.backdrop) world.backdrop.visible = inside;
  }

  // ------------------------------------------------------------------ loop
  const clock = new THREE.Clock(); const fpos = new THREE.Vector3(), ftar = new THREE.Vector3(), lpos = new THREE.Vector3(), lfwd = new THREE.Vector3(); let vwT = 0, frames = 0, dayT = 0, miniT = 0;
  const nodes = ['vendas', 'mercado', 'criativo', 'ti', 'financeiro', 'julia', 'vitoria', 'claudia', 'maria'].map(id => sim.byId.get(id)).filter(Boolean);
  function drawVideoWall() { T.videoWallTex(world.videoWall.canvas, sim.time, nodes.map(a => ({ label: a.def.name, color: a.def.color, busy: a.state !== 'seated' || a.busy, status: a.status.text }))); world.videoWall.tex.needsUpdate = true; }
  function frame(dtIn) {
    const dt = Math.min(0.05, dtIn); st.time += dt; watchPerf(dtIn);
    sim.update(dt); world.update(sim.time, dt);
    const camIn = camera.position.y < H + 0.3 && st.mode !== 'tour' && st.mode !== 'cctv';
    for (const a of sim.agents) { a.proxy.position.set(a.pos.x, 0.9, a.pos.z); const d = camIn ? Math.hypot(camera.position.x - a.pos.x, camera.position.z - a.pos.z) : 99; a.lookCam = d < 3.4 && d > 0.5 && (st.mode !== 'follow' || a !== st.follow) && a.curRole !== 'walk' ? camera.position : null; }
    if ((vwT -= dt) <= 0) { vwT = 0.25; drawVideoWall(); ui.pipTick(); }
    // time of day (sweeps like a time-lapse when the preset changes)
    { const tg = targetHour(); let diff = ((tg - day.hour + 36) % 24) - 12; if (Math.abs(diff) < 0.01) day.hour = tg; else day.hour = (day.hour + Math.sign(diff) * Math.min(Math.abs(diff), dt * 7) + 24) % 24; applyDay(frames < 2); }
    // camera
    if (st.mode === 'overview' || st.mode === 'maquete') {
      if (st.intro) { const i = st.intro; i.t += dt; const u = Math.max(0, Math.min(1, i.t / i.dur)), e = u * u * u * (u * (u * 6 - 15) + 10); camera.position.lerpVectors(i.p0, HOME.pos, e); orbit.target.lerpVectors(i.t0, HOME.target, e); camera.lookAt(orbit.target); if (u >= 1) { st.intro = null; orbit.enabled = true; } }
      else if (st.flight) { const f = st.flight; f.t += dt; const u = Math.min(1, f.t / f.dur), e = u * u * (3 - 2 * u); camera.position.lerpVectors(f.p0, f.p1, e); orbit.target.lerpVectors(f.t0, f.t1, e); camera.lookAt(orbit.target); if (u >= 1) st.flight = null; }
      else orbit.update();
    } else if (st.mode === 'fpv') moveFP(dt);
    else if (st.mode === 'tour') { st.tourT += dt; tourAt(st.tourT, fpos, ftar); camera.position.copy(fpos); camera.lookAt(ftar); }
    else if (st.mode === 'cctv') { st.camT += dt; if (st.camAuto && st.camT > 9) ui.cam(1, true); const c = CAMS[st.cam]; camera.position.set(...c[1]); const sw = Math.sin(st.camT * 0.35) * 0.9; ftar.set(c[2][0] + sw * (Math.abs(c[1][0] - c[2][0]) > Math.abs(c[1][2] - c[2][2]) ? 0 : 1), c[2][1], c[2][2] + sw * (Math.abs(c[1][0] - c[2][0]) > Math.abs(c[1][2] - c[2][2]) ? 1 : 0)); camera.lookAt(ftar); }
    else if (st.mode === 'cine') {
      const c = st.cine, th = sim.byId.get('thiago'); c.t += dt; const mt = sim.meeting;
      if (!mt && c.t > 3) { setMode('overview', { home: true }); }
      else { const started = mt && mt.start !== null; if (started && c.phase === 0) { c.phase = 1; c.a = -0.55; }
        if (c.phase === 0) { fpos.set(th.pos.x + 5.5, 7.4, th.pos.z + 8.2); ftar.set(th.pos.x + 0.6, 1.1, th.pos.z - 0.4); }
        else { c.a += dt * 0.085; const R = 11.5; fpos.set(6.5 + Math.sin(c.a) * R, 8.6, -5.1 + Math.cos(c.a) * R); ftar.set(6.5, 0.9, -5.3); }
        const k = 1 - Math.exp(-dt * (c.t < 0.2 ? 60 : 1.6)); camera.position.lerp(fpos, k); c.look.lerp(ftar, k); camera.lookAt(c.look); }
    }
    else if (st.mode === 'follow' && st.follow) {
      const a = st.follow, head = a.headPos, dist = 2.6; let best = null;
      for (const off of [0, 0.9, -0.9, 1.8, -1.8, Math.PI]) { const ang = a.yaw + Math.PI + off; fpos.set(head.x + Math.sin(ang) * dist, 0, head.z + Math.cos(ang) * dist); if (fpos.x < B.x1 + 0.3 || fpos.x > B.x2 - 0.3 || fpos.z < B.z1 + 0.3 || fpos.z > B.z2 - 0.3) continue; if (walled(head, fpos)) continue; best = ang; break; }
      if (best === null) best = a.yaw + Math.PI;
      const snap = st.followYaw === undefined; if (snap) st.followYaw = best; else { const d = ((best - st.followYaw + Math.PI * 3) % (Math.PI * 2)) - Math.PI; st.followYaw += d * Math.min(1, dt * 1.8); }
      fpos.set(head.x + Math.sin(st.followYaw) * dist, Math.min(H - 0.35, head.y + 0.42), head.z + Math.cos(st.followYaw) * dist);
      if (snap) camera.position.copy(fpos); else camera.position.lerp(fpos, 1 - Math.exp(-dt * 4));
      ftar.set(head.x, head.y - 0.08, head.z); camera.lookAt(ftar);
    }
    if (st.selected) { const a = st.selected; ring.visible = true; ring.position.set(a.pos.x, 0.03, a.pos.z); const s = 1 + Math.sin(st.time * 4) * 0.05; ring.scale.set(s, s, s); } else ring.visible = false;
    updateCut(dt, frames < 2 || st.instant);
    camera.updateMatrixWorld();
    if (st.noRender) { /* tests: advance everything without drawing */ }
    else if (st.post) { let focus = 0.5; if (st.mode === 'maquete') { tmp.copy(orbit.target).project(camera); focus = tmp.y * 0.5 + 0.5; } const night = day.s.night; post.render(scene, camera, { exposure: day.exposure, bloom: night ? 0.85 : 0.5, tilt: st.mode === 'maquete' ? 0.0115 : 0, focus, cctv: st.mode === 'cctv', time: st.time, sat: st.mode === 'maquete' ? 1.2 : 1.06, vignette: st.mode === 'maquete' ? 0.32 : 0.2, aoStrength: 0.9 }); }
    else { renderer.setRenderTarget(null); renderer.render(scene, camera); }
    // sound: listen near what the camera looks at
    if (audio.on) { camera.getWorldDirection(lfwd); if (st.mode === 'overview' || st.mode === 'maquete' || st.mode === 'cine') { const dd = camera.position.distanceTo(orbit.target); lpos.copy(st.mode === 'cine' ? st.cine.look : orbit.target).addScaledVector(lfwd, -Math.min(7, dd * (st.mode === 'maquete' ? 0.05 : 0.2))); lpos.y = Math.max(1.6, lpos.y); } else lpos.copy(camera.position); audio.update(dt, { listener: lpos, forward: lfwd, up: camera.up, sim, world }); }
    updateLabels(st.time); ui.tick(dt); if ((miniT -= dt) <= 0) { miniT = 0.1; ui.mini(); } frames++;
  }
  renderer.setAnimationLoop(() => frame(clock.getDelta()));
  window.addEventListener('resize', () => { fitHome(); if (st.mode === 'overview') orbit.maxDistance = 85 * HOME.k; camera.aspect = window.innerWidth / window.innerHeight; applyOffset(); camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); if (post) { const v = renderer.getDrawingBufferSize(new THREE.Vector2()); post.setSize(v.x, v.y); } });

  // ------------------------------------------------------------------ business events (real feed or tests)
  const seen = new Set();
  function officeEvent(e) {
    if (!e || typeof e !== 'object') return; const type = e.type || e.tipo;
    if (type === 'pedido') { world.print(); audio.printer(2.4, 0.8, -5.6); audio.chime(); const who = sim.byId.get(e.agente || 'julia') || sim.byId.get('vendas'); const titulo = String(e.titulo || e.title || 'novo pedido').slice(0, 60); sim.celebrate(who); ui.say(who, `Novo pedido: ${titulo}`, true); ui.toast(`${e.teste ? 'Teste · ' : ''}Novo pedido: ${titulo}`); }
    else if (type === 'servidor') { const lvl = e.status === 'ok' ? 0 : Math.max(0, Math.min(1, e.carga !== undefined ? (+e.carga - 0.6) / 0.35 : 1)); world.serverAlert = lvl; const ti = sim.byId.get('ti'); if (lvl > 0.4) { ui.toast(String(e.texto || 'Servidor com carga alta — TI foi conferir').slice(0, 80)); if (ti && !ti.busy && !ti.conv && ti.state === 'seated') sim.errand(ti, { spot: 'ti.rack', role: 'workMid', label: 'Conferindo o alerta nos servidores', icon: '🚨', dur: [12, 16], go: 'Indo conferir os servidores' }); } else if (ti) ui.say(ti, 'Servidores normalizados', true); }
    else if (type === 'mensagem') { const who = sim.byId.get(e.agente); if (who && e.texto) ui.say(who, String(e.texto).slice(0, 90), true); }
  }
  const feed = config.events || {};
  if (feed.url) { const poll = async (first) => { try { const r = await fetch(feed.url, { cache: 'no-store' }); const list = await r.json(); for (const e of (Array.isArray(list) ? list : list.events || [])) { const id = e.id ?? JSON.stringify(e); if (seen.has(id)) continue; seen.add(id); if (!first) officeEvent(e); } } catch (err) {} }; poll(true); setInterval(() => poll(false), Math.max(5, feed.intervalo || 15) * 1000); }
  window.addEventListener('message', (m) => { if (m.data && m.data.office3d) officeEvent(m.data.office3d); });
  ui.onSim = (kind) => { if (kind === 'order') officeEvent({ type: 'pedido', titulo: 'pedido de demonstração', teste: true }); else { officeEvent({ type: 'servidor', carga: 0.97, texto: 'Teste: carga alta nos servidores — TI foi conferir' }); setTimeout(() => officeEvent({ type: 'servidor', status: 'ok' }), 26000); } };
  window.Office3D = { event: officeEvent, setTime, setMode, sim };

  // ------------------------------------------------------------------ go
  setQuality(qs.get('q') || store.get('office3d.q') || (TOUCH || Math.min(window.innerWidth, window.innerHeight) < 600 ? 'low' : 'high'));
  setTime(day.preset); applyDay(true);
  setMode('overview', { force: true, home: true });
  if (!qs.has('nointro')) { st.intro = { p0: new THREE.Vector3(-11.9, 5.2, 4.2), t0: new THREE.Vector3(-12.5, 1.5, -6.6), t: -0.9, dur: 5.2 }; orbit.enabled = false; camera.position.copy(st.intro.p0); orbit.target.copy(st.intro.t0); camera.lookAt(orbit.target); }
  setLoad(1, 'Pronto'); document.body.classList.add('ready'); setTimeout(() => { const l = $('#loading'); if (l) l.remove(); }, 1600);
  window.__office = { sim, world, nav, camera, orbit, st, setMode, renderer, scene, ui, HOME, frame, day, setTime, setQuality, audio, officeEvent, get post() { return post; },
    ff(sec, step = 1 / 30) { for (let t = 0; t < sec; t += step) { sim.update(step); world.update(sim.time, step); } },
    skip(sec, step = 1 / 20) { st.noRender = true; for (let t = 0; t < sec; t += step) frame(step); st.noRender = false; },
    still(n = 2) { renderer.setAnimationLoop(null); st.instant = true; for (let i = 0; i < n; i++) frame(1 / 30); },
    view(p, t, fov) { st.intro = null; st.flight = null; orbit.enabled = false; st.mode = 'free'; document.body.dataset.mode = 'free'; camera.clearViewOffset(); camera.position.set(...p); camera.lookAt(...t); if (fov) { camera.fov = fov; } camera.updateProjectionMatrix(); } };
}

// ============================================================================ UI
function buildUI({ sim, st, config, setMode, flyTo, camera, orbit, HOME, world, audio, setTime, setQuality, closePops, CAMS, day }) {
  const list = $('#team-list'); const card = $('#card'); const rows = new Map();
  for (const a of sim.agents) { const el = document.createElement('button'); el.className = 'row'; el.innerHTML = `<i style="background:${a.def.color}">${initials(a.def.name)}</i><div><b></b><small></small></div><em></em>`; el.querySelector('b').textContent = a.def.name; el.addEventListener('click', () => ui.select(a, true)); list.appendChild(el); rows.set(a, { el, small: el.querySelector('small'), em: el.querySelector('em') }); }
  document.querySelectorAll('[data-mode-btn]').forEach(b => b.addEventListener('click', () => { audio.ui(); setMode(b.dataset.modeBtn); }));
  let clockT = 0, toastT = 0, pipInfo = null;
  const ui = {
    select(a, fly = false) {
      st.selected = a; rows.forEach((r, k) => r.el.classList.toggle('on', k === a)); document.body.classList.toggle('has-card', !!a);
      if (!a) { card.classList.remove('show'); return; } audio.ui(740);
      card.classList.add('show'); $('#card-name').textContent = a.def.name; $('#card-role').textContent = a.def.role; $('#card-dept').textContent = a.def.dept; $('#card-desc').textContent = a.def.desc || ''; $('#card-avatar').style.background = a.def.color; $('#card-avatar').textContent = initials(a.def.name);
      const acts = $('#card-actions'); acts.innerHTML = ''; const btn = (label, fn, primary) => { const b = document.createElement('button'); b.textContent = label; if (primary) b.className = 'primary'; b.addEventListener('click', () => { audio.ui(); fn(); }); acts.appendChild(b); };
      btn('Seguir com a câmera', () => { setMode('follow', { agent: a, force: true }); }, true);
      if (a.def.kind === 'president') { btn('Passar nos setores', () => sim.command(a, 'visit')); btn('Convocar reunião geral', () => ui.meeting()); }
      else btn('Chamar à Presidência', () => sim.command(a, 'president'));
      btn('Pausa para o café', () => sim.command(a, 'coffee')); btn('Atender o telefone', () => sim.command(a, 'phone')); btn('Voltar ao posto', () => sim.command(a, 'home'));
      ui.status(a, true);
      if (fly && st.mode === 'overview') { const t = new THREE.Vector3(a.pos.x, 1.0, a.pos.z); const dir = camera.position.clone().sub(orbit.target).normalize(); flyTo(t.clone().addScaledVector(dir, 13), t, 1.2); }
      if (st.mode === 'follow') { st.follow = a; st.followYaw = undefined; }
    },
    status(a) {
      const r = rows.get(a); if (r) { r.small.textContent = a.status.text; r.em.textContent = a.status.icon; }
      if (st.selected === a) { $('#card-status').textContent = `${a.status.icon} ${a.status.text}`; const lg = $('#card-log'); lg.innerHTML = ''; for (const l of a.log.slice(-7).reverse()) { const d = document.createElement('div'); d.innerHTML = `<time>${l.t}</time>`; d.appendChild(document.createTextNode(l.text)); lg.appendChild(d); } if (!a.log.length) lg.innerHTML = '<div class="empty">Sem movimentações ainda.</div>'; }
    },
    say(a, text, force = false) { if (!a || !st.labels) return; const active = sim.agents.filter(o => o.bubble).length; if (!force && active >= 3 && st.selected !== a) return; a.bubble = { text, t0: st.time, dur: 3.2 + text.length * 0.045, k: -1 }; },
    meeting() { if (sim.meeting) { ui.toast('A reunião geral já está em andamento.'); return; } sim.startMeeting(); ui.toast('Reunião geral convocada — a equipe está indo para a sala de reunião.'); st.cine = { t: 0, phase: 0, a: 0, look: new THREE.Vector3(0, 1, 0) }; setMode('cine', { force: true }); },
    toast(m) { const t = $('#toast'); t.querySelector('span').textContent = m; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 4600); },
    toggleLabels() { st.labels = !st.labels; $('#opt-labels').classList.toggle('on', st.labels); if (!st.labels) for (const a of sim.agents) { a.bubble = null; a.tagSay.classList.remove('on'); } },
    toggleSound() { const on = !audio.on; if (on) { if (!audio.enable()) { ui.toast('Este navegador não liberou o áudio.'); return; } } else audio.disable(); const b = $('#btn-sound'); b.classList.toggle('on', on); b.querySelector('.on').style.display = on ? '' : 'none'; b.querySelector('.off').style.display = on ? 'none' : ''; if (on) { audio.ui(); ui.toast('Som ambiente ligado — aproxime a câmera para ouvir os teclados e os servidores.'); } },
    cam(d, auto = false) { st.cam = (st.cam + d + CAMS.length) % CAMS.length; st.camT = 0; if (!auto) { st.camAuto = false; $('#cctv-auto').textContent = 'AUTO: DESLIGADO'; } $('#cctv-name').textContent = `CAM_${String(st.cam + 1).padStart(2, '0')} — ${CAMS[st.cam][0]}`; },
    pip(info) { pipInfo = info; const owner = info.owner && sim.byId.get(info.owner); $('#pip-title').textContent = info.title || (owner ? `Tela de ${owner.def.name}` : 'Tela'); $('#pip-sub').textContent = owner ? owner.def.role : (info.live ? 'ao vivo na simulação' : ''); $('#pip').classList.add('show'); ui.pipTick(true); audio.ui(620); },
    pipTick(force) { if (!pipInfo || (!force && !pipInfo.live) || !$('#pip').classList.contains('show')) return; const c = $('#pip-canvas'), g = c.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(pipInfo.canvas, 0, 0, c.width, c.height); },
    mini() {
      const c = $('#mini-canvas'); if (!c || document.body.classList.contains('mini-off')) return; const g = c.getContext('2d'), W = c.width, Hh = c.height, s = 12, ox = W / 2, oz = Hh / 2; const night = document.body.dataset.day === 'night';
      const X = (x) => ox + x * s, Z = (z) => oz + z * s; g.clearRect(0, 0, W, Hh);
      g.fillStyle = night ? 'rgba(255,255,255,0.06)' : 'rgba(18,22,28,0.05)'; g.fillRect(X(-18), Z(-8.5), 36 * s, 17 * s);
      for (const r of Object.values(world.rooms)) { g.fillStyle = '#' + r.accent.toString(16).padStart(6, '0') + (night ? '3a' : '26'); g.fillRect(X(r.x1) + 1.5, Z(r.z1) + 1.5, (r.x2 - r.x1) * s - 3, (r.z2 - r.z1) * s - 3); }
      g.strokeStyle = night ? 'rgba(255,255,255,0.55)' : 'rgba(22,24,29,0.6)'; g.lineWidth = 2.2; g.strokeRect(X(-18), Z(-8.5), 36 * s, 17 * s); g.lineWidth = 1.4; g.beginPath(); for (const x of [-8, 3, 10]) { g.moveTo(X(x), Z(-8.5)); g.lineTo(X(x), Z(-1.5)); } for (const x of [-11, -5, 2, 9, 14]) { g.moveTo(X(x), Z(1.5)); g.lineTo(X(x), Z(8.5)); } g.stroke();
      g.strokeStyle = night ? 'rgba(255,255,255,0.28)' : 'rgba(22,24,29,0.28)'; g.setLineDash([5, 4]); g.beginPath(); g.moveTo(X(-18), Z(-1.5)); g.lineTo(X(10), Z(-1.5)); g.moveTo(X(-18), Z(1.5)); g.lineTo(X(14), Z(1.5)); g.stroke(); g.setLineDash([]);
      // camera
      const inside = camera.position.y < world.H + 0.3; const cx = inside ? camera.position.x : orbit.target.x, cz = inside ? camera.position.z : orbit.target.z; const dir = camera.getWorldDirection(new THREE.Vector3()); const ang = Math.atan2(dir.z, dir.x);
      g.fillStyle = night ? 'rgba(255,255,255,0.16)' : 'rgba(237,50,55,0.14)'; g.beginPath(); g.moveTo(X(cx), Z(cz)); g.arc(X(cx), Z(cz), inside ? 46 : 60, ang - 0.5, ang + 0.5); g.closePath(); g.fill();
      g.fillStyle = '#ed3237'; g.beginPath(); g.arc(X(cx), Z(cz), 3.5, 0, 6.3); g.fill();
      for (const a of sim.agents) { const sel = st.selected === a; g.beginPath(); g.arc(X(a.pos.x), Z(a.pos.z), sel ? 8 : 5.5, 0, 6.3); g.fillStyle = a.def.color; g.fill(); g.lineWidth = sel ? 3 : 1.6; g.strokeStyle = night ? '#11141a' : '#fff'; g.stroke(); }
    },
    tick(dt) { clockT -= dt; if (clockT <= 0) { clockT = 1; const d = new Date(); $('#clock').textContent = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }); $('#time-now').textContent = $('#clock').textContent; const away = sim.agents.filter(a => a.state !== 'seated' || a.busy).length; $('#stat').textContent = `${sim.agents.length - away} no posto · ${away} em movimento`; if (st.mode === 'cctv') $('#cctv-time').textContent = d.toLocaleDateString('pt-BR') + '  ' + d.toLocaleTimeString('pt-BR'); } },
  };
  const pop = (btn, id) => $(btn).addEventListener('click', (e) => { e.stopPropagation(); const p = $(id), was = p.classList.contains('show'); closePops(); if (!was) { p.classList.add('show'); const r = $(btn).getBoundingClientRect(); p.style.right = Math.max(10, window.innerWidth - r.right - 60) + 'px'; } audio.ui(); });
  pop('#btn-time', '#pop-time'); pop('#btn-more', '#pop-more');
  document.addEventListener('pointerdown', (e) => { if (!e.target.closest('.pop') && !e.target.closest('#btn-time') && !e.target.closest('#btn-more')) closePops(); });
  document.querySelectorAll('[data-time]').forEach(b => b.addEventListener('click', () => { setTime(b.dataset.time); audio.ui(); closePops(); }));
  $('#btn-sound').addEventListener('click', () => ui.toggleSound());
  $('#btn-meeting').addEventListener('click', () => { audio.ui(); ui.meeting(); });
  $('#btn-home').addEventListener('click', () => { sim.allHome(); ui.toast('Todos voltando aos postos.'); closePops(); });
  $('#btn-reset').addEventListener('click', () => { setMode('overview', { force: true }); flyTo(HOME.pos, HOME.target, 1.2); closePops(); });
  $('#btn-pres').addEventListener('click', () => { audio.ui(); setMode('overview', { force: true }); flyTo(new THREE.Vector3(-11.5, 6.6, 3.4), new THREE.Vector3(-12.4, 1.4, -6.4), 1.6); ui.select(sim.byId.get('thiago')); });
  $('#opt-quality').addEventListener('click', () => { st.lite = false; st.perfOff && st.perfOff(); setQuality(st.quality === 'high' ? 'low' : 'high'); ui.toast(st.quality === 'high' ? 'Qualidade alta: sombras suaves, brilho das telas e mais luzes.' : 'Qualidade leve: mais rápida em computadores e celulares modestos.'); });
  $('#opt-labels').addEventListener('click', () => ui.toggleLabels());
  $('#opt-mini').addEventListener('click', () => { const off = document.body.classList.toggle('mini-off'); $('#opt-mini').classList.toggle('on', !off); });
  $('#sim-order').addEventListener('click', () => { ui.onSim && ui.onSim('order'); closePops(); });
  $('#sim-server').addEventListener('click', () => { ui.onSim && ui.onSim('server'); closePops(); });
  $('#card-close').addEventListener('click', () => ui.select(null));
  $('#btn-team').addEventListener('click', () => { document.body.classList.toggle('team-off'); st.applyOffset(); camera.updateProjectionMatrix(); });
  $('#cctv-prev').addEventListener('click', () => ui.cam(-1)); $('#cctv-next').addEventListener('click', () => ui.cam(1)); $('#cctv-auto').addEventListener('click', () => { st.camAuto = !st.camAuto; $('#cctv-auto').textContent = st.camAuto ? 'AUTO' : 'AUTO: DESLIGADO'; });
  $('#pip-close').addEventListener('click', () => $('#pip').classList.remove('show')); $('#pip').addEventListener('pointerdown', (e) => { if (e.target.id === 'pip') $('#pip').classList.remove('show'); });
  $('#mini-canvas').addEventListener('click', (e) => { const r = e.target.getBoundingClientRect(); const x = ((e.clientX - r.left) / r.width - 0.5) * (460 / 12), z = ((e.clientY - r.top) / r.height - 0.5) * (232 / 12); const t = new THREE.Vector3(Math.max(-18, Math.min(18, x)), 0, Math.max(-8.5, Math.min(8.5, z))); if (st.mode !== 'overview' && st.mode !== 'maquete') setMode('overview', { force: true }); const off = camera.position.clone().sub(orbit.target); flyTo(t.clone().add(off), t, 0.9); });
  ui.cam(0, true);
  for (const a of sim.agents) ui.status(a);
  return ui;
}
function initials(n) { const p = n.replace(/[^A-Za-zÀ-ÿ. ]/g, '').split(/[ .]+/).filter(Boolean); return ((p[0] || '')[0] + ((p[1] || '')[0] || '')).toUpperCase(); }

start().catch(e => { console.error(e); const m = document.querySelector('#load-msg'); if (m) m.textContent = 'Não foi possível abrir o escritório: ' + e.message; });
