import Image from "next/image";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { formatarPreco, hrefDoConsignado, type ItemConsignado } from "@/lib/consignados";

/** Selos "Destaque" e "Novidade" sobre a foto. */
export function SelosDoConsignado({ item, pequeno = false }: { item: ItemConsignado; pequeno?: boolean }) {
  if (!item.destaque && !item.novidade) return null;
  const tamanho = pequeno ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs";
  return (
    <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-1.5">
      {item.destaque && <span className={`rounded-full bg-[#E60012] font-black uppercase tracking-wide text-white shadow-lg ${tamanho}`}>Destaque</span>}
      {item.novidade && <span className={`rounded-full bg-white font-black uppercase tracking-wide text-slate-950 shadow-lg ${tamanho}`}>Novidade</span>}
    </div>
  );
}

export function FotoDoConsignado({ item, sizes, prioridade = false }: { item: ItemConsignado; sizes: string; prioridade?: boolean }) {
  const capa = item.fotos[0];
  return (
    <div className="relative aspect-[4/3] overflow-hidden bg-[#0c1220]">
      {capa ? (
        <Image
          src={capa}
          alt={`${item.titulo} — consignado à venda na Balão da Informática`}
          fill
          sizes={sizes}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          priority={prioridade}
        />
      ) : (
        <div className="flex h-full items-center justify-center px-4 text-center text-sm text-slate-400">Foto a caminho — peça no WhatsApp</div>
      )}
    </div>
  );
}

/** Cartão da vitrine /consignados. */
export default function CartaoDeConsignado({ item, prioridade = false }: { item: ItemConsignado; prioridade?: boolean }) {
  return (
    <Link
      href={hrefDoConsignado(item)}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-800 bg-[#161f32] transition-all hover:border-[#E60012] hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.5)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
    >
      <div className="relative">
        <SelosDoConsignado item={item} />
        <FotoDoConsignado item={item} prioridade={prioridade} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p className="text-xs font-black uppercase tracking-wider text-slate-400">{item.codigo}</p>
        <h3 className="mt-1 line-clamp-2 min-h-[48px] text-base font-extrabold leading-snug text-white">{item.titulo}</h3>
        {item.estado && <p className="mt-2 line-clamp-2 text-sm text-slate-300">Estado: {item.estado}</p>}
        <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-slate-300">
          <ShieldCheck className="h-4 w-4 text-white" aria-hidden />
          {item.garantia}
        </p>
        <div className="mt-auto pt-5">
          <p className="text-2xl font-black tracking-tight text-white">{formatarPreco(item.preco)}</p>
          <p className="text-xs font-semibold text-slate-400">preço à vista</p>
          <span className="mt-4 flex w-full items-center justify-center rounded-2xl bg-[#E60012] px-5 py-3.5 font-black text-white shadow-lg shadow-red-950/50 transition-colors group-hover:bg-red-700">
            Ver detalhes
          </span>
        </div>
      </div>
    </Link>
  );
}
