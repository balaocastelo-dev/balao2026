// Copia o histórico de mensagens da Evolution para o banco da loja (crm_mensagem).
//
// Por quê: o painel agora abre a conversa lendo o crm_mensagem (índice por
// conversa e data) e só vai à Evolution quando falta mensagem. Mas o
// crm_mensagem só tem o que passou pelo servidor desde que o Centro de Comando
// ligou; o passado está só na tabela "Message" da Evolution. Rodar isto uma
// vez, depois do deploy, traz esse passado — e a Evolution deixa de ser
// consultada para abrir conversa.
//
// Como roda (na VPS, como root; o deploy-evo.sh tem um atalho):
//   bash /opt/balao2026/whatsapp-server/deploy-evo.sh importar
// que é o mesmo que:
//   docker compose -p balaoevo ... exec balao-whats node crm/importar-da-evolution.js
//
// Opções: --lote=1000  --desde=2026-01-01  --seco (só conta, não grava)
//         --interesses (no fim, recalcula os interesses com o histórico novo)
//
// Garantias:
//   - lê a Evolution DIRETO no Postgres (mesmo servidor, banco "evolution"),
//     em lotes por ordem de data, sem passar pela API dela (que conta a
//     tabela inteira a cada página);
//   - idempotente: rodar de novo não duplica nada (a chave é o id da
//     mensagem); linha que já existia só ganha o que faltava (chave, citação,
//     @lid...), e não ganha seq novo à toa;
//   - não escreve nada na Evolution;
//   - NÃO imprime conteúdo: só contagens, lotes e datas (dia).

const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
const N = require("../evo/normalizar");
const { abrirBanco } = require("./db");
const { criarServicoDoCrm } = require("./servico");
const { paraOBanco } = require("./formato");

function opcoes(argv) {
  const o = { lote: 1000, desde: null, seco: false, interesses: false };
  for (const a of argv) {
    if (a === "--seco") o.seco = true;
    else if (a === "--interesses") o.interesses = true;
    else if (a.startsWith("--lote=")) o.lote = Math.min(5000, Math.max(50, Number(a.slice(7)) || 1000));
    else if (a.startsWith("--desde=")) o.desde = Math.floor(Date.parse(a.slice(8)) / 1000) || null;
  }
  return o;
}

/** lids, nomes e transcrições que o servidor aprendeu (panel-data.json). */
function lerPainel(dataRoot) {
  try {
    const p = JSON.parse(fs.readFileSync(path.join(dataRoot, "data", "panel-data.json"), "utf8"));
    return { lids: p.lids || {}, nomes: p.nomes || {}, transcricoes: p.transcricoes || {} };
  } catch {
    return { lids: {}, nomes: {}, transcricoes: {} };
  }
}

const COLUNAS = [
  "id", "chat_id", "direcao", "corpo", "tipo_midia", "mime", "nome_midia", "transcricao",
  "produto_id", "produto_nome", "origem", "situacao", "em", "chave", "de_mim", "midia", "citada", "lid",
];

/**
 * A Evolution às vezes guarda a mesma mensagem duas vezes (mesmo id: uma pelo
 * @lid e outra pelo número, ou a do histórico e a do webhook). Num lote só, o
 * Postgres recusa o INSERT inteiro ("ON CONFLICT DO UPDATE command cannot
 * affect row a second time"; aconteceu na loja em 12/10/2026). Fica uma linha
 * por id: a da conversa pelo número (@c.us) quando houver, completada com o
 * que a outra cópia tinha.
 */
function juntarRepetidas(linhas) {
  const porId = new Map();
  let repetidas = 0;
  for (const l of linhas) {
    if (!l) continue;
    const ja = porId.get(l.id);
    if (!ja) {
      porId.set(l.id, l);
      continue;
    }
    repetidas++;
    const pelaNova = !String(ja.chatId).endsWith("@c.us") && String(l.chatId).endsWith("@c.us");
    const [fica, outra] = pelaNova ? [{ ...l }, ja] : [{ ...ja }, l];
    for (const [k, v] of Object.entries(outra)) {
      if ((fica[k] == null || fica[k] === "") && v != null && v !== "") fica[k] = v;
    }
    porId.set(l.id, fica);
  }
  return { linhas: [...porId.values()], repetidas };
}

