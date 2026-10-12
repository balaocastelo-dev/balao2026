// Importação do histórico da Evolution para o crm_mensagem, contra Postgres de verdade.
//
//   EVO_TESTE_DB=postgresql://.../evo_teste CRM_TESTE_DB=postgresql://.../crm_teste \
//     node --test crm/importar-da-evolution.test.js
//
// ATENÇÃO: os dois bancos são APAGADOS e recriados. Sem as duas variáveis, pula.

const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { Pool } = require("pg");

const EVO = process.env.EVO_TESTE_DB;
const CRM = process.env.CRM_TESTE_DB;
const pular = !EVO || !CRM ? "sem EVO_TESTE_DB e CRM_TESTE_DB" : false;

const T0 = Math.floor(Date.parse("2026-09-01T12:00:00Z") / 1000);
const reg = (id, jid, fromMe, message, segundos, extra = {}) => ({
  id: `cm-${id}`,
  key: { id, remoteJid: jid, fromMe, ...(extra.key || {}) },
  pushName: fromMe ? null : "Cliente Falso",
  messageType: Object.keys(message)[0],
  message,
  contextInfo: extra.contextInfo || null,
  messageTimestamp: T0 + segundos,
  status: fromMe ? "READ" : "DELIVERY_ACK",
});

