"""Exporta a versão leve, em tempo real, do modelo da chácara (o mesmo build.py) para o passeio no navegador.

Diferenças em relação à maquete do álbum:
- copas feitas de "cachos": cartões quadrados com a textura de um raminho de folhas da espécie
  (public/chacara3d/tex/folhas), com normais apontando para fora da copa (sombreamento macio);
- folhas em tira com coordenadas de textura (u atravessa a folha, v vai da base à ponta);
- frondes dos coqueiros como duas fitas por fronde (textura com os folíolos);
- troncos com coordenadas de textura em metros (casca);
- sem as galinhas e as carpas de enfeite (no passeio elas são animadas).

Saída (formato 2): <saida>/terreno.bin e <saida>/terreno.json
  bloco pos: Int16 x3 por vértice, escala 1/256 m, eixos do three.js (X = x, Y = cima, Z = -y)
  bloco idx: Uint32 (só grupos suaves, indexados)
  bloco uv:  Uint16 x2 por vértice dos grupos que têm uv; valor = bruto / 65535 * escala do grupo ('uvs')
  bloco nrm: Int8 x4 por vértice dos grupos que têm normais próprias (x, y, z já nos eixos do three.js, 0)
  extra: colisores, pisos, portas, luzes, ventiladores e lugares das tiny houses (build.EXTRA)
"""
import os, sys, json, types, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import numpy as np
import bpy

OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'rt')
os.makedirs(OUT, exist_ok=True)
FOLHAS = json.load(open(os.path.join(HERE, '..', '..', 'public', 'chacara3d', 'tex', 'folhas.json'), encoding='utf-8'))


def load(name, edits):
    src = open(os.path.join(HERE, name + '.py'), encoding='utf-8').read()
    for a, b in edits:
        assert a in src, (name, a)
        src = src.replace(a, b)
    m = types.ModuleType(name)
    m.__file__ = os.path.join(HERE, name + '.py')
    sys.modules[name] = m
    exec(compile(src, m.__file__, 'exec'), m.__dict__)
    return m


# ---------------------------------------------------------------- geo com telhados / tubos / esferas mais grossos + registro de materiais
geo = load('geo', [("du = wave / 10", "du = wave / 3")])

# o acúmulo de geometria passa a guardar uv e normais opcionais por pedaço
_ini = geo.Geo.__init__


def _init(self):
    _ini(self)
    self.uv = []
    self.nrm = []


_add = geo.Geo.add


def _add2(self, verts, faces, uv=None, nrm=None):
    _add(self, verts, faces)
    self.uv.append(None if uv is None else np.asarray(uv, float).reshape(-1, 2))
    self.nrm.append(None if nrm is None else np.asarray(nrm, float).reshape(-1, 3))


geo.Geo.__init__ = _init
geo.Geo.add = _add2

INFO = {}


def reg(fn_name, kind, names):
    fn = getattr(geo, fn_name)

    def w(name, *a, **k):
        d = dict(zip(names, a)); d.update(k); d['t'] = kind
        INFO[name] = d
        return fn(name, *a, **k)
    setattr(geo, fn_name, w)


reg('m_plain', 'plain', ['color', 'rough', 'noise', 'nscale', 'bump'])
reg('m_emit', 'emit', ['color', 'strength'])
reg('m_leaf', 'leaf', ['c1', 'c2', 'rough', 'trans'])
reg('m_tile', 'tile', ['stops', 'scale', 'grout', 'gw', 'rough'])
reg('m_water', 'water', ['tint', 'rough', 'ripple', 'scale'])
reg('m_caco', 'caco', ['scale'])
reg('m_brick', 'brick', ['c1', 'c2', 'mortar', 'bw', 'rh', 'ms', 'mode', 'rough', 'bump'])
reg('m_wood', 'wood', ['axis', 'c1', 'c2', 'rough'])
reg('m_grass', 'grass', [])
reg('m_gravel', 'gravel', ['c1', 'c2', 'scale'])

