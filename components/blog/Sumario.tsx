"use client";

import { useEffect, useState } from "react";
import type { ItemDoSumario } from "@/lib/blog/tipos";

/**
 * O sumário do artigo. No computador fica fixo ao lado do texto e marca a
 * seção que está na tela; no celular é uma caixa que abre e fecha, no topo.
 * Os itens saem dos títulos do próprio artigo — ninguém escreve sumário à mão.
 */

function useSecaoAtiva(ids: string[]): string | null {
  const [ativa, setAtiva] = useState<string | null>(ids[0] ?? null);

  useEffect(() => {
    const elementos = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);
    if (elementos.length === 0) return;

    let quadro = 0;
    const medir = () => {
      quadro = 0;
      // A seção ativa é a última cujo título já passou do terço de cima da tela.
      const linha = window.innerHeight * 0.3;
      let atual = elementos[0].id;
      for (const el of elementos) {
        if (el.getBoundingClientRect().top <= linha) atual = el.id;
        else break;
      }
      setAtiva(atual);
    };
    const aoRolar = () => {
      if (!quadro) quadro = window.requestAnimationFrame(medir);
    };

    medir();
    window.addEventListener("scroll", aoRolar, { passive: true });
    window.addEventListener("resize", aoRolar);
    return () => {
      window.removeEventListener("scroll", aoRolar);
      window.removeEventListener("resize", aoRolar);
      if (quadro) window.cancelAnimationFrame(quadro);
    };
  }, [ids]);

  return ativa;
}

function Itens({ itens, ativa, aoClicar }: { itens: ItemDoSumario[]; ativa: string | null; aoClicar?: () => void }) {
  return (
    <ol className="b-sumario">
      {itens.map((item) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            data-nivel={item.nivel}
            aria-current={ativa === item.id ? "true" : undefined}
            onClick={aoClicar}
          >
            {item.texto}
          </a>
        </li>
      ))}
    </ol>
  );
}

export function SumarioLateral({ itens }: { itens: ItemDoSumario[] }) {
  const [ids] = useState(() => itens.map((i) => i.id));
  const ativa = useSecaoAtiva(ids);
  if (itens.length < 3) return null;

  return (
    <nav aria-label="Neste artigo">
      <p className="mb-3 text-[0.9375rem] font-bold text-white">Neste artigo</p>
      <Itens itens={itens} ativa={ativa} />
    </nav>
  );
}

export function SumarioRecolhivel({ itens }: { itens: ItemDoSumario[] }) {
  const [aberto, setAberto] = useState(false);
  if (itens.length < 3) return null;
  const principais = itens.filter((i) => i.nivel === 2);

  return (
    <nav aria-label="Neste artigo" className="rounded-[14px] border border-[var(--b-linha)] bg-[var(--b-painel)]">
      <button
        type="button"
        aria-expanded={aberto}
        aria-controls="sumario-do-artigo"
        onClick={() => setAberto((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-[0.9375rem] font-bold text-white"
      >
        <span>
          Neste artigo
          <span className="ml-2 font-semibold text-[var(--b-tinta-3)]">{principais.length} seções</span>
        </span>
        <span aria-hidden className={`text-[1.25rem] leading-none transition-transform ${aberto ? "rotate-45" : ""}`}>
          +
        </span>
      </button>
      <div id="sumario-do-artigo" hidden={!aberto} className="px-5 pb-5">
        <Itens itens={itens} ativa={null} aoClicar={() => setAberto(false)} />
      </div>
    </nav>
  );
}

/** A linha vermelha no topo da tela que acompanha a leitura do artigo. */
export function ProgressoDeLeitura({ alvo }: { alvo: string }) {
  useEffect(() => {
    const barra = document.getElementById("progresso-de-leitura");
    const artigo = document.getElementById(alvo);
    if (!barra || !artigo) return;

    let quadro = 0;
    const medir = () => {
      quadro = 0;
      const caixa = artigo.getBoundingClientRect();
      const total = caixa.height - window.innerHeight * 0.6;
      const lido = Math.min(1, Math.max(0, -caixa.top / Math.max(1, total)));
      barra.style.transform = `scaleX(${lido})`;
    };
    const aoRolar = () => {
      if (!quadro) quadro = window.requestAnimationFrame(medir);
    };
    medir();
    window.addEventListener("scroll", aoRolar, { passive: true });
    window.addEventListener("resize", aoRolar);
    return () => {
      window.removeEventListener("scroll", aoRolar);
      window.removeEventListener("resize", aoRolar);
      if (quadro) window.cancelAnimationFrame(quadro);
    };
  }, [alvo]);

  return <div id="progresso-de-leitura" aria-hidden className="b-progresso" />;
}
