"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  CalendarClock,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Filter,
  ImagePlus,
  LoaderCircle,
  MessageCircle,
  MessageSquareReply,
  Mic,
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
  Users,
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
  realNumber?: string | null;
  displayNumber?: string | null;
  labels?: string[];
  hasMedia?: boolean;
  mediaType?: string | null;
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
  chatAssignments?: Record<string, string | null>;
  notifications?: PanelNotification[];
  apiInfo?: PanelApiInfo;
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
  isArchived: boolean;
  isPinned: boolean;
  isMuted?: boolean;
  muteExpiration?: number;
  assignedSellerId?: string | null;
};

type PanelStatusFeedItem = {
  id: string;
  contactId?: string | null;
  contactName: string;
  profilePicUrl?: string | null;
  unreadCount: number;
  totalCount: number;
  timestamp: number;
  items: Array<{
    id: string;
    body: string;
    timestamp: number;
    hasMedia?: boolean;
    mediaType?: string | null;
  }>;
};

type PanelNotification = {
  id: string;
  chatId: string;
  sellerId?: string | null;
  type: "seller" | "new_customer";
  title: string;
  subtitle: string;
  unreadCount: number;
  timestamp: number;
};

type Vendor = {
  id: string;
  nome: string;
  avatar_url: string | null;
  veiculo_emoji: string;
};

