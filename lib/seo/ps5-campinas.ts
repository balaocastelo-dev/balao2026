/**
 * "ps5 campinas" aparecia em três categorias com o mesmo nome de folha
 * ("PlayStation 5"): jogos, consoles e controles. O título automático
 * ("PlayStation 5 em Campinas") era igual nas três, e o Google misturava.
 *
 * A canônica é a de consoles. É onde se compra o aparelho, e é nela que cabe
 * a oferta já publicada na home (HomePs5Gta6Destaque): PS5 + GTA 6 por
 * R$ 5.999 ou 12x de R$ 599.
 *
 * Jogos e controles não são a mesma página: listam outros produtos. Não há
 * 301 nem canonical cruzado. O que muda é o título, o H1 e um link para a
 * canônica, para a frase "PS5 em Campinas" ficar numa URL só.
 */

export const SLUG_PS5_CONSOLES = "games-playstation-consoles-playstation-playstation-5";
export const SLUG_PS5_JOGOS = "games-playstation-jogos-playstation-playstation-5";
export const SLUG_PS5_CONTROLES = "games-playstation-controles-playstation-playstation-5";

export const URL_PS5_CONSOLES = `https://www.balao.info/categoria/${SLUG_PS5_CONSOLES}`;

export const TITULO_PS5_CONSOLES = "PS5 em Campinas | Pronta Entrega no Cambuí | Balão Anchieta";

/** A mesma frase do botão da home. Não inventar outro preço. */
export const MENSAGEM_PS5_GTA6 =
  "Olá! Quero o PlayStation 5 com o jogo GTA 6, por R$ 5.999 à vista ou 12x de R$ 599.";

export const PRECO_PS5_GTA6_A_VISTA = "R$ 5.999";
export const PRECO_PS5_GTA6_PARCELAS = "12x de R$ 599";

export type PapelPs5 = "consoles" | "jogos" | "controles";

export type AjustePs5 = {
  papel: PapelPs5;
  titulo: string;
  descricao: string;
  h1: string;
  h2: string;
  paragrafos: string[];
  /** Só nas páginas que não são a canônica. O texto da âncora é a frase da canônica. */
  ancoraCanonica?: { href: string; texto: string };
};

const ANCORA: AjustePs5["ancoraCanonica"] = {
  href: `/categoria/${SLUG_PS5_CONSOLES}`,
  texto: "PS5 em Campinas",
};

const CONSOLES: AjustePs5 = {
  papel: "consoles",
  titulo: TITULO_PS5_CONSOLES,
  descricao:
    "PS5 em Campinas com pronta entrega no Cambuí. Kit PlayStation 5 + GTA 6 por R$ 5.999 ou 12x de R$ 599 na Balão Anchieta. WhatsApp (19) 98751-0267.",
  h1: "PS5 em Campinas",
  h2: "PS5 em Campinas, com pronta entrega no Cambuí",
  paragrafos: [
    "Na Balão da Informática Anchieta, o PS5 em Campinas está na loja do Cambuí, na Av. Anchieta, 789, para ver e retirar.",
    `O kit da loja junta o console PlayStation 5 e o jogo GTA 6 por ${PRECO_PS5_GTA6_A_VISTA} ou ${PRECO_PS5_GTA6_PARCELAS}. É a mesma oferta do destaque da página inicial.`,
    "Horário: segunda a quinta, das 8h às 18h; sexta, das 8h às 17h; sábado, das 8h às 13h. WhatsApp (19) 98751-0267.",
  ],
};

const JOGOS: AjustePs5 = {
  papel: "jogos",
  titulo: "Jogos de PS5 em Campinas | Balão da Informática",
  descricao:
    "Jogos de PlayStation 5 na Balão da Informática Anchieta, no Cambuí, em Campinas. Esta página é de jogos. O console fica na categoria de PS5.",
  h1: "Jogos de PS5",
  h2: "Jogos de PlayStation 5 em Campinas",
  paragrafos: [
    "Aqui estão os jogos de PlayStation 5. O console em si, com pronta entrega no Cambuí, não é esta lista.",
  ],
  ancoraCanonica: ANCORA,
};

const CONTROLES: AjustePs5 = {
  papel: "controles",
  titulo: "Controle de PS5 em Campinas | Balão da Informática",
  descricao:
    "Controles de PlayStation 5 na Balão da Informática Anchieta, no Cambuí, em Campinas. O console fica na categoria de PS5, com pronta entrega.",
  h1: "Controles de PS5",
  h2: "Controles de PlayStation 5 em Campinas",
  paragrafos: [
    "Aqui estão os controles de PlayStation 5. O console em si, com pronta entrega no Cambuí, não é esta lista.",
  ],
  ancoraCanonica: ANCORA,
};

const POR_SLUG: Record<string, AjustePs5> = {
  [SLUG_PS5_CONSOLES]: CONSOLES,
  [SLUG_PS5_JOGOS]: JOGOS,
  [SLUG_PS5_CONTROLES]: CONTROLES,
};

export function ajusteDaCategoriaPs5(slug: string): AjustePs5 | null {
  return POR_SLUG[slug] ?? null;
}

/** Nenhuma das três é duplicata da outra: cada uma lista um tipo de produto. */
export function slugsPs5QueNaoRedirecionam(): string[] {
  return [SLUG_PS5_JOGOS, SLUG_PS5_CONTROLES];
}
