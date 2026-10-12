"use client";

// Formulário curto de orçamento (página /servicos-e-ofertas).
// Três campos e um botão. Ao enviar: abre o WhatsApp da loja com a mensagem
// montada (o atendimento acontece lá) e avisa a loja por e-mail em paralelo,
// para o contato não se perder se a pessoa não mandar a mensagem.

import { useState } from "react";
import { CheckCircle2, Loader2, MessageCircle } from "lucide-react";
import { NECESSIDADES, linkDoWhatsApp } from "@/lib/servicos-e-ofertas/conteudo";
import { trackFormAttempt, trackFormError, trackFormSuccess, trackWhatsAppClick } from "@/lib/tracking";

const CAMPO =
  "w-full rounded-xl border border-slate-700 bg-[#0b1120] px-4 py-3 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-[#E60012] focus:ring-2 focus:ring-[#E60012]/30";

const FONTE = "servicos_e_ofertas_formulario";

export default function FormularioDeOrcamento() {
  const [estado, setEstado] = useState<"livre" | "enviando" | "pronto">("livre");
  const [erro, setErro] = useState("");
  const [linkFinal, setLinkFinal] = useState("");

  function enviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro("");
    const dados = new FormData(evento.currentTarget);
    const nome = String(dados.get("nome") || "").trim();
    const whatsapp = String(dados.get("whatsapp") || "").trim();
    const necessidadeId = String(dados.get("necessidade") || "");
    const detalhe = String(dados.get("detalhe") || "").trim();
    const bairro = String(dados.get("bairro") || "").trim();
    const site = String(dados.get("site") || "");

    if (nome.length < 2) return setErro("Escreva o seu nome.");
    const digitos = whatsapp.replace(/\D/g, "");
    if (digitos.length < 10 || digitos.length > 13) return setErro("Escreva o WhatsApp com DDD, ex.: (19) 99999-9999.");

    const necessidade = NECESSIDADES.find((n) => n.id === necessidadeId);
    const partes = [
      necessidade?.mensagem || "Olá! Quero um orçamento.",
      `Meu nome é ${nome}.`,
      detalhe ? `Detalhes: ${detalhe}.` : "",
      bairro ? `Estou em ${bairro}.` : "",
    ].filter(Boolean);
    const link = linkDoWhatsApp(partes.join(" "));

    setEstado("enviando");
    trackFormAttempt({ source: FONTE, service: necessidade?.rotulo });

    // Abre o WhatsApp já, dentro do clique (o navegador bloqueia se for depois).
    window.open(link, "_blank", "noopener,noreferrer");
    trackWhatsAppClick({ source: FONTE, label: necessidade?.rotulo || "Orçamento" });
    setLinkFinal(link);

    fetch("/api/leads/servicos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        nome,
        whatsapp: digitos,
        necessidade: necessidade?.rotulo || "",
        detalhe,
        bairro,
        site,
        origem: window.location.pathname + window.location.search,
      }),
    })
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        trackFormSuccess({ source: FONTE, service: necessidade?.rotulo });
      })
      .catch(() => trackFormError({ source: FONTE, service: necessidade?.rotulo }))
      .finally(() => setEstado("pronto"));
  }

  if (estado === "pronto") {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center" role="status">
        <CheckCircle2 className="h-14 w-14 text-white" aria-hidden />
        <p className="text-2xl font-black text-white">Pedido recebido!</p>
        <p className="max-w-sm text-slate-300">
          Abrimos o WhatsApp da loja com a sua mensagem pronta. É só tocar em enviar. Se ele não abriu, use o botão abaixo.
        </p>
        <a
          href={linkFinal}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-2xl bg-[#E60012] px-6 py-4 font-black text-white shadow-lg shadow-red-950/50 transition hover:bg-red-700 active:scale-95"
        >
          <MessageCircle className="h-5 w-5" aria-hidden />
          Abrir o WhatsApp
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="space-y-3" noValidate>
      <div>
        <label htmlFor="orc-necessidade" className="mb-1 block text-sm font-bold text-slate-200">
          Do que você precisa?
        </label>
        <select id="orc-necessidade" name="necessidade" defaultValue="notebook" className={CAMPO}>
          {NECESSIDADES.map((n) => (
            <option key={n.id} value={n.id}>
              {n.rotulo}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="orc-nome" className="mb-1 block text-sm font-bold text-slate-200">
            Seu nome
          </label>
          <input id="orc-nome" name="nome" autoComplete="given-name" required placeholder="Como podemos te chamar" className={CAMPO} />
        </div>
        <div>
          <label htmlFor="orc-whatsapp" className="mb-1 block text-sm font-bold text-slate-200">
            Seu WhatsApp
          </label>
          <input
            id="orc-whatsapp"
            name="whatsapp"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            required
            placeholder="(19) 99999-9999"
            className={CAMPO}
          />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-[1fr_0.8fr]">
        <div>
          <label htmlFor="orc-detalhe" className="mb-1 block text-sm font-bold text-slate-200">
            Aparelho ou produto <span className="font-normal text-slate-400">(opcional)</span>
          </label>
          <input id="orc-detalhe" name="detalhe" placeholder="Ex.: iPhone 13, tela quebrada" className={CAMPO} />
        </div>
        <div>
          <label htmlFor="orc-bairro" className="mb-1 block text-sm font-bold text-slate-200">
            Bairro ou cidade <span className="font-normal text-slate-400">(opcional)</span>
          </label>
          <input id="orc-bairro" name="bairro" placeholder="Ex.: Taquaral" className={CAMPO} />
        </div>
      </div>
      {/* Campo-armadilha para robôs: fica fora da tela. */}
      <input type="text" name="site" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-0 w-0 opacity-0" />

      {erro && (
        <p className="rounded-xl border border-[#E60012]/50 bg-[#E60012]/10 px-4 py-2 text-sm font-semibold text-white" role="alert">
          {erro}
        </p>
      )}

      <button
        type="submit"
        disabled={estado === "enviando"}
        className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#E60012] px-6 py-4 text-lg font-black text-white shadow-lg shadow-red-950/50 transition hover:bg-red-700 active:scale-95 disabled:opacity-70"
      >
        {estado === "enviando" ? <Loader2 className="h-6 w-6 animate-spin" aria-hidden /> : <MessageCircle className="h-6 w-6" aria-hidden />}
        Receber orçamento no WhatsApp
      </button>
      <p className="text-center text-xs text-slate-400">
        Seus dados vão só para a equipe da loja, para responder este pedido.
      </p>
    </form>
  );
}
