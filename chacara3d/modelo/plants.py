"""Vegetação procedural para a maquete da chácara (acrescenta em geo.G / geo.GS)."""
import math
import numpy as np
from geo import G, GS, tube, ellipsoid, box, obox, cyl, rotz

UP = np.array([0, 0, 1.0])


def _unit(v):
    v = np.asarray(v, float)
    return v / (np.linalg.norm(v, axis=-1, keepdims=True) + 1e-12)


def rand_unit(rng, n):
    return _unit(rng.normal(size=(n, 3)))


# ------------------------------------------------------------ cartões de folha
def cards(mat, p, a, s, L, W):
    """Cartões de folha em losango. p base (n,3), a eixo (n,3) unitário, s lateral (n,3) unitário, L/W arrays ou escalares."""
    n = len(p)
    L = np.broadcast_to(np.asarray(L, float), (n,))[:, None]
    W = np.broadcast_to(np.asarray(W, float), (n,))[:, None]
    v = np.empty((n, 6, 3))
    v[:, 0] = p
    v[:, 1] = p + a * L * 0.30 + s * W * 0.50
    v[:, 2] = p + a * L * 0.68 + s * W * 0.40
    v[:, 3] = p + a * L
    v[:, 4] = p + a * L * 0.68 - s * W * 0.40
    v[:, 5] = p + a * L * 0.30 - s * W * 0.50
    G[mat].add(v.reshape(-1, 3), np.arange(n * 6).reshape(n, 6))


def crown(mat, blobs, density, L, W, droop, rng, shell=(0.70, 1.0), flat=0.0, jit=0.25, bottom=None):
    for c, r in blobs:
        c = np.asarray(c, float); r = np.broadcast_to(np.asarray(r, float), (3,))
        area = 4 * math.pi * ((r[0] * r[1] + r[0] * r[2] + r[1] * r[2]) / 3)
        n = int(area * density)
        d = rand_unit(rng, n)
        rad = rng.uniform(shell[0], shell[1], n)[:, None]
        p = c + d * r * rad
        if bottom is not None:
            keep = p[:, 2] > bottom
            p = p[keep]; d = d[keep]; n = len(p)
        t = rand_unit(rng, n)
        a = d * 0.5 + t
        a[:, 2] = a[:, 2] * (1 - flat) - droop
        a = _unit(a)
        s = _unit(np.cross(a, d + rng.normal(scale=0.3, size=(n, 3))))
        ll = L * rng.uniform(1 - jit, 1 + jit, n)
        cards(mat, p, a, s, ll, W * ll / L)


# ------------------------------------------------------------ folhas em tira
def paddle(mat, base, az, e0, L, W, droop, nseg=5, shape='paddle', fold=0.12, power=1.3):
    base = np.asarray(base, float)
    t = np.linspace(0, 1, nseg + 1)
    e = e0 - droop * t ** power
    hd = np.array([math.cos(az), math.sin(az), 0.0])
    side = np.array([-math.sin(az), math.cos(az), 0.0])
    seg = L / nseg
    pts = [base]
    for i in range(nseg):
        em = (e[i] + e[i + 1]) / 2
        pts.append(pts[-1] + seg * (math.cos(em) * hd + math.sin(em) * UP))
    pts = np.array(pts)
    if shape == 'paddle':
        w = W * np.sin(math.pi * np.clip(t, 0.0, 1.0) ** 0.75) ** 0.55
        w[0] = W * 0.10; w[-1] = W * 0.04
    elif shape == 'strap':
        w = W * np.sqrt(np.clip(1 - t ** 2.2, 0, 1)) * np.minimum(1.0, 0.35 + t * 5)
        w[-1] = W * 0.05
    elif shape == 'heart':
        w = W * np.sin(math.pi * np.clip(t, 0, 1) ** 0.45) ** 0.7
        w[0] = W * 0.5; w[-1] = W * 0.03
    else:  # lance (lanceolada)
        w = W * np.sin(math.pi * t) ** 0.8
        w[0] = W * 0.08; w[-1] = W * 0.04
    lift = np.abs(w) * fold
    left = pts + side[None, :] * (w / 2)[:, None] + UP[None, :] * lift[:, None]
    right = pts - side[None, :] * (w / 2)[:, None] + UP[None, :] * lift[:, None]
    v = np.concatenate([left, pts, right])
    m = nseg + 1
    f = []
    for i in range(nseg):
        f.append([i, m + i, m + i + 1, i + 1])
        f.append([m + i, 2 * m + i, 2 * m + i + 1, m + i + 1])
    GS[mat].add(v, f)
    return pts


