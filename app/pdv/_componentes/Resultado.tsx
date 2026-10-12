"use client";

// Depois de finalizar: onde a venda chegou (Bling, Sefaz) e a escolha do papel.

import { useEffect, useState } from "react";
import { Check, CircleAlert, ExternalLink, FileText, LoaderCircle, Printer, RotateCw, ScrollText } from "lucide-react";
import { reais } from "@/lib/pdv/calculos";
import type { DadosDoComprovante } from "@/lib/pdv/vendas";
import type { Formato } from "./Comprovante";
import { gravarLocal, lerLocal } from "./estado";

interface Props {
  c: DadosDoComprovante;
  aoImprimir: (formato: Formato) => void;
  aoAcao: (acao: "tentar-de-novo" | "atualizar-nota") => Promise<void>;
  aoNovaVenda?: () => void;
  ocupado: boolean;
}

type Passo = { estado: "feito" | "andando" | "parado" | "erro"; titulo: string; detalhe?: string | null };

function passos(c: DadosDoComprovante): Passo[] {
  const lista: Passo[] = [{ estado: "feito", titulo: "Venda gravada", detalhe: c.pdvId }];
  if (c.estadoNoBling === "no-bling") lista.push({ estado: "feito", titulo: `Pedido nº ${c.numeroBling ?? "…"} no Bling`, detalhe: c.vendedor ? `Vendedor ${c.vendedor}` : null });
  else if (c.estadoNoBling === "erro") lista.push({ estado: "erro", titulo: "O Bling recusou o pedido", detalhe: c.mensagemDoBling });
  else
    lista.push({
      estado: "parado",
      titulo: "Aguardando o Bling",
      detalhe: c.mensagemDoBling ? `${c.mensagemDoBling} A venda entra sozinha quando ele voltar.` : "A venda entra sozinha em instantes.",
    });

  if (c.pedirNota && c.nota) {
    const n = c.nota;
    if (n.estado === "autorizada") lista.push({ estado: "feito", titulo: `NF-e nº ${n.numero} autorizada`, detalhe: n.serie ? `Série ${n.serie}` : null });
    else if (n.estado === "enviada") lista.push({ estado: "andando", titulo: "Nota na Sefaz", detalhe: "Esperando a autorização (costuma levar segundos)." });
    else if (n.estado === "gerada") lista.push({ estado: "andando", titulo: "Nota gerada no Bling", detalhe: "Indo para a Sefaz." });
    else if (n.estado === "rejeitada") lista.push({ estado: "erro", titulo: "A Sefaz rejeitou a nota", detalhe: n.mensagem });
    else if (n.estado === "erro") lista.push({ estado: "erro", titulo: "A nota não saiu", detalhe: n.mensagem });
    else lista.push({ estado: "parado", titulo: "Nota pedida", detalhe: "Sai assim que o pedido estiver no Bling." });
  }
  return lista;
}

