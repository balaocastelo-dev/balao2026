import { Metadata } from 'next';
import { getCategories, getProductById } from '@/lib/db';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { notFound, permanentRedirect } from 'next/navigation';
import ShareButton from '@/components/ShareButton';
import WhatsAppButton from '@/components/WhatsAppButton';
import ProductActions from '@/components/ProductActions';
import ShippingCalculator from '@/components/ShippingCalculator';
import ProductMediaSwitcher from '@/components/ProductMediaSwitcher';
import JsonLd, { generateOrganizationSchema, generateBreadcrumbSchema, generateProductSchema } from '@/components/JsonLd';
import { getProductHref } from '@/lib/utils';

type Props = {
  params: Promise<{ id: string }>;
};

function getProductCanonicalPath(slug?: string | null, id?: string) {
  return `https://www.balao.info${getProductHref({
    id: id || "",
    slug: slug || "",
  })}`;
}

function stripSpecsFromDescription(value: string | null | undefined) {
  let text = typeof value === 'string' ? value : '';
  text = text.replace(/\r\n/g, '\n').trim();
  if (!text) return '';

  const descHeader =
    /(^|\n)##\s*📝?\s*Descrição do produto[^\n]*\n+/i;
  const descHeaderSimple =
    /(^|\n)##\s*Descrição[^\n]*\n+/i;

  const m1 = text.match(descHeader);
  if (m1?.index != null) {
    return text.slice(m1.index + m1[0].length).trim();
  }

  const m2 = text.match(descHeaderSimple);
  if (m2?.index != null) {
    return text.slice(m2.index + m2[0].length).trim();
  }

  const withoutSpecs = text
    .replace(/(^|\n)##\s*🧩?\s*Especificaç(?:õ|o)es[\s\S]*?(?=\n##\s|\s*$)/gi, '\n')
    .trim();

  return withoutSpecs;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    return {
      title: 'Produto não encontrado',
      robots: { index: false, follow: false },
    };
  }

  const canonical = getProductCanonicalPath(product.slug, product.id);

  return {
    title: `${product.name} | Balão da Informática`,
    description: `Compre ${product.name} por ${product.price}`,
    alternates: { canonical },
    openGraph: {
      title: product.name,
      description: `Por apenas ${product.price} - ${product.category || "Hardware"}`,
      url: canonical,
      images: [
        {
          url: product.image,
          width: 800,
          height: 800,
          alt: product.name,
        }
      ],
      type: 'website',
      siteName: 'Balão da Informática',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: `Por apenas ${product.price}`,
      images: [product.image],
    },
    robots: { index: true, follow: true },
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getProductById(id),
    getCategories()
  ]);

  if (!product) return notFound();

  const canonicalHref = getProductHref(product);
  if (product.slug && id !== product.slug) {
    permanentRedirect(canonicalHref);
  }

  const cashPriceNum = parseFloat(product.price.replace("R$", "").replace(/\./g, "").replace(",", ".").trim());
  const listPriceNum = cashPriceNum / 0.85;
  const installmentValue = listPriceNum / 10;
  const descriptionText = stripSpecsFromDescription(product.description);

  const category = categories.find(c => c.name === product.category);
  const categorySlug = category ? category.slug : 'todos-os-produtos';

  const breadcrumbItems = [
    { name: 'Home', item: 'https://www.balao.info' },
    { name: product.category || 'Produtos', item: `https://www.balao.info/categoria/${categorySlug}` },
    { name: product.name, item: getProductCanonicalPath(product.slug, product.id) }
  ];

  return (
     <div className="min-h-screen flex flex-col font-sans">
      <JsonLd data={[
        generateOrganizationSchema(),
        generateBreadcrumbSchema(breadcrumbItems),
        generateProductSchema(product)
      ]} />
      <Header />
      <div className="container mx-auto flex flex-1 flex-col gap-4 px-3 py-4 sm:px-4 lg:flex-row lg:gap-6 lg:px-0 lg:py-6">
        <div className="hidden lg:block">
            <Sidebar categories={categories} />
        </div>
        <main className="flex-1 w-full min-w-0">
          <div className="site-surface overflow-hidden rounded-[1.4rem] shadow-[0_30px_80px_rgba(2,6,23,0.18)] sm:rounded-[1.75rem]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 p-4 sm:p-6 md:p-8">
                <div className="flex flex-col gap-4 md:gap-6">
                    <ProductMediaSwitcher
                      imageUrl={product.image}
                      imageUrls={product.image_urls}
                      videoUrl={product.video_url}
                      productName={product.name}
                    />
                </div>

                {/* Info Section */}
                <div className="flex flex-col">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                        {product.brand && (
                            <span className="rounded-full border border-[var(--site-border)] bg-[#E60012]/15 px-3 py-1 text-xs font-black uppercase tracking-wider text-[#E60012]">
                                {product.brand}
                            </span>
                        )}
                        <span className="rounded-full border border-[var(--site-border)] bg-[var(--site-panel-muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--site-muted)]">
                            {product.category || "Hardware"}
                        </span>
                        {product.availability && (
                            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
                                ✓ {product.availability}
                            </span>
                        )}
                        {product.rating && (
                            <span className="rounded-full border border-slate-700 bg-slate-800/80 px-3 py-1 text-xs font-bold text-slate-200">
                                {product.rating}
                            </span>
                        )}
                    </div>
                    <h1 className="mb-4 text-2xl font-bold leading-tight text-[var(--site-text)] md:text-3xl">
                        {product.name}
                    </h1>
                    
                    <div className="mt-auto rounded-2xl border border-[var(--site-border)] bg-[var(--site-panel-soft)] p-4 sm:p-5 md:p-6 shadow-xl">
                          {/* Cash Price */}
                          <div className="mb-4">
                             <div className="flex items-baseline gap-2">
                                  <span className="text-[#E60012] font-black text-3xl sm:text-4xl">
                                     {product.price}
                                  </span>
                                  <span className="text-xs font-black uppercase text-[#E60012] bg-[#E60012]/15 px-2 py-0.5 rounded-full">
                                     no PIX
                                  </span>
                             </div>
                             <div className="text-sm font-medium text-[var(--site-soft)] mt-1">
                                 à vista no PIX com <strong>{product.discount_pix || "10% de desconto"}</strong>
                             </div>
                          </div>

                          {/* Installment Price */}
                           <div className="mb-6 border-t border-[var(--site-border)] pt-4">
                              <div className="mb-1 text-sm text-[var(--site-muted)]">
                                 Cartão de Crédito: <span className="font-bold text-white">{product.price_card || listPriceNum.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                             </div>
                              <div className="text-sm text-[var(--site-soft)]">
                                 {product.installment ? (
                                   <span>ou em até <strong>{product.installment}</strong> sem juros</span>
                                 ) : (
                                   <span>em até 10x de <strong>{installmentValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong> sem juros</span>
                                 )}
                             </div>
                          </div>

                          {/* Local Delivery & Retirada Badge */}
                          <div className="mb-5 flex flex-col gap-1 rounded-xl border border-[var(--home-border-strong)] bg-[var(--home-accent-soft)] p-3.5 text-left text-xs">
                             <div className="flex items-center gap-1.5 font-extrabold text-[var(--site-text)]">
                                <span className="text-[#E60012] text-sm">📍</span> RETIRE HOJE NA LOJA (CAMBUÍ)
                             </div>
                             <div className="font-semibold leading-relaxed text-[var(--site-soft)]">
                                Compre online ou pelo WhatsApp para retirada express em até 30 minutos ou entrega via motoboy em Campinas e região.
                             </div>
                          </div>

                         <ProductActions product={product} />
                         
                         <ShippingCalculator />
                    </div>

                    <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
                         <WhatsAppButton productName={product.name} />
                         <ShareButton title={product.name} text={`Confira ${product.name} no Balão da Informática!`} />
                    </div>
                </div>
            </div>
            
            {/* Details Tab */}
            <div className="border-t border-[var(--site-border)] p-4 sm:p-6 md:p-8">
                <h2 className="mb-6 text-xl font-bold text-[var(--site-text)]">Detalhes do Produto</h2>
                
                <div className="grid grid-cols-1 gap-8">
                    <div>
                        <h3 className="mb-4 border-b border-[var(--site-border)] pb-2 text-lg font-bold text-[var(--site-text)]">Descrição Técnica & Especificações</h3>
                        <div className="prose max-w-none text-[var(--site-soft)] leading-relaxed">
                            {descriptionText ? (
                                <div className="whitespace-pre-wrap">{descriptionText}</div>
                            ) : (
                                <>
                                    <p>
                                        Aproveite a melhor tecnologia com o <strong>{product.name}</strong>. 
                                        Ideal para quem busca desempenho, procedência e garantia.
                                    </p>
                                    <p className="mt-4 text-xs text-slate-400">
                                        Imagens meramente ilustrativas. Todas as informações divulgadas são de responsabilidade do Fabricante/Fornecedor.
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </main>
      </div>
     </div>
  );
}
