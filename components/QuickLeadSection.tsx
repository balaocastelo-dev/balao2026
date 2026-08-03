"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, Phone, Send } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";
import { useToast } from "@/context/ToastContext";
import {
  trackFormAttempt,
  trackFormError,
  trackFormSuccess,
  trackPageLeadView,
} from "@/lib/tracking";

type QuickLeadSectionProps = {
  title: string;
  description: string;
  messageTemplate: string;
  source: string;
  cityLabel?: string;
  serviceLabel?: string;
  formTitle?: string;
  compact?: boolean;
};

export default function QuickLeadSection({
  title,
  description,
  messageTemplate,
  source,
  cityLabel,
  serviceLabel,
  formTitle = "Peça atendimento agora",
  compact = false,
}: QuickLeadSectionProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  const whatsappUrl = `https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
    messageTemplate
  )}`;

  useEffect(() => {
    trackPageLeadView({
      page_path: pathname,
      source,
      city: cityLabel,
      service: serviceLabel,
    });
  }, [pathname, source, cityLabel, serviceLabel]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(event.currentTarget);
      const name = String(formData.get("name") || "").trim();
      const email = String(formData.get("email") || "").trim();
      const phone = String(formData.get("phone") || "").trim();
      const message = String(formData.get("message") || "").trim();

      trackFormAttempt({
        page_path: pathname,
        source,
        city: cityLabel,
        service: serviceLabel,
      });

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          message,
          subject: `Lead Site - ${serviceLabel || title}`,
          source,
          city: cityLabel || null,
          service: serviceLabel || title,
        }),
      });

      if (!response.ok) {
        throw new Error("Falha ao enviar lead");
      }

      trackFormSuccess({
        page_path: pathname,
        source,
        city: cityLabel,
        service: serviceLabel,
      });
      showToast("Pedido enviado. Vamos entrar em contato o mais rápido possível.", "success");
      event.currentTarget.reset();
    } catch (error) {
      console.error(error);
      trackFormError({
        page_path: pathname,
        source,
        city: cityLabel,
        service: serviceLabel,
      });
      showToast("Não foi possível enviar agora. Tente pelo WhatsApp.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className={`rounded-[28px] border border-[var(--home-border)] bg-[var(--home-panel-bg)] shadow-[0_24px_70px_rgba(2,6,23,0.14)] backdrop-blur ${
        compact ? "p-6 md:p-8" : "p-8 md:p-10"
      }`}
    >
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-[var(--home-accent)]">
            Atendimento Rápido
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-[var(--home-text)] md:text-4xl">
            {title}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-[var(--home-muted)]">{description}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            {cityLabel ? (
              <span className="rounded-full border border-[var(--home-border)] bg-[var(--home-card-soft)] px-4 py-2 text-sm font-semibold text-[var(--home-soft)]">
                Cidade: {cityLabel}
              </span>
            ) : null}
            {serviceLabel ? (
              <span className="rounded-full border border-[var(--home-border)] bg-[var(--home-card-soft)] px-4 py-2 text-sm font-semibold text-[var(--home-soft)]">
                Serviço: {serviceLabel}
              </span>
            ) : null}
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-conversion-source={source}
              data-conversion-label={serviceLabel || title}
              data-conversion-city={cityLabel}
              data-conversion-service={serviceLabel}
              className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 font-black text-white hover:bg-[#128C7E]"
            >
              <MessageCircle className="h-5 w-5" />
              Chamar no WhatsApp
            </a>
            <a
              href={`tel:${SITE_CONFIG.phone.number}`}
              data-conversion-source={source}
              data-conversion-label={serviceLabel || title}
              data-conversion-city={cityLabel}
              data-conversion-service={serviceLabel}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--home-border)] bg-[var(--home-card-bg)] px-6 py-3 font-bold text-[var(--home-text)] hover:border-[var(--home-accent)] hover:text-[var(--home-accent)]"
            >
              <Phone className="h-5 w-5" />
              Ligar Agora
            </a>
          </div>
        </div>

        <div className="rounded-[24px] border border-[var(--home-border)] bg-[var(--home-card-bg)] p-6">
          <h3 className="text-2xl font-black text-[var(--home-text)]">{formTitle}</h3>
          <p className="mt-2 text-sm text-[var(--home-muted)]">
            Preencha os dados e receba retorno rápido da equipe.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <input
              type="text"
              name="name"
              required
              placeholder="Seu nome"
              className="w-full rounded-xl border border-[var(--home-border)] bg-[var(--home-card-soft)] px-4 py-3 text-[var(--home-text)] outline-none placeholder:text-[var(--home-muted)] focus:border-[var(--home-accent)]"
            />
            <div className="grid gap-4 md:grid-cols-2">
              <input
                type="tel"
                name="phone"
                required
                placeholder="WhatsApp"
                className="w-full rounded-xl border border-[var(--home-border)] bg-[var(--home-card-soft)] px-4 py-3 text-[var(--home-text)] outline-none placeholder:text-[var(--home-muted)] focus:border-[var(--home-accent)]"
              />
              <input
                type="email"
                name="email"
                required
                placeholder="Seu e-mail"
                className="w-full rounded-xl border border-[var(--home-border)] bg-[var(--home-card-soft)] px-4 py-3 text-[var(--home-text)] outline-none placeholder:text-[var(--home-muted)] focus:border-[var(--home-accent)]"
              />
            </div>
            <textarea
              name="message"
              required
              rows={4}
              defaultValue={messageTemplate}
              className="w-full rounded-xl border border-[var(--home-border)] bg-[var(--home-card-soft)] px-4 py-3 text-[var(--home-text)] outline-none placeholder:text-[var(--home-muted)] focus:border-[var(--home-accent)]"
            />
            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#E60012] px-6 py-3 font-black text-white hover:bg-red-700 disabled:opacity-70"
            >
              <Send className="h-5 w-5" />
              {loading ? "Enviando..." : "Solicitar Atendimento"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
