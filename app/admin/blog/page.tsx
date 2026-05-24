"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Newspaper, Rss, FileText, Settings, Play, RefreshCw } from "lucide-react";

export default function AdminBlogPage() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const cards = useMemo(
    () => [
      { title: "RSS Feeds", desc: "Cadastrar, ativar/desativar e definir regras.", href: "/admin/blog/rss", icon: Rss },
      { title: "Matérias", desc: "Revisar rascunhos, publicar e editar dados.", href: "/admin/blog/materias", icon: FileText },
      { title: "Configurações", desc: "Ver status da IA Llama e logs dos agentes.", href: "/admin/blog/configuracoes", icon: Settings }
    ],
    []
  );

  useEffect(() => {
    setError(null);
  }, []);

  async function runNow() {
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/admin/blog/run", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ maxNewPosts: 8, force: true })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Falha ao executar");
      setResult(json?.result || null);
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Newspaper size={20} className="text-[#E60012]" />
            <h2 className="text-xl font-bold text-gray-900">Blog</h2>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Pipeline automático: RSS → leitura → imagens → vídeo → reescrita → SEO/GEO → validação → publicação/rascunho.
          </p>
        </div>

        <button
          onClick={runNow}
          disabled={running}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#E60012] text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60"
        >
          {running ? <RefreshCw size={16} className="animate-spin" /> : <Play size={16} />}
          Executar agora
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Link key={c.href} href={c.href} className="bg-white border rounded-xl p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <c.icon size={18} className="text-gray-800" />
              <h3 className="font-bold text-gray-900">{c.title}</h3>
            </div>
            <p className="mt-2 text-sm text-gray-600">{c.desc}</p>
          </Link>
        ))}
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      {result ? (
        <div className="bg-gray-50 border rounded-xl p-4 text-sm text-gray-800">
          <div className="font-semibold">Resultado</div>
          <pre className="mt-2 whitespace-pre-wrap break-words">{JSON.stringify(result, null, 2)}</pre>
        </div>
      ) : null}
    </div>
  );
}