def blades(mat, pos, n, L, W, rng, spread=1.0, droop=0.9, r0=0.05):
    for _ in range(n):
        az = rng.uniform(0, 2 * math.pi)
        b = np.asarray(pos, float) + np.array([math.cos(az), math.sin(az), 0]) * rng.uniform(0, r0)
        paddle(mat, b, az, rng.uniform(1.0, 1.5) - 0.5 * (spread - 1), L * rng.uniform(0.7, 1.15), W, droop * rng.uniform(0.5, 1.3),
               nseg=3, shape='strap', fold=0.0)


# ------------------------------------------------------------ árvores
def trunk(mat, base, top, r0, r1, wobble, rng, n=7, seg=10):
    base = np.asarray(base, float); top = np.asarray(top, float)
    t = np.linspace(0, 1, n)
    pts = base[None, :] + (top - base)[None, :] * t[:, None]
    off = rng.normal(scale=wobble, size=(n, 3)); off[:, 2] = 0; off[0] = 0; off[-1] = 0
    pts = pts + off * np.sin(math.pi * t)[:, None]
    rad = r0 + (r1 - r0) * t ** 0.7
    rad[0] = r0 * 1.25
    tube(mat, pts, rad, seg=seg, smooth=True, cap=False)
    return pts


def limb(mat, a, b, r0, r1, rng, bend=0.25, n=6, seg=7):
    a = np.asarray(a, float); b = np.asarray(b, float)
    t = np.linspace(0, 1, n)
    pts = a[None, :] + (b - a)[None, :] * t[:, None]
    L = np.linalg.norm(b - a)
    sag = np.array([rng.normal(scale=0.12), rng.normal(scale=0.12), bend]) * L
    pts = pts + np.sin(math.pi * t)[:, None] * sag[None, :] * 0.5
    tube(mat, pts, r0 + (r1 - r0) * t, seg=seg, smooth=True)
    return pts


def broadleaf(pos, bark, leaf, dark, blobs, th, tr, density, L, W, droop, rng, lean=(0, 0), flat=0.0,
              branch_r=None, fork=None, bottom=None, filler=0.6):
    """blobs: lista de (deslocamento xyz relativo a pos, raios)."""
    pos = np.asarray(pos, float)
    top = pos + np.array([lean[0], lean[1], th])
    trunk(bark, pos, top, tr, tr * 0.8, 0.06 * th, rng)
    br = branch_r or tr * 0.45
    wb = [(pos + np.asarray(o, float), np.broadcast_to(np.asarray(r, float), (3,))) for o, r in blobs]
    for c, r in wb:
        start = top if fork is None else pos + np.array([lean[0] * fork, lean[1] * fork, th * fork]) + rng.normal(scale=0.05, size=3)
        end = c - np.array([0, 0, r[2] * 0.25])
        limb(bark, top if fork is None else top, end, br, 0.035, rng)
        if filler:
            ellipsoid(dark, c, r * filler, seg=10, rings=6)
    crown(leaf, wb, density, L, W, droop, rng, flat=flat, bottom=bottom)
    return wb


def fruits_in(mat, blobs, n, r, rng, stretch=1.0, low=True):
    for _ in range(n):
        c, rr = blobs[rng.integers(len(blobs))]
        d = rand_unit(rng, 1)[0]
        if low:
            d[2] = -abs(d[2]) * 0.8
            d = _unit(d)
        p = c + d * rr * rng.uniform(0.85, 1.02)
        ellipsoid(mat, p, (r, r, r * stretch), seg=7, rings=5)


def mangueira(pos, rng):
    blobs = [((0, 0, 6.6), (2.9, 2.9, 2.5)), ((2.5, 0.4, 5.3), (2.4, 2.4, 2.0)), ((-2.4, 0.6, 5.2), (2.4, 2.3, 2.0)),
             ((0.3, 2.6, 5.4), (2.3, 2.4, 2.0)), ((0.2, -1.6, 5.3), (2.4, 1.9, 2.0)), ((1.6, 1.9, 7.4), (2.0, 2.0, 1.7)),
             ((-1.5, -0.6, 7.6), (2.0, 2.0, 1.7)), ((-1.8, 2.3, 6.3), (1.9, 1.9, 1.6)), ((2.2, -1.2, 6.9), (1.8, 1.7, 1.5))]
    wb = broadleaf(pos, 'bark_dark', 'leaf_mango', 'leaf_core_big', blobs, 2.4, 0.36, 78, 0.28, 0.07, 0.85, rng, branch_r=0.17)
    fruits_in('fruit_mango', wb, 45, 0.055, rng, stretch=1.5)


