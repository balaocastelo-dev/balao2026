# -*- coding: utf-8 -*-
"""
Foto de capa do blog, feita na placa de vídeo da loja (sem serviço pago).

Roda NO COMPUTADOR DO THIAGO, dentro da fábrica de conteúdo:
`C:\\Users\\user\\balao-content-factory\\publisher\\capa_blog.py` (a fonte fica
no repositório do site, em `scripts/fabrica/capa_blog.py`).

A rotina do blog, na nuvem, publica o artigo e deixa na fila o pedido da foto
(`capas/pendentes.json`, no ramo `claude/blog-conteudo`). Este programa:

  1. lê a fila direto do GitHub (leitura pública, como o `video_dica.py`);
  2. espera a placa de vídeo ficar livre (URA sem ligação, nenhum outro render,
     memória da placa sobrando);
  3. gera a foto com o Flux, no ComfyUI local;
  4. mostra a foto a um modelo de visão do Ollama local, que lista texto, marca,
     rosto e defeito que encontrar; achou qualquer coisa ou a cena não é a
     pedida, reprova e gera outra (até 3 por rodada);
  5. prende a foto ao artigo com `node scripts/blog-publicar.mjs capa`, num
     clone do repositório só para isso (`balao-content-factory\\_blog_repo`).

A URA tem prioridade: se entrar ligação no meio, derruba o ComfyUI na hora e
deixa a foto para a próxima rodada. Se nenhuma foto passar em dois dias, tira o
pedido da fila e o artigo fica com a capa desenhada pelo site. Sem modelo de
visão instalado, NÃO publica nada.

  python capa_blog.py                 faz o que estiver na fila
  python capa_blog.py --ver           só mostra a fila
  python capa_blog.py --sem-publicar  gera e confere, mas não prende ao artigo
                                      (a foto aprovada fica guardada e a
                                      próxima rodada normal a publica)
  python capa_blog.py --teste saida.jpg "pedido em inglês"
                                      gera e confere uma foto avulsa
  python capa_blog.py --conferir foto.jpg "a cena em inglês"
                                      só passa uma foto pronta pelo modelo de visão

Registro: `logs\\capa_blog.log`. Fotos e estado: `data\\capas_blog\\` e
`data\\capas_blog.json`. Tarefa agendada: `instalar_tarefa_capa.ps1`.

Escrito em 11/10/2026 (Claude, projeto Balao.info). Lições que valem aqui:
- o texto do Flux (T5) roda na CPU: na placa, junto com o que o Windows já
  usa, a memória transborda e a geração fica ~100 vezes mais lenta, sem erro;
- antes de chamar o modelo de visão, o ComfyUI solta a memória da placa.
"""
import base64, calendar, io, json, os, subprocess, sys, time, urllib.error, urllib.parse, urllib.request, uuid
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
LOG = RAIZ / "logs" / "capa_blog.log"
ESTADO = RAIZ / "data" / "capas_blog.json"
SAIDA = RAIZ / "data" / "capas_blog"
FILA = "https://raw.githubusercontent.com/balaocastelo-dev/balao2026/refs/heads/claude/blog-conteudo/capas/pendentes.json"

REPO = Path(os.environ.get("BLOG_REPO", str(RAIZ / "_blog_repo")))
REPO_URL = "https://github.com/balaocastelo-dev/balao2026.git"
PASTAS_DE_PROGRAMA = [r"C:\Program Files\nodejs", r"C:\Program Files\Git\cmd"]

COMFY = os.environ.get("COMFY_URL", "http://127.0.0.1:8188")
INICIAR_COMFY = RAIZ / "avatar" / "iniciar_comfy.cmd"
OLLAMA = os.environ.get("OLLAMA_URL", "http://127.0.0.1:11434")
MODELOS_DE_VISAO = [m for m in [os.environ.get("CAPA_MODELO_VISAO")] if m] + [
    "qwen2.5vl", "qwen3-vl", "llama3.2-vision", "gemma3", "minicpm-v", "llava"]
