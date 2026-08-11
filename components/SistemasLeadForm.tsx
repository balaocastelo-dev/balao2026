"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { MessageCircle, Send, ShieldCheck } from "lucide-react";

type LeadPayload = {
  name: string;
  email: string;
  phone: string;
  company?: string;
  uf?: string;
  budget?: string;
  systemType?: string;
  message: string;
  honeypot?: string;
  page: string;
  variant: string;
  utm?: Record<string, string>;
};

function normalizePhone(input: string) {
  return input.replace(/[^\d]/g, "");
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function getUtm(searchParams: URLSearchParams) {
  const keys = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
  ];
  const utm: Record<string, string> = {};
  for (const k of keys) {
    const v = searchParams.get(k);
    if (v) utm[k] = v;
  }
  return Object.keys(utm).length ? utm : undefined;
}

function getOrCreateVariant(searchParams: URLSearchParams) {
  const forced = searchParams.get("ab");
  if (forced === "a" || forced === "b") return forced;

  const key = "sistemas_ab_variant";
  try {
    const existing = localStorage.getItem(key);
    if (existing === "a" || existing === "b") return existing;
    const chosen = Math.random() < 0.5 ? "a" : "b";
    localStorage.setItem(key, chosen);
    return chosen;
  } catch {
    return "a";
  }
}

function fireTracking(event: string, payload: Record<string, any>) {
  if (typeof window === "undefined") return;

  const dataLayer = (window as any).dataLayer;
  if (Array.isArray(dataLayer)) {
    dataLayer.push({ event, ...payload });
  }

  const gtag = (window as any).gtag;
  if (typeof gtag === "function") {
    gtag("event", event, payload);
  }

  const fbq = (window as any).fbq;
  if (typeof fbq === "function") {
    fbq("trackCustom", event, payload);
  }
}

