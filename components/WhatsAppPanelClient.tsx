"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  LoaderCircle,
  LogOut,
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
  X,
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
  // No celular cabe uma coisa por vez: a lista de conversas ou a conversa aberta.
  const [telaCelular, setTelaCelular] = useState<"lista" | "conversa">("lista");
  // Abaixo de 1280 px a busca de produtos vira gaveta lateral, aberta pelo botão "Produtos".
  const [gavetaProdutos, setGavetaProdutos] = useState(false);
  const [saindo, setSaindo] = useState(false);

  useEffect(() => {
    const socket = io(serverUrl, {
      transports: ["websocket", "polling"],
      // Ingresso emitido pelo site para quem está logado (lib/whatsapp-ticket.ts).
      auth: (cb) => {
        fetch("/api/painel/socket-ticket", { cache: "no-store" })
          .then((r) => r.json())
          .then((j) => cb({ ticket: j?.ticket || "" }))
          .catch(() => cb({ ticket: "" }));
      },
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
  }, [selectedChatId, selectedChatMessages.length, telaCelular]);

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
    setTelaCelular("conversa");
  };

  const abrirConversa = (chat: PanelChat) => {
    setComposerMode("chat");
    setSelectedChatId(chat.chatId);
    setNumber(formatPhoneNumber(getSummaryDisplayNumber(chat)));
    setTelaCelular("conversa");
  };

  const handleLogout = async () => {
    setSaindo(true);
    try {
      await fetch("/api/painel/logout", { method: "POST" });
    } finally {
      window.location.href = "/whatsapp";
    }
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
    setGavetaProdutos(false);
    setTelaCelular("conversa");
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

  // Busca de produtos: a mesma peça serve de terceira coluna (telas largas) e de gaveta lateral.
  const painelProdutos = (emGaveta: boolean) => (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b border-red-100 px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Package2 className="text-red-600" size={18} />
            <h4 className="font-black text-slate-900">Enviar produto do site</h4>
          </div>
          {emGaveta ? (
            <button
              onClick={() => setGavetaProdutos(false)}
              aria-label="Fechar produtos"
              className="rounded-xl p-2 text-slate-500 transition hover:bg-red-50"
            >
              <X size={18} />
            </button>
          ) : null}
        </div>
        <input
          value={productSearch}
          onChange={(event) => setProductSearch(event.target.value)}
          placeholder="Buscar produto"
          className="mt-3 w-full rounded-xl border border-red-100 bg-white px-4 py-2.5 text-base outline-none transition focus:border-red-400 sm:text-sm"
        />
      </div>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
        {productLoading ? (
          <div className="rounded-xl bg-slate-50 px-4 py-5 text-sm text-slate-500">Buscando produtos...</div>
        ) : productResults.length ? (
          productResults.map((product) => (
            <div key={product.id} className="flex gap-3 rounded-xl border border-red-100 bg-white p-2.5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-50">
                {product.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                ) : (
                  <Package2 className="text-slate-400" size={18} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="line-clamp-2 text-sm font-bold text-slate-900">{product.name}</div>
                <div className="mt-0.5 text-sm font-semibold text-red-600">{product.price || "Consulte"}</div>
                <div className="mt-2 flex flex-wrap gap-1.5">
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
          <div className="rounded-xl bg-slate-50 px-4 py-5 text-sm text-slate-500">
            Digite pelo menos 2 letras para buscar produtos do site.
          </div>
        )}
      </div>
    </div>
  );

  const botaoAcao =
    "inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-xl px-2.5 text-sm font-bold transition lg:px-3";

  return (
    // Ocupa exatamente a área visível (o LayoutWrapper fixa a altura em 100dvh);
    // quem rola é a lista, a conversa e os produtos, nunca a página inteira.
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-[#fff7f7] text-slate-900">
      {/* Barra do topo */}
      <header className="shrink-0 bg-[linear-gradient(135deg,#dc2626_0%,#ef4444_65%,#b91c1c_100%)] px-3 py-2 text-white sm:px-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15">
              <MessageCircle size={18} />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-base font-black leading-tight max-[359px]:sr-only sm:text-lg">WhatsApp</h1>
              <p className="hidden truncate text-[11px] font-semibold uppercase tracking-[0.2em] text-red-100 sm:block [@media(max-height:480px)]:hidden">
                Balão da Informática
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              onClick={handleSyncConversations}
              title="Sincronizar conversas"
              aria-label="Sincronizar conversas"
              className={`${botaoAcao} bg-white/10 hover:bg-white/20`}
            >
              <RefreshCcw size={16} />
              <span className="hidden lg:inline">Sincronizar</span>
            </button>
            <button
              onClick={handleStartNewMessage}
              title="Nova mensagem"
              aria-label="Nova mensagem"
              className={`${botaoAcao} bg-white/10 hover:bg-white/20`}
            >
              <Plus size={16} />
              <span className="hidden lg:inline">Nova mensagem</span>
            </button>
            <button
              onClick={() => setGavetaProdutos(true)}
              title="Produtos do site"
              aria-label="Produtos do site"
              className={`${botaoAcao} bg-white/10 hover:bg-white/20 xl:hidden`}
            >
              <Package2 size={16} />
              <span className="hidden lg:inline">Produtos</span>
            </button>
            <button
              onClick={handleResetSession}
              title="Gerar novo QR Code"
              aria-label="Gerar novo QR Code"
              className={`${botaoAcao} bg-white text-red-700 hover:bg-red-50`}
            >
              <QrCode size={16} />
              <span className="hidden lg:inline">Novo QR</span>
            </button>
            <button
              onClick={handleLogout}
              disabled={saindo}
              title="Sair do WhatsApp"
              aria-label="Sair do WhatsApp"
              className={`${botaoAcao} bg-black/15 hover:bg-black/25 disabled:opacity-60`}
            >
              <LogOut size={16} />
              <span className="hidden lg:inline">{saindo ? "Saindo..." : "Sair"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Situação do servidor, da sessão e do número */}
      {/* Em tela baixa (celular deitado) a faixa some: o que importa é a conversa. */}
      <div className="flex shrink-0 items-center gap-2 overflow-x-auto border-b border-red-100 bg-white px-3 py-1.5 text-xs sm:px-5 [@media(max-height:480px)]:hidden">
        <span
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 font-bold ${
            socketConnected ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
          }`}
        >
          {socketConnected ? <Wifi size={13} /> : <WifiOff size={13} />}
          {socketConnected ? "Online" : "Offline"}
        </span>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 font-bold text-slate-600">
          <CheckCircle2 size={13} />
          {session ? "Sessão restaurada" : "Sem sessão"}
        </span>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 font-bold text-slate-600">
          <UserRound size={13} />
          {phoneNumber || "Não conectado"}
        </span>
        <span className="hidden min-w-0 truncate text-slate-500 md:inline">{serverHealthMessage}</span>
      </div>

      {/* Conexão: QR Code, servidor fora do ar ou WhatsApp iniciando */}
      {!connected ? (
        <div className="max-h-[45%] shrink-0 overflow-y-auto border-b border-red-100 bg-white px-4 py-4 text-center">
          {qrCode ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrCode}
                alt="QR Code do WhatsApp"
                className="mx-auto aspect-square w-[min(240px,60vw,28dvh)] rounded-2xl border border-red-100 bg-white p-2"
              />
              <div className="mt-3 text-sm font-black text-slate-900">Escaneie o QR Code para conectar</div>
              <div className="mt-1 text-xs text-slate-500">
                Assim que conectar, a tela volta sozinha para o atendimento.
              </div>
            </>
          ) : !socketConnected ? (
            <div className="flex items-center justify-center gap-3 text-left">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                <WifiOff size={18} />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-black text-slate-900">Servidor do WhatsApp indisponível</div>
                <div className="text-xs text-slate-500">{serverHealthMessage}</div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3 text-left">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                <LoaderCircle className="animate-spin" size={18} />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-black text-slate-900">Preparando a conexão do WhatsApp</div>
                <div className="text-xs text-slate-500">Status atual: {status}</div>
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* Corpo: conversas | conversa aberta | produtos */}
      <div className="flex min-h-0 flex-1">
        <aside
          className={`${
            telaCelular === "lista" ? "flex" : "hidden"
          } w-full min-w-0 shrink-0 flex-col border-red-100 bg-white md:flex md:w-[300px] md:border-r lg:w-[340px]`}
        >
          <div className="shrink-0 border-b border-red-100 px-3 py-3 sm:px-4">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-lg font-black text-slate-900">Conversas</h2>
              <span className="text-xs text-slate-500">{filteredChatList.length} contatos</span>
            </div>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                value={chatSearch}
                onChange={(event) => setChatSearch(event.target.value)}
                placeholder="Buscar nome ou número"
                className="w-full rounded-xl border border-red-100 bg-white py-2.5 pl-9 pr-3 text-base outline-none transition focus:border-red-400 sm:text-sm"
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 space-y-1 overflow-y-auto p-2">
            {filteredChatList.length ? (
              filteredChatList.map((chat) => (
                <button
                  key={chat.chatId}
                  onClick={() => abrirConversa(chat)}
                  className={`w-full rounded-2xl border px-3 py-2.5 text-left transition ${
                    selectedChatId === chat.chatId
                      ? "border-red-200 bg-red-50/70"
                      : "border-transparent hover:border-red-100 hover:bg-red-50/40"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-red-100 text-sm font-black text-red-700">
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
                      <div className="flex items-start justify-between gap-2">
                        <div className="truncate text-sm font-black text-slate-900">
                          {getSummaryDisplayName(chat)}
                        </div>
                        <div className="shrink-0 text-[11px] font-medium text-slate-400">
                          {formatTime(chat.lastMessageTimestamp)}
                        </div>
                      </div>
                      <div className="truncate text-xs font-medium text-slate-500">
                        {getSummaryDisplayNumber(chat) || chat.chatId}
                      </div>
                      <div className="mt-0.5 flex items-center gap-2">
                        <div className="min-w-0 flex-1 truncate text-sm text-slate-600">
                          {chat.lastMessageBody || "Sem mensagem recente"}
                        </div>
                        {chat.unreadCount ? (
                          <span className="shrink-0 rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                            {chat.unreadCount}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="rounded-2xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                Nenhuma conversa encontrada.
              </div>
            )}
          </div>
        </aside>

        <section
          className={`${
            telaCelular === "conversa" ? "flex" : "hidden"
          } min-w-0 flex-1 flex-col bg-white md:flex`}
        >
          <div className="flex shrink-0 items-center gap-2 border-b border-red-100 px-2 py-2 sm:px-4">
            <button
              onClick={() => setTelaCelular("lista")}
              aria-label="Voltar para as conversas"
              className="rounded-xl p-2 text-slate-600 transition hover:bg-red-50 md:hidden"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-red-100 text-sm font-black text-red-700">
              {selectedChat?.profilePicUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={selectedChat.profilePicUrl} alt={selectedChatName} className="h-full w-full object-cover" />
              ) : (
                getInitials(selectedChatName)
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-base font-black text-slate-900 sm:text-lg">{selectedChatName}</h3>
              <p className="truncate text-xs text-slate-500">
                {selectedChatNumber || "Escolha uma conversa ou inicie uma nova mensagem"}
              </p>
            </div>
            <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
              {selectedChat?.isGroup ? (
                <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-700">Grupo</span>
              ) : null}
              {selectedChat?.unreadCount ? (
                <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700">
                  {selectedChat.unreadCount} não lidas
                </span>
              ) : null}
              {selectedProduct ? (
                <span className="max-w-[220px] truncate rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                  Produto: {selectedProduct.name}
                </span>
              ) : null}
            </div>
          </div>

          <div
            ref={messagesViewportRef}
            className="min-h-0 flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top,#fff7f7_0%,#fffefe_48%,#ffffff_100%)] px-3 py-4 sm:px-6"
          >
            {selectedChatMessages.length ? (
              <div className="space-y-2.5">
                {selectedChatMessages.map((item) => (
                  <div
                    key={item.id}
                    className={`w-fit max-w-[88%] rounded-2xl px-4 py-2.5 shadow-sm sm:max-w-[75%] ${
                      item.direction === "out"
                        ? "ml-auto bg-[linear-gradient(135deg,#ef4444_0%,#dc2626_100%)] text-white"
                        : "border border-red-100 bg-white text-slate-800"
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-[15px] leading-6 [overflow-wrap:anywhere]">
                      {item.body || (item.hasMedia ? "Mídia enviada/recebida" : "")}
                    </div>
                    {item.hasMedia ? (
                      <div
                        className={`mt-2 inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          item.direction === "out" ? "bg-white/15 text-white" : "bg-red-50 text-red-700"
                        }`}
                      >
                        {item.mediaType || "mídia"}
                      </div>
                    ) : null}
                    <div
                      className={`mt-1 text-right text-[11px] font-medium ${
                        item.direction === "out" ? "text-red-100" : "text-slate-400"
                      }`}
                    >
                      {formatTime(item.timestamp)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="max-w-sm px-6 text-center">
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
                    <MessageCircle />
                  </div>
                  <div className="text-xl font-black text-slate-900">Atendimento direto</div>
                  <div className="mt-2 text-sm text-slate-500">
                    Esta área mostra somente as mensagens da conversa selecionada.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Campo de envio — sempre visível no pé da conversa */}
          <div className="shrink-0 border-t border-red-100 bg-white p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:p-3">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-end">
              <input
                value={number}
                onChange={(event) => {
                  setComposerMode("new");
                  setNumber(formatPhoneNumber(event.target.value));
                }}
                inputMode="tel"
                placeholder="Número com DDD"
                className={`${
                  composerMode === "new" ? "block" : "hidden lg:block"
                } w-full rounded-xl border border-red-100 px-3 py-2.5 text-base outline-none transition focus:border-red-400 sm:text-sm lg:w-44`}
              />
              <div className="flex min-w-0 flex-1 items-end gap-2">
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Digite sua mensagem"
                  rows={1}
                  className="field-sizing-content max-h-40 min-h-[44px] w-full min-w-0 resize-none rounded-xl border border-red-100 px-3 py-2.5 text-base leading-6 outline-none transition focus:border-red-400 sm:text-[15px]"
                />
                <button
                  onClick={handleSendMessage}
                  aria-label="Enviar mensagem"
                  className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 font-bold text-white transition hover:bg-red-700"
                >
                  <Send size={16} />
                  <span className="hidden sm:inline">Enviar</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        <aside className="hidden w-[340px] shrink-0 flex-col border-l border-red-100 bg-white xl:flex 2xl:w-[380px]">
          {painelProdutos(false)}
        </aside>
      </div>

      {/* Gaveta de produtos para telas menores que 1280 px */}
      {gavetaProdutos ? (
        <div className="fixed inset-0 z-40 flex justify-end xl:hidden">
          <button
            aria-label="Fechar produtos"
            onClick={() => setGavetaProdutos(false)}
            className="absolute inset-0 bg-slate-900/40"
          />
          <div className="relative flex h-full w-full max-w-sm flex-col bg-white shadow-2xl">
            {painelProdutos(true)}
          </div>
        </div>
      ) : null}

      {toast ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex justify-center px-4">
          <div className="max-w-md rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg">
            {toast}
          </div>
        </div>
      ) : null}
    </div>
  );
}
