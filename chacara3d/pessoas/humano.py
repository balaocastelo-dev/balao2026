"""Montagem de poses por código (animações feitas à mão, em cima ou no lugar da captura).

Convenções de ângulo (graus), no referencial do pai ou do corpo:
- quadril/coluna/cabeça: `flexao` > 0 inclina para a frente (cabeça: olha para baixo),
  `lado` > 0 inclina para a esquerda da pessoa (+X), `giro` > 0 vira para a esquerda.
- braço (FK): `flexao` levanta o braço para a frente, `abducao` levanta para o lado,
  `rotacao` > 0 gira o braço para dentro; `cotovelo` dobra; `prono` gira o antebraço
  (palma para baixo/trás); `punho` dobra a mão para o lado da palma, `desvio` para o polegar.
"""
import numpy as np

import ossos as O
import pose as PZ
from pose import norm, rot

X, Y, Z = np.eye(3)
LADOS = ('_e', '_d')


def sinal(l):
    """+1 para o lado esquerdo (+X), -1 para o direito."""
    return 1.0 if l == '_e' else -1.0


def anat(flexao=0.0, lado=0.0, giro=0.0):
    """Rotação de tronco/cabeça: giro (Y), depois flexão (X), depois inclinação lateral (Z)."""
    return PZ.Ry(giro) @ PZ.Rx(flexao) @ PZ.Rz(-lado)


# ---------------------------------------------------------------------------
# ruído que fecha o laço e curvas de tempo
# ---------------------------------------------------------------------------
def ruido(t, T, semente, harmonicos=(1, 2, 3), amp=1.0):
    """Soma de senos com frequências inteiras do laço: suave e periódico em T."""
    r = np.random.default_rng(semente)
    s = 0.0
    tot = 0.0
    for k in harmonicos:
        a = 1.0 / k
        s += a * np.sin(2 * np.pi * k * t / T + r.uniform(0, 2 * np.pi))
        tot += a
    return amp * s / tot


def suave(x):
    x = np.clip(x, 0, 1)
    return x * x * (3 - 2 * x)


def suave5(x):
    x = np.clip(x, 0, 1)
    return x * x * x * (x * (x * 6 - 15) + 10)


def janela(t, a, b, rampa):
    """1 entre a e b, com rampas suaves de `rampa` segundos."""
    return suave((t - a) / rampa) * suave((b - t) / rampa)


def pulso(fase, largura=0.25):
    """Pulso suave no começo de cada ciclo (fase em ciclos)."""
    f = fase % 1.0
    return np.exp(-0.5 * (min(f, 1 - f) / largura) ** 2 * 4)


def interp_chaves(chaves, t, T):
    """Chaves [(t, valor), ...] num laço de T s, interpolação suave (smootherstep)."""
    ts = [c[0] for c in chaves]
    t = t % T
    n = len(chaves)
    for i in range(n):
        a, va = chaves[i]
        b, vb = chaves[(i + 1) % n]
        if i == n - 1:
            b += T
        tt = t if t >= a else t + T
        if a <= tt <= b:
            w = suave5((tt - a) / max(b - a, 1e-9))
            return np.asarray(va, float) * (1 - w) + np.asarray(vb, float) * w
    _ = ts
    return np.asarray(chaves[0][1], float)


class Humano:
    """Medidas de uma pessoa e montagem de poses."""

    def __init__(self, esq, pe_pontos, tipo):
        self.esq = esq
        self.J = esq.J
        self.pe = pe_pontos
        self.tipo = tipo
        J = self.J
        self.altura = {'homem': 1.76, 'mulher': 1.63, 'crianca': 1.30}[tipo]
        self.k = self.altura / 1.76                  # escala de medidas (relativa ao homem)
        self.amp = 0.8 if tipo == 'crianca' else 1.0  # amplitude de gestos
        self.y_quadril = J['quadril'][1]
        self.y_coxa = J['coxa_e'][1]
        self.sola = min(pe_pontos['calcanhar_e'][1], pe_pontos['bola_e'][1])
        self.y_tornozelo = J['pe_e'][1]
        self.braco = esq.comp['braco_e'] + esq.comp['antebraco_e']
        self.largura_quadril = J['coxa_e'][0] - J['coxa_d'][0]
        self.largura_ombro = J['braco_e'][0] - J['braco_d'][0]
        # mão em repouso: do punho até a pega
        self.mao_pega = {l: J['pega' + l] - J['mao' + l] for l in LADOS}

    def nova(self):
        return Pose(self)


