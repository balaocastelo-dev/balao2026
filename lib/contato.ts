import { SITE_CONFIG } from "@/lib/config";

/** https://wa.me/5519987510267 com a mensagem já preenchida. */
export function urlDoWhatsApp(mensagem: string): string {
  return `https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(mensagem)}`;
}

/** tel:+551932551661 — o mais entra no HTML para o telefone discar certo. */
export const URL_DO_TELEFONE = `tel:+${SITE_CONFIG.phone.number}`;
