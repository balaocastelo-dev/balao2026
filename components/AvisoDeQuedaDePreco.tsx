"use client";

import { useState } from "react";
import { Bell, CheckCircle2, Loader2 } from "lucide-react";
import { trackFormAttempt, trackFormError, trackFormSuccess } from "@/lib/tracking";

// ============================================================
// "Me avise se baixar" (página do produto). O cliente deixa o WhatsApp e,
// quando o preço baixar, a loja manda um aviso único pela linha do CRM.
// Regras e envio em lib/avisos-de-preco/.
// ============================================================

type Estado = "fechado" | "aberto" | "enviando" | "pronto";

export default function AvisoDeQuedaDePreco({ produtoId, produtoNome }: { produtoId: string; produtoNome: string }) {
  const [estado, setEstado] = useState<Estado>("fechado");
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [consentimento, setConsentimento] = useState(false);
  const [armadilha, setArmadilha] = useState("");
  const [erro, setErro] = useState("");

  const rastreio = { source: "aviso-de-preco", product_name: produtoNome, page_path: typeof window !== "undefined" ? window.location.pathname : undefined };

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    if (!consentimento) {
      setErro("Marque a autorização para receber o aviso.");
      return;
    }
    setEstado("enviando");
    trackFormAttempt(rastreio);
    try {
      const r = await fetch("/api/avisos-de-preco", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ produto: produtoId, nome, whatsapp, consentimento, origem: "pagina-do-produto", site: armadilha }),
      });
      const j = (await r.json().catch(() => ({}))) as { ok?: boolean; erro?: string };
      if (!r.ok || !j.ok) throw new Error(j.erro || "Não consegui guardar agora. Tente de novo.");
      trackFormSuccess(rastreio);
      setEstado("pronto");
    } catch (falha) {
      trackFormError(rastreio);
      setErro((falha as Error).message);
      setEstado("aberto");
    }
  };

  if (estado === "pronto") {
    return (
      <div role="status" className="mt-3 flex items-start gap-2 rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800">
        <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
        <span>
          Combinado! Se o preço baixar, a gente te avisa no WhatsApp. É um aviso só, sem lista de propaganda.
        </span>
      </div>
    );
  }

  if (estado === "fechado") {
    return (
      <button
        type="button"
        onClick={() => setEstado("aberto")}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-[var(--site-border)] py-2.5 text-sm font-semibold text-[var(--site-soft)] transition hover:border-[#E60012] hover:text-[#E60012]"
      >
        <Bell size={16} />
        Me avise no WhatsApp se o preço baixar
      </button>
    );
  }

  return (
    <form onSubmit={enviar} className="relative mt-3 space-y-2.5 rounded-xl border border-[var(--site-border)] bg-[var(--site-panel-soft)] p-3.5 text-left">
      <p className="flex items-center gap-1.5 text-sm font-bold text-[var(--site-text)]">
        <Bell size={16} className="text-[#E60012]" /> Aviso de queda de preço
      </p>
      <p className="text-xs leading-relaxed text-[var(--site-soft)]">
        Deixe seu WhatsApp e avisamos <strong>uma vez</strong> se este produto baixar de preço.
      </p>
      <input
        type="text"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Seu nome (opcional)"
        autoComplete="given-name"
        maxLength={80}
        className="w-full rounded-md border border-[var(--site-border)] bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#E60012]"
      />
      <input
        type="tel"
        inputMode="tel"
        required
        value={whatsapp}
        onChange={(e) => setWhatsapp(e.target.value)}
        placeholder="WhatsApp com DDD"
        autoComplete="tel-national"
        maxLength={20}
        className="w-full rounded-md border border-[var(--site-border)] bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#E60012]"
      />
      {/* Armadilha para robô: escondida de quem usa o site. */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={armadilha}
        onChange={(e) => setArmadilha(e.target.value)}
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />
      <label className="flex items-start gap-2 text-xs leading-relaxed text-[var(--site-soft)]">
        <input
          type="checkbox"
          checked={consentimento}
          onChange={(e) => setConsentimento(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-[#E60012]"
        />
        Autorizo a Balão da Informática a me mandar um aviso no WhatsApp quando o preço deste produto baixar.
      </label>
      {erro && <p className="text-xs font-semibold text-red-600">{erro}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={estado === "enviando"}
          className="flex flex-1 items-center justify-center gap-2 rounded-md bg-[#E60012] py-2.5 text-sm font-bold text-white transition hover:bg-[#c4000f] disabled:opacity-60"
        >
          {estado === "enviando" ? <Loader2 size={16} className="animate-spin" /> : <Bell size={16} />}
          Quero o aviso
        </button>
        <button
          type="button"
          onClick={() => setEstado("fechado")}
          className="rounded-md px-3 text-xs font-semibold text-[var(--site-soft)] hover:text-[var(--site-text)]"
        >
          Fechar
        </button>
      </div>
    </form>
  );
}
