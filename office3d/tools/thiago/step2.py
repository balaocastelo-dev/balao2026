"""Bake the photo onto the head texture (front projection), match skin tone. Writes build/thiago/head_proj.png + debug renders."""
import sys; sys.path.insert(0, 'tools/thiago')
from core import *
from scipy.interpolate import RBFInterpolator
a = load('Business_Male_02'); p, n = world(a)
T = 2048
head = cv2.imread(a['dir'] + 'head.webp'); body = cv2.imread(a['dir'] + 'body.webp'); hair = cv2.imread(a['dir'] + 'hair.webp', cv2.IMREAD_UNCHANGED)
ph = cv2.imread('build/thiago/foto.png'); A = np.load('build/thiago/lm_av.npy'); Pm = np.load('build/thiago/lm_ph.npy')
hv = p[bone_weight(a, HEADB) > 0.5]; cy = (hv[:, 1].min() + hv[:, 1].max()) / 2; cam = Ortho(0, cy, 17, 1024, 1024)

# ---- islands of the head material in UV space; keep the big one (skin + scalp), drop eyeballs / mouth interior
tris = group_tris(a, 1)
parent = {}
def find(x):
    while parent.setdefault(x, x) != x: parent[x] = parent[parent[x]]; x = parent[x]
    return x
for t in tris:
    r = find(t[0]); parent[find(t[1])] = r; parent[find(t[2])] = r
comp = np.array([find(t[0]) for t in tris]); area = {}
for c, t in zip(comp, tris):
    u = a['uv'][t]; area[c] = area.get(c, 0) + abs((u[1][0] - u[0][0]) * (u[2][1] - u[0][1]) - (u[1][1] - u[0][1]) * (u[2][0] - u[0][0])) / 2
main = max(area, key=area.get); print('islands', len(area), 'main area', round(area[main], 3), sorted([round(v, 3) for v in area.values()], reverse=True)[:6])
mt = tris[comp == main]; np.save('build/thiago/main_tris.npy', mt)

# ---- per-texel world position / normal of the main island
UVp = np.concatenate([a['uv'] * T, np.zeros((len(a['uv']), 1))], 1)
_, tid, o = raster(UVp, mt, T, T, {'p': p, 'n': n})
cov = tid >= 0; wp = o['p']; wn = o['n']; wn /= np.maximum(np.linalg.norm(wn, axis=2, keepdims=True), 1e-9)
np.save('build/thiago/tex_pos.npy', wp.astype(np.float32)); np.save('build/thiago/tex_nor.npy', wn.astype(np.float32)); np.save('build/thiago/tex_cov.npy', cov)

# ---- front z-buffer of the head material (self occlusion)
Pscr = cam.project(p); zb, _, _ = raster(Pscr, tris, cam.W, cam.H, {})
S = cam.project(wp.reshape(-1, 3)).reshape(T, T, 3)
zs = cv2.remap(np.where(np.isfinite(zb), zb, -1e9).astype(np.float32), S[..., 0].astype(np.float32), S[..., 1].astype(np.float32), cv2.INTER_NEAREST)
vis = cov & (S[..., 2] >= zs - 0.45)

# ---- render px -> photo px (thin plate spline through the 468 landmarks, evaluated on a coarse grid)
tps = RBFInterpolator(A, Pm, kernel='thin_plate_spline', smoothing=2.0)
g = np.arange(0, 1024 + 8, 8, dtype=np.float64); GX, GY = np.meshgrid(g, g)
val = tps(np.stack([GX.ravel(), GY.ravel()], 1)).reshape(len(g), len(g), 2)
mapx = cv2.resize(val[..., 0].astype(np.float32), (1032, 1032), interpolation=cv2.INTER_CUBIC)[:1024, :1024]
mapy = cv2.resize(val[..., 1].astype(np.float32), (1032, 1032), interpolation=cv2.INTER_CUBIC)[:1024, :1024]
np.save('build/thiago/mapx.npy', mapx); np.save('build/thiago/mapy.npy', mapy)

