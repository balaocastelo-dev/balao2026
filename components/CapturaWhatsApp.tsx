"use client";

import { useEffect, useState } from "react";

// ============================================================
// Portão de WhatsApp antes do download.
//
// Só o número, de propósito: cada campo a mais afasta mais gente do que traz.
// Com o WhatsApp o vendedor já consegue falar com a pessoa — que é o objetivo
// inteiro. Nome, e-mail e "empresa" viriam de graça depois, na conversa.
//
// Quem já deixou o número uma vez não é perguntado de novo: o navegador lembra.
// Passar pelo portão a cada livro transformaria a isca em pedágio.
// ============================================================

const CHAVE = "balao_contato_whatsapp";

function lembrado(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(CHAVE);
  } catch {
    // Navegador com armazenamento bloqueado: pergunta de novo, sem quebrar.
    return null;
  }
}

function formatarEnquantoDigita(valor: string) {
  const d = valor.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export default function CapturaWhatsApp({
  material,
  titulo,
  link,
  rotuloBotao = "Baixar agora",
  aviso,
  origem = "livros",
}: {
  /** Identificador do material, ex.: "agente-01". */
  material: string;
  /** Nome que aparece na mensagem enviada. */
  titulo: string;
  /** Para onde ir depois de liberar. */
  link: string;
  rotuloBotao?: string;
  /** Texto pequeno abaixo do botão, ex.: tamanho do arquivo. */
  aviso?: string;
  origem?: string;
}) {
  const [numero, setNumero] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [jaLiberado, setJaLiberado] = useState(false);

  useEffect(() => {
    setJaLiberado(Boolean(lembrado()));
  }, []);

  const abrirMaterial = () => {
    window.location.href = link;
  };

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    const digitos = numero.replace(/\D/g, "");
    if (digitos.length < 10) {
      setErro("Falta o DDD — precisa ficar como (19) 98751-0267.");
      return;
    }

    setEnviando(true);
    setErro("");

    try {
      const res = await fetch("/api/captura", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whatsapp: digitos, material, titulo, link, origem }),
      });
      const dados = await res.json();

      if (!res.ok) {
        setErro(dados?.error || "Confira o número e tente de novo.");
        return;
      }

      try {
        localStorage.setItem(CHAVE, digitos);
      } catch {
        // Sem armazenamento, só não lembra na próxima. O download segue.
      }
      abrirMaterial();
    } catch {
      // Rede falhou no cadastro — mas o material foi prometido, então entrega.
      // Cobrar o cadastro de quem está sem internet boa seria só perder a
      // pessoa e não ganhar o contato.
      abrirMaterial();
    } finally {
      setEnviando(false);
    }
  };

  if (jaLiberado) {
    return (
      <div>
        <button
          onClick={abrirMaterial}
          className="w-full rounded-xl bg-red-600 px-5 py-3 font-bold text-white transition hover:bg-red-500"
        >
          {rotuloBotao}
        </button>
        {aviso && <p className="mt-2 text-center text-xs text-white/50">{aviso}</p>}
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="space-y-3">
      <div>
        <label htmlFor={`whats-${material}`} className="mb-1.5 block text-sm font-semibold text-white">
          Seu WhatsApp para receber
        </label>
        <input
          id={`whats-${material}`}
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          value={numero}
          onChange={(e) => setNumero(formatarEnquantoDigita(e.target.value))}
          placeholder="(19) 98751-0267"
          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-white/30 outline-none transition focus:border-red-500"
          aria-describedby={`ajuda-${material}`}
        />
        {/* Campo-armadilha para robô: invisível para gente, irresistível para
            preenchimento automático. */}
        <input
          type="text"
          name="site"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute left-[-9999px] h-0 w-0 opacity-0"
          onChange={() => {}}
        />
      </div>

      {erro && (
        <p role="alert" className="text-sm text-red-400">
          {erro}
        </p>
      )}

      <button
        type="submit"
        disabled={enviando}
        className="w-full rounded-xl bg-red-600 px-5 py-3 font-bold text-white transition hover:bg-red-500 disabled:opacity-60"
      >
        {enviando ? "Liberando…" : rotuloBotao}
      </button>

      <p id={`ajuda-${material}`} className="text-center text-xs leading-relaxed text-white/50">
        {aviso && <span className="block">{aviso}</span>}
        Mandamos o link no seu WhatsApp e avisamos de ofertas de vez em quando.
        É só responder <b>PARAR</b> para não receber mais.
      </p>
    </form>
  );
}
