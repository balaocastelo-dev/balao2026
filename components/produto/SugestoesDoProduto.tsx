import CarrosselDeSugestoes from "./CarrosselDeSugestoes";
import { getCachedBaseDeSugestoes } from "@/lib/cache";
import { escolherSugestoes, planoDeSugestoes } from "@/lib/catalogo/sugestoes";
import type { Product } from "@/lib/utils";

// Sugestões embaixo do produto: "Opções parecidas" e "Combina com este
// produto" (lib/catalogo/sugestoes.ts). Se a leitura falhar, a página do
// produto aparece normalmente, só sem os carrosséis.

export default async function SugestoesDoProduto({
  produto,
}: {
  produto: Pick<Product, "id" | "name" | "price" | "category">;
}) {
  let sugestoes: ReturnType<typeof escolherSugestoes> = { parecidos: [], combina: [] };
  try {
    const plano = planoDeSugestoes(produto.category);
    const base = await getCachedBaseDeSugestoes(produto.category);
    sugestoes = escolherSugestoes(produto, base, plano);
  } catch (error) {
    console.warn("[sugestoes] Não consegui montar as sugestões do produto:", error);
  }

  const { parecidos, combina } = sugestoes;
  if (parecidos.length === 0 && combina.length === 0) return null;

  return (
    <div className="site-surface mt-6 flex flex-col gap-8 rounded-[1.4rem] p-4 shadow-[0_30px_80px_rgba(2,6,23,0.12)] sm:rounded-[1.75rem] sm:p-6 md:p-8">
      <CarrosselDeSugestoes
        id="opcoes-parecidas"
        titulo="Opções parecidas"
        subtitulo="Da mesma categoria e numa faixa de preço próxima, para você comparar."
        produtos={parecidos as Product[]}
      />
      <CarrosselDeSugestoes
        id="combina-com-este"
        titulo="Combina com este produto"
        subtitulo="O que costuma ir junto, para levar tudo de uma vez."
        produtos={combina as Product[]}
      />
    </div>
  );
}
