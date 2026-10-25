import type { Metadata } from "next";
import Link from "next/link";
import { TrendingDown } from "lucide-react";
import Header from "@/components/Header";
import { CabecalhoDaQueda, GradeDeQuedas } from "@/components/home/HomeQuedaDePreco";
import { getCachedQuedasDePreco } from "@/lib/cache";
import { DIAS_NA_VITRINE, produtosEmQueda } from "@/lib/precos/queda";

// Categoria especial "Queda de preço" (12/10): todos os produtos cujo preço
// baixou nos últimos dias. A página inicial mostra até 12; aqui aparecem todos.
// Usa a mesma consulta em cache do container da página inicial.

export const revalidate = 60;

export const metadata: Metadata = {
  title: { absolute: "Queda de preço | Produtos que baixaram de preço | Balão da Informática" },
  description:
    "Produtos que baixaram de preço na Balão da Informática, no Cambuí, em Campinas. O preço anterior e o novo, lado a lado, atualizados todos os dias.",
  alternates: { canonical: "https://www.balao.info/queda-de-preco" },
};

export default async function QuedaDePrecoPage() {
  const quedas = produtosEmQueda(await getCachedQuedasDePreco());

  return (
    <div className="home-shell flex min-h-screen flex-col bg-slate-950 font-sans text-slate-100">
      <Header />
      <main className="mx-auto w-full max-w-[1920px] px-4 py-8 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
        {quedas.length > 0 ? (
          <section className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-900 p-4 sm:p-6 lg:p-8">
            <CabecalhoDaQueda total={quedas.length} comLink={false} />
            <GradeDeQuedas quedas={quedas} />
          </section>
        ) : (
          <section className="mx-auto max-w-xl rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center">
            <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300">
              <TrendingDown size={28} />
            </span>
            <h1 className="text-2xl font-black text-white">Queda de preço</h1>
            <p className="mt-2 text-slate-400">
              Nenhum produto baixou de preço nos últimos {DIAS_NA_VITRINE} dias. Os preços são conferidos várias vezes por dia: volte mais
              tarde.
            </p>
            <Link href="/" className="mt-6 inline-flex rounded-full bg-[#E60012] px-6 py-3 text-sm font-black text-white transition hover:bg-red-500">
              Ver todos os produtos
            </Link>
          </section>
        )}
      </main>
    </div>
  );
}
