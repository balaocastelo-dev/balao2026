// Procedural canvas textures (no external files needed)
import * as THREE from 'three';

export const BRAND = { red: '#ed3237', redDark: '#c8242a', ink: '#1c1f24', paper: '#ffffff' };
const FONT = '"Segoe UI Variable Display","Segoe UI",system-ui,-apple-system,"Helvetica Neue",Arial,sans-serif';
const MONO = '"Cascadia Mono","Cascadia Code",Consolas,"Courier New",monospace';

export function rng(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }

export function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
export function toTex(c, { repeat, srgb = true, aniso = 8 } = {}) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = aniso;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
  return t;
}
function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }

// --- surfaces -------------------------------------------------------------
export function carpetTex(base, seed = 1, tile = true) {
  const c = canvas(256, 256), g = c.getContext('2d'), r = rng(seed);
  g.fillStyle = base; g.fillRect(0, 0, 256, 256);
  const id = g.getImageData(0, 0, 256, 256), d = id.data;
  for (let i = 0; i < d.length; i += 4) { const n = (r() - 0.5) * 26; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
  g.putImageData(id, 0, 0);
  if (tile) { g.strokeStyle = 'rgba(0,0,0,0.10)'; g.lineWidth = 2; g.strokeRect(0, 0, 256, 256); g.strokeStyle = 'rgba(255,255,255,0.05)'; g.strokeRect(2, 2, 252, 252); }
  return c;
}
export function terrazzoTex(seed = 7) {
  const c = canvas(512, 512), g = c.getContext('2d'), r = rng(seed);
  g.fillStyle = '#e9e7e2'; g.fillRect(0, 0, 512, 512);
  const cols = ['#c9c4bb', '#b5b0a7', '#d8d3ca', '#a9a39a', '#dcc9b6', '#bfc5c9', '#f4f2ee'];
  for (let i = 0; i < 900; i++) {
    g.fillStyle = cols[(r() * cols.length) | 0]; g.globalAlpha = 0.5 + r() * 0.5;
    const x = r() * 512, y = r() * 512, s = 1.5 + r() * 5; g.beginPath(); g.ellipse(x, y, s, s * (0.5 + r() * 0.6), r() * 3.14, 0, 6.3); g.fill();
  }
  g.globalAlpha = 1; g.strokeStyle = 'rgba(120,115,105,0.25)'; g.lineWidth = 2; g.strokeRect(0, 0, 512, 512);
  return c;
}
export function concreteTex(seed = 3, base = '#cfd2d4') {
  const c = canvas(512, 512), g = c.getContext('2d'), r = rng(seed);
  g.fillStyle = base; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 260; i++) { const v = r() > 0.5 ? 255 : 70; g.fillStyle = `rgba(${v},${v},${v + 4},${0.02 + r() * 0.035})`; const s = 20 + r() * 110; g.beginPath(); g.ellipse(r() * 512, r() * 512, s, s * (0.4 + r() * 0.8), r() * 3, 0, 6.3); g.fill(); }
  return c;
}
export function tileTex(a = '#f3f1ec', line = '#d7d2c8') {
  const c = canvas(256, 256), g = c.getContext('2d');
  g.fillStyle = a; g.fillRect(0, 0, 256, 256); g.strokeStyle = line; g.lineWidth = 3; g.strokeRect(0, 0, 256, 256);
  return c;
}
export function slatTex(base = '#5a3d2b') {
  const c = canvas(256, 256), g = c.getContext('2d'), r = rng(11);
  g.fillStyle = '#1d1512'; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 8; i++) { const x = i * 32; const gr = g.createLinearGradient(x, 0, x + 26, 0); gr.addColorStop(0, '#3d291c'); gr.addColorStop(0.25, base); gr.addColorStop(0.8, base); gr.addColorStop(1, '#3a271b'); g.fillStyle = gr; g.fillRect(x, 0, 26, 256); for (let k = 0; k < 14; k++) { g.fillStyle = `rgba(0,0,0,${r() * 0.08})`; g.fillRect(x + r() * 26, 0, 1, 256); } }
  return c;
}
export function skyTex(mode = 0) { // 0 day, 1 sunset, 2 night
  const c = canvas(512, 512), g = c.getContext('2d'), r = rng(5);
  const gr = g.createLinearGradient(0, 0, 0, 512);
  if (mode === 0) { gr.addColorStop(0, '#5fa8e6'); gr.addColorStop(0.55, '#bfe0f7'); gr.addColorStop(0.8, '#f1f6f8'); }
  else if (mode === 1) { gr.addColorStop(0, '#3f5fa8'); gr.addColorStop(0.45, '#e58f7a'); gr.addColorStop(0.78, '#ffd08a'); }
  else { gr.addColorStop(0, '#050a16'); gr.addColorStop(0.6, '#0f1a30'); gr.addColorStop(0.85, '#1c2a44'); }
  g.fillStyle = gr; g.fillRect(0, 0, 512, 512);
  if (mode === 2) { for (let i = 0; i < 90; i++) { g.fillStyle = `rgba(255,255,255,${0.2 + r() * 0.6})`; g.fillRect(r() * 512, r() * 300, 1.2, 1.2); } }
  else { g.fillStyle = mode === 1 ? 'rgba(255,214,190,0.7)' : 'rgba(255,255,255,0.75)'; for (let i = 0; i < 9; i++) { const x = r() * 512, y = 60 + r() * 200; for (let k = 0; k < 7; k++) { g.beginPath(); g.ellipse(x + (r() - 0.5) * 90, y + (r() - 0.5) * 18, 26 + r() * 30, 9 + r() * 9, 0, 0, 6.3); g.fill(); } } }
  let x = 0; while (x < 512) { const w = 18 + r() * 40, h = 40 + r() * 130; const v = r(); g.fillStyle = mode === 0 ? `rgb(${150 + v * 40},${165 + v * 35},${182 + v * 30})` : mode === 1 ? `rgb(${88 + v * 30},${70 + v * 22},${92 + v * 26})` : `rgb(${14 + v * 10},${20 + v * 12},${34 + v * 14})`; g.fillRect(x, 512 - 70 - h, w, h + 70); for (let yy = 512 - 70 - h + 6; yy < 500; yy += 9) for (let xx = x + 3; xx < x + w - 4; xx += 6) { const lit = r(); if (mode === 2 ? lit > 0.62 : lit > 0.45) { g.fillStyle = mode === 0 ? 'rgba(255,255,255,0.35)' : mode === 1 ? 'rgba(255,214,150,0.55)' : (lit > 0.9 ? 'rgba(160,210,255,0.9)' : 'rgba(255,214,140,0.9)'); g.fillRect(xx, yy, 3, 5); } } x += w + 2; }
  g.fillStyle = mode === 0 ? '#9fb7a3' : mode === 1 ? '#5b5a52' : '#0b1018'; g.fillRect(0, 470, 512, 42);
  return c;
}

