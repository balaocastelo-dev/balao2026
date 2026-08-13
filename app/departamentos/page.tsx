import { Metadata } from 'next';
import Link from 'next/link';
import { getCategories, getProductsSummaryByCategory } from '@/lib/db';
import { buildCategoryTree, Category } from '@/lib/utils';
import JsonLd, { generateOrganizationSchema, generateBreadcrumbSchema } from '@/components/JsonLd';
import CategoryTreeAccordion from '@/components/CategoryTreeAccordion';

export const metadata: Metadata = {
  title: 'Departamentos e Categorias',
  description: 'Explore todos os departamentos de informática. Hardware, Periféricos, Computadores, Notebooks e muito mais. Encontre o que você precisa em Campinas.',
  keywords: ['departamentos informatica', 'categorias hardware', 'loja informatica campinas', 'comprar pc', 'peças computador'],
  alternates: {
    canonical: 'https://www.balao.info/departamentos',
  },
};

export const dynamic = 'force-dynamic';

export default async function DepartamentosPage() {
  const [categories, productCountsByCategorySlug] = await Promise.all([
    getCategories(),
    getProductsSummaryByCategory ? getProductsSummaryByCategory() : Promise.resolve({} as Record<string, number>),
  ]);

  // Árvore em cascata (todos os níveis, não apenas 2)
  const roots: Category[] = buildCategoryTree(categories).sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

  // Contagem de produtos por categoria (folhas + agregado dos filhos)
  const countMap: Record<string, number> = {};
  const slugById: Record<string, string> = {};
  const childrenByParentId: Record<string, Category[]> = {};
  for (const c of categories) {
    slugById[c.id] = c.slug;
    if (c.parent_id) {
      (childrenByParentId[c.parent_id] ||= []).push(c);
    }
    const direct =
      typeof productCountsByCategorySlug === "object" && c.slug
        ? Number((productCountsByCategorySlug as any)[c.slug] || 0)
        : 0;
    countMap[c.slug] = (countMap[c.slug] || 0) + direct;
  }
  // Agregação bottom-up
  const visit = (id: string): number => {
    const kids = childrenByParentId[id] || [];
    let sum = countMap[slugById[id]] || 0;
    for (const k of kids) sum += visit(k.id);
    if (slugById[id]) countMap[slugById[id]] = sum;
    return sum;
  };
  roots.forEach((r) => visit(r.id));

  const breadcrumbItems = [
    { name: 'Home', item: 'https://www.balao.info' },
    { name: 'Departamentos', item: 'https://www.balao.info/departamentos' }
  ];

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: roots.map((category, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `https://www.balao.info/categoria/${category.slug}`,
      name: category.name
    })),
    url: 'https://www.balao.info/departamentos',
    numberOfItems: roots.length
  };

  const totalProdutos = Object.values(countMap).reduce((s, n) => s + (Number.isFinite(n) ? n : 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <JsonLd data={[
        generateOrganizationSchema(),
        generateBreadcrumbSchema(breadcrumbItems),
        itemList
      ]} />

      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Departamentos</h1>
          <p className="text-gray-500 mt-2">Navegue por todas as nossas categorias — clique na seta para expandir as subcategorias</p>
          <div className="mt-5 flex flex-wrap items-center gap-3 text-xs font-bold text-gray-500">
            <span className="rounded-full bg-blue-50 text-blue-600 px-3 py-1.5 border border-blue-100">
              {roots.length} departamentos principais
            </span>
            <span className="rounded-full bg-gray-100 text-gray-600 px-3 py-1.5 border border-gray-200">
              {categories.length} categorias no total
            </span>
            {totalProdutos > 0 && (
              <span className="rounded-full bg-emerald-50 text-emerald-600 px-3 py-1.5 border border-emerald-100">
                {Math.round(totalProdutos).toLocaleString("pt-BR")} produtos cadastrados
              </span>
            )}
            <Link
              href="/"
              className="ml-auto rounded-full bg-gray-900 text-white px-4 py-1.5 hover:bg-gray-700 transition-colors"
            >
              ← Voltar para a loja
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-12">
        <CategoryTreeAccordion
          roots={roots as any}
          mode="cards"
          defaultOpen="top-4"
          itemCountBySlug={countMap}
        />
      </main>
    </div>
  );
}
