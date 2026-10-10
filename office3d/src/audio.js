// Procedural spatial ambience (no audio files): keyboards, server hum, footsteps, printer, coffee machine, UI clicks.
export class Ambience {
  constructor() { this.on = false; this.ctx = null; this.voices = new Map(); this.t = 0; }
  enable() {
    if (!this.ctx) { const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false; this.ctx = new AC(); this.build(); }
    this.ctx.resume(); this.on = true; this.master.gain.cancelScheduledValues(this.ctx.currentTime); this.master.gain.linearRampToValueAtTime(0.9, this.ctx.currentTime + 0.5); return true;
  }
  disable() { if (!this.ctx) return; this.on = false; this.master.gain.cancelScheduledValues(this.ctx.currentTime); this.master.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.3); }
  build() {
    const c = this.ctx; this.master = c.createGain(); this.master.gain.value = 0; const comp = c.createDynamicsCompressor(); this.master.connect(comp); comp.connect(c.destination);
    // noise buffers
    const mk = (sec, fn) => { const b = c.createBuffer(1, Math.floor(c.sampleRate * sec), c.sampleRate); const d = b.getChannelData(0); fn(d); return b; };
    this.white = mk(2, d => { for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; });
    this.brown = mk(3, d => { let l = 0; for (let i = 0; i < d.length; i++) { l = (l + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = l * 3.5; } });
    this.click = mk(0.03, d => { for (let i = 0; i < d.length; i++) { const e = Math.exp(-i / (d.length * 0.18)); d[i] = (Math.random() * 2 - 1) * e; } });
    this.thud = mk(0.09, d => { let l = 0; for (let i = 0; i < d.length; i++) { const e = Math.exp(-i / (d.length * 0.22)); l = (l + 0.12 * (Math.random() * 2 - 1)) / 1.12; d[i] = l * e * 6; } });
    // room tone (not positional)
    { const s = c.createBufferSource(); s.buffer = this.brown; s.loop = true; const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 420; const g = c.createGain(); g.gain.value = 0.05; s.connect(f); f.connect(g); g.connect(this.master); s.start(); }
  }
  panner(x, y, z, ref = 1.6, roll = 1.5) { const p = this.ctx.createPanner(); p.panningModel = 'equalpower'; p.distanceModel = 'inverse'; p.refDistance = ref; p.rolloffFactor = roll; p.maxDistance = 60; p.positionX.value = x; p.positionY.value = y; p.positionZ.value = z; p.connect(this.master); return p; }
  loopAt(key, x, y, z, { buffer = 'brown', type = 'lowpass', freq = 200, q = 0.7, gain = 0.3, ref = 1.4, hum = 0 } = {}) {
    if (this.voices.has(key)) return this.voices.get(key); const c = this.ctx; const s = c.createBufferSource(); s.buffer = this[buffer]; s.loop = true; const f = c.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q; const g = c.createGain(); g.gain.value = gain; const p = this.panner(x, y, z, ref, 1.7); s.connect(f); f.connect(g); g.connect(p); s.start();
    if (hum) { const o = c.createOscillator(); o.frequency.value = hum; const og = c.createGain(); og.gain.value = gain * 0.12; o.connect(og); og.connect(p); o.start(); }
    const v = { g, f, p, base: gain }; this.voices.set(key, v); return v;
  }
  burst(buffer, x, y, z, { gain = 0.2, type = 'bandpass', freq = 3000, q = 1, rate = 1, ref = 1.2 } = {}) {
    if (!this.on) return; const c = this.ctx; const s = c.createBufferSource(); s.buffer = this[buffer]; s.playbackRate.value = rate; const f = c.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q; const g = c.createGain(); g.gain.value = gain; const p = this.panner(x, y, z, ref, 1.6); s.connect(f); f.connect(g); g.connect(p); s.start(); s.onended = () => { try { p.disconnect(); } catch (e) {} };
  }
  // short interface blip
  ui(freq = 880) { if (!this.on) return; const c = this.ctx, o = c.createOscillator(), g = c.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(freq, c.currentTime); o.frequency.exponentialRampToValueAtTime(freq * 1.5, c.currentTime + 0.07); g.gain.setValueAtTime(0.06, c.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.14); o.connect(g); g.connect(this.master); o.start(); o.stop(c.currentTime + 0.15); }
  printer(x, y, z) { if (!this.on) return; const c = this.ctx; const s = c.createBufferSource(); s.buffer = this.white; const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1400; f.Q.value = 1.2; const g = c.createGain(); const t = c.currentTime; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.16, t + 0.15); const l = c.createOscillator(); l.frequency.value = 9; const lg = c.createGain(); lg.gain.value = 0.06; l.connect(lg); lg.connect(g.gain); l.start(t); l.stop(t + 2.7); g.gain.setValueAtTime(0.16, t + 2.3); g.gain.linearRampToValueAtTime(0, t + 2.6); const p = this.panner(x, y, z, 1.6, 1.4); s.connect(f); f.connect(g); g.connect(p); s.start(t); s.stop(t + 2.7); s.onended = () => { try { p.disconnect(); } catch (e) {} }; }
  chime() { if (!this.on) return; const c = this.ctx; [660, 880, 1320].forEach((fr, i) => { const o = c.createOscillator(), g = c.createGain(); o.type = 'sine'; o.frequency.value = fr; const t = c.currentTime + i * 0.09; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.07, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5); o.connect(g); g.connect(this.master); o.start(t); o.stop(t + 0.55); }); }
  // called every frame
  update(dt, { listener, forward, up, sim, world }) {
    if (!this.on || !this.ctx) return; const c = this.ctx, L = c.listener, now = c.currentTime;
    if (L.positionX) { L.positionX.setTargetAtTime(listener.x, now, 0.05); L.positionY.setTargetAtTime(listener.y, now, 0.05); L.positionZ.setTargetAtTime(listener.z, now, 0.05); L.forwardX.setTargetAtTime(forward.x, now, 0.05); L.forwardY.setTargetAtTime(forward.y, now, 0.05); L.forwardZ.setTargetAtTime(forward.z, now, 0.05); L.upX.value = up.x; L.upY.value = up.y; L.upZ.value = up.z; }
    else { L.setPosition(listener.x, listener.y, listener.z); L.setOrientation(forward.x, forward.y, forward.z, up.x, up.y, up.z); }
    // server room hum (gets louder and harsher on alert)
    const hum = this.loopAt('racks', 8.3, 1.2, 4.9, { freq: 260, gain: 0.5, ref: 1.6, hum: 118 }); hum.g.gain.setTargetAtTime(0.5 + (world.alertShown || 0) * 0.5, now, 0.3); hum.f.frequency.setTargetAtTime(260 + (world.alertShown || 0) * 500, now, 0.3);
    this.loopAt('fridge', 17.6, 1.0, 7.2, { freq: 140, gain: 0.16, ref: 1.2, hum: 60 });
    // people
    this.t += dt;
    for (const a of sim.agents) {
      const x = a.pos.x, z = a.pos.z;
      if (a.state === 'seated' && a.handMode === 'type' && a.wL > 0.8) { a._key = (a._key || 0) - dt; if (a._key <= 0) { const pause = Math.random() < 0.12; a._key = pause ? 0.5 + Math.random() * 1.4 : 0.07 + Math.random() * 0.16; if (!pause) this.burst('click', x, 0.8, z, { gain: 0.12 + Math.random() * 0.08, freq: 2400 + Math.random() * 2600, q: 1.4, rate: 0.9 + Math.random() * 0.5 }); } }
      else if (a.handMode === 'mouse' && a.wM > 0.8) { a._key = (a._key || 0) - dt; if (a._key <= 0) { a._key = 0.9 + Math.random() * 2.2; this.burst('click', x, 0.8, z, { gain: 0.1, freq: 1500, q: 2, rate: 0.7 }); } }
      if (a.curRole === 'walk' && a.cur) { const ph = Math.floor(a.cur.time / (a.cur.getClip().duration / 2)); if (ph !== a._step) { a._step = ph; this.burst('thud', x, 0.05, z, { gain: 0.5, type: 'lowpass', freq: 520, q: 0.6, rate: 0.9 + Math.random() * 0.3, ref: 1.5 }); } }
      const brewing = a.step && a.step.t === 'act' && a.step.label === 'Preparando o café'; if (brewing && !a._brew) { a._brew = true; const v = this.loopAt('coffee', 17.6, 1.1, 3.9, { buffer: 'white', type: 'highpass', freq: 2600, gain: 0.0, ref: 1.3 }); v.g.gain.setTargetAtTime(0.13, now, 0.4); } else if (!brewing && a._brew) { a._brew = false; const v = this.voices.get('coffee'); if (v) v.g.gain.setTargetAtTime(0, now, 0.5); }
    }
  }
}
