import type { Bloco } from "./tipos";

/**
 * Converte o HTML simples de um artigo importado (Soro) nos mesmos blocos dos
 * artigos escritos aqui.
 *
 * É o que faz o post importado ganhar sumário, tempo de leitura e o mesmo
 * visual dos demais — e o que nos livra de injetar HTML de terceiros na
 * página. O que a conversão não reconhece vira texto comum; nada passa como
 * marcação.
 */

const ENTIDADES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#34;": '"',
  "&apos;": "'",
  "&#39;": "'",
  "&nbsp;": " ",
  "&ndash;": "–",
  "&mdash;": "—",
  "&hellip;": "…",
  "&ordm;": "º",
  "&ordf;": "ª",
  "&deg;": "°",
};

export function decodificarEntidades(texto: string): string {
  return String(texto || "")
    .replace(/&[a-z]+;|&#\d+;|&#x[0-9a-f]+;/gi, (e) => {
      const fixo = ENTIDADES[e.toLowerCase()];
      if (fixo) return fixo;
      const dec = /^&#(\d+);$/.exec(e);
      const hex = /^&#x([0-9a-f]+);$/i.exec(e);
      const codigo = dec ? Number.parseInt(dec[1], 10) : hex ? Number.parseInt(hex[1], 16) : NaN;
      if (!Number.isFinite(codigo)) return e;
      try {
        return String.fromCodePoint(codigo);
      } catch {
        return e;
      }
    });
}

const DOMINIOS_DA_LOJA = /^https?:\/\/(www\.)?balao\.info/i;

/**
 * Endereços que os artigos importados usam e que deixaram de existir quando o
 * catálogo foi trocado. Sem isto, o leitor clicava e caía numa categoria vazia.
 */
export const LINKS_CORRIGIDOS: Record<string, string> = {
  "/categoria/hardware-memorias": "/categoria/hardware-memoria-ram",
  "/categoria/hardware-placas-de-video": "/categoria/hardware-placa-de-video-vga",
  "/blog/quais-sao-as-diferencas-entre-notebooks-de-entrada-premium-e-gamer-38b4382d":
    "/blog/notebook-para-estudar-e-trabalhar",
};

/** Produto do catálogo espelhado entra e sai; a categoria fica. */
const PRODUTO_PARA_CATEGORIA: { termo: RegExp; destino: string }[] = [
  { termo: /placa-de-v[ií]deo|geforce|radeon|rtx|rx-\d/i, destino: "/categoria/hardware-placa-de-video-vga" },
  { termo: /mem[oó]ria/i, destino: "/categoria/hardware-memoria-ram" },
  { termo: /ssd/i, destino: "/categoria/hardware-ssd" },
  { termo: /fonte/i, destino: "/categoria/hardware-fontes" },
  { termo: /notebook/i, destino: "/notebooks" },
];

