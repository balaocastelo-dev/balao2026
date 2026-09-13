"use client";
import { useState, useMemo } from "react";
import ProductCard from "./ProductCard";
import { Trophy, Scale, X, MessageCircle } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";

type Product = any;

const FPS_TAGS = [
  { key: "all", label: "Todos" },
  { key: "valorant", label: "Valorant 240fps+" },
  { key: "fortnite", label: "Fortnite 144fps+" },
  { key: "warzone", label: "Warzone 120fps+" },
  { key: "rtx", label: "RTX 4K" },
];

function matchesFps(p: Product, key: string){
  const n = String(p.name||"").toLowerCase();
  const c = String(p.category||"").toLowerCase();
  const text = n+" "+c;
  if(key==="all") return true;
  if(key==="valorant") return text.includes("rtx 40")||text.includes("rtx 3060")||text.includes("rtx 4060")||text.includes("ryzen 5")||text.includes("i5");
  if(key==="fortnite") return text.includes("rtx")||text.includes("gtx 1660")||text.includes("ryzen");
  if(key==="warzone") return text.includes("rtx 3060")||text.includes("rtx 40")||text.includes("i7")||text.includes("ryzen 7");
  if(key==="rtx") return text.includes("rtx 4070")||text.includes("rtx 4080")||text.includes("rtx 4090");
  return true;
}

export default function PcGamerFpsCompare({ pcs, parts }: { pcs: Product[]; parts: Product[] }) {
  const all = useMemo(()=> [...pcs, ...parts], [pcs, parts]);
  const [fps, setFps] = useState("all");
  const [compare, setCompare] = useState<Product[]>([]);
  const filteredPcs = pcs.filter(p=> matchesFps(p, fps));
  const filteredParts = parts.filter(p=> matchesFps(p, fps));
  const toggleCompare = (p: Product)=>{
    setCompare(prev=>{
      if(prev.find(x=>x.id===p.id)) return prev.filter(x=>x.id!==p.id);
      if(prev.length>=2) return [prev[1], p];
      return [...prev, p];
    });
  };
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2">
        {FPS_TAGS.map(t=>(
          <button key={t.key} onClick={()=>setFps(t.key)} className={`px-4 py-2 rounded-full text-sm font-black border transition ${fps===t.key?"bg-[#E60012] text-white border-[#E60012]":"bg-[#161f32] text-slate-200 border-slate-700 hover:border-[#E60012]"}`}>{t.label}</button>
        ))}
        <span className="text-xs text-slate-400 self-center ml-2">{filteredPcs.length+filteredParts.length} itens • {filteredPcs.length} PCs • {filteredParts.length} peças</span>
      </div>

      {compare.length>0 && (
        <div className="bg-[#111827] border border-slate-700 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 font-black text-white"><Scale className="w-4 h-4 text-[#E60012]"/> Comparador ({compare.length}/2)</div>
            <button onClick={()=>setCompare([])} className="text-xs text-slate-400 hover:text-white flex items-center gap-1"><X className="w-3 h-3"/> Limpar</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {compare.map(p=>(
              <div key={p.id} className="bg-[#161f32] rounded-xl p-4 border border-slate-700">
                <div className="font-bold text-white line-clamp-2 text-sm">{p.name}</div>
                <div className="text-[#E60012] font-black mt-1">{p.price}</div>
                <div className="text-xs text-slate-400 mt-1">{String(p.category||"").split("/").pop()}</div>
                <a href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(`Olá! Quero comparar ${p.name} - ${p.price}`)}`} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 bg-[#25D366] text-white px-4 py-2 rounded-xl text-sm font-black"><MessageCircle className="w-4 h-4"/> Consultar</a>
              </div>
            ))}
            {compare.length===1 && <div className="border border-dashed border-slate-600 rounded-xl p-8 text-center text-slate-500 text-sm">Selecione mais 1 produto para comparar lado a lado</div>}
          </div>
          {compare.length===2 && <div className="mt-3 text-center"><a href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(`Olá! Quero comparar: 1) ${compare[0].name} ${compare[0].price}  vs  2) ${compare[1].name} ${compare[1].price}. Qual rende mais FPS?`)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-[#E60012] text-white px-6 py-3 rounded-xl font-black"><MessageCircle className="w-4 h-4"/> Decidir no WhatsApp</a></div>}
        </div>
      )}

      <div>
        <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2"><Trophy className="w-5 h-5 text-amber-400"/> PCs Completos ({filteredPcs.length})</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredPcs.slice(0,16).map((p:any)=>(
            <div key={p.id} className="relative">
              <ProductCard product={p}/>
              <button onClick={()=>toggleCompare(p)} className={`absolute top-2 right-2 text-[11px] font-black px-2 py-1 rounded-full border ${compare.find(x=>x.id===p.id) ? "bg-[#E60012] text-white border-[#E60012]" : "bg-white text-slate-700 border-slate-200"}`}>{compare.find(x=>x.id===p.id) ? "✓ Comparando" : "+ Comparar"}</button>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-xl font-black text-white mb-4">Peças Avulsas ({filteredParts.length})</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredParts.slice(0,16).map((p:any)=>(
            <div key={p.id} className="relative">
              <ProductCard product={p}/>
              <button onClick={()=>toggleCompare(p)} className={`absolute top-2 right-2 text-[11px] font-black px-2 py-1 rounded-full border ${compare.find(x=>x.id===p.id) ? "bg-[#E60012] text-white border-[#E60012]" : "bg-white text-slate-700 border-slate-200"}`}>{compare.find(x=>x.id===p.id) ? "✓ Comparando" : "+ Comparar"}</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
