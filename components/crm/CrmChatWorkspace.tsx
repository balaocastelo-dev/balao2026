"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Send,
  Search,
  Phone,
  MessageCircle,
  Tag as TagIcon,
  DollarSign,
  User,
  Check,
  CheckCheck,
  Zap,
  CreditCard,
  ShoppingBag,
  Clock,
  Mic,
  MoreVertical,
  Paperclip,
  Smile,
  ChevronRight,
  ChevronLeft,
  X,
  Plus,
  FileText,
  ExternalLink,
  ShieldAlert,
  Archive,
  Volume2,
  Play,
  Pause,
  Copy,
  CheckCheck as CheckedIcon,
  Sparkles,
} from "lucide-react";
import {
  BalãoProductCatalogItem,
  CrmLead,
  CrmMessage,
  CrmSeller,
  CrmTag,
  FunnelStage,
  FunnelStageId,
  QuickReplyTemplate,
} from "@/types/crm";

interface CrmChatWorkspaceProps {
  leads: CrmLead[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  messages: CrmMessage[];
  onSendMessage: (chatId: string, text: string) => void;
  onSendMedia?: (chatId: string, base64: string, mimetype: string, filename: string, caption?: string) => void;
  stages: FunnelStage[];
  tags: CrmTag[];
  sellers: CrmSeller[];
  quickReplies: QuickReplyTemplate[];
  catalogProducts: BalãoProductCatalogItem[];
  onMoveLeadStage: (leadId: string, stage: FunnelStageId) => void;
  onUpdateLead: (leadId: string, updates: Partial<CrmLead>) => void;
  onAddCustomerNote: (leadId: string, noteText: string, author: string) => void;
  onScheduleMessage: (leadId: string, phone: string, text: string, sendAt: string) => void;
}

type TabFilter = "todas" | "unread" | "waiting" | "pcgamer" | "apple" | "assistencia" | "won";

export default function CrmChatWorkspace({
  leads,
  activeChatId,
  onSelectChat,
  messages,
  onSendMessage,
  onSendMedia,
  stages,
  tags,
  sellers,
  quickReplies,
  catalogProducts,
  onMoveLeadStage,
  onUpdateLead,
  onAddCustomerNote,
  onScheduleMessage,
}: CrmChatWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<TabFilter>("todas");
  const [chatSearch, setChatSearch] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [isPixModalOpen, setIsPixModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isQuickRepliesOpen, setIsQuickRepliesOpen] = useState(false);

  // Note input in 360 drawer
  const [newNoteText, setNewNoteText] = useState("");

  // Pix modal state
  const [pixAmount, setPixAmount] = useState("4390");
  const [pixDescription, setPixDescription] = useState("Pedido Balão da Informática");
  const [pixCopied, setPixCopied] = useState(false);

  // Schedule modal state
  const [scheduleText, setScheduleText] = useState("");
  const [scheduleDatetime, setScheduleDatetime] = useState("");

  // Audio simulation player state
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Active Lead
  const activeLead = useMemo(() => {
    return leads.find((l) => l.chatId === activeChatId) || leads[0] || null;
  }, [leads, activeChatId]);

  // Messages for active chat
  const activeMessages = useMemo(() => {
    if (!activeLead) return [];
    return messages.filter((m) => m.chatId === activeLead.chatId);
  }, [messages, activeLead]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages]);

  // Filter chats by tab and search
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        !chatSearch ||
        lead.name.toLowerCase().includes(chatSearch.toLowerCase()) ||
        lead.phone.includes(chatSearch);

      if (!matchesSearch) return false;

