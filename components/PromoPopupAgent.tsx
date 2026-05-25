"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

type PromoPopupProduct = {
  id: string;
  title: string;
  image: string;
  price: number;
  oldPrice: number;
  discountPercent: number;
  installments: { count: number; amount: number; label: string };
  specs: string[];
  category: string;
  stock: number | null;
  url: string;
  headline: string;
  urgency: string;
  subline: string;
  impactPhrase: string;
  layout: "imageTop" | "imageLeft";
};

function toMoneyBRL(value: number) {
  return `R$ ${Number(value).toFixed(2).replace(".", ",")}`;
}

function shouldShowOnPath(pathname: string) {
  const p = pathname || "/";
  if (p.startsWith("/admin")) return false;
  if (p.startsWith("/pdv")) return false;
  if (p.startsWith("/blog")) return false;
  if (p.startsWith("/agentes")) return false;
  if (p.startsWith("/api")) return false;
  if (p.startsWith("/checkout")) return false;
  if (p.startsWith("/thank-you")) return false;
  return true;
}

export default function PromoPopupAgent() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<PromoPopupProduct | null>(null);
  const timerRef = useRef<number | null>(null);
  const loadStartRef = useRef<number>(0);

  const enabled = useMemo(() => shouldShowOnPath(pathname), [pathname]);

  useEffect(() => {
    if (!enabled) return;
    loadStartRef.current = Date.now();

    const load = async () => {
      const lastId = typeof window !== "undefined" ? localStorage.getItem("promo_popup_last_product_id") || "" : "";
      const res = await fetch(`/api/promo/popup${lastId ? `?exclude=${encodeURIComponent(lastId)}` : ""}`, {
        cache: "no-store",
      });
      if (!res.ok) return;
      const json = (await res.json()) as PromoPopupProduct;
      if (!json?.id) return;
      setData(json);
      localStorage.setItem("promo_popup_last_product_id", json.id);
      const elapsed = Date.now() - loadStartRef.current;
      const openDelay = Math.max(0, 3000 - elapsed);
      window.setTimeout(() => setOpen(true), openDelay);
    };

    load().catch(() => {});

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [enabled]);

  if (!enabled) return null;
  if (!data) return null;

  const glow = "shadow-[0_0_0_1px_rgba(230,0,18,0.35),0_0_36px_rgba(230,0,18,0.35)]";
  const frame = "bg-zinc-950/95 border border-red-600/60";

  const imageBlock = (
    <div className="relative w-full overflow-hidden rounded-xl border border-zinc-800 bg-white">
      <div className="relative h-[300px] w-full sm:h-[380px] lg:h-[420px]">
        <Image
          src={data.image}
          alt={data.title}
          fill
          loading="lazy"
          sizes="(max-width: 640px) 92vw, (max-width: 1024px) 640px, 740px"
          className="object-cover object-center lg:object-contain"
        />
      </div>
    </div>
  );

  const contentBlock = (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[12px] font-extrabold tracking-wide text-red-500">
            {data.impactPhrase}
          </div>
          <div className="mt-2 line-clamp-2 text-[16px] font-extrabold text-white sm:text-[18px]">
            {data.title}
          </div>
        </div>
        <button
          type="button"
          aria-label="Fechar"
          onClick={() => setOpen(false)}
          className="shrink-0 rounded-lg border border-zinc-700 bg-zinc-900/60 px-2 py-1 text-xs font-bold text-zinc-200 hover:bg-zinc-900"
        >
          ✕
        </button>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3">
        <div className="flex flex-nowrap items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="mt-1 whitespace-nowrap text-[34px] font-black leading-none tracking-tight text-red-500 sm:text-[42px]">
              {toMoneyBRL(data.price)}
            </div>
          </div>
          <Link
            href={data.url}
            prefetch
            onClick={() => setOpen(false)}
            className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-xl bg-red-600 px-3 py-3 text-sm font-extrabold tracking-wide text-white shadow-[0_12px_30px_rgba(230,0,18,0.35)] hover:bg-red-500 active:bg-red-700 sm:px-4"
          >
            COMPRAR AGORA
          </Link>
        </div>
      </div>
    </div>
  );

  const panel = (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 18 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, y: 12 }}
      transition={{ type: "spring", stiffness: 520, damping: 36, mass: 0.7 }}
      className={`w-[94vw] max-w-[560px] sm:max-w-[640px] lg:max-w-[740px] ${frame} ${glow} rounded-2xl p-4 sm:p-5`}
    >
      <div className="pointer-events-none absolute -inset-1 rounded-[18px] bg-[radial-gradient(circle_at_30%_20%,rgba(230,0,18,0.28),transparent_60%)]" />
      <div className="relative">
        <div className="grid gap-3 lg:grid-cols-[420px_1fr] lg:items-start">
          {imageBlock}
          {contentBlock}
        </div>
      </div>
    </motion.div>
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-end justify-center p-3 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.button
            aria-label="Fechar popup"
            className="absolute inset-0 bg-black/70"
            onClick={() => setOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <div className="relative w-full max-w-[740px]">
            <motion.div
              className="absolute -inset-2 rounded-[24px] bg-[conic-gradient(from_90deg,rgba(230,0,18,0.0),rgba(230,0,18,0.38),rgba(230,0,18,0.0))]"
              animate={{ opacity: [0.35, 0.55, 0.35] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="relative">{panel}</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
