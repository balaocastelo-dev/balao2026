"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function MariaPage() {
  const [config, setConfig] = useState({ vendas: true, compras: true, orcamentos: true, movimentoSite: true });
  const [relatorio, setRelatorio] = useState<any>(null);
  const [pergunta, setPergunta] = useState("");
  const [historicoChat, setHistoricoChat] = useState<{ remetente: string; texto: string; hora: string }[]>([
    { remetente: "Maria", texto: "Olá, Patrão! Sou a MAR.IA, sua analista de hora em hora. Como posso ajudar na loja agora?", hora: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) }
  ]);
  const [carregando, setCarregando] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      const res = await fetch("/api/maria");
      const data = await res.json();
      if (data.ok) {
        if (data.config) setConfig(data.config);
        if (data.ultimoRelatorio) setRelatorio(data.ultimoRelatorio);
      }
    } catch (e) {
      console.error("Erro ao carregar dados da Maria", e);
    }
  }

  async function salvarConfig(novaConfig: typeof config) {
    setConfig(novaConfig);
    try {
      await fetch("/api/maria", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: novaConfig })
      });
      setStatusMsg("Configurações salvas com sucesso!");
      setTimeout(() => setStatusMsg(""), 3000);
    } catch (e) {
      setStatusMsg("Erro ao salvar configurações.");
    }
  }

  async function enviarPergunta(e: React.FormEvent) {
    e.preventDefault();
    if (!pergunta.trim() || carregando) return;

    const textoUsuario = pergunta;
    const horaAtual = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    setHistoricoChat(prev => [...prev, { remetente: "Patrão", texto: textoUsuario, hora: horaAtual }]);
    setPergunta("");
    setCarregando(true);

    try {
      const res = await fetch("/api/maria", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pergunta: textoUsuario })
      });
      const data = await res.json();
      const respostaMaria = data.ok ? data.resposta : "Desculpe patrão, tive um probleminha para processar sua pergunta.";
      
      setHistoricoChat(prev => [...prev, { remetente: "Maria", texto: respostaMaria, hora: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) }]);
    } catch (err) {
      setHistoricoChat(prev => [...prev, { remetente: "Maria", texto: "Erro de conexão com o servidor.", hora: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) }]);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#070d1a] text-[#e6edf7] font-sans pb-16">
      {/* Navegação */}
      <nav className="border-b border-white/10 bg-[#070d1a]/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/central" className="flex items-center gap-3 font-bold text-lg">
            <span className="text-2xl">📊</span>
            <div>
              <span>MAR.IA · Analista</span>
              <small className="block text-xs text-slate-400 font-normal">Quartel-general da Balão</small>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> AO VIVO
            </span>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 pt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Coluna Esquerda: Status e Painel de Seleção de Relatórios */}
        <div className="space-y-6">
          <div className="bg-[#101c33] border border-white/10 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-2xl">
                📊
              </div>
              <div>
                <h1 className="text-xl font-bold">MAR.IA</h1>
                <p className="text-sm text-slate-400">Analista de Hora em Hora</p>
              </div>
            </div>
            <p className="text-sm text-slate-300 mb-6">
              Monitora pedidos de venda, compras de fornecedores e orçamentos da loja a cada 60 minutos, enviando tudo direto para o seu Telegram.
            </p>

            <div className="border-t border-white/10 pt-4">
              <h3 className="text-sm font-bold mb-3 text-slate-200">Tipos de Relatórios Enviados</h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-slate-300">🛍️ Pedidos de Venda</span>
                  <input 
                    type="checkbox" 
                    checked={config.vendas} 
                    onChange={e => salvarConfig({ ...config, vendas: e.target.checked })}
                    className="w-4 h-4 accent-cyan-500 rounded"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-slate-300">📦 Pedidos de Compra</span>
                  <input 
                    type="checkbox" 
                    checked={config.compras} 
                    onChange={e => salvarConfig({ ...config, compras: e.target.checked })}
                    className="w-4 h-4 accent-cyan-500 rounded"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-slate-300">📋 Orçamentos e Leads</span>
                  <input 
                    type="checkbox" 
                    checked={config.orcamentos} 
                    onChange={e => salvarConfig({ ...config, orcamentos: e.target.checked })}
                    className="w-4 h-4 accent-cyan-500 rounded"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-slate-300">📈 Movimento do Site</span>
                  <input 
                    type="checkbox" 
                    checked={config.movimentoSite} 
                    onChange={e => salvarConfig({ ...config, movimentoSite: e.target.checked })}
                    className="w-4 h-4 accent-cyan-500 rounded"
                  />
                </label>
              </div>
              {statusMsg && <p className="text-xs text-emerald-400 mt-3 font-semibold">{statusMsg}</p>}
            </div>
          </div>

          {/* Métricas rápidas */}
          {relatorio?.dados && (
            <div className="bg-[#101c33] border border-white/10 rounded-2xl p-6 shadow-xl">
              <h3 className="text-sm font-bold text-slate-200 mb-4">Resumo da Última Leitura ({relatorio.dados.hora})</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-400">Vendas hoje:</span>
                  <span className="font-bold text-emerald-400">{relatorio.dados.qtdVendas} ped. ({new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(relatorio.dados.vendasTotal)})</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-400">Compras (Notas):</span>
                  <span className="font-bold text-cyan-400">{relatorio.dados.qtdCompras} nota(s)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Orçamentos gerados:</span>
                  <span className="font-bold text-amber-400">{relatorio.dados.qtdOrcamentos}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Coluna Direita: Chat Natural com a Maria e Histórico */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#101c33] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col h-[600px]">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center font-bold text-cyan-400">M</div>
                <div>
                  <h2 className="font-bold text-base">Fale com a MAR.IA</h2>
                  <p className="text-xs text-emerald-400">Responde aqui e dispara no Telegram do patrão</p>
                </div>
              </div>
              <button 
                onClick={carregarDados}
                className="text-xs text-slate-400 hover:text-cyan-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 transition"
              >
                Atualizar Dados
              </button>
            </div>

            {/* Balões de Conversa */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {historicoChat.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.remetente === "Patrão" ? "items-end" : "items-start"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-slate-400">{msg.remetente}</span>
                    <span className="text-[10px] text-slate-500">{msg.hora}</span>
                  </div>
                  <div className={`p-4 rounded-2xl max-w-[85%] text-sm leading-relaxed ${
                    msg.remetente === "Patrão" 
                      ? "bg-cyan-600 text-white rounded-br-sm" 
                      : "bg-[#16223b] border border-white/10 text-slate-200 rounded-bl-sm"
                  }`}>
                    {msg.texto}
                  </div>
                </div>
              ))}
              {carregando && (
                <div className="flex items-start gap-2">
                  <div className="bg-[#16223b] border border-white/10 p-4 rounded-2xl text-xs text-slate-400 animate-pulse">
                    MAR.IA está consultando os relatórios da loja...
                  </div>
                </div>
              )}
            </div>

            {/* Input de Pergunta Natural */}
            <form onSubmit={enviarPergunta} className="mt-4 pt-4 border-t border-white/10 flex gap-2">
              <input 
                type="text"
                value={pergunta}
                onChange={e => setPergunta(e.target.value)}
                placeholder="Ex: Maria, quanto vendeu até agora? / Resumo das compras"
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
              <button 
                type="submit"
                disabled={carregando}
                className="bg-cyan-500 hover:bg-cyan-600 text-[#070d1a] font-bold px-6 rounded-xl transition text-sm flex items-center gap-2 disabled:opacity-50"
              >
                <span>Enviar</span>
                <span>📤</span>
              </button>
            </form>
          </div>
        </div>

      </main>
    </div>
  );
}
