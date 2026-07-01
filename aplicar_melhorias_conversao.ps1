param(
  [switch]$NoBackup
)

$ErrorActionPreference = "Stop"
$root = Get-Location

function Write-ProjectFile {
  param(
    [Parameter(Mandatory=$true)][string]$RelativePath,
    [Parameter(Mandatory=$true)][string]$Content
  )

  $target = Join-Path $root $RelativePath
  $dir = Split-Path $target -Parent
  if (!(Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }

  if (!$NoBackup -and (Test-Path $target)) {
    $backupRoot = Join-Path $root "backup-conversao-local"
    $backupTarget = Join-Path $backupRoot $RelativePath
    $backupDir = Split-Path $backupTarget -Parent
    if (!(Test-Path $backupDir)) { New-Item -ItemType Directory -Path $backupDir -Force | Out-Null }
    Copy-Item $target $backupTarget -Force
  }

  Set-Content -Path $target -Value $Content -Encoding UTF8
  Write-Host "OK: $RelativePath" -ForegroundColor Green
}

Write-Host "Aplicando melhorias de conversão local no projeto Balão..." -ForegroundColor Cyan
Write-Host "Backup: backup-conversao-local" -ForegroundColor Yellow

Write-ProjectFile -RelativePath "lib/config.ts" -Content @'
export const SITE_CONFIG = {
  name: "Balão da Informática",
  companyName: "Balão da informática Castelo",
  cnpj: "34.397.947/0001-08",
  phone: {
    display: "(19) 3255-1661",
    number: "551932551661"
  },
  email: "balaocastelo@balaodainformatica.com.br",
  address: "Av. Anchieta, 789 - Cambuí, Campinas - SP",
  addressShort: "Av. Anchieta, 789 - Cambuí",
  city: "Campinas",
  region: "SP",
  postalCode: "",
  openingHoursDisplay: "Seg. a Sex. das 08h às 18h | Sáb. das 08h às 13h",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Bal%C3%A3o%20da%20Inform%C3%A1tica%20Castelo%20Av.%20Anchieta%20789%20Campinas%20SP",
  whatsapp: {
    number: "5519987510267",
    display: "(19) 98751-0267",
    messageDefault: "Olá! Vim pelo site e quero atendimento da Balão da Informática em Campinas.",
  },
  social: {
    instagram: "https://instagram.com/balaodainformatica_castelo",
    facebook: "https://facebook.com/balaodainformatica",
  },
  pix: {
    key: "34397947000108", // CNPJ
    name: "Balao da informatica castelo",
    city: "CAMPINAS",
    cnpj: "34397947000108"
  }
};
'@

Write-ProjectFile -RelativePath "components/HomeLocalHero.tsx" -Content @'
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Cpu,
  Laptop,
  MapPin,
  MessageCircle,
  Monitor,
  ShieldCheck,
  Truck,
  Wrench,
} from "lucide-react";

import { SITE_CONFIG } from "@/lib/config";

function buildWhatsAppUrl(message: string) {
  return `https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(message)}`;
}

