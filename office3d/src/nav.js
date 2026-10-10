// Grid navigation: A* over a blocked-cell grid built from the world's obstacle boxes, plus path smoothing.
export class Nav {
  constructor(bounds, obstacles, { cell = 0.2, wallPad = 0.3, objPad = 0.24 } = {}) {
    this.cell = cell; this.x0 = bounds.x1; this.z0 = bounds.z1;
    this.nx = Math.ceil((bounds.x2 - bounds.x1) / cell); this.nz = Math.ceil((bounds.z2 - bounds.z1) / cell);
    this.blocked = new Uint8Array(this.nx * this.nz);
    for (const o of obstacles) this.block(o.x1, o.z1, o.x2, o.z2, o.wall ? wallPad : objPad);
    // outer border
    for (let i = 0; i < this.nx; i++) { this.blocked[i] = 1; this.blocked[(this.nz - 1) * this.nx + i] = 1; }
    for (let j = 0; j < this.nz; j++) { this.blocked[j * this.nx] = 1; this.blocked[j * this.nx + this.nx - 1] = 1; }
  }
  block(x1, z1, x2, z2, pad = 0) {
    const i1 = Math.max(0, Math.floor((x1 - pad - this.x0) / this.cell)), i2 = Math.min(this.nx - 1, Math.floor((x2 + pad - this.x0) / this.cell));
    const j1 = Math.max(0, Math.floor((z1 - pad - this.z0) / this.cell)), j2 = Math.min(this.nz - 1, Math.floor((z2 + pad - this.z0) / this.cell));
    for (let j = j1; j <= j2; j++) for (let i = i1; i <= i2; i++) { const cx = this.x0 + (i + 0.5) * this.cell, cz = this.z0 + (j + 0.5) * this.cell; if (cx >= x1 - pad && cx <= x2 + pad && cz >= z1 - pad && cz <= z2 + pad) this.blocked[j * this.nx + i] = 1; }
  }
  blockCircle(x, z, r) { const n = Math.ceil(r / this.cell); const ci = Math.floor((x - this.x0) / this.cell), cj = Math.floor((z - this.z0) / this.cell); for (let j = cj - n; j <= cj + n; j++) for (let i = ci - n; i <= ci + n; i++) { if (i < 0 || j < 0 || i >= this.nx || j >= this.nz) continue; const cx = this.x0 + (i + 0.5) * this.cell, cz = this.z0 + (j + 0.5) * this.cell; if ((cx - x) ** 2 + (cz - z) ** 2 <= r * r) this.blocked[j * this.nx + i] = 1; } }
  cellOf(x, z) { return [Math.min(this.nx - 1, Math.max(0, Math.floor((x - this.x0) / this.cell))), Math.min(this.nz - 1, Math.max(0, Math.floor((z - this.z0) / this.cell)))]; }
  isBlocked(x, z) { const [i, j] = this.cellOf(x, z); return this.blocked[j * this.nx + i] === 1; }
  nearestFree(i, j) {
    if (!this.blocked[j * this.nx + i]) return [i, j];
    for (let r = 1; r < 14; r++) { let best = null, bd = 1e9; for (let dj = -r; dj <= r; dj++) for (let di = -r; di <= r; di++) { if (Math.max(Math.abs(di), Math.abs(dj)) !== r) continue; const a = i + di, b = j + dj; if (a < 0 || b < 0 || a >= this.nx || b >= this.nz || this.blocked[b * this.nx + a]) continue; const d = di * di + dj * dj; if (d < bd) { bd = d; best = [a, b]; } } if (best) return best; }
    return [i, j];
  }
  los(ax, az, bx, bz) { const d = Math.hypot(bx - ax, bz - az); const n = Math.max(1, Math.ceil(d / (this.cell * 0.45))); for (let k = 0; k <= n; k++) { const t = k / n; if (this.isBlocked(ax + (bx - ax) * t, az + (bz - az) * t)) return false; } return true; }
  // returns [{x,z},...] including start and goal (exact coordinates)
  path(sx, sz, gx, gz) {
    const nx = this.nx, nz = this.nz, B = this.blocked;
    const [si, sj] = this.nearestFree(...this.cellOf(sx, sz)); const [gi, gj] = this.nearestFree(...this.cellOf(gx, gz));
    const S = sj * nx + si, Gl = gj * nx + gi; const N = nx * nz;
    const g = new Float32Array(N).fill(Infinity), f = new Float32Array(N).fill(Infinity), came = new Int32Array(N).fill(-1), closed = new Uint8Array(N);
    const heap = []; const push = (n) => { heap.push(n); let i = heap.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (f[heap[p]] <= f[heap[i]]) break; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p; } };
    const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let i = 0; for (;;) { const l = i * 2 + 1, r = l + 1; let m = i; if (l < heap.length && f[heap[l]] < f[heap[m]]) m = l; if (r < heap.length && f[heap[r]] < f[heap[m]]) m = r; if (m === i) break; [heap[m], heap[i]] = [heap[i], heap[m]]; i = m; } } return top; };
    const hh = (n) => { const di = Math.abs((n % nx) - gi), dj = Math.abs(((n / nx) | 0) - gj); return (di + dj) + (1.4142 - 2) * Math.min(di, dj); };
    g[S] = 0; f[S] = hh(S); push(S); let found = false;
    while (heap.length) {
      const c = pop(); if (closed[c]) continue; closed[c] = 1; if (c === Gl) { found = true; break; }
      const ci = c % nx, cj = (c / nx) | 0;
      for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
        if (!di && !dj) continue; const a = ci + di, b = cj + dj; if (a < 0 || b < 0 || a >= nx || b >= nz) continue; const n = b * nx + a; if (B[n] || closed[n]) continue;
        if (di && dj && (B[cj * nx + a] || B[b * nx + ci])) continue;
        const ng = g[c] + (di && dj ? 1.4142 : 1); if (ng < g[n]) { g[n] = ng; f[n] = ng + hh(n); came[n] = c; push(n); }
      }
    }
    const pts = [];
    if (found) { for (let c = Gl; c !== -1; c = came[c]) pts.push({ x: this.x0 + ((c % nx) + 0.5) * this.cell, z: this.z0 + (((c / nx) | 0) + 0.5) * this.cell }); pts.reverse(); }
    pts.unshift({ x: sx, z: sz }); pts.push({ x: gx, z: gz });
    // string pulling
    const out = [pts[0]]; let i = 0;
    while (i < pts.length - 1) { let j = pts.length - 1; for (; j > i + 1; j--) { const direct = (i === 0 || j === pts.length - 1) ? this.losLoose(pts[i], pts[j]) : this.los(pts[i].x, pts[i].z, pts[j].x, pts[j].z); if (direct) break; } out.push(pts[j]); i = j; }
    return out;
  }
  // round the corners of a path so people walk in arcs instead of pivoting
  smooth(pts) {
    let p = pts;
    for (let it = 0; it < 2; it++) { if (p.length < 3) break; const out = [p[0]];
      for (let i = 1; i < p.length - 1; i++) { const a = p[i - 1], b = p[i], c = p[i + 1]; const la = Math.hypot(a.x - b.x, a.z - b.z), lc = Math.hypot(c.x - b.x, c.z - b.z); const ca = Math.min(la * 0.3, it ? 0.3 : 0.7) / (la || 1), cc = Math.min(lc * 0.3, it ? 0.3 : 0.7) / (lc || 1);
        const q = { x: b.x + (a.x - b.x) * ca, z: b.z + (a.z - b.z) * ca }, r = { x: b.x + (c.x - b.x) * cc, z: b.z + (c.z - b.z) * cc };
        if (la > 0.3 && lc > 0.3 && this.los(q.x, q.z, r.x, r.z)) { out.push(q, r); } else out.push(b); }
      out.push(p[p.length - 1]); p = out; }
    return p;
  }
  // start/goal may sit inside padded cells (e.g. right next to a desk): ignore the first/last 0.45 m
  losLoose(a, b) { const d = Math.hypot(b.x - a.x, b.z - a.z); if (d < 0.5) return true; const n = Math.ceil(d / (this.cell * 0.45)); for (let k = 0; k <= n; k++) { const t = k / n; const dist = t * d; if (dist < 0.45 || d - dist < 0.45) continue; if (this.isBlocked(a.x + (b.x - a.x) * t, a.z + (b.z - a.z) * t)) return false; } return true; }
}
