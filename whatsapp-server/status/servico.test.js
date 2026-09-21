// Teste de integração do módulo de Status contra um Postgres de verdade.
// Uso: STATUS_DB_TESTE=postgresql://usuario:senha@host:porta/evolution node status/servico.test.js
const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { abrirBanco } = require("./db");
const { criarServicoDeStatus } = require("./servico");

const ADMIN = process.env.STATUS_DB_TESTE;
if (!ADMIN) {
  console.log("STATUS_DB_TESTE não definido — teste pulado.");
  process.exit(0);
}
const NOME = `balao_teste_${Date.now()}`;
const URL = ADMIN.replace(/\/[^/]+$/, `/${NOME}`);

let ok = 0;
const t = async (n, f) => { await f(); ok++; console.log("✓", n); };

(async () => {
  const db = await abrirBanco({ url: URL, urlAdmin: ADMIN, registrar: () => {} });
  const pasta = fs.mkdtempSync(path.join(os.tmpdir(), "status-"));
  const publicados = [];
  let modo = "ok";
  const evolution = {
    async publicarStatus(_inst, corpo) {
      await new Promise((r) => setTimeout(r, 50));
      if (modo === "recusa") throw Object.assign(new Error("Contacts not found"), { status: 400 });
      if (modo === "rede") throw Object.assign(new Error("fetch failed"), { status: 0 });
      publicados.push(corpo);
      return { key: { id: `ST${publicados.length}` } };
    },
  };
  const avisos = [];
  const s = criarServicoDeStatus({
    db, evolution, instancia: "loja", pasta,
    urlInternaBase: "http://balao-whats:4100", segredoInterno: "k",
    estaConectado: () => true, avisarPainel: (e) => avisos.push(e), registrar: () => {},
  });
  await s.iniciar();
  const admin = { papel: "admin" };
  const vend = { papel: "vendedor", vendedor: "brendon" };

  await t("assinatura entra uma vez e link vira linha própria", async () => {
    const c = await s.salvarConteudo({ texto: "Bom dia! Estamos abertos", link: "https://balao.info/pcgamer" }, vend);
    assert.match(c.textoFinal, /Bom dia! Estamos abertos\n\n👉 https:\/\/balao.info\/pcgamer\n\nBalão da Informática Castelo/);
    const sem = await s.salvarConteudo({ texto: "Sem assinatura", assinar: false }, vend);
    assert.equal(sem.textoFinal, "Sem assinatura");
  });

  await t("publicar agora: sai, grava execução e auditoria com o usuário", async () => {
    const c = await s.salvarConteudo({ titulo: "Oferta", texto: "Oferta da semana" }, vend);
    const r = await s.publicarAgora(c.id, vend);
    assert.equal(r.situacao, "publicado");
    assert.equal(publicados.at(-1).type, "text");
    assert.equal(publicados.at(-1).allContacts, true);
    const h = await s.historico({ conteudoId: c.id });
    assert.deepEqual(h.map((x) => x.acao).sort(), ["publicado", "status_criado"]);
    assert.ok(h.every((x) => x.usuario === "vendedor:brendon"));
  });

  await t("recusa da Evolution = falhou; queda de rede = incerto; nova tentativa", async () => {
    const c = await s.salvarConteudo({ texto: "Teste de falha" }, admin);
    modo = "recusa";
    const r1 = await s.publicarAgora(c.id, admin);
    assert.equal(r1.situacao, "falhou");
    modo = "rede";
    const r2 = await s.publicarAgora(c.id, admin);
    assert.equal(r2.situacao, "incerto");
    modo = "ok";
    const r3 = await s.tentarNovamente(r2.execucaoId, admin);
    assert.equal(r3.situacao, "publicado");
  });

  await t("agendador: dois ticks ao mesmo tempo publicam UMA vez", async () => {
    const c = await s.salvarConteudo({ texto: "Últimas unidades" }, admin);
    const ag = await s.agendar(c.id, { tipo: "diaria", horarios: ["08:00"] }, admin);
    // força a ocorrência para "agora"
    await db.query("UPDATE status_agendamento SET proxima_em = now() - interval '5 seconds' WHERE id=$1", [ag.id]);
    const antes = publicados.length;
    await Promise.all([s.tick(), s.tick(), s.tick()]);
    // um segundo processo (reinício) não repete a mesma ocorrência
    const s2 = criarServicoDeStatus({ db, evolution, instancia: "loja", pasta, urlInternaBase: "x", segredoInterno: "k", estaConectado: () => true, avisarPainel: () => {}, registrar: () => {} });
    await s2.carregarConfig();
    await s2.tick();
    assert.equal(publicados.length - antes, 1);
    const a = (await db.query("SELECT * FROM status_agendamento WHERE id=$1", [ag.id])).rows[0];
    assert.equal(a.situacao, "ativo");
    assert.ok(new Date(a.proxima_em) > new Date(), "próxima ocorrência no futuro");
  });

  await t("ocorrência muito atrasada vira 'perdido' e não publica fora de hora", async () => {
    const c = await s.salvarConteudo({ texto: "Bom dia atrasado" }, admin);
    const ag = await s.agendar(c.id, { tipo: "diaria", horarios: ["08:00"] }, admin);
    await db.query("UPDATE status_agendamento SET proxima_em = now() - interval '3 hours' WHERE id=$1", [ag.id]);
    const antes = publicados.length;
    await s.tick();
    assert.equal(publicados.length, antes);
    const e = (await db.query("SELECT situacao FROM status_execucao WHERE agendamento_id=$1", [ag.id])).rows;
    assert.deepEqual(e.map((x) => x.situacao), ["perdido"]);
  });

  await t("publicação única finaliza o agendamento", async () => {
    const c = await s.salvarConteudo({ texto: "Única" }, admin);
    const amanha = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    const ag = await s.agendar(c.id, { tipo: "unica", data: amanha, hora: "10:00" }, admin);
    // simula o momento da publicação: regra e próxima_em = 1 minuto atrás
    const R = require("./recorrencia");
    const alvo = Date.now() - 60_000;
    const { data } = R.dataLocal(alvo);
    const hora = new Date(alvo).toLocaleTimeString("pt-BR", { timeZone: R.FUSO, hour: "2-digit", minute: "2-digit", hour12: false });
    const t0 = R.instante(data, hora);
    await db.query("UPDATE status_agendamento SET regra=$2, proxima_em=$3 WHERE id=$1", [ag.id, { tipo: "unica", data, hora }, new Date(t0)]);
    await s.tick();
    const a = (await db.query("SELECT situacao, proxima_em FROM status_agendamento WHERE id=$1", [ag.id])).rows[0];
    assert.equal(a.situacao, "finalizado");
    assert.equal(a.proxima_em, null);
  });

  await t("reinício no meio da publicação vira 'incerto' (nunca repete sozinho)", async () => {
    const c = await s.salvarConteudo({ texto: "Interrompido" }, admin);
    await db.query(
      `INSERT INTO status_execucao (id, chave, conteudo_id, previsto_para, situacao, origem, disparado_por)
       VALUES (gen_random_uuid(), 'manual:travado', $1, now(), 'publicando', 'manual', 'admin')`, [c.id]);
    const s3 = criarServicoDeStatus({ db, evolution, instancia: "loja", pasta, urlInternaBase: "x", segredoInterno: "k", estaConectado: () => true, avisarPainel: () => {}, registrar: () => {} });
    await s3.iniciar();
    const e = (await db.query("SELECT situacao FROM status_execucao WHERE chave='manual:travado'")).rows[0];
    assert.equal(e.situacao, "incerto");
  });

  await t("pausar, reativar, reagendar e cancelar ficam no histórico", async () => {
    const c = await s.salvarConteudo({ texto: "Pausável" }, admin);
    const ag = await s.agendar(c.id, { tipo: "semanal", dias: [1], horarios: ["09:00"] }, admin);
    await s.alterarAgendamento(ag.id, { situacao: "pausado" }, admin);
    await s.alterarAgendamento(ag.id, { situacao: "ativo" }, admin);
    await s.alterarAgendamento(ag.id, { regra: { tipo: "dias_uteis", horarios: ["08:30"] } }, admin);
    await s.alterarAgendamento(ag.id, { situacao: "cancelado" }, admin);
    const acoes = (await s.historico({ conteudoId: c.id })).map((h) => h.acao).reverse();
    assert.deepEqual(acoes, ["status_criado", "agendado", "pausado", "reativado", "reagendado", "cancelado"]);
  });

  await t("imagem: normaliza para JPG, gera selo e publica com URL interna + legenda", async () => {
    const png = fs.readFileSync(path.join(__dirname, "..", "evo", "amostras", "foto.jpg")).toString("base64");
    const c = await s.salvarConteudo({ texto: "Notebook i5 em oferta", midiaDataUrl: `data:image/jpeg;base64,${png}`, selo: true }, admin);
    assert.equal(c.tipo, "imagem");
    const r = await s.publicarAgora(c.id, admin);
    assert.equal(r.situacao, "publicado");
    const ult = publicados.at(-1);
    assert.equal(ult.type, "image");
    assert.match(ult.content, /^http:\/\/balao-whats:4100\/interno\/status\/.+-selo\.jpg\?k=k$/);
    assert.match(ult.caption, /Notebook i5 em oferta[\s\S]*balao\.info/);
  });

  await t("calendário e alerta de dias sem status", async () => {
    const hoje = new Date();
    const cal = await s.calendario(hoje.getTime(), hoje.getTime() + 7 * 86400000);
    assert.ok(Array.isArray(cal.itens));
    const res = await s.resumo();
    assert.ok(Array.isArray(res.alertas.diasSemStatus));
    assert.ok(res.conteudos.length > 5);
  });

  await t("biblioteca: salvar como modelo e usar de novo", async () => {
    const c = await s.salvarConteudo({ texto: "Estamos abertos até as 18h", categoria: "Horário de funcionamento" }, admin);
    const m = await s.duplicarConteudo(c.id, admin, { comoModelo: true });
    assert.equal(m.modelo, true);
    const uso = await s.duplicarConteudo(m.id, admin, { comoModelo: false });
    assert.equal(uso.modelo, false);
    assert.equal(uso.categoria, "Horário de funcionamento");
  });

  await db.pool.end();
  const { Pool } = require("pg");
  const adm = new Pool({ connectionString: ADMIN });
  await adm.query(`DROP DATABASE "${NOME}"`);
  await adm.end();
  console.log(`\n${ok} testes ok`);
})().catch((e) => { console.error(e); process.exit(1); });
