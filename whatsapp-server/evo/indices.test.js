// Índices da tabela "Message" (evo/indices.sql) contra um Postgres de verdade.
//
//   EVO_TESTE_DB=postgresql://postgres@127.0.0.1:5432/evo_teste node --test evo/indices.test.js
//
// ATENÇÃO: o banco indicado é APAGADO e recriado (tabelas da Evolution com
// carga falsa). Sem EVO_TESTE_DB, ou sem o `psql` na máquina, o teste é pulado.
//
// O que fica provado:
//   1. sem os índices, as consultas quentes leem a tabela inteira (Seq Scan);
//   2. indices.sql roda duas vezes sem erro (idempotente) e conserta um índice
//      que ficou inválido numa montagem interrompida;
//   3. com os índices, cada consulta quente usa o índice dela — inclusive o SQL
//      exato do Prisma para o caminho JSON ("key"#>ARRAY['remoteJid']);
//   4. no comando preparado (é assim que o Prisma manda), o plano genérico
//      ignora o índice; com plan_cache_mode=force_custom_plan (compose), usa.

const test = require("node:test");
const assert = require("node:assert");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const URL_TESTE = process.env.EVO_TESTE_DB;
const temPsql = (() => {
  try {
    execFileSync("psql", ["--version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
})();
const pular = !URL_TESTE ? "sem EVO_TESTE_DB" : !temPsql ? "sem psql" : false;

const AQUI = __dirname;
const psql = (args) =>
  execFileSync("psql", [URL_TESTE, "-X", "-q", "-v", "ON_ERROR_STOP=1", ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });

const INSTANCIA = "inst-bancada";
const MOVIMENTADA = "5500000000001@s.whatsapp.net";

const CONSULTAS = {
  recibo: [`SELECT * FROM "Message" WHERE "instanceId" = $1 AND "key"->>'id' = $2 LIMIT 1`, (p) => [INSTANCIA, p.msgid]],
  prismaJid: [
    `SELECT "id", "key", "messageTimestamp" FROM "public"."Message"
     WHERE ("public"."Message"."instanceId" = $1 AND ("public"."Message"."key"#>ARRAY['remoteJid']::text[])::jsonb::jsonb = $2::jsonb)
     ORDER BY "public"."Message"."messageTimestamp" DESC LIMIT 80 OFFSET 0`,
    (p) => [INSTANCIA, JSON.stringify(p.jid)],
  ],
  prismaCount: [
    `SELECT COUNT(*) FROM (SELECT "id" FROM "public"."Message"
     WHERE ("public"."Message"."instanceId" = $1 AND ("public"."Message"."key"#>ARRAY['remoteJid']::text[])::jsonb::jsonb = $2::jsonb) OFFSET 0) AS sub`,
    (p) => [INSTANCIA, JSON.stringify(p.jid)],
  ],
  varredura: [
    `SELECT "id" FROM "public"."Message" WHERE "public"."Message"."instanceId" = $1 ORDER BY "messageTimestamp" DESC LIMIT 40 OFFSET 0`,
    () => [INSTANCIA],
  ],
  naoLidas: [
    `SELECT COUNT(*)::int FROM "Message" WHERE "instanceId" = $1 AND "key"->>'remoteJid' = $2
     AND ("key"->>'fromMe')::boolean = false AND "status" = 'DELIVERY_ACK'`,
    (p) => [INSTANCIA, p.jid],
  ],
  janela: [
    `SELECT DISTINCT ON ("key"->>'remoteJid') "id" FROM "Message"
     WHERE "instanceId" = $1 AND "messageTimestamp" >= $2 AND "messageTimestamp" <= $3
     ORDER BY "key"->>'remoteJid', "messageTimestamp" DESC`,
    () => [INSTANCIA, Math.floor(Date.now() / 1000) - 3600, Math.floor(Date.now() / 1000) + 60],
  ],
};

const ESPERADO = {
  recibo: "balao_msg_key_id",
  prismaJid: "balao_msg_jidjson_ts",
  prismaCount: "balao_msg_jidjson_ts",
  varredura: "balao_msg_inst_ts",
  naoLidas: "balao_msg_jid_ts",
  janela: "balao_msg_inst_ts",
};

/** Plano em texto, com os parâmetros já no lugar (como no plano de cada execução). */
async function plano(cliente, nome, p) {
  const [sql, params] = CONSULTAS[nome];
  const r = await cliente.query(`EXPLAIN ${sql}`, params(p));
  return r.rows.map((x) => x["QUERY PLAN"]).join("\n");
}

test("índices da Evolution", { skip: pular }, async (t) => {
  const { Client } = require("pg");
  psql(["-f", path.join(AQUI, "bancada-indices", "esquema-evolution.sql")]);
  psql([
    "-v", `instancia=${INSTANCIA}`,
    "-v", "conversas=3000",
    "-v", "mensagens=60000",
    "-f", path.join(AQUI, "bancada-indices", "carga-falsa.sql"),
  ]);

  const cliente = new Client({ connectionString: URL_TESTE });
  await cliente.connect();
  const p = (
    await cliente.query(
      `SELECT "key"->>'id' AS msgid, "key"->>'remoteJid' AS jid FROM "Message"
       WHERE "key"->>'remoteJid' <> $1 ORDER BY "messageTimestamp" DESC LIMIT 1`,
      [MOVIMENTADA]
    )
  ).rows[0];

  try {
    await t.test("SEM os índices: toda consulta quente lê a tabela inteira", async () => {
      for (const nome of Object.keys(CONSULTAS)) {
        const pl = await plano(cliente, nome, p);
        assert.match(pl, /Seq Scan on "Message"|Index (Only )?Scan using "Message_instanceId_idx"/, `${nome}:\n${pl}`);
        assert.doesNotMatch(pl, /balao_msg_/, nome);
      }
    });

    await t.test("indices.sql roda duas vezes sem erro", () => {
      psql(["-f", path.join(AQUI, "indices.sql")]);
      const saida = psql(["-f", path.join(AQUI, "indices.sql")]);
      for (const nome of ["balao_msg_key_id", "balao_msg_jid_ts", "balao_msg_inst_ts", "balao_msg_jidjson_ts", "balao_msg_jidalt_ts"]) {
        assert.match(saida, new RegExp(`${nome}\\s*\\|[^|]*\\|\\s*t`), `${nome} devia existir e estar válido:\n${saida}`);
      }
    });

    await t.test("índice que ficou INVÁLIDO (montagem interrompida) é refeito", async () => {
      // Simula o que sobra de um CREATE INDEX CONCURRENTLY interrompido.
      await cliente.query(`UPDATE pg_index SET indisvalid = false WHERE indexrelid = 'balao_msg_key_id'::regclass`);
      psql(["-f", path.join(AQUI, "indices.sql")]);
      const r = await cliente.query(`SELECT indisvalid FROM pg_index WHERE indexrelid = 'balao_msg_key_id'::regclass`);
      assert.strictEqual(r.rows[0].indisvalid, true);
    });

    await t.test("COM os índices: cada consulta quente usa o seu", async () => {
      for (const [nome, indice] of Object.entries(ESPERADO)) {
        const pl = await plano(cliente, nome, p);
        assert.ok(pl.includes(indice), `${nome} devia usar ${indice}:\n${pl}`);
        assert.doesNotMatch(pl, /Seq Scan on "Message"/, nome);
      }
    });

    await t.test("conversa @lid (remoteJidAlt) usa o índice parcial", async () => {
      const r = await cliente.query(
        `EXPLAIN SELECT "id" FROM "public"."Message"
         WHERE ("instanceId" = $1 AND ("key"#>ARRAY['remoteJidAlt']::text[])::jsonb::jsonb = $2::jsonb)
         ORDER BY "messageTimestamp" DESC LIMIT 80`,
        [INSTANCIA, JSON.stringify("5500000000099@s.whatsapp.net")]
      );
      assert.ok(r.rows.map((x) => x["QUERY PLAN"]).join("\n").includes("balao_msg_jidalt_ts"));
    });

    await t.test("comando preparado: o plano genérico perde o índice; force_custom_plan resolve", async () => {
      // O Prisma manda o caminho JSON como parâmetro: "key"#>ARRAY[$2]::text[].
      const preparar = `PREPARE contar(text, text, jsonb) AS
        SELECT COUNT(*) FROM (SELECT "id" FROM "public"."Message"
        WHERE ("instanceId" = $1 AND ("key"#>ARRAY[$2]::text[])::jsonb::jsonb = $3) OFFSET 0) AS sub`;
      const explicar = async () =>
        (await cliente.query(`EXPLAIN EXECUTE contar('${INSTANCIA}', 'remoteJid', '"${p.jid}"')`)).rows
          .map((x) => x["QUERY PLAN"])
          .join("\n");

      await cliente.query("SET plan_cache_mode = force_generic_plan");
      await cliente.query(preparar);
      const generico = await explicar();
      assert.doesNotMatch(generico, /balao_msg_/, `o plano genérico não tem como casar ARRAY[$2]:\n${generico}`);
      await cliente.query("DEALLOCATE contar");

      await cliente.query("SET plan_cache_mode = force_custom_plan");
      await cliente.query(preparar);
      for (let i = 0; i < 8; i++) {
        await cliente.query(`EXECUTE contar('${INSTANCIA}', 'remoteJid', '"${MOVIMENTADA}"')`);
      }
      const custom = await explicar();
      assert.ok(custom.includes("balao_msg_jidjson_ts"), `com force_custom_plan devia usar o índice:\n${custom}`);
      await cliente.query("DEALLOCATE contar");
    });
  } finally {
    await cliente.end();
  }
});
