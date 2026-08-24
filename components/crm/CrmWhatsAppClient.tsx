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
  CrmProdutoResumo,
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
import { type Category, buildCategoryTree } from "@/lib/utils";

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

// Achata a árvore de categorias (com nível de indentação) para exibir no
// filtro do catálogo do CRM.
function flattenCategoryTree(categories: Category[], level = 0): { category: Category; level: number }[] {
  let result: { category: Category; level: number }[] = [];
  categories.forEach((cat) => {
    result.push({ category: cat, level });
    if (cat.children && cat.children.length > 0) {
      result = result.concat(flattenCategoryTree(cat.children, level + 1));
    }
  });
  return result;
}

// Proxy seguro para fotos de perfil do WhatsApp para evitar 403 Forbidden e CORS
function formatAvatarUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("data:")) return url;
  if (url.startsWith("http")) {
    return `/api/crm/avatar?url=${encodeURIComponent(url)}`;
  }
  return url;
}

// Resolve caminhos relativos de imagem (/uploads/...) em URL absoluta,
// pois o whatsapp-server só consegue anexar mídia via MessageMedia.fromUrl
// quando recebe uma URL http(s) completa.
function resolveImagemAbsoluta(url: string | null | undefined): string {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("data:")) return url;
  const origin = typeof window !== "undefined" ? window.location.origin : "https://www.balao.info";
  return `${origin}${url.startsWith("/") ? "" : "/"}${url}`;
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
  // Vendedores agora vivem no servidor (compartilhado entre todos os PCs da
  // equipe) — este flag só existe pra não mostrar "cadastre o primeiro
  // vendedor" antes da lista real chegar do socket.
  const [vendedoresCarregados, setVendedoresCarregados] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return JSON.parse(localStorage.getItem("balao_crm_vendedores") || "[]").length > 0;
    } catch {
      return false;
    }
  });
  const [pinDigitado, setPinDigitado] = useState("");
  const [erroLogin, setErroLogin] = useState("");
  const vendedorAtivo0 = vendedores.find((v) => String(v.id) === String(vendedorAtivoId)) || null;
  const vendedorAutenticado = Boolean(vendedorAtivoId) && Boolean(vendedorAtivo0);

  const sairDoVendedor = () => {
    setVendedorAtivoId(null);
    setKanbanPorChat({});
    if (typeof window !== "undefined") localStorage.removeItem("balao_crm_vendedor_ativo");
  };

  const fazerLoginVendedor = (pin: string) => {
    const limpo = pin.trim();
    if (!/^\d{4,6}$/.test(limpo)) {
      setErroLogin("Digite um PIN de 4 a 6 números.");
      return;
    }
    socketRef.current?.emit("panel:vendedor-login", { pin: limpo }, (res: any) => {
      if (res?.ok && res.vendedor) {
        setVendedorAtivoId(res.vendedor.id);
        setPinDigitado("");
        setErroLogin("");
        showToast(`Bem-vindo, ${res.vendedor.nome}!`);
      } else {
        setErroLogin("PIN incorreto.");
      }
    });
  };

  const cadastrarVendedor = (dados: { nome: string; cargo: string; assinatura: string; pin: string }, autoLogin: boolean) => {
    socketRef.current?.emit("panel:add-vendedor", dados, (res: any) => {
      if (res?.ok && res.vendedor) {
        showToast(`Vendedor ${res.vendedor.nome} cadastrado.`);
        if (autoLogin) setVendedorAtivoId(res.vendedor.id);
      } else {
        showToast(res?.erro || "Não foi possível cadastrar o vendedor.");
      }
    });
  };

  // Chats and Messages
  const isRealDirectChat = (id: string | null | undefined): boolean => {
    if (!id) return false;
    const s = String(id).trim();
    return (
      s !== "status@broadcast" &&
      !s.endsWith("@broadcast") &&
      !s.endsWith("@newsletter") &&
      !s.endsWith("@g.us") &&
      !s.includes("broadcast") &&
      s !== "13135550002@c.us" &&
      s !== "0@c.us" &&
      s !== "status"
    );
  };

  const [chats, setChats] = useState<CrmChat[]>(() => {
    if (typeof window !== "undefined") {
      const s = localStorage.getItem("balao_crm_chats");
      if (s) {
        try {
          const parsed = JSON.parse(s);
          if (Array.isArray(parsed)) {
            return parsed.filter((c: any) => c.id && isRealDirectChat(c.id));
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
        try {
          const parsed = JSON.parse(s);
          if (Array.isArray(parsed)) {
            return parsed.filter((m: any) => m.chatId && isRealDirectChat(m.chatId));
          }
        } catch {}
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
  // Etapa do funil por cliente — é o kanban PESSOAL do vendedor logado
  // (vem do servidor, um mapa separado por vendedor: o mesmo cliente pode
  // estar em etapas diferentes pra vendedores diferentes, de propósito).
  const [kanbanPorChat, setKanbanPorChat] = useState<Record<string, string>>({});
  const getKanbanCol = (chatId: string) => kanbanPorChat[chatId] || "novos";
  const setKanbanCol = (chatId: string, colId: string | null) => {
    setKanbanPorChat((prev) => {
      const next = { ...prev };
      if (colId) next[chatId] = colId;
      else delete next[chatId];
      return next;
    });
    if (vendedorAtivoId) {
      socketRef.current?.emit("panel:set-kanban-card", { vendedorId: vendedorAtivoId, chatId, colId: colId || null });
    }
  };

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
  // Real Database Catalog & Pricing Modes (Venda vs Custo)
  // Catálogo busca paginado no servidor (nunca o banco inteiro) — com
  // milhares de produtos, carregar tudo de uma vez e renderizar cada card
  // travava o CRM inteiro assim que a aba abria (que é a aba padrão).
  const CATALOGO_PAGE_SIZE = 100;
  const [produtosCatalogo, setProdutosCatalogo] = useState<CrmProdutoCatalogo[]>([]);
  const [catalogoTotal, setCatalogoTotal] = useState(0);
  const [catalogoPagina, setCatalogoPagina] = useState(1);
  const [categoriasCatalogo, setCategoriasCatalogo] = useState<Category[]>([]);
  const [catalogoCategoriaFiltro, setCatalogoCategoriaFiltro] = useState("");
  const catalogoCategoriasFlat = useMemo(
    () => flattenCategoryTree(buildCategoryTree(categoriasCatalogo)),
    [categoriasCatalogo]
  );
  const [tipoPrecoCatalogo, setTipoPrecoCatalogo] = useState<"venda" | "custo">("venda");
  const [catalogoCarregando, setCatalogoCarregando] = useState(false);
  const [buscaCatalogo, setBuscaCatalogo] = useState("");
  const [buscaCatalogoDebounced, setBuscaCatalogoDebounced] = useState("");

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
  const [disparoAtivo, setDisparoAtivo] = useState(false);
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

  // Persistence & Storage Cleanup
  useEffect(() => {
    if (typeof window !== "undefined") {
      const cleanChats = chats.filter((c) => isRealDirectChat(c.id));
      const cleanMsgs = mensagens.filter((m) => isRealDirectChat(m.chatId));
      localStorage.setItem("balao_crm_chats", JSON.stringify(cleanChats));
      localStorage.setItem("balao_crm_mensagens_store", JSON.stringify(cleanMsgs));
      localStorage.setItem("balao_crm_kanban_colunas", JSON.stringify(kanbanColunas));
      localStorage.setItem("balao_crm_respostas", JSON.stringify(respostas));
      localStorage.setItem("balao_crm_etiquetas", JSON.stringify(etiquetas));
      localStorage.setItem("balao_crm_vendedores", JSON.stringify(vendedores));
      if (vendedorAtivoId) {
        localStorage.setItem("balao_crm_vendedor_ativo", String(vendedorAtivoId));
      }
    }
  }, [chats, mensagens, kanbanColunas, respostas, etiquetas, vendedores, vendedorAtivoId]);

  // Load Real Catalog from Database (Shared with Website) — paginado no
  // servidor. Com o catálogo tendo milhares de produtos, buscar/renderizar
  // tudo de uma vez travava o CRM inteiro assim que a aba (que é a padrão)
  // abria. Aqui só pedimos uma página pequena, filtrada pelo termo de busca.
  const carregarCatalogoBanco = () => {
    setCatalogoCarregando(true);
    // Sempre ordenado do mais barato pro mais caro, sempre paginado no
    // servidor (nunca o catálogo inteiro de uma vez).
    const params = new URLSearchParams({
      page: String(catalogoPagina),
      limit: String(CATALOGO_PAGE_SIZE),
      sort: "price_asc",
    });
    const busca = buscaCatalogoDebounced.trim();
    if (busca) params.set("search", busca);
    if (catalogoCategoriaFiltro) params.set("category", catalogoCategoriaFiltro);

    fetch(`/api/products?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        const rows = Array.isArray(data) ? data : Array.isArray(data?.products) ? data.products : [];
        setCatalogoTotal(typeof data?.total === "number" ? data.total : rows.length);
        const list: CrmProdutoCatalogo[] = rows.map((p: any) => {
            const precoNum =
              typeof p.price === "number"
                ? p.price
                : parseFloat(String(p.price).replace(/[^0-9.]/g, "")) || 0;
            const custoNum =
              typeof p.cost === "number" && p.cost > 0
                ? p.cost
                : Math.round(precoNum * 0.75);
            const margem =
              custoNum > 0 ? Math.round(((precoNum - custoNum) / custoNum) * 100) : 25;
            const fornecedor = p.supplier || p.brand || "Estoque Balão";
            const precoFmt =
              typeof p.price === "number"
                ? `R$ ${p.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                : String(p.price || `R$ ${precoNum.toFixed(2)}`);

            return {
              id: String(p.id),
              nome: p.name || "Produto Balão",
              preco: precoNum,
              custo: custoNum,
              margem,
              fornecedor,
              precoFormatado: precoFmt,
              categoria: p.category || "Informática",
              imagem: resolveImagemAbsoluta(p.image || p.image_urls?.[0] || ""),
              // Campos internos (custo de aquisição, markup aplicado,
              // qualidade da foto) nunca podem aparecer aqui: essa lista vai
              // direto pro texto da mensagem enviada ao cliente no WhatsApp.
              specs: Array.isArray(p.specs)
                ? p.specs
                : typeof p.specs === "object" && p.specs
                ? Object.entries(p.specs)
                    .filter(([k]) => !["custo_origem", "markup", "qualidade_fotos"].includes(k))
                    .map(([k, v]) => `${k}: ${v}`)
                : [],
            };
        });
        setProdutosCatalogo(list);
      })
      .catch((err) => {
        console.error("Falha ao carregar produtos do banco:", err);
      })
      .finally(() => {
        setCatalogoCarregando(false);
      });
  };

  const fetchCategoriasCatalogo = () => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCategoriasCatalogo(data);
      })
      .catch((err) => console.error("Falha ao carregar categorias do catálogo:", err));
  };

  // Busca do catálogo com debounce — evita disparar uma requisição a cada
  // tecla digitada num campo que vai bater num banco de milhares de itens.
  useEffect(() => {
    const t = setTimeout(() => setBuscaCatalogoDebounced(buscaCatalogo), 350);
    return () => clearTimeout(t);
  }, [buscaCatalogo]);

  // Volta pra página 1 sempre que a busca ou a categoria mudam — senão o
  // usuário pode ficar preso numa página que não existe mais no resultado.
  useEffect(() => {
    setCatalogoPagina(1);
  }, [buscaCatalogoDebounced, catalogoCategoriaFiltro]);

  useEffect(() => {
    carregarCatalogoBanco();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buscaCatalogoDebounced, catalogoCategoriaFiltro, catalogoPagina]);

  useEffect(() => {
    fetchCategoriasCatalogo();
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

    // Evita travar a tela de login pra sempre se o servidor demorar/estiver fora do ar.
    const vendedoresTimeout = setTimeout(() => setVendedoresCarregados(true), 6000);

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
            .filter((sc) => sc.chatId && isRealDirectChat(sc.chatId))
            .forEach((sc) => {
              const idx = merged.findIndex((c) => c.id === sc.chatId);
              // Nunca deixar o sufixo do JID (@c.us, @lid, @s.whatsapp.net…)
              // vazar como nome/número na lista de conversas.
              const realNum = sc.realNumber || sc.displayNumber || String(sc.chatId || "").replace(/@.*$/, "");
              const nomeSemJid = String(sc.contactName || realNum || "").replace(/@.*$/, "");
              const chatObj: CrmChat = {
                id: sc.chatId,
                nome: nomeSemJid || "Contato",
                numero: realNum,
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
                merged[idx] = {
                  ...merged[idx],
                  ...chatObj,
                  pic: sc.profilePicUrl || merged[idx].pic,
                };
              } else {
                merged.push(chatObj);
              }
            });
          return merged
            .filter((c) => isRealDirectChat(c.id))
            .sort((a, b) => b.timestamp - a.timestamp);
        });
      }
    });

    socket.on("whatsapp:messages", (serverMsgs: any[]) => {
      if (Array.isArray(serverMsgs) && serverMsgs.length > 0) {
        setMensagens((prev) => {
          const map = new Map<string, CrmMensagem>();
          prev.filter((m) => isRealDirectChat(m.chatId)).forEach((m) => map.set(m.id, m));
          serverMsgs
            .filter((sm) => sm.chatId && isRealDirectChat(sm.chatId))
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
                mediaUrl: sm.mediaUrl || null,
                status: "read",
              });
            });
          return Array.from(map.values()).sort((a, b) => a.timestamp - b.timestamp);
        });
      }
    });

    socket.on("whatsapp:message", (newMsg: any) => {
      if (!newMsg || !newMsg.chatId) return;

      // Filter out @lid or broadcast messages
      if (!isRealDirectChat(newMsg.chatId) || !isRealDirectChat(newMsg.from)) {
        if (
          newMsg.chatId === "status@broadcast" ||
          String(newMsg.chatId).includes("broadcast") ||
          newMsg.from === "status@broadcast"
        ) {
          if (socketRef.current?.connected) {
            socketRef.current.emit("panel:sync-conversations");
          }
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

      // Nunca deixar o sufixo técnico do JID (@c.us, @lid, @s.whatsapp.net…)
      // vazar como se fosse nome/número — sem isso, contatos @lid sem nome
      // resolvido apareciam como "273082677764270@lid" na lista de chats.
      const realNum = newMsg.realNumber || String(newMsg.chatId || "").replace(/@.*$/, "");
      const nomeSemJid = (newMsg.contactName || realNum || "").replace(/@.*$/, "");
      const m: CrmMensagem = {
        id: newMsg.id || `msg-${Date.now()}`,
        chatId: newMsg.chatId,
        from: newMsg.from || newMsg.chatId,
        body: newMsg.body || "",
        direction: newMsg.direction || "in",
        timestamp: newMsg.timestamp || Date.now(),
        hasMedia: newMsg.hasMedia,
        mediaType: newMsg.mediaType,
        mediaUrl: newMsg.mediaUrl || null,
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
            nome: nomeSemJid || "Contato",
            numero: realNum,
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

    socket.on("whatsapp:disparo-status", (payload: any) => {
      setDisparoAtivo(Boolean(payload?.ativo));
    });

    socket.on("whatsapp:vendedores", (lista: any[]) => {
      setVendedoresCarregados(true);
      if (Array.isArray(lista)) setVendedores(lista);
    });

    socket.on("whatsapp:kanban", (mapa: Record<string, string>) => {
      setKanbanPorChat(mapa && typeof mapa === "object" ? mapa : {});
    });

    return () => {
      clearTimeout(vendedoresTimeout);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [serverUrl]);

  // Avisa o servidor qual vendedor está logado neste navegador, pra ele
  // entrar na "sala" certa e receber só o kanban pessoal desse vendedor
  // (não o de todo mundo). Repete a cada troca de vendedor e a cada
  // reconexão do socket.
  useEffect(() => {
    if (!vendedorAtivoId) return;
    const identificar = () => {
      socketRef.current?.emit("panel:identify-vendedor", { vendedorId: vendedorAtivoId });
    };
    identificar();
    socketRef.current?.on("connect", identificar);
    return () => {
      socketRef.current?.off("connect", identificar);
    };
  }, [vendedorAtivoId]);

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
      } else {
        // Sem socket, o clique não faria nada no servidor — garante que o
        // reset é disparado mesmo com o painel momentaneamente desconectado.
        fetch(`${serverUrl}/api/reset-session`, { method: "POST" }).catch(() => {});
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
      .filter((c) => isRealDirectChat(c.id))
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
              socketRef.current?.emit("panel:assign-seller", { chatId: chat.id, sellerId: v.id });
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
            check: getKanbanCol(chat.id) === col.id,
            onClick: () => {
              setKanbanCol(chat.id, col.id);
              showToast(`Movido para ${col.nome}`);
            },
          })),
          { sep: true },
          {
            label: "Remover do Kanban",
            icon: "🗑️",
            danger: true,
            onClick: () => {
              setKanbanCol(chat.id, null);
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

  // Enviar Produto Direto para o Chat (Sem passar pelo digitador)
  const enviarProdutoDiretoAoChat = (prod: CrmProdutoCatalogo, precoCustom?: number, obsCustom?: string) => {
    if (!chatSelecionado) {
      showToast("Selecione uma conversa primeiro!");
      return;
    }

    const precoFinal = precoCustom || prod.preco;
    const precoFmt = `R$ ${precoFinal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
    const specsTxt = prod.specs?.length ? `\n• ${prod.specs.join("\n• ")}` : "";
    const obsTxt = obsCustom?.trim() ? `\n\n_Obs: ${obsCustom.trim()}_` : "";

    const textoFormatado = `⚡ *Oferta Balão da Informática:*\n*${prod.nome}*\n\n💵 *Preço Especial:* *${precoFmt}*${specsTxt}${obsTxt}\n\n📍 Pronta entrega na loja do Castelo Campinas!\nPara garantir a reserva ou tirar dúvidas, é só responder aqui! 🎈`;

    const produtoResumo: CrmProdutoResumo = {
      id: prod.id,
      nome: prod.nome,
      preco: precoFinal,
      precoFormatado: precoFmt,
      imagem: prod.imagem,
      fornecedor: prod.fornecedor || "Balão",
      specs: prod.specs,
    };

    const novaMsg: CrmMensagem = {
      id: `msg-prod-${Date.now()}`,
      chatId: chatSelecionado.id,
      from: "balao",
      body: textoFormatado,
      direction: "out",
      timestamp: Date.now(),
      produto: produtoResumo,
      hasMedia: Boolean(prod.imagem),
      mediaUrl: prod.imagem,
      status: "sent",
    };

    setMensagens((prev) => [...prev, novaMsg]);

    setChats((prev) =>
      prev.map((c) =>
        c.id === chatSelecionado.id
          ? {
              ...c,
              lastMessage: `📦 Oferta: ${prod.nome} (${precoFmt})`,
              timestamp: Date.now(),
              produtosEnviados: [
                {
                  id: prod.id,
                  nome: prod.nome,
                  preco: precoFinal,
                  imagem: prod.imagem,
                  timestamp: Date.now(),
                },
                ...(c.produtosEnviados || []),
              ],
            }
          : c
      )
    );

    // Disparar envio via Socket.IO — HTTP só roda se o socket estiver caído,
    // senão o cliente recebe o produto em dobro.
    if (socketRef.current?.connected) {
      socketRef.current.emit("panel:send-product", {
        chatId: chatSelecionado.id,
        number: chatSelecionado.numero,
        product: prod,
        price: precoFinal,
        obs: obsCustom,
      });
    } else fetch(`${serverUrl}/api/enviar-produto`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat: chatSelecionado.id,
        number: chatSelecionado.numero,
        product: prod,
        price: precoFinal,
        obs: obsCustom,
      }),
    }).catch(() => {});

    if (modalProdutoAberto) setModalProdutoAberto(false);
    showToast(`📦 Oferta de "${prod.nome}" enviada ao destinatário! ✅`);
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

    // Disparar via Socket.IO — HTTP só roda se o socket estiver caído,
    // senão a mensagem chega em dobro pro cliente.
    if (socketRef.current?.connected) {
      socketRef.current.emit("panel:send-message", {
        number: chatSelecionado.numero,
        text: textoFinal,
        chatId: chatSelecionado.id,
        replyTo: msgRespondendo?.id || undefined,
      });
    } else fetch(`${serverUrl}/api/enviar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat: chatSelecionado.id,
        number: chatSelecionado.numero,
        texto: textoFinal,
        replyTo: msgRespondendo?.id || undefined,
      }),
    }).catch(() => {});

    setCampoTexto("");
    setMsgRespondendo(null);
    setLinkPreview(null);
    showToast("Mensagem disparada para o destinatário ✓");
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

    // HTTP só roda se o socket estiver caído, senão o cliente recebe em dobro.
    if (socketRef.current?.connected) {
      socketRef.current.emit("panel:reply-status", {
        contactNumber,
        chatId,
        statusSnippet: statusItem?.body || "Foto/Mídia do Status",
        text: statusComentario.trim(),
      });
    } else fetch(`${serverUrl}/api/enviar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat: chatId,
        number: contactNumber,
        texto: `💬 *Respondendo ao seu Status do WhatsApp:*\n> "${(statusItem?.body || "Mídia").slice(0, 80)}"\n\n${statusComentario.trim()}`,
      }),
    }).catch(() => {});

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
    setKanbanCol(kanbanArrastadoId, colunaId);
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

  // Portão de acesso: cada vendedor precisa do próprio PIN pra "atender".
  // A lista de vendedores vem do servidor (compartilhada por toda a equipe),
  // então isso funciona igual em qualquer PC/navegador.
  if (!vendedorAutenticado) {
    if (!vendedoresCarregados) {
      return (
        <div className="flex items-center justify-center h-screen w-screen bg-[#f0f2f5] text-[#5f6368] text-sm">
          Conectando ao painel...
        </div>
      );
    }

    if (vendedores.length === 0) {
      return (
        <div className="flex items-center justify-center h-screen w-screen bg-[#f0f2f5] p-4">
          <div className="bg-white rounded-2xl shadow-md p-6 w-full max-w-sm space-y-3">
            <h1 className="text-lg font-bold text-[#202124]">🎈 Balão da Informática</h1>
            <p className="text-xs text-[#5f6368]">
              Nenhum vendedor cadastrado ainda. Cadastre o primeiro (será o seu acesso).
            </p>
            <input
              type="text"
              id="gateNome"
              placeholder="Seu nome"
              className="w-full px-3 py-2 border border-[#e3e3e3] rounded-lg text-sm outline-none"
            />
            <input
              type="text"
              id="gateCargo"
              placeholder="Cargo (opcional)"
              className="w-full px-3 py-2 border border-[#e3e3e3] rounded-lg text-sm outline-none"
            />
            <input
              type="password"
              id="gatePin"
              inputMode="numeric"
              placeholder="Crie um PIN de 4 a 6 números"
              className="w-full px-3 py-2 border border-[#e3e3e3] rounded-lg text-sm outline-none"
            />
            {erroLogin && <p className="text-xs text-red-600">{erroLogin}</p>}
            <button
              onClick={() => {
                const nome = (document.getElementById("gateNome") as HTMLInputElement)?.value?.trim();
                const cargo = (document.getElementById("gateCargo") as HTMLInputElement)?.value?.trim();
                const pin = (document.getElementById("gatePin") as HTMLInputElement)?.value?.trim();
                if (!nome) {
                  setErroLogin("Digite seu nome.");
                  return;
                }
                if (!/^\d{4,6}$/.test(pin || "")) {
                  setErroLogin("O PIN precisa ter de 4 a 6 números.");
                  return;
                }
                setErroLogin("");
                cadastrarVendedor(
                  { nome, cargo: cargo || "", assinatura: `Atenciosamente,\n*${nome}* — Balão da Informática`, pin: pin! },
                  true
                );
              }}
              className="w-full bg-[#0f9d58] text-white py-2 rounded-lg text-sm font-bold hover:bg-[#0a6e3d] cursor-pointer"
            >
              Cadastrar e entrar
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center h-screen w-screen bg-[#f0f2f5] p-4">
        <div className="bg-white rounded-2xl shadow-md p-6 w-full max-w-sm space-y-3">
          <h1 className="text-lg font-bold text-[#202124]">🎈 Balão da Informática</h1>
          <p className="text-xs text-[#5f6368]">Digite seu PIN de vendedor para entrar no atendimento.</p>
          <input
            type="password"
            inputMode="numeric"
            autoFocus
            value={pinDigitado}
            onChange={(e) => setPinDigitado(e.target.value.replace(/\D/g, "").slice(0, 6))}
            onKeyDown={(e) => e.key === "Enter" && fazerLoginVendedor(pinDigitado)}
            placeholder="PIN"
            className="w-full px-3 py-2 border border-[#e3e3e3] rounded-lg text-center text-lg tracking-widest outline-none"
          />
          {erroLogin && <p className="text-xs text-red-600">{erroLogin}</p>}
          <button
            onClick={() => fazerLoginVendedor(pinDigitado)}
            className="w-full bg-[#0f9d58] text-white py-2 rounded-lg text-sm font-bold hover:bg-[#0a6e3d] cursor-pointer"
          >
            Entrar
          </button>
        </div>
      </div>
    );
  }

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
          <label className="text-xs font-semibold whitespace-nowrap">
            👤 Atendendo:
          </label>
          <span className="bg-white text-[#0a6e3d] rounded-full px-3 py-1 text-xs font-bold shadow-sm max-w-[170px] truncate">
            {vendedorAtivo0?.nome || "—"}
          </span>
          <button
            onClick={sairDoVendedor}
            title="Trocar de vendedor (pede o PIN de novo)"
            className="bg-white/90 hover:bg-white text-[#0a6e3d] rounded-full px-2.5 py-1 text-xs font-bold transition-all shadow-sm"
          >
            🔁 Trocar
          </button>

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

            <div className="mt-5 flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => {
                  fetch("/api/crm/status", { cache: "no-store" })
                    .then((r) => r.json())
                    .then((data) => {
                      if (data.qrCode || data.qr) setQrCodeData(data.qrCode || data.qr);
                      if (data.rawQr) setRawQrString(data.rawQr);
                      if (data.connected) setEstado("ready");
                    })
                    .catch(() => {});
                  showToast("Buscando status do QR Code...");
                }}
                className="bg-[#f0f2f5] hover:bg-[#e8eaed] text-[#202124] text-xs font-bold px-3 py-2 rounded-lg transition-colors cursor-pointer border border-[#e3e3e3]"
              >
                🔄 Verificar Conexão
              </button>

              <button
                onClick={() => {
                  setQrCodeData(null);
                  setRawQrString(null);
                  setEstado("initializing");
                  if (socketRef.current?.connected) {
                    socketRef.current.emit("panel:reset-session");
                    showToast("Gerando novo QR Code oficial do WhatsApp...");
                  } else {
                    fetch(`${serverUrl}/api/reset-session`, { method: "POST" })
                      .catch(() => fetch("/api/crm/status", { cache: "no-store" }))
                      .then(() => {
                        showToast("Gerando novo QR Code oficial do WhatsApp...");
                      });
                  }
                }}
                className="bg-[#0f9d58] hover:bg-[#0a6e3d] text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                ⚡ Gerar Novo QR Code
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
            {/* PANE 1: CHATS LIST (REAL NUMBERS & PROFILE PICTURES) */}
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

              {/* Chat list items with real profile pics and formatted numbers */}
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
                    const avatarSrc = formatAvatarUrl(chat.pic);

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
                        {/* Real Profile Avatar */}
                        <div className="w-10 h-10 rounded-full bg-[#0f9d58] text-white flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden relative shadow-xs border border-[#e3e3e3]">
                          {avatarSrc ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={avatarSrc}
                              referrerPolicy="no-referrer"
                              crossOrigin="anonymous"
                              alt=""
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
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
                const nomeFoto = e.dataTransfer.getData("text/x-foto-nome");
                if (url) {
                  setFotoUrl(url);
                  setFotoLegenda(nomeFoto || "Produto Balão");
                  setModalFotoAberto(true);
                }
              }}
              className={`flex-1 flex flex-col min-w-0 bg-[#e5ddd5] relative transition-colors ${
                fotoDragSobre ? "ring-4 ring-inset ring-[#0f9d58] bg-[#d7ecd9]" : ""
              }`}
            >
              {chatSelecionado ? (
                <>
                  {/* Header with Profile Pic & Real Number */}
                  <div className="bg-white border-b border-[#e3e3e3] p-2.5 px-4 flex items-center justify-between shrink-0 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#0f9d58] text-white flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden border border-[#e3e3e3]">
                        {formatAvatarUrl(chatSelecionado.pic) ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={formatAvatarUrl(chatSelecionado.pic)!}
                            referrerPolicy="no-referrer"
                            crossOrigin="anonymous"
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <span>{chatSelecionado.nome.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-[#202124] flex items-center gap-2">
                          {chatSelecionado.nome}
                          <span className="text-xs font-mono text-[#0a6e3d] font-semibold bg-[#e7f6ec] px-2.5 py-0.5 rounded-full border border-[#0f9d58]/30">
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
                                socketRef.current?.emit("panel:assign-seller", {
                                  chatId: chatSelecionado.id,
                                  sellerId: vendedorAtivoId,
                                });
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

                  {/* Messages Feed with Sent Product Photos Preview */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-2.5 flex flex-col">
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
                            className={`max-w-[70%] p-2.5 px-3 rounded-2xl text-xs shadow-sm break-words whitespace-pre-wrap leading-relaxed cursor-pointer ${
                              isEu
                                ? "self-end bg-[#e7f6ec] border border-[#0f9d58] rounded-tr-none text-[#202124]"
                                : "self-start bg-[#dff0fd] border border-[#a9cdf0] rounded-tl-none text-[#202124]"
                            }`}
                          >
                            {/* Quoted Message Snippet */}
                            {m.replyTo && (
                              <div className="bg-black/5 border-l-3 border-[#0f9d58] p-1.5 mb-2 rounded text-[11px] text-[#5f6368]">
                                <div className="font-bold text-[#0a6e3d]">{m.replyTo.author}</div>
                                <div className="line-clamp-2">{m.replyTo.body}</div>
                              </div>
                            )}

                            {/* Sent Product Card with Photo */}
                            {m.produto && (
                              <div className="bg-white rounded-xl border border-[#e3e3e3] p-2.5 mb-2 shadow-xs flex flex-col gap-2">
                                {m.produto.imagem && (
                                  <div className="w-full h-36 bg-[#f7f8fa] rounded-lg overflow-hidden flex items-center justify-center">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={m.produto.imagem}
                                      alt={m.produto.nome}
                                      className="max-h-full max-w-full object-contain p-1"
                                      loading="lazy"
                                    />
                                  </div>
                                )}
                                <div>
                                  <div className="font-bold text-xs text-[#202124]">{m.produto.nome}</div>
                                  <div className="text-sm font-bold text-[#0a6e3d] mt-0.5">
                                    {m.produto.precoFormatado || `R$ ${m.produto.preco.toFixed(2)}`}
                                  </div>
                                </div>
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

                            {/* Regular Photo Attachment */}
                            {m.hasMedia && m.mediaUrl && !m.produto && m.mediaType !== "document" && m.mediaType !== "audio" && (
                              <div className="w-full max-h-56 bg-black/5 rounded-lg overflow-hidden mb-2 flex items-center justify-center">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={m.mediaUrl}
                                  referrerPolicy="no-referrer"
                                  crossOrigin="anonymous"
                                  alt=""
                                  className="max-h-56 max-w-full object-contain"
                                />
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
                        title="Abrir catálogo de produtos"
                        className="bg-[#e7f6ec] text-[#0a6e3d] border border-[#0f9d58] rounded-lg p-2 text-sm font-bold hover:bg-[#0f9d58] hover:text-white transition-colors cursor-pointer"
                      >
                        📦
                      </button>

                      <label
                        title="Enviar foto do computador ou da web"
                        className="bg-[#e7f6ec] text-[#0a6e3d] border border-[#0f9d58] rounded-lg p-2 text-sm font-bold hover:bg-[#0f9d58] hover:text-white transition-colors cursor-pointer"
                      >
                        📷
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                const res = ev.target?.result as string;
                                if (res) {
                                  setFotoUrl(res);
                                  setFotoLegenda(file.name.replace(/\.[^/.]+$/, ""));
                                  setModalFotoAberto(true);
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                            e.target.value = "";
                          }}
                        />
                      </label>

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
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                const dataUrl = ev.target?.result as string;
                                setDocUpload({
                                  file: f,
                                  nome: f.name,
                                  mime: f.type || "application/octet-stream",
                                  tamanhoFormatado: `${Math.round(f.size / 1024)} KB`,
                                  dataUrl,
                                });
                                setDocLegenda("");
                                setModalDocAberto(true);
                              };
                              reader.readAsDataURL(f);
                            }
                            e.target.value = "";
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
                {/* ABA 1: CATÁLOGO (SINCRONIZADO COM O SITE / BANCO DE DADOS) */}
                {abaAtual === "catalogo" && (
                  <div className="space-y-3">
                    {/* Seletor de Modo: Preço de Venda (Site) vs Preço de Custo (+ Lucro) */}
                    <div className="bg-[#f0f2f5] p-1 rounded-xl border border-[#e3e3e3] flex gap-1 text-xs">
                      <button
                        onClick={() => setTipoPrecoCatalogo("venda")}
                        className={`flex-1 py-2 px-2 rounded-lg font-bold transition-all cursor-pointer text-center ${
                          tipoPrecoCatalogo === "venda"
                            ? "bg-[#0f9d58] text-white shadow-xs"
                            : "text-[#5f6368] hover:bg-white"
                        }`}
                      >
                        🏷️ Preço de Venda (Site)
                      </button>
                      <button
                        onClick={() => setTipoPrecoCatalogo("custo")}
                        className={`flex-1 py-2 px-2 rounded-lg font-bold transition-all cursor-pointer text-center ${
                          tipoPrecoCatalogo === "custo"
                            ? "bg-[#d97706] text-white shadow-xs"
                            : "text-[#5f6368] hover:bg-white"
                        }`}
                      >
                        📦 Preço de Custo (+ Margem)
                      </button>
                    </div>

                    {/* Explicação do Modo Ativo */}
                    <div
                      className={`rounded-xl p-2.5 text-[11px] font-semibold flex items-center justify-between border ${
                        tipoPrecoCatalogo === "venda"
                          ? "bg-[#e7f6ec] border-[#0f9d58]/40 text-[#0a6e3d]"
                          : "bg-[#fff8e1] border-[#f2c94c] text-[#7a5c00]"
                      }`}
                    >
                      <span>
                        {tipoPrecoCatalogo === "venda"
                          ? "🏷️ Modo Venda: Envia o valor exato cadastrado no site/banco de dados."
                          : "⚠️ Modo Custo: NUNCA envia no custo! Solicita o acréscimo de lucro antes de enviar."}
                      </span>
                      <button
                        onClick={() => {
                          carregarCatalogoBanco();
                          showToast("Catálogo atualizado com o banco de dados do site!");
                        }}
                        disabled={catalogoCarregando}
                        className="bg-white hover:bg-gray-100 text-[#202124] border border-gray-300 px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer shrink-0 ml-2"
                        title="Atualizar produtos direto do banco de dados"
                      >
                        {catalogoCarregando ? "Carregando…" : "🔄 Atualizar"}
                      </button>
                    </div>

                    <input
                      type="text"
                      placeholder="Buscar produto no banco de dados…"
                      value={buscaCatalogo}
                      onChange={(e) => setBuscaCatalogo(e.target.value)}
                      className="w-full px-3 py-1.5 border border-[#e3e3e3] rounded-full text-xs outline-none focus:border-[#0f9d58]"
                    />

                    {/* Filtro completo por categoria/subcategoria, logo abaixo da busca */}
                    <select
                      value={catalogoCategoriaFiltro}
                      onChange={(e) => setCatalogoCategoriaFiltro(e.target.value)}
                      className="w-full px-3 py-1.5 border border-[#e3e3e3] rounded-lg text-xs outline-none bg-white"
                    >
                      <option value="">Todas as categorias</option>
                      {catalogoCategoriasFlat.map((item) => (
                        <option key={item.category.id} value={item.category.full_path || item.category.name}>
                          {"  ".repeat(item.level)}
                          {item.category.name}
                        </option>
                      ))}
                    </select>

                    <p className="text-[10px] text-[#5f6368] px-0.5">
                      {catalogoTotal.toLocaleString("pt-BR")} produtos no total • ordenado do mais barato pro mais caro
                      {catalogoTotal > CATALOGO_PAGE_SIZE ? ` • página ${catalogoPagina} de ${Math.max(1, Math.ceil(catalogoTotal / CATALOGO_PAGE_SIZE))}` : ""}
                    </p>

                    {catalogoCarregando ? (
                      <div className="text-center py-8 bg-[#f9fafb] rounded-xl border border-dashed border-[#e3e3e3]">
                        <p className="text-xs text-[#5f6368]">Carregando produtos…</p>
                      </div>
                    ) : produtosCatalogo.length === 0 ? (
                      <div className="text-center py-8 bg-[#f9fafb] rounded-xl border border-dashed border-[#e3e3e3]">
                        <p className="text-xs text-[#5f6368]">
                          {buscaCatalogo ? "Nenhum produto encontrado para essa busca." : "Nenhum produto cadastrado no banco de dados."}
                        </p>
                        <button
                          onClick={() => carregarCatalogoBanco()}
                          className="mt-2 bg-[#0f9d58] text-white px-3 py-1.5 rounded-lg text-xs font-bold"
                        >
                          🔄 Sincronizar com o Site
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {/* Busca e categoria já filtram no servidor (carregarCatalogoBanco) */}
                        {produtosCatalogo
                          .map((prod) => (
                            <div
                              key={prod.id}
                              className="p-2.5 border border-[#e3e3e3] hover:border-[#0f9d58] rounded-xl transition-all bg-white shadow-xs flex flex-col gap-2"
                            >
                              <div className="flex items-center gap-2.5">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={prod.imagem || "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=300"}
                                  alt=""
                                  className="w-14 h-14 object-cover rounded-lg bg-gray-100 shrink-0 border border-[#e3e3e3]"
                                />
                                <div className="flex-1 min-w-0">
                                  <h5 className="font-semibold text-xs text-[#202124] line-clamp-2">
                                    {prod.nome}
                                  </h5>
                                  <div className="flex items-center justify-between mt-1">
                                    {tipoPrecoCatalogo === "venda" ? (
                                      <>
                                        <span className="font-bold text-sm text-[#0a6e3d]">
                                          {prod.precoFormatado}
                                        </span>
                                        <span className="text-[10px] text-[#0f9d58] bg-[#e7f6ec] font-bold px-1.5 py-0.5 rounded">
                                          Preço do Site
                                        </span>
                                      </>
                                    ) : (
                                      <>
                                        <span className="font-bold text-sm text-[#b45309]">
                                          Custo: R$ {prod.custo?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                        </span>
                                        <span className="text-[10px] text-[#b45309] bg-[#fff8e1] font-bold px-1.5 py-0.5 rounded">
                                          ⚠️ Custo Interno
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Ação de Envio baseada no modo selecionado */}
                              <div className="pt-1 border-t border-[#f0f2f5]">
                                {tipoPrecoCatalogo === "venda" ? (
                                  <button
                                    onClick={() => enviarProdutoDiretoAoChat(prod, prod.preco)}
                                    className="w-full bg-[#0f9d58] hover:bg-[#0a6e3d] text-white py-1.5 px-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                                    title="Enviar exatamente o preço de venda do site no WhatsApp"
                                  >
                                    ⚡ Enviar Preço do Site ({prod.precoFormatado})
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setProdutoModal(prod);
                                      const custo = prod.custo || Math.round(prod.preco * 0.75);
                                      const margemPadrao = 25;
                                      const precoVendaCalc = Math.round(custo * (1 + margemPadrao / 100));
                                      setMpCusto(String(custo));
                                      setMpMargem(String(margemPadrao));
                                      setMpPreco(String(precoVendaCalc));
                                      setMpObs("");
                                      setMpOrigem("margem");
                                      setModalProdutoAberto(true);
                                    }}
                                    className="w-full bg-[#d97706] hover:bg-[#b45309] text-white py-1.5 px-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                                    title="Adicionar valor ao custo antes de enviar ao cliente"
                                  >
                                    ➕ Adicionar Lucro e Enviar ao WhatsApp
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    )}

                    {/* Paginação: 100 produtos por página */}
                    {!catalogoCarregando && catalogoTotal > CATALOGO_PAGE_SIZE && (
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <button
                          onClick={() => setCatalogoPagina((p) => Math.max(1, p - 1))}
                          disabled={catalogoPagina === 1}
                          className="px-3 py-1.5 text-xs rounded-lg border border-[#e3e3e3] bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                          ‹ Anterior
                        </button>
                        <span className="text-[11px] font-semibold text-[#5f6368]">
                          Página {catalogoPagina} de {Math.max(1, Math.ceil(catalogoTotal / CATALOGO_PAGE_SIZE))}
                        </span>
                        <button
                          onClick={() =>
                            setCatalogoPagina((p) =>
                              Math.min(Math.max(1, Math.ceil(catalogoTotal / CATALOGO_PAGE_SIZE)), p + 1)
                            )
                          }
                          disabled={catalogoPagina >= Math.ceil(catalogoTotal / CATALOGO_PAGE_SIZE)}
                          className="px-3 py-1.5 text-xs rounded-lg border border-[#e3e3e3] bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                          Próxima ›
                        </button>
                      </div>
                    )}
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
                                onDragStart={(e) => {
                                  e.dataTransfer.setData("text/plain", url);
                                  e.dataTransfer.setData("text/x-foto-nome", title);
                                }}
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
                      <input
                        type="text"
                        id="novoVendedorPin"
                        inputMode="numeric"
                        placeholder="PIN de acesso (4 a 6 números)"
                        className="w-full px-2.5 py-1.5 border border-[#e3e3e3] rounded-lg text-xs bg-white outline-none"
                      />
                      <button
                        onClick={() => {
                          const n = (document.getElementById("novoVendedorNome") as HTMLInputElement)?.value;
                          const c = (document.getElementById("novoVendedorCargo") as HTMLInputElement)?.value;
                          const a = (document.getElementById("novoVendedorAssinatura") as HTMLTextAreaElement)?.value;
                          const p = (document.getElementById("novoVendedorPin") as HTMLInputElement)?.value?.trim();
                          if (!n || !n.trim()) {
                            showToast("Digite o nome do vendedor");
                            return;
                          }
                          if (!/^\d{4,6}$/.test(p || "")) {
                            showToast("O PIN precisa ter de 4 a 6 números");
                            return;
                          }
                          cadastrarVendedor(
                            {
                              nome: n.trim(),
                              cargo: c?.trim() || "Atendente Balão",
                              assinatura: a?.trim() || `Atenciosamente,\n*${n.trim()}* — Balão da Informática`,
                              pin: p!,
                            },
                            false
                          );
                          (document.getElementById("novoVendedorNome") as HTMLInputElement).value = "";
                          (document.getElementById("novoVendedorCargo") as HTMLInputElement).value = "";
                          (document.getElementById("novoVendedorAssinatura") as HTMLTextAreaElement).value = "";
                          (document.getElementById("novoVendedorPin") as HTMLInputElement).value = "";
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
                              {String(v.id) === String(vendedorAtivoId) && (
                                <span className="px-2.5 py-1 rounded text-xs font-bold bg-[#0f9d58] text-white">
                                  Ativo ✓
                                </span>
                              )}
                              <button
                                onClick={() => {
                                  if (confirm(`Remover vendedor ${v.nome}? Ele vai precisar ser recadastrado com um novo PIN.`)) {
                                    socketRef.current?.emit("panel:remove-vendedor", { id: v.id });
                                    if (String(v.id) === String(vendedorAtivoId)) sairDoVendedor();
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
                            intervalMin: disparoIntervalo,
                            intervalMax: disparoIntervaloMax,
                          });
                        } else setDisparoAtivo(false);
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
                        <div className="flex items-center gap-3 p-3 bg-[#f0f2f5] rounded-xl border border-[#e3e3e3]">
                          <div className="w-12 h-12 rounded-full bg-[#0f9d58] text-white flex items-center justify-center font-bold text-base shrink-0 overflow-hidden border border-[#e3e3e3]">
                            {formatAvatarUrl(chatSelecionado.pic) ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={formatAvatarUrl(chatSelecionado.pic)!}
                                referrerPolicy="no-referrer"
                                crossOrigin="anonymous"
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span>{chatSelecionado.nome.charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-xs text-[#202124]">{chatSelecionado.nome}</div>
                            <div className="text-xs font-mono text-[#0a6e3d] font-semibold mt-0.5">
                              {formatarNumeroExibicao(chatSelecionado.numero)}
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold uppercase text-[#5f6368]">Nome do Cliente</label>
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
                          <label className="text-[10px] font-bold uppercase text-[#5f6368]">Telefone Real</label>
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
                            value={getKanbanCol(chatSelecionado.id)}
                            onChange={(e) => {
                              setKanbanCol(chatSelecionado.id, e.target.value);
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

                        {/* Histórico de Produtos Enviados com Fotos */}
                        {chatSelecionado.produtosEnviados && chatSelecionado.produtosEnviados.length > 0 && (
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-[#5f6368]">
                              📦 Produtos Ofertados ({chatSelecionado.produtosEnviados.length})
                            </label>
                            <div className="space-y-1.5 max-h-40 overflow-y-auto">
                              {chatSelecionado.produtosEnviados.map((p, idx) => (
                                <div key={idx} className="p-2 bg-[#f0f2f5] rounded-lg border border-[#e3e3e3] text-[11px] flex items-center gap-2">
                                  {p.imagem && (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img src={p.imagem} alt="" className="w-9 h-9 object-cover rounded bg-white shrink-0 border border-[#e3e3e3]" />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <div className="truncate font-semibold text-[#202124]">{p.nome}</div>
                                    <div className="text-[10px] text-[#5f6368]">{formatHora(p.timestamp)}</div>
                                  </div>
                                  <b className="text-[#0a6e3d] shrink-0">R$ {p.preco.toFixed(2)}</b>
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
                  const cardsNaColuna = chats
                    .filter((c) => isRealDirectChat(c.id))
                    .filter((c) => {
                      const matchCol = getKanbanCol(c.id) === col.id;
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
                      data-kanban-col={col.id}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => kanbanDrop(col.id)}
                      className="w-56 bg-[#f0f2f5] border border-[#e3e3e3] rounded-xl flex flex-col h-full max-h-full shrink-0 shadow-sm"
                    >
                      {/* Col Top — clicar traz a coluna pro centro da tela, sem precisar rolar manualmente */}
                      <div
                        onClick={(e) =>
                          e.currentTarget
                            .closest("[data-kanban-col]")
                            ?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" })
                        }
                        className="p-2 px-3 border-b border-[#e3e3e3] bg-white rounded-t-xl flex items-center justify-between shrink-0 cursor-pointer hover:bg-[#f8f9fa]"
                        title="Clique para centralizar esta coluna"
                      >
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

                      {/* Cards list with profile pic */}
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
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-[#0f9d58] text-white flex items-center justify-center font-bold text-[10px] shrink-0 overflow-hidden">
                                  {formatAvatarUrl(card.pic) ? (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img
                                      src={formatAvatarUrl(card.pic)!}
                                      referrerPolicy="no-referrer"
                                      crossOrigin="anonymous"
                                      alt=""
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <span>{card.nome.charAt(0).toUpperCase()}</span>
                                  )}
                                </div>
                                <div className="font-bold text-xs text-[#202124] hover:text-[#0a6e3d] truncate flex-1">
                                  {card.nome}
                                </div>
                                {card.precisaAtencao && (
                                  <span className="text-[10px]" title="Precisa de atenção">⚠️</span>
                                )}
                              </div>

                              <div className="text-[10px] font-mono text-[#0a6e3d] font-semibold mt-1">
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
                    const avatarSrc = formatAvatarUrl(feed.profilePicUrl);
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
                          {avatarSrc ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={avatarSrc}
                              referrerPolicy="no-referrer"
                              crossOrigin="anonymous"
                              alt=""
                              className="w-full h-full object-cover rounded-full"
                            />
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
                    <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden">
                      {formatAvatarUrl(statusSelecionadoFeed.profilePicUrl) ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={formatAvatarUrl(statusSelecionadoFeed.profilePicUrl)!}
                          referrerPolicy="no-referrer"
                          crossOrigin="anonymous"
                          alt=""
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <span>{statusSelecionadoFeed.contactName.charAt(0).toUpperCase()}</span>
                      )}
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
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
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

      {/* MODAL PRODUTO: Definir Preço de Venda com Envio Direto ao Chat */}
      {modalProdutoAberto && produtoModal && (
        <div className="fixed inset-0 bg-black/55 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-4 space-y-3">
            <div className="flex justify-between items-center border-b border-[#e3e3e3] pb-2">
              <strong className="text-xs text-[#202124]">
                Enviar produto com margem/preço personalizado
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
                className="w-20 h-20 object-cover rounded-lg bg-gray-100 shrink-0 border border-[#e3e3e3]"
              />
              <div className="min-w-0 flex-1">
                <div className="font-bold text-xs text-[#202124]">{produtoModal.nome}</div>
                <div className="text-[11px] text-[#5f6368]">
                  Fornecedor: {produtoModal.fornecedor || "Balão"}
                </div>
              </div>
            </div>

            <div className="bg-[#fee2e2] border-2 border-[#ef4444] rounded-xl p-3 text-xs text-[#991b1b] font-semibold space-y-1">
              <div className="flex items-center gap-1.5 text-red-700 font-bold text-xs uppercase">
                ⛔ ATENÇÃO: NUNCA ENVIE PELO PREÇO DE CUSTO!
              </div>
              <p className="text-[11px] leading-relaxed text-[#7f1d1d]">
                O custo interno no estoque é <b>R$ {Number(mpCusto || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</b>.
                Defina o acréscimo de lucro ou margem (%) abaixo. O cliente receberá no WhatsApp <b>apenas o preço final de venda</b>.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between gap-2">
                <label className="text-[#5f6368] font-semibold">Custo Interno (R$)</label>
                <input
                  type="number"
                  value={mpCusto}
                  onChange={(e) => {
                    setMpCusto(e.target.value);
                    if (mpOrigem === "margem") sincronizarPreco(e.target.value, mpMargem);
                    else sincronizarMargem(e.target.value, mpPreco);
                  }}
                  className="w-32 p-1.5 border border-[#e3e3e3] rounded-lg font-mono text-right bg-gray-50 text-gray-700"
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <label className="text-[#5f6368] font-semibold">Margem de Lucro (%)</label>
                <input
                  type="number"
                  value={mpMargem}
                  onChange={(e) => {
                    setMpMargem(e.target.value);
                    setMpOrigem("margem");
                    sincronizarPreco(mpCusto, e.target.value);
                  }}
                  className="w-32 p-1.5 border border-[#e3e3e3] rounded-lg font-mono text-right font-bold text-[#b45309]"
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <label className="text-[#5f6368] font-semibold">Preço Final de Venda (R$)</label>
                <input
                  type="number"
                  value={mpPreco}
                  onChange={(e) => {
                    setMpPreco(e.target.value);
                    setMpOrigem("preco");
                    sincronizarMargem(mpCusto, e.target.value);
                  }}
                  className="w-32 p-1.5 border-2 border-[#0f9d58] rounded-lg font-bold font-mono text-right text-[#0a6e3d] text-sm"
                />
              </div>
            </div>

            <div className="bg-[#e8f5e9] border border-[#a5d6a7] rounded-lg p-2.5 text-center font-bold text-sm text-[#0f9d58]">
              Preço enviado ao WhatsApp: R$ {Number(mpPreco || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              {Number(mpPreco || 0) > Number(mpCusto || 0) && (
                <span className="block text-[11px] font-normal text-[#0a6e3d] mt-0.5">
                  (Lucro Bruto: +R$ {(Number(mpPreco) - Number(mpCusto)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })})
                </span>
              )}
            </div>

            <textarea
              rows={2}
              placeholder="Observação ou condição especial (ex: À vista no Pix com frete grátis)..."
              value={mpObs}
              onChange={(e) => setMpObs(e.target.value)}
              className="w-full p-2 border border-[#e3e3e3] rounded-lg text-xs"
            />

            <button
              onClick={() => {
                if (!produtoModal) return;
                const precoFinal = Number(mpPreco) || 0;
                const custo = Number(mpCusto) || 0;
                if (precoFinal <= custo) {
                  showToast("⚠️ Preço de envio deve ser MAIOR que o custo!");
                  alert("ERRO: O produto nunca deve ser enviado pelo preço de custo. Adicione uma margem de lucro para enviar!");
                  return;
                }
                enviarProdutoDiretoAoChat(produtoModal, precoFinal, mpObs);
                setModalProdutoAberto(false);
                showToast(`Oferta enviada por R$ ${precoFinal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}! ⚡`);
              }}
              className="w-full bg-[#0f9d58] hover:bg-[#0a6e3d] text-white py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              ➤ Confirmar e Enviar ao WhatsApp
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
                if (!chatSelecionado || !docUpload) return;
                const legendaFinal = docLegenda.trim() || docUpload.nome;
                const novaMsg: CrmMensagem = {
                  id: `msg-doc-${Date.now()}`,
                  chatId: chatSelecionado.id,
                  from: "balao",
                  body: legendaFinal,
                  direction: "out",
                  timestamp: Date.now(),
                  hasMedia: true,
                  mediaType: "document",
                  mediaName: docUpload.nome,
                  mediaUrl: docUpload.dataUrl,
                  status: "sent",
                };
                setMensagens((prev) => [...prev, novaMsg]);
                setChats((prev) =>
                  prev.map((c) =>
                    c.id === chatSelecionado.id
                      ? {
                          ...c,
                          lastMessage: `📄 ${docUpload.nome}`,
                          timestamp: Date.now(),
                        }
                      : c
                  )
                );

                if (socketRef.current?.connected) {
                  socketRef.current.emit("panel:send-media", {
                    chatId: chatSelecionado.id,
                    number: chatSelecionado.numero,
                    dataUrl: docUpload.dataUrl,
                    base64: docUpload.dataUrl ? docUpload.dataUrl.split(",")[1] : undefined,
                    mimetype: docUpload.mime,
                    filename: docUpload.nome,
                    caption: docLegenda.trim(),
                    sendMediaAsDocument: true,
                  });
                } else fetch(`${serverUrl}/api/enviar-documento`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    chat: chatSelecionado.id,
                    number: chatSelecionado.numero,
                    dataUrl: docUpload.dataUrl,
                    base64: docUpload.dataUrl ? docUpload.dataUrl.split(",")[1] : undefined,
                    mimetype: docUpload.mime,
                    nome: docUpload.nome,
                    legenda: docLegenda.trim(),
                  }),
                }).catch(() => {});

                setModalDocAberto(false);
                setDocUpload(null);
                setDocLegenda("");
                showToast("Documento enviado ao cliente! 📄 ✓");
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
                if (!chatSelecionado || !fotoUrl) return;
                const legendaFinal = fotoLegenda.trim();
                const novaMsg: CrmMensagem = {
                  id: `msg-media-${Date.now()}`,
                  chatId: chatSelecionado.id,
                  from: "balao",
                  body: legendaFinal ? `📷 ${legendaFinal}` : "📷 [Foto]",
                  direction: "out",
                  timestamp: Date.now(),
                  hasMedia: true,
                  mediaUrl: fotoUrl,
                  status: "sent",
                };
                setMensagens((prev) => [...prev, novaMsg]);
                setChats((prev) =>
                  prev.map((c) =>
                    c.id === chatSelecionado.id
                      ? {
                          ...c,
                          lastMessage: legendaFinal ? `📷 ${legendaFinal}` : "📷 Foto",
                          timestamp: Date.now(),
                        }
                      : c
                  )
                );

                if (socketRef.current?.connected) {
                  socketRef.current.emit("panel:send-media", {
                    chatId: chatSelecionado.id,
                    number: chatSelecionado.numero,
                    url: fotoUrl.startsWith("http") ? fotoUrl : undefined,
                    dataUrl: fotoUrl.startsWith("data:") ? fotoUrl : undefined,
                    base64: fotoUrl.startsWith("data:") ? fotoUrl.split(",")[1] : undefined,
                    mimetype: fotoUrl.startsWith("data:") ? fotoUrl.split(";")[0].replace("data:", "") : "image/jpeg",
                    caption: legendaFinal,
                  });
                } else fetch(`${serverUrl}/api/enviar-foto`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    chat: chatSelecionado.id,
                    number: chatSelecionado.numero,
                    url: fotoUrl.startsWith("http") ? fotoUrl : undefined,
                    dataUrl: fotoUrl.startsWith("data:") ? fotoUrl : undefined,
                    base64: fotoUrl.startsWith("data:") ? fotoUrl.split(",")[1] : undefined,
                    mimetype: fotoUrl.startsWith("data:") ? fotoUrl.split(";")[0].replace("data:", "") : "image/jpeg",
                    legenda: legendaFinal,
                  }),
                }).catch(() => {});

                setModalFotoAberto(false);
                setFotoLegenda("");
                showToast("Foto enviada ao destinatário! 📷 ✓");
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