# Quem mais usa a placa de vídeo na fábrica. A URA é vista à parte, em `ligacoes()`.
OCUPANTES = ["video_diario.py", "video_dica.py", "fila_avatar.py", "run_avatar.py", "upscale_seedvr2.py",
             "criar_figurino.py", "capa_blog.py"]
SO_OLHAM = ("--ver", "--painel", "--montar-teste", "--proximo")     # chamadas que não usam a placa

LARGURA, ALTURA = 1600, 896          # o Flux quer múltiplos de 16; depois vira 1600 x 900
PASSOS = 26
TENTATIVAS = 3
DIAS_ATE_DESISTIR = 2
ESPERA_DA_PLACA_MIN = 90
VRAM_MINIMA_MB = 15000               # o Flux em 1600 x 896 ocupa perto disso
LIMITE_POR_FOTO_S = 8 * 60           # normal: 1 a 2 minutos. Passou disso, a placa transbordou
SEM_JANELA = 0x08000000 if os.name == "nt" else 0

SEMPRE = (" Realistic photograph, landscape 16:9, natural light, shallow depth of field."
          " Generic unbranded equipment. No text, no letters, no numbers, no logos, no brand names,"
          " no stickers, no watermark, no people's faces.")
# O Flux desenha "notebook prateado" com cara de MacBook. Fora da categoria Apple, o pedido ganha este reforço.
SEM_CARA_DE_APPLE = (" Any laptop or computer is a generic dark gray or black Windows-style model, clearly not"
                     " Apple-style, with a blank lid and a blank bezel without any marking.")

# Modelo de visão pequeno erra "tem texto? sim/não", mas acerta quando tem de LISTAR o que vê. Por isso a pergunta
# pede listas, e a foto só passa com todas vazias.
PERGUNTA = """You are inspecting a photo before it is used as a blog cover. Look at every part of it, including small details on devices, screens, keys, mugs, boxes and the background.
Answer ONLY with JSON in exactly this shape:
{{"textos": [], "marcas": [], "rostos": 0, "defeitos": [], "descricao": "", "mostra_a_cena": true}}
- textos: every readable or half-readable word, letter group or number you can see, each with where it is. Empty only if there is none at all.
- marcas: every logo, brand name, brand symbol, or small label or sticker that looks like a brand mark, each with where it is.{apple}
- rostos: how many human faces are visible.
- defeitos: warped hands, melted or impossible objects, broken geometry, duplicated parts.
- descricao: one sentence saying what the photo shows.
- mostra_a_cena: true only if the photo plausibly shows this scene: "{cena}"."""


NAO_APPLE = " Also list here any laptop or computer that clearly looks like an Apple product (MacBook, iMac)."


class Interrompida(Exception):
    """A URA atendeu uma ligação no meio: a foto fica para a próxima rodada."""


def log(msg):
    linha = f"{time.strftime('%Y-%m-%d %H:%M:%S')} {msg}"
    if sys.stdout is not None:
        try:
            print(linha, flush=True)
        except Exception:
            pass
    LOG.parent.mkdir(parents=True, exist_ok=True)
    with open(LOG, "a", encoding="utf-8") as f:
        f.write(linha + "\n")


def http(url, dados=None, espera=60):
    req = urllib.request.Request(url, data=json.dumps(dados).encode() if dados is not None else None,
                                 headers={"Content-Type": "application/json", "User-Agent": "balao-capa-blog"})
    with urllib.request.urlopen(req, timeout=espera) as r:
        return r.read()


def rodar(cmd, espera=60, **mais):
    return subprocess.run(cmd, capture_output=True, text=True, timeout=espera, creationflags=SEM_JANELA,
                          encoding="utf-8", errors="replace", **mais)


def ler_fila():
    try:
        return json.loads(http(FILA + f"?t={int(time.time())}")).get("pendentes", [])
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return []
        raise


# ------------------------------------------------------------ placa de vídeo