/** Grava um lote; devolve { novas, completadas }. */
async function gravarLote(db, linhas) {
  if (!linhas.length) return { novas: 0, completadas: 0 };
  const valores = [];
  const tuplas = linhas.map((l, i) => {
    const base = i * COLUNAS.length;
    valores.push(
      l.id, l.chatId, l.direcao, String(l.corpo || "").slice(0, 8000), l.tipoMidia, l.mime, l.nomeMidia, l.transcricao,
      l.produtoId, l.produtoNome, "importacao", l.situacao, new Date(l.timestamp),
      l.chave ? JSON.stringify(l.chave) : null, l.deMim, l.midia ? JSON.stringify(l.midia) : null,
      l.citada ? JSON.stringify(l.citada) : null, l.lid
    );
    return `(${COLUNAS.map((_, j) => `$${base + j + 1}`).join(",")})`;
  });
  const r = await db.query(
    `INSERT INTO crm_mensagem (${COLUNAS.join(",")}) VALUES ${tuplas.join(",")}
     ON CONFLICT (id) DO UPDATE SET
       chave       = COALESCE(crm_mensagem.chave, EXCLUDED.chave),
       de_mim      = COALESCE(crm_mensagem.de_mim, EXCLUDED.de_mim),
       midia       = COALESCE(crm_mensagem.midia, EXCLUDED.midia),
       citada      = COALESCE(crm_mensagem.citada, EXCLUDED.citada),
       lid         = COALESCE(crm_mensagem.lid, EXCLUDED.lid),
       transcricao = COALESCE(crm_mensagem.transcricao, EXCLUDED.transcricao)
     WHERE crm_mensagem.chave IS NULL OR crm_mensagem.de_mim IS NULL
        OR (crm_mensagem.midia IS NULL AND EXCLUDED.midia IS NOT NULL)
        OR (crm_mensagem.citada IS NULL AND EXCLUDED.citada IS NOT NULL)
        OR (crm_mensagem.lid IS NULL AND EXCLUDED.lid IS NOT NULL)
        OR (crm_mensagem.transcricao IS NULL AND EXCLUDED.transcricao IS NOT NULL)
     RETURNING (xmax = 0) AS nova`,
    valores
  );
  const novas = r.rows.filter((x) => x.nova).length;
  return { novas, completadas: r.rowCount - novas };
}

/** Contatos: cria quem só existe nas mensagens e refaz totais e "última" pelo crm_mensagem. */
async function refazerContatos(db, nomes) {
  await db.query(
    `INSERT INTO crm_contato (chat_id, numero, primeira_em, ultima_em)
     SELECT chat_id,
            CASE WHEN chat_id LIKE '%@c.us' THEN split_part(chat_id, '@', 1) END,
            min(em), max(em)
     FROM crm_mensagem GROUP BY chat_id
     ON CONFLICT (chat_id) DO NOTHING`
  );
  await db.query(
    `WITH agg AS (
       SELECT chat_id, min(em) AS primeira, max(em) AS ultima,
              count(*) FILTER (WHERE direcao = 'in')::int AS entradas,
              count(*) FILTER (WHERE direcao = 'out')::int AS saidas
       FROM crm_mensagem GROUP BY chat_id
     ), ultima AS (
       SELECT DISTINCT ON (chat_id) chat_id, direcao,
              CASE WHEN corpo <> '' THEN left(corpo, 120) ELSE '' END AS previa
       FROM crm_mensagem ORDER BY chat_id, em DESC
     )
     UPDATE crm_contato c SET
       primeira_em = agg.primeira, ultima_em = agg.ultima,
       total_entrada = agg.entradas, total_saida = agg.saidas,
       ultima_direcao = ultima.direcao,
       ultima_previa = COALESCE(NULLIF(ultima.previa, ''), c.ultima_previa),
       atualizado_em = now()
     FROM agg JOIN ultima USING (chat_id)
     WHERE c.chat_id = agg.chat_id`
  );
  // Nome que o próprio cliente usa no WhatsApp (o servidor aprendeu).
  const pares = Object.entries(nomes || {});
  for (let i = 0; i < pares.length; i += 1000) {
    const fatia = pares.slice(i, i + 1000);
    await db.query(
      `UPDATE crm_contato c SET nome_whatsapp = COALESCE(c.nome_whatsapp, v.nome)
       FROM unnest($1::text[], $2::text[]) AS v(chat_id, nome) WHERE c.chat_id = v.chat_id`,
      [fatia.map((p) => p[0]), fatia.map((p) => String(p[1]).slice(0, 200))]
    );
  }
}

