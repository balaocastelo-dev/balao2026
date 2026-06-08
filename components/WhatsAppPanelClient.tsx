"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  LoaderCircle,
  MessageCircle,
  Package2,
  Plus,
  QrCode,
  RefreshCcw,
  Search,
  Send,
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
  body: string;
  direction: "in" | "out";
  timestamp: number;
  contactName?: string | null;
  realNumber?: string | null;
  displayNumber?: string | null;
  hasMedia?: boolean;
  mediaType?: string | null;
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

type PanelChat = {
  chatId: string;
  contactName?: string | null;
  realNumber?: string | null;
  displayNumber?: string | null;
  profilePicUrl?: string | null;
  unreadCount: number;
  lastMessageBody: string;
  lastMessageTimestamp: number;
  isGroup: boolean;
};

function formatPhoneNumber(value: string) {
  return value.replace(/\D/g, "");
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

function isLikelyPhoneDigits(value: string) {
  return value.length >= 10 && value.length <= 13;
}

function getDisplayName(item: {
  contactName?: string | null;
  displayNumber?: string | null;
  realNumber?: string | null;
  chatId?: string;
}) {
  return item.contactName || item.displayNumber || item.realNumber || item.chatId || "Sem nome";
}

function getDisplayNumber(item: {
  displayNumber?: string | null;
  realNumber?: string | null;
  chatId?: string;
  from?: string;
}) {
  const chatIdDigits = getChatDigits(item.chatId || "");
  const fromDigits = getChatDigits(item.from || "");
  return (
    item.displayNumber ||
    item.realNumber ||
    (isLikelyPhoneDigits(chatIdDigits) ? `+${chatIdDigits}` : "") ||
    (isLikelyPhoneDigits(fromDigits) ? `+${fromDigits}` : "") ||
    ""
  );
}

function getSummaryDisplayName(chat: PanelChat) {
  return getDisplayName(chat);
}

function getSummaryDisplayNumber(chat: PanelChat) {
  return getDisplayNumber(chat);
}

function getInitials(value: string) {
  const parts = value
    .split(" ")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 2);

  if (!parts.length) return "WA";
  return parts.map((item) => item[0]?.toUpperCase() || "").join("");
}