// --- text & signage -------------------------------------------------------
export function textTex(text, { w = 1024, h = 256, bg = null, color = '#1c1f24', size = 120, weight = 800, sub = null, subColor = null, align = 'center', radius = 0, border = null, font = FONT, letter = 0, pad = 40 } = {}) {
  const c = canvas(w, h), g = c.getContext('2d');
  if (bg) { g.fillStyle = bg; if (radius) { rr(g, 0, 0, w, h, radius); g.fill(); } else g.fillRect(0, 0, w, h); }
  if (border) { g.strokeStyle = border; g.lineWidth = 6; rr(g, 3, 3, w - 6, h - 6, Math.max(0, radius - 3)); g.stroke(); }
  g.fillStyle = color; g.textAlign = align; g.textBaseline = 'middle';
  try { g.letterSpacing = letter + 'px'; } catch (e) {}
  let s = size; g.font = `${weight} ${s}px ${font}`;
  while (g.measureText(text).width > w - pad * 2 && s > 12) { s -= 2; g.font = `${weight} ${s}px ${font}`; }
  const x = align === 'center' ? w / 2 : align === 'left' ? pad : w - pad;
  g.fillText(text, x, sub ? h * 0.40 : h / 2 + s * 0.04);
  if (sub) { let ss = Math.round(s * 0.42); g.font = `600 ${ss}px ${font}`; while (g.measureText(sub).width > w - pad * 2 && ss > 10) { ss -= 1; g.font = `600 ${ss}px ${font}`; } g.fillStyle = subColor || color; g.globalAlpha = subColor ? 1 : 0.7; g.fillText(sub, x, h * 0.40 + s * 0.78); g.globalAlpha = 1; }
  return c;
}