# ---- photo: head mask (GrabCut seeded by the face oval), detail boost
hm = np.full(ph.shape[:2], cv2.GC_PR_BGD, np.uint8); ov = Pm[OVAL]; c0 = ov.mean(0)
big = (c0 + (ov - c0) * np.array([1.55, 1.75])).astype(np.int32); cv2.fillPoly(hm, [big], cv2.GC_PR_FGD)
hm[int(ov[:, 1].max()) + 40:, :] = cv2.GC_PR_BGD
cv2.fillPoly(hm, [(c0 + (ov - c0) * 0.92).astype(np.int32)], cv2.GC_FGD)
far = (c0 + (ov - c0) * np.array([1.9, 2.2])).astype(np.int32); outer = np.zeros(ph.shape[:2], np.uint8); cv2.fillPoly(outer, [far], 1); hm[outer == 0] = cv2.GC_BGD
bgd = np.zeros((1, 65)); fgd = np.zeros((1, 65)); cv2.grabCut(ph, hm, None, bgd, fgd, 6, cv2.GC_INIT_WITH_MASK)
pm = ((hm == cv2.GC_FGD) | (hm == cv2.GC_PR_FGD)).astype(np.uint8)
# keep the head only: cut below the chin line (neck/collar handled by the avatar's own texture)
chin = Pm[152][1]; pm[int(chin + 0.10 * (chin - Pm[10][1])):, :] = 0
pm = cv2.erode(pm, np.ones((5, 5), np.uint8)); pmf = cv2.GaussianBlur(pm.astype(np.float32), (0, 0), 3)
cv2.imwrite('build/thiago/photo_mask.jpg', (ph * (0.25 + 0.75 * pmf[..., None])).astype(np.uint8))
sharp = cv2.addWeighted(ph, 1.6, cv2.GaussianBlur(ph, (0, 0), 2.0), -0.6, 0)

# ---- skin tone: his vs the avatar's (cheeks + forehead patches defined by landmarks)
def skin_lab(img, L):
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB).astype(np.float64); m = np.zeros(img.shape[:2], np.uint8)
    for ids in ([67, 109, 10, 338, 297, 299, 9, 69], [116, 117, 118, 101, 36, 205, 50], [345, 346, 347, 330, 266, 425, 280]): cv2.fillPoly(m, [L[ids].astype(np.int32)], 1)
    return np.median(lab[m > 0], axis=0)
flat, _ = render(a, {1: head}, cam, shade=False, mats=(1,))
his = skin_lab(ph, Pm); av = skin_lab(flat, A); print('skin lab his', his.round(1), 'avatar', av.round(1))
np.save('build/thiago/skin.npy', np.stack([his, av]))
def recolor(img, strength=1.0):
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB).astype(np.float64)
    # how skin-like a texel is (close to the avatar's skin in chroma, not dark like hair)
    d = np.hypot(lab[..., 1] - av[1], lab[..., 2] - av[2]); w = np.clip(1 - (d - 10) / 14, 0, 1) * np.clip((lab[..., 0] - 55) / 45, 0, 1) * strength
    out = lab.copy(); out[..., 0] = lab[..., 0] * (1 + w * (his[0] / av[0] - 1)); out[..., 1] += w * (his[1] - av[1]); out[..., 2] += w * (his[2] - av[2])
    return cv2.cvtColor(np.clip(out, 0, 255).astype(np.uint8), cv2.COLOR_LAB2BGR), w
base, skinw = recolor(head); cv2.imwrite('build/thiago/head_base.png', base)
body2, bw = recolor(body); cv2.imwrite('build/thiago/body_base.png', body2); print('body skin texels', int((bw > 0.5).sum()))

# ---- project
sx = S[..., 0].astype(np.float32); sy = S[..., 1].astype(np.float32)
px = cv2.remap(mapx, sx, sy, cv2.INTER_LINEAR); py = cv2.remap(mapy, sx, sy, cv2.INTER_LINEAR)
col = cv2.remap(sharp, px, py, cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
inm = cv2.remap(pmf, px, py, cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=0)
nz = wn[..., 2]; wf = np.clip((nz - 0.22) / 0.38, 0, 1); wf = wf * wf * (3 - 2 * wf)
M = wf * inm * vis
M = cv2.GaussianBlur(M.astype(np.float32), (0, 0), 4) * cov
np.save('build/thiago/proj_w.npy', M.astype(np.float32)); cv2.imwrite('build/thiago/proj_col.png', col)
out = (base * (1 - M[..., None]) + col * M[..., None]).astype(np.uint8)
cv2.imwrite('build/thiago/head_proj.png', out)
tex = {0: body2, 1: out, 2: hair}
views = [render(a, tex, Ortho(0, cy, 17, 800, 800, yaw=y))[0] for y in (0, 35, 70)]
cv2.imwrite('build/thiago/step2.jpg', np.hstack(views))
cv2.imwrite('build/thiago/step2_tex.jpg', cv2.resize(np.hstack([out, (M[..., None] * 255).repeat(3, 2).astype(np.uint8)]), (1600, 800)))