export default function SistemasLeadForm() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const utm = useMemo(() => getUtm(searchParams), [searchParams]);
  const [variant, setVariant] = useState("a");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    uf: "",
    budget: "",
    systemType: "",
    message: "",
    honeypot: "",
  });

  useEffect(() => {
    setVariant(getOrCreateVariant(searchParams));
  }, [searchParams]);

  useEffect(() => {
    fireTracking("sistemas_view", {
      page: pathname,
      variant,
      utm,
    });
  }, [pathname, variant, utm]);

  const ctaLabel =
    variant === "b" ? "Quero meu orçamento em 15 min" : "Solicitar orçamento";

  const whatsappText = encodeURIComponent(
    `Olá! Quero orçamento para criação de site/sistema (a partir de R$ 2.999). Seguem dados:\n` +
      `Nome: ${form.name || "-"}\n` +
      `Empresa: ${form.company || "-"}\n` +
      `Telefone: ${form.phone || "-"}\n` +
      `UF: ${form.uf || "-"}\n` +
      `Tipo: ${form.systemType || "-"}\n` +
      `Mensagem: ${form.message || "-"}`
  );

  const whatsappLink = `https://wa.me/5519987510267?text=${whatsappText}`;

  function setField<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): string | null {
    const name = form.name.trim();
    const email = form.email.trim();
    const phoneDigits = normalizePhone(form.phone);
    const message = form.message.trim();

    if (form.honeypot.trim()) return "Falha de validação.";
    if (name.length < 2) return "Informe seu nome.";
    if (!isValidEmail(email)) return "Informe um e-mail válido.";
    if (phoneDigits.length < 10) return "Informe um telefone/WhatsApp válido.";
    if (message.length < 10) return "Descreva o que você precisa (mínimo 10 caracteres).";
    if (message.length > 2000) return "Mensagem muito longa (máximo 2000 caracteres).";
    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const validationError = validate();
    if (validationError) {
      setStatus("error");
      setError(validationError);
      return;
    }

    setStatus("sending");
    fireTracking("sistemas_lead_submit_attempt", { page: pathname, variant, utm });

    const payload: LeadPayload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: normalizePhone(form.phone),
      company: form.company.trim() || undefined,
      uf: form.uf.trim() || undefined,
      budget: form.budget || undefined,
      systemType: form.systemType || undefined,
      message: form.message.trim(),
      honeypot: form.honeypot,
      page: pathname,
      variant,
      utm,
    };

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Não foi possível enviar. Tente novamente.");
      }

      setStatus("success");
      fireTracking("sistemas_lead_submit_success", { page: pathname, variant, utm });
      setForm({
        name: "",
        email: "",
        phone: "",
        company: "",
        uf: "",
        budget: "",
        systemType: "",
        message: "",
        honeypot: "",
      });
    } catch (err: any) {
      setStatus("error");
      setError(err?.message || "Erro ao enviar.");
      fireTracking("sistemas_lead_submit_error", { page: pathname, variant, utm });
    }
  }

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 md:p-8">
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="text-xs font-black uppercase tracking-widest text-white/70">
            Orçamento a partir de
          </div>
          <div className="text-3xl md:text-4xl font-black mt-1">
            R$ 2.999,00
          </div>
          <div className="text-zinc-400 mt-2 leading-relaxed">
            Envie os detalhes e receba uma proposta clara (escopo, prazo e etapas).
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white/70">
          <ShieldCheck className="h-4 w-4 text-green-400" />
          Sigilo e segurança
        </div>
      </div>

      <form className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={onSubmit}>
        <input
          value={form.honeypot}
          onChange={(e) => setField("honeypot", e.target.value)}
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
        />

        <div className="md:col-span-1">
          <label className="text-sm font-bold text-white/80">Nome</label>
          <input
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
            className="mt-2 w-full rounded-2xl bg-black border border-zinc-800 px-4 py-3 text-white outline-none focus:border-fuchsia-500/60"
            placeholder="Seu nome"
            autoComplete="name"
          />
        </div>

        <div className="md:col-span-1">
          <label className="text-sm font-bold text-white/80">E-mail</label>
          <input
            value={form.email}
            onChange={(e) => setField("email", e.target.value)}
            className="mt-2 w-full rounded-2xl bg-black border border-zinc-800 px-4 py-3 text-white outline-none focus:border-fuchsia-500/60"
            placeholder="voce@empresa.com"
            autoComplete="email"
            inputMode="email"
          />
        </div>

        <div className="md:col-span-1">
          <label className="text-sm font-bold text-white/80">WhatsApp</label>
          <input
            value={form.phone}
            onChange={(e) => setField("phone", e.target.value)}
            className="mt-2 w-full rounded-2xl bg-black border border-zinc-800 px-4 py-3 text-white outline-none focus:border-fuchsia-500/60"
            placeholder="(DDD) 9xxxx-xxxx"
            autoComplete="tel"
            inputMode="tel"
          />
        </div>

        <div className="md:col-span-1">
          <label className="text-sm font-bold text-white/80">Empresa (opcional)</label>
          <input
            value={form.company}
            onChange={(e) => setField("company", e.target.value)}
            className="mt-2 w-full rounded-2xl bg-black border border-zinc-800 px-4 py-3 text-white outline-none focus:border-fuchsia-500/60"
            placeholder="Nome da empresa"
            autoComplete="organization"
          />
        </div>

        <div className="md:col-span-1">
          <label className="text-sm font-bold text-white/80">UF</label>
          <select
            value={form.uf}
            onChange={(e) => setField("uf", e.target.value)}
            className="mt-2 w-full rounded-2xl bg-black border border-zinc-800 px-4 py-3 text-white outline-none focus:border-fuchsia-500/60"
          >
            <option value="">Selecione</option>
            {[
              "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
            ].map((uf) => (
              <option key={uf} value={uf}>
                {uf}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-1">
          <label className="text-sm font-bold text-white/80">Tipo</label>
          <select
            value={form.systemType}
            onChange={(e) => setField("systemType", e.target.value)}
            className="mt-2 w-full rounded-2xl bg-black border border-zinc-800 px-4 py-3 text-white outline-none focus:border-fuchsia-500/60"
          >
            <option value="">Selecione</option>
            <option value="site-institucional">Site institucional</option>
            <option value="landing-page">Landing page</option>
            <option value="ecommerce">E-commerce</option>
            <option value="gestao">Sistema de gestão</option>
            <option value="portal">Portal corporativo</option>
            <option value="integracoes">Integrações / APIs</option>
            <option value="outro">Outro</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="text-sm font-bold text-white/80">Orçamento (opcional)</label>
          <select
            value={form.budget}
            onChange={(e) => setField("budget", e.target.value)}
            className="mt-2 w-full rounded-2xl bg-black border border-zinc-800 px-4 py-3 text-white outline-none focus:border-fuchsia-500/60"
          >
            <option value="">Prefiro conversar</option>
            <option value="2999-4999">R$ 2.999 – R$ 4.999</option>
            <option value="5000-9999">R$ 5.000 – R$ 9.999</option>
            <option value="10000-19999">R$ 10.000 – R$ 19.999</option>
            <option value="20000+">R$ 20.000+</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="text-sm font-bold text-white/80">O que você precisa?</label>
          <textarea
            value={form.message}
            onChange={(e) => setField("message", e.target.value)}
            className="mt-2 w-full min-h-[140px] rounded-2xl bg-black border border-zinc-800 px-4 py-3 text-white outline-none focus:border-fuchsia-500/60"
            placeholder="Ex.: objetivo do site/sistema, páginas, integrações, prazo, referências…"
          />
        </div>

        {status === "error" && (
          <div className="md:col-span-2 bg-red-500/10 border border-red-500/30 text-red-200 rounded-2xl p-4 font-bold">
            {error}
          </div>
        )}

        {status === "success" && (
          <div className="md:col-span-2 bg-green-500/10 border border-green-500/30 text-green-200 rounded-2xl p-4 font-bold">
            Recebemos sua solicitação. Em breve entraremos em contato.
          </div>
        )}

        <div className="md:col-span-2 flex flex-col md:flex-row gap-3 mt-2">
          <button
            type="submit"
            disabled={status === "sending"}
            className="inline-flex items-center justify-center gap-3 bg-white text-black px-8 py-4 rounded-full font-black text-lg hover:bg-zinc-200 transition-colors disabled:opacity-60"
          >
            <Send className="h-5 w-5" />
            {status === "sending" ? "Enviando..." : ctaLabel}
          </button>

          <a
            href={whatsappLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#128C7E] text-white px-8 py-4 rounded-full font-black text-lg transition-colors"
          >
            <MessageCircle className="h-6 w-6" />
            Chamar no WhatsApp
          </a>
        </div>

        <div className="md:col-span-2 text-xs text-zinc-500 leading-relaxed mt-2">
          Ao enviar, você concorda em ser contatado para este orçamento. Você pode pedir remoção a qualquer momento.
        </div>
      </form>
    </div>
  );
}

