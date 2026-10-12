"""Galinha caipira e galo: montagem da malha, máscaras de cor, esqueleto e pesos."""
import numpy as np
import bpy
import bmesh

import sdf
import cena
import esqueleto as E
import galinha_forma as gf
from galinha_forma import P, J, suave

ORCAMENTO = {'galinha': 4500, 'galo': 5500}
TRIS_CORPO = {'galinha': 2500, 'galo': 2550}

# cores de base (sRGB)
CORES = {
    'galinha': dict(principal=(0.55, 0.26, 0.11), secundaria=(0.16, 0.10, 0.06), crista=(0.78, 0.10, 0.08),
                    bico_pernas=(0.92, 0.72, 0.25), olho=(0.55, 0.30, 0.05)),
    'galo': dict(principal=(0.80, 0.33, 0.08), secundaria=(0.06, 0.09, 0.06), crista=(0.82, 0.08, 0.06),
                 bico_pernas=(0.93, 0.74, 0.26), olho=(0.60, 0.32, 0.05)),
}


def ave_de(galo):
    return gf.GALO if galo else gf.GALINHA


def lista_ossos(ave):
    from esqueleto import Osso
    frente = P(1, 0, 0)
    cima = P(0, 0, 1)
    j = lambda n, l=1: J(ave, n, l)  # noqa: E731
    os_ = [Osso('raiz', None, P(0, 0, 0), P(0.10, 0, 0), cima, deforma=False),
           Osso('corpo', 'raiz', j('corpo'), j('corpo_frente'), cima),
           Osso('pescoco_1', 'corpo', j('pescoco_0'), j('pescoco_1'), frente),
           Osso('pescoco_2', 'pescoco_1', j('pescoco_1'), j('pescoco_2'), frente, conectado=True),
           Osso('pescoco_3', 'pescoco_2', j('pescoco_2'), j('cabeca'), frente, conectado=True),
           Osso('cabeca', 'pescoco_3', j('cabeca'), j('bico_ponta'), cima, conectado=True),
           Osso('mandibula', 'cabeca', j('mandibula'), j('mandibula_ponta'), cima),
           Osso('crista', 'cabeca', gf.cabeca_centro(ave) + P(0.0, 0, 0.012), gf.cabeca_centro(ave) + P(0.0, 0, 0.04),
                frente),
           Osso('barbela', 'cabeca', gf.cabeca_centro(ave) + P(0.018, 0, -0.012), gf.cabeca_centro(ave) + P(0.018, 0, -0.04),
                frente),
           Osso('cauda', 'corpo', j('cauda'), j('cauda_meio'), frente),
           Osso('cauda_ponta', 'cauda', j('cauda_meio'), j('cauda_fim'), frente, conectado=True)]
    for s, l in (('e', 1), ('d', -1)):
        os_ += [Osso(f'asa_{s}', 'corpo', j('ombro', l), j('pulso', l), cima),
                Osso(f'asa_{s}_ponta', f'asa_{s}', j('pulso', l), j('asa_fim', l), cima, conectado=True),
                Osso(f'coxa_{s}', 'corpo', j('anca', l), j('joelho', l), frente),
                Osso(f'perna_{s}', f'coxa_{s}', j('joelho', l), j('jarrete', l), frente, conectado=True),
                Osso(f'canela_{s}', f'perna_{s}', j('jarrete', l), j('pe', l), frente, conectado=True)]
        for d in gf.DEDOS:
            os_.append(Osso(f'dedo_{s}_{d}', f'canela_{s}', j('pe', l), gf.ponta_dedo(ave, d, l), cima))
    return os_


def ossos_por_regiao():
    # o pescoço vira uma coluna só aqui e é redistribuído ao longo da linha dele depois
    r = {'corpo': ['corpo'], 'pescoco': ['pescoco_2'], 'cabeca': ['cabeca']}
    for s in ('e', 'd'):
        r[f'coxa_{s}'] = ['corpo', f'coxa_{s}']
        r[f'perna_{s}'] = ['corpo', f'coxa_{s}', f'perna_{s}']
    return r


