"""Resolve uma pose do cachorro (parâmetros anatômicos -> base de cada osso)."""
import numpy as np
import esqueleto as E
from esqueleto import anat, norm, eixo_angulo, M4
from cachorro_forma import P, junta

LEGS_F = ('fe', 'fd')
LEGS_T = ('te', 'td')


def ang_entre(a, b, normal):
    """Ângulo assinado de `a` para `b` girando em torno de `normal` (graus)."""
    a, b = norm(a), norm(b)
    return np.degrees(np.arctan2(np.dot(np.cross(a, b), normal), np.dot(a, b)))


class PoseCachorro:
    def __init__(self, esq):
        self.e = esq
        lado_x = np.array([1.0, 0, 0])
        for s in ('e', 'd'):
            for n in (f'braco_f{s}', f'antebraco_f{s}', f'metacarpo_f{s}', f'dedos_f{s}',
                      f'coxa_t{s}', f'perna_t{s}', f'metatarso_t{s}', f'dedos_t{s}'):
                esq.preparar_ik(n, lado_x)
        for i in range(5):
            esq.preparar_ik(f'cauda_{i + 1}', lado_x)
        c, k = esq.cab, esq.cau
        # ângulos de repouso (toes-forward positivo = girar para a frente em torno de +X com sinal -)
        ante = k['antebraco_fe'] - c['antebraco_fe']
        meta = k['metacarpo_fe'] - c['metacarpo_fe']
        self.kappa_carpo = -ang_entre(ante, meta, lado_x)
        tib = k['perna_te'] - c['perna_te']
        mt = k['metatarso_te'] - c['metatarso_te']
        self.kappa_jarrete = -ang_entre(tib, mt, lado_x)
        self.dedos_f = self.ang_chao(k['dedos_fe'] - c['dedos_fe'])
        self.dedos_t = self.ang_chao(k['dedos_te'] - c['dedos_te'])

    @staticmethod
    def ang_chao(v):
        """Ângulo abaixo da horizontal (graus) de um vetor que aponta para a frente."""
        return np.degrees(np.arctan2(-v[2], -v[1]))

    def repouso(self):
        """Parâmetros da pose em pé (todos neutros)."""
        p = dict(corpo=(0.0, 0.0, 0.0), corpo_rot=(0.0, 0.0, 0.0),
                 coluna=[(0.0, 0.0, 0.0)] * 3, pescoco=[(0.0, 0.0, 0.0)] * 2, cabeca=(0.0, 0.0, 0.0),
                 boca=0.0, lingua=(0.0, 0.0, 0.0), cauda=[(0.0, 0.0, 0.0)] * 5,
                 orelhas={'e': (0.0, 0.0, 0.0, 0.0), 'd': (0.0, 0.0, 0.0, 0.0)},
                 escapula={'e': 0.0, 'd': 0.0}, patas={})
        c = self.e.cau
        for s in ('e', 'd'):
            p['patas']['f' + s] = dict(alvo=c['metacarpo_f' + s].copy(), kappa=self.kappa_carpo,
                                       dedos=self.dedos_f, frente=P(1, 0, 0))
            p['patas']['t' + s] = dict(alvo=c['metatarso_t' + s].copy(), kappa=self.kappa_jarrete,
                                       dedos=self.dedos_t, frente=P(1, 0, 0))
        return p

    def resolver(self, p):
        e = self.e
        pose, bases = {}, {}
        e.fk('raiz', pose, bases)
        df, dl, du = p['corpo']
        e.fk('quadril', pose, bases, anat(*p['corpo_rot']), desloc=P(df, dl, du))
        for i, r in enumerate(p['coluna']):
            e.fk(f'coluna_{i + 1}', pose, bases, anat(*r))
        for i, r in enumerate(p['pescoco']):
            e.fk(f'pescoco_{i + 1}', pose, bases, anat(*r))
        e.fk('cabeca', pose, bases, anat(*p['cabeca']))
        e.fk('mandibula', pose, bases, anat(-p['boca']))
        lf, lp, lu = p['lingua']
        # a língua desliza para a frente (eixos do crânio em repouso) e cai na ponta
        Rr = e.rep['cabeca'][:3, :3]
        e.fk('lingua', pose, bases, anat(lp), desloc=Rr[:, 1] * lf + Rr[:, 2] * lu)
        for s in ('e', 'd'):
            a, g, r, ponta = p['orelhas'][s]
            # arfagem > 0 inclina a orelha para a frente; < 0 deita para trás
            e.fk(f'orelha_{s}', pose, bases, anat(-a, g, r))
            e.fk(f'orelha_{s}_ponta', pose, bases, anat(-ponta))
        modo = p.get('cauda_modo', 'fk')
        if modo == 'fk':
            for i, r in enumerate(p['cauda']):
                # arfagem > 0 levanta a cauda (o osso aponta para trás)
                e.fk(f'cauda_{i + 1}', pose, bases, anat(-r[0], r[1], r[2]))
        else:
            self.cauda_mundo(pose, bases, p)
        # eixo lateral do corpo (esquerda) em cada cintura
        esq_peito = pose['coluna_2'][:3, :3] @ e.rep['coluna_2'][:3, :3].T @ np.array([1.0, 0, 0])
        esq_quadril = pose['quadril'][:3, :3] @ e.rep['quadril'][:3, :3].T @ np.array([1.0, 0, 0])
        for s in ('e', 'd'):
            e.fk(f'escapula_f{s}', pose, bases, anat(p['escapula'][s]))
            self.perna(pose, bases, f'f{s}', p['patas'][f'f{s}'], esq_peito, frente=True)
            self.perna(pose, bases, f't{s}', p['patas'][f't{s}'], esq_quadril, frente=False)
        return pose, bases

    def perna(self, pose, bases, perna, spec, n, frente):
        e = self.e
        s = perna[1]
        if frente:
            o1, o2, o3, o4 = f'braco_f{s}', f'antebraco_f{s}', f'metacarpo_f{s}', f'dedos_f{s}'
            dobra = P(-1, 0, 0)   # cotovelo para trás
        else:
            o1, o2, o3, o4 = f'coxa_t{s}', f'perna_t{s}', f'metatarso_t{s}', f'dedos_t{s}'
            dobra = P(1, 0, 0)    # joelho para a frente
        A = e.carregado(o1, pose)[:3, 3]
        T = np.asarray(spec['alvo'], dtype=float)
        l1, l2, l3 = e.comp[o1], e.comp[o2], e.comp[o3]
        if spec.get('dir3') is not None:
            # direção do terceiro osso dada no mundo (sentado, deitado)
            d3 = norm(np.asarray(spec['dir3'], dtype=float))
            W = T - l3 * d3
            M = E.ik_dois(A, W, l1, l2, n, dobra)
        else:
            kappa = spec['kappa']
            R_k = eixo_angulo(n, -kappa)
            d2 = norm(T - A)
            for _ in range(6):
                d3 = R_k @ d2
                W = T - l3 * d3
                M = E.ik_dois(A, W, l1, l2, n, dobra)
                d2 = norm(W - M)
            d3 = R_k @ d2
            W = T - l3 * d3
        e.osso_apontando(o1, pose, bases, A, M - A, n)
        e.osso_apontando(o2, pose, bases, M, W - M, n)
        e.osso_apontando(o3, pose, bases, W, T - W, n)
        # dedos: ângulo dado em relação ao chão, na direção "frente" (horizontal)
        fr = norm(np.asarray(spec.get('frente', P(1, 0, 0)), dtype=float))
        a = np.radians(spec['dedos'])
        d4 = fr * np.cos(a) - np.array([0, 0, 1.0]) * np.sin(a)
        e.osso_apontando(o4, pose, bases, T, d4, n)

    def cauda_mundo(self, pose, bases, p):
        """Cauda por direções no mundo: 'mundo' (dadas) ou 'chao' (deitada no chão, curvando)."""
        from cachorro_forma import RAIOS_CAUDA
        e = self.e
        cima = np.array([0.0, 0.0, 1.0])
        pos = e.carregado('cauda_1', pose)[:3, 3]
        if p['cauda_modo'] == 'chao':
            Rq = pose['quadril'][:3, :3] @ e.rep['quadril'][:3, :3].T
            h = Rq @ np.array([0.0, 1.0, 0.0])
            h[2] = 0.0
            h = norm(h)
        for i in range(5):
            nome = f'cauda_{i + 1}'
            L = e.comp[nome]
            if p['cauda_modo'] == 'mundo':
                d = norm(p['cauda_dirs'][i])
            else:
                guin = p['cauda_chao'][i]
                h = eixo_angulo(cima, guin) @ h
                alvo_z = RAIOS_CAUDA[i + 1] + 0.003 + p.get('cauda_chao_alt', [0.0] * 5)[i]
                dz = np.clip(alvo_z - pos[2], -0.97 * L, 0.97 * L)
                d = norm(h * np.sqrt(L * L - dz * dz) + cima * dz)
            nrm = np.cross(d, cima)
            nrm = norm(nrm) if np.linalg.norm(nrm) > 1e-6 else np.array([1.0, 0, 0])
            e.osso_apontando(nome, pose, bases, pos, d, nrm)
            pos = pos + d * L

    def direcoes_cauda(self, pose):
        return [pose[f'cauda_{i + 1}'][:3, 1].copy() for i in range(5)]
