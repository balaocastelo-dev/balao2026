// ============================================================
// Endereço pessoal de cada vendedor do CRM: www.balao.info/<slug>.
//
// O slug sai do nome (minúsculo, sem acento, sem espaço). Nome repetido
// ganha um número no fim, e um nome que coincidiria com uma página do
// site (iphone, painel, sistema…) nunca toma esse endereço: a página
// original continua no ar, com o SEO dela, e o vendedor recebe outro slug.
//
// A conta é só do nome e do id. Não entra PIN, senha nem assinatura.
// ============================================================

/**
 * Pastas que já são a página do vendedor de propósito.
 * /wendell precisa continuar existindo como pasta por causa de /wendell/apple.
 * Estas NÃO entram na lista reservada: são o próprio atendimento.
 */
export const PASTAS_DE_VENDEDOR = [
  "brendon",
  "gabriel",
  "julia",
  "marcos",
  "thiago",
  "wendell",
] as const;

/**
 * Nomes que um vendedor não pode ocupar.
 *
 * Inclui as rotas do site, os rewrites (/sistema, /mybots, /3d, /app),
 * as pastas de public/ e os endereços antigos que redirecionam.
 * A lista é conferida por teste contra as pastas de app/ e public/:
 * rota nova no site tem de entrar aqui, senão um vendedor homônimo
 * passaria a abrir no lugar dela.
 */
export const SLUGS_RESERVADOS: readonly string[] = [
  "[slug]",
  "3d",
  "_next",
  "_vercel",
  "acer-aspire-go-15",
  "admin",
  "android",
  "api",
  "apk",
  "app",
  "apple-icon",
  "arena",
  "assets",
  "assistenciagames",
  "bairro",
  "blog",
  "carregadores",
  "cart",
  "categoria",
  "chacara3d",
  "como-comprar",
  "consignacao",
  "consignados",
  "conteudo",
  "controle",
  "convite",
  "crm",
  "dashboard",
  "demo-esc",
  "departamentos",
  "downloads",
  "envio-e-entrega",
  "especialidades",
  "fale-conosco",
  "favicon",
  "fechamento",
  "feed",
  "fonts",
  "formatacao",
  "fotos-produtos",
  "funcoes",
  "gerador",
  "ia-local",
  "icon",
  "icons",
  "images",
  "imac",
  "iphone",
  "livros",
  "llms.txt",
  "login",
  "logout",
  "macbook",
  "manifest",
  "manutencao",
  "microsoft",
  "montagempc",
  "monteseupc",
  "mybots",
  "mybots-app",
  "notebook-acer",
  "notebook-asus",
  "notebook-dell",
  "notebook-hp",
  "notebook-lenovo",
  "notebook-samsung",
  "notebooks",
  "opengraph-image",
  "overclock",
  "p",
  "painel",
  "pcgamer",
  "pcgamer3d",
  "pdv",
  "premium",
  "product",
  "promocao",
  "public",
  "qual-pc-gamer",
  "queda-de-preco",
  "recuperacaodados",
  "regiao",
  "reparoapple",
  "robots",
  "roleta",
  "rss",
  "search",
  "seguranca-e-privacidade",
  "seminovos",
  "service-worker",
  "servicos-e-ofertas",
  "sistema",
  "sistemas",
  "sistemasdeia",
  "sitemap",
  "sobre-a-empresa",
  "sobre-nos",
  "software",
  "softwares",
  "sounds",
  "static",
  "sw",
  "telaiphone",
  "thank-you",
  "thiagoia",
  "toner",
  "trocas-e-devolucoes",
  "twitter-image",
  "unsubscribe",
  "upgrade-ssd",
  "uploads",
  "urgente",
  "vercel",
  "vitrine",
  "well-known",
  "whatsapp",
];

const RESERVADOS = new Set(SLUGS_RESERVADOS);

export function slugReservado(slug: string): boolean {
  return RESERVADOS.has(String(slug || "").trim().toLowerCase());
}

/** minúsculo, sem acento, sem espaço e sem pontuação. */
export function slugDoNome(nome: string): string {
  return String(nome || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, "");
}

type ComIdENome = { id: string | number; nome: string };

/**
 * Um slug por vendedor, estável: quem já tem o id igual ao slug do nome
 * (os cadastrados há mais tempo: thiago, gabriel…) fica com ele.
 * O próximo homônimo recebe o número seguinte (thiago2). Reservado é pulado.
 * O PIN, se vier no objeto, não sai no resultado.
 */
export function atribuirSlugs<T extends ComIdENome>(
  vendedores: readonly T[]
): (Omit<T, "pin"> & { slug: string })[] {
  const ordenados = vendedores
    .map((v, indice) => ({ v, indice }))
    .sort((a, b) => {
      const prefA = String(a.v.id) === slugDoNome(a.v.nome) ? 0 : 1;
      const prefB = String(b.v.id) === slugDoNome(b.v.nome) ? 0 : 1;
      if (prefA !== prefB) return prefA - prefB;
      const porId = String(a.v.id).localeCompare(String(b.v.id));
      if (porId !== 0) return porId;
      return a.indice - b.indice;
    });

  const usados = new Set<string>(RESERVADOS);
  const porId = new Map<string, Omit<T, "pin"> & { slug: string }>();

  for (const { v } of ordenados) {
    const base = slugDoNome(v.nome) || "vendedor";
    let slug = base;
    let n = 2;
    while (usados.has(slug)) {
      slug = `${base}${n}`;
      n += 1;
    }
    usados.add(slug);
    const copia = { ...v } as T & { pin?: unknown };
    delete copia.pin;
    porId.set(String(v.id), { ...copia, slug });
  }

  return vendedores.map((v) => porId.get(String(v.id))!);
}

export function acharPorSlug<T extends ComIdENome>(
  vendedores: readonly T[],
  slug: string
): (Omit<T, "pin"> & { slug: string }) | null {
  const alvo = String(slug || "").trim().toLowerCase();
  if (!alvo || slugReservado(alvo)) return null;
  return atribuirSlugs(vendedores).find((v) => v.slug === alvo) ?? null;
}