def mascara_corpo(ave, v):
    """G (secundária) e A (brilho) nas penas do corpo."""
    a = np.stack([-v[:, 1], v[:, 0], v[:, 2]], axis=1)
    f, l, u = a[:, 0], a[:, 1], a[:, 2]
    p0 = J(ave, 'pescoco_0')
    pc = J(ave, 'cabeca')
    if ave['galo']:
        # galo: secundária (verde-escuro) no peito, barriga, coxas; principal (laranja) no dorso e pescoço
        d_ = normalizar_(pc - p0)
        alt_pesc = (v - p0[None]) @ d_
        G = suave(0.0, -0.03, (u - (0.33 + 0.80 * np.clip(f, -0.2, 0.15))))
        G = np.maximum(G, suave(-0.02, -0.06, u - 0.30) * suave(0.10, 0.06, f))
        G = G * suave(0.01, -0.02, alt_pesc)
        cauda = suave(-0.11, -0.15, f) * suave(0.34, 0.38, u)
        G = np.maximum(G, cauda)
        A = 0.5 * G
    else:
        cauda = suave(-0.10, -0.14, f) * suave(0.26, 0.30, u)
        d_ = normalizar_(pc - p0)
        alt_pesc = (v - p0[None]) @ d_
        G = np.maximum(cauda, 0.25 * suave(0.0, 0.03, alt_pesc))
        A = np.zeros(len(v))
    return np.clip(G, 0, 1), A


def redistribuir_pescoco(ave, v, nomes, W):
    todos = sorted(set(nomes) | {'corpo', 'pescoco_1', 'pescoco_2', 'pescoco_3', 'cabeca'})
    W2 = np.zeros((len(v), len(todos)))
    for j, n in enumerate(nomes):
        if n != 'pescoco_2':
            W2[:, todos.index(n)] += W[:, j]
    wp = W[:, nomes.index('pescoco_2')]
    for i, d in enumerate(gf.pesos_pescoco(ave, v)):
        tot = sum(d.values())
        for n, x in d.items():
            W2[i, todos.index(n)] += wp[i] * x / tot
    return todos, W2


def normalizar_(v):
    return v / np.linalg.norm(v)


