import { MessageCircle, Phone } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";
import { URL_DO_TELEFONE, urlDoWhatsApp } from "@/lib/contato";

/**
 * WhatsApp e telefone no HTML do servidor (não só no clique do navegador).
 * A mensagem já vai preenchida. O número é o da loja.
 */
export default function ContatoNoHtml({
  mensagem,
  titulo = "Fale com a loja",
  escuro = true,
}: {
  mensagem: string;
  titulo?: string;
  escuro?: boolean;
}) {
  const caixa = escuro
    ? "border-slate-700 bg-[#111827] text-white"
    : "border-gray-200 bg-white text-gray-900";
  const mudo = escuro ? "text-slate-300" : "text-gray-600";
  const wa = urlDoWhatsApp(mensagem);

  return (
    <section className={`rounded-2xl border p-4 sm:p-5 ${caixa}`}>
      <h2 className="text-base font-black sm:text-lg">{titulo}</h2>
      <p className={`mt-1 text-sm ${mudo}`}>
        WhatsApp {SITE_CONFIG.whatsapp.display} ou telefone {SITE_CONFIG.phone.display}. Horário: {SITE_CONFIG.openingHoursDisplay}.
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-black text-white hover:bg-[#128C7E]"
        >
          <MessageCircle className="h-5 w-5" aria-hidden />
          WhatsApp {SITE_CONFIG.whatsapp.display}
        </a>
        <a
          href={URL_DO_TELEFONE}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-current px-4 py-3 text-sm font-black hover:border-[#E60012] hover:text-[#E60012]"
        >
          <Phone className="h-5 w-5" aria-hidden />
          Ligar {SITE_CONFIG.phone.display}
        </a>
      </div>
    </section>
  );
}
