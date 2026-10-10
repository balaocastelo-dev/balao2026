// Avatars with behaviour: walking, sitting, working, talking, coffee, phone calls, meetings.
import * as THREE from 'three';
import { ROLES } from './manifest.js';
import { buildClip } from './avatar.js';
import * as F from './furniture.js';

const V = () => new THREE.Vector3(), Q = () => new THREE.Quaternion();
const _v1 = V(), _v2 = V(), _a = V(), _b = V(), _c = V(), _d = V(), _e = V(), _f = V(), _g = V(), _h = V(), _i = V(), _j = V(), _q1 = Q(), _q2 = Q(), _q3 = Q(), _q4 = Q(), UP = new THREE.Vector3(0, 1, 0), FZ = new THREE.Vector3(0, 0, 1), _m1 = new THREE.Matrix4();
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[(Math.random() * arr.length) | 0];
const wrap = (a) => { while (a > Math.PI) a -= Math.PI * 2; while (a < -Math.PI) a += Math.PI * 2; return a; };
const fwd = (yaw, out = V()) => out.set(Math.sin(yaw), 0, Math.cos(yaw));
const ease = (t) => t * t * (3 - 2 * t);
const hhmm = () => { const d = new Date(); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };

export class Agent {
  constructor(sim, def, av) {
    this.sim = sim; this.def = def; this.id = def.id; this.g = def.gender; this.av = av; this.rig = av.rig;
    this.mixer = new THREE.AnimationMixer(av.rig);
    this.pos = V(); this.yaw = 0; this.yOff = 0;
    this.state = 'idle'; this.queue = []; this.step = null; this.seat = null; this.home = null;
    this.cur = null; this.curRole = null; this.curName = null; this.fading = [];
    this.walkSpeed = (this.g === 'f' ? 1.22 : 1.32) * rand(0.92, 1.04);
    this.look = null; this.lookYaw = 0; this.lookPitch = 0; this.speaking = false; this.jaw = 0; this.jawT = Math.random() * 10;
    this.blinkAt = rand(1, 5); this.blink = 0;
    this.status = { icon: '💼', text: 'No posto' }; this.log = []; this.nextPlan = rand(4, 30); this.cleanup = [];
    this.props = {}; this.conv = null; this.expecting = null; this.busyWith = null; this.velocity = V(); this.moving = false;
    const b = av.bones; this.bHead = b.get('Bip01_Head'); this.bNeck = b.get('Bip01_Neck'); this.bJaw = b.get('Bip01_MJaw'); this.bRH = b.get('Bip01_R_Hand'); this.bLH = b.get('Bip01_L_Hand');
    this.bSpine = b.get('Bip01_Spine1') || b.get('Bip01_Spine'); this.arm = { R: [b.get('Bip01_R_UpperArm'), b.get('Bip01_R_Forearm'), this.bRH], L: [b.get('Bip01_L_UpperArm'), b.get('Bip01_L_Forearm'), this.bLH] }; this.wL = 0; this.wR = 0; this.wM = 0; this.handMode = 'rest'; this.handT = rand(0.5, 3); this.kbT = null; this.mouseT = null; this.workLookT = 0; this.lookWork = null;
    // finger chains (index..pinky: 3 segments each, thumb kept at rest) with the avatar's own rest rotations, so typing hands look the same on every body
    this.fing = { L: [], R: [] }; for (const sd of ['L', 'R']) for (const f of ['0', '1', '2', '3', '4']) { const ph = Math.random() * 10, rate = 3 + Math.random() * 4; ['', '1', '2'].forEach((sfx, seg) => { const nm = `Bip01_${sd}_Finger${f}${sfx}`, fb = b.get(nm), r = av.rest.get(nm); if (fb && r) this.fing[sd].push({ bone: fb, rest: r.q, seg, thumb: f === '0', ph, rate }); }); }
    this.lids = ['Bip01_LEyeBlinkTop', 'Bip01_REyeBlinkTop'].map(n => b.get(n)).filter(Boolean);
    this.lidRest = this.lids.map(l => l.position.clone());
    this.jawRest = this.bJaw ? this.bJaw.quaternion.clone() : null;
    this.headPos = V();
  }
  say(icon, text, log = true) { this.status = { icon, text }; if (log) { this.log.push({ t: hhmm(), text }); if (this.log.length > 40) this.log.shift(); } this.sim.onStatus && this.sim.onStatus(this); if (log && this.sim.onSay) this.sim.onSay(this, icon, text); }
  // ---------------------------------------------------------------- animation
  clip(base, opts) { return this.sim.clip(this.g, base, opts); }
  play(role, { fade = 0.4, name = null, timeScale = 1, force = false } = {}) {
    const list = ROLES[role] || [role]; let base = name || pick(list);
    if (!force && this.curRole === role && list.length > 1) { for (let i = 0; i < 4 && base === this.curName; i++) base = pick(list); }
    const loop = role === 'walk'; let clip = this.clip(base, { inplace: role === 'walk' || role === 'sitDown' || role === 'standUp' });
    if (this.cur && this.cur.getClip() === clip) { if (loop) { this.cur.timeScale = timeScale; return this.cur; } clip = this.sim.twin(clip); }
    const a = this.mixer.clipAction(clip); a.reset(); a.enabled = true; a.setEffectiveWeight(1); a.timeScale = timeScale;
    a.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, Infinity); a.clampWhenFinished = true; a.play();
    if (this.cur && this.cur !== a) { if (fade > 0) { this.cur.crossFadeTo(a, fade, false); this.fading.push([this.cur, fade + 0.05]); } else this.cur.stop(); }
    this.cur = a; this.curRole = role; this.curName = base; return a;
  }
  // ---------------------------------------------------------------- steps
  enqueue(...steps) { this.queue.push(...steps.flat().filter(Boolean)); }
  get busy() { return !!this.step || this.queue.length > 0; }
  finish() { this.step = null; }
  runCleanup() { const c = this.cleanup; this.cleanup = []; for (const f of c) { try { f(); } catch (e) { console.error(e); } } }
  // drop everything after the current atomic step
  interrupt() { this.queue.length = 0; if (this.step && (this.step.t === 'act' || this.step.t === 'hold' || this.step.t === 'wait')) this.step = null; else if (this.step && this.step.t === 'walk') { this.step = null; this.moving = false; } this.runCleanup(); this.conv = null; this.speaking = false; this.look = null; this.setProp(null); }

  update(dt, t) {
    if (!this.step && this.queue.length) { this.step = this.queue.shift(); this.step.ph = 0; this.step.time = 0; this.begin(this.step); }
    if (this.step) { this.step.time += dt; this.run(this.step, dt, t); }
    else this.idleTick(dt, t);
    // chained one-shot clips
    if (this.cur && this.cur.loop === THREE.LoopOnce && this.curRole !== 'sitDown' && this.curRole !== 'standUp') { const c = this.cur.getClip(); if (this.cur.time > c.duration - 0.5) { let role = this.curRole; if (this.state === 'seated' && !this.step && !this.conv && this.seat && this.seat.kind === 'desk') role = Math.random() < 0.74 ? 'sitWork' : 'sitIdle'; this.play(role, { fade: 0.5 }); } }
    for (let i = this.fading.length - 1; i >= 0; i--) { this.fading[i][1] -= dt; if (this.fading[i][1] <= 0) { const a = this.fading[i][0]; if (a !== this.cur) a.stop(); this.fading.splice(i, 1); } }
    this.mixer.update(dt);
    this.rig.position.set(this.pos.x, this.pos.y + this.yOff, this.pos.z); this.rig.rotation.y = this.yaw;
    this.post(dt, t);
  }
  idleTick(dt, t) {
    if (this.state === 'seated') { if (this.curRole !== 'sitWork' && this.curRole !== 'sitIdle' && this.curRole !== 'sitChair') this.play(this.seat && this.seat.kind === 'desk' ? 'sitWork' : 'sitChair'); if (!this.conv) this.swivelTo(0, dt); }
    else if (this.curRole !== 'idle') this.play('idle');
  }
  swivelTo(target, dt) { const s = this.seat; if (!s) return; const cur = s.swivel || 0; const n = cur + (target - cur) * (1 - Math.exp(-dt * 3)); s.swivel = n; this.yaw = s.yaw + n; this.sim.world.placeChair(s); }
  begin(s) {
    if (s.t === 'walk') {
      if (this.state === 'seated') { this.queue.unshift({ t: 'stand' }, s); this.step = null; return; }
      const to = typeof s.to === 'function' ? s.to() : s.to; s.dest = to; s.path = this.sim.nav.smooth(this.sim.nav.path(this.pos.x, this.pos.z, to.x, to.z)); s.i = 1; s.ph = 0; this.state = 'walking';
      if (s.label) this.say(s.icon || '🚶', s.label);
    } else if (s.t === 'sit') {
      const seat = s.seat; s.f = fwd(seat.yaw); s.ph = 0; this.state = 'transition'; this.seat = seat; this.yaw = seat.yaw; s.from = seat.rolled; s.sw0 = seat.swivel || 0; seat.free = false;
    } else if (s.t === 'stand') {
      if (this.state !== 'seated') { this.step = null; return; }
      const seat = this.seat; s.f = fwd(seat.yaw); s.ph = 0; this.state = 'transition'; s.sw = seat.swivel || 0;
    } else if (s.t === 'act') {
      if (s.icon || s.label) this.say(s.icon || '💬', s.label || '');
      if (s.role) this.play(s.role, { name: s.clip }); if (s.prop !== undefined) this.setProp(s.prop);
      this.speaking = !!s.speaking; if (s.look !== undefined) this.look = s.look; s.dur = s.dur || 8;
      if (this.state !== 'seated') this.state = 'acting';
    } else if (s.t === 'fn') { s.fn(this); this.step = null; }
    else if (s.t === 'face') { s.target = s.yaw !== undefined ? s.yaw : null; }
  }
  run(s, dt, t) {
    const world = this.sim.world;
    if (s.t === 'walk') return this.runWalk(s, dt);
    if (s.t === 'face') { const ty = s.target !== null ? s.target : Math.atan2(s.toward().x - this.pos.x, s.toward().z - this.pos.z); if (this.turn(ty, dt, 4.5)) this.finish(); if (this.curRole !== 'idle' && this.state !== 'seated') this.play('idle'); return; }
    if (s.t === 'wait') { if (s.time >= s.dur) this.finish(); if (this.state !== 'seated' && this.curRole !== 'idle') this.play('idle'); return; }
    if (s.t === 'hold') { if (s.until(this, s) || s.time > (s.max || 120)) { s.done && s.done(this); this.finish(); } else if (s.tick) s.tick(this, s, dt); return; }
    if (s.t === 'act') { if (s.tick) s.tick(this, s, dt); if (s.time >= s.dur) { if (s.end) s.end(this); this.speaking = false; if (s.prop) this.setProp(null); this.finish(); } return; }
    if (s.t === 'sit') {
      const seat = s.seat, f = s.f;
      if (s.ph === 0) { // align + pull the chair out
        const a = Math.min(1, s.time / 0.45); seat.rolled = s.from + (1 - s.from) * ease(a); seat.swivel = s.sw0 * (1 - ease(a)); world.placeChair(seat);
        const tx = seat.pos.x - f.x * (seat.rollBack - this.sitLen()), tz = seat.pos.z - f.z * (seat.rollBack - this.sitLen());
        this.pos.x += (tx - this.pos.x) * Math.min(1, dt * 8); this.pos.z += (tz - this.pos.z) * Math.min(1, dt * 8); this.turn(seat.yaw, dt, 6);
        if (a >= 1) { s.ph = 1; s.start = this.pos.clone().set(tx, 0, tz); this.pos.copy(s.start); this.yaw = seat.yaw; s.act = this.play('sitDown', { fade: 0.25 }); s.len = this.sitLen(); }
      } else if (s.ph === 1) {
        const c = s.act.getClip(); const a = Math.min(1, s.act.time / c.duration); this.pos.x = s.start.x - f.x * s.len * a; this.pos.z = s.start.z - f.z * s.len * a;
        if (s.act.time >= c.duration - 0.02) { s.ph = 2; s.time = 0; this.pos.set(seat.pos.x - f.x * seat.rollBack, 0, seat.pos.z - f.z * seat.rollBack); this.play(seat.kind === 'desk' ? 'sitIdle' : 'sitChair', { fade: 0.35, name: seat.kind === 'desk' ? 'sit_table_idle_neutral_01' : 'sit_chair_idle_neutral_01' }); }
      } else {
        const a = Math.min(1, s.time / 0.9); seat.rolled = 1 - ease(a); this.pos.set(seat.pos.x - f.x * seat.rollBack * seat.rolled, 0, seat.pos.z - f.z * seat.rollBack * seat.rolled); world.placeChair(seat);
        if (a >= 1) { this.state = 'seated'; this.yOff = this.g === 'f' ? -0.02 : 0; this.finish(); }
      }
      return;
    }
    if (s.t === 'stand') {
      const seat = this.seat, f = s.f;
      if (s.ph === 0) {
        const a = Math.min(1, s.time / 0.75); seat.rolled = ease(a); seat.swivel = s.sw * (1 - ease(a)); this.yaw = seat.yaw + seat.swivel;
        this.pos.set(seat.pos.x - f.x * seat.rollBack * seat.rolled, 0, seat.pos.z - f.z * seat.rollBack * seat.rolled); world.placeChair(seat);
        if (a >= 1) { s.ph = 1; s.start = this.pos.clone(); this.yaw = seat.yaw; s.act = this.play('standUp', { fade: 0.25 }); s.len = Math.abs(s.act.getClip().userData.drift[2]) * 0.01; this.yOff = 0; }
      } else {
        const c = s.act.getClip(); const a = Math.min(1, s.act.time / c.duration); this.pos.x = s.start.x + f.x * s.len * a; this.pos.z = s.start.z + f.z * s.len * a;
        if (s.act.time >= c.duration - 0.02) { this.state = 'idle'; if (seat.kind !== 'desk') { seat.by = null; } seat.free = true; seat.rest = rand(-0.34, 0.34); this.seat = null; this.play('idle', { fade: 0.3 }); this.finish(); }
      }
      return;
    }
  }
  sitLen() { return Math.abs(this.clip('sit_down_chair_01', { inplace: true }).userData.drift[2]) * 0.01; }
  // where to stand before sitting on a seat
  standPoint(seat) { const f = fwd(seat.yaw); const k = seat.rollBack - this.sitLen(); return { x: seat.pos.x - f.x * k, z: seat.pos.z - f.z * k }; }
  turn(target, dt, rate = 5) { const d = wrap(target - this.yaw); const m = rate * dt; if (Math.abs(d) <= m) { this.yaw = target; return true; } this.yaw += Math.sign(d) * m; return false; }
  runWalk(s, dt) {
    const p = s.path[s.i]; if (!p) { this.arrive(s, dt); return; }
    const dx = p.x - this.pos.x, dz = p.z - this.pos.z, d = Math.hypot(dx, dz); const want = Math.atan2(dx, dz);
    if (s.ph === 0) { // initial turn on the spot when facing away
      if (Math.abs(wrap(want - this.yaw)) > 1.0 && d > 0.2) { if (this.curRole !== 'idle') this.play('idle', { fade: 0.25 }); this.turn(want, dt, 5.5); return; }
      s.ph = 1; this.play('walk', { fade: 0.3, timeScale: this.walkSpeed / this.clip('walk_neutral', { inplace: true }).userData.speed });
    }
    let speed = this.walkSpeed; const remaining = d + this.remain(s);
    // simple avoidance of other people
    let side = 0, slow = 1;
    for (const o of this.sim.agents) { if (o === this) continue; const ox = o.pos.x - this.pos.x, oz = o.pos.z - this.pos.z, od = Math.hypot(ox, oz); if (od > 1.25 || od < 1e-3) continue; const ahead = (ox * dx + oz * dz) / (od * (d || 1)); if (ahead < 0.25) continue; const cross = (dx * oz - dz * ox) / (od * (d || 1)); side += (cross > 0 ? -1 : 1) * (1.25 - od) * (o.state === 'walking' ? 0.9 : 1.4); if (od < 0.55) slow = Math.min(slow, 0.35); }
    if (remaining < 0.5) speed *= Math.max(0.45, remaining / 0.5);
    speed *= slow; const step = Math.min(d, speed * dt);
    if (d > 1e-4) { let nx = this.pos.x + dx / d * step, nz = this.pos.z + dz / d * step; if (side && remaining > 0.9) { const sx = dz / d, sz = -dx / d; const ax = nx + sx * side * dt * 0.9, az = nz + sz * side * dt * 0.9; if (!this.sim.nav.isBlocked(ax, az)) { nx = ax; nz = az; } } this.pos.x = nx; this.pos.z = nz; }
    this.yaw += wrap(want - this.yaw) * Math.min(1, dt * 7.5);
    if (this.cur && this.curRole === 'walk') this.cur.timeScale = Math.max(0.5, speed / this.clip('walk_neutral', { inplace: true }).userData.speed);
    if (d < (s.i < s.path.length - 1 ? 0.16 : 0.06)) s.i++;
    this.moving = true;
  }
  remain(s) { let r = 0; for (let k = s.i; k < s.path.length - 1; k++) r += Math.hypot(s.path[k + 1].x - s.path[k].x, s.path[k + 1].z - s.path[k].z); return r; }
  arrive(s, dt) {
    this.moving = false; if (this.curRole === 'walk') this.play('idle', { fade: 0.3 });
    const yaw = s.yaw !== undefined ? (typeof s.yaw === 'function' ? s.yaw() : s.yaw) : null;
    if (yaw !== null && !this.turn(yaw, dt, 5)) return;
    this.state = 'idle'; this.finish();
  }
  // ---------------------------------------------------------------- props (phone / cup)
  setProp(kind) {
    if (this.props.cur === kind) return; if (this.props.obj) { this.props.obj.parent && this.props.obj.parent.remove(this.props.obj); this.props.obj = null; }
    this.props.cur = kind; if (!kind) return; const cfg = this.sim.propCfg[kind]; if (!cfg) return;
    const o = cfg.make(); const hand = cfg.hand === 'L' ? this.bLH : this.bRH; o.scale.setScalar(100); o.position.fromArray(cfg.pos); o.rotation.fromArray(cfg.rot); hand.add(o); this.props.obj = o;
  }
  // two-bone IK: move the right hand to a world point, blended by weight w
  // two-bone IK: puts the wrist of one arm on a world-space target (weight w), keeping the elbow where the animation had it
  ik(side, target, w) {
    const [U, F, Hd] = this.arm[side]; if (!U || !F || !Hd) return; const S = U.getWorldPosition(_a), E = F.getWorldPosition(_b), Wp = Hd.getWorldPosition(_c);
    const la = S.distanceTo(E), lb = E.distanceTo(Wp); const toT = _e.copy(target).sub(S); let d = toT.length(); const maxD = (la + lb) * 0.985; if (d > maxD) { toT.multiplyScalar(maxD / d); d = maxD; } const n = _h.copy(toT).normalize();
    const cosA = THREE.MathUtils.clamp((la * la + d * d - lb * lb) / (2 * la * d), -1, 1); const sinA = Math.sqrt(1 - cosA * cosA);
    const pole = _f.copy(E).sub(S); pole.addScaledVector(n, -pole.dot(n)); pole.y -= 0.25; pole.addScaledVector(n, -pole.dot(n)); if (pole.lengthSq() < 1e-6) pole.set(0, -1, 0); pole.normalize();
    const E2 = _g.copy(S).addScaledVector(n, la * cosA).addScaledVector(pole, la * sinA);
    const apply = (bone, from, to) => { _q1.setFromUnitVectors(from, to); _q2.identity().slerp(_q1, w); bone.getWorldQuaternion(_q3); bone.parent.getWorldQuaternion(_q4); _q2.multiply(_q3); bone.quaternion.copy(_q4.invert().multiply(_q2)); bone.updateMatrixWorld(true); };
    apply(U, _v1.copy(E).sub(S).normalize(), _v2.copy(E2).sub(S).normalize());
    const E3 = F.getWorldPosition(_b), W3 = Hd.getWorldPosition(_c); const T2 = _d.copy(toT).add(S);
    apply(F, _v1.copy(W3).sub(E3).normalize(), _v2.copy(T2).sub(E3).normalize());
  }
  // palm down, fingers along (dx,dy,dz) in the agent's own frame (+x = their left, +z = ahead); fingers relaxed from the rest pose, tapping when `tap` > 0
  hand(side, w, dx, dy, dz, tap, t) {
    const Hd = this.arm[side][2]; if (!Hd || w < 0.01) return; const c = Math.cos(this.yaw), sn = Math.sin(this.yaw);
    const X = _a.set(dx * c + dz * sn, dy, -dx * sn + dz * c).normalize(), Z = _b.set(0, -1, 0); Z.crossVectors(X, _c.set(0, -1, 0)).normalize(); const Y = _c.crossVectors(Z, X);
    _m1.makeBasis(X, Y, Z); _q1.setFromRotationMatrix(_m1); Hd.getWorldQuaternion(_q3); _q3.slerp(_q1, w); Hd.parent.getWorldQuaternion(_q4); Hd.quaternion.copy(_q4.invert().multiply(_q3));
    const amp = this.sim.fingerAmp ?? 0.3;
    for (const f of this.fing[side]) { let curl = f.thumb ? 0 : [0.2, 0.34, 0.24][f.seg]; if (!f.thumb && f.seg === 0) curl += (this.sim.fingerAmp !== undefined ? 1 : Math.max(0, Math.sin(t * f.rate * 2.4 + f.ph) * Math.sin(t * 1.7 + f.ph * 3))) * amp * tap; _q1.setFromAxisAngle(FZ, -curl); _q2.copy(f.rest).multiply(_q1); f.bone.quaternion.slerp(_q2, w); }
  }
  // ---------------------------------------------------------------- face / head (after the mixer)
  post(dt, t) {
    this.rig.updateMatrixWorld(true);
    const lean = Math.max(this.wL, this.wR) * 0.115;
    if (lean > 0.002 && this.bSpine) { const bone = this.bSpine; _v2.set(Math.cos(this.yaw), 0, -Math.sin(this.yaw)); _q1.setFromAxisAngle(_v2, lean); bone.getWorldQuaternion(_q3); bone.parent.getWorldQuaternion(_q4); _q1.multiply(_q3); bone.quaternion.copy(_q4.invert().multiply(_q1)); bone.updateMatrixWorld(true); }
    if (this.bHead) this.bHead.getWorldPosition(this.headPos);
    // head look-at
    const working = this.state === 'seated' && !this.step && !this.conv && this.curRole === 'sitWork' && this.seat && this.seat.monitors;
    if (working) { this.workLookT -= dt; if (this.workLookT <= 0) { this.workLookT = rand(2.5, 7); const m = this.seat.monitors; this.lookWork = Math.random() < 0.8 ? m[(Math.random() * m.length) | 0] : null; } } else this.lookWork = null;
    let ty = 0, tp = 0; const lk = this.look || this.lookCam || this.lookWork; const tg = lk ? (lk.isVector3 ? lk : lk.headPos) : null;
    if (tg) { _v1.copy(tg).sub(this.headPos); const hd = Math.hypot(_v1.x, _v1.z); if (hd > 0.25) { ty = THREE.MathUtils.clamp(wrap(Math.atan2(_v1.x, _v1.z) - this.yaw), -1.15, 1.15); tp = THREE.MathUtils.clamp(Math.atan2(_v1.y, hd), -0.5, 0.45); } }
    tp += lean * 0.8; const k = 1 - Math.exp(-dt * 5); this.lookYaw += (ty - this.lookYaw) * k; this.lookPitch += (tp - this.lookPitch) * k;
    if (Math.abs(this.lookYaw) > 0.01 || Math.abs(this.lookPitch) > 0.01) {
      _v2.set(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
      for (const [bone, w] of [[this.bNeck, 0.4], [this.bHead, 0.6]]) { if (!bone) continue; _q1.setFromAxisAngle(UP, this.lookYaw * w); _q2.setFromAxisAngle(_v2, -this.lookPitch * w); _q1.multiply(_q2); bone.getWorldQuaternion(_q3); bone.parent.getWorldQuaternion(_q4); _q1.multiply(_q3); bone.quaternion.copy(_q4.invert().multiply(_q1)); bone.updateMatrixWorld(true); }
      if (this.bHead) this.bHead.getWorldPosition(this.headPos);
    }
    // hands on the keyboard / mouse while working (only when detail is on)
    if (this.sim.detail) {
      const kb = working && this.seat.kb ? this.seat.kb : null;
      if (kb) { this.kbT = kb; this.mouseT = this.seat.mouse; this.handT -= dt; if (this.handT <= 0) { const m = this.handMode; if (m !== 'type') { this.handMode = 'type'; this.handT = rand(5, 15); } else if (this.mouseT && Math.random() < 0.6) { this.handMode = 'mouse'; this.handT = rand(2, 5.5); } else { this.handMode = 'rest'; this.handT = rand(2.5, 6); } } }
      else { this.handMode = 'rest'; this.handT = rand(0.4, 2.2); }
      const m = kb ? this.handMode : 'rest', k4 = Math.min(1, dt * (kb ? 3.2 : 7)), on = m === 'rest' ? 0 : 1;
      this.wL += (on - this.wL) * k4; this.wR += (on - this.wR) * k4; this.wM += ((m === 'mouse' ? 1 : 0) - this.wM) * Math.min(1, dt * 3.2);
      if (this.kbT && this.state === 'seated' && (this.wL > 0.01 || this.wR > 0.01)) {
        const ph = this.jawT, ty = m === 'type' ? 1 : 0;
        _i.copy(this.kbT[0]); _i.x += Math.sin(t * 1.3 + ph) * 0.012 * ty; _i.z += Math.cos(t * 1.1 + ph) * 0.012 * ty; _i.y += Math.abs(Math.sin(t * 6.1 + ph)) * 0.006 * ty; this.ik('L', _i, this.wL); this.hand('L', this.wL, -0.3, -0.1, 0.95, ty, t);
        _i.copy(this.kbT[1]); _i.x += Math.sin(t * 1.5 + ph * 2) * 0.012 * ty; _i.z += Math.cos(t * 0.9 + ph * 2) * 0.012 * ty; _i.y += Math.abs(Math.sin(t * 5.3 + ph * 3)) * 0.006 * ty;
        if (this.mouseT && this.wM > 0.001) { _j.copy(this.mouseT); _j.x += Math.sin(t * 2.1 + ph) * 0.022; _j.z += Math.cos(t * 1.6 + ph) * 0.016; _i.lerp(_j, this.wM); _i.y += Math.sin(this.wM * Math.PI) * 0.03; }
        this.ik('R', _i, this.wR); this.hand('R', this.wR, 0.3 * (1 - this.wM), -0.1, 0.95, ty * (1 - this.wM) + 0.25 * this.wM, t);
      }
    } else { this.wL = this.wR = this.wM = 0; }
    // blink
    this.blinkAt -= dt; if (this.blinkAt <= 0) { this.blink = 0.16; this.blinkAt = rand(2.2, 6); }
    if (this.blink > 0 || this._lidDirty) { this.blink = Math.max(0, this.blink - dt); const a = Math.sin(Math.min(1, this.blink / 0.16) * Math.PI); const d = this.sim.blinkDelta[this.g]; this.lids.forEach((l, i) => { l.position.copy(this.lidRest[i]); if (d) l.position.addScaledVector(d, a); }); this._lidDirty = this.blink > 0; }
    // jaw
    if (this.bJaw) { const target = this.jawForce !== undefined ? this.jawForce : this.speaking ? (0.35 + 0.65 * Math.abs(Math.sin(t * 9.1 + this.jawT) * Math.sin(t * 5.3 + this.jawT * 2))) * (Math.sin(t * 1.3 + this.jawT) > -0.6 ? 1 : 0.1) : 0; this.jaw += (target - this.jaw) * Math.min(1, dt * 18); const cfg = this.sim.jawCfg; _q1.setFromAxisAngle(cfg.axis, cfg.max * this.jaw); this.bJaw.quaternion.copy(this.jawRest).multiply(_q1); }
  }
}

