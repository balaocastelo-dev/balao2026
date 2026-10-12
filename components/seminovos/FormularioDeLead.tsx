"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, MessageCircle } from "lucide-react";
import { ORCAMENTOS, USOS, type Interesse } from "@/lib/seminovos/tipos";
import { linkDoWhatsApp, mensagemDoPedido } from "@/lib/seminovos/whatsapp";
import { trackFormSuccess, trackLeadEvent } from "@/lib/tracking";

interface Props {
  interesse: Interesse;
  /** De que parte da página veio o lead (aparece no painel). */
  bloco: string;
  botao: string;
  mostrarUso?: boolean;
  mostrarOrcamento?: boolean;
  /** Placeholder do campo livre; sem ele, o campo não aparece. */
  campoLivre?: string;
  aparelho?: { id: string; nome: string };
  /** Texto que vai junto no pedido sem o cliente digitar (ex.: o perfil do quiz). */
  anexo?: string;
  usoInicial?: string;
  orcamentoInicial?: string;
  claro?: boolean;
  aoConcluir?: () => void;
}

const formatarFone = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};

function utmDaUrl() {
  try {
    const p = new URLSearchParams(window.location.search);
    const utm: Record<string, string> = {};
    p.forEach((v, k) => {
      if (k.startsWith("utm_")) utm[k] = v.slice(0, 80);
    });
    return Object.keys(utm).length ? utm : undefined;
  } catch {
    return undefined;
  }
}

