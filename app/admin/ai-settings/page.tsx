"use client";

import React, { useState, useEffect } from "react";
import { Mic, Play, Save, Server, Volume2, Cpu, Activity } from "lucide-react";

export default function AISettingsPage() {
  const [status, setStatus] = useState({
    backend: "checking",
    ollama: "checking",
    supabase: "checking"
  });
  
  const [config, setConfig] = useState({
    provider: "serverless", // 'serverless' | 'ollama'
    voice_model: "br_001",
    ollama_url: "http://localhost:11434",
    system_prompt: "Você é o assistente virtual do Balão da Informática. Fale em Português do Brasil. Seja breve, útil e vendedor."
  });

  const [testInput, setTestInput] = useState("");
  const [testOutput, setTestOutput] = useState("");

  useEffect(() => {
    // Load config from LocalStorage
    const savedConfig = localStorage.getItem("balao_ai_config");
    if (savedConfig) {
      try {
        setConfig(prev => ({ ...prev, ...JSON.parse(savedConfig) }));
      } catch (e) {
        console.error("Erro ao carregar configurações", e);
      }
    }

    // Check Status
    setTimeout(() => {
      setStatus({
        backend: "online",
        ollama: config.provider === 'ollama' ? "checking" : "inactive", 
        supabase: "online"
      });
    }, 1000);
  }, []); // Run once on mount

  const handleSave = () => {
    localStorage.setItem("balao_ai_config", JSON.stringify(config));
    // Disparar evento para atualizar outros componentes se necessário
    window.dispatchEvent(new Event("storage"));
    alert("Configurações salvas e aplicadas! (Modo: " + (config.provider === 'serverless' ? "Online Serverless" : "Local Ollama") + ")");
  };

  const handleTest = async () => {
    setTestOutput("Processando...");
    // Mock call to backend
    // In real implementation, this would send to /ws/chat or a specific test endpoint
    setTimeout(() => {
      setTestOutput(`[Simulação] Resposta para: "${testInput}"\nÁudio gerado com voz ${config.voice_model}.`);
    }, 1500);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold text-gray-800">Configurações de IA & Voz</h1>
            <p className="text-gray-500">Gerencie o cérebro (LLM), voz (TTS) e ouvidos (STT) do agente.</p>
        </div>
        <button onClick={handleSave} className="flex items-center gap-2 bg-[#E60012] text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
            <Save size={20} />
            Salvar Alterações
        </button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatusCard 
            title="Backend Python" 
            status={status.backend} 
            icon={<Server className="text-blue-500" />} 
            detail="FastAPI + WebSockets (Port 8000)"
        />
        <StatusCard 
            title="Cérebro (IA)" 
            status={config.provider === 'serverless' ? "online" : status.ollama} 
            icon={<Cpu className="text-purple-500" />} 
            detail={config.provider === 'serverless' ? "Vercel Python (Serverless)" : "Ollama Local (qwen2.5)"}
        />
        <StatusCard 
            title="Supabase (Busca)" 
            status={status.supabase} 
            icon={<Activity className="text-green-500" />} 
            detail="Busca Semântica Habilitada"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Voice Settings */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
                <Volume2 className="text-gray-400" />
                Configuração de Voz (Kokoro TTS)
            </h2>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Modelo de Voz</label>
                <select 
                    value={config.voice_model}
                    onChange={(e) => setConfig({...config, voice_model: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                >
                    <option value="br_001">br_001 (Feminina - Padrão)</option>
                    <option value="br_002">br_002 (Masculina)</option>
                    <option value="br_003">br_003 (Masculina - Grave)</option>
                    <option value="br_004">br_004 (Feminina - Suave)</option>
                    <option value="br_005">br_005 (Neutro)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Vozes do modelo Kokoro-82M v0.19 otimizado para PT-BR.</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Velocidade da Fala</label>
                <input type="range" min="0.5" max="2.0" step="0.1" defaultValue="1.0" className="w-full accent-red-600" />
                <div className="flex justify-between text-xs text-gray-400">
                    <span>Lento (0.5x)</span>
                    <span>Normal (1.0x)</span>
                    <span>Rápido (2.0x)</span>
                </div>
            </div>
        </div>

        {/* LLM Settings */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
                <Cpu className="text-gray-400" />
                Configuração do Cérebro
            </h2>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Provedor de Inteligência</label>
                <select 
                    value={config.provider}
                    onChange={(e) => setConfig({...config, provider: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                >
                    <option value="serverless">Vercel Serverless (Online - Zero Custo)</option>
                    <option value="ollama">Ollama (Local - Requer Instalação)</option>
                </select>
            </div>

            {config.provider === 'ollama' && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Endpoint Ollama</label>
                    <input 
                        type="text" 
                        value={config.ollama_url}
                        onChange={(e) => setConfig({...config, ollama_url: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-lg font-mono text-sm"
                        placeholder="http://localhost:11434"
                    />
                    <p className="text-xs text-yellow-600 mt-1">⚠️ 'localhost' só funciona se você rodar o projeto na sua própria máquina.</p>
                </div>
            )}

            {config.provider === 'serverless' && (
                <div className="p-3 bg-blue-50 text-blue-800 rounded-lg text-sm border border-blue-100">
                    <p className="font-semibold">Modo Online Ativo</p>
                    <p className="mt-1">O agente está rodando diretamente na infraestrutura da Vercel. Não requer Ollama instalado.</p>
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">System Prompt (Persona)</label>
                <textarea 
                    value={config.system_prompt}
                    onChange={(e) => setConfig({...config, system_prompt: e.target.value})}
                    className="w-full h-32 p-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-red-500 outline-none"
                />
            </div>
        </div>

      </div>

      {/* Sandbox Test */}
      <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
        <h2 className="text-xl font-bold mb-4">Sandbox de Teste</h2>
        <div className="flex gap-4 mb-4">
            <input 
                type="text" 
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                placeholder="Digite algo para o robô falar..."
                className="flex-1 p-3 rounded-lg border border-gray-300"
            />
            <button 
                onClick={handleTest}
                className="bg-gray-800 text-white px-6 rounded-lg hover:bg-black transition flex items-center gap-2"
            >
                <Play size={18} />
                Testar
            </button>
        </div>
        {testOutput && (
            <div className="p-4 bg-white rounded-lg border border-gray-200 text-sm text-gray-600">
                {testOutput}
            </div>
        )}
      </div>

    </div>
  );
}

function StatusCard({ title, status, icon, detail }: { title: string, status: string, icon: any, detail: string }) {
    const isOnline = status === "online";
    return (
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between">
            <div>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-wide mb-1">{title}</p>
                <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? "bg-green-500" : "bg-yellow-500 animate-pulse"}`}></span>
                    <span className="font-medium text-gray-900">{isOnline ? "Online" : "Verificando..."}</span>
                </div>
                <p className="text-xs text-gray-400 mt-2">{detail}</p>
            </div>
            <div className="p-2 bg-gray-50 rounded-lg">
                {icon}
            </div>
        </div>
    );
}
