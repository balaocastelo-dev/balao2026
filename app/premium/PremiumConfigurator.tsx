"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, Check } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";

type Option = { label: string; value: string };

function OptionGrid({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold text-white/90">{label}</div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {options.map((opt) => {
          const selected = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={[
                "group relative flex items-center justify-between gap-2 rounded-xl border px-3 py-3 text-left text-sm font-semibold transition",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
                selected
                  ? "border-red-500/60 bg-red-500/10 text-white"
                  : "border-white/10 bg-white/5 text-white/85 hover:border-white/20 hover:bg-white/10",
              ].join(" ")}
              aria-pressed={selected}
            >
              <span className="leading-tight">{opt.label}</span>
              <span
                className={[
                  "inline-flex h-6 w-6 items-center justify-center rounded-md border transition",
                  selected
                    ? "border-red-500/40 bg-red-500/15 text-red-200"
                    : "border-white/10 bg-black/10 text-white/60 group-hover:border-white/20",
                ].join(" ")}
                aria-hidden="true"
              >
                <Check className={selected ? "h-4 w-4" : "h-4 w-4 opacity-0"} />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function PremiumConfigurator() {
  const finalidadeOptions: Option[] = [
    { label: "Jogos", value: "Jogos" },
    { label: "Trabalho", value: "Trabalho" },
    { label: "Edição", value: "Edição" },
    { label: "Streaming", value: "Streaming" },
    { label: "Arquitetura", value: "Arquitetura" },
    { label: "Estudos", value: "Estudos" },
  ];
  const processadorOptions: Option[] = [
    { label: "Intel", value: "Intel" },
    { label: "AMD", value: "AMD" },
  ];
  const gpuOptions: Option[] = [
    { label: "Entrada", value: "Entrada" },
    { label: "Intermediária", value: "Intermediária" },
    { label: "Alta performance", value: "Alta performance" },
    { label: "Extreme", value: "Extreme" },
  ];
  const ramOptions: Option[] = [
    { label: "16GB", value: "16GB" },
    { label: "32GB", value: "32GB" },
    { label: "64GB+", value: "64GB ou mais" },
  ];
  const storageOptions: Option[] = [
    { label: "SSD 512GB", value: "SSD 512GB" },
    { label: "SSD 1TB", value: "SSD 1TB" },
    { label: "SSD 2TB", value: "SSD 2TB" },
  ];
  const gabineteOptions: Option[] = [
    { label: "Clean", value: "Clean" },
    { label: "Gamer RGB", value: "Gamer RGB" },
    { label: "Aquário", value: "Aquário" },
    { label: "Premium", value: "Premium" },
  ];
  const orcamentoOptions: Option[] = [
    { label: "Até R$ 3.000", value: "até R$ 3.000" },
    { label: "R$ 3–5 mil", value: "R$ 3.000 a R$ 5.000" },
    { label: "R$ 5–8 mil", value: "R$ 5.000 a R$ 8.000" },
    { label: "Acima de R$ 8 mil", value: "acima de R$ 8.000" },
  ];

  const [finalidade, setFinalidade] = useState(finalidadeOptions[0].value);
  const [processador, setProcessador] = useState(processadorOptions[0].value);
  const [gpu, setGpu] = useState(gpuOptions[1].value);
  const [ram, setRam] = useState(ramOptions[1].value);
  const [storage, setStorage] = useState(storageOptions[1].value);
  const [gabinete, setGabinete] = useState(gabineteOptions[1].value);
  const [orcamento, setOrcamento] = useState(orcamentoOptions[2].value);

  const whatsappHref = useMemo(() => {
    const messageLines = [
      "Olá, quero montar um PC Premium no Balão da Informática",
      "",
      `Finalidade: ${finalidade}`,
      `Processador: ${processador}`,
      `Placa de vídeo: ${gpu}`,
      `Memória RAM: ${ram}`,
      `Armazenamento: ${storage}`,
      `Gabinete: ${gabinete}`,
      `Orçamento aproximado: ${orcamento}`,
    ];

    const text = messageLines.join("\n");
    return `https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(text)}`;
  }, [finalidade, processador, gpu, ram, storage, gabinete, orcamento]);

  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] sm:p-8">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <OptionGrid
            label="Finalidade"
            options={finalidadeOptions}
            value={finalidade}
            onChange={setFinalidade}
          />
          <OptionGrid
            label="Processador"
            options={processadorOptions}
            value={processador}
            onChange={setProcessador}
          />
          <OptionGrid
            label="Placa de vídeo"
            options={gpuOptions}
            value={gpu}
            onChange={setGpu}
          />
          <OptionGrid
            label="Memória RAM"
            options={ramOptions}
            value={ram}
            onChange={setRam}
          />
        </div>
        <div className="space-y-6">
          <OptionGrid
            label="Armazenamento"
            options={storageOptions}
            value={storage}
            onChange={setStorage}
          />
          <OptionGrid
            label="Gabinete"
            options={gabineteOptions}
            value={gabinete}
            onChange={setGabinete}
          />
          <OptionGrid
            label="Orçamento aproximado"
            options={orcamentoOptions}
            value={orcamento}
            onChange={setOrcamento}
          />

          <div className="rounded-2xl border border-white/10 bg-black/30 p-4 sm:p-5">
            <div className="text-sm font-semibold text-white/90">
              Resumo para WhatsApp
            </div>
            <div className="mt-3 space-y-1 text-sm text-white/75">
              <div>Finalidade: {finalidade}</div>
              <div>Processador: {processador}</div>
              <div>Placa de vídeo: {gpu}</div>
              <div>Memória RAM: {ram}</div>
              <div>Armazenamento: {storage}</div>
              <div>Gabinete: {gabinete}</div>
              <div>Orçamento: {orcamento}</div>
            </div>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-base font-extrabold text-white shadow-lg shadow-[#25D366]/20 transition hover:bg-[#128C7E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              aria-label="Enviar configuração selecionada no WhatsApp"
            >
              Enviar configuração no WhatsApp
              <ArrowUpRight className="h-5 w-5" />
            </a>
            <div className="mt-3 text-xs text-white/55">
              Atendimento humano. A equipe confirma compatibilidade, estoque e
              sugestões de upgrade.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
