"""Transferência da captura de movimento (BVH da CMU) para o esqueleto das pessoas.

Para cada osso: R(t) = D(t) @ Q, onde D(t) = G(t) @ G(0)^T é quanto a junta de origem
girou desde a pose T do quadro 0 (no mundo) e Q leva o nosso osso, do repouso em "A",
para a pose T equivalente. As pernas são refeitas por IK para os tornozelos irem onde
iam na captura (escalada pelo comprimento da perna) e os pés pisam no chão.
"""
import numpy as np

import bvh as B
import pose as PZ
from pose import norm

MAPA = {
    'quadril': 'Hips', 'coluna_1': 'LowerBack', 'coluna_2': 'Spine', 'peito': 'Spine1', 'pescoco': 'Neck1',
    'cabeca': 'Head',
    'clavicula_e': 'LeftShoulder', 'braco_e': 'LeftArm', 'antebraco_e': 'LeftForeArm', 'mao_e': 'LeftHand',
    'clavicula_d': 'RightShoulder', 'braco_d': 'RightArm', 'antebraco_d': 'RightForeArm', 'mao_d': 'RightHand',
    'coxa_e': 'LeftUpLeg', 'canela_e': 'LeftLeg', 'pe_e': 'LeftFoot', 'dedos_pe_e': 'LeftToeBase',
    'coxa_d': 'RightUpLeg', 'canela_d': 'RightLeg', 'pe_d': 'RightFoot', 'dedos_pe_d': 'RightToeBase',
}
LADO = {'_e': 'Left', '_d': 'Right'}


class Fonte:
    """Captura carregada, reamostrada a 30 qps, com a pose T de referência."""

    def __init__(self, caminho, ini=None, fim=None, fps=30):
        self.b = B.BVH(caminho)
        G, P = self.b.fk()
        self.G0, self.P0 = G[0].copy(), P[0].copy()
        a = 1 if ini is None else ini
        z = len(G) if fim is None else fim
        G, P = G[a:z], P[a:z]
        self.G, self.P = B.reamostrar(G, P, self.b.dt, fps)
        self.idx = self.b.idx
        self.fps = fps
        I = self.idx
        self.perna = (np.linalg.norm(self.P0[I['LeftUpLeg']] - self.P0[I['LeftLeg']]) +
                      np.linalg.norm(self.P0[I['LeftLeg']] - self.P0[I['LeftFoot']]))
    @property
    def n(self):
        return len(self.G)

    def p(self, nome):
        return self.P[:, self.idx[nome]]

    def g(self, nome):
        return self.G[:, self.idx[nome]]

    def recortar(self, a, b):
        self.G, self.P = self.G[a:b], self.P[a:b]

    def fechar_laco(self, k):
        """Faz o fim emendar no começo: os últimos k quadros vão misturando com os k
        quadros que vêm antes do início (que são descartados do laço)."""
        G, P = self.G, self.P
        n = len(G)
        corpo_G, corpo_P = G[k:].copy(), P[k:].copy()
        m = len(corpo_G)
        # avanço de uma volta do laço (só no plano do chão): os quadros de antes do
        # começo são levados para a frente desse tanto antes de misturar
        h = self.idx['Hips']
        av = (corpo_P[-1, h] - corpo_P[0, h]) * m / max(m - 1, 1)
        av[1] = 0.0
        pre_G, pre_P = G[:k], P[:k] + av
        for i in range(k):
            t = (i + 1) / (k + 1)
            w = t * t * (3 - 2 * t)
            j = m - k + i
            for jj in range(G.shape[1]):
                corpo_G[j, jj] = PZ.slerp_R(corpo_G[j, jj], pre_G[i, jj], w)
            corpo_P[j] = (1 - w) * corpo_P[j] + w * pre_P[i]
        self.G, self.P = corpo_G, corpo_P
        _ = n