def amendoeira(pos, rng, r0=0.34, r1=0.27, incl=(0.3, 0.2)):
    pos = np.asarray(pos, float)
    top = pos + np.array([incl[0], incl[1], 3.4])
    trunk('bark_dark', pos, top, r0, r1, 0.12, rng)
    tiers = [(4.4, 4.1, 7), (5.6, 4.0, 7), (6.8, 3.2, 6), (7.9, 2.2, 4), (8.8, 1.1, 1)]
    blobs = []
    for z, R, n in tiers:
        for k in range(n):
            a = 2 * math.pi * (k + rng.uniform(-0.25, 0.25)) / n + z
            rr = R * rng.uniform(0.55, 0.72) if n > 1 else 0
            c = pos + np.array([incl[0] + rr * math.cos(a), incl[1] + rr * math.sin(a), z + rng.uniform(-0.15, 0.15)])
            r = np.array([R * 0.42, R * 0.42, 0.55])
            blobs.append((c, r))
            limb('bark_dark', top + np.array([0, 0, min(z - 3.6, 3.0) * 0.6]), c - np.array([0, 0, 0.2]), 0.13, 0.03, rng, bend=0.05)
            ellipsoid('leaf_core_big', c, r * 0.6, seg=10, rings=5)
        ellipsoid('leaf_core_big', pos + np.array([incl[0], incl[1], z]), (R * 0.45, R * 0.45, 0.5), seg=10, rings=5)
    tube('bark_dark', [top, pos + np.array([incl[0], incl[1], 8.6])], [r1 - 0.03, 0.05], seg=8)
    crown('leaf_amend', blobs, 85, 0.30, 0.16, 0.12, rng, flat=0.75)
    crown('leaf_amend_red', blobs, 3.5, 0.30, 0.16, 0.12, rng, flat=0.75)
    return blobs


def jabuticabeira(pos, rng, R=1.75, H=2.7):
    pos = np.asarray(pos, float)
    blobs = [(pos + np.array([0, 0, H]), np.array([R, R, R * 0.85])),
             (pos + np.array([0.7, 0.3, H + 0.5]), np.array([R * 0.6, R * 0.6, R * 0.55])),
             (pos + np.array([-0.6, -0.4, H + 0.4]), np.array([R * 0.6, R * 0.6, R * 0.55])),
             (pos + np.array([-0.2, 0.8, H - 0.2]), np.array([R * 0.6, R * 0.6, R * 0.5])),
             (pos + np.array([0.3, -0.9, H - 0.1]), np.array([R * 0.6, R * 0.6, R * 0.5]))]
    stems = []
    for k in range(5):
        a = 2 * math.pi * k / 5 + rng.uniform(-0.3, 0.3)
        mid = pos + np.array([0.35 * math.cos(a), 0.35 * math.sin(a), 1.0])
        end = pos + np.array([1.0 * math.cos(a), 1.0 * math.sin(a), H - 0.3])
        pts = np.array([pos + np.array([0.08 * math.cos(a), 0.08 * math.sin(a), 0]), mid, (mid + end) / 2 + rng.normal(scale=0.06, size=3), end])
        tube('bark_jabu', pts, [0.085, 0.07, 0.055, 0.03], seg=8)
        stems.append(pts)
    for c, r in blobs:
        ellipsoid('leaf_core', c, r * 0.72, seg=12, rings=7)
    crown('leaf_jabu', blobs, 230, 0.13, 0.055, 0.25, rng, shell=(0.75, 1.02))
    # a marca registrada: frutas pretas grudadas direto nos troncos e galhos
    for pts in stems:
        for _ in range(110):
            i = rng.integers(0, len(pts) - 1); t = rng.uniform()
            p = pts[i] * (1 - t) + pts[i + 1] * t
            if p[2] < 0.25:
                continue
            rad = [0.085, 0.07, 0.055, 0.03][i]
            d = rand_unit(rng, 1)[0]; d[2] *= 0.3; d = _unit(d)
            ellipsoid('fruit_black', p + d * (rad + 0.012), 0.024, seg=7, rings=5)
    return blobs


def goiabeira(pos, rng):
    pos = np.asarray(pos, float)
    blobs = [((0.0, 0.0, 3.3), (1.5, 1.5, 1.2)), ((1.3, 0.3, 2.8), (1.2, 1.1, 0.95)), ((-1.2, 0.5, 2.9), (1.2, 1.2, 0.95)),
             ((0.2, -1.2, 2.7), (1.1, 1.1, 0.9)), ((0.5, 1.0, 3.9), (1.0, 1.0, 0.85)), ((-0.6, -0.5, 4.0), (0.95, 0.95, 0.8))]
    wb = broadleaf(pos, 'bark_goiaba', 'leaf_goiaba', 'leaf_core', blobs, 1.0, 0.13, 95, 0.17, 0.085, 0.25, rng,
                   lean=(0.15, 0.05), branch_r=0.075, filler=0.5)
    fruits_in('fruit_goiaba', wb, 34, 0.042, rng, stretch=1.1)
    return wb


