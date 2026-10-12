"""Esqueleto, pesos da pele e animação por código (FK/IK próprios em numpy).

Convenções do Blender usadas aqui:
- matriz de pose (espaço da armadura) = pose_pai @ inv(repouso_pai) @ repouso @ base
- `base` = matriz local da pose (location/rotation_quaternion do pose bone)
Eixos anatômicos no espaço da armadura: X = esquerda do bicho, -Y = frente, Z = cima.
"""
import numpy as np
import bpy
from mathutils import Matrix

FPS = 30


# ---------------------------------------------------------------------------
# rotações
# ---------------------------------------------------------------------------
def Rx(g):
    a = np.radians(g)
    c, s = np.cos(a), np.sin(a)
    return np.array([[1, 0, 0], [0, c, -s], [0, s, c]])


def Ry(g):
    a = np.radians(g)
    c, s = np.cos(a), np.sin(a)
    return np.array([[c, 0, s], [0, 1, 0], [-s, 0, c]])


def Rz(g):
    a = np.radians(g)
    c, s = np.cos(a), np.sin(a)
    return np.array([[c, -s, 0], [s, c, 0], [0, 0, 1]])


def anat(arfagem=0.0, guinada=0.0, rolagem=0.0):
    """Rotação anatômica: arfagem > 0 levanta a frente, guinada > 0 vira para a
    esquerda, rolagem > 0 abaixa o lado esquerdo."""
    return Rz(guinada) @ Rx(-arfagem) @ Ry(-rolagem)


def eixo_angulo(eixo, graus):
    e = np.asarray(eixo, dtype=float)
    e = e / np.linalg.norm(e)
    a = np.radians(graus)
    K = np.array([[0, -e[2], e[1]], [e[2], 0, -e[0]], [-e[1], e[0], 0]])
    return np.eye(3) + np.sin(a) * K + (1 - np.cos(a)) * K @ K


def norm(v):
    v = np.asarray(v, dtype=float)
    n = np.linalg.norm(v)
    return v / n if n > 1e-12 else v


def suave(a, b, x):
    """smoothstep de a até b (aceita a > b)."""
    t = np.clip((x - a) / (b - a), 0.0, 1.0)
    return t * t * (3 - 2 * t)


def mistura(a, b, t):
    return a + (b - a) * t


def M4(R=None, t=None):
    M = np.eye(4)
    if R is not None:
        M[:3, :3] = R
    if t is not None:
        M[:3, 3] = t
    return M


# ---------------------------------------------------------------------------
# criação da armadura
# ---------------------------------------------------------------------------
class Osso:
    def __init__(self, nome, pai, cabeca, cauda, z_ref=(0, 0, 1), deforma=True, conectado=False):
        self.nome, self.pai = nome, pai
        self.cabeca = np.asarray(cabeca, dtype=float)
        self.cauda = np.asarray(cauda, dtype=float)
        self.z_ref = np.asarray(z_ref, dtype=float)
        self.deforma = deforma
        self.conectado = conectado


def criar_armadura(nome, ossos):
    arm = bpy.data.armatures.new(nome)
    ob = bpy.data.objects.new(nome, arm)
    bpy.context.scene.collection.objects.link(ob)
    bpy.context.view_layer.objects.active = ob
    with bpy.context.temp_override(active_object=ob, object=ob):
        bpy.ops.object.mode_set(mode='EDIT')
        eb = arm.edit_bones
        for o in ossos:
            b = eb.new(o.nome)
            b.head = o.cabeca.tolist()
            b.tail = o.cauda.tolist()
            b.align_roll(o.z_ref.tolist())
            b.use_deform = o.deforma
            if o.pai:
                b.parent = eb[o.pai]
                b.use_connect = o.conectado
        bpy.ops.object.mode_set(mode='OBJECT')
    for pb in ob.pose.bones:
        pb.rotation_mode = 'QUATERNION'
    return ob


