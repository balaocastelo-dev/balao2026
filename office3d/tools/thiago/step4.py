"""Geometry: his head proportions (from the photo landmarks), thicker neck, heavier build. Writes build/thiago/pos.npy / nor.npy (mesh-local)."""
import sys; sys.path.insert(0, 'tools/thiago')
from core import *
from scipy.interpolate import RBFInterpolator
from scipy.spatial import Delaunay, cKDTree
a = load('Business_Male_02'); p, n = world(a); bones = np.load('build/thiago/bones.npy', allow_pickle=True).item()
A = np.load('build/thiago/lm_av.npy'); Pm = np.load('build/thiago/lm_ph.npy')
wh = bone_weight(a, HEADB); hv = p[wh > 0.5]; cy = (hv[:, 1].min() + hv[:, 1].max()) / 2; W = 1024; s = W / 34.0
Aw = np.stack([(A[:, 0] - W / 2) / s, cy - (A[:, 1] - W / 2) / s], 1)
# his landmarks in the avatar's frame: same eye-to-chin height, eyes centred
eyes = [33, 133, 362, 263]; eA = Aw[eyes].mean(0); eP = Pm[eyes].mean(0)
dd = lambda L, i, j: np.linalg.norm(L[i] - L[j])
sP = 0.5 * (dd(Aw, 33, 263) / dd(Pm, 33, 263) + abs(eA[1] - Aw[13][1]) / abs(eP[1] - Pm[13][1]))   # same size of eyes-to-mouth: the outline then shows how much fuller his face is
Hw = np.stack([(Pm[:, 0] - eP[0]) * sP + eA[0], -(Pm[:, 1] - eP[1]) * sP + eA[1]], 1)
wA = abs(Aw[454][0] - Aw[234][0]); wP = abs(Hw[454][0] - Hw[234][0]); jA = abs(Aw[397][0] - Aw[172][0]); jP = abs(Hw[397][0] - Hw[172][0])
print('face width avatar %.1f his %.1f (ratio %.3f) | jaw %.1f -> %.1f (ratio %.3f) | forehead top y %.1f -> %.1f' % (wA, wP, wP / wA, jA, jP, jP / jA, Aw[10][1], Hw[10][1]))
FULL = float(sys.argv[1]) if len(sys.argv) > 1 else 1.0   # how much of his proportions to apply
BUILD = float(sys.argv[2]) if len(sys.argv) > 2 else 1.0  # how much of the heavier build to apply
sm = lambda x, a_, b_: (lambda t: t * t * (3 - 2 * t))(np.clip((x - a_) / (b_ - a_), 0, 1))
# Width of the head by height, measured on the photo's outline against the avatar's (tools/thiago/measure.py), in "eye-to-mouth" units
# below the eyes: his lower face (jaw + full beard) is ~1.3x the avatar's; the top of the hair is lower and narrower.
eyeY = Aw[eyes][:, 1].mean(); unit = abs(eyeY - Aw[13][1]); print('eye y %.1f unit %.2f cm' % (eyeY, unit))
PROF = np.array([[-2.2, 0.92], [-1.6, 0.93], [-1.3, 0.97], [-1.0, 0.99], [-0.3, 1.0], [0.35, 1.0], [0.7, 1.10], [1.0, 1.25], [1.3, 1.30], [1.65, 1.26], [2.2, 1.18]])
PROF[:, 1] = 1 + (PROF[:, 1] - 1) * FULL
def sxh(y): return np.interp((eyeY - y) / unit, PROF[:, 0], PROF[:, 1])
Ascaled = np.stack([Aw[:, 0] * sxh(Aw[:, 1]), Aw[:, 1]], 1)
D = (Hw - Ascaled) * FULL
keep = [i for i in range(468) if i not in OVAL]                       # the outline now comes from the measured profile; landmarks place the features
D[:, 0] *= 0.6; D[:, 1] *= 0.85; D = np.clip(D, -1.8, 1.8)
D[OVAL, 0] = 0; print('feature residual |max| %.2f cm; chin dy %.2f' % (np.abs(D[keep]).max(), D[152, 1]))
tps = RBFInterpolator(Ascaled, D, kernel='thin_plate_spline', smoothing=30.0)
hull = Delaunay(Ascaled); tree = cKDTree(Ascaled)