def citrus(pos, rng, fruit='fruit_orange', R=1.15, n=30):
    blobs = [((0, 0, 1.95), (R, R, R * 0.9)), ((0.45, 0.2, 2.35), (R * 0.6, R * 0.6, R * 0.5)), ((-0.4, -0.3, 2.3), (R * 0.6, R * 0.6, R * 0.5))]
    wb = broadleaf(pos, 'bark_dark', 'leaf_citrus', 'leaf_core', blobs, 0.85, 0.07, 150, 0.13, 0.06, 0.2, rng, branch_r=0.04, filler=0.72)
    fruits_in(fruit, wb, n, 0.04, rng, low=False)


def small_tree(pos, rng, leaf='leaf_goiaba', R=1.3, H=2.4, fruit=None):
    blobs = [((0, 0, H), (R, R, R * 0.8)), ((0.5, 0.3, H + 0.4), (R * 0.6, R * 0.6, R * 0.5)), ((-0.5, -0.2, H + 0.3), (R * 0.6, R * 0.6, R * 0.5))]
    wb = broadleaf(pos, 'bark_dark', leaf, 'leaf_core', blobs, H * 0.45, 0.07, 120, 0.12, 0.05, 0.3, rng, branch_r=0.04, filler=0.6)
    if fruit:
        fruits_in(fruit, wb, 40, 0.02, rng, low=False)


def bg_tree(pos, rng, R=3.5, H=6.0, leaf='leaf_bg'):
    pos = np.asarray(pos, float)
    blobs = []
    for k in range(5):
        a = rng.uniform(0, 2 * math.pi)
        o = np.array([R * 0.45 * math.cos(a), R * 0.45 * math.sin(a), H + rng.uniform(-0.8, 1.0)]) if k else np.array([0, 0, H + 0.6])
        blobs.append((pos + o, np.array([R * 0.62, R * 0.62, R * 0.5]) * rng.uniform(0.85, 1.15)))
    trunk('bark_dark', pos, pos + np.array([0, 0, H - 0.5]), 0.25, 0.15, 0.2, rng, seg=7)
    for c, r in blobs:
        ellipsoid('leaf_core', c, r * 0.8, seg=10, rings=6)
    crown(leaf, blobs, 30, 0.42, 0.17, 0.4, rng)


# ------------------------------------------------------------ palmeiras
def coqueiro(pos, H, rng, lean_az=0.0, lean=0.9, fronds=20, FL=3.6, nuts=True, leaf='leaf_palm', tr=0.16):
    pos = np.asarray(pos, float)
    n = 14
    t = np.linspace(0, 1, n)
    hd = np.array([math.cos(lean_az), math.sin(lean_az), 0])
    pts = pos[None, :] + np.outer(t ** 1.8 * lean, hd) + np.outer(t * H, UP)
    rad = tr * (1.0 - 0.38 * t); rad[0] = tr * 1.5; rad[1] = tr * 1.15
    tube('bark_palm', pts, rad, seg=10)
    top = pts[-1]
    ellipsoid('leaf_palm_base', top + np.array([0, 0, 0.15]), (0.22, 0.22, 0.38), seg=8, rings=5)
    for k in range(fronds):
        az = k * 2.39996 + rng.uniform(-0.2, 0.2)
        u = (k + 0.5) / fronds
        e0 = 1.35 - 1.75 * u            # novas eretas -> velhas pendentes
        droop = 0.9 + 0.9 * u + rng.uniform(-0.1, 0.1)
        L = FL * (0.75 + 0.3 * math.sin(math.pi * min(1, u * 1.3)))
        ns = 16
        tt = np.linspace(0, 1, ns + 1)
        e = e0 - droop * tt ** 1.5
        fh = np.array([math.cos(az), math.sin(az), 0]); side = np.array([-math.sin(az), math.cos(az), 0])
        rp = [top + np.array([0, 0, 0.25]) + fh * 0.12]
        for i in range(ns):
            em = (e[i] + e[i + 1]) / 2
            rp.append(rp[-1] + (L / ns) * (math.cos(em) * fh + math.sin(em) * UP))
        rp = np.array(rp)
        tube('leaf_palm_rachis', rp, 0.035 * (1 - 0.8 * tt) + 0.006, seg=4, smooth=True)
        # folíolos
        nl = 46
        ts = np.linspace(0.10, 0.99, nl)
        idx = np.clip((ts * ns).astype(int), 0, ns - 1); fr = ts * ns - idx
        base = rp[idx] * (1 - fr)[:, None] + rp[idx + 1] * fr[:, None]
        tang = _unit(rp[idx + 1] - rp[idx])
        ll = 0.95 * np.sin(math.pi * ts ** 0.7) ** 0.6 * (L / 3.6) + 0.12
        for sgn in (1, -1):
            d1 = _unit(sgn * side[None, :] + tang * 0.45 + UP[None, :] * 0.15 + rng.normal(scale=0.06, size=(nl, 3)))
            mid = base + d1 * (ll * 0.5)[:, None]
            d2 = _unit(d1 + UP[None, :] * (-0.75 - 0.5 * u))
            tip = mid + d2 * (ll * 0.5)[:, None]
            w0 = 0.045 * (L / 3.6)
            v = np.empty((nl, 6, 3))
            v[:, 0] = base - tang * w0; v[:, 1] = base + tang * w0
            v[:, 2] = mid + tang * w0 * 0.8; v[:, 3] = mid - tang * w0 * 0.8
            v[:, 4] = tip + tang * w0 * 0.15; v[:, 5] = tip - tang * w0 * 0.15
            o = np.arange(nl)[:, None] * 6
            f = np.concatenate([o + np.array([0, 1, 2, 3]), o + np.array([3, 2, 4, 5])])
            GS[leaf].add(v.reshape(-1, 3), f)
    if nuts:
        for k in range(9):
            a = rng.uniform(0, 2 * math.pi)
            p = top + np.array([0.24 * math.cos(a), 0.24 * math.sin(a), -0.12 - rng.uniform(0, 0.25)])
            ellipsoid('coconut', p, (0.105, 0.105, 0.13), seg=8, rings=6)
    return top


