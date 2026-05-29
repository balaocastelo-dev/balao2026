"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle,
  Circle,
  Loader2,
  Link as LinkIcon,
  Cpu,
  MemoryStick,
  HardDrive,
  Monitor,
  Snowflake,
  Tag,
  Sparkles,
  Copy,
  ExternalLink,
  Smartphone,
  Tablet,
  MonitorSmartphone,
  Save,
  Wand2,
  Send,
} from "lucide-react";

import type { VitrineCategory, VitrineExtractedParts, VitrinePageRecord, VitrineStatus } from "@/lib/vitrine/types";
import { normalizeInputText, pickPcHeroImage, toSlug } from "@/lib/vitrine/core";

type StepStatus = "idle" | "running" | "done" | "error";

const CATEGORIES: VitrineCategory[] = [
  "PC Gamer",
  "Workstation",
  "PC para escritório",
  "PC para edição",
  "PC para arquitetura",
  "PC para programação",
  "PC custo-benefício",
];

function Step({
  label,
  status,
}: {
  label: string;
  status: StepStatus;
}) {
  const Icon =
    status === "done" ? CheckCircle : status === "running" ? Loader2 : Circle;
  const cls =
    status === "done"
      ? "text-[#16a34a]"
      : status === "running"
        ? "text-[#d71920]"
        : status === "error"
          ? "text-[#d71920]"
          : "text-gray-400";

  return (
    <div className="flex items-center gap-2">
      <Icon size={16} className={`${cls} ${status === "running" ? "animate-spin" : ""}`} />
      <span className={`text-sm font-semibold ${status === "idle" ? "text-gray-500" : "text-[#111111]"}`}>
        {label}
      </span>
    </div>
  );
}