q = p.copy()
# ---------------- head
hx = q[:, 0] * sxh(q[:, 1]); pts = np.stack([hx, q[:, 1]], 1)
d = tps(pts); inside = hull.find_simplex(pts) >= 0; dist, _ = tree.query(pts); fall = np.where(inside, 1.0, np.exp(-np.maximum(dist - 0.4, 0) / 2.2))
wfz = sm(q[:, 2], 0.5, 3.5)
ytop = Aw[10][1] - 0.3; flat = 1 - 0.16 * FULL                          # slicked-back hair: less height above the forehead
hy = q[:, 1] + d[:, 1] * fall * wfz; hy = np.where(hy > ytop, ytop + (hy - ytop) * flat, hy)
zc = bones['Bip01_Head'][2] + 1.0; zdeep = 1 + 0.07 * FULL * sm((eyeY - q[:, 1]) / unit, 0.4, 1.1)   # fuller lower face front-to-back too
head_new = np.stack([hx + d[:, 0] * fall * wfz, hy, zc + (q[:, 2] - zc) * zdeep], 1)
# ---------------- core (torso, hips, neck): scale around the spine line, more to the front (belly), by height
ctrl = np.array([  # y, sx, szFront, szBack
    [0, 1.00, 1.00, 1.00], [45, 1.00, 1.00, 1.00], [62, 1.05, 1.06, 1.05], [80, 1.07, 1.08, 1.07], [92, 1.11, 1.20, 1.10], [106, 1.17, 1.44, 1.10],
    [120, 1.15, 1.38, 1.08], [135, 1.10, 1.20, 1.06], [147, 1.05, 1.08, 1.04], [153, 1.12, 1.12, 1.12], [158, 1.15, 1.10, 1.15], [163, 1.06, 1.0, 1.06], [200, 1.0, 1.0, 1.0]])
ctrl[:, 1:] = 1 + (ctrl[:, 1:] - 1) * BUILD
ys = np.array([bones[k][1] for k in ('Bip01_Pelvis', 'Bip01_Spine', 'Bip01_Spine1', 'Bip01_Spine2', 'Bip01_Neck', 'Bip01_Head')]); zs_ = np.array([bones[k][2] for k in ('Bip01_Pelvis', 'Bip01_Spine', 'Bip01_Spine1', 'Bip01_Spine2', 'Bip01_Neck', 'Bip01_Head')])
z0 = np.interp(q[:, 1], ys, zs_); sx = np.interp(q[:, 1], ctrl[:, 0], ctrl[:, 1]); szf = np.interp(q[:, 1], ctrl[:, 0], ctrl[:, 2]); szb = np.interp(q[:, 1], ctrl[:, 0], ctrl[:, 3])
dz = q[:, 2] - z0; core_new = np.stack([q[:, 0] * sx, q[:, 1], z0 + dz * np.where(dz > 0, szf, szb)], 1)
# legs: the hips follow the core; thighs and calves get thicker around their own axis
def radial(P0, P1, f0, f1):
    ax = P1 - P0; L = np.linalg.norm(ax); ax /= L; rel = q - P0; t = np.clip(rel @ ax, 0, L); foot = P0 + np.outer(t, ax); f = f0 + (f1 - f0) * (t / L)
    return foot + (q - foot) * f[:, None]
arm_new = q.copy(); leg_new = core_new.copy(); warm = np.zeros(len(q)); wleg = np.zeros(len(q))
for sd, sgn in (('L', 1), ('R', -1)):
    ua, fa, hd = bones[f'Bip01_{sd}_UpperArm'], bones[f'Bip01_{sd}_Forearm'], bones[f'Bip01_{sd}_Hand']
    wu = bone_weight(a, [f'Bip01_{sd}_UpperArm']); wf_ = bone_weight(a, [f'Bip01_{sd}_Forearm']); whd = bone_weight(a, [f'Bip01_{sd}_Hand', f'Bip01_{sd}_Finger*'])
    au = radial(ua, fa, 1 + 0.13 * BUILD, 1 + 0.11 * BUILD); af = radial(fa, hd, 1 + 0.11 * BUILD, 1 + 0.06 * BUILD); ah = radial(fa, hd + (hd - fa) * 0.6, 1 + 0.06 * BUILD, 1 + 0.06 * BUILD)
    tot = wu + wf_ + whd; m = tot > 0; arm_new[m] = ((au * wu[:, None] + af * wf_[:, None] + ah * whd[:, None]) / np.maximum(tot, 1e-9)[:, None])[m]; warm += tot
    th, ca, ft = bones[f'Bip01_{sd}_Thigh'], bones[f'Bip01_{sd}_Calf'], bones[f'Bip01_{sd}_Foot']
    wt = bone_weight(a, [f'Bip01_{sd}_Thigh']); wc_ = bone_weight(a, [f'Bip01_{sd}_Calf'])
    lt = radial(th, ca, 1 + 0.10 * BUILD, 1 + 0.06 * BUILD); lc = radial(ca, ft, 1 + 0.06 * BUILD, 1.0)
    # below the hips use the leg's own thickening instead of the core's sideways scaling
    k = sm(th[1] - q[:, 1], 2.0, 12.0)[:, None]; mix = (lt * wt[:, None] + lc * wc_[:, None]); tw = (wt + wc_)[:, None]
    leg_new = np.where(tw > 0, leg_new * (1 - k * np.minimum(tw, 1)) + (mix / np.maximum(tw, 1e-9)) * (k * np.minimum(tw, 1)), leg_new)
