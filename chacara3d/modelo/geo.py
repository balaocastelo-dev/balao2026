"""Acúmulo de geometria + materiais procedurais para a maquete da chácara."""
import bpy, math
import numpy as np
from collections import defaultdict


class Geo:
    def __init__(self):
        self.v = []
        self.f = defaultdict(list)  # aridade -> lista de arrays
        self.n = 0

    def add(self, verts, faces):
        verts = np.asarray(verts, dtype=np.float64).reshape(-1, 3)
        faces = np.asarray(faces, dtype=np.int64)
        if faces.ndim == 1:
            faces = faces.reshape(1, -1)
        self.v.append(verts)
        self.f[faces.shape[1]].append(faces + self.n)
        self.n += len(verts)


G = defaultdict(Geo)    # sombreamento plano (flat), indexado pelo nome do material
GS = defaultdict(Geo)   # sombreamento suave (smooth)


def _g(mat, smooth):
    return (GS if smooth else G)[mat]


BOXF = np.array([[0, 1, 2, 3], [7, 6, 5, 4], [0, 4, 5, 1], [1, 5, 6, 2], [2, 6, 7, 3], [3, 7, 4, 0]])


def box(mat, x0, x1, y0, y1, z0, z1, smooth=False):
    v = [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0],
         [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]]
    _g(mat, smooth).add(v, BOXF)


def rotx(a):
    c, s = math.cos(a), math.sin(a)
    return np.array([[1, 0, 0], [0, c, -s], [0, s, c]])


def roty(a):
    c, s = math.cos(a), math.sin(a)
    return np.array([[c, 0, s], [0, 1, 0], [-s, 0, c]])


def rotz(a):
    c, s = math.cos(a), math.sin(a)
    return np.array([[c, -s, 0], [s, c, 0], [0, 0, 1]])


def obox(mat, center, size, R=None, smooth=False):
    sx, sy, sz = [s / 2 for s in size]
    v = np.array([[-sx, -sy, -sz], [sx, -sy, -sz], [sx, sy, -sz], [-sx, sy, -sz],
                  [-sx, -sy, sz], [sx, -sy, sz], [sx, sy, sz], [-sx, sy, sz]], dtype=float)
    if R is not None:
        v = v @ np.asarray(R).T
    _g(mat, smooth).add(v + np.asarray(center, dtype=float), BOXF)


def quad(mat, p0, p1, p2, p3, smooth=False):
    _g(mat, smooth).add([p0, p1, p2, p3], [[0, 1, 2, 3]])


def beam(mat, p0, p1, w, h, smooth=False):
    """Caixa de p0 a p1 (linha de centro), w na largura (horizontal), h mais ou menos para cima."""
    p0 = np.asarray(p0, float); p1 = np.asarray(p1, float)
    d = p1 - p0; L = np.linalg.norm(d); d = d / L
    up = np.array([0, 0, 1.0])
    if abs(d[2]) > 0.95:
        up = np.array([1.0, 0, 0])
    s = np.cross(d, up); s /= np.linalg.norm(s)
    u = np.cross(s, d)
    R = np.stack([d, s, u], axis=1)
    obox(mat, (p0 + p1) / 2, (L, w, h), R, smooth)


def tube(mat, pts, radii, seg=8, smooth=True, cap=False):
    pts = np.asarray(pts, float)
    n = len(pts)
    radii = np.broadcast_to(np.asarray(radii, float), (n,)) if np.ndim(radii) else np.full(n, float(radii))
    verts = []
    prev_s = None
    for i in range(n):
        if i == 0:
            d = pts[1] - pts[0]
        elif i == n - 1:
            d = pts[-1] - pts[-2]
        else:
            d = pts[i + 1] - pts[i - 1]
        d = d / (np.linalg.norm(d) + 1e-12)
        if prev_s is None:
            ref = np.array([0, 0, 1.0]) if abs(d[2]) < 0.9 else np.array([1.0, 0, 0])
            s = np.cross(d, ref)
        else:
            s = prev_s - d * np.dot(prev_s, d)
        s = s / (np.linalg.norm(s) + 1e-12)
        prev_s = s
        t = np.cross(d, s)
        ang = np.linspace(0, 2 * math.pi, seg, endpoint=False)
        ring = pts[i] + radii[i] * (np.outer(np.cos(ang), s) + np.outer(np.sin(ang), t))
        verts.append(ring)
    verts = np.concatenate(verts)
    faces = []
    for i in range(n - 1):
        for j in range(seg):
            a = i * seg + j; b = i * seg + (j + 1) % seg
            faces.append([a, b, b + seg, a + seg])
    _g(mat, smooth).add(verts, faces)
    if cap:
        for idx in (0, n - 1):
            c = pts[idx]
            ring = verts[idx * seg:(idx + 1) * seg]
            v = np.vstack([ring, c])
            f = [[j, (j + 1) % seg, seg] for j in range(seg)]
            _g(mat, False).add(v, f)


