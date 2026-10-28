import type { Metadata } from "next";
import Link from "next/link";
import { BadgeDollarSign, Handshake, ShieldCheck, Wrench, Zap } from "lucide-react";
import Header from "@/components/Header";
import JsonLd, { generateBreadcrumbSchema, generateOrganizationSchema } from "@/components/JsonLd";
import VitrineDeConsignados from "@/components/consignados/VitrineDeConsignados";
import { SITE_CONFIG } from "@/lib/config";
import { listarConsignados, urlDoConsignado } from "@/lib/consignados";

// ============================================================
// /consignados — vitrine dos usados deixados na loja em consignação
// (pedido do Thiago, 28/10/2026). Os aparelhos vêm do MEU BLING
// (lib/consignados.ts). Se o MEU BLING não responder, a página continua de pé
// com o aviso "Novos consignados chegam toda semana" e o convite para a
// /consignacao.
// ============================================================

export const revalidate = 120;

const URL_DA_PAGINA = "https://www.balao.info/consignados";
const TITULO = "Consignados: usados revisados com 3 meses de garantia em Campinas";
const DESCRICAO =
  "Notebooks, PCs, celulares, tablets e games usados deixados em consignação na Balão da Informática, no Cambuí, em Campinas. Revisados na bancada, com 3 meses de garantia da loja e preço de oportunidade.";

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRICAO,
  alternates: { canonical: URL_DA_PAGINA },
  openGraph: {
    title: `${TITULO} | Balão da Informática`,
    description: DESCRICAO,
    type: "website",
    url: URL_DA_PAGINA,
    siteName: SITE_CONFIG.name,
    locale: "pt_BR",
  },
};

const PONTOS = [
  { icone: Wrench, texto: "Revisados na bancada da loja" },
  { icone: ShieldCheck, texto: "3 meses de garantia da loja" },
  { icone: BadgeDollarSign, texto: "Preço de oportunidade" },
  { icone: Zap, texto: "Saem rápido: chegou, vendeu" },
];

export default async function PaginaDeConsignados() {
  const itens = await listarConsignados();

  return (
    <div className="min-h-screen bg-[#090d16] text-white">
      <JsonLd
        data={[
          generateOrganizationSchema(),
          generateBreadcrumbSchema([
            { name: "Início", item: "https://www.balao.info" },
            { name: "Consignados", item: URL_DA_PAGINA },
          ]),
          ...(itens.length
            ? [
                {
                  "@context": "https://schema.org",
                  "@type": "ItemList",
                  url: URL_DA_PAGINA,
                  numberOfItems: itens.length,
                  itemListElement: itens.slice(0, 24).map((item, n) => ({
                    "@type": "ListItem",
                    position: n + 1,
                    url: urlDoConsignado(item),
                    name: item.titulo,
                  })),
                },
              ]
            : []),
        ]}
      />
      <Header />

      <main className="mx-auto max-w-7xl space-y-12 px-4 py-8 sm:space-y-16 sm:px-6 sm:py-12 lg:px-8">
        <header className="rounded-3xl border border-slate-800 bg-[#111827] p-6 sm:p-10">
          <p className="text-xs font-black uppercase tracking-wider text-[#E60012]">Loja do Cambuí · Campinas</p>
          <h1 className="mt-2 text-3xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">Consignados</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
            Seminovos que clientes deixaram na loja para vender: revisados, com garantia de 3 meses e preço de oportunidade. Saem rápido — viu, gostou, chama.
          </p>
          <ul className="mt-6 grid gap-3 text-sm font-bold text-slate-200 sm:grid-cols-2 lg:grid-cols-4">
            {PONTOS.map(({ icone: Icone, texto }) => (
              <li key={texto} className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-[#161f32] px-4 py-3">
                <Icone className="h-5 w-5 flex-none text-[#E60012]" aria-hidden />
                {texto}
              </li>
            ))}
          </ul>
        </header>

        <section aria-labelledby="vitrine-consignados">
          <h2 id="vitrine-consignados" className="sr-only">
            Aparelhos à venda
          </h2>
          {itens.length ? (
            <VitrineDeConsignados itens={itens} />
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-700 bg-[#111827] p-8 text-center sm:p-12">
              <p className="text-2xl font-black tracking-tight text-white sm:text-3xl">Novos consignados chegam toda semana</p>
              <p className="mx-auto mt-3 max-w-xl text-slate-300">
                Os aparelhos daqui costumam sair em poucos dias. Volte em breve — ou deixe o seu equipamento parado com a gente para vender.
              </p>
              <Link
                href="/consignacao"
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#E60012] px-6 py-4 font-black text-white shadow-lg shadow-red-950/50 transition-all hover:bg-red-700 active:scale-95"
              >
                <Handshake className="h-5 w-5" aria-hidden />
                Como deixar em consignação
              </Link>
            </div>
          )}
        </section>

        <section aria-labelledby="deixe-em-consignacao" className="grid gap-6 rounded-3xl border border-slate-800 bg-[#111827] p-6 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h2 id="deixe-em-consignacao" className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              Tem um equipamento parado? Deixe em consignação
            </h2>
            <p className="mt-3 max-w-2xl text-slate-300">
              Notebook, PC, celular, tablet ou console: a loja avalia, expõe aqui e na vitrine do Cambuí e atende o comprador por você. Você recebe quando vender.
            </p>
          </div>
          <Link
            href="/consignacao"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#E60012] px-6 py-4 font-black text-white shadow-lg shadow-red-950/50 transition-all hover:bg-red-700 active:scale-95"
          >
            Quero vender o meu
          </Link>
        </section>
      </main>
    </div>
  );
}
