import * as THREE from 'three';

const texCache = new Map();
export const texOpts = { max: 0 }; // > 0 shrinks big textures at load (phones)
export async function loadTexture(pack, path, { srgb = true } = {}) {
  if (texCache.has(path)) return texCache.get(path);
  const type = path.endsWith('.png') ? 'image/png' : path.endsWith('.jpg') ? 'image/jpeg' : 'image/webp';
  let bmp = await createImageBitmap(pack.blob(path, type), { premultiplyAlpha: 'none', colorSpaceConversion: 'none' });
  if (texOpts.max && Math.max(bmp.width, bmp.height) > texOpts.max) { try { const k = texOpts.max / Math.max(bmp.width, bmp.height); const small = await createImageBitmap(bmp, { resizeWidth: Math.round(bmp.width * k), resizeHeight: Math.round(bmp.height * k), resizeQuality: 'high', premultiplyAlpha: 'none', colorSpaceConversion: 'none' }); bmp.close(); bmp = small; } catch (e) {} }
  const t = new THREE.Texture(bmp);
  t.flipY = false; // images are pre-flipped at build time
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8; t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.needsUpdate = true;
  texCache.set(path, t);
  return t;
}

const templates = new Map();
export async function avatarTemplate(pack, name) {
  if (templates.has(name)) return templates.get(name);
  const d = `av/${name}/`;
  const meta = pack.json(d + 'meta.json');
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pack.buf(d + 'pos.f32')), 3));
  g.setAttribute('normal', new THREE.BufferAttribute(new Int8Array(pack.buf(d + 'nor.i8')), 3, true));
  g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(pack.buf(d + 'uv.f32')), 2));
  g.setAttribute('skinIndex', new THREE.BufferAttribute(new Uint8Array(pack.buf(d + 'si.u8')), 4));
  g.setAttribute('skinWeight', new THREE.BufferAttribute(new Uint8Array(pack.buf(d + 'sw.u8')), 4, true));
  const ib = pack.buf(d + 'idx.bin');
  g.setIndex(new THREE.BufferAttribute(meta.index32 ? new Uint32Array(ib) : new Uint16Array(ib), 1));
  meta.groups.forEach(gr => g.addGroup(gr.start, gr.count, gr.mat));
  const mats = [];
  for (const mn of meta.mats) {
    const kind = /glasses/.test(mn) ? 'glasses' : /opacity/.test(mn) ? 'hair' : /head/.test(mn) ? 'head' : 'body';
    const map = await loadTexture(pack, `${d}${kind}.webp`);
    const m = new THREE.MeshStandardMaterial({ map, roughness: kind === 'head' ? 0.62 : 0.82, metalness: 0, name: kind });
    if (kind === 'hair') { m.alphaTest = 0.42; m.side = THREE.DoubleSide; m.roughness = 0.7; m.alphaToCoverage = true; }
    if (kind === 'glasses') { m.transparent = true; m.depthWrite = false; m.side = THREE.DoubleSide; m.roughness = 0.2; }
    mats.push(m);
  }
  const t = { name, meta, geometry: g, materials: mats, inv: new Float32Array(pack.buf(d + 'inv.f32')) };
  templates.set(name, t);
  return t;
}

export function instantiateAvatar(t) {
  const meta = t.meta;
  const rig = new THREE.Group(); rig.name = 'rig:' + t.name;
  const nodes = meta.bones.map(b => { const n = new THREE.Bone(); n.name = b.name; n.position.fromArray(b.p); n.quaternion.fromArray(b.q); n.scale.fromArray(b.s); return n; });
  meta.bones.forEach((b, i) => { (b.parent < 0 ? rig : nodes[b.parent]).add(nodes[i]); });
  const bones = meta.skel.map(i => nodes[i]);
  const inverses = bones.map((_, i) => new THREE.Matrix4().fromArray(t.inv, i * 16));
  const skeleton = new THREE.Skeleton(bones, inverses);
  const mesh = new THREE.SkinnedMesh(t.geometry, t.materials);
  mesh.matrix.fromArray(meta.meshMatrix); mesh.matrix.decompose(mesh.position, mesh.quaternion, mesh.scale);
  rig.add(mesh);
  mesh.bind(skeleton, new THREE.Matrix4().fromArray(meta.bindMatrix));
  mesh.frustumCulled = false; mesh.castShadow = true; mesh.receiveShadow = false;
  rig.scale.setScalar(0.01); // cm -> m
  const byName = new Map(nodes.map(n => [n.name, n]));
  const rest = new Map(meta.bones.map(b => [b.name, { p: new THREE.Vector3().fromArray(b.p), q: new THREE.Quaternion().fromArray(b.q) }]));
  return { rig, mesh, skeleton, bones: byName, rest, height: meta.height * 0.01, template: t };
}

const clipCache = new Map();
// opts.inplace: remove linear horizontal drift (locomotion loops)
export function buildClip(pack, name, opts = {}) {
  const key = name + (opts.inplace ? ':ip' : '');
  if (clipCache.has(key)) return clipCache.get(key);
  const d = `an/${name}/`;
  const m = pack.json(d + 'meta.json');
  const q = new Int16Array(pack.buf(d + 'q.i16'));
  const root = new Float32Array(pack.buf(d + 'root.f32'));
  const F = m.frames, B = m.bones.length;
  const times = new Float32Array(F); for (let i = 0; i < F; i++) times[i] = Math.min(i / m.fps, m.duration);
  const tracks = [];
  for (let b = 0; b < B; b++) {
    const v = new Float32Array(F * 4);
    for (let f = 0; f < F; f++) { const k = (f * B + b) * 4; v[f * 4] = q[k] / 32767; v[f * 4 + 1] = q[k + 1] / 32767; v[f * 4 + 2] = q[k + 2] / 32767; v[f * 4 + 3] = q[k + 3] / 32767; }
    tracks.push(new THREE.QuaternionKeyframeTrack(m.bones[b] + '.quaternion', times, v));
  }
  const drift = [root[(F - 1) * 3] - root[0], 0, root[(F - 1) * 3 + 2] - root[2]];
  const rv = new Float32Array(root);
  if (opts.inplace) for (let f = 0; f < F; f++) { const a = f / (F - 1); rv[f * 3] -= drift[0] * a; rv[f * 3 + 2] -= drift[2] * a; }
  tracks.push(new THREE.VectorKeyframeTrack('Bip01.position', times, rv));
  if (!opts.noFingers) for (const [bn, v] of Object.entries(m.fingers)) tracks.push(new THREE.QuaternionKeyframeTrack(bn + '.quaternion', [0], v));
  const clip = new THREE.AnimationClip(name, m.duration, tracks);
  clip.userData = { drift, speed: Math.hypot(drift[0], drift[2]) * 0.01 / m.duration, root0: m.root0, rootEnd: m.rootEnd, face: m.face };
  clipCache.set(key, clip);
  return clip;
}