_ell = geo.ellipsoid


def ellipsoid(mat, c, r, seg=12, rings=8, R=None, smooth=True, zmin=-1.0):
    rm = float(np.max(np.broadcast_to(np.asarray(r, float), (3,))))
    if rm < 0.09:
        seg, rings = min(seg, 5), min(rings, 3)
    elif rm < 0.4:
        seg, rings = min(seg, 8), min(rings, 5)
    else:
        seg, rings = min(seg, 10), min(rings, 6)
    return _ell(mat, c, r, seg, rings, R, smooth, zmin)


geo.ellipsoid = ellipsoid
_tube = geo.tube
CASCAS = {'bark_dark', 'bark_palm', 'bark_jabu', 'bark_goiaba', 'bark_cane', 'stem_banana', 'log'}


def tube(mat, pts, radii, seg=8, smooth=True, cap=False):
    rm = float(np.max(radii)) if np.ndim(radii) else float(radii)
    if rm < 0.012:
        seg = 3
    elif rm < 0.05:
        seg = min(seg, 5)
    elif rm < 0.2:
        seg = min(seg, 8)
    store = (geo.GS if smooth else geo.G)[mat]
    i0 = len(store.v)
    _tube(mat, pts, radii, seg, smooth, cap)
    if mat in CASCAS:
        # casca: u em volta do tronco (espelhado, sem costura), v ao longo, os dois em metros
        P_ = np.asarray(pts, float); n = len(P_)
        r = np.broadcast_to(np.asarray(radii, float), (n,)) if np.ndim(radii) else np.full(n, float(radii))
        s = np.concatenate([[0.0], np.cumsum(np.linalg.norm(np.diff(P_, axis=0), axis=1))])
        k = np.arange(seg)
        m = 1.0 - np.abs(2.0 * k / seg - 1.0)
        u = np.outer(math.pi * r, m)
        v = np.repeat(s, seg).reshape(n, seg)
        store.uv[i0] = np.stack([u.ravel(), v.ravel()], axis=1)


geo.tube = tube


def _unit(v):
    v = np.asarray(v, float)
    return v / (np.linalg.norm(v, axis=-1, keepdims=True) + 1e-12)


# ---------------------------------------------------------------- folhagem com textura
CACHO = {'leaf_mango': 'manga', 'leaf_amend': 'amendoeira', 'leaf_amend_red': 'amendoeira_vermelha', 'leaf_jabu': 'jabuticaba',
         'leaf_goiaba': 'goiaba', 'leaf_citrus': 'citrico', 'leaf_bg': 'fundo', 'leaf_vine': 'trepadeira',
         'leaf_vine_light': 'maracuja'}
CARTA = {m: (FOLHAS[t]['carta_m'], FOLHAS[t]['cobertura']) for m, t in CACHO.items()}
GIRO = np.random.default_rng(91)        # só para espelhar cartões ao acaso, fora do sorteio da cena

P = load('plants', [
    ("        for _ in range(110):", "        for _ in range(34):"),
    ("ellipsoid('fruit_black', p + d * (rad + 0.012), 0.024, seg=7, rings=5)", "ellipsoid('fruit_black', p + d * (rad + 0.012), 0.032, seg=5, rings=3)"),
])
UP = np.array([0, 0, 1.0])


