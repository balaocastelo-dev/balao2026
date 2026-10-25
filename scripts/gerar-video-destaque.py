"""Gera o vídeo curto (4 s, em loop) do Avell Storm 480 a partir da foto oficial.

Uso: python3 -I gerar_video.py <foto.png> <pasta_de_saida>
"""
import math
import subprocess
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

FOTO, SAIDA = Path(sys.argv[1]), Path(sys.argv[2])
QUADROS_DIR = SAIDA / "quadros"
QUADROS_DIR.mkdir(parents=True, exist_ok=True)

L, A = 1280, 800  # 16:10
FPS, SEGUNDOS = 30, 4
N = FPS * SEGUNDOS

# Foto oficial (RGBA, fundo transparente), recortada no conteúdo e ampliada uma vez.
foto = Image.open(FOTO).convert("RGBA")
foto = foto.crop(foto.getbbox())
BASE = 2.0
foto_hd = foto.resize((int(foto.width * BASE), int(foto.height * BASE)), Image.LANCZOS)

# Tamanho do notebook no quadro "aberto": ocupa ~82% da largura.
largura_base = int(L * 0.80)
escala_base = largura_base / foto.width


def fundo(t: float) -> Image.Image:
    """Fundo preto com brilho vermelho suave (o mesmo do bloco da home), pulsando de leve."""
    img = Image.new("RGB", (L, A), (0, 0, 0))
    glow = Image.new("L", (L, A), 0)
    d = ImageDraw.Draw(glow)
    pulso = 0.85 + 0.15 * (0.5 - 0.5 * math.cos(2 * math.pi * t))
    rx, ry = int(L * 0.42), int(A * 0.40)
    cx, cy = int(L * 0.52), int(A * 0.47)
    d.ellipse((cx - rx, cy - ry, cx + rx, cy + ry), fill=int(255 * pulso))
    glow = glow.filter(ImageFilter.GaussianBlur(160))
    vermelho = Image.new("RGB", (L, A), (150, 12, 24))
    img = Image.composite(vermelho, img, glow.point(lambda v: int(v * 0.55)))
    # Bordas em preto puro: assim o vídeo some no fundo preto do bloco, sem emenda.
    return Image.composite(img, Image.new("RGB", (L, A), (0, 0, 0)), MASCARA_BORDAS)


def _mascara_bordas() -> Image.Image:
    m = Image.new("L", (L, A), 0)
    mx, my = int(L * 0.10), int(A * 0.12)
    ImageDraw.Draw(m).rounded_rectangle((mx, my, L - mx, A - my), radius=int(A * 0.2), fill=255)
    return m.filter(ImageFilter.GaussianBlur(int(A * 0.09)))


MASCARA_BORDAS = _mascara_bordas()


def sombra(w: int, h: int) -> Image.Image:
    s = Image.new("L", (w, h), 0)
    ImageDraw.Draw(s).ellipse((0, 0, w, h), fill=200)
    return s.filter(ImageFilter.GaussianBlur(max(4, h // 3)))


def suave(x: float) -> float:
    return 0.5 - 0.5 * math.cos(math.pi * x)


# Roteiro da câmera (zoom e ponto focal na foto, em fração da foto), em loop:
# aberto -> aproxima da tela -> desliza até o teclado -> volta ao aberto.
CHAVES = [
    (0.00, 1.00, (0.50, 0.50)),
    (0.38, 1.12, (0.50, 0.40)),
    (0.68, 1.10, (0.50, 0.58)),
    (1.00, 1.00, (0.50, 0.50)),
]


def camera(t: float):
    for (t0, z0, f0), (t1, z1, f1) in zip(CHAVES, CHAVES[1:]):
        if t0 <= t <= t1:
            k = suave((t - t0) / (t1 - t0))
            return z0 + (z1 - z0) * k, (f0[0] + (f1[0] - f0[0]) * k, f0[1] + (f1[1] - f0[1]) * k)
    return CHAVES[-1][1], CHAVES[-1][2]


for i in range(N):
    t = i / N
    zoom, (fx, fy) = camera(t)
    quadro = fundo(t)

    esc = escala_base * zoom
    w, h = int(foto.width * esc), int(foto.height * esc)
    nb = foto_hd.resize((w, h), Image.LANCZOS)

    # O ponto focal da foto vai para perto do centro do quadro (sem sair muito do lugar no zoom 1).
    peso = (zoom - 1.0) / 0.12
    alvo_x = L * 0.5
    alvo_y = A * 0.52
    x = int(alvo_x - w * (0.5 + (fx - 0.5) * peso))
    y = int(alvo_y - h * (0.5 + (fy - 0.5) * peso))

    # Sombra no "chão"
    sw, sh = int(w * 0.86), int(h * 0.08)
    s = sombra(sw, sh)
    preto = Image.new("RGB", (sw, sh), (0, 0, 0))
    quadro.paste(preto, (x + (w - sw) // 2, y + int(h * 0.93)), s)

    quadro.paste(nb, (x, y), nb)

    # Reflexo de luz passando uma vez pela tela (entre 10% e 40% do loop)
    if 0.10 <= t <= 0.40:
        k = (t - 0.10) / 0.30
        brilho = Image.new("L", (L, A), 0)
        bx = int(-L * 0.3 + k * L * 1.6)
        ImageDraw.Draw(brilho).polygon(
            [(bx, 0), (bx + 90, 0), (bx - 160, A), (bx - 250, A)], fill=int(46 * math.sin(math.pi * k))
        )
        brilho = brilho.filter(ImageFilter.GaussianBlur(28))
        mascara = Image.new("L", (L, A), 0)
        mascara.paste(nb.getchannel("A"), (x, y))
        brilho = Image.composite(brilho, Image.new("L", (L, A), 0), mascara)
        quadro = Image.composite(Image.new("RGB", (L, A), (255, 255, 255)), quadro, brilho)

    quadro.save(QUADROS_DIR / f"q{i:04d}.png")
    if i == 0:
        quadro.save(SAIDA / "avell-storm-480-poster.jpg", quality=86, optimize=True, progressive=True)
        quadro.save(SAIDA / "avell-storm-480-poster.webp", quality=84)

entrada = str(QUADROS_DIR / "q%04d.png")
subprocess.run(
    ["ffmpeg", "-y", "-loglevel", "error", "-framerate", str(FPS), "-i", entrada,
     "-c:v", "libx264", "-preset", "slow", "-crf", "24", "-pix_fmt", "yuv420p",
     "-profile:v", "high", "-movflags", "+faststart", "-an",
     str(SAIDA / "avell-storm-480.mp4")],
    check=True,
)
subprocess.run(
    ["ffmpeg", "-y", "-loglevel", "error", "-framerate", str(FPS), "-i", entrada,
     "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "36", "-row-mt", "1", "-pix_fmt", "yuv420p", "-an",
     str(SAIDA / "avell-storm-480.webm")],
    check=True,
)
# Foto oficial em WebP (fundo transparente), para a ficha e o compartilhamento
foto.save(SAIDA / "avell-storm-480.webp", quality=90)
print("ok")
