import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Cpu,
  Laptop,
  MapPin,
  MessageCircle,
  Monitor,
  ShieldCheck,
  Truck,
  Wrench,
} from "lucide-react";

import { SITE_CONFIG } from "@/lib/config";

function buildWhatsAppUrl(message: string) {
  return `https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(message)}`;
}

export default function HomeLocalHero() {
  const whatsappHref = buildWhatsAppUrl(
    "OlÃ¡! Vim pelo site da BalÃ£o da InformÃ¡tica. Quero comprar ou tirar dÃºvida sobre produto com pronta entrega em Campinas."
  );

  const quickLinks = [
    { title: "PC Gamer", subtitle: "MÃ¡quinas prontas e montagem", href: "/pcgamer", icon: Cpu },
    { title: "Notebooks", subtitle: "Novos, seminovos e upgrades", href: "/notebooks", icon: Laptop },
    { title: "AssistÃªncia", subtitle: "DiagnÃ³stico e reparo local", href: "/manutencao", icon: Wrench },
    { title: "Monitores e peÃ§as", subtitle: "Estoque para retirada rÃ¡pida", href: "/departamentos", icon: Monitor },
  ];

  const trustItems = [
    { title: "Loja fÃ­sica no CambuÃ­", text: SITE_CONFIG.addressShort || SITE_CONFIG.address, icon: MapPin },
    { title: "Retirada e entrega rÃ¡pida", text: "Consulte disponibilidade para Campinas", icon: Truck },
    { title: "Atendimento humano", text: "Compra direto pelo WhatsApp", icon: MessageCircle },
    { title: "Garantia e suporte", text: "Equipe tÃ©cnica especializada", icon: ShieldCheck },
  ];

  return (
    <section className="container mx-auto px-4 pt-5 lg:px-0">
      <div className="relative overflow-hidden rounded-[2rem] border border-red-100 bg-white shadow-xl">
        <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_70%_30%,rgba(230,0,18,0.24),transparent_35%),linear-gradient(135deg,#ffffff_0%,#fff5f5_45%,#fee2e2_100%)] lg:block" />
        <div className="relative grid grid-cols-1 gap-8 p-5 sm:p-8 lg:grid-cols-12 lg:p-10">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-[#E60012]">
              <Clock size={15} />
              Atendimento local em Campinas
            </div>

            <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[0.98] tracking-tight text-zinc-950 sm:text-5xl lg:text-6xl">
              InformÃ¡tica em Campinas com pronta entrega e WhatsApp rÃ¡pido.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-600 sm:text-lg">
              PCs Gamer, notebooks, peÃ§as, upgrades e assistÃªncia tÃ©cnica com loja fÃ­sica no CambuÃ­. Confirme estoque, retire hoje ou peÃ§a entrega na regiÃ£o.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-6 py-4 text-base font-black text-white shadow-lg shadow-green-200 transition hover:bg-[#128C7E] active:scale-[0.98]"
              >
                <MessageCircle size={22} />
                Comprar pelo WhatsApp
              </a>
              <Link
                href="/pcgamer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-6 py-4 text-base font-black text-zinc-900 shadow-sm transition hover:border-[#E60012] hover:text-[#E60012] active:scale-[0.98]"
              >
                Ver PCs Gamer
                <ArrowRight size={19} />
              </Link>
              <a
                href={SITE_CONFIG.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-6 py-4 text-base font-black text-zinc-900 shadow-sm transition hover:border-[#E60012] hover:text-[#E60012] active:scale-[0.98]"
              >
                <MapPin size={19} />
                Como chegar
              </a>
            </div>

            <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {trustItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-2xl border border-zinc-100 bg-zinc-50 px-4 py-4">
                    <div className="flex items-center gap-2 text-sm font-black text-zinc-950">
                      <Icon size={17} className="text-[#E60012]" />
                      {item.title}
                    </div>
                    <div className="mt-1 text-xs font-semibold leading-snug text-zinc-500">{item.text}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="h-full rounded-[1.7rem] border border-red-100 bg-gradient-to-br from-[#E60012] to-[#8f0010] p-5 text-white shadow-2xl">
              <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur">
                <div className="text-sm font-black uppercase tracking-[0.2em] text-red-100">Oferta local</div>
                <div className="mt-2 text-3xl font-black leading-tight">Precisa hoje? Fale com a loja agora.</div>
                <p className="mt-3 text-sm leading-relaxed text-red-50">
                  Atendimento pensado para cliente de Campinas: estoque, retirada, entrega e suporte tÃ©cnico de verdade.
                </p>
              </div>

              <div className="mt-5 grid gap-3">
                {[
                  "Confirmar estoque antes de sair de casa",
                  "Receber opÃ§Ã£o de retirada ou entrega",
                  "Comprar com PIX, cartÃ£o ou atendimento humano",
                  "Falar com quem entende de informÃ¡tica",
                ].map((text) => (
                  <div key={text} className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-black text-zinc-950 shadow-sm">
                    <CheckCircle2 size={18} className="text-[#E60012]" />
                    {text}
                  </div>
                ))}
              </div>

              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-4 text-base font-black text-[#E60012] shadow-lg transition hover:bg-red-50 active:scale-[0.98]"
              >
                <MessageCircle size={21} />
                Chamar vendedor agora
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.title}
              href={link.href}
              className="group rounded-3xl border border-zinc-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-red-100 hover:shadow-lg"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-red-50 text-[#E60012] transition group-hover:bg-[#E60012] group-hover:text-white">
                  <Icon size={22} />
                </div>
                <div className="min-w-0">
                  <div className="font-black text-zinc-950">{link.title}</div>
                  <div className="mt-1 text-xs font-semibold leading-snug text-zinc-500">{link.subtitle}</div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
