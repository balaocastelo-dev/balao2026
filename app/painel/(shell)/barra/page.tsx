"use client";

import { useEffect, useState } from "react";

export default function AdminBarraPage() {
  const [messages, setMessages] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch("/api/topbar", { cache: "no-store" });
        const data = await res.json();
        if (Array.isArray(data?.messages)) {
          setMessages(data.messages);
        }
      } catch {}
    };
    run();
  }, []);

  const addMessage = () => setMessages(prev => [...prev, ""]);
  const removeMessage = (idx: number) => setMessages(prev => prev.filter((_, i) => i !== idx));
  const updateMessage = (idx: number, val: string) => setMessages(prev => prev.map((m, i) => i === idx ? val : m));

  const move = (from: number, to: number) => {
    if (to < 0 || to >= messages.length) return;
    setMessages(prev => {
      const copy = [...prev];
      const [item] = copy.splice(from, 1);
      copy.splice(to, 0, item);
      return copy;
    });
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/topbar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Falha ao salvar");
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-800">Mensagens do TopBar</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={addMessage}
              className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold"
            >
              Adicionar
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-[#E60012] hover:bg-red-700 text-white text-sm font-semibold disabled:opacity-60"
            >
              {saving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg">
            {error}
          </div>
        )}
        {saved && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg">
            Salvo com sucesso
          </div>
        )}

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
          {messages.length === 0 && (
            <div className="text-slate-500 text-sm">Nenhuma mensagem. Clique em “Adicionar”.</div>
          )}
          {messages.map((msg, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-xs px-2 py-1 bg-slate-100 rounded font-mono">{idx + 1}</span>
              <input
                value={msg}
                onChange={(e) => updateMessage(idx, e.target.value)}
                placeholder="Digite a mensagem..."
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300"
              />
              <div className="flex gap-1">
                <button
                  onClick={() => move(idx, idx - 1)}
                  className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-sm"
                  title="Subir"
                >↑</button>
                <button
                  onClick={() => move(idx, idx + 1)}
                  className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-sm"
                  title="Descer"
                >↓</button>
                <button
                  onClick={() => removeMessage(idx)}
                  className="px-2 py-1 rounded bg-red-100 hover:bg-red-200 text-red-700 text-sm"
                  title="Remover"
                >Remover</button>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-slate-500">
          Dica: O TopBar percorre as mensagens em forma de faixa. As mudanças entram em vigor assim que salvas.
        </p>
      </div>
    </div>
  );
}
