"""Ferramentas de modelagem dos adereços (Blender como módulo de Python).

Convenção dentro do Blender: Z para cima, frente do objeto para -Y (o exportador
de glTF converte: Z do Blender vira Y, -Y do Blender vira +Z). Tudo em metros.
Cada peça é criada já no lugar (as transformações vão para os vértices), com o
objeto na origem, para depois juntar as peças de um adereço num objeto só.
"""
import math

import bmesh
import bpy
import numpy as np
from mathutils import Matrix, Vector, Euler

import materiais as MAT

TAU = 2 * math.pi


# ----------------------------------------------------------------- cena

def limpar_cena():
    for col in (bpy.data.objects, bpy.data.meshes, bpy.data.materials, bpy.data.images,
                bpy.data.curves, bpy.data.cameras, bpy.data.lights, bpy.data.textures):
        for item in list(col):
            col.remove(item)
    for c in list(bpy.data.collections):
        bpy.data.collections.remove(c)


def _ligar(ob):
    bpy.context.scene.collection.objects.link(ob)
    return ob


# ----------------------------------------------------------------- malhas básicas

def malha(nome, verts, faces, mat=None, uv=None, cores=None, suave=None):
    """Objeto de malha a partir de vértices (N,3) e faces (listas de índices).

    uv: (N,2) por vértice (vira UV por canto). cores: (N,3|4) cor por vértice (linear).
    suave: None = facetado; número = ângulo (graus) acima do qual a aresta fica viva;
    True = tudo liso.
    """
    verts = np.asarray(verts, dtype=float).reshape(-1, 3)
    me = bpy.data.meshes.new(nome)
    me.from_pydata(verts.tolist(), [], [list(map(int, f)) for f in faces])
    me.validate(clean_customdata=False)
    me.update()
    ob = bpy.data.objects.new(nome, me)
    _ligar(ob)
    if uv is not None:
        uv = np.asarray(uv, dtype=float)
        camada = me.uv_layers.new(name='UVMap')
        idx = np.zeros(len(me.loops), dtype=np.int32)
        me.loops.foreach_get('vertex_index', idx)
        camada.data.foreach_set('uv', uv[idx].astype(np.float32).ravel())
    if cores is not None:
        definir_cores(ob, cores)
    if mat is not None:
        me.materials.append(MAT.material(mat))
    if suave is not None:
        suavizar(ob, suave)
    return ob


def definir_cores(ob, cores):
    """Cor por vértice (linear), atributo 'Color' por canto (vira COLOR_0)."""
    me = ob.data
    cores = np.asarray(cores, dtype=float)
    if cores.ndim == 1:
        cores = np.tile(cores, (len(me.vertices), 1))
    if cores.shape[1] == 3:
        cores = np.concatenate([cores, np.ones((len(cores), 1))], axis=1)
    at = me.color_attributes.get('Color') or me.color_attributes.new('Color', 'FLOAT_COLOR', 'CORNER')
    idx = np.zeros(len(me.loops), dtype=np.int32)
    me.loops.foreach_get('vertex_index', idx)
    at.data.foreach_set('color', cores[idx].astype(np.float32).ravel())
    me.color_attributes.active_color = at
    return at


def suavizar(ob, angulo=True):
    me = ob.data
    if angulo is True:
        me.shade_smooth()
    elif angulo is False:
        me.shade_flat()
    else:
        me.shade_smooth()
        me.set_sharp_from_angle(angle=math.radians(angulo))
    return ob


