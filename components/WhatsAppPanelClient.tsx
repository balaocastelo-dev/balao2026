"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarClock,
  CheckCircle2,
  LoaderCircle,
  MessageCircle,
  MessageSquareReply,
  Plus,
  QrCode,
  RefreshCcw,
  Send,
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

  useEffect(() => {
    if (!selectedChatId && chatList[0]) {
      setSelectedChatId(chatList[0].chatId);
    }
  }, [chatList, selectedChatId]);

  const selectedChatMessages = useMemo(() => {
    return messages.filter((item) => item.chatId === selectedChatId);
  }, [messages, selectedChatId]);

  const selectedChatLabels = chatLabels[selectedChatId] || [];
  const sendSocketEvent = (event: string, payload: Record<string, unknown>) => {
    socketRef.current?.emit(event, payload);
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

  return (
    <div className="min-h-screen bg-[#fff7f7] text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="mb-8 overflow-hidden rounded-3xl border border-red-100 bg-white shadow-[0_20px_60px_rgba(239,68,68,0.08)]">
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-7 text-white">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-red-100">
                  Balao da Informatica
                </p>
                <h1 className="mt-2 text-3xl font-black md:text-4xl">Painel de WhatsApp</h1>
                <p className="mt-3 max-w-2xl text-sm text-red-50 md:text-base">
                  QR Code, chat em tempo real, etiquetas, assinaturas por vendedor,
                  respostas rapidas e agendamento individual de mensagens.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
                  <div className="flex items-center gap-2 text-sm font-bold">
                    {socketConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
                    Conexao
                  </div>
                  <p className="mt-2 text-sm text-red-50">
                    {socketConnected ? "Servidor online" : "Aguardando servidor"}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <CheckCircle2 size={16} />
                    Sessao
                  </div>
                  <p className="mt-2 text-sm text-red-50">
                    {session ? "LocalAuth ativo" : "Sem sessao salva"}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <UserRound size={16} />
                    Numero
                  </div>
                  <p className="mt-2 text-sm text-red-50">{phoneNumber || "Nao conectado"}</p>
                </div>
              </div>
            </div>
          </div>

          {toast ? (
            <div className="border-t border-red-100 bg-red-50 px-6 py-3 text-sm font-medium text-red-700">
              {toast}
            </div>
          ) : null}
        </div>

        <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)_340px]">
          <div className="space-y-6">
            <section className="rounded-3xl border border-red-100 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <QrCode className="text-red-600" />
                <h2 className="text-xl font-black">Conexao e QR Code</h2>
              </div>
              <div className="rounded-2xl border border-dashed border-red-200 bg-[#fffafa] p-4 text-center">
                {!socketConnected ? (
                  <>
                    <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                      <WifiOff className="text-red-600" />
                    </div>
                    <p className="font-bold text-slate-900">Servidor do WhatsApp offline</p>
                    <p className="mt-2 text-sm text-slate-500">
                      O site abriu, mas o servidor Node do WhatsApp nao esta conectado.
                    </p>
                  </>
                ) : status === "ready" && !qrCode ? (
                  <>
                    <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                      <CheckCircle2 className="text-green-600" />
                    </div>
                    <p className="font-bold text-slate-900">WhatsApp conectado</p>
                    <p className="mt-2 text-sm text-slate-500">
                      O QR Code fica oculto enquanto a sessao estiver ativa.
                    </p>
                  </>
                ) : qrCode ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qrCode}
                      alt="QR Code do WhatsApp"
                      className="mx-auto w-full max-w-[240px] rounded-2xl border border-red-100 bg-white p-3"
                    />
                    <p className="mt-3 text-sm font-medium text-slate-700">
                      Escaneie o QR Code com o WhatsApp para conectar.
                    </p>
                    <button
                      onClick={handleResetSession}
                      className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 hover:bg-red-100"
                    >
                      <RefreshCcw size={16} />
                      Gerar novo QR
                    </button>
                  </>
                ) : status === "initializing" ? (
                  <>
                    <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
                      <LoaderCircle className="animate-spin text-amber-600" />
                    </div>
                    <p className="font-bold text-slate-900">Inicializando WhatsApp</p>
                    <p className="mt-2 text-sm text-slate-500">
                      Aguarde alguns segundos enquanto o servidor prepara a conexao.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-slate-500">
                      Aguardando geracao do QR Code ou restaurando a sessao salva.
                    </p>
                    <button
                      onClick={handleResetSession}
                      className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 hover:bg-red-100"
                    >
                      <RefreshCcw size={16} />
                      Forcar novo QR
                    </button>
                  </>
                )}
              </div>

              <div className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
                <strong>Status atual:</strong> {status}
                <br />
                <strong>Servidor:</strong> {serverHealthMessage}
                <br />
                <strong>URL:</strong> {serverUrl}
              </div>
            </section>

            <section className="rounded-3xl border border-red-100 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <MessageSquareReply className="text-red-600" />
                <h2 className="text-xl font-black">Respostas Rapidas</h2>
              </div>
              <div className="space-y-3">
                <input
                  value={quickTitle}
                  onChange={(event) => setQuickTitle(event.target.value)}
                  placeholder="Titulo"
                  className="w-full rounded-2xl border border-red-100 px-4 py-3 outline-none focus:border-red-400"
                />
                <textarea
                  value={quickMessage}
                  onChange={(event) => setQuickMessage(event.target.value)}
                  placeholder="Mensagem rapida"
                  rows={3}
                  className="w-full rounded-2xl border border-red-100 px-4 py-3 outline-none focus:border-red-400"
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
                {quickReplies.map((reply) => (
                  <button
                    key={reply.id}
                    onClick={() => setMessage(reply.message)}
                    className="w-full rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-left transition hover:bg-red-100"
                  >
                    <div className="font-bold text-slate-900">{reply.title}</div>
                    <div className="mt-1 line-clamp-2 text-sm text-slate-600">{reply.message}</div>
                  </button>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-3xl border border-red-100 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Send className="text-red-600" />
                <h2 className="text-xl font-black">Enviar Mensagem</h2>
              </div>

              <div className="grid gap-3 md:grid-cols-[1.1fr_0.9fr]">
                <input
                  value={number}
                  onChange={(event) => setNumber(formatPhoneNumber(event.target.value))}
                  placeholder="Numero com DDD"
                  className="w-full rounded-2xl border border-red-100 px-4 py-3 outline-none focus:border-red-400"
                />
                <select
                  value={selectedSignatureId}
                  onChange={(event) => setSelectedSignatureId(event.target.value)}
                  className="w-full rounded-2xl border border-red-100 px-4 py-3 outline-none focus:border-red-400"
                >
                  <option value="">Sem assinatura</option>
                  {signatures.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.sellerName}
                    </option>
                  ))}
                </select>
              </div>

              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Digite a mensagem"
                rows={6}
                className="mt-3 w-full rounded-2xl border border-red-100 px-4 py-3 outline-none focus:border-red-400"
              />

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={handleSendMessage}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-3 font-bold text-white hover:bg-red-700"
                >
                  <Send size={16} />
                  Enviar agora
                </button>
                <div className="flex flex-1 flex-col gap-3 sm:flex-row">
                  <input
                    type="datetime-local"
                    value={scheduleDateTime}
                    onChange={(event) => setScheduleDateTime(event.target.value)}
                    className="flex-1 rounded-2xl border border-red-100 px-4 py-3 outline-none focus:border-red-400"
                  />
                  <button
                    onClick={handleScheduleMessage}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 font-bold text-red-700 hover:bg-red-100"
                  >
                    <CalendarClock size={16} />
                    Agendar
                  </button>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-red-100 bg-white shadow-sm">
              <div className="grid border-b border-red-100 lg:grid-cols-[300px_minmax(0,1fr)]">
                <div className="border-b border-red-100 p-4 lg:border-b-0 lg:border-r">
                  <div className="mb-3 flex items-center gap-2">
                    <MessageCircle className="text-red-600" />
                    <h2 className="font-black">Conversas</h2>
                  </div>
                  <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
                    {chatList.map((chat) => (
                      <button
                        key={chat.chatId}
                        onClick={() => {
                          setSelectedChatId(chat.chatId);
                          setNumber(chat.from || chat.chatId.replace(/\D/g, ""));
                        }}
                        className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                          selectedChatId === chat.chatId
                            ? "border-red-300 bg-red-50"
                            : "border-transparent bg-slate-50 hover:border-red-100"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="truncate font-bold text-slate-900">
                            {chat.contactName || chat.from}
                          </div>
                          <div className="text-[11px] text-slate-500">{formatTime(chat.timestamp)}</div>
                        </div>
                        <div className="mt-1 line-clamp-2 text-sm text-slate-600">{chat.body}</div>
                        {(chatLabels[chat.chatId] || []).length ? (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {(chatLabels[chat.chatId] || []).map((label) => (
                              <span
                                key={label}
                                className="rounded-full bg-red-100 px-2 py-1 text-[11px] font-bold text-red-700"
                              >
                                {label}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </button>
                    ))}
                    {!chatList.length ? (
                      <div className="rounded-2xl bg-slate-50 px-4 py-5 text-sm text-slate-500">
                        Nenhuma mensagem ainda.
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="p-4">
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <h3 className="mr-auto text-lg font-black text-slate-900">
                      {selectedChatId || "Selecione uma conversa"}
                    </h3>
                    {labels.map((label) => (
                      <button
                        key={label}
                        onClick={() => handleToggleLabelOnChat(label)}
                        className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                          selectedChatLabels.includes(label)
                            ? "bg-red-600 text-white"
                            : "bg-red-50 text-red-700 hover:bg-red-100"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  <div className="max-h-[520px] space-y-3 overflow-y-auto rounded-3xl bg-[#fffafa] p-4">
                    {selectedChatMessages.map((item) => (
                      <div
                        key={item.id}
                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                          item.direction === "out"
                            ? "ml-auto bg-red-600 text-white"
                            : "bg-white text-slate-800"
                        }`}
                      >
                        <div className="whitespace-pre-wrap">{item.body}</div>
                        <div
                          className={`mt-2 text-[11px] ${
                            item.direction === "out" ? "text-red-100" : "text-slate-400"
                          }`}
                        >
                          {formatTime(item.timestamp)}
                        </div>
                      </div>
                    ))}
                    {!selectedChatMessages.length ? (
                      <div className="rounded-2xl bg-white px-4 py-5 text-sm text-slate-500">
                        Nenhuma mensagem nesta conversa.
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-3xl border border-red-100 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Tag className="text-red-600" />
                <h2 className="text-xl font-black">Etiquetas</h2>
              </div>
              <div className="flex gap-2">
                <input
                  value={newLabel}
                  onChange={(event) => setNewLabel(event.target.value)}
                  placeholder="Nova etiqueta"
                  className="w-full rounded-2xl border border-red-100 px-4 py-3 outline-none focus:border-red-400"
                />
                <button
                  onClick={handleAddLabel}
                  className="rounded-2xl bg-red-600 px-4 py-3 font-bold text-white hover:bg-red-700"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {labels.map((label) => (
                  <span
                    key={label}
                    className="rounded-full bg-red-50 px-3 py-2 text-sm font-bold text-red-700"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-red-100 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <UserRound className="text-red-600" />
                <h2 className="text-xl font-black">Assinaturas por Vendedor</h2>
              </div>
              <div className="space-y-3">
                <input
                  value={signatureName}
                  onChange={(event) => setSignatureName(event.target.value)}
                  placeholder="Nome do vendedor"
                  className="w-full rounded-2xl border border-red-100 px-4 py-3 outline-none focus:border-red-400"
                />
                <textarea
                  value={signatureText}
                  onChange={(event) => setSignatureText(event.target.value)}
                  placeholder="Assinatura"
                  rows={3}
                  className="w-full rounded-2xl border border-red-100 px-4 py-3 outline-none focus:border-red-400"
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
                {signatures.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
                    <div className="font-bold text-slate-900">{item.sellerName}</div>
                    <div className="mt-1 whitespace-pre-wrap text-sm text-slate-600">
                      {item.signature}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-red-100 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <CalendarClock className="text-red-600" />
                <h2 className="text-xl font-black">Agendamentos</h2>
              </div>
              <div className="space-y-2">
                {schedules.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 rounded-2xl border border-red-100 bg-[#fffafa] px-4 py-3"
                  >
                    <div className="flex-1">
                      <div className="text-sm font-bold text-slate-900">{item.number}</div>
                      <div className="mt-1 line-clamp-2 text-sm text-slate-600">{item.text}</div>
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
                ))}
                {!schedules.length ? (
                  <div className="rounded-2xl bg-slate-50 px-4 py-5 text-sm text-slate-500">
                    Nenhum envio agendado.
                  </div>
                ) : null}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
