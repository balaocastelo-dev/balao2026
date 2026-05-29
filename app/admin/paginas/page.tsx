"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Copy,
  ExternalLink,
  Pencil,
  Trash2,
  Archive,
  Send,
  RefreshCcw,
  Search,
} from "lucide-react";

import type { VitrinePageRecord } from "@/lib/vitrine/types";
import { pickPcHeroImage } from "@/lib/vitrine/core";

export default function AdminPaginasPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const [pages, setPages] = useState<VitrinePageRecord[]>([]);

  const load = async () => {
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/vitrine/pages", { cache: "no-store" });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) throw new Error(data?.error || "Falha ao carregar");
      setPages(Array.isArray(data.pages) ? data.pages : []);
      setStatus("idle");
    } catch (e: any) {
      setStatus("error");
      setMessage(e?.message || "Falha ao carregar");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return pages;
    return pages.filter((p) => `${p.nome_pc} ${p.slug} ${p.categoria}`.toLowerCase().includes(q));
  }, [pages, query]);

  const copyLink = async (slug: string) => {
    const url = `https://www.balao.info/vitrine/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setMessage("Link copiado.");
    } catch {
      setMessage("Não foi possível copiar.");
    }
  };

  const changeStatus = async (id: string, next: "publicada" | "arquivada") => {
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch(`/api/vitrine/pages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) throw new Error(data?.error || "Falha ao atualizar");
      await load();
      setMessage(next === "publicada" ? "Página publicada." : "Página arquivada.");
    } catch (e: any) {
      setStatus("error");
      setMessage(e?.message || "Falha ao atualizar");
    } finally {
      setStatus("idle");
    }
  };

  const remove = async (id: string) => {
    const ok = window.confirm("Excluir esta página? Essa ação não pode ser desfeita.");
    if (!ok) return;

    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch(`/api/vitrine/pages/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) throw new Error(data?.error || "Falha ao excluir");
      await load();
      setMessage("Página excluída.");
    } catch (e: any) {
      setStatus("error");
      setMessage(e?.message || "Falha ao excluir");
    } finally {
      setStatus("idle");
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111111]">Minhas Páginas</h1>
          <p className="mt-2 text-sm text-[#333333]">
            Gerencie suas páginas de vitrine: editar, publicar, arquivar e compartilhar links.
          </p>
        </div>
        <Link
          href="/admin/gerador"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#d71920] text-white font-extrabold text-sm hover:bg-[#b9151b]"
        >
          Criar nova página
        </Link>
      </div>

      <div className="bg-white border border-black/5 rounded-2xl shadow-sm p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#d71920]/30"
              placeholder="Buscar por nome, slug ou categoria..."
            />
          </div>
          <button
            onClick={load}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-black/10 bg-white font-extrabold text-sm hover:bg-black/5"
          >
            <RefreshCcw size={16} />
            Atualizar
          </button>
        </div>
        {message && <div className="mt-4 text-sm font-semibold text-[#333333]">{message}</div>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map((p) => {
          const url = `/vitrine/${p.slug}`;
          const hero = pickPcHeroImage({ categoria: p.categoria } as any);
          return (
            <div key={p.id} className="bg-white border border-black/5 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-5 border-b border-black/5">
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 rounded-2xl border border-black/10 bg-white overflow-hidden flex items-center justify-center">
                    <img src={hero} alt="" className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-lg font-extrabold text-[#111111] truncate">{p.nome_pc}</div>
                    <div className="text-sm text-[#333333] mt-1 truncate">{p.categoria}</div>
                    <div className="mt-2 flex items-center gap-2">
                      <span
                        className={`text-xs font-extrabold px-2.5 py-1 rounded-full border ${
                          p.status === "publicada"
                            ? "bg-green-50 border-green-200 text-[#16a34a]"
                            : p.status === "arquivada"
                              ? "bg-gray-50 border-gray-200 text-gray-600"
                              : "bg-yellow-50 border-yellow-200 text-yellow-800"
                        }`}
                      >
                        {p.status}
                      </span>
                      <span className="text-xs text-gray-500 truncate">/vitrine/{p.slug}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5">
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href={`/admin/gerador?id=${encodeURIComponent(p.id)}`}
                    className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-black/10 bg-white font-extrabold text-sm hover:bg-black/5"
                  >
                    <Pencil size={16} />
                    Editar
                  </Link>
                  <Link
                    href={url}
                    target="_blank"
                    className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[#111111] text-white font-extrabold text-sm hover:bg-black"
                  >
                    <ExternalLink size={16} />
                    Visualizar
                  </Link>
                  <button
                    onClick={() => copyLink(p.slug)}
                    className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-black/10 bg-white font-extrabold text-sm hover:bg-black/5"
                  >
                    <Copy size={16} />
                    Copiar link
                  </button>
                  {p.status === "publicada" ? (
                    <button
                      onClick={() => changeStatus(p.id, "arquivada")}
                      className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-black/10 bg-white font-extrabold text-sm hover:bg-black/5"
                    >
                      <Archive size={16} />
                      Arquivar
                    </button>
                  ) : (
                    <button
                      onClick={() => changeStatus(p.id, "publicada")}
                      className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[#d71920] text-white font-extrabold text-sm hover:bg-[#b9151b]"
                    >
                      <Send size={16} />
                      Publicar
                    </button>
                  )}
                </div>

                <button
                  onClick={() => remove(p.id)}
                  className="mt-3 w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-red-50 text-[#d71920] font-extrabold text-sm border border-red-200 hover:bg-red-100"
                >
                  <Trash2 size={16} />
                  Excluir
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="mt-10 text-center text-sm text-gray-600">
          {status === "loading" ? "Carregando..." : "Nenhuma página encontrada."}
        </div>
      )}
    </div>
  );
}

