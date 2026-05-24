"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, CheckCircle, Pencil, Archive, EyeOff } from "lucide-react";

type Post = {
  id: string;
  title: string;
  slug: string;
  category: string;
  status: "draft" | "published" | "archived";
  plagiarism_score: number | null;
  seo_score: number | null;
  geo_score: number | null;
  created_at: string | null;
  published_at: string | null;
};

export default function AdminBlogMateriasPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [status, setStatus] = useState<string>("draft");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const rows = useMemo(() => posts, [posts]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/blog/posts?status=${encodeURIComponent(status)}&limit=120`);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Falha ao carregar matérias");
      setPosts(Array.isArray(json?.posts) ? json.posts : []);
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [status]);

  async function patch(id: string, patch: Record<string, any>) {
    setError(null);
    try {
      const res = await fetch("/api/admin/blog/posts", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, patch })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Falha ao atualizar");
      setPosts((prev) => prev.map((p) => (p.id === id ? { ...(p as any), ...(json.post as any) } : p)));
    } catch (e: any) {
      setError(String(e?.message || e));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/blog" className="p-2 rounded-md hover:bg-gray-100">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Matérias</h2>
            <p className="mt-1 text-sm text-gray-600">Revisão, publicação e status.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 rounded-md border text-sm bg-white"
          >
            <option value="draft">Rascunhos</option>
            <option value="published">Publicadas</option>
            <option value="archived">Arquivadas</option>
          </select>
          <button
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md border bg-white text-sm font-semibold hover:bg-gray-50 disabled:opacity-60"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Atualizar
          </button>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="p-5 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Lista</h3>
          <span className="text-sm text-gray-600">{posts.length}</span>
        </div>

        {loading ? (
          <div className="px-5 pb-5 text-sm text-gray-600">Carregando…</div>
        ) : (
          <div className="divide-y">
            {rows.map((p) => (
              <div key={p.id} className="p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="font-bold text-gray-900">{p.title}</div>
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">{p.category}</span>
                    <span className="text-xs px-2 py-1 rounded-full border">
                      {p.status}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    {p.created_at ? `Criado: ${new Date(p.created_at).toLocaleString("pt-BR")}` : ""}
                    {p.published_at ? ` • Publicado: ${new Date(p.published_at).toLocaleString("pt-BR")}` : ""}
                    {p.plagiarism_score !== null ? ` • Plágio (estimativa): ${p.plagiarism_score}%` : ""}
                    {p.seo_score !== null ? ` • SEO: ${p.seo_score}` : ""}
                    {p.geo_score !== null ? ` • GEO: ${p.geo_score}` : ""}
                  </div>
                  <div className="mt-2 text-sm text-gray-700">
                    <Link href={`/blog/${p.slug}`} className="text-[#E60012] font-semibold hover:underline" target="_blank">
                      Abrir no blog
                    </Link>
                    <span className="text-gray-300 mx-2">|</span>
                    <span className="text-gray-600">{p.slug}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {p.status !== "published" ? (
                    <button
                      onClick={() => patch(p.id, { status: "published" })}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-[#E60012] text-white text-sm font-semibold hover:bg-red-700"
                    >
                      <CheckCircle size={16} />
                      Publicar
                    </button>
                  ) : (
                    <button
                      onClick={() => patch(p.id, { status: "draft", published_at: null })}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-md border bg-white text-sm font-semibold hover:bg-gray-50"
                    >
                      <EyeOff size={16} />
                      Voltar p/ rascunho
                    </button>
                  )}

                  <button
                    onClick={() => patch(p.id, { status: "archived" })}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-md border bg-white text-sm font-semibold hover:bg-gray-50"
                  >
                    <Archive size={16} />
                    Arquivar
                  </button>

                  <button
                    onClick={() => patch(p.id, { seo_score: p.seo_score ?? 0 })}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-md border bg-white text-sm font-semibold hover:bg-gray-50"
                    title="Placeholder para edição rápida via patch"
                  >
                    <Pencil size={16} />
                    Ajustar
                  </button>
                </div>
              </div>
            ))}
            {rows.length === 0 ? <div className="p-5 text-sm text-gray-600">Nenhuma matéria encontrada.</div> : null}
          </div>
        )}
      </div>
    </div>
  );
}

