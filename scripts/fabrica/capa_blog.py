# -*- coding: utf-8 -*-
"""
Foto de capa do blog, feita na placa de vídeo da loja.

Roda NO COMPUTADOR DO THIAGO, dentro da fábrica de conteúdo
(copiar para `C:\\Users\\user\\balao-content-factory\\publisher\\capa_blog.py`).
A rotina do blog, na nuvem, publica o artigo e deixa na fila o pedido da foto
(`capas/pendentes.json`, no ramo `claude/blog-conteudo`). Este programa:

  1. lê a fila direto do GitHub (leitura pública, como o `video_dica.py`);
  2. espera a placa de vídeo ficar livre;
  3. gera a foto com o Flux, no ComfyUI local;
  4. mostra a foto a um modelo de visão do Ollama local, que reprova marca,
     texto, rosto, deformação ou cena errada; reprovada, gera outra (até 3);
  5. prende a foto ao artigo com `node scripts/blog-publicar.mjs capa`.

Se nenhuma foto passar em dois dias, tira o pedido da fila e o artigo fica com
a capa desenhada pelo site. Sem modelo de visão instalado, NÃO publica nada.

  python capa_blog.py            faz o que estiver na fila
  python capa_blog.py --ver      só mostra a fila
  python capa_blog.py --teste saida.jpg "pedido em inglês"
                                 gera e confere uma foto, sem publicar

ESTADO: escrito em 11/10/2026 numa conversa SEM acesso ao computador. Ainda
não foi instalado nem rodou. Antes de agendar, conferir no computador os
pontos marcados com CONFERIR (nomes dos modelos, pasta do repositório, sinais
de placa ocupada) contra o `criar_figurino.py` e o `video_dica.py`.
"""
import base64, io, json, os, subprocess, sys, time, urllib.request, uuid
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
LOG = RAIZ / "logs" / "capa_blog.log"
ESTADO = RAIZ / "data" / "capas_blog.json"
SAIDA = RAIZ / "data" / "capas_blog"
FILA = "https://raw.githubusercontent.com/balaocastelo-dev/balao2026/refs/heads/claude/blog-conteudo/capas/pendentes.json"

# CONFERIR: clone do repositório só para isto, com permissão de envio (git push).
REPO = Path(os.environ.get("BLOG_REPO", str(RAIZ / "_blog_repo")))
REPO_URL = "https://github.com/balaocastelo-dev/balao2026.git"

COMFY = os.environ.get("COMFY_URL", "http://127.0.0.1:8188")
COMFY_DIR = Path(os.environ.get("COMFY_DIR", r"C:\Users\user\Documents\03-Dev-Repos\ComfyUI"))
# CONFERIR: mesmo modelo do criar_figurino.py. Se lá o texto roda na CPU com
# carregadores separados, copiar aquele trecho do fluxo para `fluxo()`.
MODELO_FLUX = os.environ.get("CAPA_MODELO_FLUX", "flux1-dev-fp8.safetensors")
OLLAMA = os.environ.get("OLLAMA_URL", "http://127.0.0.1:11434")
MODELOS_DE_VISAO = [m for m in [os.environ.get("CAPA_MODELO_VISAO")] if m] + [
    "qwen2.5vl", "qwen3-vl", "llama3.2-vision", "gemma3", "minicpm-v", "llava"]
# CONFERIR: quem mais usa a placa (a URA tem sinal próprio no fila_avatar.py).
OCUPANTES = ["video_diario.py", "video_dica.py", "fila_avatar.py", "run_avatar.py", "upscale_seedvr2.py", "criar_figurino.py"]

LARGURA, ALTURA = 1600, 896          # o Flux quer múltiplos de 16; depois vira 1600 x 900
TENTATIVAS = 3
DIAS_ATE_DESISTIR = 2
ESPERA_DA_PLACA_MIN = 90

SEMPRE = (" Realistic photograph, landscape 16:9, natural light, shallow depth of field."
          " Generic unbranded equipment. No text, no letters, no numbers, no logos, no brand names,"
          " no stickers, no watermark, no people's faces.")

PERGUNTA = """You are checking a blog cover photo before it is published. The photo should show: "{alt}".
Answer ONLY with JSON: {{"texto": bool, "marca": bool, "rosto": bool, "deformado": bool, "cena_certa": bool, "motivo": "short reason"}}
- texto: any readable letters, words or numbers anywhere (screens, keys, labels, boxes).
- marca: any logo, brand name or recognizable brand symbol.
- rosto: any human face.
- deformado: warped hands, melted or impossible objects, broken geometry.
- cena_certa: the photo plausibly shows the described scene.
Be strict: when in doubt about texto, marca, rosto or deformado, answer true."""


def log(msg):
    linha = f"{time.strftime('%Y-%m-%d %H:%M:%S')} {msg}"
    print(linha)
    LOG.parent.mkdir(parents=True, exist_ok=True)
    with open(LOG, "a", encoding="utf-8") as f:
        f.write(linha + "\n")


