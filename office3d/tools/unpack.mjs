// Opens the published models file back into build/pack/ (the inverse of tools/bundle.mjs), so avatars and textures can be edited.
// usage: node tools/unpack.mjs [../public/3d/assets.<hash>.pack | build/assets.bin.gz | build/assets.bin]
import fs from 'fs'; import path from 'path'; import zlib from 'zlib';
let src = process.argv[2];
if (!src) { const d = '../public/3d'; const f = fs.existsSync(d) && fs.readdirSync(d).find(n => /^assets\.[0-9a-f]+\.pack$/.test(n)); src = f ? path.join(d, f) : 'build/assets.bin.gz'; }
let buf = fs.readFileSync(src); if (buf[0] === 0x1f && buf[1] === 0x8b) buf = zlib.gunzipSync(buf);
const n = buf.readUInt32LE(0); const head = JSON.parse(buf.subarray(4, 4 + n).toString('utf8')); const base = 4 + n; let count = 0;
for (const [name, [off, len]] of Object.entries(head.files)) { const out = path.join('build/pack', name); fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, buf.subarray(base + off, base + off + len)); count++; }
console.log(count, 'arquivos em build/pack (de', src + ')');
