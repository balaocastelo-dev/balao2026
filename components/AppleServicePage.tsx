import Header from "@/components/Header";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, MapPin, Phone, MessageCircle, ArrowRight, type LucideIcon } from "lucide-react";
import AppleReviewsCarousel, { type AppleReview } from "@/components/AppleReviewsCarousel";
import { appleReviews } from "@/lib/apple-reviews";
import { SITE_CONFIG } from "@/lib/config";

type ThemeClasses = {
  badge?: string;
  button?: string;
  buttonSoft?: string;
  iconWrap?: string;
  icon?: string;
  ctaBg?: string;
  ctaButtonText?: string;
};

type HighlightItem = {
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
};

type ServiceItem = {
  icon: LucideIcon;
  title: string;
  description: string;
};

type AppleServicePageProps = {
  backHref: string;
  backLabel: string;
  badgeIcon: LucideIcon;
  badgeLabel: string;
  title: string;
  highlightedWord: string;
  description: string;
  heroImageSrc: string;
  heroImageAlt: string;
  heroCaption: string;
  whatsappHref: string;
  theme?: ThemeClasses;
  highlights: HighlightItem[];
  services: ServiceItem[];
  localTitle: string;
  localDescription: string;
  ctaTitle: string;
  ctaDescription: string;
  showcaseImageSrc?: string;
  showcaseImageAlt?: string;
  showcaseTitle?: string;
  showcaseDescription?: string;
  mobileHighlightsFirst?: boolean;
  reviews?: AppleReview[];
};

const neighborhoods = [
  "Cambuí",
  "Nova Campinas",
  "Guanabara",
  "Taquaral",
  "Bosque",
  "Centro",
  "Proença",
  "Chácara da Barra",
];