export default function WhatsAppPanelClient() {
  const socketRef = useRef<Socket | null>(null);
  const messagesViewportRef = useRef<HTMLDivElement | null>(null);
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
  const [chats, setChats] = useState<PanelChat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState("");
  const [number, setNumber] = useState("");
  const [message, setMessage] = useState("");
  const [toast, setToast] = useState("");
  const [chatSearch, setChatSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [productResults, setProductResults] = useState<SiteProduct[]>([]);
  const [productLoading, setProductLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<SiteProduct | null>(null);
  const [composerMode, setComposerMode] = useState<"chat" | "new">("chat");

  useEffect(() => {
    const socket = io(serverUrl, {
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setSocketConnected(true);
      setServerHealthMessage("Servidor online.");
      socket.emit("panel:bootstrap");
    });
    socket.on("disconnect", () => {
      setSocketConnected(false);
      setConnected(false);
      setServerHealthMessage(
        "Servidor do WhatsApp offline ou inacessivel. Verifique o servidor do painel."
      );
    });
    socket.on("connect_error", () => {
      setSocketConnected(false);
      setConnected(false);
      setServerHealthMessage(
        "Nao foi possivel conectar ao servidor do WhatsApp. Verifique se ele esta rodando."
      );
    });
    socket.on("whatsapp:state", (payload: PanelStatePayload) => {
      setStatus(payload.status);
      setQrCode(payload.qrCode);
      setConnected(payload.connected);
      setSession(payload.session);
      setPhoneNumber(payload.phoneNumber);
    });
    socket.on("whatsapp:messages", (payload: PanelMessage[]) => {
      setMessages(payload || []);
    });
    socket.on("whatsapp:chats", (payload: PanelChat[]) => {
      setChats(payload || []);
    });
    socket.on("whatsapp:message", (payload: PanelMessage) => {
      setMessages((current) => [...current, payload].sort((a, b) => a.timestamp - b.timestamp));
    });
    socket.on("whatsapp:toast", (payload: { message: string }) => {
      setToast(payload.message);
      window.setTimeout(() => setToast(""), 3500);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [serverUrl]);

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
          "Servidor do WhatsApp offline ou inacessivel. Verifique o deploy do painel."
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
    }, 300);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [productSearch]);

  const derivedChatList = useMemo(() => {
    const map = new Map<string, PanelChat>();
    messages.forEach((item) => {
      const current = map.get(item.chatId);
      if (!current || current.lastMessageTimestamp < item.timestamp) {
        map.set(item.chatId, {
          chatId: item.chatId,
          contactName: item.contactName || null,
          realNumber: item.realNumber || null,
          displayNumber: item.displayNumber || item.realNumber || null,
          profilePicUrl: null,
          unreadCount: 0,
          lastMessageBody: item.body,
          lastMessageTimestamp: item.timestamp,
          isGroup: false,
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp);
  }, [messages]);

  const chatSource = chats.length ? chats : derivedChatList;

  const filteredChatList = useMemo(() => {
    const query = chatSearch.trim().toLowerCase();
    return chatSource.filter((item) => {
      if (!query) return true;
      return [getSummaryDisplayName(item), getSummaryDisplayNumber(item), item.lastMessageBody]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [chatSearch, chatSource]);

  useEffect(() => {
    if (!selectedChatId && filteredChatList[0]) {
      setSelectedChatId(filteredChatList[0].chatId);
      setComposerMode("chat");
    }
  }, [filteredChatList, selectedChatId]);

  useEffect(() => {
    if (!selectedChatId) return;
    const exists = chatSource.some((item) => item.chatId === selectedChatId);
    if (!exists && filteredChatList[0]) {
      setSelectedChatId(filteredChatList[0].chatId);
    }
  }, [chatSource, filteredChatList, selectedChatId]);

  const selectedChatMessages = useMemo(
    () => messages.filter((item) => item.chatId === selectedChatId),
    [messages, selectedChatId]
  );

  const selectedChat = useMemo(
    () => chatSource.find((item) => item.chatId === selectedChatId) || null,
    [chatSource, selectedChatId]
  );

  const selectedChatName = selectedChat
    ? getSummaryDisplayName(selectedChat)
    : composerMode === "new"
      ? "Nova mensagem"
      : "Selecione uma conversa";

  const selectedChatNumber = selectedChat
    ? getSummaryDisplayNumber(selectedChat)
    : number
      ? `+${formatPhoneNumber(number)}`
      : "";

  useEffect(() => {
    if (composerMode === "chat" && selectedChatNumber) {
      setNumber(formatPhoneNumber(selectedChatNumber));
    }
  }, [composerMode, selectedChatNumber]);

  useEffect(() => {
    const viewport = messagesViewportRef.current;
    if (!viewport) return;
    viewport.scrollTo({
      top: viewport.scrollHeight,
      behavior: "smooth",
    });
  }, [selectedChatId, selectedChatMessages.length]);

  const sendSocketEvent = (event: string, payload: Record<string, unknown>) => {
    socketRef.current?.emit(event, payload);
  };

  const currentOrigin =
    typeof window !== "undefined" ? window.location.origin : "https://www.balao.info";

  const handleSendMessage = () => {
    const normalized = formatPhoneNumber(number || selectedChatNumber);
    if (!normalized || !message.trim()) return;

    sendSocketEvent("panel:send-message", {
      number: normalized,
      chatId: composerMode === "chat" ? selectedChatId || null : null,
      text: message.trim(),
      signatureId: null,
    });
    setNumber(normalized);
    setMessage("");
  };

  const handleResetSession = () => {
    sendSocketEvent("panel:reset-session", {});
  };

  const handleStartNewMessage = () => {
    setComposerMode("new");
    setSelectedChatId("");
    setNumber("");
    setMessage("");
    setSelectedProduct(null);
  };

  const handleSyncConversations = () => {
    sendSocketEvent("panel:sync-conversations", {});
  };

  const getProductUrl = (product: SiteProduct) => {
    return `${currentOrigin}/product/${product.slug || product.id}`;
  };

  const buildProductMessage = (product: SiteProduct) => {
    return [
      "Produto recomendado da Balão da Informática:",
      "",
      product.name,
      product.price || "Consulte o valor",
      getProductUrl(product),
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
      setToast("Selecione uma conversa ou informe um numero para enviar o produto.");
      window.setTimeout(() => setToast(""), 3500);
      return;
    }

    sendSocketEvent("panel:send-message", {
      number: normalized,
      chatId: composerMode === "chat" ? selectedChatId || null : null,
      text: buildProductMessage(product),
      signatureId: null,
    });
    setSelectedProduct(product);
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fff7f7_0%,#ffffff_100%)] text-slate-900">
      <div className="mx-auto max-w-[1600px] px-4 py-4 md:px-6 md:py-6">
        <section className="mb-6 overflow-hidden rounded-[30px] border border-red-100 bg-white shadow-[0_24px_60px_rgba(239,68,68,0.08)]">
          <div className="bg-[linear-gradient(135deg,#dc2626_0%,#ef4444_65%,#b91c1c_100%)] px-6 py-7 text-white md:px-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs font-bold uppercase tracking-[0.30em] text-red-100">
                  Balao da Informatica
                </p>
                <h1 className="mt-3 text-3xl font-black md:text-4xl">
                  WhatsApp limpo e funcional
                </h1>
                <p className="mt-3 text-sm text-red-50 md:text-base">
                  Painel focado no essencial: conexao, conversas atualizadas, leitura clara e envio
                  rapido de mensagem e produto.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-sm font-bold">
                    {socketConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
                    Servidor
                  </div>
                  <div className="mt-2 text-sm text-red-50">
                    {socketConnected ? "Online" : "Offline"}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <CheckCircle2 size={16} />
                    Sessao
                  </div>
                  <div className="mt-2 text-sm text-red-50">
                    {session ? "Restaurada" : "Sem sessao"}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <UserRound size={16} />
                    Numero
                  </div>
                  <div className="mt-2 text-sm text-red-50">{phoneNumber || "Nao conectado"}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-3 border-t border-red-100 px-6 py-4 md:grid-cols-[1fr_auto_auto_auto] md:px-8">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Status</div>
              <div className="mt-1 text-sm font-semibold text-slate-900">{serverHealthMessage}</div>
            </div>
            <button
              onClick={handleSyncConversations}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-100 bg-white px-4 py-3 font-bold text-slate-700 transition hover:bg-red-50"
            >
              <RefreshCcw size={16} />
              Sincronizar
            </button>
            <button
              onClick={handleStartNewMessage}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-100 bg-white px-4 py-3 font-bold text-slate-700 transition hover:bg-red-50"
            >
              <Plus size={16} />
              Nova mensagem
            </button>
            <button
              onClick={handleResetSession}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-3 font-bold text-white transition hover:bg-red-700"
            >
              <QrCode size={16} />
              Novo QR
            </button>
          </div>

          {toast ? (
            <div className="border-t border-red-100 bg-red-50 px-6 py-3 text-sm font-medium text-red-700 md:px-8">
              {toast}
            </div>
          ) : null}
        </section>

        {!connected && qrCode ? (
          <section className="mb-6 rounded-[28px] border border-red-100 bg-white p-6 text-center shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrCode}
              alt="QR Code do WhatsApp"
              className="mx-auto w-full max-w-[260px] rounded-[28px] border border-red-100 bg-white p-3"
            />
            <div className="mt-4 text-base font-black text-slate-900">
              Escaneie o QR Code para conectar
            </div>
            <div className="mt-2 text-sm text-slate-500">
              Assim que conectar, a tela volta automaticamente para o modo de atendimento.
            </div>
          </section>
        ) : null}

        {!socketConnected && !qrCode ? (
          <section className="mb-6 rounded-[28px] border border-red-100 bg-white p-6 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
              <WifiOff />
            </div>
            <div className="mt-4 text-base font-black text-slate-900">
              Servidor do WhatsApp indisponivel
            </div>
            <div className="mt-2 text-sm text-slate-500">{serverHealthMessage}</div>
          </section>
        ) : null}

        {socketConnected && !connected && !qrCode ? (
          <section className="mb-6 rounded-[28px] border border-red-100 bg-white p-6 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <LoaderCircle className="animate-spin" />
            </div>
            <div className="mt-4 text-base font-black text-slate-900">
              Preparando a conexao do WhatsApp
            </div>
            <div className="mt-2 text-sm text-slate-500">Status atual: {status}</div>
          </section>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="overflow-hidden rounded-[28px] border border-red-100 bg-white shadow-sm">
            <div className="border-b border-red-100 px-5 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                  <MessageCircle size={20} />
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl font-black text-slate-900">Conversas</h2>
                  <p className="text-sm text-slate-500">
                    {filteredChatList.length} contatos sincronizados
                  </p>
                </div>
              </div>

              <div className="relative mt-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  value={chatSearch}
                  onChange={(event) => setChatSearch(event.target.value)}
                  placeholder="Buscar nome ou numero"
                  className="w-full rounded-2xl border border-red-100 bg-white py-3 pl-11 pr-4 outline-none transition focus:border-red-400"
                />
              </div>
            </div>

            <div className="max-h-[68vh] space-y-2 overflow-y-auto px-4 py-4">
              {filteredChatList.length ? (
                filteredChatList.map((chat) => (
                  <button
                    key={chat.chatId}
                    onClick={() => {
                      setComposerMode("chat");
                      setSelectedChatId(chat.chatId);
                      setNumber(formatPhoneNumber(getSummaryDisplayNumber(chat)));
                    }}
                    className={`w-full rounded-3xl border px-4 py-4 text-left transition ${
                      selectedChatId === chat.chatId
                        ? "border-red-200 bg-red-50/60 shadow-sm"
                        : "border-transparent bg-transparent hover:border-red-100 hover:bg-red-50/40"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-red-100 text-sm font-black text-red-700">
                        {chat.profilePicUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={chat.profilePicUrl}
                            alt={getSummaryDisplayName(chat)}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          getInitials(getSummaryDisplayName(chat))
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="truncate font-black text-slate-900">
                            {getSummaryDisplayName(chat)}
                          </div>
                          <div className="shrink-0 text-[11px] font-medium text-slate-400">
                            {formatTime(chat.lastMessageTimestamp)}
                          </div>
                        </div>
                        <div className="mt-1 text-xs font-medium text-slate-500">
                          {getSummaryDisplayNumber(chat) || chat.chatId}
                        </div>
                        <div className="mt-2 line-clamp-2 text-sm text-slate-600">
                          {chat.lastMessageBody || "Sem mensagem recente"}
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="rounded-3xl bg-slate-50 px-5 py-8 text-center text-sm text-slate-500">
                  Nenhuma conversa encontrada.
                </div>
              )}
            </div>
          </aside>

          <section className="overflow-hidden rounded-[28px] border border-red-100 bg-white shadow-sm">
            <div className="border-b border-red-100 px-5 py-5 md:px-7">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-red-100 text-base font-black text-red-700">
                      {selectedChat?.profilePicUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={selectedChat.profilePicUrl}
                          alt={selectedChatName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        getInitials(selectedChatName)
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-2xl font-black text-slate-900">
                        {selectedChatName}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {selectedChatNumber || "Escolha uma conversa ou inicie uma nova mensagem"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {selectedChat?.isGroup ? (
                    <span className="rounded-full bg-sky-50 px-3 py-2 text-xs font-bold text-sky-700">
                      Grupo
                    </span>
                  ) : null}
                  {selectedChat?.unreadCount ? (
                    <span className="rounded-full bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
                      {selectedChat.unreadCount} nao lidas
                    </span>
                  ) : null}
                  {selectedProduct ? (
                    <span className="rounded-full bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
                      Produto pronto: {selectedProduct.name}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <div
              ref={messagesViewportRef}
              className="max-h-[56vh] overflow-y-auto bg-[radial-gradient(circle_at_top,#fff7f7_0%,#fffefe_48%,#ffffff_100%)] px-5 py-6 md:px-7"
            >
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
                      <div className="whitespace-pre-wrap text-[15px] leading-7">
                        {item.body || (item.hasMedia ? "Midia enviada/recebida" : "")}
                      </div>
                      {item.hasMedia ? (
                        <div
                          className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                            item.direction === "out"
                              ? "bg-white/15 text-white"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {item.mediaType || "midia"}
                        </div>
                      ) : null}
                      <div className="mt-3 text-xs font-medium text-slate-400">
                        {formatTime(item.timestamp)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex min-h-[360px] items-center justify-center">
                  <div className="max-w-md rounded-[32px] border border-red-100 bg-white px-8 py-10 text-center shadow-sm">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
                      <MessageCircle />
                    </div>
                    <div className="text-2xl font-black text-slate-900">Atendimento direto</div>
                    <div className="mt-3 text-sm leading-relaxed text-slate-500">
                      Esta area mostra somente as mensagens da conversa selecionada.
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-red-100 bg-white px-5 py-5 md:px-7">
              <div className="grid gap-3 lg:grid-cols-[220px_minmax(0,1fr)_auto]">
                <input
                  value={number}
                  onChange={(event) => {
                    setComposerMode("new");
                    setNumber(formatPhoneNumber(event.target.value));
                  }}
                  placeholder="Numero com DDD"
                  className="w-full rounded-2xl border border-red-100 px-4 py-3 outline-none transition focus:border-red-400"
                />
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Digite sua mensagem ou insira um produto do site"
                  rows={4}
                  className="w-full rounded-[24px] border border-red-100 px-5 py-4 text-[15px] leading-7 outline-none transition focus:border-red-400"
                />
                <button
                  onClick={handleSendMessage}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-4 font-bold text-white transition hover:bg-red-700"
                >
                  <Send size={16} />
                  Enviar
                </button>
              </div>

              <div className="mt-5 rounded-[24px] border border-red-100 bg-[#fffafa] p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Package2 className="text-red-600" size={18} />
                  <h4 className="font-black text-slate-900">Enviar produto do site</h4>
                </div>

                <input
                  value={productSearch}
                  onChange={(event) => setProductSearch(event.target.value)}
                  placeholder="Buscar produto"
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
                              Enviar agora
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
            </div>
          </section>
        </section>
      </div>
    </div>
  );
}
