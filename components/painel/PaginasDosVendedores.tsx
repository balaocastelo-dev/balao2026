import { ExternalLink } from "lucide-react";

export type VendedorNoPainel = {
  slug: string;
  nome: string;
  cargo: string;
  /** Se a senha da página pessoal já foi definida na hospedagem. */
  temSenha: boolean;
};

/**
 * A lista das páginas pessoais de atendimento (ex.: www.balao.info/brendon).
 * Mostra só se a senha existe — nunca a senha.
 */
export default function PaginasDosVendedores({ vendedores }: { vendedores: VendedorNoPainel[] }) {
  if (vendedores.length === 0) {
    return <p className="px-4 py-6 text-sm text-slate-600">Nenhum vendedor cadastrado no site.</p>;
  }

  return (
    <ul className="divide-y divide-slate-200">
      {vendedores.map((v) => (
        <li key={v.slug} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900">
              {v.nome} <span className="font-normal text-slate-500">({v.cargo})</span>
            </p>
            <a
              href={`/${v.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-slate-600 underline decoration-slate-300 underline-offset-2 outline-none hover:text-[#E60012] focus-visible:ring-2 focus-visible:ring-[#E60012]"
            >
              www.balao.info/{v.slug}
              <ExternalLink size={12} aria-hidden />
            </a>
          </div>
          {v.temSenha ? (
            <p className="text-sm text-slate-600">Senha definida</p>
          ) : (
            <p className="text-sm font-semibold text-[#b8000e]">
              Sem senha: a página não abre para ninguém
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
