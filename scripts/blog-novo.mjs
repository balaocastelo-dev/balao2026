#!/usr/bin/env node
/**
 * Cria um artigo novo já no formato do blog.
 *
 *   npm run blog:novo -- "Título do artigo" --categoria guias
 *
 * O arquivo nasce como rascunho (não aparece no site) e com o roteiro do
 * padrão editorial dentro: abertura, "Em resumo", seções, tabela, prós e
 * contras, chamada, perguntas e fontes. É só preencher. Quando estiver pronto,
 * apague a linha `rascunho: true` e rode `npm run blog:conferir`.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const pasta = join(raiz, "content", "blog", "artigos");
const CATEGORIAS = ["guias", "hardware", "analises", "noticias", "assistencia"];

const args = process.argv.slice(2);
const iCategoria = args.indexOf("--categoria");
const categoria = iCategoria !== -1 ? args[iCategoria + 1] : "guias";
const titulo = args.filter((a, i) => !a.startsWith("--") && i !== iCategoria + 1).join(" ").trim();

if (!titulo) {
  console.error('Faltou o título. Exemplo: npm run blog:novo -- "Como escolher um monitor para trabalho" --categoria guias');
  process.exit(1);
}
if (!CATEGORIAS.includes(categoria)) {
  console.error(`Categoria "${categoria}" não existe. Use uma destas: ${CATEGORIAS.join(", ")}.`);
  process.exit(1);
}

const slug = titulo
  .normalize("NFD")
  .replace(/[̀-ͯ]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "")
  .split("-")
  // O endereço fica só com as palavras da busca.
  .filter((p) => !["de", "da", "do", "das", "dos", "e", "um", "uma", "o", "a", "os", "as", "para", "em", "com", "que"].includes(p))
  .slice(0, 8)
  .join("-");

const arquivo = join(pasta, `${slug}.ts`);
if (existsSync(arquivo)) {
  console.error(`Já existe um artigo em content/blog/artigos/${slug}.ts.`);
  process.exit(1);
}

const hoje = new Date().toISOString();
const analise = categoria === "analises";
const noticia = categoria === "noticias";
const texto = (s) => JSON.stringify(s);

const corpo = `import type { Artigo, Fonte } from "@/lib/blog/tipos";

// Toda fonte citada entra aqui uma vez e é reaproveitada nos blocos e na lista do fim.
const FONTE_1: Fonte = {
  nome: "ESCREVER: veículo — “título da publicação”",
  url: "https://",
  data: "mês de ano",
};

const artigo: Artigo = {
  slug: ${texto(slug)},
  // 30 a 80 caracteres, com a palavra da busca no começo.
  titulo: ${texto(titulo)},
  // 110 a 165 caracteres. É o que aparece no Google: responda à busca e diga o que o leitor leva.
  resumo: "ESCREVER",
  categoria: ${texto(categoria)},
  etiquetas: [],
  // Sem capa, o cartão usa a capa gerada com o título. Com capa: arquivo em public/blog/capas.
  capa: null,
  publicadoEm: ${texto(hoje)},
  autor: { nome: "Equipe Balão da Informática", url: "/sobre-nos" },
  origem: "autoral",
  // Enquanto esta linha existir, o artigo não aparece no site.
  rascunho: true,

  blocos: [
    // ABERTURA — dois parágrafos, ~50 palavras cada. O primeiro nomeia o problema
    // do leitor com a palavra da busca; o segundo já dá a resposta curta.
    { tipo: "paragrafo", texto: "ESCREVER" },
    { tipo: "paragrafo", texto: "ESCREVER" },
${noticia ? "" : `
    // EM RESUMO — três ou quatro pontos. Quem só lê isto já sai com a resposta.
    {
      tipo: "resumo",
      itens: ["**Ponto um.** ESCREVER", "**Ponto dois.** ESCREVER", "**Ponto três.** ESCREVER"],
    },
`}
    // SEÇÕES — ${noticia ? "duas ou três" : "de cinco a sete"}. Título em forma de pergunta ou de decisão, do jeito que se busca.
    // Dois a quatro parágrafos por seção; passou disso, quebre com subtítulo, lista ou tabela.
    { tipo: "titulo", nivel: 2, texto: "ESCREVER: o que o leitor precisa saber primeiro" },
    { tipo: "paragrafo", texto: "ESCREVER. Link para página da loja assim: [assistência técnica](/manutencao)." },

    // TABELA — para comparar opções lado a lado. colunaDestaque marca a recomendada.
    {
      tipo: "tabela",
      titulo: "ESCREVER",
      colunas: ["", "Opção A", "Opção B"],
      linhas: [
        ["Critério 1", "…", "…"],
        ["Critério 2", "…", "…"],
      ],
      colunaDestaque: 2,
      fonte: FONTE_1,
    },
${noticia ? "" : `
    { tipo: "titulo", nivel: 2, texto: "ESCREVER: onde está a diferença" },
    { tipo: "paragrafo", texto: "ESCREVER" },

    // GRÁFICO — só com número medido e fonte com link. Sem fonte, a régua reprova.
    // {
    //   tipo: "benchmark",
    //   titulo: "O que foi medido",
    //   unidade: "fps",
    //   grupos: [
    //     { rotulo: "Teste", detalhe: "condição", barras: [{ nome: "A", valor: 0, destaque: true }, { nome: "B", valor: 0 }] },
    //   ],
    //   fonte: FONTE_1,
    // },

    // CITAÇÃO — frase real, de pessoa real, com a publicação de origem.
    // { tipo: "citacao", texto: "…", autor: "Nome", cargo: "função", fonte: FONTE_1, traduzida: true },

    // CHAMADA DO MEIO — depois de entregar conteúdo, nunca antes. Temas prontos em lib/blog/chamadas.ts.
    { tipo: "chamada" },

    { tipo: "titulo", nivel: 2, texto: "ESCREVER: como decidir" },
    { tipo: "paragrafo", texto: "ESCREVER" },

    { tipo: "titulo", nivel: 2, texto: "Prós e contras" },
    { tipo: "pros-contras", pros: ["ESCREVER", "ESCREVER"], contras: ["ESCREVER", "ESCREVER"] },
`}
    // FECHO — o ângulo local (loja no Cambuí, testar antes de pagar, assistência no mesmo
    // endereço) entra aqui, perto do fim, e não antes. Última frase: a decisão em uma linha.
    { tipo: "titulo", nivel: 2, texto: "ESCREVER: antes de decidir" },
    { tipo: "paragrafo", texto: "ESCREVER" },

    // CHAMADA FINAL — uma pergunta que o leitor faria no balcão.
    {
      tipo: "chamada",
      titulo: "ESCREVER",
      texto: "ESCREVER",
      rotulo: "Perguntar no WhatsApp",
    },
  ],
${analise ? `
  // VEREDITO — obrigatório em análise. A nota é a média dos critérios.
  analise: {
    item: { nome: "ESCREVER: nome do produto", marca: "ESCREVER", categoria: "ESCREVER" },
    nota: 0,
    indicadoPara: "ESCREVER",
    veredito: "ESCREVER",
    criterios: [
      { nome: "Desempenho", nota: 0 },
      { nome: "Custo", nota: 0 },
    ],
  },

  // De onde vieram os dados: teste próprio de bancada ou testes publicados por quem?
  metodologia: "ESCREVER",
` : ""}${noticia ? "" : `
  // PERGUNTAS — de três a seis, do jeito que o cliente pergunta. Resposta em duas ou três frases.
  perguntas: [
    { pergunta: "ESCREVER?", resposta: "ESCREVER" },
    { pergunta: "ESCREVER?", resposta: "ESCREVER" },
    { pergunta: "ESCREVER?", resposta: "ESCREVER" },
  ],
`}
  fontes: [FONTE_1],
};

export default artigo;
`;

writeFileSync(arquivo, corpo);

// Registra o artigo na lista.
const indice = join(pasta, "index.ts");
const nomeDaVariavel = slug.replace(/-([a-z0-9])/g, (_m, c) => c.toUpperCase()).replace(/^(\d)/, "a$1");
let conteudo = readFileSync(indice, "utf8");
const marcaDaLista = "  // novos artigos entram acima desta linha";
const ultimoImport = conteudo.lastIndexOf("\nimport ");
const fimDoUltimoImport = conteudo.indexOf("\n", ultimoImport + 1);
if (ultimoImport === -1 || !conteudo.includes(marcaDaLista)) {
  console.error("Criei o arquivo, mas não consegui registrar em content/blog/artigos/index.ts. Inclua o import e o item à mão.");
  process.exit(1);
}
conteudo =
  conteudo.slice(0, fimDoUltimoImport + 1) +
  `import ${nomeDaVariavel} from "./${slug}";\n` +
  conteudo.slice(fimDoUltimoImport + 1).replace(marcaDaLista, `  ${nomeDaVariavel},\n${marcaDaLista}`);
writeFileSync(indice, conteudo);

console.log(`Criado: content/blog/artigos/${slug}.ts (rascunho, categoria ${categoria})`);
console.log("Próximos passos:");
console.log("  1. Preencha os trechos marcados com ESCREVER.");
console.log("  2. Apague a linha rascunho: true.");
console.log("  3. Rode npm run blog:conferir — a régua diz o que falta.");
console.log(`  4. O artigo sai em /blog/${slug}.`);
