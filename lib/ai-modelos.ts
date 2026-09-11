// ============================================================
// Nomes dos modelos de IA, num lugar só — e um limite de tempo para todos.
//
// O que aconteceu: `gemini-1.5-flash` e `gemini-pro` foram descontinuados, e o
// site continuou pedindo por eles. Resultado em produção, medido nos registros
// da Vercel: **2.181 erros atingindo 378 visitantes**, desde 23/08, nas rotas
// `/blog`, `/blog/[slug]`, `/montagempc`, `/product/[id]` e no `/sitemap.xml`.
// A página do blog ficava presa num carregador que nunca resolvia.
//
// Duas lições viraram código aqui:
//
// 1. **Nome de modelo espalhado pelo código vira bomba-relógio.** Provedor
//    aposenta modelo sem avisar; quando isso acontece, tem que dar para trocar
//    num lugar só, ou por variável de ambiente, sem publicar nada.
//
// 2. **Chamada de IA no meio de uma página precisa de prazo.** Sem limite de
//    tempo, uma API lenta ou fora do ar não devolve erro — ela simplesmente
//    não responde, e a página fica girando para sempre. É o que o visitante
//    via no blog.
// ============================================================

/** Gemini. Trocável por variável de ambiente quando o Google aposentar este. */
export const MODELO_GEMINI = process.env.GEMINI_MODEL || "gemini-2.0-flash";

/** Groq. O `llama-3.1-70b-versatile` que estava aqui também foi desativado. */
export const MODELO_GROQ = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

/** Prazo padrão. Vinte segundos é generoso para texto curto e curto o bastante
 *  para o visitante não desistir antes. */
const PRAZO_PADRAO_MS = 20_000;

/**
 * Põe prazo em qualquer chamada de IA.
 *
 * Devolve `null` quando estoura, em vez de lançar: quem chama já trata
 * "não veio nada" — a página mostra o que tem e segue. Uma API de terceiro
 * indisponível não pode derrubar a loja.
 */
export async function comPrazo<T>(
  rotulo: string,
  tarefa: () => Promise<T>,
  prazoMs = PRAZO_PADRAO_MS
): Promise<T | null> {
  let alarme: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      tarefa(),
      new Promise<never>((_, rejeitar) => {
        alarme = setTimeout(
          () => rejeitar(new Error(`${rotulo}: passou de ${prazoMs / 1000}s sem responder`)),
          prazoMs
        );
      }),
    ]);
  } catch (erro) {
    console.warn(`[ia] ${rotulo} falhou:`, erro instanceof Error ? erro.message : erro);
    return null;
  } finally {
    if (alarme) clearTimeout(alarme);
  }
}
