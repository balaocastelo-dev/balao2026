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
  CrmRespostaRapida,
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

export default function CrmWhatsAppClient() {
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const serverUrl =
    process.env.NEXT_PUBLIC_WHATSAPP_PANEL_SERVER_URL || "http://localhost:4100";

  // Connection State
  const [estado, setEstado] = useState<WhatsAppStatus>("initializing");
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [rawQrString, setRawQrString] = useState<string | null>(null);
  const [numeroConectado, setNumeroConectado] = useState<string | null>(null);
  const [nomeConectado, setNomeConectado] = useState<string | null>(null);
  const [qrCountdown, setQrCountdown] = useState<number>(25);

  // Vendedor State (Empty by default, no fake names)
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
      const s = localStorage.getItem("balao_crm_vendedor_ativo");
      if (s) return s;
    }
    return null;
  });
  const [assinaturaAuto, setAssinaturaAuto] = useState(true);

  // Chats and Messages (Empty by default, no fake chats)
  const [chats, setChats] = useState<CrmChat[]>(() => {
    if (typeof window !== "undefined") {
      const s = localStorage.getItem("balao_crm_chats");
      if (s) {
        try { return JSON.parse(s); } catch {}
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

  // Respostas Rápidas & Etiquetas
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

  // Modals
  const [modalProdutoAberto, setModalProdutoAberto] = useState(false);
  const [produtoModal, setProdutoModal] = useState<CrmProdutoCatalogo | null>(null);
  const [mpCusto, setMpCusto] = useState("0");
  const [mpMargem, setMpMargem] = useState("25");
  const [mpPreco, setMpPreco] = useState("0");
  const [mpObs, setMpObs] = useState("");

  const [modalFotoAberto, setModalFotoAberto] = useState(false);
  const [fotoUrl, setFotoUrl] = useState("");
  const [fotoLegenda, setFotoLegenda] = useState("");

  const [modalNovaConversa, setModalNovaConversa] = useState(false);
  const [novoNumero, setNovoNumero] = useState("");
  const [novoNome, setNovoNome] = useState("");
  const [novaMsgInicial, setNovaMsgInicial] = useState("");

  // Disparo State
  const [disparoTexto, setDisparoTexto] = useState(
    "Olá {nome}! Tudo bem? Passando para te avisar das novidades aqui no Balão da Informática Castelo Campinas!"
  );
  const [disparoIntervalo, setDisparoIntervalo] = useState(15);
  const [disparoExecutando, setDisparoExecutando] = useState(false);
  const [disparoProgresso, setDisparoProgresso] = useState({ enviados: 0, total: 0 });

  // Persistence
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("balao_crm_chats", JSON.stringify(chats));
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

  // Load Real Catalog from /api/products
  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const list: CrmProdutoCatalogo[] = data.slice(0, 60).map((p: any) => {
            const precoNum =
              typeof p.price === "number"
                ? p.price
                : parseFloat(String(p.price).replace(/[^0-9.]/g, "")) || 499;
            const custoNum = Math.round(precoNum * 0.78);
            return {
              id: String(p.id),
              nome: p.name,
              preco: precoNum,
              custo: custoNum,
              margem: 28,
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

  // Poll Real WhatsApp Status & QR Code via /api/crm/status only when NOT connected
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

  // Socket.IO Integration with whatsapp-server
  useEffect(() => {
    const socket = io(serverUrl, {
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnectionAttempts: 20,
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
      if (payload?.qrCode) {
        setQrCodeData(payload.qrCode);
      }
      if (payload?.rawQr) {
        setRawQrString(payload.rawQr);
      }
      if (payload?.phoneNumber) {
        setNumeroConectado(payload.phoneNumber);
      }
    });

    socket.on("whatsapp:chats", (serverChats: any[]) => {
      if (Array.isArray(serverChats) && serverChats.length > 0) {
        setChats((prev) => {
          const merged = [...prev];
          serverChats.forEach((sc) => {
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
          return merged.sort((a, b) => b.timestamp - a.timestamp);
        });
      }
    });

    socket.on("whatsapp:messages", (serverMsgs: any[]) => {
      if (Array.isArray(serverMsgs) && serverMsgs.length > 0) {
        setMensagens((prev) => {
          const map = new Map<string, CrmMensagem>();
          prev.forEach((m) => map.set(m.id, m));
          serverMsgs.forEach((sm) => {
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

      // Update or insert chat
      setChats((prev) => {
        const idx = prev.findIndex((c) => c.id === newMsg.chatId);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = {
            ...copy[idx],
            lastMessage: newMsg.body || "",
            timestamp: newMsg.timestamp || Date.now(),
            unread: newMsg.direction === "in" ? copy[idx].unread + 1 : copy[idx].unread,
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

  // QR countdown
  useEffect(() => {
    if (estado !== "qr" && estado !== "initializing") return;
    const t = setInterval(() => {
      setQrCountdown((prev) => (prev <= 1 ? 25 : prev - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [estado]);

  // Scroll to bottom on messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens, chatSelecionadoId]);

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
    let list = chats.filter((c) => {
      const b = buscaChat.trim().toLowerCase();
      if (!b) return true;
      return (c.nome + " " + c.numero).toLowerCase().includes(b);
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
      status: "sent",
    };

    setMensagens((prev) => [...prev, novaMsg]);
    setChats((prev) =>
      prev.map((c) =>
        c.id === chatSelecionado.id
          ? { ...c, lastMessage: textoFinal, timestamp: Date.now(), unread: 0 }
          : c
      )
    );

    if (socketRef.current?.connected) {
      socketRef.current.emit("panel:send-message", {
        number: chatSelecionado.numero,
        text: textoFinal,
        chatId: chatSelecionado.id,
      });
    }

    setCampoTexto("");
    showToast("Mensagem enviada ✓");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      enviarMensagem();
    }
  };

  // Quick reply click
  const inserirRespostaRapida = (resp: CrmRespostaRapida) => {
    let t = resp.texto;
    if (chatSelecionado) {
      const primeiroNome = chatSelecionado.nome.split(" ")[0];
      t = t.replace(/{nome}/g, chatSelecionado.nome).replace(/{primeiro_nome}/g, primeiroNome);
    }
    setCampoTexto((prev) => (prev ? `${prev}\n${t}` : t));
    showToast(`Resposta "${resp.titulo}" inserida`);
  };

  // Open Product Modal
  const abrirModalProduto = (p: CrmProdutoCatalogo) => {
    setProdutoModal(p);
    setMpCusto(String(p.custo || Math.round(p.preco * 0.75)));
    setMpMargem(String(p.margem || 25));
    setMpPreco(String(p.preco));
    setMpObs("");
    setModalProdutoAberto(true);
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
  const toggleEtiquetaNoChat = (nomeEtiqueta: string) => {
    if (!chatSelecionado) return;
    const jaTem = chatSelecionado.tags.includes(nomeEtiqueta);
    const novasTags = jaTem
      ? chatSelecionado.tags.filter((t) => t !== nomeEtiqueta)
      : [...chatSelecionado.tags, nomeEtiqueta];

    setChats((prev) =>
      prev.map((c) => (c.id === chatSelecionado.id ? { ...c, tags: novasTags } : c))
    );
    showToast(jaTem ? "Etiqueta removida" : `Etiqueta "${nomeEtiqueta}" aplicada ✅`);
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

  // Check if we have a real authentic QR code
  const temQrReal = Boolean(
    (qrCodeData && qrCodeData.startsWith("data:image")) ||
    (rawQrString && rawQrString.length > 20)
  );

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#f0f2f5] text-[#202124] font-['Segoe_UI',Tahoma,Arial,sans-serif]">
      {/* HEADER TOPBAR (Identical to reference system) */}
      <header className="bg-[#0f9d58] text-white px-4 py-2.5 shadow-sm z-20 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold flex items-center gap-1.5">
            🎈 <b>Balão da Informática</b> <small className="font-normal opacity-85 text-xs">CRM WhatsApp</small>
          </span>
        </div>

        {/* Vendedor Selector */}
        <div className="flex items-center gap-2.5 flex-1 justify-center max-w-xl">
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
              className="bg-white text-[#202124] border-none rounded-full px-3 py-1 text-xs font-semibold outline-none shadow-sm max-w-[180px]"
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
              ? `Conectado ✓ ${numeroConectado ? `(${numeroConectado})` : ""}`
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

      {/* SCREEN 1: QR CODE SCREEN (When not connected) */}
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

      {/* SCREEN 2: MAIN DASHBOARD & KANBAN (When connected) */}
      {isConnected && (
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          {/* Main 3 Panels Row */}
          <div className="flex-1 flex overflow-hidden min-h-0">
            {/* PANE 1: CHATS LIST */}
            <aside className="w-72 bg-white border-r border-[#e3e3e3] flex flex-col shrink-0">
              <div className="p-3 pb-1.5 font-bold text-sm text-[#202124]">Conversas</div>

              <div className="px-3 py-1.5 space-y-1.5">
                <input
                  type="text"
                  placeholder="Buscar conversa…"
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
                className="mx-3 my-1.5 bg-[#0f9d58] hover:bg-[#0a6e3d] text-white py-1.5 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                ＋ Nova conversa
              </button>

              <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1">
                {chatsFiltrados.length === 0 ? (
                  <div className="text-center text-xs text-[#5f6368] py-8">
                    {filtroNaoLidas ? "Nenhuma conversa não lida." : "Nenhuma conversa encontrada."}
                  </div>
                ) : (
                  chatsFiltrados.map((chat) => {
                    const isAtivo = chat.id === chatSelecionadoId;
                    const ini = (chat.nome || "?").trim().charAt(0).toUpperCase();

                    return (
                      <div
                        key={chat.id}
                        onClick={() => {
                          setChatSelecionadoId(chat.id);
                          setChats((prev) =>
                            prev.map((c) => (c.id === chat.id ? { ...c, unread: 0 } : c))
                          );
                        }}
                        className={`flex items-center gap-2.5 p-2 rounded-xl cursor-pointer transition-colors ${
                          isAtivo
                            ? "bg-[#e7f6ec]"
                            : chat.unread > 0
                            ? "bg-[#eef7ee] hover:bg-[#e7f6ec]"
                            : "hover:bg-[#f0f2f5]"
                        }`}
                      >
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-[#0f9d58] text-white flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden relative">
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
                        </div>

                        {/* Infos */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4
                              className={`text-xs truncate ${
                                chat.unread > 0 ? "font-bold text-[#202124]" : "font-semibold text-[#202124]"
                              }`}
                            >
                              {chat.nome}
                            </h4>
                            <span className="text-[10px] text-[#5f6368] font-mono">
                              {formatHora(chat.timestamp)}
                            </span>
                          </div>

                          <p
                            className={`text-[11px] truncate mt-0.5 ${
                              chat.unread > 0
                                ? "text-[#0a6e3d] font-semibold"
                                : "text-[#5f6368]"
                            }`}
                          >
                            {chat.lastMessage || "Sem mensagens"}
                          </p>

                          {chat.tags && chat.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {chat.tags.map((t) => (
                                <span
                                  key={t}
                                  className="text-[9px] text-white px-1.5 py-0.2 rounded-full font-bold"
                                  style={{ backgroundColor: getCorEtiqueta(t) }}
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </aside>

            {/* PANE 2: CONVERSA ATIVA */}
            <section className="flex-1 flex flex-col min-w-0 bg-[#e5ddd5]">
              {chatSelecionado ? (
                <>
                  {/* Header */}
                  <div className="bg-white border-b border-[#e3e3e3] p-2.5 px-4 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#0f9d58] text-white flex items-center justify-center font-bold text-sm shrink-0">
                        {chatSelecionado.nome.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-[#202124] flex items-center gap-2">
                          {chatSelecionado.nome}
                          <span className="text-xs font-mono text-[#5f6368] font-normal">
                            {chatSelecionado.numero}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {chatSelecionado.tags.map((t) => (
                            <span
                              key={t}
                              className="text-[9px] text-white px-1.5 py-0.2 rounded-full font-bold"
                              style={{ backgroundColor: getCorEtiqueta(t) }}
                            >
                              {t}
                            </span>
                          ))}
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
                            className={`max-w-[65%] p-2 px-3 rounded-xl text-xs shadow-sm break-words whitespace-pre-wrap leading-relaxed ${
                              isEu
                                ? "self-end bg-[#e7f6ec] border border-[#0f9d58] rounded-tr-none text-[#202124]"
                                : "self-start bg-[#dff0fd] border border-[#a9cdf0] rounded-tl-none text-[#202124]"
                            }`}
                          >
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
                  <div className="bg-white border-t border-[#e3e3e3] p-2.5 px-3">
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

                      <textarea
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

            {/* PANE 3: PANE LATERAL (7 Abas) */}
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
                    <input
                      type="text"
                      placeholder="Buscar produto no catálogo…"
                      value={buscaCatalogo}
                      onChange={(e) => setBuscaCatalogo(e.target.value)}
                      className="w-full px-3 py-1.5 border border-[#e3e3e3] rounded-full text-xs outline-none focus:border-[#0f9d58]"
                    />

                    <div className="space-y-2">
                      {produtosCatalogo
                        .filter(
                          (p) =>
                            !buscaCatalogo ||
                            p.nome.toLowerCase().includes(buscaCatalogo.toLowerCase()) ||
                            p.categoria.toLowerCase().includes(buscaCatalogo.toLowerCase())
                        )
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
                                  Custo: R$ {prod.custo}
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
                    <p className="text-[11px] text-[#5f6368]">
                      Clique para visualizar e enviar fotos de produtos ou comprovantes diretamente para a conversa.
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {produtosCatalogo.map((prod) => (
                        <div
                          key={prod.id}
                          onClick={() => {
                            setFotoUrl(prod.imagem);
                            setFotoLegenda(prod.nome);
                            setModalFotoAberto(true);
                          }}
                          className="border border-[#e3e3e3] rounded-xl p-1.5 hover:border-[#0f9d58] cursor-pointer text-center bg-white shadow-sm"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={prod.imagem}
                            alt=""
                            className="w-full h-24 object-contain rounded-lg bg-[#f7f8fa]"
                          />
                          <p className="text-[10px] font-bold text-[#202124] truncate mt-1">
                            {prod.nome}
                          </p>
                        </div>
                      ))}
                    </div>
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
                      ⚠️ <b>Proteção Anti-Ban:</b> O sistema aplica um intervalo de segurança entre cada mensagem disparada.
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#202124] mb-1">
                        Mensagem da Campanha
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
                        <span className="font-bold text-[#0a6e3d]">{disparoIntervalo}s</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="60"
                        value={disparoIntervalo}
                        onChange={(e) => setDisparoIntervalo(Number(e.target.value))}
                        className="w-full accent-[#0f9d58]"
                      />
                    </div>

                    <div className="bg-[#f0f2f5] p-3 rounded-xl border border-[#e3e3e3] text-center">
                      <div className="text-xs text-[#5f6368]">Destinatários na Base</div>
                      <div className="text-lg font-black text-[#202124]">{chats.length} contatos</div>
                    </div>

                    <button
                      onClick={() => {
                        if (!chats.length || !disparoTexto.trim()) return;
                        setDisparoExecutando(true);
                        setDisparoProgresso({ enviados: 0, total: chats.length });

                        const recipients = chats.map((c) => ({ number: c.numero, chatId: c.id }));
                        if (socketRef.current?.connected) {
                          socketRef.current.emit("panel:send-segmented", {
                            recipients,
                            text: disparoTexto,
                          });
                        }
                        showToast(`Disparo iniciado para ${chats.length} contatos!`);
                      }}
                      disabled={disparoExecutando || chats.length === 0}
                      className="w-full bg-[#0f9d58] hover:bg-[#0a6e3d] disabled:opacity-50 text-white py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      {disparoExecutando ? "Disparando mensagens..." : `Iniciar Disparo (${chats.length})`}
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
                            value={chatSelecionado.numero}
                            className="w-full p-2 border border-[#e3e3e3] rounded-lg text-xs bg-[#f0f2f5] font-mono"
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

          {/* BOTTOM KANBAN TRAY (.kanban-barra identical to reference) */}
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
                      c.numero.includes(kanbanBusca);
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
                              className="bg-white border border-[#e3e3e3] rounded-lg p-2 shadow-xs cursor-grab active:cursor-grabbing hover:border-[#0f9d58] transition-all"
                            >
                              <div className="font-bold text-xs text-[#202124] hover:text-[#0a6e3d] truncate">
                                {card.nome}
                              </div>
                              <div className="text-[10px] text-[#5f6368] truncate mt-0.5">
                                {card.lastMessage || card.numero}
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

      {/* MODAL PRODUTO: Definir Preço de Venda */}
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
                <div className="text-[11px] text-[#5f6368]">{produtoModal.categoria}</div>
              </div>
            </div>

            <div className="bg-[#fff8e1] border border-[#f2c94c] rounded-lg p-2 text-[11px] text-[#7a5c00]">
              ⚠️ Defina o custo e a margem de lucro para calcular o preço de venda enviado no WhatsApp.
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between gap-2">
                <label className="text-[#5f6368] font-semibold">Custo (R$)</label>
                <input
                  type="number"
                  value={mpCusto}
                  onChange={(e) => {
                    const c = Number(e.target.value) || 0;
                    setMpCusto(e.target.value);
                    const m = Number(mpMargem) || 0;
                    setMpPreco(String(Math.round(c * (1 + m / 100))));
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
                    const m = Number(e.target.value) || 0;
                    setMpMargem(e.target.value);
                    const c = Number(mpCusto) || 0;
                    setMpPreco(String(Math.round(c * (1 + m / 100))));
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
                    const p = Number(e.target.value) || 0;
                    setMpPreco(e.target.value);
                    const c = Number(mpCusto) || 1;
                    setMpMargem(String(Math.round(((p - c) / c) * 100)));
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
              ➤ Inserir Oferta no Chat
            </button>
          </div>
        </div>
      )}

      {/* MODAL FOTO: Visualizar & Enviar Foto */}
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
                  body: `📷 [Foto Enviada]: ${fotoLegenda || "Imagem do Produto"}`,
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
                  placeholder="Ex: 19981188090"
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

      {/* TOAST NOTIFICATION (#toast) */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[99999] bg-[#323232] text-white px-5 py-2.5 rounded-full text-xs font-semibold shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-200">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