class Pose:
    def __init__(self, h):
        self.h = h
        self.esq = h.esq
        self.J = h.J
        self.Rw = {o: np.eye(3) for o in O.NOMES}
        self.pq = self.J['quadril'].copy()
        self._P = None

    # ------------------------------------------------------------------ util
    def P(self):
        return self.esq.fk(self.Rw, self.pq)

    def quadro_corpo(self):
        return self.Rw['quadril']

    # ------------------------------------------------------------------ tronco
    def quadril(self, pos=None, desl=(0, 0, 0), flexao=0.0, lado=0.0, giro=0.0):
        if pos is not None:
            self.pq = np.asarray(pos, float)
        else:
            self.pq = self.J['quadril'] + np.asarray(desl, float)
        self.Rw['quadril'] = anat(flexao, lado, giro)
        for o in ('coluna_1', 'coluna_2', 'peito', 'pescoco', 'cabeca', 'clavicula_e', 'clavicula_d'):
            self.Rw[o] = self.Rw['quadril'].copy()
        return self

    def coluna(self, flexao=0.0, lado=0.0, giro=0.0, pesos=(0.3, 0.35, 0.35)):
        R = self.Rw['quadril']
        for o, w in zip(('coluna_1', 'coluna_2', 'peito'), pesos):
            R = R @ anat(flexao * w, lado * w, giro * w)
            self.Rw[o] = R
        self.Rw['pescoco'] = R.copy()
        self.Rw['cabeca'] = R.copy()
        self.Rw['clavicula_e'] = R.copy()
        self.Rw['clavicula_d'] = R.copy()
        return self

    def cabeca(self, flexao=0.0, lado=0.0, giro=0.0, pescoco=0.45):
        R = self.Rw['peito']
        self.Rw['pescoco'] = R @ anat(flexao * pescoco, lado * pescoco, giro * pescoco)
        w = 1 - pescoco
        self.Rw['cabeca'] = self.Rw['pescoco'] @ anat(flexao * w, lado * w, giro * w)
        return self

    def girar_local(self, extras):
        """Multiplica a rotação local de alguns ossos (dict osso -> R) e leva os filhos junto."""
        loc = {}
        for o in O.NOMES:
            p = O.PAIS[o]
            loc[o] = self.Rw[o] if p is None else self.Rw[p].T @ self.Rw[o]
        for o, R in extras.items():
            loc[o] = loc[o] @ R
        for o in O.NOMES:
            p = O.PAIS[o]
            self.Rw[o] = loc[o] if p is None else self.Rw[p] @ loc[o]
        return self

    def somar_coluna(self, flexao=0.0, lado=0.0, giro=0.0, pesos=(0.3, 0.35, 0.35)):
        return self.girar_local({o: anat(flexao * w, lado * w, giro * w)
                                 for o, w in zip(('coluna_1', 'coluna_2', 'peito'), pesos)})

    def somar_cabeca(self, flexao=0.0, lado=0.0, giro=0.0, pescoco=0.4):
        """Soma uma rotação à cabeça/pescoço que já estão na pose (mantém a captura)."""
        Lp = self.Rw['peito'].T @ self.Rw['pescoco']
        Lc = self.Rw['pescoco'].T @ self.Rw['cabeca']
        w = 1 - pescoco
        self.Rw['pescoco'] = self.Rw['peito'] @ Lp @ anat(flexao * pescoco, lado * pescoco, giro * pescoco)
        self.Rw['cabeca'] = self.Rw['pescoco'] @ Lc @ anat(flexao * w, lado * w, giro * w)
        return self

    def olhar_para(self, alvo, peso=1.0, pescoco=0.45, flexao_extra=0.0):
        """Vira a cabeça para olhar um ponto do mundo."""
        P = self.P()
        olhos = P['cabeca'] + self.Rw['cabeca'] @ np.array([0, 0.09 * self.h.k, 0.08 * self.h.k])
        d = norm(np.asarray(alvo) - olhos)
        Rp = self.Rw['peito']
        dl = Rp.T @ d
        giro = np.degrees(np.arctan2(dl[0], dl[2])) * peso
        flex = -np.degrees(np.arcsin(np.clip(dl[1], -1, 1))) * peso + flexao_extra
        return self.cabeca(flexao=flex, giro=giro, pescoco=pescoco)

    def clavicula(self, l, elevacao=0.0, protracao=0.0):
        s = sinal(l)
        R = self.Rw['peito'] @ PZ.Rz(s * elevacao) @ PZ.Ry(-s * protracao)
        self.Rw['clavicula' + l] = R
        return self

    # ------------------------------------------------------------------ braços
    def _hinge0(self, l):
        return self.esq.dobra_cotovelo0[l]

    def braco_fk(self, l, flexao=0.0, abducao=0.0, rotacao=0.0, cotovelo=10.0, prono=0.0, punho=0.0, desvio=0.0):
        """Braço por ângulos, a partir do braço pendurado (palma para o corpo)."""
        s = sinal(l)
        J = self.J
        Rp = self.Rw['peito']
        Rs = PZ.Rx(-flexao) @ PZ.Rz(s * abducao)
        d = Rp @ Rs @ np.array([0, -1.0, 0])
        h = Rp @ Rs @ np.array([-1.0, 0, 0])
        # rotação interna: gira o eixo do cotovelo em volta do braço
        h = rot(d, s * rotacao) @ h
        u0 = J['antebraco' + l] - J['braco' + l]
        Rb = PZ.alinhar(u0, self._hinge0(l), d, h)
        self.Rw['braco' + l] = Rb
        df = rot(h, cotovelo) @ d
        f0 = J['mao' + l] - J['antebraco' + l]
        Ra = PZ.alinhar(f0, self._hinge0(l), df, h)
        # pronação: com o cotovelo dobrado e prono 0 a palma fica para dentro
        Ra = rot(df, s * prono) @ Ra
        self.Rw['antebraco' + l] = Ra
        self.Rw['mao' + l] = Ra @ self._punho(l, punho, desvio)
        self.Rw['pega' + l] = self.Rw['mao' + l]
        return self

    def _punho(self, l, punho, desvio):
        """Rotação do punho no referencial de repouso."""
        Pg = self.esq.P_pega['pega' + l]
        mao_dir = norm(self.J['pega' + l] - self.J['mao' + l])
        eixo_y = Pg[:, 1]                                # do mínimo para o indicador
        palma = Pg[:, 0] if l == '_d' else -Pg[:, 0]     # normal da palma
        a_flex = norm(np.cross(mao_dir, palma))
        a_desv = norm(np.cross(mao_dir, eixo_y))
        return rot(a_flex, punho) @ rot(a_desv, desvio)

    def braco_ik(self, l, pega=None, quadro=None, polo=None, punho=0.0, desvio=0.0, prono=None, torcer=0.55,
                 punho_alvo=None):
        """Leva a pega (ou o punho, `punho_alvo`) a um ponto. `quadro`: orientação desejada
        da pega (3x3 no mundo; Y = eixo do cabo). `polo`: para onde o cotovelo aponta."""
        s = sinal(l)
        J = self.J
        P = self.P()
        S = P['braco' + l]
        if quadro is not None:
            Rm = quadro @ self.esq.P_pega['pega' + l].T
            W = (np.asarray(pega) - Rm @ (J['pega' + l] - J['mao' + l])) if punho_alvo is None else np.asarray(punho_alvo)
        else:
            W = np.asarray(punho_alvo) if punho_alvo is not None else np.asarray(pega) - (self.h.mao_pega[l] * 0.9)
            Rm = None
        if polo is None:
            polo = self.Rw['peito'] @ np.array([s * 0.6, -0.4, -1.0])
        l1, l2 = self.esq.comp['braco' + l], self.esq.comp['antebraco' + l]
        E = PZ.ik_dois(S, W, l1, l2, polo)
        d = E - S
        df = W - E
        h = np.cross(d, df)
        if np.linalg.norm(h) < 1e-6 * l1 * l2:
            h = np.cross(d, polo)
        h = norm(h)
        u0 = J['antebraco' + l] - J['braco' + l]
        f0 = J['mao' + l] - J['antebraco' + l]
        Rb = PZ.alinhar(u0, self._hinge0(l), d, h)
        Ra = PZ.alinhar(f0, self._hinge0(l), df, h)
        if Rm is None:
            if prono is not None:
                Ra = rot(df, s * prono) @ Ra
            Rm = Ra @ self._punho(l, punho, desvio)
        else:
            # reparte a torção entre antebraço e mão
            rel = Ra.T @ Rm
            tw = PZ.torcao(rel, norm(f0))
            Ra = rot(df, torcer * tw) @ Ra
        self.Rw['braco' + l] = Rb
        self.Rw['antebraco' + l] = Ra
        self.Rw['mao' + l] = Rm
        self.Rw['pega' + l] = Rm
        return self

    # ------------------------------------------------------------------ pernas
    def perna_ik(self, l, tornozelo, R_pe=None, polo=None, dedos=0.0):
        J = self.J
        P = self.P()
        H = P['coxa' + l]
        if polo is None:
            polo = self.Rw['quadril'] @ np.array([sinal(l) * 0.1, 0, 1.0])
        l1, l2 = self.esq.comp['coxa' + l], self.esq.comp['canela' + l]
        K = PZ.ik_dois(H, tornozelo, l1, l2, polo)
        d1, d2 = K - H, np.asarray(tornozelo) - K
        e = np.cross(d1, d2)
        if np.linalg.norm(e) < 1e-6 * l1 * l2:
            e = np.cross(polo, d1)
        c0 = J['canela' + l] - J['coxa' + l]
        p0 = J['pe' + l] - J['canela' + l]
        self.Rw['coxa' + l] = PZ.alinhar(c0, X, d1, e)
        self.Rw['canela' + l] = PZ.alinhar(p0, X, d2, e)
        if R_pe is None:
            R_pe = PZ.Ry(np.degrees(np.arctan2(self.Rw['quadril'][0, 2], self.Rw['quadril'][2, 2])))
        self.Rw['pe' + l] = R_pe
        self.Rw['dedos_pe' + l] = R_pe @ PZ.Rx(-dedos)
        return self

    def pe_no_chao(self, l, x=None, z=None, giro=None, calcanhar=0.0, ponta=0.0, altura=0.0, polo=None,
                   dedos=None):
        """Pé apoiado: `calcanhar` > 0 levanta o calcanhar (gira em volta da bola),
        `ponta` > 0 levanta a ponta (gira no calcanhar). `x`, `z`: posição do tornozelo no
        repouso deslocada; `giro`: rumo do pé (graus, padrão = rumo do quadril)."""
        J = self.J
        if giro is None:
            giro = np.degrees(np.arctan2(self.Rw['quadril'][0, 2], self.Rw['quadril'][2, 2]))
        R = PZ.Ry(giro)
        tor0 = J['pe' + l]
        base = np.array([tor0[0] if x is None else x, tor0[1] + altura, tor0[2] if z is None else z])
        if calcanhar > 0:
            piv = self.h.pe['bola' + l] - tor0
            Rp = R @ PZ.Rx(calcanhar)
        elif ponta > 0:
            piv = self.h.pe['calcanhar' + l] - tor0
            Rp = R @ PZ.Rx(-ponta)
        else:
            piv = np.zeros(3)
            Rp = R
        tor = base + R @ piv - Rp @ piv
        if dedos is None:
            dedos = calcanhar if calcanhar > 0 else 0.0
        return self.perna_ik(l, tor, Rp, polo=polo, dedos=dedos)

    # ------------------------------------------------------------------ fim
    def fim(self):
        Rw = {o: R.copy() for o, R in self.Rw.items()}
        return Rw, self.pq.copy()