def areca(pos, rng, H=2.6, stems=6):
    pos = np.asarray(pos, float)
    for k in range(stems):
        a = 2 * math.pi * k / stems + rng.uniform(-0.3, 0.3)
        b = pos + np.array([0.18 * math.cos(a), 0.18 * math.sin(a), 0])
        coqueiro(b, H * rng.uniform(0.55, 1.0), rng, lean_az=a, lean=0.35, fronds=7, FL=1.5, nuts=False, tr=0.035)


def bananeira(pos, rng, stems=3, H=2.6, bunch=True):
    pos = np.asarray(pos, float)
    for k in range(stems):
        a = 2 * math.pi * k / stems + rng.uniform(-0.4, 0.4)
        b = pos + np.array([0.28 * math.cos(a), 0.28 * math.sin(a), 0]) * (1 if stems > 1 else 0)
        h = H * (1.0 if k == 0 else rng.uniform(0.5, 0.85))
        top = b + np.array([0.1 * math.cos(a), 0.1 * math.sin(a), h])
        tube('stem_banana', [b, (b + top) / 2, top], [0.13 * h / H + 0.02, 0.10 * h / H + 0.02, 0.06], seg=9)
        nl = 7 if k == 0 else 5
        for j in range(nl):
            az = j * 2.4 + rng.uniform(-0.3, 0.3)
            e0 = 1.25 - 0.75 * j / nl
            paddle('leaf_banana', top, az, e0, (1.9 if k == 0 else 1.3) * rng.uniform(0.85, 1.1), 0.52 * h / H, 1.3 + 0.6 * j / nl,
                   nseg=8, shape='paddle', fold=0.10)
        if bunch and k == 0:
            hang = [top, top + np.array([0.25, 0.1, -0.05]), top + np.array([0.4, 0.15, -0.6])]
            tube('stem_banana', hang, 0.03, seg=5)
            for i in range(5):
                for q in range(7):
                    aa = 2 * math.pi * q / 7
                    p = hang[-1] + np.array([0.09 * math.cos(aa), 0.09 * math.sin(aa), 0.5 - i * 0.11])
                    ellipsoid('fruit_banana', p, (0.03, 0.03, 0.075), seg=5, rings=4)


