// node evo/envio.test.js
// A foto do catálogo pode falhar. O texto da oferta, se saiu, não falha junto.
const assert = require("assert");
const { enviarOferta } = require("./envio");
const { paraOBanco, paraOPainel } = require("../crm/formato");

const JID = "5531999828420@s.whatsapp.net";
let ok = 0;
const t = async (nome, fn) => {
  await fn();
  ok++;
  console.log("✓", nome);
};

function erroHttp(status, message) {
  return Object.assign(new Error(message), { status });
}

(async () => {
  await t("foto 400 não falha o texto da oferta, e a foto só tenta de novo uma vez", async () => {
    let textos = 0;
    let fotos = 0;
    const marcadas = [];
    const r = await enviarOferta({
      destino: "5531999828420@c.us",
      legenda: "⚡ oferta",
      imagem: "https://exemplo.invalid/foto.jpg",
      enviarTexto: async (jid) => {
        textos++;
        assert.strictEqual(jid, JID);
        return { key: { id: "TEXTO1", remoteJid: jid, fromMe: true } };
      },
      enviarMidia: async (jid) => {
        fotos++;
        assert.strictEqual(jid, JID);
        throw erroHttp(400, '{"exists":false,"jid":"553199828420@s.whatsapp.net"}');
      },
      marcarFoto: (id) => marcadas.push(id),
    });
    assert.strictEqual(r.rec.key.id, "TEXTO1");
    assert.strictEqual(r.comFoto, false);
    assert.match(r.motivoSemFoto, /código 400/);
    assert.match(r.motivoSemFoto, /553199828420/);
    assert.strictEqual(textos, 1);
    assert.strictEqual(fotos, 2);
    assert.deepStrictEqual(marcadas, []);
  });

  await t("foto aceita fica marcada e o registro do painel continua sendo o texto", async () => {
    const marcadas = [];
    const r = await enviarOferta({
      destino: "5531999828420",
      legenda: "⚡ oferta",
      imagem: "https://exemplo.invalid/foto.jpg",
      enviarTexto: async () => ({ key: { id: "TEXTO2" } }),
      enviarMidia: async () => ({ key: { id: "FOTO2" } }),
      marcarFoto: (id) => marcadas.push(id),
    });
    assert.strictEqual(r.rec.key.id, "TEXTO2");
    assert.strictEqual(r.comFoto, true);
    assert.strictEqual(r.motivoSemFoto, null);
    assert.deepStrictEqual(marcadas, ["FOTO2"]);
  });

  await t("texto recusado (não é 400) não dispara a foto", async () => {
    let fotos = 0;
    await assert.rejects(
      () =>
        enviarOferta({
          destino: "5531999828420",
          legenda: "⚡ oferta",
          imagem: "https://exemplo.invalid/foto.jpg",
          enviarTexto: async () => {
            throw erroHttp(500, "Evolution fora");
          },
          enviarMidia: async () => {
            fotos++;
            return { key: { id: "FOTO" } };
          },
        }),
      (e) => e.status === 500
    );
    assert.strictEqual(fotos, 0);
  });

  await t("produto sem foto só manda o texto", async () => {
    let fotos = 0;
    const r = await enviarOferta({
      destino: "5519984515960@c.us",
      legenda: "⚡ oferta",
      imagem: null,
      enviarTexto: async (jid) => {
        assert.strictEqual(jid, "5519984515960@s.whatsapp.net");
        return { key: { id: "TEXTO3" } };
      },
      enviarMidia: async () => {
        fotos++;
      },
    });
    assert.strictEqual(r.rec.key.id, "TEXTO3");
    assert.strictEqual(r.comFoto, false);
    assert.strictEqual(r.motivoSemFoto, "produto sem foto no site");
    assert.strictEqual(fotos, 0);
  });

  await t("o motivo da falha sobrevive o banco e só volta no balão que falhou", async () => {
    const ida = paraOBanco({
      id: "M1",
      chatId: "5531999828420@c.us",
      direction: "out",
      body: "oi",
      status: "failed",
      motivoFalha: "código 463",
      timestamp: 1,
    });
    assert.strictEqual(ida.midia.motivoFalha, "código 463");
    const linha = {
      id: "M1",
      chat_id: "5531999828420@c.us",
      direcao: "out",
      corpo: "oi",
      situacao: "failed",
      em: new Date(1),
      midia: ida.midia,
    };
    assert.strictEqual(paraOPainel(linha).motivoFalha, "código 463");
    assert.strictEqual(paraOPainel({ ...linha, situacao: "delivered" }).motivoFalha, undefined);
  });

  console.log(`\n${ok} testes ok`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