def http(url, dados=None, espera=60):
    req = urllib.request.Request(url, data=json.dumps(dados).encode() if dados is not None else None,
                                 headers={"Content-Type": "application/json", "User-Agent": "balao-capa-blog"})
    with urllib.request.urlopen(req, timeout=espera) as r:
        return r.read()


def ler_fila():
    try:
        return json.loads(http(FILA + f"?t={int(time.time())}")).get("pendentes", [])
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return []
        raise


# ------------------------------------------------------------ placa de vídeo

def placa_ocupada():
    """Diz quem está usando a placa, ou None."""
    try:
        saida = subprocess.run(["powershell", "-NoProfile", "-Command",
                                "Get-CimInstance Win32_Process | Select-Object -ExpandProperty CommandLine"],
                               capture_output=True, text=True, timeout=60).stdout
        for nome in OCUPANTES:
            if nome in saida:
                return nome
    except Exception as e:
        return f"não consegui listar os processos ({e})"
    try:
        fila = json.loads(http(COMFY + "/queue", espera=5))
        if fila.get("queue_running") or fila.get("queue_pending"):
            return "fila do ComfyUI"
    except Exception:
        pass
    return None


def esperar_placa():
    fim = time.time() + ESPERA_DA_PLACA_MIN * 60
    while True:
        quem = placa_ocupada()
        if not quem:
            return True
        if time.time() > fim:
            log(f"placa ocupada por {quem} há {ESPERA_DA_PLACA_MIN} min: fica para a próxima rodada")
            return False
        time.sleep(60)


