import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Área não encontrada",
};

/**
 * Qualquer endereço embaixo de /painel que não seja uma área de verdade (um
 * favorito antigo, um endereço digitado errado). Sem isto a pessoa caía na
 * página de "não encontrado" da loja, fora do painel e sem o menu.
 */
export default function PainelAreaNaoEncontrada() {
  return (
    <div className="mx-auto w-full max-w-2xl p-3 sm:p-5 lg:p-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-xl font-bold text-slate-900">Essa área não existe no painel</h1>
        <p className="mt-2 text-sm text-slate-600">
          O endereço pode ser de uma tela que mudou de nome. Todas as áreas estão no menu ao lado
          e na tela de início; a busca do menu acha pelo nome.
        </p>
        <Link
          href="/painel"
          prefetch={false}
          className="mt-4 inline-flex rounded-lg bg-[#E60012] px-4 py-2 text-sm font-semibold text-white outline-none hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-[#E60012] focus-visible:ring-offset-2"
        >
          Ir para o início do painel
        </Link>
      </div>
    </div>
  );
}