def grade(nome, P, fechar_u=False, fechar_v=False, tampa_ini=False, tampa_fim=False,
          mat=None, uv=None, cores=None, suave=True, inverter=False):
    """Malha de quadriláteros a partir de uma grade P (nv, nu, 3).

    Linhas (v) e colunas (u). fechar_u liga a última coluna à primeira (anel).
    Linhas com todos os pontos iguais viram polo (triângulos).
    tampa_ini/tampa_fim fecham a primeira/última linha com um n-gono.
    uv: 'grade' (u,v de 0 a 1) ou array (nv, nu, 2).
    """
    P = np.asarray(P, dtype=float)
    nv, nu = P.shape[:2]
    verts = []
    idx = np.zeros((nv, nu), dtype=np.int64)
    uvs = []
    U = None
    if isinstance(uv, str):
        uu = np.linspace(0, 1, nu + (1 if fechar_u else 0))[:nu]
        vv = np.linspace(0, 1, nv)
        U = np.stack(np.meshgrid(uu, vv), axis=-1)
    elif uv is not None:
        U = np.asarray(uv, dtype=float)
    # costura do UV: se fechar_u e houver UV, duplica a primeira coluna
    costura = fechar_u and U is not None
    ncols = nu + (1 if costura else 0)
    idx = np.zeros((nv, ncols), dtype=np.int64)
    C = None
    if cores is not None:
        C = np.asarray(cores, dtype=float)
        cores_v = []
    for i in range(nv):
        for j in range(ncols):
            jj = j % nu
            idx[i, j] = len(verts)
            verts.append(P[i, jj])
            if U is not None:
                if costura and j == nu:
                    uvs.append((1.0 if isinstance(uv, str) else U[i, 0, 0] + 1.0, U[i, 0, 1]))
                else:
                    uvs.append(U[i, jj])
            if C is not None:
                cores_v.append(C[i, jj])
    faces = []
    nlig = nu if (fechar_u and not costura) else (nu if costura else nu - 1)
    for i in range(nv - 1):
        for j in range(nlig):
            a = idx[i, j]
            b = idx[i, (j + 1) % ncols]
            c = idx[i + 1, (j + 1) % ncols]
            d = idx[i + 1, j]
            f = [a, b, c, d]
            faces.append(f[::-1] if inverter else f)
    if fechar_v:
        for j in range(nlig):
            a = idx[nv - 1, j]
            b = idx[nv - 1, (j + 1) % ncols]
            c = idx[0, (j + 1) % ncols]
            d = idx[0, j]
            f = [a, b, c, d]
            faces.append(f[::-1] if inverter else f)
    if tampa_ini:
        f = [idx[0, j] for j in range(nu)][::-1]
        faces.append(f[::-1] if inverter else f)
    if tampa_fim:
        f = [idx[nv - 1, j] for j in range(nu)]
        faces.append(f[::-1] if inverter else f)
    ob = malha(nome, verts, faces, mat=mat, uv=np.array(uvs) if U is not None else None,
               cores=np.array(cores_v) if C is not None else None, suave=None)
    soldar(ob, 1e-6)
    if suave is not None:
        suavizar(ob, suave)
    return ob


def soldar(ob, dist=1e-5):
    bm = bmesh.new()
    bm.from_mesh(ob.data)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=dist)
    bmesh.ops.dissolve_degenerate(bm, edges=bm.edges, dist=dist * 0.1)
    bm.to_mesh(ob.data)
    bm.free()
    ob.data.update()
    return ob


def torno(nome, perfil, n=24, mat=None, a0=0.0, a1=TAU, suave=True, uv=None, tampa_ini=False,
          tampa_fim=False, cores=None, elipse=(1.0, 1.0)):
    """Sólido de revolução em torno de Z. perfil: [(r, z), ...] de baixo para cima.

    r = 0 numa ponta vira polo. elipse = (sx, sy) achata a revolução.
    cores: lista de cores por ponto do perfil.
    """
    perfil = np.asarray(perfil, dtype=float)
    fechado = abs(a1 - a0 - TAU) < 1e-6
    k = n if fechado else n + 1
    angs = a0 + (a1 - a0) * np.arange(k) / n
    P = np.zeros((len(perfil), k, 3))
    for i, (r, z) in enumerate(perfil):
        P[i, :, 0] = r * np.cos(angs) * elipse[0]
        P[i, :, 1] = r * np.sin(angs) * elipse[1]
        P[i, :, 2] = z
    C = None
    if cores is not None:
        C = np.repeat(np.asarray(cores, dtype=float)[:, None, :], k, axis=1)
    if uv == 'metros':
        # u = ângulo (0..1), v = comprimento de arco do perfil
        s = np.concatenate([[0], np.cumsum(np.hypot(np.diff(perfil[:, 0]), np.diff(perfil[:, 1])))])
        uu = (angs - a0) / (a1 - a0) if not fechado else np.arange(k) / n
        UV = np.zeros((len(perfil), k, 2))
        UV[:, :, 0] = uu[None, :]
        UV[:, :, 1] = s[:, None]
        uv = UV
    ob = grade(nome, P, fechar_u=fechado, mat=mat, uv=uv, cores=C, suave=None,
               tampa_ini=tampa_ini, tampa_fim=tampa_fim)
    if suave is not None:
        suavizar(ob, suave)
    return ob


