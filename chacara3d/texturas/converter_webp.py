"""Converte as texturas geradas (JPG e PNG em public/chacara3d/tex) para WebP, que a página usa.

Rodar depois de superficies.py e folhagem.py:  python3 converter_webp.py
Os JPG/PNG convertidos são apagados (a página só lê os .webp); para refazer, gere de novo e converta.
"""
import os, sys, glob
from PIL import Image

AQUI = os.path.dirname(os.path.abspath(__file__))
TEX = os.path.join(AQUI, '..', '..', 'public', 'chacara3d', 'tex')
apagar = '--manter' not in sys.argv
antes = depois = 0
for arq in sorted(glob.glob(os.path.join(TEX, '*.jpg')) + glob.glob(os.path.join(TEX, 'folhas', '*.png'))):
    base, ext = os.path.splitext(arq)
    nome = os.path.basename(base)
    im = Image.open(arq)
    if ext == '.png':
        # folhas com transparência: cor com perda leve, transparência quase sem perda
        q = 88 if not nome.endswith('_n') else 90
        im = im.convert('RGBA') if not nome.endswith('_n') else im.convert('RGB')
        im.save(base + '.webp', 'WEBP', quality=q, alpha_quality=95, method=6)
    else:
        q = 90 if nome.endswith('_n') else 86
        im.convert('RGB').save(base + '.webp', 'WEBP', quality=q, method=6)
    a, d = os.path.getsize(arq), os.path.getsize(base + '.webp')
    antes += a; depois += d
    if apagar:
        os.remove(arq)
# webp antigos que vieram prontos ao lado dos png (banana) já foram sobrescritos acima
print(f'{antes / 1e6:.1f} MB -> {depois / 1e6:.1f} MB')