# ------------------------------------------------------------ sub-bosque tropical
def heliconia(pos, rng, n=9, H=1.9, flower='flower_red', leaf='leaf_trop', spread=0.2, W=0.24, lf=0.42):
    pos = np.asarray(pos, float)
    for k in range(n):
        a = rng.uniform(0, 2 * math.pi)
        b = pos + np.array([math.cos(a), math.sin(a), 0]) * rng.uniform(0.02, spread)
        h = H * rng.uniform(0.6, 1.0)
        top = b + np.array([0.18 * math.cos(a), 0.18 * math.sin(a), h * 0.62])
        tube('stem_green', [b, top], [0.022, 0.014], seg=5)
        for j in range(4):
            az = a + j * math.pi + rng.uniform(-0.5, 0.5)
            st = b + (top - b) * (0.55 + 0.15 * j)
            paddle(leaf, st, az, 1.3 - 0.12 * j, h * lf * rng.uniform(0.85, 1.1), W, 0.8 + 0.2 * j, nseg=5, fold=0.12)
        if flower and rng.uniform() < 0.6:
            # brácteas em zigue-zague
            fb = top + np.array([0, 0, 0.05])
            for i in range(5):
                sgn = 1 if i % 2 == 0 else -1
                az2 = a + math.pi / 2
                paddle(flower, fb + np.array([0, 0, i * 0.075]), az2 + (0 if sgn > 0 else math.pi), 0.55, 0.19, 0.075, 0.1, nseg=2, shape='lance', fold=0.5)
            tube('stem_green', [top, fb + np.array([0, 0, 0.4])], 0.01, seg=4)


def alpinia(pos, rng, n=8, H=1.7, flower='flower_red'):
    pos = np.asarray(pos, float)
    for k in range(n):
        a = rng.uniform(0, 2 * math.pi)
        b = pos + np.array([math.cos(a), math.sin(a), 0]) * rng.uniform(0.02, 0.22)
        h = H * rng.uniform(0.65, 1.0)
        lean = rng.uniform(0.15, 0.5)
        pts = np.array([b, b + np.array([lean * 0.3 * math.cos(a), lean * 0.3 * math.sin(a), h * 0.55]),
                        b + np.array([lean * math.cos(a), lean * math.sin(a), h])])
        tube('stem_green', pts, [0.016, 0.012, 0.008], seg=5)
        for j in range(9):
            t = 0.25 + 0.75 * j / 9
            p = pts[0] + (pts[2] - pts[0]) * t + (pts[1] - (pts[0] + pts[2]) / 2) * math.sin(math.pi * t)
            az = a + (math.pi / 2 if j % 2 else -math.pi / 2) + rng.uniform(-0.3, 0.3)
            paddle('leaf_trop2', p, az, 0.5, 0.42, 0.10, 0.7, nseg=4, shape='lance', fold=0.1)
        if flower and rng.uniform() < 0.45:
            ellipsoid(flower, pts[2] + np.array([0, 0, 0.07]), (0.032, 0.032, 0.095), seg=7, rings=5)


def dracena(pos, rng, canes=3, H=2.2):
    pos = np.asarray(pos, float)
    for k in range(canes):
        a = 2 * math.pi * k / canes + rng.uniform(-0.3, 0.3)
        b = pos + np.array([0.13 * math.cos(a), 0.13 * math.sin(a), 0])
        h = H * rng.uniform(0.6, 1.0)
        top = b + np.array([0.05 * math.cos(a), 0.05 * math.sin(a), h])
        tube('bark_cane', [b, top], [0.04, 0.032], seg=7)
        for j in range(26):
            az = j * 2.4
            paddle('leaf_dracena', top + np.array([0, 0, -0.22 + 0.01 * j]), az, 1.3 - 0.045 * j, rng.uniform(0.5, 0.7), 0.085,
                   1.1 + 0.03 * j, nseg=4, shape='strap', fold=0.15)


def rafis(pos, rng, canes=7, H=1.7):
    pos = np.asarray(pos, float)
    for k in range(canes):
        a = rng.uniform(0, 2 * math.pi)
        b = pos + np.array([math.cos(a), math.sin(a), 0]) * rng.uniform(0.02, 0.25)
        h = H * rng.uniform(0.6, 1.0)
        tube('bark_cane', [b, b + np.array([0, 0, h])], 0.014, seg=5)
        for j in range(5):
            z = h * (0.55 + 0.11 * j)
            az = rng.uniform(0, 2 * math.pi)
            st = b + np.array([0, 0, z])
            hub = st + np.array([0.2 * math.cos(az), 0.2 * math.sin(az), 0.07])
            tube('stem_green', [st, hub], 0.005, seg=3)
            for q in range(8):
                paddle('leaf_rafis', hub, az + (q - 3.5) * 0.36, 0.25 - 0.05 * abs(q - 3.5), 0.30, 0.055, 0.5, nseg=2, shape='strap', fold=0.2)


def mound(mat, pos, rng, n=28, L=0.45, W=0.16, shape='paddle', e=(0.2, 1.3), droop=0.8, r0=0.08):
    pos = np.asarray(pos, float)
    for k in range(n):
        az = rng.uniform(0, 2 * math.pi)
        b = pos + np.array([math.cos(az), math.sin(az), 0]) * rng.uniform(0, r0)
        paddle(mat, b, az, rng.uniform(*e), L * rng.uniform(0.7, 1.1), W, droop * rng.uniform(0.6, 1.2), nseg=4, shape=shape, fold=0.12)


