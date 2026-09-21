// node evo/normalizar.test.js
const assert = require("assert");
const N = require("./normalizar");

const lids = { "123456789012345@lid": "5519984515960" };
const lidParaNumero = (l) => lids[l] || null;
let ok = 0;
const t = (nome, fn) => { fn(); ok++; console.log("✓", nome); };

t("texto recebido de número normal", () => {
  const m = N.normalizarMensagem({
    key: { id: "ABC", remoteJid: "5519984515960@s.whatsapp.net", fromMe: false },
    pushName: "Thiago", messageType: "conversation", message: { conversation: "oi" }, messageTimestamp: 1758450000,
  });
  assert.equal(m.chatId, "5519984515960@c.us");
  assert.equal(m.body, "oi");
  assert.equal(m.direction, "in");
  assert.equal(m.timestamp, 1758450000000);
  assert.equal(m.contactName, "Thiago");
  assert.equal(m.hasMedia, false);
});

t("@lid com remoteJidAlt vira o número", () => {
  const m = N.normalizarMensagem({
    key: { id: "L1", remoteJid: "999@lid", remoteJidAlt: "5511999998888@s.whatsapp.net", fromMe: false, addressingMode: "lid" },
    messageType: "conversation", message: { conversation: "x" }, messageTimestamp: 1,
  });
  assert.equal(m.chatId, "5511999998888@c.us");
  assert.equal(m.lid, "999@lid");
});

t("@lid sem par usa o mapa aprendido", () => {
  const m = N.normalizarMensagem({
    key: { id: "L2", remoteJid: "123456789012345@lid", fromMe: true },
    messageType: "conversation", message: { conversation: "y" }, messageTimestamp: 1,
  }, { lidParaNumero, numeroDaLoja: "5519987510267" });
  assert.equal(m.chatId, "5519984515960@c.us");
  assert.equal(m.direction, "out");
  assert.equal(m.from, "5519987510267");
});

t("@lid desconhecido continua @lid", () => {
  const m = N.normalizarMensagem({ key: { id: "L3", remoteJid: "777@lid" }, messageType: "conversation", message: { conversation: "z" } });
  assert.equal(m.chatId, "777@lid");
  assert.equal(N.paraDestino(m.chatId), "777@lid");
});

t("mensagem de voz", () => {
  const m = N.normalizarMensagem({
    key: { id: "V1", remoteJid: "5519984515960@s.whatsapp.net" },
    messageType: "audioMessage", message: { audioMessage: { ptt: true, mimetype: "audio/ogg; codecs=opus", seconds: 7 } },
  });
  assert.equal(m.mediaType, "ptt");
  assert.equal(m.mediaUrl, "/midia/V1");
  assert.equal(m.segundos, 7);
});

t("foto com legenda, vídeo, documento dentro de documentWithCaption", () => {
  const f2 = N.normalizarMensagem({ key: { id: "F2", remoteJid: "5519984515960@s.whatsapp.net" }, messageType: "imageMessage", message: { imageMessage: { caption: "olha", mimetype: "image/jpeg" } } });
  assert.equal(f2.mediaType, "image"); assert.equal(f2.body, "olha");
  const v = N.normalizarMensagem({ key: { id: "V", remoteJid: "5519984515960@s.whatsapp.net" }, messageType: "videoMessage", message: { videoMessage: { mimetype: "video/mp4" } } });
  assert.equal(v.mediaType, "video");
  const d = N.normalizarMensagem({ key: { id: "D", remoteJid: "5519984515960@s.whatsapp.net" }, message: { documentWithCaptionMessage: { message: { documentMessage: { fileName: "orcamento.pdf", caption: "segue", mimetype: "application/pdf" } } } } });
  assert.equal(d.mediaType, "document"); assert.equal(d.mediaName, "orcamento.pdf"); assert.equal(d.body, "segue");
});

t("grupo, status e controle são ignorados", () => {
  assert.equal(N.normalizarMensagem({ key: { id: "G", remoteJid: "1203@g.us" }, message: { conversation: "g" } }), null);
  assert.equal(N.normalizarMensagem({ key: { id: "S", remoteJid: "status@broadcast" }, message: { conversation: "s" } }), null);
  assert.equal(N.normalizarMensagem({ key: { id: "P", remoteJid: "5519984515960@s.whatsapp.net" }, messageType: "protocolMessage", message: { protocolMessage: {} } }), null);
});

t("status de entrega", () => {
  assert.equal(N.statusDoPainel("DELIVERY_ACK", true), "delivered");
  assert.equal(N.statusDoPainel("READ", true), "read");
  assert.equal(N.statusDoPainel("ERROR", true), "failed");
  assert.equal(N.statusDoPainel(null, true), "sent");
});

t("conversa do findChats com @lid e última mensagem com par", () => {
  const c = N.normalizarConversa({
    remoteJid: "999@lid", pushName: "Maria", unreadCount: 2, updatedAt: "2026-09-20T10:00:00Z",
    lastMessage: { key: { id: "X", remoteJid: "999@lid", remoteJidAlt: "5511999998888@s.whatsapp.net" }, messageType: "conversation", message: { conversation: "quanto custa?" }, messageTimestamp: 1758362400 },
  });
  assert.equal(c.chatId, "5511999998888@c.us");
  assert.equal(c.contactName, "Maria");
  assert.equal(c.lastMessageBody, "quanto custa?");
  assert.equal(c.unreadCount, 2);
});

t("a própria loja não aparece como conversa", () => {
  const c = N.normalizarConversa({ remoteJid: "5519987510267@s.whatsapp.net" }, { numeroDaLoja: "5519987510267" });
  assert.equal(c, null);
});

t("dataUrl e extensões", () => {
  assert.deepEqual(N.separarDataUrl("data:image/png;base64,AAAA"), { mimetype: "image/png", base64: "AAAA" });
  assert.deepEqual(N.separarDataUrl("AAAA"), { mimetype: null, base64: "AAAA" });
  assert.equal(N.extensaoDoMime("audio/ogg; codecs=opus"), "ogg");
  assert.equal(N.tipoPeloMime("video/mp4"), "video");
  assert.equal(N.tipoPeloMime("application/pdf"), "document");
});

console.log(`\n${ok} testes ok`);