def construir(galo=False, passo=0.0018):
    ave = ave_de(galo)
    nome = ave['nome']
    F = gf.forma(ave)
    cmin, cmax = gf.caixa(ave)
    v, q = sdf.extrair(F, cmin, cmax, passo)
    corpo = cena.malha_rapida(nome, v, q)
    cena.reduzir(corpo, TRIS_CORPO[nome])
    tris, arestas = cena.tris_e_arestas(corpo)
    vr = sdf.relaxar(F, cena.coords(corpo), arestas, iteracoes=2, lam=0.25)
    cena.por_coords(corpo, vr)
    cena.limpar_dobras(corpo, F)
    cena.sombrear_suave(corpo)
    cena.normais_personalizadas(corpo, F.gradiente(cena.coords(corpo)))

    arm = E.criar_armadura(nome + '_esqueleto', lista_ossos(ave))
    esq = E.Esqueleto(arm)
    seg = {n: (esq.cab[n], esq.cau[n]) for n in esq.nomes}

    partes = []   # (objeto, material, rgba, (nomes, W))

    def pesos_de_dicts(lista):
        nomes = sorted({k for d in lista for k in d})
        W = np.array([[d.get(n, 0.0) for n in nomes] for d in lista])
        return nomes, W

    # corpo
    vc = cena.coords(corpo)
    nomes, W = E.pesos_regioes(vc, F.distancias_por_regiao(vc), ossos_por_regiao(), seg, tau=0.005, potencia=4.0)
    nomes, W = redistribuir_pescoco(ave, vc, nomes, W)
    W = E.suavizar_pesos(corpo, W, iteracoes=2, alfa=0.5)
    G, A = mascara_corpo(ave, vc)
    partes.append((corpo, 'penas', np.stack([1 - G, G, 0 * G, A], axis=1), (nomes, W)))
    # pernas
    for s, l in (('e', 1), ('d', -1)):
        pv, pf, pw = gf.perna_malha(ave, l, s)
        ob = cena.malha('perna', pv, pf)
        partes.append((ob, 'bico_pernas', np.zeros((len(pv), 4)), pesos_de_dicts(pw)))
    # bico
    bv, bf, bw = gf.bico_malha(ave)
    partes.append((cena.malha('bico', bv, bf), 'bico_pernas', np.zeros((len(bv), 4)), pesos_de_dicts(bw)))
    # crista, barbelas, orelhas, face
    cv, cf_, cw = gf.crista_malha(ave)
    partes.append((cena.malha('crista', cv, cf_), 'crista', np.zeros((len(cv), 4)), pesos_de_dicts(cw)))
    av, af, aw = gf.barbelas_malha(ave)
    partes.append((cena.malha('barbelas', av, af), 'crista', np.zeros((len(av), 4)), pesos_de_dicts(aw)))
    s_ = ave['cabeca_esc']
    for l in (1, -1):
        c, R = olho_na_superficie(ave, F, l)
        # pele vermelha da face em volta do olho e o olho por cima
        fv, ff = gf.elipsoide_malha(c - R[:, 0] * 0.0018 * s_, np.array([0.0030, 0.0125, 0.0100]) * s_, R, seg=8, aneis=5)
        partes.append((cena.malha('face', fv, ff), 'crista', np.zeros((len(fv), 4)), (['cabeca'], np.ones((len(fv), 1)))))
        ev, ef = gf.elipsoide_malha(c, np.array([0.0040, 0.0050, 0.0050]) * s_, R, seg=8, aneis=5)
        partes.append((cena.malha('olho', ev, ef), 'olho', np.zeros((len(ev), 4)), (['cabeca'], np.ones((len(ev), 1)))))
    # asas
    for s, l in (('e', 1), ('d', -1)):
        wv, wf, ww, wg = gf.asa_malha(ave, F, l, s)
        rgba = np.stack([1 - wg, wg, 0 * wg, (0.6 * wg if galo else 0 * wg)], axis=1)
        partes.append((cena.malha('asa', wv, wf), 'penas', rgba, pesos_de_dicts(ww)))
    # cauda (+ foices)
    tv, tf, tw, tg, ta = gf.cauda_malha(ave)
    partes.append((cena.malha('cauda', tv, tf), 'penas', np.stack([1 - tg, tg, 0 * tg, ta if galo else 0 * ta], axis=1),
                   pesos_de_dicts(tw)))
    # capa do pescoço e selim (só no galo: as penas compridas e pontudas dele)
    if galo:
        kv, kf, kw, kg = gf.capa_malha(ave, F)
        kg = 0.0 * kg      # capa e selim na cor principal (laranja)
        partes.append((cena.malha('capa', kv, kf), 'penas', np.stack([1 - kg, kg, 0 * kg, 0 * kg], axis=1),
                       pesos_de_dicts(kw)))

    c = CORES[nome]
    mats = {'penas': cena.material('penas', cena.lin_srgb(c['principal']), 0.75),
            'crista': cena.material('crista', cena.lin_srgb(c['crista']), 0.5),
            'bico_pernas': cena.material('bico_pernas', cena.lin_srgb(c['bico_pernas']), 0.45),
            'olho': cena.material('olho', cena.lin_srgb(c['olho']), 0.08, especular=0.8)}
    mats['penas'].use_backface_culling = False      # folhas de penas: dois lados
    for m in ('crista', 'bico_pernas', 'olho'):
        mats[m].use_backface_culling = True
    objs = []
    for ob, mat, rgba, (nomes_p, Wp) in partes:
        if ob is not corpo:
            acertar_normais(ob, fechada=(mat != 'penas'))
            cena.sombrear_suave(ob)
        ob.data.materials.clear()
        ob.data.materials.append(mats[mat])
        cena.cor_vertice(ob, rgba)
        E.aplicar_pesos(ob, nomes_p, E.limitar_pesos(np.asarray(Wp, dtype=float), 4))
        objs.append(ob)
    final = cena.juntar(objs, nome)
    E.ligar_armadura(final, arm)
    return final, arm, F


