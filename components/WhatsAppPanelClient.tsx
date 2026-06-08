"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarClock,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  LoaderCircle,
  MessageCircle,
  MessageSquareReply,
  Package2,
  Plus,
  QrCode,
  RefreshCcw,
  Search,
  Send,
  Sparkles,
  Tag,
  Trash2,
  UserRound,
  Wifi,
  WifiOff,
} from "lucide-react";
import { io, type Socket } from "socket.io-client";

type WhatsAppStatus =
  | "disconnected"
  | "initializing"
  | "qr"
  | "authenticated"
  | "ready"
  | "auth_failure";

type PanelMessage = {
  id: string;
  chatId: string;
  from: string;
  to?: string | null;
  body: string;
  direction: "in" | "out";
  timestamp: number;
  contactName?: string | null;
  labels?: string[];
};

type SignatureItem = {
  id: string;
  sellerName: string;
  signature: string;
};

type QuickReplyItem = {
  id: string;
  title: string;
  message: string;
};

type ScheduleItem = {
  id: string;
  number: string;
  text: string;
  sendAt: string;
  status: "pending" | "sent" | "cancelled" | "failed";
};

type PanelSettings = {
  labels: string[];
  signatures: SignatureItem[];
  quickReplies: QuickReplyItem[];
  schedules: ScheduleItem[];
  chatLabels: Record<string, string[]>;
};

type PanelStatePayload = {
  status: WhatsAppStatus;
  qrCode: string | null;
  connected: boolean;
  session: boolean;
  phoneNumber: string | null;
};

type SiteProduct = {
  id: string;
  name: string;
  price: string;
  image?: string;
  slug?: string;
};

function formatPhoneNumber(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  return digits;
}

function formatTime(timestamp: number) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

function getChatDigits(value: string) {
  return value.replace(/\D/g, "");
}

function getChatDisplayName(message: PanelMessage) {
  return message.contactName || getChatDigits(message.chatId) || message.chatId;
}

function getChatPreviewNumber(message: PanelMessage) {
  return getChatDigits(message.chatId) || getChatDigits(message.from) || message.chatId;
}

type CascadeSectionProps = {
  title: string;
  icon: React.ReactNode;
  open: boolean;
  count?: string;
  onToggle: () => void;
  children: React.ReactNode;
};

function CascadeSection({
  title,
  icon,
  open,
  count,
  onToggle,
  children,
}: CascadeSectionProps) {
  return (
    <section className="overflow-hidden rounded-3xl border border-red-100 bg-white shadow-sm">
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-red-50/70"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-black text-slate-900">{title}</div>
          {count ? <div className="text-xs text-slate-500">{count}</div> : null}
        </div>
        <div className="text-slate-400">{open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}</div>
      </button>
      {open ? <div className="border-t border-red-100 px-5 py-4">{children}</div> : null}
    </section>
  );
}