def de_pose(h, Rw, pq):
    """Pose montável a partir de uma pose pronta (ex.: da captura)."""
    p = Pose(h)
    p.Rw = {o: R.copy() for o, R in Rw.items()}
    p.pq = np.asarray(pq, float).copy()
    return p


def sobrepor_locais(base, extra, ossos):
    """Troca a rotação local (em relação ao pai) dos `ossos` pela da pose `extra`."""
    Rw = {o: R.copy() for o, R in base[0].items()}
    Re = extra[0]
    for o in O.NOMES:
        if o in ossos:
            p = O.PAIS[o]
            Rw[o] = Rw[p] @ (Re[p].T @ Re[o])
        elif O.PAIS[o] is not None and o not in ('quadril',):
            # mantém o local da base, mas segue o pai (se o pai mudou)
            p = O.PAIS[o]
            Rw[o] = Rw[p] @ (base[0][p].T @ base[0][o])
    return Rw, base[1].copy()


def misturar_poses(a, b, w, ossos=None):
    """Mistura duas poses (rotações locais por slerp, quadril linear)."""
    Ra, Rb = a[0], b[0]
    loc = {}
    for o in O.NOMES:
        p = O.PAIS[o]
        la = Ra[o] if p is None else Ra[p].T @ Ra[o]
        lb = Rb[o] if p is None else Rb[p].T @ Rb[o]
        ww = w if (ossos is None or o in ossos) else 0.0
        loc[o] = PZ.slerp_R(la, lb, ww)
    Rw = {}
    for o in O.NOMES:
        p = O.PAIS[o]
        Rw[o] = loc[o] if p is None else Rw[p] @ loc[o]
    return Rw, (1 - w) * a[1] + w * b[1]
