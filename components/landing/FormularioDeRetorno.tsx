"use client";

// "Pedir retorno rápido": nome, WhatsApp e os campos da página.
// Reaproveita a rota de lead que já existe (/api/leads/servicos): o
// atendimento segue no WhatsApp e a loja recebe o contato por e-mail
// se a pessoa fechar a conversa sem enviar.

import { useState } from "react";
import { CheckCircle2, Loader2, MessageCircle } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";
import { trackFormAttempt, trackFormError, trackFormSuccess, trackWhatsAppClick } from "@/lib/tracking";

const CAMPO =
  "w-full rounded-xl border border-[var(--cpt-fio)] bg-[#0b1120] px-4 py-3 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-[var(--cpt-vermelho)]";

export type CampoDeRetorno = {
  nome: string;
  rotulo: string;
  opcoes?: string[];
  valor?: string;
};

export default function FormularioDeRetorno({
  origem,
  assunto,
  mensagem,
  campos,
}: {
  origem: string;
  assunto: string;
  mensagem: string;
  campos: CampoDeRetorno[];
}) {
  const [estado, setEstado] = useState<"livre" | "enviando" | "pronto">("livre");
  const [erro, setErro] = useState("");
  const [linkFinal, setLinkFinal] = useState("");
  const fonte = `retorno_${origem.replaceAll("/", "_")}`;

  function enviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro("");
    const dados = new FormData(evento.currentTarget);
    const nome = String(dados.get("nome") || "").trim();
    const whatsapp = String(dados.get("whatsapp") || "").trim();
    const site = String(dados.get("site") || "");
    const digitos = whatsapp.replace(/\D/g, "");

    if (nome.length < 2) return setErro("Escreva o seu nome.");
    if (digitos.length < 10 || digitos.length > 13) return setErro("Escreva o WhatsApp com DDD.");

    const linhas = campos
      .map((campo) => {
        const valor = String(dados.get(campo.nome) || "").trim();
        return valor ? `${campo.rotulo}: ${valor}` : "";
      })
      .filter(Boolean);

    const texto = [`${mensagem}`, `Nome: ${nome}.`, ...linhas].join("\n");
    const link = `https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(texto)}`;

    setEstado("enviando");
    trackFormAttempt({ page_path: `/${origem}`, source: fonte, service: assunto });
    window.open(link, "_blank", "noopener,noreferrer");
    trackWhatsAppClick({ page_path: `/${origem}`, source: fonte, label: assunto });
    setLinkFinal(link);

    fetch("/api/leads/servicos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        nome,
        whatsapp: digitos,
        necessidade: assunto,
        detalhe: linhas.join("\n"),
        site,
        origem: `/${origem}`,
      }),
    })
      .then((resposta) => {
        if (!resposta.ok) throw new Error(String(resposta.status));
        trackFormSuccess({ page_path: `/${origem}`, source: fonte, service: assunto });
      })
      .catch(() => trackFormError({ page_path: `/${origem}`, source: fonte, service: assunto }))
      .finally(() => setEstado("pronto"));
  }

  if (estado === "pronto") {
    return (
      <div className="flex flex-col items-start gap-4" role="status">
        <CheckCircle2 className="h-10 w-10 text-white" aria-hidden />
        <p className="text-xl font-bold text-white">Pedido recebido.</p>
        <p className="cpt-corpo">
          Abrimos o WhatsApp da loja com a sua mensagem. Se a janela não abriu, use o botão. A equipe também fica com o seu número para retorno.
        </p>
        <a href={linkFinal} target="_blank" rel="noopener noreferrer" className="cpt-botao cpt-botao--acao">
          <MessageCircle className="h-5 w-5" aria-hidden />
          Abrir o WhatsApp
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="grid gap-4 sm:grid-cols-2" noValidate>
      <div>
        <label htmlFor={`${origem}-nome`} className="mb-1.5 block text-sm font-bold text-white">
          Nome
        </label>
        <input id={`${origem}-nome`} name="nome" autoComplete="given-name" required placeholder="Como podemos te chamar" className={CAMPO} />
      </div>
      <div>
        <label htmlFor={`${origem}-whatsapp`} className="mb-1.5 block text-sm font-bold text-white">
          WhatsApp
        </label>
        <input id={`${origem}-whatsapp`} name="whatsapp" inputMode="tel" autoComplete="tel" required placeholder="(19) 99999-9999" className={CAMPO} />
      </div>
      {campos.map((campo) => (
        <div key={campo.nome} className={campo.opcoes ? "" : "sm:col-span-2"}>
          <label htmlFor={`${origem}-${campo.nome}`} className="mb-1.5 block text-sm font-bold text-white">
            {campo.rotulo}
          </label>
          {campo.opcoes ? (
            <select id={`${origem}-${campo.nome}`} name={campo.nome} defaultValue={campo.valor || campo.opcoes[0]} className={CAMPO}>
              {campo.opcoes.map((opcao) => (
                <option key={opcao} value={opcao}>
                  {opcao}
                </option>
              ))}
            </select>
          ) : (
            <input
              id={`${origem}-${campo.nome}`}
              name={campo.nome}
              defaultValue={campo.valor}
              className={CAMPO}
            />
          )}
        </div>
      ))}
      <input name="site" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden defaultValue="" />
      {erro ? (
        <p className="sm:col-span-2 text-sm font-semibold text-[var(--cpt-vermelho)]" role="alert">
          {erro}
        </p>
      ) : null}
      <div className="sm:col-span-2">
        <button type="submit" className="cpt-botao cpt-botao--acao" disabled={estado === "enviando"}>
          {estado === "enviando" ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : <MessageCircle className="h-5 w-5" aria-hidden />}
          Pedir retorno rápido
        </button>
      </div>
    </form>
  );
}