def olho_na_superficie(ave, F, lado):
    """Centro do olho logo abaixo da pele e um referencial (normal, frente, cima)."""
    s = ave['cabeca_esc']
    ch = gf.cabeca_centro(ave)
    d = normalizar_(P(0.42, 1.0 * lado, 0.30))
    origem = ch + P(0.004, 0, 0.002) * s
    r = gf.superficie_raio(F, origem, d[None])[0]
    c = origem + d * (r - 0.0012 * s)
    n = d
    fr = P(1, 0, 0) - n * np.dot(P(1, 0, 0), n)
    fr = fr / np.linalg.norm(fr)
    cm = np.cross(n, fr) * lado
    return c, np.stack([n, fr, cm], axis=1)


def acertar_normais(ob, fechada=True):
    if not fechada:
        return
    bm = bmesh.new()
    bm.from_mesh(ob.data)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(ob.data)
    bm.free()


def _hex(c):
    return '#' + ''.join(f'{int(round(x * 255)):02x}' for x in c)


def descricao(galo=False):
    c = CORES['galo' if galo else 'galinha']
    if galo:
        mascara = {
            'R': 'plumagem principal (vermelho-alaranjado): capa do pescoço, dorso e ombros das asas '
                 '(os ombros têm G ~0,45 para sair um vermelho mais escuro)',
            'G': 'plumagem secundária (preto-esverdeado): peito, barriga, coxas, rêmiges das asas, cauda e foices',
            'B': '0',
            'A': 'brilho/iridescência das penas: 1 nas foices e na cauda, ~0,5 no peito, 0 no resto',
            'obs': 'no galo a capa do pescoço fica no R porque é laranja e a cauda (G) é preta-esverdeada',
        }
        desc = 'galo caipira (~0,55 m até o alto da crista), crista serrilhada grande, barbelas compridas, foices e esporões'
    else:
        mascara = {
            'R': 'plumagem principal (castanho-avermelhado): corpo, peito, dorso, coberteiras das asas',
            'G': 'plumagem secundária (escura): cauda, rêmiges das asas; o pescoço tem G ~0,25 (um pouco mais escuro)',
            'B': '0',
            'A': '0',
        }
        desc = 'galinha caipira vermelha (~0,38 m até o alto da crista), crista simples pequena e barbelas'
    return dict(
        descricao=desc,
        materiais_info={
            'penas': {'COLOR_0': mascara,
                      'lados': ('dois lados (asas, cauda, foices e capa do pescoço são folhas de penas)' if galo
                                else 'dois lados (asas e cauda são folhas de penas)')},
            'crista': 'crista, barbelas, lóbulos e a pele vermelha da face',
            'bico_pernas': 'bico, canelas e dedos (amarelo)',
            'olho': 'olhos',
        },
        cores_sugeridas_srgb={'principal': _hex(c['principal']), 'secundaria': _hex(c['secundaria']),
                              'crista': _hex(c['crista']), 'bico_pernas': _hex(c['bico_pernas']), 'olho': _hex(c['olho'])},
    )


def medidas(galo, F):
    """Medidas tiradas da forma e das peças (em metros)."""
    ave = ave_de(galo)
    cv, _, _ = gf.crista_malha(ave)
    c = P(*ave['corpo_c'])
    frente = gf.superficie_raio(F, c, P(1.0, 0, 0)[None], r_max=0.3)[0]
    d = P(-1.0, 0, 0.25)
    d = d / np.linalg.norm(d)
    tras = gf.superficie_raio(F, c, d[None], r_max=0.3)[0]
    corpo = (c[1] * -1 + frente) - (c[1] * -1 + d[1] * -1 * tras)
    return {'altura_ate_crista': round(float(cv[:, 2].max()), 3), 'corpo_peito_ate_uropigio': round(float(corpo), 3)}
