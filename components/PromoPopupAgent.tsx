"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { BadgeCheck, ShieldCheck, ShoppingCart, Truck } from "lucide-react";

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
  const frame = "bg-zinc-950/92 border border-zinc-800/80 backdrop-blur-xl";
  const accent = "text-red-500";
  const accentBg = "bg-red-600";

  const imageBlock = (
    <div className="relative w-full overflow-hidden rounded-3xl border border-zinc-800 bg-black">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(230,0,18,0.25),transparent_55%)]" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.10]" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
      <div className="relative h-[270px] w-full sm:h-[360px] lg:h-[520px]">
        <Image
          src={data.image}
          alt={data.title}
          fill
          loading="lazy"
          sizes="(max-width: 640px) 96vw, (max-width: 1024px) 820px, 980px"
          className="object-cover object-center lg:object-contain"
        />
      </div>
      <div className="absolute left-4 top-4 z-10 flex flex-col items-start gap-2">
        <div className="-rotate-[10deg]">
          <div className="inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-[18px] font-black uppercase tracking-wide text-white shadow-[0_18px_40px_rgba(230,0,18,0.35)] sm:text-[22px]">
            Promoção
          </div>
        </div>
        <div className="-rotate-[10deg]">
          <div className="inline-flex items-center rounded-md bg-yellow-400 px-4 py-2 text-[18px] font-black uppercase tracking-wide text-black shadow-[0_18px_40px_rgba(0,0,0,0.35)] sm:text-[22px]">
            Exclusiva!
          </div>
        </div>
      </div>
      <div className="absolute bottom-4 left-4 right-4 z-10 hidden sm:flex items-center justify-between gap-3 rounded-2xl border border-zinc-800/80 bg-black/50 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-3 text-xs font-extrabold text-zinc-100">
          <ShieldCheck className="h-5 w-5 text-red-500" />
          Garantia
        </div>
        <div className="h-6 w-px bg-zinc-800/80" />
        <div className="flex items-center gap-3 text-xs font-extrabold text-zinc-100">
          <Truck className="h-5 w-5 text-red-500" />
          Enviamos para todo o Brasil
        </div>
        <div className="h-6 w-px bg-zinc-800/80" />
        <div className="flex items-center gap-3 text-xs font-extrabold text-zinc-100">
          <BadgeCheck className="h-5 w-5 text-red-500" />
          Compra segura
        </div>
      </div>
    </div>
  );

  const contentBlock = (
    <div className="flex flex-col gap-4 lg:gap-5">
      <div className="flex flex-col gap-2">
        <div className="text-[18px] font-black uppercase tracking-wide text-white sm:text-[20px]">
          {data.headline || data.title}
        </div>
        <div className={`text-[20px] font-black uppercase tracking-wide sm:text-[22px] ${accent}`}>
          BALÃO.INFO
        </div>
        {data.subline ? (
          <div className="text-[12px] font-semibold leading-relaxed text-zinc-300 sm:text-[13px]">{data.subline}</div>
        ) : null}
      </div>

      <div className="rounded-3xl border border-zinc-800 bg-black/40 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-extrabold text-zinc-200">
          {data.oldPrice > data.price ? (
            <span className="whitespace-nowrap text-zinc-400 line-through">{toMoneyBRL(data.oldPrice)}</span>
          ) : null}
          <span className="inline-flex items-center rounded-md bg-yellow-400 px-3 py-1 text-xs font-black uppercase tracking-wide text-black">
            Por apenas
          </span>
        </div>

        <div className={`mt-2 flex flex-wrap items-end gap-x-3 gap-y-1 ${accent}`}>
          <div className="whitespace-nowrap text-[44px] font-black leading-none tracking-tight sm:text-[56px] lg:text-[64px]">
            {toMoneyBRL(data.price)}
          </div>
          <div className="pb-1 text-xs font-black uppercase tracking-wide text-zinc-200">no pix</div>
        </div>

        <div className="mt-3 rounded-2xl border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-[13px] font-bold text-zinc-100">
          {data.installments?.count && data.installments?.amount ? (
            <span className="whitespace-nowrap">
              ou <span className={accent}>{data.installments.count}x</span> de{" "}
              <span className={accent}>{toMoneyBRL(data.installments.amount)}</span>{" "}
              <span className="text-zinc-300">sem juros</span>
            </span>
          ) : data.installments?.label ? (
            <span className="whitespace-nowrap">{data.installments.label}</span>
          ) : null}
        </div>
      </div>

      <div className="rounded-3xl border border-zinc-800 bg-black/40 p-4 sm:p-5">
        <div className={`text-[13px] font-black uppercase tracking-wide ${accent}`}>O que você leva:</div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {(data.specs?.length ? data.specs : [data.title]).slice(0, 8).map((s) => (
            <div key={s} className="flex items-start gap-2 text-[13px] font-semibold text-zinc-100">
              <span className={`mt-[2px] inline-flex h-5 w-5 items-center justify-center rounded-md ${accentBg} text-white`}>
                ✓
              </span>
              <span className="leading-snug">{s}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-zinc-800 bg-zinc-950/60 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-zinc-800 bg-black/50 p-2">
              <ShoppingCart className="h-5 w-5 text-red-500" />
            </div>
            <div className="min-w-0">
              <div className="text-[12px] font-black uppercase tracking-wide text-zinc-100">Pronto para jogar!</div>
              <div className="text-[12px] font-semibold text-zinc-300">{data.urgency || "Oferta por tempo limitado!"}</div>
            </div>
          </div>
        </div>
      </div>

      <Link
        href={data.url}
        prefetch
        onClick={() => setOpen(false)}
        className="inline-flex w-full items-center justify-center gap-3 whitespace-nowrap rounded-2xl bg-red-600 px-6 py-4 text-base font-black uppercase tracking-wide text-white shadow-[0_22px_60px_rgba(230,0,18,0.45)] hover:bg-red-500 active:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
      >
        <ShoppingCart className="h-5 w-5" />
        Comprar agora
      </Link>

      <div className="text-center text-[12px] font-semibold text-zinc-400">
        {data.urgency || "Oferta por tempo limitado!"}
      </div>
    </div>
  );

  const panel = (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 18 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, y: 12 }}
      transition={{ type: "spring", stiffness: 520, damping: 36, mass: 0.7 }}
      className={`relative w-[96vw] max-w-[820px] lg:max-w-[1120px] ${frame} ${glow} max-h-[88vh] overflow-y-auto rounded-[28px] p-4 sm:p-6`}
    >
      <button
        type="button"
        aria-label="Fechar"
        onClick={() => setOpen(false)}
        className="absolute right-4 top-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 bg-black/50 text-sm font-black text-zinc-100 hover:bg-black"
      >
        ✕
      </button>
      <div className="pointer-events-none absolute -inset-1 rounded-[30px] bg-[radial-gradient(circle_at_30%_20%,rgba(230,0,18,0.22),transparent_60%)]" />
      <div className="relative">
        <div className="grid gap-4 lg:grid-cols-[560px_1fr] lg:items-start">
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
          <div className="relative w-full max-w-[1120px]">
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
