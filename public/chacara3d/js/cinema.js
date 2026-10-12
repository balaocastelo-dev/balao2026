// Tela do cineminha: vídeo do computador (textura de vídeo) ou do YouTube (uma janela por trás
// da imagem, mostrada por um "furo" transparente exatamente onde a tela aparece).
import * as THREE from 'three';
import { $, W3, aviso, clamp } from './util.js';

const SCR = { x0: 52.2, x1: 55.8, z0: -0.74, z1: 1.27, y: 0.045 };

function texturaParada() {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 576;
  const g = c.getContext('2d');
  g.fillStyle = '#0d1512'; g.fillRect(0, 0, 1024, 576);
  g.fillStyle = '#e6ece3'; g.textAlign = 'center'; g.font = '700 64px "Bricolage Grotesque", "Trebuchet MS", sans-serif'; g.fillText('Cineminha', 512, 270);
  g.fillStyle = '#a3b3a6'; g.font = '400 30px "Source Sans 3", "Segoe UI", sans-serif'; g.fillText('Abra o menu (Esc) e escolha um vídeo', 512, 330);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export function criarCinema(cena, som) {
  const parada = new THREE.MeshBasicMaterial({ map: texturaParada(), color: new THREE.Color(0.55, 0.55, 0.55) });
  const furo = new THREE.ShaderMaterial({ vertexShader: 'void main(){ gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }', fragmentShader: 'void main(){ gl_FragColor = vec4(0.0); }', blending: THREE.NoBlending });
  const apagada = new THREE.MeshBasicMaterial({ color: 0x050708 });
  const tela = new THREE.Mesh(new THREE.PlaneGeometry(SCR.x1 - SCR.x0, SCR.z1 - SCR.z0), parada);
  tela.position.copy(W3((SCR.x0 + SCR.x1) / 2, SCR.y, (SCR.z0 + SCR.z1) / 2)); tela.rotation.y = Math.PI;
  cena.add(tela);
  const cantos = [W3(SCR.x1, SCR.y, SCR.z1), W3(SCR.x0, SCR.y, SCR.z1), W3(SCR.x0, SCR.y, SCR.z0), W3(SCR.x1, SCR.y, SCR.z0)];
  const luz = new THREE.PointLight(0xbfd4ff, 0, 9, 2); luz.position.copy(W3(54.0, 1.3, 0.4)); cena.add(luz);
  const c = { modo: 'parada', video: null, vtex: null, vmat: null, yt: $('yt'), ytOK: true, url: null, tela, luz };
  function parar() {
    if (c.video) c.video.pause();
    c.yt.src = 'about:blank'; c.yt.style.visibility = 'hidden';
    c.modo = 'parada'; tela.material = parada;
  }
  function arquivo(f) {
    parar();
    if (!c.video) {
      const v = document.createElement('video'); v.loop = true; v.playsInline = true; v.crossOrigin = 'anonymous'; c.video = v;
      c.vtex = new THREE.VideoTexture(v); c.vtex.colorSpace = THREE.SRGBColorSpace;
      c.vmat = new THREE.MeshBasicMaterial({ map: c.vtex, color: new THREE.Color(1.6, 1.6, 1.6) });
      som.ligarVideo(v);
    }
    if (c.url) URL.revokeObjectURL(c.url);
    c.url = URL.createObjectURL(f); c.video.src = c.url;
    c.video.play().then(() => { c.modo = 'arquivo'; tela.material = c.vmat; $('cineInfo').textContent = 'Passando: ' + f.name; aviso('Vídeo passando no cineminha'); })
      .catch(() => aviso('Este vídeo não abriu. Tente um arquivo MP4.'));
  }
  function idYT(u) { const m = String(u).match(/(?:youtu\.be\/|v=|\/shorts\/|\/embed\/|\/live\/)([A-Za-z0-9_-]{11})/); return m ? m[1] : (/^[A-Za-z0-9_-]{11}$/.test(String(u).trim()) ? String(u).trim() : null); }
  function youtube(u) {
    const id = idYT(u);
    if (!id) { aviso('Não reconheci esse link do YouTube.'); return; }
    if (!c.ytOK) { $('cineInfo').textContent = 'Esta página não deixa abrir o YouTube dentro dela. Use um vídeo do computador.'; return; }
    parar();
    const org = /^https?:/.test(location.protocol) ? '&origin=' + encodeURIComponent(location.origin) : '';
    c.yt.src = 'https://www.youtube.com/embed/' + id + '?autoplay=1&playsinline=1&rel=0&controls=0&enablejsapi=1&loop=1&playlist=' + id + org;
    c.modo = 'yt'; tela.material = furo;
    setTimeout(() => { if (c.modo === 'yt' && c.yt.contentWindow) { try { c.yt.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'playVideo', args: [] }), '*'); } catch (e) { /* segue sem o empurrão */ } } }, 2500);
    $('cineInfo').textContent = 'YouTube ligado na tela do muro. Ele aparece ao vivo, mas não sai nas fotos nem nos vídeos renderizados.';
  }
  document.addEventListener('securitypolicyviolation', e => {
    if (/frame|child|default/.test(e.violatedDirective || '') && c.modo === 'yt') { c.ytOK = false; parar(); $('cineInfo').textContent = 'Esta página não deixa abrir o YouTube dentro dela. Use um vídeo do computador.'; }
  });
  const v4 = new THREE.Vector3();
  function posicionarYT(camera, w, h) {
    if (c.modo !== 'yt') return;
    const pts = [];
    for (const k of cantos) {
      v4.copy(k).applyMatrix4(camera.matrixWorldInverse); if (v4.z > -0.2) { c.yt.style.visibility = 'hidden'; return; }
      v4.copy(k).project(camera); pts.push([(v4.x * 0.5 + 0.5) * w, (-v4.y * 0.5 + 0.5) * h]);
    }
    const [x0, y0] = pts[0], [x1, y1] = pts[1], [x2, y2] = pts[2], [x3, y3] = pts[3];
    const dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3, dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3, den = dx1 * dy2 - dx2 * dy1;
    if (Math.abs(den) < 1e-6) { c.yt.style.visibility = 'hidden'; return; }
    const g = (dx3 * dy2 - dx2 * dy3) / den, hh = (dx1 * dy3 - dx3 * dy1) / den, a = x1 - x0 + g * x1, b = x3 - x0 + hh * x3, d = y1 - y0 + g * y1, e = y3 - y0 + hh * y3, VW = 1280, VH = 720;
    c.yt.style.transform = 'matrix3d(' + [a / VW, d / VW, 0, g / VW, b / VH, e / VH, 0, hh / VH, 0, 0, 1, 0, x0, y0, 0, 1].join(',') + ')';
    c.yt.style.visibility = 'visible';
  }
  function volumeYT(camPos, vol) {
    if (c.modo !== 'yt' || !c.yt.contentWindow) return;
    const d = camPos.distanceTo(tela.position), v = Math.round(clamp(2.5 / Math.max(d, 1), 0, 1) * 100 * vol);
    try { c.yt.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'setVolume', args: [v] }), '*'); } catch (e) { /* sem importância */ }
  }
  function atualizar(t, noite) {
    luz.intensity = (c.modo === 'parada' ? 0.15 : 0.6 + 0.2 * Math.sin(t * 3.1)) * (0.25 + 0.75 * noite);
  }
  function paraFoto(sim) { if (c.modo === 'yt') tela.material = sim ? apagada : furo; }
  return { c, parar, arquivo, youtube, posicionarYT, volumeYT, atualizar, paraFoto };
}
