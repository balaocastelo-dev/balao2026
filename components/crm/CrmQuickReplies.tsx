"use client";

import { useState } from "react";
import {
  Zap,
  Plus,
  Search,
  Copy,
  Check,
  Edit2,
  Trash2,
  Tag as TagIcon,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import { QuickReplyTemplate } from "@/types/crm";

interface CrmQuickRepliesProps {
  templates: QuickReplyTemplate[];
  onCreateTemplate: (template: Omit<QuickReplyTemplate, "id">) => void;
  onDeleteTemplate: (id: string) => void;
}

export default function CrmQuickReplies({
  templates,
  onCreateTemplate,
  onDeleteTemplate,
}: CrmQuickRepliesProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form state
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<QuickReplyTemplate["category"]>("saudacoes");
  const [newShortcut, setNewShortcut] = useState("");
  const [newMessage, setNewMessage] = useState("");

  const categories = [
    { id: "all", name: "Todas as Categorias" },
    { id: "saudacoes", name: "👋 Saudações & Boas-Vindas" },
    { id: "pix", name: "💳 Desconto Pix & Pagamento" },
    { id: "orcamento", name: "🖥️ Orçamento PC Gamer & Hardware" },
    { id: "assistencia", name: "🔧 Assistência Técnica & Apple" },
    { id: "loja", name: "📍 Loja Física Castelo & Retirada" },
    { id: "followup", name: "⏰ Follow-ups & Retornos" },
  ];

  const filteredTemplates = templates.filter((t) => {
    const matchesSearch =
      !searchTerm ||
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.shortcut && t.shortcut.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      selectedCategory === "all" || t.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleInsertTag = (tag: string) => {
    setNewMessage((prev) => prev + " " + tag);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newMessage.trim()) return;

    onCreateTemplate({
      title: newTitle.trim(),
      category: newCategory,
      shortcut: newShortcut.trim() || undefined,
      message: newMessage.trim(),
    });

    setNewTitle("");
    setNewShortcut("");
    setNewMessage("");
    setIsCreateModalOpen(false);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* Top Toolbar */}
      <div className="p-4 border-b border-zinc-800 bg-zinc-900/60 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-red-500" /> Scripts de Vendas & Mensagens Rápidas
          </h2>
          <p className="text-xs text-zinc-400">
            Respostas padronizadas de alta conversão do Balão da Informática com substituição automática de tags.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-red-600 px-3.5 py-2 text-xs font-bold text-white shadow-lg shadow-red-950/40 hover:bg-red-500 transition-colors"
        >
          <Plus className="h-4 w-4" /> Criar Novo Template
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 border-b border-zinc-800 bg-zinc-900/40 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Pesquisar por título, atalho ou conteúdo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-1.5 pl-8 pr-3 text-xs text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? "bg-red-600 text-white"
                  : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Template Grid */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 scrollbar-thin scrollbar-thumb-zinc-800">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="flex flex-col justify-between rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 hover:border-zinc-700 transition-all shadow-md group"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-xs font-bold text-white group-hover:text-red-400 transition-colors">
                  {template.title}
                </h3>
                {template.shortcut && (
                  <span className="text-[10px] font-mono font-bold bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded border border-zinc-700">
                    {template.shortcut}
                  </span>
                )}
              </div>

              <p className="text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/80 font-sans line-clamp-6">
                {template.message}
              </p>
            </div>

            {/* Actions */}
            <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase">
                {template.category}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(template.message, template.id)}
                  className="flex items-center gap-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 px-2.5 py-1 text-xs font-semibold text-zinc-200 transition-colors"
                >
                  {copiedId === template.id ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" /> Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" /> Copiar Texto
                    </>
                  )}
                </button>
                <button
                  onClick={() => onDeleteTemplate(template.id)}
                  className="rounded-lg p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                  title="Excluir template"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 text-white shadow-2xl">
            <div className="border-b border-zinc-800 bg-zinc-900/60 px-6 py-4 flex items-center justify-between">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Plus className="h-5 w-5 text-red-500" /> Novo Script / Mensagem Rápida
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Título do Script *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Oferta Placa de Vídeo RTX 4070"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Atalho Rápido (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="/rtx4070"
                    value={newShortcut}
                    onChange={(e) => setNewShortcut(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Categoria
                </label>
                <select
                  value={newCategory}
                  onChange={(e) =>
                    setNewCategory(e.target.value as QuickReplyTemplate["category"])
                  }
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
                >
                  <option value="saudacoes">👋 Saudações & Boas-Vindas</option>
                  <option value="pix">💳 Desconto Pix & Pagamento</option>
                  <option value="orcamento">🖥️ Orçamento PC Gamer & Hardware</option>
                  <option value="assistencia">🔧 Assistência Técnica & Apple</option>
                  <option value="loja">📍 Loja Física Castelo & Retirada</option>
                  <option value="followup">⏰ Follow-ups & Retornos</option>
                  <option value="geral">💬 Geral</option>
                </select>
              </div>

              {/* Dynamic Variables helper */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-zinc-300">
                    Mensagem do Script *
                  </label>
                  <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-amber-400" /> Tags dinâmicas:
                  </span>
                </div>

                <div className="flex flex-wrap gap-1 mb-2">
                  {[
                    "{primeiro_nome}",
                    "{nome}",
                    "{saudacao}",
                    "{produto}",
                    "{valor}",
                    "{chave_pix}",
                    "{vendedor}",
                  ].map((tag) => (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => handleInsertTag(tag)}
                      className="text-[10px] font-mono font-semibold bg-zinc-900 hover:bg-zinc-800 text-red-400 border border-red-500/30 px-2 py-0.5 rounded cursor-pointer transition-colors"
                    >
                      +{tag}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={5}
                  required
                  placeholder="Olá {primeiro_nome}! {saudacao}! Passando para informar que..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-xs text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white hover:bg-red-500 transition-colors shadow-lg shadow-red-950/50"
                >
                  Salvar Script
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