test("importar o histórico da Evolution", { skip: pular }, async (t) => {
  const { importar } = require("./importar-da-evolution");
  const evo = new Pool({ connectionString: EVO, max: 1 });
  const crmPool = new Pool({ connectionString: CRM, max: 1 });
  await evo.query(fs.readFileSync(path.join(__dirname, "..", "evo", "bancada-indices", "esquema-evolution.sql"), "utf8"));
  await evo.query(`UPDATE "Instance" SET "ownerJid" = '5500000000999@s.whatsapp.net' WHERE name = 'loja'`);
  await crmPool.query(`DROP TABLE IF EXISTS crm_mensagem, crm_contato, crm_evento, crm_interesse, crm_contato_etiqueta,
                       crm_etiqueta, crm_nota, crm_consentimento, crm_resposta_rapida, crm_config, migracao CASCADE`);

  const A = "5500000000001@s.whatsapp.net";
  const registros = [
    reg("M1", A, false, { conversation: "SEGREDO-DO-CLIENTE quero uma fonte" }, 0),
    reg("M2", A, true, { conversation: "temos sim" }, 10, {
      contextInfo: { stanzaId: "M1", participant: A, quotedMessage: { conversation: "SEGREDO-DO-CLIENTE quero uma fonte" } },
    }),
    reg("M3", "123456789@lid", false, { audioMessage: { ptt: true, mimetype: "audio/ogg", seconds: 5 } }, 20),
    reg("R1", A, false, { reactionMessage: { key: { id: "M2", remoteJid: A, fromMe: true }, text: "👍" } }, 30),
    reg("S1", "status@broadcast", false, { conversation: "status" }, 40),
    reg("G1", "1203@g.us", false, { conversation: "grupo" }, 50),
  ];
  // A mesma mensagem duas vezes na Evolution (aconteceu na loja em 12/10/2026:
  // "ON CONFLICT DO UPDATE command cannot affect row a second time"): uma
  // linha pelo @lid (que o servidor não conhece), sem citação, e outra pelo
  // número, com a citação.
  registros.push(
    { ...reg("D1", "987654321@lid", false, { conversation: "repetida" }, 55), id: "cm-D1a" },
    {
      ...reg("D1", A, false, { conversation: "repetida" }, 55, {
        contextInfo: { stanzaId: "M2", participant: "5500000000999@s.whatsapp.net", quotedMessage: { conversation: "temos sim" } },
      }),
      id: "cm-D1b",
    }
  );
  // O que o Postgres recusa (parou a importação da loja em 12/10/2026, "invalid
  // input syntax for type json"): citação cortada nos 200 caracteres bem no
  // meio de um emoji, e a metade dele ia para o JSON da coluna citada.
  // (Caractere nulo não chega por aqui: a Evolution guarda em JSONB, que nem
  // aceita; ele está no teste de crm/texto-seguro.js.)
  const longa = "a".repeat(199) + "😀 fim";
  registros.push(
    reg("Q0", A, false, { conversation: longa }, 56),
    reg("Q1", A, true, { conversation: "respondendo" }, 57, {
      contextInfo: { stanzaId: "Q0", participant: A, quotedMessage: { conversation: longa } },
    })
  );
  // Mais que um lote, com timestamps repetidos (o desempate pelo id importa).
  for (let i = 0; i < 25; i++) registros.push(reg(`L${String(i).padStart(2, "0")}`, A, i % 2 === 0, { conversation: `lote ${i}` }, 60));
  for (const r of registros) {
    await evo.query(
      `INSERT INTO "Message" ("id","key","pushName","messageType","message","contextInfo","source","messageTimestamp","instanceId","status")
       VALUES ($1,$2,$3,$4,$5,$6,'android',$7,'inst-bancada',$8)`,
      [r.id, r.key, r.pushName, r.messageType, r.message, r.contextInfo, r.messageTimestamp, r.status]
    );
  }
  const raiz = fs.mkdtempSync(path.join(os.tmpdir(), "importar-"));
  fs.mkdirSync(path.join(raiz, "data"));
  fs.writeFileSync(
    path.join(raiz, "data", "panel-data.json"),
    JSON.stringify({ lids: { "123456789@lid": "5500000000002" }, nomes: { "5500000000001@c.us": "Cliente Falso" }, transcricoes: { M3: "texto do áudio" } })
  );

  const log = [];
  const rodar = () =>
    importar({ urlEvolution: EVO, urlLoja: CRM, instancia: "loja", dataRoot: raiz, lote: 10, registrar: (...a) => log.push(a.join(" ")) });

  try {
    await t.test("copia as mensagens de conversa, com chave, citação e @lid traduzido", async () => {
      const total = await rodar();
      assert.strictEqual(total.lidas, registros.length);
      assert.strictEqual(total.novas, 31); // M1, M2, M3, D1 (uma vez só), Q0, Q1 + 25 do lote
      assert.strictEqual(total.comErro, 0);
      assert.strictEqual(total.repetidas, 1);
      assert.strictEqual(total.puladas, 2); // status e grupo
      const d1 = (await crmPool.query(`SELECT * FROM crm_mensagem WHERE id = 'D1'`)).rows;
      assert.strictEqual(d1.length, 1);
      assert.strictEqual(d1[0].chat_id, "5500000000001@c.us", "fica a conversa pelo número, não a do @lid");
      assert.strictEqual(d1[0].citada?.id, "M2", "e com o que a outra cópia tinha");
      const q1 = (await crmPool.query(`SELECT citada FROM crm_mensagem WHERE id = 'Q1'`)).rows[0];
      assert.strictEqual(q1.citada.trecho, "a".repeat(199), "a metade do emoji sai; o resto fica");
      const m2 = (await crmPool.query(`SELECT * FROM crm_mensagem WHERE id = 'M2'`)).rows[0];
      assert.strictEqual(m2.direcao, "out");
      assert.deepStrictEqual(m2.chave, { id: "M2", remoteJid: A, fromMe: true });
      assert.deepStrictEqual(m2.citada, { id: "M1", trecho: "SEGREDO-DO-CLIENTE quero uma fonte", deMim: false });
      const m3 = (await crmPool.query(`SELECT * FROM crm_mensagem WHERE id = 'M3'`)).rows[0];
      assert.strictEqual(m3.chat_id, "5500000000002@c.us");
      assert.strictEqual(m3.tipo_midia, "ptt");
      assert.strictEqual(m3.transcricao, "texto do áudio");
      assert.deepStrictEqual(m3.midia, { segundos: 5 });
    });

    await t.test("aplica a reação na mensagem-alvo", async () => {
      const m2 = (await crmPool.query(`SELECT reacoes FROM crm_mensagem WHERE id = 'M2'`)).rows[0];
      assert.deepStrictEqual(m2.reacoes.map((r) => [r.de, r.emoji]), [["cliente", "👍"]]);
    });

    await t.test("refaz os contatos pelos totais do banco", async () => {
      const c = (await crmPool.query(`SELECT * FROM crm_contato WHERE chat_id = '5500000000001@c.us'`)).rows[0];
      assert.strictEqual(c.total_entrada + c.total_saida, 30);
      assert.strictEqual(c.nome_whatsapp, "Cliente Falso");
    });

    await t.test("rodar de novo não duplica nem muda o seq de mensagem nenhuma", async () => {
      // seq diferente avisaria o painel de uma "mudança" que não houve.
      const foto = async () =>
        (await crmPool.query(`SELECT id, seq FROM crm_mensagem ORDER BY id`)).rows.map((x) => `${x.id}:${x.seq}`).join(",");
      const antes = await foto();
      const total = await rodar();
      assert.strictEqual(total.novas, 0);
      assert.strictEqual(total.completadas, 0);
      assert.strictEqual(total.reacoes, 0, "a mesma reação de novo não é mudança");
      assert.strictEqual(await foto(), antes);
    });

    await t.test("linha que já existia sem chave ganha o que faltava", async () => {
      await crmPool.query(`UPDATE crm_mensagem SET chave = NULL, citada = NULL WHERE id = 'M2'`);
      const total = await rodar();
      assert.strictEqual(total.completadas, 1);
      const m2 = (await crmPool.query(`SELECT chave, citada FROM crm_mensagem WHERE id = 'M2'`)).rows[0];
      assert.ok(m2.chave && m2.citada);
    });

    await t.test("o log não tem conteúdo de cliente", () => {
      const tudo = log.join("\n");
      assert.ok(!tudo.includes("SEGREDO-DO-CLIENTE"));
      assert.ok(!tudo.includes("5500000000001"));
      assert.match(tudo, /Pronto/);
    });
  } finally {
    await evo.end();
    await crmPool.end();
    fs.rmSync(raiz, { recursive: true, force: true });
  }
});

test("lote recusado: grava uma a uma e pula só a mensagem ruim (sem banco)", async () => {
  const { gravarLote } = require("./importar-da-evolution");
  // Banco de mentira: recusa qualquer INSERT que leve a mensagem "RUIM".
  const gravadas = [];
  const db = {
    query: async (_sql, valores) => {
      const ids = [];
      for (let i = 0; i < valores.length; i += 18) ids.push(valores[i]);
      if (ids.includes("RUIM")) throw new Error("invalid input syntax for type json");
      gravadas.push(...ids);
      return { rows: ids.map(() => ({ nova: true })), rowCount: ids.length };
    },
  };
  const linha = (id) => ({ id, chatId: "1@c.us", direcao: "in", corpo: "x", timestamp: Date.now() });
  const puladas = [];
  const g = await gravarLote(db, [linha("A1"), linha("RUIM"), linha("A2")], (l, e) => puladas.push([l.id, e.message]));
  assert.deepStrictEqual(g, { novas: 2, completadas: 0, comErro: 1 });
  assert.deepStrictEqual(gravadas, ["A1", "A2"]);
  assert.deepStrictEqual(puladas, [["RUIM", "invalid input syntax for type json"]]);
});
