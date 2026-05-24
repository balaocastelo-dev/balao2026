"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw } from "lucide-react";

type LogRow = {
  id: string;
  agent_name: string;
  action: string;
  status: "ok" | "error" | "warn" | "info";
  message: string | null;
  metadata: any;
  created_at: string | null;
};

export default function AdminBlogConfiguracoesPage() {
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/blog/logs?limit=200");
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Falha ao carregar logs");
      setLogs(Array.isArray(json?.logs) ? json.logs : []);
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/blog" className="p-2 rounded-md hover:bg-gray-100">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Configurações</h2>
            <p className="mt-1 text-sm text-gray-600">
              Logs dos agentes e validações de integração.
            </p>
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
        <h3 className="font-bold text-gray-900">Checklist rápido</h3>
        <ul className="mt-3 text-sm text-gray-700 list-disc pl-5 space-y-1">
          <li>Supabase Service Role configurado (SUPABASE_SERVICE_ROLE_KEY) para upload de imagens e escrita.</li>
          <li>IA Llama configurada (LLAMA_API_URL e LLAMA_MODEL) para publicar automaticamente; sem isso, matérias ficam em rascunho.</li>
          <li>Vercel Cron apontando para /api/cron/blog-minute.</li>
        </ul>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="p-5 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Logs</h3>
          <span className="text-sm text-gray-600">{logs.length}</span>
        </div>
        {loading ? (
          <div className="px-5 pb-5 text-sm text-gray-600">Carregando…</div>
        ) : (
          <div className="divide-y">
            {logs.map((l) => (
              <div key={l.id} className="p-5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">{l.agent_name}</span>
                  <span className="text-xs px-2 py-1 rounded-full border">{l.action}</span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full border ${
                      l.status === "error"
                        ? "bg-red-50 text-red-700 border-red-200"
                        : l.status === "warn"
                        ? "bg-yellow-50 text-yellow-800 border-yellow-200"
                        : l.status === "ok"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-gray-50 text-gray-700 border-gray-200"
                    }`}
                  >
                    {l.status}
                  </span>
                  {l.created_at ? (
                    <span className="text-xs text-gray-500">{new Date(l.created_at).toLocaleString("pt-BR")}</span>
                  ) : null}
                </div>
                {l.message ? <div className="mt-2 text-sm text-gray-800">{l.message}</div> : null}
                {l.metadata ? (
                  <pre className="mt-2 text-xs bg-gray-50 border rounded-md p-3 overflow-auto whitespace-pre-wrap break-words">
                    {JSON.stringify(l.metadata, null, 2)}
                  </pre>
                ) : null}
              </div>
            ))}
            {logs.length === 0 ? <div className="p-5 text-sm text-gray-600">Nenhum log ainda.</div> : null}
          </div>
        )}
      </div>
    </div>
  );
}

