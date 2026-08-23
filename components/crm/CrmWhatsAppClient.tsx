"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { io, type Socket } from "socket.io-client";
import {
  CrmChat,
  CrmEtiqueta,
  CrmMensagem,
  CrmNotaCliente,
  CrmProdutoCatalogo,
  CrmPromocao,
  CrmRespostaRapida,
  CrmStatusFeed,
  CrmVendedor,
  KanbanColumn,
  WhatsAppStatus,
} from "@/types/crm";
import {
  ETIQUETAS_BASE,
  KANBAN_COLUNAS_BASE,
  PRODUTOS_CATALOGO_BASE,
  RESPOSTAS_BASE,
  VENDEDORES_BASE,
} from "@/lib/crm-defaults";

interface CtxMenuItem {
  label?: string;
  icon?: string;
  check?: boolean;
  danger?: boolean;
  disabled?: boolean;
  sep?: boolean;
  grupo?: string;
  children?: () => CtxMenuItem[];
  onClick?: () => void;
}

interface LinkPreviewData {
  id: string;
  nome: string;
  preco: number;
  imgPath?: string | null;
  link: string;
}

interface DocUploadState {
  file: File;
  nome: string;
  mime: string;
  tamanhoFormatado: string;
  dataUrl?: string;
}

// Formata número de WhatsApp no formato solicitado: xx xx xxxxxxxxx (ex: 55 19 987510267)
function formatarNumeroExibicao(num: string | null | undefined): string {
  if (!num) return "";
  const limpo = String(num).replace(/@.*$/, "").replace(/\D/g, "");
  if (!limpo) return "";
  
  // 13 dígitos: 55 + DDD (2) + 9 dígitos -> 55 19 987510267
  if (limpo.length === 13 && limpo.startsWith("55")) {
    return `${limpo.slice(0, 2)} ${limpo.slice(2, 4)} ${limpo.slice(4)}`;
  }
  // 12 dígitos: 55 + DDD (2) + 8 dígitos -> 55 19 87510267
  if (limpo.length === 12 && limpo.startsWith("55")) {
    return `${limpo.slice(0, 2)} ${limpo.slice(2, 4)} ${limpo.slice(4)}`;
  }
  // 11 dígitos: DDD (2) + 9 dígitos -> 55 19 987510267
  if (limpo.length === 11) {
    return `55 ${limpo.slice(0, 2)} ${limpo.slice(2)}`;
  }
  // 10 dígitos: DDD (2) + 8 dígitos -> 55 19 87510267
  if (limpo.length === 10) {
    return `55 ${limpo.slice(0, 2)} ${limpo.slice(2)}`;
  }
  return limpo;
}

