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
    banners: 0,
    blog: 0,
    ultimaTentativaEm: null,
    ultimoErro: null,
    atualizando: false,
  };

  let memoria = null;

  function ler() {
    if (memoria) return memoria;

    try {
      if (!fs.existsSync(arquivo)) {
        return { produtos: [], categorias: [], banners: [], blog: [], total: 0, atualizadoEm: null };
      }
      const conteudo = JSON.parse(fs.readFileSync(arquivo, "utf8"));
      const produtos = Array.isArray(conteudo?.produtos) ? conteudo.produtos : [];
      const lista = (v) => (Array.isArray(v) ? v : []);
      memoria = {
        produtos,
        categorias: lista(conteudo?.categorias),
        banners: lista(conteudo?.banners),
        blog: lista(conteudo?.blog),
        total: produtos.length,
        atualizadoEm: conteudo?.atualizadoEm || null,
      };
      estado.atualizadoEm = memoria.atualizadoEm;
      estado.total = memoria.total;
      return memoria;
    } catch (erro) {
      registrar("[catalogo] Não consegui ler o espelho:", erro.message);
      return { produtos: [], categorias: [], banners: [], blog: [], total: 0, atualizadoEm: null };
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
      // Um endereço só, que lê o banco direto (sem cache e sem esta cópia).
      // Buscando peça por peça, uma parte podia vir do banco e outra já da
      // cota estourada — e a cópia ficaria metade nova, metade velha.
      const base = String(urlDoSite).replace(/\/$/, "");
      const resposta = await pegar(`${base}/api/espelho`, {
        headers: { accept: "application/json" },
        // O site pode estar lento; melhor desistir e manter a cópia antiga do
        // que segurar a atualização para sempre.
        signal: AbortSignal.timeout(45_000),
      });

      if (!resposta.ok) {
        estado.ultimoErro = `site respondeu ${resposta.status}`;
        return { ok: false, erro: estado.ultimoErro, mantido: ler().total };
      }

      const dados = await resposta.json();
      const produtos = Array.isArray(dados?.produtos) ? dados.produtos : [];

      if (!pareceCatalogo(produtos)) {
        estado.ultimoErro = "o site devolveu catálogo vazio — cópia antiga mantida";
        registrar(`[catalogo] ${estado.ultimoErro} (${ler().total} produtos no espelho)`);
        return { ok: false, erro: estado.ultimoErro, mantido: ler().total };
      }

      const atual = ler();
      const anterior = atual.total;

      // Cada parte só é substituída quando veio COM conteúdo. Parte vazia
      // mantém a anterior: perder os banners ou as categorias num dia ruim
      // deixaria a home quebrada mesmo com os produtos a salvo.
      const manterSeVazio = (novos, guardados) =>
        Array.isArray(novos) && novos.length > 0 ? novos : guardados || [];

      const conteudo = {
        atualizadoEm: new Date().toISOString(),
        total: produtos.length,
        origem: urlDoSite,
        produtos,
        categorias: manterSeVazio(dados?.categorias, atual.categorias),
        banners: manterSeVazio(dados?.banners, atual.banners),
        blog: manterSeVazio(dados?.blog, atual.blog),
      };

      // Grava num arquivo temporário e renomeia: se a VPS cair no meio da
      // escrita, o espelho continua íntegro em vez de virar JSON pela metade.
      if (!fs.existsSync(pasta)) fs.mkdirSync(pasta, { recursive: true });
      fs.writeFileSync(arquivoTemporario, JSON.stringify(conteudo));
      fs.renameSync(arquivoTemporario, arquivo);

      memoria = {
        produtos,
        categorias: conteudo.categorias,
        banners: conteudo.banners,
        blog: conteudo.blog,
        total: produtos.length,
        atualizadoEm: conteudo.atualizadoEm,
      };
      estado.atualizadoEm = conteudo.atualizadoEm;
      estado.total = produtos.length;
      estado.categorias = conteudo.categorias.length;
      estado.banners = conteudo.banners.length;
      estado.blog = conteudo.blog.length;
      estado.ultimoErro = null;

      // O site avisa quando uma parte dele falhou; sem isso, "espelho
      // atualizado" esconderia que o blog não vem há dias.
      if (Array.isArray(dados?.falhas) && dados.falhas.length) {
        registrar(`[catalogo] O site reportou falhas: ${dados.falhas.join("; ")}`);
      }

      registrar(
        `[catalogo] Espelho atualizado (${motivo}): ${produtos.length} produtos, ` +
          `${conteudo.categorias.length} categorias, ${conteudo.banners.length} banners` +
          (anterior && anterior !== produtos.length ? ` (antes: ${anterior} produtos)` : "")
      );

      return { ok: true, total: produtos.length, anterior };
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