def cartas_cacho(mat, p, a, s, L, centro=None, raios=None):
    """Cartões quadrados: base em p (u = 0,5, v = 0), sobem pela direção a; s é a lateral."""
    n = len(p)
    if n == 0:
        return
    L = np.broadcast_to(np.asarray(L, float), (n,))[:, None]
    v = np.empty((n, 4, 3))
    v[:, 0] = p - s * L * 0.5
    v[:, 1] = p + s * L * 0.5
    v[:, 2] = p + a * L + s * L * 0.5
    v[:, 3] = p + a * L - s * L * 0.5
    uv = np.tile(np.array([[0, 0], [1, 0], [1, 1], [0, 1]], float), (n, 1, 1))
    vira = GIRO.random(n) < 0.5
    uv[vira, :, 0] = 1.0 - uv[vira, :, 0]
    fn = _unit(np.cross(s, a))
    if centro is not None:
        q = (v - np.asarray(centro, float)) / (np.asarray(raios, float) ** 2)
        ns = _unit(q)
        sinal = np.sign(np.einsum('ij,ij->i', fn, ns.mean(axis=1)) + 1e-9)
        nrm = _unit(0.78 * ns + 0.22 * (fn * sinal[:, None])[:, None, :])
    else:
        nrm = np.repeat(fn[:, None, :], 4, axis=1)
    geo.G[mat].add(v.reshape(-1, 3), np.arange(n * 4).reshape(n, 4), uv=uv.reshape(-1, 2), nrm=nrm.reshape(-1, 3))


_cards = P.cards


def cards(mat, p, a, s, L, W):
    if mat in CACHO:
        return cartas_cacho(mat, p, a, s, L)
    # cartões pequenos sem textura (flores de trepadeira): losango simples
    n = len(p)
    L = np.broadcast_to(np.asarray(L, float), (n,))[:, None]
    W = np.broadcast_to(np.asarray(W, float), (n,))[:, None]
    v = np.empty((n, 4, 3))
    v[:, 0] = p
    v[:, 1] = p + a * L * 0.45 + s * W * 0.5
    v[:, 2] = p + a * L
    v[:, 3] = p + a * L * 0.45 - s * W * 0.5
    geo.G[mat].add(v.reshape(-1, 3), np.arange(n * 4).reshape(n, 4))


P.cards = cards
_crown = P.crown


def crown(mat, blobs, density, L, W, droop, rng, shell=(0.70, 1.0), flat=0.0, jit=0.25, bottom=None):
    if mat not in CACHO:
        return _crown(mat, blobs, density * 0.2, L * 2.0, W * 2.0, droop, rng, shell=shell, flat=flat, jit=jit, bottom=bottom)
    carta, cob = CARTA[mat]
    D = 2.6 / (carta ** 2 * cob)
    for c, r in blobs:
        c = np.asarray(c, float); r = np.broadcast_to(np.asarray(r, float), (3,))
        area = 4 * math.pi * ((r[0] * r[1] + r[0] * r[2] + r[1] * r[2]) / 3)
        n = max(4, int(area * D))
        d = P.rand_unit(rng, n)
        rad = rng.uniform(0.5, 0.86, n)[:, None]
        p = c + d * r * rad
        if bottom is not None:
            keep = p[:, 2] > bottom
            p = p[keep]; d = d[keep]; n = len(p)
        t = P.rand_unit(rng, n)
        a = d * 0.75 + t * 0.55
        a[:, 2] += 0.25 - droop * 0.35
        a[:, 2] *= (1 - 0.6 * flat)
        a = _unit(a)
        s = _unit(np.cross(a, d + rng.normal(scale=0.3, size=(n, 3))))
        cartas_cacho(mat, p, a, s, carta * rng.uniform(0.8, 1.2, n), centro=c, raios=r)


P.crown = crown


def paddle(mat, base, az, e0, L, W, droop, nseg=5, shape='paddle', fold=0.12, power=1.3):
    """Folha em tira (cópia de plants.paddle) com uv: u atravessa a folha (0, 0,5 na nervura, 1), v vai da base à ponta."""
    W = W * (1.6 if W < 0.03 else 1.0)
    nseg = min(nseg, 2 if W < 0.06 else (4 if W < 0.2 else 7))
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
    else:
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
    uv = np.concatenate([np.stack([np.full(m, u), t], axis=1) for u in (0.0, 0.5, 1.0)])
    geo.GS[mat].add(v, f, uv=uv)
    return pts


P.paddle = paddle
_blades = P.blades


def blades(mat, pos, n, L, W, rng, **k):
    return _blades(mat, pos, max(4, int(n * 0.3)), L, W, rng, **k)