def quadros_transporte(pts, normal0=None):
    """Referenciais por transporte paralelo ao longo da poligonal."""
    pts = np.asarray(pts, dtype=float)
    n = len(pts)
    T = np.zeros_like(pts)
    T[1:-1] = pts[2:] - pts[:-2]
    T[0] = pts[1] - pts[0]
    T[-1] = pts[-1] - pts[-2]
    T /= np.linalg.norm(T, axis=1, keepdims=True) + 1e-12
    N = np.zeros_like(pts)
    if normal0 is None:
        a = np.array([0, 0, 1.0]) if abs(T[0][2]) < 0.9 else np.array([1.0, 0, 0])
    else:
        a = np.asarray(normal0, dtype=float)
    N[0] = a - T[0] * np.dot(a, T[0])
    N[0] /= np.linalg.norm(N[0])
    for i in range(1, n):
        v = N[i - 1] - T[i] * np.dot(N[i - 1], T[i])
        nv = np.linalg.norm(v)
        N[i] = v / nv if nv > 1e-9 else N[i - 1]
    B = np.cross(T, N)
    return T, N, B


def tubo(nome, pts, raio, n=8, mat=None, tampas=True, fechado=False, suave=True, normal0=None,
         perfil=None, uv=None, torcao=0.0):
    """Tubo ao longo de uma poligonal. raio: número ou lista por ponto.

    perfil: (m, 2) contorno da seção em coordenadas (N, B) — substitui o círculo.
    """
    pts = np.asarray(pts, dtype=float)
    if fechado:
        ext = np.concatenate([pts[-1:], pts, pts[:1]])
        T, N, B = quadros_transporte(ext, normal0)
        T, N, B = T[1:-1], N[1:-1], B[1:-1]
    else:
        T, N, B = quadros_transporte(pts, normal0)
    r = np.broadcast_to(np.asarray(raio, dtype=float), (len(pts),))
    if perfil is None:
        a = np.arange(n) / n * TAU
        perfil = np.stack([np.cos(a), np.sin(a)], axis=1)
    perfil = np.asarray(perfil, dtype=float)
    P = np.zeros((len(pts), len(perfil), 3))
    for i in range(len(pts)):
        tw = torcao * i / max(len(pts) - 1, 1)
        c, s = math.cos(tw), math.sin(tw)
        for j, (pn, pb) in enumerate(perfil):
            qn, qb = c * pn - s * pb, s * pn + c * pb
            P[i, j] = pts[i] + r[i] * (qn * N[i] + qb * B[i])
    if uv == 'metros':
        s = np.concatenate([[0], np.cumsum(np.linalg.norm(np.diff(pts, axis=0), axis=1))])
        UV = np.zeros((len(pts), len(perfil), 2))
        UV[:, :, 0] = (np.arange(len(perfil)) / len(perfil))[None, :]
        UV[:, :, 1] = s[:, None]
        uv = UV
    ob = grade(nome, P, fechar_u=True, fechar_v=fechado, mat=mat, uv=uv,
               tampa_ini=tampas and not fechado, tampa_fim=tampas and not fechado, suave=None)
    if suave is not None:
        suavizar(ob, suave)
    return ob


