import { Metadata } from 'next';
import { getCategories, getProductById } from '@/lib/db';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import ShareButton from '@/components/ShareButton';
import WhatsAppButton from '@/components/WhatsAppButton';
import ProductActions from '@/components/ProductActions';
import ShippingCalculator from '@/components/ShippingCalculator';
import ProductMediaSwitcher from '@/components/ProductMediaSwitcher';
import JsonLd, { generateOrganizationSchema, generateBreadcrumbSchema, generateProductSchema } from '@/components/JsonLd';

type Props = {
  params: Promise<{ id: string }>;
};

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

  const canonical = `https://www.balao.info/product/${product.slug || product.id}`;

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

  const cashPriceNum = parseFloat(product.price.replace("R$", "").replace(/\./g, "").replace(",", ".").trim());
  const listPriceNum = cashPriceNum / 0.85;
  const installmentValue = listPriceNum / 10;
  const descriptionText = stripSpecsFromDescription(product.description);

  const category = categories.find(c => c.name === product.category);
  const categorySlug = category ? category.slug : 'todos-os-produtos';

  const breadcrumbItems = [
    { name: 'Home', item: 'https://www.balao.info' },
    { name: product.category || 'Produtos', item: `https://www.balao.info/categoria/${categorySlug}` },
    { name: product.name, item: `https://www.balao.info/product/${product.id}` }
  ];

  return (
     <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <JsonLd data={[
        generateOrganizationSchema(),
        generateBreadcrumbSchema(breadcrumbItems),
        generateProductSchema(product)
      ]} />
      <Header />
      <div className="flex container mx-auto flex-1 py-6 gap-6">
        <div className="hidden lg:block">
            <Sidebar categories={categories} />
        </div>
        <main className="flex-1 w-full px-4 lg:px-0">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
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
                    <div className="mb-4">
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full uppercase tracking-wider font-semibold">
                            {product.category || "Hardware"}
                        </span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 leading-tight">
                        {product.name}
                    </h1>
                    
                    <div className="mt-auto bg-gray-50 p-6 rounded-xl border border-gray-100">
                         {/* Cash Price */}
                         <div className="mb-4">
                            <div className="flex items-baseline gap-2">
                                 <span className="text-[#E60012] font-black text-4xl">
                                    {product.price}
                                 </span>
                            </div>
                            <div className="text-gray-600 text-sm font-medium">
                                à vista no PIX com <strong>15% de desconto</strong>
                            </div>
                         </div>

                         {/* Installment Price */}
                         <div className="mb-6 pt-4 border-t border-gray-200">
                            <div className="text-gray-500 text-sm mb-1">
                                De: <span className="line-through">{listPriceNum.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                            </div>
                            <div className="text-gray-800 font-bold text-xl">
                                {listPriceNum.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </div>
                            <div className="text-gray-600 text-sm">
                                em até 10x de <strong>{installmentValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong> sem juros
                            </div>
                         </div>

                         <ProductActions product={product} />
                         
                         <ShippingCalculator />
                    </div>

                    <div className="mt-6 flex flex-row items-center justify-end gap-2">
                         <WhatsAppButton productName={product.name} />
                         <ShareButton title={product.name} text={`Confira ${product.name} no Balão da Informática!`} />
                    </div>
                </div>
            </div>
            
            {/* Details Tab */}
            <div className="border-t border-gray-200 p-8">
                <h2 className="text-xl font-bold mb-6">Detalhes do Produto</h2>
                
                <div className="grid grid-cols-1 gap-8">
                    <div>
                        <h3 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">Descrição</h3>
                        <div className="prose max-w-none text-gray-600">
                            {descriptionText ? (
                                <div className="whitespace-pre-wrap">{descriptionText}</div>
                            ) : (
                                <>
                                    <p>
                                        Aproveite a melhor tecnologia com o <strong>{product.name}</strong>. 
                                        Ideal para quem busca desempenho e qualidade.
                                    </p>
                                    <p className="mt-4">
                                        Imagens meramente ilustrativas. Todas as informações divulgadas são de responsabilidade do Fabricante/Fornecedor.
                                        Verifique com os fabricantes do produto e de seus componentes eventuais limitações à utilização de todos os recursos e funcionalidades.
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
