type EditorialPolicies = {
  version: string;
  mustHaveCoverImage: boolean;
  forbidCoverInBody: boolean;
  maxPlagiarismSimilarity: number;
  allowedVideoHosts: string[];
  requiredMobileImage: boolean;
  regionalKeywords: string[];
};

export type MasterAgentId =
  | "cron.blog-minute"
  | "cron.blog-rss"
  | "cron.blog-product"
  | "cron.blog-balao-item"
  | "cron.blog-trends-daily"
  | "cron.process-emails"
  | "cron.marketing"
  | "admin.ia-kabum-sync"
  | "ai.rewrite-description"
  | "agent.master"
  | "agent.rss-collector"
  | "agent.article-reader"
  | "agent.images"
  | "agent.videos"
  | "agent.journalistic"
  | "agent.seo-geo"
  | "agent.regional-campinas";

export type MasterAgentStatus = "idle" | "running" | "error" | "disabled";

export type MasterAgentSpec = {
  id: MasterAgentId;
  name: string;
  schedule: string | null;
  kind: "cron" | "api" | "admin";
  integratedWithMaster: boolean;
  capabilities: string[];
};

export type MasterAgentRunRecord = {
  at: number;
  agentId: MasterAgentId;
  ok: boolean;
  status: MasterAgentStatus;
  durationMs: number;
  summary: string;
  meta?: Record<string, any>;
};

export type MasterPolicies = {
  version: string;
  globalSeoRules: string[];
  globalGeoRules: string[];
  safetyRules: string[];
  editorialPolicies: EditorialPolicies;
};

type AgentRuntime = {
  status: MasterAgentStatus;
  lastRun: MasterAgentRunRecord | null;
  runs: number;
  errors: number;
};

function getDefaultEditorialPolicies(): EditorialPolicies {
  return {
    version: "v1",
    mustHaveCoverImage: true,
    forbidCoverInBody: true,
    maxPlagiarismSimilarity: 0.22,
    allowedVideoHosts: ["youtube.com", "www.youtube.com", "youtu.be", "globoplay.globo.com", "www.youtube-nocookie.com"],
    requiredMobileImage: true,
    regionalKeywords: [
      "campinas",
      "rmc",
      "castelo",
      "sumaré",
      "sumare",
      "hortolândia",
      "hortolandia",
      "paulínia",
      "paulinia",
      "valinhos",
      "vinhedo",
      "indaiatuba",
      "jaguariúna",
      "jaguariuna",
    ],
  };
}

function getDefaultPolicies(): MasterPolicies {
  return {
    version: "v1",
    globalSeoRules: [
      "Título claro, curto e descritivo",
      "Descrição objetiva com intenção de busca",
      "Conteúdo escaneável: h2/h3 + listas",
      "Imagens e embeds responsivos quando existirem",
      "Fonte citada no final quando vier de RSS",
    ],
    globalGeoRules: ["Conteúdo local deve citar Campinas e região quando for pertinente", "Evitar generalizações e manter linguagem pt-BR"],
    safetyRules: [
      "Nunca expor segredos/keys",
      "Evitar embeds fora da whitelist",
      "Não copiar texto integral da fonte",
      "Nunca publicar matéria sem imagem",
      "Proibido repetir a imagem de capa no corpo",
    ],
    editorialPolicies: getDefaultEditorialPolicies(),
  };
}

function getDefaultAgents(): MasterAgentSpec[] {
  return [
    {
      id: "cron.blog-minute",
      name: "Blog: agente central (1/min)",
      schedule: "* * * * *",
      kind: "cron",
      integratedWithMaster: true,
      capabilities: ["publicação", "mix fontes", "vídeo Campinas", "SEO/GEO"],
    },
    {
      id: "cron.blog-rss",
      name: "Blog: RSS (legado)",
      schedule: null,
      kind: "cron",
      integratedWithMaster: false,
      capabilities: ["RSS", "publicação"],
    },
    {
      id: "cron.blog-product",
      name: "Blog: Produto catálogo (legado)",
      schedule: null,
      kind: "cron",
      integratedWithMaster: false,
      capabilities: ["produto", "publicação"],
    },
    {
      id: "cron.blog-balao-item",
      name: "Blog: Produto balao.info (legado)",
      schedule: null,
      kind: "cron",
      integratedWithMaster: false,
      capabilities: ["scrape balao.info", "publicação"],
    },
    {
      id: "cron.blog-trends-daily",
      name: "Blog: Trends (legado)",
      schedule: null,
      kind: "cron",
      integratedWithMaster: false,
      capabilities: ["trends", "publicação"],
    },
    {
      id: "cron.process-emails",
      name: "Processar emails",
      schedule: null,
      kind: "cron",
      integratedWithMaster: false,
      capabilities: ["email", "automação"],
    },
    {
      id: "cron.marketing",
      name: "Marketing: automações",
      schedule: null,
      kind: "cron",
      integratedWithMaster: false,
      capabilities: ["marketing", "automação"],
    },
    {
      id: "admin.ia-kabum-sync",
      name: "IA Kabum Sync (admin)",
      schedule: null,
      kind: "admin",
      integratedWithMaster: false,
      capabilities: ["preços", "sync", "validação", "llama opcional"],
    },
    {
      id: "ai.rewrite-description",
      name: "Reescrita de texto (API)",
      schedule: null,
      kind: "api",
      integratedWithMaster: false,
      capabilities: ["reescrita", "SEO"],
    },
    {
      id: "agent.master",
      name: "Agente Mestre (editorial)",
      schedule: null,
      kind: "api",
      integratedWithMaster: true,
      capabilities: ["prioridades", "aprovação", "anti-plágio", "publicação", "supervisão"],
    },
    {
      id: "agent.rss-collector",
      name: "Agente Coletor RSS",
      schedule: null,
      kind: "api",
      integratedWithMaster: true,
      capabilities: ["monitora feeds", "evita duplicidade", "registra fontes"],
    },
    {
      id: "agent.article-reader",
      name: "Agente Leitor de Matéria",
      schedule: null,
      kind: "api",
      integratedWithMaster: true,
      capabilities: ["limpeza HTML", "extração título/autor/data", "conteúdo principal"],
    },
    {
      id: "agent.images",
      name: "Agente de Imagens",
      schedule: null,
      kind: "api",
      integratedWithMaster: true,
      capabilities: ["extrai imagens", "ALT text", "imagem principal", "prompt quando faltar"],
    },
    {
      id: "agent.videos",
      name: "Agente de Vídeos",
      schedule: null,
      kind: "api",
      integratedWithMaster: true,
      capabilities: ["valida embeds", "prioriza Campinas/RMC", "associa vídeos"],
    },
    {
      id: "agent.journalistic",
      name: "Agente Jornalístico",
      schedule: null,
      kind: "api",
      integratedWithMaster: true,
      capabilities: ["reescreve sem plágio", "novo título/subtítulo", "leitura rápida"],
    },
    {
      id: "agent.seo-geo",
      name: "Agente SEO/GEO",
      schedule: null,
      kind: "api",
      integratedWithMaster: true,
      capabilities: ["meta title/description", "slug", "schema.org", "FAQ", "Discover", "GEO"],
    },
    {
      id: "agent.regional-campinas",
      name: "Agente Regional Campinas/RMC",
      schedule: null,
      kind: "api",
      integratedWithMaster: true,
      capabilities: ["detectar relação regional", "contexto local", "priorizar termos locais"],
    },
  ];
}

