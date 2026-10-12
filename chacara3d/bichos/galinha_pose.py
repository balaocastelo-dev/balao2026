"""Resolve uma pose da galinha/galo (parâmetros -> base de cada osso).

A cabeça pode ser posta por IK (alvo no espaço da armadura): é assim que a ave
segura a cabeça parada no ar enquanto o corpo avança e depois dá o "bote".
"""
import numpy as np
import esqueleto as E
from esqueleto import anat, norm, eixo_angulo, M4
import galinha_forma as gf
from galinha_forma import P

CIMA = np.array([0.0, 0.0, 1.0])


class PoseAve:
    def __init__(self, esq, galo=False):
        self.e = esq
        self.galo = galo
        self.ave = gf.GALO if galo else gf.GALINHA
        x = np.array([1.0, 0, 0])
        for s in ('e', 'd'):
            for n in (f'coxa_{s}', f'perna_{s}', f'canela_{s}'):
                esq.preparar_ik(n, x)
            for d in gf.DEDOS:
                n = f'dedo_{s}_{d}'
                r = esq.cau[n] - esq.cab[n]
                lat = np.cross(r, CIMA)
                esq.preparar_ik(n, norm(lat) if np.linalg.norm(lat) > 1e-9 else x)
        c, k = esq.cab, esq.cau
        tib = k['perna_e'] - c['perna_e']
        mt = k['canela_e'] - c['canela_e']
        self.kappa = -np.degrees(np.arctan2(np.dot(np.cross(norm(tib), norm(mt)), x), np.dot(norm(tib), norm(mt))))
        self.u_pe = k['canela_e'][2]
        # direções de repouso dos dedos (horizontais) por lado
        self.dedo_dir = {}
        for s in ('e', 'd'):
            for d in gf.DEDOS:
                n = f'dedo_{s}_{d}'
                self.dedo_dir[n] = norm(k[n] - c[n])
        self.cabeca_repouso = c['cabeca'].copy()

    def repouso(self):
        p = dict(corpo=(0.0, 0.0, 0.0), corpo_rot=(0.0, 0.0, 0.0),
                 pescoco=[(0.0, 0.0, 0.0)] * 3, cabeca=(0.0, 0.0, 0.0),
                 cabeca_alvo=None, cabeca_mundo=None,
                 boca=0.0, crista=(0.0, 0.0), barbela=(0.0, 0.0),
                 asas={'e': (0.0, 0.0, 0.0), 'd': (0.0, 0.0, 0.0)},
                 cauda=(0.0, 0.0, 0.0), cauda_ponta=(0.0, 0.0), patas={})
        for s in ('e', 'd'):
            p['patas'][s] = dict(alvo=self.e.cau[f'canela_{s}'].copy(), kappa=self.kappa, curva=0.0, guinada=0.0)
        return p

    # ---- pescoço por IK
    def _fk_pescoco(self, pose, bases, angs):
        for i in range(3):
            a, g = angs[2 * i], angs[2 * i + 1]
            self.e.fk(f'pescoco_{i + 1}', pose, bases, anat(a, g, 0.0))
        return self.e.cau['pescoco_3'] if False else pose['pescoco_3'][:3, 3] + pose['pescoco_3'][:3, 1] * self.e.comp['pescoco_3']

    def resolver_pescoco(self, pose, bases, alvo, pref):
        th = np.array(pref, dtype=float)
        pref = np.array(pref, dtype=float)
        lam = 4e-8      # amortecimento (unidades: m/grau ao quadrado)
        for _ in range(40):
            fim = self._fk_pescoco(pose, bases, th)
            erro = alvo - fim
            if np.linalg.norm(erro) < 2e-5:
                break
            Jm = np.zeros((3, 6))
            for k in range(6):
                t2 = th.copy()
                t2[k] += 0.5
                Jm[:, k] = (self._fk_pescoco(pose, bases, t2) - fim) / 0.5
            A = Jm.T @ Jm + lam * np.eye(6)
            b = Jm.T @ erro - lam * 0.5 * (th - pref)
            passo = np.linalg.solve(A, b)
            th = th + np.clip(passo, -25.0, 25.0)
        self._fk_pescoco(pose, bases, th)
        return th

    def resolver(self, p):
        e = self.e
        pose, bases = {}, {}
        e.fk('raiz', pose, bases)
        df, dl, du = p['corpo']
        e.fk('corpo', pose, bases, anat(*p['corpo_rot']), desloc=P(df, dl, du))
        if p.get('cabeca_alvo') is not None:
            pref = []
            for r in p['pescoco']:
                pref += [r[0], r[1]]
            self.resolver_pescoco(pose, bases, np.asarray(p['cabeca_alvo'], dtype=float), pref)
        else:
            for i, r in enumerate(p['pescoco']):
                e.fk(f'pescoco_{i + 1}', pose, bases, anat(*r))
        if p.get('cabeca_mundo') is not None:
            # orientação da cabeça no mundo (arfagem, guinada, rolagem em relação ao repouso)
            R = anat(*p['cabeca_mundo']) @ e.rep['cabeca'][:3, :3]
            org = e.carregado('cabeca', pose)[:3, 3]
            e.por_mundo('cabeca', pose, bases, M4(R, org))
        else:
            e.fk('cabeca', pose, bases, anat(*p['cabeca']))
        e.fk('mandibula', pose, bases, anat(-p['boca']))
        cr, cl = p['crista']
        e.fk('crista', pose, bases, anat(cr, 0.0, cl))
        br, bl = p['barbela']
        e.fk('barbela', pose, bases, anat(br, 0.0, bl))
        ca, cg, cro = p['cauda']
        e.fk('cauda', pose, bases, anat(-ca, cg, cro))
        pa, pg = p['cauda_ponta']
        e.fk('cauda_ponta', pose, bases, anat(-pa, pg, 0.0))
        for s, lado in (('e', 1), ('d', -1)):
            abre, ergue, ponta = p['asas'][s]
            # abre: a borda de baixo afasta do corpo (gira em torno do eixo do corpo);
            # ergue: a asa sobe de lado (bater de asas); ponta: as primárias abrem para fora
            R = anat(-0.25 * ergue, -0.15 * ergue * lado, (abre + ergue) * lado)
            e.fk(f'asa_{s}', pose, bases, R)
            e.fk(f'asa_{s}_ponta', pose, bases, anat(0.0, -ponta * lado, 0.4 * ponta * lado))
        esq_corpo = pose['corpo'][:3, :3] @ e.rep['corpo'][:3, :3].T @ np.array([1.0, 0, 0])
        for s in ('e', 'd'):
            self.perna(pose, bases, s, p['patas'][s], esq_corpo)
        return pose, bases

    def perna(self, pose, bases, s, spec, n):
        e = self.e
        o1, o2, o3 = f'coxa_{s}', f'perna_{s}', f'canela_{s}'
        A = e.carregado(o1, pose)[:3, 3]
        T = np.asarray(spec['alvo'], dtype=float)
        l1, l2, l3 = e.comp[o1], e.comp[o2], e.comp[o3]
        dobra = P(1, 0, 0)
        R_k = eixo_angulo(n, -spec['kappa'])
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
        # dedos: deitados no chão (girados pela guinada do pé) ou encolhidos no ar
        gu = spec.get('guinada', 0.0)
        Rg = eixo_angulo(CIMA, gu)
        c = np.radians(spec.get('curva', 0.0))
        for d in gf.DEDOS:
            nome = f'dedo_{s}_{d}'
            r = Rg @ self.dedo_dir[nome]
            h = r - CIMA * r[2]
            h = norm(h)
            desce = np.arcsin(np.clip(-r[2], -1, 1))
            fator = 1.0 if d != 'tras' else 0.6
            ang = desce + c * fator
            dd = h * np.cos(ang) - CIMA * np.sin(ang)
            lat = np.cross(h, CIMA)
            e.osso_apontando(nome, pose, bases, T, dd, norm(lat))
