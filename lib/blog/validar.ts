import { CATEGORIAS } from "./categorias";
import { hrefSeguro } from "./texto";
import type { Artigo, ArtigoResumido, Bloco, CategoriaSlug, Fonte, Imagem, TemaDeChamada } from "./tipos";

/**
 * Confere o formato de um artigo que chega de fora do código — um arquivo
 * JSON do ramo de conteúdo, escrito pela rotina diária.
 *
 * O TypeScript só protege o que é escrito aqui dentro. Um JSON pode vir com
 * campo faltando, tipo trocado ou um bloco que não existe, e isso derrubaria
 * a página na hora de desenhar. Esta função devolve um artigo íntegro ou a
 * lista do que está errado; nunca um artigo pela metade.
 */

type Resultado<T> = { ok: true; valor: T } | { ok: false; erros: string[] };

const SLUGS_DE_CATEGORIA = new Set<string>(CATEGORIAS.map((c) => c.slug));
const TEMAS = new Set<string>([
  "placas-de-video",
  "pc-gamer",
  "montagem",
  "manutencao",
  "dados",
  "notebooks",
  "seminovos",
  "upgrade",
  "empresas",
  "geral",
]);

const texto = (v: unknown): v is string => typeof v === "string" && v.trim().length > 0;
const lista = (v: unknown): v is unknown[] => Array.isArray(v);
const objeto = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const numero = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const textos = (v: unknown): v is string[] => lista(v) && v.length > 0 && v.every(texto);

