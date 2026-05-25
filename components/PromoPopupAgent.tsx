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

  const glow = "shadow-[0_0_0_1px_rgba(230,0,18,0.45),0_0_64px_rgba(230,0,18,0.45)]";
  const frame = "bg-zinc-950/90 border border-red-600/70 backdrop-blur-xl";

  const imageBlock = (
    <div className="relative w-full overflow-hidden rounded-2xl border border-zinc-800 bg-white">
      <div className="relative h-[240px] w-full sm:h-[340px] lg:h-[460px]">
        <Image
          src={data.image}
          alt={data.title}
          fill
          loading="lazy"
          sizes="(max-width: 640px) 96vw, (max-width: 1024px) 820px, 980px"
          className="object-cover object-center lg:object-contain"
        />
      </div>
    </div>
  );

  const contentBlock = (
    <div className="flex flex-col gap-4 lg:gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center rounded-full border border-red-500/30 bg-red-600/15 px-3 py-1 text-[12px] font-extrabold tracking-wide text-red-300">
          {data.impactPhrase}
        </div>
        {data.urgency ? (
          <div className="inline-flex items-center rounded-full border border-zinc-700 bg-zinc-900/60 px-3 py-1 text-[12px] font-extrabold tracking-wide text-zinc-100">
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-red-500 shadow-[0_0_18px_rgba(230,0,18,0.8)]" />
            {data.urgency}
          </div>
        ) : null}
        {data.discountPercent > 0 ? (
          <div className="inline-flex items-center rounded-full border border-red-600/40 bg-red-600 px-3 py-1 text-[12px] font-black tracking-wide text-white shadow-[0_10px_30px_rgba(230,0,18,0.35)]">
            -{data.discountPercent}%
          </div>
        ) : null}
      </div>

      <div className="min-w-0">
        <div className="text-[22px] font-black leading-tight tracking-tight text-white sm:text-[26px] lg:text-[30px]">
          {data.headline || data.title}
        </div>
        {data.subline ? (
          <div className="mt-2 text-[13px] font-semibold leading-relaxed text-zinc-300 sm:text-[14px]">
            {data.subline}
          </div>
        ) : null}
        {data.headline ? (
          <div className="mt-2 line-clamp-2 text-[13px] font-semibold leading-relaxed text-zinc-300 sm:text-[14px]">
            {data.title}
          </div>
        ) : null}
      </div>

      {data.specs?.length ? (
        <div className="flex flex-wrap gap-2">
          {data.specs.slice(0, 3).map((s) => (
            <div
              key={s}
              className="rounded-full border border-zinc-800 bg-zinc-950/60 px-3 py-1 text-[12px] font-semibold text-zinc-200"
            >
              {s}
            </div>
          ))}
        </div>
      ) : null}

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
        <div className="flex flex-nowrap items-center justify-between gap-3 lg:flex-col lg:items-stretch lg:justify-start">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-bold">
              {data.oldPrice > data.price ? (
                <span className="whitespace-nowrap text-zinc-500 line-through">{toMoneyBRL(data.oldPrice)}</span>
              ) : null}
              {data.discountPercent > 0 ? (
                <span className="whitespace-nowrap rounded-md bg-red-600/15 px-2 py-1 text-red-200 ring-1 ring-inset ring-red-600/25">
                  -{data.discountPercent}%
                </span>
              ) : null}
            </div>
            <div className="mt-2 whitespace-nowrap text-[38px] font-black leading-none tracking-tight text-red-500 sm:text-[48px] lg:text-[52px]">
              {toMoneyBRL(data.price)}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px] font-semibold text-zinc-300">
              {data.installments?.label ? <span className="whitespace-nowrap">{data.installments.label}</span> : null}
              {data.stock !== null ? (
                <span className="whitespace-nowrap rounded-md bg-zinc-900/70 px-2 py-1 text-zinc-200 ring-1 ring-inset ring-zinc-700">
                  {data.stock > 0 ? `Estoque: ${data.stock}` : "Últimas unidades"}
                </span>
              ) : null}
            </div>
          </div>
          <Link
            href={data.url}
            prefetch
            onClick={() => setOpen(false)}
            className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-2xl bg-red-600 px-5 py-4 text-base font-black tracking-wide text-white shadow-[0_18px_44px_rgba(230,0,18,0.40)] hover:bg-red-500 active:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 lg:mt-3 lg:w-full"
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
      className={`relative w-[96vw] max-w-[720px] md:max-w-[820px] lg:max-w-[980px] ${frame} ${glow} max-h-[88vh] overflow-y-auto rounded-3xl p-4 sm:p-6`}
    >
      <button
        type="button"
        aria-label="Fechar"
        onClick={() => setOpen(false)}
        className="absolute right-3 top-3 z-10 rounded-lg border border-zinc-700 bg-zinc-900/60 px-2 py-1 text-xs font-bold text-zinc-200 hover:bg-zinc-900"
      >
        ✕
      </button>
      <div className="pointer-events-none absolute -inset-1 rounded-[22px] bg-[radial-gradient(circle_at_30%_20%,rgba(230,0,18,0.32),transparent_60%)]" />
      <div className="relative">
        <div className="grid gap-4 lg:grid-cols-[460px_1fr] lg:items-start">
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
          className="fixed inset-0 z-[9999] flex items-center justify-center px-3 py-6 sm:px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.button
            aria-label="Fechar popup"
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <div className="relative w-full max-w-[980px]">
            <motion.div
              className="absolute -inset-2 rounded-[28px] bg-[conic-gradient(from_90deg,rgba(230,0,18,0.0),rgba(230,0,18,0.42),rgba(230,0,18,0.0))]"
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