warm = np.clip(warm, 0, 1)[:, None]
# ---------------- blend: body below the jaw, head above it, arms by their own weights
th_ = sm(wh, 0.12, 0.8)[:, None]                                          # head (and jaw) follow the head shape; neck and collar follow the body
out = leg_new * (1 - th_) + head_new * th_
out = out * (1 - warm) + arm_new * warm
print('max move %.2f cm; belly depth %.1f -> %.1f; waist width %.1f -> %.1f; head width %.1f -> %.1f' % (np.abs(out - q).max(),
      np.ptp(q[(q[:, 1] > 100) & (q[:, 1] < 112) & (warm[:, 0] < .1), 2]), np.ptp(out[(q[:, 1] > 100) & (q[:, 1] < 112) & (warm[:, 0] < .1), 2]),
      np.ptp(q[(q[:, 1] > 100) & (q[:, 1] < 112) & (warm[:, 0] < .1), 0]), np.ptp(out[(q[:, 1] > 100) & (q[:, 1] < 112) & (warm[:, 0] < .1), 0]),
      np.ptp(q[(q[:, 1] > 163) & (wh > .5), 0]), np.ptp(out[(q[:, 1] > 163) & (wh > .5), 0])))
# ---------------- normals (welded by position so UV seams stay smooth)
key = np.round(out * 200).astype(np.int64); _, inv_ = np.unique(key, axis=0, return_inverse=True); inv_ = inv_.ravel()
fn = np.cross(out[a['idx'][:, 1]] - out[a['idx'][:, 0]], out[a['idx'][:, 2]] - out[a['idx'][:, 0]])
acc = np.zeros((inv_.max() + 1, 3))
for c in range(3): np.add.at(acc, inv_[a['idx'][:, c]], fn)
nn = acc[inv_]; ln = np.linalg.norm(nn, axis=1, keepdims=True); nn = np.where(ln > 1e-9, nn / np.maximum(ln, 1e-12), n)
# hair cards and other two-sided bits: keep the side the original normal pointed to
flip = (nn * n).sum(1) < 0; nn[flip] = n[flip]
np.save('build/thiago/pos_w.npy', out); np.save('build/thiago/nor_w.npy', nn)

head = cv2.imread('build/thiago/head_final.png'); body = cv2.imread('build/thiago/body_base.png'); hair = cv2.imread(a['dir'] + 'hair.webp', cv2.IMREAD_UNCHANGED)
tex = {0: body, 1: head, 2: hair}
hv2 = out[wh > 0.5]; cy2 = (hv2[:, 1].min() + hv2[:, 1].max()) / 2
heads = [render(a, tex, Ortho(0, cy2, 17, 700, 700, yaw=y), out, nn)[0] for y in (0, 35, 80)]
ph = cv2.imread('build/thiago/foto.png'); c = Pm[OVAL].mean(0); hh = int(np.ptp(Pm[OVAL][:, 1]) * 0.9); crop = ph[max(0, int(c[1] - hh)):int(c[1] + hh), max(0, int(c[0] - hh)):int(c[0] + hh)]
cv2.imwrite('build/thiago/step4_head.jpg', np.hstack(heads + [cv2.resize(crop, (700, 700))]))
orig_tex = {0: cv2.imread(a['dir'] + 'body.webp'), 1: cv2.imread(a['dir'] + 'head.webp'), 2: hair}
full = [render(a, orig_tex, Ortho(0, 92, 96, 500, 1000 // 2 * 2, yaw=0))[0]] if False else []
def fullv(pos, nor, t, yaw): cam = Ortho(0, 92, 95, 950, 950, yaw=yaw); return render(a, t, cam, pos, nor)[0][:, 235:715]
cv2.imwrite('build/thiago/step4_body.jpg', np.hstack([fullv(p, n, orig_tex, 0), fullv(out, nn, tex, 0), fullv(p, n, orig_tex, 80), fullv(out, nn, tex, 80), fullv(out, nn, tex, 35)]))