export default function FormularioDeLead({
  interesse,
  bloco,
  botao,
  mostrarUso,
  mostrarOrcamento,
  campoLivre,
  aparelho,
  anexo,
  usoInicial = "",
  orcamentoInicial = "",
  claro,
  aoConcluir,
}: Props) {
  const id = useId();
  // Quando o formulário apareceu: robô envia em menos de 1,5 s.
  const inicio = useRef(0);
  useEffect(() => {
    inicio.current = Date.now();
  }, []);
  const [nome, setNome] = useState("");
  const [fone, setFone] = useState("");
  const [uso, setUso] = useState(usoInicial);
  const [orcamento, setOrcamento] = useState(orcamentoInicial);
  const [livre, setLivre] = useState("");
  const [isca, setIsca] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [linkFinal, setLinkFinal] = useState<string | null>(null);


  const campo = claro
    ? "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-[15px] text-slate-900 placeholder:text-slate-400 focus:border-[#E60012] focus:outline-none focus:ring-2 focus:ring-[#E60012]/25"
    : "w-full rounded-xl border border-slate-700 bg-[#0c1220] px-4 py-3 text-[15px] text-white placeholder:text-slate-500 focus:border-[#E60012] focus:outline-none focus:ring-2 focus:ring-[#E60012]/30";
  const rotulo = claro ? "block text-sm font-semibold text-slate-700 mb-1.5" : "block text-sm font-semibold text-slate-200 mb-1.5";

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    const digitos = fone.replace(/\D/g, "");
    if (nome.trim().length < 2) return setErro("Diga seu nome.");
    if (digitos.length < 10) return setErro("WhatsApp com DDD, por favor.");

    const preferencias = [livre.trim(), anexo].filter(Boolean).join(" — ");
    const pedido = { nome, interesse, uso: uso || undefined, orcamento: orcamento || undefined, preferencias: preferencias || undefined, aparelhoNome: aparelho?.nome };
    const wa = linkDoWhatsApp(mensagemDoPedido(pedido));

    // Abre o WhatsApp ainda dentro do clique (fora dele o navegador bloqueia).
    // (Sem "noopener" no terceiro argumento: com ele o navegador devolve null
    // mesmo quando abriu, e a página acharia que foi bloqueado.)
    const janela = window.open(wa, "_blank");
    if (janela) janela.opener = null;
    setEnviando(true);
    trackLeadEvent("lead_seminovos", { bloco, interesse, uso, orcamento, aparelho: aparelho?.id });

    fetch("/api/seminovos/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        ...pedido,
        whatsapp: digitos,
        aparelhoId: aparelho?.id,
        site: isca,
        ms: inicio.current ? Date.now() - inicio.current : undefined,
        origem: { pagina: "/seminovos", bloco, utm: utmDaUrl(), referrer: document.referrer || undefined },
      }),
    })
      .then((r) => r.json().catch(() => ({})))
      .then((r: { ok?: boolean; erro?: string }) => {
        if (r && r.ok === false && r.erro) setErro(r.erro);
      })
      .catch(() => {})
      .finally(() => {
        setEnviando(false);
        setLinkFinal(wa);
        trackFormSuccess({ form: "seminovos", bloco });
        aoConcluir?.();
        if (!janela) window.location.href = wa;
      });
  }

  if (linkFinal) {
    return (
      <div role="status" className={`rounded-2xl p-5 ${claro ? "bg-emerald-50 text-slate-800" : "bg-[#0c1220] text-slate-100 border border-slate-700"}`}>
        <p className="flex items-center gap-2 font-bold text-base">
          <Check className="h-5 w-5 text-emerald-500" aria-hidden />
          Pedido recebido, {nome.trim().split(" ")[0]}.
        </p>
        <p className={`mt-1.5 text-sm ${claro ? "text-slate-600" : "text-slate-300"}`}>
          Um vendedor da loja responde no WhatsApp em horário comercial. Se o WhatsApp não abriu, toque abaixo.
        </p>
        <a
          href={linkFinal}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 font-bold text-[#0b2b17] hover:brightness-95"
        >
          <MessageCircle className="h-5 w-5" aria-hidden />
          Abrir conversa no WhatsApp
        </a>
        {erro && <p className="mt-3 text-sm text-red-500">{erro}</p>}
      </div>
    );
  }

  return (
    <form onSubmit={enviar} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${id}-nome`} className={rotulo}>
            Seu nome
          </label>
          <input id={`${id}-nome`} className={campo} autoComplete="given-name" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Como podemos te chamar" />
        </div>
        <div>
          <label htmlFor={`${id}-fone`} className={rotulo}>
            WhatsApp
          </label>
          <input
            id={`${id}-fone`}
            className={campo}
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            value={fone}
            onChange={(e) => setFone(formatarFone(e.target.value))}
            placeholder="(19) 98765-4321"
          />
        </div>
      </div>

      {mostrarUso && (
        <fieldset>
          <legend className={rotulo}>Vai usar para</legend>
          <div className="flex flex-wrap gap-2">
            {USOS.map((u) => (
              <button
                type="button"
                key={u.valor}
                aria-pressed={uso === u.valor}
                onClick={() => setUso(uso === u.valor ? "" : u.valor)}
                className={`rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors ${
                  uso === u.valor
                    ? "border-[#E60012] bg-[#E60012] text-white"
                    : claro
                      ? "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                      : "border-slate-700 bg-[#0c1220] text-slate-200 hover:border-slate-500"
                }`}
              >
                {u.rotulo}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {mostrarOrcamento && (
        <div>
          <label htmlFor={`${id}-orc`} className={rotulo}>
            Quanto quer investir
          </label>
          <select id={`${id}-orc`} className={campo} value={orcamento} onChange={(e) => setOrcamento(e.target.value)}>
            <option value="">Escolha uma faixa</option>
            {ORCAMENTOS.map((o) => (
              <option key={o.valor} value={o.valor}>
                {o.rotulo}
              </option>
            ))}
          </select>
        </div>
      )}

      {campoLivre && (
        <div>
          <label htmlFor={`${id}-livre`} className={rotulo}>
            Detalhes <span className="font-normal opacity-70">(opcional)</span>
          </label>
          <input id={`${id}-livre`} className={campo} value={livre} onChange={(e) => setLivre(e.target.value)} placeholder={campoLivre} maxLength={300} />
        </div>
      )}

      {/* Campo isca: gente não vê, robô preenche. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Site
          <input tabIndex={-1} autoComplete="off" value={isca} onChange={(e) => setIsca(e.target.value)} />
        </label>
      </div>

      {erro && (
        <p role="alert" className="text-sm font-semibold text-red-400">
          {erro}
        </p>
      )}

      <button
        type="submit"
        disabled={enviando}
        className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#E60012] px-6 py-4 text-base font-black text-white shadow-lg shadow-red-950/40 transition-transform hover:bg-red-700 active:scale-[0.98] disabled:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <MessageCircle className="h-5 w-5" aria-hidden />
        {enviando ? "Enviando…" : botao}
      </button>
      <p className={`text-xs ${claro ? "text-slate-500" : "text-slate-400"}`}>
        Usamos seu contato só para responder este pedido. Sem lista de spam.
      </p>
    </form>
  );
}