# ---------------------------------------------------------------------------
# avaliador de pose
# ---------------------------------------------------------------------------
class Esqueleto:
    """Lê a armadura e resolve poses (FK + IK) no espaço da armadura."""

    def __init__(self, arm_ob):
        self.ob = arm_ob
        self.nomes = [b.name for b in arm_ob.data.bones]
        self.pai = {b.name: (b.parent.name if b.parent else None) for b in arm_ob.data.bones}
        self.rep = {b.name: np.array(b.matrix_local) for b in arm_ob.data.bones}
        self.comp = {b.name: b.length for b in arm_ob.data.bones}
        self.cab = {n: self.rep[n][:3, 3].copy() for n in self.nomes}
        self.cau = {n: self.rep[n][:3, 3] + self.rep[n][:3, 1] * self.comp[n] for n in self.nomes}
        # correção entre o quadro "da IK" e o quadro do Blender em repouso
        self.corr = {}

    def carregado(self, nome, pose):
        """Matriz que o osso teria se a base fosse identidade (levado pelo pai)."""
        p = self.pai[nome]
        if p is None:
            return self.rep[nome].copy()
        return pose[p] @ np.linalg.inv(self.rep[p]) @ self.rep[nome]

    def fk(self, nome, pose, bases, R_anat=None, desloc=None):
        """Aplica uma rotação anatômica (eixos do repouso) e um deslocamento (eixos da armadura)."""
        Rr = self.rep[nome][:3, :3]
        B = np.eye(4)
        if R_anat is not None:
            B[:3, :3] = Rr.T @ R_anat @ Rr
        if desloc is not None:
            # deslocamento expresso nos eixos do pai em movimento ~ aqui usado só na raiz do corpo
            B[:3, 3] = Rr.T @ np.asarray(desloc, dtype=float)
        bases[nome] = B
        pose[nome] = self.carregado(nome, pose) @ B
        return pose[nome]

    def por_mundo(self, nome, pose, bases, M_desejada):
        """Define o osso pela matriz desejada no espaço da armadura."""
        C = self.carregado(nome, pose)
        B = np.linalg.inv(C) @ M_desejada
        # o osso é rígido: remove escala numérica
        U, _, Vt = np.linalg.svd(B[:3, :3])
        B[:3, :3] = U @ Vt
        bases[nome] = B
        pose[nome] = C @ B
        return pose[nome]

    # ---- quadro de IK: Y ao longo do osso, X perto da normal do plano da perna
    def quadro_ik(self, y, normal):
        y = norm(y)
        x = norm(normal - y * np.dot(normal, y))
        z = np.cross(x, y)
        return np.stack([x, y, z], axis=1)

    def preparar_ik(self, nome, normal_repouso):
        Rr = self.rep[nome][:3, :3]
        Q = self.quadro_ik(Rr[:, 1], normal_repouso)
        self.corr[nome] = Q.T @ Rr

    def osso_apontando(self, nome, pose, bases, origem, direcao, normal):
        """Põe o osso com a cabeça em `origem` apontando para `direcao` (IK)."""
        Q = self.quadro_ik(direcao, normal)
        R = Q @ self.corr[nome]
        return self.por_mundo(nome, pose, bases, M4(R, origem))


def ik_dois(a_pos, alvo, l1, l2, normal, lado_dobra):
    """IK de dois ossos no plano de normal `normal`. Devolve a junta do meio.

    `lado_dobra` é um vetor que indica para onde a junta do meio deve ir."""
    d = alvo - a_pos
    dist = np.linalg.norm(d)
    dist_c = np.clip(dist, abs(l1 - l2) + 1e-4, l1 + l2 - 1e-4)
    u = d / max(dist, 1e-9)
    v = np.cross(normal, u)
    if np.dot(v, lado_dobra) < 0:
        v = -v
    v = norm(v - u * np.dot(v, u))
    ca = (l1 * l1 + dist_c * dist_c - l2 * l2) / (2 * l1 * dist_c)
    ang = np.arccos(np.clip(ca, -1, 1))
    return a_pos + l1 * (np.cos(ang) * u + np.sin(ang) * v)


def quat_de(R):
    return np.array(Matrix(R.tolist()).to_quaternion())


# ---------------------------------------------------------------------------
# gravação das ações
# ---------------------------------------------------------------------------
def gravar_acao(arm_ob, nome, quadros, com_posicao=()):
    """`quadros` = lista de dicionários osso -> matriz base 4x4 (um por quadro, a 30 qps).

    Cria a ação com curvas de rotação (quatérnio) para todos os ossos e de
    posição só para os que se deslocam."""
    acao = bpy.data.actions.new(nome)
    acao.use_fake_user = True
    ad = arm_ob.animation_data or arm_ob.animation_data_create()
    ad.action = acao
    n = len(quadros)
    ossos = list(quadros[0].keys())
    for osso in ossos:
        qs = np.zeros((n, 4))
        ts = np.zeros((n, 3))
        for i, q in enumerate(quadros):
            B = q[osso]
            qs[i] = quat_de(B[:3, :3])
            ts[i] = B[:3, 3]
        # continuidade do quatérnio
        for i in range(1, n):
            if np.dot(qs[i], qs[i - 1]) < 0:
                qs[i] = -qs[i]
        caminho = f'pose.bones["{osso}"]'
        canais = [('rotation_quaternion', qs, 4)]
        if np.abs(ts).max() > 1e-6 or osso in com_posicao:
            canais.append(('location', ts, 3))
        for prop, vals, k in canais:
            for idx in range(k):
                fc = acao.fcurve_ensure_for_datablock(arm_ob, f'{caminho}.{prop}', index=idx, group_name=osso)
                kp = fc.keyframe_points
                kp.add(n)
                co = np.stack([np.arange(n, dtype=float), vals[:, idx]], axis=1)
                kp.foreach_set('co', co.ravel())
                kp.foreach_set('interpolation', np.full(n, 1, dtype=np.int32))  # LINEAR
                fc.update()
    acao.frame_range = (0, n - 1)
    try:
        acao.use_frame_range = True
    except Exception:
        pass
    return acao


