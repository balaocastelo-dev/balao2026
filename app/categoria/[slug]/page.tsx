import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import ProductList from "@/components/ProductList";
import Paginacao from "@/components/catalogo/Paginacao";
import { BotaoDeFiltros, FiltrosLaterais } from "@/components/catalogo/FiltrosDoCatalogo";

import { searchProducts } from "@/lib/searchUtils";
import { aplicarFiltros, contarFiltros, lerFiltros, montarFacetas, ordenar, paraQuery, termosDaBusca } from "@/lib/catalogo/filtros";
import { type Category } from "@/lib/utils";
import { Metadata } from "next";
import JsonLd, { generateBreadcrumbSchema, generateOrganizationSchema, generateItemListSchema } from "@/components/JsonLd";
import { notFound } from "next/navigation";
import { getCachedCategories, getCachedProducts, getCachedProductsByCategoryFullPath } from "@/lib/cache";
 
export const revalidate = 300;
const PRODUCTS_PER_PAGE = 24;

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    search?: string;
    tags?: string;
    page?: string;
    cat?: string;
    marca?: string;
    min?: string;
    max?: string;
    ordem?: string;
  }>;
};

function buildCategoryCanonical(slug: string, page: number, hasFacet: boolean) {
  if (hasFacet || page <= 1) {
    return `https://www.balao.info/categoria/${slug}`;
  }
  return `https://www.balao.info/categoria/${slug}?page=${page}`;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const sp = await searchParams;
  const { search, page } = sp;
  const categories = await getCachedCategories();
  const pageNumber = Math.max(1, Number.parseInt(page || "1", 10) || 1);
  const filtrosDaUrl = lerFiltros(sp);
  // Página filtrada ou reordenada é variação da mesma lista: não vai para o índice.
  const hasFacet = Boolean((search || "").trim() || contarFiltros(filtrosDaUrl) > 0 || filtrosDaUrl.ordem);
  
  let title = "Categoria";
  let description = "Encontre os melhores produtos de informática no Balão da Informática.";

  if (slug === 'todos-os-produtos') {
    title = "Todos os Produtos | Balão da Informática";
    description = "Confira nosso catálogo completo de produtos de informática, hardware e periféricos.";
  } else {
    const category = categories.find(c => c.slug === slug);
    if (category) {
      title = `${category.name} em Campinas | Balão da Informática`;
      description = `Compre ${category.name} com o melhor preço de Campinas. Hardware, Periféricos e Computadores com entrega rápida.`;
    }
  }

  if (pageNumber > 1 && !hasFacet) {
    title = `${title} - Página ${pageNumber}`;
  }

  const canonical = buildCategoryCanonical(slug, pageNumber, hasFacet);

  return {
    title,
    description,
    robots: hasFacet ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: {
      title,
      description,
      type: 'website',
      url: canonical,
    },
    alternates: {
      canonical,
    }
  };
}
 
