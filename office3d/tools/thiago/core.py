"""Shared helpers for building the Thiago avatar: mesh I/O, a small z-buffer rasterizer, face landmarks."""
import json, numpy as np, cv2, os

AV = 'build/pack/av'

def load(name):
    d = f'{AV}/{name}/'; m = json.load(open(d + 'meta.json'))
    pos = np.fromfile(d + 'pos.f32', np.float32).reshape(-1, 3).astype(np.float64)
    nor = np.fromfile(d + 'nor.i8', np.int8).reshape(-1, 3).astype(np.float64) / 127.0
    uv = np.fromfile(d + 'uv.f32', np.float32).reshape(-1, 2).astype(np.float64)
    idx = np.fromfile(d + 'idx.bin', np.uint32 if m.get('index32') else np.uint16).reshape(-1, 3).astype(np.int64)
    si = np.fromfile(d + 'si.u8', np.uint8).reshape(-1, 4); sw = np.fromfile(d + 'sw.u8', np.uint8).reshape(-1, 4).astype(np.float64) / 255.0
    M = np.array(m['meshMatrix'], np.float64).reshape(4, 4).T  # column-major -> matrix
    return dict(dir=d, meta=m, pos=pos, nor=nor, uv=uv, idx=idx, si=si, sw=sw, M=M, bones=[b['name'] for b in m['bones']])

def world(a, pos=None, nor=None):
    """mesh-local -> world (cm, Y up, face looks +Z)"""
    R = a['M'][:3, :3]; t = a['M'][:3, 3]
    p = (a['pos'] if pos is None else pos) @ R.T + t; n = (a['nor'] if nor is None else nor) @ R.T
    return p, n

def unworld(a, p):
    R = a['M'][:3, :3]; t = a['M'][:3, 3]
    return (p - t) @ R  # R orthonormal