async function importar({
  urlEvolution,
  urlLoja,
  urlLojaAdmin,
  instancia = "loja",
  dataRoot = process.env.DATA_ROOT || path.join(__dirname, ".."),
  lote = 1000,
  desde = null,
  seco = false,
  interesses = false,
  registrar = console.log,
}) {
  const origem = new Pool({ connectionString: urlEvolution, max: 2 });
  const db = seco ? null : await abrirBanco({ url: urlLoja, urlAdmin: urlLojaAdmin, registrar });
  const painel = lerPainel(dataRoot);
  const lidParaNumero = (l) => painel.lids[l] || null;
  const total = { lidas: 0, gravaveis: 0, novas: 0, completadas: 0, reacoes: 0, puladas: 0, repetidas: 0, lotes: 0 };

  try {
    const inst = await origem.query(`SELECT id, "ownerJid" FROM "Instance" WHERE name = $1`, [instancia]);
    if (!inst.rowCount) throw new Error(`instância "${instancia}" não existe na Evolution`);
    const instanceId = inst.rows[0].id;
    const numeroDaLoja = N.digitos(inst.rows[0].ownerJid || "");
    const conta = await origem.query(
      `SELECT count(*)::int AS n, min("messageTimestamp") AS de, max("messageTimestamp") AS ate
       FROM "Message" WHERE "instanceId" = $1 AND ($2::int IS NULL OR "messageTimestamp" >= $2)`,
      [instanceId, desde]
    );
    const dia = (s) => (s ? new Date(s * 1000).toISOString().slice(0, 10) : "-");
    registrar(`[importar] ${conta.rows[0].n} mensagem(ns) na Evolution, de ${dia(conta.rows[0].de)} a ${dia(conta.rows[0].ate)}.`);

    const reacoes = [];
    let cursor = { ts: desde ?? -1, id: "" };
    for (;;) {
      // Página pela ordem de data (e id, para desempatar): com o índice
      // balao_msg_inst_ts cada lote lê só o que devolve.
      const r = await origem.query(
        `SELECT "id", "key", "pushName", "messageType", "message", "contextInfo", "messageTimestamp", "status"
         FROM "Message"
         WHERE "instanceId" = $1
           AND "messageTimestamp" >= $2
           AND ("messageTimestamp" > $2 OR "id" > $3)
         ORDER BY "messageTimestamp", "id"
         LIMIT $4`,
        [instanceId, cursor.ts, cursor.id, lote]
      );
      if (!r.rowCount) break;
      total.lotes++;
      const linhas = [];
      for (const rec of r.rows) {
        total.lidas++;
        if (rec.key?.remoteJid === "status@broadcast") {
          total.puladas++;
          continue;
        }
        const ev = N.extrairEvento(rec);
        if (ev?.tipo === "reacao") {
          reacoes.push({ alvoId: ev.alvoId, reacao: { de: ev.deMim ? "loja" : "cliente", emoji: ev.emoji, em: ev.em } });
          continue;
        }
        const m = N.normalizarMensagem(rec, { lidParaNumero, numeroDaLoja });
        if (!m) {
          total.puladas++;
          continue;
        }
        if (painel.transcricoes[m.id]) m.transcricao = painel.transcricoes[m.id];
        const linha = paraOBanco(m);
        if (linha) linhas.push(linha);
        else total.puladas++;
      }
      const { linhas: unicas, repetidas } = juntarRepetidas(linhas);
      total.repetidas += repetidas;
      total.gravaveis += unicas.length;
      if (!seco) {
        const g = await gravarLote(db, unicas);
        total.novas += g.novas;
        total.completadas += g.completadas;
      }
      const ultimo = r.rows[r.rows.length - 1];
      cursor = { ts: ultimo.messageTimestamp, id: ultimo.id };
      if (total.lotes % 20 === 0) {
        registrar(`[importar] ${total.lidas} lidas (até ${dia(cursor.ts)}): ${total.novas} novas, ${total.completadas} completadas.`);
      }
    }

    if (!seco) {
      // Reações por último: a mensagem-alvo já está no banco. A ordem de data
      // garante que a última reação de cada pessoa é a que fica.
      const crm = criarServicoDoCrm({ db, registrar: () => {} });
      for (const x of reacoes) {
        if (await crm.atualizarMensagemSemQuebrar(x.alvoId, { reacao: x.reacao })) total.reacoes++;
      }
      registrar("[importar] Refazendo os totais dos contatos...");
      await refazerContatos(db, painel.nomes);
      if (interesses) {
        registrar("[importar] Recalculando interesses com o histórico...");
        await crm.reprocessarInteresses({ desdeDias: 3650 });
      }
    }
    registrar(
      `[importar] Pronto${seco ? " (seco: nada gravado)" : ""}: ${total.lidas} lidas em ${total.lotes} lote(s); ` +
        `${total.gravaveis} de conversa; ${total.novas} novas no banco da loja; ${total.completadas} completadas; ` +
        `${total.reacoes} reação(ões); ${total.repetidas} repetida(s) na Evolution (gravadas uma vez); ` +
        `${total.puladas} fora do atendimento (grupo, status, controle).`
    );
    return total;
  } finally {
    await origem.end();
    await db?.pool.end();
  }
}

if (require.main === module) {
  const o = opcoes(process.argv.slice(2));
  const urlEvolution = process.env.EVOLUTION_DB_URL || process.env.STATUS_DB_URL_ADMIN;
  const urlLoja = process.env.CRM_DB_URL || process.env.STATUS_DB_URL;
  if (!urlEvolution || !urlLoja) {
    console.error("Faltam EVOLUTION_DB_URL (ou STATUS_DB_URL_ADMIN) e CRM_DB_URL (ou STATUS_DB_URL). Rode dentro do container balao-whats.");
    process.exit(2);
  }
  importar({
    urlEvolution,
    urlLoja,
    urlLojaAdmin: process.env.CRM_DB_URL_ADMIN || process.env.STATUS_DB_URL_ADMIN,
    instancia: process.env.EVOLUTION_INSTANCIA || "loja",
    ...o,
  }).catch((e) => {
    console.error("[importar] Falhou:", e.message);
    process.exit(1);
  });
}

module.exports = { importar, opcoes, juntarRepetidas };
