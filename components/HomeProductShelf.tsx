"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Heart, ShoppingCart, Star } from "lucide-react";

import { getProductHref, type Product } from "@/lib/utils";

type HomeProductShelfProps = {
  title: string;
  subtitle: string;
  products: Product[];
  categoryId?: string;
  bannerTitle: string;
  bannerText: string;
};

function formatOldPrice(price: string) {
  const value = Number(price.replace("R$", "").replace(/\./g, "").replace(",", ".").trim());
  if (Number.isNaN(value)) return null;
  return (value / 0.88).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function HomeProductShelf({
  title,
  subtitle,
  products,
  categoryId,
  bannerTitle,
  bannerText,
}: HomeProductShelfProps) {
  if (!products.length) return null;

  return (
    <section className="home-panel rounded-[1.75rem] p-4 md:p-5">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.24em] text-[var(--home-accent)]">Ofertas em destaque</div>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-[var(--home-text)]">{title}</h2>
          <p className="mt-1 text-sm text-[var(--home-muted)]">{subtitle}</p>
        </div>

        {categoryId ? (
          <Link
            href={`/?category=${encodeURIComponent(categoryId)}`}
            className="inline-flex items-center gap-2 text-sm font-black text-[var(--home-text)] hover:text-[var(--home-accent)]"
          >
            Ver todos
            <ChevronRight size={16} />
          </Link>
        ) : null}
      </div>

      <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_250px]">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
          {products.slice(0, 4).map((product) => {
            const oldPrice = formatOldPrice(product.price);

            return (
              <Link
                key={product.id}
                href={getProductHref(product)}
                className="home-card group flex h-full min-h-full flex-col rounded-[1.25rem] p-3 transition hover:-translate-y-0.5 hover:border-[var(--home-border-strong)] hover:shadow-[0_18px_44px_rgba(15,23,42,0.08)]"
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[var(--home-card-soft)] px-2 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[var(--home-muted)]">
                    <Star size={10} className="fill-current text-[var(--home-accent)]" />
                    Oferta
                  </span>
                  <span className="rounded-full p-1 text-[var(--home-muted)] transition group-hover:text-[var(--home-accent)]">
                    <Heart size={16} />
                  </span>
                </div>

                <div className="relative mx-auto aspect-square w-full max-w-[160px]">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 220px"
                    className="object-contain p-2 transition duration-300 group-hover:scale-105"
                    unoptimized
                  />
                </div>

                <div className="mt-4 grid flex-1 grid-rows-[minmax(76px,auto)_minmax(96px,1fr)_auto] gap-3">
                  <div className="text-[13px] font-medium leading-4 text-[var(--home-soft)] transition-colors group-hover:text-[var(--home-text)] sm:text-sm sm:leading-5">
                    <span className="line-clamp-4">{product.name}</span>
                  </div>

                  <div className="flex flex-col justify-center">
                    {oldPrice ? <div className="text-xs text-[var(--home-muted)] line-through whitespace-nowrap">{oldPrice}</div> : null}
                    <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--home-muted)]">No Pix</div>
                    <div className="mt-1 whitespace-nowrap text-xl font-black leading-none tracking-tight text-[var(--home-accent)] sm:text-2xl">
                      {product.price.replace("R$", "R$ ").trim()}
                    </div>
                    <div className="mt-1 text-xs text-[var(--home-muted)]">ou ate 10x sem juros</div>
                  </div>

                  <div className="pt-1">
                    <div className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--home-accent)] px-4 py-3 text-sm font-black text-white transition hover:brightness-110">
                      <ShoppingCart size={16} />
                      Comprar
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="home-panel-strong flex flex-col justify-between rounded-[1.5rem] p-5 text-white shadow-[0_18px_44px_rgba(15,23,42,0.22)]">
          <div>
            <div className="inline-flex rounded-full bg-[var(--home-accent-soft)] px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-[var(--home-accent)]">
              Selecao especial
            </div>
            <h3 className="mt-4 text-2xl font-black leading-tight">{bannerTitle}</h3>
            <p className="mt-3 text-sm leading-relaxed text-[var(--home-muted)]">{bannerText}</p>
          </div>

          <div className="mt-6 space-y-3">
            <div className="rounded-2xl bg-[var(--home-card-soft)] px-4 py-3 backdrop-blur">
              <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--home-accent)]">Entrega</div>
              <div className="mt-1 text-sm font-semibold">Campinas e regiao sob consulta</div>
            </div>
            <div className="rounded-2xl bg-[var(--home-card-soft)] px-4 py-3 backdrop-blur">
              <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--home-accent)]">Atendimento</div>
              <div className="mt-1 text-sm font-semibold">Suporte humano via WhatsApp e balcao</div>
            </div>
            <Link
              href="/fale-conosco"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--home-accent)] px-4 py-3 text-sm font-black text-white transition hover:brightness-110"
            >
              Ver central de atendimento
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
