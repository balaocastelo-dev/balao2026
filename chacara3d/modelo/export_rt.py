"""Exporta uma versão leve, em tempo real, do modelo da chácara (mesmo script de build, menos folhas) para o passeio virtual no navegador.

Saída: <out>/terreno.bin (posições Int16, escala 1/256 m, eixos do three.js X=x, Y=cima, Z=-y; depois índices Uint32)
       <out>/terreno.json (grupos + tabela de materiais)
"""
import os, sys, json, types, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import numpy as np
import bpy

OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'rt')
os.makedirs(OUT, exist_ok=True)


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


# ---------------------------------------------------------------- geo com telhados / tubos / esferas menos detalhados + registro de materiais
geo = load('geo', [("du = wave / 10", "du = wave / 3")])
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


def tube(mat, pts, radii, seg=8, smooth=True, cap=False):
    rm = float(np.max(radii)) if np.ndim(radii) else float(radii)
    if rm < 0.012:
        seg = 3
    elif rm < 0.05:
        seg = min(seg, 5)
    elif rm < 0.2:
        seg = min(seg, 8)
    return _tube(mat, pts, radii, seg, smooth, cap)


geo.tube = tube

# ---------------------------------------------------------------- plants com bem menos folhas, porém maiores
P = load('plants', [
    ("        nl = 46\n", "        nl = 16\n"),
    ("        ns = 16\n", "        ns = 8\n"),
    ("        for _ in range(110):", "        for _ in range(34):"),
    ("ellipsoid('fruit_black', p + d * (rad + 0.012), 0.024, seg=7, rings=5)", "ellipsoid('fruit_black', p + d * (rad + 0.012), 0.032, seg=5, rings=3)"),
    ("def coqueiro(pos, H, rng, lean_az=0.0, lean=0.9, fronds=20,", "def coqueiro(pos, H, rng, lean_az=0.0, lean=0.9, fronds=15,"),
])


def cards(mat, p, a, s, L, W):
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


def crown(mat, blobs, density, L, W, droop, rng, **k):
    if mat == 'leaf_bg':
        return _crown(mat, blobs, density * 0.05, L * 3.2, W * 3.2, droop, rng, **k)
    return _crown(mat, blobs, density * 0.2, L * 2.0, W * 2.0, droop, rng, **k)


P.crown = crown
_paddle = P.paddle


def paddle(mat, base, az, e0, L, W, droop, nseg=5, shape='paddle', fold=0.12, power=1.3):
    return _paddle(mat, base, az, e0, L, W * (1.6 if W < 0.03 else 1.0), droop, min(nseg, 2 if W < 0.06 else 3), shape, fold, power)


P.paddle = paddle
_blades = P.blades


def blades(mat, pos, n, L, W, rng, **k):
    return _blades(mat, pos, max(4, int(n * 0.3)), L, W, rng, **k)


P.blades = blades
_vw = P.vine_wall


def vine_wall(mat, x0, x1, z0, z1, y, facing, rng, density=230, cover=0.55, seed=0.0, leaf=0.085, axis='y'):
    return _vw(mat, x0, x1, z0, z1, y, facing, rng, density * 0.3, cover, seed, leaf * 1.75, axis)


P.vine_wall = vine_wall
_vt = P.vine_top


def vine_top(mat, x0, x1, y0, y1, z, rng, density=160, leaf=0.14, hang=0.5, flower=None):
    return _vt(mat, x0, x1, y0, y1, z, rng, density * 0.35, leaf * 1.6, hang, flower)


P.vine_top = vine_top

# ---------------------------------------------------------------- roda o script de build até (sem incluir) a criação dos objetos do Blender
src = open(os.path.join(HERE, 'build.py'), encoding='utf-8').read()
cut = src.index("objs = geo.build_objects()")
ns = {'__file__': os.path.join(HERE, 'build.py'), '__name__': 'build_rt'}
exec(compile(src[:cut], 'build.py', 'exec'), ns)

SKIP = {'terrain', 'street'}
pos_chunks, idx_chunks, groups = [], [], []
vo = io = 0
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
        tris = []
        only_quads = True
        for k, lst in g.f.items():
            F = np.concatenate(lst)
            if k != 4:
                only_quads = False
            for j in range(1, k - 1):
                tris.append(np.stack([F[:, 0], F[:, j], F[:, j + 1]], axis=1))
        if smooth:
            T = np.concatenate(tris).astype(np.uint32)
            p = to3(verts)
            groups.append({'m': mat, 's': 1, 'vo': vo, 'vc': len(p), 'io': io, 'ic': T.size})
            pos_chunks.append(p); idx_chunks.append(T.ravel())
            vo += len(p); io += T.size
            nt = len(T)
        else:
            if only_quads:
                F = np.concatenate(g.f[4])
                T = np.stack([F[:, 0], F[:, 1], F[:, 2], F[:, 0], F[:, 2], F[:, 3]], axis=1).reshape(-1, 3)
            else:
                T = np.concatenate(tris)
            p = to3(verts[T.ravel()])
            groups.append({'m': mat, 's': 0, 'q': 1 if only_quads else 0, 'vo': vo, 'vc': len(p)})
            pos_chunks.append(p)
            vo += len(p)
            nt = len(T)
        tris_total += nt
        stats.append((nt, mat, smooth))

pos = np.concatenate(pos_chunks).astype('<i2')
idx = np.concatenate(idx_chunks).astype('<u4') if idx_chunks else np.zeros(0, '<u4')
pb = pos.tobytes()
pad = (-len(pb)) % 4
with open(os.path.join(OUT, 'terreno.bin'), 'wb') as f:
    f.write(pb); f.write(b'\0' * pad); f.write(idx.tobytes())


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


json.dump({'scale': 1 / 256.0, 'nverts': int(len(pos)), 'idxByte': len(pb) + pad, 'nidx': int(idx.size), 'groups': groups, 'mats': clean(INFO)},
          open(os.path.join(OUT, 'terreno.json'), 'w'), separators=(',', ':'))
stats.sort(reverse=True)
print('triangles', tris_total, 'bin MB', round((len(pb) + pad + idx.nbytes) / 1e6, 2), 'groups', len(groups))
for nt, mat, s in stats[:28]:
    print(f'{nt:8d} {mat}{" (s)" if s else ""}')
