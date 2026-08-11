"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";

type Config = {
  greeting: string;
  voiceEnabled: boolean;
  maxResults: number;
  engine: string;
  voiceName: string | null;
  fallbackStrategy: string;
};

export default function AssistantSettings() {
  const [config, setConfig] = useState<Config>({
    greeting: "Olá! Sou o assistente do Balão da Informática. Como posso te ajudar hoje?",
    voiceEnabled: true,
    maxResults: 5,
    engine: "groq",
    voiceName: null,
    fallbackStrategy: "supabase",
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/assistant/settings");
        if (res.ok) {
          const data = await res.json();
          setConfig({
            greeting: data.greeting ?? config.greeting,
            voiceEnabled: typeof data.voiceEnabled === "boolean" ? data.voiceEnabled : config.voiceEnabled,
            maxResults: Number(data.maxResults) || config.maxResults,
            engine: data.engine ?? "groq",
            voiceName: data.voiceName ?? null,
            fallbackStrategy: data.fallbackStrategy ?? "supabase",
          });
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);
  
  useEffect(() => {
    const updateVoices = () => {
      const list = window.speechSynthesis.getVoices();
      const ptVoices = list.filter(v => (v.lang || "").toLowerCase().startsWith("pt"));
      setVoices(ptVoices.length > 0 ? ptVoices : list);
    };
    updateVoices();
    if (typeof window !== "undefined") {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  const handleSave = () => {
    const run = async () => {
      const res = await fetch("/api/assistant/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    };
    run();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Configurações do Assistente</h2>
      </div>

      {loading && <div className="text-sm text-gray-500">Carregando configurações...</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
            Saudação Inicial (pt-BR)
          </label>
          <input
            type="text"
            value={config.greeting}
            onChange={(e) => setConfig((c) => ({ ...c, greeting: e.target.value }))}
            className="w-full p-2 border rounded-md"
            placeholder="Ex: Olá! Posso ajudar a encontrar um notebook?"
          />
          <p className="text-xs text-gray-500 mt-1">
            Frase falada ao iniciar o assistente. Mantenha tom humano e acolhedor.
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
            Resultados Máximos
          </label>
          <input
            type="number"
            min={1}
            max={20}
            value={config.maxResults}
            onChange={(e) => setConfig((c) => ({ ...c, maxResults: Number(e.target.value) }))}
            className="w-full p-2 border rounded-md"
          />
          <p className="text-xs text-gray-500 mt-1">
            Quantos produtos sugerir por resposta.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="voiceEnabled"
            type="checkbox"
            checked={config.voiceEnabled}
            onChange={(e) => setConfig((c) => ({ ...c, voiceEnabled: e.target.checked }))}
            className="w-4 h-4 text-[#E60012] rounded border-gray-300 focus:ring-[#E60012]"
          />
          <label htmlFor="voiceEnabled" className="text-sm text-gray-700">
            Ativar fala (síntese de voz)
          </label>
        </div>
        
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
            Voz (pt-BR)
          </label>
          <select
            value={config.voiceName ?? ""}
            onChange={(e) => setConfig((c) => ({ ...c, voiceName: e.target.value || null }))}
            className="w-full p-2 border rounded-md"
          >
            <option value="">Padrão do navegador</option>
            {voices.map(v => (
              <option key={v.voiceURI} value={v.name}>
                {v.name} ({v.lang})
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Lista de vozes disponíveis gratuitamente via navegador.
          </p>
        </div>
        
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
            Motor de IA
          </label>
          <select
            value={config.engine}
            onChange={(e) => setConfig((c) => ({ ...c, engine: e.target.value }))}
            className="w-full p-2 border rounded-md"
          >
            <option value="groq">Groq (se chave estiver configurada)</option>
            <option value="rulebased">Grátis (lógico sobre produtos)</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Seleciona o cérebro: pago (Groq) ou gratuito (regra lógica).
          </p>
        </div>
        
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
            Fallback de dados
          </label>
          <select
            value={config.fallbackStrategy}
            onChange={(e) => setConfig((c) => ({ ...c, fallbackStrategy: e.target.value }))}
            className="w-full p-2 border rounded-md"
          >
            <option value="supabase">Supabase (preferido)</option>
            <option value="site">Site (recuperar produtos genéricos)</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Caso a busca não retorne itens, usar fallback configurado.
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="bg-[#E60012] text-white px-6 py-2 rounded-md font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <Save size={18} />
          Salvar Configurações
        </button>
      </div>

      {saved && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
          Configurações salvas com sucesso!
        </div>
      )}
    </div>
  );
}
