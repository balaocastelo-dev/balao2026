// ============================================================
// Espelho do catálogo do site.
//
// Por que existe: o banco da Hostinger aceita 500 conexões por HORA. Quando a
// cota estoura, o site e o CRM ficam sem catálogo até a hora virar — e o
// vendedor fica sem preço para mandar no meio de um atendimento.
//
// Esta VPS já roda 24 horas por dia e tem disco. Então ela guarda uma cópia do
// catálogo e serve essa cópia quando o banco recusa. A Hostinger continua dona
// do dado: aqui é só espelho, nada é editado.
//
// Fica fora do server.js de propósito — é uma função pura sobre disco e rede,
// então dá para testar sem subir o WhatsApp nem o Chromium.
// ============================================================

const fs = require("fs");
const path = require("path");

/**
 * @param {object} opcoes
 * @param {string} opcoes.pasta      Onde gravar o catalogo.json (volume da VPS).
 * @param {string} opcoes.urlDoSite  Base do site, ex.: https://www.balao.info
 * @param {Function} [opcoes.buscar] `fetch`, trocável no teste.
 * @param {Function} [opcoes.registrar] Log, trocável no teste.
 */
function criarEspelhoDoCatalogo({ pasta, urlDoSite, buscar, registrar = console.log }) {
  const arquivo = path.join(pasta, "catalogo.json");
  const arquivoTemporario = `${arquivo}.tmp`;
  const pegar = buscar || (typeof fetch === "function" ? fetch : null);

  const estado = {
    atualizadoEm: null,
    total: 0,
    categorias: 0,
    ultimaTentativaEm: null,
    ultimoErro: null,
    atualizando: false,
  };

  let memoria = null;

  function ler() {
    if (memoria) return memoria;

    try {
      if (!fs.existsSync(arquivo)) {
        return { produtos: [], categorias: [], total: 0, atualizadoEm: null };
      }
      const conteudo = JSON.parse(fs.readFileSync(arquivo, "utf8"));
      const produtos = Array.isArray(conteudo?.produtos) ? conteudo.produtos : [];
      const categorias = Array.isArray(conteudo?.categorias) ? conteudo.categorias : [];
      memoria = {
        produtos,
        categorias,
        total: produtos.length,
        atualizadoEm: conteudo?.atualizadoEm || null,
      };
      estado.atualizadoEm = memoria.atualizadoEm;
      estado.total = memoria.total;
      return memoria;
    } catch (erro) {
      registrar("[catalogo] Não consegui ler o espelho:", erro.message);
      return { produtos: [], categorias: [], total: 0, atualizadoEm: null };
    }
  }

  /**
   * Uma lista só vale como catálogo se tiver produto de verdade.
   *
   * Quando a cota do banco estoura, o site responde uma lista VAZIA em vez de
   * um erro. Gravar isso por cima do espelho apagaria justamente a cópia que
   * existe para esse momento — o espelho ficaria vazio exatamente quando é
   * mais necessário.
   */
  function pareceCatalogo(dados) {
    if (!Array.isArray(dados) || dados.length === 0) return false;
    return dados.some((p) => p && (p.id !== undefined || p.slug !== undefined) && p.name);
  }

  async function atualizar({ motivo = "agendado" } = {}) {
    if (!pegar) {
      estado.ultimoErro = "sem fetch disponível nesta versão do Node";
      return { ok: false, erro: estado.ultimoErro };
    }
    if (estado.atualizando) return { ok: false, erro: "já está atualizando" };

    estado.atualizando = true;
    estado.ultimaTentativaEm = Date.now();

    try {
      // `origem=banco` faz o site ler o banco direto, sem cache e sem a
      // cópia daqui — senão o espelho se alimentaria de si mesmo e gravaria
      // dado velho com data nova.
      const base = String(urlDoSite).replace(/\/$/, "");
      const endereco = `${base}/api/products?origem=banco`;
      const resposta = await pegar(endereco, {
        headers: { accept: "application/json" },
        // O site pode estar lento; melhor desistir e manter a cópia antiga do
        // que segurar a atualização para sempre.
        signal: AbortSignal.timeout(30_000),
      });

      if (!resposta.ok) {
        estado.ultimoErro = `site respondeu ${resposta.status}`;
        return { ok: false, erro: estado.ultimoErro, mantido: ler().total };
      }

      const dados = await resposta.json();

      // As categorias vêm junto: são elas que montam o menu, a home e as
      // páginas `/categoria/*`. Sem elas, a cópia dos produtos não salva
      // essas telas — a página nem chega a perguntar por produto se não sabe
      // qual categoria está aberta.
      let categorias = ler().categorias || [];
      try {
        const r = await pegar(`${base}/api/categories?origem=banco`, {
          headers: { accept: "application/json" },
          signal: AbortSignal.timeout(20_000),
        });
        if (r.ok) {
          const vindas = await r.json();
          // Lista vazia não sobrescreve: mesma regra dos produtos.
          if (Array.isArray(vindas) && vindas.length > 0) categorias = vindas;
        }
      } catch (e) {
        registrar("[catalogo] Categorias não vieram; mantendo as anteriores.");
      }

      if (!pareceCatalogo(dados)) {
        estado.ultimoErro = "o site devolveu catálogo vazio — cópia antiga mantida";
        registrar(`[catalogo] ${estado.ultimoErro} (${ler().total} produtos no espelho)`);
        return { ok: false, erro: estado.ultimoErro, mantido: ler().total };
      }

      const anterior = ler().total;
      const conteudo = {
        atualizadoEm: new Date().toISOString(),
        total: dados.length,
        origem: urlDoSite,
        produtos: dados,
        categorias,
      };

      // Grava num arquivo temporário e renomeia: se a VPS cair no meio da
      // escrita, o espelho continua íntegro em vez de virar JSON pela metade.
      if (!fs.existsSync(pasta)) fs.mkdirSync(pasta, { recursive: true });
      fs.writeFileSync(arquivoTemporario, JSON.stringify(conteudo));
      fs.renameSync(arquivoTemporario, arquivo);

      memoria = {
        produtos: dados,
        categorias,
        total: dados.length,
        atualizadoEm: conteudo.atualizadoEm,
      };
      estado.atualizadoEm = conteudo.atualizadoEm;
      estado.total = dados.length;
      estado.categorias = categorias.length;
      estado.ultimoErro = null;

      registrar(
        `[catalogo] Espelho atualizado (${motivo}): ${dados.length} produtos` +
          (anterior && anterior !== dados.length ? ` (antes: ${anterior})` : "")
      );

      return { ok: true, total: dados.length, anterior };
    } catch (erro) {
      estado.ultimoErro = erro.message || String(erro);
      registrar("[catalogo] Falha ao atualizar o espelho:", estado.ultimoErro);
      return { ok: false, erro: estado.ultimoErro, mantido: ler().total };
    } finally {
      estado.atualizando = false;
    }
  }

  return { ler, atualizar, estado, arquivo };
}

module.exports = { criarEspelhoDoCatalogo };