P.blades = blades
_vw = P.vine_wall


def vine_wall(mat, x0, x1, z0, z1, y, facing, rng, density=230, cover=0.55, seed=0.0, leaf=0.085, axis='y'):
    if mat in CACHO:
        carta, cob = CARTA[mat]
        return _vw(mat, x0, x1, z0, z1, y, facing, rng, 1.7 / (carta ** 2 * cob * cover), cover, seed, carta, axis)
    return _vw(mat, x0, x1, z0, z1, y, facing, rng, density * 0.3, cover, seed, leaf * 1.75, axis)


P.vine_wall = vine_wall
_vt = P.vine_top


def vine_top(mat, x0, x1, y0, y1, z, rng, density=160, leaf=0.14, hang=0.5, flower=None):
    if mat not in CACHO:
        return _vt(mat, x0, x1, y0, y1, z, rng, density * 0.35, leaf * 1.6, hang, flower)
    carta, cob = CARTA[mat]
    n = int((x1 - x0) * (y1 - y0) * 2.0 / (carta ** 2 * cob))
    p = np.stack([rng.uniform(x0, x1, n), rng.uniform(y0, y1, n), z + rng.uniform(-0.05, 0.12, n)], axis=1)
    a = P.rand_unit(rng, n); a[:, 2] = a[:, 2] * 0.3 - 0.2; a = _unit(a)
    s = _unit(np.cross(a, UP[None, :] + rng.normal(scale=0.3, size=(n, 3))))
    cartas_cacho(mat, p, a, s, carta * rng.uniform(0.8, 1.2, n))
    m = int((x1 - x0) * (y1 - y0) * 1.2)       # ramos pendentes
    for _ in range(m):
        b = np.array([rng.uniform(x0, x1), rng.uniform(y0, y1), z])
        Lh = rng.uniform(0.15, hang)
        tube('stem_green', [b, b + np.array([0, 0, -Lh])], 0.004, seg=3)
        k = int(Lh * 4) + 1
        pp = b[None, :] + np.outer(np.linspace(0.2, 1, k), np.array([0, 0, -Lh])) + rng.normal(scale=0.02, size=(k, 3))
        aa = P.rand_unit(rng, k); aa[:, 2] = -abs(aa[:, 2]) - 0.8; aa = _unit(aa)
        ss = _unit(np.cross(aa, P.rand_unit(rng, k)))
        cartas_cacho(mat, pp, aa, ss, carta * 0.7)
        if flower and rng.uniform() < 0.8:
            for q in range(4):
                ellipsoid(flower, b + np.array([rng.normal(scale=0.02), rng.normal(scale=0.02), -Lh - 0.04 * q]), (0.022, 0.022, 0.035), seg=5, rings=4)


P.vine_top = vine_top