function lerFonte(v: unknown): Fonte | null {
  if (!objeto(v) || !texto(v.nome) || !texto(v.url) || !/^https:\/\//.test(v.url)) return null;
  return { nome: v.nome.trim(), url: v.url.trim(), ...(texto(v.data) ? { data: v.data.trim() } : {}) };
}

function lerImagem(v: unknown): Imagem | null {
  if (!objeto(v) || !texto(v.src) || !texto(v.alt)) return null;
  const src = v.src.trim();
  // Imagem do próprio site ou de endereço https; nada de data: ou javascript:.
  if (!(src.startsWith("/") && !src.startsWith("//")) && !/^https:\/\//.test(src)) return null;
  return {
    src,
    alt: v.alt.trim(),
    ...(numero(v.largura) ? { largura: v.largura } : {}),
    ...(numero(v.altura) ? { altura: v.altura } : {}),
    ...(v.pronta === true ? { pronta: true } : {}),
  };
}

function lerBloco(v: unknown, i: number, erros: string[]): Bloco | null {
  const onde = `bloco ${i + 1}`;
  if (!objeto(v) || !texto(v.tipo)) {
    erros.push(`${onde}: sem o campo "tipo".`);
    return null;
  }
  const falha = (motivo: string) => {
    erros.push(`${onde} (${String(v.tipo)}): ${motivo}`);
    return null;
  };

  switch (v.tipo) {
    case "paragrafo":
      return texto(v.texto) ? { tipo: "paragrafo", texto: v.texto } : falha("falta o texto.");

    case "titulo":
      if (!texto(v.texto)) return falha("falta o texto.");
      if (v.nivel !== 2 && v.nivel !== 3) return falha("nivel deve ser 2 ou 3.");
      return { tipo: "titulo", nivel: v.nivel, texto: v.texto.trim(), ...(texto(v.id) ? { id: v.id } : {}) };

    case "lista":
      return textos(v.itens) ? { tipo: "lista", ordenada: v.ordenada === true, itens: v.itens } : falha("itens deve ser uma lista de textos.");

    case "resumo":
      return textos(v.itens)
        ? { tipo: "resumo", itens: v.itens, ...(texto(v.titulo) ? { titulo: v.titulo } : {}) }
        : falha("itens deve ser uma lista de textos.");

    case "destaque":
      if (v.tom !== "dica" && v.tom !== "atencao" && v.tom !== "nota") return falha('tom deve ser "dica", "atencao" ou "nota".');
      return texto(v.texto)
        ? { tipo: "destaque", tom: v.tom, texto: v.texto, ...(texto(v.titulo) ? { titulo: v.titulo } : {}) }
        : falha("falta o texto.");

    case "benchmark": {
      const fonte = lerFonte(v.fonte);
      if (!texto(v.titulo) || !texto(v.unidade)) return falha("faltam titulo e unidade.");
      if (!fonte) return falha("falta a fonte com link https.");
      if (!lista(v.grupos) || v.grupos.length === 0) return falha("falta a lista de grupos.");
      const grupos = [];
      for (const g of v.grupos) {
        if (!objeto(g) || !texto(g.rotulo) || !lista(g.barras) || g.barras.length < 2) return falha("cada grupo precisa de rotulo e ao menos duas barras.");
        const barras = [];
        for (const b of g.barras) {
          if (!objeto(b) || !texto(b.nome) || !numero(b.valor) || b.valor < 0) return falha("cada barra precisa de nome e valor numérico.");
          barras.push({ nome: b.nome, valor: b.valor, ...(b.destaque === true ? { destaque: true } : {}) });
        }
        grupos.push({ rotulo: g.rotulo, ...(texto(g.detalhe) ? { detalhe: g.detalhe } : {}), barras });
      }
      return {
        tipo: "benchmark",
        titulo: v.titulo,
        unidade: v.unidade,
        ...(v.maiorMelhor === false ? { maiorMelhor: false } : {}),
        grupos,
        fonte,
        ...(texto(v.nota) ? { nota: v.nota } : {}),
      };
    }

    case "tabela": {
      if (!lista(v.colunas) || v.colunas.length < 2 || !v.colunas.every((c) => typeof c === "string")) return falha("colunas deve ter ao menos dois títulos.");
      const colunas = v.colunas as string[];
      if (!lista(v.linhas) || v.linhas.length === 0) return falha("falta a lista de linhas.");
      const linhas: string[][] = [];
      for (const l of v.linhas) {
        if (!lista(l) || l.length !== colunas.length || !l.every((c) => typeof c === "string")) {
          return falha("toda linha precisa ter o mesmo número de células do cabeçalho.");
        }
        linhas.push(l as string[]);
      }
      const fonte = v.fonte === undefined ? undefined : lerFonte(v.fonte);
      if (fonte === null) return falha("a fonte precisa de nome e link https.");
      return {
        tipo: "tabela",
        colunas,
        linhas,
        ...(texto(v.titulo) ? { titulo: v.titulo } : {}),
        ...(numero(v.colunaDestaque) && v.colunaDestaque >= 0 && v.colunaDestaque < colunas.length ? { colunaDestaque: v.colunaDestaque } : {}),
        ...(fonte ? { fonte } : {}),
        ...(texto(v.nota) ? { nota: v.nota } : {}),
      };
    }

    case "pros-contras":
      return textos(v.pros) && textos(v.contras)
        ? { tipo: "pros-contras", pros: v.pros, contras: v.contras, ...(texto(v.titulo) ? { titulo: v.titulo } : {}) }
        : falha("pros e contras devem ser listas de textos.");

    case "citacao": {
      const fonte = lerFonte(v.fonte);
      if (!texto(v.texto) || !texto(v.autor)) return falha("faltam texto e autor.");
      if (!fonte) return falha("falta a publicação de origem, com link https.");
      return {
        tipo: "citacao",
        texto: v.texto,
        autor: v.autor,
        fonte,
        ...(texto(v.cargo) ? { cargo: v.cargo } : {}),
        ...(v.traduzida === true ? { traduzida: true } : {}),
      };
    }

    case "chamada": {
      if (v.tema !== undefined && !(texto(v.tema) && TEMAS.has(v.tema))) return falha("tema desconhecido.");
      if (v.href !== undefined) {
        // Chamada só leva para dentro da loja.
        if (!texto(v.href) || !v.href.startsWith("/") || hrefSeguro(v.href) === null) return falha("href deve ser um caminho interno, começando com /.");
      }
      return {
        tipo: "chamada",
        ...(texto(v.tema) ? { tema: v.tema as TemaDeChamada } : {}),
        ...(texto(v.titulo) ? { titulo: v.titulo } : {}),
        ...(texto(v.texto) ? { texto: v.texto } : {}),
        ...(texto(v.rotulo) ? { rotulo: v.rotulo } : {}),
        ...(texto(v.href) ? { href: v.href } : {}),
        ...(texto(v.mensagem) ? { mensagem: v.mensagem } : {}),
      };
    }

    case "imagem": {
      const imagem = lerImagem(v.imagem);
      return imagem ? { tipo: "imagem", imagem, ...(texto(v.legenda) ? { legenda: v.legenda } : {}) } : falha("imagem precisa de src (/ ou https) e alt.");
    }

    default:
      return falha("tipo de bloco desconhecido.");
  }
}

export function lerArtigo(bruto: unknown): Resultado<Artigo> {
  const erros: string[] = [];
  if (!objeto(bruto)) return { ok: false, erros: ["O arquivo não contém um artigo."] };

  if (!texto(bruto.slug) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(bruto.slug)) erros.push("slug ausente ou fora do formato (minúsculas, números e hífens).");
  if (!texto(bruto.titulo)) erros.push("falta o titulo.");
  if (!texto(bruto.resumo)) erros.push("falta o resumo.");
  if (!texto(bruto.categoria) || !SLUGS_DE_CATEGORIA.has(bruto.categoria)) erros.push(`categoria deve ser uma destas: ${[...SLUGS_DE_CATEGORIA].join(", ")}.`);
  if (!texto(bruto.publicadoEm) || !Number.isFinite(Date.parse(bruto.publicadoEm))) erros.push("publicadoEm deve ser uma data ISO.");
  if (bruto.etiquetas !== undefined && !(lista(bruto.etiquetas) && bruto.etiquetas.every(texto))) erros.push("etiquetas deve ser uma lista de textos.");
  if (!lista(bruto.blocos) || bruto.blocos.length === 0) erros.push("falta a lista de blocos.");

  const blocos: Bloco[] = [];
  if (lista(bruto.blocos)) {
    bruto.blocos.forEach((b, i) => {
      const lido = lerBloco(b, i, erros);
      if (lido) blocos.push(lido);
    });
  }

  const capa = bruto.capa === undefined || bruto.capa === null ? null : lerImagem(bruto.capa);
  if (bruto.capa && !capa) erros.push("capa precisa de src (/ ou https) e alt.");

  const perguntas: { pergunta: string; resposta: string }[] = [];
  if (bruto.perguntas !== undefined) {
    if (!lista(bruto.perguntas)) erros.push("perguntas deve ser uma lista.");
    else {
      for (const p of bruto.perguntas) {
        if (objeto(p) && texto(p.pergunta) && texto(p.resposta)) perguntas.push({ pergunta: p.pergunta, resposta: p.resposta });
        else erros.push("cada pergunta precisa de pergunta e resposta.");
      }
    }
  }

  const fontes: Fonte[] = [];
  if (bruto.fontes !== undefined) {
    if (!lista(bruto.fontes)) erros.push("fontes deve ser uma lista.");
    else {
      for (const f of bruto.fontes) {
        const fonte = lerFonte(f);
        if (fonte) fontes.push(fonte);
        else erros.push("cada fonte precisa de nome e link https.");
      }
    }
  }

  // Veredito com nota fala em nome da loja: só entra em artigo escrito e
  // aprovado no repositório, nunca por arquivo publicado sozinho.
  if (bruto.analise !== undefined) erros.push("artigo publicado pela rotina não pode ter veredito com nota (campo analise).");

  const seo = objeto(bruto.seo)
    ? {
        ...(texto(bruto.seo.titulo) ? { titulo: bruto.seo.titulo } : {}),
        ...(texto(bruto.seo.descricao) ? { descricao: bruto.seo.descricao } : {}),
        ...(lista(bruto.seo.palavrasChave) && bruto.seo.palavrasChave.every(texto) ? { palavrasChave: bruto.seo.palavrasChave as string[] } : {}),
      }
    : undefined;

  if (erros.length > 0) return { ok: false, erros };

  return {
    ok: true,
    valor: {
      slug: bruto.slug as string,
      titulo: (bruto.titulo as string).trim(),
      resumo: (bruto.resumo as string).trim(),
      categoria: bruto.categoria as CategoriaSlug,
      etiquetas: (bruto.etiquetas as string[] | undefined) ?? [],
      capa,
      publicadoEm: new Date(bruto.publicadoEm as string).toISOString(),
      ...(texto(bruto.atualizadoEm) && Number.isFinite(Date.parse(bruto.atualizadoEm)) ? { atualizadoEm: new Date(bruto.atualizadoEm).toISOString() } : {}),
      autor: { nome: "Equipe Balão da Informática", url: "/sobre-nos" },
      origem: "diario",
      ...(seo ? { seo } : {}),
      blocos,
      ...(perguntas.length > 0 ? { perguntas } : {}),
      ...(fontes.length > 0 ? { fontes } : {}),
      ...(texto(bruto.metodologia) ? { metodologia: bruto.metodologia } : {}),
    },
  };
}

/** Uma linha do índice do ramo de conteúdo: o que os cartões precisam. */
export function lerResumo(bruto: unknown): ArtigoResumido | null {
  if (!objeto(bruto)) return null;
  if (!texto(bruto.slug) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(bruto.slug)) return null;
  if (!texto(bruto.titulo) || !texto(bruto.resumo)) return null;
  if (!texto(bruto.categoria) || !SLUGS_DE_CATEGORIA.has(bruto.categoria)) return null;
  if (!texto(bruto.publicadoEm) || !Number.isFinite(Date.parse(bruto.publicadoEm))) return null;
  return {
    slug: bruto.slug,
    titulo: bruto.titulo.trim(),
    resumo: bruto.resumo.trim(),
    categoria: bruto.categoria as CategoriaSlug,
    etiquetas: lista(bruto.etiquetas) ? bruto.etiquetas.filter(texto) : [],
    capa: bruto.capa ? lerImagem(bruto.capa) : null,
    publicadoEm: new Date(bruto.publicadoEm).toISOString(),
    minutos: numero(bruto.minutos) && bruto.minutos > 0 ? Math.round(bruto.minutos) : 5,
    temAnalise: false,
  };
}
