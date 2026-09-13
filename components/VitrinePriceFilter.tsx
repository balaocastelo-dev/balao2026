"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { parsePriceToNumber } from "@/lib/utils";

type Page = {
  id: string; slug: string; nome_pc: string; categoria: string;
  processador?: string; memoria_ram?: string; armazenamento?: string; placa_video?: string;
  images?: any; extras?: any;
};

function priceText(p: any){
  const extras = p?.extras && typeof p.extras === "object" ? p.extras : {};
  const direct = String(extras?.price_text || "").trim();
  if(direct) return direct;
  const main = extras?.main_product?.price ? String(extras.main_product.price).trim() : "";
  return main || "Sob consulta";
}
function priceNum(p: any){
  const t = priceText(p);
  return parsePriceToNumber(t);
}

export default function VitrinePriceFilter({ pages, fallbackProducts }: { pages: Page[]; fallbackProducts?: any[] }) {
  const [range, setRange] = useState<"all"|"3k"|"5k"|"8k">("all");
  const showPages = pages.length > 0 ? pages : [];
  const isFallback = pages.length===0 && fallbackProducts && fallbackProducts.length>0;
  // if fallback, render products fallback
  let filtered = showPages;
  if(!isFallback){
    filtered = showPages.filter(p=>{
      const n = priceNum(p);
      if(n===0) return range==="all";
      if(range==="3k") return n <= 3000;
      if(range==="5k") return n > 3000 && n <= 5000;
      if(range==="8k") return n > 5000;
      return true;
    });
  }
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          {k:"all", l:"Todos"},
          {k:"3k", l:"Até R$3k"},
          {k:"5k", l:"R$3k - R$5k"},
          {k:"8k", l:"Acima de R$5k"},
        ].map(b=>(
          <button key={b.k} onClick={()=>setRange(b.k as any)} className={`px-5 py-2.5 rounded-full text-sm font-black border transition ${range===b.k ? "bg-[#E60012] text-white border-[#E60012]" : "bg-white text-slate-700 border-slate-200 hover:border-[#E60012]/40"}`}>{b.l}</button>
        ))}
        <span className="ml-2 text-xs font-bold text-slate-500 self-center">{isFallback ? `${fallbackProducts!.length} PCs gamer em destaque` : `${filtered.length} setups`}</span>
      </div>

      {isFallback ? (
        <div>
          <div className="mb-4 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800 font-bold">Nenhuma vitrine publicada ainda — mostrando 6 PCs gamer mais buscados para você não sair de mãos vazias.</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {fallbackProducts!.slice(0,6).map((p:any)=>(
              <Link key={p.id} href={`/product/${p.slug||p.id}`} className="group flex flex-col overflow-hidden rounded-[1.8rem] border border-slate-200 bg-white shadow hover:-translate-y-1 transition">
                <div className="relative h-64 bg-white p-4 flex items-center justify-center border-b"><Image src={p.image||"/logo.png"} alt={p.name} fill className="object-contain p-4 group-hover:scale-105 transition" unoptimized/></div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="text-[11px] font-black uppercase tracking-widest text-[#E60012]">{String(p.category||"PC Gamer").split("/").pop()}</div>
                  <div className="mt-1 font-black text-slate-900 line-clamp-2">{p.name}</div>
                  <div className="mt-3 text-xl font-black text-[#E60012]">{p.price}</div>
                  <div className="mt-3 inline-flex items-center gap-2 bg-[#E60012] text-white px-4 py-2 rounded-xl text-sm font-black w-fit">Ver detalhes <ArrowRight size={16}/></div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((page:any, idx:number)=>{
            const hero = page.images?.hero || "/logo.png";
            const priceT = priceText(page);
            const specs = [page.processador, page.memoria_ram, page.placa_video].filter(Boolean).slice(0,3) as string[];
            return (
              <Link key={page.id} href={`/p/${page.slug}`} className="group flex flex-col overflow-hidden rounded-[1.8rem] border border-slate-200 bg-white shadow hover:-translate-y-1 transition">
                <div className="p-4">
                  <div className="flex justify-between mb-3"><span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#E60012]">{String(page.categoria||"Setup")}</span><span className="text-[10px] font-black text-slate-400">#{String(idx+1).padStart(2,"0")}</span></div>
                  <div className="relative h-72 bg-white border rounded-2xl p-3 flex items-center justify-center overflow-hidden"><Image src={hero} alt={page.nome_pc} width={900} height={700} className="h-full w-full object-contain group-hover:scale-105 transition"/></div>
                  <div className="mt-4">
                    <h3 className="font-black text-slate-900 line-clamp-2 group-hover:text-[#E60012]">{page.nome_pc}</h3>
                    {specs.length>0 && <div className="mt-3 flex flex-wrap gap-2">{specs.map((s:string)=><span key={s} className="rounded-full border bg-slate-50 px-3 py-1 text-[11px] font-bold">{s}</span>)}</div>}
                    <div className="mt-4 flex items-end justify-between"><div><div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Faixa</div><div className="text-xl font-black text-[#E60012]">{priceT}</div></div><span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Abrir</span></div>
                    <div className="mt-3 inline-flex items-center gap-2 bg-[#E60012] text-white px-4 py-2 rounded-xl text-sm font-black">Ver detalhes <ArrowRight size={16}/></div>
                  </div>
                </div>
              </Link>
            );
          })}
          {filtered.length===0 && <div className="col-span-full text-center py-10 text-slate-500 border border-dashed rounded-2xl">Nenhum setup nesta faixa — tente outra faixa ou fale no WhatsApp.</div>}
        </div>
      )}
    </div>
  );
}
