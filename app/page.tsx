import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import ProductList from "@/components/ProductList";
import Carousel from "@/components/Carousel";
import SeoContent from "@/components/SeoContent";
import JsonLd, { generateOrganizationSchema } from "@/components/JsonLd";
import QuickLeadSection from "@/components/QuickLeadSection";
import HomeLocalStoreInfo from "@/components/HomeLocalStoreInfo";
import HomeProductShelf from "@/components/HomeProductShelf";
import { getProductsByExactCategories, getCarouselImages, getCategories, getHomeBlocks } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { parsePriceToNumber, Product, type Category } from "@/lib/utils";
import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/config";
import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  Cpu,
  Gamepad2,
  Headphones,
  Laptop,
  MapPin,
  MessageCircle,
  Monitor,
  PhoneCall,
  ShieldCheck,
  Store,
  Zap,
} from "lucide-react";

export const revalidate = 300;

type SearchParams = Promise<{ category?: string; search?: string }>;

const homeBrands = ["Intel", "AMD", "Kingston", "HyperX", "Logitech", "Corsair", "Razer", "Acer", "Husky"];

const homeHighlights = [
  {
    title: "Computadores",
    description: "Pronta entrega, montagem e upgrade com orientação no balcão e no WhatsApp.",
    icon: Cpu,
    href: "/pcgamer",
  },
  {
    title: "Notebooks",
    description: "Modelos para estudo, trabalho e uso profissional com retirada local.",
    icon: Laptop,
    href: "/?category=Notebook",
  },
  {
    title: "Periféricos Gamer",
    description: "Headsets, teclados, mouse e acessórios para montar seu setup completo.",
    icon: Headphones,
    href: "/?category=Periféricos",
  },
  {
    title: "Monitores e Vídeo",
    description: "Monitores, placas e upgrades para performance real em trabalho e jogo.",
    icon: Monitor,
    href: "/?category=Monitores",
  },
  {
    title: "Games e Consoles",
    description: "Categoria rápida para quem já quer chegar direto na vitrine certa.",
    icon: Gamepad2,
    href: "/?category=Games",
  },
];

