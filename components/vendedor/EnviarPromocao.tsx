"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Search, Send, Loader2, Check, X, Square, Users, User } from "lucide-react";
import type { Product } from "@/lib/utils";
import { normalizarTelefone, janelaDeEnvioAberta } from "@/lib/promocoes/mensagem";

type Modo = "um" | "lista";
type Resultado = { numero: string; ok: boolean; erro?: string };

// Pausa entre envios da lista: aleatória, para parecer humano e poupar o
// número. Mesma faixa de ideia do disparo por tema da loja.
const PAUSA_MIN_MS = 25_000;
const PAUSA_MAX_MS = 45_000;
const TETO_POR_SESSAO = 80; // aviso de segurança; o teto duro fica na VPS.

function pausaAleatoria() {
  return PAUSA_MIN_MS + Math.floor(Math.random() * (PAUSA_MAX_MS - PAUSA_MIN_MS));
}

export default function EnviarPromocao() {
  const [termo, setTermo] = useState("");
  const [achados, setAchados] = useState<Product[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [produto, setProduto] = useState<Product | null>(null);
  const [chamada, setChamada] = useState("");
  const [modo, setModo] = useState<Modo>("um");
  const [numeros, setNumeros] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [progresso, setProgresso] = useState<{ feitos: number; total: number } | null>(null);
  const pararRef = useRef(false);

  // Busca de produto (debounce simples).
  useEffect(() => {
    const q = termo.trim();
    if (q.length < 2) {
      setAchados([]);
      return;
    }
    let vivo = true;
    setBuscando(true);
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { cache: "no-store" });
        const dados = await r.json();
        if (vivo) setAchados(Array.isArray(dados) ? dados.slice(0, 8) : []);
      } catch {
        if (vivo) setAchados([]);
      } finally {
        if (vivo) setBuscando(false);
      }
    }, 350);
    return () => {
      vivo = false;
      clearTimeout(t);
    };
  }, [termo]);

  async function enviarUm(numero: string, emLista: boolean): Promise<Resultado> {
    try {
      const r = await fetch("/api/vendedor/promocao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: produto!.id, telefone: numero, chamada, emLista }),
      });
      const j = await r.json().catch(() => ({}));
      return { numero, ok: !!j.ok, erro: j.ok ? undefined : j.erro || `Erro ${r.status}` };
    } catch (e) {
      return { numero, ok: false, erro: (e as Error).message };
    }
  }

  async function enviarUmCliente() {
    if (!produto) return;
    setEnviando(true);
    setResultados([]);
    const res = await enviarUm(numeros.trim(), false);
    setResultados([res]);
    setEnviando(false);
  }

  async function enviarLista() {
    if (!produto) return;
    const lista = Array.from(
      new Set(
        numeros
          .split(/[\n,;]+/)
          .map((n) => n.trim())
          .filter(Boolean)
      )
    );
    if (lista.length === 0) return;

    if (!janelaDeEnvioAberta()) {
      alert("Envio em lista só das 9h às 18h, exceto domingo. Para um cliente avulso, use o modo 'Um cliente'.");
      return;
    }
    if (lista.length > TETO_POR_SESSAO) {
      if (!confirm(`São ${lista.length} números. O recomendado por sessão é até ${TETO_POR_SESSAO} para não arriscar o número. Continuar mesmo assim?`)) return;
    }

    setEnviando(true);
    setResultados([]);
    pararRef.current = false;
    const feitos: Resultado[] = [];

    for (let i = 0; i < lista.length; i++) {
      if (pararRef.current) break;
      setProgresso({ feitos: i, total: lista.length });

      const numero = lista[i];
      if (!normalizarTelefone(numero)) {
        feitos.push({ numero, ok: false, erro: "número inválido" });
        setResultados([...feitos]);
        continue;
      }

      const res = await enviarUm(numero, true);
      feitos.push(res);
      setResultados([...feitos]);

      // Se a linha caiu, não adianta martelar o resto.
      if (!res.ok && /fora do ar/i.test(res.erro || "")) break;

      const ultimo = i === lista.length - 1;
      if (!ultimo && !pararRef.current) {
        await new Promise((r) => setTimeout(r, pausaAleatoria()));
      }
    }

    setProgresso({ feitos: lista.length, total: lista.length });
    setEnviando(false);
  }

  const podeEnviar = !!produto && numeros.trim().length > 0 && !enviando;
  const sucessos = resultados.filter((r) => r.ok).length;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 p-3 sm:p-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Enviar promoção</h1>
        <p className="mt-1 text-sm text-slate-600">
          Escolha um produto e mande pelo WhatsApp da loja — com a sua assinatura. A conversa fica
          registrada no atendimento.
        </p>
        <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 ring-1 ring-amber-200">
          Teste primeiro mandando só para os seus próprios números antes de enviar para cliente.
        </p>
      </div>

      {/* 1. Produto */}
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <label className="text-sm font-bold text-slate-900">1. Produto</label>
        {!produto ? (
          <>
            <div className="relative mt-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                value={termo}
                onChange={(e) => setTermo(e.target.value)}
                placeholder="Buscar produto pelo nome…"
                className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-[#E60012]"
              />
              {buscando && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-slate-400" size={16} />}
            </div>
            {achados.length > 0 && (
              <ul className="mt-2 divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200">
                {achados.map((p) => (
                  <li key={p.id}>
                    <button
                      onClick={() => { setProduto(p); setAchados([]); setTermo(""); }}
                      className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-slate-50"
                    >
                      <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-white">
                        {p.image && <Image src={p.image} alt="" fill sizes="40px" className="object-contain" unoptimized />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-slate-900">{p.name}</span>
                        <span className="block text-xs font-bold text-[#E60012]">{p.price}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <div className="mt-2 flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-2">
            <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-white">
              {produto.image && <Image src={produto.image} alt="" fill sizes="48px" className="object-contain" unoptimized />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-slate-900">{produto.name}</span>
              <span className="block text-xs font-bold text-[#E60012]">{produto.price} no Pix</span>
            </span>
            <button onClick={() => setProduto(null)} className="rounded p-1 text-slate-400 hover:bg-slate-200" title="Trocar produto">
              <X size={18} />
            </button>
          </div>
        )}
      </section>

      {/* 2. Chamada opcional */}
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <label className="text-sm font-bold text-slate-900">2. Chamada (opcional)</label>
        <input
          value={chamada}
          onChange={(e) => setChamada(e.target.value)}
          placeholder="Ex: Oferta de hoje 🔥"
          maxLength={120}
          className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#E60012]"
        />
        <p className="mt-1 text-xs text-slate-500">Entra no topo da mensagem. O preço, o link e a sua assinatura já vão automaticamente.</p>
      </section>

      {/* 3. Destino */}
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-sm font-bold text-slate-900">3. Enviar para</span>
          <div className="ml-auto inline-flex overflow-hidden rounded-lg border border-slate-300 text-xs">
            <button onClick={() => setModo("um")} className={`inline-flex items-center gap-1 px-3 py-1.5 ${modo === "um" ? "bg-[#E60012] text-white" : "bg-white text-slate-600"}`}>
              <User size={14} /> Um cliente
            </button>
            <button onClick={() => setModo("lista")} className={`inline-flex items-center gap-1 px-3 py-1.5 ${modo === "lista" ? "bg-[#E60012] text-white" : "bg-white text-slate-600"}`}>
              <Users size={14} /> Lista
            </button>
          </div>
        </div>

        {modo === "um" ? (
          <input
            value={numeros}
            onChange={(e) => setNumeros(e.target.value)}
            placeholder="(19) 98751-0267"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#E60012]"
          />
        ) : (
          <>
            <textarea
              value={numeros}
              onChange={(e) => setNumeros(e.target.value)}
              placeholder={"Um número por linha (ou separados por vírgula):\n(19) 98751-0267\n19 99999-0000"}
              rows={5}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#E60012]"
            />
            <p className="mt-1 text-xs text-slate-500">
              Envio em lista das 9h às 18h (exceto domingo), com pausa de 25–45s entre cada um e rodapé de opt-out (SAIR). Recomendado até {TETO_POR_SESSAO} por vez.
            </p>
          </>
        )}
      </section>

      {/* Ação */}
      <div className="flex items-center gap-3">
        <button
          onClick={modo === "um" ? enviarUmCliente : enviarLista}
          disabled={!podeEnviar}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#E60012] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {enviando ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
          {enviando ? "Enviando…" : modo === "um" ? "Enviar promoção" : "Enviar para a lista"}
        </button>
        {enviando && modo === "lista" && (
          <button onClick={() => (pararRef.current = true)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">
            <Square size={14} /> Parar
          </button>
        )}
        {progresso && <span className="text-sm text-slate-500">{progresso.feitos}/{progresso.total}</span>}
      </div>

      {/* Resultados */}
      {resultados.length > 0 && (
        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-bold text-slate-900">
            Resultado {resultados.length > 1 && <span className="font-normal text-slate-500">· {sucessos} enviada(s), {resultados.length - sucessos} com erro</span>}
          </h2>
          <ul className="mt-2 space-y-1 text-sm">
            {resultados.map((r, i) => (
              <li key={i} className="flex items-center gap-2">
                {r.ok ? <Check className="text-green-600" size={16} /> : <X className="text-red-600" size={16} />}
                <span className="font-mono text-slate-700">{r.numero}</span>
                {!r.ok && <span className="text-xs text-red-600">{r.erro}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
