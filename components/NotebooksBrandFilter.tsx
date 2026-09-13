"use client";
import { useState, useMemo } from "react";
import ProductCard from "./ProductCard";

type P = any;

export default function NotebooksBrandFilter({ products }: { products: P[] }) {
  const [brand, setBrand] = useState("all");
  const brands = ["all","dell","lenovo","macbook","acer","asus","samsung"];
  const filtered = useMemo(()=>{
    if(brand==="all") return products;
    return products.filter((p:P)=>{
      const n = String(p.name||"").toLowerCase() + " " + String(p.category||"").toLowerCase();
      if(brand==="macbook") return n.includes("macbook")||n.includes("apple");
      return n.includes(brand);
    });
  }, [brand, products]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {brands.map(b=>(
          <button key={b} onClick={()=>setBrand(b)} className={`px-4 py-2 rounded-full text-sm font-black border capitalize transition ${brand===b?"bg-[#E60012] text-white border-[#E60012]":"bg-[#161f32] text-slate-200 border-slate-700 hover:border-[#E60012]"}`}>{b==="all"?"Todos":b}</button>
        ))}
        <span className="text-xs text-slate-400 self-center ml-2">{filtered.length} modelos • com selo <span className="inline-flex items-center bg-emerald-500 text-white px-2 py-0.5 rounded-full text-[10px] font-black ml-1">Upgrade na hora</span></span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((p:any)=>(
          <div key={p.id} className="relative">
            <ProductCard product={p}/>
            <div className="absolute top-2 left-2 bg-emerald-500 text-white text-[10px] font-black px-2 py-1 rounded-full shadow">Upgrade na hora</div>
          </div>
        ))}
      </div>
      {filtered.length===0 && <div className="text-center py-10 text-slate-400 border border-dashed border-slate-700 rounded-2xl">Nenhum notebook dessa marca — tente outra ou fale no WhatsApp.</div>}
    </div>
  );
}