def ellipsoid(mat, c, r, seg=12, rings=8, R=None, smooth=True, zmin=-1.0):
    r = np.broadcast_to(np.asarray(r, float), (3,))
    th0 = math.acos(max(-1.0, min(1.0, zmin)))  # limite do ângulo polar a partir de +z
    th = np.linspace(0, th0, rings + 1)
    ph = np.linspace(0, 2 * math.pi, seg, endpoint=False)
    v = []
    for t in th:
        for p in ph:
            v.append([math.sin(t) * math.cos(p), math.sin(t) * math.sin(p), math.cos(t)])
    v = np.array(v) * r
    if R is not None:
        v = v @ np.asarray(R).T
    v = v + np.asarray(c, float)
    f = []
    for i in range(rings):
        for j in range(seg):
            a = i * seg + j; b = i * seg + (j + 1) % seg
            f.append([a, b, b + seg, a + seg])
    _g(mat, smooth).add(v, f)


def cyl(mat, c, r, h, seg=20, smooth=True, cap=True, r_top=None):
    c = np.asarray(c, float)
    rt = r if r_top is None else r_top
    tube(mat, [c, c + np.array([0, 0, h])], [r, rt], seg=seg, smooth=smooth, cap=cap)


def annulus(mat, c, r0, r1, z, seg=32):
    ang = np.linspace(0, 2 * math.pi, seg, endpoint=False)
    v = []
    for a in ang:
        v.append([c[0] + r0 * math.cos(a), c[1] + r0 * math.sin(a), z])
    for a in ang:
        v.append([c[0] + r1 * math.cos(a), c[1] + r1 * math.sin(a), z])
    f = [[j, (j + 1) % seg, seg + (j + 1) % seg, seg + j] for j in range(seg)]
    _g(mat, False).add(v, f)


def disc(mat, c, r, z, seg=32):
    ang = np.linspace(0, 2 * math.pi, seg, endpoint=False)
    v = [[c[0] + r * math.cos(a), c[1] + r * math.sin(a), z] for a in ang]
    _g(mat, False).add(v, [list(range(seg))])


def tile_roof(mat, p0, u, v, width, length, wave=0.21, amp=0.045, row=0.40):
    """p0 = canto na borda mais alta; u = vetor unitário ao longo do beiral; v = vetor unitário no sentido do caimento."""
    p0 = np.asarray(p0, float); u = np.asarray(u, float); v = np.asarray(v, float)
    n = np.cross(v, u); n /= np.linalg.norm(n)
    if n[2] < 0:
        n = -n
    du = wave / 10
    nu = int(round(width / du)) + 1
    us = np.linspace(0, width, nu)
    hw = amp * (0.5 + 0.5 * np.cos(2 * math.pi * us / wave)) ** 0.7
    rows = max(1, int(round(length / row)))
    vs, hs = [], []
    for r in range(rows):
        v0 = r * length / rows; v1 = (r + 1) * length / rows
        vs += [v0, v1 - 1e-3]; hs += [0.0, 0.035]
    vs = np.array(vs); hs = np.array(hs)
    P = (p0[None, None, :] + us[:, None, None] * u[None, None, :] + vs[None, :, None] * v[None, None, :]
         + (hw[:, None, None] + hs[None, :, None]) * n[None, None, :])
    nv = len(vs)
    P = P.reshape(-1, 3)
    ii, jj = np.meshgrid(np.arange(nu - 1), np.arange(nv - 1), indexing='ij')
    a = (ii * nv + jj).ravel()
    f = np.stack([a, a + nv, a + nv + 1, a + 1], axis=1)
    _g(mat, False).add(P, f)


