// Rotas HTTP do módulo de Status. Todas exigem o ingresso do painel, menos
// /interno/status/*, que só a Evolution usa (rede interna + chave secreta).

const fs = require("fs");
const crypto = require("crypto");
const express = require("express");
const { ErroStatus } = require("./servico");

function montarRotasDeStatus(app, { acesso, servico, segredoInterno }) {
  const r = express.Router();
  const json = express.json({ limit: "85mb" });

  const rota = (fn) => async (req, res) => {
    try {
      const saida = await fn(req);
      res.json({ ok: true, ...(saida && typeof saida === "object" && !Array.isArray(saida) ? saida : { dados: saida }) });
    } catch (erro) {
      const status =
        erro instanceof ErroStatus || Number.isInteger(erro.status)
          ? erro.status
          : /inválid|precisa|Escolha|passou|máx|não existe/i.test(erro.message)
          ? 400
          : 500;
      if (status >= 500) console.error("[status] erro:", erro);
      res.status(status).json({ ok: false, erro: erro.message });
    }
  };

  r.use(acesso.exigir());

  r.get("/resumo", rota(() => servico.resumo()));
  r.get("/calendario", rota((req) => servico.calendario(Date.parse(req.query.de), Date.parse(req.query.ate))));
  r.get("/historico", rota(async (req) => ({ itens: await servico.historico({ limite: req.query.limite, conteudoId: req.query.conteudo || null }) })));
  r.get("/recebidos", rota(async () => ({ itens: await servico.recebidos() })));

  r.post("/recebidos/visto", json, rota(async (req) => (await servico.marcarVisto(req.body?.ids, req.quem), {})));
  r.post("/conteudos", json, rota(async (req) => ({ conteudo: await servico.salvarConteudo(req.body || {}, req.quem) })));
  r.post("/conteudos/:id/duplicar", json, rota(async (req) => ({
    conteudo: await servico.duplicarConteudo(req.params.id, req.quem, { comoModelo: req.body?.comoModelo ?? null }),
  })));
  r.delete("/conteudos/:id", rota(async (req) => (await servico.excluirConteudo(req.params.id, req.quem), {})));
  r.post("/conteudos/:id/publicar", json, rota(async (req) => ({ resultado: await servico.publicarAgora(req.params.id, req.quem) })));
  r.post("/agendamentos", json, rota(async (req) => ({
    agendamento: await servico.agendar(req.body?.conteudoId, req.body?.regra, req.quem),
  })));
  r.patch("/agendamentos/:id", json, rota(async (req) => ({
    agendamento: await servico.alterarAgendamento(req.params.id, req.body || {}, req.quem),
  })));
  r.post("/execucoes/:id/tentar-novamente", json, rota(async (req) => ({ resultado: await servico.tentarNovamente(req.params.id, req.quem) })));
  r.put("/config", json, acesso.exigir(["admin"]), rota(async (req) => ({ config: await servico.salvarConfig(req.body || {}, req.quem) })));

  // Miniaturas e prévias para o painel.
  r.get("/midia/:arquivo", (req, res) => {
    const arquivo = servico.caminho(req.params.arquivo);
    if (!fs.existsSync(arquivo)) return res.status(404).end();
    res.setHeader("Cache-Control", "private, max-age=86400");
    res.sendFile(arquivo);
  });
  r.get("/midia/:arquivo/selo", async (req, res) => {
    try {
      const nome = await servico.comSelo(req.params.arquivo);
      res.setHeader("Cache-Control", "private, max-age=86400");
      res.sendFile(servico.caminho(nome));
    } catch {
      res.status(404).end();
    }
  });

  app.use("/api/status", r);

  // A Evolution baixa daqui a imagem/vídeo na hora de publicar (ela só
  // aceita URL para mídia de status).
  app.get("/interno/status/:arquivo", (req, res) => {
    const k = String(req.query.k || "");
    const ok = k.length === segredoInterno.length && crypto.timingSafeEqual(Buffer.from(k), Buffer.from(segredoInterno));
    if (!ok) return res.status(404).end();
    const arquivo = servico.caminho(req.params.arquivo);
    if (!fs.existsSync(arquivo)) return res.status(404).end();
    res.sendFile(arquivo);
  });
}

module.exports = { montarRotasDeStatus };
