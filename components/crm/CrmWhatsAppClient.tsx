"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Columns3,
  MessageSquare,
  Zap,
  Users,
  Clock,
  BarChart3,
  QrCode,
  Wifi,
  WifiOff,
  Bell,
  RefreshCw,
  Phone,
  ShieldCheck,
  Power,
  ExternalLink,
  Search,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
} from "lucide-react";
import { io, type Socket } from "socket.io-client";
import {
  BalãoProductCatalogItem,
  CrmLead,
  CrmMessage,
  CrmSeller,
  CrmTag,
  FunnelStage,
  FunnelStageId,
  QuickReplyTemplate,
  ScheduledMessage,
  WhatsAppStatus,
} from "@/types/crm";
import {
  BALAO_FEATURED_PRODUCTS,
  BALAO_QUICK_REPLIES,
  CRM_SELLERS,
  CRM_STAGES,
  CRM_TAGS,
  INITIAL_SCHEDULED_MESSAGES,
  INITIAL_SEED_LEADS,
  INITIAL_SEED_MESSAGES,
} from "@/lib/crm-defaults";

import CrmKanbanView from "./CrmKanbanView";
import CrmChatWorkspace from "./CrmChatWorkspace";
import CrmQuickReplies from "./CrmQuickReplies";
import CrmBroadcastView from "./CrmBroadcastView";
import CrmScheduleView from "./CrmScheduleView";
import CrmMetricsView from "./CrmMetricsView";
import CrmQrCodeModal from "./CrmQrCodeModal";

type CrmView = "kanban" | "chat" | "scripts" | "broadcast" | "schedules" | "metrics";