# ---------------------------------------------------------------- materiais
MATS = {}


def _new(name):
    m = bpy.data.materials.new(name)
    try:
        m.use_nodes = True
    except Exception:
        pass
    nt = m.node_tree
    nt.nodes.clear()
    out = nt.nodes.new('ShaderNodeOutputMaterial')
    MATS[name] = m
    return m, nt, out


def _n(nt, typ, **kw):
    n = nt.nodes.new(typ)
    for k, v in kw.items():
        setattr(n, k, v)
    return n


def _set(node, name, val):
    node.inputs[name].default_value = val


def _rgb(c):
    return (c[0], c[1], c[2], 1.0)


def _mixc(nt, fac, a, b):
    """Mistura duas cores. fac/a/b podem ser sockets ou constantes."""
    m = _n(nt, 'ShaderNodeMix', data_type='RGBA')
    for idx, val in ((0, fac), (6, a), (7, b)):
        if hasattr(val, 'node'):
            nt.links.new(val, m.inputs[idx])
        elif idx == 0:
            m.inputs[0].default_value = val
        else:
            m.inputs[idx].default_value = _rgb(val)
    return m.outputs[2]


def _ramp(nt, fac, stops, interp='LINEAR'):
    r = _n(nt, 'ShaderNodeValToRGB')
    r.color_ramp.interpolation = interp
    els = r.color_ramp.elements
    while len(els) < len(stops):
        els.new(0.5)
    for e, (p, c) in zip(els, stops):
        e.position = p; e.color = _rgb(c)
    if fac is not None:
        nt.links.new(fac, r.inputs[0])
    return r.outputs[0]


def _noise(nt, scale, detail=3.0, vec=None, rough=0.55):
    t = _n(nt, 'ShaderNodeTexNoise')
    _set(t, 'Scale', scale); _set(t, 'Detail', detail); _set(t, 'Roughness', rough)
    if vec is not None:
        nt.links.new(vec, t.inputs['Vector'])
    return t.outputs[0]


def _pos(nt):
    return _n(nt, 'ShaderNodeNewGeometry')


def _bump(nt, height, strength=0.3, dist=0.02):
    b = _n(nt, 'ShaderNodeBump')
    _set(b, 'Strength', strength); _set(b, 'Distance', dist)
    nt.links.new(height, b.inputs['Height'])
    return b.outputs[0]


def _principled(nt, out, color, rough=0.6, normal=None, **kw):
    p = _n(nt, 'ShaderNodeBsdfPrincipled')
    if hasattr(color, 'node'):
        nt.links.new(color, p.inputs['Base Color'])
    else:
        _set(p, 'Base Color', _rgb(color))
    if hasattr(rough, 'node'):
        nt.links.new(rough, p.inputs['Roughness'])
    else:
        _set(p, 'Roughness', rough)
    if normal is not None:
        nt.links.new(normal, p.inputs['Normal'])
    for k, v in kw.items():
        _set(p, k, v)
    nt.links.new(p.outputs[0], out.inputs[0])
    return p


def m_plain(name, color, rough=0.6, noise=0.0, nscale=6.0, bump=0.0, **kw):
    m, nt, out = _new(name)
    col = color; nrm = None
    if noise or bump:
        g = _pos(nt)
        nz = _noise(nt, nscale, 4.0, g.outputs['Position'])
        if noise:
            dark = tuple(c * (1 - noise) for c in color)
            light = tuple(min(1, c * (1 + noise * 0.6)) for c in color)
            col = _ramp(nt, nz, [(0.3, dark), (0.7, light)])
        if bump:
            nrm = _bump(nt, nz, bump)
    _principled(nt, out, col, rough, nrm, **kw)
    return m


def m_emit(name, color, strength=1.0):
    m, nt, out = _new(name)
    e = _n(nt, 'ShaderNodeEmission')
    _set(e, 'Color', _rgb(color)); _set(e, 'Strength', strength)
    nt.links.new(e.outputs[0], out.inputs[0])
    return m


