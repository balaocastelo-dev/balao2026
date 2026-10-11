"""Final head texture: wider projection, no background leaks, beard continued on the sides and under the jaw, seam padding."""
import sys; sys.path.insert(0, 'tools/thiago')
from core import *
a = load('Business_Male_02'); p, n = world(a); T = 2048
head = cv2.imread(a['dir'] + 'head.webp'); hair = cv2.imread(a['dir'] + 'hair.webp', cv2.IMREAD_UNCHANGED)
ph = cv2.imread('build/thiago/foto.png'); A = np.load('build/thiago/lm_av.npy'); Pm = np.load('build/thiago/lm_ph.npy')
wp = np.load('build/thiago/tex_pos.npy').astype(np.float64); wn = np.load('build/thiago/tex_nor.npy').astype(np.float64); cov = np.load('build/thiago/tex_cov.npy')
mapx = np.load('build/thiago/mapx.npy'); mapy = np.load('build/thiago/mapy.npy'); base = cv2.imread('build/thiago/head_base.png'); body2 = cv2.imread('build/thiago/body_base.png')
hv = p[bone_weight(a, HEADB) > 0.5]; cy = (hv[:, 1].min() + hv[:, 1].max()) / 2; cam = Ortho(0, cy, 17, 1024, 1024); s = cam.W / (2 * cam.half)
tris = group_tris(a, 1); Pscr = cam.project(p); zb, _, _ = raster(Pscr, tris, cam.W, cam.H, {})
def lmw(i):  # landmark -> world (x, y, z on the surface)
    x, y = A[i]; return np.array([(x - cam.W / 2) / s, cy - (y - cam.H / 2) / s, zb[int(round(y)), int(round(x))]])
LW = {i: lmw(i) for i in (61, 291, 152, 10, 234, 454, 172, 397, 58, 288, 1, 2, 164, 17, 200, 205, 425, 132, 361)}
for k in (61, 152, 234, 172, 58, 1, 132): print(k, LW[k].round(1))

# ---------------- photo masks
hsv = cv2.cvtColor(ph, cv2.COLOR_BGR2HSV); lab = cv2.cvtColor(ph, cv2.COLOR_BGR2LAB).astype(np.float64); his, av = np.load('build/thiago/skin.npy')
ov = Pm[OVAL]; c0 = ov.mean(0); H, W = ph.shape[:2]
face = np.zeros((H, W), np.uint8); cv2.fillPoly(face, [(c0 + (ov - c0) * np.array([1.10, 1.0])).astype(np.int32)], 1)
# forehead extension: skin-coloured pixels above the oval top, up to where the hair starts
skinlike = (np.hypot(lab[..., 1] - his[1], lab[..., 2] - his[2]) < 14) & (lab[..., 0] > his[0] * 0.62)
top = np.zeros((H, W), np.uint8); cv2.fillPoly(top, [(c0 + (ov - c0) * np.array([1.0, 1.45])).astype(np.int32)], 1); top[int(Pm[9][1]):, :] = 0
valid = ((face > 0) | ((top > 0) & skinlike)).astype(np.uint8)
chin = Pm[152][1]; valid[int(chin + 0.012 * (chin - Pm[10][1])):, :] = 0
valid = cv2.morphologyEx(valid, cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8)); valid = cv2.erode(valid, np.ones((3, 3), np.uint8))
validf = cv2.GaussianBlur(valid.astype(np.float32), (0, 0), 2.5)
cv2.imwrite('build/thiago/photo_valid.jpg', (ph * (0.25 + 0.75 * validf[..., None])).astype(np.uint8))
# beard colour (dark pixels on the chin) for the procedural continuation
chinpoly = np.zeros((H, W), np.uint8); cv2.fillPoly(chinpoly, [Pm[[18, 83, 201, 208, 199, 428, 421, 313]].astype(np.int32)], 1)
bl = lab[chinpoly > 0]; beard_lab = np.median(bl[bl[:, 0] < np.percentile(bl[:, 0], 35)], axis=0); print('beard lab', beard_lab.round(1), 'skin', his.round(1))
sharp = cv2.addWeighted(ph, 1.7, cv2.GaussianBlur(ph, (0, 0), 1.8), -0.7, 0)

