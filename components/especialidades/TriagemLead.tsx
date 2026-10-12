"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Database,
  Gamepad2,
  Laptop,
  Lock,
  MessageCircle,
  Smartphone,
  Wrench,
} from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";
import { trackFormAttempt, trackFormError, trackFormSuccess, trackLeadEvent } from "@/lib/tracking";

/**
 * Triagem em dois passos da página /especialidades.
 *
 * Passo 1: o cliente toca no que precisa (um toque, sem digitar — é o que faz
 * a pessoa começar). Passo 2: detalhe, urgência, nome e WhatsApp.
 * Ao enviar, abre o WhatsApp da loja com a mensagem já escrita (a conversa cai
 * no CRM e na JUL.IA) e, ao mesmo tempo, manda o lead por e-mail para a loja —
 * se o cliente fechar o WhatsApp sem mandar, o contato não se perde.
 */

const NECESSIDADES = [
  { id: "conserto", rotulo: "Consertar PC ou notebook", icone: Wrench, dica: "Ex.: não liga, está lento, tela quebrada, esquentando" },
  { id: "apple", rotulo: "iPhone, MacBook ou iPad", icone: Smartphone, dica: "Ex.: troca de tela, bateria, placa, não carrega" },
  { id: "pcgamer", rotulo: "Montar ou comprar PC gamer", icone: Gamepad2, dica: "Ex.: jogos que quer rodar, orçamento aproximado" },
  { id: "notebook", rotulo: "Comprar notebook", icone: Laptop, dica: "Ex.: para estudo, trabalho, edição, jogos" },
  { id: "dados", rotulo: "Recuperar arquivos", icone: Database, dica: "Ex.: HD não reconhece, SSD sumiu, pendrive, celular" },
  { id: "empresa", rotulo: "Atendimento para empresa", icone: Briefcase, dica: "Ex.: computadores, rede, manutenção, sistemas" },
] as const;

const URGENCIAS = ["Hoje", "Nesta semana", "Só pesquisando"] as const;

type Props = {
  /** Identifica a origem no e-mail e nos eventos (ex.: "especialidades-hero"). */
  origem: string;
  titulo?: string;
};