def ligacoes():
    """Ligações em andamento na URA (o mesmo sinal do avatar\\fila_avatar.py)."""
    try:
        r = rodar(["wsl.exe", "-d", "Ubuntu", "-u", "root", "--", "sh", "-lc",
                   "asterisk -rx 'core show channels count'"], espera=20)
        for ln in r.stdout.splitlines():
            if "active call" in ln:
                return int(ln.split()[0])
    except Exception:
        pass
    return 0


def outro_render():
    try:
        r = rodar(["powershell", "-NoProfile", "-Command",
                   "Get-CimInstance Win32_Process -Filter \"Name='python.exe' or Name='pythonw.exe'\" | "
                   "Select-Object ProcessId, CommandLine | ConvertTo-Json -Compress"], espera=90)
        procs = json.loads(r.stdout or "[]")
        procs = [procs] if isinstance(procs, dict) else procs
    except Exception as e:
        return f"não consegui listar os processos ({e})"
    for p in procs:
        linha = (p.get("CommandLine") or "").lower()
        if p.get("ProcessId") in (os.getpid(), os.getppid()) or any(s in linha for s in SO_OLHAM):
            continue
        for nome in OCUPANTES:
            if nome in linha:
                return nome
    return None


def comfy_ok():
    try:
        http(COMFY + "/system_stats", espera=5)
        return True
    except Exception:
        return False


def vram_livre_mb():
    try:
        r = rodar(["nvidia-smi", "--query-gpu=memory.total,memory.used", "--format=csv,noheader,nounits"], espera=20)
        total, usada = [int(x) for x in r.stdout.strip().splitlines()[0].split(",")]
        return total - usada
    except Exception:
        return None


def soltar_memoria():
    """Pede ao ComfyUI (se aberto e parado) e ao Ollama que soltem a memória da placa."""
    try:
        http(COMFY + "/free", {"unload_models": True, "free_memory": True}, espera=10)
    except Exception:
        pass
    try:
        for m in json.loads(http(OLLAMA + "/api/ps", espera=10)).get("models", []):
            http(OLLAMA + "/api/generate", {"model": m["name"], "keep_alive": 0}, espera=30)
    except Exception:
        pass


def placa_ocupada():
    """Diz quem está usando a placa, ou None."""
    if ligacoes() > 0:
        return "URA em ligação"
    quem = outro_render()
    if quem:
        return quem
    try:
        fila = json.loads(http(COMFY + "/queue", espera=5))
        if fila.get("queue_running") or fila.get("queue_pending"):
            return "fila do ComfyUI"
    except Exception:
        pass                              # ComfyUI fechado = livre
    livre = vram_livre_mb()
    if livre is not None and livre < VRAM_MINIMA_MB:
        soltar_memoria()
        time.sleep(6)
        livre = vram_livre_mb()
        if livre is not None and livre < VRAM_MINIMA_MB:
            return f"outro programa (só {livre} MB livres na placa)"
    return None


def esperar_placa():
    fim = time.time() + ESPERA_DA_PLACA_MIN * 60
    avisado = None
    while True:
        quem = placa_ocupada()
        if not quem:
            return True
        if quem == "capa_blog.py":
            log("já há outra rodada deste programa em andamento: saindo")
            return False
        if time.time() > fim:
            log(f"placa ocupada por {quem} há {ESPERA_DA_PLACA_MIN} min: fica para a próxima rodada")
            return False
        if quem != avisado:
            log(f"placa ocupada ({quem}): esperando")
            avisado = quem
        time.sleep(60)


def subir_comfy():
    """Devolve True se foi este programa que abriu o ComfyUI (então é ele quem fecha)."""
    if comfy_ok():
        return False
    log("abrindo o ComfyUI")
    subprocess.Popen(["cmd.exe", "/c", str(INICIAR_COMFY)], creationflags=SEM_JANELA)
    for _ in range(40):
        time.sleep(10)
        if comfy_ok():
            return True
    matar_comfy()
    raise RuntimeError("o ComfyUI não respondeu em 6 minutos")


def matar_comfy():
    rodar(["powershell", "-NoProfile", "-Command",
           "Get-CimInstance Win32_Process -Filter \"Name='python.exe'\" | "
           "Where-Object { $_.CommandLine -match 'main.py --listen 127.0.0.1 --port 8188' } | "
           "ForEach-Object { Stop-Process -Id $_.ProcessId -Force }"], espera=60)