type PanelApiInfo = {
  declaredVersion?: string | null;
  resolvedVersion?: string | null;
  supportedActions: string[];
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
  const workspaceRef = useRef<HTMLDivElement | null>(null);
  const messagesViewportRef = useRef<HTMLDivElement | null>(null);
  const selectedChatIdRef = useRef("");
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
  const [statusFeed, setStatusFeed] = useState<PanelStatusFeedItem[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [chatLabels, setChatLabels] = useState<Record<string, string[]>>({});
  const [chatAssignments, setChatAssignments] = useState<Record<string, string | null>>({});
  const [notifications, setNotifications] = useState<PanelNotification[]>([]);
  const [apiInfo, setApiInfo] = useState<PanelApiInfo | null>(null);
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
  const [composerMode, setComposerMode] = useState<"chat" | "new">("chat");
  const [chatFilter, setChatFilter] = useState<"all" | "unread" | "read">("all");
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vendorsLoading, setVendorsLoading] = useState(true);
  const [newVendorName, setNewVendorName] = useState("");
  const [newVendorAvatar, setNewVendorAvatar] = useState("");
  const [newVendorEmoji, setNewVendorEmoji] = useState("🧑‍💼");
  const [pendingMedia, setPendingMedia] = useState<File | null>(null);
  const [statusText, setStatusText] = useState("");
  const [statusMedia, setStatusMedia] = useState<File | null>(null);
  const [segmentKeyword, setSegmentKeyword] = useState("");
  const [segmentMessage, setSegmentMessage] = useState("");
  const [segmentSelectedIds, setSegmentSelectedIds] = useState<string[]>([]);
  const [sidebarWidth, setSidebarWidth] = useState(420);
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const [selectedChatNote, setSelectedChatNote] = useState("");
  const [chatActionLoading, setChatActionLoading] = useState<string>("");
  const [openSections, setOpenSections] = useState({
    replies: true,
    labels: false,
    signatures: false,
    schedules: false,
    vendors: false,
    statuses: true,
    segmentation: false,
    actions: true,
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
      setChatAssignments(payload.chatAssignments || {});
      setNotifications(payload.notifications || []);
      setApiInfo(payload.apiInfo || null);
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
    socket.on("whatsapp:api-info", (payload: PanelApiInfo) => {
      setApiInfo(payload || null);
    });
    socket.on("whatsapp:messages", (payload: PanelMessage[]) => {
      setMessages(payload || []);
    });
    socket.on("whatsapp:chats", (payload: PanelChat[]) => {
      setChats(payload || []);
    });
    socket.on("whatsapp:status-feed", (payload: PanelStatusFeedItem[]) => {
      setStatusFeed(payload || []);
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
    socket.on("whatsapp:chat-note", (payload: { chatId: string; note: string }) => {
      if (payload.chatId === selectedChatIdRef.current) {
        setSelectedChatNote(payload.note || "");
      }
    });
    socket.on("whatsapp:chat-action-result", () => {
      setChatActionLoading("");
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
    const fetchVendors = async () => {
      try {
        setVendorsLoading(true);
        const response = await fetch("/api/arena/vendedores", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("vendors_failed");
        }
        const payload = (await response.json()) as Vendor[];
        setVendors(Array.isArray(payload) ? payload : []);
      } catch {
        setVendors([]);
      } finally {
        setVendorsLoading(false);
      }
    };

    fetchVendors();
  }, []);

  useEffect(() => {
    if (!isResizingSidebar) return;

    const handleMove = (event: MouseEvent) => {
      const left = workspaceRef.current?.getBoundingClientRect().left ?? 0;
      const next = Math.min(620, Math.max(320, event.clientX - left));
      setSidebarWidth(next);
    };

    const handleUp = () => setIsResizingSidebar(false);

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [isResizingSidebar]);

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
          unreadCount: 0,
          lastMessageBody: item.body,
          lastMessageTimestamp: item.timestamp,
          isGroup: false,
          isArchived: false,
          isPinned: false,
          assignedSellerId: chatAssignments[item.chatId] || null,
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp);
  }, [messages, chatAssignments]);

  const chatSource = chats.length ? chats : derivedChatList;

  const filteredChatList = useMemo(() => {
    const query = chatSearch.trim().toLowerCase();
    return chatSource.filter((item) => {
      const unreadPass =
        chatFilter === "all" ||
        (chatFilter === "unread" && item.unreadCount > 0) ||
        (chatFilter === "read" && item.unreadCount === 0);
      if (!unreadPass) return false;

      if (!query) return true;

      const name = getSummaryDisplayName(item).toLowerCase();
      const number = getSummaryDisplayNumber(item).toLowerCase();
      const body = item.lastMessageBody.toLowerCase();
      const labelsForChat = (chatLabels[item.chatId] || []).join(" ").toLowerCase();
      return (
        name.includes(query) ||
        number.includes(query) ||
        body.includes(query) ||
        labelsForChat.includes(query)
      );
    });
  }, [chatFilter, chatLabels, chatSearch, chatSource]);

  const keywordMatches = useMemo(() => {
    const query = segmentKeyword.trim().toLowerCase();
    if (!query) return filteredChatList.slice(0, 20);
    return filteredChatList.filter((chat) => {
      const haystack = [
        getSummaryDisplayName(chat),
        getSummaryDisplayNumber(chat),
        chat.lastMessageBody,
        ...(chatLabels[chat.chatId] || []),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [filteredChatList, segmentKeyword, chatLabels]);

  useEffect(() => {
    if (!selectedChatId && filteredChatList[0]) {
      setSelectedChatId(filteredChatList[0].chatId);
      setComposerMode("chat");
    }
  }, [filteredChatList, selectedChatId]);

  useEffect(() => {
    selectedChatIdRef.current = selectedChatId;
  }, [selectedChatId]);

  useEffect(() => {
    if (!selectedChatId) return;
    const exists = chatSource.some((item) => item.chatId === selectedChatId);
    if (!exists && filteredChatList[0]) {
      setSelectedChatId(filteredChatList[0].chatId);
    }
  }, [chatSource, filteredChatList, selectedChatId]);

  const selectedChatMessages = useMemo(() => {
    return messages.filter((item) => item.chatId === selectedChatId);
  }, [messages, selectedChatId]);

  const selectedChatLabels = chatLabels[selectedChatId] || [];
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
  const selectedSellerId = selectedChat ? chatAssignments[selectedChat.chatId] || null : null;
  const selectedSeller =
    vendors.find((vendor) => vendor.id === selectedSellerId) || null;

  useEffect(() => {
    if (composerMode === "chat" && selectedChatNumber) {
      setNumber(formatPhoneNumber(selectedChatNumber));
    }
  }, [composerMode, selectedChatNumber]);

  useEffect(() => {
    if (!selectedChatId) {
      setSelectedChatNote("");
      return;
    }
    sendSocketEvent("panel:chat-action", {
      chatId: selectedChatId,
      action: "get-note",
    });
  }, [selectedChatId]);

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

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  const handleSendMessage = () => {
    const normalized = formatPhoneNumber(number || selectedChatNumber);
    if (!normalized || !message.trim()) return;

    sendSocketEvent("panel:send-message", {
      number: normalized,
      chatId: composerMode === "chat" ? selectedChatId || null : null,
      text: message.trim(),
      signatureId: selectedSignatureId || null,
    });
    setNumber(normalized);
    setMessage("");
  };

  const handleAddLabel = () => {
    if (!newLabel.trim()) return;
    const matchedLabel = labels.find(
      (item) => item.toLowerCase() === newLabel.trim().toLowerCase()
    );
    if (!matchedLabel) {
      setToast("Etiqueta nao encontrada na conta. Sincronize as etiquetas do WhatsApp.");
      window.setTimeout(() => setToast(""), 3500);
      return;
    }
    if (!selectedChatId) {
      setToast("Selecione uma conversa para aplicar a etiqueta.");
      window.setTimeout(() => setToast(""), 3500);
      return;
    }
    handleToggleLabelOnChat(matchedLabel);
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
    const normalized = formatPhoneNumber(number || selectedChatNumber);
    if (!normalized || !message.trim() || !scheduleDateTime) return;
    sendSocketEvent("panel:schedule-message", {
      number: normalized,
      text: message.trim(),
      sendAt: scheduleDateTime,
      signatureId: selectedSignatureId || null,
    });
    setScheduleDateTime("");
  };

  const fileToPayload = async (file: File) => {
    const buffer = await file.arrayBuffer();
    const base64 = btoa(
      new Uint8Array(buffer).reduce(
        (acc, byte) => acc + String.fromCharCode(byte),
        ""
      )
    );
    return {
      base64,
      mimetype: file.type || "application/octet-stream",
      filename: file.name,
    };
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
      chatId: composerMode === "chat" ? selectedChatId || null : null,
      text: buildProductMessage(product),
      signatureId: selectedSignatureId || null,
    });
    setSelectedProduct(product);
  };

  const handleAssignSeller = (sellerId: string) => {
    if (!selectedChat) return;
    sendSocketEvent("panel:assign-seller", {
      chatId: selectedChat.chatId,
      sellerId: sellerId || null,
    });
  };

  const handleMarkRead = () => {
    if (!selectedChat) return;
    sendSocketEvent("panel:mark-chat-read", { chatId: selectedChat.chatId });
  };

  const handleCreateVendor = async () => {
    if (!newVendorName.trim()) return;

    const response = await fetch("/api/arena/vendedores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: newVendorName.trim(),
        avatar_url: newVendorAvatar.trim() || null,
        veiculo_emoji: newVendorEmoji.trim() || "🧑‍💼",
      }),
    });

    if (!response.ok) {
      setToast("Falha ao cadastrar vendedor.");
      window.setTimeout(() => setToast(""), 3500);
      return;
    }

    const payload = (await response.json()) as Vendor;
    setVendors((current) => [...current, payload].sort((a, b) => a.nome.localeCompare(b.nome)));
    setNewVendorName("");
    setNewVendorAvatar("");
    setNewVendorEmoji("🧑‍💼");
    setToast("Vendedor cadastrado e sincronizado com o sistema.");
    window.setTimeout(() => setToast(""), 3500);
  };

  const handleSendMedia = async () => {
    if (!pendingMedia) return;
    const normalized = formatPhoneNumber(number || selectedChatNumber);
    if (!normalized) return;

    const payload = await fileToPayload(pendingMedia);
    sendSocketEvent("panel:send-media", {
      number: normalized,
      chatId: composerMode === "chat" ? selectedChatId || null : null,
      caption: message.trim(),
      ...payload,
      sendAudioAsVoice: pendingMedia.type.startsWith("audio/"),
    });
    setPendingMedia(null);
    setMessage("");
  };

  const handlePostStatus = async () => {
    if (!statusText.trim() && !statusMedia) return;
    if (statusMedia) {
      const payload = await fileToPayload(statusMedia);
      sendSocketEvent("panel:post-status", {
        text: statusText.trim(),
        ...payload,
      });
    } else {
      sendSocketEvent("panel:post-status", {
        text: statusText.trim(),
      });
    }
    setStatusText("");
    setStatusMedia(null);
  };

  const toggleSegmentSelection = (chatId: string) => {
    setSegmentSelectedIds((current) =>
      current.includes(chatId)
        ? current.filter((id) => id !== chatId)
        : [...current, chatId]
    );
  };

  const handleSelectAllSegmented = () => {
    setSegmentSelectedIds(keywordMatches.map((chat) => chat.chatId));
  };

  const handleClearSegmented = () => {
    setSegmentSelectedIds([]);
  };

  const handleSendSegmented = () => {
    const recipients = keywordMatches
      .filter((chat) => segmentSelectedIds.includes(chat.chatId))
      .map((chat) => ({
        chatId: chat.chatId,
        number: getSummaryDisplayNumber(chat),
      }));

    if (!recipients.length || !segmentMessage.trim()) return;
    sendSocketEvent("panel:send-segmented", {
      recipients,
      text: segmentMessage.trim(),
      signatureId: selectedSignatureId || null,
    });
    setSegmentMessage("");
  };

  const handleSyncLabels = () => {
    sendSocketEvent("panel:refresh-labels", {});
  };

  const handleChatAction = (action: string, extraPayload?: Record<string, unknown>) => {
    if (!selectedChatId) return;
    setChatActionLoading(action);
    sendSocketEvent("panel:chat-action", {
      chatId: selectedChatId,
      action,
      ...(extraPayload || {}),
    });
  };

  return (
    <div className="h-screen overflow-hidden bg-[linear-gradient(180deg,#fff5f5_0%,#fffdfd_100%)] text-slate-900">
      <div className="mx-auto flex h-full max-w-[1700px] flex-col px-4 py-4 md:px-6 md:py-6">
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

          <div className="grid gap-4 border-t border-red-100 bg-white px-6 py-4 md:grid-cols-4 md:px-8">
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
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500">API</div>
              <div className="mt-1 text-sm font-medium text-slate-800">
                {apiInfo?.resolvedVersion || apiInfo?.declaredVersion || "whatsapp-web.js"}
              </div>
            </div>
          </div>

          {toast ? (
            <div className="border-t border-red-100 bg-red-50 px-6 py-3 text-sm font-medium text-red-700 md:px-8">
              {toast}
            </div>
          ) : null}
        </div>

        <div className="flex min-h-0 flex-1 flex-col space-y-6">
          <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)_360px]">
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

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <button
                    onClick={handleResetSession}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-3 font-bold text-white transition hover:bg-red-700"
                  >
                    <RefreshCcw size={16} />
                    Gerar novo QR
                  </button>
                  <button
                    onClick={handleSyncConversations}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-100 bg-white px-4 py-3 font-bold text-slate-700 transition hover:bg-red-50"
                  >
                    <RefreshCcw size={16} />
                    Sincronizar conta
                  </button>
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-[28px] border border-red-100 bg-white shadow-sm">
              <div className="border-b border-red-100 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h2 className="font-black text-slate-900">Atalhos no topo</h2>
                    <p className="text-sm text-slate-500">Ferramentas mais usadas sempre visiveis</p>
                  </div>
                </div>
              </div>
              <div className="grid gap-3 p-5 sm:grid-cols-3 xl:grid-cols-4">
                <button
                  onClick={() => toggleSection("replies")}
                  className="rounded-2xl border border-red-100 bg-red-50 px-4 py-4 text-left transition hover:bg-red-100"
                >
                  <div className="text-xs font-bold uppercase tracking-wide text-red-600">Rapidez</div>
                  <div className="mt-1 font-black text-slate-900">Respostas</div>
                  <div className="mt-1 text-xs text-slate-500">{quickReplies.length} salvas</div>
                </button>
                <button
                  onClick={() => toggleSection("labels")}
                  className="rounded-2xl border border-red-100 bg-white px-4 py-4 text-left transition hover:bg-red-50"
                >
                  <div className="text-xs font-bold uppercase tracking-wide text-red-600">Organizacao</div>
                  <div className="mt-1 font-black text-slate-900">Etiquetas</div>
                  <div className="mt-1 text-xs text-slate-500">{labels.length} sincronizadas</div>
                </button>
                <button
                  onClick={() => toggleSection("statuses")}
                  className="rounded-2xl border border-red-100 bg-white px-4 py-4 text-left transition hover:bg-red-50"
                >
                  <div className="text-xs font-bold uppercase tracking-wide text-red-600">WhatsApp</div>
                  <div className="mt-1 font-black text-slate-900">Status</div>
                  <div className="mt-1 text-xs text-slate-500">{statusFeed.length} contatos</div>
                </button>
                <button
                  onClick={() => toggleSection("vendors")}
                  className="rounded-2xl border border-red-100 bg-white px-4 py-4 text-left transition hover:bg-red-50"
                >
                  <div className="text-xs font-bold uppercase tracking-wide text-red-600">Equipe</div>
                  <div className="mt-1 font-black text-slate-900">Vendedores</div>
                  <div className="mt-1 text-xs text-slate-500">{vendors.length} sincronizados</div>
                </button>
                <button
                  onClick={() => toggleSection("signatures")}
                  className="rounded-2xl border border-red-100 bg-white px-4 py-4 text-left transition hover:bg-red-50"
                >
                  <div className="text-xs font-bold uppercase tracking-wide text-red-600">Assinatura</div>
                  <div className="mt-1 font-black text-slate-900">Vendedor</div>
                  <div className="mt-1 text-xs text-slate-500">{signatures.length} textos</div>
                </button>
                <button
                  onClick={() => toggleSection("schedules")}
                  className="rounded-2xl border border-red-100 bg-white px-4 py-4 text-left transition hover:bg-red-50"
                >
                  <div className="text-xs font-bold uppercase tracking-wide text-red-600">Agenda</div>
                  <div className="mt-1 font-black text-slate-900">Programados</div>
                  <div className="mt-1 text-xs text-slate-500">{schedules.length} envios</div>
                </button>
                <button
                  onClick={() => toggleSection("segmentation")}
                  className="rounded-2xl border border-red-100 bg-white px-4 py-4 text-left transition hover:bg-red-50"
                >
                  <div className="text-xs font-bold uppercase tracking-wide text-red-600">Selecao</div>
                  <div className="mt-1 font-black text-slate-900">Palavra-chave</div>
                  <div className="mt-1 text-xs text-slate-500">{segmentSelectedIds.length} marcados</div>
                </button>
                <button
                  onClick={() => toggleSection("actions")}
                  className="rounded-2xl border border-red-100 bg-white px-4 py-4 text-left transition hover:bg-red-50"
                >
                  <div className="text-xs font-bold uppercase tracking-wide text-red-600">API</div>
                  <div className="mt-1 font-black text-slate-900">Acoes</div>
                  <div className="mt-1 text-xs text-slate-500">
                    {apiInfo?.supportedActions?.length || 0} recursos
                  </div>
                </button>
                <button
                  onClick={handleStartNewMessage}
                  className="rounded-2xl border border-red-100 bg-white px-4 py-4 text-left transition hover:bg-red-50"
                >
                  <div className="text-xs font-bold uppercase tracking-wide text-red-600">Contato</div>
                  <div className="mt-1 font-black text-slate-900">Nova mensagem</div>
                  <div className="mt-1 text-xs text-slate-500">Iniciar conversa manual</div>
                </button>
              </div>
            </section>

            <section className="overflow-hidden rounded-[28px] border border-red-100 bg-white shadow-sm">
              <div className="border-b border-red-100 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                    <Bell size={20} />
                  </div>
                  <div>
                    <h2 className="font-black text-slate-900">Notificacoes de vendedores</h2>
                    <p className="text-sm text-slate-500">Cliente novo e cliente aguardando retorno</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3 p-5">
                {notifications.length ? (
                  notifications.slice(0, 4).map((item) => {
                    const vendor = vendors.find((entry) => entry.id === item.sellerId) || null;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setComposerMode("chat");
                          setSelectedChatId(item.chatId);
                        }}
                        className="w-full rounded-2xl border border-red-100 bg-[#fffafa] px-4 py-3 text-left transition hover:bg-red-50"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900">{item.title}</div>
                            <div className="mt-1 line-clamp-2 text-sm text-slate-600">{item.subtitle}</div>
                            <div className="mt-2 text-xs font-medium text-slate-400">
                              {vendor ? `Vendedor: ${vendor.nome}` : "Sem vendedor fixo"}
                            </div>
                          </div>
                          <div className="rounded-full bg-red-600 px-2.5 py-1 text-xs font-black text-white">
                            {item.unreadCount}
                          </div>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-500">
                    Nenhum cliente novo aguardando notificacao agora.
                  </div>
                )}
              </div>
            </section>
          </div>

          <section
            ref={workspaceRef}
            className="min-h-0 flex-1 overflow-hidden rounded-[32px] border border-red-100 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]"
          >
            <div className="flex h-full min-h-0 flex-col xl:flex-row">
              <aside
                className="w-full border-b border-red-100 bg-[#fffafa] xl:h-full xl:shrink-0 xl:border-b-0 xl:border-r"
                style={{ width: `min(100%, ${sidebarWidth}px)` }}
              >
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

                  <div className="mt-4 flex flex-wrap gap-2">
                    {[
                      { id: "all", label: "Todas" },
                      { id: "unread", label: "Nao lidas" },
                      { id: "read", label: "Lidas" },
                    ].map((filterItem) => (
                      <button
                        key={filterItem.id}
                        onClick={() =>
                          setChatFilter(filterItem.id as "all" | "unread" | "read")
                        }
                        className={`rounded-full px-3 py-2 text-xs font-bold transition ${
                          chatFilter === filterItem.id
                            ? "bg-red-600 text-white"
                            : "bg-white text-slate-600 hover:bg-red-50"
                        }`}
                      >
                        {filterItem.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="max-h-[calc(100vh-420px)] space-y-2 overflow-y-auto px-4 py-4 xl:max-h-[none] xl:h-[calc(100%-164px)]">
                  {filteredChatList.length ? (
                    filteredChatList.map((chat) => {
                      const assignedVendor =
                        vendors.find((vendor) => vendor.id === (chatAssignments[chat.chatId] || chat.assignedSellerId)) ||
                        null;
                      return (
                        <button
                          key={chat.chatId}
                          onClick={() => {
                            setComposerMode("chat");
                            setSelectedChatId(chat.chatId);
                            setNumber(formatPhoneNumber(getSummaryDisplayNumber(chat)));
                          }}
                          className={`w-full rounded-3xl border px-4 py-4 text-left transition ${
                            selectedChatId === chat.chatId
                              ? "border-red-200 bg-white shadow-sm"
                              : "border-transparent bg-transparent hover:border-red-100 hover:bg-white"
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
                              <div className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">
                                {chat.lastMessageBody || "Sem texto recente"}
                              </div>
                              <div className="mt-3 flex flex-wrap items-center gap-2">
                                {chat.unreadCount > 0 ? (
                                  <span className="rounded-full bg-red-600 px-2.5 py-1 text-[11px] font-black text-white">
                                    {chat.unreadCount} nao lidas
                                  </span>
                                ) : (
                                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                                    Lida
                                  </span>
                                )}
                                {assignedVendor ? (
                                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700">
                                    {assignedVendor.veiculo_emoji || "🧑‍💼"} {assignedVendor.nome}
                                  </span>
                                ) : (
                                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">
                                    Sem vendedor
                                  </span>
                                )}
                                {(chatLabels[chat.chatId] || []).slice(0, 2).map((label) => (
                                  <span
                                    key={label}
                                    className="rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-700"
                                  >
                                    {label}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="rounded-3xl bg-white px-5 py-8 text-center text-sm text-slate-500 shadow-sm">
                      Nenhuma conversa encontrada com esse filtro.
                    </div>
                  )}
                </div>
              </aside>

              <div
                onMouseDown={() => setIsResizingSidebar(true)}
                className={`hidden w-3 cursor-col-resize bg-[linear-gradient(180deg,#fff7f7_0%,#ffe4e6_100%)] transition xl:block ${
                  isResizingSidebar ? "shadow-[inset_0_0_0_1px_rgba(239,68,68,0.35)]" : ""
                }`}
              />

              <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[linear-gradient(180deg,#ffffff_0%,#fff9f9_100%)]">
                <div className="border-b border-red-100 px-5 py-5 md:px-7">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
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
                            {selectedChatNumber || "Escolha uma conversa para abrir a leitura completa"}
                          </p>
                        </div>
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
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
                        {selectedChatMessages.length} mensagens
                      </span>
                      {selectedChat?.unreadCount ? (
                        <span className="rounded-full bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700">
                          {selectedChat.unreadCount} nao lidas
                        </span>
                      ) : null}
                      <button
                        onClick={handleMarkRead}
                        className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-red-50"
                      >
                        <CheckCircle2 size={14} />
                        Marcar como lida
                      </button>
                      <button
                        onClick={handleSyncConversations}
                        className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-red-50"
                      >
                        <RefreshCcw size={14} />
                        Sincronizar
                      </button>
                      <button
                        onClick={handleStartNewMessage}
                        className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-red-50"
                      >
                        <Plus size={14} />
                        Nova mensagem
                      </button>
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
                    </div>
                  ) : null}
                </div>

                <div
                  ref={messagesViewportRef}
                  className="min-h-0 flex-1 overflow-y-auto px-5 py-6 md:px-7"
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
                          A caixa central mostra apenas as mensagens do contato selecionado para facilitar a leitura.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-red-100 bg-white px-5 py-5 md:px-7">
                  <div className="grid gap-4 xl:grid-cols-[1fr_240px_220px]">
                    <input
                      value={number}
                      onChange={(event) => {
                        setComposerMode("new");
                        setNumber(formatPhoneNumber(event.target.value));
                      }}
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
                    placeholder="Digite a mensagem. O envio pode ser imediato, com assinatura, com anexo ou agendado."
                    rows={5}
                    className="mt-3 w-full rounded-[28px] border border-red-100 px-5 py-4 text-[15px] leading-7 outline-none transition focus:border-red-400"
                  />

                  <div className="mt-4 grid gap-4 2xl:grid-cols-[minmax(0,1fr)_340px]">
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
                                    Inserir
                                  </button>
                                  <button
                                    onClick={() => handleSendProduct(product)}
                                    className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-red-700"
                                  >
                                    Enviar
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
                        <ImagePlus className="text-red-600" size={18} />
                        <h4 className="font-black text-slate-900">Midia do atendimento</h4>
                      </div>
                      <div className="space-y-3">
                        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-red-200 bg-red-50 px-4 py-4 text-sm font-bold text-red-700 transition hover:bg-red-100">
                          <ImagePlus size={16} />
                          Selecionar imagem ou audio
                          <input
                            type="file"
                            accept="image/*,audio/*"
                            className="hidden"
                            onChange={(event) => setPendingMedia(event.target.files?.[0] || null)}
                          />
                        </label>
                        {pendingMedia ? (
                          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                            Arquivo pronto: <span className="font-bold">{pendingMedia.name}</span>
                          </div>
                        ) : (
                          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
                            Anexe imagens e audios para enviar na conversa selecionada.
                          </div>
                        )}
                        <div className="grid gap-3 sm:grid-cols-3">
                          <button
                            onClick={handleSendMedia}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 font-bold text-red-700 transition hover:bg-red-100"
                          >
                            <Mic size={16} />
                            Enviar midia
                          </button>
                          <button
                            onClick={handleScheduleMessage}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-700 transition hover:bg-slate-50"
                          >
                            <CalendarClock size={16} />
                            Agendar
                          </button>
                          <button
                            onClick={handleSendMessage}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-3 font-bold text-white transition hover:bg-red-700"
                          >
                            <Send size={16} />
                            {composerMode === "new" ? "Nova mensagem" : "Enviar agora"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <aside className="w-full border-t border-red-100 bg-[#fffdfd] xl:h-full xl:w-[380px] xl:shrink-0 xl:border-l xl:border-t-0">
                <div className="max-h-[calc(100vh-420px)] space-y-5 overflow-y-auto p-5 xl:h-full xl:max-h-none">
                  <section className="rounded-[28px] border border-red-100 bg-white p-4 shadow-sm">
                    <div className="mb-3 flex items-center gap-2">
                      <UserRound className="text-red-600" size={18} />
                      <h4 className="font-black text-slate-900">Cliente selecionado</h4>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="rounded-2xl bg-slate-50 px-4 py-3">
                        <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Nome</div>
                        <div className="mt-1 font-semibold text-slate-900">{selectedChatName}</div>
                      </div>
                      <div className="rounded-2xl bg-slate-50 px-4 py-3">
                        <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Numero</div>
                        <div className="mt-1 font-semibold text-slate-900">{selectedChatNumber || "-"}</div>
                      </div>
                      <div className="rounded-2xl bg-slate-50 px-4 py-3">
                        <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Modo</div>
                        <div className="mt-1 font-semibold text-slate-900">
                          {composerMode === "new" ? "Nova mensagem" : "Conversa existente"}
                        </div>
                      </div>
                      <div className="rounded-2xl bg-slate-50 px-4 py-3">
                        <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Ultimo produto</div>
                        <div className="mt-1 font-semibold text-slate-900">
                          {selectedProduct?.name || "Nenhum produto selecionado"}
                        </div>
                      </div>
                    </div>
                  </section>

                  <CascadeSection
                    title="Status do WhatsApp"
                    icon={<Sparkles size={18} />}
                    open={openSections.statuses}
                    count={`${statusFeed.length} contatos com status`}
                    onToggle={() => toggleSection("statuses")}
                  >
                    <div className="space-y-3">
                      <textarea
                        value={statusText}
                        onChange={(event) => setStatusText(event.target.value)}
                        placeholder="Texto para publicar no status"
                        rows={3}
                        className="w-full rounded-2xl border border-red-100 px-4 py-3 outline-none transition focus:border-red-400"
                      />
                      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 transition hover:bg-red-100">
                        <ImagePlus size={16} />
                        Selecionar foto ou audio para status
                        <input
                          type="file"
                          accept="image/*,audio/*"
                          className="hidden"
                          onChange={(event) => setStatusMedia(event.target.files?.[0] || null)}
                        />
                      </label>
                      {statusMedia ? (
                        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                          Midia pronta: <span className="font-bold">{statusMedia.name}</span>
                        </div>
                      ) : null}
                      <button
                        onClick={handlePostStatus}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-3 font-bold text-white transition hover:bg-red-700"
                      >
                        <Send size={16} />
                        Publicar no status
                      </button>
                    </div>

                    <div className="mt-4 space-y-2">
                      {statusFeed.length ? (
                        statusFeed.map((item) => (
                          <div key={item.id} className="rounded-2xl border border-red-100 bg-[#fffafa] p-3">
                            <div className="flex items-start gap-3">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-red-100 text-sm font-black text-red-700">
                                {item.profilePicUrl ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={item.profilePicUrl}
                                    alt={item.contactName}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  getInitials(item.contactName)
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-bold text-slate-900">{item.contactName}</div>
                                <div className="mt-1 text-xs text-slate-500">
                                  {item.totalCount} publicacoes • {item.unreadCount} nao vistas
                                </div>
                                <div className="mt-2 line-clamp-2 text-sm text-slate-600">
                                  {item.items[0]?.body || item.items[0]?.mediaType || "Status com midia"}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-2xl bg-slate-50 px-4 py-5 text-sm text-slate-500">
                          Nenhum status sincronizado ainda.
                        </div>
                      )}
                    </div>
                  </CascadeSection>

                  <CascadeSection
                    title="Vendedores Sincronizados"
                    icon={<Users size={18} />}
                    open={openSections.vendors}
                    count={`${vendors.length} vendedores`}
                    onToggle={() => toggleSection("vendors")}
                  >
                    <div className="space-y-3">
                      <div>
                        <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                          Vendedor fixo do cliente
                        </div>
                        <select
                          value={selectedSellerId || ""}
                          onChange={(event) => handleAssignSeller(event.target.value)}
                          className="w-full rounded-2xl border border-red-100 px-4 py-3 outline-none transition focus:border-red-400"
                        >
                          <option value="">Sem vendedor definido</option>
                          {vendors.map((vendor) => (
                            <option key={vendor.id} value={vendor.id}>
                              {vendor.veiculo_emoji || "🧑‍💼"} {vendor.nome}
                            </option>
                          ))}
                        </select>
                        <div className="mt-2 text-xs text-slate-500">
                          Esse cadastro usa a mesma base `arena_vendedores`, refletindo no sistema todo.
                        </div>
                      </div>

                      {selectedSeller ? (
                        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm">
                          <div className="font-bold text-slate-900">
                            Responsavel: {selectedSeller.veiculo_emoji || "🧑‍💼"} {selectedSeller.nome}
                          </div>
                          <div className="mt-1 text-slate-600">
                            Novas mensagens deste cliente passam a aparecer nas notificacoes do vendedor.
                          </div>
                        </div>
                      ) : null}

                      <div className="rounded-2xl border border-red-100 bg-[#fffafa] p-4">
                        <div className="font-bold text-slate-900">Cadastrar novo vendedor</div>
                        <div className="mt-3 space-y-3">
                          <input
                            value={newVendorName}
                            onChange={(event) => setNewVendorName(event.target.value)}
                            placeholder="Nome do vendedor"
                            className="w-full rounded-2xl border border-red-100 px-4 py-3 outline-none transition focus:border-red-400"
                          />
                          <input
                            value={newVendorAvatar}
                            onChange={(event) => setNewVendorAvatar(event.target.value)}
                            placeholder="URL do avatar"
                            className="w-full rounded-2xl border border-red-100 px-4 py-3 outline-none transition focus:border-red-400"
                          />
                          <input
                            value={newVendorEmoji}
                            onChange={(event) => setNewVendorEmoji(event.target.value)}
                            placeholder="Emoji do vendedor"
                            className="w-full rounded-2xl border border-red-100 px-4 py-3 outline-none transition focus:border-red-400"
                          />
                          <button
                            onClick={handleCreateVendor}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-3 font-bold text-white hover:bg-red-700"
                          >
                            <Plus size={16} />
                            {vendorsLoading ? "Carregando vendedores..." : "Cadastrar vendedor"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </CascadeSection>

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
                    count={`${labels.length} sincronizadas`}
                    onToggle={() => toggleSection("labels")}
                  >
                    <div className="flex gap-2">
                      <input
                        value={newLabel}
                        onChange={(event) => setNewLabel(event.target.value)}
                        placeholder="Digite uma etiqueta ja existente"
                        className="w-full rounded-2xl border border-red-100 px-4 py-3 outline-none transition focus:border-red-400"
                      />
                      <button
                        onClick={handleAddLabel}
                        className="rounded-2xl bg-red-600 px-4 py-3 font-bold text-white hover:bg-red-700"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <button
                      onClick={handleSyncLabels}
                      className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 font-bold text-red-700 transition hover:bg-red-100"
                    >
                      <RefreshCcw size={16} />
                      Sincronizar todas as etiquetas
                    </button>

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

                  <CascadeSection
                    title="API Profissional"
                    icon={<Sparkles size={18} />}
                    open={openSections.actions}
                    count={`${apiInfo?.supportedActions?.length || 0} recursos da versao instalada`}
                    onToggle={() => toggleSection("actions")}
                  >
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-red-100 bg-[#fffafa] p-4">
                        <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Versao</div>
                        <div className="mt-1 font-black text-slate-900">
                          {apiInfo?.resolvedVersion || apiInfo?.declaredVersion || "whatsapp-web.js"}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {(apiInfo?.supportedActions || []).map((item) => (
                            <span
                              key={item}
                              className="rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-slate-700"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="grid gap-2 sm:grid-cols-2">
                        <button
                          onClick={() =>
                            handleChatAction(selectedChat?.isArchived ? "unarchive" : "archive")
                          }
                          className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 transition hover:bg-red-100"
                        >
                          {chatActionLoading === "archive" || chatActionLoading === "unarchive"
                            ? "Processando..."
                            : selectedChat?.isArchived
                              ? "Desarquivar"
                              : "Arquivar"}
                        </button>
                        <button
                          onClick={() =>
                            handleChatAction(selectedChat?.isPinned ? "unpin" : "pin")
                          }
                          className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 transition hover:bg-red-100"
                        >
                          {chatActionLoading === "pin" || chatActionLoading === "unpin"
                            ? "Processando..."
                            : selectedChat?.isPinned
                              ? "Desafixar"
                              : "Fixar"}
                        </button>
                        <button
                          onClick={() =>
                            handleChatAction(selectedChat?.isMuted ? "unmute" : "mute", {
                              unmuteDate: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
                            })
                          }
                          className="rounded-2xl border border-red-100 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-red-50"
                        >
                          {chatActionLoading === "mute" || chatActionLoading === "unmute"
                            ? "Processando..."
                            : selectedChat?.isMuted
                              ? "Remover silencio"
                              : "Silenciar 8h"}
                        </button>
                        <button
                          onClick={() => handleChatAction("mark-unread")}
                          className="rounded-2xl border border-red-100 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-red-50"
                        >
                          Marcar nao lida
                        </button>
                        <button
                          onClick={() => handleChatAction("typing")}
                          className="rounded-2xl border border-red-100 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-red-50"
                        >
                          Mostrar digitando
                        </button>
                        <button
                          onClick={() => handleChatAction("recording")}
                          className="rounded-2xl border border-red-100 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-red-50"
                        >
                          Mostrar gravando
                        </button>
                        <button
                          onClick={() => handleChatAction("clear-state")}
                          className="rounded-2xl border border-red-100 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-red-50"
                        >
                          Limpar estado
                        </button>
                        <button
                          onClick={() => handleChatAction("sync-history")}
                          className="rounded-2xl border border-red-100 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-red-50"
                        >
                          Sincronizar historico
                        </button>
                        <button
                          onClick={() => handleChatAction("clear-messages")}
                          className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700 transition hover:bg-amber-100"
                        >
                          Limpar mensagens
                        </button>
                        <button
                          onClick={() => handleChatAction("delete-chat")}
                          className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700 transition hover:bg-amber-100"
                        >
                          Excluir chat
                        </button>
                        <button
                          onClick={() => handleChatAction("block")}
                          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                        >
                          Bloquear contato
                        </button>
                        <button
                          onClick={() => handleChatAction("unblock")}
                          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                        >
                          Desbloquear contato
                        </button>
                      </div>

                      <div className="rounded-2xl border border-red-100 bg-white p-4">
                        <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                          Nota do cliente
                        </div>
                        <textarea
                          value={selectedChatNote}
                          onChange={(event) => setSelectedChatNote(event.target.value)}
                          rows={4}
                          placeholder="Observacao sincronizada com a conversa"
                          className="w-full rounded-2xl border border-red-100 px-4 py-3 outline-none transition focus:border-red-400"
                        />
                        <button
                          onClick={() => handleChatAction("set-note", { note: selectedChatNote })}
                          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-3 font-bold text-white transition hover:bg-red-700"
                        >
                          <Send size={16} />
                          Salvar nota do cliente
                        </button>
                      </div>
                    </div>
                  </CascadeSection>

                  <CascadeSection
                    title="Segmentacao por Palavra-chave"
                    icon={<Filter size={18} />}
                    open={openSections.segmentation}
                    count={`${keywordMatches.length} encontrados`}
                    onToggle={() => toggleSection("segmentation")}
                  >
                    <div className="space-y-3">
                      <input
                        value={segmentKeyword}
                        onChange={(event) => setSegmentKeyword(event.target.value)}
                        placeholder="Ex.: notebook"
                        className="w-full rounded-2xl border border-red-100 px-4 py-3 outline-none transition focus:border-red-400"
                      />
                      <textarea
                        value={segmentMessage}
                        onChange={(event) => setSegmentMessage(event.target.value)}
                        placeholder="Mensagem para os clientes selecionados"
                        rows={3}
                        className="w-full rounded-2xl border border-red-100 px-4 py-3 outline-none transition focus:border-red-400"
                      />
                      <div className="grid gap-2 sm:grid-cols-2">
                        <button
                          onClick={handleSelectAllSegmented}
                          className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 transition hover:bg-red-100"
                        >
                          Selecionar todos
                        </button>
                        <button
                          onClick={handleClearSegmented}
                          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                        >
                          Limpar selecao
                        </button>
                      </div>
                      <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                        {keywordMatches.length ? (
                          keywordMatches.map((chat) => {
                            const selected = segmentSelectedIds.includes(chat.chatId);
                            return (
                              <button
                                key={chat.chatId}
                                onClick={() => toggleSegmentSelection(chat.chatId)}
                                className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                                  selected
                                    ? "border-red-300 bg-red-50"
                                    : "border-red-100 bg-white hover:bg-red-50"
                                }`}
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <div className="min-w-0">
                                    <div className="truncate font-bold text-slate-900">
                                      {getSummaryDisplayName(chat)}
                                    </div>
                                    <div className="mt-1 text-xs text-slate-500">
                                      {getSummaryDisplayNumber(chat) || chat.chatId}
                                    </div>
                                  </div>
                                  {selected ? (
                                    <CheckCircle2 className="shrink-0 text-red-600" size={18} />
                                  ) : null}
                                </div>
                              </button>
                            );
                          })
                        ) : (
                          <div className="rounded-2xl bg-slate-50 px-4 py-5 text-sm text-slate-500">
                            Nenhum cliente encontrado para essa palavra-chave.
                          </div>
                        )}
                      </div>
                      <button
                        onClick={handleSendSegmented}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-3 font-bold text-white transition hover:bg-red-700"
                      >
                        <Send size={16} />
                        Enviar para selecionados
                      </button>
                    </div>
                  </CascadeSection>
                </div>
              </aside>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