// --- screens --------------------------------------------------------------
function screenBase(w, h, bg) { const c = canvas(w, h), g = c.getContext('2d'); g.fillStyle = bg; g.fillRect(0, 0, w, h); return [c, g]; }
function winBar(g, w, title, accent, dark = true) {
  g.fillStyle = dark ? '#161a22' : '#eef1f5'; g.fillRect(0, 0, w, 34);
  g.fillStyle = accent; g.fillRect(0, 0, 6, 34);
  g.fillStyle = dark ? '#d7dde8' : '#2a2f38'; g.font = `600 17px ${FONT}`; g.textBaseline = 'middle'; g.textAlign = 'left'; g.fillText(title, 18, 18);
  ['#ff5f57', '#febc2e', '#28c840'].forEach((cc, i) => { g.fillStyle = cc; g.beginPath(); g.arc(w - 22 - i * 20, 17, 5.5, 0, 6.3); g.fill(); });
}
export function screenTex(kind, { seed = 1, accent = '#ed3237', title = '' } = {}) {
  const W = 640, H = 360, r = rng(seed * 977 + kind.length * 31);
  if (kind === 'terminal' || kind === 'code') {
    const [c, g] = screenBase(W, H, '#0d1117'); winBar(g, W, title || (kind === 'code' ? 'editor' : 'terminal'), accent);
    g.font = `13px ${MONO}`; g.textBaseline = 'top';
    const pal = kind === 'code' ? ['#ff7b72', '#79c0ff', '#d2a8ff', '#a5d6ff', '#7ee787', '#c9d1d9'] : ['#7ee787', '#c9d1d9', '#c9d1d9', '#79c0ff', '#e3b341'];
    for (let y = 46; y < H - 10; y += 17) { let x = 14 + (kind === 'code' ? ((r() * 4) | 0) * 18 : 0); if (kind === 'code') { g.fillStyle = '#484f58'; g.fillText(String(((y - 46) / 17 + 1) | 0).padStart(3), 6, y); x += 30; } const n = 1 + ((r() * 5) | 0); for (let k = 0; k < n; k++) { const w = 20 + r() * 90; g.fillStyle = pal[(r() * pal.length) | 0]; g.globalAlpha = 0.85; g.fillRect(x, y + 4, w, 7); x += w + 9; if (x > W - 120) break; } }
    g.globalAlpha = 1; return c;
  }
  if (kind === 'chart' || kind === 'prices') {
    const [c, g] = screenBase(W, H, '#ffffff'); winBar(g, W, title || 'painel', accent, false);
    g.strokeStyle = '#e7eaef'; g.lineWidth = 1; for (let y = 70; y < H - 30; y += 44) { g.beginPath(); g.moveTo(40, y); g.lineTo(W - 24, y); g.stroke(); }
    const series = kind === 'prices' ? 3 : 1; const cols = [accent, '#2563eb', '#94a3b8'];
    for (let s = 0; s < series; s++) { g.strokeStyle = cols[s]; g.lineWidth = s === 0 ? 4 : 2.5; g.beginPath(); let v = 0.35 + r() * 0.3; for (let i = 0; i <= 24; i++) { v = Math.min(0.92, Math.max(0.12, v + (r() - 0.46) * 0.13)); const x = 40 + i * (W - 64) / 24, y = H - 34 - v * (H - 120); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
    if (kind === 'chart') { for (let i = 0; i < 12; i++) { const hh = 20 + r() * 90; g.fillStyle = accent; g.globalAlpha = 0.16; g.fillRect(52 + i * 48, H - 34 - hh, 30, hh); } g.globalAlpha = 1; }
    return c;
  }
  if (kind === 'sheet') {
    const [c, g] = screenBase(W, H, '#ffffff'); winBar(g, W, title || 'planilha', accent, false);
    g.fillStyle = '#f3f5f8'; g.fillRect(0, 34, W, 24); g.fillRect(0, 34, 44, H);
    g.strokeStyle = '#dfe3ea'; g.lineWidth = 1; for (let x = 44; x < W; x += 85) { g.beginPath(); g.moveTo(x, 34); g.lineTo(x, H); g.stroke(); } for (let y = 58; y < H; y += 22) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
    for (let y = 64; y < H - 8; y += 22) for (let x = 52; x < W - 30; x += 85) if (r() > 0.25) { g.fillStyle = r() > 0.85 ? accent : '#5b6472'; g.globalAlpha = 0.75; g.fillRect(x + (r() > 0.5 ? 0 : 20), y, 26 + r() * 40, 8); } g.globalAlpha = 1; return c;
  }
  if (kind === 'crm') {
    const [c, g] = screenBase(W, H, '#f4f6f9'); winBar(g, W, title || 'CRM · funil', accent, false);
    const cols = 5; const cw = (W - 30) / cols; const names = ['Novos', 'Atendendo', 'Orçamento', 'Fechando', 'Consignados'];
    for (let i = 0; i < cols; i++) { const x = 15 + i * cw; g.fillStyle = '#e8ecf2'; rr(g, x, 46, cw - 8, H - 58, 8); g.fill(); g.fillStyle = '#394150'; g.font = `700 13px ${FONT}`; g.textAlign = 'left'; g.textBaseline = 'top'; g.fillText(names[i], x + 9, 54); const n = 2 + ((r() * 4) | 0); for (let k = 0; k < n; k++) { const y = 78 + k * 52; g.fillStyle = '#fff'; rr(g, x + 6, y, cw - 20, 44, 6); g.fill(); g.fillStyle = i === 3 ? accent : '#25d366'; g.fillRect(x + 6, y + 6, 4, 32); g.fillStyle = '#9aa3b2'; g.fillRect(x + 18, y + 10, cw - 60, 7); g.fillRect(x + 18, y + 25, cw - 90, 6); } }
    return c;
  }
  if (kind === 'design') {
    const [c, g] = screenBase(W, H, '#23252b'); winBar(g, W, title || 'estúdio', accent);
    g.fillStyle = '#2e3138'; g.fillRect(0, 34, 46, H); g.fillRect(W - 130, 34, 130, H);
    for (let i = 0; i < 8; i++) { g.fillStyle = '#555b66'; rr(g, 12, 48 + i * 34, 22, 22, 5); g.fill(); }
    const gr = g.createLinearGradient(80, 60, 480, 330); gr.addColorStop(0, '#ed3237'); gr.addColorStop(0.55, '#ff8a3d'); gr.addColorStop(1, '#ffd166'); g.fillStyle = gr; rr(g, 86, 62, 390, 262, 10); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.92)'; g.font = `900 46px ${FONT}`; g.textAlign = 'left'; g.textBaseline = 'top'; g.fillText('PC GAMER', 112, 92); g.font = `700 22px ${FONT}`; g.fillText('monte o seu', 114, 146);
    g.fillStyle = 'rgba(20,20,24,0.85)'; rr(g, 330, 150, 120, 150, 10); g.fill(); g.fillStyle = '#7df9ff'; g.fillRect(346, 170, 8, 110); g.fillStyle = '#ff5fd2'; g.fillRect(362, 170, 8, 110);
    for (let i = 0; i < 7; i++) { g.fillStyle = ['#ed3237', '#ff8a3d', '#ffd166', '#06d6a0', '#118ab2', '#8338ec', '#fff'][i]; g.fillRect(W - 116 + (i % 4) * 26, 56 + ((i / 4) | 0) * 26, 20, 20); }
    return c;
  }
  if (kind === 'pix') {
    const [c, g] = screenBase(W, H, '#ffffff'); winBar(g, W, title || 'financeiro', accent, false);
    for (let i = 0; i < 3; i++) { g.fillStyle = '#f3f6f9'; rr(g, 18 + i * 205, 50, 192, 76, 10); g.fill(); g.fillStyle = '#8a94a3'; g.fillRect(34 + i * 205, 66, 80, 8); g.fillStyle = i === 0 ? accent : '#2b3442'; g.fillRect(34 + i * 205, 90, 120, 18); }
    for (let k = 0; k < 7; k++) { const y = 144 + k * 29; g.fillStyle = k % 2 ? '#fafbfc' : '#fff'; g.fillRect(18, y, W - 36, 28); g.fillStyle = '#32bcad'; g.beginPath(); g.arc(36, y + 14, 7, 0, 6.3); g.fill(); g.fillStyle = '#6b7482'; g.fillRect(56, y + 10, 150 + r() * 120, 8); g.fillStyle = r() > 0.2 ? '#16a34a' : '#d97706'; g.fillRect(W - 130, y + 9, 60 + r() * 30, 10); }
    return c;
  }
  // default: dashboard tiles
  const [c, g] = screenBase(W, H, '#10141c'); winBar(g, W, title || 'painel', accent);
  for (let i = 0; i < 6; i++) { const x = 16 + (i % 3) * 206, y = 48 + ((i / 3) | 0) * 152; g.fillStyle = '#1a2130'; rr(g, x, y, 196, 142, 10); g.fill(); g.fillStyle = '#7f8aa0'; g.fillRect(x + 14, y + 16, 90, 7); g.strokeStyle = i % 2 ? '#38bdf8' : accent; g.lineWidth = 3; g.beginPath(); let v = 0.5; for (let k = 0; k <= 12; k++) { v = Math.min(0.9, Math.max(0.1, v + (r() - 0.45) * 0.3)); const px = x + 14 + k * 14, py = y + 126 - v * 80; k ? g.lineTo(px, py) : g.moveTo(px, py); } g.stroke(); }
  return c;
}

export function whiteboardTex(seed = 1, accent = '#ed3237') {
  const c = canvas(768, 432), g = c.getContext('2d'), r = rng(seed);
  g.fillStyle = '#fbfcfd'; g.fillRect(0, 0, 768, 432);
  const cols = ['#1f2937', accent, '#2563eb', '#16a34a']; g.lineCap = 'round';
  for (let i = 0; i < 5; i++) { const x = 60 + r() * 600, y = 60 + r() * 290, w = 80 + r() * 70, h = 44 + r() * 30; g.strokeStyle = cols[(r() * 4) | 0]; g.lineWidth = 4; rr(g, x, y, w, h, 8); g.stroke(); g.lineWidth = 3; g.beginPath(); g.moveTo(x + 12, y + h / 2 - 6); g.lineTo(x + w - 14, y + h / 2 - 6); g.moveTo(x + 12, y + h / 2 + 8); g.lineTo(x + w * 0.6, y + h / 2 + 8); g.stroke(); if (i) { g.beginPath(); g.moveTo(x, y + h / 2); g.bezierCurveTo(x - 60, y, x - 80, y + 90, x - 120 + r() * 40, y + (r() - 0.5) * 120); g.stroke(); } }
  g.strokeStyle = accent; g.lineWidth = 5; g.beginPath(); for (let i = 0; i < 10; i++) { const x = 500 + i * 22, y = 380 - i * i * 2.4 - r() * 14; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
  return c;
}
export function posterTex(seed = 1) {
  const c = canvas(256, 360), g = c.getContext('2d'), r = rng(seed * 13);
  const pals = [['#ed3237', '#ffd166', '#1c1f24'], ['#118ab2', '#06d6a0', '#f8f9fa'], ['#8338ec', '#ff5fd2', '#0b0d12'], ['#ff8a3d', '#1c1f24', '#fff3e0']]; const p = pals[(r() * pals.length) | 0];
  g.fillStyle = p[0]; g.fillRect(0, 0, 256, 360); g.fillStyle = p[1]; g.beginPath(); g.arc(60 + r() * 140, 110 + r() * 80, 60 + r() * 50, 0, 6.3); g.fill(); g.fillStyle = p[2]; g.fillRect(24, 250, 150 + r() * 50, 22); g.fillRect(24, 284, 90 + r() * 60, 12); g.fillRect(24, 304, 120, 12);
  return c;
}
export function videoWallTex(c, t, nodes) {
  // animated "orchestration" board for the operations room
  const g = c.getContext('2d'), W = c.width, H = c.height;
  g.fillStyle = '#0c1018'; g.fillRect(0, 0, W, H);
  g.strokeStyle = 'rgba(255,255,255,0.05)'; g.lineWidth = 1; for (let x = 0; x < W; x += 40) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); } for (let y = 0; y < H; y += 40) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  g.fillStyle = '#e8edf5'; g.font = `800 34px ${FONT}`; g.textAlign = 'left'; g.textBaseline = 'top'; g.fillText('CENTRAL DE ORQUESTRAÇÃO', 36, 26);
  g.fillStyle = '#ed3237'; g.fillRect(36, 72, 120, 5);
  const cx = W / 2, cy = H / 2 + 26, R = Math.min(W, H) * 0.33;
  nodes.forEach((n, i) => { const a = -Math.PI / 2 + i * 2 * Math.PI / nodes.length; const x = cx + Math.cos(a) * R * 1.55, y = cy + Math.sin(a) * R * 0.92; g.strokeStyle = 'rgba(255,255,255,0.14)'; g.lineWidth = 2; g.beginPath(); g.moveTo(cx, cy); g.lineTo(x, y); g.stroke(); const ph = (t * 0.35 + i * 0.37) % 1; const dir = i % 2 ? ph : 1 - ph; g.fillStyle = n.color; g.beginPath(); g.arc(cx + (x - cx) * dir, cy + (y - cy) * dir, 6, 0, 6.3); g.fill(); g.fillStyle = '#151b27'; g.strokeStyle = n.color; g.lineWidth = 3; rr(g, x - 92, y - 26, 184, 52, 12); g.fill(); g.stroke(); g.fillStyle = n.busy ? n.color : '#3a4354'; g.beginPath(); g.arc(x - 72, y, 6, 0, 6.3); g.fill(); g.fillStyle = '#e8edf5'; g.font = `700 19px ${FONT}`; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(n.label, x - 58, y - 8); g.fillStyle = '#8b96a8'; g.font = `600 13px ${FONT}`; g.fillText((n.status || '').slice(0, 24), x - 58, y + 12); });
  g.fillStyle = '#151b27'; g.strokeStyle = '#ed3237'; g.lineWidth = 4; g.beginPath(); g.arc(cx, cy, 46 + Math.sin(t * 2) * 2, 0, 6.3); g.fill(); g.stroke(); g.fillStyle = '#fff'; g.font = `800 20px ${FONT}`; g.textAlign = 'center'; g.fillText('HERMES', cx, cy);
}
export { rr, FONT, MONO };