def m_leaf(name, c_dark, c_light, rough=0.45, trans=0.25):
    m, nt, out = _new(name)
    g = _pos(nt)
    col = _ramp(nt, g.outputs['Random Per Island'], [(0.0, c_dark), (1.0, c_light)])
    d = _n(nt, 'ShaderNodeBsdfPrincipled')
    nt.links.new(col, d.inputs['Base Color']); _set(d, 'Roughness', rough)
    t = _n(nt, 'ShaderNodeBsdfTranslucent')
    nt.links.new(col, t.inputs['Color'])
    mx = _n(nt, 'ShaderNodeMixShader'); mx.inputs[0].default_value = trans
    nt.links.new(d.outputs[0], mx.inputs[1]); nt.links.new(t.outputs[0], mx.inputs[2])
    nt.links.new(mx.outputs[0], out.inputs[0])
    return m


def m_tile(name='tile', stops=None, scale=10.0, grout=(0.55, 0.66, 0.70), gw=0.07, rough=0.18):
    m, nt, out = _new(name)
    stops = stops or [(0.0, (0.03, 0.16, 0.36)), (0.3, (0.07, 0.30, 0.52)), (0.6, (0.16, 0.46, 0.66)),
                      (0.85, (0.36, 0.62, 0.72)), (1.0, (0.55, 0.72, 0.74))]
    g = _pos(nt)
    off = _n(nt, 'ShaderNodeVectorMath', operation='ADD')
    nt.links.new(g.outputs['Position'], off.inputs[0]); off.inputs[1].default_value = (0.033, 0.033, 0.033)
    sc = _n(nt, 'ShaderNodeVectorMath', operation='SCALE')
    nt.links.new(off.outputs[0], sc.inputs[0]); sc.inputs['Scale'].default_value = scale
    fl = _n(nt, 'ShaderNodeVectorMath', operation='FLOOR'); nt.links.new(sc.outputs[0], fl.inputs[0])
    wn = _n(nt, 'ShaderNodeTexWhiteNoise', noise_dimensions='3D'); nt.links.new(fl.outputs[0], wn.inputs['Vector'])
    col = _ramp(nt, wn.outputs['Value'], stops, 'CONSTANT')
    fr = _n(nt, 'ShaderNodeVectorMath', operation='FRACTION'); nt.links.new(sc.outputs[0], fr.inputs[0])
    sf = _n(nt, 'ShaderNodeSeparateXYZ'); nt.links.new(fr.outputs[0], sf.inputs[0])
    ab = _n(nt, 'ShaderNodeVectorMath', operation='ABSOLUTE'); nt.links.new(g.outputs['Normal'], ab.inputs[0])
    sn = _n(nt, 'ShaderNodeSeparateXYZ'); nt.links.new(ab.outputs[0], sn.inputs[0])
    acc = None
    for i in range(3):
        lt = _n(nt, 'ShaderNodeMath', operation='LESS_THAN'); nt.links.new(sf.outputs[i], lt.inputs[0]); lt.inputs[1].default_value = gw
        inpl = _n(nt, 'ShaderNodeMath', operation='LESS_THAN'); nt.links.new(sn.outputs[i], inpl.inputs[0]); inpl.inputs[1].default_value = 0.5
        mu = _n(nt, 'ShaderNodeMath', operation='MULTIPLY'); nt.links.new(lt.outputs[0], mu.inputs[0]); nt.links.new(inpl.outputs[0], mu.inputs[1])
        if acc is None:
            acc = mu.outputs[0]
        else:
            mx = _n(nt, 'ShaderNodeMath', operation='MAXIMUM'); nt.links.new(acc, mx.inputs[0]); nt.links.new(mu.outputs[0], mx.inputs[1])
            acc = mx.outputs[0]
    final = _mixc(nt, acc, col, grout)
    _principled(nt, out, final, rough)
    return m


