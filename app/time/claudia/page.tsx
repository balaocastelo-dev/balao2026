"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function ClaudiaPage() {
  const [config, setConfig] = useState({
    ativo: false,
    tetoDia: 10,
    canais: { whatsapp: true, email: true, ura: true }
  });
  const [cobrancas, setCobrancas] = useState<any[]>([]);
  const [reativacoes, setReativacoes] = useState<any[]>([]);
  const [stats, setStats] = useState({ enviadasHoje: 0, tetoDia: 10, pendentes: 0 });
  const [statusMsg, setStatusMsg] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      const res = await fetch("/api/claudia");
      const data = await res.json();
      if (data.ok) {
        if (data.config) setConfig(data.config);
        if (data.cobrancas) setCobrancas(data.cobrancas);
        if (data.reativacoes) setReativacoes(data.reativacoes);
        if (data.stats) setStats(data.stats);
      }
    } catch (e) {
      console.error("Erro ao carregar dados da CLAUD.IA", e);
    }
  }

  async function salvarConfig(novaConfig: typeof config) {
    setConfig(novaConfig);
    try {
      await fetch("/api/claudia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: novaConfig })
      });
      setStatusMsg("Configurações atualizadas!");
      setTimeout(() => setStatusMsg(""), 3000);
    } catch (e) {
      setStatusMsg("Erro ao salvar.");
    }
  }

  async function executarAcao(whatsapp: string, acao: "cobrar" | "excluir", canal = "todos", nome = "", total = 0) {
    setCarregando(true);
    try {
      const res = await fetch("/api/claudia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acao, whatsapp, canal, nome, total })
      });
      const data = await res.json();
      if (data.ok) {
        setStatusMsg(data.mensagem);
        carregarDados();
      } else {
        setStatusMsg("Erro: " + data.erro);
      }
    } catch (e) {
      setStatusMsg("Erro de conexão.");
    } finally {
      setCarregando(false);
      setTimeout(() => setStatusMsg(""), 4000);
    }
  }

  return (
    <div className="min-h-screen bg-[#070d1a] text-[#e6edf7] font-sans pb-16">
      {/* Navegação */}
      <nav className="border-b border-white/10 bg-[#070d1a]/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/central" className="flex items-center gap-3 font-bold text-lg">
            <span className="text-2xl">📞</span>
            <div>
              <span>CLAUD.IA · Cobradora</span>
              <small className="block text-xs text-slate-400 font-normal">Quartel-general da Balão</small>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-2 text-xs font-bold px-3 py-1 rounded-full border ${
              config.ativo ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" : "text-amber-400 bg-amber-500/10 border-amber-500/30"
            }`}>
              <span className={`w-2 h-2 rounded-full ${config.ativo ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`}></span> 
              {config.ativo ? "LIGADA" : "DESLIGADA"}
            </span>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 pt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Painel Esquerdo: Configurações e Canais */}
        <div className="space-y-6">
          <div className="bg-[#101c33] border border-white/10 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-2xl">
                📞
              </div>
              <div>
                <h1 className="text-xl font-bold">CLAUD.IA</h1>
                <p className="text-sm text-slate-400">Cobrança & Reativação</p>
              </div>
            </div>
            <p className="text-sm text-slate-300 mb-6">
              Só cobra o que já venceu e uma vez por pessoa. Operando com canais múltiplos integrados.
            </p>

            <div className="space-y-4 border-t border-white/10 pt-4">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm font-semibold">Estado do Robô</span>
                <button
                  onClick={() => salvarConfig({ ...config, ativo: !config.ativo })}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                    config.ativo ? "bg-emerald-500 text-black hover:bg-emerald-400" : "bg-white/10 text-slate-300 hover:bg-white/20"
                  }`}
                >
                  {config.ativo ? "Desligar CLAUD.IA" : "Ligar CLAUD.IA"}
                </button>
              </label>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Teto de Disparos por Dia: <b>{config.tetoDia}</b></label>
                <input 
                  type="range" 
                  min="1" 
                  max="50" 
                  value={config.tetoDia} 
                  onChange={e => salvarConfig({ ...config, tetoDia: Number(e.target.value) })}
                  className="w-full accent-purple-500"
                />
              </div>

              <div className="border-t border-white/10 pt-4">
                <h3 className="text-sm font-bold mb-3 text-slate-200">Canais de Cobrança</h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm text-slate-300">💬 WhatsApp</span>
                    <input 
                      type="checkbox" 
                      checked={config.canais.whatsapp} 
                      onChange={e => salvarConfig({ ...config, canais: { ...config.canais, whatsapp: e.target.checked } })}
                      className="w-4 h-4 accent-purple-500 rounded"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm text-slate-300">📧 E-mail (Himalaya)</span>
                    <input 
                      type="checkbox" 
                      checked={config.canais.email} 
                      onChange={e => salvarConfig({ ...config, canais: { ...config.canais, email: e.target.checked } })}
                      className="w-4 h-4 accent-purple-500 rounded"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm text-slate-300">☎️ Telefone via URA</span>
                    <input 
                      type="checkbox" 
                      checked={config.canais.ura} 
                      onChange={e => salvarConfig({ ...config, canais: { ...config.canais, ura: e.target.checked } })}
                      className="w-4 h-4 accent-purple-500 rounded"
                    />
                  </label>
                </div>
              </div>

              {statusMsg && <p className="text-xs text-emerald-400 mt-2 font-semibold">{statusMsg}</p>}
            </div>
          </div>

          <div className="bg-[#101c33] border border-white/10 rounded-2xl p-6 shadow-xl">
            <h3 className="text-sm font-bold text-slate-200 mb-3">Resumo de Hoje</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">Cobranças hoje:</span>
                <span className="font-bold text-white">{stats.enviadasHoje} / {config.tetoDia}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Fila pendente:</span>
                <span className="font-bold text-purple-400">{stats.pendentes} clientes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Painel Direito: Fila de Cobrança com Ações */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#101c33] border border-white/10 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <div>
                <h2 className="text-lg font-bold">Fila de Cobrança Ativa</h2>
                <p className="text-xs text-slate-400">Clientes com contas vencidas ou pedidos pendentes</p>
              </div>
              <button 
                onClick={carregarDados}
                className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg transition"
              >
                Atualizar Fila
              </button>
            </div>

            {cobrancas.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <p className="text-4xl mb-2">🎉</p>
                <p>Nenhuma cobrança pendente na fila no momento!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cobrancas.map((item, idx) => (
                  <div key={idx} className="bg-[#16223b] border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white">{item.nome || "Cliente sem nome"}</h3>
                        <span className="text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-mono">{item.whatsapp}</span>
                      </div>
                      <p className="text-sm text-emerald-400 font-semibold mt-1">
                        Valor: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.total)}
                      </p>
                      <small className="text-xs text-slate-400">Vencimento / Criação: {item.criado_em ? new Date(item.criado_em).toLocaleDateString('pt-BR') : 'Recente'}</small>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <button
                        disabled={carregando}
                        onClick={() => executarAcao(item.whatsapp, "excluir", "todos", item.nome, item.total)}
                        className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-2 rounded-lg transition"
                      >
                        🗑️ Excluir
                      </button>
                      <button
                        disabled={carregando}
                        onClick={() => executarAcao(item.whatsapp, "cobrar", "todos", item.nome, item.total)}
                        className="text-xs bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-4 py-2 rounded-lg transition shadow-lg"
                      >
                        ⚡ Cobrar Agora
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