def fita(nome, pts, largura, espessura=0.0, normal0=None, mat=None, suave=True, cima=None):
    """Tira plana ao longo da poligonal (largura no eixo B do referencial; cima = vetor fixo opcional)."""
    pts = np.asarray(pts, dtype=float)
    T, N, B = quadros_transporte(pts, normal0)
    if cima is not None:
        c = np.asarray(cima, dtype=float)
        B = np.cross(T, c)
        B /= np.linalg.norm(B, axis=1, keepdims=True) + 1e-12
        N = np.cross(B, T)
    w = np.broadcast_to(np.asarray(largura, dtype=float), (len(pts),))
    if espessura > 0:
        e = espessura / 2
        perfil = [(-e, -1), (-e, 1), (e, 1), (e, -1)]
        P = np.zeros((len(pts), 4, 3))
        for i in range(len(pts)):
            for j, (pn, pb) in enumerate(perfil):
                P[i, j] = pts[i] + pn * N[i] + pb * w[i] / 2 * B[i]
        ob = grade(nome, P, fechar_u=True, tampa_ini=True, tampa_fim=True, mat=mat, suave=None)
        suavizar(ob, 40 if suave else False)
        return ob
    P = np.stack([pts - B * w[:, None] / 2, pts + B * w[:, None] / 2], axis=1)
    ob = grade(nome, P, mat=mat, suave=None)
    if suave is not None:
        suavizar(ob, suave)
    return ob


def caixa(nome, sx, sy, sz, mat=None, chanfro=0.0, seg=2, centro=(0, 0, 0), base=True, suave=35):
    """Caixa com chanfro. base=True: centro está na face de baixo."""
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co = Vector((v.co.x * sx, v.co.y * sy, v.co.z * sz + (sz / 2 if base else 0)))
    me = bpy.data.meshes.new(nome)
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(nome, me)
    _ligar(ob)
    if mat:
        me.materials.append(MAT.material(mat))
    if chanfro > 0:
        chanfrar(ob, min(chanfro, sx * 0.45, sy * 0.45, sz * 0.45), seg)
    else:
        suavizar(ob, False)
    mover(ob, centro)
    return ob


def chanfrar(ob, largura, seg=2, angulo=40, endurecer=True):
    """Chanfro arredondado nas arestas vivas, com normais endurecidas (faces planas limpas)."""
    m = ob.modifiers.new('chanfro', 'BEVEL')
    m.width = largura
    m.segments = seg
    m.limit_method = 'ANGLE'
    m.angle_limit = math.radians(angulo)
    m.profile = 0.5
    m.use_clamp_overlap = True
    m.harden_normals = endurecer
    ob.data.shade_smooth()
    aplicar(ob)
    if not endurecer:
        ob.data.set_sharp_from_angle(angle=math.radians(angulo))
    return ob


def aplicar(ob):
    dg = bpy.context.evaluated_depsgraph_get()
    ev = ob.evaluated_get(dg)
    novo = bpy.data.meshes.new_from_object(ev, preserve_all_data_layers=True, depsgraph=dg)
    velho = ob.data
    ob.modifiers.clear()
    ob.data = novo
    novo.name = velho.name
    bpy.data.meshes.remove(velho)
    return ob


def subdividir(ob, niveis=1):
    m = ob.modifiers.new('sub', 'SUBSURF')
    m.levels = niveis
    m.render_levels = niveis
    aplicar(ob)
    return ob


