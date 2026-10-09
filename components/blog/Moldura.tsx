import Link from "next/link";
import { Suspense } from "react";
import { MapPin, MessageCircle } from "lucide-react";
import Header from "@/components/Header";
import { linkDoWhatsApp } from "@/lib/blog/chamadas";
import { SITE_CONFIG } from "@/lib/config";

/**
 * O que toda página do blog tem em volta do conteúdo: o cabeçalho da loja em
 * cima e, embaixo, a faixa que lembra que por trás do blog existe um balcão.
 */

export function CabecalhoDaLoja() {
  // O cabeçalho da loja é "sticky". Dentro de um bloco só dele, ele não
  // acompanha a rolagem — no blog, quem fica preso ao topo é o filtro da
  // lista e o sumário do artigo.
  return (
    <div>
      <Suspense fallback={<div className="h-[72px]" />}>
        <Header />
      </Suspense>
    </div>
  );
}

export function FaixaDaLoja({ origem }: { origem: string }) {
  return (
    <section aria-label="A loja" className="mt-20 border-t border-[var(--b-linha)] pt-10">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-end">
        <div>
          <p className="b-titulo text-[1.625rem] text-white sm:text-[2rem]">
            Por trás do blog tem balcão e bancada no Cambuí.
          </p>
          <p className="b-serifa mt-4 max-w-xl text-[1.0625rem] leading-[1.65] text-[var(--b-tinta-2)]">
            A Balão da Informática é loja e assistência técnica em Campinas. Dá para ver o computador ligado, testar
            antes de pagar e resolver o pós-venda no mesmo endereço.
          </p>
        </div>

        <div className="flex flex-col gap-4 text-[0.9375rem] text-[var(--b-tinta-2)]">
          <p className="flex items-start gap-3">
            <MapPin aria-hidden className="mt-0.5 size-[1.125rem] flex-none text-[var(--b-tinta-3)]" />
            <span>
              <a href={SITE_CONFIG.mapsUrl} target="_blank" rel="noopener noreferrer" className="b-link" data-conversion-source="blog" data-conversion-label={`${origem}: mapa`}>
                {SITE_CONFIG.address}
              </a>
              <br />
              <span className="text-[var(--b-tinta-3)]">{SITE_CONFIG.openingHoursDisplay}</span>
            </span>
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href={linkDoWhatsApp("Olá! Vim pelo blog da Balão e quero uma orientação.")}
              target="_blank"
              rel="noopener noreferrer"
              data-conversion-source="blog"
              data-conversion-label={`${origem}: faixa da loja`}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--b-vermelho)] px-5 py-2.5 font-bold text-white transition-colors hover:bg-[#c40010]"
            >
              <MessageCircle aria-hidden className="size-[1.125rem]" />
              Falar no WhatsApp
            </a>
            <Link
              href="/manutencao"
              prefetch={false}
              className="inline-flex items-center rounded-full border border-[var(--b-linha-forte)] px-5 py-2.5 font-bold text-white transition-colors hover:border-white"
            >
              Assistência técnica
            </Link>
            <Link
              href="/departamentos"
              prefetch={false}
              className="inline-flex items-center rounded-full border border-[var(--b-linha-forte)] px-5 py-2.5 font-bold text-white transition-colors hover:border-white"
            >
              Ver a loja
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
