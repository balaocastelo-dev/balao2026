import Link from "next/link";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import ProductList from "@/components/ProductList";
import FilterSyncer from "@/components/FilterSyncer";
import { getProductsByExactCategories, getCategories } from "@/lib/db";
import { searchProducts } from "@/lib/searchUtils";
import { extractTags, filterProductsByTags } from "@/lib/product-filters";
import { parsePriceToNumber, type Category } from "@/lib/utils";
import { Metadata } from "next";
import JsonLd, { generateBreadcrumbSchema, generateOrganizationSchema, generateItemListSchema } from "@/components/JsonLd";
import { notFound } from "next/navigation";
 
export const revalidate = 300;
const PRODUCTS_PER_PAGE = 24;

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ search?: string; tags?: string; page?: string }>;
};

function buildCategoryCanonical(slug: string, page: number, hasFacet: boolean) {
  if (hasFacet || page <= 1) {
    return `https://www.balao.info/categoria/${slug}`;
  }
  return `https://www.balao.info/categoria/${slug}?page=${page}`;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { search, tags: tagsParam, page } = await searchParams;
  const categories = await getCategories();
  const pageNumber = Math.max(1, Number.parseInt(page || "1", 10) || 1);
  const hasFacet = Boolean((search || "").trim() || (tagsParam || "").trim());
  
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
  const { search, tags: tagsParam, page } = await searchParams;
  const selectedTags = tagsParam ? tagsParam.split(',') : [];
  const currentPage = Math.max(1, Number.parseInt(page || "1", 10) || 1);
 
  const categories = await getCategories();
 
  const findBySlug = (s: string, all: Category[]) =>
    all.find((c) => c.slug === s);
  const selectedCat = findBySlug(slug, categories);
  
  let categoryName = selectedCat?.name;
  if (slug === 'todos-os-produtos') {
      categoryName = 'Todos os Produtos';
  }

  const getDescendantNames = (root: Category | undefined, all: Category[]) => {
    if (!root) return [];
    const descendants: string[] = [];
    const stack = [root.id];
    while (stack.length > 0) {
      const currentId = stack.pop()!;
      const children = all.filter((c) => c.parent_id === currentId);
      children.forEach((child) => {
        descendants.push(child.name);
        stack.push(child.id);
      });
    }
    return descendants;
  };
 
  const validCategories = new Set<string>();
  if (categoryName) {
    validCategories.add(categoryName);
    const descendants = getDescendantNames(selectedCat, categories);
    descendants.forEach((d) => validCategories.add(d));
  }
 
  let filteredProducts = await getProductsByExactCategories(
    categoryName && categoryName !== "Todos os Produtos"
      ? [...validCategories]
      : categories.map((category) => category.name)
  );
 
  if (search) {
    filteredProducts = searchProducts(filteredProducts, search);
  }

  // Extract tags from current filtered products (before tag filtering)
  const availableTags = extractTags(filteredProducts);

  // Apply tag filter
  filteredProducts = filterProductsByTags(filteredProducts, selectedTags);
  filteredProducts = filteredProducts.sort((a, b) => parsePriceToNumber(a.price) - parsePriceToNumber(b.price));
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
    Boolean((search || "").trim() || selectedTags.length > 0)
  );

  // Schema Markup
  const breadcrumbItems = [
    { name: 'Home', item: 'https://www.balao.info' },
    { name: 'Departamentos', item: 'https://www.balao.info/departamentos' },
    { name: categoryName || 'Categoria', item: `https://www.balao.info/categoria/${slug}` }
  ];
 
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <JsonLd data={[
        generateOrganizationSchema(),
        generateBreadcrumbSchema(breadcrumbItems),
        generateItemListSchema(paginatedProducts, canonical)
      ]} />
      <FilterSyncer tags={availableTags} />
      <Header />
      
      {/* Mobile Title & Filters Toggle (Placeholder for future filter drawer) */}
      <div className="lg:hidden container mx-auto px-4 py-4 flex items-center justify-between">
         <h1 className="text-xl font-bold text-gray-800">
            {categoryName || "Categoria"}
         </h1>
         <span className="text-xs font-medium bg-gray-200 px-2 py-1 rounded-full text-gray-600">
            {totalProducts}
         </span>
      </div>

      <div className="flex container mx-auto flex-1 py-6 gap-6 px-4 lg:px-0">
        {/* Sidebar Hidden on Mobile */}
        <div className="hidden lg:block w-64 shrink-0">
          <Sidebar categories={categories} availableTags={availableTags} selectedTags={selectedTags} />
        </div>

        <main className="flex-1 w-full min-w-0">
          <div className="hidden lg:flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-800">
              {categoryName || "Categoria"}
            </h1>
            <span className="text-sm text-gray-500">
              {totalProducts} produtos{totalPages > 1 ? ` • Página ${currentPage} de ${totalPages}` : ""}
            </span>
          </div>

          {/* Tags List for Mobile (Horizontal Scroll) */}
          <div className="lg:hidden flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
             {availableTags.map(tag => (
                <div key={tag.name} className="whitespace-nowrap bg-white border border-gray-200 px-3 py-1 rounded-full text-sm text-gray-600">
                   {tag.name}
                </div>
             ))}
          </div>

          {paginatedProducts.length === 0 ? (
            <div className="text-center py-20 text-gray-500 bg-white rounded-lg shadow-sm">
              <p className="text-xl font-medium">Nenhum produto encontrado.</p>
              <p className="mt-2 text-sm">Tente ajustar seus filtros ou busca.</p>
            </div>
          ) : (
            <>
              <ProductList products={paginatedProducts} />
              {totalPages > 1 && (
                <nav
                  aria-label="Paginação da categoria"
                  className="mt-8 flex flex-wrap items-center justify-center gap-2"
                >
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => {
                    const qs = new URLSearchParams();
                    if (search) qs.set("search", search);
                    if (tagsParam) qs.set("tags", tagsParam);
                    if (pageNumber > 1) qs.set("page", String(pageNumber));
                    const href = qs.toString()
                      ? `/categoria/${slug}?${qs.toString()}`
                      : `/categoria/${slug}`;

                    return (
                      <Link
                        key={pageNumber}
                        href={href}
                        className={`min-w-11 rounded-xl border px-4 py-2 text-sm font-bold transition-colors ${
                          pageNumber === currentPage
                            ? "border-red-600 bg-red-600 text-white"
                            : "border-gray-300 bg-white text-gray-700 hover:border-red-500 hover:text-red-600"
                        }`}
                      >
                        {pageNumber}
                      </Link>
                    );
                  })}
                </nav>
              )}
            </>
          )}

          {/* SEO Section for Categories */}
          {categoryName && categoryName !== "Todos os Produtos" && (
             <section className="bg-white p-6 rounded-lg shadow-sm mt-8 border-t border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                    Comprar {categoryName} em Campinas e Região
                </h2>
                <div className="prose prose-sm text-gray-600 max-w-none">
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