export default function AppleServicePage({
  backHref,
  backLabel,
  badgeIcon: BadgeIcon,
  badgeLabel,
  title,
  highlightedWord,
  description,
  heroImageSrc,
  heroImageAlt,
  heroCaption,
  whatsappHref,
  theme,
  highlights,
  services,
  localTitle,
  localDescription,
  ctaTitle,
  ctaDescription,
  showcaseImageSrc,
  showcaseImageAlt,
  showcaseTitle,
  showcaseDescription,
  mobileHighlightsFirst = false,
  reviews = appleReviews,
}: AppleServicePageProps) {
  return (
    <div className="min-h-screen bg-[#090d16] text-white flex flex-col font-sans selection:bg-[#E60012] selection:text-white">
      <Header />

      <main className="flex-1 space-y-16 sm:space-y-24 py-8 sm:py-12">
        {/* HERO SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#E60012]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid lg:grid-cols-12 gap-10 items-center relative z-10">
              <div className="lg:col-span-7 space-y-6">
                <Link
                  href={backHref}
                  className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors mb-2"
                >
                  <span>←</span>
                  <span>{backLabel}</span>
                </Link>

                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E60012]/15 border border-[#E60012]/40 text-[#E60012] text-xs font-black uppercase tracking-widest">
                  <BadgeIcon className="w-4 h-4" />
                  <span>{badgeLabel}</span>
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                  {title} <span className="text-[#E60012]">{highlightedWord}</span>
                </h1>

                <p className="text-base sm:text-xl text-slate-300 leading-relaxed font-normal">
                  {description}
                </p>

                <div className="pt-4 flex flex-wrap items-center gap-4">
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#E60012] hover:bg-red-700 text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-red-950/50 active:scale-95 transition-all flex items-center gap-3 text-base sm:text-lg"
                  >
                    <MessageCircle className="w-6 h-6" />
                    Chamar no WhatsApp
                  </a>
                  <a
                    href="#servicos-detalhados"
                    className="bg-[#161f32] hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold py-4 px-8 rounded-2xl transition-all text-base flex items-center gap-2"
                  >
                    Ver Serviços com Fotos
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>

                <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-slate-800/80 text-left">
                  <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-3">
                    <p className="font-black text-sm text-white">Assistência em 1h</p>
                    <p className="text-[11px] text-slate-400">Reparo Expresso</p>
                  </div>
                  <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-3">
                    <p className="font-black text-sm text-[#E60012]">Motoboy Grátis</p>
                    <p className="text-[11px] text-slate-400">Leva e Traz Segurado</p>
                  </div>
                  <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-3">
                    <p className="font-black text-sm text-white">12x Sem Juros</p>
                    <p className="text-[11px] text-slate-400">No Cartão de Crédito</p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 relative aspect-square max-h-[380px] rounded-3xl overflow-hidden bg-[#161f32] border border-slate-800 shadow-2xl">
                <Image
                  src={heroImageSrc}
                  alt={heroImageAlt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 bg-[#111827]/90 backdrop-blur p-4 rounded-2xl border border-slate-700">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#E60012]">
                    Especialista no Cambuí
                  </p>
                  <p className="text-sm font-bold text-white mt-0.5">{heroCaption}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* DESTAQUES COM FOTOS REAIS */}
        <section id="servicos-detalhados" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <div className="text-xs font-black uppercase tracking-wider text-[#E60012]">Bancada Especializada</div>
            <h2 className="text-2xl sm:text-4xl font-black text-white">Serviços com Fotos Reais de Bancada</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {highlights.map((item) => (
              <div
                key={item.title}
                className="overflow-hidden rounded-3xl border border-slate-800 bg-[#111827] shadow-xl hover:border-[#E60012] transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={item.imageSrc}
                      alt={item.imageAlt}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6 space-y-2">
                    <h3 className="text-xl font-bold text-white">{item.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{item.description}</p>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-bold text-[#E60012] hover:text-red-400 transition"
                  >
                    Solicitar este reparo no WhatsApp <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PROBLEMAS QUE RESOLVEMOS & ATENDIMENTO LOCAL */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7 bg-[#111827] border border-slate-800 rounded-3xl p-8 space-y-6">
              <h2 className="text-2xl sm:text-3xl font-black text-white">Problemas que Resolvemos</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {services.map((service) => (
                  <div
                    key={service.title}
                    className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-4 space-y-2"
                  >
                    <service.icon className="w-6 h-6 text-[#E60012]" />
                    <h3 className="text-sm font-bold text-white">{service.title}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">{service.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 bg-[#111827] border border-slate-800 rounded-3xl p-8 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E60012]/15 border border-[#E60012]/40 text-[#E60012] text-xs font-bold">
                  <MapPin className="w-3.5 h-3.5" />
                  Atendimento Local Campinas
                </div>
                <h2 className="text-2xl font-black text-white">{localTitle}</h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{localDescription}</p>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  {neighborhoods.map((nb) => (
                    <div
                      key={nb}
                      className="bg-[#161f32] border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-300 text-center"
                    >
                      {nb}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#E60012] hover:bg-red-700 text-white py-3.5 px-6 rounded-2xl font-black text-center transition flex items-center justify-center gap-2 text-sm shadow-xl"
                >
                  <MessageCircle className="w-4 h-4" />
                  Iniciar Atendimento no WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* COMENTÁRIOS E AVALIAÇÕES */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <div className="text-xs font-black uppercase tracking-wider text-[#E60012]">Satisfação Comprovada</div>
            <h2 className="text-2xl sm:text-4xl font-black text-white">Avaliações 5 Estrelas</h2>
          </div>
          <div className="max-w-6xl mx-auto">
            <AppleReviewsCarousel reviews={reviews} />
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-b from-[#111827] to-[#090d16] border border-slate-800 rounded-3xl p-8 sm:p-12 text-center space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#E60012]">
              <MapPin className="w-4 h-4" />
              Bancada Especializada no Cambuí • Campinas/SP
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">{ctaTitle}</h2>
            <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base">
              {ctaDescription}
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-4">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#E60012] hover:bg-red-700 text-white font-black py-4 px-8 rounded-2xl transition-all flex items-center gap-3 text-base"
              >
                <MessageCircle className="w-5 h-5" />
                Falar com Técnico Apple no WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
