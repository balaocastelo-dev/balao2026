"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ExternalLink, Pause, Play, RefreshCcw, Save, AlertCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { createClient as createSupabaseClient } from "@/lib/supabase/client";
import { parsePriceToNumber } from "@/lib/utils";
import { formatBRL } from "@/lib/kabum/pricing";

type Settings = {
  id?: string;
  percentage: number;
  mode: "kabum_plus_percentage" | "kabum_minus_percentage" | "min_margin";
  min_margin: number;
  sync_interval_seconds: number;
  max_parallel_agents: number;
  is_active: boolean;
};

type ProductRow = {
  id: string;
  name: string;
  price: string;
  kabum_url: string | null;
  kabum_last_price: number | null;
  kabum_last_stock: string | null;
  kabum_last_checked_at: string | null;
  kabum_sync_enabled: boolean | null;
  kabum_sync_status: string | null;
  kabum_sync_error: string | null;
  suggested_price: number | null;
};

type LogRow = {
  id: string;
  product_id: string | null;
  kabum_url: string | null;
  old_balao_price: number | null;
  new_balao_price: number | null;
  kabum_price: number | null;
  kabum_stock: string | null;
  status: string | null;
  error_message: string | null;
  created_at: string | null;
};

function fmtDateTime(input: string | null | undefined) {
  if (!input) return "-";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("pt-BR");
}

