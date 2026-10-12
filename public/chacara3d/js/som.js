// Som ambiente gerado no navegador: água (cascata, hidro, laguinho), passarinhos nas copas,
// grilos e sapos à noite, fogueira, vento, passos, galinhas cacarejando, galo cantando e cachorro latindo.
import { W3, estado } from './util.js';

export function criarSom() {
  let AC = null, mestre = null, saida = null, gravacao = null, ruido = null, passaros = [], grilo = null, vento = null, fogoG = null, sapoP = null, passoT = 0, vidNode = null, videoPendente = null;
  const timers = [];
  const pan = (x, y, z, ref, roll) => {
    const p = AC.createPanner(); p.panningModel = 'equalpower'; p.distanceModel = 'inverse'; p.refDistance = ref; p.rolloffFactor = roll; p.maxDistance = 90;
    const v = W3(x, y, z);
    if (p.positionX) { p.positionX.value = v.x; p.positionY.value = v.y; p.positionZ.value = v.z; } else p.setPosition(v.x, v.y, v.z);
    p.connect(mestre); return p;
  };
  function laco(tipo, f, q, ganho, dest) {
    const s = AC.createBufferSource(); s.buffer = ruido; s.loop = true; s.playbackRate.value = 0.8 + Math.random() * 0.4;
    const b = AC.createBiquadFilter(); b.type = tipo; b.frequency.value = f; b.Q.value = q;
    const g = AC.createGain(); g.gain.value = ganho; s.connect(b); b.connect(g); g.connect(dest); s.start(); return g;
  }
  function nota(dest, t0, f0, f1, dur, vol, tipo) {
    const o = AC.createOscillator(), g = AC.createGain(); o.type = tipo || 'sine';
    o.frequency.setValueAtTime(f0, t0); o.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + Math.min(0.02, dur * 0.3)); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(dest); o.start(t0); o.stop(t0 + dur + 0.02);
  }
  function frase(dest, tipo) {
    let t = AC.currentTime + 0.02; const R = Math.random;
    if (tipo === 0) { const n = 5 + Math.floor(R() * 6), f = 3600 + R() * 1400; for (let i = 0; i < n; i++) { nota(dest, t, f, f * 1.18, 0.045, 0.11); t += 0.075; } }
    else if (tipo === 1) { const k = 0.9 + R() * 0.2; nota(dest, t, 2700 * k, 3150 * k, 0.11, 0.16); nota(dest, t + 0.17, 3350 * k, 2900 * k, 0.12, 0.16); nota(dest, t + 0.36, 2650 * k, 2250 * k, 0.22, 0.14); }
    else if (tipo === 2) { const n = 4 + Math.floor(R() * 4); for (let i = 0; i < n; i++) { const f = 1700 + R() * 950, d = 0.15 + R() * 0.16; nota(dest, t, f, f * (0.86 + R() * 0.3), d, 0.14); t += d + 0.07; } }
    else if (tipo === 3) { nota(dest, t, 5300, 4200, 0.05, 0.1); if (R() < 0.5) nota(dest, t + 0.11, 5100, 4100, 0.05, 0.09); }
    else { const f = 470 + R() * 60; nota(dest, t, f, f * 0.92, 0.26, 0.12); nota(dest, t + 0.34, f, f * 0.92, 0.26, 0.12); nota(dest, t + 0.68, f * 0.98, f * 0.86, 0.5, 0.13); }
  }
  // voz de bicho: oscilador áspero passando por um filtro de formante
  function voz(dest, t0, f0, f1, dur, vol, formante, q) {
    const o = AC.createOscillator(); o.type = 'sawtooth';
    o.frequency.setValueAtTime(f0, t0); o.frequency.linearRampToValueAtTime(f1, t0 + dur);
    const b = AC.createBiquadFilter(); b.type = 'bandpass'; b.frequency.value = formante; b.Q.value = q || 3;
    const g = AC.createGain();
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012); g.gain.setValueAtTime(vol, t0 + dur * 0.6); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(b); b.connect(g); g.connect(dest); o.start(t0); o.stop(t0 + dur + 0.03);
  }
  const api = {
    get ctx() { return AC; },
    get fluxoGravacao() { return gravacao ? gravacao.stream : null; },
    iniciar() {
      if (AC) { AC.resume(); return; }
      const C = window.AudioContext || window.webkitAudioContext; if (!C) return;
      AC = new C(); mestre = AC.createGain(); mestre.gain.value = api.volumeInicial; saida = AC.createDynamicsCompressor(); mestre.connect(saida); saida.connect(AC.destination);
      try { gravacao = AC.createMediaStreamDestination(); saida.connect(gravacao); } catch (e) { gravacao = null; }
      ruido = AC.createBuffer(1, AC.sampleRate * 3, AC.sampleRate); const d = ruido.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      // água: as duas bicas da cascata, a hidro, um fio d'água no laguinho
      const casc = pan(39.4, 1.7, 0.2, 1.6, 1.25); laco('bandpass', 1500, 0.5, 0.5, casc); laco('lowpass', 420, 0.7, 0.28, casc); laco('highpass', 4200, 0.7, 0.07, casc);
      const hid = pan(33.1, 2.2, 0.4, 1.0, 2.0); laco('lowpass', 650, 1.0, 0.26, hid); laco('bandpass', 2300, 2.0, 0.05, hid);
      const lago = pan(46.7, 4.7, -0.5, 1.0, 2.0); laco('bandpass', 3100, 3.0, 0.07, lago); laco('bandpass', 1100, 2.0, 0.05, lago);
      vento = laco('lowpass', 260, 0.5, 0.014, mestre);
      // os passarinhos ficam nas copas
      passaros = [[30.3, 2.1, 6, 1.4], [47.6, 1.7, 5, 1.2], [11.3, 2.3, 3, 0.8], [16.9, 8.0, 3.5, 0.8], [23.7, 8.8, 6, 0.7], [22.6, 1.9, 2.4, 0.4], [5, -6, 5, 0.6], [26, 22, 6, 0.5], [52, -7, 5, 0.6]]
        .map(b => ({ p: pan(b[0], b[1], b[2], 3.0, 1.15), w: b[3] }));
      sapoP = pan(48.6, 4.6, -0.6, 1.5, 1.6);
      const fp = pan(20.6, 6.2, 0.4, 1.2, 1.7); fogoG = AC.createBiquadFilter(); fogoG.type = 'bandpass'; fogoG.frequency.value = 2600; fogoG.Q.value = 0.6; fogoG.connect(fp); api.fogoBase = laco('lowpass', 300, 0.6, 0, fp);
      timers.push(setInterval(() => {
        if (AC.state !== 'running') return;
        const aurora = 1 + 1.5 * Math.exp(-Math.pow((estado.hora - 6.6) / 1.2, 2)) + 0.8 * Math.exp(-Math.pow((estado.hora - 17.3) / 1.0, 2));
        for (const b of passaros) if (Math.random() < 0.075 * b.w * estado.dia * aurora) frase(b.p, Math.floor(Math.random() * 5));
        if (estado.noite > 0.6 && Math.random() < 0.05) { const t = AC.currentTime, f = 150 + Math.random() * 60; for (let i = 0; i < 5; i++) nota(sapoP, t + i * 0.085, f * 2.2, f * 1.6, 0.07, 0.09, 'sawtooth'); }
        if (estado.noite > 0.5 && Math.random() < 0.5) { const s = AC.createBufferSource(); s.buffer = ruido; const g = AC.createGain(), t = AC.currentTime, off = Math.random() * 2.5; g.gain.setValueAtTime(0.25 * estado.noite, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.03 + Math.random() * 0.05); s.connect(g); g.connect(fogoG); s.start(t, off, 0.1); }
      }, 240));
      // grilos: um trecho curto de cricrilos, repetido
      const cb = AC.createBuffer(1, AC.sampleRate * 2, AC.sampleRate), cd = cb.getChannelData(0), sr = AC.sampleRate;
      for (let i = 0; i < cd.length; i++) { const t = i / sr, ph = t % 0.5, on = ph < 0.26 ? Math.pow(Math.abs(Math.sin(Math.PI * ph * 26)), 6) : 0; cd[i] = Math.sin(6.2832 * 4350 * t) * on * 0.5 + Math.sin(6.2832 * 3900 * t) * (((t + 0.21) % 0.71) < 0.2 ? Math.pow(Math.abs(Math.sin(Math.PI * t * 31)), 8) : 0) * 0.3; }
      const cs = AC.createBufferSource(); cs.buffer = cb; cs.loop = true; grilo = AC.createGain(); grilo.gain.value = 0; cs.connect(grilo); grilo.connect(mestre); cs.start();
      if (videoPendente) api.ligarVideo(videoPendente);
    },
    volumeInicial: 0.8,
    ligarVideo(v) { if (!AC) { videoPendente = v; return; } try { vidNode = AC.createMediaElementSource(v); vidNode.connect(pan(54, 0.3, 0.2, 2.5, 1.2)); } catch (e) { /* toca direto nas caixas de som */ } },
    volume(v) { api.volumeInicial = v; if (mestre) mestre.gain.value = v; },
    passo(tipo) {
      if (!AC || AC.currentTime - passoT < 0.2) return; passoT = AC.currentTime;
      const s = AC.createBufferSource(); s.buffer = ruido; const b = AC.createBiquadFilter();
      b.type = tipo === 2 ? 'bandpass' : 'lowpass'; b.frequency.value = tipo === 2 ? 1100 : (tipo === 1 ? 2400 : (tipo === 3 ? 600 : 800));
      const g = AC.createGain(), t = AC.currentTime; g.gain.setValueAtTime(tipo === 2 ? 0.16 : 0.07, t); g.gain.exponentialRampToValueAtTime(0.001, t + (tipo === 2 ? 0.28 : 0.09));
      s.connect(b); b.connect(g); g.connect(mestre); s.start(t, Math.random() * 2.5, 0.3);
    },
    cacarejo(x, y, galo) {
      if (!AC || AC.state !== 'running') return;
      const p = pan(x, y, 0.3, 1.2, 1.4), t = AC.currentTime + 0.02, n = 2 + Math.floor(Math.random() * 4), f = galo ? 330 : 420 + Math.random() * 80;
      for (let i = 0; i < n; i++) voz(p, t + i * 0.16, f * 1.1, f * 0.82, 0.075, 0.09, 1050, 2.5);
      if (Math.random() < 0.4) voz(p, t + n * 0.16 + 0.05, f * 1.25, f * 1.5, 0.22, 0.08, 1200, 2.5);
    },
    canto(x, y) {
      if (!AC || AC.state !== 'running') return;
      const p = pan(x, y, 0.5, 2.5, 1.0), t = AC.currentTime + 0.02;
      voz(p, t, 520, 600, 0.16, 0.16, 1300, 2); voz(p, t + 0.2, 640, 700, 0.14, 0.16, 1400, 2);
      voz(p, t + 0.38, 720, 760, 0.22, 0.17, 1500, 2); voz(p, t + 0.66, 760, 430, 0.9, 0.17, 1250, 2);
    },
    latido(x, y) {
      if (!AC || AC.state !== 'running') return;
      const p = pan(x, y, 0.5, 2.0, 1.2), t = AC.currentTime + 0.02, n = 1 + Math.floor(Math.random() * 2);
      for (let i = 0; i < n; i++) { voz(p, t + i * 0.32, 330, 230, 0.14, 0.2, 700, 1.5); voz(p, t + i * 0.32, 660, 460, 0.12, 0.08, 1500, 1.5); }
    },
    quadro(camera, v4) {
      if (!AC) return;
      const l = AC.listener, p = camera.position; camera.getWorldDirection(v4);
      if (l.positionX) { l.positionX.value = p.x; l.positionY.value = p.y; l.positionZ.value = p.z; l.forwardX.value = v4.x; l.forwardY.value = v4.y; l.forwardZ.value = v4.z; l.upX.value = 0; l.upY.value = 1; l.upZ.value = 0; }
      else { l.setPosition(p.x, p.y, p.z); l.setOrientation(v4.x, v4.y, v4.z, 0, 1, 0); }
      if (grilo) grilo.gain.value = 0.05 * estado.noite;
      if (api.fogoBase) api.fogoBase.gain.value = 0.12 * estado.noite;
    },
  };
  return api;
}