# ------------------------------------------------------------------ a foto

def texto_do_pedido(pedido, categoria):
    return pedido.strip() + SEMPRE + ("" if categoria == "apple" else SEM_CARA_DE_APPLE)


def fluxo(texto, semente):
    return {
        "1": {"class_type": "UNETLoader", "inputs": {"unet_name": "flux1-dev-fp8.safetensors", "weight_dtype": "fp8_e4m3fn"}},
        "2": {"class_type": "DualCLIPLoader", "inputs": {"clip_name1": "t5xxl_fp8_e4m3fn_scaled.safetensors",
                                                         "clip_name2": "clip_l.safetensors", "type": "flux",
                                                         "device": "cpu"}},      # texto na CPU: sobra placa para o Flux
        "3": {"class_type": "VAELoader", "inputs": {"vae_name": "ae.safetensors"}},
        "4": {"class_type": "CLIPTextEncode", "inputs": {"clip": ["2", 0], "text": texto}},
        "5": {"class_type": "FluxGuidance", "inputs": {"conditioning": ["4", 0], "guidance": 3.5}},
        "6": {"class_type": "CLIPTextEncode", "inputs": {"clip": ["2", 0], "text": ""}},
        "7": {"class_type": "EmptySD3LatentImage", "inputs": {"width": LARGURA, "height": ALTURA, "batch_size": 1}},
        "8": {"class_type": "KSampler", "inputs": {"model": ["1", 0], "positive": ["5", 0], "negative": ["6", 0],
                                                    "latent_image": ["7", 0], "seed": semente, "steps": PASSOS, "cfg": 1.0,
                                                    "sampler_name": "euler", "scheduler": "simple", "denoise": 1.0}},
        "9": {"class_type": "VAEDecode", "inputs": {"samples": ["8", 0], "vae": ["3", 0]}},
        "10": {"class_type": "SaveImage", "inputs": {"images": ["9", 0], "filename_prefix": "capa_blog/capa"}},
    }


def gerar(texto, destino):
    from PIL import Image
    semente = int.from_bytes(os.urandom(6), "big")
    pid = json.loads(http(COMFY + "/prompt", {"prompt": fluxo(texto, semente), "client_id": uuid.uuid4().hex}))["prompt_id"]
    inicio = time.time()
    while True:
        time.sleep(2)
        if ligacoes() > 0:                # a URA tem prioridade: solta a placa na hora
            matar_comfy()
            raise Interrompida()
        if time.time() - inicio > LIMITE_POR_FOTO_S:
            try:
                http(COMFY + "/interrupt", {}, espera=10)
            except Exception:
                pass
            raise RuntimeError(f"a foto não ficou pronta em {LIMITE_POR_FOTO_S // 60} minutos (placa cheia?)")
        try:
            hist = json.loads(http(COMFY + f"/history/{pid}", espera=15))
        except Exception:
            continue
        if pid not in hist:
            continue
        if hist[pid].get("status", {}).get("status_str") == "error":
            raise RuntimeError(f"o ComfyUI recusou o fluxo: {json.dumps(hist[pid]['status'])[:400]}")
        for no in hist[pid].get("outputs", {}).values():
            for img in no.get("images", []):
                bruto = http(COMFY + "/view?" + urllib.parse.urlencode(
                    {"filename": img["filename"], "subfolder": img.get("subfolder", ""), "type": img.get("type", "output")}))
                foto = Image.open(io.BytesIO(bruto)).convert("RGB").resize((1600, 900), Image.LANCZOS)
                destino.parent.mkdir(parents=True, exist_ok=True)
                for qualidade in (88, 82, 76):
                    foto.save(destino, "JPEG", quality=qualidade, optimize=True, progressive=True)
                    if destino.stat().st_size <= 850 * 1024:
                        break
                return semente, round(time.time() - inicio)
        raise RuntimeError("o ComfyUI terminou sem devolver imagem")