def empilhar_acoes(arm_ob, acoes):
    """Coloca cada ação numa faixa NLA própria (o exportador pega todas)."""
    ad = arm_ob.animation_data or arm_ob.animation_data_create()
    ad.action = None
    for a in acoes:
        tr = ad.nla_tracks.new()
        tr.name = a.name
        st = tr.strips.new(a.name, 0, a)
        st.name = a.name
        tr.mute = True


# ---------------------------------------------------------------------------
# pesos da pele
# ---------------------------------------------------------------------------
def dist_segmento(v, a, b):
    d = b - a
    t = np.clip(((v - a) @ d) / max(d @ d, 1e-12), 0, 1)
    q = a[None] + t[:, None] * d[None]
    return np.linalg.norm(v - q, axis=1)


def pesos_regioes(v, dist_reg, ossos_reg, segmentos, tau=0.006, potencia=4.0, eps=0.004):
    """Pesos: mistura macia das regiões (pela distância às primitivas de cada uma)
    e, dentro de cada região, inverso da distância aos ossos dela."""
    regs = [r for r in dist_reg if r in ossos_reg]
    D = np.stack([dist_reg[r] for r in regs], axis=1)
    D = D - D.min(axis=1, keepdims=True)
    Wr = np.exp(-D / tau)
    Wr /= Wr.sum(axis=1, keepdims=True)
    todos = sorted({o for r in regs for o in ossos_reg[r]})
    col = {o: i for i, o in enumerate(todos)}
    W = np.zeros((len(v), len(todos)))
    cache = {}
    for ri, r in enumerate(regs):
        lista = ossos_reg[r]
        if len(lista) == 1:
            W[:, col[lista[0]]] += Wr[:, ri]
            continue
        inv = []
        for o in lista:
            if o not in cache:
                a, b = segmentos[o]
                cache[o] = dist_segmento(v, a, b)
            inv.append(1.0 / (cache[o] + eps) ** potencia)
        inv = np.stack(inv, axis=1)
        inv /= inv.sum(axis=1, keepdims=True)
        for j, o in enumerate(lista):
            W[:, col[o]] += Wr[:, ri] * inv[:, j]
    return todos, W


def limitar_pesos(W, maximo=4, minimo=0.01):
    W = W.copy()
    if W.shape[1] > maximo:
        ordem = np.argsort(-W, axis=1)
        corte = np.zeros_like(W, dtype=bool)
        np.put_along_axis(corte, ordem[:, maximo:], True, axis=1)
        W[corte] = 0.0
    W[W < minimo] = 0.0
    s = W.sum(axis=1, keepdims=True)
    return W / np.maximum(s, 1e-12)


def aplicar_pesos(ob, nomes, W):
    ob.vertex_groups.clear()
    grupos = {n: ob.vertex_groups.new(name=n) for n in nomes}
    for j, n in enumerate(nomes):
        idx = np.nonzero(W[:, j] > 0)[0]
        g = grupos[n]
        for i in idx:
            g.add([int(i)], float(W[i, j]), 'REPLACE')


def ligar_armadura(ob, arm_ob):
    ob.parent = arm_ob
    m = ob.modifiers.new('armadura', 'ARMATURE')
    m.object = arm_ob
    m.use_vertex_groups = True
    return m


def suavizar_pesos(ob, W, iteracoes=3, alfa=0.5):
    """Média dos pesos com os vizinhos (pelas arestas da malha) para tirar vincos."""
    me = ob.data
    ar = np.zeros(len(me.edges) * 2, dtype=np.int64)
    me.edges.foreach_get('vertices', ar)
    ar = ar.reshape(-1, 2)
    n = len(me.vertices)
    grau = np.bincount(ar.ravel(), minlength=n).astype(float)
    W = W.copy()
    for _ in range(iteracoes):
        soma = np.zeros_like(W)
        np.add.at(soma, ar[:, 0], W[ar[:, 1]])
        np.add.at(soma, ar[:, 1], W[ar[:, 0]])
        media = soma / np.maximum(grau, 1)[:, None]
        W = (1 - alfa) * W + alfa * media
    return W
