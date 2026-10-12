"""Animações a partir da captura de movimento (trechos dos BVH em `cmu/`).

Cada trecho é recortado, vira laço (mistura do fim com o que vinha antes do começo),
é transferido para o esqueleto da pessoa e fica no lugar (o motor desloca a pessoa).
"""
import os

import numpy as np

import pose as PZ
import retarget as RT

AQUI = os.path.dirname(os.path.abspath(__file__))
PASTA_CMU = os.environ.get('CMU_DADOS', os.path.join(AQUI, 'cmu'))


def caminho_cmu(nome):
    """`35_01` -> arquivo (aceita o recorte guardado em cmu/ ou a cópia completa)."""
    for c in (os.path.join(PASTA_CMU, nome + '.bvh.gz'), os.path.join(PASTA_CMU, nome + '.bvh')):
        if os.path.exists(c):
            return c
    s = int(nome.split('_')[0])
    return os.path.join(PASTA_CMU, f'{s:03d}', nome + '.bvh')


def de_captura(ctx, nome, a, b, mistura=8, modo='parado', ajuste=None, suavizar=1, inverter=False):
    """Poses (Rw, pos_quadril) do trecho [a, b) (quadros a 30 qps, contados depois da
    pose T). `modo`: 'velocidade' (anda: tira o avanço médio) ou 'parado' (tira o
    deslocamento médio)."""
    f = RT.Fonte(caminho_cmu(nome))
    f.recortar(a - mistura, b)
    if mistura:
        f.fechar_laco(mistura)
    if inverter:
        espelhar_fonte(f)
    rt = RT.Retarget(ctx.esq, ctx.pe, f)
    poses = rt.quadros(no_lugar=modo)
    if suavizar:
        poses = RT.suavizar_poses(poses, suavizar)
        poses = rt.pisar(poses)
    if modo == 'parado':
        poses = rt.esticar_pernas(poses)
    if modo == 'velocidade':
        # gira tudo para o avanço ficar em +Z
        d = rt.dir_mov
        giro = np.degrees(np.arctan2(d[0], d[2]))
        poses = girar(poses, -giro)
    else:
        giro = rumo_medio(poses)
        poses = girar(poses, -giro)
    ctx.ultima_velocidade = rt.vel_m_s
    return poses, rt.vel_m_s


def rumo_medio(poses):
    """Para onde o quadril aponta em média (graus em volta de Y; 0 = +Z)."""
    s = np.zeros(2)
    for Rw, _ in poses:
        z = Rw['quadril'][:, 2]
        s += [z[0], z[2]]
    return np.degrees(np.arctan2(s[0], s[1]))


def girar(poses, graus):
    R = PZ.Ry(graus)
    out = []
    for Rw, p in poses:
        Rn = {o: (R @ M if o != 'raiz' else M) for o, M in Rw.items()}
        out.append((Rn, R @ p))
    return out


def espelhar_fonte(f):
    """Troca esquerda e direita da captura (espelho em X)."""
    S = np.diag([-1.0, 1, 1])
    nomes = f.b.nomes
    troca = []
    for n in nomes:
        if n.startswith('Left'):
            troca.append(f.idx['Right' + n[4:]])
        elif n.startswith('Right'):
            troca.append(f.idx['Left' + n[5:]])
        elif n.startswith('LHip'):
            troca.append(f.idx['RHipJoint'])
        elif n.startswith('RHip'):
            troca.append(f.idx['LHipJoint'])
        elif n == 'LThumb':
            troca.append(f.idx['RThumb'])
        elif n == 'RThumb':
            troca.append(f.idx['LThumb'])
        else:
            troca.append(f.idx[n])
    troca = np.array(troca)
    f.G = np.einsum('ij,ntjk,kl->ntil', S, f.G[:, troca], S)
    f.P = f.P[:, troca] * np.array([-1, 1, 1])
    f.G0 = np.einsum('ij,tjk,kl->til', S, f.G0[troca], S)
    f.P0 = f.P0[troca] * np.array([-1, 1, 1])
