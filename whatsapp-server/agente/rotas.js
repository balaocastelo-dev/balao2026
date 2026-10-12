// Rotas do agente JUL.IA.
//
// Duas portas, com fechaduras diferentes:
//   /api/agente/*         o computador do Thiago (cabeçalho x-agente-segredo,
//                         o conteúdo de DATA_ROOT/agente.segredo);
//   /api/comando/agente*  o painel (ingresso do site, como o resto do Comando).

const crypto = require("crypto");
const fs = require("fs");
const express = require("express");

// O que o agente pode ver de um produto. Custo, fornecedor e margem não
// saem daqui: o modelo não pode falar o que não recebeu.
const CAMPOS_DO_PRODUTO = [
  "id",
  "name",
  "price",
  "price_card",
  "discount_pix",
  "installment",
  "availability",
  "category",
  "brand",
  "slug",
  "image",
  "description",
  "specs",
];

function produtoParaOAgente(p) {
  const saida = {};
  for (const k of CAMPOS_DO_PRODUTO) if (p && p[k] != null && p[k] !== "") saida[k] = p[k];
  if (typeof saida.description === "string") saida.description = saida.description.slice(0, 1200);
  return saida;
}

function segredoConfere(recebido, esperado) {
  const a = Buffer.from(String(recebido || ""));
  const b = Buffer.from(String(esperado || ""));
  return a.length > 0 && a.length === b.length && crypto.timingSafeEqual(a, b);
}

function montarRotasDoAgente(app, { agente, segredo, abrirMidia, catalogo }) {
  const r = express.Router();
  const json = express.json({ limit: "2mb" });

  r.use((req, res, next) => {
    if (!segredoConfere(req.headers["x-agente-segredo"], segredo())) {
      return res.status(401).json({ ok: false, erro: "segredo inválido" });
    }
    if (!agente()) return res.status(503).json({ ok: false, erro: "agente ligando junto com o banco do CRM" });
    next();
  });

  const rota = (fn) => async (req, res) => {
    try {
      res.json({ ok: true, ...(await fn(req)) });
    } catch (erro) {
      const status = Number.isInteger(erro.status) ? erro.status : 500;
      if (status >= 500) console.error("[agente] erro:", erro);
      res.status(status).json({ ok: false, erro: erro.message });
    }
  };

  r.get(
    "/trabalho",
    rota(async () => ({ trabalho: await agente().proximoTrabalho(), config: agente().config }))
  );
  r.post("/resultado", json, rota(async (req) => agente().concluir(req.body)));
  r.post("/batida", json, rota(async (req) => agente().batida(req.body)));
  r.get(
    "/catalogo",
    rota(async () => {
      const { produtos, atualizadoEm } = catalogo();
      return { atualizadoEm, total: produtos.length, produtos: produtos.map(produtoParaOAgente) };
    })
  );
  r.get("/midia/:id", async (req, res) => {
    try {
      const m = await abrirMidia(req.params.id);
      if (!m?.caminho) return res.status(404).json({ ok: false, erro: "mídia não encontrada" });
      res.setHeader("content-type", m.mimetype || "application/octet-stream");
      fs.createReadStream(m.caminho).on("error", () => res.end()).pipe(res);
    } catch (erro) {
      res.status(404).json({ ok: false, erro: erro.message });
    }
  });

  app.use("/api/agente", r);
}

/** Dentro do roteador do Comando (já atrás do ingresso do painel). */
function montarRotasDoAgenteNoComando(r, { agente, json, rota, nomeDeQuem, acesso }) {
  const exigirAgente = () => {
    const a = agente();
    if (!a) throw Object.assign(new Error("O agente está ligando junto com o banco do CRM. Tente em alguns segundos."), { status: 503 });
    return a;
  };
  r.get("/agente", rota(async () => ({ agente: await exigirAgente().estado() })));
  r.put(
    "/agente",
    json,
    acesso.exigir(["admin"]),
    rota(async (req) => {
      const { modo, publico, vendaAutomatica } = req.body || {};
      const patch = {};
      if (modo !== undefined) patch.modo = modo;
      if (publico !== undefined) patch.publico = publico;
      if (vendaAutomatica !== undefined) patch.vendaAutomatica = Boolean(vendaAutomatica);
      return { config: await exigirAgente().configurar(patch, nomeDeQuem(req)) };
    })
  );
  r.get(
    "/agente/conversas/:chatId",
    rota(async (req) => ({
      conversa: await exigirAgente().porQue(req.params.chatId),
      sugestoes: exigirAgente().sugestoesDe(req.params.chatId),
    }))
  );
  r.post(
    "/agente/conversas/:chatId/pausar",
    rota(async (req) => (await exigirAgente().pausar(req.params.chatId, nomeDeQuem(req)), {}))
  );
  r.post(
    "/agente/conversas/:chatId/retomar",
    rota(async (req) => (await exigirAgente().retomar(req.params.chatId, `devolvida por ${nomeDeQuem(req) || "vendedor"}`), {}))
  );
  r.post(
    "/agente/sugestoes/:id/enviar",
    json,
    rota(async (req) =>
      exigirAgente().enviarSugestao(req.params.id, {
        vendedorId: req.quem?.vendedor?.id || null,
        respostas: req.body?.respostas || null,
      })
    )
  );
  r.post("/agente/sugestoes/:id/descartar", rota(async (req) => exigirAgente().descartarSugestao(req.params.id)));
}

module.exports = { montarRotasDoAgente, montarRotasDoAgenteNoComando, produtoParaOAgente, segredoConfere };