class Retarget:
    def __init__(self, esq, pe_pontos, fonte):
        self.esq = esq
        self.f = fonte
        self.pe = pe_pontos
        self.s = esq.perna / fonte.perna
        self.Q = self._quadros_T()
        self._pes_fonte()

    def _pes_fonte(self):
        """Calcanhar, bola e ponta do pé da captura, com a forma do nosso pé (escalada)
        levada pela rotação do pé e dos dedos da captura. Dá a altura do pé de origem
        e a altura do chão sem depender da pose T."""
        f, J, s = self.f, self.esq.J, self.s
        self.pts_src = {}
        for l, L in LADO.items():
            tor = f.p(L + 'Foot')
            dedo = f.p(L + 'ToeBase')
            n = f.n
            pts = np.zeros((n, 3, 3))
            for t in range(n):
                Rp = self.D('pe' + l, t) @ self.Q['pe' + l]
                Rd = self.D('dedos_pe' + l, t) @ self.Q['dedos_pe' + l]
                pts[t, 0] = tor[t] + Rp @ (self.pe['calcanhar' + l] - J['pe' + l]) / s
                pts[t, 1] = tor[t] + Rp @ (self.pe['bola' + l] - J['pe' + l]) / s
                # ponta: a partir da junta dos dedos da captura
                pts[t, 2] = dedo[t] + Rd @ (self.pe['ponta' + l] - J['dedos_pe' + l]) / s
            self.pts_src[l] = pts
        # chão = altura típica do pé de apoio (em quase todo quadro um pé está apoiado); o
        # percentil baixo pegava as pontas que mergulham no fim da passada e deixava o pé de
        # apoio flutuando ~2 cm
        baixo = np.minimum(self.pts_src['_e'][:, :, 1].min(1), self.pts_src['_d'][:, :, 1].min(1))
        self.y_chao = float(np.percentile(baixo, 30))

    def altura_pe(self, l, t):
        return self.pts_src[l][t, :, 1].min() - self.y_chao

    def _quadros_T(self):
        """Q de cada osso: do nosso repouso para a pose T da captura."""
        J = self.esq.J
        f = self.f
        I = f.idx
        P0 = f.P0
        Q = {o: np.eye(3) for o in MAPA}

        def dir_f(a, b):
            return norm(P0[I[b]] - P0[I[a]])

        for l, L in LADO.items():
            # clavícula
            Q['clavicula' + l] = PZ.minima(J['braco' + l] - J['clavicula' + l], dir_f(L + 'Shoulder', L + 'Arm'))
            # braço: menor rotação (gira em volta de ~Z, mantém o plano de dobra do cotovelo)
            u0 = J['antebraco' + l] - J['braco' + l]
            f0 = J['mao' + l] - J['antebraco' + l]
            h0 = J['pega' + l] - J['mao' + l]
            Qb = PZ.minima(u0, dir_f(L + 'Arm', L + 'ForeArm'))
            Qa = PZ.minima(Qb @ f0, dir_f(L + 'ForeArm', L + 'Hand')) @ Qb
            Qm = PZ.minima(Qa @ h0, dir_f(L + 'Hand', L + 'HandIndex1')) @ Qa
            # torção do antebraço: polegar para a frente na pose T (palma para baixo)
            eixo = dir_f(L + 'ForeArm', L + 'Hand')
            pol = Qm @ (self.esq.P_pega['pega' + l][:, 1])      # eixo Y da pega ~ do mínimo para o indicador
            alvo = np.array([0, 0, 1.0])
            a1 = norm(pol - eixo * (pol @ eixo))
            a2 = norm(alvo - eixo * (alvo @ eixo))
            ang = np.degrees(np.arctan2(np.dot(np.cross(a1, a2), eixo), np.dot(a1, a2)))
            T = PZ.rot(eixo, ang)
            Q['braco' + l] = Qb
            Q['antebraco' + l] = T @ Qa
            Q['mao' + l] = T @ Qm
            # perna e pé
            Q['coxa' + l] = PZ.minima(J['canela' + l] - J['coxa' + l], dir_f(L + 'UpLeg', L + 'Leg'))
            Q['canela' + l] = PZ.minima(J['pe' + l] - J['canela' + l], dir_f(L + 'Leg', L + 'Foot'))
            pe_d0 = J['dedos_pe' + l] - J['pe' + l]
            Q['pe' + l] = PZ.minima(pe_d0, dir_f(L + 'Foot', L + 'ToeBase'))
            Q['dedos_pe' + l] = Q['pe' + l]
        return Q

    def D(self, osso, t):
        nome = MAPA[osso]
        return self.f.G[t, self.f.idx[nome]] @ self.f.G0[self.f.idx[nome]].T

    def quadros(self, no_lugar=True, velocidade=None, chao=None, colar_pes=True, ajuste_pe=0.0):
        """Gera a sequência de poses (Rw, pos_quadril). `no_lugar`: tira o deslocamento
        horizontal (pela velocidade média, se `velocidade` não for dada, ou todo)."""
        f, esq, s = self.f, self.esq, self.s
        I = f.idx
        n = f.n
        y_chao = self.y_chao if chao is None else chao
        meio_src = 0.5 * (f.p('LeftUpLeg') + f.p('RightUpLeg'))
        # deslocamento horizontal a tirar
        if no_lugar == 'velocidade':
            v = (meio_src[-1] - meio_src[0]) / (n - 1)
            v[1] = 0
            desl = np.outer(np.arange(n), v) + meio_src[0] * np.array([1, 0, 1])
            self.vel_m_s = float(np.linalg.norm(v) * f.fps * s)
            self.dir_mov = norm(v)
        elif no_lugar:
            m = meio_src.mean(0)
            desl = np.tile(m * np.array([1, 0, 1]), (n, 1))
            self.vel_m_s = 0.0
        else:
            desl = np.zeros((n, 3))
            self.vel_m_s = 0.0
        meio_rep = 0.5 * (esq.J['coxa_e'] + esq.J['coxa_d'])
        sola = min(self.pe['calcanhar_e'][1], self.pe['bola_e'][1])
        poses = []
        for t in range(n):
            Rw = {}
            for o in MAPA:
                Rw[o] = self.D(o, t) @ self.Q[o]
            Rw['raiz'] = np.eye(3)
            # quadril: articulações do quadril onde estavam na captura (escala da perna)
            alvo_meio = (meio_src[t] - desl[t] - np.array([0, y_chao, 0])) * s + np.array([0, sola, 0])
            pos_q = alvo_meio + Rw['quadril'] @ (esq.J['quadril'] - meio_rep)
            P = esq.fk(Rw, pos_q)
            for l, L in LADO.items():
                quad = P['coxa' + l]
                tor_src = f.p(L + 'Foot')[t] - f.p(L + 'UpLeg')[t]
                alvo = quad + tor_src * s
                joelho_src = f.p(L + 'Leg')[t] - f.p(L + 'UpLeg')[t]
                polo = joelho_src - norm(tor_src) * np.dot(joelho_src, norm(tor_src))
                self.perna_ik(Rw, P, l, alvo, polo)
            Rw['pega_e'] = Rw['mao_e']
            Rw['pega_d'] = Rw['mao_d']
            poses.append((Rw, pos_q))
        if colar_pes:
            poses = self.pisar(poses, ajuste_pe)
        return poses

    def esticar_pernas(self, poses, alvo=4.0, pct=20, maximo=0.05):
        """Postura em pé: alguns atores da CMU ficam com os joelhos dobrados (~20°) e isso
        parece agachado. Sobe o quadril (um valor só para o laço inteiro, para não criar
        balanço) até a perna mais esticada ficar com ~`alvo` graus no quadro típico, e
        refaz as pernas por IK com os tornozelos e os pés onde estavam."""
        esq = self.esq
        ca = np.cos(np.radians(alvo))
        sobe = []
        for Rw, pq in poses:
            P = esq.fk(Rw, pq)
            r = []
            for l in LADO:
                l1, l2 = esq.comp['coxa' + l], esq.comp['canela' + l]
                d_alvo2 = l1 * l1 + l2 * l2 + 2 * l1 * l2 * ca
                v = P['pe' + l] - P['coxa' + l]
                disc = v[1] ** 2 + d_alvo2 - v @ v
                r.append(v[1] + np.sqrt(max(disc, 0.0)))
            sobe.append(min(r))
        dy = float(np.clip(np.percentile(sobe, pct), 0.0, maximo))
        self.subida_quadril = dy
        if dy < 1e-4:
            return poses
        novos = []
        for Rw, pq in poses:
            Rw = dict(Rw)
            P0 = esq.fk(Rw, pq)
            pq2 = pq + np.array([0.0, dy, 0.0])
            P = esq.fk(Rw, pq2)
            for l in LADO:
                alvo_t = P0['pe' + l]
                quad = P['coxa' + l]
                joelho = P0['canela' + l] + np.array([0.0, dy, 0.0])
                eixo = norm(alvo_t - quad)
                polo = (joelho - quad) - eixo * np.dot(joelho - quad, eixo)
                self.perna_ik(Rw, P, l, alvo_t, polo)
            novos.append((Rw, pq2))
        return novos

    def perna_ik(self, Rw, P, l, alvo_tornozelo, polo):
        esq = self.esq
        quad = P['coxa' + l]
        l1, l2 = esq.comp['coxa' + l], esq.comp['canela' + l]
        joelho = PZ.ik_dois(quad, alvo_tornozelo, l1, l2, polo)
        d_coxa = joelho - quad
        d_can = alvo_tornozelo - joelho
        eixo = np.cross(d_coxa, d_can)
        if np.linalg.norm(eixo) < 1e-6 * np.linalg.norm(d_coxa) * np.linalg.norm(d_can):
            eixo = np.cross(polo, d_coxa) if np.linalg.norm(polo) > 1e-9 else Rw['quadril'] @ np.array([1.0, 0, 0])
        # repouso: eixo do joelho = +X
        c0 = esq.J['canela' + l] - esq.J['coxa' + l]
        p0 = esq.J['pe' + l] - esq.J['canela' + l]
        Rw['coxa' + l] = PZ.alinhar(c0, np.array([1.0, 0, 0]), d_coxa, eixo)
        Rw['canela' + l] = PZ.alinhar(p0, np.array([1.0, 0, 0]), d_can, eixo)
        P['canela' + l] = joelho
        P['pe' + l] = alvo_tornozelo
        P['dedos_pe' + l] = alvo_tornozelo + Rw['pe' + l] @ (esq.J['dedos_pe' + l] - esq.J['pe' + l])

    def pontos_pe(self, Rw, P, l):
        """Calcanhar, bola e ponta no mundo para a pose."""
        J = self.esq.J
        R = Rw['pe' + l]
        cal = P['pe' + l] + R @ (self.pe['calcanhar' + l] - J['pe' + l])
        bola = P['pe' + l] + R @ (self.pe['bola' + l] - J['pe' + l])
        Rd = Rw['dedos_pe' + l]
        pon = P['dedos_pe' + l] + Rd @ (self.pe['ponta' + l] - J['dedos_pe' + l])
        return cal, bola, pon

    def pisar(self, poses, ajuste=0.0):
        """Ajusta a altura de cada tornozelo para o pé que está apoiado na captura ficar
        no chão (sola na altura do repouso) e nenhum ponto do pé entrar no chão."""
        f, s, esq = self.f, self.s, self.esq
        sola = min(self.pe['calcanhar_e'][1], self.pe['bola_e'][1])
        n = len(poses)
        novos = []
        # altura do pé de origem (ponto mais baixo entre tornozelo-6cm e dedos)
        for t, (Rw, pos_q) in enumerate(poses):
            P = esq.fk(Rw, pos_q)
            for l, L in LADO.items():
                cal, bola, pon = self.pontos_pe(Rw, P, l)
                baixo = min(cal[1], bola[1], pon[1])
                # quanto o pé de origem estava acima do chão
                y_src = self.altura_pe(l, t)
                # perto do chão o pé encosta (tira o tremido de 1–2 cm da captura); acima de ~4 cm
                # segue a captura
                hs = max(0.0, y_src * s)
                hs = hs * float(np.clip((hs - 0.008) / 0.03, 0.0, 1.0))
                alvo_baixo = sola + hs + ajuste
                dy = alvo_baixo - baixo
                if abs(dy) > 1e-5:
                    alvo = P['pe' + l] + np.array([0, dy, 0])
                    quad = P['coxa' + l]
                    joelho = P['canela' + l]
                    polo = joelho - quad - norm(alvo - quad) * np.dot(joelho - quad, norm(alvo - quad))
                    self.perna_ik(Rw, P, l, alvo, polo)
            novos.append((Rw, pos_q))
        return novos


