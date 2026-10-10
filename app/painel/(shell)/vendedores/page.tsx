import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, Trophy } from "lucide-react";
import { AreaEquipe } from "@/components/painel/AreasDoCrm";
import PaginasDosVendedores from "@/components/painel/PaginasDosVendedores";
import { VENDEDORES, temSenhaConfigurada } from "@/lib/vendedores";

export const metadata: Metadata = {
  title: "Vendedores",
};

/**
 * Tudo sobre quem vende, num lugar só. Antes isso ficava espalhado: a equipe
 * dentro do CRM, as páginas pessoais no código do site e as metas na Arena.
 */
export default function PainelVendedoresPage() {
  const vendedores = VENDEDORES.map((v) => ({
    slug: v.slug,
    nome: v.nome,
    cargo: v.cargo,
    temSenha: temSenhaConfigurada(v),
  }));

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 p-3 sm:p-5 lg:p-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Vendedores</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-600">
          Cada vendedor tem duas coisas: o cadastro na equipe do atendimento, com a assinatura das
          mensagens, e uma página pessoal por onde ele entra para atender.
        </p>
      </div>

      <AreaEquipe />

      <section aria-labelledby="paginas-pessoais" className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 id="paginas-pessoais" className="text-sm font-bold text-slate-900">
            Páginas pessoais de atendimento
          </h2>
          <p className="mt-0.5 text-sm text-slate-600">
            O endereço que cada um abre no computador da loja. Todos atendem pelo mesmo número de
            WhatsApp; o que muda é a assinatura, o funil e as conversas de cada um.
          </p>
        </div>
        <PaginasDosVendedores vendedores={vendedores} />
        <p className="border-t border-slate-200 px-4 py-3 text-sm text-slate-600">
          Criar a página de um vendedor novo e trocar a senha de alguém não se faz por esta tela:
          as duas coisas ficam na configuração do site.
        </p>
      </section>

      <section aria-labelledby="vendas-da-equipe" className="rounded-xl border border-slate-200 bg-white">
        <h2 id="vendas-da-equipe" className="border-b border-slate-200 px-4 py-3 text-sm font-bold text-slate-900">
          Vendas da equipe
        </h2>
        <ul className="p-1">
          <li>
            <Link
              href="/painel/arena"
              prefetch={false}
              className="group flex items-start gap-3 rounded-lg px-3 py-2.5 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-[#E60012]"
            >
              <Trophy size={18} aria-hidden className="mt-0.5 shrink-0 text-slate-500 group-hover:text-[#E60012]" />
              <span>
                <span className="block text-sm font-semibold text-slate-900">Arena de vendas</span>
                <span className="block text-sm text-slate-600">
                  Lançar venda de cada um, ajustar metas e zerar a temporada.
                </span>
              </span>
            </Link>
          </li>
          <li>
            <Link
              href="/painel/indicadores"
              prefetch={false}
              className="group flex items-start gap-3 rounded-lg px-3 py-2.5 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-[#E60012]"
            >
              <BarChart3 size={18} aria-hidden className="mt-0.5 shrink-0 text-slate-500 group-hover:text-[#E60012]" />
              <span>
                <span className="block text-sm font-semibold text-slate-900">Indicadores</span>
                <span className="block text-sm text-slate-600">
                  Quanto cada vendedor vendeu no período, comparado com a meta.
                </span>
              </span>
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}