export default async function CategoriaPage({
  params,
  searchParams,
}: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const { search } = sp;
  const filtros = lerFiltros(sp);
  const currentPage = filtros.pagina;
 
  const categories = await getCachedCategories();
 
  const findBySlug = (s: string, all: Category[]) =>
    all.find((c) => c.slug === s);
  const selectedCat = findBySlug(slug, categories);
  
  let categoryName = selectedCat?.name;
  if (slug === 'todos-os-produtos') {
      categoryName = 'Todos os Produtos';
  }

  // `products.category` guarda o caminho completo (ex: "Hardware/Placas-mãe/
  // AMD"), então clicar em "Hardware" precisa trazer produtos dessa categoria
  // E de todas as subcategorias abaixo dela — basta comparar prefixo do
  // caminho, sem precisar percorrer a árvore de parent_id.
  let filteredProducts =
    categoryName && categoryName !== "Todos os Produtos" && selectedCat?.full_path
      ? await getCachedProductsByCategoryFullPath(selectedCat.full_path)
      : await getCachedProducts();

  if (search) {
    filteredProducts = searchProducts(filteredProducts, search);
  }

  // Filtros laterais. As opções de cada bloco (subcategorias, marcas, faixa
  // de preço, características) saem do conjunto ANTES do corte de página, para
  // valerem para a categoria inteira.
  const raiz = categoryName !== "Todos os Produtos" ? selectedCat?.full_path || "" : "";
  const facetas = montarFacetas(filteredProducts, filtros, raiz, categoryName || "Todas as categorias");
  const filtrosLigados = contarFiltros(filtros);
  const ordemPadrao = search ? "relevancia" : "menor";
  filteredProducts = ordenar(
    aplicarFiltros(filteredProducts, filtros),
    filtros.ordem || ordemPadrao,
    search ? termosDaBusca(search) : []
  );
  const totalProducts = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalProducts / PRODUCTS_PER_PAGE));

  if (currentPage > totalPages && totalProducts > 0) {
    notFound();
  }

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );
  const canonical = buildCategoryCanonical(
    slug,
    currentPage,
    Boolean((search || "").trim() || filtrosLigados > 0 || filtros.ordem)
  );
  const hrefDaPagina = (pagina: number) => {
    const qs = paraQuery({ ...filtros, pagina }, { search });
    return qs ? `/categoria/${slug}?${qs}` : `/categoria/${slug}`;
  };
  const propsDosFiltros = { facetas, filtros, ligados: filtrosLigados, total: totalProducts, ordemPadrao } as const;

  // Schema Markup
  const breadcrumbItems = [
    { name: 'Home', item: 'https://www.balao.info' },
    { name: 'Departamentos', item: 'https://www.balao.info/departamentos' },
    { name: categoryName || 'Categoria', item: `https://www.balao.info/categoria/${slug}` }
  ];
 
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <JsonLd data={[
        generateOrganizationSchema(),
        generateBreadcrumbSchema(breadcrumbItems),
        generateItemListSchema(paginatedProducts, canonical)
      ]} />
      <Header />
      
      {/* Mobile Title & Filters Toggle (Placeholder for future filter drawer) */}
      <div className="container mx-auto flex items-center justify-between px-3 py-4 sm:px-4 lg:hidden">
         <h1 className="text-xl font-bold text-[var(--site-text)]">
            {categoryName || "Categoria"}
         </h1>
         <div className="flex items-center gap-2">
           <span className="rounded-full border border-[var(--site-border)] bg-[var(--site-panel-soft)] px-2.5 py-1 text-xs font-medium text-[var(--site-muted)]">
              {totalProducts}
           </span>
           <BotaoDeFiltros {...propsDosFiltros} />
         </div>
      </div>

      <div className="container mx-auto flex flex-1 flex-col gap-4 px-3 py-4 sm:px-4 lg:flex-row lg:gap-6 lg:px-0 lg:py-6">
        {/* Sidebar Hidden on Mobile */}
        <div className="hidden lg:flex w-64 shrink-0 flex-col gap-4">
          <FiltrosLaterais {...propsDosFiltros} />
          <Sidebar categories={categories} />
        </div>

        <main className="flex-1 w-full min-w-0">
          <div className="mb-4 hidden items-center justify-between lg:flex">
            <h1 className="text-2xl font-bold text-[var(--site-text)]">
              {categoryName || "Categoria"}
            </h1>
            <span className="text-sm text-[var(--site-muted)]">
              {totalProducts} produtos{totalPages > 1 ? ` • Página ${currentPage} de ${totalPages}` : ""}
            </span>
          </div>

          {paginatedProducts.length === 0 ? (
            <div className="site-surface-soft rounded-[1.5rem] px-6 py-16 text-center text-[var(--site-muted)] shadow-sm">
              <p className="text-xl font-medium">Nenhum produto encontrado.</p>
              <p className="mt-2 text-sm">
                {filtrosLigados > 0 ? "Nenhum produto bate com esses filtros. Tire algum para ver mais." : "Tente outra busca."}
              </p>
            </div>
          ) : (
            <>
              <ProductList products={paginatedProducts} semOrdenacao />
              <Paginacao atual={currentPage} total={totalPages} href={hrefDaPagina} rotulo="Paginação da categoria" />
            </>
          )}

          {/* SEO Section for Categories */}
          {categoryName && categoryName !== "Todos os Produtos" && (
             <section className="site-surface-soft mt-8 rounded-[1.5rem] border-t border-[var(--site-border)] p-5 shadow-sm sm:p-6">
                <h2 className="mb-4 text-xl font-bold text-[var(--site-text)]">
                    Comprar {categoryName} em Campinas e Região
                </h2>
                <div className="prose prose-sm max-w-none text-[var(--site-soft)]">
                    <p>
                        Procurando por <strong>{categoryName}</strong> com o melhor preço de Campinas? No Balão da Informática você encontra uma seleção completa de {categoryName.toLowerCase()} das melhores marcas do mercado. Somos especialistas em hardware e periféricos, oferecendo garantia e suporte técnico especializado.
                    </p>
                    <p className="mt-2">
                        Atendemos toda a Região Metropolitana de Campinas (RMC). Compre online e receba com rapidez em <strong>Sumaré, Hortolândia, Paulínia, Valinhos, Vinhedo e Indaiatuba</strong>. Se preferir, retire seu produto em nossa loja física.
                    </p>
                    <p className="mt-2">
                        Não sabe qual {categoryName.toLowerCase()} escolher? Nossa equipe pode te ajudar a montar o setup ideal para suas necessidades, seja para PC Gamer, estação de trabalho ou uso doméstico. Aproveite nossas promoções de <strong>{categoryName}</strong> e faça um upgrade no seu computador hoje mesmo.
                    </p>
                </div>
             </section>
          )}
        </main>
      </div>
    </div>
  );
}