def m_water(name, tint=(0.72, 0.93, 0.96), rough=0.02, ripple=0.06, scale=2.5):
    m, nt, out = _new(name)
    g = _pos(nt)
    nz = _noise(nt, scale, 2.0, g.outputs['Position'])
    gl = _n(nt, 'ShaderNodeBsdfGlass')
    _set(gl, 'Color', _rgb(tint)); _set(gl, 'Roughness', rough); _set(gl, 'IOR', 1.33)
    nt.links.new(_bump(nt, nz, ripple, 0.05), gl.inputs['Normal'])
    tr = _n(nt, 'ShaderNodeBsdfTransparent'); _set(tr, 'Color', _rgb(tint))
    lp = _n(nt, 'ShaderNodeLightPath')
    mx = _n(nt, 'ShaderNodeMixShader')
    nt.links.new(lp.outputs['Is Shadow Ray'], mx.inputs[0])
    nt.links.new(gl.outputs[0], mx.inputs[1]); nt.links.new(tr.outputs[0], mx.inputs[2])
    nt.links.new(mx.outputs[0], out.inputs[0])
    return m


def m_caco(name='caco', scale=3.2):
    """Piso de caco de pedra mineira."""
    m, nt, out = _new(name)
    g = _pos(nt)
    nz = _n(nt, 'ShaderNodeTexNoise'); _set(nz, 'Scale', 1.3); _set(nz, 'Detail', 1.0)
    nt.links.new(g.outputs['Position'], nz.inputs['Vector'])
    dist = _mixc(nt, 0.12, g.outputs['Position'], nz.outputs[1])
    v1 = _n(nt, 'ShaderNodeTexVoronoi', feature='F1'); _set(v1, 'Scale', scale); nt.links.new(dist, v1.inputs['Vector'])
    sep = _n(nt, 'ShaderNodeSeparateColor'); nt.links.new(v1.outputs['Color'], sep.inputs[0])
    col = _ramp(nt, sep.outputs[0], [(0.0, (0.60, 0.50, 0.33)), (0.35, (0.72, 0.62, 0.42)), (0.7, (0.80, 0.72, 0.52)), (1.0, (0.66, 0.60, 0.48))])
    fine = _noise(nt, 40.0, 3.0, g.outputs['Position'])
    col = _mixc(nt, 0.18, col, _ramp(nt, fine, [(0.3, (0.5, 0.42, 0.3)), (0.7, (0.9, 0.84, 0.66))]))
    v2 = _n(nt, 'ShaderNodeTexVoronoi', feature='DISTANCE_TO_EDGE'); _set(v2, 'Scale', scale); nt.links.new(dist, v2.inputs['Vector'])
    lt = _n(nt, 'ShaderNodeMath', operation='LESS_THAN'); nt.links.new(v2.outputs['Distance'], lt.inputs[0]); lt.inputs[1].default_value = 0.035
    final = _mixc(nt, lt.outputs[0], col, (0.50, 0.47, 0.42))
    _principled(nt, out, final, 0.7, _bump(nt, v2.outputs['Distance'], 0.25, 0.01))
    return m


def _wallvec(nt, g, mode):
    s = _n(nt, 'ShaderNodeSeparateXYZ'); nt.links.new(g.outputs['Position'], s.inputs[0])
    c = _n(nt, 'ShaderNodeCombineXYZ')
    if mode == 'wall':
        a = _n(nt, 'ShaderNodeMath', operation='ADD'); nt.links.new(s.outputs[0], a.inputs[0]); nt.links.new(s.outputs[1], a.inputs[1])
        nt.links.new(a.outputs[0], c.inputs[0]); nt.links.new(s.outputs[2], c.inputs[1])
    else:  # floor (piso)
        nt.links.new(s.outputs[0], c.inputs[0]); nt.links.new(s.outputs[1], c.inputs[1])
    return c.outputs[0]


