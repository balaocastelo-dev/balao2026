'use client';

import { useState } from 'react';
import { Vendedor, ArenaConfig, VEICULOS_DISPONIVEIS, EventoMidia, TIPOS_EVENTOS, Venda } from '../types';
import { criarVendedor, atualizarVendedor, removerVendedor, resetarVendas, adicionarVenda, criarEventoMidia, atualizarEventoMidia, removerEventoMidia, removerVenda } from '../actions';
import { Trash2, Edit, Plus, Save, Trophy, Car, RotateCcw, Power, X, DollarSign, Users, Settings, Search, Image as ImageIcon, Video, History, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminClient({ 
  vendedoresIniciais, 
  configInicial,
  eventosMidiaIniciais,
  vendasRecentesIniciais
}: { 
  vendedoresIniciais: Vendedor[], 
  configInicial: ArenaConfig | null,
  eventosMidiaIniciais: EventoMidia[],
  vendasRecentesIniciais: Venda[]
}) {
  const [activeTab, setActiveTab] = useState<'vendedores' | 'eventos' | 'historico'>('vendedores');
  
  // Dados
  const [vendedores, setVendedores] = useState(vendedoresIniciais);
  const [eventosMidia, setEventosMidia] = useState(eventosMidiaIniciais);
  const [vendasRecentes, setVendasRecentes] = useState(vendasRecentesIniciais);
  const [config, setConfig] = useState(configInicial);
  
  // Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddSaleModalOpen, setIsAddSaleModalOpen] = useState(false);
  const [isEventoModalOpen, setIsEventoModalOpen] = useState(false);
  
  // Edição
  const [editingVendedor, setEditingVendedor] = useState<Vendedor | null>(null);
  const [saleVendedor, setSaleVendedor] = useState<Vendedor | null>(null);
  const [editingEvento, setEditingEvento] = useState<EventoMidia | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // --- Estados do formulário de Vendedor ---
  const [nome, setNome] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [veiculoEmoji, setVeiculoEmoji] = useState('🚗');
  const [metaValor, setMetaValor] = useState(1000);
  
  // --- Estados do formulário de Venda ---
  const [valorVenda, setValorVenda] = useState('');

  // --- Estados do formulário de Evento ---
  const [eventoTipo, setEventoTipo] = useState<EventoMidia['evento_tipo']>(TIPOS_EVENTOS[0].id);
  const [gifUrl, setGifUrl] = useState('');
  const [tituloEvento, setTituloEvento] = useState('');
  const [msgTemplate, setMsgTemplate] = useState('');
  const [eventoAtivo, setEventoAtivo] = useState(true);

  const filteredVendedores = vendedores.filter(v => 
    v.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- CRUD Vendedor ---
  const openEditModal = (vendedor?: Vendedor) => {
    if (vendedor) {
      setEditingVendedor(vendedor);
      setNome(vendedor.nome);
      setAvatarUrl(vendedor.avatar_url || '');
      setVeiculoEmoji(vendedor.veiculo_emoji);
      setMetaValor(vendedor.meta_valor);
    } else {
      setEditingVendedor(null);
      setNome('');
      setAvatarUrl('');
      setVeiculoEmoji('🚗');
      setMetaValor(1000);
    }
    setIsModalOpen(true);
  };

  const handleSaveVendedor = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('nome', nome);
    formData.append('avatar_url', avatarUrl);
    formData.append('veiculo_emoji', veiculoEmoji);
    formData.append('meta_valor', metaValor.toString());
    
    if (editingVendedor) {
        formData.append('vendas_atual', editingVendedor.vendas_atual.toString());
    }

    try {
      if (editingVendedor) {
        await atualizarVendedor(editingVendedor.id, formData);
      } else {
        await criarVendedor(formData);
      }
      setIsModalOpen(false);
      window.location.reload(); 
    } catch (error) {
      alert('Erro ao salvar: ' + error);
    } finally {
      setLoading(false);
    }
  };

  // --- Nova Venda ---
  const openSaleModal = (vendedor: Vendedor) => {
    setSaleVendedor(vendedor);
    setValorVenda('');
    setIsAddSaleModalOpen(true);
  };

  const handleAddSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saleVendedor) return;
    setLoading(true);

    try {
      const valor = parseFloat(valorVenda.replace('R$', '').replace('.', '').replace(',', '.'));
      if (isNaN(valor)) throw new Error("Valor inválido");

      await adicionarVenda(saleVendedor.id, valor);
      setIsAddSaleModalOpen(false);
      window.location.reload();
    } catch (error) {
      alert('Erro ao adicionar venda: ' + error);
    } finally {
      setLoading(false);
    }
  };

  // --- CRUD Eventos ---
  const openEventoModal = (evento?: EventoMidia) => {
    if (evento) {
      setEditingEvento(evento);
      setEventoTipo(evento.evento_tipo);
      setGifUrl(evento.gif_url);
      setTituloEvento(evento.titulo);
      setMsgTemplate(evento.mensagem_template || '');
      setEventoAtivo(evento.ativo);
    } else {
      setEditingEvento(null);
      setEventoTipo(TIPOS_EVENTOS[0].id);
      setGifUrl('');
      setTituloEvento('');
      setMsgTemplate('');
      setEventoAtivo(true);
    }
    setIsEventoModalOpen(true);
  };

  const handleSaveEvento = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('evento_tipo', eventoTipo);
    formData.append('gif_url', gifUrl);
    formData.append('titulo', tituloEvento);
    formData.append('mensagem_template', msgTemplate);
    formData.append('ativo', String(eventoAtivo));

    try {
      if (editingEvento) {
        await atualizarEventoMidia(editingEvento.id, formData);
      } else {
        await criarEventoMidia(formData);
      }
      setIsEventoModalOpen(false);
      window.location.reload();
    } catch (error) {
      alert('Erro ao salvar evento: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvento = async (id: string) => {
    if (!confirm('Remover este evento?')) return;
    setLoading(true);
    try {
      await removerEventoMidia(id);
      window.location.reload();
    } catch (error) {
      alert('Erro ao remover: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVenda = async (id: string) => {
    if (!confirm('Remover esta venda? O valor será subtraído do vendedor.')) return;
    setLoading(true);
    try {
      await removerVenda(id);
      window.location.reload();
    } catch (error) {
      alert('Erro ao remover: ' + error);
    } finally {
      setLoading(false);
    }
  };

  // --- Outras Ações ---
  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este vendedor?')) return;
    setLoading(true);
    try {
      await removerVendedor(id);
      window.location.reload();
    } catch (error) {
      alert('Erro ao remover: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('ATENÇÃO: Isso irá ZERAR as vendas de TODOS os vendedores. Continuar?')) return;
    setLoading(true);
    try {
      await resetarVendas();
      window.location.reload();
    } catch (error) {
      alert('Erro: ' + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <Settings className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-slate-800">Arena Admin</h1>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => setActiveTab('vendedores')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'vendedores' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}
            >
                Competidores
            </button>
            <button 
                onClick={() => setActiveTab('eventos')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'eventos' ? 'bg-purple-100 text-purple-700' : 'text-slate-600 hover:bg-slate-100'}`}
            >
                GIFs e Eventos
            </button>
            <button 
                onClick={() => setActiveTab('historico')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'historico' ? 'bg-orange-100 text-orange-700' : 'text-slate-600 hover:bg-slate-100'}`}
            >
                Histórico
            </button>
        </div>
        <div className="flex gap-3">
            <button 
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors text-sm font-medium"
            >
                <RotateCcw className="w-4 h-4" />
                Zerar Temporada
            </button>
            {activeTab === 'vendedores' && (
                <button 
                    onClick={() => openEditModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-lg shadow-blue-600/20 text-sm font-medium"
                >
                    <Plus className="w-4 h-4" />
                    Novo Vendedor
                </button>
            )}
            {activeTab === 'eventos' && (
                <button 
                    onClick={() => openEventoModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors shadow-lg shadow-purple-600/20 text-sm font-medium"
                >
                    <Plus className="w-4 h-4" />
                    Novo Evento
                </button>
            )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6">
        
        {activeTab === 'vendedores' && (
            <>
                {/* Filtros e Stats Rápidos */}
                <div className="mb-8 flex flex-col md:flex-row gap-4 justify-between items-end">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Buscar vendedor..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>
                    <div className="text-sm text-slate-500">
                        {filteredVendedores.length} competidores ativos
                    </div>
                </div>

                {/* Grid de Vendedores */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <AnimatePresence>
                        {filteredVendedores.map((v) => (
                            <VendedorCard 
                                key={v.id} 
                                vendedor={v} 
                                onEdit={() => openEditModal(v)}
                                onAddSale={() => openSaleModal(v)}
                                onDelete={() => handleDelete(v.id)}
                            />
                        ))}
                    </AnimatePresence>
                    
                    {/* Botão Adicionar Vazio */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => openEditModal()}
                        className="flex flex-col items-center justify-center gap-4 bg-slate-100 border-2 border-dashed border-slate-300 rounded-2xl h-[280px] hover:bg-slate-200/50 hover:border-slate-400 transition-colors cursor-pointer text-slate-400 hover:text-slate-600"
                    >
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                            <Plus className="w-8 h-8" />
                        </div>
                        <span className="font-medium">Adicionar Vendedor</span>
                    </motion.button>
                </div>
            </>
        )}
        
        {activeTab === 'eventos' && (
            <>
                {/* Grid de Eventos */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {eventosMidia.map((evento) => (
                            <EventoCard
                                key={evento.id}
                                evento={evento}
                                onEdit={() => openEventoModal(evento)}
                                onDelete={() => handleDeleteEvento(evento.id)}
                            />
                        ))}
                    </AnimatePresence>
                    
                     <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => openEventoModal()}
                        className="flex flex-col items-center justify-center gap-4 bg-slate-100 border-2 border-dashed border-slate-300 rounded-2xl h-[200px] hover:bg-slate-200/50 hover:border-slate-400 transition-colors cursor-pointer text-slate-400 hover:text-slate-600"
                    >
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                            <Video className="w-8 h-8" />
                        </div>
                        <span className="font-medium">Adicionar GIF/Evento</span>
                    </motion.button>
                </div>
            </>
        )}

        {activeTab === 'historico' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <History className="w-5 h-5 text-orange-500" />
                        Histórico de Vendas Recentes
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Data/Hora</th>
                                <th className="px-6 py-4 font-semibold">Vendedor</th>
                                <th className="px-6 py-4 font-semibold">Valor</th>
                                <th className="px-6 py-4 font-semibold text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {vendasRecentes.map((venda) => (
                                <tr key={venda.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 text-slate-600">
                                        {new Date(venda.created_at).toLocaleString('pt-BR')}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-900">
                                        <div className="flex items-center gap-2">
                                            {venda.vendedor?.avatar_url && (
                                                <img src={venda.vendedor.avatar_url} alt="" className="w-6 h-6 rounded-full object-cover" />
                                            )}
                                            {venda.vendedor?.nome || 'Desconhecido'}
                                        </div>
                                        {venda.order_id && (
                                            <div className="text-xs text-slate-400 mt-1 pl-8">
                                                Pedido: {venda.order_id.slice(0, 8)}...
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-emerald-600 font-bold">
                                        R$ {venda.valor.toLocaleString('pt-BR')}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => handleDeleteVenda(venda.id)}
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                            title="Excluir Venda"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {vendasRecentes.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                                        Nenhuma venda registrada recentemente.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        )}
      </main>

      {/* --- MODAL DE NOVA VENDA --- */}
      <AnimatePresence>
        {isAddSaleModalOpen && saleVendedor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white text-center">
                <h2 className="text-2xl font-bold">Nova Venda! 🤑</h2>
                <p className="opacity-90 mt-1">Para {saleVendedor.nome}</p>
              </div>
              
              <form onSubmit={handleAddSale} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Valor da Venda</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="number" 
                      step="0.01"
                      required
                      autoFocus
                      placeholder="0.00"
                      value={valorVenda}
                      onChange={(e) => setValorVenda(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 text-2xl font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsAddSaleModalOpen(false)}
                    className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 font-medium rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-lg shadow-green-600/30 transition-transform active:scale-95 disabled:opacity-70"
                  >
                    {loading ? 'Salvando...' : 'Confirmar Venda'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL DE EDIÇÃO/CRIAÇÃO VENDEDOR --- */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
            >
              <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
                <h2 className="text-xl font-bold">{editingVendedor ? 'Editar Vendedor' : 'Novo Vendedor'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                    <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleSaveVendedor} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                        <input 
                            type="text" 
                            required
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Avatar URL (Opcional)</label>
                        <div className="flex gap-2">
                            <input 
                                type="url" 
                                value={avatarUrl}
                                onChange={(e) => setAvatarUrl(e.target.value)}
                                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="https://..."
                            />
                            {avatarUrl && <img src={avatarUrl} alt="Preview" className="w-10 h-10 rounded-full object-cover border" />}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Veículo</label>
                        <select 
                            value={veiculoEmoji}
                            onChange={(e) => setVeiculoEmoji(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-2xl"
                        >
                            {VEICULOS_DISPONIVEIS.map(v => (
                                <option key={v} value={v}>{v}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Meta (R$)</label>
                        <input 
                            type="number" 
                            required
                            value={metaValor}
                            onChange={(e) => setMetaValor(parseFloat(e.target.value))}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                    <button 
                        type="button" 
                        onClick={() => setIsModalOpen(false)}
                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Salvando...' : 'Salvar'}
                    </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL DE EDIÇÃO/CRIAÇÃO EVENTO --- */}
      <AnimatePresence>
        {isEventoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
            >
              <div className="bg-purple-900 p-6 text-white flex justify-between items-center">
                <h2 className="text-xl font-bold">{editingEvento ? 'Editar Evento' : 'Novo Evento'}</h2>
                <button onClick={() => setIsEventoModalOpen(false)} className="text-slate-400 hover:text-white">
                    <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleSaveEvento} className="p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Gatilho</label>
                    <select 
                        value={eventoTipo}
                        onChange={(e) => setEventoTipo(e.target.value as EventoMidia['evento_tipo'])}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    >
                        {TIPOS_EVENTOS.map(t => (
                            <option key={t.id} value={t.id}>{t.label}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Título Exibido</label>
                    <input 
                        type="text" 
                        required
                        value={tituloEvento}
                        onChange={(e) => setTituloEvento(e.target.value)}
                        placeholder="Ex: NOVA VENDA!"
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">URL do GIF</label>
                    <input 
                        type="url" 
                        required
                        value={gifUrl}
                        onChange={(e) => setGifUrl(e.target.value)}
                        placeholder="https://media.giphy.com/..."
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                    {gifUrl && (
                        <div className="mt-2 h-32 rounded-lg overflow-hidden bg-black flex items-center justify-center">
                            <img src={gifUrl} alt="Preview" className="h-full object-contain" />
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Mensagem (Template)</label>
                    <input 
                        type="text" 
                        value={msgTemplate}
                        onChange={(e) => setMsgTemplate(e.target.value)}
                        placeholder="Ex: {vendedor} acabou de vender!"
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                    <p className="text-xs text-slate-500 mt-1">Variáveis disponíveis: {'{vendedor}'}, {'{valor}'}</p>
                </div>

                <div className="flex items-center gap-2">
                    <input 
                        type="checkbox"
                        id="ativo"
                        checked={eventoAtivo}
                        onChange={(e) => setEventoAtivo(e.target.checked)}
                        className="w-4 h-4 text-purple-600"
                    />
                    <label htmlFor="ativo" className="text-sm font-medium text-slate-700">Evento Ativo</label>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                    <button 
                        type="button" 
                        onClick={() => setIsEventoModalOpen(false)}
                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="px-6 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Salvando...' : 'Salvar'}
                    </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function VendedorCard({ vendedor, onEdit, onAddSale, onDelete }: { 
    vendedor: Vendedor, 
    onEdit: () => void, 
    onAddSale: () => void,
    onDelete: () => void 
}) {
    const progresso = vendedor.meta_valor > 0 ? (vendedor.vendas_atual / vendedor.meta_valor) * 100 : 0;
    
    return (
        <motion.div 
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[280px] relative group hover:shadow-md transition-shadow"
        >
            {/* Header com Avatar */}
            <div className="p-4 flex items-center gap-4 border-b border-slate-100">
                <div className="w-14 h-14 rounded-full bg-slate-100 border-2 border-white shadow-sm overflow-hidden flex-shrink-0">
                    {vendedor.avatar_url ? (
                        <img src={vendedor.avatar_url} alt={vendedor.nome} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl text-slate-400 font-bold">
                            {vendedor.nome.charAt(0)}
                        </div>
                    )}
                </div>
                <div className="min-w-0">
                    <h3 className="font-bold text-slate-800 truncate">{vendedor.nome}</h3>
                    <div className="text-xs text-slate-500 flex items-center gap-1">
                        <Car className="w-3 h-3" />
                        {vendedor.veiculo_emoji}
                    </div>
                </div>
                
                {/* Ações Rápidas (Hover) */}
                <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm p-1 rounded-lg shadow-sm">
                    <button onClick={onEdit} className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors" title="Editar">
                        <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={onDelete} className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors" title="Remover">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="flex-1 p-4 flex flex-col justify-center space-y-3">
                <div className="flex justify-between items-end">
                    <div className="text-sm text-slate-500">Vendas</div>
                    <div className="text-xl font-bold text-slate-900">
                        R$ {vendedor.vendas_atual.toLocaleString('pt-BR', { notation: 'compact' })}
                    </div>
                </div>
                
                <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-slate-500">
                        <span>Meta: {vendedor.meta_valor.toLocaleString('pt-BR', { notation: 'compact' })}</span>
                        <span>{progresso.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                            className={`h-full rounded-full ${progresso >= 100 ? 'bg-yellow-400' : 'bg-blue-500'}`} 
                            style={{ width: `${Math.min(progresso, 100)}%` }} 
                        />
                    </div>
                </div>
            </div>

            {/* Ação Principal */}
            <div className="p-4 pt-0">
                <button 
                    onClick={onAddSale}
                    className="w-full py-3 bg-green-50 hover:bg-green-100 text-green-700 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 border border-green-200"
                >
                    <Plus className="w-5 h-5" />
                    Adicionar Venda
                </button>
            </div>
        </motion.div>
    );
}

function EventoCard({ evento, onEdit, onDelete }: { 
    evento: EventoMidia, 
    onEdit: () => void, 
    onDelete: () => void 
}) {
    return (
        <motion.div 
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col relative group"
        >
            <div className="h-40 bg-black flex items-center justify-center overflow-hidden">
                <img src={evento.gif_url} alt={evento.titulo} className="h-full w-full object-cover opacity-80" />
            </div>
            
            <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold px-2 py-1 bg-purple-100 text-purple-700 rounded-full uppercase">
                        {TIPOS_EVENTOS.find(t => t.id === evento.evento_tipo)?.label || evento.evento_tipo}
                    </span>
                    {!evento.ativo && (
                        <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-500 rounded-full">Inativo</span>
                    )}
                </div>
                <h3 className="font-bold text-lg text-slate-800">{evento.titulo}</h3>
                <p className="text-sm text-slate-500 truncate">{evento.mensagem_template}</p>
            </div>

            <div className="p-4 pt-0 flex gap-2">
                <button onClick={onEdit} className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 font-medium rounded-lg transition-colors text-sm">
                    Editar
                </button>
                <button onClick={onDelete} className="py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </motion.div>
    );
}