export default function IAKabumSyncPage() {
  const { showToast } = useToast();
  const supabase = useMemo(() => createSupabaseClient(), []);

  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [runningAll, setRunningAll] = useState(false);
  const [runningOne, setRunningOne] = useState<Record<string, boolean>>({});

  const [settings, setSettings] = useState<Settings | null>(null);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [logs, setLogs] = useState<LogRow[]>([]);

  const refreshTimerRef = useRef<number | null>(null);

  const refreshAll = async () => {
    setLoading(true);
    try {
      const [settingsRes, productsRes, logsRes] = await Promise.all([
        fetch("/api/admin/ia-kabum-sync/settings", { cache: "no-store" }),
        fetch("/api/admin/ia-kabum-sync/products", { cache: "no-store" }),
        fetch("/api/admin/ia-kabum-sync/logs?limit=100", { cache: "no-store" })
      ]);

      const settingsJson = await settingsRes.json().catch(() => null);
      if (settingsRes.ok && settingsJson) setSettings(settingsJson);

      const productsJson = await productsRes.json().catch(() => null);
      if (productsRes.ok && productsJson?.products) {
        setProducts(productsJson.products as ProductRow[]);
        if (productsJson.settings && !settingsJson) setSettings(productsJson.settings as Settings);
      }

      const logsJson = await logsRes.json().catch(() => null);
      if (logsRes.ok && Array.isArray(logsJson)) setLogs(logsJson as LogRow[]);
    } catch {
      showToast("Erro ao carregar IA Kabum Sync", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAll();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("ia-kabum-sync")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "ai_kabum_sync_logs" },
        payload => {
          const row = payload.new as any as LogRow;
          setLogs(prev => [row, ...prev].slice(0, 200));

          const status = String(row.status || "");
          const pid = row.product_id || "";
          if (status === "success") showToast(`Sincronizado: ${pid}`, "success");
          else if (status === "manual_review") showToast(`Revisão manual: ${pid}`, "info");
          else if (status === "error") showToast(`Erro: ${pid}`, "error");

          if (refreshTimerRef.current) window.clearTimeout(refreshTimerRef.current);
          refreshTimerRef.current = window.setTimeout(() => refreshAll(), 800);
        }
      )
      .subscribe();

    return () => {
      if (refreshTimerRef.current) window.clearTimeout(refreshTimerRef.current);
      supabase.removeChannel(channel);
    };
  }, [supabase, showToast]);

  const dashboard = useMemo(() => {
    const total = products.length;
    const success = products.filter(p => p.kabum_sync_status === "success").length;
    const error = products.filter(p => p.kabum_sync_status === "error").length;
    const lastSync = products
      .map(p => p.kabum_last_checked_at)
      .filter(Boolean)
      .sort()
      .slice(-1)[0] as string | undefined;

    const diffs = products
      .map(p => {
        if (p.suggested_price == null) return null;
        const cur = parsePriceToNumber(p.price);
        if (!Number.isFinite(cur)) return null;
        return p.suggested_price - cur;
      })
      .filter((v): v is number => typeof v === "number" && Number.isFinite(v));

    const avgDiff = diffs.length ? diffs.reduce((a, b) => a + b, 0) / diffs.length : 0;

    const agentStatus = settings?.is_active ? "ativo" : "pausado";
    return {
      total,
      success,
      error,
      lastSync: lastSync || null,
      avgDiff,
      agentStatus
    };
  }, [products, settings?.is_active]);

  const saveSettings = async (partial?: Partial<Settings>) => {
    if (!settings) return;
    setSavingSettings(true);
    try {
      const next = { ...settings, ...(partial || {}) };
      const res = await fetch("/api/admin/ia-kabum-sync/settings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(next)
      });
      if (!res.ok) throw new Error("Falha ao salvar");
      const data = await res.json();
      setSettings(data);
      showToast("Configurações salvas", "success");
    } catch {
      showToast("Erro ao salvar configurações", "error");
    } finally {
      setSavingSettings(false);
    }
  };

  const toggleAgent = async (active: boolean) => {
    await saveSettings({ is_active: active });
  };

  const syncAll = async () => {
    setRunningAll(true);
    try {
      const res = await fetch("/api/admin/ia-kabum-sync/sync-all", { method: "POST" });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Falha");
      showToast(`Sincronização em lote iniciada (${json?.total || 0})`, "info");
    } catch {
      showToast("Erro ao iniciar sincronização em lote", "error");
    } finally {
      setRunningAll(false);
    }
  };

  const syncOne = async (productId: string) => {
    setRunningOne(prev => ({ ...prev, [productId]: true }));
    try {
      const res = await fetch("/api/admin/ia-kabum-sync/sync-one", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ productId })
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Falha");
      if (json?.status === "success") showToast("Sincronizado com sucesso", "success");
      else if (json?.status === "manual_review") showToast("Marcado para revisão manual", "info");
      else if (json?.status === "skipped") showToast("Ignorado (lock)", "info");
      else showToast("Erro ao sincronizar", "error");
    } catch {
      showToast("Erro ao sincronizar produto", "error");
    } finally {
      setRunningOne(prev => ({ ...prev, [productId]: false }));
    }
  };

  const toggleProduct = async (productId: string, enabled: boolean) => {
    try {
      const res = await fetch("/api/admin/ia-kabum-sync/toggle-product", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ productId, enabled })
      });
      if (!res.ok) throw new Error("Falha");
      const row = await res.json();
      setProducts(prev => prev.map(p => (p.id === productId ? { ...p, kabum_sync_enabled: row.kabum_sync_enabled } : p)));
      showToast(enabled ? "Auto sync ativado" : "Auto sync desativado", "success");
    } catch {
      showToast("Erro ao atualizar produto", "error");
    }
  };

  const logsByProduct = useMemo(() => {
    const map = new Map<string, LogRow[]>();
    for (const l of logs) {
      const pid = l.product_id || "";
      if (!pid) continue;
      const arr = map.get(pid) || [];
      arr.push(l);
      map.set(pid, arr);
    }
    return map;
  }, [logs]);

  if (loading && !settings) {
    return (
      <div className="flex items-center gap-2 text-gray-600">
        <RefreshCcw className="animate-spin" size={18} /> Carregando IA Kabum Sync...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">IA Kabum Sync</h2>
          <p className="text-sm text-gray-500">Sincroniza preço e estoque com produtos equivalentes na Kabum.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => refreshAll()}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50"
            disabled={loading}
          >
            <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
            Atualizar
          </button>

          <button
            onClick={() => syncAll()}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-gray-900 text-white hover:bg-black disabled:opacity-60"
            disabled={runningAll}
          >
            <RefreshCcw size={16} className={runningAll ? "animate-spin" : ""} />
            Sincronizar todos agora
          </button>

          {settings?.is_active ? (
            <button
              onClick={() => toggleAgent(false)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
              disabled={savingSettings}
            >
              <Pause size={16} />
              Pausar IA
            </button>
          ) : (
            <button
              onClick={() => toggleAgent(true)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
              disabled={savingSettings}
            >
              <Play size={16} />
              Ativar IA
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        <div className="rounded-lg border border-gray-200 p-4">
          <div className="text-xs text-gray-500">Produtos monitorados</div>
          <div className="text-2xl font-bold">{dashboard.total}</div>
        </div>
        <div className="rounded-lg border border-gray-200 p-4">
          <div className="text-xs text-gray-500">Sincronizados com sucesso</div>
          <div className="text-2xl font-bold text-green-700">{dashboard.success}</div>
        </div>
        <div className="rounded-lg border border-gray-200 p-4">
          <div className="text-xs text-gray-500">Produtos com erro</div>
          <div className="text-2xl font-bold text-red-700">{dashboard.error}</div>
        </div>
        <div className="rounded-lg border border-gray-200 p-4">
          <div className="text-xs text-gray-500">Última sincronização</div>
          <div className="text-sm font-semibold">{fmtDateTime(dashboard.lastSync)}</div>
        </div>
        <div className="rounded-lg border border-gray-200 p-4">
          <div className="text-xs text-gray-500">Diferença média de preço</div>
          <div className="text-sm font-semibold">{formatBRL(dashboard.avgDiff)}</div>
        </div>
        <div className="rounded-lg border border-gray-200 p-4">
          <div className="text-xs text-gray-500">Status do agente IA</div>
          <div className="text-sm font-semibold">{dashboard.agentStatus}</div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Configurações</h3>
          <button
            onClick={() => saveSettings()}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-[#E60012] text-white hover:bg-red-700 disabled:opacity-60"
            disabled={savingSettings || !settings}
          >
            <Save size={16} />
            Salvar configurações
          </button>
        </div>

        {settings && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Percentual</label>
              <input
                type="number"
                value={settings.percentage}
                onChange={e => setSettings(prev => (prev ? { ...prev, percentage: Number(e.target.value) } : prev))}
                className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#E60012] outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Modo</label>
              <select
                value={settings.mode}
                onChange={e => setSettings(prev => (prev ? { ...prev, mode: e.target.value as any } : prev))}
                className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#E60012] outline-none"
              >
                <option value="kabum_plus_percentage">Preço Kabum + percentual</option>
                <option value="kabum_minus_percentage">Preço Kabum - percentual</option>
                <option value="min_margin">Preço fixo mínimo de margem</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Margem mínima (R$)</label>
              <input
                type="number"
                value={settings.min_margin}
                onChange={e => setSettings(prev => (prev ? { ...prev, min_margin: Number(e.target.value) } : prev))}
                className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#E60012] outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Intervalo (seg)</label>
              <input
                type="number"
                value={settings.sync_interval_seconds}
                onChange={e => setSettings(prev => (prev ? { ...prev, sync_interval_seconds: Number(e.target.value) } : prev))}
                className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#E60012] outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Concorrência máxima</label>
              <input
                type="number"
                value={settings.max_parallel_agents}
                onChange={e => setSettings(prev => (prev ? { ...prev, max_parallel_agents: Number(e.target.value) } : prev))}
                className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#E60012] outline-none"
              />
            </div>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Produtos com link Kabum</h3>
          <div className="text-xs text-gray-500">{products.length} itens</div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[1100px] w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">Produto</th>
                <th className="px-4 py-3">Preço Balão</th>
                <th className="px-4 py-3">Kabum</th>
                <th className="px-4 py-3">Preço Kabum</th>
                <th className="px-4 py-3">Estoque Kabum</th>
                <th className="px-4 py-3">Novo preço sugerido</th>
                <th className="px-4 py-3">Auto</th>
                <th className="px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map(p => {
                const pLogs = (logsByProduct.get(p.id) || []).slice(0, 3);
                const status = p.kabum_sync_status || "-";
                const isError = status === "error";
                const isOk = status === "success";
                const isManual = status === "manual_review";
                return (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900">{p.name}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-2">
                        <span>ID: {p.id}</span>
                        <span className="inline-flex items-center gap-1">
                          {isOk && <CheckCircle2 size={14} className="text-green-700" />}
                          {isError && <AlertCircle size={14} className="text-red-700" />}
                          {isManual && <AlertCircle size={14} className="text-yellow-700" />}
                          <span className={isOk ? "text-green-700" : isError ? "text-red-700" : isManual ? "text-yellow-700" : ""}>
                            {status}
                          </span>
                        </span>
                        <span>{fmtDateTime(p.kabum_last_checked_at)}</span>
                      </div>
                      {p.kabum_sync_error && <div className="text-xs text-red-700 mt-1">{p.kabum_sync_error}</div>}
                      {pLogs.length > 0 && (
                        <div className="mt-2 text-xs text-gray-500 space-y-1">
                          {pLogs.map(l => (
                            <div key={l.id} className="flex items-center gap-2">
                              <span className="font-medium">{fmtDateTime(l.created_at)}</span>
                              <span>{l.status}</span>
                              {l.error_message && <span className="text-red-700">{l.error_message}</span>}
                            </div>
                          ))}
                          <Link
                            href={`/admin/ia-kabum-sync#logs`}
                            className="inline-flex items-center gap-1 text-[#E60012] hover:underline"
                          >
                            Ver logs <ExternalLink size={12} />
                          </Link>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{p.price}</td>
                    <td className="px-4 py-3">
                      {p.kabum_url ? (
                        <a
                          href={p.kabum_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-blue-700 hover:underline"
                        >
                          Abrir <ExternalLink size={14} />
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {p.kabum_last_price != null ? formatBRL(Number(p.kabum_last_price)) : <span className="text-gray-400">-</span>}
                    </td>
                    <td className="px-4 py-3">{p.kabum_last_stock || <span className="text-gray-400">-</span>}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {p.suggested_price != null ? formatBRL(p.suggested_price) : <span className="text-gray-400">-</span>}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleProduct(p.id, !p.kabum_sync_enabled)}
                        className={`px-3 py-1 rounded-md text-xs font-medium border ${
                          p.kabum_sync_enabled ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-600 border-gray-200"
                        }`}
                      >
                        {p.kabum_sync_enabled ? "Ativo" : "Desativado"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => syncOne(p.id)}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-gray-900 text-white hover:bg-black disabled:opacity-60"
                        disabled={Boolean(runningOne[p.id])}
                      >
                        <RefreshCcw size={14} className={runningOne[p.id] ? "animate-spin" : ""} />
                        Sincronizar agora
                      </button>
                    </td>
                  </tr>
                );
              })}
              {products.length === 0 && (
                <tr>
                  <td className="px-4 py-8 text-center text-gray-500" colSpan={8}>
                    Nenhum produto com kabum_url encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div id="logs" className="rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Logs (tempo real)</h3>
          <div className="text-xs text-gray-500">{logs.length} últimos</div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">Quando</th>
                <th className="px-4 py-3">Produto</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Preço Kabum</th>
                <th className="px-4 py-3">Novo preço</th>
                <th className="px-4 py-3">Erro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.slice(0, 100).map(l => (
                <tr key={l.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">{fmtDateTime(l.created_at)}</td>
                  <td className="px-4 py-3">{l.product_id || "-"}</td>
                  <td className="px-4 py-3">{l.status || "-"}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {l.kabum_price != null ? formatBRL(Number(l.kabum_price)) : <span className="text-gray-400">-</span>}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {l.new_balao_price != null ? formatBRL(Number(l.new_balao_price)) : <span className="text-gray-400">-</span>}
                  </td>
                  <td className="px-4 py-3 text-red-700">{l.error_message || ""}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td className="px-4 py-8 text-center text-gray-500" colSpan={6}>
                    Sem logs.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