      switch (activeTab) {
        case "unread":
          return lead.unreadCount > 0;
        case "waiting":
          return lead.stage === "first_contact" || lead.stage === "new_lead";
        case "pcgamer":
          return lead.tags.includes("pcgamer");
        case "apple":
          return lead.tags.includes("apple");
        case "assistencia":
          return lead.tags.includes("assistencia");
        case "won":
          return lead.stage === "won";
        default:
          return true;
      }
    });
  }, [leads, activeTab, chatSearch]);

  const handleSend = () => {
    if (!messageInput.trim() || !activeLead) return;
    onSendMessage(activeLead.chatId, messageInput.trim());
    setMessageInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Replace variable tags in templates
  const renderTemplateText = (templateText: string) => {
    if (!activeLead) return templateText;
    const seller = sellers.find((s) => s.id === activeLead.assignedSellerId) || sellers[0];
    const firstName = activeLead.name.split(" ")[0] || "Cliente";

    const currentHour = new Date().getHours();
    const saudacao =
      currentHour >= 5 && currentHour < 12
        ? "Bom dia"
        : currentHour >= 12 && currentHour < 18
        ? "Boa tarde"
        : "Boa noite";

    return templateText
      .replaceAll("{nome}", activeLead.name)
      .replaceAll("{primeiro_nome}", firstName)
      .replaceAll("{saudacao}", saudacao)
      .replaceAll("{vendedor}", seller?.name || "Balão da Informática")
      .replaceAll("{produto}", activeLead.productOfInterest || "PC Gamer / Hardware")
      .replaceAll(
        "{valor}",
        activeLead.dealValue > 0
          ? activeLead.dealValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })
          : "Sob Consulta"
      )
      .replaceAll("{chave_pix}", "pix@balao.info (CNPJ Balão)");
  };

  const handleInsertTemplate = (template: QuickReplyTemplate) => {
    const formatted = renderTemplateText(template.message);
    setMessageInput(formatted);
    setIsQuickRepliesOpen(false);
  };

  const handleInsertProduct = (product: BalãoProductCatalogItem) => {
    const text = `💻 *${product.name}*\n\n💵 *Preço Especial Pix:* ${product.formattedPrice}\n📦 Pronta entrega no Balão da Informática Castelo Campinas!\n${
      product.specs?.length ? `• ${product.specs.join("\n• ")}\n` : ""
    }\nFicou interessado? Posso separar para você retirar hoje ou enviar via motoboy!`;
    setMessageInput(text);
    setIsCatalogModalOpen(false);
  };

  const handleGeneratePix = () => {
    const amountNum = Number(pixAmount) || 0;
    const discountAmount = amountNum * 0.9;
    const text = `💳 *Cobrança Pix Balão da Informática (10% OFF)*\n\n📝 Pedido: ${pixDescription}\n💰 De: R$ ${amountNum.toLocaleString(
      "pt-BR",
      { minimumFractionDigits: 2 }
    )}\n🔥 *À vista no Pix com Desconto:* R$ ${discountAmount.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
    })}\n\n🔑 *Chave Pix (E-mail/CNPJ Balão):* pix@balao.info\nTitular: Balão da Informática Campinas Ltda\n\nAssim que efetuar o pagamento, envie o comprovante por aqui para liberarmos a separação!`;

    setMessageInput(text);
    setIsPixModalOpen(false);
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLead || !scheduleText.trim() || !scheduleDatetime) return;
    onScheduleMessage(activeLead.id, activeLead.phone, scheduleText.trim(), scheduleDatetime);
    setScheduleText("");
    setScheduleDatetime("");
    setIsScheduleModalOpen(false);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLead || !newNoteText.trim()) return;
    const seller = sellers.find((s) => s.id === activeLead.assignedSellerId) || sellers[0];
    onAddCustomerNote(activeLead.id, newNoteText.trim(), seller.name);
    setNewNoteText("");
  };

  const formatMessageTime = (ts: number) => {
    return new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(ts));
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-[#0c1317] text-zinc-100">
      {/* 1. LEFT SIDEBAR: WASeller Smart Tabs & Chat List */}
      <div className="flex flex-col w-80 md:w-96 border-r border-zinc-800 bg-[#111b21] shrink-0">
        {/* Top Header & Search */}
        <div className="p-3 border-b border-zinc-800/80 bg-[#111b21]">
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
              <MessageCircle className="h-4 w-4 text-[#25D366]" /> Conversas WhatsApp
            </h2>
            <span className="text-[11px] font-semibold text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-full">
              {leads.length} contatos
            </span>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Buscar ou começar nova conversa..."
              value={chatSearch}
              onChange={(e) => setChatSearch(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-[#202c33] py-1.5 pl-8 pr-3 text-xs text-white placeholder-zinc-400 focus:border-[#00a884] focus:outline-none"
            />
          </div>
        </div>

        {/* WASeller Smart Tabs */}
        <div className="flex gap-1 overflow-x-auto px-2 py-2 border-b border-zinc-800/60 bg-[#111b21] scrollbar-none">
          <button
            onClick={() => setActiveTab("todas")}
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
              activeTab === "todas"
                ? "bg-[#00a884] text-white"
                : "bg-[#202c33] text-zinc-400 hover:text-white"
            }`}
          >
            Todas ({leads.length})
          </button>
          <button
            onClick={() => setActiveTab("unread")}
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap transition-colors flex items-center gap-1 ${
              activeTab === "unread"
                ? "bg-[#00a884] text-white"
                : "bg-[#202c33] text-zinc-400 hover:text-white"
            }`}
          >
            Não Lidas
            {leads.filter((l) => l.unreadCount > 0).length > 0 && (
              <span className="bg-[#25D366] text-black font-bold h-4 w-4 rounded-full flex items-center justify-center text-[10px]">
                {leads.filter((l) => l.unreadCount > 0).length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("pcgamer")}
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
              activeTab === "pcgamer"
                ? "bg-red-600 text-white"
                : "bg-[#202c33] text-zinc-400 hover:text-white"
            }`}
          >
            🎮 PC Gamer
          </button>
          <button
            onClick={() => setActiveTab("apple")}
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
              activeTab === "apple"
                ? "bg-purple-600 text-white"
                : "bg-[#202c33] text-zinc-400 hover:text-white"
            }`}
          >
            🍏 Apple
          </button>
          <button
            onClick={() => setActiveTab("assistencia")}
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
              activeTab === "assistencia"
                ? "bg-orange-600 text-white"
                : "bg-[#202c33] text-zinc-400 hover:text-white"
            }`}
          >
            🔧 Assistência
          </button>
          <button
            onClick={() => setActiveTab("won")}
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
              activeTab === "won"
                ? "bg-emerald-600 text-white"
                : "bg-[#202c33] text-zinc-400 hover:text-white"
            }`}
          >
            ✅ Ganhos
          </button>
        </div>

        {/* Chat List Stream */}
        <div className="flex-1 overflow-y-auto divide-y divide-zinc-800/40 scrollbar-thin scrollbar-thumb-zinc-800">
          {filteredLeads.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-500">
              Nenhuma conversa encontrada nesta aba.
            </div>
          ) : (
            filteredLeads.map((lead) => {
              const isSelected = activeLead?.id === lead.id;
              const leadStage = stages.find((s) => s.id === lead.stage);
              const leadTags = tags.filter((t) => lead.tags.includes(t.id));

              return (
                <div
                  key={lead.id}
                  onClick={() => onSelectChat(lead.chatId)}
                  className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-[#2a3942]"
                      : "hover:bg-[#202c33] bg-[#111b21]"
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 text-white font-bold text-sm border border-zinc-700 shadow">
                      {lead.name.charAt(0).toUpperCase()}
                    </div>
                    {lead.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#25D366] text-[10px] font-black text-black">
                        {lead.unreadCount}
                      </span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3
                        className={`text-xs font-semibold truncate ${
                          lead.unreadCount > 0 ? "text-white font-bold" : "text-zinc-200"
                        }`}
                      >
                        {lead.name}
                      </h3>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {formatMessageTime(lead.lastMessageTimestamp)}
                      </span>
                    </div>

                    <p
                      className={`text-[11px] truncate mt-0.5 ${
                        lead.unreadCount > 0 ? "text-zinc-200 font-medium" : "text-zinc-400"
                      }`}
                    >
                      {lead.lastMessageBody || "Conversa iniciada"}
                    </p>

                    {/* Stage & Tag mini badges */}
                    <div className="flex items-center gap-1.5 mt-1.5">
                      {leadStage && (
                        <span
                          className="text-[9px] font-bold px-1.5 py-0.2 rounded border"
                          style={{
                            borderColor: `${leadStage.color}40`,
                            color: leadStage.color,
                            backgroundColor: `${leadStage.color}15`,
                          }}
                        >
                          {leadStage.shortTitle}
                        </span>
                      )}
                      {lead.dealValue > 0 && (
                        <span className="text-[9px] font-mono font-bold text-emerald-400">
                          R$ {lead.dealValue.toLocaleString("pt-BR")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 2. CENTER: Active Conversation Area */}
      {activeLead ? (
        <div className="flex flex-col flex-1 h-full min-w-0 bg-[#0b141a]">
          {/* Active Chat Header */}
          <div className="flex items-center justify-between border-b border-zinc-800 bg-[#202c33] px-4 py-2.5 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-red-600 to-amber-600 text-white font-bold text-sm shadow">
                {activeLead.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-white truncate">
                    {activeLead.name}
                  </h3>
                  <a
                    href={`https://wa.me/${activeLead.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] font-mono text-[#25D366] hover:underline flex items-center gap-1"
                  >
                    <Phone className="h-2.5 w-2.5" />
                    {activeLead.phone}
                    <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                  </a>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] text-zinc-400 truncate">
                    {activeLead.productOfInterest || "Atendimento Balão"}
                  </span>
                  {activeLead.dealValue > 0 && (
                    <span className="text-[11px] font-mono font-bold text-emerald-400">
                      • R$ {activeLead.dealValue.toLocaleString("pt-BR")}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Funnel Stage Selector in Chat Header */}
              <div className="hidden sm:flex items-center gap-1.5">
                <span className="text-[11px] text-zinc-400 font-medium">Etapa:</span>
                <select
                  value={activeLead.stage}
                  onChange={(e) =>
                    onMoveLeadStage(activeLead.id, e.target.value as FunnelStageId)
                  }
                  className="rounded-lg border border-zinc-700 bg-[#111b21] px-2 py-1 text-xs text-zinc-200 focus:border-[#00a884] focus:outline-none"
                >
                  {stages.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Toggle 360° Drawer Button */}
              <button
                onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                className={`rounded-lg p-2 text-xs font-bold transition-colors flex items-center gap-1.5 ${
                  isDrawerOpen
                    ? "bg-[#00a884] text-white"
                    : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                }`}
                title="Abrir Perfil 360° do Cliente"
              >
                <User className="h-4 w-4" />
                <span className="hidden md:inline">Perfil 360°</span>
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[radial-gradient(#1f2c34_1px,transparent_1px)] [background-size:16px_16px] scrollbar-thin scrollbar-thumb-zinc-800">
            {activeMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-zinc-500 text-xs py-12">
                <MessageCircle className="h-10 w-10 text-zinc-700 mb-2" />
                <p>Nenhuma mensagem nesta conversa ainda.</p>
                <p className="text-[11px] text-zinc-600 mt-1">
                  Envie uma mensagem rápida ou oferta de produto abaixo.
                </p>
              </div>
            ) : (
              activeMessages.map((msg) => {
                const isOut = msg.direction === "out";

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isOut ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`relative max-w-[85%] md:max-w-[70%] rounded-2xl p-3 shadow-md ${
                        isOut
                          ? "bg-[#005c4b] text-white rounded-tr-none"
                          : "bg-[#202c33] text-zinc-100 rounded-tl-none border border-zinc-800/60"
                      }`}
                    >
                      {/* Message Content */}
                      <p className="text-xs whitespace-pre-wrap leading-relaxed">
                        {msg.body}
                      </p>

                      {/* Timestamp and ticks */}
                      <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-zinc-300/80">
                        <span>{formatMessageTime(msg.timestamp)}</span>
                        {isOut && (
                          <CheckCheck className="h-3.5 w-3.5 text-[#53bdeb]" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* WASeller Quick Actions Toolbar */}
          <div className="border-t border-zinc-800/80 bg-[#202c33] px-3 py-2 flex flex-wrap items-center gap-1.5 shrink-0">
            {/* Quick Replies / Templates */}
            <button
              onClick={() => setIsQuickRepliesOpen(true)}
              className="flex items-center gap-1 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 px-2.5 py-1 text-xs font-bold transition-colors cursor-pointer"
              title="Scripts de Vendas Balão"
            >
              <Zap className="h-3.5 w-3.5" /> Mensagens Rápidas
            </button>

            {/* Balão Catalog Inserter */}
            <button
              onClick={() => setIsCatalogModalOpen(true)}
              className="flex items-center gap-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 px-2.5 py-1 text-xs font-bold transition-colors cursor-pointer"
              title="Inserir Oferta de Produto do Balão"
            >
              <ShoppingBag className="h-3.5 w-3.5" /> Catálogo Balão
            </button>

            {/* Pix Instant Generator */}
            <button
              onClick={() => {
                setPixAmount(String(activeLead.dealValue || 4390));
                setIsPixModalOpen(true);
              }}
              className="flex items-center gap-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 text-xs font-bold transition-colors cursor-pointer"
              title="Gerar Cobrança Pix 10% OFF"
            >
              <CreditCard className="h-3.5 w-3.5" /> Cobrança Pix 10%
            </button>

            {/* Schedule Follow-up */}
            <button
              onClick={() => setIsScheduleModalOpen(true)}
              className="flex items-center gap-1 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-500/30 px-2.5 py-1 text-xs font-bold transition-colors cursor-pointer"
              title="Agendar Mensagem / Follow-up"
            >
              <Clock className="h-3.5 w-3.5" /> Agendar Retorno
            </button>

            {/* Simulate Voice Note */}
            <button
              onClick={() => {
                onSendMessage(
                  activeLead.chatId,
                  "🎙️ [Áudio Gravado]: Olá! Aqui é da equipe do Balão da Informática. Deixando este áudio para te passar todos os detalhes do seu pedido!"
                );
              }}
              className="flex items-center gap-1 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-500/30 px-2.5 py-1 text-xs font-bold transition-colors cursor-pointer"
              title="Enviar Áudio Gravado"
            >
              <Mic className="h-3.5 w-3.5" /> Enviar Áudio
            </button>
          </div>

          {/* Message Input Box */}
          <div className="p-3 bg-[#202c33] border-t border-zinc-800 flex items-end gap-2 shrink-0">
            <textarea
              rows={2}
              placeholder="Digite uma mensagem para o cliente (Shift+Enter para quebra de linha)..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 rounded-xl border border-zinc-700 bg-[#2a3942] p-2.5 text-xs text-white placeholder-zinc-400 focus:border-[#00a884] focus:outline-none resize-none"
            />
            <button
              onClick={handleSend}
              disabled={!messageInput.trim()}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00a884] text-white hover:bg-[#008f72] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md cursor-pointer shrink-0"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-[#0b141a] text-zinc-500 text-sm">
          <MessageCircle className="h-12 w-12 text-zinc-700 mb-3" />
          <p>Selecione uma conversa ao lado para iniciar o atendimento.</p>
        </div>
      )}

      {/* 3. RIGHT SIDEBAR: Customer 360° Drawer */}
      {activeLead && isDrawerOpen && (
        <div className="w-80 md:w-88 border-l border-zinc-800 bg-[#111b21] flex flex-col h-full overflow-y-auto shrink-0 scrollbar-thin scrollbar-thumb-zinc-800">
          {/* Drawer Header */}
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
              <User className="h-4 w-4 text-red-500" /> Perfil CRM 360°
            </h3>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="rounded p-1 text-zinc-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-4 space-y-5 flex-1">
            {/* Customer Info Card */}
            <div className="rounded-xl border border-zinc-800 bg-[#202c33] p-3.5 space-y-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-zinc-400">
                  Nome do Cliente
                </label>
                <p className="text-xs font-bold text-white mt-0.5">{activeLead.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] uppercase font-bold text-zinc-400">
                    WhatsApp
                  </label>
                  <p className="text-xs font-mono text-emerald-400 mt-0.5">
                    {activeLead.phone}
                  </p>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-zinc-400">
                    Valor da Negociação
                  </label>
                  <p className="text-xs font-mono font-bold text-white mt-0.5">
                    R$ {activeLead.dealValue.toLocaleString("pt-BR")}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-zinc-400">
                  Produto de Interesse
                </label>
                <p className="text-xs text-zinc-200 mt-0.5">
                  {activeLead.productOfInterest || "Não especificado"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] uppercase font-bold text-zinc-400">
                    Cidade / Região
                  </label>
                  <p className="text-xs text-zinc-300 mt-0.5">
                    {activeLead.city || "Campinas - SP"}
                  </p>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-zinc-400">
                    Unidade Balão
                  </label>
                  <p className="text-xs text-zinc-300 mt-0.5">
                    {activeLead.preferredBranch || "Loja Castelo"}
                  </p>
                </div>
              </div>
            </div>

            {/* Stage and Seller Manager */}
            <div className="rounded-xl border border-zinc-800 bg-[#202c33] p-3.5 space-y-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-zinc-400 mb-1 block">
                  Etapa do Funil
                </label>
                <select
                  value={activeLead.stage}
                  onChange={(e) =>
                    onMoveLeadStage(activeLead.id, e.target.value as FunnelStageId)
                  }
                  className="w-full rounded-lg border border-zinc-700 bg-[#111b21] p-2 text-xs text-white focus:border-[#00a884] focus:outline-none"
                >
                  {stages.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-zinc-400 mb-1 block">
                  Vendedor Atribuído
                </label>
                <select
                  value={activeLead.assignedSellerId || ""}
                  onChange={(e) =>
                    onUpdateLead(activeLead.id, {
                      assignedSellerId: e.target.value || null,
                    })
                  }
                  className="w-full rounded-lg border border-zinc-700 bg-[#111b21] p-2 text-xs text-white focus:border-[#00a884] focus:outline-none"
                >
                  <option value="">Sem Vendedor</option>
                  {sellers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.role.split(" ")[0]})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-zinc-400 mb-1.5 block">
                  Etiquetas / Tags
                </label>
                <div className="flex flex-wrap gap-1">
                  {tags.map((tag) => {
                    const isSelected = activeLead.tags.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        onClick={() => {
                          const nextTags = isSelected
                            ? activeLead.tags.filter((t) => t !== tag.id)
                            : [...activeLead.tags, tag.id];
                          onUpdateLead(activeLead.id, { tags: nextTags });
                        }}
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-all ${
                          isSelected
                            ? tag.bgColor
                            : "bg-[#111b21] text-zinc-500 border-zinc-800 hover:border-zinc-700"
                        }`}
                      >
                        {tag.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Internal Notes & Timeline */}
            <div className="rounded-xl border border-zinc-800 bg-[#202c33] p-3.5 space-y-3">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-amber-400" /> Notas Internas do Vendedor
              </h4>

              {/* Add note */}
              <form onSubmit={handleAddNote} className="space-y-2">
                <textarea
                  rows={2}
                  placeholder="Anotar preferência do cliente, detalhes da negociação..."
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-[#111b21] p-2 text-xs text-white placeholder-zinc-500 focus:border-[#00a884] focus:outline-none resize-none"
                />
                <button
                  type="submit"
                  disabled={!newNoteText.trim()}
                  className="w-full rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Salvar Nota Interna
                </button>
              </form>

              {/* Notes timeline */}
              <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
                {activeLead.notes.length === 0 ? (
                  <p className="text-[11px] text-zinc-500 italic text-center py-2">
                    Nenhuma nota interna registrada ainda.
                  </p>
                ) : (
                  activeLead.notes.map((note) => (
                    <div
                      key={note.id}
                      className="rounded-lg border border-zinc-800 bg-[#111b21] p-2 text-xs"
                    >
                      <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1">
                        <span className="font-semibold text-amber-400">{note.author}</span>
                        <span>{formatMessageTime(note.timestamp)}</span>
                      </div>
                      <p className="text-zinc-300 text-[11px]">{note.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUICK REPLIES MODAL */}
      {isQuickRepliesOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 text-white shadow-2xl">
            <div className="border-b border-zinc-800 bg-zinc-900/60 px-6 py-4 flex items-center justify-between">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Zap className="h-5 w-5 text-red-500" /> Scripts & Mensagens Rápidas Balão
              </h3>
              <button
                onClick={() => setIsQuickRepliesOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-3">
              {quickReplies.map((qr) => (
                <div
                  key={qr.id}
                  onClick={() => handleInsertTemplate(qr)}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/90 p-4 hover:border-red-500 hover:bg-zinc-850 cursor-pointer transition-all group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="text-xs font-bold text-white group-hover:text-red-400">
                      {qr.title}
                    </h4>
                    {qr.shortcut && (
                      <span className="text-[10px] font-mono font-semibold bg-zinc-800 px-2 py-0.5 rounded text-zinc-400">
                        {qr.shortcut}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-300 whitespace-pre-wrap line-clamp-3">
                    {renderTemplateText(qr.message)}
                  </p>
                  <div className="mt-2 text-right">
                    <span className="text-[11px] font-bold text-red-400 group-hover:underline">
                      Inserir na conversa →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* BALAO CATALOG INSERTER MODAL */}
      {isCatalogModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 text-white shadow-2xl">
            <div className="border-b border-zinc-800 bg-zinc-900/60 px-6 py-4 flex items-center justify-between">
              <h3 className="text-base font-bold flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-blue-500" /> Catálogo Balão da Informática
              </h3>
              <button
                onClick={() => setIsCatalogModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
              {catalogProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleInsertProduct(product)}
                  className="flex gap-3 rounded-xl border border-zinc-800 bg-zinc-900/90 p-3 hover:border-blue-500 hover:bg-zinc-850 cursor-pointer transition-all group"
                >
                  <div className="h-20 w-20 rounded-lg overflow-hidden bg-zinc-950 shrink-0 border border-zinc-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-semibold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">
                      {product.category}
                    </span>
                    <h4 className="text-xs font-bold text-white line-clamp-2 mt-1">
                      {product.name}
                    </h4>
                    <p className="text-xs font-mono font-bold text-emerald-400 mt-1">
                      {product.formattedPrice}
                    </p>
                    <span className="text-[10px] text-zinc-400 group-hover:text-blue-300 mt-1 block">
                      Clique para anexar no chat →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PIX GENERATOR MODAL */}
      {isPixModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 text-white shadow-2xl">
            <div className="border-b border-zinc-800 bg-zinc-900/60 px-6 py-4 flex items-center justify-between">
              <h3 className="text-base font-bold flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-emerald-400" /> Gerador de Cobrança Pix Balão
              </h3>
              <button
                onClick={() => setIsPixModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Valor Original (R$)
                </label>
                <input
                  type="number"
                  value={pixAmount}
                  onChange={(e) => setPixAmount(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Descrição do Pedido / Peças
                </label>
                <input
                  type="text"
                  value={pixDescription}
                  onChange={(e) => setPixDescription(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 space-y-1">
                <p className="text-xs text-emerald-300 font-medium">
                  Com 10% de desconto à vista no Pix:
                </p>
                <p className="text-xl font-bold font-mono text-emerald-400">
                  R$ {(Number(pixAmount) * 0.9 || 0).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </p>
                <p className="text-[11px] text-zinc-400">
                  Chave: <strong>pix@balao.info</strong> (Balão da Informática)
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPixModalOpen(false)}
                  className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-300"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleGeneratePix}
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-950/50"
                >
                  Inserir Pix na Conversa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SCHEDULE FOLLOW-UP MODAL */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 text-white shadow-2xl">
            <div className="border-b border-zinc-800 bg-zinc-900/60 px-6 py-4 flex items-center justify-between">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-400" /> Agendar Mensagem / Follow-up
              </h3>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Cliente: <strong className="text-white">{activeLead.name}</strong> ({activeLead.phone})
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Data e Hora do Envio *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={scheduleDatetime}
                  onChange={(e) => setScheduleDatetime(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Mensagem Automática *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Ex: Olá Lucas! Passando para saber se conseguiu avaliar o orçamento do PC Gamer com a RTX 4060..."
                  value={scheduleText}
                  onChange={(e) => setScheduleText(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-600 px-5 py-2 text-xs font-bold text-white hover:bg-amber-500 transition-colors shadow-lg shadow-amber-950/50"
                >
                  Confirmar Agendamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