def coqueiro(pos, H, rng, lean_az=0.0, lean=0.9, fronds=15, FL=3.6, nuts=True, leaf='leaf_palm', tr=0.16):
    """Coqueiro (e areca) com cada fronde feita de duas fitas com a textura dos folíolos."""
    pos = np.asarray(pos, float)
    n = 14
    t = np.linspace(0, 1, n)
    hd = np.array([math.cos(lean_az), math.sin(lean_az), 0])
    pts = pos[None, :] + np.outer(t ** 1.8 * lean, hd) + np.outer(t * H, UP)
    rad = tr * (1.0 - 0.38 * t); rad[0] = tr * 1.5; rad[1] = tr * 1.15
    tube('bark_palm', pts, rad, seg=10)
    top = pts[-1]
    ellipsoid('leaf_palm_base', top + np.array([0, 0, 0.15]), (0.22, 0.22, 0.38), seg=8, rings=5)
    mat = leaf if FL >= 2 else 'leaf_areca'
    for k in range(fronds):
        az = k * 2.39996 + rng.uniform(-0.2, 0.2)
        u = (k + 0.5) / fronds
        e0 = 1.35 - 1.75 * u
        droop = 0.9 + 0.9 * u + rng.uniform(-0.1, 0.1)
        L = FL * (0.75 + 0.3 * math.sin(math.pi * min(1, u * 1.3)))
        ns = 12
        tt = np.linspace(0, 1, ns + 1)
        e = e0 - droop * tt ** 1.5
        fh = np.array([math.cos(az), math.sin(az), 0]); side = np.array([-math.sin(az), math.cos(az), 0])
        rp = [top + np.array([0, 0, 0.25]) + fh * 0.12]
        for i in range(ns):
            em = (e[i] + e[i + 1]) / 2
            rp.append(rp[-1] + (L / ns) * (math.cos(em) * fh + math.sin(em) * UP))
        rp = np.array(rp)
        tube('leaf_palm_rachis', rp, 0.035 * (1 - 0.8 * tt) + 0.006, seg=4, smooth=True)
        tang = _unit(np.gradient(rp, axis=0))
        W = 1.05 * (L / 3.6) + 0.12 if FL >= 2 else 0.95 * (L / 3.6) + 0.18
        m = ns + 1
        for sgn in (1, -1):
            d1 = _unit(sgn * side[None, :] + tang * 0.25 + UP[None, :] * 0.12)
            d2 = _unit(d1 + UP[None, :] * (-0.8 - 0.5 * u))
            mid = rp + d1 * (W * 0.5)
            out = mid + d2 * (W * 0.5)
            v = np.concatenate([rp, mid, out])
            f = []
            for i in range(ns):
                f.append([i, i + 1, m + i + 1, m + i])
                f.append([m + i, m + i + 1, 2 * m + i + 1, 2 * m + i])
            uv = np.concatenate([np.stack([tt, np.full(m, q)], axis=1) for q in (0.0, 0.5, 1.0)])
            geo.GS[mat].add(v, f, uv=uv)
    if nuts:
        for k in range(9):
            a = rng.uniform(0, 2 * math.pi)
            p = top + np.array([0.24 * math.cos(a), 0.24 * math.sin(a), -0.12 - rng.uniform(0, 0.25)])
            ellipsoid('coconut', p, (0.105, 0.105, 0.13), seg=8, rings=6)
    return top


P.coqueiro = coqueiro

# ---------------------------------------------------------------- roda o build.py até (sem incluir) a criação dos objetos do Blender
src = open(os.path.join(HERE, 'build.py'), encoding='utf-8').read()
cut = src.index("objs = geo.build_objects()")
ns = {'__file__': os.path.join(HERE, 'build.py'), '__name__': 'build_rt'}
exec(compile(src[:cut], 'build.py', 'exec'), ns)
INFO['leaf_areca'] = dict(INFO['leaf_palm'])

SKIP = {'terrain', 'street', 'hen_b', 'hen_w', 'crista', 'koi_o', 'koi_w', 'koi_k', 'ninfeia', 'flor_ninfeia'}
pos_chunks, idx_chunks, uv_chunks, nrm_chunks, groups = [], [], [], [], []
vo = io = uvo = no = 0
tris_total = 0
stats = []


def to3(v):
    v = np.asarray(v, float)
    out = np.stack([v[:, 0], v[:, 2], -v[:, 1]], axis=1) * 256.0
    return np.clip(np.round(out), -32767, 32767).astype(np.int16)


