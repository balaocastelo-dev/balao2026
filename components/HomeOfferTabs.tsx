"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/utils";

type OfferTab = {
  key: string;
  title: string;
  categoryId?: string;
  products: Product[];
};

export default function HomeOfferTabs({ tabs }: { tabs: OfferTab[] }) {
  const safeTabs = useMemo(() => tabs.filter((t) => (t.products || []).length > 0), [tabs]);
  const [active, setActive] = useState(safeTabs[0]?.key ?? "");
  const activeTab = safeTabs.find((t) => t.key === active) ?? safeTabs[0];

  if (!activeTab) return null;

  const items = (activeTab.products || []).slice(0, 10);
  const moreHref = activeTab.categoryId ? `/?category=${encodeURIComponent(activeTab.categoryId)}` : "/promocao";

  return (
    <div className="px-4 lg:px-0">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 [scrollbar-width:'none'] [&::-webkit-scrollbar]:hidden">
        {safeTabs.map((t) => {
          const isActive = t.key === activeTab.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setActive(t.key)}
              className={[
                "whitespace-nowrap rounded-full px-4 py-2 text-sm font-extrabold transition-colors border",
                isActive
                  ? "bg-[#E60012] text-white border-[#E60012] shadow-[0_14px_30px_rgba(230,0,18,0.22)]"
                  : "bg-white text-gray-800 border-black/10 hover:bg-zinc-50",
              ].join(" ")}
            >
              {t.title}
            </button>
          );
        })}
        <div className="flex-1" />
        <Link href={moreHref} className="hidden sm:inline-flex items-center gap-2 text-sm font-extrabold text-[#E60012] hover:underline">
          Ver todos <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      <div className="mt-6 sm:hidden">
        <Link href={moreHref} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white border border-black/10 px-5 py-3 font-extrabold text-gray-900 hover:bg-zinc-50 transition-colors">
          Ver todos <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