function nowMs() {
  return Date.now();
}

function makeKey(id: MasterAgentId) {
  return `agent:${id}`;
}

export class MasterAgent {
  private policies: MasterPolicies;
  private specs: Map<MasterAgentId, MasterAgentSpec>;
  private runtime: Map<MasterAgentId, AgentRuntime>;
  private runs: MasterAgentRunRecord[];

  constructor() {
    this.policies = getDefaultPolicies();
    this.specs = new Map(getDefaultAgents().map((a) => [a.id, a]));
    this.runtime = new Map();
    this.runs = [];
    for (const a of this.specs.values()) {
      this.runtime.set(a.id, { status: "idle", lastRun: null, runs: 0, errors: 0 });
    }
  }

  getPolicies(): MasterPolicies {
    return this.policies;
  }

  getAgents(): MasterAgentSpec[] {
    return Array.from(this.specs.values());
  }

  getRuntime() {
    const out: Record<string, AgentRuntime> = {};
    for (const [id, rt] of this.runtime.entries()) {
      out[id] = rt;
    }
    return out;
  }

  getRecentRuns(limit = 50): MasterAgentRunRecord[] {
    return this.runs.slice(-Math.max(1, Math.min(200, limit)));
  }

  start(agentId: MasterAgentId) {
    const rt = this.runtime.get(agentId);
    if (!rt) return;
    rt.status = "running";
  }

  finish(input: { agentId: MasterAgentId; ok: boolean; startedAtMs: number; summary: string; meta?: Record<string, any> }) {
    const rt = this.runtime.get(input.agentId);
    if (!rt) return;
    const durationMs = Math.max(0, nowMs() - input.startedAtMs);
    rt.runs += 1;
    const status: MasterAgentStatus = input.ok ? "idle" : "error";
    if (!input.ok) rt.errors += 1;
    rt.status = status;

    const record: MasterAgentRunRecord = {
      at: nowMs(),
      agentId: input.agentId,
      ok: input.ok,
      status,
      durationMs,
      summary: input.summary,
      meta: input.meta,
    };
    rt.lastRun = record;
    this.runs.push(record);
    if (this.runs.length > 500) this.runs.splice(0, this.runs.length - 500);
  }
}

function getSingleton(): MasterAgent {
  const g = globalThis as any;
  const key = "__balao_master_agent__";
  if (!g[key]) {
    g[key] = new MasterAgent();
  }
  return g[key] as MasterAgent;
}

export function getMasterAgent(): MasterAgent {
  return getSingleton();
}

export function recordAgentRun(input: { agentId: MasterAgentId; ok: boolean; startedAtMs: number; summary: string; meta?: Record<string, any> }) {
  const master = getSingleton();
  master.finish(input);
}

export function markAgentRunning(agentId: MasterAgentId) {
  const master = getSingleton();
  master.start(agentId);
}

export function getMasterAgentStatusSnapshot() {
  const master = getSingleton();
  const llamaConfigured = Boolean(process.env.LLAMA_API_URL && process.env.LLAMA_MODEL);
  return {
    master: {
      id: "llama-open-source-master",
      planner: llamaConfigured ? "llama-openai-compatible" : "heuristic-fallback",
      llamaConfigured,
      policies: master.getPolicies(),
    },
    agents: master.getAgents(),
    runtime: master.getRuntime(),
    recentRuns: master.getRecentRuns(60),
  };
}
