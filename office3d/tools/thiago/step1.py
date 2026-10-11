import sys; sys.path.insert(0, 'tools/thiago')
from core import *
a = load('Business_Male_02'); p, n = world(a)
hw = bone_weight(a, HEADB)
hv = p[hw > 0.5]; print('head verts', len(hv), 'bbox', hv.min(0).round(1), hv.max(0).round(1), 'all', p.min(0).round(1), p.max(0).round(1))
tex = {0: cv2.imread(a['dir'] + 'body.webp'), 1: cv2.imread(a['dir'] + 'head.webp'), 2: cv2.imread(a['dir'] + 'hair.webp', cv2.IMREAD_UNCHANGED)}
c = hv.mean(0); cy = (hv[:, 1].min() + hv[:, 1].max()) / 2
cam = Ortho(0, cy, 17, 1024, 1024)
img, _ = render(a, tex, cam); cv2.imwrite('build/thiago/av_front.png', img)
lm = landmarks(img); print('avatar landmarks', None if lm is None else lm[0].shape)
ph = cv2.imread('build/thiago/foto.png'); lp = landmarks(ph); print('photo landmarks', None if lp is None else lp[0].shape, ph.shape)
vis = img.copy()
if lm is not None:
    for x, y in lm[0]: cv2.circle(vis, (int(x), int(y)), 2, (0, 255, 0), -1)
    cv2.polylines(vis, [lm[0][OVAL].astype(np.int32)], True, (0, 0, 255), 1)
v2 = ph.copy()
if lp is not None:
    for x, y in lp[0]: cv2.circle(v2, (int(x), int(y)), 1, (0, 255, 0), -1)
    cv2.polylines(v2, [lp[0][OVAL].astype(np.int32)], True, (0, 0, 255), 1)
s = 1024 / v2.shape[0]; v2 = cv2.resize(v2, (int(v2.shape[1] * s), 1024))
side, _ = render(a, tex, Ortho(0, cy, 17, 1024, 1024, yaw=55))
cv2.imwrite('build/thiago/step1.jpg', np.hstack([vis, side, v2]))
np.save('build/thiago/lm_av.npy', lm[0]); np.save('build/thiago/lm_ph.npy', lp[0]); np.save('build/thiago/lmz_ph.npy', lp[1])