def cilindro(nome, r, h, n=16, mat=None, chanfro=0.0, seg=2, centro=(0, 0, 0), r2=None, tampas=True):
    """Cilindro (ou tronco de cone com r2) em pé, base em z=0, com chanfro opcional nas bordas."""
    r2 = r if r2 is None else r2
    if chanfro > 0:
        c = min(chanfro, h * 0.45, r * 0.45)
        k = [math.sin(t) for t in np.linspace(0, math.pi / 2, seg + 1)]
        perfil = [(0, 0)]
        for t in np.linspace(0, math.pi / 2, seg + 1):
            perfil.append((r - c + c * math.sin(t), c - c * math.cos(t)))
        for t in np.linspace(0, math.pi / 2, seg + 1):
            perfil.append((r2 - c + c * math.cos(t), h - c + c * math.sin(t)))
        perfil.append((0, h))
        ob = torno(nome, perfil, n=n, mat=mat, suave=None)
        ob.data.shade_smooth()
        ob.data.set_sharp_from_angle(angle=math.radians(50))
        _arrumar_polos(ob)
    else:
        ob = torno(nome, [(r, 0), (r2, h)], n=n, mat=mat, suave=None, tampa_ini=tampas, tampa_fim=tampas)
        ob.data.shade_smooth()
        ob.data.set_sharp_from_angle(angle=math.radians(50))
    mover(ob, centro)
    return ob


def _arrumar_polos(ob):
    return ob


def esfera(nome, r, nu=16, nv=10, mat=None, centro=(0, 0, 0), esc=(1, 1, 1), suave=True, cores=None):
    a = np.linspace(-math.pi / 2, math.pi / 2, nv + 1)
    perfil = [(r * math.cos(t), r * math.sin(t)) for t in a]
    perfil[0] = (0, -r)
    perfil[-1] = (0, r)
    ob = torno(nome, perfil, n=nu, mat=mat, suave=suave)
    escalar(ob, esc)
    if cores is not None:
        definir_cores(ob, cores)
    mover(ob, centro)
    return ob


def toro(nome, R, r, nu=24, nv=10, mat=None, centro=(0, 0, 0), suave=True, uv=None, raio_v=None):
    """Toro deitado (eixo Z). raio_v(ângulo_u) opcional para variar o raio do tubo."""
    a = np.arange(nu) / nu * TAU
    b = np.arange(nv) / nv * TAU
    P = np.zeros((nu, nv, 3))
    for i, ai in enumerate(a):
        rr = r if raio_v is None else raio_v(ai)
        for j, bj in enumerate(b):
            P[i, j] = ((R + rr * math.cos(bj)) * math.cos(ai), (R + rr * math.cos(bj)) * math.sin(ai), rr * math.sin(bj))
    ob = grade(nome, P, fechar_u=True, fechar_v=True, mat=mat, suave=suave, uv=uv, inverter=True)
    mover(ob, centro)
    return ob


def poligono_extrudado(nome, contorno, h, mat=None, chanfro=0.0, seg=2, z0=0.0, suave=35):
    """Extrusão (em Z) de um contorno 2D (lista de (x, y) no sentido anti-horário)."""
    c = np.asarray(contorno, dtype=float)
    n = len(c)
    verts = [(x, y, z0) for x, y in c] + [(x, y, z0 + h) for x, y in c]
    faces = [list(range(n))[::-1], list(range(n, 2 * n))]
    for i in range(n):
        j = (i + 1) % n
        faces.append([i, j, n + j, n + i])
    ob = malha(nome, verts, faces, mat=mat)
    if chanfro > 0:
        chanfrar(ob, chanfro, seg)
    else:
        suavizar(ob, suave)
    return ob


def texto(nome, corpo, tamanho, espessura, mat=None, fonte=None, centralizar=True, chanfro=0.0):
    c = bpy.data.curves.new(nome, 'FONT')
    c.body = corpo
    c.size = tamanho
    c.extrude = espessura / 2
    c.bevel_depth = chanfro
    if fonte:
        c.font = bpy.data.fonts.load(fonte, check_existing=True)
    if centralizar:
        c.align_x = 'CENTER'
        c.align_y = 'CENTER'
    ob = bpy.data.objects.new(nome + '_c', c)
    _ligar(ob)
    dg = bpy.context.evaluated_depsgraph_get()
    me = bpy.data.meshes.new_from_object(ob.evaluated_get(dg))
    bpy.data.objects.remove(ob)
    bpy.data.curves.remove(c)
    o2 = bpy.data.objects.new(nome, me)
    _ligar(o2)
    if mat:
        me.materials.clear()
        me.materials.append(MAT.material(mat))
    return o2


# ----------------------------------------------------------------- transformações

