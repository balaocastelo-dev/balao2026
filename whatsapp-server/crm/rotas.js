// Rotas HTTP do Centro de Comando. Tudo atrás do ingresso do painel.
//
// Ficam sob /api/comando/* para não se misturar com as rotas antigas do CRM
// (/api/crm/*), que continuam valendo e não mudaram.

const express = require("express");

function montarRotasDoCrm(app, { acesso, servico, equipe }) {
  const r = express.Router();
  const json = express.json({ limit: "2mb" });

  const rota = (fn) => async (req, res) => {
    try {
      const saida = await fn(req);
      res.json({ ok: true, ...(saida && typeof saida === "object" && !Array.isArray(saida) ? saida : { dados: saida }) });
    } catch (erro) {
      const status = Number.isInteger(erro.status) ? erro.status : 500;
      if (status >= 500) console.error("[comando] erro:", erro);
      res.status(status).json({ ok: false, erro: erro.message });
    }
  };

  r.use(acesso.exigir());

  // ---- painel da operação ----
  r.get("/resumo", rota((req) => servico.resumo({ dias: req.query.dias })));
  r.get("/fila", rota(async (req) => ({ itens: await servico.fila({ limite: req.query.limite }) })));
  r.get("/estado", rota(async () => ({ estado: await servico.estado() })));
  // Relê o passado com as regras de assunto atuais (quando elas melhoram).
  r.post(
    "/reprocessar-interesses",
    json,
    acesso.exigir(["admin"]),
    rota(async (req) => servico.reprocessarInteresses({ desdeDias: req.body?.dias }))
  );

  // ---- clientes ----
  r.get(
    "/contatos",
    rota((req) =>
      servico.contatos({
        texto: req.query.q || "",
        interesse: req.query.interesse || "",
        etiqueta: req.query.etiqueta || "",
        etapa: req.query.etapa || "",
        vendedorId: req.query.vendedor || "",
        semCompraDias: req.query.parados || 0,
        optin: req.query.optin === "1" ? true : req.query.optin === "0" ? false : null,
        limite: req.query.limite,
        pagina: req.query.pagina,
      })
    )
  );
  r.get(
    "/contatos/:chatId",
    rota(async (req) => {
      const c = await servico.contato(req.params.chatId);
      if (!c) throw Object.assign(new Error("Contato não encontrado."), { status: 404 });
      return { contato: c };
    })
  );
  r.get("/segmentos", rota(async () => ({ itens: await servico.segmentos() })));
  r.get("/buscar", rota(async (req) => ({ itens: await servico.buscarMensagens({ texto: req.query.q, limite: req.query.limite }) })));

  // ---- etiquetas ----
  r.get("/etiquetas", rota(async () => ({ itens: await servico.listarEtiquetas() })));
  r.post("/etiquetas", json, rota(async (req) => ({ id: await servico.salvarEtiqueta(req.body || {}) })));
  r.delete("/etiquetas/:id", rota(async (req) => (await servico.excluirEtiqueta(req.params.id), {})));
  r.post(
    "/contatos/:chatId/etiquetas",
    json,
    rota(async (req) => {
      await servico.marcarEtiqueta(req.params.chatId, req.body?.etiquetaId, req.body?.ligada !== false, nomeDeQuem(req));
      return {};
    })
  );

  // ---- notas ----
  r.post(
    "/contatos/:chatId/notas",
    json,
    rota(async (req) => ({
      nota: await servico.adicionarNota({ chatId: req.params.chatId, texto: req.body?.texto, autor: nomeDeQuem(req) }),
    }))
  );
  r.delete("/notas/:id", rota(async (req) => (await servico.excluirNota(req.params.id), {})));

  // ---- respostas rápidas ----
  r.get("/respostas", rota(async () => ({ itens: await servico.listarRespostas() })));
  r.post("/respostas", json, rota(async (req) => ({ id: await servico.salvarResposta({ ...(req.body || {}), criadoPor: nomeDeQuem(req) }) })));
  r.delete("/respostas/:id", rota(async (req) => (await servico.excluirResposta(req.params.id), {})));

  // ---- consentimento (LGPD) ----
  r.post(
    "/contatos/:chatId/consentimento",
    json,
    rota(async (req) => {
      await servico.registrarConsentimento({
        chatId: req.params.chatId,
        acao: req.body?.acao,
        canal: req.body?.canal || "painel",
        texto: req.body?.texto || null,
        finalidade: req.body?.finalidade || null,
        por: nomeDeQuem(req),
      });
      return {};
    })
  );

  // ---- equipe ----
  r.get("/equipe", rota(async () => ({ itens: equipe.listar() })));
  r.post(
    "/equipe",
    json,
    acesso.exigir(["admin"]),
    rota(async (req) => ({ vendedor: equipe.salvar(req.body || {}) }))
  );
  r.delete("/equipe/:id", acesso.exigir(["admin"]), rota(async (req) => (equipe.remover(req.params.id), {})));

  app.use("/api/comando", r);
}

function nomeDeQuem(req) {
  return req.quem?.vendedor?.nome || req.quem?.papel || null;
}

module.exports = { montarRotasDoCrm };