function FieldRow({
  icon: Icon,
  label,
  value,
  onChange,
  identified,
  placeholder,
}: {
  icon: any;
  label: string;
  value: string;
  onChange: (next: string) => void;
  identified: boolean;
  placeholder?: string;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-black/5 last:border-b-0">
      <div className="w-9 h-9 rounded-lg bg-[#f5f5f5] border border-black/5 flex items-center justify-center text-[#333333]">
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3">
          <div className="font-bold text-sm text-[#111111]">{label}</div>
          <span
            className={`text-xs font-extrabold px-2 py-1 rounded-full ${
              identified ? "bg-green-50 text-[#16a34a] border border-green-200" : "bg-gray-50 text-gray-500 border border-gray-200"
            }`}
          >
            {identified ? "Identificado" : "Manual"}
          </span>
        </div>
        <input
          className="mt-2 w-full px-3 py-2 rounded-lg border border-black/10 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#d71920]/30"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}

export default function AdminGeradorPage() {
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const [pageId, setPageId] = useState<string | null>(null);
  const [nomePc, setNomePc] = useState("");
  const [descricaoOuLink, setDescricaoOuLink] = useState("");
  const [categoria, setCategoria] = useState<VitrineCategory>("PC Gamer");

  const [slug, setSlug] = useState("");
  const [slugAvailable, setSlugAvailable] = useState(true);

  const [parts, setParts] = useState<VitrineExtractedParts>({});
  const [extras, setExtras] = useState<Record<string, string>>({});
  const [applicationsText, setApplicationsText] = useState("");
  const [scrapedImages, setScrapedImages] = useState<string[]>([]);

  const [steps, setSteps] = useState<Record<"modelo" | "pecas" | "url" | "pronta", StepStatus>>({
    modelo: "idle",
    pecas: "idle",
    url: "idle",
    pronta: "idle",
  });

  const urlFinal = useMemo(() => {
    const s = slug || toSlug(nomePc);
    return `https://www.balao.info/vitrine/${s || "pc"}`;
  }, [slug, nomePc]);

  const heroImage = useMemo(() => pickPcHeroImage({ ...parts, categoria }), [parts, categoria]);

  useEffect(() => {
    if (!editId) return;
    setStatus("loading");
    fetch(`/api/vitrine/pages/${editId}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data?.success) throw new Error(data?.error || "Falha ao carregar");
        const p = data.page as VitrinePageRecord;
        setPageId(p.id);
        setNomePc(p.nome_pc);
        setSlug(p.slug);
        setCategoria(p.categoria);
        setDescricaoOuLink(p.descricao_original || "");
        setParts({
          processador: p.processador || "",
          placa_video: p.placa_video || "",
          memoria_ram: p.memoria_ram || "",
          armazenamento: p.armazenamento || "",
          sistema_operacional: p.sistema_operacional || "",
          resfriamento: p.resfriamento || "",
          categoria: p.categoria,
          aplicacoes: p.aplicacoes || [],
        });
        setExtras((p as any).extras || {});
        setApplicationsText((p.aplicacoes || []).join(", "));
        const storedHero = (p as any)?.images?.hero ? [String((p as any).images.hero)] : [];
        setScrapedImages(storedHero);
        setSteps({ modelo: "done", pecas: "done", url: "done", pronta: p.status === "publicada" ? "done" : "idle" });
        setStatus("success");
        setMessage("Página carregada para edição.");
      })
      .catch((e) => {
        setStatus("error");
        setMessage(e?.message || "Falha ao carregar");
      });
  }, [editId]);

  const identify = async () => {
    setStatus("loading");
    setMessage("Identificando modelo e componentes...");
    setSteps({ modelo: "running", pecas: "idle", url: "idle", pronta: "idle" });

    const res = await fetch("/api/vitrine/identify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nomePc, input: normalizeInputText(descricaoOuLink), categoria }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.success) {
      setStatus("error");
      setMessage(data?.error || "Falha ao identificar");
      setSteps({ modelo: "error", pecas: "idle", url: "idle", pronta: "idle" });
      return;
    }

    setSteps({ modelo: "done", pecas: "running", url: "idle", pronta: "idle" });
    const nextParts = data.parts as VitrineExtractedParts;
    setParts(nextParts);
    setExtras((data?.extras && typeof data.extras === "object") ? data.extras : {});
    setApplicationsText(Array.isArray(nextParts.aplicacoes) ? nextParts.aplicacoes.join(", ") : "");
    setScrapedImages(Array.isArray(data?.scraped?.images) ? data.scraped.images : []);

    setSteps({ modelo: "done", pecas: "done", url: "running", pronta: "idle" });
    setSlug(String(data.slug || ""));
    setSlugAvailable(Boolean(data.slugAvailable));
    setSteps({ modelo: "done", pecas: "done", url: "done", pronta: "idle" });

    setStatus("success");
    setMessage("Peças identificadas. Você pode ajustar qualquer campo antes de gerar/publicar.");
  };

  const save = async (nextStatus: VitrineStatus) => {
    const payload = {
      nome_pc: nomePc.trim(),
      slug: (slug || toSlug(nomePc)).trim(),
      categoria,
      descricao_original: descricaoOuLink,
      source_url: /^https?:\/\//i.test(descricaoOuLink.trim()) ? descricaoOuLink.trim() : null,
      processador: String(parts.processador || ""),
      placa_video: String(parts.placa_video || ""),
      memoria_ram: String(parts.memoria_ram || ""),
      armazenamento: String(parts.armazenamento || ""),
      sistema_operacional: String(parts.sistema_operacional || ""),
      resfriamento: String(parts.resfriamento || ""),
      aplicacoes: applicationsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      extras,
      status: nextStatus,
    };

    if (!payload.nome_pc) {
      setStatus("error");
      setMessage("Informe o nome do PC.");
      return;
    }

    setStatus("loading");
    setMessage(nextStatus === "publicada" ? "Publicando página..." : "Salvando rascunho...");

    try {
      let res: Response;
      if (pageId) {
        res = await fetch(`/api/vitrine/pages/${pageId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/vitrine/pages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) throw new Error(data?.error || "Falha ao salvar");

      const saved = data.page as VitrinePageRecord;
      setPageId(saved.id);
      setSlug(saved.slug);
      if (nextStatus === "publicada") {
        setSteps((prev) => ({ ...prev, pronta: "done" }));
        setMessage("Página publicada. Gerando imagens de IA...");
        try {
          const imgRes = await fetch("/api/vitrine/images/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: saved.id }),
          });
          const imgData = await imgRes.json().catch(() => null);
          if (imgRes.ok && imgData?.success) {
            const heroUrl = imgData?.page?.images?.hero ? [String(imgData.page.images.hero)] : [];
            if (heroUrl.length > 0) setScrapedImages(heroUrl);
            setMessage("Página publicada e imagens geradas com sucesso!");
            setStatus("success");
          } else {
            setStatus("success");
            setMessage("Página publicada. Imagens não foram geradas (verifique configuração do gerador).");
          }
        } catch {
          setStatus("success");
          setMessage("Página publicada. Imagens não foram geradas (verifique configuração do gerador).");
        }
      } else {
        setStatus("success");
        setMessage("Rascunho salvo.");
      }
    } catch (e: any) {
      setStatus("error");
      setMessage(e?.message || "Falha ao salvar");
    }
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(urlFinal);
      setMessage("URL copiada.");
      setStatus("success");
    } catch {
      setMessage("Não foi possível copiar a URL.");
      setStatus("error");
    }
  };

  const previewLink = useMemo(() => `/vitrine/${(slug || toSlug(nomePc) || "pc").trim()}`, [slug, nomePc]);

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111111] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#d71920] text-white flex items-center justify-center shadow-sm">
            <Sparkles size={20} />
          </div>
          Gerador de Páginas Exclusivas
        </h1>
        <p className="mt-2 text-sm text-[#333333] max-w-3xl">
          Cole o nome, descrição ou link do produto e o sistema identifica automaticamente o modelo e os componentes para criar uma página exclusiva e otimizada.
        </p>
      </div>

      <div className="bg-white border border-black/5 rounded-2xl shadow-sm p-4 sm:p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Step label="Modelo identificado" status={steps.modelo} />
          <Step label="Peças extraídas" status={steps.pecas} />
          <Step label="URL gerada" status={steps.url} />
          <Step label="Página pronta" status={steps.pronta} />
        </div>
      </div>

      {message && (
        <div
          className={`mb-6 rounded-2xl border px-4 py-3 text-sm font-semibold ${
            status === "success"
              ? "bg-green-50 border-green-200 text-[#16a34a]"
              : status === "error"
                ? "bg-red-50 border-red-200 text-[#d71920]"
                : "bg-gray-50 border-black/5 text-[#333333]"
          }`}
        >
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white border border-black/5 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-black/5">
              <div className="font-extrabold text-[#111111]">1. Informações do produto</div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#333333] mb-2">Nome do PC</label>
                <input
                  value={nomePc}
                  onChange={(e) => setNomePc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#d71920]/30"
                  placeholder="Ex: PC Workstation AMD Ryzen 7 7700, RTX 5060 Ti..."
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#333333] mb-2">Descrição ou link do produto</label>
                <textarea
                  value={descricaoOuLink}
                  onChange={(e) => setDescricaoOuLink(e.target.value)}
                  className="w-full min-h-[120px] px-3 py-2 rounded-lg border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#d71920]/30"
                  placeholder="Cole o texto ou um link do produto"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#333333] mb-2">Categoria</label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value as VitrineCategory)}
                  className="w-full px-3 py-2 rounded-lg border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#d71920]/30 bg-white"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={identify}
                  disabled={!nomePc.trim() && !descricaoOuLink.trim()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#d71920] text-white font-extrabold text-sm hover:bg-[#b9151b] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Wand2 size={18} />
                  Identificar peças
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white border border-black/5 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-black/5">
              <div className="font-extrabold text-[#111111]">2. Detalhes extraídos automaticamente</div>
            </div>
            <div className="p-6">
              <div className="rounded-xl border border-black/5 overflow-hidden">
                <FieldRow
                  icon={Cpu}
                  label="Processador"
                  value={String(parts.processador || "")}
                  onChange={(v) => setParts((p) => ({ ...p, processador: v }))}
                  identified={Boolean(parts.processador)}
                  placeholder="Ex: AMD Ryzen 7 7700"
                />
                <FieldRow
                  icon={Monitor}
                  label="Placa de vídeo"
                  value={String(parts.placa_video || "")}
                  onChange={(v) => setParts((p) => ({ ...p, placa_video: v }))}
                  identified={Boolean(parts.placa_video)}
                  placeholder="Ex: NVIDIA GeForce RTX 5060 Ti 16GB"
                />
                <FieldRow
                  icon={MemoryStick}
                  label="Memória RAM"
                  value={String(parts.memoria_ram || "")}
                  onChange={(v) => setParts((p) => ({ ...p, memoria_ram: v }))}
                  identified={Boolean(parts.memoria_ram)}
                  placeholder="Ex: 64GB DDR5"
                />
                <FieldRow
                  icon={HardDrive}
                  label="Armazenamento"
                  value={String(parts.armazenamento || "")}
                  onChange={(v) => setParts((p) => ({ ...p, armazenamento: v }))}
                  identified={Boolean(parts.armazenamento)}
                  placeholder="Ex: 2TB NVMe"
                />
                <FieldRow
                  icon={Tag}
                  label="Sistema operacional"
                  value={String(parts.sistema_operacional || "")}
                  onChange={(v) => setParts((p) => ({ ...p, sistema_operacional: v }))}
                  identified={Boolean(parts.sistema_operacional)}
                  placeholder="Ex: Windows 11"
                />
                <FieldRow
                  icon={Snowflake}
                  label="Resfriamento"
                  value={String(parts.resfriamento || "")}
                  onChange={(v) => setParts((p) => ({ ...p, resfriamento: v }))}
                  identified={Boolean(parts.resfriamento)}
                  placeholder="Ex: Water Cooler 240mm"
                />
                <FieldRow
                  icon={Sparkles}
                  label="Aplicações indicadas"
                  value={applicationsText}
                  onChange={setApplicationsText}
                  identified={Boolean(applicationsText.trim())}
                  placeholder="Ex: Edição de vídeo, Modelagem 3D, Programação..."
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-black/5 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-black/5">
              <div className="font-extrabold text-[#111111]">3. URL da página gerada automaticamente</div>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-gray-500 mb-1">URL</div>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#f5f5f5] border border-black/5">
                    <LinkIcon size={16} className="text-gray-500 flex-shrink-0" />
                    <div className="text-sm font-semibold text-[#111111] truncate">{urlFinal}</div>
                  </div>
                </div>
                <button
                  onClick={copyUrl}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-black/10 bg-white font-extrabold text-sm hover:bg-black/5"
                >
                  <Copy size={16} />
                  Copiar URL
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div
                  className={`text-xs font-extrabold px-3 py-1.5 rounded-full border ${
                    slugAvailable ? "bg-green-50 border-green-200 text-[#16a34a]" : "bg-red-50 border-red-200 text-[#d71920]"
                  }`}
                >
                  {slugAvailable ? "Disponível" : "Ajustada automaticamente"}
                </div>
                <input
                  value={slug}
                  onChange={(e) => setSlug(toSlug(e.target.value))}
                  className="px-3 py-2 rounded-lg border border-black/10 text-sm font-semibold w-[320px] max-w-full"
                  placeholder="slug-da-pagina"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-black/5 rounded-2xl shadow-sm p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => save("rascunho")}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-black/10 bg-white font-extrabold text-sm hover:bg-black/5"
              >
                <Save size={16} />
                Salvar rascunho
              </button>
              <button
                onClick={() => {
                  setSteps((prev) => ({ ...prev, pronta: prev.pronta === "done" ? "done" : "running" }));
                  setTimeout(() => setSteps((prev) => ({ ...prev, pronta: prev.pronta === "done" ? "done" : "idle" })), 450);
                }}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#111111] text-white font-extrabold text-sm hover:bg-black"
              >
                <Wand2 size={16} />
                Gerar página
              </button>
              <button
                onClick={() => save("publicada")}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#d71920] text-white font-extrabold text-sm hover:bg-[#b9151b]"
              >
                <Send size={16} />
                Publicar página
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-black/5 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-black/5 flex items-center justify-between gap-3">
              <div>
                <div className="font-extrabold text-[#111111]">Prévia da página exclusiva</div>
                <div className="text-xs text-[#333333] mt-1 truncate">{urlFinal}</div>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-2 rounded-lg border border-black/10 hover:bg-black/5 text-sm font-extrabold inline-flex items-center gap-2">
                  <MonitorSmartphone size={16} /> Desktop
                </button>
                <button className="px-3 py-2 rounded-lg border border-black/10 hover:bg-black/5 text-sm font-extrabold hidden sm:inline-flex items-center gap-2">
                  <Tablet size={16} /> Tablet
                </button>
                <button className="px-3 py-2 rounded-lg border border-black/10 hover:bg-black/5 text-sm font-extrabold hidden sm:inline-flex items-center gap-2">
                  <Smartphone size={16} /> Celular
                </button>
                <Link
                  href={previewLink}
                  target="_blank"
                  className="px-3 py-2 rounded-lg bg-[#111111] text-white hover:bg-black text-sm font-extrabold inline-flex items-center gap-2"
                >
                  <ExternalLink size={16} />
                  Abrir
                </Link>
              </div>
            </div>

            <div className="p-6">
              <div className="rounded-2xl border border-black/10 bg-[#f5f5f5] overflow-hidden">
                <div className="bg-white border-b border-black/10 px-4 py-3 flex items-center justify-between">
                  <div className="text-xs font-extrabold text-[#333333]">www.balao.info</div>
                  <div className="text-xs font-semibold text-gray-500">{pageId ? "Salvo" : "Prévia"}</div>
                </div>
                <div className="p-5 bg-white">
                  <div className="flex items-start gap-4">
                    <div className="w-28 h-28 rounded-2xl border border-black/10 bg-white flex items-center justify-center overflow-hidden">
                      <img src={scrapedImages[0] || heroImage} alt="" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-lg font-extrabold text-[#111111] truncate">{nomePc || "PC Exclusivo"}</div>
                      <div className="text-sm text-[#333333] mt-1">
                        Desempenho excepcional para trabalho, criação e jogos com estabilidade e fluidez.
                      </div>
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        <div className="px-3 py-2 rounded-lg bg-[#f5f5f5] border border-black/5 font-semibold text-[#111111]">
                          {parts.processador || "Processador"}
                        </div>
                        <div className="px-3 py-2 rounded-lg bg-[#f5f5f5] border border-black/5 font-semibold text-[#111111]">
                          {parts.placa_video || "Placa de vídeo"}
                        </div>
                        <div className="px-3 py-2 rounded-lg bg-[#f5f5f5] border border-black/5 font-semibold text-[#111111]">
                          {parts.memoria_ram || "Memória RAM"}
                        </div>
                        <div className="px-3 py-2 rounded-lg bg-[#f5f5f5] border border-black/5 font-semibold text-[#111111]">
                          {parts.armazenamento || "Armazenamento"}
                        </div>
                      </div>
                      <div className="mt-4">
                        <a
                          href={`https://wa.me/5519987510267?text=${encodeURIComponent(
                            `Olá, vim pela página do PC ${nomePc || "PC Exclusivo"} e gostaria de mais informações.`
                          )}`}
                          target="_blank"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#16a34a] text-white font-extrabold text-sm hover:bg-green-700"
                        >
                          <Send size={16} />
                          Chamar no WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