def abrir_comfy():
    """Devolve o processo, se foi este programa que abriu o ComfyUI."""
    try:
        http(COMFY + "/system_stats", espera=5)
        return None
    except Exception:
        pass
    log("abrindo o ComfyUI")
    proc = subprocess.Popen([str(COMFY_DIR / ".venv" / "Scripts" / "python.exe"), "main.py", "--port", COMFY.rsplit(":", 1)[1]],
                            cwd=str(COMFY_DIR), stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    for _ in range(90):
        time.sleep(2)
        try:
            http(COMFY + "/system_stats", espera=5)
            return proc
        except Exception:
            pass
    proc.kill()
    raise RuntimeError("o ComfyUI não respondeu em 3 minutos")


# ------------------------------------------------------------------ a foto

def fluxo(pedido, semente):
    return {
        "1": {"class_type": "CheckpointLoaderSimple", "inputs": {"ckpt_name": MODELO_FLUX}},
        "2": {"class_type": "CLIPTextEncode", "inputs": {"clip": ["1", 1], "text": pedido + SEMPRE}},
        "3": {"class_type": "CLIPTextEncode", "inputs": {"clip": ["1", 1], "text": ""}},
        "4": {"class_type": "FluxGuidance", "inputs": {"conditioning": ["2", 0], "guidance": 3.5}},
        "5": {"class_type": "EmptySD3LatentImage", "inputs": {"width": LARGURA, "height": ALTURA, "batch_size": 1}},
        "6": {"class_type": "KSampler", "inputs": {"model": ["1", 0], "positive": ["4", 0], "negative": ["3", 0],
                                                    "latent_image": ["5", 0], "seed": semente, "steps": 24, "cfg": 1.0,
                                                    "sampler_name": "euler", "scheduler": "simple", "denoise": 1.0}},
        "7": {"class_type": "VAEDecode", "inputs": {"samples": ["6", 0], "vae": ["1", 2]}},
        "8": {"class_type": "SaveImage", "inputs": {"images": ["7", 0], "filename_prefix": "capa_blog"}},
    }


def gerar(pedido, destino):
    from PIL import Image
    semente = int.from_bytes(os.urandom(6), "big")
    pid = json.loads(http(COMFY + "/prompt", {"prompt": fluxo(pedido, semente), "client_id": uuid.uuid4().hex}))["prompt_id"]
    fim = time.time() + 15 * 60
    while time.time() < fim:
        time.sleep(3)
        hist = json.loads(http(COMFY + f"/history/{pid}"))
        if pid not in hist:
            continue
        if hist[pid].get("status", {}).get("status_str") == "error":
            raise RuntimeError(f"o ComfyUI recusou o fluxo: {json.dumps(hist[pid]['status'])[:400]}")
        for no in hist[pid].get("outputs", {}).values():
            for img in no.get("images", []):
                bruto = http(COMFY + f"/view?filename={img['filename']}&subfolder={img.get('subfolder', '')}&type={img.get('type', 'output')}")
                foto = Image.open(io.BytesIO(bruto)).convert("RGB").resize((1600, 900), Image.LANCZOS)
                destino.parent.mkdir(parents=True, exist_ok=True)
                for qualidade in (88, 82, 76):
                    foto.save(destino, "JPEG", quality=qualidade, optimize=True, progressive=True)
                    if destino.stat().st_size <= 850 * 1024:
                        break
                return semente
    raise RuntimeError("a foto não ficou pronta em 15 minutos")


def modelo_de_visao():
    instalados = [m["name"] for m in json.loads(http(OLLAMA + "/api/tags", espera=15)).get("models", [])]
    for querido in MODELOS_DE_VISAO:
        for nome in instalados:
            if nome.split(":")[0] == querido or nome == querido:
                return nome
    return None


def conferir(arquivo, alt, modelo):
    """Devolve (aprovada, motivo). Qualquer dúvida reprova."""
    resposta = json.loads(http(OLLAMA + "/api/chat", {
        "model": modelo, "stream": False, "format": "json", "options": {"temperature": 0},
        "messages": [{"role": "user", "content": PERGUNTA.format(alt=alt),
                      "images": [base64.b64encode(arquivo.read_bytes()).decode()]}]}, espera=300))
    try:
        v = json.loads(resposta["message"]["content"])
    except Exception:
        return False, "o modelo de visão não respondeu em JSON"
    ruins = [k for k in ("texto", "marca", "rosto", "deformado") if v.get(k) is not False]
    if v.get("cena_certa") is not True:
        ruins.append("cena errada")
    return (not ruins), (", ".join(ruins) + f" — {v.get('motivo', '')}" if ruins else "ok")


def foto_aprovada(pedido, alt, destino, modelo):
    for n in range(1, TENTATIVAS + 1):
        semente = gerar(pedido, destino)
        ok, motivo = conferir(destino, alt, modelo)
        log(f"  tentativa {n} (semente {semente}): {'aprovada' if ok else 'reprovada: ' + motivo}")
        if ok:
            return True
    return False


# --------------------------------------------------------------- publicação

def git(*args):
    return subprocess.run(["git", *args], cwd=str(REPO), capture_output=True, text=True, timeout=300)


def preparar_repo():
    if not (REPO / ".git").exists():
        r = subprocess.run(["git", "clone", "--depth", "50", REPO_URL, str(REPO)], capture_output=True, text=True, timeout=900)
        if r.returncode != 0:
            raise RuntimeError(f"não consegui clonar o repositório: {r.stderr.strip()[:300]}")
    for passo in (["fetch", "origin", "main"], ["checkout", "main"], ["reset", "--hard", "origin/main"]):
        r = git(*passo)
        if r.returncode != 0:
            raise RuntimeError(f"git {' '.join(passo)}: {r.stderr.strip()[:300]}")


def comando_do_blog(*args):
    r = subprocess.run(["node", "scripts/blog-publicar.mjs", *args], cwd=str(REPO), capture_output=True, text=True, timeout=600)
    return r.returncode == 0, (r.stdout + r.stderr).strip()[-400:]


def main():
    if "--ver" in sys.argv:
        for p in ler_fila():
            print(f"- {p['slug']} (pedido em {p['pedidoEm'][:16]}): {p['alt']}")
        return
    if "--teste" in sys.argv:
        i = sys.argv.index("--teste")
        destino, pedido = Path(sys.argv[i + 1]), sys.argv[i + 2]
        modelo = modelo_de_visao()
        proc = abrir_comfy()
        try:
            print("semente", gerar(pedido, destino))
            print("visão:", modelo, conferir(destino, pedido, modelo) if modelo else "nenhum modelo de visão instalado")
        finally:
            if proc:
                proc.kill()
        return

    fila = ler_fila()
    if not fila:
        return
    modelo = modelo_de_visao()
    if not modelo:
        log("nenhum modelo de visão no Ollama: nada foi gerado nem publicado (instalar um e dizer em CAPA_MODELO_VISAO)")
        return
    if not esperar_placa():
        return
    estado = json.loads(ESTADO.read_text(encoding="utf-8")) if ESTADO.exists() else {}
    preparar_repo()
    proc = abrir_comfy()
    try:
        for p in fila:
            slug = p["slug"]
            log(f"{slug}: gerando a foto ({modelo} confere)")
            destino = SAIDA / f"{slug}.jpg"
            if foto_aprovada(p["pedido"], p["alt"], destino, modelo):
                ok, saida = comando_do_blog("capa", slug, str(destino))
                log(f"  {'publicada' if ok else 'o comando recusou'}: {saida.splitlines()[-1] if saida else ''}")
                continue
            idade_dias = (time.time() - time.mktime(time.strptime(p["pedidoEm"][:19], "%Y-%m-%dT%H:%M:%S"))) / 86400
            estado[slug] = estado.get(slug, 0) + 1
            if idade_dias >= DIAS_ATE_DESISTIR:
                ok, saida = comando_do_blog("capa", slug, "--desistir")
                log(f"  {DIAS_ATE_DESISTIR} dias sem foto boa: pedido retirado, o artigo fica com a capa desenhada")
            else:
                log(f"  nenhuma das {TENTATIVAS} passou: tenta de novo na próxima rodada")
    finally:
        ESTADO.parent.mkdir(parents=True, exist_ok=True)
        ESTADO.write_text(json.dumps(estado, indent=1), encoding="utf-8")
        if proc:
            proc.kill()


if __name__ == "__main__":
    try:
        main()
    except Exception as erro:
        log(f"ERRO: {erro}")
        sys.exit(1)