export default function HomeLocalHero() {
  const whatsappHref = buildWhatsAppUrl(
    "Olá! Vim pelo site da Balão da Informática. Quero comprar ou tirar dúvida sobre produto com pronta entrega em Campinas."
  );

  const quickLinks = [
    { title: "PC Gamer", subtitle: "Máquinas prontas e montagem", href: "/pcgamer", icon: Cpu },
    { title: "Notebooks", subtitle: "Novos, seminovos e upgrades", href: "/notebooks", icon: Laptop },
    { title: "Assistência", subtitle: "Diagnóstico e reparo local", href: "/manutencao", icon: Wrench },
    { title: "Monitores e peças", subtitle: "Estoque para retirada rápida", href: "/departamentos", icon: Monitor },
  ];

  const trustItems = [
    { title: "Loja física no Cambuí", text: SITE_CONFIG.addressShort || SITE_CONFIG.address, icon: MapPin },
    { title: "Retirada e entrega rápida", text: "Consulte disponibilidade para Campinas", icon: Truck },
    { title: "Atendimento humano", text: "Compra direto pelo WhatsApp", icon: MessageCircle },
    { title: "Garantia e suporte", text: "Equipe técnica especializada", icon: ShieldCheck },
  ];

  return (
    <section className="container mx-auto px-4 pt-5 lg:px-0">
      <div className="relative overflow-hidden rounded-[2rem] border border-red-100 bg-white shadow-xl">
        <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_70%_30%,rgba(230,0,18,0.24),transparent_35%),linear-gradient(135deg,#ffffff_0%,#fff5f5_45%,#fee2e2_100%)] lg:block" />
        <div className="relative grid grid-cols-1 gap-8 p-5 sm:p-8 lg:grid-cols-12 lg:p-10">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-[#E60012]">
              <Clock size={15} />
              Atendimento local em Campinas
            </div>

            <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[0.98] tracking-tight text-zinc-950 sm:text-5xl lg:text-6xl">
              Informática em Campinas com pronta entrega e WhatsApp rápido.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-600 sm:text-lg">
              PCs Gamer, notebooks, peças, upgrades e assistência técnica com loja física no Cambuí. Confirme estoque, retire hoje ou peça entrega na região.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-6 py-4 text-base font-black text-white shadow-lg shadow-green-200 transition hover:bg-[#128C7E] active:scale-[0.98]"
              >
                <MessageCircle size={22} />
                Comprar pelo WhatsApp
              </a>
              <Link
                href="/pcgamer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-6 py-4 text-base font-black text-zinc-900 shadow-sm transition hover:border-[#E60012] hover:text-[#E60012] active:scale-[0.98]"
              >
                Ver PCs Gamer
                <ArrowRight size={19} />
              </Link>
              <a
                href={SITE_CONFIG.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-6 py-4 text-base font-black text-zinc-900 shadow-sm transition hover:border-[#E60012] hover:text-[#E60012] active:scale-[0.98]"
              >
                <MapPin size={19} />
                Como chegar
              </a>
            </div>

            <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {trustItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-2xl border border-zinc-100 bg-zinc-50 px-4 py-4">
                    <div className="flex items-center gap-2 text-sm font-black text-zinc-950">
                      <Icon size={17} className="text-[#E60012]" />
                      {item.title}
                    </div>
                    <div className="mt-1 text-xs font-semibold leading-snug text-zinc-500">{item.text}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="h-full rounded-[1.7rem] border border-red-100 bg-gradient-to-br from-[#E60012] to-[#8f0010] p-5 text-white shadow-2xl">
              <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur">
                <div className="text-sm font-black uppercase tracking-[0.2em] text-red-100">Oferta local</div>
                <div className="mt-2 text-3xl font-black leading-tight">Precisa hoje? Fale com a loja agora.</div>
                <p className="mt-3 text-sm leading-relaxed text-red-50">
                  Atendimento pensado para cliente de Campinas: estoque, retirada, entrega e suporte técnico de verdade.
                </p>
              </div>

              <div className="mt-5 grid gap-3">
                {[
                  "Confirmar estoque antes de sair de casa",
                  "Receber opção de retirada ou entrega",
                  "Comprar com PIX, cartão ou atendimento humano",
                  "Falar com quem entende de informática",
                ].map((text) => (
                  <div key={text} className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-black text-zinc-950 shadow-sm">
                    <CheckCircle2 size={18} className="text-[#E60012]" />
                    {text}
                  </div>
                ))}
              </div>

              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-4 text-base font-black text-[#E60012] shadow-lg transition hover:bg-red-50 active:scale-[0.98]"
              >
                <MessageCircle size={21} />
                Chamar vendedor agora
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.title}
              href={link.href}
              className="group rounded-3xl border border-zinc-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-red-100 hover:shadow-lg"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-red-50 text-[#E60012] transition group-hover:bg-[#E60012] group-hover:text-white">
                  <Icon size={22} />
                </div>
                <div className="min-w-0">
                  <div className="font-black text-zinc-950">{link.title}</div>
                  <div className="mt-1 text-xs font-semibold leading-snug text-zinc-500">{link.subtitle}</div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
'@

Write-ProjectFile -RelativePath "components/FloatingWhatsApp.tsx" -Content @'
"use client";

import { MessageCircle } from "lucide-react";

import { SITE_CONFIG } from "@/lib/config";
import { trackWhatsAppClick } from "@/lib/tracking";

export default function FloatingWhatsApp() {
  const message = "Olá! Vim pelo site da Balão da Informática e quero atendimento rápido em Campinas.";
  const href = `https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(message)}`;

  const handleClick = () => {
    if (typeof window === "undefined") return;
    trackWhatsAppClick({
      page_path: window.location.pathname,
      source: "floating_whatsapp",
      label: "WhatsApp fixo",
    });
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={handleClick}
      aria-label="Chamar Balão da Informática no WhatsApp"
      className="fixed bottom-4 right-4 z-[950] inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-black text-white shadow-2xl shadow-green-300/50 transition hover:bg-[#128C7E] active:scale-95 sm:px-5 print:hidden"
    >
      <MessageCircle size={22} />
      <span className="hidden sm:inline">WhatsApp agora</span>
    </a>
  );
}
'@

Write-ProjectFile -RelativePath "components/ProductActions.tsx" -Content @'
"use client";

import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { Product } from "@/lib/utils";
import { MessageCircle, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { animateAddToCart } from "@/lib/animations";
import { SITE_CONFIG } from "@/lib/config";
import { trackWhatsAppClick } from "@/lib/tracking";

export default function ProductActions({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [added, setAdded] = useState(false);

  const handleWhatsAppBuy = () => {
    if (typeof window === "undefined") return;

    const message = [
      `Olá! Quero comprar este produto: ${product.name}`,
      `Valor: ${product.price || "sob consulta"}`,
      `Link: ${window.location.href}`,
      "Estou em Campinas/região. Tem pronta entrega hoje?",
    ].join("\n");

    trackWhatsAppClick({
      page_path: window.location.pathname,
      source: "product_primary_buy_whatsapp",
      label: product.name,
      product_name: product.name,
    });

    window.open(`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    addToCart(product);
    showToast("Adicionado ao carrinho!");
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);

    const mainImage = document.querySelector(".product-main-image") as HTMLElement;
    animateAddToCart(mainImage || (e.currentTarget as HTMLElement), product.image);
  };

  return (
    <div className="grid grid-cols-1 gap-3">
      <button
        onClick={handleWhatsAppBuy}
        className="w-full py-4 rounded-md font-black text-lg transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 bg-[#25D366] text-white hover:bg-[#128C7E]"
      >
        <MessageCircle size={24} />
        COMPRAR PELO WHATSAPP
      </button>

      <button
        onClick={handleAddToCart}
        className={`w-full py-3 rounded-md font-bold text-base transition-all active:scale-95 flex items-center justify-center gap-2 border shadow-sm ${
          added
            ? "bg-green-50 border-green-200 text-green-700"
            : "bg-white border-gray-200 text-gray-800 hover:border-[#E60012] hover:text-[#E60012]"
        }`}
      >
        <ShoppingCart size={20} />
        {added ? "ADICIONADO!" : "Adicionar ao carrinho"}
      </button>
    </div>
  );
}
'@

Write-ProjectFile -RelativePath "components/WhatsAppButton.tsx" -Content @'
"use client";

import { MessageCircle } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";
import { trackWhatsAppClick } from "@/lib/tracking";

export default function WhatsAppButton({ productName }: { productName: string }) {
  const handleWhatsAppClick = () => {
    if (typeof window !== "undefined") {
      const message = [
        `Olá! Vi no site este produto: ${productName}`,
        `Link: ${window.location.href}`,
        "Pode confirmar estoque, valor final e opção de retirada/entrega em Campinas?",
      ].join("\n");
      const url = `https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(message)}`;
      trackWhatsAppClick({
        page_path: window.location.pathname,
        source: "product_whatsapp_button",
        label: productName,
        product_name: productName,
      });
      window.open(url, "_blank");
    }
  };

  return (
    <button
      onClick={handleWhatsAppClick}
      className="flex items-center gap-2 px-3 py-2 text-xs md:px-4 md:py-2 md:text-base bg-[#25D366] text-white rounded-md font-bold hover:bg-[#128C7E] transition-colors shadow-sm"
      title="Confirmar estoque no WhatsApp"
    >
      <MessageCircle className="w-4 h-4 md:w-5 md:h-5" />
      <span className="md:hidden">WhatsApp</span>
      <span className="hidden md:inline">Confirmar estoque no WhatsApp</span>
    </button>
  );
}
'@

Write-ProjectFile -RelativePath "app/page.tsx" -Content @'
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import ProductList from "@/components/ProductList";
import Carousel from "@/components/Carousel";
import ProductCarousel from "@/components/ProductCarousel";
import SeoContent from "@/components/SeoContent";
import JsonLd, { generateOrganizationSchema } from "@/components/JsonLd";
import QuickLeadSection from "@/components/QuickLeadSection";
import HomeLocalHero from "@/components/HomeLocalHero";
import { getProductsByExactCategories, getCarouselImages, getCategories, getHomeBlocks } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { parsePriceToNumber, Product, type Category } from "@/lib/utils";
import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/config";

export const revalidate = 300;

type SearchParams = Promise<{ category?: string; search?: string }>;

export async function generateMetadata(props: { searchParams: SearchParams }): Promise<Metadata> {
  const sp = await props.searchParams;
  const hasFacet = Boolean((sp?.category || "").trim() || (sp?.search || "").trim());
  const title = "Loja de Informática em Campinas | PC Gamer, Notebook e Assistência Técnica";
  const description =
    "Balão da Informática Castelo: loja física em Campinas para PC Gamer, notebooks, peças, upgrades e assistência técnica. Compre pelo WhatsApp, retire no Cambuí ou consulte entrega rápida.";
  const canonical = "https://www.balao.info/";

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      locale: "pt_BR",
      url: canonical,
      title,
      description,
      siteName: SITE_CONFIG.name,
      images: [{ url: "/logo.png" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/logo.png"],
    },
    robots: hasFacet ? { index: false, follow: true } : { index: true, follow: true },
  };
}

export default async function Home(props: {
  searchParams: SearchParams;
}) {
  const searchParams = await props.searchParams;
  const category = searchParams?.category;
  const search = searchParams?.search;

  // Helper to find all descendant category names
  const getDescendantNames = (rootName: string, allCategories: Category[]) => {
      const root = allCategories.find(c => c.name === rootName);
      if (!root) return [];
      
      const descendants: string[] = [];
      const stack = [root.id];
      
      while (stack.length > 0) {
          const currentId = stack.pop();
          const children = allCategories.filter(c => c.parent_id === currentId);
          children.forEach(child => {
              descendants.push(child.name);
              stack.push(child.id);
          });
      }
      return descendants;
  }

  let products: Product[] = [];
  let categories: Category[] = [];
  let carouselImages = [];
  let homeBlocks = [];

  if (search) {
    [categories, carouselImages, homeBlocks] = await Promise.all([
      getCategories(),
      getCarouselImages(true),
      getHomeBlocks(true),
    ]);

    products = await (async () => {
      const supabase = await createClient();
      const searchTerms = search.trim().split(/\s+/).join(' & ');

      const { data, error } = await supabase.rpc('search_products_fts', {
        query_text: searchTerms,
        limit_count: 50
      });

      if (error) {
        console.error("Search RPC error:", error);
        let queryBuilder = supabase.from('products').select('*');

        const terms = search.trim().split(/\s+/);
        terms.forEach(term => {
          if (term.length > 0) {
            queryBuilder = queryBuilder.ilike('name', `%${term}%`);
          }
        });

        const { data: fallbackData } = await queryBuilder.limit(50);
        return ((fallbackData as Product[]) || []).sort(
          (a, b) => parsePriceToNumber(a.price) - parsePriceToNumber(b.price)
        );
      }

      return ((data as Product[]) || []).sort(
        (a, b) => parsePriceToNumber(a.price) - parsePriceToNumber(b.price)
      );
    })();
  } else {
    [categories, carouselImages, homeBlocks] = await Promise.all([
      getCategories(),
      getCarouselImages(true),
      getHomeBlocks(true),
    ]);

    if (category && category !== "Todos os Produtos") {
      const validCategories = new Set<string>([category]);
      const descendants = getDescendantNames(category, categories);
      descendants.forEach((name) => validCategories.add(name));
      products = await getProductsByExactCategories([...validCategories]);
    } else {
      const blockCategories = [...new Set(homeBlocks.map((block) => block.category_id).filter(Boolean))];
      products = await getProductsByExactCategories(blockCategories);
    }
  }

  const filteredProducts = products;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <JsonLd data={generateOrganizationSchema()} />
      <Header />

      {!search && !category && <HomeLocalHero />}
      
      {/* Carousel Banner */}
      {!search && !category && (
          <div className="container mx-auto px-4 mt-5 lg:px-0">
              {carouselImages.length > 0 ? (
                  <Carousel images={carouselImages} />
              ) : (
                  <div className="w-full h-40 md:h-64 lg:h-80 bg-gradient-to-r from-[#E60012] to-red-800 rounded-xl flex items-center justify-center text-white text-3xl font-bold shadow-md">
                      Ofertas Imperdíveis
                  </div>
              )}
          </div>
      )}

      <div className="flex container mx-auto flex-1 py-6 gap-6 px-4 lg:px-0">
        <div className="hidden lg:block w-64 flex-shrink-0">
            <Sidebar categories={categories} />
        </div>
        <main className="flex-1 w-full min-w-0">
            {/* Dynamic Home Blocks */}
            {!search && !category && (
                <>
                {homeBlocks.map(block => {
                    const blockProducts = products.filter(p => p.category === block.category_id);
                    if (blockProducts.length === 0) return null;
                    return (
                        <ProductCarousel 
                            key={block.id}
                            title={block.title || block.category_id}
                            products={blockProducts}
                            categoryId={block.category_id}
                        />
                    );
                })}
                </>
            )}

            {/* Product List - Only show when searching or browsing category */}
            {(category || search) && (
              <>
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-bold text-gray-800">
                        {category || `Resultados para: "${search}"`}
                    </h1>
                    <span className="text-sm text-gray-500">{filteredProducts.length} produtos</span>
                </div>

                {filteredProducts.length === 0 ? (
                   <div className="text-center py-20 text-gray-500 bg-white rounded-lg shadow-sm">
                      <p className="text-xl font-medium">Nenhum produto encontrado.</p>
                   </div>
                ) : (
                  <ProductList products={filteredProducts} />
                )}
              </>
            )}

            {/* SEO Content Section */}
            {!search && !category && (
                <SeoContent title="LOJA DE INFORMÁTICA EM CAMPINAS COM ATENDIMENTO LOCAL">
                    <p className="text-gray-600 mb-4">
                        A <strong>Balão da Informática Castelo</strong> atende Campinas e região com venda de <strong>PC Gamer, notebooks, peças, periféricos, upgrades e assistência técnica</strong>. O foco é resolver rápido: consulte estoque pelo WhatsApp, retire na loja física no Cambuí ou peça entrega conforme disponibilidade.
                    </p>
                    <ul className="list-none pl-0 text-gray-600 space-y-3">
                        <li className="flex items-start gap-2">
                            <span className="text-xl">📍</span>
                            <span><strong>Loja física:</strong> {SITE_CONFIG.address}. Atendimento para Campinas, Sumaré, Hortolândia, Paulínia, Valinhos, Vinhedo, Indaiatuba e Jaguariúna.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-xl">💬</span>
                            <span><strong>Compra rápida:</strong> fale no WhatsApp para confirmar estoque, preço final, retirada e entrega antes de sair de casa.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-xl">🚀</span>
                            <span><strong>Especialistas:</strong> montagem de PC Gamer, upgrades, manutenção de notebooks e suporte técnico para empresas e clientes finais.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-xl">🏆</span>
                            <span><strong>Diferencial local:</strong> loja real, atendimento humano, assistência técnica e pós-venda perto do cliente.</span>
                        </li>
                    </ul>
                </SeoContent>
            )}      

            {!search && !category && (
              <div className="mt-8">
                <QuickLeadSection
                  title="Quer comprar ou consertar hoje?"
                  description="Fale com a equipe da Balão da Informática pelo WhatsApp para confirmar estoque, retirada, entrega ou assistência técnica em Campinas e região."
                  messageTemplate="Olá! Quero atendimento rápido da Balão da Informática para compra ou assistência técnica em Campinas e região."
                  source="home"
                  cityLabel="Campinas e Região"
                  serviceLabel="Venda, Upgrade e Assistência Técnica"
                  formTitle="Pedir retorno rápido"
                />
              </div>
            )}
        </main>
      </div>
    </div>
  );
}
'@

Write-ProjectFile -RelativePath "components/TopBar.tsx" -Content @'
"use client";

import { useEffect, useState } from "react";

import { SITE_CONFIG } from "@/lib/config";

export default function TopBar() {
  const [dolar, setDolar] = useState<string | null>(null);
  const [messages, setMessages] = useState<string[] | null>(null);

  useEffect(() => {
    async function fetchDolar() {
      try {
        const res = await fetch("https://economia.awesomeapi.com.br/last/USD-BRL");
        const data = await res.json();
        if (data.USDBRL) {
          setDolar(parseFloat(data.USDBRL.bid).toFixed(2));
        }
      } catch (error) {
        console.error("Erro ao buscar dólar", error);
      }
    }
    fetchDolar();
    const interval = setInterval(fetchDolar, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch("/api/topbar", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data?.messages) && data.messages.length > 0) {
            setMessages(data.messages);
            return;
          }
        }
      } catch {}
      setMessages([
        `Loja física em Campinas: ${SITE_CONFIG.addressShort || SITE_CONFIG.address}`,
        `WhatsApp rápido: ${SITE_CONFIG.whatsapp.display}`,
        "Retire na loja ou consulte entrega para Campinas e região",
        `Horário: ${SITE_CONFIG.openingHoursDisplay}`,
        `Telefone: ${SITE_CONFIG.phone.display}`,
      ]);
    };
    fetchMessages();
  }, []);

  return (
    <div className="w-full bg-[#E60012] text-white text-xs md:text-sm py-1 overflow-hidden relative z-50 border-b border-red-700">
      <div className="container mx-auto flex items-center justify-between px-2">
         <div className="flex-1 overflow-hidden whitespace-nowrap relative">
            <div className="animate-marquee inline-block">
              {messages?.map((m, idx) => (
                <span key={idx} className="mx-4 font-semibold">{m}</span>
              ))}
              <span className="mx-2 text-red-200">|</span>
               {dolar && (
                <>
                  <span className="mx-2 text-red-200">|</span>
                  <span className="mx-4 font-bold text-yellow-300 bg-red-800 px-2 py-0.5 rounded">Dólar Hoje: R$ {dolar}</span>
                </>
              )}
            </div>
         </div>
      </div>
      <style jsx>{`
        .animate-marquee {
          display: inline-block;
          white-space: nowrap;
          animation: marquee 35s linear infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
'@

Write-ProjectFile -RelativePath "app/layout.tsx" -Content @'
import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Bangers } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/context/ToastContext";
import LayoutWrapper from "@/components/LayoutWrapper";
import VisitorTracker from "@/components/VisitorTracker";
import GlobalConversionTracker from "@/components/GlobalConversionTracker";
import PromoJulioModal from "@/components/PromoJulioModal";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import { getCategories } from "@/lib/db";
import type { Category } from "@/lib/utils";
import { SITE_CONFIG } from "@/lib/config";

const bangers = Bangers({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bangers",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#E60012",
};

function getMetadataBase() {
  const url = process.env.NEXT_PUBLIC_SITE_URL || "https://www.balao.info";
  if (url.startsWith("http")) return new URL(url);
  return new URL(`https://${url}`);
}

export const metadata: Metadata = {
  title: {
    template: "%s | Balão da Informática",
    default:
      "Balão da Informática | Loja de Informática em Campinas com WhatsApp Rápido",
  },
  description:
    "Loja de informática em Campinas com loja física no Cambuí. PCs Gamer, notebooks, peças, upgrades, periféricos e assistência técnica com atendimento pelo WhatsApp, retirada e entrega rápida na região.",
  metadataBase: getMetadataBase(),
  keywords: [
    "loja de informática campinas",
    "informática campinas",
    "pc gamer campinas",
    "notebook campinas",
    "assistência técnica informática campinas",
    "manutenção de notebook campinas",
    "montagem de pc gamer campinas",
    "hardware campinas",
    "loja de computadores cambuí",
    "balão da informática castelo",
    "balão da informática",
  ],
  authors: [{ name: "Balão da Informática" }],
  creator: "Balão da Informática",
  publisher: "Balão da Informática",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://www.balao.info",
    title:
      "Balão da Informática | Loja de Informática em Campinas com WhatsApp Rápido",
    description:
      "Loja física em Campinas para PC Gamer, notebooks, peças, upgrades e assistência técnica. Consulte estoque pelo WhatsApp e retire no Cambuí.",
    siteName: "Balão da Informática",
    images: [{ url: "/logo.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Balão da Informática | Loja de Informática em Campinas com WhatsApp Rápido",
    description:
      "Loja física em Campinas para PC Gamer, notebooks, peças, upgrades e assistência técnica. Consulte estoque pelo WhatsApp e retire no Cambuí.",
    images: ["/logo.png"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["ComputerStore", "Store", "LocalBusiness"],
      "@id": "https://www.balao.info/#store",
      name: SITE_CONFIG.name,
      image: "https://www.balao.info/logo.png",
      description:
        "Loja de informática em Campinas especializada em computadores, PC Gamer, notebooks, hardware, periféricos e assistência técnica, com atendimento pelo WhatsApp e retirada na loja física.",
      address: {
        "@type": "PostalAddress",
        streetAddress: SITE_CONFIG.address,
        addressLocality: SITE_CONFIG.city,
        addressRegion: SITE_CONFIG.region,
        postalCode: SITE_CONFIG.postalCode || undefined,
        addressCountry: "BR",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: -22.9099,
        longitude: -47.0626,
      },
      url: "https://www.balao.info",
      telephone: `+${SITE_CONFIG.phone.number}`,
      email: SITE_CONFIG.email,
      priceRange: "$$",
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          opens: "08:00",
          closes: "18:00",
        },
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: "Saturday",
          opens: "08:00",
          closes: "13:00",
        },
      ],
      areaServed: ["Campinas", "Sumaré", "Hortolândia", "Paulínia", "Valinhos", "Vinhedo", "Indaiatuba", "Jaguariúna"],
      sameAs: [SITE_CONFIG.social.instagram, SITE_CONFIG.social.facebook],
      makesOffer: {
        "@type": "OfferCatalog",
        name: "Informática e Tecnologia",
        itemListElement: [
          { "@type": "Offer", name: "PC Gamer", category: "Computadores" },
          { "@type": "Offer", name: "Notebooks", category: "Informática" },
          { "@type": "Offer", name: "Assistência Técnica", category: "Serviços" },
          { "@type": "Offer", name: "Periféricos e Acessórios", category: "Informática" },
        ],
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://www.balao.info/#website",
      url: "https://www.balao.info",
      name: SITE_CONFIG.name,
      publisher: { "@id": "https://www.balao.info/#store" },
      inLanguage: "pt-BR",
      potentialAction: {
        "@type": "SearchAction",
        target: "https://www.balao.info/?search={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

  let categories: Category[] = [];
  try {
    categories = await getCategories();
  } catch {
    categories = [];
  }

  return (
    <html lang="pt-BR">
      <body
        className={`${bangers.variable} antialiased flex flex-col min-h-screen overflow-x-hidden`}
      >
        {gtmId && (
          <>
            <Script
              id="gtm-init"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                  })(window,document,'script','dataLayer','${gtmId}');
                `,
              }}
            />
            <noscript>
              <iframe
                src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
                height="0"
                width="0"
                style={{ display: "none", visibility: "hidden" }}
              />
            </noscript>
          </>
        )}

        {gaId && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            />
            <Script
              id="ga-init"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaId}', { send_page_view: true });
                `,
              }}
            />
          </>
        )}

        {metaPixelId && (
          <Script
            id="meta-pixel"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${metaPixelId}');
                fbq('track', 'PageView');
              `,
            }}
          />
        )}

        <VisitorTracker />
        <Suspense fallback={null}>
          <GlobalConversionTracker />
        </Suspense>
        <CartProvider>
          <ToastProvider>
            <Suspense fallback={null}>
              <LayoutWrapper categories={categories}>
                {children}
              </LayoutWrapper>
              <PromoJulioModal />
              <FloatingWhatsApp />
            </Suspense>
          </ToastProvider>
        </CartProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
'@


Write-Host "\nConcluído." -ForegroundColor Green
Write-Host "Agora rode: npm install && npm run lint && npm run build" -ForegroundColor Yellow
Write-Host "Depois publique/suba para o GitHub: git add . ; git commit -m 'Melhora conversao local e WhatsApp' ; git push" -ForegroundColor Yellow
