import { SLOTS_DE_VIDEO, URL_APK, type SlotDeVideo } from "@/lib/mybots-landing";

/**
 * URLs de public/ que a landing pode citar.
 *
 * Lista fechada de propósito. Um existsSync(path.join(process.cwd(), "public",
 * caminho variável)) faz o file tracer da Vercel copiar a pasta public inteira
 * para a função /mybots-app — vídeos, apk e imagens — e o deploy passa de
 * 250 MB descompactados. Estes arquivos continuam em public/ e o site os
 * serve como estáticos; a função não lê o disco.
 *
 * Para ligar o instalador Windows ou um webm, acrescente a URL aqui.
 */
export const ARQUIVOS_PUBLICADOS: readonly string[] = [
  URL_APK,
  ...SLOTS_DE_VIDEO.flatMap((slot) => [slot.mp4, slot.poster]),
];

const PUBLICADOS = new Set<string>(ARQUIVOS_PUBLICADOS);

/** Caminho servido a partir de public/. Não segue "..". */
export function arquivoPublicoExiste(urlPublica: string) {
  if (!urlPublica.startsWith("/") || urlPublica.includes("..")) return false;
  return PUBLICADOS.has(urlPublica);
}

/** Liga o vídeo se o mp4 ou o webm está na lista publicada. O poster é à parte. */
export function midiaDoSlot(slot: SlotDeVideo) {
  const mp4 = arquivoPublicoExiste(slot.mp4) ? slot.mp4 : undefined;
  const webm = arquivoPublicoExiste(slot.webm) ? slot.webm : undefined;
  const poster = arquivoPublicoExiste(slot.poster) ? slot.poster : undefined;
  return { mp4, webm, poster, disponivel: Boolean(mp4 || webm) };
}
