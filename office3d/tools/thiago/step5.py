"""Body texture: hands in his skin tone, brighter navy suit, plain navy tie. Then write the avatar into the pack as av/Thiago_Herrera."""
import sys, shutil, json; sys.path.insert(0, 'tools/thiago')
from core import *
a = load('Business_Male_02'); p, n = world(a); T = 1024
body = cv2.imread(a['dir'] + 'body.webp'); his, av = np.load('build/thiago/skin.npy')
lab = cv2.cvtColor(body, cv2.COLOR_BGR2LAB).astype(np.float64)
# ---- hands: move their own median colour onto his
d = np.hypot(lab[..., 1] - av[1], lab[..., 2] - av[2]); w = np.clip(1 - (d - 12) / 14, 0, 1) * np.clip((lab[..., 0] - 70) / 40, 0, 1)
hm = np.median(lab[w > 0.6], axis=0); print('hands lab', hm.round(1), '-> his', his.round(1))
tgt = his * np.array([0.97, 1, 1]); lab[..., 0] *= 1 + w * (tgt[0] / hm[0] - 1); lab[..., 1] += w * (tgt[1] - hm[1]); lab[..., 2] += w * (tgt[2] - hm[2])
# ---- suit: the cloth is the dark, slightly blue part; make it a clearer navy like in his photos
cloth = np.clip((115 - lab[..., 0]) / 25, 0, 1) * np.clip((132 - lab[..., 2]) / 6, 0, 1) * (1 - w)
lab[..., 0] *= 1 + 0.10 * cloth; lab[..., 2] -= 9 * cloth; lab[..., 1] += 1.5 * cloth
out = cv2.cvtColor(np.clip(lab, 0, 255).astype(np.uint8), cv2.COLOR_LAB2BGR)
# ---- tie: the UV island(s) of the narrow strip hanging at the centre of the chest
tris = group_tris(a, 0); parent = {}
def find(x):
    while parent.setdefault(x, x) != x: parent[x] = parent[parent[x]]; x = parent[x]
    return x
for t in tris:
    r = find(t[0]); parent[find(t[1])] = r; parent[find(t[2])] = r
comp = np.array([find(t[0]) for t in tris]); ties = []
for c in np.unique(comp):
    vs = np.unique(tris[comp == c]); q = p[vs]
    if np.abs(q[:, 0]).max() < 6.5 and q[:, 1].min() > 100 and q[:, 1].max() < 156 and q[:, 2].min() > 3 and len(vs) < 400:
        uvb = a['uv'][vs]
        if uvb[:, 1].max() > 0.2: continue                                   # the shirt panels live lower in the texture
        ties.append(c); print('tie-like island: verts', len(vs), 'x', q[:, 0].min().round(1), q[:, 0].max().round(1), 'y', q[:, 1].min().round(1), q[:, 1].max().round(1), 'z', q[:, 2].min().round(1), q[:, 2].max().round(1), 'uv', uvb.min(0).round(3), uvb.max(0).round(3))
if ties:
    UVp = np.concatenate([a['uv'] * T, np.zeros((len(a['uv']), 1))], 1); _, tid, _ = raster(UVp, tris[np.isin(comp, ties)], T, T, {})
    m = cv2.dilate((tid >= 0).astype(np.uint8), np.ones((5, 5), np.uint8)) > 0
    lt = cv2.cvtColor(out, cv2.COLOR_BGR2LAB).astype(np.float64); shade = cv2.GaussianBlur(lt[..., 0], (0, 0), 6); shade = shade / max(np.median(shade[m]), 1)
    rng = np.random.default_rng(3); weave = cv2.GaussianBlur(rng.normal(0, 1, (T, T)).astype(np.float32), (0, 0), 0.7)
    lt[..., 0][m] = np.clip(58 * (0.75 + 0.25 * shade[m]) + 3 * weave[m], 0, 255); lt[..., 1][m] = 133; lt[..., 2][m] = 104     # navy silk
    out = cv2.cvtColor(np.clip(lt, 0, 255).astype(np.uint8), cv2.COLOR_LAB2BGR); print('tie texels', int(m.sum()))
cv2.imwrite('build/thiago/body_final.png', out)

# ---- pack entry
dst = f'{AV}/Thiago_Herrera/'; os.makedirs(dst, exist_ok=True)
for f in ('uv.f32', 'idx.bin', 'si.u8', 'sw.u8', 'inv.f32', 'hair.webp'): shutil.copy(a['dir'] + f, dst + f)
pw = np.load('build/thiago/pos_w.npy'); nw = np.load('build/thiago/nor_w.npy'); R = a['M'][:3, :3]
unworld(a, pw).astype(np.float32).tofile(dst + 'pos.f32'); nl = nw @ R; nl /= np.maximum(np.linalg.norm(nl, axis=1, keepdims=True), 1e-9); np.clip(np.round(nl * 127), -127, 127).astype(np.int8).tofile(dst + 'nor.i8')
cv2.imwrite(dst + 'head.webp', cv2.imread('build/thiago/head_final.png'), [cv2.IMWRITE_WEBP_QUALITY, 92]); cv2.imwrite(dst + 'body.webp', out, [cv2.IMWRITE_WEBP_QUALITY, 90])
m = dict(a['meta']); m['height'] = float(pw[:, 1].max() - pw[:, 1].min()); m['source'] = 'Business_Male_02 + fotos de referência do Thiago (tools/thiago)'
json.dump(m, open(dst + 'meta.json', 'w')); print({f: os.path.getsize(dst + f) for f in sorted(os.listdir(dst))}, 'height', round(m['height'], 1))
tex = {0: out, 1: cv2.imread('build/thiago/head_final.png'), 2: cv2.imread(dst + 'hair.webp', cv2.IMREAD_UNCHANGED)}
cam = Ortho(0, 128, 52, 900, 900); cam2 = Ortho(0, 128, 52, 900, 900, yaw=40)
cv2.imwrite('build/thiago/step5.jpg', np.hstack([render(a, tex, cam, pw, nw)[0], render(a, tex, cam2, pw, nw)[0]]))
