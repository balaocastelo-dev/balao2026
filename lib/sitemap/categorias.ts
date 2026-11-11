import { turso } from "@/lib/turso";
import { lerCatalogoDoEspelho } from "@/lib/catalogo-espelho";

/**
 * Caminhos de categoria que têm pelo menos um produto hoje.
 *
 * Por que existe: `app/categoria/[slug]/page.tsx` manda `noindex` quando a
 * categoria está vazia, mas o sitemap mandava as 259 categorias do menu, cheias
 * ou não. O Google rastreava tudo e devolvia "excluída pela tag noindex" —
 * eram 3.344 endereços assim em 11/11/2026, gastando rastreamento que deveria
 * ir para as páginas de produto. Aqui sai a lista de caminhos com produto, numa
 * consulta só; o sitemap usa isso para deixar a categoria vazia de fora.
 *
 * As limpezas de catálogo (756 computadores genéricos em 18/10, 1.139 repetidos
 * no mesmo dia, 173 sem foto) esvaziaram muita subcategoria sem tirá-la do menu,
 * que é de onde vem o tamanho do problema.
 */
export async function lerCaminhosComProduto(): Promise<string[]> {
  try {
    const resposta = await turso.execute(
      "SELECT DISTINCT category FROM products WHERE category IS NOT NULL AND category <> ''"
    );
    const caminhos = resposta.rows
      .map((linha) => String((linha as Record<string, unknown>).category || "").trim())
      .filter(Boolean);
    if (caminhos.length > 0) return caminhos;
  } catch {
    // Banco em pausa (cota de conexões da Hostinger): cai para a cópia do catálogo.
  }

  const copia = await lerCatalogoDoEspelho().catch(() => []);
  return Array.from(
    new Set(copia.map((p) => String(p?.category || "").trim()).filter(Boolean))
  );
}

/**
 * A categoria vale quando ela mesma, ou alguma abaixo dela, tem produto.
 * `products.category` guarda o caminho inteiro ("Hardware/Placas-mãe/AMD"),
 * então clicar em "Hardware" traz tudo que está abaixo — a mesma comparação de
 * prefixo que a página da categoria faz.
 */
export function categoriaTemProduto(
  fullPath: string | null | undefined,
  caminhosComProduto: string[]
): boolean {
  const alvo = String(fullPath || "").trim().toLowerCase();
  if (!alvo) return false;
  return caminhosComProduto.some((caminho) => {
    const atual = caminho.toLowerCase();
    return atual === alvo || atual.startsWith(alvo + "/");
  });
}
