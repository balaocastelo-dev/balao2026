// Rotas do disparo por tema (crm/campanha.js), dentro de /api/comando.
// Valem para admin e vendedor logado, como as demais do Centro de Comando —
// quem monta o Router (crm/rotas.js) já exige o ingresso do painel.

function montarRotasDeCampanha(r, { campanhas, json, rota, nomeDeQuem }) {
  // Quantos e quem receberiam, sem gravar nada.
  r.post(
    "/campanhas/previa",
    json,
    rota((req) => campanhas.previa(req.body?.filtro || {}, { texto: req.body?.texto || null }))
  );
  // Só para os números de teste do Thiago (fixos no código). Pedido com
  // qualquer outro número é recusado inteiro (400), sem mandar nada.
  r.post(
    "/campanhas/teste",
    json,
    rota((req) =>
      campanhas.enviarTeste({ texto: req.body?.texto, numeros: req.body?.numeros ?? null, por: nomeDeQuem(req) })
    )
  );
  r.get("/campanhas", rota((req) => campanhas.listar({ limite: req.query.limite })));
  r.post(
    "/campanhas",
    json,
    rota(async (req) => ({
      campanha: await campanhas.criar({
        nome: req.body?.nome,
        texto: req.body?.texto,
        filtro: req.body?.filtro || {},
        por: nomeDeQuem(req),
      }),
    }))
  );
  for (const acao of ["pausar", "retomar", "cancelar"]) {
    r.post(
      `/campanhas/:id/${acao}`,
      rota(async (req) => ({ campanha: await campanhas.mudarEstado(req.params.id, acao, nomeDeQuem(req)) }))
    );
  }
}

module.exports = { montarRotasDeCampanha };
