import { existsSync } from "node:fs";
import path from "node:path";
import type { SlotDeVideo } from "@/lib/mybots-landing";

/** Caminho servido a partir de public/. Não segue ".." . */
export function arquivoPublicoExiste(urlPublica: string) {
  if (!urlPublica.startsWith("/") || urlPublica.includes("..")) return false;
  return existsSync(path.join(process.cwd(), "public", urlPublica.replace(/^\/+/, "")));
}

/** Liga o vídeo só se o mp4 ou o webm já estiver em public/. O poster é à parte. */
export function midiaDoSlot(slot: SlotDeVideo) {
  const mp4 = arquivoPublicoExiste(slot.mp4) ? slot.mp4 : undefined;
  const webm = arquivoPublicoExiste(slot.webm) ? slot.webm : undefined;
  const poster = arquivoPublicoExiste(slot.poster) ? slot.poster : undefined;
  return { mp4, webm, poster, disponivel: Boolean(mp4 || webm) };
}