const homeServicePillars = [
  {
    title: "Comprar hoje",
    description: "Peças, notebooks, PCs e periféricos com rota rápida para WhatsApp e retirada local.",
    href: "/pcgamer",
    icon: Zap,
  },
  {
    title: "Levar para assistência",
    description: "Diagnóstico, orçamento e reparo com equipe própria em Campinas e região.",
    href: "/manutencao",
    icon: ShieldCheck,
  },
  {
    title: "Visitar a loja física",
    description: "Veja localização, horário e contato direto antes de sair para a loja.",
    href: SITE_CONFIG.mapsUrl,
    icon: Store,
    external: true,
  },
];

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

    const rawSearchProducts = await (async () => {
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

    // Deduplicate by name
    const seenNames = new Set();
    products = rawSearchProducts.filter(p => {
      const nameKey = p.name.trim().toLowerCase();
      if (seenNames.has(nameKey)) return false;
      seenNames.add(nameKey);
      return true;
    });
  } else {
    [categories, carouselImages, homeBlocks] = await Promise.all([
      getCategories(),
      getCarouselImages(true),
      getHomeBlocks(true),
    ]);

    let rawProducts: Product[] = [];
    if (category && category !== "Todos os Produtos") {
      const validCategories = new Set<string>([category]);
      const descendants = getDescendantNames(category, categories);
      descendants.forEach((name) => validCategories.add(name));
      rawProducts = await getProductsByExactCategories([...validCategories]);
    } else {
      const blockCategories = [...new Set(homeBlocks.map((block) => block.category_id).filter(Boolean))];
      rawProducts = await getProductsByExactCategories(blockCategories);
    }

    // Deduplicate by name
    const seenNames = new Set();
    products = rawProducts.filter(p => {
      const nameKey = p.name.trim().toLowerCase();
      if (seenNames.has(nameKey)) return false;
      seenNames.add(nameKey);
      return true;
    });
  }

  const filteredProducts = products;

  return (
    <div className="home-shell min-h-screen flex flex-col font-sans transition-colors duration-300">
      <JsonLd data={generateOrganizationSchema()} />
      <Header />

      {!search && !category && (
        <section className="container mx-auto px-4 pt-5 lg:px-0">
          <div className="home-panel overflow-x-auto rounded-[1.5rem] px-4 py-3">
            <div className="flex min-w-max items-center gap-3">
              <span className="rounded-full bg-[var(--home-accent)] px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-white">
                Marcas em destaque
              </span>
              {homeBrands.map((brand) => (
                <span
                  key={brand}
                  className="rounded-full border border-[var(--home-border)] bg-[var(--home-card-soft)] px-4 py-2 text-sm font-bold text-[var(--home-text)]"
                >
                  {brand}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="container mx-auto flex flex-1 gap-6 px-4 py-6 lg:px-0">
        <div className={`w-64 flex-shrink-0 ${search || category ? "hidden lg:block" : "hidden xl:block"}`}>
          <div className="home-panel overflow-hidden rounded-[1.6rem] p-2">
            <Sidebar categories={categories} />
          </div>
        </div>
        <main className="flex-1 min-w-0">
          {!search && !category && (
            <div className="space-y-8">
              <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
                <div className="space-y-4">
                  <div className="home-panel-strong overflow-hidden rounded-[2rem] p-4 md:p-5">
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[var(--home-accent)] px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-white">
                        Ofertas da semana
                      </span>
                      <span className="rounded-full border border-[var(--home-border)] bg-[var(--home-card-soft)] px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--home-muted)]">
                        Loja física em Campinas
                      </span>
                      <span className="rounded-full border border-[var(--home-border)] bg-[var(--home-card-soft)] px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--home-muted)]">
                        Retirada e assistência
                      </span>
                    </div>

                    <div className="mb-5 grid gap-4 md:grid-cols-[minmax(0,1fr)_240px] md:items-end">
                      <div>
                        <h1 className="text-3xl font-black tracking-tight text-[var(--home-text)] md:text-5xl">
                          Monte, compre e resolva sua informática no mesmo lugar.
                        </h1>
                        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[var(--home-muted)] md:text-base">
                          PCs, notebooks, peças, upgrades e assistência técnica com atendimento humano pelo WhatsApp e retirada na loja física no Cambuí.
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="home-card rounded-2xl px-4 py-3">
                          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--home-muted)]">Contato</div>
                          <div className="mt-1 text-lg font-black text-[var(--home-text)]">WhatsApp</div>
                        </div>
                        <div className="home-card rounded-2xl px-4 py-3">
                          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--home-muted)]">Retirada</div>
                          <div className="mt-1 text-lg font-black text-[var(--home-text)]">No dia</div>
                        </div>
                      </div>
                    </div>

                    {carouselImages.length > 0 ? (
                      <Carousel images={carouselImages} />
                    ) : (
                      <div className="flex h-52 items-center justify-center rounded-[1.75rem] bg-gradient-to-r from-[#E60012] to-red-800 text-center text-3xl font-black text-white shadow-md md:h-72">
                        Ofertas Imperdíveis
                      </div>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    {homeHighlights.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link key={item.title} href={item.href} className="home-card group rounded-[1.5rem] p-5 transition hover:-translate-y-0.5 hover:border-[var(--home-border-strong)]">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--home-accent-soft)] text-[var(--home-accent)]">
                            <Icon size={20} />
                          </div>
                          <h3 className="mt-4 text-lg font-black tracking-tight text-[var(--home-text)] group-hover:text-[var(--home-accent)]">
                            {item.title}
                          </h3>
                          <p className="mt-2 text-sm leading-relaxed text-[var(--home-muted)]">{item.description}</p>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                <aside className="space-y-4">
                  <div className="home-panel-strong rounded-[2rem] p-6">
                    <div className="inline-flex items-center gap-2 rounded-full bg-[var(--home-success-soft)] px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-[var(--home-success)]">
                      <Clock3 size={14} />
                      Atendimento rápido
                    </div>
                    <h2 className="mt-4 text-3xl font-black tracking-tight text-[var(--home-text)]">
                      Quer resolver hoje?
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-[var(--home-muted)]">
                      Abra o WhatsApp da loja, veja como chegar ou fale por telefone sem perder o contexto do produto ou do serviço.
                    </p>

                    <div className="mt-6 space-y-3">
                      <a
                        href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent("Olá! Quero atendimento rápido da Balão da Informática para compra ou assistência técnica em Campinas e região.")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-5 py-4 text-sm font-black text-white transition hover:bg-[#128C7E]"
                      >
                        <MessageCircle size={18} />
                        Falar no WhatsApp agora
                      </a>
                      <a
                        href={`tel:${SITE_CONFIG.phone.number}`}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[var(--home-border)] bg-[var(--home-card-bg)] px-5 py-4 text-sm font-black text-[var(--home-text)] transition hover:border-[var(--home-accent)]"
                      >
                        <PhoneCall size={18} />
                        Ligar para a loja
                      </a>
                      <a
                        href={SITE_CONFIG.mapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[var(--home-border)] bg-[var(--home-card-soft)] px-5 py-4 text-sm font-black text-[var(--home-text)] transition hover:border-[var(--home-accent)]"
                      >
                        <MapPin size={18} />
                        Abrir no Google Maps
                      </a>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    {homeServicePillars.map((item) => {
                      const Icon = item.icon;
                      const card = (
                        <div className="home-card group rounded-[1.6rem] p-5 transition hover:-translate-y-0.5 hover:border-[var(--home-border-strong)]">
                          <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--home-accent-soft)] text-[var(--home-accent)]">
                              <Icon size={20} />
                            </div>
                            <div className="min-w-0">
                              <div className="text-lg font-black tracking-tight text-[var(--home-text)]">{item.title}</div>
                              <p className="mt-1 text-sm leading-relaxed text-[var(--home-muted)]">{item.description}</p>
                              <div className="mt-3 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[var(--home-accent)]">
                                Acessar
                                <ArrowRight size={14} />
                              </div>
                            </div>
                          </div>
                        </div>
                      );

                      return item.external ? (
                        <a key={item.title} href={item.href} target="_blank" rel="noreferrer">
                          {card}
                        </a>
                      ) : (
                        <Link key={item.title} href={item.href}>
                          {card}
                        </Link>
                      );
                    })}
                  </div>
                </aside>
              </section>

              {homeBlocks.map((block, index) => {
                const blockProducts = products.filter((p) => p.category === block.category_id);
                if (blockProducts.length === 0) return null;

                return (
                  <HomeProductShelf
                    key={block.id}
                    title={block.title || block.category_id}
                    subtitle={index % 2 === 0 ? "Seleção curada para compra rápida, retirada e comparação direta." : "Produtos que puxam busca, clique e decisão rápida na home."}
                    products={blockProducts}
                    categoryId={block.category_id}
                    bannerTitle={index % 2 === 0 ? "Pronto para retirar ou pedir no WhatsApp" : "Vitrine com foco em giro e alta intenção"}
                    bannerText={index % 2 === 0 ? "Combine catálogo online com atendimento local para confirmar estoque, fechar pedido e sair com a solução certa." : "Mantive a lógica de vitrine horizontal da referência, mas com a identidade Balão e seus fluxos locais."}
                  />
                );
              })}
            </div>
          )}

          {(category || search) && (
            <section className="home-panel rounded-[2rem] p-6 md:p-8">
              <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-[11px] font-black uppercase tracking-[0.22em] text-[var(--home-accent)]">
                    Navegação orientada
                  </div>
                  <h1 className="mt-2 text-2xl font-black tracking-tight text-[var(--home-text)] md:text-4xl">
                    {category || `Resultados para: "${search}"`}
                  </h1>
                </div>
                <span className="rounded-full border border-[var(--home-border)] bg-[var(--home-card-soft)] px-4 py-2 text-sm font-bold text-[var(--home-muted)]">
                  {filteredProducts.length} produtos
                </span>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="rounded-[1.5rem] border border-[var(--home-border)] bg-[var(--home-card-bg)] px-6 py-20 text-center text-[var(--home-muted)]">
                  <p className="text-xl font-medium">Nenhum produto encontrado.</p>
                </div>
              ) : (
                <ProductList products={filteredProducts} />
              )}
            </section>
          )}

          {!search && !category && <HomeLocalStoreInfo />}

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

          {!search && !category && (
            <SeoContent title="LOJA DE INFORMÁTICA EM CAMPINAS COM ATENDIMENTO LOCAL">
              <p className="mb-4 text-[var(--home-muted)]">
                A <strong>Balão da Informática Castelo</strong> atende Campinas e região com venda de <strong>PC Gamer, notebooks, peças, periféricos, upgrades e assistência técnica</strong>. O foco é resolver rápido: consulte estoque pelo WhatsApp, retire na loja física no Cambuí ou peça entrega conforme disponibilidade.
              </p>
              <ul className="list-none space-y-3 pl-0 text-[var(--home-muted)]">
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
        </main>
      </div>
    </div>
  );
}
