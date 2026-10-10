// ============================================================
// Para onde voltar depois da senha do painel.
//
// Quando alguém sem sessão pede uma área de dentro do painel, a tranca
// (proxy.ts) manda para /painel?voltar=<área>, e a tela de entrada devolve a
// pessoa para lá depois da senha. Esse parâmetro vem do endereço — ou seja,
// qualquer um pode montar um link com o valor que quiser e mandar para quem
// administra a loja. Por isso ele só é obedecido quando aponta, de verdade,
// para dentro do /painel.
//
// "De verdade" é a parte que importa. Conferir o texto não basta: o navegador
// trata `%2e%2e` como `..`, então `/painel/%2e%2e/api/admin/seed-categories`
// COMEÇA com /painel/ e TERMINA em /api/admin/seed-categories — uma rota que
// apaga as categorias da loja, aberta com a sessão que a pessoa acabou de
// criar. A conferência é feita sobre o endereço já resolvido pelo mesmo
// mecanismo que o navegador usa.
// ============================================================

/**
 * Devolve o caminho (com a consulta, se houver) para onde ir depois da senha,
 * ou null quando o valor não é um endereço de dentro do painel.
 *
 * `origem` é a origem da página atual (window.location.origin).
 */
export function destinoDentroDoPainel(valor: string | null | undefined, origem: string): string | null {
  if (!valor || typeof valor !== "string") return null;
  if (valor.length > 500) return null;
  // Tem de ser um caminho do próprio site. "//outro.site" e "\\outro.site"
  // são endereços de fora que começam com barra.
  if (!valor.startsWith("/") || valor.startsWith("//") || valor.includes("\\")) return null;
  // Caracteres de controle (quebra de linha, tab) são removidos em silêncio
  // pelo navegador antes de resolver o endereço — mais um jeito de disfarçar.
  if (/[\u0000-\u001f\u007f]/.test(valor)) return null;

  let resolvido: URL;
  try {
    resolvido = new URL(valor, origem);
  } catch {
    return null;
  }

  if (resolvido.origin !== origem) return null;

  const caminho = resolvido.pathname;
  if (caminho !== "/painel" && !caminho.startsWith("/painel/")) return null;
  // Depois de resolvido não sobra ponto-ponto; se sobrar algum codificado de
  // outro jeito, não é um endereço que o painel tenha.
  if (/%2e|%2f|%5c/i.test(caminho)) return null;

  return `${caminho}${resolvido.search}`;
}
