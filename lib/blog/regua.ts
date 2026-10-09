import { contarPalavras, linksDoTexto, palavrasDoArtigo, textoPuro, textosDoBloco } from "./texto";
import type { Artigo, Bloco } from "./tipos";

/**
 * A régua editorial do blog, em forma de código.
 *
 * Os números de base saíram da medição dos 18 artigos de referência do Soro
 * (outubro de 2026): em média 1.390 palavras, 5 a 7 seções, parágrafos de
 * cerca de 50 palavras, 2 a 3 links para páginas da loja, a palavra-chave no
 * título e na abertura, e o ângulo local perto do fim. Isso é o piso.
 *
 * O que o padrão novo acrescenta por cima — e que os artigos de referência
 * não têm — é o que esta régua cobra: tabela ou gráfico com fonte, prós e
 * contras, perguntas frequentes, chamadas poucas e bem colocadas.
 *
 * `erros` reprovam o artigo (o teste automático falha e ele não é publicado).
 * `avisos` são recomendações.
 */

export type Avaliacao = {
  aprovado: boolean;
  erros: string[];
  avisos: string[];
  medidas: {
    palavras: number;
    secoes: number;
    subsecoes: number;
    paragrafos: number;
    mediaPorParagrafo: number;
    maiorParagrafo: number;
    linksInternos: number;
    linksExternos: number;
    chamadas: number;
    tabelas: number;
    benchmarks: number;
    citacoes: number;
    perguntas: number;
  };
};

const MINIMO_DE_PALAVRAS: Record<Artigo["categoria"], number> = {
  guias: 1200,
  hardware: 1200,
  analises: 1200,
  assistencia: 1000,
  noticias: 350,
};

const MINIMO_DE_SECOES: Record<Artigo["categoria"], number> = {
  guias: 4,
  hardware: 4,
  analises: 4,
  assistencia: 4,
  noticias: 2,
};

/**
 * Condição comercial não entra em artigo: preço, parcela, desconto e frete
 * mudam, e o texto fica no ar por anos. Um artigo antigo com número velho vira
 * promessa que a loja não fez.
 */
const CONDICOES_COMERCIAIS: { padrao: RegExp; nome: string }[] = [
  { padrao: /R\$\s?\d/, nome: "preço em reais" },
  { padrao: /sem juros|\b\d{1,2}\s?x\s+no\s+cart|parcel\w*\s+em\s+(?:até\s+)?\d/i, nome: "parcelamento" },
  { padrao: /\d\s?%\s+(?:de\s+desconto|off|no\s+pix|à\s+vista)|desconto\s+de\s+\d/i, nome: "percentual de desconto" },
  { padrao: /frete\s+gr[aá]tis/i, nome: "frete grátis" },
];

/**
 * Para onde um artigo da rotina diária pode mandar o leitor dentro da loja.
 * São páginas e categorias conferidas, que existem. Link para página que não
 * existe é o erro mais comum de texto escrito sem ninguém olhando.
 */
export const PAGINAS_DA_LOJA = [
  "/blog",
  "/manutencao",
  "/montagempc",
  "/recuperacaodados",
  "/notebooks",
  "/seminovos",
  "/carregadores",
  "/consignacao",
  "/pcgamer3d",
  "/fale-conosco",
  "/sobre-nos",
  "/categoria/computadores",
  "/categoria/computadores-pc",
  "/categoria/computadores-pc-pc-gamer",
  "/categoria/computadores-monitores-monitor-gamer",
  "/categoria/hardware-fontes",
  "/categoria/hardware-memoria-ram",
  "/categoria/hardware-placa-de-video-vga",
];

