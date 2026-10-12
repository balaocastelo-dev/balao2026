"""O esqueleto das pessoas (igual nos três arquivos) e a redução do esqueleto do MakeHuman.

Todos os ossos têm rotação de repouso identidade (eixos do glTF: X = esquerda da
pessoa, Y = cima, Z = frente), menos `pega_e`/`pega_d`, cujo repouso é o quadro da
pegada (ver `quadro_pega`). Assim a rotação local de cada osso numa animação é a
rotação no espaço do pai, e no repouso os eixos de todos coincidem com o mundo.
"""
import numpy as np

# nome -> pai
PAIS = {
    'raiz': None,
    'quadril': 'raiz',
    'coluna_1': 'quadril',
    'coluna_2': 'coluna_1',
    'peito': 'coluna_2',
    'pescoco': 'peito',
    'cabeca': 'pescoco',
    'clavicula_e': 'peito', 'braco_e': 'clavicula_e', 'antebraco_e': 'braco_e', 'mao_e': 'antebraco_e', 'pega_e': 'mao_e',
    'clavicula_d': 'peito', 'braco_d': 'clavicula_d', 'antebraco_d': 'braco_d', 'mao_d': 'antebraco_d', 'pega_d': 'mao_d',
    'coxa_e': 'quadril', 'canela_e': 'coxa_e', 'pe_e': 'canela_e', 'dedos_pe_e': 'pe_e',
    'coxa_d': 'quadril', 'canela_d': 'coxa_d', 'pe_d': 'canela_d', 'dedos_pe_d': 'pe_d',
}
NOMES = list(PAIS)
INDICE = {n: i for i, n in enumerate(NOMES)}
SEM_PESO = ('raiz', 'pega_e', 'pega_d')
DEFORMA = [n for n in NOMES if n not in SEM_PESO]

# osso do MakeHuman -> nosso osso (os pesos dos cortados são somados)
def mapa_mh(nome):
    n = nome
    lado = ''
    if n.endswith('.L'):
        lado, n = '_e', n[:-2]
    elif n.endswith('.R'):
        lado, n = '_d', n[:-2]
    if n in ('root', 'spine05', 'pelvis'):
        return 'quadril'
    if n in ('spine04', 'spine03'):
        return 'coluna_1'
    if n == 'spine02':
        return 'coluna_2'
    if n in ('spine01', 'breast'):
        return 'peito'
    if n.startswith('neck'):
        return 'pescoco'
    if n == 'clavicle':
        return 'clavicula' + lado
    if n == 'shoulder01':
        return 'clavicula' + lado      # repartido depois com o braço (ver pesos)
    if n.startswith('upperarm'):
        return 'braco' + lado
    if n.startswith('lowerarm'):
        return 'antebraco' + lado
    if n in ('wrist',) or n.startswith('metacarpal') or n.startswith('finger'):
        return 'mao' + lado
    if n.startswith('upperleg'):
        return 'coxa' + lado
    if n.startswith('lowerleg'):
        return 'canela' + lado
    if n == 'foot':
        return 'pe' + lado
    if n.startswith('toe'):
        return 'dedos_pe' + lado
    # rosto, olhos, mandíbula, língua...
    return 'cabeca'


def reduzir_pesos(nomes_mh, W_mh, divide_ombro=0.5):
    """Soma os pesos do MakeHuman nos nossos ossos. O osso `shoulder01` (deltoide)
    vai parte para a clavícula e parte para o braço, para o ombro acompanhar o braço."""
    W = np.zeros((W_mh.shape[0], len(NOMES)))
    for j, nm in enumerate(nomes_mh):
        alvo = mapa_mh(nm)
        if nm.startswith('shoulder01'):
            lado = '_e' if nm.endswith('.L') else '_d'
            W[:, INDICE['clavicula' + lado]] += (1 - divide_ombro) * W_mh[:, j]
            W[:, INDICE['braco' + lado]] += divide_ombro * W_mh[:, j]
        else:
            W[:, INDICE[alvo]] += W_mh[:, j]
    s = W.sum(axis=1, keepdims=True)
    return W / np.maximum(s, 1e-9)


def limitar(W, maximo=4, minimo=0.004):
    W = W.copy()
    ordem = np.argsort(-W, axis=1)
    corte = np.zeros_like(W, dtype=bool)
    np.put_along_axis(corte, ordem[:, maximo:], True, axis=1)
    W[corte] = 0.0
    W[W < minimo] = 0.0
    s = W.sum(axis=1, keepdims=True)
    return W / np.maximum(s, 1e-12)


def juntas_de_mh(cab, cau):
    """Posição (cabeça) de cada um dos nossos ossos a partir das juntas do MakeHuman."""
    P = {}
    P['quadril'] = cab['spine05']
    P['coluna_1'] = cab['spine04']
    P['coluna_2'] = cab['spine02']
    P['peito'] = cab['spine01']
    P['pescoco'] = cab['neck01']
    P['cabeca'] = cab['head']
    for l, L in (('_e', '.L'), ('_d', '.R')):
        P['clavicula' + l] = cab['clavicle' + L]
        P['braco' + l] = cab['upperarm01' + L]
        P['antebraco' + l] = cab['lowerarm01' + L]
        P['mao' + l] = cab['wrist' + L]
        P['coxa' + l] = cab['upperleg01' + L]
        P['canela' + l] = cab['lowerleg01' + L]
        P['pe' + l] = cab['foot' + L]
        P['dedos_pe' + l] = np.mean([cab[f'toe{i}-1' + L] for i in range(1, 6)], axis=0)
    return P


def quadro_pega(indicador, minimo, punho, nos):
    """Quadro da pegada (colunas X, Y, Z no mundo).

    Y: eixo de um cabo seguro na mão, saindo pelo lado do polegar/indicador
       (do nó do mínimo para o nó do indicador).
    Z: para onde os dedos apontam (do punho para os nós dos dedos), sem a parte em Y.
    X: Y × Z (na mão direita aponta para a palma; na esquerda, para o dorso).
    """
    y = indicador - minimo
    y /= np.linalg.norm(y)
    z = nos - punho
    z -= y * (z @ y)
    z /= np.linalg.norm(z)
    x = np.cross(y, z)
    return np.stack([x, y, z], axis=1)
