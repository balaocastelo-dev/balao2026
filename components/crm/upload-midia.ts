// Envio de arquivo pelo upload direto do servidor do WhatsApp
// (POST /api/crm/upload, multipart), com barra de progresso.
//
// Antes o arquivo ia em base64 dentro do Socket.IO: um vídeo de 50 MB
// ocupava o canal das mensagens por inteiro, sem progresso nenhum, e se a
// conexão piscasse no meio o envio se perdia. O caminho antigo continua de
// reserva — mas só quando é seguro: se o servidor ainda não tem a rota
// (404/405) ou se a rede caiu ANTES de o arquivo terminar de subir (aí o
// servidor não tinha como ter mandado). Caiu depois de subir tudo? Não dá
// para saber se foi; mandar de novo poderia duplicar no WhatsApp do cliente.

export type ResultadoDoUpload = {
  ok: boolean;
  status: number;
  msgId?: string;
  erro?: string;
  /** true = pode tentar pelo caminho antigo (socket) sem risco de duplicar. */
  usarReserva: boolean;
};

type XhrMinimo = Pick<XMLHttpRequest, "open" | "setRequestHeader" | "send" | "status" | "responseText" | "timeout"> & {
  upload: { onprogress: ((e: { lengthComputable: boolean; loaded: number; total: number }) => void) | null; onload: (() => void) | null };
  onload: (() => void) | null;
  onerror: (() => void) | null;
  ontimeout: (() => void) | null;
};

export function enviarPorUpload({
  url,
  ticket,
  campos,
  arquivo,
  nome,
  aoProgresso,
  criarXhr = () => new XMLHttpRequest() as unknown as XhrMinimo,
}: {
  url: string;
  ticket: string;
  campos: Record<string, string | number | boolean | null | undefined>;
  arquivo: Blob;
  nome: string;
  aoProgresso?: (porcento: number) => void;
  criarXhr?: () => XhrMinimo;
}): Promise<ResultadoDoUpload> {
  return new Promise((resolver) => {
    const xhr = criarXhr();
    const form = new FormData();
    for (const [chave, valor] of Object.entries(campos)) {
      if (valor !== null && valor !== undefined) form.append(chave, String(valor));
    }
    // O arquivo por último: o servidor lê os campos antes (busboy em streaming).
    form.append("arquivo", arquivo, nome);

    let subiuTudo = false;
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && e.total > 0) aoProgresso?.(Math.min(99, Math.round((e.loaded * 100) / e.total)));
    };
    xhr.upload.onload = () => {
      subiuTudo = true;
    };
    xhr.onload = () => {
      let json: { ok?: boolean; msgId?: string; erro?: string } = {};
      try {
        json = JSON.parse(xhr.responseText || "{}");
      } catch {
        json = {};
      }
      const ok = xhr.status === 200 && json.ok === true;
      if (ok) aoProgresso?.(100);
      resolver({
        ok,
        status: xhr.status,
        msgId: json.msgId,
        erro: ok ? undefined : json.erro || `o servidor respondeu ${xhr.status}`,
        usarReserva: xhr.status === 404 || xhr.status === 405,
      });
    };
    const caiu = (motivo: string) => () => resolver({ ok: false, status: 0, erro: motivo, usarReserva: !subiuTudo });
    xhr.onerror = caiu("a conexão caiu durante o envio");
    xhr.ontimeout = caiu("o envio demorou demais");
    xhr.open("POST", url);
    xhr.setRequestHeader("Authorization", `Bearer ${ticket}`);
    xhr.timeout = 10 * 60_000;
    xhr.send(form);
  });
}

/** data:...;base64,... -> Blob (o painel monta o arquivo como dataUrl). */
export async function blobDoDataUrl(dataUrl: string): Promise<Blob> {
  const r = await fetch(dataUrl);
  return r.blob();
}