export default function TriagemLead({ origem, titulo = "Triagem rápida: em 30 segundos você fala com o técnico certo" }: Props) {
  const [passo, setPasso] = useState<1 | 2 | 3>(1);
  const [necessidade, setNecessidade] = useState<(typeof NECESSIDADES)[number] | null>(null);
  const [urgencia, setUrgencia] = useState<(typeof URGENCIAS)[number]>("Nesta semana");
  const [linkWhats, setLinkWhats] = useState("");
  const [erro, setErro] = useState("");

  const escolher = (n: (typeof NECESSIDADES)[number]) => {
    setNecessidade(n);
    setPasso(2);
    setErro("");
    trackLeadEvent("triagem_escolha", { source: origem, service: n.rotulo }, 0);
  };

  const enviar = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!necessidade) return;
    const dados = new FormData(event.currentTarget);
    const nome = String(dados.get("nome") || "").trim();
    const whatsapp = String(dados.get("whatsapp") || "").trim();
    const detalhe = String(dados.get("detalhe") || "").trim();
    const honeypot = String(dados.get("site") || "");

    if (nome.length < 2) return setErro("Escreva seu nome.");
    if (whatsapp.replace(/\D/g, "").length < 10) return setErro("Escreva seu WhatsApp com DDD.");

    const mensagem = [
      "Olá! Vim pela página de Especialidades do site.",
      `Preciso de: ${necessidade.rotulo}`,
      detalhe ? `Detalhe: ${detalhe}` : null,
      `Urgência: ${urgencia}`,
      `Meu nome: ${nome}`,
    ]
      .filter(Boolean)
      .join("\n");

    const url = `https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(mensagem)}`;
    setLinkWhats(url);
    setErro("");

    const rastreio = { page_path: "/especialidades", source: origem, service: necessidade.rotulo, urgency: urgencia };
    trackFormAttempt(rastreio);

    // Abre o WhatsApp dentro do clique (senão o navegador bloqueia a janela).
    window.open(url, "_blank", "noopener,noreferrer");

    void fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        name: nome,
        phone: whatsapp,
        message: mensagem,
        subject: `Lead Especialidades - ${necessidade.rotulo} (${urgencia})`,
        source: origem,
        service: necessidade.rotulo,
        urgency: urgencia,
        page: "/especialidades",
        honeypot,
      }),
    })
      .then((r) => (r.ok ? trackFormSuccess(rastreio) : trackFormError(rastreio)))
      .catch(() => trackFormError(rastreio));

    setPasso(3);
  };

  return (
    <div className="relative rounded-[28px] border border-[var(--site-border)] bg-[var(--site-panel-soft)] p-5 shadow-[0_30px_80px_rgba(2,6,23,0.35)] backdrop-blur sm:p-7">
      <div className="mb-5 flex items-center justify-between gap-3">
        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#E60012]">
          {passo === 3 ? "Pronto!" : `Passo ${passo} de 2`}
        </p>
        <div className="flex gap-1.5" aria-hidden>
          {[1, 2].map((n) => (
            <span key={n} className={`h-1.5 w-8 rounded-full ${passo >= n ? "bg-[#E60012]" : "bg-[var(--site-border)]"}`} />
          ))}
        </div>
      </div>

      {passo === 1 && (
        <>
          <h2 className="text-xl font-black leading-tight text-[var(--site-text)] sm:text-2xl">{titulo}</h2>
          <p className="mt-2 text-sm text-[var(--site-muted)]">Toque no que você precisa:</p>
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            {NECESSIDADES.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => escolher(n)}
                className="group flex min-h-[84px] flex-col items-start justify-between gap-2 rounded-2xl border border-[var(--site-border)] bg-[var(--site-panel-muted)] p-3 text-left transition-all hover:-translate-y-0.5 hover:border-[#E60012] hover:bg-[#E60012]/10 active:scale-[0.98]"
              >
                <n.icone className="h-5 w-5 text-[#E60012]" />
                <span className="text-[13px] font-extrabold leading-snug text-[var(--site-text)] sm:text-sm">{n.rotulo}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {passo === 2 && necessidade && (
        <form onSubmit={enviar} className="space-y-3.5" noValidate>
          <button
            type="button"
            onClick={() => setPasso(1)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--site-muted)] hover:text-[#E60012]"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Trocar
          </button>
          <div className="flex items-center gap-3 rounded-2xl border border-[#E60012]/40 bg-[#E60012]/10 p-3">
            <necessidade.icone className="h-5 w-5 shrink-0 text-[#E60012]" />
            <span className="text-sm font-extrabold text-[var(--site-text)]">{necessidade.rotulo}</span>
          </div>

          <label className="block">
            <span className="mb-1 block text-xs font-bold text-[var(--site-soft)]">Conte em uma frase (opcional)</span>
            <textarea
              name="detalhe"
              rows={2}
              maxLength={400}
              placeholder={necessidade.dica}
              className="w-full resize-none rounded-xl border border-[var(--site-border)] bg-[var(--site-panel-muted)] px-3.5 py-2.5 text-sm text-[var(--site-text)] placeholder:text-[var(--site-muted)] focus:border-[#E60012] focus:outline-none"
            />
          </label>

          <fieldset>
            <legend className="mb-1 block text-xs font-bold text-[var(--site-soft)]">Para quando?</legend>
            <div className="grid grid-cols-3 gap-2">
              {URGENCIAS.map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUrgencia(u)}
                  aria-pressed={urgencia === u}
                  className={`rounded-xl border px-2 py-2 text-xs font-extrabold transition-colors ${
                    urgencia === u
                      ? "border-[#E60012] bg-[#E60012] text-white"
                      : "border-[var(--site-border)] bg-[var(--site-panel-muted)] text-[var(--site-soft)] hover:border-[#E60012]"
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-bold text-[var(--site-soft)]">Seu nome</span>
              <input
                name="nome"
                autoComplete="given-name"
                required
                maxLength={80}
                className="w-full rounded-xl border border-[var(--site-border)] bg-[var(--site-panel-muted)] px-3.5 py-2.5 text-sm text-[var(--site-text)] focus:border-[#E60012] focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-bold text-[var(--site-soft)]">WhatsApp com DDD</span>
              <input
                name="whatsapp"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                required
                maxLength={20}
                placeholder="(19) 9 0000-0000"
                className="w-full rounded-xl border border-[var(--site-border)] bg-[var(--site-panel-muted)] px-3.5 py-2.5 text-sm text-[var(--site-text)] placeholder:text-[var(--site-muted)] focus:border-[#E60012] focus:outline-none"
              />
            </label>
          </div>
          {/* Robôs preenchem; gente não vê. */}
          <input type="text" name="site" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

          {erro && <p className="text-sm font-bold text-[#ff4d5e]">{erro}</p>}

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#E60012] px-6 py-4 text-base font-black text-white shadow-lg shadow-red-950/40 transition-all hover:bg-red-700 active:scale-[0.98]"
          >
            <MessageCircle className="h-5 w-5" /> Falar com o técnico no WhatsApp <ArrowRight className="h-5 w-5" />
          </button>
          <p className="flex items-center justify-center gap-1.5 text-[11px] text-[var(--site-muted)]">
            <Lock className="h-3 w-3" /> Seus dados só são usados para responder você. Sem spam.
          </p>
        </form>
      )}

      {passo === 3 && (
        <div className="space-y-4 py-4 text-center">
          <CheckCircle2 className="mx-auto h-14 w-14 text-[#E60012]" />
          <h2 className="text-2xl font-black text-[var(--site-text)]">Recebemos seu pedido</h2>
          <p className="text-sm text-[var(--site-soft)]">
            Abrimos o WhatsApp da loja com a sua mensagem pronta. É só tocar em <strong>enviar</strong> lá. Em horário
            comercial a resposta é rápida; fora dele, respondemos na abertura da loja.
          </p>
          <a
            href={linkWhats}
            target="_blank"
            rel="noopener noreferrer"
            data-conversion-source={origem}
            data-conversion-label="triagem-reabrir"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#E60012] px-6 py-3 text-sm font-black text-white hover:bg-red-700"
          >
            <MessageCircle className="h-5 w-5" /> O WhatsApp não abriu? Toque aqui
          </a>
        </div>
      )}
    </div>
  );
}
