import Link from "next/link";
import { MessageCircle } from "lucide-react";
import PaginaDeCaptacao from "@/components/landing/PaginaDeCaptacao";
import SecaoEspecial from "@/components/landing/SecaoEspecial";
import ProductCard from "@/components/ProductCard";
import { getCachedCategories, getCachedNotebooks } from "@/lib/cache";
import { RAIZ_NOTEBOOKS } from "@/lib/catalogo/notebooks";
import { SITE_CONFIG } from "@/lib/config";
import { carregarDadosDaPagina } from "@/lib/landing/dados";
import { metadadosDaPagina } from "@/lib/landing/metadados";
import { paginaPorSlug } from "@/lib/landing/paginas";

// Conteúdo em lib/landing/paginas/notebooks.ts. A vitrine continua a de
// 11/10 (lib/catalogo/notebooks.ts): só notebooks nos cards, sem peça nem
// acessório, do mais barato para o mais caro.
export const revalidate = 300;

const pagina = paginaPorSlug("notebooks");

export const metadata = metadadosDaPagina(pagina);

export default async function Page() {
  const [dados, vitrine, categorias] = await Promise.all([
    carregarDadosDaPagina(pagina),
    getCachedNotebooks().catch(() => ({ produtos: [], total: 0 })),
    getCachedCategories().catch(() => []),
  ]);

  const notebooks = vitrine.produtos;
  const slug = categorias.find((c) => c.full_path === RAIZ_NOTEBOOKS)?.slug || "computadores-notebooks";
  // No topo flutuam os modelos de cima da vitrine (do fim da lista, os mais completos).
  const destaques = [...notebooks].reverse().slice(0, 5);

  const blocoDaVitrine = (
    <SecaoEspecial
      id="vitrine"
      titulo="Notebooks à venda"
      texto="Do mais em conta ao mais completo. Pergunte no WhatsApp o que tem para retirar hoje e peça para ver ligado no balcão."
    >
      {notebooks.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
            {notebooks.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          <Link href={`/categoria/${slug}`} className="cpt-botao cpt-botao--linha mt-10">
            {vitrine.total > notebooks.length ? `Ver os ${vitrine.total} notebooks, com filtros` : "Filtrar notebooks por marca e preço"}
          </Link>
        </>
      ) : (
        <div className="rounded-[20px] border border-[var(--cpt-fio)] p-6 sm:p-8">
          <p className="cpt-corpo">Os notebooks não carregaram agora. Chame no WhatsApp e mandamos os modelos e os preços.</p>
          <a
            href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent("Olá! Quero ver os notebooks disponíveis na Balão.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="cpt-botao cpt-botao--acao mt-5"
          >
            <MessageCircle className="h-5 w-5" aria-hidden />
            Ver notebooks no WhatsApp
          </a>
        </div>
      )}
    </SecaoEspecial>
  );

  return (
    <PaginaDeCaptacao
      pagina={pagina}
      dados={dados}
      produtosDosEspeciais={destaques}
      especiais={{ "vitrine-notebooks": blocoDaVitrine }}
    />
  );
}
