"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, RefreshCw, ToggleLeft, ToggleRight } from "lucide-react";
import { BLOG_CATEGORIES, type BlogCategory } from "@/lib/blog/constants";

type Feed = {
  id: string;
  name: string;
  url: string;
  category: string;
  language: string | null;
  active: boolean | null;
  priority: number | null;
  fetch_interval: number | null;
  campinas_rule: boolean | null;
  niche_rule: string | null;
  daily_limit: number | null;
  last_checked_at: string | null;
};

export default function AdminBlogRssPage() {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState<BlogCategory>(BLOG_CATEGORIES[0]);
  const [priority, setPriority] = useState<number>(10);
  const [fetchInterval, setFetchInterval] = useState<number>(15);
  const [dailyLimit, setDailyLimit] = useState<number>(10);
  const [campinasRule, setCampinasRule] = useState(false);
  const [language, setLanguage] = useState("pt-BR");

  const sorted = useMemo(() => {
    return [...feeds].sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }, [feeds]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/blog/rss");
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Falha ao carregar feeds");
      setFeeds(Array.isArray(json?.feeds) ? json.feeds : []);
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createFeed() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/blog/rss", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          url,
          category,
          language,
          priority,
          fetch_interval: fetchInterval,
          daily_limit: dailyLimit,
          campinas_rule: campinasRule,
          active: true
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Falha ao salvar");
      setName("");
      setUrl("");
      await load();
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setSaving(false);
    }
  }

  async function toggle(id: string, active: boolean) {
    setError(null);
    try {
      const res = await fetch("/api/admin/blog/rss", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, active })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Falha ao atualizar");
      setFeeds((prev) => prev.map((f) => (f.id === id ? { ...f, active } : f)));
    } catch (e: any) {
      setError(String(e?.message || e));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Link href="/admin/blog" className="p-2 rounded-md hover:bg-gray-100">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h2 className="text-xl font-bold text-gray-900">RSS Feeds</h2>
              <p className="mt-1 text-sm text-gray-600">
                Cadastre fontes e regras de leitura automática.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-md border bg-white text-sm font-semibold hover:bg-gray-50 disabled:opacity-60"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Atualizar
        </button>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <div className="bg-white border rounded-xl p-5">
        <h3 className="font-bold text-gray-900">Novo feed</h3>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome da fonte (ex: G1 Campinas)"
            className="px-3 py-2 rounded-md border text-sm"
          />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="URL do RSS/Atom"
            className="px-3 py-2 rounded-md border text-sm"
          />
          <select value={category} onChange={(e) => setCategory(e.target.value as BlogCategory)} className="px-3 py-2 rounded-md border text-sm">
            {BLOG_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            placeholder="Idioma (pt-BR)"
            className="px-3 py-2 rounded-md border text-sm"
          />
          <input
            type="number"
            value={priority}
            onChange={(e) => setPriority(Number(e.target.value))}
            placeholder="Prioridade"
            className="px-3 py-2 rounded-md border text-sm"
          />
          <input
            type="number"
            value={fetchInterval}
            onChange={(e) => setFetchInterval(Number(e.target.value))}
            placeholder="Frequência (min)"
            className="px-3 py-2 rounded-md border text-sm"
          />
          <input
            type="number"
            value={dailyLimit}
            onChange={(e) => setDailyLimit(Number(e.target.value))}
            placeholder="Limite diário"
            className="px-3 py-2 rounded-md border text-sm"
          />
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={campinasRule}
              onChange={(e) => setCampinasRule(e.target.checked)}
              className="w-4 h-4"
            />
            Regra Campinas/RMC
          </label>
        </div>

        <button
          onClick={createFeed}
          disabled={saving || !name.trim() || !url.trim()}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#E60012] text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60"
        >
          {saving ? <RefreshCw size={16} className="animate-spin" /> : <Plus size={16} />}
          Salvar
        </button>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="p-5 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Feeds cadastrados</h3>
          <span className="text-sm text-gray-600">{feeds.length}</span>
        </div>

        {loading ? (
          <div className="px-5 pb-5 text-sm text-gray-600">Carregando…</div>
        ) : (
          <div className="divide-y">
            {sorted.map((f) => (
              <div key={f.id} className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-bold text-gray-900">{f.name}</div>
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">{f.category}</span>
                    {f.campinas_rule ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-red-50 text-[#E60012] border border-red-100">
                        Campinas
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-1 text-sm text-gray-600 truncate">{f.url}</div>
                  <div className="mt-2 text-xs text-gray-500">
                    Prioridade {f.priority ?? 0} • Intervalo {f.fetch_interval ?? 15} min • Limite {f.daily_limit ?? 10}/dia
                    {f.last_checked_at ? ` • Última checagem: ${new Date(f.last_checked_at).toLocaleString("pt-BR")}` : ""}
                  </div>
                </div>

                <button
                  onClick={() => toggle(f.id, !(f.active ?? false))}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-md border bg-white text-sm font-semibold hover:bg-gray-50"
                >
                  {f.active ? <ToggleRight size={18} className="text-green-600" /> : <ToggleLeft size={18} className="text-gray-500" />}
                  {f.active ? "Ativo" : "Inativo"}
                </button>
              </div>
            ))}
            {sorted.length === 0 ? <div className="p-5 text-sm text-gray-600">Nenhum feed cadastrado.</div> : null}
          </div>
        )}
      </div>
    </div>
  );
}
