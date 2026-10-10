// Asset pack: [u32 headerLen][header JSON {files:{path:[off,len]}}][data...]
export class Pack {
  constructor(arrayBuffer) {
    const dv = new DataView(arrayBuffer);
    const hl = dv.getUint32(0, true);
    this.index = JSON.parse(new TextDecoder().decode(new Uint8Array(arrayBuffer, 4, hl))).files;
    this.base = 4 + hl;
    this.ab = arrayBuffer;
    this._json = new Map();
  }
  has(p) { return !!this.index[p]; }
  list(prefix) { return Object.keys(this.index).filter(k => k.startsWith(prefix)); }
  // returns a fresh, aligned ArrayBuffer slice
  buf(p) { const e = this.index[p]; if (!e) throw new Error('pack: missing ' + p); return this.ab.slice(this.base + e[0], this.base + e[0] + e[1]); }
  json(p) { if (!this._json.has(p)) this._json.set(p, JSON.parse(new TextDecoder().decode(this.buf(p)))); return this._json.get(p); }
  blob(p, type) { return new Blob([this.buf(p)], { type }); }
}
export async function unpackBase64Gzip(b64) {
  const bin = atob(b64); const u = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  const ds = new DecompressionStream('gzip');
  const ab = await new Response(new Blob([u]).stream().pipeThrough(ds)).arrayBuffer();
  return new Pack(ab);
}