export function ajustarLink(href: string): string | null {
  let h = decodificarEntidades(String(href || "").trim());
  if (!h) return null;

  // Link para o próprio site vira caminho relativo: funciona igual em
  // produção, em pré-visualização e no computador de quem desenvolve.
  if (DOMINIOS_DA_LOJA.test(h)) {
    h = h.replace(DOMINIOS_DA_LOJA, "") || "/";
  }

  if (h.startsWith("/")) {
    const corte = h.search(/[?#]/);
    const caminho = corte === -1 ? h : h.slice(0, corte);
    const resto = corte === -1 ? "" : h.slice(corte);
    const limpo = caminho.length > 1 ? caminho.replace(/\/+$/, "") : caminho;
    if (LINKS_CORRIGIDOS[limpo]) return LINKS_CORRIGIDOS[limpo];
    if (limpo.startsWith("/product/")) {
      const troca = PRODUTO_PARA_CATEGORIA.find((p) => p.termo.test(limpo));
      return troca ? troca.destino : "/departamentos";
    }
    return `${limpo}${resto}`;
  }

  if (/^https:\/\//i.test(h)) return h;
  if (/^http:\/\//i.test(h)) return h.replace(/^http:/i, "https:");
  return null;
}

function semTags(html: string): string {
  return decodificarEntidades(html.replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

/** HTML de dentro de um parágrafo → texto com a marcação mínima dos blocos. */
export function htmlEmLinhaParaTexto(html: string): string {
  let s = String(html || "");

  s = s.replace(/<br\s*\/?>/gi, " ");

  s = s.replace(/<a\b[^>]*?\bhref\s*=\s*(?:"([^"]*)"|'([^']*)')[^>]*>([\s\S]*?)<\/a>/gi, (_m, h1, h2, dentro) => {
    const texto = semTags(dentro);
    const href = ajustarLink(h1 ?? h2 ?? "");
    if (!texto) return "";
    if (!href) return texto;
    return `[${texto.replace(/[[\]]/g, "")}](${href.replace(/\(/g, "%28").replace(/\)/g, "%29").replace(/\s/g, "%20")})`;
  });

  s = s.replace(/<(strong|b)\b[^>]*>([\s\S]*?)<\/\1>/gi, (_m, _t, dentro) => {
    const texto = semTags(dentro);
    return texto ? `**${texto}**` : "";
  });

  s = s.replace(/<(em|i)\b[^>]*>([\s\S]*?)<\/\1>/gi, (_m, _t, dentro) => {
    const texto = semTags(dentro);
    return texto ? `*${texto}*` : "";
  });

  return decodificarEntidades(s.replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .replace(/\s+([,;:.!?])/g, "$1")
    .trim();
}

function itensDaLista(html: string): string[] {
  const itens: string[] = [];
  const re = /<li\b[^>]*>([\s\S]*?)<\/li>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const texto = htmlEmLinhaParaTexto(m[1]);
    if (texto) itens.push(texto);
  }
  return itens;
}

function tabelaDoHtml(html: string): Bloco | null {
  const linhas: string[][] = [];
  const reLinha = /<tr\b[^>]*>([\s\S]*?)<\/tr>/gi;
  let m: RegExpExecArray | null;
  while ((m = reLinha.exec(html)) !== null) {
    const celulas: string[] = [];
    const reCelula = /<(td|th)\b[^>]*>([\s\S]*?)<\/\1>/gi;
    let c: RegExpExecArray | null;
    while ((c = reCelula.exec(m[1])) !== null) celulas.push(htmlEmLinhaParaTexto(c[2]));
    if (celulas.length > 0) linhas.push(celulas);
  }
  if (linhas.length < 2) return null;
  const [colunas, ...resto] = linhas;
  const largura = colunas.length;
  return {
    tipo: "tabela",
    colunas,
    linhas: resto.map((l) => Array.from({ length: largura }, (_v, i) => l[i] ?? "")),
  };
}

const BLOCO = /<(p|h[1-6]|ul|ol|blockquote|table|figure)\b[^>]*>([\s\S]*?)<\/\1>|<img\b[^>]*>/gi;

export function htmlParaBlocos(html: string): Bloco[] {
  const entrada = String(html || "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|iframe|object|embed|noscript|form)\b[\s\S]*?<\/\1>/gi, "");

  const blocos: Bloco[] = [];
  let cursor = 0;

  const textoSolto = (trecho: string) => {
    const texto = htmlEmLinhaParaTexto(trecho);
    if (texto) blocos.push({ tipo: "paragrafo", texto });
  };

  const imagem = (tag: string, legenda?: string) => {
    const src = /\bsrc\s*=\s*(?:"([^"]+)"|'([^']+)')/i.exec(tag);
    const alt = /\balt\s*=\s*(?:"([^"]*)"|'([^']*)')/i.exec(tag);
    const endereco = (src?.[1] ?? src?.[2] ?? "").trim();
    if (!/^https:\/\//i.test(endereco) && !endereco.startsWith("/")) return;
    blocos.push({
      tipo: "imagem",
      imagem: { src: endereco, alt: decodificarEntidades(alt?.[1] ?? alt?.[2] ?? "").trim() },
      legenda,
    });
  };

  BLOCO.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = BLOCO.exec(entrada)) !== null) {
    if (m.index > cursor) textoSolto(entrada.slice(cursor, m.index));
    cursor = m.index + m[0].length;

    const tag = (m[1] || "img").toLowerCase();
    const dentro = m[2] ?? "";

    if (tag === "img") {
      imagem(m[0]);
    } else if (tag === "figure") {
      const img = /<img\b[^>]*>/i.exec(dentro);
      const legenda = /<figcaption\b[^>]*>([\s\S]*?)<\/figcaption>/i.exec(dentro);
      if (img) imagem(img[0], legenda ? semTags(legenda[1]) : undefined);
    } else if (tag === "p") {
      const img = /^\s*<img\b[^>]*>\s*$/i.exec(dentro);
      if (img) imagem(img[0]);
      else {
        const texto = htmlEmLinhaParaTexto(dentro);
        if (texto) blocos.push({ tipo: "paragrafo", texto });
      }
    } else if (tag === "h1") {
      // O título do artigo já está no topo da página; um segundo H1 atrapalha.
    } else if (/^h[2-6]$/.test(tag)) {
      const texto = semTags(dentro);
      if (texto) blocos.push({ tipo: "titulo", nivel: tag === "h2" ? 2 : 3, texto });
    } else if (tag === "ul" || tag === "ol") {
      const itens = itensDaLista(dentro);
      if (itens.length > 0) blocos.push({ tipo: "lista", ordenada: tag === "ol", itens });
    } else if (tag === "blockquote") {
      const texto = htmlEmLinhaParaTexto(dentro);
      if (texto) blocos.push({ tipo: "destaque", tom: "nota", texto });
    } else if (tag === "table") {
      const tabela = tabelaDoHtml(dentro);
      if (tabela) blocos.push(tabela);
    }
  }
  if (cursor < entrada.length) textoSolto(entrada.slice(cursor));

  return blocos;
}
