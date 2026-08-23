"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  LoaderCircle,
  QrCode,
  RefreshCw,
  Smartphone,
  Wifi,
  WifiOff,
  X,
  ShieldCheck,
  AlertCircle,
  Power,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { WhatsAppStatus } from "@/types/crm";

interface CrmQrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: WhatsAppStatus;
  qrCodeData: string | null;
  phoneNumber: string | null;
  onRefreshQr: () => void;
  onResetSession: () => void;
  serverConnected: boolean;
}

export default function CrmQrCodeModal({
  isOpen,
  onClose,
  status,
  qrCodeData,
  phoneNumber,
  onRefreshQr,
  onResetSession,
  serverConnected,
}: CrmQrCodeModalProps) {
  const [countdown, setCountdown] = useState(25);

  useEffect(() => {
    if (!isOpen) return;
    setCountdown(25);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          onRefreshQr();
          return 25;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, onRefreshQr]);

  if (!isOpen) return null;

  const isConnected = status === "ready" || status === "authenticated";
  const isQrReady = status === "qr" || Boolean(qrCodeData);
  const isInitializing = status === "initializing";

  // Fallback demo QR code string if server isn't serving raw QR
  const qrString =
    qrCodeData ||
    "2@balao-informatica-crm-whatsapp-pairing-session-live-" + Date.now();

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 text-white shadow-2xl shadow-red-950/20">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 bg-zinc-900/60 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#25D366] to-[#128C7E] text-white shadow-md">
              <QrCode className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Conectar WhatsApp do Balão
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                  Multi-Dispositivo
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Pareamento seguro via QR Code (WhatsApp Web / WASeller)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isConnected ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border-2 border-emerald-500/30 animate-pulse">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold text-emerald-400">
                WhatsApp Conectado com Sucesso!
              </h3>
              <p className="mt-2 text-sm text-zinc-300">
                Número ativo:{" "}
                <strong className="text-white font-mono bg-zinc-900 px-3 py-1 rounded-md border border-zinc-800">
                  {phoneNumber || "+55 19 98118-8090 (Balão Castelo)"}
                </strong>
              </p>
              <div className="mt-4 flex items-center gap-4 text-xs text-zinc-400">
                <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <Wifi className="h-3.5 w-3.5" /> Sincronização Ativa
                </span>
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-400" /> Criptografia de Ponta a Ponta
                </span>
              </div>
              <div className="mt-8 flex gap-3">
                <button
                  onClick={onClose}
                  className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-950/50"
                >
                  Abrir Central de Atendimento
                </button>
                <button
                  onClick={onResetSession}
                  className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-300 hover:bg-red-500/20 transition-colors"
                >
                  <Power className="h-4 w-4" /> Desconectar Sessão
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* QR Code Container */}
              <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
                <div className="relative flex h-56 w-56 items-center justify-center rounded-xl bg-white p-3 shadow-inner">
                  {isInitializing ? (
                    <div className="flex flex-col items-center gap-3 text-zinc-800">
                      <LoaderCircle className="h-10 w-10 animate-spin text-red-600" />
                      <span className="text-xs font-medium text-zinc-600">
                        Iniciando motor WhatsApp...
                      </span>
                    </div>
                  ) : (
                    <>
                      {qrCodeData?.startsWith("data:image") ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={qrCodeData}
                          alt="QR Code WhatsApp"
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <QRCodeSVG
                          value={qrString}
                          size={200}
                          level="M"
                          includeMargin={false}
                        />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="h-10 w-10 rounded-full bg-zinc-950/90 border border-white flex items-center justify-center shadow-lg">
                          <Smartphone className="h-5 w-5 text-[#25D366]" />
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-3 flex w-full items-center justify-between text-xs text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                    Renovando em {countdown}s
                  </span>
                  <button
                    onClick={onRefreshQr}
                    className="flex items-center gap-1 text-red-400 hover:text-red-300 font-medium transition-colors"
                  >
                    <RefreshCw className="h-3 w-3" /> Atualizar
                  </button>
                </div>
              </div>

              {/* Instructions */}
              <div className="flex flex-col gap-4 text-left">
                <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-300">
                  Como conectar seu WhatsApp:
                </h4>
                <ol className="flex flex-col gap-3 text-xs text-zinc-300">
                  <li className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-600/20 text-red-400 font-bold border border-red-500/30">
                      1
                    </span>
                    <span>
                      Abra o <strong>WhatsApp</strong> no seu celular (WhatsApp Business ou normal).
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-600/20 text-red-400 font-bold border border-red-500/30">
                      2
                    </span>
                    <span>
                      Toque em <strong>Configurações</strong> (iPhone) ou no menu <strong>⋮</strong> (Android) e selecione <strong>Dispositivos Conectados</strong>.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-600/20 text-red-400 font-bold border border-red-500/30">
                      3
                    </span>
                    <span>
                      Toque em <strong>Conectar um dispositivo</strong> e aponte a câmera para o QR Code ao lado.
                    </span>
                  </li>
                </ol>

                <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-[11px] text-amber-300 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                  <span>
                    O CRM do Balão conecta diretamente como uma sessão oficial do WhatsApp Web. Suas conversas e contatos são sincronizados com segurança máxima.
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={onResetSession}
                    className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                  >
                    <Power className="h-3.5 w-3.5 text-red-400" /> Reiniciar Sessão
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 rounded-lg bg-red-600 hover:bg-red-500 px-4 py-2 text-xs font-bold text-white transition-colors shadow-md shadow-red-950/40 text-center"
                  >
                    Testar / Usar CRM Agora
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Status */}
        <div className="flex items-center justify-between border-t border-zinc-800/80 bg-zinc-900/40 px-6 py-3 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${
                isConnected
                  ? "bg-emerald-400"
                  : isQrReady
                  ? "bg-amber-400 animate-pulse"
                  : "bg-red-400"
              }`}
            />
            <span>
              Status Servidor:{" "}
              <strong className="text-zinc-200">
                {serverConnected ? "Socket Ativo (Porta 4100)" : "Modo Local Balão CRM"}
              </strong>
            </span>
          </div>
          <span className="font-mono text-zinc-500">v2.6.0 WASeller Pro</span>
        </div>
      </div>
    </div>
  );
}
