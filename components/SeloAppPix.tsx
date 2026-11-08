"use client";

import { useEhApp } from "@/lib/useEhApp";
import { lerReais, comDescontoApp, formatarReais, DESCONTO_APP_PIX } from "@/lib/app-balao";

// Callout do preço com 15% a mais de desconto no Pix, que só aparece dentro do
// app do Balão. Fora do app não renderiza nada (retorna null), então a página
// do produto continua idêntica no navegador.
export default function SeloAppPix({ price }: { price?: string | null }) {
  const ehApp = useEhApp();
  if (!ehApp || !price) return null;

  const precoApp = comDescontoApp(lerReais(price), true);
  if (!(precoApp > 0)) return null;

  const pct = Math.round(DESCONTO_APP_PIX * 100);

  return (
    <div className="mt-3 rounded-xl border border-[#E60012]/40 bg-[#E60012]/10 p-3">
      <span className="text-xs font-black uppercase tracking-wider text-[#E60012]">
        📱 No app · -{pct}% extra no Pix
      </span>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-2xl font-black text-[#E60012]">{formatarReais(precoApp)}</span>
        <span className="text-sm text-[var(--site-muted)] line-through">{price}</span>
      </div>
      <p className="mt-0.5 text-xs text-[var(--site-soft)]">
        Desconto aplicado no pagamento via Pix pelo app.
      </p>
    </div>
  );
}