def m_brick(name, c1, c2, mortar, bw=0.23, rh=0.07, ms=0.012, mode='wall', rough=0.8, bump=0.6):
    m, nt, out = _new(name)
    g = _pos(nt)
    b = _n(nt, 'ShaderNodeTexBrick')
    nt.links.new(_wallvec(nt, g, mode), b.inputs['Vector'])
    _set(b, 'Color1', _rgb(c1)); _set(b, 'Color2', _rgb(c2)); _set(b, 'Mortar', _rgb(mortar))
    _set(b, 'Scale', 1.0); _set(b, 'Mortar Size', ms); _set(b, 'Brick Width', bw); _set(b, 'Row Height', rh)
    _set(b, 'Mortar Smooth', 0.1); _set(b, 'Bias', 0.0)
    nz = _noise(nt, 14.0, 3.0, g.outputs['Position'])
    col = _mixc(nt, 0.25, b.outputs['Color'], _ramp(nt, nz, [(0.3, tuple(c * 0.6 for c in c1)), (0.7, tuple(min(1, c * 1.3) for c in c2))]))
    inv = _n(nt, 'ShaderNodeMath', operation='SUBTRACT'); inv.inputs[0].default_value = 1.0; nt.links.new(b.outputs['Fac'], inv.inputs[1])
    _principled(nt, out, col, rough, _bump(nt, inv.outputs[0], bump, 0.01))
    return m


def m_wood(name, axis, c1=(0.23, 0.11, 0.05), c2=(0.42, 0.22, 0.10), rough=0.5):
    m, nt, out = _new(name)
    g = _pos(nt)
    mp = _n(nt, 'ShaderNodeMapping')
    sc = [22.0, 22.0, 22.0]; sc[axis] = 1.2
    mp.inputs['Scale'].default_value = sc
    nt.links.new(g.outputs['Position'], mp.inputs['Vector'])
    nz = _noise(nt, 1.0, 4.0, mp.outputs[0], 0.6)
    col = _ramp(nt, nz, [(0.3, c1), (0.7, c2)])
    _principled(nt, out, col, rough, _bump(nt, nz, 0.15, 0.005))
    return m


def m_grass(name='grass'):
    m, nt, out = _new(name)
    g = _pos(nt)
    big = _noise(nt, 0.35, 3.0, g.outputs['Position'])
    fine = _noise(nt, 60.0, 2.0, g.outputs['Position'])
    c = _ramp(nt, big, [(0.3, (0.10, 0.27, 0.035)), (0.7, (0.19, 0.40, 0.06))])
    c = _mixc(nt, 0.35, c, _ramp(nt, fine, [(0.3, (0.05, 0.16, 0.02)), (0.7, (0.30, 0.50, 0.10))]))
    _principled(nt, out, c, 0.85, _bump(nt, fine, 0.5, 0.03))
    return m


def m_gravel(name, c1, c2, scale=90.0):
    m, nt, out = _new(name)
    g = _pos(nt)
    v = _n(nt, 'ShaderNodeTexVoronoi', feature='F1'); _set(v, 'Scale', scale); nt.links.new(g.outputs['Position'], v.inputs['Vector'])
    sep = _n(nt, 'ShaderNodeSeparateColor'); nt.links.new(v.outputs['Color'], sep.inputs[0])
    c = _ramp(nt, sep.outputs[0], [(0.0, c1), (1.0, c2)])
    _principled(nt, out, c, 0.85, _bump(nt, v.outputs['Distance'], 0.6, 0.01))
    return m


def build_objects(coll=None):
    objs = []
    for smooth, store in ((False, G), (True, GS)):
        for mat, geo in store.items():
            if geo.n == 0:
                continue
            verts = np.concatenate(geo.v)
            loops, starts = [], []
            pos = 0
            for k, lst in geo.f.items():
                fa = np.concatenate(lst)
                loops.append(fa.ravel())
                starts.append(pos + np.arange(len(fa)) * k)
                pos += fa.size
            loops = np.concatenate(loops); starts = np.concatenate(starts)
            me = bpy.data.meshes.new(mat + ('_s' if smooth else ''))
            me.vertices.add(len(verts)); me.loops.add(len(loops)); me.polygons.add(len(starts))
            me.vertices.foreach_set('co', verts.ravel())
            me.loops.foreach_set('vertex_index', loops.astype(np.int32))
            me.polygons.foreach_set('loop_start', starts.astype(np.int32))
            me.update(calc_edges=True)
            me.validate()
            if smooth:
                me.polygons.foreach_set('use_smooth', np.ones(len(me.polygons), dtype=bool))
            me.materials.append(MATS[mat])
            ob = bpy.data.objects.new(me.name, me)
            (coll or bpy.context.scene.collection).objects.link(ob)
            objs.append(ob)
    return objs