def xanadu(pos, rng, s=1.0):
    mound('leaf_trop2', pos, rng, n=34, L=0.48 * s, W=0.17 * s, shape='paddle', e=(0.25, 1.25), droop=0.9)


def pacova(pos, rng, s=1.0):
    mound('leaf_trop', pos, rng, n=14, L=0.6 * s, W=0.26 * s, shape='paddle', e=(0.6, 1.3), droop=0.8)


def asplenio(pos, rng, s=1.0):
    mound('leaf_lime', pos, rng, n=18, L=0.7 * s, W=0.13 * s, shape='lance', e=(0.9, 1.35), droop=0.7)


def moreia(pos, rng, s=1.0):
    blades('leaf_strap', pos, 40, 0.6 * s, 0.022, rng, droop=0.7, r0=0.08)


def grama_preta(pos, rng):
    blades('leaf_black', pos, 30, 0.2, 0.012, rng, droop=1.2, r0=0.06)


def inhame(pos, rng, n=7, leaf='leaf_purple'):
    pos = np.asarray(pos, float)
    for k in range(n):
        az = rng.uniform(0, 2 * math.pi)
        h = rng.uniform(0.45, 0.9)
        top = pos + np.array([0.25 * math.cos(az), 0.25 * math.sin(az), h])
        tube('stem_purple', [pos, top], 0.012, seg=4)
        paddle(leaf, top, az, 0.1, 0.34, 0.25, 0.9, nseg=4, shape='heart', fold=0.08)


def papiro(pos, rng, n=14, H=0.8):
    pos = np.asarray(pos, float)
    for k in range(n):
        az = rng.uniform(0, 2 * math.pi)
        b = pos + np.array([math.cos(az), math.sin(az), 0]) * rng.uniform(0, 0.12)
        top = b + np.array([0.12 * math.cos(az), 0.12 * math.sin(az), H * rng.uniform(0.6, 1.0)])
        tube('stem_green', [b, top], 0.006, seg=3)
        for q in range(9):
            paddle('leaf_lime', top, q * 0.7, 0.25, 0.16, 0.012, 0.6, nseg=2, shape='strap', fold=0)


def bromelia(pos, rng, s=1.0, normal=None, red=True):
    """Roseta. Se normal for informada (ex.: num muro), o eixo da roseta inclina para fora."""
    pos = np.asarray(pos, float)
    for j in range(16):
        az = j * 2.4
        paddle('leaf_brom', pos, az, 1.2 - 0.06 * j, 0.34 * s, 0.07 * s, 1.0, nseg=3, shape='strap', fold=0.3)
    if red:
        for j in range(6):
            paddle('flower_red', pos + np.array([0, 0, 0.02]), j * 1.05, 1.25, 0.16 * s, 0.05 * s, 0.6, nseg=2, shape='strap', fold=0.3)


def chifre(pos, facing, rng, s=1.0):
    """Chifre-de-veado numa tábua de cumaru presa no muro. pos na face do muro; facing = +1/-1 ao longo de y."""
    pos = np.asarray(pos, float)
    box('wood_z', pos[0] - 0.22 * s, pos[0] + 0.22 * s, min(pos[1], pos[1] + facing * 0.03), max(pos[1], pos[1] + facing * 0.03),
        pos[2] - 0.32 * s, pos[2] + 0.32 * s)
    c = pos + np.array([0, facing * 0.08, 0.05])
    ellipsoid('leaf_trop', c, (0.13 * s, 0.05, 0.13 * s), seg=10, rings=6)
    for j in range(18):
        az = (math.pi / 2 if facing > 0 else -math.pi / 2) + rng.uniform(-1.0, 1.0)
        paddle('leaf_trop2', c, az, rng.uniform(0.0, 0.9), 0.55 * s * rng.uniform(0.7, 1.1), 0.09 * s, 1.6, nseg=4, shape='strap', fold=0.1)


def fern_hanging(pos, rng, s=1.0):
    pos = np.asarray(pos, float)
    cyl('pot_fiber', pos + np.array([0, 0, -0.16]), 0.12 * s, 0.16, seg=10, r_top=0.16 * s)
    tube('rope', [pos, pos + np.array([0, 0, 0.55])], 0.004, seg=3)
    for j in range(34):
        az = j * 2.4
        paddle('leaf_fern', pos, az, rng.uniform(0.3, 1.2), 0.7 * s * rng.uniform(0.7, 1.1), 0.075, rng.uniform(1.8, 2.6), nseg=5, shape='lance', fold=0.05)


