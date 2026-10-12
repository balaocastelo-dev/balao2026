// Música dos cenários, gerada no navegador (nada gravado): techno de 128 bpm para a rave,
// house tropical para a festa na piscina, pop alegre para o aniversário e a melodia do "Parabéns"
// (melodia de domínio público) com palmas e um coro de "lá-lá". Sai pelas caixas de som do cenário
// (som posicionado) e informa a batida para as luzes, as projeções e quem dança.
import { clamp } from './util.js';

const NOTA = n => 440 * Math.pow(2, (n - 69) / 12);   // número MIDI -> Hz

export function criarMusica(som) {
  let ctx = null, bus = null, saidas = [], timer = null, est = null;
  let inicio = 0, prox = 0, passo = 0, bpm = 120, energia = 0.7, pausaAte = 0;
  let parabens = null;

  // ---------------------------------------------------------------- instrumentos
  function env(g, t, a, v, d, fim) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, v), t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
    return t + a + d + (fim || 0.02);
  }
  function osc(tipo, f, t, fimT, dest, det) {
    const o = ctx.createOscillator(); o.type = tipo; o.frequency.setValueAtTime(f, t); if (det) o.detune.value = det;
    o.connect(dest); o.start(t); o.stop(fimT); return o;
  }
  function ruido(t, dur, dest, rate) {
    const s = ctx.createBufferSource(); s.buffer = som.ruido; s.playbackRate.value = rate || 1;
    s.connect(dest); s.start(t, Math.random() * 2, dur + 0.05); return s;
  }
  function kick(t, v) {
    const g = ctx.createGain(); g.connect(bus);
    const o = ctx.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(155, t); o.frequency.exponentialRampToValueAtTime(48, t + 0.11); o.frequency.exponentialRampToValueAtTime(40, t + 0.4);
    o.connect(g); env(g, t, 0.002, v, 0.42); o.start(t); o.stop(t + 0.5);
    const c = ctx.createGain(), hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 2000;
    hp.connect(c); c.connect(bus); env(c, t, 0.001, v * 0.18, 0.012); ruido(t, 0.02, hp);
  }
  function chimbal(t, v, aberto) {
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = aberto ? 7000 : 8500;
    const g = ctx.createGain(); hp.connect(g); g.connect(bus);
    env(g, t, 0.001, v, aberto ? 0.22 : 0.045); ruido(t, aberto ? 0.25 : 0.06, hp, 1.6);
  }
  function palma(t, v) {
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1400; bp.Q.value = 0.9;
    const g = ctx.createGain(); bp.connect(g); g.connect(bus);
    for (let i = 0; i < 3; i++) { g.gain.setValueAtTime(v * (i === 2 ? 1 : 0.6), t + i * 0.011); g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.011 + (i === 2 ? 0.16 : 0.01)); }
    ruido(t, 0.2, bp, 1.2);
  }
  function caixa(t, v) {
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2200; bp.Q.value = 0.6;
    const g = ctx.createGain(); bp.connect(g); g.connect(bus); env(g, t, 0.001, v, 0.14); ruido(t, 0.16, bp);
    const g2 = ctx.createGain(); g2.connect(bus); const o = osc('triangle', 190, t, t + 0.12, g2); o.frequency.exponentialRampToValueAtTime(140, t + 0.1); env(g2, t, 0.001, v * 0.5, 0.09);
  }
  function chocalho(t, v) {
    const hp = ctx.createBiquadFilter(); hp.type = 'bandpass'; hp.frequency.value = 6500; hp.Q.value = 1.2;
    const g = ctx.createGain(); hp.connect(g); g.connect(bus); env(g, t, 0.008, v, 0.05); ruido(t, 0.07, hp, 1.3);
  }
  function baixo(t, f, dur, v, corte) {
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 6;
    lp.frequency.setValueAtTime(corte * 2.2, t); lp.frequency.exponentialRampToValueAtTime(Math.max(60, corte * 0.5), t + dur);
    const g = ctx.createGain(); lp.connect(g); g.connect(bus);
    const fim = env(g, t, 0.004, v, dur);
    osc('sawtooth', f, t, fim, lp); osc('square', f / 2, t, fim, lp);
  }
  function acorde(t, fs, dur, v, corte, tipo) {
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 2; lp.frequency.setValueAtTime(corte, t); lp.frequency.exponentialRampToValueAtTime(corte * 0.35, t + dur);
    const g = ctx.createGain(); lp.connect(g); g.connect(bus);
    const fim = env(g, t, 0.005, v, dur);
    for (const f of fs) { osc(tipo || 'sawtooth', f, t, fim, lp, -7); osc(tipo || 'sawtooth', f, t, fim, lp, 7); }
  }
  function dedilhado(t, f, dur, v) {   // marimba / pluck
    const g = ctx.createGain(); g.connect(bus);
    const fim = env(g, t, 0.003, v, dur);
    osc('sine', f, t, fim, g); const g2 = ctx.createGain(); g2.gain.value = 0.35; g2.connect(g); osc('sine', f * 4.01, t, t + 0.08, g2);
    const g3 = ctx.createGain(); g3.connect(bus); env(g3, t, 0.002, v * 0.3, dur * 0.6); osc('triangle', f * 2, t, fim, g3);
  }
  function almofada(t, fs, dur, v) {
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1600;
    const g = ctx.createGain(); lp.connect(g); g.connect(bus);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + dur * 0.4); g.gain.linearRampToValueAtTime(0.0001, t + dur);
    for (const f of fs) { osc('sawtooth', f, t, t + dur + 0.05, lp, -11); osc('sawtooth', f, t, t + dur + 0.05, lp, 9); }
  }
  function subida(t, dur, v) {
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 3; bp.frequency.setValueAtTime(400, t); bp.frequency.exponentialRampToValueAtTime(6000, t + dur);
    const g = ctx.createGain(); bp.connect(g); g.connect(bus);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + dur); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.05);
    ruido(t, dur, bp);
  }
  // coro de "lá": serras com dois formantes, várias vozes um pouco desafinadas
  function coro(t, f, dur, v) {
    const g = ctx.createGain(); g.connect(bus);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + 0.06); g.gain.setValueAtTime(v, t + dur * 0.75); g.gain.linearRampToValueAtTime(0.0001, t + dur);
    for (const [fo, q, k] of [[780, 7, 1], [1180, 9, 0.6], [2600, 10, 0.18]]) {
      const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = fo; bp.Q.value = q;
      const gk = ctx.createGain(); gk.gain.value = k; bp.connect(gk); gk.connect(g);
      for (let i = 0; i < 6; i++) {
        const o = osc('sawtooth', f * (i % 3 === 2 ? 0.5 : 1), t, t + dur + 0.1, bp, (Math.random() - 0.5) * 28);
        const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 4.5 + Math.random() * 1.5; lg.gain.value = 9; lfo.connect(lg); lg.connect(o.detune); lfo.start(t); lfo.stop(t + dur + 0.1);
      }
    }
  }

  // ---------------------------------------------------------------- estilos (16 passos por compasso)
  const ESTILOS = {
    rave: {
      bpm: 128,
      passo(t, s, c) {
        const sec = c % 64, quebra = sec >= 48 && sec < 56, comeco = sec < 8;
        energia = quebra ? 0.35 + (sec - 48) / 8 * 0.45 : comeco ? 0.6 : (sec >= 56 ? 1 : 0.85);
        if (!quebra && s % 4 === 0) kick(t, 0.95);
        if (!comeco && s % 4 === 2) chimbal(t, quebra ? 0.05 : 0.09, true);
        if (s % 2 === 1) chimbal(t, 0.035, false);
        if (!quebra && !comeco && (s === 4 || s === 12)) palma(t, 0.28);
        const raiz = [45, 45, 43, 48][Math.floor(c / 4) % 4];
        if (!quebra && s % 4 !== 0) baixo(t, NOTA(raiz - 12 + (s % 4 === 3 ? 12 : 0)), 0.11, 0.2, 380 + 900 * energia);
        if (!comeco && !quebra && (s === 6 || s === 14) && c % 2 === 1) acorde(t, [NOTA(raiz + 12), NOTA(raiz + 15), NOTA(raiz + 19), NOTA(raiz + 22)], 0.22, 0.05, 1800 + 2500 * energia);
        if (quebra && s === 0 && c % 2 === 0) almofada(t, [NOTA(raiz + 12), NOTA(raiz + 15), NOTA(raiz + 19)], 3.7, 0.05);
        if (sec === 55 && s === 0) subida(t, 60 / 128 * 4, 0.12);
      },
    },
    piscina: {
      bpm: 116,
      passo(t, s, c) {
        energia = 0.7;
        const acs = [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]], a = acs[c % 4];
        if (s % 4 === 0) kick(t, 0.6);
        if (s === 4 || s === 12) palma(t, 0.16);
        if (s % 2 === 1) chocalho(t, 0.05);
        if (s % 4 === 2) chimbal(t, 0.05, true);
        if (s === 0 || s === 7 || s === 10) baixo(t, NOTA(a[0] - 24), 0.2, 0.2, 500);
        const mel = [0, -1, 2, -1, 1, 2, -1, 0, 1, -1, 2, 1, -1, 0, -1, 2];
        const k = mel[(s + c * 3) % 16]; if (k >= 0 && s % 2 === 0) dedilhado(t, NOTA(a[k] + 12), 0.28, 0.12);
        if (s === 0) almofada(t, a.map(n => NOTA(n)), 60 / 116 * 4, 0.025);
      },
    },
    aniversario: {
      bpm: 104,
      passo(t, s, c) {
        energia = 0.6;
        const acs = [[60, 64, 67], [65, 69, 72], [67, 71, 74], [60, 64, 67]], a = acs[c % 4];
        if (s === 0 || s === 8) kick(t, 0.5);
        if (s === 4 || s === 12) caixa(t, 0.12);
        if (s % 2 === 0) chimbal(t, 0.03, false);
        if (s === 0 || s === 6 || s === 8) baixo(t, NOTA(a[0] - 24), 0.18, 0.16, 450);
        const mel = [[2, 1, 0, 1], [0, 2, 1, 2], [1, 0, 2, 0], [2, 2, 1, 0]][c % 4];
        if (s % 4 === 0) dedilhado(t, NOTA(a[mel[s / 4]] + 12), 0.35, 0.1);
        if (s % 4 === 2 && c % 2) dedilhado(t, NOTA(a[(s / 2) % 3] + 24), 0.15, 0.05);
      },
    },
  };

  // melodia do "Parabéns" (3/4): [nota MIDI, duração em tempos]
  const PARABENS = [[67, 0.75], [67, 0.25], [69, 1], [67, 1], [72, 1], [71, 2],
    [67, 0.75], [67, 0.25], [69, 1], [67, 1], [74, 1], [72, 2],
    [67, 0.75], [67, 0.25], [79, 1], [76, 1], [72, 1], [71, 1], [69, 2],
    [77, 0.75], [77, 0.25], [76, 1], [72, 1], [74, 1], [72, 3]];
  function tocarParabens(t) {
    const tb = 60 / 100; let x = t + tb * 2;     // duas batidas de entrada
    const acomp = [[48, 55, 64], [43, 55, 62], [43, 53, 62], [48, 55, 64], [48, 52, 60], [41, 53, 60], [43, 55, 62], [48, 55, 64]];
    let compasso = 0, nb = 0;
    for (const [n, d] of PARABENS) {
      coro(x, NOTA(n - 12), d * tb * 0.95, 0.045);
      dedilhado(x, NOTA(n), d * tb, 0.08);
      x += d * tb;
    }
    // palmas em todo tempo e acompanhamento "um-pá-pá"
    const total = (x - t) / tb;
    for (let b = 0; b < total; b++) {
      const tt = t + b * tb; palma(tt, 0.12 + (b % 3 === 0 ? 0.06 : 0));
      if (b >= 2) { const a = acomp[Math.floor((b - 2) / 3) % acomp.length]; if ((b - 2) % 3 === 0) baixo(tt, NOTA(a[0] - 12), 0.3, 0.12, 400); else acorde(tt, a.slice(1).map(NOTA), 0.18, 0.025, 1500, 'triangle'); }
      compasso++; nb++;
    }
    return x + tb;
  }

  // ---------------------------------------------------------------- agendador
  function agendar() {
    if (!ctx || !est) return;
    const E = ESTILOS[est];
    const dt16 = 60 / bpm / 4;
    while (prox < ctx.currentTime + 0.18) {
      if (prox >= pausaAte) E.passo(prox, passo % 16, Math.floor(passo / 16));
      passo++; prox += dt16;
    }
  }
  function conectar(pontos, ref) {
    try { bus.disconnect(); } catch (e) { /* ainda solto */ }
    for (const s of saidas) { try { s.disconnect(); } catch (e) { /* já solto */ } }
    saidas = [];
    for (const p of pontos) { const pn = som.painel(p[0], p[1], p[2], ref || 4, 0.9); if (pn) { bus.connect(pn); saidas.push(pn); } }
    if (!saidas.length) bus.connect(som.mestre);
  }
  const api = {
    get estilo() { return est; },
    get bpm() { return bpm; },
    tocar(estilo, pontos, volume) {
      som.iniciar(); ctx = som.ctx; if (!ctx || !ESTILOS[estilo]) return;
      if (!bus) { bus = ctx.createGain(); }
      bus.gain.value = volume === undefined ? 0.6 : volume;
      conectar(pontos || []);
      est = estilo; bpm = ESTILOS[estilo].bpm; passo = 0; inicio = ctx.currentTime + 0.1; prox = inicio; pausaAte = 0;
      if (!timer) timer = setInterval(agendar, 25);
    },
    parar() { est = null; if (timer) { clearInterval(timer); timer = null; } if (bus) { try { bus.disconnect(); } catch (e) { /* já solto */ } } saidas = []; energia = 0.7; },
    // fase da batida (0 = na batida), número da batida e energia da música
    fase() {
      if (!ctx || !est) return { batida: (performance.now() / 500) % 1, n: 0, energia: 0.7, bpm: 120, tempo: performance.now() / 1000 };
      const tt = Math.max(0, ctx.currentTime - inicio), b = tt * bpm / 60;
      return { batida: ((b % 1) + 1) % 1, n: Math.floor(b), energia, bpm, tempo: tt };
    },
    // canta o parabéns por cima (a música de fundo para enquanto isso); devolve a duração em segundos
    parabens() {
      som.iniciar(); ctx = som.ctx; if (!ctx) return 0;
      if (!bus) { bus = ctx.createGain(); bus.gain.value = 0.6; conectar([]); }
      const t = ctx.currentTime + 0.15, fim = tocarParabens(t);
      pausaAte = fim + 0.5;
      // depois do parabéns a música volta no começo de um compasso
      const dt16 = 60 / bpm / 4; if (est) { const n = Math.ceil((pausaAte - inicio) / (dt16 * 16)); passo = n * 16; prox = inicio + n * 16 * dt16; pausaAte = prox; }
      parabens = { t, fim };
      return fim - t;
    },
  };
  return api;
}
