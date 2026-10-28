import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { ChevronLeft, MessageCircle, ShieldCheck } from "lucide-react";
import Header from "@/components/Header";
import JsonLd, { generateBreadcrumbSchema } from "@/components/JsonLd";
import GaleriaDoConsignado from "@/components/consignados/GaleriaDoConsignado";
import { SelosDoConsignado } from "@/components/consignados/CartaoDeConsignado";
import { SITE_CONFIG } from "@/lib/config";
import {
  buscarConsignado,
  formatarPreco,
  hrefDoConsignado,
  linkDoWhatsAppDoConsignado,
  numeroDoSlug,
  urlDoConsignado,
  type ItemConsignado,
} from "@/lib/consignados";

// ============================================================
// /consignados/<slug> — página de um consignado. O número sai do final do
// endereço ("-c12"). Vendido (404 no MEU BLING) → página não encontrada.
// MEU BLING fora do ar → aviso amigável, sem indexar.
// Sem generateStaticParams: cada página é feita na primeira visita e refeita
// a cada 2 minutos, então o build não depende do MEU BLING.
// ============================================================

export const revalidate = 120;

type Props = { params: Promise<{ slug: string }> };

async function carregar(slug: string): Promise<ItemConsignado | "vendido" | null> {
  const numero = numeroDoSlug(slug);
  if (!numero) return "vendido";
  return buscarConsignado(numero);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await carregar(slug);
  if (!item || item === "vendido") {
    return { title: "Consignado", robots: { index: false, follow: true } };
  }
  const descricao = `${item.titulo} por ${formatarPreco(item.preco)} à vista, com ${item.garantia}.${item.estado ? ` Estado: ${item.estado}.` : ""} Consignado na Balão da Informática, Cambuí, Campinas.`;
  const url = urlDoConsignado(item);
  return {
    title: { absolute: `${item.titulo} (consignado) | Balão da Informática` },
    description: descricao,
    alternates: { canonical: url },
    openGraph: {
      title: `${item.titulo} — ${formatarPreco(item.preco)}`,
      description: descricao,
      url,
      type: "website",
      siteName: SITE_CONFIG.name,
      locale: "pt_BR",
      ...(item.fotos[0] ? { images: [{ url: item.fotos[0], alt: item.titulo }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: `${item.titulo} — ${formatarPreco(item.preco)}`,
      description: descricao,
      ...(item.fotos[0] ? { images: [item.fotos[0]] } : {}),
    },
  };
}

function esquemaDoProduto(item: ItemConsignado) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: item.titulo,
    sku: item.codigo,
    ...(item.fotos.length ? { image: item.fotos } : {}),
    description: item.detalhes || item.estado || item.titulo,
    ...(item.marca ? { brand: { "@type": "Brand", name: item.marca } } : {}),
    ...(item.modelo ? { model: item.modelo } : {}),
    offers: {
      "@type": "Offer",
      url: urlDoConsignado(item),
      priceCurrency: "BRL",
      price: item.preco.toFixed(2),
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/UsedCondition",
      seller: { "@id": "https://www.balao.info/#organization" },
    },
  };
}

function Linha({ rotulo, valor }: { rotulo: string; valor: string | null }) {
  if (!valor) return null;
  return (
    <div className="border-t border-slate-800 py-4">
      <dt className="text-xs font-black uppercase tracking-wider text-slate-400">{rotulo}</dt>
      <dd className="mt-1 whitespace-pre-line text-slate-200">{valor}</dd>
    </div>
  );
}

export default async function PaginaDoConsignado({ params }: Props) {
  const { slug } = await params;
  const item = await carregar(slug);
  if (item === "vendido") notFound();

  if (!item) {
    return (
      <div className="min-h-screen bg-[#090d16] text-white">
        <Header />
        <main className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Não deu para carregar este consignado agora</h1>
          <p className="mt-4 text-slate-300">Tente de novo em alguns minutos ou veja os outros aparelhos da vitrine.</p>
          <Link href="/consignados" className="mt-8 inline-flex rounded-2xl bg-[#E60012] px-6 py-4 font-black text-white hover:bg-red-700">
            Ver todos os consignados
          </Link>
        </main>
      </div>
    );
  }

  // Título mudou no MEU BLING: leva para o endereço novo, com o mesmo número.
  if (item.slug !== slug) permanentRedirect(hrefDoConsignado(item));

  const url = urlDoConsignado(item);

  return (
    <div className="min-h-screen bg-[#090d16] text-white">
      <JsonLd
        data={[
          esquemaDoProduto(item),
          generateBreadcrumbSchema([
            { name: "Início", item: "https://www.balao.info" },
            { name: "Consignados", item: "https://www.balao.info/consignados" },
            { name: item.titulo, item: url },
          ]),
        ]}
      />
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <Link href="/consignados" className="inline-flex items-center gap-1 text-sm font-bold text-slate-300 hover:text-[#E60012]">
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Todos os consignados
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-12">
          <div className="relative">
            <SelosDoConsignado item={item} />
            <GaleriaDoConsignado fotos={item.fotos} titulo={item.titulo} />
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-wider text-[#E60012]">Consignado · {item.codigo}</p>
            <h1 className="mt-2 text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl">{item.titulo}</h1>

            <div className="mt-6 rounded-3xl border border-slate-800 bg-[#111827] p-6 sm:p-7">
              <p className="text-3xl font-black tracking-tight text-white sm:text-4xl">{formatarPreco(item.preco)}</p>
              <p className="text-sm font-semibold text-slate-400">preço à vista</p>
              <p className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-slate-200">
                <ShieldCheck className="h-5 w-5 text-[#E60012]" aria-hidden />
                {item.garantia}
              </p>
              <a
                href={linkDoWhatsAppDoConsignado(item)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#E60012] px-6 py-4 font-black text-white shadow-lg shadow-red-950/50 transition-all hover:bg-red-700 active:scale-95"
              >
                <MessageCircle className="h-5 w-5" aria-hidden />
                Quero este
              </a>
              <p className="mt-3 text-center text-xs text-slate-400">
                Abre o WhatsApp da loja ({SITE_CONFIG.whatsapp.display}) com o aparelho já escrito. Consignado sai rápido: peça a reserva.
              </p>
            </div>

            <dl className="mt-6">
              <Linha rotulo="Estado" valor={item.estado} />
              <Linha rotulo="Marca e modelo" valor={[item.marca, item.modelo].filter(Boolean).join(" ") || null} />
              <Linha rotulo="Acompanha" valor={item.acessorios} />
              <Linha rotulo="Detalhes" valor={item.detalhes} />
              <Linha rotulo="Garantia" valor={item.garantia} />
              <Linha rotulo="Código" valor={item.codigo} />
            </dl>
          </div>
        </div>

        <section className="mt-12 rounded-3xl border border-slate-800 bg-[#111827] p-6 sm:mt-16 sm:p-10">
          <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">Tem um equipamento parado? Deixe em consignação</h2>
          <p className="mt-3 max-w-2xl text-slate-300">A loja avalia, expõe e atende o comprador por você. Você recebe quando vender.</p>
          <Link href="/consignacao" className="mt-6 inline-flex rounded-2xl border border-slate-600 px-6 py-3.5 font-black text-white hover:border-[#E60012]">
            Como funciona a consignação
          </Link>
        </section>
      </main>
    </div>
  );
}
