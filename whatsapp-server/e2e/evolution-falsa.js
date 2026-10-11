// Evolution 2.3.7 de mentira, com o COMPORTAMENTO da de verdade onde importa
// para a fase 1 (conferido na imagem oficial v2.3.7 e no código dela):
//
//   - findMessages filtra key.remoteJid OU key.remoteJidAlt, e a janela de
//     tempo só vale com gte E lte (whatsapp.baileys.service.fetchMessages);
//   - findChats aceita where.remoteJid e a mesma janela (channel.service.fetchChats);
//   - sendMedia com URL BUSCA o arquivo na URL (é assim que o upload chega);
//   - getBase64FromMediaMessage devolve a mídia guardada.
//
// Também é o site falso (verifica o ingresso) e o Whisper falso
// (/v1/audio/transcriptions). Tudo anota o que recebeu em `chamadas`, para
// o teste conferir O QUE o servidor pediu — não só o que ele mostrou.
//
// Só números e textos inventados (5500000xxxxxx). Nada de cliente.

const http = require("http");

function lerCorpo(req) {
  return new Promise((ok) => {
    const pedacos = [];
    req.on("data", (p) => pedacos.push(p));
    req.on("end", () => ok(Buffer.concat(pedacos)));
  });
}

function criarEvolutionFalsa({ porta, portaSite }) {
  const mensagens = []; // registros crus, no formato da Evolution
  const midias = new Map(); // id -> { base64, mimetype, fileName }
  const chamadas = []; // { rota, tipo, ... }
  let webhook = null;
  let enviadas = 0;

  const anotar = (c) => chamadas.push({ em: Date.now(), ...c });
  const ts = (v) => Math.floor(new Date(v).getTime() / 1000);

  function filtrarMensagens(where = {}) {
    let lista = [...mensagens];
    const k = where.key || {};
    if (k.id) lista = lista.filter((m) => m.key.id === k.id);
    if (k.remoteJid || k.remoteJidAlt) {
      lista = lista.filter(
        (m) => (k.remoteJid && m.key.remoteJid === k.remoteJid) || (k.remoteJidAlt && m.key.remoteJidAlt === k.remoteJidAlt)
      );
    }
    const j = where.messageTimestamp;
    if (j?.gte && j?.lte) lista = lista.filter((m) => m.messageTimestamp >= ts(j.gte) && m.messageTimestamp <= ts(j.lte));
    return lista.sort((a, b) => b.messageTimestamp - a.messageTimestamp);
  }

  function conversas(where = {}) {
    const ultimas = new Map();
    for (const m of filtrarMensagens({ messageTimestamp: where.messageTimestamp })) {
      if (where.remoteJid && m.key.remoteJid !== where.remoteJid) continue;
      if (!ultimas.has(m.key.remoteJid)) ultimas.set(m.key.remoteJid, m);
    }
    return [...ultimas.values()].map((m) => ({
      remoteJid: m.key.remoteJid,
      pushName: m.pushName || null,
      unreadCount: 0,
      updatedAt: new Date(m.messageTimestamp * 1000).toISOString(),
      lastMessage: m,
    }));
  }

  function registroEnviado(numero, message, messageType) {
    enviadas++;
    const rec = {
      key: { id: `ENVIADA${Date.now()}${enviadas}`, remoteJid: `${String(numero).replace(/\D/g, "")}@s.whatsapp.net`, fromMe: true },
      message,
      messageType,
      messageTimestamp: Math.floor(Date.now() / 1000),
      status: "PENDING",
    };
    mensagens.push(rec);
    return rec;
  }

  const servidor = http.createServer(async (req, res) => {
    const corpo = await lerCorpo(req);
    const json = (o, code = 200) => {
      res.writeHead(code, { "content-type": "application/json" });
      res.end(JSON.stringify(o));
    };
    const u = req.url.split("?")[0];
    let b = {};
    try {
      b = corpo.length && !String(req.headers["content-type"] || "").startsWith("multipart") ? JSON.parse(corpo) : {};
    } catch {}

    if (u === "/instance/fetchInstances") return json([{ name: "loja", connectionStatus: "open", ownerJid: "5500000000999@s.whatsapp.net" }]);
    if (u.startsWith("/instance/connectionState/")) return json({ instance: { state: "open" } });
    if (u.startsWith("/webhook/set/")) {
      webhook = b.webhook;
      anotar({ rota: "webhook/set", eventos: webhook?.events || [] });
      return json({ ok: true });
    }
    if (u.startsWith("/webhook/find/")) return json(webhook || {});
    if (u.startsWith("/settings/set/")) return json({ ok: true });
    if (u.startsWith("/chat/findChats/")) {
      const w = b.where || {};
      const tipo = w.remoteJid ? "conversa" : w.messageTimestamp ? "janela" : "completa";
      anotar({ rota: "findChats", tipo, remoteJid: w.remoteJid || null });
      return json(conversas(w));
    }
    if (u.startsWith("/chat/findMessages/")) {
      const w = b.where || {};
      const lista = filtrarMensagens(w);
      const por = Number(b.offset) || 50;
      const pagina = Number(b.page) || 1;
      anotar({ rota: "findMessages", filtro: Object.keys(w.key || {}).join("+") || "nenhum", janela: Boolean(w.messageTimestamp) });
      return json({ messages: { total: lista.length, pages: Math.ceil(lista.length / por), currentPage: pagina, records: lista.slice((pagina - 1) * por, pagina * por) } });
    }
    if (u.startsWith("/chat/getBase64FromMediaMessage/")) {
      const id = b.message?.key?.id;
      anotar({ rota: "getBase64", id });
      const m = midias.get(id);
      return m ? json(m) : json({ message: "não achei" }, 400);
    }
    if (u.startsWith("/message/sendText/")) {
      anotar({ rota: "sendText", quoted: Boolean(b.quoted) });
      return json(registroEnviado(b.number, { conversation: b.text }, "conversation"));
    }
    if (u.startsWith("/message/sendMedia/") || u.startsWith("/message/sendWhatsAppAudio/")) {
      const media = b.media || b.audio;
      let bytes = null;
      let porUrl = false;
      if (/^https?:\/\//.test(String(media))) {
        porUrl = true;
        // Como a Evolution: busca o arquivo na URL.
        const r = await fetch(media).catch(() => null);
        bytes = r?.ok ? Buffer.from(await r.arrayBuffer()) : null;
      } else if (media) {
        bytes = Buffer.from(String(media), "base64");
      }
      anotar({ rota: u.startsWith("/message/sendMedia/") ? "sendMedia" : "sendAudio", porUrl, url: porUrl ? String(media) : null, bytes: bytes?.length || 0 });
      if (!bytes) return json({ message: "não consegui baixar a mídia" }, 400);
      const tipo = b.mediatype === "image" ? "imageMessage" : b.mediatype === "video" ? "videoMessage" : b.audio ? "audioMessage" : "documentMessage";
      return json(registroEnviado(b.number, { [tipo]: { mimetype: b.mimetype || "application/octet-stream", caption: b.caption, fileName: b.fileName } }, tipo));
    }
    if (u.startsWith("/message/sendReaction/")) {
      anotar({ rota: "sendReaction", alvo: b.key?.id, emoji: b.reaction });
      return json({ key: { id: `REACAO${Date.now()}` } });
    }
    if (u.startsWith("/chat/deleteMessageForEveryone/")) {
      anotar({ rota: "apagar", alvo: b.id });
      return json({ ok: true });
    }
    if (u === "/v1/audio/transcriptions") {
      const texto = corpo.toString("latin1");
      anotar({ rota: "whisper", portugues: /name="language"\r\n\r\npt/.test(texto), temArquivo: /name="file"/.test(texto) });
      return json({ text: "quero saber o preço da fonte de 650W" });
    }
    if (u.startsWith("/chat/fetchProfilePictureUrl/")) return json({ profilePictureUrl: null });
    if (u.startsWith("/chat/whatsappNumbers/")) return json([]);
    return json({ ok: true });
  });

  const site = http.createServer(async (req, res) => {
    const corpo = await lerCorpo(req);
    if (req.url.startsWith("/api/painel/socket-ticket/verificar")) {
      const { ticket } = JSON.parse(corpo.toString() || "{}");
      if (String(ticket || "").startsWith("v1.")) {
        res.writeHead(200, { "content-type": "application/json" });
        return res.end(JSON.stringify({ ok: true, papel: "admin", exp: Math.floor(Date.now() / 1000) + 3600 }));
      }
      res.writeHead(401).end("{}");
      return;
    }
    res.writeHead(404).end("{}");
  });

  return {
    url: `http://localhost:${porta}`,
    urlSite: `http://localhost:${portaSite}`,
    mensagens,
    midias,
    chamadas,
    webhook: () => webhook,
    guardar: (rec) => mensagens.push(rec),
    ligar: () =>
      Promise.all([
        new Promise((ok) => servidor.listen(porta, ok)),
        new Promise((ok) => site.listen(portaSite, ok)),
      ]),
    fechar: () => {
      servidor.close();
      site.close();
    },
  };
}

module.exports = { criarEvolutionFalsa };
