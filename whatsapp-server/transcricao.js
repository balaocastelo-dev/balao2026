// Transcrição de áudio no servidor.
//
// Até aqui a transcrição só acontecia quando alguém ABRIA a conversa: o
// painel chamava /api/crm/transcrever na Vercel, que baixava o áudio daqui e
// mandava para a Groq. Áudio de conversa que ninguém abriu ficava sem texto —
// e era justamente esse que o vendedor precisava ler de relance na lista.
//
// Agora todo áudio e vídeo-recado que ENTRA vai para uma fila, um por vez, e
// o texto é guardado (store.transcricoes e crm_mensagem.transcricao) e
// avisado ao painel. Provedores, nesta ordem:
//
//   1. TRANSCRICAO_URL — um servidor no formato da OpenAI
//      (/v1/audio/transcriptions), por exemplo um Whisper local;
//   2. GROQ_API_KEY — o Whisper da Groq (whisper-large-v3-turbo, pt);
//   3. modo "puxado" (TRANSCRICAO_PUXADA=1) — um trabalhador no computador do
//      Thiago pergunta o que há para fazer (GET /api/transcricao/pendentes) e
//      devolve o texto (POST /api/transcricao/resultado). Serve para usar a
//      placa de vídeo dele sem abrir porta nenhuma na casa dele.
//
// Sem nenhum dos três, este módulo fica desligado e nada muda: o painel
// continua transcrevendo como sempre (ele sabe pelo apiInfo.transcricaoNoServidor).
//
// O módulo não sabe de WhatsApp nem de banco: recebe por injeção como pegar
// o áudio e o que fazer com o texto. É o que deixa testar sem rede.

const LIMITE_BYTES = 24 * 1024 * 1024; // a Groq aceita até 25 MB
const URL_GROQ = "https://api.groq.com/openai/v1/audio/transcriptions";

function urlDoEndpoint(base) {
  const s = String(base || "").trim().replace(/\/+$/, "");
  if (!s) return "";
  return /\/audio\/transcriptions$/.test(s) ? s : `${s}/v1/audio/transcriptions`;
}

function extensao(mimetype) {
  const m = String(mimetype || "").toLowerCase();
  if (m.includes("ogg")) return "ogg";
  if (m.includes("mpeg")) return "mp3";
  if (m.includes("mp4")) return m.startsWith("video/") ? "mp4" : "m4a";
  if (m.includes("webm")) return "webm";
  if (m.includes("wav")) return "wav";
  return "ogg";
}

/** POST multipart no formato da OpenAI. Devolve o texto. */
async function pedirTranscricao({ url, chave, modelo, buffer, mimetype, buscar, timeoutMs }) {
  const form = new FormData();
  const tipo = String(mimetype || "audio/ogg").split(";")[0];
  form.append("file", new Blob([buffer], { type: tipo }), `audio.${extensao(tipo)}`);
  form.append("model", modelo);
  form.append("language", "pt");
  form.append("response_format", "json");
  form.append("temperature", "0");
  const r = await buscar(url, {
    method: "POST",
    headers: chave ? { authorization: `Bearer ${chave}` } : {},
    body: form,
    signal: AbortSignal.timeout(timeoutMs),
  });
  const json = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(json?.error?.message || `respondeu ${r.status}`);
  const texto = String(json?.text ?? "").trim();
  return texto || "(áudio sem fala reconhecível)";
}