def group_tris(a, mat):
    out = []
    for g in a['meta']['groups']:
        if g['mat'] == mat: out.append(a['idx'][g['start'] // 3:(g['start'] + g['count']) // 3])
    return np.concatenate(out) if out else np.zeros((0, 3), np.int64)

def bone_weight(a, names):
    skel = a['meta']['skel']  # skinIndex k -> bones[skel[k]]
    ids = [k for k, bi in enumerate(skel) if any(a['bones'][bi] == n or (n.endswith('*') and a['bones'][bi].startswith(n[:-1])) for n in names)]
    w = np.zeros(len(a['pos']))
    for k in range(4): w += np.where(np.isin(a['si'][:, k], ids), a['sw'][:, k], 0)
    return w

def raster(P, tris, W, H, attrs):
    """Z-buffer rasterizer. P: (N,3) screen x,y (px) + depth (bigger = closer). attrs: dict name->(N,k) per-vertex arrays.
    Returns zbuf (H,W, -inf where empty), tri id map, dict of interpolated attribute images."""
    zb = np.full((H, W), -np.inf); tid = np.full((H, W), -1, np.int64)
    out = {k: np.zeros((H, W, v.shape[1])) for k, v in attrs.items()}
    for t, (i0, i1, i2) in enumerate(tris):
        a, b, c = P[i0], P[i1], P[i2]
        x0 = max(int(np.floor(min(a[0], b[0], c[0]))), 0); x1 = min(int(np.ceil(max(a[0], b[0], c[0]))) + 1, W)
        y0 = max(int(np.floor(min(a[1], b[1], c[1]))), 0); y1 = min(int(np.ceil(max(a[1], b[1], c[1]))) + 1, H)
        if x1 <= x0 or y1 <= y0: continue
        den = (b[1] - c[1]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[1] - c[1])
        if abs(den) < 1e-12: continue
        xs = np.arange(x0, x1) + 0.5; ys = np.arange(y0, y1) + 0.5; X, Y = np.meshgrid(xs, ys)
        w0 = ((b[1] - c[1]) * (X - c[0]) + (c[0] - b[0]) * (Y - c[1])) / den
        w1 = ((c[1] - a[1]) * (X - c[0]) + (a[0] - c[0]) * (Y - c[1])) / den
        w2 = 1 - w0 - w1; e = -1e-6
        m = (w0 >= e) & (w1 >= e) & (w2 >= e)
        if not m.any(): continue
        z = w0 * a[2] + w1 * b[2] + w2 * c[2]
        sub = zb[y0:y1, x0:x1]; m &= z > sub
        if not m.any(): continue
        sub[m] = z[m]; tid[y0:y1, x0:x1][m] = t
        for k, v in attrs.items():
            val = w0[..., None] * v[i0] + w1[..., None] * v[i1] + w2[..., None] * v[i2]
            out[k][y0:y1, x0:x1][m] = val[m]
    return zb, tid, out

def sample(img, uv, flip=False):
    """bilinear texture lookup; uv in [0,1] with v up unless the stored image is already flipped (ours are: v -> row directly)."""
    h, w = img.shape[:2]; u = (uv[..., 0] % 1.0) * w - 0.5; v = (uv[..., 1] % 1.0) * h - 0.5
    return cv2.remap(img, u.astype(np.float32), v.astype(np.float32), cv2.INTER_LINEAR, borderMode=cv2.BORDER_WRAP)

class Ortho:
    """Orthographic camera looking at the head. yaw (deg) rotates the view around Y; yaw=0 is the front."""
    def __init__(self, cx, cy, half, W=1024, H=1024, yaw=0, pitch=0, cz=0):
        self.cx, self.cy, self.cz, self.half, self.W, self.H = cx, cy, cz, half, W, H
        a, b = np.radians(yaw), np.radians(pitch)
        Ry = np.array([[np.cos(a), 0, -np.sin(a)], [0, 1, 0], [np.sin(a), 0, np.cos(a)]])
        Rx = np.array([[1, 0, 0], [0, np.cos(b), -np.sin(b)], [0, np.sin(b), np.cos(b)]])
        self.R = Rx @ Ry
    def project(self, p):
        q = (p - np.array([self.cx, self.cy, self.cz])) @ self.R.T; s = self.W / (2 * self.half)
        return np.stack([self.W / 2 + q[:, 0] * s, self.H / 2 - q[:, 1] * s, q[:, 2]], 1)
    def dirs(self, n): return n @ self.R.T

def render(a, tex, cam, pos_w=None, nor_w=None, shade=True, bg=(60, 60, 60), mats=(0, 1, 2)):
    """tex: dict mat-index -> BGR(A) image (stored orientation). Returns BGR image."""
    p, n = world(a) if pos_w is None else (pos_w, nor_w)
    P = cam.project(p); N = cam.dirs(n)
    img = np.zeros((cam.H, cam.W, 3)); img[:] = bg; zall = np.full((cam.H, cam.W), -np.inf)
    for mat in mats:
        tris = group_tris(a, mat)
        if not len(tris) or mat not in tex: continue
        zb, tid, o = raster(P, tris, cam.W, cam.H, {'uv': a['uv'], 'n': N})
        t = tex[mat]; col = sample(t, o['uv']).astype(np.float64)
        m = tid >= 0
        if col.shape[2] == 4:
            al = col[..., 3] / 255.0; m &= al > 0.35; col = col[..., :3]
        m &= zb > zall
        if shade:
            nz = np.clip(o['n'][..., 2], 0, 1); ny = o['n'][..., 1]
            L = 0.55 + 0.45 * nz + 0.08 * ny; col = col * L[..., None]
        img[m] = col[m]; zall[m] = zb[m]
    return np.clip(img, 0, 255).astype(np.uint8), zall

_fm = None
def landmarks(bgr):
    """MediaPipe FaceLandmarker -> (468,2) px, (468,) relative z; None if no face."""
    global _fm
    import mediapipe as mp
    from mediapipe.tasks import python as mpp
    from mediapipe.tasks.python import vision
    if _fm is None:
        _fm = vision.FaceLandmarker.create_from_options(vision.FaceLandmarkerOptions(base_options=mpp.BaseOptions(model_asset_path='build/thiago/model/face_landmarker.task'), num_faces=1, min_face_detection_confidence=0.2, min_face_presence_confidence=0.2))
    r = _fm.detect(mp.Image(image_format=mp.ImageFormat.SRGB, data=np.ascontiguousarray(cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB))))
    if not r.face_landmarks: return None
    h, w = bgr.shape[:2]; lm = r.face_landmarks[0]
    return np.array([[l.x * w, l.y * h] for l in lm[:468]]), np.array([l.z * w for l in lm[:468]])

OVAL = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109]
LEYE = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246]
REYE = [263, 249, 390, 373, 374, 380, 381, 382, 362, 398, 384, 385, 386, 387, 388, 466]
LIPS_IN = [78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308, 415, 310, 311, 312, 13, 82, 81, 80, 191]
HEADB = ['Bip01_Head', 'Bip01_M*', 'Bip01_LE*', 'Bip01_RE*', 'Bip01_LC*', 'Bip01_RC*', 'Bip01_LI*', 'Bip01_RI*', 'Bip01_LO*', 'Bip01_RO*', 'Bip01_LU*', 'Bip01_RU*', 'Bip01_LM*', 'Bip01_RM*']
