import { Metadata } from "next";
import Header from "@/components/Header";
import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getProducts, searchProductsByKeywords } from "@/lib/db";
import JsonLd, {
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateOrganizationSchema,
  generateServiceSchema,
  generateItemListSchema,
} from "@/components/JsonLd";
import SafeImage from "@/components/SafeImage";
import AppleReviewsCarousel, { type AppleReview } from "@/components/AppleReviewsCarousel";
import {
  ArrowRight,
  BadgeCheck,
  BookOpenText,
  Box,
  Clock3,
  Laptop,
  MapPin,
  MessageCircle,
  Monitor,
  Newspaper,
  Phone,
  ShieldCheck,
  Smartphone,
  Tablet,
  Watch,
  Wrench,
  Zap,
} from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";
import { appleReviews } from "@/lib/apple-reviews";
import { listAppleRadarPosts } from "@/lib/apple-news";

export const dynamic = "force-dynamic";

const WHATSAPP_LINK = `https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
  "Olá! Quero um orçamento para assistência Apple especializada no Cambuí em Campinas."
)}`;

const heroImage = "/images/apple/hub-hero-real.png";

const services = [
  {
    title: "Assistência iPhone",
    description:
      "Troca de tela OLED, bateria com saúde 100%, conector de carga, câmeras e micro-soldagem em placa lógica.",
    href: "/wendell/apple/iphone",
    image: "/images/apple/subcategories/iphone-card.png",
    icon: Smartphone,
  },
  {
    title: "Assistência MacBook",
    description:
      "Troca de tela Retina, teclado, bateria, reparo de placa lógica M1/M2/M3 e expansão de armazenamento.",
    href: "/wendell/apple/macbook",
    image: "/images/apple/subcategories/macbook-card.png",
    icon: Laptop,
  },
  {
    title: "Assistência iPad",
    description:
      "Troca de display e vidro touch, substituição de conector Type-C/Lightning e bateria para iPad Air, Mini e Pro.",
    href: "/wendell/apple/ipad",
    image: "/images/apple/subcategories/ipad-card.png",
    icon: Tablet,
  },
  {
    title: "Assistência Apple Watch",
    description:
      "Troca de vidro frontal, display OLED, bateria e vedação para Apple Watch Series e Ultra.",
    href: "/wendell/apple/apple-watch",
    image: "/images/apple/subcategories/watch-card.png",
    icon: Watch,
  },
  {
    title: "Assistência iMac",
    description:
      "Upgrade para SSD de altíssima velocidade, troca de display 4K/5K, limpeza química e reparo de fonte.",
    href: "/wendell/apple/imac",
    image: "/images/apple/subcategories/imac-card.png",
    icon: Monitor,
  },
  {
    title: "Assistência Mac Mini",
    description:
      "Manutenção preventiva, desoxidação, reparo de conexões e suporte completo para estações Mac Mini.",
    href: "/wendell/apple/mac-mini",
    image: "/images/apple/subcategories/macmini-card.png",
    icon: Box,
  },
];

const APPLE_HUB_FAQS = [
  {
    question: "Quanto tempo demora o conserto de iPhone ou MacBook?",
    answer:
      "Trocas de tela e bateria de iPhone são finalizadas em até 3 horas (muitas vezes em 1 hora) no balcão do Cambuí. Reparos de placa lógica e iMacs levam de 24h a 48h.",
  },
  {
    question: "Vocês utilizam peças com tecnologia True Tone e ProMotion?",
    answer:
      "Sim! Realizamos a reprogramação EEPROM serial para preservar o True Tone e usamos displays OLED de alta fidelidade para manter os 120Hz ProMotion dos modelos Pro.",
  },
  {
    question: "Qual o prazo de garantia dos serviços Apple?",
    answer:
      "Oferecemos garantia de até 1 ano para telas selecionadas e 90 dias para todos os demais serviços de assistência técnica.",
  },
];