def mover(ob, d):
    if any(abs(x) > 0 for x in d):
        ob.data.transform(Matrix.Translation(Vector(d)))
    return ob


def girar(ob, graus, centro=(0, 0, 0), ordem='XYZ'):
    """Gira os vértices (graus em X, Y, Z) em torno de `centro`."""
    c = Vector(centro)
    m = Matrix.Translation(c) @ Euler([math.radians(a) for a in graus], ordem).to_matrix().to_4x4() @ Matrix.Translation(-c)
    ob.data.transform(m)
    return ob


def escalar(ob, s, centro=(0, 0, 0)):
    if isinstance(s, (int, float)):
        s = (s, s, s)
    c = Vector(centro)
    m = Matrix.Translation(c) @ Matrix.Diagonal(Vector((*s, 1))) @ Matrix.Translation(-c)
    ob.data.transform(m)
    if s[0] * s[1] * s[2] < 0:
        ob.data.flip_normals()
    return ob


def transformar(ob, mat4):
    ob.data.transform(mat4)
    return ob


def copiar(ob, nome=None):
    o2 = ob.copy()
    o2.data = ob.data.copy()
    if nome:
        o2.name = nome
        o2.data.name = nome
    _ligar(o2)
    return o2


def espelhar_x(ob, juntar_original=True):
    o2 = copiar(ob)
    escalar(o2, (-1, 1, 1))
    if juntar_original:
        return juntar(ob.name, [ob, o2])
    return o2


def verts(ob):
    me = ob.data
    v = np.zeros(len(me.vertices) * 3)
    me.vertices.foreach_get('co', v)
    return v.reshape(-1, 3)


def por_verts(ob, v):
    ob.data.vertices.foreach_set('co', np.asarray(v, dtype=np.float32).ravel())
    ob.data.update()
    return ob


def deformar(ob, fn):
    """Aplica fn((N,3)) -> (N,3) nos vértices."""
    return por_verts(ob, fn(verts(ob)))


def juntar(nome, obs):
    """Junta várias peças num objeto só (materiais viram primitivas do glTF)."""
    obs = [o for o in obs if o is not None]
    if any(o.data.color_attributes.get('Color') for o in obs):
        for o in obs:
            if o.data.color_attributes.get('Color') is None:
                definir_cores(o, (1.0, 1.0, 1.0))
    if len(obs) == 1:
        ob = obs[0]
    else:
        ob = obs[0]
        with bpy.context.temp_override(active_object=ob, object=ob, selected_objects=obs,
                                       selected_editable_objects=obs):
            bpy.ops.object.join()
    ob.name = nome
    ob.data.name = nome
    at = ob.data.color_attributes.get('Color')
    if at is not None:
        ob.data.color_attributes.active_color = at
        ob.data.color_attributes.render_color_index = ob.data.color_attributes.find('Color')
    return ob


def vazio(nome, local=(0, 0, 0), pai=None, tamanho=0.05):
    ob = bpy.data.objects.new(nome, None)
    ob.empty_display_size = tamanho
    ob.empty_display_type = 'PLAIN_AXES'
    _ligar(ob)
    ob.location = Vector(local)
    if pai is not None:
        ob.parent = pai
    return ob


def filho(ob, pai, local=(0, 0, 0)):
    """Prende `ob` (já modelado em torno do seu pivô na origem) ao `pai`, em `local`."""
    ob.parent = pai
    ob.location = Vector(local)
    return ob


def contar_tris(ob):
    me = ob.data
    n = np.zeros(len(me.polygons), dtype=np.int32)
    me.polygons.foreach_get('loop_total', n)
    return int((n - 2).sum())


# ----------------------------------------------------------------- ruído

def ruido3(p, escala=1.0, semente=0):
    """Ruído suave barato (soma de senos) para ondulações; p: (N,3)."""
    rng = np.random.default_rng(semente)
    p = np.asarray(p, dtype=float) * escala
    out = np.zeros(len(p))
    amp = 1.0
    for k in range(4):
        d = rng.normal(size=3)
        d /= np.linalg.norm(d)
        f = (1.7 ** k)
        fase = rng.uniform(0, TAU)
        out += amp * np.sin(p @ d * f * 2.3 + fase)
        amp *= 0.55
    return out / 1.9


