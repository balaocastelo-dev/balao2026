// Cliente da Evolution API (v2).
//
// A Evolution roda num container ao lado deste servidor, na mesma rede do
// Docker, e NUNCA fica exposta para a internet: quem fala com ela e so este
// arquivo, com a chave guardada na VPS. O painel do site fala com o
// servidor.js, que confere quem esta pedindo antes de chegar aqui.

const TIMEOUT_PADRAO_MS = 60_000;

class ErroEvolution extends Error {
  constructor(mensagem, { status = 0, resposta = null, rota = "" } = {}) {
    super(mensagem);
    this.name = "ErroEvolution";
    this.status = status;
    this.resposta = resposta;
    this.rota = rota;
  }
}

/** Tira do corpo de erro da Evolution a frase que interessa para o vendedor. */
function mensagemDoErro(corpo, status) {
  const r = corpo?.response?.message ?? corpo?.message ?? corpo?.error ?? corpo;
  const texto = Array.isArray(r)
    ? r
        .map((item) => (typeof item === "string" ? item : item?.message || JSON.stringify(item)))
        .join("; ")
    : typeof r === "string"
    ? r
    : JSON.stringify(r);
  return texto && texto !== "{}" ? texto : `a Evolution respondeu ${status}`;
}

function criarEvolution({ url, chave, buscar = fetch, registrar = console.log }) {
  if (!url) throw new Error("EVOLUTION_URL nao configurada");
  if (!chave) throw new Error("EVOLUTION_API_KEY nao configurada");
  const base = String(url).replace(/\/$/, "");

  async function chamar(metodo, rota, corpo, { timeoutMs = TIMEOUT_PADRAO_MS } = {}) {
    const resposta = await buscar(`${base}${rota}`, {
      method: metodo,
      headers: { apikey: chave, "content-type": "application/json" },
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
      signal: AbortSignal.timeout(timeoutMs),
    }).catch((erro) => {
      throw new ErroEvolution(`Evolution fora do ar (${erro.message})`, { rota });
    });

    const texto = await resposta.text();
    let json = null;
    try {
      json = texto ? JSON.parse(texto) : null;
    } catch {
      json = { bruto: texto.slice(0, 500) };
    }

    if (!resposta.ok) {
      throw new ErroEvolution(mensagemDoErro(json, resposta.status), {
        status: resposta.status,
        resposta: json,
        rota,
      });
    }
    return json;
  }

  const inst = (nome) => encodeURIComponent(nome);

  return {
    chamar,

    // ---------- instancia ----------
    listarInstancias: () => chamar("GET", "/instance/fetchInstances"),
    criarInstancia: (nome, extras = {}) =>
      chamar("POST", "/instance/create", {
        instanceName: nome,
        integration: "WHATSAPP-BAILEYS",
        qrcode: true,
        ...extras,
      }),
    conectar: (nome) => chamar("GET", `/instance/connect/${inst(nome)}`),
    estadoConexao: (nome) => chamar("GET", `/instance/connectionState/${inst(nome)}`),
    reiniciar: (nome) => chamar("POST", `/instance/restart/${inst(nome)}`),
    desconectar: (nome) => chamar("DELETE", `/instance/logout/${inst(nome)}`),
    definirWebhook: (nome, webhook) =>
      chamar("POST", `/webhook/set/${inst(nome)}`, { webhook }),
    definirConfiguracoes: (nome, config) =>
      chamar("POST", `/settings/set/${inst(nome)}`, config),

    // ---------- envio ----------
    enviarTexto: (nome, numero, texto, extras = {}) =>
      chamar("POST", `/message/sendText/${inst(nome)}`, { number: numero, text: texto, ...extras }),
    enviarMidia: (nome, numero, midia, extras = {}) =>
      chamar(
        "POST",
        `/message/sendMedia/${inst(nome)}`,
        { number: numero, ...midia, ...extras },
        { timeoutMs: 180_000 }
      ),
    // Audio de voz (aparece com a bolinha azul de "gravado agora"). A Evolution
    // converte o arquivo para o formato do WhatsApp (ogg/opus) sozinha.
    enviarAudio: (nome, numero, audio, extras = {}) =>
      chamar(
        "POST",
        `/message/sendWhatsAppAudio/${inst(nome)}`,
        { number: numero, audio, ...extras },
        { timeoutMs: 180_000 }
      ),
    enviarLocalizacao: (nome, numero, loc) =>
      chamar("POST", `/message/sendLocation/${inst(nome)}`, { number: numero, ...loc }),
    enviarEnquete: (nome, numero, pergunta, opcoes) =>
      chamar("POST", `/message/sendPoll/${inst(nome)}`, {
        number: numero,
        name: pergunta,
        selectableCount: 1,
        values: opcoes,
      }),
    enviarReacao: (nome, chave, emoji) =>
      chamar("POST", `/message/sendReaction/${inst(nome)}`, { key: chave, reaction: emoji }),
    publicarStatus: (nome, status) =>
      chamar("POST", `/message/sendStatus/${inst(nome)}`, status, { timeoutMs: 180_000 }),

    // ---------- conversas ----------
    buscarConversas: (nome, filtro = {}) => chamar("POST", `/chat/findChats/${inst(nome)}`, filtro),
    buscarMensagens: (nome, filtro) =>
      chamar("POST", `/chat/findMessages/${inst(nome)}`, filtro, { timeoutMs: 90_000 }),
    buscarContatos: (nome, filtro = {}) => chamar("POST", `/chat/findContacts/${inst(nome)}`, filtro),
    marcarComoLida: (nome, chaves) =>
      chamar("POST", `/chat/markMessageAsRead/${inst(nome)}`, { readMessages: chaves }),
    apagarParaTodos: (nome, chave) =>
      chamar("DELETE", `/chat/deleteMessageForEveryone/${inst(nome)}`, chave),
    editarMensagem: (nome, numero, chave, texto) =>
      chamar("POST", `/chat/updateMessage/${inst(nome)}`, { number: numero, key: chave, text: texto }),
    fotoDoPerfil: (nome, numero) =>
      chamar("POST", `/chat/fetchProfilePictureUrl/${inst(nome)}`, { number: numero }),
    temWhatsApp: (nome, numeros) =>
      chamar("POST", `/chat/whatsappNumbers/${inst(nome)}`, { numbers: numeros }),
    presenca: (nome, numero, presenca, delay = 1200) =>
      chamar("POST", `/chat/sendPresence/${inst(nome)}`, { number: numero, presence: presenca, delay }),
    // Baixa a midia de uma mensagem ja guardada (por id). Volta base64.
    baixarMidia: (nome, idMensagem) =>
      chamar(
        "POST",
        `/chat/getBase64FromMediaMessage/${inst(nome)}`,
        { message: { key: { id: idMensagem } }, convertToMp4: false },
        { timeoutMs: 180_000 }
      ),
  };
}

module.exports = { criarEvolution, ErroEvolution };