def suavizar_poses(poses, iteracoes=1):
    """Média de cada rotação com os vizinhos no tempo (tira tremidas da captura)."""
    n = len(poses)
    for _ in range(iteracoes):
        novos = []
        for t in range(n):
            a, b = poses[(t - 1) % n], poses[(t + 1) % n]
            Rw = {}
            for o, R in poses[t][0].items():
                m = PZ.slerp_R(a[0][o], b[0][o], 0.5)
                Rw[o] = PZ.slerp_R(R, m, 0.5)
            p = 0.5 * poses[t][1] + 0.25 * (a[1] + b[1])
            novos.append((Rw, p))
        poses = novos
    return poses


def diferenca_poses(f, a, b, juntas=None):
    """Diferença entre dois quadros da captura (soma dos ângulos das rotações locais
    e das velocidades), sem contar o deslocamento horizontal."""
    if juntas is None:
        juntas = [f.idx[n] for n in MAPA.values()]
    d = 0.0
    for j in juntas:
        Ra, Rb = f.G[a, j], f.G[b, j]
        if j == f.idx['Hips']:
            # só a inclinação/rolagem e a guinada relativa importam
            pass
        c = np.clip((np.trace(Ra.T @ Rb) - 1) / 2, -1, 1)
        d += np.degrees(np.arccos(c))
        if a + 1 < f.n and b + 1 < f.n:
            Va = f.G[a + 1, j] @ Ra.T
            Vb = f.G[b + 1, j] @ Rb.T
            c = np.clip((np.trace(Va.T @ Vb) - 1) / 2, -1, 1)
            d += 3 * np.degrees(np.arccos(c))
    ha = f.P[a, f.idx['Hips'], 1]
    hb = f.P[b, f.idx['Hips'], 1]
    return d + 50 * abs(ha - hb) * (0.86 / f.perna)


def melhor_laco(f, ini_min, ini_max, dur_min, dur_max, passo=1):
    """Procura (a, b) com a pose de b o mais parecida possível com a de a."""
    melhor = (1e18, None, None)
    for a in range(ini_min, ini_max + 1, passo):
        for b in range(a + dur_min, min(a + dur_max, f.n - 2) + 1, passo):
            d = diferenca_poses(f, a, b)
            if d < melhor[0]:
                melhor = (d, a, b)
    return melhor