function linkPermitidoNaRotina(link: string): boolean {
  const caminho = link.split(/[?#]/)[0].replace(/\/+$/, "") || "/";
  if (/^\/blog\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(caminho)) return true;
  return PAGINAS_DA_LOJA.includes(caminho);
}

function textosComLink(bloco: Bloco): string[] {
  switch (bloco.tipo) {
    case "paragrafo":
      return [bloco.texto];
    case "lista":
    case "resumo":
      return bloco.itens;
    case "destaque":
      return [bloco.texto];
    case "tabela":
      return [...bloco.linhas.flat(), bloco.nota ?? ""];
    case "benchmark":
      return [bloco.nota ?? ""];
    case "chamada":
      return [bloco.texto ?? ""];
    default:
      return [];
  }
}

export function avaliarArtigo(artigo: Artigo): Avaliacao {
  const erros: string[] = [];
  const avisos: string[] = [];
  const noticia = artigo.categoria === "noticias";
  const blocos = artigo.blocos;

  // ---- Medidas ----
  const paragrafos = blocos.filter((b): b is Extract<Bloco, { tipo: "paragrafo" }> => b.tipo === "paragrafo");
  const tamanhos = paragrafos.map((p) => contarPalavras(textoPuro(p.texto)));
  const secoes = blocos.filter((b) => b.tipo === "titulo" && b.nivel === 2);
  const subsecoes = blocos.filter((b) => b.tipo === "titulo" && b.nivel === 3);
  const chamadas = blocos.filter((b) => b.tipo === "chamada");
  const tabelas = blocos.filter((b) => b.tipo === "tabela");
  const benchmarks = blocos.filter((b) => b.tipo === "benchmark");
  const citacoes = blocos.filter((b) => b.tipo === "citacao");
  const prosContras = blocos.filter((b) => b.tipo === "pros-contras");
  const resumos = blocos.filter((b) => b.tipo === "resumo");

  const links = blocos.flatMap((b) => textosComLink(b).flatMap(linksDoTexto));
  const internos = links.filter((l) => l.startsWith("/"));
  const externos = links.filter((l) => /^https:\/\//.test(l));
  const palavras = palavrasDoArtigo(artigo);

  const medidas = {
    palavras,
    secoes: secoes.length,
    subsecoes: subsecoes.length,
    paragrafos: paragrafos.length,
    mediaPorParagrafo: tamanhos.length ? Math.round(tamanhos.reduce((a, b) => a + b, 0) / tamanhos.length) : 0,
    maiorParagrafo: tamanhos.length ? Math.max(...tamanhos) : 0,
    linksInternos: internos.length,
    linksExternos: externos.length,
    chamadas: chamadas.length,
    tabelas: tabelas.length,
    benchmarks: benchmarks.length,
    citacoes: citacoes.length,
    perguntas: artigo.perguntas?.length ?? 0,
  };

  // ---- Identidade e busca ----
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(artigo.slug)) {
    erros.push(`Endereço "${artigo.slug}" deve ter só letras minúsculas, números e hífens.`);
  }
  if (artigo.slug.length > 70) avisos.push("Endereço com mais de 70 caracteres: encurte para as palavras da busca.");

  if (artigo.titulo.length < 30 || artigo.titulo.length > 80) {
    erros.push(`Título com ${artigo.titulo.length} caracteres; o intervalo é de 30 a 80.`);
  }
  const tituloNoGoogle = artigo.seo?.titulo ?? artigo.titulo;
  if (tituloNoGoogle.length > 62) {
    avisos.push(`Título com ${tituloNoGoogle.length} caracteres será cortado no Google; defina seo.titulo com até 60.`);
  }
  const descricao = artigo.seo?.descricao ?? artigo.resumo;
  if (descricao.length < 110 || descricao.length > 165) {
    erros.push(`Descrição com ${descricao.length} caracteres; o intervalo é de 110 a 165 (o Google corta depois disso).`);
  }
  if (!Number.isFinite(Date.parse(artigo.publicadoEm))) erros.push("Data de publicação inválida.");
  if (!artigo.capa) {
    // No artigo da rotina isso é o esperado: a capa dele é sempre a desenhada.
    if (artigo.origem !== "diario") avisos.push("Sem imagem de capa: o cartão usará a capa desenhada pelo site.");
  } else if (artigo.capa.alt.trim().length < 12) erros.push("A capa precisa de um texto alternativo que descreva a imagem.");

  // ---- Estrutura ----
  if (palavras < MINIMO_DE_PALAVRAS[artigo.categoria]) {
    erros.push(`Artigo com ${palavras} palavras; o mínimo para ${artigo.categoria} é ${MINIMO_DE_PALAVRAS[artigo.categoria]}.`);
  }
  if (secoes.length < MINIMO_DE_SECOES[artigo.categoria]) {
    erros.push(`Artigo com ${secoes.length} seções (títulos de nível 2); o mínimo é ${MINIMO_DE_SECOES[artigo.categoria]}.`);
  }

  const primeiroTitulo = blocos.findIndex((b) => b.tipo === "titulo");
  const abertura = blocos.slice(0, primeiroTitulo === -1 ? blocos.length : primeiroTitulo);
  if (abertura.filter((b) => b.tipo === "paragrafo").length < 1) {
    erros.push("O artigo deve abrir com um parágrafo que já responde à busca, antes do primeiro título.");
  }

  if (medidas.maiorParagrafo > 110) {
    erros.push(`Há um parágrafo com ${medidas.maiorParagrafo} palavras; quebre em dois (o teto é 110).`);
  }
  if (medidas.mediaPorParagrafo > 70) {
    avisos.push(`Parágrafos com ${medidas.mediaPorParagrafo} palavras em média; a referência fica em torno de 50.`);
  }

  // Seção que é só parede de texto perde o leitor no celular.
  let palavrasNaSecao = 0;
  let tituloDaSecao = "";
  const fecharSecao = () => {
    if (tituloDaSecao && palavrasNaSecao > 420) {
      avisos.push(`A seção "${tituloDaSecao}" tem ${palavrasNaSecao} palavras seguidas; divida com um subtítulo, lista ou tabela.`);
    }
  };
  for (const bloco of blocos) {
    if (bloco.tipo === "titulo" && bloco.nivel === 2) {
      fecharSecao();
      tituloDaSecao = bloco.texto;
      palavrasNaSecao = 0;
    } else if (bloco.tipo === "paragrafo") {
      palavrasNaSecao += contarPalavras(textoPuro(bloco.texto));
    } else if (bloco.tipo !== "titulo") {
      palavrasNaSecao = Math.floor(palavrasNaSecao / 2);
    }
  }
  fecharSecao();

  const titulosRepetidos = new Set<string>();
  const vistos = new Set<string>();
  for (const bloco of blocos) {
    if (bloco.tipo !== "titulo") continue;
    const chave = bloco.texto.trim().toLowerCase();
    if (vistos.has(chave)) titulosRepetidos.add(bloco.texto);
    vistos.add(chave);
  }
  if (titulosRepetidos.size > 0) erros.push(`Títulos repetidos: ${[...titulosRepetidos].join("; ")}.`);

  // ---- Substância: o que separa artigo de página de produto ----
  if (!noticia) {
    const ricos = tabelas.length + benchmarks.length + prosContras.length + citacoes.length;
    if (ricos < 2) {
      erros.push("Faltam elementos de apoio: use ao menos dois entre tabela, gráfico de benchmark, prós e contras e citação.");
    }
    if (resumos.length === 0) erros.push('Falta o bloco "Em resumo" logo depois da abertura.');
    if ((artigo.perguntas?.length ?? 0) < 3) avisos.push("Inclua de 3 a 6 perguntas frequentes: elas respondem buscas de cauda longa.");
  }
  if ((artigo.perguntas?.length ?? 0) > 8) avisos.push("Mais de 8 perguntas frequentes dilui o artigo.");

  if (artigo.categoria === "analises") {
    if (!artigo.analise) erros.push("Análise precisa do veredito (campo analise), com nota e para quem serve.");
    if (prosContras.length === 0) erros.push("Análise precisa de um bloco de prós e contras.");
    if (tabelas.length + benchmarks.length === 0) erros.push("Análise precisa de ao menos uma tabela ou gráfico com dados.");
    if (!artigo.metodologia) erros.push("Análise precisa dizer de onde vieram os dados (campo metodologia).");
  }
  if (artigo.analise) {
    const { nota, criterios } = artigo.analise;
    if (!(nota >= 0 && nota <= 10)) erros.push("A nota da análise vai de 0 a 10.");
    for (const c of criterios ?? []) {
      if (!(c.nota >= 0 && c.nota <= 10)) erros.push(`A nota do critério "${c.nome}" vai de 0 a 10.`);
    }
  }

  // ---- Honestidade dos dados ----
  for (const b of benchmarks) {
    if (b.tipo !== "benchmark") continue;
    if (!b.fonte?.url || !/^https:\/\//.test(b.fonte.url)) erros.push(`O gráfico "${b.titulo}" está sem fonte com link.`);
    for (const grupo of b.grupos) {
      if (grupo.barras.length < 2) erros.push(`O gráfico "${b.titulo}" tem um grupo com menos de duas barras para comparar.`);
      if (grupo.barras.some((barra) => !Number.isFinite(barra.valor) || barra.valor < 0)) {
        erros.push(`O gráfico "${b.titulo}" tem valor inválido em "${grupo.rotulo}".`);
      }
    }
  }
  for (const c of citacoes) {
    if (c.tipo !== "citacao") continue;
    if (!c.fonte?.url || !/^https:\/\//.test(c.fonte.url)) erros.push(`A citação de ${c.autor} está sem a publicação de origem.`);
    if (contarPalavras(c.texto) > 60) avisos.push(`A citação de ${c.autor} é longa; fique com a frase que importa.`);
  }
  for (const t of tabelas) {
    if (t.tipo !== "tabela") continue;
    if (t.linhas.some((linha) => linha.length !== t.colunas.length)) {
      erros.push(`A tabela "${t.titulo ?? t.colunas.join(" / ")}" tem linha com número de colunas diferente do cabeçalho.`);
    }
  }
  if (!noticia && (benchmarks.length > 0 || citacoes.length > 0) && (artigo.fontes?.length ?? 0) === 0) {
    erros.push("Artigo com dados de terceiros precisa da lista de fontes no fim (campo fontes).");
  }
  if (noticia && (artigo.fontes?.length ?? 0) === 0) erros.push("Notícia sem fonte não é publicada.");

  // ---- Links ----
  if (internos.length < 2) erros.push(`Só ${internos.length} link(s) para páginas da loja; inclua ao menos 2, dentro do texto.`);
  if (links.some((l) => /^https?:\/\/(www\.)?balao\.info/i.test(l))) {
    erros.push("Link para a própria loja deve ser relativo (/manutencao), não com o endereço completo.");
  }

  // ---- Chamadas: poucas, e no lugar certo ----
  if (chamadas.length === 0) erros.push("Falta ao menos uma chamada contextual.");
  if (chamadas.length > 3) erros.push(`${chamadas.length} chamadas é panfleto; o teto é 3.`);
  const primeiraChamada = blocos.findIndex((b) => b.tipo === "chamada");
  if (primeiraChamada !== -1 && primeiraChamada < blocos.length * 0.25) {
    erros.push("A primeira chamada aparece cedo demais: o leitor precisa receber conteúdo antes do convite.");
  }
  for (let i = 1; i < blocos.length; i += 1) {
    if (blocos[i].tipo === "chamada" && blocos[i - 1].tipo === "chamada") erros.push("Duas chamadas seguidas.");
  }

  // ---- Condição comercial ----
  // Os artigos do Soro ficam de fora: já foram publicados assim, pela ferramenta.
  if (artigo.origem !== "soro") {
    const tudo = [
      artigo.titulo,
      artigo.resumo,
      ...blocos.flatMap(textosDoBloco),
      ...(artigo.perguntas ?? []).flatMap((p) => [p.pergunta, p.resposta]),
    ].join("\n");
    for (const { padrao, nome } of CONDICOES_COMERCIAIS) {
      const achado = padrao.exec(tudo);
      if (achado) erros.push(`O texto traz ${nome} ("${achado[0]}"): condição comercial não entra em artigo.`);
    }
  }

  // ---- Artigo da rotina diária: ninguém revisa antes de ir ao ar ----
  // Por isso ele só pode usar o que não depende de transcrever número ou
  // frase de terceiros, e só fala da loja com as chamadas já escritas.
  if (artigo.origem === "diario") {
    if (artigo.categoria === "analises") erros.push("A rotina diária não publica análise: nota e veredito são da loja.");
    if (artigo.analise) erros.push("Artigo da rotina não pode ter veredito com nota.");
    if (benchmarks.length > 0) erros.push("Artigo da rotina não leva gráfico de benchmark: número de teste só entra em artigo revisado.");
    if (citacoes.length > 0) erros.push("Artigo da rotina não leva citação: frase de terceiros só entra em artigo revisado.");
    if ((artigo.fontes?.length ?? 0) < 2) erros.push("Artigo da rotina precisa de ao menos duas fontes consultadas (campo fontes).");
    // Imagem trazida de fora tem dono; a capa do artigo da rotina é desenhada pelo site.
    if (artigo.capa || blocos.some((b) => b.tipo === "imagem")) erros.push("Artigo da rotina não leva imagem: a capa é desenhada pelo site.");
    for (const c of chamadas) {
      if (c.tipo !== "chamada") continue;
      if (!c.tema || c.titulo || c.texto || c.rotulo || c.href) {
        erros.push("Chamada de artigo da rotina usa só o tema pronto (campo tema), sem texto próprio.");
        break;
      }
    }
    const proibidos = [...new Set(internos.filter((l) => !linkPermitidoNaRotina(l)))];
    if (proibidos.length > 0) erros.push(`Link para página fora da lista conferida: ${proibidos.join(", ")}.`);
    if (/\b(testamos|medimos|nossa bancada mediu|em nossos testes|nos nossos testes)\b/i.test(blocos.flatMap(textosDoBloco).join("\n"))) {
      erros.push("O texto afirma um teste próprio da loja; a rotina não testa nada — atribua o dado à fonte.");
    }
  }

  return { aprovado: erros.length === 0, erros, avisos, medidas };
}