export default function CrmWhatsAppClient() {
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const campoTextoRef = useRef<HTMLTextAreaElement | null>(null);
  const serverUrl =
    process.env.NEXT_PUBLIC_WHATSAPP_PANEL_SERVER_URL || "http://localhost:4100";

  // Connection State
  const [estado, setEstado] = useState<WhatsAppStatus>("initializing");
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [rawQrString, setRawQrString] = useState<string | null>(null);
  const [numeroConectado, setNumeroConectado] = useState<string | null>(null);
  const [qrCountdown, setQrCountdown] = useState<number>(25);

  // Vendedor State (No fake names)
  const [vendedores, setVendedores] = useState<CrmVendedor[]>(() => {
    if (typeof window !== "undefined") {
      const s = localStorage.getItem("balao_crm_vendedores");
      if (s) {
        try {
          const parsed = JSON.parse(s);
          if (Array.isArray(parsed)) return parsed;
        } catch {}
      }
    }
    return VENDEDORES_BASE;
  });
  const [vendedorAtivoId, setVendedorAtivoId] = useState<string | number | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("balao_crm_vendedor_ativo") || null;
    }
    return null;
  });
  const [assinaturaAuto, setAssinaturaAuto] = useState(true);

  // Chats and Messages
  const [chats, setChats] = useState<CrmChat[]>(() => {
    if (typeof window !== "undefined") {
      const s = localStorage.getItem("balao_crm_chats");
      if (s) {
        try {
          const parsed = JSON.parse(s);
          if (Array.isArray(parsed)) {
            return parsed.filter(
              (c: any) =>
                c.id &&
                c.id !== "status@broadcast" &&
                !String(c.id).includes("broadcast") &&
                c.id !== "status"
            );
          }
        } catch {}
      }
    }
    return [];
  });
  const [chatSelecionadoId, setChatSelecionadoId] = useState<string | null>(null);
  const [mensagens, setMensagens] = useState<CrmMensagem[]>(() => {
    if (typeof window !== "undefined") {
      const s = localStorage.getItem("balao_crm_mensagens_store");
      if (s) {
        try { return JSON.parse(s); } catch {}
      }
    }
    return [];
  });

  // WhatsApp Status / Stories State
  const [statusFeed, setStatusFeed] = useState<CrmStatusFeed[]>([]);
  const [modalStatusAberto, setModalStatusAberto] = useState(false);
  const [statusSelecionadoFeed, setStatusSelecionadoFeed] = useState<CrmStatusFeed | null>(null);
  const [statusItemIndex, setStatusItemIndex] = useState(0);
  const [statusComentario, setStatusComentario] = useState("");
  const [modalNovoStatusAberto, setModalNovoStatusAberto] = useState(false);
  const [novoStatusTexto, setNovoStatusTexto] = useState("");
  const [novoStatusCor, setNovoStatusCor] = useState("#0f9d58");

  // Kanban State
  const [kanbanColunas, setKanbanColunas] = useState<KanbanColumn[]>(() => {
    if (typeof window !== "undefined") {
      const s = localStorage.getItem("balao_crm_kanban_colunas");
      if (s) {
        try { return JSON.parse(s); } catch {}
      }
    }
    return KANBAN_COLUNAS_BASE;
  });
  const [kanbanTamanho, setKanbanTamanho] = useState<"normal" | "expandido" | "recolhido">("normal");
  const [kanbanBusca, setKanbanBusca] = useState("");
  const [kanbanArrastadoId, setKanbanArrastadoId] = useState<string | null>(null);

  // Sidebar Tabs & Settings
  const [abaAtual, setAbaAtual] = useState<
    "catalogo" | "fotos" | "respostas" | "vendedores" | "etiquetas" | "disparo" | "cliente"
  >("catalogo");
  const [filtroNaoLidas, setFiltroNaoLidas] = useState(false);
  const [buscaChat, setBuscaChat] = useState("");
  const [mostrarRapidasBar, setMostrarRapidasBar] = useState(false);
  const [campoTexto, setCampoTexto] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Respostas Rápidas & Etiquetas & Catálogo
  const [respostas, setRespostas] = useState<CrmRespostaRapida[]>(() => {
    if (typeof window !== "undefined") {
      const s = localStorage.getItem("balao_crm_respostas");
      if (s) {
        try { return JSON.parse(s); } catch {}
      }
    }
    return RESPOSTAS_BASE;
  });
  const [etiquetas, setEtiquetas] = useState<CrmEtiqueta[]>(() => {
    if (typeof window !== "undefined") {
      const s = localStorage.getItem("balao_crm_etiquetas");
      if (s) {
        try { return JSON.parse(s); } catch {}
      }
    }
    return ETIQUETAS_BASE;
  });
  const [produtosCatalogo, setProdutosCatalogo] = useState<CrmProdutoCatalogo[]>(PRODUTOS_CATALOGO_BASE);
  const [buscaCatalogo, setBuscaCatalogo] = useState("");
  const [fornecedorFiltro, setFornecedorFiltro] = useState("todos");

  // Context Menu State
  const [ctxVisible, setCtxVisible] = useState(false);
  const [ctxPos, setCtxPos] = useState({ x: 0, y: 0 });
  const [ctxStack, setCtxStack] = useState<{ title: string; items: CtxMenuItem[] }[]>([]);

  // Replying / Quoting State
  const [msgRespondendo, setMsgRespondendo] = useState<CrmMensagem | null>(null);

  // Link Preview State
  const [linkPreview, setLinkPreview] = useState<LinkPreviewData | null>(null);
  const linkPreviewCache = useRef<Record<string, LinkPreviewData>>({});

  // Modals
  const [modalProdutoAberto, setModalProdutoAberto] = useState(false);
  const [produtoModal, setProdutoModal] = useState<CrmProdutoCatalogo | null>(null);
  const [mpCusto, setMpCusto] = useState("0");
  const [mpMargem, setMpMargem] = useState("25");
  const [mpPreco, setMpPreco] = useState("0");
  const [mpObs, setMpObs] = useState("");
  const [mpOrigem, setMpOrigem] = useState<"margem" | "preco">("margem");

  const [modalFotoAberto, setModalFotoAberto] = useState(false);
  const [fotoUrl, setFotoUrl] = useState("");
  const [fotoLegenda, setFotoLegenda] = useState("");

  const [modalDocAberto, setModalDocAberto] = useState(false);
  const [docUpload, setDocUpload] = useState<DocUploadState | null>(null);
  const [docLegenda, setDocLegenda] = useState("");

  const [modalNovaConversa, setModalNovaConversa] = useState(false);
  const [novoNumero, setNovoNumero] = useState("");
  const [novoNome, setNovoNome] = useState("");
  const [novaMsgInicial, setNovaMsgInicial] = useState("");

  // Web Fotos (Google / Bing transparent PNG)
  const [buscaFotosWeb, setBuscaFotosWeb] = useState("");
  const [fotosWeb, setFotosWeb] = useState<Array<{ url: string; w: number; h: number; nome: string }>>([]);
  const [fotosWebCarregando, setFotosWebCarregando] = useState(false);
  const [fotoDragSobre, setFotoDragSobre] = useState(false);

  // Disparo em Massa State
  const [disparoTexto, setDisparoTexto] = useState(
    "Olá {nome}! Tudo bem? Passando para te avisar das novidades e ofertas especiais no PIX aqui no Balão da Informática Castelo Campinas!\n{promocao}\n\nPara garantir é só me chamar aqui! 🎈\n{whatsapp}"
  );
  const [disparoIntervalo, setDisparoIntervalo] = useState(25);
  const [disparoIntervaloMax, setDisparoIntervaloMax] = useState(60);
  const [disparoLimiteDiario, setDisparoLimiteDiario] = useState(120);
  const [disparoAtivo, setDisparoAtivo] = useState(false);
  const [disparoRecent, setDisparoRecent] = useState<Array<{ id: string; nome: string; ts: number; pulado?: boolean; texto?: string }>>([]);
  const [promocoes, setPromocoes] = useState<CrmPromocao[]>([
    {
      id: 1,
      titulo: "PC Gamer Ryzen 5 + RTX 4060 10% OFF no Pix",
      texto: "PC Gamer montado com garantia oficial Balão de R$ 4.890 por R$ 4.390 à vista no Pix!",
      ativo: true,
    },
    {
      id: 2,
      titulo: "Limpeza Preventiva + Troca de Pasta Térmica",
      texto: "Revisão completa de bancada com pasta térmica de alta condutividade por apenas R$ 120,00.",
      ativo: true,
    },
  ]);

  // Persistence
  useEffect(() => {
    if (typeof window !== "undefined") {
      const cleanChats = chats.filter(
        (c) => c.id !== "status@broadcast" && !String(c.id).includes("broadcast")
      );
      localStorage.setItem("balao_crm_chats", JSON.stringify(cleanChats));
      localStorage.setItem("balao_crm_mensagens_store", JSON.stringify(mensagens));
      localStorage.setItem("balao_crm_kanban_colunas", JSON.stringify(kanbanColunas));
      localStorage.setItem("balao_crm_respostas", JSON.stringify(respostas));
      localStorage.setItem("balao_crm_etiquetas", JSON.stringify(etiquetas));
      localStorage.setItem("balao_crm_vendedores", JSON.stringify(vendedores));
      if (vendedorAtivoId) {
        localStorage.setItem("balao_crm_vendedor_ativo", String(vendedorAtivoId));
      }
    }
  }, [chats, mensagens, kanbanColunas, respostas, etiquetas, vendedores, vendedorAtivoId]);

  // Load Real Catalog
  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const list: CrmProdutoCatalogo[] = data.slice(0, 60).map((p: any, idx: number) => {
            const precoNum =
              typeof p.price === "number"
                ? p.price
                : parseFloat(String(p.price).replace(/[^0-9.]/g, "")) || 499;
            const custoNum = Math.round(precoNum * 0.76);
            const fornecedores = ["Balão", "TechSupri", "Robson", "Markin"];
            const fornecedor = fornecedores[idx % fornecedores.length];
            return {
              id: String(p.id),
              nome: p.name,
              preco: precoNum,
              custo: custoNum,
              margem: 28,
              fornecedor,
              precoFormatado:
                typeof p.price === "number"
                  ? `R$ ${p.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                  : String(p.price || "R$ 499,00"),
              categoria: p.category || "Informática",
              imagem:
                p.image ||
                "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500&auto=format&fit=crop&q=80",
              specs: Array.isArray(p.specs) ? p.specs : Object.values(p.specs || {}).map(String),
            };
          });
          setProdutosCatalogo(list);
        }
      })
      .catch(() => {});
  }, []);

  // Poll Real WhatsApp Status only when disconnected
  useEffect(() => {
    if (estado === "ready" || estado === "authenticated") return;
    let ativo = true;

    const checkStatus = async () => {
      if (!ativo) return;
      try {
        const res = await fetch("/api/crm/status", { cache: "no-store" });
        if (res.ok && ativo) {
          const data = await res.json();
          if (data.connected || data.status === "ready" || data.estado === "ready") {
            setEstado("ready");
            if (data.phoneNumber) setNumeroConectado(data.phoneNumber);
            return;
          }
          if (data.status || data.estado) {
            setEstado(data.status || data.estado);
          }
          if (data.qrCode || data.qr) {
            setQrCodeData(data.qrCode || data.qr);
          }
          if (data.rawQr) {
            setRawQrString(data.rawQr);
          }
          if (data.phoneNumber) {
            setNumeroConectado(data.phoneNumber);
          }
        }
      } catch {}
    };

    checkStatus();
    const interval = setInterval(checkStatus, 2000);
    return () => {
      ativo = false;
      clearInterval(interval);
    };
  }, [estado]);

  // Socket.IO Integration
  useEffect(() => {
    const socket = io(serverUrl, {
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnectionAttempts: 25,
      reconnectionDelay: 1500,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("panel:bootstrap");
    });

    socket.on("whatsapp:state", (payload: any) => {
      if (payload?.connected || payload?.status === "ready") {
        setEstado("ready");
        if (payload?.phoneNumber) setNumeroConectado(payload.phoneNumber);
      } else if (payload?.status) {
        setEstado(payload.status);
      }
      if (payload?.qrCode) setQrCodeData(payload.qrCode);
      if (payload?.rawQr) setRawQrString(payload.rawQr);
      if (payload?.phoneNumber) setNumeroConectado(payload.phoneNumber);
    });

    socket.on("whatsapp:status-feed", (feed: any[]) => {
      if (Array.isArray(feed)) {
        setStatusFeed(feed);
      }
    });

    socket.on("whatsapp:chats", (serverChats: any[]) => {
      if (Array.isArray(serverChats) && serverChats.length > 0) {
        setChats((prev) => {
          const merged = [...prev];
          serverChats
            .filter(
              (sc) =>
                sc.chatId &&
                sc.chatId !== "status@broadcast" &&
                !String(sc.chatId).includes("broadcast")
            )
            .forEach((sc) => {
              const idx = merged.findIndex((c) => c.id === sc.chatId);
              const chatObj: CrmChat = {
                id: sc.chatId,
                nome: sc.contactName || sc.realNumber || sc.chatId.replace(/@c\.us$/, ""),
                numero: sc.realNumber || sc.displayNumber || sc.chatId.replace(/@c\.us$/, ""),
                pic: sc.profilePicUrl || null,
                unread: sc.unreadCount || 0,
                lastMessage: sc.lastMessageBody || "",
                timestamp: sc.lastMessageTimestamp || Date.now(),
                tags: [],
                vendedorId: sc.assignedSellerId || null,
                kanbanColId: "novos",
                fixado: sc.isPinned || false,
              };
              if (idx >= 0) {
                merged[idx] = { ...merged[idx], ...chatObj };
              } else {
                merged.push(chatObj);
              }
            });
          return merged
            .filter((c) => c.id !== "status@broadcast" && !String(c.id).includes("broadcast"))
            .sort((a, b) => b.timestamp - a.timestamp);
        });
      }
    });

    socket.on("whatsapp:messages", (serverMsgs: any[]) => {
      if (Array.isArray(serverMsgs) && serverMsgs.length > 0) {
        setMensagens((prev) => {
          const map = new Map<string, CrmMensagem>();
          prev.forEach((m) => map.set(m.id, m));
          serverMsgs
            .filter(
              (sm) =>
                sm.chatId !== "status@broadcast" && !String(sm.chatId).includes("broadcast")
            )
            .forEach((sm) => {
              map.set(sm.id, {
                id: sm.id,
                chatId: sm.chatId,
                from: sm.from,
                to: sm.to,
                body: sm.body || "",
                direction: sm.direction || "in",
                timestamp: sm.timestamp || Date.now(),
                hasMedia: sm.hasMedia,
                mediaType: sm.mediaType,
                status: "read",
              });
            });
          return Array.from(map.values()).sort((a, b) => a.timestamp - b.timestamp);
        });
      }
    });

    socket.on("whatsapp:message", (newMsg: any) => {
      if (!newMsg || !newMsg.chatId) return;

      // Status broadcast updates must NOT be created as chats
      if (
        newMsg.chatId === "status@broadcast" ||
        String(newMsg.chatId).includes("broadcast") ||
        newMsg.from === "status@broadcast"
      ) {
        if (socketRef.current?.connected) {
          socketRef.current.emit("panel:sync-conversations");
        }
        return;
      }

      // LGPD Opt-out check
      const body = String(newMsg.body || "").trim().toUpperCase();
      if (/^(SAIR|PARAR|CANCELAR|DESCADASTRAR|STOP|DESCADASTRO)$/.test(body)) {
        setChats((prev) =>
          prev.map((c) => (c.id === newMsg.chatId ? { ...c, optOut: true } : c))
        );
        showToast("Cliente optou por sair do disparo (LGPD).");
      }

      const m: CrmMensagem = {
        id: newMsg.id || `msg-${Date.now()}`,
        chatId: newMsg.chatId,
        from: newMsg.from || newMsg.chatId,
        body: newMsg.body || "",
        direction: newMsg.direction || "in",
        timestamp: newMsg.timestamp || Date.now(),
        hasMedia: newMsg.hasMedia,
        mediaType: newMsg.mediaType,
        status: "read",
      };

      setMensagens((prev) => [...prev.filter((x) => x.id !== m.id), m]);

      setChats((prev) => {
        const idx = prev.findIndex((c) => c.id === newMsg.chatId);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = {
            ...copy[idx],
            lastMessage: newMsg.body || "",
            timestamp: newMsg.timestamp || Date.now(),
            unread: newMsg.direction === "in" ? copy[idx].unread + 1 : copy[idx].unread,
            precisaAtencao: newMsg.direction === "in" ? true : copy[idx].precisaAtencao,
          };
          return copy.sort((a, b) => b.timestamp - a.timestamp);
        } else {
          const novo: CrmChat = {
            id: newMsg.chatId,
            nome: newMsg.contactName || newMsg.realNumber || newMsg.chatId.replace(/@c\.us$/, ""),
            numero: newMsg.realNumber || newMsg.chatId.replace(/@c\.us$/, ""),
            unread: 1,
            lastMessage: newMsg.body || "",
            timestamp: Date.now(),
            tags: [],
            kanbanColId: "novos",
            precisaAtencao: true,
          };
          return [novo, ...prev];
        }
      });
    });

    socket.on("whatsapp:toast", (payload: any) => {
      if (payload?.message) showToast(payload.message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [serverUrl]);

  // Live URL link preview on typing
  useEffect(() => {
    const urlMatch = campoTexto.match(/https?:\/\/[^\s]+/i);
    if (!urlMatch) {
      setLinkPreview(null);
      return;
    }

    const url = urlMatch[0];
    if (linkPreviewCache.current[url]) {
      setLinkPreview(linkPreviewCache.current[url]);
      return;
    }

    const timer = setTimeout(() => {
      fetch(`/api/crm/preview-link?url=${encodeURIComponent(url)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.ok && data.preview) {
            linkPreviewCache.current[url] = data.preview;
            setLinkPreview(data.preview);
          }
        })
        .catch(() => {});
    }, 300);

    return () => clearTimeout(timer);
  }, [campoTexto]);

  // Google / Bing Web Photos Search
  const pesquisarFotosWeb = (query: string) => {
    setBuscaFotosWeb(query);
    if (!query.trim()) {
      setFotosWeb([]);
      return;
    }
    setFotosWebCarregando(true);
    fetch(`/api/crm/fotos-web?busca=${encodeURIComponent(query.trim())}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.ok && Array.isArray(data.fotos)) {
          setFotosWeb(data.fotos);
        }
      })
      .finally(() => setFotosWebCarregando(false));
  };

  // QR countdown
  useEffect(() => {
    if (estado !== "qr" && estado !== "initializing") return;
    const t = setInterval(() => {
      setQrCountdown((prev) => (prev <= 1 ? 25 : prev - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [estado]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens, chatSelecionadoId]);

  // Close context menu on global click
  useEffect(() => {
    const handler = () => setCtxVisible(false);
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((cur) => (cur === msg ? null : cur));
    }, 2800);
  };

  const relogar = () => {
    if (confirm("Desconectar o WhatsApp atual e gerar um novo QR Code para parear?")) {
      if (socketRef.current?.connected) {
        socketRef.current.emit("panel:reset-session");
      }
      setEstado("initializing");
      setQrCodeData(null);
      setRawQrString(null);
      showToast("Reiniciando sessão do WhatsApp...");
    }
  };

  const sair = () => {
    if (confirm("Encerrar sessão do painel CRM?")) {
      window.location.href = "/";
    }
  };

  const chatSelecionado = useMemo(() => {
    return chats.find((c) => c.id === chatSelecionadoId) || null;
  }, [chats, chatSelecionadoId]);

  const mensagensChatAtual = useMemo(() => {
    if (!chatSelecionadoId) return [];
    return mensagens.filter((m) => m.chatId === chatSelecionadoId);
  }, [mensagens, chatSelecionadoId]);

  const chatsFiltrados = useMemo(() => {
    let list = chats
      .filter(
        (c) =>
          c.id &&
          c.id !== "status@broadcast" &&
          !String(c.id).includes("broadcast") &&
          c.id !== "status"
      )
      .filter((c) => {
        const b = buscaChat.trim().toLowerCase();
        if (!b) return true;
        return (
          (c.nome + " " + c.numero).toLowerCase().includes(b) ||
          formatarNumeroExibicao(c.numero).includes(b)
        );
      });

    if (filtroNaoLidas) {
      list = list.filter((c) => c.unread > 0);
    }
    return list;
  }, [chats, buscaChat, filtroNaoLidas]);

  const vendedorAtivo = useMemo(() => {
    if (!vendedores.length) return null;
    return vendedores.find((v) => String(v.id) === String(vendedorAtivoId)) || vendedores[0];
  }, [vendedores, vendedorAtivoId]);

  // Open Context Menu
  const openContextMenu = (
    e: React.MouseEvent,
    title: string,
    items: CtxMenuItem[]
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const x = Math.min(e.clientX, window.innerWidth - 240);
    const y = Math.min(e.clientY, window.innerHeight - 280);
    setCtxPos({ x, y });
    setCtxStack([{ title, items }]);
    setCtxVisible(true);
  };

  const ctxPush = (title: string, items: CtxMenuItem[]) => {
    setCtxStack((prev) => [...prev, { title, items }]);
  };

  const ctxPop = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCtxStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  };

  // Build Context Menu for Chat
  const getChatMenuItems = (chat: CrmChat): CtxMenuItem[] => {
    return [
      {
        label: "🏷️ Etiquetas",
        children: () =>
          etiquetas.map((et) => {
            const hasTag = chat.tags.includes(et.nome);
            return {
              label: et.nome,
              icon: `● ${et.nome}`,
              check: hasTag,
              onClick: () => toggleEtiquetaNoChat(et.nome, chat.id),
            };
          }),
      },
      {
        label: "👤 Transferir para atendente",
        children: () =>
          vendedores.map((v) => ({
            label: v.nome,
            icon: "👤",
            onClick: () => {
              setChats((prev) =>
                prev.map((c) =>
                  c.id === chat.id
                    ? {
                        ...c,
                        vendedorId: v.id,
                        precisaAtencao: true,
                        transferidoPor: vendedorAtivo?.nome || "Atendente",
                        transferidoEm: Date.now(),
                      }
                    : c
                )
              );
              showToast(`Cliente transferido para ${v.nome}`);
            },
          })),
      },
      {
        label: "🗂️ Mover no Kanban",
        children: () => [
          ...kanbanColunas.map((col) => ({
            label: col.nome,
            icon: "●",
            check: chat.kanbanColId === col.id,
            onClick: () => {
              setChats((prev) =>
                prev.map((c) => (c.id === chat.id ? { ...c, kanbanColId: col.id } : c))
              );
              showToast(`Movido para ${col.nome}`);
            },
          })),
          { sep: true },
          {
            label: "Remover do Kanban",
            icon: "🗑️",
            danger: true,
            onClick: () => {
              setChats((prev) =>
                prev.map((c) => (c.id === chat.id ? { ...c, kanbanColId: null } : c))
              );
              showToast("Removido do Kanban");
            },
          },
        ],
      },
      { sep: true },
      {
        label: chat.fixado ? "📌 Desafixar do topo" : "📌 Fixar no topo",
        onClick: () => {
          setChats((prev) =>
            prev.map((c) => (c.id === chat.id ? { ...c, fixado: !c.fixado } : c))
          );
          showToast(chat.fixado ? "Conversa desafixada" : "Conversa fixada 📌");
        },
      },
      {
        label: chat.bloqueado ? "🔓 Desbloquear contato" : "🔒 Bloquear contato",
        danger: !chat.bloqueado,
        onClick: () => {
          setChats((prev) =>
            prev.map((c) => (c.id === chat.id ? { ...c, bloqueado: !c.bloqueado } : c))
          );
          showToast(chat.bloqueado ? "Contato desbloqueado" : "Contato bloqueado 🔒");
        },
      },
      {
        label: "🗑️ Apagar conversa",
        danger: true,
        onClick: () => {
          if (confirm(`Apagar conversa com ${chat.nome}?`)) {
            setChats((prev) => prev.filter((c) => c.id !== chat.id));
            setMensagens((prev) => prev.filter((m) => m.chatId !== chat.id));
            if (chatSelecionadoId === chat.id) setChatSelecionadoId(null);
            showToast("Conversa apagada");
          }
        },
      },
    ];
  };

  // Build Context Menu for Message
  const getMessageMenuItems = (msg: CrmMensagem): CtxMenuItem[] => {
    return [
      {
        label: "↩️ Responder",
        icon: "↩️",
        onClick: () => {
          setMsgRespondendo(msg);
          campoTextoRef.current?.focus();
        },
      },
      {
        label: "📋 Copiar texto",
        icon: "📋",
        onClick: () => {
          navigator.clipboard.writeText(msg.body);
          showToast("Texto copiado!");
        },
      },
      {
        label: "🔁 Encaminhar",
        icon: "🔁",
        onClick: () => {
          setCampoTexto(msg.body);
          campoTextoRef.current?.focus();
        },
      },
      { sep: true },
      {
        label: "🗑️ Apagar mensagem",
        icon: "🗑️",
        danger: true,
        onClick: () => {
          setMensagens((prev) => prev.filter((m) => m.id !== msg.id));
          if (socketRef.current?.connected) {
            socketRef.current.emit("panel:chat-action", {
              chatId: msg.chatId,
              action: "delete-message",
              payload: { msgId: msg.id },
            });
          }
          showToast("Mensagem apagada");
        },
      },
    ];
  };

  // Send message
  const enviarMensagem = () => {
    if (!campoTexto.trim() || !chatSelecionado) return;

    let textoFinal = campoTexto.trim();
    if (assinaturaAuto && vendedorAtivo?.assinatura) {
      textoFinal += `\n\n${vendedorAtivo.assinatura}`;
    }

    const novaMsg: CrmMensagem = {
      id: `msg-out-${Date.now()}`,
      chatId: chatSelecionado.id,
      from: "balao",
      body: textoFinal,
      direction: "out",
      timestamp: Date.now(),
      replyTo: msgRespondendo
        ? {
            id: msgRespondendo.id,
            body: msgRespondendo.body.slice(0, 80),
            author: msgRespondendo.direction === "out" ? "Você" : chatSelecionado.nome,
          }
        : null,
      status: "sent",
    };

    setMensagens((prev) => [...prev, novaMsg]);
    setChats((prev) =>
      prev.map((c) =>
        c.id === chatSelecionado.id
          ? {
              ...c,
              lastMessage: textoFinal,
              timestamp: Date.now(),
              unread: 0,
              precisaAtencao: false,
            }
          : c
      )
    );

    if (socketRef.current?.connected) {
      socketRef.current.emit("panel:send-message", {
        number: chatSelecionado.numero,
        text: textoFinal,
        chatId: chatSelecionado.id,
        replyTo: msgRespondendo?.id || undefined,
      });
    }

    setCampoTexto("");
    setMsgRespondendo(null);
    setLinkPreview(null);
    showToast("Mensagem enviada ✓");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      enviarMensagem();
    }
  };

  // Quick reply
  const inserirRespostaRapida = (resp: CrmRespostaRapida) => {
    let t = resp.texto;
    if (chatSelecionado) {
      const primeiroNome = chatSelecionado.nome.split(" ")[0];
      t = t.replace(/{nome}/g, chatSelecionado.nome).replace(/{primeiro_nome}/g, primeiroNome);
    }
    setCampoTexto((prev) => (prev ? `${prev}\n${t}` : t));
    showToast(`Resposta "${resp.titulo}" inserida`);
  };

  // Product Modal Sync
  const abrirModalProduto = (p: CrmProdutoCatalogo) => {
    setProdutoModal(p);
    const custo = p.custo || Math.round(p.preco * 0.76);
    const margem = p.margem || 28;
    setMpCusto(String(custo));
    setMpMargem(String(margem));
    setMpPreco(String(Math.round(custo * (1 + margem / 100))));
    setMpObs("");
    setMpOrigem("margem");
    setModalProdutoAberto(true);
  };

  const sincronizarPreco = (cStr: string, mStr: string) => {
    const c = parseFloat(cStr) || 0;
    const m = parseFloat(mStr) || 0;
    if (c > 0) {
      setMpPreco(String(Math.round(c * (1 + m / 100))));
    }
  };

  const sincronizarMargem = (cStr: string, pStr: string) => {
    const c = parseFloat(cStr) || 0;
    const p = parseFloat(pStr) || 0;
    if (c > 0 && p > 0) {
      setMpMargem(String(Math.round(((p - c) / c) * 100)));
    }
  };

  const confirmarEnvioProduto = () => {
    if (!produtoModal || !chatSelecionado) return;
    const precoNum = Number(mpPreco) || produtoModal.preco;
    const txt = `📦 *${produtoModal.nome}*\n\n💵 *Preço Especial Balão:* R$ ${precoNum.toLocaleString(
      "pt-BR",
      { minimumFractionDigits: 2 }
    )}\n📍 Pronta entrega na loja do Castelo Campinas!\n${
      produtoModal.specs?.length ? `• ${produtoModal.specs.join("\n• ")}\n` : ""
    }${mpObs.trim() ? `\nObs: ${mpObs.trim()}\n` : ""}\nQuer que separe para você retirar hoje ou prefere entrega?`;

    // Add to customer's sent products history
    setChats((prev) =>
      prev.map((c) =>
        c.id === chatSelecionado.id
          ? {
              ...c,
              produtosEnviados: [
                {
                  id: produtoModal.id,
                  nome: produtoModal.nome,
                  preco: precoNum,
                  timestamp: Date.now(),
                },
                ...(c.produtosEnviados || []),
              ],
            }
          : c
      )
    );

    setCampoTexto(txt);
    setModalProdutoAberto(false);
    showToast("Oferta de produto pronta no campo de texto!");
  };

  // Toggle Fixar
  const alternarFixar = () => {
    if (!chatSelecionado) return;
    const novoStatus = !chatSelecionado.fixado;
    setChats((prev) =>
      prev.map((c) => (c.id === chatSelecionado.id ? { ...c, fixado: novoStatus } : c))
    );
    showToast(novoStatus ? "Conversa fixada 📌" : "Conversa desafixada");
  };

  // Tag click
  const toggleEtiquetaNoChat = (nomeEtiqueta: string, chatIdOverride?: string) => {
    const targetId = chatIdOverride || chatSelecionadoId;
    if (!targetId) return;

    setChats((prev) =>
      prev.map((c) => {
        if (c.id !== targetId) return c;
        const jaTem = c.tags.includes(nomeEtiqueta);
        const novasTags = jaTem
          ? c.tags.filter((t) => t !== nomeEtiqueta)
          : [...c.tags, nomeEtiqueta];
        return { ...c, tags: novasTags };
      })
    );
  };

  // Create new conversation
  const criarNovaConversa = (e: React.FormEvent) => {
    e.preventDefault();
    const digits = novoNumero.replace(/\D/g, "");
    if (!digits) return;
    const fullDigits = digits.startsWith("55") ? digits : `55${digits}`;
    const chatId = `${fullDigits}@c.us`;

    const chatExistente = chats.find((c) => c.id === chatId);
    if (!chatExistente) {
      const novo: CrmChat = {
        id: chatId,
        nome: novoNome.trim() || `+${fullDigits}`,
        numero: `+${fullDigits}`,
        unread: 0,
        lastMessage: novaMsgInicial.trim() || "Nova conversa iniciada.",
        timestamp: Date.now(),
        tags: [],
        kanbanColId: "novos",
        vendedorId: vendedorAtivoId,
      };
      setChats((prev) => [novo, ...prev]);
    }

    setChatSelecionadoId(chatId);
    if (novaMsgInicial.trim()) {
      const m: CrmMensagem = {
        id: `msg-${Date.now()}`,
        chatId,
        from: "balao",
        body: novaMsgInicial.trim(),
        direction: "out",
        timestamp: Date.now(),
        status: "sent",
      };
      setMensagens((prev) => [...prev, m]);
      if (socketRef.current?.connected) {
        socketRef.current.emit("panel:send-message", {
          number: fullDigits,
          text: novaMsgInicial.trim(),
          chatId,
        });
      }
    }

    setNovoNumero("");
    setNovoNome("");
    setNovaMsgInicial("");
    setModalNovaConversa(false);
    showToast("Conversa aberta!");
  };

  // Responder ao Status
  const responderAoStatus = () => {
    if (!statusSelecionadoFeed || !statusComentario.trim()) return;
    const statusItem = statusSelecionadoFeed.items[statusItemIndex] || statusSelecionadoFeed.items[0];
    const contactNumber = statusSelecionadoFeed.contactNumber || statusSelecionadoFeed.id.replace(/@.*$/, "");
    const chatId = statusSelecionadoFeed.contactId || `${contactNumber}@c.us`;

    if (socketRef.current?.connected) {
      socketRef.current.emit("panel:reply-status", {
        contactNumber,
        chatId,
        statusSnippet: statusItem?.body || "Foto/Mídia do Status",
        text: statusComentario.trim(),
      });
    }

    // Also register message in chat store
    const novaMsg: CrmMensagem = {
      id: `msg-status-${Date.now()}`,
      chatId,
      from: "balao",
      body: `💬 *Respondendo ao seu Status do WhatsApp:*\n> "${(statusItem?.body || "Mídia").slice(0, 80)}"\n\n${statusComentario.trim()}`,
      direction: "out",
      timestamp: Date.now(),
      status: "sent",
    };
    setMensagens((prev) => [...prev, novaMsg]);

    setStatusComentario("");
    showToast(`Comentário enviado para ${statusSelecionadoFeed.contactName}! 🚀`);
  };

  // Publicar Novo Status
  const publicarNovoStatus = () => {
    if (!novoStatusTexto.trim()) return;
    if (socketRef.current?.connected) {
      socketRef.current.emit("panel:post-status", {
        text: novoStatusTexto.trim(),
        backgroundColor: novoStatusCor,
      });
    }
    setNovoStatusTexto("");
    setModalNovoStatusAberto(false);
    showToast("Status publicado com sucesso no WhatsApp! 🟢");
  };

  // Drag and Drop Kanban
  const kanbanDrop = (colunaId: string) => {
    if (!kanbanArrastadoId) return;
    setChats((prev) =>
      prev.map((c) => (c.id === kanbanArrastadoId ? { ...c, kanbanColId: colunaId } : c))
    );
    setKanbanArrastadoId(null);
    showToast("Card movido no Kanban ✅");
  };

  const formatHora = (ts: number) => {
    const d = new Date(ts);
    const hoje = new Date();
    if (d.toDateString() === hoje.toDateString()) {
      return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    }
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
  };

  const getCorEtiqueta = (nome: string) => {
    return etiquetas.find((e) => e.nome.toLowerCase() === nome.toLowerCase())?.cor || "#5f6368";
  };

  const isConnected = estado === "ready" || estado === "authenticated";
  const temQrReal = Boolean(
    (qrCodeData && qrCodeData.startsWith("data:image")) ||
    (rawQrString && rawQrString.length > 20)
  );

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#f0f2f5] text-[#202124] font-['Segoe_UI',Tahoma,Arial,sans-serif]">
      {/* HEADER TOPBAR */}
      <header className="bg-[#0f9d58] text-white px-4 py-2.5 shadow-sm z-20 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold flex items-center gap-1.5">
            🎈 <b>Balão da Informática</b> <small className="font-normal opacity-85 text-xs">CRM WhatsApp</small>
          </span>
        </div>

        {/* Vendedor Selector & Status / Stories Feed Button */}
        <div className="flex items-center gap-2.5 flex-1 justify-center max-w-2xl">
          <label htmlFor="vendedorSel" className="text-xs font-semibold whitespace-nowrap">
            👤 Atendendo:
          </label>
          {vendedores.length > 0 ? (
            <select
              id="vendedorSel"
              value={vendedorAtivoId || vendedores[0]?.id || ""}
              onChange={(e) => {
                const id = e.target.value;
                setVendedorAtivoId(id);
                showToast(`Agora atendendo como: ${vendedores.find((v) => String(v.id) === id)?.nome}`);
              }}
              className="bg-white text-[#202124] border-none rounded-full px-3 py-1 text-xs font-semibold outline-none shadow-sm max-w-[170px]"
            >
              {vendedores.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.nome}
                </option>
              ))}
            </select>
          ) : (
            <button
              onClick={() => setAbaAtual("vendedores")}
              className="bg-white/90 hover:bg-white text-[#0a6e3d] rounded-full px-3 py-1 text-xs font-bold transition-all shadow-sm"
            >
              ＋ Cadastrar Vendedor
            </button>
          )}

          <label className="inline-flex items-center gap-1.5 text-xs font-semibold cursor-pointer select-none">
            <input
              type="checkbox"
              checked={assinaturaAuto}
              onChange={(e) => setAssinaturaAuto(e.target.checked)}
              className="w-4 h-4 cursor-pointer accent-[#0a6e3d]"
            />
            <span>✍️ Assinatura</span>
          </label>

          {/* WhatsApp Statuses (Stories) Button */}
          <button
            onClick={() => {
              if (socketRef.current?.connected) {
                socketRef.current.emit("panel:sync-conversations");
              }
              setModalStatusAberto(true);
            }}
            className="bg-white/20 hover:bg-white text-white hover:text-[#0a6e3d] rounded-full px-3 py-1 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            title="Ver e responder aos Status do WhatsApp"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
            <span>🟢 Status ({statusFeed.length})</span>
          </button>
        </div>

        {/* Status Pill & Actions */}
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all shadow-sm ${
              isConnected
                ? "bg-[#c8e6c9] text-[#1b5e20]"
                : temQrReal
                ? "bg-[#ffecb3] text-[#6b4a00] animate-pulse"
                : "bg-[#ffcdd2] text-[#b71c1c]"
            }`}
          >
            {isConnected
              ? `Conectado ✓ ${numeroConectado ? `(${formatarNumeroExibicao(numeroConectado)})` : ""}`
              : temQrReal
              ? "Aguardando Leitura do QR"
              : "Iniciando WhatsApp Web…"}
          </span>

          <button
            onClick={relogar}
            title="Desconecta o WhatsApp atual e gera um novo QR Code"
            className="bg-[#e8eaed] hover:bg-[#dadce0] text-[#202124] px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-sm"
          >
            🔁 Relogar
          </button>

          <button
            onClick={sair}
            title="Encerra a sessão no painel"
            className="bg-[#e8eaed] hover:bg-[#dadce0] text-[#202124] px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-sm"
          >
            🚪 Sair
          </button>
        </div>
      </header>

      {/* SCREEN 1: QR CODE SCREEN */}
      {!isConnected && (
        <div className="flex-1 flex items-center justify-center bg-[#f0f2f5] p-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md w-full border border-[#e3e3e3]">
            <div className="text-4xl mb-2">📱</div>
            <h2 className="text-xl font-bold text-[#202124]">Conectar WhatsApp</h2>
            <p className="text-xs text-[#5f6368] mt-1 mb-4 leading-relaxed">
              Escaneie o QR Code com o WhatsApp do seu celular.<br />
              <strong>WhatsApp &gt; Aparelhos conectados &gt; Conectar um aparelho.</strong>
            </p>

            <div className="inline-flex items-center justify-center min-w-[280px] min-h-[280px] bg-white border border-[#e3e3e3] rounded-xl p-4 shadow-inner">
              {temQrReal ? (
                qrCodeData?.startsWith("data:image") ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={qrCodeData}
                    alt="QR Code WhatsApp Oficial"
                    className="w-64 h-64 object-contain rounded-md"
                  />
                ) : rawQrString ? (
                  <QRCodeSVG value={rawQrString} size={250} level="M" />
                ) : null
              ) : (
                <div className="flex flex-col items-center justify-center p-6 space-y-3">
                  <div className="w-10 h-10 border-3 border-[#0f9d58] border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-semibold text-[#5f6368]">
                    Iniciando WhatsApp Web…<br />
                    <span className="text-[11px] font-normal text-[#80868b]">
                      Aguardando o QR Code oficial ser gerado.
                    </span>
                  </p>
                </div>
              )}
            </div>

            <p className="text-xs text-[#5f6368] mt-3">
              {temQrReal
                ? `QR Code ativo. Atualizando em ${qrCountdown}s…`
                : "Conectando ao serviço do WhatsApp…"}
            </p>

            <div className="mt-5 flex gap-2 justify-center">
              <button
                onClick={() => {
                  if (socketRef.current?.connected) {
                    socketRef.current.emit("panel:reset-session");
                  }
                  fetch("/api/crm/status", { cache: "no-store" })
                    .then((r) => r.json())
                    .then((data) => {
                      if (data.qrCode || data.qr) setQrCodeData(data.qrCode || data.qr);
                      if (data.rawQr) setRawQrString(data.rawQr);
                      if (data.connected) setEstado("ready");
                    })
                    .catch(() => {});
                  showToast("Atualizando QR Code...");
                }}
                className="bg-[#0f9d58] hover:bg-[#0a6e3d] text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer"
              >
                🔄 Atualizar QR Code
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SCREEN 2: MAIN DASHBOARD & KANBAN */}
      {isConnected && (
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          {/* Main 3 Panels Row */}
          <div className="flex-1 flex overflow-hidden min-h-0">
            {/* PANE 1: CHATS LIST (NO STATUS BROADCASTS - REAL FORMATTED NUMBERS) */}
            <aside className="w-76 bg-white border-r border-[#e3e3e3] flex flex-col shrink-0">
              <div className="p-3 pb-1.5 font-bold text-sm text-[#202124] flex items-center justify-between">
                <span>Conversas ({chatsFiltrados.length})</span>
                {chats.some((c) => c.precisaAtencao) && (
                  <span className="bg-[#fff3cd] text-[#856404] text-[10px] px-2 py-0.5 rounded-full font-bold border border-[#ffeeba]">
                    ⚠️ Atenção
                  </span>
                )}
              </div>

              <div className="px-3 py-1.5 space-y-1.5">
                <input
                  type="text"
                  placeholder="Buscar nome ou número (ex: 55 19…)"
                  value={buscaChat}
                  onChange={(e) => setBuscaChat(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#e3e3e3] rounded-full text-xs outline-none focus:border-[#0f9d58]"
                />
                <button
                  onClick={() => setFiltroNaoLidas(!filtroNaoLidas)}
                  className={`w-full py-1 px-3 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                    filtroNaoLidas
                      ? "bg-[#d93025] text-white border-[#d93025]"
                      : "bg-white text-[#202124] border-[#e3e3e3] hover:bg-[#f0f2f5]"
                  }`}
                >
                  🔴 Não lidas
                </button>
              </div>

              <button
                onClick={() => setModalNovaConversa(true)}
                className="mx-3 my-1.5 bg-[#0f9d58] hover:bg-[#0a6e3d] text-white py-1.5 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                ＋ Nova conversa
              </button>

              {/* Chat list items with clean formatted numbers */}
              <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1">
                {chatsFiltrados.length === 0 ? (
                  <div className="text-center text-xs text-[#5f6368] py-8">
                    {filtroNaoLidas ? "Nenhuma conversa não lida." : "Nenhuma conversa encontrada."}
                  </div>
                ) : (
                  chatsFiltrados.map((chat) => {
                    const isAtivo = chat.id === chatSelecionadoId;
                    const ini = (chat.nome || "?").trim().charAt(0).toUpperCase();
                    const numeroFormatado = formatarNumeroExibicao(chat.numero || chat.id);

                    return (
                      <div
                        key={chat.id}
                        onClick={() => {
                          setChatSelecionadoId(chat.id);
                          setChats((prev) =>
                            prev.map((c) =>
                              c.id === chat.id ? { ...c, unread: 0, precisaAtencao: false } : c
                            )
                          );
                        }}
                        onContextMenu={(e) =>
                          openContextMenu(e, chat.nome, getChatMenuItems(chat))
                        }
                        className={`flex items-center gap-2.5 p-2 rounded-xl cursor-pointer transition-colors ${
                          isAtivo
                            ? "bg-[#e7f6ec]"
                            : chat.unread > 0
                            ? "bg-[#eef7ee] hover:bg-[#e7f6ec]"
                            : "hover:bg-[#f0f2f5]"
                        }`}
                      >
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-[#0f9d58] text-white flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden relative shadow-xs">
                          {chat.pic ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={chat.pic} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span>{ini}</span>
                          )}
                          {chat.unread > 0 && (
                            <span className="absolute -top-1 -right-1 bg-[#d93025] text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center font-bold">
                              {chat.unread}
                            </span>
                          )}
                          {chat.precisaAtencao && (
                            <span
                              title="Transferido ou aguardando resposta"
                              className="absolute -bottom-1 -right-1 bg-amber-500 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center font-bold shadow-xs"
                            >
                              ⚠️
                            </span>
                          )}
                        </div>

                        {/* Infos with Real Name & Clean Formatted Phone Number */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4
                              className={`text-xs truncate ${
                                chat.unread > 0 ? "font-bold text-[#202124]" : "font-semibold text-[#202124]"
                              }`}
                            >
                              {chat.fixado && "📌 "}
                              {chat.nome}
                            </h4>
                            <span className="text-[10px] text-[#5f6368] font-mono shrink-0 ml-1">
                              {formatHora(chat.timestamp)}
                            </span>
                          </div>

                          {/* Clean Phone Number Format: xx xx xxxxxxxxx (ex: 55 19 987510267) */}
                          <div className="text-[11px] font-mono text-[#0a6e3d] font-semibold tracking-tight">
                            {numeroFormatado}
                          </div>

                          <p
                            className={`text-[11px] truncate mt-0.5 ${
                              chat.unread > 0
                                ? "text-[#202124] font-medium"
                                : "text-[#5f6368]"
                            }`}
                          >
                            {chat.lastMessage || "Sem mensagens"}
                          </p>

                          <div className="flex flex-wrap gap-1 mt-1 items-center">
                            {chat.tags &&
                              chat.tags.map((t) => (
                                <span
                                  key={t}
                                  className="text-[9px] text-white px-1.5 py-0.2 rounded-full font-bold"
                                  style={{ backgroundColor: getCorEtiqueta(t) }}
                                >
                                  {t}
                                </span>
                              ))}
                            {chat.transferidoPor && (
                              <span className="text-[9px] bg-[#e8eaed] text-[#5f6368] px-1.5 py-0.2 rounded font-semibold">
                                Por {chat.transferidoPor}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </aside>

            {/* PANE 2: CONVERSA ATIVA */}
            <section
              onDragOver={(e) => {
                e.preventDefault();
                setFotoDragSobre(true);
              }}
              onDragLeave={() => setFotoDragSobre(false)}
              onDrop={(e) => {
                e.preventDefault();
                setFotoDragSobre(false);
                const url = e.dataTransfer.getData("text/plain");
                if (url) {
                  setFotoUrl(url);
                  setFotoLegenda("Produto Balão");
                  setModalFotoAberto(true);
                }
              }}
              className={`flex-1 flex flex-col min-w-0 bg-[#e5ddd5] relative transition-colors ${
                fotoDragSobre ? "ring-4 ring-inset ring-[#0f9d58] bg-[#d7ecd9]" : ""
              }`}
            >
              {chatSelecionado ? (
                <>
                  {/* Header */}
                  <div className="bg-white border-b border-[#e3e3e3] p-2.5 px-4 flex items-center justify-between shrink-0 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#0f9d58] text-white flex items-center justify-center font-bold text-sm shrink-0">
                        {chatSelecionado.nome.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-[#202124] flex items-center gap-2">
                          {chatSelecionado.nome}
                          <span className="text-xs font-mono text-[#0a6e3d] font-semibold bg-[#e7f6ec] px-2 py-0.5 rounded-full">
                            {formatarNumeroExibicao(chatSelecionado.numero)}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-0.5 items-center">
                          {chatSelecionado.tags.map((t) => (
                            <span
                              key={t}
                              className="text-[9px] text-white px-1.5 py-0.2 rounded-full font-bold"
                              style={{ backgroundColor: getCorEtiqueta(t) }}
                            >
                              {t}
                            </span>
                          ))}
                          {chatSelecionado.precisaAtencao && (
                            <button
                              onClick={() => {
                                setChats((prev) =>
                                  prev.map((c) =>
                                    c.id === chatSelecionado.id
                                      ? { ...c, precisaAtencao: false, vendedorId: vendedorAtivoId }
                                      : c
                                  )
                                );
                                showToast("Atendimento assumido 🟢");
                              }}
                              className="bg-amber-100 hover:bg-amber-200 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer"
                            >
                              ⚠️ Assumir Atendimento
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={alternarFixar}
                      className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                        chatSelecionado.fixado
                          ? "bg-[#e7f6ec] text-[#0a6e3d] border-[#0f9d58]"
                          : "bg-white text-[#5f6368] border-[#e3e3e3] hover:bg-[#f0f2f5]"
                      }`}
                    >
                      📌 {chatSelecionado.fixado ? "Fixado" : "Fixar"}
                    </button>
                  </div>

                  {/* Messages Feed */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-2 flex flex-col">
                    {mensagensChatAtual.length === 0 ? (
                      <div className="text-center text-xs text-[#5f6368] my-auto">
                        Inicie a conversa enviando uma mensagem abaixo.
                      </div>
                    ) : (
                      mensagensChatAtual.map((m) => {
                        const isEu = m.direction === "out";

                        return (
                          <div
                            key={m.id}
                            onContextMenu={(e) =>
                              openContextMenu(e, "Opções da Mensagem", getMessageMenuItems(m))
                            }
                            className={`max-w-[65%] p-2 px-3 rounded-xl text-xs shadow-sm break-words whitespace-pre-wrap leading-relaxed cursor-pointer ${
                              isEu
                                ? "self-end bg-[#e7f6ec] border border-[#0f9d58] rounded-tr-none text-[#202124]"
                                : "self-start bg-[#dff0fd] border border-[#a9cdf0] rounded-tl-none text-[#202124]"
                            }`}
                          >
                            {/* Quoted Message Snippet */}
                            {m.replyTo && (
                              <div className="bg-black/5 border-l-3 border-[#0f9d58] p-1.5 mb-1.5 rounded text-[11px] text-[#5f6368]">
                                <div className="font-bold text-[#0a6e3d]">{m.replyTo.author}</div>
                                <div className="line-clamp-2">{m.replyTo.body}</div>
                              </div>
                            )}

                            {/* Audio Player if Voice Note */}
                            {m.mediaType === "audio" || m.mediaType === "ptt" || m.isVoice ? (
                              <div className="py-1">
                                <audio src={m.mediaUrl || ""} controls className="w-60 h-8" />
                              </div>
                            ) : null}

                            {/* Document Download if File */}
                            {m.mediaType === "document" && (
                              <div className="flex items-center gap-2 p-2 bg-white/80 rounded-lg border border-[#e3e3e3] mb-1">
                                <span className="text-xl">📄</span>
                                <div className="flex-1 min-w-0">
                                  <div className="font-bold text-xs truncate">{m.mediaName || "Documento"}</div>
                                  <div className="text-[10px] text-[#5f6368]">{m.body}</div>
                                </div>
                                {m.mediaUrl && (
                                  <a
                                    href={m.mediaUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="bg-[#0f9d58] text-white text-[10px] font-bold px-2 py-1 rounded"
                                  >
                                    ⬇ Baixar
                                  </a>
                                )}
                              </div>
                            )}

                            <p>{m.body}</p>
                            <span className="block text-[10px] text-[#5f6368] text-right mt-1 font-mono">
                              {formatHora(m.timestamp)} {isEu && "✓✓"}
                            </span>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Area */}
                  <div className="bg-white border-t border-[#e3e3e3] p-2.5 px-3 shadow-xs">
                    {/* Quoting Banner */}
                    {msgRespondendo && (
                      <div className="bg-[#f0f2f5] border-l-4 border-[#0f9d58] p-2 rounded flex items-center justify-between mb-2 text-xs">
                        <div>
                          <b className="text-[#0a6e3d]">Respondendo a mensagem:</b>
                          <div className="text-[#5f6368] line-clamp-1">{msgRespondendo.body}</div>
                        </div>
                        <button
                          onClick={() => setMsgRespondendo(null)}
                          className="text-[#5f6368] hover:text-red-500 font-bold px-2"
                        >
                          ✕
                        </button>
                      </div>
                    )}

                    {/* Live Link Preview Banner */}
                    {linkPreview && (
                      <div className="flex items-center gap-2.5 p-2 bg-[#f9fafb] border border-[#e3e3e3] rounded-xl mb-2 text-xs">
                        {linkPreview.imgPath ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={linkPreview.imgPath}
                            alt=""
                            className="w-12 h-12 object-contain rounded bg-white"
                          />
                        ) : (
                          <span className="text-xl">🛒</span>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-xs truncate text-[#202124]">{linkPreview.nome}</div>
                          {linkPreview.preco > 0 && (
                            <div className="text-[#0a6e3d] font-bold text-xs">
                              R$ {linkPreview.preco.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => setLinkPreview(null)}
                          className="text-[#5f6368] hover:text-red-500 font-bold px-1"
                        >
                          ✕
                        </button>
                      </div>
                    )}

                    {/* Respostas Rápidas Chips Bar */}
                    {mostrarRapidasBar && (
                      <div className="flex flex-wrap gap-1.5 pb-2.5 max-h-32 overflow-y-auto border-b border-[#e3e3e3] mb-2">
                        {respostas.map((r) => (
                          <button
                            key={r.id}
                            onClick={() => inserirRespostaRapida(r)}
                            className="bg-[#e7f6ec] hover:bg-[#0f9d58] text-[#0a6e3d] hover:text-white border border-[#0f9d58] rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            ⚡ {r.titulo}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Input Row */}
                    <div className="flex items-end gap-2">
                      <button
                        onClick={() => setMostrarRapidasBar(!mostrarRapidasBar)}
                        title="Respostas rápidas (mostrar/ocultar)"
                        className="bg-[#e7f6ec] text-[#0a6e3d] border border-[#0f9d58] rounded-lg p-2 text-sm font-bold hover:bg-[#0f9d58] hover:text-white transition-colors cursor-pointer"
                      >
                        ⚡
                      </button>

                      <button
                        onClick={() => setAbaAtual("catalogo")}
                        title="Enviar produto do catálogo"
                        className="bg-[#e7f6ec] text-[#0a6e3d] border border-[#0f9d58] rounded-lg p-2 text-sm font-bold hover:bg-[#0f9d58] hover:text-white transition-colors cursor-pointer"
                      >
                        📦
                      </button>

                      <button
                        onClick={() => {
                          setFotoUrl("https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600");
                          setModalFotoAberto(true);
                        }}
                        title="Enviar foto"
                        className="bg-[#e7f6ec] text-[#0a6e3d] border border-[#0f9d58] rounded-lg p-2 text-sm font-bold hover:bg-[#0f9d58] hover:text-white transition-colors cursor-pointer"
                      >
                        📷
                      </button>

                      <label
                        title="Enviar documento (PDF, DOC, XLS, ZIP)"
                        className="bg-[#e7f6ec] text-[#0a6e3d] border border-[#0f9d58] rounded-lg p-2 text-sm font-bold hover:bg-[#0f9d58] hover:text-white transition-colors cursor-pointer"
                      >
                        📄
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) {
                              setDocUpload({
                                file: f,
                                nome: f.name,
                                mime: f.type || "application/octet-stream",
                                tamanhoFormatado: `${Math.round(f.size / 1024)} KB`,
                              });
                              setDocLegenda("");
                              setModalDocAberto(true);
                            }
                          }}
                        />
                      </label>

                      <textarea
                        ref={campoTextoRef}
                        rows={1}
                        placeholder="Digite sua mensagem… (Enter envia, Shift+Enter quebra linha)"
                        value={campoTexto}
                        onChange={(e) => setCampoTexto(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-1 resize-none border border-[#e3e3e3] rounded-2xl px-3 py-2 text-xs outline-none focus:border-[#0f9d58] max-h-28"
                      />

                      <button
                        onClick={enviarMensagem}
                        className="bg-[#0f9d58] hover:bg-[#0a6e3d] text-white rounded-full w-9 h-9 flex items-center justify-center text-sm font-bold shadow-sm transition-colors cursor-pointer shrink-0"
                      >
                        ➤
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-xs text-[#5f6368]">
                  👈 Selecione uma conversa para começar o atendimento
                </div>
              )}
            </section>

            {/* PANE 3: PANE LATERAL */}
            <aside className="w-88 bg-white border-l border-[#e3e3e3] flex flex-col shrink-0">
              {/* Abas */}
              <div className="flex flex-wrap border-b border-[#e3e3e3] p-1 gap-1">
                {[
                  { id: "catalogo", label: "Catálogo" },
                  { id: "fotos", label: "Google Fotos" },
                  { id: "respostas", label: "Respostas" },
                  { id: "vendedores", label: "Vendedores" },
                  { id: "etiquetas", label: "Etiquetas" },
                  { id: "disparo", label: "Disparo" },
                  { id: "cliente", label: "Cliente" },
                ].map((aba) => (
                  <button
                    key={aba.id}
                    onClick={() => setAbaAtual(aba.id as any)}
                    className={`flex-1 min-w-[28%] py-1.5 px-2 rounded-lg text-[11px] font-bold transition-colors cursor-pointer text-center ${
                      abaAtual === aba.id
                        ? "bg-[#e7f6ec] text-[#0a6e3d]"
                        : "text-[#5f6368] hover:bg-[#f0f2f5]"
                    }`}
                  >
                    {aba.label}
                  </button>
                ))}
              </div>

              {/* Conteúdo da Aba */}
              <div className="flex-1 overflow-y-auto p-3 text-xs space-y-3">
                {/* ABA 1: CATÁLOGO */}
                {abaAtual === "catalogo" && (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Buscar produto…"
                        value={buscaCatalogo}
                        onChange={(e) => setBuscaCatalogo(e.target.value)}
                        className="flex-1 px-3 py-1.5 border border-[#e3e3e3] rounded-full text-xs outline-none focus:border-[#0f9d58]"
                      />
                      <select
                        value={fornecedorFiltro}
                        onChange={(e) => setFornecedorFiltro(e.target.value)}
                        className="px-2 py-1.5 border border-[#e3e3e3] rounded-lg text-xs outline-none"
                      >
                        <option value="todos">Todos</option>
                        <option value="Balão">Balão</option>
                        <option value="TechSupri">TechSupri</option>
                        <option value="Robson">Robson</option>
                        <option value="Markin">Markin</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      {produtosCatalogo
                        .filter((p) => {
                          const matchBusca =
                            !buscaCatalogo ||
                            p.nome.toLowerCase().includes(buscaCatalogo.toLowerCase()) ||
                            p.categoria.toLowerCase().includes(buscaCatalogo.toLowerCase());
                          const matchFornec =
                            fornecedorFiltro === "todos" ||
                            (p.fornecedor || "Balão").toLowerCase() === fornecedorFiltro.toLowerCase();
                          return matchBusca && matchFornec;
                        })
                        .map((prod) => (
                          <div
                            key={prod.id}
                            onClick={() => abrirModalProduto(prod)}
                            className="flex items-center gap-2.5 p-2 border border-[#e3e3e3] hover:border-[#0f9d58] hover:bg-[#e7f6ec] rounded-xl cursor-pointer transition-all"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={prod.imagem}
                              alt=""
                              className="w-12 h-12 object-cover rounded-lg bg-gray-100 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <h5 className="font-semibold text-xs text-[#202124] truncate">
                                {prod.nome}
                              </h5>
                              <div className="flex items-center justify-between mt-1">
                                <span className="font-bold text-[#0a6e3d]">
                                  {prod.precoFormatado}
                                </span>
                                <span className="text-[10px] text-[#5f6368] bg-[#f0f2f5] px-1.5 py-0.5 rounded">
                                  Custo: R$ {prod.custo} ({prod.fornecedor || "Balão"})
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* ABA 2: GOOGLE FOTOS */}
                {abaAtual === "fotos" && (
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Pesquisar foto transparente na web…"
                      value={buscaFotosWeb}
                      onChange={(e) => pesquisarFotosWeb(e.target.value)}
                      className="w-full px-3 py-1.5 border border-[#e3e3e3] rounded-full text-xs outline-none focus:border-[#0f9d58]"
                    />
                    <p className="text-[11px] text-[#5f6368]">
                      🔍 Arraste a foto para a conversa ou clique para enviar com legenda.
                    </p>

                    {fotosWebCarregando ? (
                      <div className="text-center py-4 text-xs text-[#5f6368]">Pesquisando fotos web…</div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {(fotosWeb.length > 0 ? fotosWeb : produtosCatalogo.slice(0, 10)).map(
                          (foto, idx) => {
                            const url = "url" in foto ? foto.url : (foto as CrmProdutoCatalogo).imagem;
                            const title = foto.nome;
                            return (
                              <div
                                key={idx}
                                draggable
                                onDragStart={(e) => e.dataTransfer.setData("text/plain", url)}
                                onClick={() => {
                                  setFotoUrl(url);
                                  setFotoLegenda(title);
                                  setModalFotoAberto(true);
                                }}
                                className="border border-[#e3e3e3] rounded-xl p-1.5 hover:border-[#0f9d58] cursor-grab text-center bg-white shadow-sm"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={url}
                                  alt=""
                                  className="w-full h-24 object-contain rounded-lg bg-[#f7f8fa]"
                                />
                                <p className="text-[10px] font-bold text-[#202124] truncate mt-1">
                                  {title}
                                </p>
                              </div>
                            );
                          }
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* ABA 3: RESPOSTAS */}
                {abaAtual === "respostas" && (
                  <div className="space-y-3">
                    <div className="bg-[#f0f2f5] border border-[#e3e3e3] rounded-xl p-3 space-y-2">
                      <h4 className="font-bold text-xs text-[#202124]">➕ Nova Resposta Rápida</h4>
                      <input
                        type="text"
                        id="newRespTitulo"
                        placeholder="Título (ex: Horário de Domingo)"
                        className="w-full px-2.5 py-1.5 border border-[#e3e3e3] rounded-lg text-xs bg-white outline-none"
                      />
                      <textarea
                        id="newRespTexto"
                        rows={2}
                        placeholder="Texto da mensagem..."
                        className="w-full px-2.5 py-1.5 border border-[#e3e3e3] rounded-lg text-xs bg-white outline-none"
                      />
                      <button
                        onClick={() => {
                          const t = (document.getElementById("newRespTitulo") as HTMLInputElement)?.value;
                          const x = (document.getElementById("newRespTexto") as HTMLTextAreaElement)?.value;
                          if (!t || !x) return;
                          setRespostas((prev) => [{ id: Date.now(), titulo: t, texto: x }, ...prev]);
                          showToast("Resposta rápida adicionada!");
                        }}
                        className="w-full bg-[#0f9d58] text-white py-1.5 rounded-lg text-xs font-bold hover:bg-[#0a6e3d] cursor-pointer"
                      >
                        Salvar Resposta
                      </button>
                    </div>

                    <div className="space-y-2">
                      {respostas.map((r) => (
                        <div
                          key={r.id}
                          className="border border-[#e3e3e3] rounded-xl p-2.5 bg-white space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <strong className="text-xs text-[#202124]">{r.titulo}</strong>
                            <button
                              onClick={() => inserirRespostaRapida(r)}
                              className="text-[11px] font-bold text-[#0a6e3d] hover:underline cursor-pointer"
                            >
                              Inserir ➔
                            </button>
                          </div>
                          <p className="text-[11px] text-[#5f6368] whitespace-pre-wrap line-clamp-3">
                            {r.texto}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ABA 4: VENDEDORES */}
                {abaAtual === "vendedores" && (
                  <div className="space-y-3">
                    <div className="bg-[#f0f2f5] border border-[#e3e3e3] rounded-xl p-3 space-y-2">
                      <h4 className="font-bold text-xs text-[#202124]">➕ Cadastrar Vendedor Real</h4>
                      <input
                        type="text"
                        id="novoVendedorNome"
                        placeholder="Nome do vendedor (ex: João Santos)"
                        className="w-full px-2.5 py-1.5 border border-[#e3e3e3] rounded-lg text-xs bg-white outline-none"
                      />
                      <input
                        type="text"
                        id="novoVendedorCargo"
                        placeholder="Cargo / Especialidade (ex: Consultor de Hardware)"
                        className="w-full px-2.5 py-1.5 border border-[#e3e3e3] rounded-lg text-xs bg-white outline-none"
                      />
                      <textarea
                        id="novoVendedorAssinatura"
                        rows={2}
                        placeholder="Assinatura automática..."
                        className="w-full px-2.5 py-1.5 border border-[#e3e3e3] rounded-lg text-xs bg-white outline-none"
                      />
                      <button
                        onClick={() => {
                          const n = (document.getElementById("novoVendedorNome") as HTMLInputElement)?.value;
                          const c = (document.getElementById("novoVendedorCargo") as HTMLInputElement)?.value;
                          const a = (document.getElementById("novoVendedorAssinatura") as HTMLTextAreaElement)?.value;
                          if (!n || !n.trim()) {
                            showToast("Digite o nome do vendedor");
                            return;
                          }
                          const novoV: CrmVendedor = {
                            id: Date.now(),
                            nome: n.trim(),
                            cargo: c?.trim() || "Atendente Balão",
                            assinatura: a?.trim() || `Atenciosamente,\n*${n.trim()}* — Balão da Informática`,
                          };
                          setVendedores((prev) => [...prev, novoV]);
                          setVendedorAtivoId(novoV.id);
                          (document.getElementById("novoVendedorNome") as HTMLInputElement).value = "";
                          (document.getElementById("novoVendedorCargo") as HTMLInputElement).value = "";
                          (document.getElementById("novoVendedorAssinatura") as HTMLTextAreaElement).value = "";
                          showToast("Vendedor cadastrado com sucesso!");
                        }}
                        className="w-full bg-[#0f9d58] text-white py-1.5 rounded-lg text-xs font-bold hover:bg-[#0a6e3d] cursor-pointer"
                      >
                        Cadastrar Vendedor
                      </button>
                    </div>

                    <div className="space-y-2">
                      {vendedores.length === 0 ? (
                        <div className="text-center text-xs text-[#5f6368] py-4">
                          Nenhum vendedor cadastrado ainda.<br />
                          Cadastre os atendentes da sua equipe acima.
                        </div>
                      ) : (
                        vendedores.map((v) => (
                          <div
                            key={v.id}
                            className="border border-[#e3e3e3] rounded-xl p-2.5 bg-white flex items-center justify-between"
                          >
                            <div>
                              <div className="font-bold text-xs text-[#202124]">👤 {v.nome}</div>
                              <div className="text-[10px] text-[#5f6368]">{v.cargo || "Atendente Balão"}</div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => {
                                  setVendedorAtivoId(v.id);
                                  showToast(`Atendendo como ${v.nome}`);
                                }}
                                className={`px-2.5 py-1 rounded text-xs font-bold cursor-pointer ${
                                  String(v.id) === String(vendedorAtivoId)
                                    ? "bg-[#0f9d58] text-white"
                                    : "bg-[#f0f2f5] text-[#202124] hover:bg-[#e3e3e3]"
                                }`}
                              >
                                {String(v.id) === String(vendedorAtivoId) ? "Ativo ✓" : "Selecionar"}
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Remover vendedor ${v.nome}?`)) {
                                    setVendedores((prev) => prev.filter((x) => x.id !== v.id));
                                  }
                                }}
                                className="text-xs text-red-500 hover:text-red-700 p-1"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* ABA 5: ETIQUETAS */}
                {abaAtual === "etiquetas" && (
                  <div className="space-y-3">
                    <p className="text-[11px] text-[#5f6368]">
                      Clique na etiqueta para aplicar ou remover da conversa selecionada.
                    </p>
                    <div className="space-y-2">
                      {etiquetas.map((e) => {
                        const jaTem = chatSelecionado?.tags.includes(e.nome);
                        return (
                          <div
                            key={e.id}
                            onClick={() => toggleEtiquetaNoChat(e.nome)}
                            className="flex items-center justify-between p-2 rounded-xl border border-[#e3e3e3] hover:border-[#0f9d58] cursor-pointer transition-all bg-white"
                          >
                            <span
                              className="text-xs font-bold text-white px-2.5 py-0.5 rounded-full"
                              style={{ backgroundColor: e.cor }}
                            >
                              {e.nome}
                            </span>
                            <span className="text-xs font-bold text-[#5f6368]">
                              {jaTem ? "✓ Aplicada" : "+ Aplicar"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ABA 6: DISPARO EM MASSA */}
                {abaAtual === "disparo" && (
                  <div className="space-y-3">
                    <div className="bg-[#fff4e5] border border-[#ffcc80] rounded-xl p-2.5 text-[11px] text-[#e65100]">
                      ⚠️ <b>Proteção Anti-Ban & LGPD:</b> O disparo envia de forma cadenciada dentro da janela comercial e processa opt-out imediato.
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-center text-xs">
                      <div className="bg-[#f0f2f5] p-2 rounded-xl border border-[#e3e3e3]">
                        <div className="text-[10px] text-[#5f6368]">Na Fila</div>
                        <div className="text-base font-bold text-[#202124]">{chats.filter((c) => !c.optOut).length}</div>
                      </div>
                      <div className="bg-[#f0f2f5] p-2 rounded-xl border border-[#e3e3e3]">
                        <div className="text-[10px] text-[#5f6368]">Opt-Out (LGPD)</div>
                        <div className="text-base font-bold text-red-600">{chats.filter((c) => c.optOut).length}</div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#202124] mb-1">
                        Mensagem da Campanha (Variáveis: {"{nome}"}, {"{promocao}"}, {"{whatsapp}"})
                      </label>
                      <textarea
                        rows={4}
                        value={disparoTexto}
                        onChange={(e) => setDisparoTexto(e.target.value)}
                        className="w-full p-2 border border-[#e3e3e3] rounded-xl text-xs bg-white outline-none"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span>Intervalo entre envios:</span>
                        <span className="font-bold text-[#0a6e3d]">{disparoIntervalo}s a {disparoIntervaloMax}s</span>
                      </div>
                      <input
                        type="range"
                        min="15"
                        max="90"
                        value={disparoIntervalo}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          setDisparoIntervalo(v);
                          setDisparoIntervaloMax(Math.max(v * 2, 60));
                        }}
                        className="w-full accent-[#0f9d58]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="font-bold text-xs text-[#202124]">📢 Promoções Ativas no Disparo:</div>
                      {promocoes.map((p) => (
                        <div key={p.id} className="p-2 bg-white border border-[#e3e3e3] rounded-lg text-xs flex justify-between items-center">
                          <div>
                            <b>{p.titulo}</b>
                            <p className="text-[10px] text-[#5f6368] line-clamp-1">{p.texto}</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={p.ativo}
                            onChange={(e) =>
                              setPromocoes((prev) =>
                                prev.map((x) => (x.id === p.id ? { ...x, ativo: e.target.checked } : x))
                              )
                            }
                            className="accent-[#0f9d58]"
                          />
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        const elegiveis = chats.filter((c) => !c.optOut);
                        if (!elegiveis.length || !disparoTexto.trim()) return;
                        setDisparoAtivo(true);
                        const recipients = elegiveis.map((c) => ({ number: c.numero, chatId: c.id }));
                        if (socketRef.current?.connected) {
                          socketRef.current.emit("panel:send-segmented", {
                            recipients,
                            text: disparoTexto,
                          });
                        }
                        showToast(`Disparo iniciado para ${elegiveis.length} contatos!`);
                      }}
                      disabled={disparoAtivo || chats.filter((c) => !c.optOut).length === 0}
                      className="w-full bg-[#0f9d58] hover:bg-[#0a6e3d] disabled:opacity-50 text-white py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      {disparoAtivo ? "Campanha em Andamento…" : `Iniciar Disparo (${chats.filter((c) => !c.optOut).length})`}
                    </button>
                  </div>
                )}

                {/* ABA 7: DADOS DO CLIENTE */}
                {abaAtual === "cliente" && (
                  <div className="space-y-3">
                    {chatSelecionado ? (
                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] font-bold uppercase text-[#5f6368]">Nome</label>
                          <input
                            type="text"
                            value={chatSelecionado.nome}
                            onChange={(e) => {
                              const n = e.target.value;
                              setChats((prev) =>
                                prev.map((c) => (c.id === chatSelecionado.id ? { ...c, nome: n } : c))
                              );
                            }}
                            className="w-full p-2 border border-[#e3e3e3] rounded-lg text-xs bg-white"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold uppercase text-[#5f6368]">Telefone / WhatsApp</label>
                          <input
                            type="text"
                            readOnly
                            value={formatarNumeroExibicao(chatSelecionado.numero)}
                            className="w-full p-2 border border-[#e3e3e3] rounded-lg text-xs bg-[#f0f2f5] font-mono text-[#0a6e3d] font-semibold"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold uppercase text-[#5f6368]">Etapa no Funil</label>
                          <select
                            value={chatSelecionado.kanbanColId || "novos"}
                            onChange={(e) => {
                              const colId = e.target.value;
                              setChats((prev) =>
                                prev.map((c) =>
                                  c.id === chatSelecionado.id ? { ...c, kanbanColId: colId } : c
                                )
                              );
                              showToast("Etapa atualizada");
                            }}
                            className="w-full p-2 border border-[#e3e3e3] rounded-lg text-xs bg-white"
                          >
                            {kanbanColunas.map((col) => (
                              <option key={col.id} value={col.id}>
                                {col.nome}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Histórico de Produtos Enviados */}
                        {chatSelecionado.produtosEnviados && chatSelecionado.produtosEnviados.length > 0 && (
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-[#5f6368]">
                              📦 Produtos Ofertados ({chatSelecionado.produtosEnviados.length})
                            </label>
                            <div className="space-y-1 max-h-32 overflow-y-auto">
                              {chatSelecionado.produtosEnviados.map((p, idx) => (
                                <div key={idx} className="p-1.5 bg-[#f0f2f5] rounded border border-[#e3e3e3] text-[11px] flex justify-between items-center">
                                  <span className="truncate">{p.nome}</span>
                                  <b className="text-[#0a6e3d]">R$ {p.preco.toFixed(2)}</b>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <label className="text-[10px] font-bold uppercase text-[#5f6368]">Notas Internas</label>
                          <textarea
                            rows={3}
                            placeholder="Adicionar nota sobre preferência do cliente, orçamento..."
                            id="campoNotaCliente"
                            className="w-full p-2 border border-[#e3e3e3] rounded-lg text-xs bg-white resize-none"
                          />
                          <button
                            onClick={() => {
                              const el = document.getElementById("campoNotaCliente") as HTMLTextAreaElement;
                              if (!el || !el.value.trim()) return;
                              const notaObj: CrmNotaCliente = {
                                id: `n-${Date.now()}`,
                                autor: vendedorAtivo?.nome || "Atendente",
                                texto: el.value.trim(),
                                timestamp: Date.now(),
                              };
                              setChats((prev) =>
                                prev.map((c) =>
                                  c.id === chatSelecionado.id
                                    ? { ...c, notas: [notaObj, ...(c.notas || [])] }
                                    : c
                                )
                              );
                              el.value = "";
                              showToast("Nota interna registrada!");
                            }}
                            className="w-full mt-1 bg-[#0f9d58] text-white py-1.5 rounded-lg text-xs font-bold hover:bg-[#0a6e3d]"
                          >
                            Salvar Nota
                          </button>
                        </div>

                        {chatSelecionado.notas && chatSelecionado.notas.length > 0 && (
                          <div className="space-y-1.5 max-h-40 overflow-y-auto">
                            {chatSelecionado.notas.map((n) => (
                              <div key={n.id} className="p-2 bg-[#f0f2f5] rounded-lg border border-[#e3e3e3] text-xs">
                                <div className="flex justify-between text-[10px] text-[#5f6368] font-semibold">
                                  <span>{n.autor}</span>
                                  <span>{formatHora(n.timestamp)}</span>
                                </div>
                                <p className="mt-0.5 text-[#202124]">{n.texto}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center text-xs text-[#5f6368] py-8">
                        Selecione um cliente para visualizar os dados.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </aside>
          </div>

          {/* BOTTOM KANBAN TRAY */}
          <div
            className={`border-t border-[#e3e3e3] bg-[#f0f2f5] flex flex-col px-3.5 py-2 transition-all duration-200 shrink-0 ${
              kanbanTamanho === "expandido"
                ? "h-[65vh] min-h-[300px]"
                : kanbanTamanho === "recolhido"
                ? "h-11 min-h-[44px]"
                : "h-56 min-h-[200px]"
            }`}
          >
            {/* Topbar of Kanban */}
            <div className="flex items-center justify-between gap-3 mb-2 shrink-0">
              <h4
                onClick={() =>
                  setKanbanTamanho(kanbanTamanho === "recolhido" ? "normal" : "recolhido")
                }
                className="font-bold text-xs text-[#202124] cursor-pointer flex items-center gap-1.5"
                title="Clique para recolher ou expandir o Kanban"
              >
                🗂 <b>Kanban de atendimento</b>
              </h4>

              {kanbanTamanho !== "recolhido" && (
                <div className="relative flex-1 max-w-xs">
                  <input
                    type="text"
                    placeholder="🔍 Buscar cliente no kanban…"
                    value={kanbanBusca}
                    onChange={(e) => setKanbanBusca(e.target.value)}
                    className="w-full px-3 py-1 bg-white border border-[#e3e3e3] rounded-full text-xs outline-none focus:border-[#0f9d58]"
                  />
                </div>
              )}

              <div className="flex items-center gap-2">
                {kanbanTamanho !== "recolhido" && (
                  <button
                    onClick={() => {
                      const nome = prompt("Nome da nova coluna (ex: Negociação, Orçamento, Fechado):");
                      if (!nome || !nome.trim()) return;
                      const novaCol: KanbanColumn = {
                        id: `col-${Date.now()}`,
                        nome: nome.trim(),
                        cor: "#0f9d58",
                      };
                      setKanbanColunas((prev) => [...prev, novaCol]);
                      showToast("Coluna criada ✅");
                    }}
                    className="bg-[#e7f6ec] hover:bg-[#0f9d58] text-[#0a6e3d] hover:text-white border border-[#0f9d58] px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    ➕ Nova coluna
                  </button>
                )}

                <button
                  onClick={() =>
                    setKanbanTamanho(
                      kanbanTamanho === "expandido"
                        ? "normal"
                        : kanbanTamanho === "normal"
                        ? "expandido"
                        : "normal"
                    )
                  }
                  className="bg-[#e8eaed] hover:bg-[#dadce0] text-[#202124] px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer"
                  title="Expandir / Recolher Kanban"
                >
                  {kanbanTamanho === "expandido" ? "⬇️" : "⬆️"}
                </button>
              </div>
            </div>

            {/* Kanban Columns Layout */}
            {kanbanTamanho !== "recolhido" && (
              <div className="flex-1 flex gap-3 overflow-x-auto pb-1 items-stretch min-h-0">
                {kanbanColunas.map((col) => {
                  const cardsNaColuna = chats.filter((c) => {
                    const matchCol = (c.kanbanColId || "novos") === col.id;
                    const matchBusca =
                      !kanbanBusca ||
                      c.nome.toLowerCase().includes(kanbanBusca.toLowerCase()) ||
                      c.numero.includes(kanbanBusca) ||
                      formatarNumeroExibicao(c.numero).includes(kanbanBusca);
                    return matchCol && matchBusca;
                  });

                  return (
                    <div
                      key={col.id}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => kanbanDrop(col.id)}
                      className="w-56 bg-[#f0f2f5] border border-[#e3e3e3] rounded-xl flex flex-col h-full max-h-full shrink-0 shadow-sm"
                    >
                      {/* Col Top */}
                      <div className="p-2 px-3 border-b border-[#e3e3e3] bg-white rounded-t-xl flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-1.5 font-bold text-xs text-[#202124] truncate">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: col.cor }}
                          />
                          <span className="truncate">{col.nome}</span>
                        </div>
                        <span className="bg-[#f0f2f5] border border-[#e3e3e3] rounded-full px-2 py-0.2 text-[10px] font-bold text-[#5f6368]">
                          {cardsNaColuna.length}
                        </span>
                      </div>

                      {/* Cards list */}
                      <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {cardsNaColuna.length === 0 ? (
                          <div className="text-center text-[11px] text-[#5f6368] py-4">
                            Sem cards
                          </div>
                        ) : (
                          cardsNaColuna.map((card) => (
                            <div
                              key={card.id}
                              draggable
                              onDragStart={() => setKanbanArrastadoId(card.id)}
                              onClick={() => setChatSelecionadoId(card.id)}
                              onContextMenu={(e) =>
                                openContextMenu(e, card.nome, getChatMenuItems(card))
                              }
                              className="bg-white border border-[#e3e3e3] rounded-lg p-2 shadow-xs cursor-grab active:cursor-grabbing hover:border-[#0f9d58] transition-all"
                            >
                              <div className="font-bold text-xs text-[#202124] hover:text-[#0a6e3d] truncate flex justify-between items-center">
                                <span>{card.nome}</span>
                                {card.precisaAtencao && (
                                  <span className="text-[10px]" title="Precisa de atenção">⚠️</span>
                                )}
                              </div>
                              <div className="text-[10px] font-mono text-[#0a6e3d] font-semibold mt-0.5">
                                {formatarNumeroExibicao(card.numero || card.id)}
                              </div>
                              <div className="text-[10px] text-[#5f6368] truncate mt-0.5">
                                {card.lastMessage || "Sem mensagens"}
                              </div>
                              {card.tags && card.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {card.tags.map((t) => (
                                    <span
                                      key={t}
                                      className="text-[8px] text-white px-1.5 py-0.2 rounded-full font-bold"
                                      style={{ backgroundColor: getCorEtiqueta(t) }}
                                    >
                                      {t}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL STATUS / STORIES DO WHATSAPP */}
      {modalStatusAberto && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
          <div className="bg-[#121b22] text-white rounded-2xl shadow-2xl max-w-4xl w-full h-[85vh] flex overflow-hidden border border-white/10">
            {/* Left Status List */}
            <div className="w-80 bg-[#1f2c34] border-r border-white/10 flex flex-col">
              <div className="p-3 border-b border-white/10 flex items-center justify-between">
                <h3 className="font-bold text-sm flex items-center gap-2">
                  🟢 <b>Status do WhatsApp</b>
                </h3>
                <button
                  onClick={() => setModalNovoStatusAberto(true)}
                  className="bg-[#00a884] hover:bg-[#008f6f] text-white px-2.5 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer"
                >
                  ＋ Meu Status
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {statusFeed.length === 0 ? (
                  <div className="text-center text-xs text-white/50 py-12 px-4">
                    Nenhum status recente disponível.<br />
                    Quando seus contatos postarem Stories, eles aparecerão aqui.
                  </div>
                ) : (
                  statusFeed.map((feed) => {
                    const isSelected = statusSelecionadoFeed?.id === feed.id;
                    const contactNum = formatarNumeroExibicao(feed.contactNumber || feed.id);
                    return (
                      <div
                        key={feed.id}
                        onClick={() => {
                          setStatusSelecionadoFeed(feed);
                          setStatusItemIndex(0);
                        }}
                        className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-colors ${
                          isSelected ? "bg-white/15" : "hover:bg-white/5"
                        }`}
                      >
                        <div className="w-12 h-12 rounded-full ring-2 ring-[#00a884] p-0.5 shrink-0 overflow-hidden bg-white/10 flex items-center justify-center font-bold text-sm">
                          {feed.profilePicUrl ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={feed.profilePicUrl} alt="" className="w-full h-full object-cover rounded-full" />
                          ) : (
                            <span>{feed.contactName.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-xs truncate">{feed.contactName}</h4>
                          <div className="text-[10px] text-[#00a884] font-mono">{contactNum}</div>
                          <div className="text-[10px] text-white/60">
                            {formatHora(feed.timestamp)} · {feed.items?.length || 1} postagens
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Story Viewer & Comment Box */}
            <div className="flex-1 flex flex-col bg-[#0b141a] relative">
              <button
                onClick={() => {
                  setModalStatusAberto(false);
                  setStatusSelecionadoFeed(null);
                }}
                className="absolute top-3 right-3 text-white/70 hover:text-white font-bold text-lg z-20 bg-black/40 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>

              {statusSelecionadoFeed ? (
                <div className="flex-1 flex flex-col h-full">
                  {/* Story Progress Bars */}
                  <div className="p-3 pb-1 flex gap-1 z-10">
                    {(statusSelecionadoFeed.items || [statusSelecionadoFeed]).map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          idx === statusItemIndex ? "bg-[#00a884]" : idx < statusItemIndex ? "bg-white/80" : "bg-white/20"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Story Header */}
                  <div className="px-4 py-2 flex items-center gap-3 z-10 bg-gradient-to-b from-black/60 to-transparent">
                    <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm shrink-0">
                      {statusSelecionadoFeed.contactName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs">{statusSelecionadoFeed.contactName}</h4>
                      <span className="text-[10px] text-emerald-400 font-mono">
                        {formatarNumeroExibicao(statusSelecionadoFeed.contactNumber || statusSelecionadoFeed.id)}
                      </span>
                    </div>
                  </div>

                  {/* Main Story Content Area */}
                  <div
                    onClick={() => {
                      const total = statusSelecionadoFeed.items?.length || 1;
                      setStatusItemIndex((prev) => (prev + 1 < total ? prev + 1 : 0));
                    }}
                    className="flex-1 flex items-center justify-center p-6 text-center cursor-pointer relative"
                  >
                    {statusSelecionadoFeed.items?.[statusItemIndex]?.hasMedia &&
                    statusSelecionadoFeed.items?.[statusItemIndex]?.mediaUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={statusSelecionadoFeed.items[statusItemIndex].mediaUrl!}
                        alt=""
                        className="max-h-[50vh] max-w-full object-contain rounded-xl shadow-2xl"
                      />
                    ) : (
                      <div className="bg-[#0f9d58] text-white p-8 rounded-2xl max-w-md w-full shadow-2xl text-lg font-bold flex items-center justify-center min-h-[240px] leading-relaxed">
                        {statusSelecionadoFeed.items?.[statusItemIndex]?.body ||
                          statusSelecionadoFeed.contactName + " atualizou seu status."}
                      </div>
                    )}
                  </div>

                  {/* Comment / Reply Box */}
                  <div className="p-3 bg-[#1f2c34] border-t border-white/10 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder={`Responder ao status de ${statusSelecionadoFeed.contactName}…`}
                      value={statusComentario}
                      onChange={(e) => setStatusComentario(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") responderAoStatus();
                      }}
                      className="flex-1 bg-[#2a3942] text-white placeholder-white/50 border-none rounded-full px-4 py-2 text-xs outline-none focus:ring-1 focus:ring-[#00a884]"
                    />
                    <button
                      onClick={responderAoStatus}
                      className="bg-[#00a884] hover:bg-[#008f6f] text-white rounded-full w-9 h-9 flex items-center justify-center font-bold text-sm cursor-pointer shrink-0 transition-colors"
                    >
                      ➤
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-xs text-white/50">
                  👈 Selecione um status ao lado para visualizar e responder
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL PUBLICAR MEU STATUS */}
      {modalNovoStatusAberto && (
        <div className="fixed inset-0 bg-black/75 z-55 flex items-center justify-center p-4">
          <div className="bg-[#1f2c34] text-white rounded-2xl shadow-2xl max-w-md w-full p-4 space-y-3 border border-white/10">
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <strong className="text-xs">＋ Publicar Status no WhatsApp</strong>
              <button
                onClick={() => setModalNovoStatusAberto(false)}
                className="text-white/60 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <textarea
              rows={4}
              placeholder="Digite o texto do seu Status/Story do WhatsApp..."
              value={novoStatusTexto}
              onChange={(e) => setNovoStatusTexto(e.target.value)}
              className="w-full p-3 rounded-xl bg-[#2a3942] text-white text-xs outline-none border border-white/10"
              style={{ backgroundColor: novoStatusCor }}
            />

            <div className="flex items-center gap-2">
              <label className="text-xs text-white/70">Cor de fundo:</label>
              {["#0f9d58", "#1a73e8", "#b91c1c", "#6b21a8", "#d97706", "#202124"].map((cor) => (
                <button
                  key={cor}
                  type="button"
                  onClick={() => setNovoStatusCor(cor)}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${
                    novoStatusCor === cor ? "border-white scale-110" : "border-transparent"
                  }`}
                  style={{ backgroundColor: cor }}
                />
              ))}
            </div>

            <button
              onClick={publicarNovoStatus}
              className="w-full bg-[#00a884] hover:bg-[#008f6f] text-white py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors"
            >
              Publicar no WhatsApp Stories 🟢
            </button>
          </div>
        </div>
      )}

      {/* CONTEXT MENU MODAL */}
      {ctxVisible && ctxStack.length > 0 && (
        <div
          style={{ top: ctxPos.y, left: ctxPos.x }}
          onClick={(e) => e.stopPropagation()}
          className="fixed z-[99999] bg-white border border-[#e3e3e3] rounded-xl shadow-2xl py-1.5 min-w-[210px] max-w-[260px] text-xs text-[#202124] animate-in fade-in zoom-in-95 duration-100"
        >
          {ctxStack.length > 1 && (
            <button
              onClick={ctxPop}
              className="w-full text-left px-3 py-1.5 bg-[#f0f2f5] hover:bg-[#e8eaed] font-bold text-[11px] text-[#0a6e3d] flex items-center gap-1 border-b border-[#e3e3e3] mb-1 cursor-pointer"
            >
              ← Voltar
            </button>
          )}

          <div className="px-3 py-1 text-[10px] font-bold text-[#5f6368] uppercase tracking-wider border-b border-[#f0f2f5] mb-1">
            {ctxStack[ctxStack.length - 1].title}
          </div>

          <div className="space-y-0.5">
            {ctxStack[ctxStack.length - 1].items.map((item, idx) => {
              if (item.sep) {
                return <div key={idx} className="border-t border-[#e3e3e3] my-1" />;
              }

              return (
                <button
                  key={idx}
                  onClick={() => {
                    if (item.children) {
                      ctxPush(item.label || "Opções", item.children());
                    } else if (item.onClick) {
                      item.onClick();
                      setCtxVisible(false);
                    }
                  }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-[#f0f2f5] flex items-center justify-between text-xs transition-colors cursor-pointer ${
                    item.danger ? "text-red-600 hover:bg-red-50" : ""
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {item.icon && <span>{item.icon}</span>}
                    <span>{item.label}</span>
                  </span>
                  {item.check && <span className="text-[#0f9d58] font-bold">✓</span>}
                  {item.children && <span className="text-[#80868b] font-bold">›</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL PRODUTO: Definir Preço de Venda com 2-Way Sync */}
      {modalProdutoAberto && produtoModal && (
        <div className="fixed inset-0 bg-black/55 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-4 space-y-3">
            <div className="flex justify-between items-center border-b border-[#e3e3e3] pb-2">
              <strong className="text-xs text-[#202124]">
                Enviar produto — definir preço de venda
              </strong>
              <button
                onClick={() => setModalProdutoAberto(false)}
                className="text-[#5f6368] hover:text-[#202124] font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={produtoModal.imagem}
                alt=""
                className="w-20 h-20 object-cover rounded-lg bg-gray-100 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="font-bold text-xs text-[#202124]">{produtoModal.nome}</div>
                <div className="text-[11px] text-[#5f6368]">
                  Fornecedor: {produtoModal.fornecedor || "Balão"}
                </div>
              </div>
            </div>

            <div className="bg-[#fff8e1] border border-[#f2c94c] rounded-lg p-2 text-[11px] text-[#7a5c00]">
              ⚠️ O valor abaixo é o <b>CUSTO</b> do fornecedor. Defina a margem ou o preço de venda para concluir o envio.
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between gap-2">
                <label className="text-[#5f6368] font-semibold">Custo (R$)</label>
                <input
                  type="number"
                  value={mpCusto}
                  onChange={(e) => {
                    setMpCusto(e.target.value);
                    if (mpOrigem === "margem") sincronizarPreco(e.target.value, mpMargem);
                    else sincronizarMargem(e.target.value, mpPreco);
                  }}
                  className="w-32 p-1.5 border border-[#e3e3e3] rounded-lg font-mono text-right"
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <label className="text-[#5f6368] font-semibold">Margem (%)</label>
                <input
                  type="number"
                  value={mpMargem}
                  onChange={(e) => {
                    setMpMargem(e.target.value);
                    setMpOrigem("margem");
                    sincronizarPreco(mpCusto, e.target.value);
                  }}
                  className="w-32 p-1.5 border border-[#e3e3e3] rounded-lg font-mono text-right"
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <label className="text-[#5f6368] font-semibold">Preço de Venda (R$)</label>
                <input
                  type="number"
                  value={mpPreco}
                  onChange={(e) => {
                    setMpPreco(e.target.value);
                    setMpOrigem("preco");
                    sincronizarMargem(mpCusto, e.target.value);
                  }}
                  className="w-32 p-1.5 border border-[#0f9d58] rounded-lg font-bold font-mono text-right text-[#0a6e3d]"
                />
              </div>
            </div>

            <div className="bg-[#e8f5e9] border border-[#a5d6a7] rounded-lg p-2.5 text-center font-bold text-sm text-[#0f9d58]">
              Enviar por: R$ {Number(mpPreco || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>

            <textarea
              rows={2}
              placeholder="Observação extra (opcional)..."
              value={mpObs}
              onChange={(e) => setMpObs(e.target.value)}
              className="w-full p-2 border border-[#e3e3e3] rounded-lg text-xs"
            />

            <button
              onClick={confirmarEnvioProduto}
              className="w-full bg-[#0f9d58] hover:bg-[#0a6e3d] text-white py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              ➤ Enviar Produto
            </button>
          </div>
        </div>
      )}

      {/* MODAL DOCUMENTO */}
      {modalDocAberto && docUpload && (
        <div className="fixed inset-0 bg-black/55 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-4 space-y-3">
            <div className="flex justify-between items-center border-b border-[#e3e3e3] pb-2">
              <strong className="text-xs text-[#202124]">📄 Enviar Documento</strong>
              <button
                onClick={() => setModalDocAberto(false)}
                className="text-[#5f6368] hover:text-[#202124] font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 bg-[#f0f2f5] rounded-xl border border-[#e3e3e3]">
              <span className="text-3xl">📄</span>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-xs text-[#202124] truncate">{docUpload.nome}</div>
                <div className="text-[11px] text-[#5f6368]">{docUpload.tamanhoFormatado} · {docUpload.mime}</div>
              </div>
            </div>

            <textarea
              rows={2}
              placeholder="Legenda do documento (opcional)..."
              value={docLegenda}
              onChange={(e) => setDocLegenda(e.target.value)}
              className="w-full p-2 border border-[#e3e3e3] rounded-lg text-xs"
            />

            <button
              onClick={() => {
                if (!chatSelecionado) return;
                const m: CrmMensagem = {
                  id: `msg-${Date.now()}`,
                  chatId: chatSelecionado.id,
                  from: "balao",
                  body: docLegenda || docUpload.nome,
                  direction: "out",
                  timestamp: Date.now(),
                  hasMedia: true,
                  mediaType: "document",
                  mediaName: docUpload.nome,
                  status: "sent",
                };
                setMensagens((prev) => [...prev, m]);
                setModalDocAberto(false);
                showToast("Documento enviado 📄");
              }}
              className="w-full bg-[#0f9d58] hover:bg-[#0a6e3d] text-white py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              ➤ Enviar Documento
            </button>
          </div>
        </div>
      )}

      {/* MODAL FOTO */}
      {modalFotoAberto && (
        <div className="fixed inset-0 bg-black/55 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-4 space-y-3">
            <div className="flex justify-between items-center border-b border-[#e3e3e3] pb-2">
              <strong className="text-xs text-[#202124]">Enviar foto para o WhatsApp</strong>
              <button
                onClick={() => setModalFotoAberto(false)}
                className="text-[#5f6368] hover:text-[#202124] font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={fotoUrl} alt="" className="w-full h-48 object-contain rounded-lg bg-[#f0f2f5]" />

            <textarea
              rows={2}
              placeholder="Legenda da foto (opcional)..."
              value={fotoLegenda}
              onChange={(e) => setFotoLegenda(e.target.value)}
              className="w-full p-2 border border-[#e3e3e3] rounded-lg text-xs"
            />

            <button
              onClick={() => {
                if (!chatSelecionado) return;
                const m: CrmMensagem = {
                  id: `msg-${Date.now()}`,
                  chatId: chatSelecionado.id,
                  from: "balao",
                  body: fotoLegenda ? `📷 ${fotoLegenda}` : "📷 [Foto Enviada]",
                  direction: "out",
                  timestamp: Date.now(),
                  hasMedia: true,
                  status: "sent",
                };
                setMensagens((prev) => [...prev, m]);
                setModalFotoAberto(false);
                showToast("Foto enviada ✓");
              }}
              className="w-full bg-[#0f9d58] hover:bg-[#0a6e3d] text-white py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              ➤ Enviar Foto
            </button>
          </div>
        </div>
      )}

      {/* MODAL NOVA CONVERSA */}
      {modalNovaConversa && (
        <div className="fixed inset-0 bg-black/55 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-4 space-y-3">
            <div className="flex justify-between items-center border-b border-[#e3e3e3] pb-2">
              <strong className="text-xs text-[#202124]">＋ Iniciar Nova Conversa</strong>
              <button
                onClick={() => setModalNovaConversa(false)}
                className="text-[#5f6368] hover:text-[#202124] font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={criarNovaConversa} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#5f6368] font-semibold mb-1">
                  Número de WhatsApp (com DDD) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 5519987510267"
                  value={novoNumero}
                  onChange={(e) => setNovoNumero(e.target.value)}
                  className="w-full p-2 border border-[#e3e3e3] rounded-lg font-mono outline-none focus:border-[#0f9d58]"
                />
              </div>

              <div>
                <label className="block text-[#5f6368] font-semibold mb-1">
                  Nome do Cliente (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Cliente Balão"
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  className="w-full p-2 border border-[#e3e3e3] rounded-lg outline-none focus:border-[#0f9d58]"
                />
              </div>

              <div>
                <label className="block text-[#5f6368] font-semibold mb-1">
                  Mensagem Inicial (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Olá! Como podemos te ajudar no Balão?"
                  value={novaMsgInicial}
                  onChange={(e) => setNovaMsgInicial(e.target.value)}
                  className="w-full p-2 border border-[#e3e3e3] rounded-lg outline-none focus:border-[#0f9d58] resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setModalNovaConversa(false)}
                  className="px-3 py-1.5 rounded-lg border border-[#e3e3e3] text-[#5f6368] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#0f9d58] hover:bg-[#0a6e3d] text-white font-bold transition-colors cursor-pointer"
                >
                  Iniciar Conversa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[99999] bg-[#323232] text-white px-5 py-2.5 rounded-full text-xs font-semibold shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-200">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