# ---------------- projection
S = cam.project(wp.reshape(-1, 3)).reshape(T, T, 3); sx = S[..., 0].astype(np.float32); sy = S[..., 1].astype(np.float32)
zs = cv2.remap(np.where(np.isfinite(zb), zb, -1e9).astype(np.float32), sx, sy, cv2.INTER_NEAREST); vis = cov & (S[..., 2] >= zs - 0.45)
px = cv2.remap(mapx, sx, sy, cv2.INTER_LINEAR); py = cv2.remap(mapy, sx, sy, cv2.INTER_LINEAR)
col = cv2.remap(sharp, px, py, cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
inm = cv2.remap(validf, px, py, cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=0)
nz = wn[..., 2]; wf = np.clip((nz - 0.10) / 0.30, 0, 1); wf = wf * wf * (3 - 2 * wf)
X, Y, Z = np.abs(wp[..., 0]), wp[..., 1], wp[..., 2]
not_ear = np.clip((Z - 4.2) / 1.6, 0, 1)                                                    # the ears keep the avatar's own (recoloured) skin
covf = cv2.GaussianBlur(cov.astype(np.float32), (0, 0), 3.5)
M = cv2.GaussianBlur((wf * inm * vis * not_ear).astype(np.float32), (0, 0), 3.5) / np.maximum(covf, 1e-3) * cov; M = np.clip(M, 0, 1)

# ---------------- procedural beard where the photo cannot reach (sides of the jaw, under the chin, upper neck)
mc = (LW[61] + LW[291] * np.array([-1, 1, 1])) / 2; mc[0] = abs(LW[61][0]); chinw = LW[152]
earv = p[(np.abs(p[:, 0]) > hv[:, 0].max() - 1.2) & (bone_weight(a, HEADB) > 0.5)]; ear_front = earv[:, 2].max() + 0.3; ear_mid = np.median(earv[:, 1]); ear_low = earv[:, 1].min()
print('mouth corner', mc.round(1), 'chin', chinw.round(1), 'ear front z', round(ear_front, 1), 'ear mid y', round(ear_mid, 1), 'ear low', round(ear_low, 1))
# cheek line in the side view (z forward, y up): from just above the mouth corner back to the sideburn in front of the ear
z1, y1 = mc[2] - 0.6, mc[1] + 1.1; z0, y0 = ear_front, ear_mid + 1.4
t = np.clip((Z - z0) / (z1 - z0), 0, 1); line = y0 + (y1 - y0) * (t ** 1.25)          # slightly hollow curve, like his cheek line
# neck line: under the chin, rising towards the jaw angle
ny1 = chinw[1] - 1.6; ny0 = ear_low - 2.2; neck = ny0 + (ny1 - ny0) * t
rng = np.random.default_rng(7); noise = cv2.GaussianBlur(rng.normal(0, 1, (T, T)).astype(np.float32), (0, 0), 6); noise /= noise.std()
fine = cv2.GaussianBlur(rng.normal(0, 1, (T, T)).astype(np.float32), (0, 0), 1.6); fine /= fine.std()
upper = np.clip((line - Y + 0.10 * noise + 0.10 * fine) / 0.5, 0, 1); lower = np.clip((Y - neck + 0.2 * noise + 0.25 * fine) / 2.4, 0, 1) ** 1.3
back = np.clip((Z - (ear_front - 0.1) + 0.08 * noise) / 1.6, 0, 1)                                      # nothing on or behind the ear
moustache_gap = 1.0                                                                       # front is the photo's job
B = upper * lower * back * cov; B = B * B * (3 - 2 * B)
# beard texture: his beard colour with fine hair-like grain along the unwrap
g1 = rng.normal(0, 1, (T, T)).astype(np.float32); grain = cv2.GaussianBlur(g1, (0, 0), sigmaX=0.8, sigmaY=2.6); grain /= grain.std()
bcol = np.zeros((T, T, 3)); bcol[..., 0] = np.clip(beard_lab[0] * 0.78 + 10 * grain, 8, 255); bcol[..., 1] = beard_lab[1]; bcol[..., 2] = beard_lab[2]
bcol = cv2.cvtColor(bcol.astype(np.uint8), cv2.COLOR_LAB2BGR).astype(np.float64)
density = np.clip(0.95 + 0.05 * grain, 0, 1)

out = base.astype(np.float64)
Bw = (B * density * (1 - M))[..., None]; out = out * (1 - Bw) + bcol * Bw
out = out * (1 - M[..., None]) + col * M[..., None]

# ---------------- his beard is dense and dark: deepen whatever is already beard-coloured in the beard zone (front included)
zone = np.clip((line + 0.6 - Y) / 0.8, 0, 1) * np.clip((Y - neck) / 1.0, 0, 1) * back * cov
zone = np.maximum(zone, (np.clip((Z - 9.5) / 1.0, 0, 1) * np.clip((LW[2][1] + 0.2 - Y) / 0.5, 0, 1) * np.clip((Y - neck) / 1.0, 0, 1) * cov))   # moustache and chin, up to the base of the nose
labo = cv2.cvtColor(np.clip(out, 0, 255).astype(np.uint8), cv2.COLOR_BGR2LAB).astype(np.float64)
beardness = np.clip((his[0] * 0.80 - labo[..., 0]) / (his[0] * 0.80 - beard_lab[0]), 0, 1)
lipmask = np.clip((labo[..., 1] - 150) / 8, 0, 1)                                           # keep the lips out of it
k = zone * beardness * (1 - lipmask); labo[..., 0] *= (1 - 0.30 * k); labo[..., 1] += (beard_lab[1] - labo[..., 1]) * 0.5 * k; labo[..., 2] += (beard_lab[2] - labo[..., 2]) * 0.5 * k
out = cv2.cvtColor(np.clip(labo, 0, 255).astype(np.uint8), cv2.COLOR_LAB2BGR).astype(np.float64)

# ---------------- pad the island borders so mip-mapping does not pull black across the UV seams
res = np.clip(out, 0, 255).astype(np.uint8); orig_cov = cov.copy()
allcov = np.zeros((T, T), bool); UVp = np.concatenate([a['uv'] * T, np.zeros((len(a['uv']), 1))], 1)
_, tid_all, _ = raster(UVp, tris, T, T, {}); allcov = tid_all >= 0
res[~cov & allcov] = head[~cov & allcov]                                                  # eyeballs / mouth interior keep the original
eye = ~cov & allcov; labe = cv2.cvtColor(res, cv2.COLOR_BGR2LAB).astype(np.float64)
iris = eye & (labe[..., 0] > 40) & (labe[..., 0] < 150) & (labe[..., 2] > 140) & (labe[..., 1] < 150) & (np.arange(T)[:, None] < 0.2 * T) & (np.arange(T)[None, :] > 0.2 * T) & (np.arange(T)[None, :] < 0.33 * T)
irisf = cv2.GaussianBlur(iris.astype(np.float32), (0, 0), 2)[..., None]; res = np.clip(res * (1 - 0.18 * irisf), 0, 255).astype(np.uint8); print('iris texels', int(iris.sum()))
filled = allcov.copy(); k = np.ones((3, 3), np.uint8)
for _ in range(10):
    dil = cv2.dilate(res, k); grow = cv2.dilate(filled.astype(np.uint8), k).astype(bool) & ~filled
    res[grow] = dil[grow]; filled |= grow
cv2.imwrite('build/thiago/head_final.png', res); np.save('build/thiago/beard_w.npy', (B * (1 - M)).astype(np.float32))
tex = {0: body2, 1: res, 2: hair}
views = [render(a, tex, Ortho(0, cy, 17, 800, 800, yaw=y))[0] for y in (0, 35, 75, 110)]
cv2.imwrite('build/thiago/step3.jpg', np.hstack(views))
low = [render(a, tex, Ortho(0, cy - 3, 14, 800, 800, yaw=y, pitch=p_))[0] for y, p_ in ((0, -25), (40, -15))]
cv2.imwrite('build/thiago/step3b.jpg', np.hstack(low))