def pot(pos, r=0.28, h=0.5, mat='pot_clay'):
    pos = np.asarray(pos, float)
    cyl(mat, pos, r * 0.7, h, seg=14, r_top=r)
    return pos + np.array([0, 0, h - 0.03])


def herbs(pos, rng, kind=0):
    if kind == 0:
        blades('leaf_lime', pos, 40, 0.3, 0.008, rng, droop=0.6, r0=0.1)        # cebolinha
    elif kind == 1:
        mound('leaf_lime', pos, rng, n=40, L=0.12, W=0.07, e=(0.2, 1.4), droop=0.3, r0=0.14)  # manjericão
    elif kind == 2:
        blades('leaf_strap', pos, 60, 0.35, 0.006, rng, droop=0.4, r0=0.12)   # alecrim
    else:
        mound('leaf_trop2', pos, rng, n=45, L=0.09, W=0.05, e=(0.0, 1.0), droop=0.5, r0=0.2)  # hortelã


def vine_wall(mat, x0, x1, z0, z1, y, facing, rng, density=230, cover=0.55, seed=0.0, leaf=0.085, axis='y'):
    """Cobertura de folhas numa face de muro. axis='y': plano do muro em y, estendendo-se em x. axis='x': plano do muro em x=y, estendendo-se em y em [x0,x1]."""
    n = int((x1 - x0) * (z1 - z0) * density)
    u = rng.uniform(x0, x1, n); z = rng.uniform(z0, z1, n)
    f = (np.sin(u * 1.3 + seed) + np.sin(u * 0.47 + 2 * seed + z * 0.8) + 0.8 * np.sin(z * 2.1 + u * 0.9 + seed)
         + 1.2 * (1 - (z - z0) / (z1 - z0)) * 0 + rng.normal(scale=0.35, size=n))
    thr = np.quantile(f, 1 - cover)
    k = f > thr
    u = u[k]; z = z[k]; n = len(u)
    off = rng.uniform(0.005, 0.05, n) * facing
    if axis == 'y':
        p = np.stack([u, np.full(n, y) + off, z], axis=1); nrm = np.array([0, facing, 0.0])
    else:
        p = np.stack([np.full(n, y) + off, u, z], axis=1); nrm = np.array([facing, 0, 0.0])
    t = rng.normal(size=(n, 3)); t = t - np.outer(t @ nrm, nrm) * 0.9; t[:, 2] -= 0.6
    a = _unit(t)
    s = _unit(np.cross(a, nrm[None, :] + rng.normal(scale=0.25, size=(n, 3))))
    cards(mat, p, a, s, leaf * rng.uniform(0.7, 1.3, n), leaf * 0.75)


def vine_top(mat, x0, x1, y0, y1, z, rng, density=160, leaf=0.14, hang=0.5, flower=None):
    n = int((x1 - x0) * (y1 - y0) * density)
    p = np.stack([rng.uniform(x0, x1, n), rng.uniform(y0, y1, n), z + rng.uniform(-0.05, 0.12, n)], axis=1)
    a = rand_unit(rng, n); a[:, 2] = a[:, 2] * 0.3 - 0.2; a = _unit(a)
    s = _unit(np.cross(a, UP[None, :] + rng.normal(scale=0.3, size=(n, 3))))
    cards(mat, p, a, s, leaf * rng.uniform(0.7, 1.3, n), leaf * 0.8)
    # ramos pendentes
    m = int((x1 - x0) * (y1 - y0) * 4)
    for _ in range(m):
        b = np.array([rng.uniform(x0, x1), rng.uniform(y0, y1), z])
        L = rng.uniform(0.15, hang)
        tube('stem_green', [b, b + np.array([0, 0, -L])], 0.004, seg=3)
        k = int(L * 30) + 2
        pp = b[None, :] + np.outer(np.linspace(0, 1, k), np.array([0, 0, -L])) + rng.normal(scale=0.02, size=(k, 3))
        aa = rand_unit(rng, k); aa[:, 2] = -abs(aa[:, 2]) - 0.5; aa = _unit(aa)
        ss = _unit(np.cross(aa, rand_unit(rng, k)))
        cards(mat, pp, aa, ss, leaf * 0.8, leaf * 0.6)
        if flower and rng.uniform() < 0.8:
            for q in range(4):
                ellipsoid(flower, b + np.array([rng.normal(scale=0.02), rng.normal(scale=0.02), -L - 0.04 * q]), (0.022, 0.022, 0.035), seg=5, rings=4)
