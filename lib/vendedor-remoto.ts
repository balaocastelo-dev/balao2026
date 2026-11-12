import { io, type Socket } from "socket.io-client";
import { ticketDeServico, urlDoServidorWhatsApp } from "@/lib/whatsapp-ticket";

// ============================================================
// Lê a equipe no servidor de WhatsApp que já está no ar.
//
// Não grava nada lá e não pede lista de PIN: o evento que o painel já
// recebe traz só id, nome, cargo e assinatura. O PIN só atravessa esta
// função na hora de conferir, dentro do processo do site, e a resposta
// que volta é "ok", "errado" ou "indisponível" — nunca o PIN.
// ============================================================

export type VendedorRemoto = {
  id: string;
  nome: string;
  cargo: string;
  assinatura: string;
};

export type ResultadoPin = "ok" | "errado" | "indisponivel";

const TTL_MS = 15_000;
const ESPERA_MS = 8_000;

let cache: { em: number; lista: VendedorRemoto[] } | null = null;
let emVoo: Promise<VendedorRemoto[] | null> | null = null;

function normalizar(bruto: unknown): VendedorRemoto | null {
  if (!bruto || typeof bruto !== "object") return null;
  const v = bruto as Record<string, unknown>;
  const id = String(v.id ?? "").trim();
  const nome = String(v.nome ?? "").trim();
  if (!id || !nome) return null;
  return {
    id,
    nome,
    cargo: String(v.cargo ?? ""),
    assinatura: String(v.assinatura ?? ""),
  };
}

function abrirSocket(): Socket | null {
  const ticket = ticketDeServico();
  if (!ticket) return null;
  // autoConnect fica desligado para o ouvinte existir antes do servidor
  // falar. A lista de vendedores sai no instante da conexão; se a gente
  // só escutar depois do "connect", o evento já passou e o slug novo
  // parece que não existe.
  return io(urlDoServidorWhatsApp(), {
    transports: ["websocket", "polling"],
    reconnection: false,
    autoConnect: false,
    timeout: ESPERA_MS,
    auth: { ticket },
  });
}

function fechar(socket: Socket) {
  socket.removeAllListeners();
  socket.close();
}

/** Lista pública da equipe. null quando o servidor não respondeu. */
export async function listarVendedoresDoCrm(fresco = false): Promise<VendedorRemoto[] | null> {
  if (!fresco && cache && Date.now() - cache.em < TTL_MS) return cache.lista;
  if (!fresco && emVoo) return emVoo;

  const pedido = (async () => {
    const socket = abrirSocket();
    if (!socket) return cache?.lista ?? null;
    try {
      const lista = await new Promise<VendedorRemoto[] | null>((resolve) => {
        const timer = setTimeout(() => resolve(null), ESPERA_MS);
        const terminar = (valor: VendedorRemoto[] | null) => {
          clearTimeout(timer);
          resolve(valor);
        };
        socket.on("whatsapp:vendedores", (bruto: unknown) => {
          if (!Array.isArray(bruto)) return terminar(null);
          terminar(bruto.map(normalizar).filter((v): v is VendedorRemoto => Boolean(v)));
        });
        socket.once("connect_error", () => terminar(null));
        socket.connect();
      });
      if (lista) cache = { em: Date.now(), lista };
      return lista ?? cache?.lista ?? null;
    } finally {
      fechar(socket);
    }
  })();

  emVoo = pedido;
  try {
    return await pedido;
  } finally {
    if (emVoo === pedido) emVoo = null;
  }
}

/**
 * Confere o PIN deste vendedor no servidor do CRM.
 * PIN de outra pessoa não passa, mesmo que seja um PIN válido da loja.
 */
export async function conferirPinDoVendedor(pin: string, vendedorId: string): Promise<ResultadoPin> {
  if (!/^\d{4,6}$/.test(pin) || !vendedorId) return "errado";
  const socket = abrirSocket();
  if (!socket) return "indisponivel";
  try {
    return await new Promise<ResultadoPin>((resolve) => {
      const timer = setTimeout(() => resolve("indisponivel"), ESPERA_MS);
      const terminar = (valor: ResultadoPin) => {
        clearTimeout(timer);
        resolve(valor);
      };
      socket.once("connect", () => {
        socket.emit(
          "panel:vendedor-login",
          { pin },
          (res: { ok?: boolean; vendedor?: { id?: string } } | undefined) => {
            const id = res?.ok ? String(res.vendedor?.id ?? "") : "";
            terminar(id !== "" && id === String(vendedorId) ? "ok" : "errado");
          }
        );
      });
      socket.once("connect_error", () => terminar("indisponivel"));
      socket.connect();
    });
  } finally {
    fechar(socket);
  }
}