export const metadata: Metadata = {
  title: "Assistência Apple Especializada em Campinas | iPhone, MacBook, iPad e Watch | Balão da Informática",
  description:
    "Especialista Apple no Cambuí em Campinas: conserto rápido de iPhone, MacBook, iMac, iPad e Apple Watch. Peças premium, orçamento sem compromisso e garantia de até 1 ano.",
  keywords: [
    "assistencia apple campinas",
    "especialista apple campinas cambui",
    "conserto iphone campinas",
    "conserto macbook campinas",
    "reparo ipad campinas",
    "conserto apple watch campinas",
    "balao da informatica apple",
  ],
  alternates: { canonical: "https://www.balao.info/wendell/apple" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://www.balao.info/wendell/apple",
    title: "Assistência Apple Especializada em Campinas | Balão da Informática",
    description: "Atendimento Apple no Cambuí para iPhone, Mac, iPad e Watch com garantia e agilidade.",
    images: [{ url: "/logo.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Assistência Apple em Campinas | Balão da Informática",
    description: "Bancada técnica especializada em dispositivos Apple no Cambuí.",
    images: ["/logo.png"],
  },
};

export default async function AppleHubPage() {
  const [allProducts, keywordApple, radarPosts] = await Promise.all([
    getProducts(),
    searchProductsByKeywords(["apple", "iphone", "macbook", "ipad", "airpods"], 16),
    listAppleRadarPosts(3),
  ]);

  let appleProducts = keywordApple;
  if (appleProducts.length === 0) {
    appleProducts = allProducts.slice(0, 8);
  }

  const breadcrumbs = [
    { name: "Home", item: "https://www.balao.info" },
    { name: "Especialista Apple", item: "https://www.balao.info/wendell/apple" },
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-white flex flex-col font-sans selection:bg-[#E60012] selection:text-white">
      <JsonLd
        data={[
          generateOrganizationSchema(),
          generateBreadcrumbSchema(breadcrumbs),
          generateItemListSchema(appleProducts, "https://www.balao.info/wendell/apple"),
          generateFAQSchema(APPLE_HUB_FAQS),
          generateServiceSchema({
            name: "Assistência Técnica Apple Especializada no Cambuí",
            description: "Serviço completo de diagnóstico e reparo de dispositivos do ecossistema Apple em Campinas.",
            url: "https://www.balao.info/wendell/apple",
            serviceType: "Reparo e Manutenção de Equipamentos Apple",
          }),
        ]}
      />
      <Header />

      <main className="flex-1 space-y-16 sm:space-y-24 py-8 sm:py-12">
        {/* HERO SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#E60012]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E60012]/15 border border-[#E60012]/40 text-[#E60012] text-xs font-black uppercase tracking-widest">
                  <ShieldCheck className="w-4 h-4" />
                  Especialista Apple no Cambuí
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                  Assistência Técnica <span className="text-[#E60012]">Especializada Apple</span> em Campinas
                </h1>

                <p className="text-base sm:text-xl text-slate-300 leading-relaxed font-normal">
                  Seu iPhone, MacBook, iPad ou Apple Watch reparado com peças premium de alta fidelidade,
                  preservação de True Tone, vedação de fábrica e garantia de até 1 ano.
                </p>

                <div className="pt-4 flex flex-wrap items-center gap-4">
                  <a
                    href={WHATSAPP_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#E60012] hover:bg-red-700 text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-red-950/50 active:scale-95 transition-all flex items-center gap-3 text-base sm:text-lg"
                  >
                    <MessageCircle className="w-6 h-6" />
                    Orçamento Rápido no WhatsApp
                  </a>
                  <a
                    href="#servicos"
                    className="bg-[#161f32] hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold py-4 px-8 rounded-2xl transition-all text-base flex items-center gap-2"
                  >
                    Ver Especialidades Apple
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>

                <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-800/80 text-left">
                  <div>
                    <p className="text-2xl font-black text-white">Até 1h</p>
                    <p className="text-xs text-slate-400">Reparo Expresso</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-[#E60012]">Até 1 Ano</p>
                    <p className="text-xs text-slate-400">Garantia Balão</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-white">Motoboy</p>
                    <p className="text-xs text-slate-400">Leva e Traz</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-white">12x Sem Juros</p>
                    <p className="text-xs text-slate-400">No Cartão de Crédito</p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 relative aspect-square max-h-[380px] rounded-3xl overflow-hidden bg-[#161f32] border border-slate-800">
                <Image src={heroImage} alt="Especialista Apple Campinas" fill className="object-cover" priority />
              </div>
            </div>
          </div>
        </section>

        {/* GRADE DE SERVIÇOS POR DISPOSITIVO */}
        <section id="servicos" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <div className="text-xs font-black uppercase tracking-wider text-[#E60012]">Dispositivos Atendidos</div>
            <h2 className="text-2xl sm:text-4xl font-black text-white">Escolha a Linha do seu Apple</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, idx) => (
              <article
                key={idx}
                className="group overflow-hidden rounded-3xl border border-slate-800 bg-[#111827] shadow-xl hover:border-[#E60012] transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent" />
                    <div className="absolute top-4 left-4">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#111827]/90 border border-slate-700 text-[#E60012] text-xs font-bold">
                        <service.icon className="w-3.5 h-3.5" />
                        {service.title.replace("Assistência ", "")}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-2">
                    <h3 className="text-xl font-black text-white group-hover:text-[#E60012] transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{service.description}</p>
                  </div>
                </div>

                <div className="p-6 pt-0 flex gap-3">
                  <Link
                    href={service.href}
                    className="flex-1 text-center py-2.5 px-4 rounded-xl bg-[#161f32] hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 transition"
                  >
                    Ver Detalhes
                  </Link>
                  <a
                    href={WHATSAPP_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center py-2.5 px-4 rounded-xl bg-[#E60012] hover:bg-red-700 text-xs font-bold text-white transition shadow-md"
                  >
                    Pedir Orçamento
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* VITRINE DE PRODUTOS E ACESSÓRIOS APPLE DA BASE */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-[#E60012] mb-1">Loja de Acessórios</div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                Equipamentos Apple em Destaque
              </h2>
            </div>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-[#E60012] transition-colors"
            >
              Consulte cabos e carregadores originais <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {appleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* FAQ SCHEMA ENRICHED */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center space-y-2 mb-8">
            <div className="text-xs font-black uppercase tracking-wider text-[#E60012]">Dúvidas Frequentes</div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Perguntas sobre Assistência Apple</h2>
          </div>

          <div className="space-y-4">
            {APPLE_HUB_FAQS.map((faq, idx) => (
              <div key={idx} className="bg-[#111827] border border-slate-800 rounded-2xl p-6 space-y-2">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#E60012]" />
                  {faq.question}
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed pl-4">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-b from-[#111827] to-[#090d16] border border-slate-800 rounded-3xl p-8 sm:p-12 text-center space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#E60012]">
              <MapPin className="w-4 h-4" />
              Bancada Técnica no Cambuí • Campinas/SP
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Agende seu Atendimento Apple com Especialistas
            </h2>
            <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base">
              Loja física: {SITE_CONFIG.address} • Atendimento rápido com técnicos certificados Apple.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-4">
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#E60012] hover:bg-red-700 text-white font-black py-4 px-8 rounded-2xl transition-all flex items-center gap-3 text-base"
              >
                <MessageCircle className="w-5 h-5" />
                Falar com Especialista Apple
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
