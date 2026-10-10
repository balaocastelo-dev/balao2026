import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { FUNCOES_CATALOG, FUNCOES_TOTAL } from "@/lib/funcoes-catalog";

export const metadata: Metadata = {
  title: "Mapa do site",
};

/**
 * Todas as páginas da loja, com o link de cada uma. Era a "central de
 * funções" (/funcoes); as telas de administração saíram daqui porque agora
 * estão no menu do painel.
 */
export default function PainelMapaPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 p-3 sm:p-5 lg:p-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Mapa do site</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-600">
          Os {FUNCOES_TOTAL} endereços da loja, por assunto. Cada link abre a página em outra aba,
          do jeito que o cliente vê.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {FUNCOES_CATALOG.map((categoria) => (
          <section
            key={categoria.slug}
            aria-labelledby={`mapa-${categoria.slug}`}
            className="rounded-xl border border-slate-200 bg-white"
          >
            <div className="border-b border-slate-200 px-4 py-3">
              <h2 id={`mapa-${categoria.slug}`} className="text-sm font-bold text-slate-900">
                {categoria.title}
              </h2>
              <p className="mt-0.5 text-sm text-slate-600">{categoria.description}</p>
            </div>
            <ul className="divide-y divide-slate-100">
              {categoria.items.map((item) => {
                // Endereço com [colchetes] é um modelo (uma página por produto,
                // por cidade…), não um link que se possa abrir.
                const ehModelo = item.href.includes("[");
                return (
                  <li key={item.href} className="px-4 py-2.5">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                      {ehModelo ? (
                        <span className="text-sm font-semibold text-slate-900">{item.title}</span>
                      ) : (
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm font-semibold text-slate-900 underline decoration-slate-300 underline-offset-2 outline-none hover:text-[#E60012] focus-visible:ring-2 focus-visible:ring-[#E60012]"
                        >
                          {item.title}
                          <ExternalLink size={12} aria-hidden />
                        </a>
                      )}
                      <code className="text-xs text-slate-500">{item.href}</code>
                    </div>
                    <p className="mt-0.5 text-sm text-slate-600">{item.description}</p>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