def modelo_de_visao():
    instalados = [m["name"] for m in json.loads(http(OLLAMA + "/api/tags", espera=15)).get("models", [])]
    for querido in MODELOS_DE_VISAO:
        for nome in instalados:
            if nome.split(":")[0] == querido or nome == querido:
                return nome
    return None


def conferir(arquivo, cena, modelo, categoria=""):
    """Devolve (aprovada, motivo). Qualquer dúvida reprova."""
    try:                                  # o Flux sai da placa antes de o modelo de visão entrar
        http(COMFY + "/free", {"unload_models": True, "free_memory": True}, espera=10)
        time.sleep(3)
    except Exception:
        pass
    resposta = json.loads(http(OLLAMA + "/api/chat", {
        "model": modelo, "stream": False, "format": "json", "keep_alive": 0,
        "options": {"temperature": 0, "num_ctx": 8192},
        "messages": [{"role": "user", "content": PERGUNTA.format(cena=cena, apple="" if categoria == "apple" else NAO_APPLE),
                      "images": [base64.b64encode(arquivo.read_bytes()).decode()]}]}, espera=420))
    try:
        v = json.loads(resposta["message"]["content"])
        assert isinstance(v, dict)
    except Exception:
        return False, "o modelo de visão não respondeu em JSON"
    ruins = []
    for campo, nome in (("textos", "texto"), ("marcas", "marca"), ("defeitos", "deformado")):
        achado = v.get(campo)
        if achado != []:                  # lista vazia é a única resposta que passa
            ruins.append(f"{nome} ({'; '.join(str(x) for x in achado)[:120] if isinstance(achado, list) else 'sem resposta'})")
    if v.get("rostos") != 0:
        ruins.append("rosto")
    if v.get("mostra_a_cena") is not True:
        ruins.append(f"cena errada ({str(v.get('descricao', ''))[:120]})")
    return (not ruins), (", ".join(ruins) if ruins else "ok")


def foto_aprovada(pedido, destino, modelo, categoria=""):
    """Devolve a semente da foto aprovada, ou None."""
    for n in range(1, TENTATIVAS + 1):
        semente, segundos = gerar(texto_do_pedido(pedido, categoria), destino)
        ok, motivo = conferir(destino, pedido, modelo, categoria)
        log(f"  tentativa {n} (semente {semente}, {segundos}s): {'aprovada' if ok else 'reprovada: ' + motivo}")
        if ok:
            return semente
        if ligacoes() > 0:
            raise Interrompida()
    return None


# --------------------------------------------------------------- publicação

def ambiente():
    env = dict(os.environ)
    env["PATH"] = os.pathsep.join([p for p in PASTAS_DE_PROGRAMA if Path(p).exists()] + [env.get("PATH", "")])
    env["GIT_TERMINAL_PROMPT"] = "0"      # sem ninguém na frente: se o login do GitHub faltar, falha em vez de abrir janela
    env["GCM_INTERACTIVE"] = "never"
    return env


def git(*args, cwd=None, espera=300):
    return rodar(["git", *args], espera=espera, cwd=str(cwd or REPO), env=ambiente())


def preparar_repo():
    if not (REPO / ".git").exists():
        r = git("clone", "--depth", "50", REPO_URL, str(REPO), cwd=RAIZ, espera=900)
        if r.returncode != 0:
            raise RuntimeError(f"não consegui clonar o repositório: {r.stderr.strip()[:300]}")
    for passo in (["fetch", "--depth", "50", "origin", "main"], ["checkout", "main"], ["reset", "--hard", "origin/main"],
                  ["worktree", "prune"]):
        r = git(*passo)
        if r.returncode != 0:
            raise RuntimeError(f"git {' '.join(passo)}: {r.stderr.strip()[:300]}")


def comando_do_blog(*args):
    r = rodar(["node", "scripts/blog-publicar.mjs", *args], espera=600, cwd=str(REPO), env=ambiente())
    return r.returncode == 0, (r.stdout + r.stderr).strip()[-500:]


