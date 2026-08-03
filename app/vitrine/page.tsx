import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

import Header from "@/components/Header";
import { SITE_CONFIG } from "@/lib/config";
import { listVitrinePagesPublic } from "@/lib/vitrine/db";
import { pickPcHeroImage } from "@/lib/vitrine/core";
import type { VitrinePageRecord } from "@/lib/vitrine/types";

export const dynamic = "force-dynamic";

type VitrineExtras = Record<string, unknown> & {
  price_text?: string;
  main_product?: {
    price?: string;
  };
};

type VitrinePageView = VitrinePageRecord & {
  extras?: VitrineExtras;
  images?: Record<string, string> & {
    hero?: string;
  };
};

function priceTextFromRecord(p: VitrinePageView) {
  const extras = p?.extras && typeof p.extras === "object" ? p.extras : {};
  const direct = String(extras?.price_text || "").trim();
  if (direct) return direct;
  const mainPrice = extras?.main_product?.price ? String(extras.main_product.price).trim() : "";
  return mainPrice || "Sob consulta";
}

function buildSpecs(page: VitrinePageView) {
  return [
    page.processador,
    page.memoria_ram,
    page.armazenamento,
    page.placa_video,
  ]
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .slice(0, 3);
}

export default async function VitrinePage() {
  const pages = (await listVitrinePagesPublic().catch(() => [])) as VitrinePageView[];
  const featured = pages[0];
  const featuredHero = featured
    ? featured.images?.hero || pickPcHeroImage({ categoria: featured.categoria })
    : "/logo.png";
  const featuredPrice = featured ? priceTextFromRecord(featured) : "Sob consulta";
  const categories = Array.from(
    new Set(
      pages
        .map((page) => String(page.categoria || "").trim())
        .filter(Boolean),
    ),
  ).slice(0, 6);

  return (
    <div className="min-h-screen bg-[var(--site-bg)]">
      <Header />

      <main className="container mx-auto px-4 py-6 sm:py-8">
        <section className="home-panel-strong overflow-hidden rounded-[2rem] p-4 shadow-[0_24px_70px_rgba(2,6,23,0.18)] sm:p-6 lg:p-8">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_380px] xl:items-stretch">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[var(--home-accent)] px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-white">
                  Curadoria premium
                </span>
                <span className="rounded-full border border-[var(--home-border)] bg-[var(--home-card-soft)] px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--home-muted)]">
                  Loja física em Campinas
                </span>
                <span className="rounded-full border border-[var(--home-border)] bg-[var(--home-card-soft)] px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--home-muted)]">
                  Atendimento humano
                </span>
              </div>

              <h1 className="mt-5 max-w-4xl text-3xl font-black leading-tight tracking-tight text-[var(--home-text)] sm:text-4xl lg:text-5xl">
                Vitrine Balão com setups prontos para trabalhar, jogar e criar sem dor de cabeça.
              </h1>

              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[var(--home-muted)] sm:text-base">
                Escolha o setup ideal para o seu uso com preço transparente e peças de qualidade.
                Retire na loja em Campinas ou finalize pelo WhatsApp em poucos minutos.
              </p>

              {categories.length > 0 ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <span
                      key={category}
                      className="rounded-full border border-[var(--home-border)] bg-[var(--home-card-bg)] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[var(--home-text)]"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              ) : null}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#vitrine-grid"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--home-accent)] px-6 py-4 text-sm font-black text-white transition hover:brightness-110"
                >
                  Ver setups em oferta
                  <ArrowRight size={18} />
                </a>
                <a
                  href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent("Ola! Vim pela vitrine da Balao e quero ajuda para escolher um setup.")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--home-border)] bg-[var(--home-card-bg)] px-6 py-4 text-sm font-black text-[var(--home-text)] transition hover:border-[var(--home-accent)] hover:text-[var(--home-accent)]"
                >
                  <MessageCircle size={18} />
                  Falar no WhatsApp
                </a>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="home-card rounded-[1.5rem] p-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--home-accent-soft)] text-[var(--home-accent)]">
                    <Sparkles size={18} />
                  </div>
                  <div className="mt-3 text-base font-black text-[var(--home-text)]">Imagem que encanta</div>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--home-muted)]">
                    Fotos reais e descrição clara para você ver o que vai receber.
                  </p>
                </div>

                <div className="home-card rounded-[1.5rem] p-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--home-accent-soft)] text-[var(--home-accent)]">
                    <ShieldCheck size={18} />
                  </div>
                  <div className="mt-3 text-base font-black text-[var(--home-text)]">Confiança de loja local</div>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--home-muted)]">
                    Loja real, retirada em Campinas e suporte antes e depois da compra.
                  </p>
                </div>

                <div className="home-card rounded-[1.5rem] p-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--home-accent-soft)] text-[var(--home-accent)]">
                    <Zap size={18} />
                  </div>
                  <div className="mt-3 text-base font-black text-[var(--home-text)]">Compra sem complicação</div>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--home-muted)]">
                    Preço à vista, configuração explicada e atendimento na hora.
                  </p>
                </div>
              </div>
            </div>

            <aside className="home-card flex h-full flex-col rounded-[1.9rem] p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--home-accent)]">
                    Setup em destaque
                  </div>
                  <div className="mt-1 text-xl font-black leading-tight text-[var(--home-text)]">
                    {featured?.nome_pc || "Balão Signature Build"}
                  </div>
                </div>
                <span className="rounded-full border border-[var(--home-border)] bg-[var(--home-card-soft)] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--home-muted)]">
                  pronto para entregar
                </span>
              </div>

              <div className="relative mt-4 flex h-[280px] items-center justify-center overflow-hidden rounded-[1.6rem] border border-[var(--home-border)] bg-white p-4 sm:h-[320px]">
                <Image
                  src={featuredHero}
                  alt={featured?.nome_pc || "Setup em destaque"}
                  fill
                  sizes="(max-width: 1280px) 100vw, 380px"
                  className="object-contain p-4"
                />
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-[var(--home-border)] bg-[var(--home-card-soft)] px-4 py-3">
                  <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--home-muted)]">
                    Faixa de investimento
                  </div>
                  <div className="mt-1 text-2xl font-black tracking-tight text-[var(--home-accent)]">
                    {featuredPrice}
                  </div>
                </div>
                <div className="rounded-2xl border border-[var(--home-border)] bg-[var(--home-card-soft)] px-4 py-3">
                  <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--home-muted)]">
                    Retirada
                  </div>
                  <div className="mt-1 text-sm font-black text-[var(--home-text)]">
                    Cambuí, Campinas
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm text-[var(--home-muted)]">
                <div className="flex items-center gap-2">
                  <MessageCircle size={16} className="text-[var(--home-accent)]" />
                  Confirmação rápida pelo WhatsApp
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-[var(--home-accent)]" />
                  Loja física com atendimento local
                </div>
              </div>

              {featured ? (
                <Link
                  href={`/p/${featured.slug}`}
                  className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--home-accent)] px-5 py-4 text-sm font-black text-white transition hover:brightness-110"
                >
                  Ver setup em destaque
                  <ArrowRight size={18} />
                </Link>
              ) : null}
            </aside>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="site-surface-soft rounded-[1.6rem] border border-[var(--site-border)] p-5 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--site-muted)]">Setups prontos</div>
            <div className="mt-2 text-3xl font-black tracking-tight text-[var(--site-text)]">{pages.length}</div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--site-soft)]">
              Montagens testadas com ótimo custo-benefício, prontas para entregar.
            </p>
          </div>

          <div className="site-surface-soft rounded-[1.6rem] border border-[var(--site-border)] p-5 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--site-muted)]">Atendimento direto</div>
            <div className="mt-2 text-3xl font-black tracking-tight text-[var(--site-text)]">WhatsApp</div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--site-soft)]">
              Tire dúvida de compatibilidade, estoque e retirada antes de sair de casa.
            </p>
          </div>

          <div className="site-surface-soft rounded-[1.6rem] border border-[var(--site-border)] p-5 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--site-muted)]">Loja física</div>
            <div className="mt-2 text-3xl font-black tracking-tight text-[var(--site-text)]">Campinas</div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--site-soft)]">
              Loja física, retirada local e apoio humano para fechar com mais segurança.
            </p>
          </div>
        </section>

        <section id="vitrine-grid" className="mt-10">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.22em] text-[var(--site-muted)]">
                Setups em destaque
              </div>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-[var(--site-text)] sm:text-4xl">
                Escolha o seu setup ideal e veja a oferta completa
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-relaxed text-[var(--site-soft)]">
              Cada setup abaixo traz as principais configurações e o valor do investimento, para você comparar
              e decidir com segurança.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {pages.map((page, index) => {
              const hero = page.images?.hero || pickPcHeroImage({ categoria: page.categoria });
              const priceText = priceTextFromRecord(page);
              const specs = buildSpecs(page);

              return (
                <Link
                  key={page.id}
                  href={`/p/${page.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-[1.8rem] border border-[var(--site-border)] bg-[var(--site-panel-soft)] shadow-[0_20px_55px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--site-accent-soft)] hover:shadow-[0_28px_70px_rgba(15,23,42,0.14)]"
                >
                  <div className="p-4 sm:p-5">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <span className="rounded-full bg-[var(--site-panel-muted)] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--site-accent)]">
                        {String(page.categoria || "Setup")}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--site-muted)]">
                        #{String(index + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <div className="relative flex h-72 items-center justify-center overflow-hidden rounded-[1.6rem] border border-[var(--site-border)] bg-white p-3 sm:h-80 sm:p-4">
                      <Image
                        src={hero}
                        alt={page.nome_pc}
                        width={900}
                        height={700}
                        className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.05]"
                      />
                    </div>

                    <div className="mt-5 flex min-h-[220px] flex-col">
                      <h3 className="line-clamp-4 text-xl font-black leading-tight tracking-tight text-[var(--site-text)] transition-colors group-hover:text-[#E60012]">
                        {page.nome_pc}
                      </h3>

                      {specs.length > 0 ? (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {specs.map((spec) => (
                            <span
                              key={spec}
                              className="rounded-full border border-[var(--site-border)] bg-[var(--site-panel-muted)] px-3 py-1 text-[11px] font-bold text-[var(--site-soft)]"
                            >
                              {spec}
                            </span>
                          ))}
                        </div>
                      ) : null}

                      <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-[var(--site-soft)]">
                        Setup completo e pronto para uso, com garantia e suporte da equipe Balão.
                      </p>

                      <div className="mt-auto pt-5">
                        <div className="flex items-end justify-between gap-4">
                          <div>
                            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--site-muted)]">
                              Faixa de investimento
                            </div>
                            <div className="mt-1 text-2xl font-black tracking-tight text-[#E60012]">
                              {priceText}
                            </div>
                          </div>
                          <div className="text-right text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--site-muted)]">
                            Ver ofertas
                          </div>
                        </div>

                        <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#E60012] px-4 py-3 text-sm font-black text-white transition group-hover:brightness-110">
                          Ver ofertas e detalhes
                          <ArrowRight size={16} />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {pages.length === 0 ? (
            <div className="mt-10 rounded-[1.75rem] border border-dashed border-[var(--site-border)] bg-[var(--site-panel-soft)] px-6 py-10 text-center text-[var(--site-soft)]">
              Em breve, novos setups em destaque.
            </div>
          ) : null}
        </section>

        <section className="mt-10 home-panel rounded-[1.9rem] p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-center">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.22em] text-[var(--home-accent)]">
                Compra segura e rápida
              </div>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-[var(--home-text)]">
                Precisa confirmar qual setup vale mais a pena para seu uso?
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[var(--home-muted)] sm:text-base">
                Chame a equipe da Balão no WhatsApp para validar estoque, desempenho, retirada e melhor custo-beneficio
                antes de fechar.
              </p>
            </div>

            <div className="space-y-3">
              <a
                href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent("Ola! Quero ajuda para escolher um setup da vitrine da Balao.")}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-5 py-4 text-sm font-black text-white transition hover:bg-[#128C7E]"
              >
                <MessageCircle size={18} />
                Falar no WhatsApp agora
              </a>
              <a
                href={SITE_CONFIG.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[var(--home-border)] bg-[var(--home-card-bg)] px-5 py-4 text-sm font-black text-[var(--home-text)] transition hover:border-[var(--home-accent)]"
              >
                <MapPin size={18} />
                Ver loja no mapa
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