for smooth, store in ((0, geo.G), (1, geo.GS)):
    for mat, g in store.items():
        if mat in SKIP or g.n == 0:
            continue
        verts = np.concatenate(g.v)
        tem_uv = any(u is not None for u in g.uv)
        tem_n = any(q is not None for q in g.nrm)
        uv = np.concatenate([u if u is not None else np.zeros((len(vv), 2)) for u, vv in zip(g.uv, g.v)]) if tem_uv else None
        nr = np.concatenate([q if q is not None else np.zeros((len(vv), 3)) for q, vv in zip(g.nrm, g.v)]) if tem_n else None
        tris = []
        only_quads = True
        for k, lst in g.f.items():
            F = np.concatenate(lst)
            if k != 4:
                only_quads = False
            for j in range(1, k - 1):
                tris.append(np.stack([F[:, 0], F[:, j], F[:, j + 1]], axis=1))
        grp = {'m': mat, 's': smooth, 'vo': vo}
        if smooth:
            T = np.concatenate(tris).astype(np.uint32)
            sel = np.arange(len(verts))
            grp.update({'io': io, 'ic': int(T.size)})
            idx_chunks.append(T.ravel()); io += T.size
            nt = len(T)
        else:
            if only_quads:
                F = np.concatenate(g.f[4])
                T = np.stack([F[:, 0], F[:, 1], F[:, 2], F[:, 0], F[:, 2], F[:, 3]], axis=1).reshape(-1, 3)
                grp['q'] = 1
            else:
                T = np.concatenate(tris)
                grp['q'] = 0
            sel = T.ravel()
            nt = len(T)
        p = to3(verts[sel])
        grp['vc'] = int(len(p))
        pos_chunks.append(p); vo += len(p)
        if tem_uv:
            u = uv[sel]
            esc = np.maximum(u.max(axis=0), 1e-6)
            grp['uvo'] = uvo; grp['uvs'] = [round(float(esc[0]), 5), round(float(esc[1]), 5)]
            uv_chunks.append(np.round(np.clip(u / esc, 0, 1) * 65535).astype('<u2')); uvo += len(u)
        if tem_n:
            q = nr[sel]
            q3 = np.stack([q[:, 0], q[:, 2], -q[:, 1]], axis=1)
            q4 = np.zeros((len(q3), 4)); q4[:, :3] = q3
            grp['no'] = no
            nrm_chunks.append(np.round(np.clip(q4, -1, 1) * 127).astype(np.int8)); no += len(q3)
        groups.append(grp)
        tris_total += nt
        stats.append((nt, mat, smooth))

pos = np.concatenate(pos_chunks).astype('<i2')
idx = np.concatenate(idx_chunks).astype('<u4') if idx_chunks else np.zeros(0, '<u4')
uvb = np.concatenate(uv_chunks).astype('<u2') if uv_chunks else np.zeros((0, 2), '<u2')
nrb = np.concatenate(nrm_chunks).astype(np.int8) if nrm_chunks else np.zeros((0, 4), np.int8)
blocos = {}
with open(os.path.join(OUT, 'terreno.bin'), 'wb') as f:
    def escreve(nome, arr, n):
        b = arr.tobytes()
        blocos[nome] = [f.tell(), int(n)]
        f.write(b)
        f.write(b'\0' * ((-len(b)) % 4))
    escreve('pos', pos, len(pos))
    escreve('idx', idx, idx.size)
    escreve('uv', uvb, len(uvb))
    escreve('nrm', nrb, len(nrb))
    total = f.tell()


def clean(o):
    if isinstance(o, dict):
        return {k: clean(v) for k, v in o.items()}
    if isinstance(o, (list, tuple)):
        return [clean(v) for v in o]
    if isinstance(o, (np.floating, float)):
        return round(float(o), 4)
    if isinstance(o, (np.integer,)):
        return int(o)
    return o


json.dump({'versao': 2, 'escala': 1 / 256.0, 'blocos': blocos, 'groups': groups, 'mats': clean(INFO), 'extra': clean(ns['EXTRA'])},
          open(os.path.join(OUT, 'terreno.json'), 'w', encoding='utf-8'), separators=(',', ':'), ensure_ascii=False)
stats.sort(reverse=True)
print('triangulos', tris_total, 'MB', round(total / 1e6, 2), 'grupos', len(groups), 'uv', len(uvb), 'nrm', len(nrb))
for nt, mat, s in stats[:30]:
    print(f'{nt:8d} {mat}{" (s)" if s else ""}')
