"use client";

import { useEffect, useState } from "react";
import type { PonteComando, ModuloComando } from "./tipos";
import PainelOperacao from "./PainelOperacao";
import Clientes from "./Clientes";
import Ajustes from "./Ajustes";
import Equipe from "./Equipe";
import Catalogo from "./Catalogo";
import Agente from "./Agente";

// Centro de Comando: a tela de gestão da operação, ao lado do atendimento.
//
// Fica num módulo próprio de propósito. O arquivo do atendimento já tem mais
// de 5 mil linhas, e foi empilhar mais coisa nele que derrubou a tela esta
// semana. Aqui o atendimento não é tocado: se algo quebrar neste módulo, a
// loja continua conversando com o cliente.

const MODULOS: { chave: ModuloComando; rotulo: string; icone: string; ajuda: string }[] = [
  { chave: "painel", rotulo: "Painel", icone: "📊", ajuda: "Números da operação" },
  { chave: "clientes", rotulo: "Clientes", icone: "👥", ajuda: "Base, segmentos e fichas" },
  { chave: "agente", rotulo: "JUL.IA", icone: "🤖", ajuda: "Vendedora digital: liga, desliga e acompanha" },
  { chave: "catalogo", rotulo: "Catálogo", icone: "🏷️", ajuda: "Preço, custo e descrição dos produtos" },
  { chave: "equipe", rotulo: "Equipe", icone: "🧑‍💼", ajuda: "Vendedores, PIN e assinatura" },
  { chave: "ajustes", rotulo: "Ajustes", icone: "⚙️", ajuda: "Respostas rápidas e etiquetas" },
];

export default function CentroDeComando({
  ponte,
  aoFechar,
  moduloInicial = "painel",
}: {
  ponte: PonteComando;
  aoFechar: () => void;
  moduloInicial?: ModuloComando;
}) {
  const [modulo, setModulo] = useState<ModuloComando>(moduloInicial);
  const [segmento, setSegmento] = useState<string>("");

  // Esc fecha, como em qualquer tela sobreposta.
  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") aoFechar();
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [aoFechar]);

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-[#f0f2f5]">
      <header className="flex shrink-0 flex-wrap items-center gap-2 border-b border-[#e3e3e3] bg-white px-3 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))] md:px-4">
        <div className="mr-auto flex items-center gap-2 md:mr-2">
          <span className="text-lg">🎈</span>
          <span className="text-sm font-bold text-[#202124]">Centro de Comando</span>
        </div>

        <nav className="order-last flex w-full gap-1 overflow-x-auto [scrollbar-width:none] md:order-none md:w-auto md:flex-1 md:flex-wrap">
          {MODULOS.map((m) => (
            <button
              key={m.chave}
              type="button"
              onClick={() => {
                setModulo(m.chave);
                if (m.chave !== "clientes") setSegmento("");
              }}
              title={m.ajuda}
              className={`shrink-0 cursor-pointer whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                modulo === m.chave
                  ? "bg-[#0f9d58] text-white"
                  : "text-[#5f6368] hover:bg-[#f0f2f5]"
              }`}
            >
              <span className="mr-1">{m.icone}</span>
              {m.rotulo}
            </button>
          ))}
        </nav>

        <button
          type="button"
          onClick={aoFechar}
          className="cursor-pointer rounded-lg border border-[#e3e3e3] px-3 py-1.5 text-xs font-bold text-[#5f6368] hover:bg-[#f0f2f5]"
        >
          ← Voltar<span className="hidden sm:inline"> ao atendimento</span>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:p-4">
        <div className="mx-auto max-w-6xl">
          {modulo === "painel" && (
            <PainelOperacao
              ponte={ponte}
              aoEscolherSegmento={(chave) => {
                setSegmento(chave);
                setModulo("clientes");
              }}
            />
          )}
          {modulo === "clientes" && <Clientes ponte={ponte} segmentoInicial={segmento} />}
          {modulo === "agente" && <Agente ponte={ponte} />}
          {modulo === "catalogo" && <Catalogo />}
          {modulo === "equipe" && <Equipe ponte={ponte} />}
          {modulo === "ajustes" && <Ajustes ponte={ponte} />}
        </div>
      </main>
    </div>
  );
}