export default function CrmWhatsAppClient() {
  const socketRef = useRef<Socket | null>(null);
  const serverUrl =
    process.env.NEXT_PUBLIC_WHATSAPP_PANEL_SERVER_URL || "http://localhost:4100";

  // Views & Modals
  const [activeView, setActiveView] = useState<CrmView>("kanban");
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // WhatsApp Connection State
  const [status, setStatus] = useState<WhatsAppStatus>("ready");
  const [socketConnected, setSocketConnected] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string | null>("19981188090");

  // Core CRM Data
  const [leads, setLeads] = useState<CrmLead[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("balao_crm_leads");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return INITIAL_SEED_LEADS;
  });

  const [messages, setMessages] = useState<CrmMessage[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("balao_crm_messages");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return INITIAL_SEED_MESSAGES;
  });

  const [schedules, setSchedules] = useState<ScheduledMessage[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("balao_crm_schedules");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return INITIAL_SCHEDULED_MESSAGES;
  });

  const [quickReplies, setQuickReplies] = useState<QuickReplyTemplate[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("balao_crm_quick_replies");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return BALAO_QUICK_REPLIES;
  });

  const [activeChatId, setActiveChatId] = useState<string | null>(
    INITIAL_SEED_LEADS[0]?.chatId || null
  );

  const [catalogProducts, setCatalogProducts] =
    useState<BalãoProductCatalogItem[]>(BALAO_FEATURED_PRODUCTS);

  // Save to LocalStorage on changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("balao_crm_leads", JSON.stringify(leads));
    }
  }, [leads]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("balao_crm_messages", JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("balao_crm_schedules", JSON.stringify(schedules));
    }
  }, [schedules]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("balao_crm_quick_replies", JSON.stringify(quickReplies));
    }
  }, [quickReplies]);

  // Fetch real site products from /api/products if available
  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch("/api/products");
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const mapped: BalãoProductCatalogItem[] = data.slice(0, 30).map((p: any) => ({
            id: String(p.id),
            name: p.name,
            price: typeof p.price === "number" ? p.price : parseFloat(String(p.price).replace(/[^0-9.]/g, "")) || 999,
            formattedPrice: typeof p.price === "number" ? `R$ ${p.price.toLocaleString("pt-BR")}` : String(p.price || "R$ 999,00"),
            category: p.category || "Informática",
            image: p.image || "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500&auto=format&fit=crop&q=80",
            slug: p.slug,
            specs: Array.isArray(p.specs) ? p.specs : Object.values(p.specs || {}).map(String),
          }));
          if (mapped.length) {
            setCatalogProducts(mapped);
          }
        }
      } catch {}
    }
    loadProducts();
  }, []);

  // Socket.IO Connection Setup
  useEffect(() => {
    const socket = io(serverUrl, {
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setSocketConnected(true);
      socket.emit("panel:bootstrap");
    });

    socket.on("disconnect", () => {
      setSocketConnected(false);
    });

    socket.on("whatsapp:state", (payload: any) => {
      if (payload?.status) {
        setStatus(payload.status);
      }
      if (payload?.qrCode) {
        setQrCodeData(payload.qrCode);
      }
      if (payload?.phoneNumber) {
        setPhoneNumber(payload.phoneNumber);
      }
    });

    socket.on("whatsapp:toast", (payload: any) => {
      if (payload?.message) {
        showToast(payload.message);
      }
    });

    socket.on("whatsapp:message", (newMsg: any) => {
      if (!newMsg || !newMsg.chatId) return;

      const formattedMsg: CrmMessage = {
        id: newMsg.id || `msg-${Date.now()}`,
        chatId: newMsg.chatId,
        from: newMsg.from || newMsg.chatId,
        body: newMsg.body || "",
        direction: newMsg.direction || "in",
        timestamp: newMsg.timestamp || Date.now(),
        contactName: newMsg.contactName,
        realNumber: newMsg.realNumber,
        hasMedia: newMsg.hasMedia,
        status: "read",
      };

      setMessages((prev) => {
        if (prev.some((m) => m.id === formattedMsg.id)) return prev;
        return [...prev, formattedMsg];
      });

      // Update or create lead
      setLeads((prevLeads) => {
        const existingIdx = prevLeads.findIndex((l) => l.chatId === newMsg.chatId);
        if (existingIdx >= 0) {
          const next = [...prevLeads];
          next[existingIdx] = {
            ...next[existingIdx],
            lastMessageBody: newMsg.body,
            lastMessageTimestamp: newMsg.timestamp || Date.now(),
            unreadCount:
              newMsg.direction === "in"
                ? next[existingIdx].unreadCount + 1
                : next[existingIdx].unreadCount,
          };
          return next;
        } else {
          // New incoming lead
          const newLead: CrmLead = {
            id: `lead-${Date.now()}`,
            chatId: newMsg.chatId,
            name: newMsg.contactName || newMsg.realNumber || "Novo Cliente WhatsApp",
            phone: newMsg.realNumber || newMsg.chatId.replace(/\D/g, ""),
            stage: "new_lead",
            dealValue: 0,
            tags: ["vip"],
            assignedSellerId: null,
            unreadCount: 1,
            lastMessageBody: newMsg.body,
            lastMessageTimestamp: newMsg.timestamp || Date.now(),
            notes: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          return [newLead, ...prevLeads];
        }
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [serverUrl]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 4000);
  };

  // Move lead stage
  const handleMoveLeadStage = (leadId: string, targetStage: FunnelStageId) => {
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === leadId
          ? { ...lead, stage: targetStage, updatedAt: Date.now() }
          : lead
      )
    );
    const stageName = CRM_STAGES.find((s) => s.id === targetStage)?.shortTitle;
    showToast(`Lead movido para a etapa: ${stageName}`);
  };

  // Update lead
  const handleUpdateLead = (leadId: string, updates: Partial<CrmLead>) => {
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === leadId
          ? { ...lead, ...updates, updatedAt: Date.now() }
          : lead
      )
    );
  };

  // Create lead
  const handleCreateLead = (leadData: Partial<CrmLead>) => {
    const newLead: CrmLead = {
      id: `lead-${Date.now()}`,
      chatId: leadData.chatId || `${Date.now()}@c.us`,
      name: leadData.name || "Novo Cliente",
      phone: leadData.phone || "",
      displayNumber: leadData.displayNumber,
      stage: leadData.stage || "new_lead",
      dealValue: leadData.dealValue || 0,
      tags: leadData.tags || ["pcgamer"],
      assignedSellerId: leadData.assignedSellerId || null,
      unreadCount: 0,
      lastMessageBody: leadData.lastMessageBody || "Lead adicionado no CRM Balão.",
      lastMessageTimestamp: Date.now(),
      productOfInterest: leadData.productOfInterest,
      notes: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setLeads((prev) => [newLead, ...prev]);
    showToast(`Lead "${newLead.name}" criado com sucesso no funil!`);
  };

  // Delete lead
  const handleDeleteLead = (leadId: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== leadId));
    showToast("Lead removido.");
  };

  // Add customer note
  const handleAddCustomerNote = (
    leadId: string,
    noteText: string,
    author: string
  ) => {
    setLeads((prev) =>
      prev.map((lead) => {
        if (lead.id !== leadId) return lead;
        const newNote = {
          id: `note-${Date.now()}`,
          author,
          text: noteText,
          timestamp: Date.now(),
        };
        return {
          ...lead,
          notes: [newNote, ...lead.notes],
          updatedAt: Date.now(),
        };
      })
    );
    showToast("Nota interna registrada!");
  };

  // Send Message handler
  const handleSendMessage = (chatId: string, text: string) => {
    const lead = leads.find((l) => l.chatId === chatId);

    const newMsg: CrmMessage = {
      id: `msg-out-${Date.now()}`,
      chatId,
      from: "balao",
      body: text,
      direction: "out",
      timestamp: Date.now(),
      status: "sent",
    };

    setMessages((prev) => [...prev, newMsg]);

    // Update lead last message
    setLeads((prev) =>
      prev.map((l) =>
        l.chatId === chatId
          ? {
              ...l,
              lastMessageBody: text,
              lastMessageTimestamp: Date.now(),
              unreadCount: 0,
            }
          : l
      )
    );

    // If socket is connected, emit event to whatsapp-server
    if (socketRef.current?.connected && lead) {
      socketRef.current.emit("panel:send-message", {
        number: lead.phone,
        text,
        chatId: lead.chatId,
      });
    }

    showToast("Mensagem enviada!");
  };

  // Schedule follow-up
  const handleScheduleMessage = (
    leadId: string,
    phone: string,
    text: string,
    sendAt: string
  ) => {
    const lead = leads.find((l) => l.id === leadId);
    const newSchedule: ScheduledMessage = {
      id: `sched-${Date.now()}`,
      leadId,
      leadName: lead?.name || phone,
      phone,
      message: text,
      sendAt,
      status: "pending",
      sellerId: lead?.assignedSellerId || null,
      createdAt: Date.now(),
    };

    setSchedules((prev) => [newSchedule, ...prev]);

    if (socketRef.current?.connected) {
      socketRef.current.emit("panel:schedule-message", {
        number: phone,
        text,
        sendAt,
      });
    }

    showToast("Mensagem agendada com sucesso!");
  };

  // Cancel schedule
  const handleCancelSchedule = (scheduleId: string) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === scheduleId ? { ...s, status: "cancelled" } : s))
    );
    if (socketRef.current?.connected) {
      socketRef.current.emit("panel:cancel-schedule", { id: scheduleId });
    }
    showToast("Agendamento cancelado.");
  };

  // Broadcast campaign
  const handleExecuteBroadcast = (
    recipients: { number: string; chatId: string }[],
    text: string
  ) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("panel:send-segmented", {
        recipients,
        text,
      });
    }
    showToast(`Disparo iniciado para ${recipients.length} contatos!`);
  };

  // Open Chat from Kanban card
  const handleOpenChatFromKanban = (chatId: string) => {
    setActiveChatId(chatId);
    setActiveView("chat");
  };

  // Total Open Pipeline Value
  const totalOpenValue = useMemo(() => {
    return leads
      .filter((l) => l.stage !== "won" && l.stage !== "lost")
      .reduce((acc, l) => acc + (l.dealValue || 0), 0);
  }, [leads]);

  const totalWonValue = useMemo(() => {
    return leads
      .filter((l) => l.stage === "won")
      .reduce((acc, l) => acc + (l.dealValue || 0), 0);
  }, [leads]);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full overflow-hidden bg-zinc-950 text-zinc-100 font-sans select-none">
      {/* TOP HEADER: Branding, Status, Views, KPIs */}
      <header className="flex flex-wrap items-center justify-between border-b border-zinc-800/80 bg-zinc-900 px-4 py-2.5 shrink-0 gap-3">
        {/* Left: Balão CRM Logo & Status Button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-red-800 text-white font-black text-sm shadow-md shadow-red-950/50">
              B
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-black tracking-tight text-white uppercase">
                  Balão CRM
                </h1>
                <span className="rounded bg-gradient-to-r from-[#25D366]/20 to-[#128C7E]/20 text-[#25D366] px-1.5 py-0.2 text-[10px] font-extrabold border border-[#25D366]/30">
                  WASeller Pro
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-mono">
                www.balao.info/crm
              </p>
            </div>
          </div>

          {/* WhatsApp Connection Button */}
          <button
            onClick={() => setIsQrModalOpen(true)}
            className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer border ${
              status === "ready" || status === "authenticated"
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                : status === "qr"
                ? "bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20 animate-pulse"
                : "bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20"
            }`}
          >
            <QrCode className="h-4 w-4" />
            <span className="hidden sm:inline">
              {status === "ready" || status === "authenticated"
                ? "WhatsApp Conectado"
                : status === "qr"
                ? "Escanear QR Code"
                : "Conectar WhatsApp"}
            </span>
            <div
              className={`h-2 w-2 rounded-full ${
                status === "ready" || status === "authenticated"
                  ? "bg-emerald-400"
                  : status === "qr"
                  ? "bg-amber-400 animate-ping"
                  : "bg-red-400"
              }`}
            />
          </button>
        </div>

        {/* Center: View Switcher Tabs */}
        <div className="flex items-center gap-1 bg-zinc-950/80 p-1 rounded-xl border border-zinc-800 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveView("kanban")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
              activeView === "kanban"
                ? "bg-red-600 text-white shadow"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Columns3 className="h-3.5 w-3.5" /> Funil Kanban
          </button>

          <button
            onClick={() => setActiveView("chat")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer relative ${
              activeView === "chat"
                ? "bg-red-600 text-white shadow"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" /> Atendimento / Chat
            {leads.some((l) => l.unreadCount > 0) && (
              <span className="h-2 w-2 rounded-full bg-[#25D366]" />
            )}
          </button>

          <button
            onClick={() => setActiveView("scripts")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
              activeView === "scripts"
                ? "bg-red-600 text-white shadow"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Zap className="h-3.5 w-3.5" /> Scripts
          </button>

          <button
            onClick={() => setActiveView("broadcast")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
              activeView === "broadcast"
                ? "bg-red-600 text-white shadow"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Users className="h-3.5 w-3.5" /> Disparos
          </button>

          <button
            onClick={() => setActiveView("schedules")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
              activeView === "schedules"
                ? "bg-red-600 text-white shadow"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Clock className="h-3.5 w-3.5" /> Agendamentos
          </button>

          <button
            onClick={() => setActiveView("metrics")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
              activeView === "metrics"
                ? "bg-red-600 text-white shadow"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" /> Métricas
          </button>
        </div>

        {/* Right: Quick Financial KPIs */}
        <div className="hidden lg:flex items-center gap-4 text-xs">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-zinc-500 block">
              Em Aberto
            </span>
            <span className="font-mono font-bold text-amber-400">
              R$ {totalOpenValue.toLocaleString("pt-BR")}
            </span>
          </div>

          <div className="text-right border-l border-zinc-800 pl-4">
            <span className="text-[10px] uppercase font-bold text-emerald-500 block">
              Ganhos
            </span>
            <span className="font-mono font-bold text-emerald-400">
              R$ {totalWonValue.toLocaleString("pt-BR")}
            </span>
          </div>
        </div>
      </header>

      {/* MAIN VIEW CONTAINER */}
      <main className="flex-1 overflow-hidden relative">
        {activeView === "kanban" && (
          <CrmKanbanView
            stages={CRM_STAGES}
            leads={leads}
            tags={CRM_TAGS}
            sellers={CRM_SELLERS}
            onMoveLead={handleMoveLeadStage}
            onOpenChat={handleOpenChatFromKanban}
            onSelectLeadDrawer={(lead) => {
              setActiveChatId(lead.chatId);
              setActiveView("chat");
            }}
            onCreateLead={handleCreateLead}
            onDeleteLead={handleDeleteLead}
          />
        )}

        {activeView === "chat" && (
          <CrmChatWorkspace
            leads={leads}
            activeChatId={activeChatId}
            onSelectChat={(id) => setActiveChatId(id)}
            messages={messages}
            onSendMessage={handleSendMessage}
            stages={CRM_STAGES}
            tags={CRM_TAGS}
            sellers={CRM_SELLERS}
            quickReplies={quickReplies}
            catalogProducts={catalogProducts}
            onMoveLeadStage={handleMoveLeadStage}
            onUpdateLead={handleUpdateLead}
            onAddCustomerNote={handleAddCustomerNote}
            onScheduleMessage={handleScheduleMessage}
          />
        )}

        {activeView === "scripts" && (
          <CrmQuickReplies
            templates={quickReplies}
            onCreateTemplate={(tpl) => {
              setQuickReplies((prev) => [
                { ...tpl, id: `tpl-${Date.now()}` },
                ...prev,
              ]);
              showToast("Script salvo com sucesso!");
            }}
            onDeleteTemplate={(id) => {
              setQuickReplies((prev) => prev.filter((t) => t.id !== id));
              showToast("Script excluído.");
            }}
          />
        )}

        {activeView === "broadcast" && (
          <CrmBroadcastView
            leads={leads}
            stages={CRM_STAGES}
            tags={CRM_TAGS}
            onExecuteBroadcast={handleExecuteBroadcast}
          />
        )}

        {activeView === "schedules" && (
          <CrmScheduleView
            schedules={schedules}
            leads={leads}
            onCancelSchedule={handleCancelSchedule}
            onAddSchedule={(sched) => {
              const newS = {
                ...sched,
                id: `sched-${Date.now()}`,
                createdAt: Date.now(),
              };
              setSchedules((prev) => [newS, ...prev]);
              showToast("Agendamento criado com sucesso!");
            }}
          />
        )}

        {activeView === "metrics" && (
          <CrmMetricsView
            leads={leads}
            stages={CRM_STAGES}
            sellers={CRM_SELLERS}
          />
        )}
      </main>

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[99999] flex items-center gap-2 rounded-xl bg-zinc-900/95 border border-zinc-700 text-white px-4 py-2.5 text-xs font-semibold shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="h-4 w-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* QR CODE MODAL */}
      <CrmQrCodeModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        status={status}
        qrCodeData={qrCodeData}
        phoneNumber={phoneNumber}
        onRefreshQr={() => {
          if (socketRef.current?.connected) {
            socketRef.current.emit("panel:reset-session");
          }
          showToast("Gerando novo QR Code...");
        }}
        onResetSession={() => {
          if (socketRef.current?.connected) {
            socketRef.current.emit("panel:reset-session");
          }
          setStatus("initializing");
          showToast("Reiniciando sessão do WhatsApp...");
        }}
        serverConnected={socketConnected}
      />
    </div>
  );
}
