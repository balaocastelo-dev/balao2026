import LinkDoVendedor from "@/components/vendedor/LinkDoVendedor";

export type VendedorNoPainel = {
  slug: string;
  nome: string;
  cargo: string;
};

/**
 * Páginas pessoais que já existem no código (ex.: www.balao.info/brendon).
 * O link de um vendedor novo, com o botão de copiar, aparece na aba
 * Vendedores do CRM assim que ele é cadastrado. Aqui não tem PIN.
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
            <LinkDoVendedor slug={v.slug} />
          </div>
          <p className="text-sm text-slate-600">Entra com o PIN do CRM</p>
        </li>
      ))}
    </ul>
  );
}