export default function WhatsAppPanelClient() {
  const socketRef = useRef<Socket | null>(null);
  const serverUrl =
    process.env.NEXT_PUBLIC_WHATSAPP_PANEL_SERVER_URL || "http://localhost:4100";
  const [status, setStatus] = useState<WhatsAppStatus>("initializing");
  const [socketConnected, setSocketConnected] = useState(false);
  const [connected, setConnected] = useState(false);
  const [session, setSession] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [serverHealthMessage, setServerHealthMessage] = useState("Verificando servidor...");
  const [messages, setMessages] = useState<PanelMessage[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [chatLabels, setChatLabels] = useState<Record<string, string[]>>({});
  const [signatures, setSignatures] = useState<SignatureItem[]>([]);
  const [quickReplies, setQuickReplies] = useState<QuickReplyItem[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string>("");
  const [selectedSignatureId, setSelectedSignatureId] = useState<string>("");
  const [number, setNumber] = useState("");
  const [message, setMessage] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [signatureName, setSignatureName] = useState("");
  const [signatureText, setSignatureText] = useState("");
  const [quickTitle, setQuickTitle] = useState("");
  const [quickMessage, setQuickMessage] = useState("");
  const [scheduleDateTime, setScheduleDateTime] = useState("");
  const [toast, setToast] = useState<string>("");
  const [chatSearch, setChatSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [productResults, setProductResults] = useState<SiteProduct[]>([]);
  const [productLoading, setProductLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<SiteProduct | null>(null);
  const [openSections, setOpenSections] = useState({
    replies: true,
    labels: false,
    signatures: false,
    schedules: false,
  });

  useEffect(() => {
    const socket = io(serverUrl, {
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    const handleState = (payload: PanelStatePayload) => {
      setStatus(payload.status);
      setQrCode(payload.qrCode);
      setConnected(payload.connected);
      setSession(payload.session);
      setPhoneNumber(payload.phoneNumber);
    };

    const handleSettings = (payload: PanelSettings) => {
      setLabels(payload.labels || []);
      setSignatures(payload.signatures || []);
      setQuickReplies(payload.quickReplies || []);
      setSchedules(payload.schedules || []);
      setChatLabels(payload.chatLabels || {});
    };

    socket.on("connect", () => {
      setSocketConnected(true);
      setServerHealthMessage("Servidor online.");
      socket.emit("panel:bootstrap");
    });
    socket.on("disconnect", () => {
      setSocketConnected(false);
      setConnected(false);
      setServerHealthMessage(
        "Servidor do WhatsApp offline ou inacessivel. Sem ele o QR Code nao pode ser gerado."
      );
    });
    socket.on("connect_error", () => {
      setSocketConnected(false);
      setConnected(false);
      setServerHealthMessage(
        "Nao foi possivel conectar ao servidor do WhatsApp. Verifique se ele esta rodando."
      );
    });
    socket.on("whatsapp:state", handleState);
    socket.on("whatsapp:settings", handleSettings);
    socket.on("whatsapp:messages", (payload: PanelMessage[]) => {
      setMessages(payload || []);
    });
    socket.on("whatsapp:message", (payload: PanelMessage) => {
      setMessages((current) => {
        const next = [...current, payload];
        return next.sort((a, b) => a.timestamp - b.timestamp);
      });
    });
    socket.on("whatsapp:toast", (payload: { message: string }) => {
      setToast(payload.message);
      window.setTimeout(() => setToast(""), 3500);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const checkHealth = async () => {
      try {
        const response = await fetch(`${serverUrl}/health`, {
          method: "GET",
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error("health_failed");
        }
        const payload = await response.json();
        if (!active) return;

        if (payload.connected) {
          setServerHealthMessage("Servidor online e WhatsApp conectado.");
        } else if (payload.status === "qr") {
          setServerHealthMessage("Servidor online e QR Code pronto para leitura.");
        } else if (payload.status === "initializing") {
          setServerHealthMessage("Servidor online e iniciando o WhatsApp.");
        } else {
          setServerHealthMessage("Servidor online aguardando autenticacao do WhatsApp.");
        }
      } catch {
        if (!active) return;
        setServerHealthMessage(
          "Servidor do WhatsApp offline ou inacessivel. Sem ele o QR Code nao pode ser gerado."
        );
      }
    };

    checkHealth();
    const interval = window.setInterval(checkHealth, 10000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [serverUrl]);

  useEffect(() => {
    const query = productSearch.trim();
    if (query.length < 2) {
      setProductResults([]);
      setProductLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      try {
        setProductLoading(true);
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error("search_failed");
        }
        const payload = (await response.json()) as SiteProduct[];
        setProductResults(Array.isArray(payload) ? payload.slice(0, 8) : []);
      } catch {
        if (!controller.signal.aborted) {
          setProductResults([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setProductLoading(false);
        }
      }
    }, 350);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [productSearch]);

  const chatList = useMemo(() => {
    const map = new Map<string, PanelMessage>();
    messages.forEach((item) => {
      const current = map.get(item.chatId);
      if (!current || current.timestamp < item.timestamp) {
        map.set(item.chatId, item);
      }
    });
    return Array.from(map.values()).sort((a, b) => b.timestamp - a.timestamp);
  }, [messages]);

  const filteredChatList = useMemo(() => {
    const query = chatSearch.trim().toLowerCase();
    if (!query) return chatList;

    return chatList.filter((item) => {
      const name = getChatDisplayName(item).toLowerCase();
      const number = getChatPreviewNumber(item).toLowerCase();
      const body = item.body.toLowerCase();
      const labelsForChat = (chatLabels[item.chatId] || []).join(" ").toLowerCase();
      return (
        name.includes(query) ||
        number.includes(query) ||
        body.includes(query) ||
        labelsForChat.includes(query)
      );
    });
  }, [chatLabels, chatList, chatSearch]);

  useEffect(() => {
    if (!selectedChatId && filteredChatList[0]) {
      setSelectedChatId(filteredChatList[0].chatId);
    }
  }, [filteredChatList, selectedChatId]);

  const selectedChatMessages = useMemo(() => {
    return messages.filter((item) => item.chatId === selectedChatId);
  }, [messages, selectedChatId]);

  const selectedChatLabels = chatLabels[selectedChatId] || [];
  const selectedChat = useMemo(
    () => chatList.find((item) => item.chatId === selectedChatId) || null,
    [chatList, selectedChatId]
  );
  const selectedChatName = selectedChat ? getChatDisplayName(selectedChat) : "Selecione uma conversa";
  const selectedChatNumber = selectedChat ? getChatPreviewNumber(selectedChat) : "";

  const sendSocketEvent = (event: string, payload: Record<string, unknown>) => {
    socketRef.current?.emit(event, payload);
  };

  const currentOrigin =
    typeof window !== "undefined" ? window.location.origin : "https://www.balao.info";

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  const handleSendMessage = () => {
    const normalized = formatPhoneNumber(number);
    if (!normalized || !message.trim()) return;

    sendSocketEvent("panel:send-message", {
      number: normalized,
      text: message.trim(),
      signatureId: selectedSignatureId || null,
    });
    setNumber(normalized);
    setMessage("");
  };

  const handleAddLabel = () => {
    if (!newLabel.trim()) return;
    sendSocketEvent("panel:add-label", { label: newLabel.trim() });
    setNewLabel("");
  };

  const handleToggleLabelOnChat = (label: string) => {
    if (!selectedChatId) return;
    sendSocketEvent("panel:toggle-chat-label", {
      chatId: selectedChatId,
      label,
    });
  };

  const handleAddSignature = () => {
    if (!signatureName.trim() || !signatureText.trim()) return;
    sendSocketEvent("panel:add-signature", {
      sellerName: signatureName.trim(),
      signature: signatureText.trim(),
    });
    setSignatureName("");
    setSignatureText("");
  };

  const handleAddQuickReply = () => {
    if (!quickTitle.trim() || !quickMessage.trim()) return;
    sendSocketEvent("panel:add-quick-reply", {
      title: quickTitle.trim(),
      message: quickMessage.trim(),
    });
    setQuickTitle("");
    setQuickMessage("");
  };

  const handleScheduleMessage = () => {
    const normalized = formatPhoneNumber(number);
    if (!normalized || !message.trim() || !scheduleDateTime) return;
    sendSocketEvent("panel:schedule-message", {
      number: normalized,
      text: message.trim(),
      sendAt: scheduleDateTime,
      signatureId: selectedSignatureId || null,
    });
    setScheduleDateTime("");
  };

  const handleResetSession = () => {
    sendSocketEvent("panel:reset-session", {});
  };

  const handleSyncConversations = () => {
    sendSocketEvent("panel:sync-conversations", {});
  };

  const getProductUrl = (product: SiteProduct) => {
    return `${currentOrigin}/product/${product.slug || product.id}`;
  };

  const buildProductMessage = (product: SiteProduct) => {
    return [
      `Produto recomendado da Balão da Informática:`,
      ``,
      `${product.name}`,
      `${product.price || "Consulte o valor"}`,
      `${getProductUrl(product)}`,
    ].join("\n");
  };

  const handleInsertProduct = (product: SiteProduct) => {
    const text = buildProductMessage(product);
    setSelectedProduct(product);
    setMessage((current) => (current.trim() ? `${current.trim()}\n\n${text}` : text));
  };

  const handleSendProduct = (product: SiteProduct) => {
    const normalized = formatPhoneNumber(number || selectedChatNumber);
    if (!normalized) {
      setToast("Selecione uma conversa ou informe o numero para enviar o produto.");
      window.setTimeout(() => setToast(""), 3500);
      return;
    }

    sendSocketEvent("panel:send-message", {
      number: normalized,
      text: buildProductMessage(product),
      signatureId: selectedSignatureId || null,
    });
    setSelectedProduct(product);
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fff5f5_0%,#fffdfd_100%)] text-slate-900">
      <div className="mx-auto max-w-[1700px] px-4 py-6 md:px-6 md:py-8">
        <div className="mb-6 overflow-hidden rounded-[32px] border border-red-100 bg-white shadow-[0_30px_80px_rgba(239,68,68,0.08)]">
          <div className="bg-[linear-gradient(135deg,#dc2626_0%,#ef4444_60%,#b91c1c_100%)] px-6 py-7 text-white md:px-8 md:py-8">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs font-bold uppercase tracking-[0.32em] text-red-100">
                  Balao da Informatica
                </p>
                <h1 className="mt-3 text-3xl font-black leading-tight md:text-5xl">
                  Central de Atendimento WhatsApp
                </h1>
                <p className="mt-4 text-sm leading-relaxed text-red-50 md:text-base">
                  Tela redesenhada para leitura ampla, conversa principal maior e ferramentas
                  laterais em cascata para liberar espaco de atendimento.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-sm font-bold">
                    {socketConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
                    Servidor
                  </div>
                  <p className="mt-2 text-sm text-red-50">
                    {socketConnected ? "Online e respondendo" : "Offline ou bloqueado"}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <CheckCircle2 size={16} />
                    Sessao
                  </div>
                  <p className="mt-2 text-sm text-red-50">
                    {session ? "LocalAuth restaurado" : "Sem sessao salva"}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <UserRound size={16} />
                    Numero
                  </div>
                  <p className="mt-2 text-sm text-red-50">{phoneNumber || "Nao conectado"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 border-t border-red-100 bg-white px-6 py-4 md:grid-cols-3 md:px-8">
            <div className="rounded-2xl bg-red-50 px-4 py-3">
              <div className="text-xs font-bold uppercase tracking-wide text-red-600">Status</div>
              <div className="mt-1 font-semibold text-slate-900">{status}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Servidor</div>
              <div className="mt-1 text-sm font-medium text-slate-800">{serverHealthMessage}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500">URL</div>
              <div className="mt-1 truncate text-sm font-medium text-slate-800">{serverUrl}</div>
            </div>
          </div>

          {toast ? (
            <div className="border-t border-red-100 bg-red-50 px-6 py-3 text-sm font-medium text-red-700 md:px-8">
              {toast}
            </div>
          ) : null}
        </div>

        <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)] 2xl:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="space-y-5">
            <section className="overflow-hidden rounded-[28px] border border-red-100 bg-white shadow-sm">
              <div className="border-b border-red-100 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                    <QrCode size={20} />
                  </div>
                  <div>
                    <h2 className="font-black text-slate-900">Conexao e QR Code</h2>
                    <p className="text-sm text-slate-500">Controle rapido da autenticacao</p>
                  </div>
                </div>
              </div>

              <div className="p-5">
                <div className="rounded-3xl border border-dashed border-red-200 bg-[linear-gradient(180deg,#fffdfd_0%,#fff5f5_100%)] p-5 text-center">
                  {!socketConnected ? (
                    <>
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                        <WifiOff className="text-red-600" />
                      </div>
                      <p className="font-black text-slate-900">Servidor do WhatsApp offline</p>
                      <p className="mt-2 text-sm leading-relaxed text-slate-500">
                        Sem o servidor Node ativo, o QR Code nao pode ser gerado.
                      </p>
                    </>
                  ) : status === "ready" && !qrCode ? (
                    <>
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle2 className="text-green-600" />
                      </div>
                      <p className="font-black text-slate-900">WhatsApp conectado</p>
                      <p className="mt-2 text-sm leading-relaxed text-slate-500">
                        O QR Code fica oculto enquanto a sessao estiver ativa.
                      </p>
                    </>
                  ) : qrCode ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={qrCode}
                        alt="QR Code do WhatsApp"
                        className="mx-auto w-full max-w-[250px] rounded-[28px] border border-red-100 bg-white p-3 shadow-sm"
                      />
                      <p className="mt-4 text-sm font-semibold text-slate-700">
                        Escaneie o QR Code no WhatsApp para conectar.
                      </p>
                    </>
                  ) : status === "initializing" ? (
                    <>
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
                        <LoaderCircle className="animate-spin text-amber-600" />
                      </div>
                      <p className="font-black text-slate-900">Inicializando atendimento</p>
                      <p className="mt-2 text-sm leading-relaxed text-slate-500">
                        Aguarde. O sistema esta abrindo a sessao e tentando gerar o QR.
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                        <QrCode className="text-red-600" />
                      </div>
                      <p className="font-black text-slate-900">QR ainda nao exibido</p>
                      <p className="mt-2 text-sm leading-relaxed text-slate-500">
                        Force uma nova autenticacao para gerar um QR Code limpo.
                      </p>
                    </>
                  )}
                </div>

                <button
                  onClick={handleResetSession}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-3 font-bold text-white transition hover:bg-red-700"
                >
                  <RefreshCcw size={16} />
                  Gerar novo QR
                </button>
              </div>
            </section>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => toggleSection("replies")}
                className="rounded-2xl border border-red-100 bg-white px-4 py-3 text-left shadow-sm transition hover:border-red-200 hover:bg-red-50"
              >
                <div className="text-xs font-bold uppercase tracking-wide text-red-600">Atalho</div>
                <div className="mt-1 font-black text-slate-900">Respostas</div>
              </button>
              <button
                onClick={() => toggleSection("labels")}
                className="rounded-2xl border border-red-100 bg-white px-4 py-3 text-left shadow-sm transition hover:border-red-200 hover:bg-red-50"
              >
                <div className="text-xs font-bold uppercase tracking-wide text-red-600">Atalho</div>
                <div className="mt-1 font-black text-slate-900">Etiquetas</div>
              </button>
              <button
                onClick={() => toggleSection("signatures")}
                className="rounded-2xl border border-red-100 bg-white px-4 py-3 text-left shadow-sm transition hover:border-red-200 hover:bg-red-50"
              >
                <div className="text-xs font-bold uppercase tracking-wide text-red-600">Atalho</div>
                <div className="mt-1 font-black text-slate-900">Assinaturas</div>
              </button>
              <button
                onClick={() => toggleSection("schedules")}
                className="rounded-2xl border border-red-100 bg-white px-4 py-3 text-left shadow-sm transition hover:border-red-200 hover:bg-red-50"
              >
                <div className="text-xs font-bold uppercase tracking-wide text-red-600">Atalho</div>
                <div className="mt-1 font-black text-slate-900">Agenda</div>
              </button>
            </div>

            <CascadeSection
              title="Respostas Rapidas"
              icon={<MessageSquareReply size={18} />}
              open={openSections.replies}
              count={`${quickReplies.length} salvas`}
              onToggle={() => toggleSection("replies")}
            >
              <div className="space-y-3">
                <input
                  value={quickTitle}
                  onChange={(event) => setQuickTitle(event.target.value)}
                  placeholder="Titulo da resposta"
                  className="w-full rounded-2xl border border-red-100 px-4 py-3 outline-none transition focus:border-red-400"
                />
                <textarea
                  value={quickMessage}
                  onChange={(event) => setQuickMessage(event.target.value)}
                  placeholder="Texto rapido para reaproveitar no atendimento"
                  rows={3}
                  className="w-full rounded-2xl border border-red-100 px-4 py-3 outline-none transition focus:border-red-400"
                />
                <button
                  onClick={handleAddQuickReply}
                  className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-4 py-3 font-bold text-white hover:bg-red-700"
                >
                  <Plus size={16} />
                  Salvar resposta
                </button>
              </div>

              <div className="mt-4 space-y-2">
                {quickReplies.length ? (
                  quickReplies.map((reply) => (
                    <button
                      key={reply.id}
                      onClick={() => setMessage(reply.message)}
                      className="w-full rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-left transition hover:bg-red-100"
                    >
                      <div className="font-bold text-slate-900">{reply.title}</div>
                      <div className="mt-1 line-clamp-3 text-sm text-slate-600">{reply.message}</div>
                    </button>
                  ))
                ) : (
                  <div className="rounded-2xl bg-slate-50 px-4 py-5 text-sm text-slate-500">
                    Nenhuma resposta rapida cadastrada.
                  </div>
                )}
              </div>
            </CascadeSection>

            <CascadeSection
              title="Etiquetas"
              icon={<Tag size={18} />}
              open={openSections.labels}
              count={`${labels.length} criadas`}
              onToggle={() => toggleSection("labels")}
            >
              <div className="flex gap-2">
                <input
                  value={newLabel}
                  onChange={(event) => setNewLabel(event.target.value)}
                  placeholder="Nova etiqueta"
                  className="w-full rounded-2xl border border-red-100 px-4 py-3 outline-none transition focus:border-red-400"
                />
                <button
                  onClick={handleAddLabel}
                  className="rounded-2xl bg-red-600 px-4 py-3 font-bold text-white hover:bg-red-700"
                >
                  <Plus size={16} />
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {labels.length ? (
                  labels.map((label) => (
                    <button
                      key={label}
                      onClick={() => selectedChatId && handleToggleLabelOnChat(label)}
                      className={`rounded-full px-3 py-2 text-sm font-bold transition ${
                        selectedChatLabels.includes(label)
                          ? "bg-red-600 text-white"
                          : "bg-red-50 text-red-700 hover:bg-red-100"
                      }`}
                    >
                      {label}
                    </button>
                  ))
                ) : (
                  <div className="rounded-2xl bg-slate-50 px-4 py-5 text-sm text-slate-500">
                    Nenhuma etiqueta criada.
                  </div>
                )}
              </div>
            </CascadeSection>

            <CascadeSection
              title="Assinaturas por Vendedor"
              icon={<UserRound size={18} />}
              open={openSections.signatures}
              count={`${signatures.length} vendedores`}
              onToggle={() => toggleSection("signatures")}
            >
              <div className="space-y-3">
                <input
                  value={signatureName}
                  onChange={(event) => setSignatureName(event.target.value)}
                  placeholder="Nome do vendedor"
                  className="w-full rounded-2xl border border-red-100 px-4 py-3 outline-none transition focus:border-red-400"
                />
                <textarea
                  value={signatureText}
                  onChange={(event) => setSignatureText(event.target.value)}
                  placeholder="Assinatura padrao"
                  rows={3}
                  className="w-full rounded-2xl border border-red-100 px-4 py-3 outline-none transition focus:border-red-400"
                />
                <button
                  onClick={handleAddSignature}
                  className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-4 py-3 font-bold text-white hover:bg-red-700"
                >
                  <Plus size={16} />
                  Salvar assinatura
                </button>
              </div>

              <div className="mt-4 space-y-2">
                {signatures.length ? (
                  signatures.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedSignatureId(item.id)}
                      className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                        selectedSignatureId === item.id
                          ? "border-red-300 bg-red-50"
                          : "border-red-100 bg-white hover:bg-red-50"
                      }`}
                    >
                      <div className="font-bold text-slate-900">{item.sellerName}</div>
                      <div className="mt-1 line-clamp-3 whitespace-pre-wrap text-sm text-slate-600">
                        {item.signature}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="rounded-2xl bg-slate-50 px-4 py-5 text-sm text-slate-500">
                    Nenhuma assinatura cadastrada.
                  </div>
                )}
              </div>
            </CascadeSection>

            <CascadeSection
              title="Agendamentos"
              icon={<CalendarClock size={18} />}
              open={openSections.schedules}
              count={`${schedules.length} registros`}
              onToggle={() => toggleSection("schedules")}
            >
              <div className="space-y-2">
                {schedules.length ? (
                  schedules.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 rounded-2xl border border-red-100 bg-[#fffafa] px-4 py-3"
                    >
                      <div className="flex-1">
                        <div className="text-sm font-bold text-slate-900">{item.number}</div>
                        <div className="mt-1 line-clamp-3 text-sm text-slate-600">{item.text}</div>
                        <div className="mt-2 text-xs text-slate-400">
                          {item.sendAt} - {item.status}
                        </div>
                      </div>
                      {item.status === "pending" ? (
                        <button
                          onClick={() => sendSocketEvent("panel:cancel-schedule", { id: item.id })}
                          className="rounded-full bg-red-100 p-2 text-red-600 hover:bg-red-200"
                        >
                          <Trash2 size={16} />
                        </button>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl bg-slate-50 px-4 py-5 text-sm text-slate-500">
                    Nenhum envio agendado.
                  </div>
                )}
              </div>
            </CascadeSection>
          </aside>

          <section className="overflow-hidden rounded-[32px] border border-red-100 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <div className="grid min-h-[820px] xl:grid-cols-[330px_minmax(0,1fr)]">
              <div className="border-b border-red-100 bg-[#fffafa] xl:border-b-0 xl:border-r">
                <div className="border-b border-red-100 px-5 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                      <MessageCircle size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-xl font-black text-slate-900">Conversas</h2>
                      <p className="text-sm text-slate-500">
                        {filteredChatList.length} conversas visiveis
                      </p>
                    </div>
                  </div>

                  <div className="relative mt-4">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      value={chatSearch}
                      onChange={(event) => setChatSearch(event.target.value)}
                      placeholder="Buscar por nome, numero, mensagem ou etiqueta"
                      className="w-full rounded-2xl border border-red-100 bg-white py-3 pl-11 pr-4 outline-none transition focus:border-red-400"
                    />
                  </div>
                </div>

                <div className="max-h-[720px] space-y-2 overflow-y-auto px-4 py-4">
                  {filteredChatList.length ? (
                    filteredChatList.map((chat) => (
                      <button
                        key={chat.chatId}
                        onClick={() => {
                          setSelectedChatId(chat.chatId);
                          setNumber(getChatPreviewNumber(chat));
                        }}
                        className={`w-full rounded-3xl border px-4 py-4 text-left transition ${
                          selectedChatId === chat.chatId
                            ? "border-red-200 bg-white shadow-sm"
                            : "border-transparent bg-transparent hover:border-red-100 hover:bg-white"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-sm font-black text-red-700">
                            {getChatDisplayName(chat).slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-3">
                              <div className="truncate font-black text-slate-900">
                                {getChatDisplayName(chat)}
                              </div>
                              <div className="shrink-0 text-[11px] font-medium text-slate-400">
                                {formatTime(chat.timestamp)}
                              </div>
                            </div>
                            <div className="mt-1 text-xs font-medium text-slate-500">
                              {getChatPreviewNumber(chat)}
                            </div>
                            <div className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">
                              {chat.body}
                            </div>
                            {(chatLabels[chat.chatId] || []).length ? (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {(chatLabels[chat.chatId] || []).map((label) => (
                                  <span
                                    key={label}
                                    className="rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-700"
                                  >
                                    {label}
                                  </span>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="rounded-3xl bg-white px-5 py-8 text-center text-sm text-slate-500 shadow-sm">
                      Nenhuma conversa encontrada com esse filtro.
                    </div>
                  )}
                </div>
              </div>

              <div className="flex min-h-[820px] flex-col bg-[linear-gradient(180deg,#ffffff_0%,#fff9f9_100%)]">
                <div className="border-b border-red-100 px-5 py-5 md:px-7">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-2xl font-black text-slate-900">{selectedChatName}</h3>
                        {selectedChatLabels.map((label) => (
                          <button
                            key={label}
                            onClick={() => handleToggleLabelOnChat(label)}
                            className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700 transition hover:bg-red-200"
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                      <p className="mt-2 text-sm text-slate-500">
                        {selectedChatNumber || "Escolha uma conversa para abrir a leitura completa"}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
                        {selectedChatMessages.length} mensagens
                      </span>
                      <button
                        onClick={handleSyncConversations}
                        className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-red-50"
                      >
                        <RefreshCcw size={14} />
                        Sincronizar
                      </button>
                      <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600">
                        {selectedSignatureId ? "Assinatura ativa" : "Sem assinatura"}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600">
                        {scheduleDateTime ? "Agendamento pronto" : "Envio imediato"}
                      </span>
                    </div>
                  </div>

                  {quickReplies.length ? (
                    <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1">
                      <span className="flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-bold text-slate-600 shadow-sm">
                        <Sparkles size={14} className="text-red-500" />
                        Atalhos
                      </span>
                      {quickReplies.map((reply) => (
                        <button
                          key={reply.id}
                          onClick={() => setMessage(reply.message)}
                          className="shrink-0 rounded-full border border-red-100 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                        >
                          {reply.title}
                        </button>
                      ))}
                      {selectedProduct ? (
                        <span className="shrink-0 rounded-full border border-red-100 bg-white px-4 py-2 text-sm font-semibold text-red-700">
                          Produto: {selectedProduct.name}
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-6 md:px-7">
                  {selectedChatMessages.length ? (
                    <div className="space-y-4">
                      {selectedChatMessages.map((item) => (
                        <div
                          key={item.id}
                          className={`max-w-[88%] rounded-[28px] px-5 py-4 shadow-sm ${
                            item.direction === "out"
                              ? "ml-auto bg-[linear-gradient(135deg,#ef4444_0%,#dc2626_100%)] text-white"
                              : "border border-red-100 bg-white text-slate-800"
                          }`}
                        >
                          <div className="whitespace-pre-wrap text-[15px] leading-7">{item.body}</div>
                          <div
                            className={`mt-3 text-xs font-medium ${
                              item.direction === "out" ? "text-red-100" : "text-slate-400"
                            }`}
                          >
                            {formatTime(item.timestamp)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-full min-h-[360px] items-center justify-center">
                      <div className="max-w-md rounded-[32px] border border-red-100 bg-white px-8 py-10 text-center shadow-sm">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                          <MessageCircle className="text-red-600" />
                        </div>
                        <h4 className="text-2xl font-black text-slate-900">Leitura ampla da conversa</h4>
                        <p className="mt-3 text-sm leading-relaxed text-slate-500">
                          Selecione uma conversa na lateral para abrir o historico completo nesta
                          area maior e mais confortavel de leitura.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-red-100 bg-white px-5 py-5 md:px-7">
                  <div className="mb-4 grid gap-4 2xl:grid-cols-[minmax(0,1fr)_320px]">
                    <div className="rounded-[28px] border border-red-100 bg-[#fffafa] p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <Package2 className="text-red-600" size={18} />
                        <h4 className="font-black text-slate-900">Produtos do site</h4>
                      </div>

                      <input
                        value={productSearch}
                        onChange={(event) => setProductSearch(event.target.value)}
                        placeholder="Buscar produto para enviar ao cliente"
                        className="w-full rounded-2xl border border-red-100 bg-white px-4 py-3 outline-none transition focus:border-red-400"
                      />

                      <div className="mt-3 max-h-64 space-y-2 overflow-y-auto pr-1">
                        {productLoading ? (
                          <div className="rounded-2xl bg-white px-4 py-5 text-sm text-slate-500">
                            Buscando produtos...
                          </div>
                        ) : productResults.length ? (
                          productResults.map((product) => (
                            <div
                              key={product.id}
                              className="flex gap-3 rounded-2xl border border-red-100 bg-white p-3"
                            >
                              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-50">
                                {product.image ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                                ) : (
                                  <Package2 className="text-slate-400" size={18} />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="line-clamp-2 font-bold text-slate-900">{product.name}</div>
                                <div className="mt-1 text-sm font-semibold text-red-600">
                                  {product.price || "Consulte"}
                                </div>
                                <div className="mt-3 flex flex-wrap gap-2">
                                  <button
                                    onClick={() => handleInsertProduct(product)}
                                    className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 transition hover:bg-red-100"
                                  >
                                    Inserir na mensagem
                                  </button>
                                  <button
                                    onClick={() => handleSendProduct(product)}
                                    className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-red-700"
                                  >
                                    Enviar produto
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="rounded-2xl bg-white px-4 py-5 text-sm text-slate-500">
                            Digite pelo menos 2 letras para buscar produtos do site.
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="rounded-[28px] border border-red-100 bg-white p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <UserRound className="text-red-600" size={18} />
                        <h4 className="font-black text-slate-900">Detalhes da conversa</h4>
                      </div>
                      <div className="space-y-3 text-sm">
                        <div className="rounded-2xl bg-slate-50 px-4 py-3">
                          <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Cliente</div>
                          <div className="mt-1 font-semibold text-slate-900">{selectedChatName}</div>
                        </div>
                        <div className="rounded-2xl bg-slate-50 px-4 py-3">
                          <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Numero</div>
                          <div className="mt-1 font-semibold text-slate-900">{selectedChatNumber || "-"}</div>
                        </div>
                        <div className="rounded-2xl bg-slate-50 px-4 py-3">
                          <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Etiquetas</div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {selectedChatLabels.length ? (
                              selectedChatLabels.map((label) => (
                                <span
                                  key={label}
                                  className="rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-bold text-red-700"
                                >
                                  {label}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-500">Sem etiquetas</span>
                            )}
                          </div>
                        </div>
                        <div className="rounded-2xl bg-slate-50 px-4 py-3">
                          <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Ultimo produto</div>
                          <div className="mt-1 font-semibold text-slate-900">
                            {selectedProduct?.name || "Nenhum produto selecionado"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 xl:grid-cols-[1fr_260px_200px]">
                    <input
                      value={number}
                      onChange={(event) => setNumber(formatPhoneNumber(event.target.value))}
                      placeholder="Numero com DDD"
                      className="w-full rounded-2xl border border-red-100 px-4 py-3 outline-none transition focus:border-red-400"
                    />
                    <select
                      value={selectedSignatureId}
                      onChange={(event) => setSelectedSignatureId(event.target.value)}
                      className="w-full rounded-2xl border border-red-100 px-4 py-3 outline-none transition focus:border-red-400"
                    >
                      <option value="">Sem assinatura</option>
                      {signatures.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.sellerName}
                        </option>
                      ))}
                    </select>
                    <input
                      type="datetime-local"
                      value={scheduleDateTime}
                      onChange={(event) => setScheduleDateTime(event.target.value)}
                      className="w-full rounded-2xl border border-red-100 px-4 py-3 outline-none transition focus:border-red-400"
                    />
                  </div>

                  <textarea
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Digite sua mensagem aqui. Use as respostas rapidas ou a assinatura do vendedor para ganhar velocidade."
                    rows={5}
                    className="mt-3 w-full rounded-[28px] border border-red-100 px-5 py-4 text-[15px] leading-7 outline-none transition focus:border-red-400"
                  />

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap gap-2">
                      {labels.slice(0, 6).map((label) => (
                        <button
                          key={label}
                          onClick={() => selectedChatId && handleToggleLabelOnChat(label)}
                          className={`rounded-full px-3 py-2 text-xs font-bold transition ${
                            selectedChatLabels.includes(label)
                              ? "bg-red-600 text-white"
                              : "bg-red-50 text-red-700 hover:bg-red-100"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <button
                        onClick={handleSyncConversations}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-700 transition hover:bg-slate-50"
                      >
                        <RefreshCcw size={16} />
                        Atualizar chats
                      </button>
                      <button
                        onClick={handleScheduleMessage}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 font-bold text-red-700 transition hover:bg-red-100"
                      >
                        <CalendarClock size={16} />
                        Agendar
                      </button>
                      <button
                        onClick={handleSendMessage}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-6 py-3 font-bold text-white transition hover:bg-red-700"
                      >
                        <Send size={16} />
                        Enviar agora
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