// ======================================================================= director
export class Sim {
  constructor({ world, nav, pack, config }) {
    this.world = world; this.nav = nav; this.pack = pack; this.config = config; this.agents = []; this.byId = new Map(); this.twins = new Map();
    this.detail = true; this.time = 0; this.meeting = null; this.nextMeeting = rand(170, 260); this.paused = false;
    this.blinkDelta = {}; for (const g of ['m', 'f']) { try { const f = pack.json(`an/${g}_idle_neutral_01/meta.json`).face.Bip01_LEyeBlinkTop; if (f && f.d > 0.3) this.blinkDelta[g] = new THREE.Vector3(f.far[0] - f.rest[0], f.far[1] - f.rest[1], f.far[2] - f.rest[2]); } catch (e) {} }
    this.jawCfg = { axis: new THREE.Vector3(0, 0, 1), max: 0.13 };
    this.propCfg = {
      phone: { hand: 'R', pos: [8.6, 0, -2.4], rot: [0, Math.PI / 2, 0], make: () => F.box(0.07, 0.008, 0.145, F.MAT.black(), 0, 0, 0, { r: 0.003 }) },
      cup: { hand: 'R', pos: [8, 0, 3.5], rot: [Math.PI / 2, 0, 0], make: () => { const g = new THREE.Group(); g.add(F.cyl(0.036, 0.03, 0.085, F.MAT.color(0xffffff, 0.4), 0, 0, 0, 14)); return g; } },
    };
  }
  clip(g, base, opts) { const n = this.pack.has(`an/${g}_${base}/meta.json`) ? `${g}_${base}` : `m_${base}`; return buildClip(this.pack, n, opts); }
  twin(clip) { if (!this.twins.has(clip.uuid)) { const c = clip.clone(); c.userData = clip.userData; c.name = clip.name + '#2'; this.twins.set(clip.uuid, c); this.twins.set(c.uuid, clip); } return this.twins.get(clip.uuid); }
  add(def, av) {
    const a = new Agent(this, def, av); this.agents.push(a); this.byId.set(a.id, a);
    const seat = this.world.seats.get(def.seat); a.home = seat; if (seat) { seat.by = a; seat.owner = a; a.seat = seat; a.state = 'seated'; seat.rolled = 0; seat.free = false; seat.swivel = 0; this.world.placeChair(seat); a.pos.copy(seat.pos); a.yaw = seat.yaw; a.yOff = a.g === 'f' ? -0.02 : 0; a.play('sitWork', { fade: 0 }); a.cur.time = Math.random() * 6; }
    a.say('💼', def.workLabel || 'Trabalhando no posto', false); return a;
  }
  // ------------------------------------------------------------ building blocks
  goHome(a) { const s = a.home; return [{ t: 'walk', to: () => a.standPoint(s), yaw: s.yaw, label: 'Voltando ao posto', icon: '🚶' }, { t: 'sit', seat: s }, { t: 'fn', fn: () => { a.say('💼', a.def.workLabel || 'Trabalhando no posto'); a.nextPlan = this.time + rand(18, 50); } }]; }
  reserve(a, spot) { spot.by = a; a.cleanup.push(() => { if (spot.by === a) spot.by = null; }); }
  freeSpot(ids) { const c = ids.map(i => this.world.spots.get(i)).filter(s => s && !s.by); return c.length ? pick(c) : null; }
  visitorPoint(target, a) { const s = target.home; const pts = (s.visitor || []).filter(p => !this.agents.some(o => o !== a && Math.hypot(o.pos.x - p[0], o.pos.z - p[1]) < 0.6) && !(s._res || []).includes(p)); return pts.length ? pick(pts) : null; }
  // a walks to b's desk and they talk
  visit(a, b, { dur = rand(13, 22), then = null, topic = null } = {}) {
    if (!b || b === a || b.state !== 'seated' || b.seat !== b.home || b.busy || b.expecting || b.conv) return false;
    const p = this.visitorPoint(b, a); if (!p) return false;
    b.expecting = a; b.nextPlan = Math.max(b.nextPlan, this.time + 60); a.cleanup.push(() => { if (b.expecting === a) b.expecting = null; if (b.conv && b.conv.with === a) this.endConv(b); });
    const label = b.def.kind === 'president' ? 'Indo falar com o Presidente' : `Indo falar com ${b.def.name}`;
    a.enqueue({ t: 'walk', to: { x: p[0], z: p[1] }, yaw: () => Math.atan2(b.pos.x - p[0], b.pos.z - p[1]), label, icon: '🚶' },
      { t: 'fn', fn: () => { if (b.state !== 'seated' || b.busy) { a.interrupt(); a.enqueue(this.goHome(a)); return; } this.beginConv(a, b, topic); } },
      { t: 'act', dur, tick: (ag, s, dt) => this.convTick(a, b, s, dt), end: () => { this.endConv(a); this.endConv(b); b.expecting = null; b.nextPlan = this.time + rand(8, 25); } },
      then || this.goHome(a));
    return true;
  }
  beginConv(a, b, topic) {
    a.conv = { with: b, speaker: a, next: this.time + rand(3, 5.5) }; b.conv = { with: a, speaker: a };
    a.look = b; b.look = a; a.speaking = true; b.speaking = false; a.play('talk'); if (b.state === 'seated') b.play('sitIdle', { name: 'sit_table_idle_neutral_01' }); else b.play('listen');
    a.say('💬', topic || `Conversando com ${b.def.name}`); b.say('💬', `Conversando com ${a.def.name}`);
  }
  convTick(a, b, s, dt) {
    const c = a.conv; if (!c || !b.conv || b.conv.with !== a) { s.time = s.dur; return; }
    if (b.state === 'seated') { const want = THREE.MathUtils.clamp(wrap(Math.atan2(a.pos.x - b.pos.x, a.pos.z - b.pos.z) - b.seat.yaw), -1.25, 1.25); b.swivelTo(want, dt); }
    else b.yaw += wrap(Math.atan2(a.pos.x - b.pos.x, a.pos.z - b.pos.z) - b.yaw) * Math.min(1, dt * 4);
    if (this.time > c.next) { c.speaker = c.speaker === a ? b : a; c.next = this.time + rand(2.8, 6); const sp = c.speaker, li = sp === a ? b : a; sp.speaking = true; li.speaking = false; if (sp.state !== 'seated') sp.play('talk'); if (li.state !== 'seated') li.play('listen'); else li.play('sitIdle', { name: pick(['sit_table_idle_neutral_01', 'sit_table_gestic_thoughtful', 'sit_table_idle_relaxed_01']) }); }
  }
  endConv(x) { if (!x) return; x.conv = null; x.speaking = false; x.look = null; if (x.state === 'seated' && !x.busy) x.say('💼', x.def.workLabel || 'Trabalhando no posto', false); }
  // two people meet standing at a pair of spots
  chat(a, b, s1, s2, dur = rand(12, 20)) {
    if (!s1 || !s2 || b.busy || b.expecting || b.conv || b.state !== 'seated') return false;
    this.reserve(a, s1); this.reserve(b, s2); b.nextPlan = this.time + 90; const st = { arrived: 0 };
    const mk = (x, y, sp, lead) => { x.enqueue({ t: 'walk', to: { x: sp.pos.x, z: sp.pos.z }, yaw: sp.yaw, label: `Indo encontrar ${y.def.name}`, icon: '🚶' }, { t: 'fn', fn: () => { st.arrived++; x.look = y; } }, { t: 'hold', until: () => st.arrived >= 2, max: 30, tick: (ag) => { if (ag.curRole !== 'idle') ag.play('idle'); } },
      lead ? [{ t: 'fn', fn: () => this.beginConv(a, b) }, { t: 'act', dur, tick: (ag, s, dt) => this.convTick(a, b, s, dt), end: () => { this.endConv(a); this.endConv(b); st.done = true; } }] : { t: 'hold', until: () => st.done, max: dur + 40 },
      { t: 'fn', fn: () => x.runCleanup() }, this.goHome(x)); };
    mk(a, b, s1, true); mk(b, a, s2, false); return true;
  }
  errand(a, e) {
    const sp = this.world.spots.get(e.spot); if (!sp || sp.by) return false; this.reserve(a, sp);
    a.enqueue({ t: 'walk', to: { x: sp.pos.x, z: sp.pos.z }, yaw: sp.yaw, label: e.go || 'A caminho', icon: '🚶' }, { t: 'act', role: e.role, clip: e.clip, dur: rand(e.dur[0], e.dur[1]), label: e.label, icon: e.icon, prop: e.prop, speaking: !!e.speaking }, { t: 'fn', fn: () => a.runCleanup() }, this.goHome(a)); return true;
  }
  coffee(a) {
    const W = this.world; const m = W.spots.get('copa.machine'); const tb = this.freeSpot(['copa.t1', 'copa.t2', 'copa.t3', 'copa.water']); if (!tb || m.by) return false;
    this.reserve(a, tb); this.reserve(a, m); const others = () => this.agents.filter(o => o !== a && o.state === 'acting' && Math.hypot(o.pos.x - a.pos.x, o.pos.z - a.pos.z) < 2.2);
    a.enqueue({ t: 'walk', to: { x: m.pos.x + rand(-0.15, 0.15), z: m.pos.z + rand(-0.1, 0.1) }, yaw: m.yaw, label: 'Indo tomar um café', icon: '☕' },
      { t: 'act', role: 'workStand', dur: rand(4.5, 6.5), label: 'Preparando o café', icon: '☕' }, { t: 'fn', fn: () => { if (m.by === a) m.by = null; a.setProp('cup'); } },
      { t: 'walk', to: { x: tb.pos.x, z: tb.pos.z }, yaw: tb.yaw }, { t: 'act', role: 'drink', dur: rand(14, 24), label: 'Pausa para o café', icon: '☕', prop: 'cup', tick: (ag, s) => { const o = others(); ag.look = o.length ? o[0] : null; ag.speaking = o.length > 0 && Math.sin(this.time * 0.5 + ag.jawT) > 0.2; } },
      { t: 'fn', fn: () => { a.look = null; a.speaking = false; a.setProp(null); a.runCleanup(); } }, this.goHome(a)); return true;
  }
  // ------------------------------------------------------------ meeting
  startMeeting(ids = null) {
    if (this.meeting) return false; const W = this.world; const seats = [...W.seats.values()].filter(s => s.kind === 'meeting');
    const thiago = this.byId.get('thiago'); let cand = ids ? ids.map(i => this.byId.get(i)).filter(Boolean) : this.agents.filter(a => a.def.kind !== 'reception' && a !== thiago);
    cand = cand.filter(a => a.def.kind !== 'reception' && a !== thiago).sort(() => Math.random() - 0.5).slice(0, seats.length);
    const mt = { people: [], seated: 0, start: null, dur: rand(36, 52), presenter: thiago, over: false }; this.meeting = mt;
    const sp = W.spots.get('reuniao.present');
    const leave = (a) => { a.look = null; a.speaking = false; };
    // presenter
    thiago.interrupt(); thiago.enqueue({ t: 'walk', to: { x: sp.pos.x, z: sp.pos.z }, yaw: sp.yaw, label: 'Indo para a reunião geral', icon: '📣' }, { t: 'fn', fn: () => { mt.presenterIn = true; } },
      { t: 'hold', until: () => mt.seated >= Math.max(1, mt.people.length - 1) || mt.over, max: 45, tick: (ag) => { if (ag.curRole !== 'idle') ag.play('idle'); } },
      { t: 'fn', fn: () => { mt.start = this.time; thiago.say('📣', 'Conduzindo a reunião geral'); } },
      { t: 'act', role: 'present', dur: mt.dur, speaking: true, tick: (ag, s) => { ag.speaking = Math.sin(this.time * 0.35) > -0.75; } }, { t: 'fn', fn: () => { mt.over = true; leave(thiago); this.meeting = null; this.nextMeeting = this.time + rand(300, 460); } }, this.goHome(thiago));
    cand.forEach((a, i) => { const seat = seats[i]; if (!seat || seat.by) return; a.interrupt(); seat.by = a; mt.people.push(a); a.cleanup.push(() => { if (seat.by === a && a.seat !== seat) seat.by = null; });
      a.enqueue({ t: 'wait', dur: rand(0, 3.5) }, { t: 'walk', to: () => a.standPoint(seat), yaw: seat.yaw, label: 'Indo para a reunião geral', icon: '📣' }, { t: 'sit', seat }, { t: 'fn', fn: () => { mt.seated++; a.look = thiago; a.say('📣', 'Na reunião geral'); } },
        { t: 'hold', until: () => mt.over, max: 140, tick: (ag) => { if (ag.curRole !== 'sitChair' && ag.curRole !== 'sitIdle') ag.play('sitChair'); } }, { t: 'fn', fn: () => leave(a) }, { t: 'wait', dur: rand(0, 2.5) }, { t: 'stand' }, this.goHome(a)); });
    return true;
  }
  // short celebration (a new order came in)
  celebrate(a, label = 'Comemorando o novo pedido') {
    if (!a || a.busy || a.conv || a.expecting || a.state === 'transition') return false;
    if (a.state === 'seated' && a.seat !== a.home) return false;
    a.enqueue(a.state === 'seated' ? { t: 'stand' } : null, { t: 'act', role: 'cheer', dur: rand(3.6, 4.6), label, icon: '🎉' }, this.goHome(a)); return true;
  }
  allHome() { this.meeting = null; for (const a of this.agents) { if (a.state === 'seated' && a.seat === a.home && !a.busy) continue; a.interrupt(); if (a.state === 'seated' && a.seat !== a.home) a.enqueue({ t: 'stand' }); a.enqueue(this.goHome(a)); } }
  command(a, cmd) {
    const thiago = this.byId.get('thiago');
    if (cmd === 'home') { a.interrupt(); if (a.state === 'seated' && a.seat === a.home) return; if (a.state === 'seated') a.enqueue({ t: 'stand' }); a.enqueue(this.goHome(a)); }
    else if (cmd === 'coffee') { a.interrupt(); if (!this.coffee(a)) { a.say('⏳', 'Copa ocupada — tenta de novo em instantes', false); if (!(a.state === 'seated' && a.seat === a.home)) a.enqueue(this.goHome(a)); } }
    else if (cmd === 'president' && a !== thiago) { a.interrupt(); if (!this.visit(a, thiago, { dur: rand(16, 24), topic: 'Reportando ao Presidente' })) { a.say('⏳', 'Presidente ocupado — tenta de novo em instantes'); if (a.state !== 'seated') a.enqueue(this.goHome(a)); } }
    else if (cmd === 'visit' && a === thiago) { a.interrupt(); const c = this.agents.filter(o => o.def.kind === 'head' || o.def.kind === 'chief'); for (const o of c.sort(() => Math.random() - 0.5)) if (this.visit(a, o, { topic: `Passando no setor: ${o.def.dept}` })) return; a.enqueue(this.goHome(a)); }
    else if (cmd === 'phone') { a.interrupt(); if (!this.phone(a) && !(a.state === 'seated' && a.seat === a.home)) a.enqueue(this.goHome(a)); }
  }
  phone(a) {
    const W = this.world; let sp = a.def.kind === 'president' ? W.spots.get('pres.window') : null;
    if (!sp || sp.by) { const p = this.freePoint(a.home.room, a.home.pos, 1.3, 3.6, a); if (!p) return false; sp = { pos: new THREE.Vector3(p.x, 0, p.z), yaw: Math.atan2(a.home.pos.x - p.x, a.home.pos.z - p.z) + Math.PI + rand(-0.9, 0.9), by: null }; }
    else this.reserve(a, sp);
    a.enqueue({ t: 'walk', to: { x: sp.pos.x, z: sp.pos.z }, yaw: sp.yaw, label: 'Atendendo o telefone', icon: '📞' }, { t: 'act', role: 'phone', dur: rand(11, 18), label: 'Em ligação', icon: '📞', prop: 'phone', speaking: true, tick: (ag) => { ag.speaking = Math.sin(this.time * 0.7 + ag.jawT) > -0.2; } }, { t: 'fn', fn: () => a.runCleanup() }, this.goHome(a)); return true;
  }
  // a free standing point inside a room, away from furniture and from other people
  freePoint(roomId, near, minD, maxD, self) {
    const r = this.world.rooms[roomId]; if (!r) return null; const nav = this.nav;
    for (let i = 0; i < 60; i++) { const x = rand(r.x1 + 0.7, r.x2 - 0.7), z = rand(r.z1 + 0.7, r.z2 - 0.7); const d = Math.hypot(x - near.x, z - near.z); if (d < minD || d > maxD) continue; let ok = true; for (const [dx, dz] of [[0, 0], [0.35, 0], [-0.35, 0], [0, 0.35], [0, -0.35]]) if (nav.isBlocked(x + dx, z + dz)) { ok = false; break; } if (!ok) continue; if (this.agents.some(o => o !== self && Math.hypot(o.pos.x - x, o.pos.z - z) < 0.9)) continue; if ([...this.world.spots.values()].some(s => Math.hypot(s.pos.x - x, s.pos.z - z) < 0.6)) continue; if ([...this.world.seats.values()].some(s => Math.hypot(s.pos.x - x, s.pos.z - z) < 1.0 || (s.visitor || []).some(v => Math.hypot(v[0] - x, v[1] - z) < 0.7))) continue; return { x, z }; }
    return null;
  }
  sameRoom(seat, p) { const r = this.world.rooms[seat.room]; return r && p.x > r.x1 + 0.4 && p.x < r.x2 - 0.4 && p.z > r.z1 + 0.4 && p.z < r.z2 - 0.4; }
  // ------------------------------------------------------------ planner
  plan(a) {
    const k = a.def.kind, r = Math.random(); const thiago = this.byId.get('thiago'), hermes = this.byId.get('hermes');
    const heads = this.agents.filter(o => o.def.kind === 'head'); const mates = this.agents.filter(o => o !== a && o.home.room === a.home.room);
    const away = this.agents.filter(o => o.state !== 'seated' || o.busy).length; if (away >= Math.ceil(this.agents.length * 0.6)) return false;
    const errands = a.def.errands || [];
    const tryList = (fns) => { for (const f of fns) if (f()) return true; return false; };
    const doErrand = () => errands.length ? this.errand(a, pick(errands)) : false;
    if (k === 'president') { if (r < 0.34) return tryList([() => this.visit(a, pick([...heads, hermes]), { topic: 'Passando nos setores' }), () => this.phone(a)]); if (r < 0.58) return this.phone(a); if (r < 0.74) return this.coffee(a); if (r < 0.86) return doErrand(); return false; }
    if (k === 'chief') { if (r < 0.3) return tryList([() => this.visit(a, thiago, { topic: 'Alinhando prioridades com o Presidente' }), doErrand]); if (r < 0.6) return tryList([() => this.visit(a, pick(heads)), doErrand]); if (r < 0.8) return doErrand(); if (r < 0.93) return this.coffee(a); return this.phone(a); }
    if (k === 'head') { if (r < 0.36) return doErrand(); if (r < 0.5) return tryList([() => this.visit(a, pick([...heads, hermes].filter(o => o !== a))), doErrand]); if (r < 0.6) return tryList([() => this.visit(a, thiago, { topic: 'Reportando ao Presidente' }), doErrand]); if (r < 0.78) return this.coffee(a); if (r < 0.9) return this.phone(a); const o = pick(heads.filter(o => o !== a)); const sp = this.world.spots; const pair = !sp.get('cor.a1').by && !sp.get('cor.a2').by ? ['cor.a1', 'cor.a2'] : (!sp.get('cor.b1').by && !sp.get('cor.b2').by ? ['cor.b1', 'cor.b2'] : null); return (pair && this.chat(a, o, sp.get(pair[0]), sp.get(pair[1]))) || doErrand(); }
    if (k === 'staff') { if (r < 0.3) return tryList([() => this.visit(a, pick(mates)), doErrand]); if (r < 0.58) return doErrand(); if (r < 0.8) return this.coffee(a); return this.phone(a); }
    if (k === 'reception') { if (r < 0.35) return this.coffee(a); if (r < 0.7) return doErrand(); return false; }
    return false;
  }
  update(dt) {
    if (this.paused) return; this.time += dt; const t = this.time;
    for (const a of this.agents) {
      if (!a.busy && a.state === 'seated' && a.seat === a.home && !a.expecting && !a.conv && t > a.nextPlan) { const ok = this.plan(a); a.nextPlan = t + (ok ? 30 : rand(6, 16)); }
      if (!a.busy && a.state === 'seated' && a.seat !== a.home) { a.runCleanup(); a.enqueue({ t: 'stand' }, this.goHome(a)); }
      if (!a.busy && a.state !== 'seated' && a.state !== 'transition') { a.idleFor = (a.idleFor || 0) + dt; if (a.idleFor > 2.5) { a.idleFor = 0; a.runCleanup(); a.enqueue(this.goHome(a)); } } else a.idleFor = 0;
      a.update(dt, t);
    }
    if (!this.meeting && t > this.nextMeeting) { if (!this.startMeeting()) this.nextMeeting = t + 30; }
  }
}