def idade_em_dias(pedido_em):
    try:
        return (time.time() - calendar.timegm(time.strptime(pedido_em[:19], "%Y-%m-%dT%H:%M:%S"))) / 86400
    except Exception:
        return 0.0


def ler_estado():
    try:
        e = json.loads(ESTADO.read_text(encoding="utf-8"))
        return e if isinstance(e, dict) else {}
    except Exception:
        return {}


def gravar_estado(estado):
    ESTADO.parent.mkdir(parents=True, exist_ok=True)
    ESTADO.write_text(json.dumps(estado, indent=1, ensure_ascii=False), encoding="utf-8")


def main():
    if sys.stdout is not None and hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    if "--ver" in sys.argv:
        fila = ler_fila()
        print(f"{len(fila)} foto(s) na fila")
        for p in fila:
            print(f"- {p['slug']} (pedido em {p['pedidoEm'][:16]}): {p['alt']}")
        return

    if "--conferir" in sys.argv:          # --conferir foto.jpg "a cena": só passa a foto pelo modelo de visão
        i = sys.argv.index("--conferir")
        print(conferir(Path(sys.argv[i + 1]), sys.argv[i + 2], modelo_de_visao()))
        return

    teste = "--teste" in sys.argv
    sem_publicar = "--sem-publicar" in sys.argv
    if teste:
        i = sys.argv.index("--teste")
        fila = [{"slug": "_teste", "pedido": sys.argv[i + 2], "alt": "", "pedidoEm": "", "_destino": Path(sys.argv[i + 1])}]
    else:
        fila = ler_fila()
    estado = ler_estado()
    fila = [p for p in fila if not estado.get(p["slug"], {}).get("publicada")]
    if not fila:
        return
    modelo = modelo_de_visao()
    if not modelo:
        log("nenhum modelo de visão no Ollama: nada foi gerado nem publicado (instalar um e dizer em CAPA_MODELO_VISAO)")
        return
    if not teste and not sem_publicar:
        preparar_repo()

    abri = False
    try:
        for p in fila:
            slug = p["slug"]
            destino = p.get("_destino") or SAIDA / f"{slug}.jpg"
            e = estado.setdefault(slug, {}) if not teste else {}
            if not (e.get("aprovada") and destino.exists()):
                if not esperar_placa():
                    return
                abri = subir_comfy() or abri
                log(f"{slug}: gerando a foto ({modelo} confere)")
                semente = foto_aprovada(p["pedido"], destino, modelo, p.get("categoria", ""))
                e["tentativas"] = e.get("tentativas", 0) + 1
                if semente is None:
                    if not teste and idade_em_dias(p["pedidoEm"]) >= DIAS_ATE_DESISTIR and not sem_publicar:
                        ok, saida = comando_do_blog("capa", slug, "--desistir")
                        e["publicada"] = ok
                        log(f"  {DIAS_ATE_DESISTIR} dias sem foto boa: pedido retirado, o artigo fica com a capa desenhada")
                    else:
                        log(f"  nenhuma das {TENTATIVAS} passou: tenta de novo na próxima rodada")
                    continue
                e.update({"aprovada": True, "semente": semente})
                gravar_estado(estado)
            if teste or sem_publicar:
                log(f"  foto guardada em {destino} (não publicada)")
                continue
            ok, saida = comando_do_blog("capa", slug, str(destino))
            ja_tinha = "já tem foto de capa" in saida
            e["publicada"] = ok or ja_tinha
            log(f"  {'publicada' if ok else 'o comando recusou'}: {saida.splitlines()[-1] if saida else ''}")
    except Interrompida:
        log("a URA atendeu uma ligação: placa liberada, a foto fica para a próxima rodada")
    finally:
        if not teste:
            gravar_estado(estado)
        if abri:
            matar_comfy()
        else:
            try:
                http(COMFY + "/free", {"unload_models": True, "free_memory": True}, espera=10)
            except Exception:
                pass


if __name__ == "__main__":
    try:
        main()
    except Exception as erro:
        log(f"ERRO: {erro}")
        sys.exit(1)
