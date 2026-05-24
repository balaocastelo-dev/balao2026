import { headers } from "next/headers";

export const dynamic = "force-dynamic";

type Snapshot = {
  ok: boolean;
  master: {
    id: string;
    planner: string;
    llamaConfigured: boolean;
    policies: {
      version: string;
      globalSeoRules: string[];
      globalGeoRules: string[];
      safetyRules: string[];
    };
  };
  agents: Array<{
    id: string;
    name: string;
    schedule: string | null;
    kind: string;
    integratedWithMaster: boolean;
    capabilities: string[];
  }>;
  runtime: Record<
    string,
    {
      status: string;
      lastRun: null | {
        at: number;
        ok: boolean;
        status: string;
        durationMs: number;
        summary: string;
      };
      runs: number;
      errors: number;
    }
  >;
  recentRuns: Array<{
    at: number;
    agentId: string;
    ok: boolean;
    status: string;
    durationMs: number;
    summary: string;
  }>;
};

function fmtDate(ms: number) {
  const d = new Date(ms);
  const ok = Number.isFinite(d.getTime());
  return ok ? d.toLocaleString("pt-BR") : "-";
}

function fmtMs(ms: number) {
  const n = Number(ms);
  if (!Number.isFinite(n)) return "-";
  if (n < 1000) return `${Math.round(n)}ms`;
  return `${(n / 1000).toFixed(1)}s`;
}

export default async function AgentesPage() {
  const h = headers();
  const host = h.get("x-forwarded-host") || h.get("host");
  const proto = h.get("x-forwarded-proto") || "https";
  const base = host ? `${proto}://${host}` : "https://www.balao.info";
  const res = await fetch(`${base}/api/agents`, { cache: "no-store" });
  const data = (await res.json()) as Snapshot;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="rounded-md border border-neutral-200 bg-white p-6">
        <h1 className="text-2xl font-extrabold tracking-tight">Agentes</h1>
        <div className="mt-2 text-sm font-semibold text-neutral-700">
          Núcleo: {data.master.id} • Planner: {data.master.planner}
          {data.master.llamaConfigured ? " • Llama ativo" : " • Fallback heurístico"}
        </div>
      </div>

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-md border border-neutral-200 bg-white p-6">
          <h2 className="text-sm font-extrabold tracking-tight">Políticas Globais</h2>
          <div className="mt-3 grid gap-4 text-sm text-neutral-800">
            <div>
              <div className="text-xs font-extrabold text-neutral-500">SEO</div>
              <ul className="mt-2 list-disc pl-5">
                {data.master.policies.globalSeoRules.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-xs font-extrabold text-neutral-500">GEO</div>
              <ul className="mt-2 list-disc pl-5">
                {data.master.policies.globalGeoRules.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-xs font-extrabold text-neutral-500">Segurança</div>
              <ul className="mt-2 list-disc pl-5">
                {data.master.policies.safetyRules.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="rounded-md border border-neutral-200 bg-white p-6">
          <h2 className="text-sm font-extrabold tracking-tight">Execuções Recentes</h2>
          <div className="mt-4 divide-y divide-neutral-200">
            {data.recentRuns.length === 0 ? (
              <div className="py-6 text-sm text-neutral-600">Sem execuções registradas neste processo.</div>
            ) : (
              data.recentRuns
                .slice()
                .reverse()
                .slice(0, 12)
                .map((r, idx) => (
                  <div key={`${r.agentId}:${r.at}:${idx}`} className="py-3 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="font-extrabold">{r.agentId}</div>
                      <div className="text-xs font-semibold text-neutral-600">
                        {fmtDate(r.at)} • {fmtMs(r.durationMs)}
                      </div>
                    </div>
                    <div className="mt-1 text-neutral-700">
                      {r.ok ? "OK" : "ERRO"} • {r.summary}
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </section>

      <section className="mt-6">
        <div className="rounded-md border border-neutral-200 bg-white">
          <div className="border-b border-neutral-200 px-6 py-4">
            <h2 className="text-sm font-extrabold tracking-tight">Lista de Agentes</h2>
          </div>
          <div className="divide-y divide-neutral-200">
            {data.agents.map((a) => {
              const rt = data.runtime?.[a.id];
              return (
                <div key={a.id} className="grid gap-2 px-6 py-4 md:grid-cols-12 md:items-center">
                  <div className="md:col-span-5">
                    <div className="text-sm font-extrabold">{a.name}</div>
                    <div className="mt-1 text-xs font-semibold text-neutral-600">{a.id}</div>
                  </div>
                  <div className="md:col-span-2">
                    <div className="text-xs font-extrabold text-neutral-500">Status</div>
                    <div className="text-sm font-semibold text-neutral-800">{rt?.status || "unknown"}</div>
                  </div>
                  <div className="md:col-span-2">
                    <div className="text-xs font-extrabold text-neutral-500">Agenda</div>
                    <div className="text-sm font-semibold text-neutral-800">{a.schedule || "-"}</div>
                  </div>
                  <div className="md:col-span-1">
                    <div className="text-xs font-extrabold text-neutral-500">Master</div>
                    <div className="text-sm font-semibold text-neutral-800">{a.integratedWithMaster ? "sim" : "não"}</div>
                  </div>
                  <div className="md:col-span-2">
                    <div className="text-xs font-extrabold text-neutral-500">Última execução</div>
                    <div className="text-sm font-semibold text-neutral-800">
                      {rt?.lastRun?.at ? `${fmtDate(rt.lastRun.at)} • ${fmtMs(rt.lastRun.durationMs)}` : "-"}
                    </div>
                  </div>
                  <div className="md:col-span-12">
                    <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold">
                      {a.capabilities.map((c) => (
                        <span key={c} className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