def rng(semente):
    return np.random.default_rng(semente)


# ----------------------------------------------------------------- coordenadas de textura

def uv_projetar(ob, tile=1.0, modo='caixa', eixo='z', origem=(0, 0, 0)):
    """UV por projeção: 'caixa' (eixo dominante da face) ou 'plano' (eixo fixo).

    tile: metros por repetição da textura.
    """
    me = ob.data
    nl = len(me.loops)
    vi = np.zeros(nl, dtype=np.int32)
    me.loops.foreach_get('vertex_index', vi)
    P = verts(ob)[vi] - np.asarray(origem)
    pl = np.zeros(nl, dtype=np.int32)
    ns = np.zeros(len(me.polygons) * 3)
    me.polygons.foreach_get('normal', ns)
    ns = ns.reshape(-1, 3)
    ls = np.zeros(len(me.polygons), dtype=np.int32)
    lt = np.zeros(len(me.polygons), dtype=np.int32)
    me.polygons.foreach_get('loop_start', ls)
    me.polygons.foreach_get('loop_total', lt)
    for i, (s, t) in enumerate(zip(ls, lt)):
        pl[s:s + t] = i
    if modo == 'caixa':
        dom = np.abs(ns).argmax(axis=1)[pl]
    else:
        dom = np.full(nl, 'xyz'.index(eixo))
    uv = np.zeros((nl, 2))
    m0 = dom == 0
    uv[m0] = P[m0][:, [1, 2]]
    m1 = dom == 1
    uv[m1] = P[m1][:, [0, 2]]
    m2 = dom == 2
    uv[m2] = P[m2][:, [0, 1]]
    uv /= tile
    camada = me.uv_layers.get('UVMap') or me.uv_layers.new(name='UVMap')
    camada.data.foreach_set('uv', uv.astype(np.float32).ravel())
    return ob


def uv_cilindrico(ob, tile_u=None, tile_v=1.0, eixo_z=True):
    """UV cilíndrico em torno de Z: u = ângulo/2π (ou arco/tile_u), v = z/tile_v. Corrige a costura."""
    me = ob.data
    nl = len(me.loops)
    vi = np.zeros(nl, dtype=np.int32)
    me.loops.foreach_get('vertex_index', vi)
    P = verts(ob)[vi]
    a = (np.arctan2(P[:, 1], P[:, 0]) / TAU) % 1.0
    ls = np.zeros(len(me.polygons), dtype=np.int32)
    lt = np.zeros(len(me.polygons), dtype=np.int32)
    me.polygons.foreach_get('loop_start', ls)
    me.polygons.foreach_get('loop_total', lt)
    for s, t in zip(ls, lt):
        seg = a[s:s + t]
        if seg.max() - seg.min() > 0.5:
            seg[seg < 0.5] += 1.0
            a[s:s + t] = seg
    uv = np.stack([a, P[:, 2] / tile_v], axis=1)
    if tile_u:
        r = np.hypot(P[:, 0], P[:, 1]).mean()
        uv[:, 0] *= TAU * r / tile_u
    camada = me.uv_layers.get('UVMap') or me.uv_layers.new(name='UVMap')
    camada.data.foreach_set('uv', uv.astype(np.float32).ravel())
    return ob


def orientar(ob, origem=(0, 0, 0), direcao=(0, 0, 1), rolagem=0.0):
    """Leva o +Z local para `direcao` (girando antes `rolagem` graus em Z) e põe em `origem`."""
    d = Vector(direcao).normalized()
    q = Vector((0, 0, 1)).rotation_difference(d)
    m = Matrix.Translation(Vector(origem)) @ q.to_matrix().to_4x4() @ Matrix.Rotation(math.radians(rolagem), 4, 'Z')
    ob.data.transform(m)
    return ob
