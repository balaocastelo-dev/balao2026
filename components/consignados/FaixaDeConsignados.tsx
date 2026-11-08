import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { SelosDoConsignado } from "./CartaoDeConsignado";
import { formatarPreco, hrefDoConsignado, listarConsignados } from "@/lib/consignados";

// ============================================================
// Faixa "Consignados em destaque": até 8 aparelhos em rolagem horizontal.
// Usada na página inicial e na /consignacao. Sem consignado à venda (ou com
// o MEU BLING fora do ar) a faixa não aparece — nada de caixa vazia.
// ============================================================

export const MAXIMO_NA_FAIXA = 8;

export default async function FaixaDeConsignados({ className = "", naCaptacao = false }: { className?: string; naCaptacao?: boolean }) {
  const itens = (await listarConsignados()).slice(0, MAXIMO_NA_FAIXA);
  if (!itens.length) return null;

  const faixa = (
    <section aria-labelledby="faixa-consignados" className={`rounded-3xl border border-slate-800 bg-[#111827] p-5 sm:p-7 ${className}`}>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-[#E60012]">Giro rápido · 3 meses de garantia</p>
          <h2 id="faixa-consignados" className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">
            Consignados em destaque
          </h2>
        </div>
        <Link href="/consignados" className="inline-flex items-center gap-1 text-sm font-bold text-slate-200 hover:text-[#E60012]">
          Ver todos <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
      <ul className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 sm:-mx-7 sm:px-7">
        {itens.map((item) => (
          <li key={item.numero} className="w-[220px] flex-none snap-start sm:w-[240px]">
            <Link
              href={hrefDoConsignado(item)}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-800 bg-[#161f32] transition-colors hover:border-[#E60012] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <div className="relative aspect-[4/3] bg-[#0c1220]">
                <SelosDoConsignado item={item} pequeno />
                {item.fotos[0] ? (
                  <Image src={item.fotos[0]} alt={item.titulo} fill sizes="240px" className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-slate-400">Foto a caminho</div>
                )}
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h3 className="line-clamp-2 text-sm font-extrabold leading-snug text-white">{item.titulo}</h3>
                <p className="mt-auto pt-3 text-lg font-black tracking-tight text-white">{formatarPreco(item.preco)}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );

  // Nas páginas de captação (lib/landing) a faixa entra na moldura de seção delas.
  if (!naCaptacao) return faixa;
  return (
    <div className="cpt-secao">
      <div className="cpt-miolo">{faixa}</div>
    </div>
  );
}
