import sys; sys.path.insert(0, 'tools/thiago')
from core import *
a = load('Business_Male_02'); p, n = world(a); A = np.load('build/thiago/lm_av.npy'); Pm = np.load('build/thiago/lm_ph.npy'); ph = cv2.imread('build/thiago/foto.png')
# photo head mask (GrabCut seeded by the oval)
hm = np.full(ph.shape[:2], cv2.GC_PR_BGD, np.uint8); ov = Pm[OVAL]; c0 = ov.mean(0)
cv2.fillPoly(hm, [(c0 + (ov - c0) * np.array([1.55, 1.75])).astype(np.int32)], cv2.GC_PR_FGD); cv2.fillPoly(hm, [(c0 + (ov - c0) * 0.92).astype(np.int32)], cv2.GC_FGD)
outer = np.zeros(ph.shape[:2], np.uint8); cv2.fillPoly(outer, [(c0 + (ov - c0) * np.array([1.9, 2.2])).astype(np.int32)], 1); hm[outer == 0] = cv2.GC_BGD
cv2.grabCut(ph, hm, None, np.zeros((1, 65)), np.zeros((1, 65)), 8, cv2.GC_INIT_WITH_MASK); pm = ((hm == cv2.GC_FGD) | (hm == cv2.GC_PR_FGD)).astype(np.uint8)
pm = cv2.morphologyEx(pm, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8)); np.save('build/thiago/photo_head.npy', pm)
vis = ph.copy(); vis[pm == 0] = vis[pm == 0] // 4; cv2.imwrite('build/thiago/photo_head.jpg', vis)
def prof(mask, L, label):
    e = L[[33, 133, 362, 263]].mean(0); unit = abs(L[13][1] - e[1]); cx = e[0]; out = {}
    for u in (-1.6, -1.3, -1.0, -0.6, -0.3, 0, 0.3, 0.6, 1.0, 1.3, 1.6, 1.9):
        y = int(round(e[1] + u * unit)); 
        if y < 0 or y >= mask.shape[0]: continue
        xs = np.where(mask[y] > 0)[0]; xs = xs[np.abs(xs - cx) < 2.2 * unit]
        out[u] = ((cx - xs.min()) / unit, (xs.max() - cx) / unit) if len(xs) else (0, 0)
    print(label, 'unit px %.1f' % unit, ' '.join('%+.1f:%.2f/%.2f' % (u, *v) for u, v in out.items())); return out
hv = p[bone_weight(a, HEADB) > 0.5]; cy = (hv[:, 1].min() + hv[:, 1].max()) / 2; cam = Ortho(0, cy, 17, 1024, 1024)
tex = {1: cv2.imread(a['dir'] + 'head.webp'), 2: cv2.imread(a['dir'] + 'hair.webp', cv2.IMREAD_UNCHANGED)}
img, zb = render(a, tex, cam, mats=(1, 2), bg=(0, 0, 0)); am = np.isfinite(zb).astype(np.uint8)
pa = prof(am, A, 'avatar'); pp = prof(pm, Pm, 'photo ')
print('ratio  ', ' '.join('%+.1f:%.2f' % (u, (pp[u][0] + pp[u][1]) / max(pa[u][0] + pa[u][1], 1e-6)) for u in pa if u in pp))
e = A[[33, 133, 362, 263]].mean(0); unit = abs(A[13][1] - e[1]); print('avatar unit cm %.2f eye y %.1f' % (unit / (1024 / 34), cy - (e[1] - 512) / (1024 / 34)))