export default function Resultado({ c, aoImprimir, aoAcao, aoNovaVenda, ocupado }: Props) {
  const [formato, setFormato] = useState<Formato>("80mm");
  useEffect(() => setFormato(lerLocal<Formato>("pdv-formato", "80mm")), []);
  const escolher = (f: Formato) => {
    setFormato(f);
    gravarLocal("pdv-formato", f);
    aoImprimir(f);
  };
  const lista = passos(c);
  const temErro = lista.some((p) => p.estado === "erro");
  const notaAndando = c.nota?.estado === "enviada" || c.nota?.estado === "gerada";

  // Nota a caminho da Sefaz: confere sozinho de 4 em 4 segundos (até 1 minuto).
  useEffect(() => {
    if (!notaAndando) return;
    let n = 0;
    const t = setInterval(() => {
      if (++n > 15) return clearInterval(t);
      aoAcao("atualizar-nota").catch(() => undefined);
    }, 4000);
    return () => clearInterval(t);
  }, [notaAndando, aoAcao]);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8 p-5 lg:p-8">
      <div>
        <p className="pdv-numeros text-sm text-[var(--texto-suave)]">{c.cliente.nome || "Consumidor final"}</p>
        <h2 className="pdv-numeros text-4xl font-black tracking-tight">{reais(c.total)}</h2>
      </div>

      <ol className="space-y-3">
        {lista.map((p, i) => (
          <li key={i} className="flex gap-3">
            <span
              className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                p.estado === "feito" ? "bg-white text-slate-900" : p.estado === "erro" ? "bg-[var(--vermelho)] text-white" : "border border-[var(--linha)] text-[var(--ceu)]"
              }`}
            >
              {p.estado === "feito" ? (
                <Check className="h-4 w-4" strokeWidth={3} />
              ) : p.estado === "erro" ? (
                <CircleAlert className="h-4 w-4" />
              ) : (
                <LoaderCircle className="h-4 w-4 animate-spin motion-reduce:animate-none" />
              )}
            </span>
            <div>
              <div className="font-bold">{p.titulo}</div>
              {p.detalhe && <div className="text-sm text-[var(--texto-suave)]">{p.detalhe}</div>}
            </div>
          </li>
        ))}
      </ol>

      {(temErro || notaAndando || c.estadoNoBling === "pendente") && c.pdvId && (
        <div className="flex flex-wrap gap-2">
          {(temErro || c.estadoNoBling === "pendente") && (
            <button
              onClick={() => aoAcao("tentar-de-novo")}
              disabled={ocupado}
              className="flex items-center gap-2 rounded-xl border border-[var(--linha)] px-4 py-2.5 font-semibold hover:border-slate-500 disabled:opacity-50"
            >
              <RotateCw className={`h-4 w-4 ${ocupado ? "animate-spin" : ""}`} aria-hidden /> Tentar de novo
            </button>
          )}
          {notaAndando && (
            <button
              onClick={() => aoAcao("atualizar-nota")}
              disabled={ocupado}
              className="flex items-center gap-2 rounded-xl border border-[var(--linha)] px-4 py-2.5 font-semibold hover:border-slate-500 disabled:opacity-50"
            >
              <RotateCw className={`h-4 w-4 ${ocupado ? "animate-spin" : ""}`} aria-hidden /> Conferir a nota
            </button>
          )}
        </div>
      )}

      <section aria-labelledby="titulo-impressao" className="space-y-3">
        <h3 id="titulo-impressao" className="flex items-center gap-2 text-lg font-bold">
          <Printer className="h-5 w-5" aria-hidden /> Imprimir o comprovante
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            onClick={() => escolher("80mm")}
            className={`flex items-center gap-4 rounded-2xl border p-5 text-left transition hover:border-[var(--vermelho)] ${
              formato === "80mm" ? "border-[var(--vermelho)] bg-[var(--vermelho)]/10" : "border-[var(--linha)] bg-[var(--superficie)]"
            }`}
          >
            <span className="flex h-16 w-10 items-center justify-center rounded-sm bg-[var(--papel)] text-slate-700">
              <ScrollText className="h-5 w-5" aria-hidden />
            </span>
            <span>
              <span className="block text-lg font-black">Cupom 80 mm</span>
              <span className="text-sm text-[var(--texto-suave)]">Impressora térmica do balcão</span>
            </span>
          </button>
          <button
            onClick={() => escolher("a4")}
            className={`flex items-center gap-4 rounded-2xl border p-5 text-left transition hover:border-[var(--vermelho)] ${
              formato === "a4" ? "border-[var(--vermelho)] bg-[var(--vermelho)]/10" : "border-[var(--linha)] bg-[var(--superficie)]"
            }`}
          >
            <span className="flex h-16 w-12 items-center justify-center rounded-sm bg-white text-slate-700">
              <FileText className="h-5 w-5" aria-hidden />
            </span>
            <span>
              <span className="block text-lg font-black">Folha A4</span>
              <span className="text-sm text-[var(--texto-suave)]">Com fotos e campo de assinatura</span>
            </span>
          </button>
        </div>
        {c.nota?.estado === "autorizada" && (c.nota.linkDanfe || c.nota.linkPdf) && (
          <a
            href={c.nota.linkPdf || c.nota.linkDanfe || "#"}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 rounded-2xl border border-[var(--linha)] bg-[var(--superficie)] p-4 font-bold hover:border-slate-500"
          >
            <ExternalLink className="h-5 w-5" aria-hidden /> Abrir o DANFE da NF-e nº {c.nota.numero}
          </a>
        )}
      </section>

      {aoNovaVenda && (
        <button
          onClick={aoNovaVenda}
          className="w-full rounded-2xl bg-[var(--vermelho)] py-4 text-lg font-black text-white shadow-lg shadow-red-950/50 transition hover:bg-red-700 active:scale-[0.98]"
        >
          Nova venda
        </button>
      )}
    </div>
  );
}
