import { SITE_CONFIG } from "@/lib/config";

/** Link do WhatsApp da loja com a mensagem já escrita. */
export function linkDoWhatsApp(mensagem: string): string {
  return `https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(mensagem)}`;
}