function criarTranscricao({
  url = "",
  chaveUrl = "",
  modeloUrl = "whisper-1",
  chaveGroq = "",
  modeloGroq = "whisper-large-v3-turbo",
  puxada = false,
  obterAudio, // async (id) => { buffer, mimetype }
  aoTranscrever, // async (id, texto, { provedor }) => void
  buscar = fetch,
  registrar = console.log,
  timeoutMs = 120_000,
  reofertaMs = 10 * 60_000, // item entregue ao trabalhador e não devolvido volta à fila
  agora = () => Date.now(),
}) {
  const endpoint = urlDoEndpoint(url);
  const provedores = [];
  if (endpoint) provedores.push({ nome: "local", url: endpoint, chave: chaveUrl, modelo: modeloUrl });
  if (chaveGroq) provedores.push({ nome: "groq", url: URL_GROQ, chave: chaveGroq, modelo: modeloGroq });
  const ativo = provedores.length > 0 || Boolean(puxada);

  const fila = []; // [{ id, chatId, em }]
  const naFila = new Set();
  const feitos = new Set(); // ids já transcritos (não repete)
  // Esperando o trabalhador do modo puxado: id -> { id, chatId, entregueEm }
  const aguardandoTrabalhador = new Map();
  let rodando = false;
  const numeros = { enfileirados: 0, transcritos: 0, falhas: 0, porProvedor: {}, ultimoErro: null, ultimoTrabalhadorEm: null };

  function enfileirar({ id, chatId }) {
    if (!ativo || !id || naFila.has(id) || feitos.has(id) || aguardandoTrabalhador.has(id)) return false;
    naFila.add(id);
    fila.push({ id, chatId, em: agora() });
    numeros.enfileirados++;
    if (!rodando) rodar();
    return true;
  }

  async function concluir(item, texto, provedor) {
    feitos.add(item.id);
    if (feitos.size > 20_000) feitos.delete(feitos.values().next().value);
    numeros.transcritos++;
    numeros.porProvedor[provedor] = (numeros.porProvedor[provedor] || 0) + 1;
    // Falha ao GUARDAR o texto não é falha do provedor: não pode fazer a fila
    // pedir a mesma transcrição a outro (e pagar duas vezes).
    try {
      await aoTranscrever(item.id, texto, { provedor, chatId: item.chatId });
    } catch (e) {
      registrar(`[transcricao] não consegui guardar o texto: ${e.message}`);
    }
  }

  async function rodar() {
    rodando = true;
    try {
      while (fila.length) {
        const item = fila.shift();
        // Continua em `naFila` até terminar: o mesmo áudio chegando de novo
        // (webhook e varredura) enquanto é transcrito não entra duas vezes.
        try {
          await processar(item);
        } finally {
          naFila.delete(item.id);
        }
      }
    } finally {
      rodando = false;
    }
  }

  async function processar(item) {
    if (!provedores.length) {
      // Só o modo puxado: o item espera o trabalhador.
      aguardandoTrabalhador.set(item.id, { ...item, entregueEm: null });
      return;
    }
    let audio;
    try {
      audio = await obterAudio(item.id);
      if (!audio?.buffer?.length) throw new Error("áudio vazio");
      if (audio.buffer.length > LIMITE_BYTES) throw new Error("áudio grande demais (máx. 24 MB)");
    } catch (e) {
      numeros.falhas++;
      numeros.ultimoErro = `áudio: ${String(e.message).slice(0, 120)}`;
      return;
    }
    for (const p of provedores) {
      try {
        const texto = await pedirTranscricao({ ...p, buffer: audio.buffer, mimetype: audio.mimetype, buscar, timeoutMs });
        await concluir(item, texto, p.nome);
        return;
      } catch (e) {
        numeros.ultimoErro = `${p.nome}: ${String(e.message).slice(0, 120)}`;
        registrar(`[transcricao] ${p.nome} falhou: ${e.message}`);
      }
    }
    // Ninguém conseguiu. Com o modo puxado, o trabalhador ainda pode.
    if (puxada) aguardandoTrabalhador.set(item.id, { ...item, entregueEm: null });
    else numeros.falhas++;
  }

  /** Para o trabalhador: o que está esperando (com o áudio em base64). */
  async function pendentes({ limite = 3, limiteBytes = 20 * 1024 * 1024 } = {}) {
    numeros.ultimoTrabalhadorEm = new Date(agora()).toISOString();
    const saida = [];
    let bytes = 0;
    for (const item of aguardandoTrabalhador.values()) {
      if (saida.length >= limite) break;
      if (item.entregueEm && agora() - item.entregueEm < reofertaMs) continue;
      let audio;
      try {
        audio = await obterAudio(item.id);
      } catch {
        continue;
      }
      if (!audio?.buffer?.length) continue;
      if (saida.length && bytes + audio.buffer.length > limiteBytes) break;
      bytes += audio.buffer.length;
      item.entregueEm = agora();
      saida.push({ id: item.id, mimetype: audio.mimetype || "audio/ogg", audioBase64: audio.buffer.toString("base64") });
    }
    return saida;
  }

  /** Para o trabalhador: devolve o texto (ou o erro) de um item. */
  async function resultado({ id, texto, erro }) {
    const item = aguardandoTrabalhador.get(String(id || ""));
    if (!item) return false;
    aguardandoTrabalhador.delete(item.id);
    if (erro || !String(texto || "").trim()) {
      numeros.falhas++;
      numeros.ultimoErro = `trabalhador: ${String(erro || "sem texto").slice(0, 120)}`;
      return true;
    }
    await concluir(item, String(texto).trim().slice(0, 20_000), "trabalhador");
    return true;
  }

  function estado() {
    return {
      ativo,
      provedores: provedores.map((p) => p.nome).concat(puxada ? ["puxado"] : []),
      naFila: fila.length,
      esperandoTrabalhador: aguardandoTrabalhador.size,
      ...numeros,
    };
  }

  return { ativo, enfileirar, pendentes, resultado, estado };
}

module.exports = { criarTranscricao, urlDoEndpoint };
