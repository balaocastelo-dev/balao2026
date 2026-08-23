import React from "react";
import type { Metadata } from "next";
import Header from "@/components/Header";
import { getProducts, searchProductsByKeywords } from "@/lib/db";
import { searchProducts } from "@/lib/searchUtils";
import ProductCard from "@/components/ProductCard";
import JsonLd, {
  generateOrganizationSchema,
  generateBreadcrumbSchema,
  generateItemListSchema,
  generateFAQSchema,
  generateServiceSchema,
} from "@/components/JsonLd";
import { SITE_CONFIG } from "@/lib/config";
import {
  Zap,
  Battery,
  Truck,
  ShieldCheck,
  MessageCircle,
  CheckCircle2,
  MapPin,
  Clock,
  Star,
  ArrowRight,
  Flame,
  Plug,
  Laptop,
  Check,
  ShieldAlert,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Carregadores e Fontes de Notebook em Campinas | Entrega Expressa em 60 Minutos | Balão da Informática",
  description:
    "Fontes e carregadores originais e de primeira linha para notebooks Dell, Lenovo, Acer, HP, Samsung, Asus e Apple em Campinas. Retirada em 30 min no Cambuí ou entrega expressa via motoboy.",
  keywords: [
    "carregador notebook campinas",
    "fonte notebook campinas",
    "carregador dell campinas",
    "carregador lenovo campinas",
    "carregador acer campinas",
    "carregador hp campinas",
    "carregador macbook campinas",
    "fonte tipo c notebook campinas",
    "entrega rapida carregador campinas",
    "balao da informatica cambui",
  ],
  alternates: { canonical: "https://www.balao.info/carregadores" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://www.balao.info/carregadores",
    title: "Carregadores e Fontes de Notebook em Campinas | Balão da Informática",
    description:
      "Precisando de carregador urgente? Entregamos em até 60 minutos em Campinas e região. Fontes com garantia de 12 meses e teste na hora.",
    siteName: SITE_CONFIG.name,
    images: [{ url: "/logo.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Carregadores de Notebook em Campinas | Balão da Informática",
    description:
      "Fontes e carregadores para Dell, Lenovo, HP, Acer, Asus, Apple com pronta entrega em Campinas.",
    images: ["/logo.png"],
  },
};

const CARREGADORES_FAQS = [
  {
    question: "Como saber a voltagem e o pino correto para meu notebook?",
    answer:
      "Verifique na etiqueta embaixo do notebook ou na fonte antiga os valores de Volts (ex: 19V ou 20V) e Amperes (ex: 3.42A ou 4.74A). Caso tenha dúvida, basta enviar uma foto no nosso WhatsApp que nossos técnicos identificam o conector e a potência exata.",
  },
  {
    question: "Os carregadores acompanham cabo de força tripolar?",
    answer:
      "Sim, todos os nossos carregadores e fontes acompanham o cabo de força no padrão brasileiro tripolar NBR 14136 certificado pelo INMETRO, prontos para uso imediato.",
  },
  {
    question: "Qual o prazo de entrega em Campinas e região metropolitana?",
    answer:
      "Possuímos entrega expressa via motoboy em até 60 minutos para Campinas (Cambuí, Centro, Taquaral, Castelo, Barão Geraldo) e envio no mesmo dia para Sumaré, Hortolândia, Paulínia, Valinhos e Vinhedo.",
  },
  {
    question: "Posso retirar e testar na loja física do Cambuí?",
    answer:
      "Com certeza! Você pode trazer seu notebook na nossa loja física no bairro Cambuí em Campinas. Nossos especialistas plugam a fonte e testam a voltagem e corrente na hora sem custo.",
  },
];

export default async function CarregadoresPage() {
  const [allProducts, keywordChargers] = await Promise.all([
    getProducts(),
    searchProductsByKeywords(["fonte", "carregador", "adaptador", "cabo"], 24),
  ]);

  const clientSearched = searchProducts(allProducts, "fonte");
  const combined = [...keywordChargers, ...clientSearched];
  const uniqueProductsMap = new Map();
  for (const p of combined) {
    if (!uniqueProductsMap.has(p.id)) {
      uniqueProductsMap.set(p.id, p);
    }
  }
  let chargers = Array.from(uniqueProductsMap.values());
  if (chargers.length === 0) {
    chargers = allProducts.slice(0, 8);
  }

  const breadcrumbs = [
    { name: "Home", item: "https://www.balao.info" },
    { name: "Carregadores", item: "https://www.balao.info/carregadores" },
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-white flex flex-col font-sans selection:bg-[#E60012] selection:text-white">
      <JsonLd
        data={[
          generateOrganizationSchema(),
          generateBreadcrumbSchema(breadcrumbs),
          generateItemListSchema(chargers, "https://www.balao.info/carregadores"),
          generateFAQSchema(CARREGADORES_FAQS),
          generateServiceSchema({
            name: "Venda e Teste de Fontes e Carregadores em Campinas",
            description:
              "Entrega expressa de carregadores e fontes para notebooks e celulares em até 60 minutos em Campinas e região.",
            url: "https://www.balao.info/carregadores",
            serviceType: "Venda e Suporte de Acessórios de Energia",
          }),
        ]}
      />
      <Header />

      {/* Top Banner de Urgência Impeccable */}
      <div className="bg-[#E60012] text-white py-2.5 px-4 text-center text-xs sm:text-sm font-black tracking-wide flex items-center justify-center gap-2 shadow-md">
        <Zap className="w-4 h-4 animate-pulse" />
        <span>BATERIA NO FIM? ENTREGAMOS SEU CARREGADOR EM ATÉ 60 MINUTOS EM CAMPINAS OU RETIRE NO CAMBUÍ!</span>
      </div>

      <main className="flex-1 space-y-16 sm:space-y-24 py-8 sm:py-12">
        {/* HERO SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#E60012]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 max-w-3xl space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E60012]/15 border border-[#E60012]/40 text-[#E60012] text-xs font-black uppercase tracking-widest">
                <Truck className="w-4 h-4" />
                Pronta Entrega em Campinas
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                Carregadores & Fontes para Notebook com <span className="text-[#E60012]">Garantia Real</span>
              </h1>

              <p className="text-base sm:text-xl text-slate-300 leading-relaxed font-normal">
                Seu notebook parou de carregar? Trabalhamos com fontes originais e de 1ª linha com proteção contra surtos,
                cabo tripolar e voltagem precisa para Dell, HP, Lenovo, Acer, Samsung, Asus e Apple.
              </p>

              <div className="pt-4 flex flex-wrap items-center gap-4">
                <a
                  href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                    "Olá! Preciso de um carregador para meu notebook. Podem me ajudar com o modelo compatível?"
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#E60012] hover:bg-red-700 text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-red-950/50 active:scale-95 transition-all flex items-center gap-3 text-base sm:text-lg"
                >
                  <MessageCircle className="w-6 h-6" />
                  Pedir no WhatsApp em 1 Minuto
                </a>
                <a
                  href="#catalogo"
                  className="bg-[#161f32] hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold py-4 px-8 rounded-2xl transition-all text-base flex items-center gap-2"
                >
                  Ver Modelos Disponíveis
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-800/80 text-left">
                <div>
                  <p className="text-2xl font-black text-white">+1.000</p>
                  <p className="text-xs text-slate-400">Fontes em Estoque</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-[#E60012]">60 min</p>
                  <p className="text-xs text-slate-400">Entrega Expressa</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-white">12 Meses</p>
                  <p className="text-xs text-slate-400">Garantia com Troca na Loja</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-white">100%</p>
                  <p className="text-xs text-slate-400">Testado na Bancada</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* VITRINE DE PRODUTOS REAIS DO BANCO */}
        <section id="catalogo" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-[#E60012] mb-1">Estoque da Loja Física</div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                Fontes e Carregadores Disponíveis
              </h2>
            </div>
            <a
              href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                "Olá! Não encontrei o carregador do meu modelo no site. Vocês têm no estoque físico do Cambuí?"
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-[#E60012] transition-colors"
            >
              Não achou seu modelo? Consulte nossos técnicos <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {chargers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* CONECTORES E COMPATIBILIDADE */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 sm:p-12 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white">Conectores para Todas as Marcas</h2>
              <p className="text-sm sm:text-base text-slate-400">
                Seja conector de ponta fina, pino agulha, USB-C Power Delivery ou MagSafe, temos o modelo exato.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {[
                { name: "USB-C Power Delivery", desc: "Dell, Mac, Lenovo, Asus" },
                { name: "Pino Agulha (7.4mm)", desc: "Dell e HP tradicionais" },
                { name: "Pino Azul (4.5mm)", desc: "HP Ultrabooks & Pavilions" },
                { name: "Ponta Amarela / Retangular", desc: "Lenovo ThinkPad & IdeaPad" },
                { name: "Ponta Fina (3.0mm / 4.0mm)", desc: "Acer Aspire & Samsung" },
                { name: "MagSafe 1, 2 e 3", desc: "MacBook Air e MacBook Pro" },
                { name: "Ponta Grossa (5.5mm)", desc: "Asus, Positivo, CCE, Intelbras" },
                { name: "Microsoft Surface", desc: "Conector Magnético Surface Pro" },
                { name: "Fontes Gamer 180W a 330W", desc: "Acer Nitro, Dell G15, Legion" },
                { name: "Carregadores Rápidos GaN", desc: "Smartphones e Laptops 65W/100W" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-4 text-center hover:border-[#E60012] transition-colors"
                >
                  <p className="font-extrabold text-sm text-white">{item.name}</p>
                  <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* COMO COMPRAR O MODELO CORRETO - 3 PASSOS SIMPLES */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-white">Como Escolher o Carregador Certo</h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2">
              Evite comprar a fonte errada e queimar seu notebook seguindo estas 3 orientações:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#E60012] text-white flex items-center justify-center font-black text-lg">
                1
              </div>
              <h3 className="text-lg font-bold text-white">Olhe a Etiqueta Traseira</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Na parte de baixo do seu notebook consta a especificação de entrada (Input), por exemplo: <strong>19.5V - 3.34A</strong> ou <strong>20V - 3.25A</strong>.
              </p>
            </div>

            <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#E60012] text-white flex items-center justify-center font-black text-lg">
                2
              </div>
              <h3 className="text-lg font-bold text-white">Confira o Formato do Conector</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Observe o tamanho da ponta ou se o seu modelo já utiliza o padrão moderno USB Tipo-C.
              </p>
            </div>

            <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#E60012] text-white flex items-center justify-center font-black text-lg">
                3
              </div>
              <h3 className="text-lg font-bold text-white">Fale com um Especialista</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Tire uma foto da etiqueta e do pino e nos envie pelo WhatsApp. Confirmamos o modelo compatível em menos de 2 minutos.
              </p>
            </div>
          </div>
        </section>

        {/* ALERTA DE SEGURANÇA IMPECCABLE */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#161f32] border-l-4 border-[#E60012] border-y border-r border-slate-800 rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center gap-8">
            <div className="w-16 h-16 rounded-2xl bg-[#E60012]/20 flex items-center justify-center shrink-0 text-[#E60012]">
              <ShieldAlert className="w-10 h-10" />
            </div>
            <div className="space-y-2 flex-1 text-left">
              <h3 className="text-xl sm:text-2xl font-black text-white">Cuidado com Fontes Genéricas de Baixa Qualidade</h3>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Carregadores universais baratos e sem blindagem oscilam a voltagem, danificam a controladora de carga (Super I/O) da placa-mãe e podem estufar a bateria. Na Balão da Informática você adquire fontes com proteção contra sobretensão e garantia total de troca no balcão.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ SCHEMA ENRICHED */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center space-y-2 mb-8">
            <div className="text-xs font-black uppercase tracking-wider text-[#E60012]">Dúvidas Frequentes</div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Perguntas sobre Carregadores</h2>
          </div>

          <div className="space-y-4">
            {CARREGADORES_FAQS.map((faq, idx) => (
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

        {/* CONTATO & LOCALIZAÇÃO */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-b from-[#111827] to-[#090d16] border border-slate-800 rounded-3xl p-8 sm:p-12 text-center space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#E60012]">
              <MapPin className="w-4 h-4" />
              Loja Física no Cambuí - Campinas/SP
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Retire Hoje Mesmo ou Receba em até 60 Minutos
            </h2>
            <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base">
              Endereço: {SITE_CONFIG.address} • Atendimento de Segunda a Sexta das 09h às 18h e Sábados das 09h às 13h.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-4">
              <a
                href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                  "Olá! Gostaria de consultar o carregador compatível para o meu notebook e pedir a entrega/retirada."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#E60012] hover:bg-red-700 text-white font-black py-4 px-8 rounded-2xl transition-all flex items-center gap-3 text-base"
              >
                <MessageCircle className="w-5 h-5" />
                Chamar no WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
