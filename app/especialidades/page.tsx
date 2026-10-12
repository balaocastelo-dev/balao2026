import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import TriagemLead from "@/components/especialidades/TriagemLead";
import JsonLd, {
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateItemListSchema,
  generateOrganizationSchema,
} from "@/components/JsonLd";
import { SITE_CONFIG } from "@/lib/config";
import {
  getCachedNotebooks,
  getCachedProductsByCategoryFullPath,
  getCachedVitrinePcGamer,
} from "@/lib/cache";
import { escolherDestaques, ehMemoriaRam, ehSsdDeUpgrade } from "@/lib/catalogo/especialidades";
import { REGIONAL_CITIES, REGIONAL_SERVICES } from "@/lib/local-seo";
import { CAMPINAS_NEIGHBORHOODS } from "@/lib/neighborhood-seo";
import type { Product } from "@/lib/utils";
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Check,
  Clock,
  Cpu,
  Gamepad2,
  HandCoins,
  Instagram,
  MapPin,
  MessageCircle,
  Phone,
  Printer,
  ShieldCheck,
  Star,
  Store,
  Truck,
  Wrench,
  X,
  Zap,
} from "lucide-react";

// A página lê o catálogo, mas não precisa ser montada a cada visita: sai
// pronta do cache e se refaz sozinha a cada cinco minutos (mais rápida para o
// cliente e sem gastar a cota de conexões do banco).
export const revalidate = 300;

const URL_DA_PAGINA = "https://www.balao.info/especialidades";
const TITULO = "Assistência Técnica, PC Gamer e Reparo Apple em Campinas";
const DESCRICAO =
  "Loja física no Cambuí, Campinas: conserto de computador e notebook, troca de tela e bateria de iPhone, reparo de MacBook, montagem de PC gamer, recuperação de dados e notebooks com garantia. Fale com o técnico no WhatsApp.";

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRICAO,
  keywords: [
    "assistência técnica campinas",
    "conserto de notebook campinas",
    "conserto de computador campinas",
    "assistência técnica cambuí",
    "troca de tela iphone campinas",
    "troca de bateria iphone campinas",
    "reparo macbook campinas",
    "montagem de pc gamer campinas",
    "pc gamer campinas",
    "recuperação de dados campinas",
    "loja de informática campinas",
    "notebook seminovo campinas",
    "upgrade ssd notebook campinas",
    "balão da informática",
  ],
  alternates: { canonical: URL_DA_PAGINA },
  robots: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: URL_DA_PAGINA,
    siteName: SITE_CONFIG.name,
    title: `${TITULO} | Balão da Informática`,
    description: DESCRICAO,
    images: [
      {
        url: "https://www.balao.info/blog/capas/pc-pronto-para-retirar-hoje-campinas.webp",
        width: 1536,
        height: 1024,
        alt: "Atendimento na loja da Balão da Informática no Cambuí, Campinas",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${TITULO} | Balão da Informática`,
    description: DESCRICAO,
    images: ["https://www.balao.info/blog/capas/pc-pronto-para-retirar-hoje-campinas.webp"],
  },
  other: {
    "geo.region": "BR-SP",
    "geo.placename": "Campinas",
    "geo.position": "-22.9099;-47.0626",
    ICBM: "-22.9099, -47.0626",
  },
};

const whats = (mensagem: string) =>
  `https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(mensagem)}`;

/* ----------------------------------------------------------------------------
 * Conteúdo
 * ------------------------------------------------------------------------- */

const PROVAS = [
  { numero: "25+", texto: "anos de marca em Campinas", icone: BadgeCheck },
  { numero: "740+", texto: "avaliações no Google", icone: Star },
  { numero: "20 mil", texto: "seguidores no Instagram", icone: Instagram },
  { numero: "Cambuí", texto: "loja física com bancada", icone: Store },
];

/** O que o cliente digita no Google — cada um vira um atalho para o WhatsApp. */
const PROBLEMAS = [
  { texto: "Notebook não liga", href: "/manutencao" },
  { texto: "Computador lento ou travando", href: "/manutencao" },
  { texto: "Notebook esquentando e desligando", href: "/manutencao" },
  { texto: "Tela do iPhone quebrada", href: "/telaiphone" },
  { texto: "Bateria do iPhone viciada", href: "/telaiphone" },
  { texto: "MacBook não liga ou molhou", href: "/reparoapple" },
  { texto: "HD ou SSD não reconhece", href: "/recuperacaodados" },
  { texto: "Quero trocar para SSD", href: "/manutencao" },
  { texto: "PS5, Xbox ou controle com defeito", href: "/assistenciagames" },
  { texto: "Montar um PC gamer", href: "/montagempc" },
  { texto: "Toner e impressora", href: "/tonner" },
  { texto: "Vender meu equipamento", href: "/consignacao" },
];

type Especialidade = {
  titulo: string;
  resumo: string;
  itens: string[];
  imagem: string;
  alt: string;
  href: string;
  cta: string;
  links?: { rotulo: string; href: string }[];
  mensagem: string;
};

const ESPECIALIDADES: Especialidade[] = [
  {
    titulo: "Conserto de computador e notebook",
    resumo:
      "Diagnóstico na bancada da loja, no Cambuí, com o técnico explicando o que aconteceu e o orçamento antes de qualquer serviço.",
    itens: [
      "Notebook que não liga, desliga sozinho ou esquenta",
      "Troca de tela, teclado, bateria e carcaça",
      "Limpeza interna e troca de pasta térmica",
      "Upgrade de SSD NVMe e memória RAM",
    ],
    imagem: "/blog/capas/manutencao-de-notebook-em-campinas.webp",
    alt: "Técnico consertando notebook na bancada em Campinas",
    href: "/manutencao",
    cta: "Ver assistência técnica",
    links: [{ rotulo: "Urgente hoje", href: "/urgente" }],
    mensagem: "Olá! Vim pela página de Especialidades. Preciso de conserto de computador/notebook.",
  },
  {
    titulo: "Reparo Apple: iPhone, MacBook e iPad",
    resumo:
      "Troca de tela e bateria de iPhone em até 3 horas e reparo de placa lógica de MacBook, feitos na nossa bancada em Campinas.",
    itens: [
      "Troca de tela de iPhone com True Tone",
      "Troca de bateria de iPhone, iPad e MacBook",
      "Reparo de placa lógica de MacBook",
      "Apple Watch, iMac e Mac mini",
    ],
    imagem: "/images/apple/iphone/iphone-reparo-bancada.png",
    alt: "Reparo de iPhone na bancada da Balão da Informática",
    href: "/reparoapple",
    cta: "Ver reparo Apple",
    links: [
      { rotulo: "Tela e bateria de iPhone", href: "/telaiphone" },
      { rotulo: "Especialista Apple", href: "/wendell/apple" },
    ],
    mensagem: "Olá! Vim pela página de Especialidades. Preciso de reparo em aparelho Apple.",
  },
  {
    titulo: "PC gamer montado e sob medida",
    resumo:
      "Você escolhe os jogos e o orçamento; a gente monta com as peças em estoque, testa e entrega ligado. Dá para ver a máquina funcionando na loja antes de pagar.",
    itens: [
      "Cable management caprichado e airflow direcionado",
      "Curvas de ventoinha na BIOS e teste de estresse",
      "Upgrade pensado para o próximo passo",
      "Retirada na loja ou entrega na região",
    ],
    imagem: "/blog/capas/montagem-de-pc-gamer-campinas.webp",
    alt: "Montagem de PC gamer na bancada em Campinas",
    href: "/pcgamer",
    cta: "Ver PCs gamer",
    links: [
      { rotulo: "Montagem de PC", href: "/montagempc" },
      { rotulo: "Monte o seu", href: "/monteseupc" },
    ],
    mensagem: "Olá! Vim pela página de Especialidades. Quero montar/comprar um PC gamer.",
  },
  {
    titulo: "Notebooks novos e seminovos com garantia",
    resumo:
      "Notebooks novos com nota fiscal e garantia do fabricante, e seminovos revisados na bancada com 6 meses de garantia da loja.",
    itens: [
      "Para estudo, trabalho, edição e jogos",
      "Seminovo revisado com 6 meses de garantia",
      "Upgrade de SSD e memória antes de levar",
      "Ajuda para escolher pelo uso, não pela ficha",
    ],
    imagem: "/images/landing/hero_seminovos.jpg",
    alt: "Notebooks seminovos revisados com garantia",
    href: "/notebooks",
    cta: "Ver notebooks",
    links: [{ rotulo: "Seminovos", href: "/seminovos" }],
    mensagem: "Olá! Vim pela página de Especialidades. Quero ajuda para escolher um notebook.",
  },
  {
    titulo: "Recuperação de dados",
    resumo:
      "Laboratório para recuperar fotos, documentos e bancos de dados de discos que pararam de funcionar.",
    itens: [
      "HD que não reconhece ou faz barulho",
      "SSD com falha de firmware",
      "Arrays RAID de servidores",
      "Avaliação do caso antes de qualquer custo de recuperação",
    ],
    imagem: "/blog/capas/como-recuperar-dados-de-hd.webp",
    alt: "Recuperação de dados de HD em laboratório",
    href: "/recuperacaodados",
    cta: "Ver recuperação de dados",
    mensagem: "Olá! Vim pela página de Especialidades. Preciso recuperar arquivos de um HD/SSD.",
  },
  {
    titulo: "Workstations, IA local e computadores para empresas",
    resumo:
      "Máquinas para medicina, engenharia, ciência de dados e para rodar inteligência artificial no próprio computador, além de sites e sistemas sob medida.",
    itens: [
      "Workstations para CAD, BIM, render e laudos",
      "Computadores para rodar IA local",
      "Computadores e rede para escritório",
      "Sites, sistemas e automação com IA",
    ],
    imagem: "/pc_campanha.jpg",
    alt: "Workstation com três monitores para trabalho profissional",
    href: "/premium",
    cta: "Ver computadores premium",
    links: [
      { rotulo: "IA local", href: "/ia-local" },
      { rotulo: "Sites e sistemas", href: "/sistemas" },
    ],
    mensagem: "Olá! Vim pela página de Especialidades. Procuro computador/atendimento para trabalho ou empresa.",
  },
];

const MAIS_SERVICOS = [
  { titulo: "Assistência de games", texto: "PS5, Xbox, Nintendo e controles", href: "/assistenciagames", icone: Gamepad2 },
  { titulo: "Toners e impressão", texto: "Toner, cartucho original e impressora", href: "/tonner", icone: Printer },
  { titulo: "Consignação", texto: "A loja vende o seu equipamento", href: "/consignacao", icone: HandCoins },
  { titulo: "Atendimento urgente", texto: "Prioridade para resolver no mesmo dia", href: "/urgente", icone: Zap },
  { titulo: "Monte seu PC", texto: "Escolha peça por peça com o preço na tela", href: "/monteseupc", icone: Cpu },
  { titulo: "Atendimento regional", texto: "Motoboy na Região de Campinas", href: "/regiao", icone: Truck },
  { titulo: "Sites e sistemas", texto: "Site, loja virtual e sistema sob medida", href: "/sistemas", icone: Briefcase },
  { titulo: "Manutenção preventiva", texto: "Limpeza, pasta térmica e revisão", href: "/manutencao", icone: Wrench },
];

const COMPARATIVO = [
  { item: "Ver o computador ligado e testar antes de pagar", balao: "Sim, na loja do Cambuí", online: "Não" },
  { item: "Levar para casa no mesmo dia", balao: "Retirada na loja ou motoboy na região", online: "Espera a transportadora" },
  { item: "Assistência e garantia no mesmo lugar", balao: "Bancada própria em Campinas", online: "Envio pelo correio" },
  { item: "Com quem você fala", balao: "Vendedor e técnico da loja no WhatsApp", online: "Central de atendimento" },
  { item: "PC gamer", balao: "Sob medida, com upgrade pensado", online: "Caixa fechada" },
  { item: "Reparo Apple, recuperação de dados, seminovos", balao: "Tudo na mesma loja", online: "Não oferece" },
];

const PASSOS = [
  { titulo: "Você chama", texto: "Pelo WhatsApp, pela triagem desta página, por telefone ou passando na loja." },
  { titulo: "Triagem com o técnico", texto: "Você explica o problema ou o que procura e já sai com o caminho certo." },
  { titulo: "Orçamento claro", texto: "Você aprova o valor e o prazo antes de qualquer serviço começar." },
  { titulo: "Pronto para usar", texto: "Retire na loja do Cambuí ou receba por motoboy em Campinas e região." },
];

const FAQS = [
  {
    question: "Onde fica a Balão da Informática em Campinas?",
    answer: `A loja física fica na ${SITE_CONFIG.address}, CEP ${SITE_CONFIG.postalCode}. Atendimento ${SITE_CONFIG.openingHoursDisplay}. Telefone ${SITE_CONFIG.phone.display} e WhatsApp ${SITE_CONFIG.whatsapp.display}.`,
  },
  {
    question: "Quais serviços a Balão da Informática faz?",
    answer:
      "Conserto de computador e notebook, troca de tela e bateria de iPhone, reparo de MacBook, iPad e Apple Watch, montagem de PC gamer, recuperação de dados de HD e SSD, upgrade de SSD e memória, assistência de videogames, venda de notebooks novos e seminovos, computadores premium e para IA local, toners, consignação e criação de sites e sistemas.",
  },
  {
    question: "Vocês trocam tela e bateria de iPhone em Campinas?",
    answer:
      "Sim. A troca de tela (com True Tone) e de bateria de iPhone é feita na bancada da loja no Cambuí, em até 3 horas. Também fazemos reparo de placa lógica de MacBook e atendemos iPad, iMac, Mac mini e Apple Watch.",
  },
  {
    question: "Quanto tempo leva o conserto de um notebook?",
    answer:
      "Depende do defeito e da peça. Na triagem o técnico informa o prazo junto com o orçamento, e você aprova antes de começar. Para casos que não podem esperar, existe o canal de atendimento urgente, com prioridade para resolver no mesmo dia.",
  },
  {
    question: "A Balão monta PC gamer sob medida?",
    answer:
      "Sim. O PC é montado com as peças que a loja tem em estoque, com cable management, airflow direcionado, curvas de ventoinha na BIOS e teste de estresse. Você pode ver a máquina ligada na loja antes de pagar.",
  },
  {
    question: "É possível recuperar arquivos de um HD que não liga?",
    answer:
      "Em muitos casos, sim. O laboratório recupera dados de HDs que não são reconhecidos, SSDs com falha de firmware e arrays RAID de servidores. O caso é avaliado antes, para você saber as chances e o custo.",
  },
  {
    question: "Vocês atendem fora de Campinas?",
    answer:
      "Sim. Atendemos Campinas e toda a Região Metropolitana — Sumaré, Hortolândia, Paulínia, Valinhos, Vinhedo e Indaiatuba — com entrega por motoboy, e recebemos equipamentos de todo o Brasil pelos Correios.",
  },
  {
    question: "Os produtos e serviços têm garantia?",
    answer:
      "Sim. Produtos novos têm nota fiscal e garantia do fabricante. Notebooks e computadores seminovos são revisados na bancada e têm 6 meses de garantia da Balão da Informática.",
  },
  {
    question: "Quais as formas de pagamento?",
    answer: "Pix e cartões Visa, Mastercard, Elo e American Express, na loja e no site.",
  },
  {
    question: "Como peço um orçamento?",
    answer: `O jeito mais rápido é a triagem no topo desta página ou o WhatsApp ${SITE_CONFIG.whatsapp.display}. Você também pode ligar no ${SITE_CONFIG.phone.display} ou passar na loja, na ${SITE_CONFIG.addressShort}.`,
  },
];

/* ----------------------------------------------------------------------------
 * Vitrines
 * ------------------------------------------------------------------------- */

type Vitrine = { id: string; titulo: string; subtitulo: string; href: string; rotulo: string; produtos: Product[] };

async function lerVitrines(): Promise<Vitrine[]> {
  const [pcGamer, notebooks, macbooks, iphones, ssds, memorias] = await Promise.allSettled([
    getCachedVitrinePcGamer(),
    getCachedNotebooks(),
    getCachedProductsByCategoryFullPath("Computadores/Notebooks/Macbook"),
    getCachedProductsByCategoryFullPath("Celular & Smartphone/Smartphones/iPhone"),
    getCachedProductsByCategoryFullPath("Hardware/SSD/SSD PCIe NVMe"),
    getCachedProductsByCategoryFullPath("Hardware/Memória RAM"),
  ]);
  const ok = <T,>(r: PromiseSettledResult<T>, vazio: T): T => (r.status === "fulfilled" && r.value ? r.value : vazio);

  const fileiras = ok(pcGamer, { fileiras: [], total: 0 }).fileiras;
  const pcsFortes = fileiras
    .filter((f) => ["12gb-ou-mais", "8gb", "elite", "ate-6gb"].includes(f.id))
    .flatMap((f) => f.produtos);

  const vitrines: Vitrine[] = [
    {
      id: "pc-gamer",
      titulo: "PCs gamer montados e testados na bancada",
      subtitulo: "Placas de vídeo de 6 GB para cima. Veja ligado na loja antes de levar.",
      href: "/pcgamer",
      rotulo: "Todos os PCs gamer",
      produtos: escolherDestaques(pcsFortes, 4, (p) => !/office|escrit[oó]rio/i.test(p.name)),
    },
    {
      id: "notebooks",
      titulo: "Notebooks para estudar, trabalhar e jogar",
      subtitulo: "Do básico ao gamer, com nota fiscal e garantia.",
      href: "/notebooks",
      rotulo: "Todos os notebooks",
      produtos: escolherDestaques(ok(notebooks, { produtos: [] as Product[], total: 0 }).produtos, 4),
    },
    {
      id: "apple",
      titulo: "Apple na loja que também conserta Apple",
      subtitulo: "MacBook e iPhone com assistência na mesma bancada.",
      href: "/categoria/computadores-notebooks-macbook",
      rotulo: "Ver MacBooks",
      produtos: escolherDestaques([...ok(macbooks, [] as Product[]), ...ok(iphones, [] as Product[])], 4),
    },
    {
      id: "upgrade",
      titulo: "Upgrade que deixa o computador rápido de novo",
      subtitulo: "SSD NVMe e memória RAM — e a instalação é feita aqui na loja.",
      href: "/categoria/hardware-ssd-ssd-pcie-nvme",
      rotulo: "Ver SSDs NVMe",
      produtos: [
        ...escolherDestaques(ok(ssds, [] as Product[]), 2, ehSsdDeUpgrade),
        ...escolherDestaques(ok(memorias, [] as Product[]), 2, ehMemoriaRam),
      ],
    },
  ];

  return vitrines.filter((v) => v.produtos.length >= 2);
}

/* ----------------------------------------------------------------------------
 * Página
 * ------------------------------------------------------------------------- */

const cartao = "rounded-[28px] border border-[var(--site-border)] bg-[var(--site-panel)]";
const rotuloSecao = "text-xs font-black uppercase tracking-[0.22em] text-[#E60012]";
const tituloSecao = "text-2xl font-black tracking-tight text-[var(--site-text)] sm:text-4xl";

export default async function EspecialidadesPage() {
  const vitrines = await lerVitrines();
  const todosOsProdutos = vitrines.flatMap((v) => v.produtos);

  const servicosSchema = {
    "@type": "OfferCatalog",
    "@id": `${URL_DA_PAGINA}#servicos`,
    name: "Especialidades da Balão da Informática em Campinas",
    url: URL_DA_PAGINA,
    itemListElement: ESPECIALIDADES.map((e, i) => ({
      "@type": "Offer",
      position: i + 1,
      itemOffered: {
        "@type": "Service",
        name: e.titulo,
        description: `${e.resumo} ${e.itens.join(". ")}.`,
        url: `https://www.balao.info${e.href}`,
        areaServed: ["Campinas", ...REGIONAL_CITIES.map((c) => c.name).filter((n) => n !== "Campinas"), "Indaiatuba"],
        provider: { "@id": "https://www.balao.info/#organization" },
      },
    })),
  };

  const paginaSchema = {
    "@type": "WebPage",
    "@id": `${URL_DA_PAGINA}#pagina`,
    url: URL_DA_PAGINA,
    name: `${TITULO} | Balão da Informática`,
    description: DESCRICAO,
    inLanguage: "pt-BR",
    about: { "@id": "https://www.balao.info/#organization" },
    primaryImageOfPage: "https://www.balao.info/blog/capas/pc-pronto-para-retirar-hoje-campinas.webp",
    speakable: { "@type": "SpeakableSpecification", cssSelector: ["#resumo", "#faq"] },
  };

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)] font-sans text-[var(--site-text)] selection:bg-[#E60012] selection:text-white">
      <JsonLd
        data={[
          generateOrganizationSchema(),
          paginaSchema,
          servicosSchema,
          generateBreadcrumbSchema([
            { name: "Início", item: "https://www.balao.info" },
            { name: "Especialidades", item: URL_DA_PAGINA },
          ]),
          ...(todosOsProdutos.length ? [generateItemListSchema(todosOsProdutos, URL_DA_PAGINA)] : []),
          generateFAQSchema(FAQS),
        ]}
      />
      <Header />

      <main className="flex-1 space-y-16 pb-16 sm:space-y-24 sm:pb-24">
        {/* ============ HERO + TRIAGEM ============ */}
        <section className="relative overflow-hidden">
          <Image
            src="/blog/capas/pc-pronto-para-retirar-hoje-campinas.webp"
            alt="Atendimento na loja da Balão da Informática no Cambuí, em Campinas"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#070a12] via-[#070a12]/92 to-[#070a12]/55" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-transparent to-transparent" />

          <div className="relative mx-auto grid max-w-7xl gap-10 px-4 pb-12 pt-10 sm:px-6 sm:pt-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-14 lg:px-8 lg:pb-20 lg:pt-20">
            <div className="space-y-6 text-white">
              <nav aria-label="Você está em" className="text-xs font-semibold text-slate-400">
                <Link href="/" className="hover:text-white">Início</Link> <span className="mx-1">/</span>{" "}
                <span className="text-slate-200">Especialidades</span>
              </nav>

              <span className="inline-flex items-center gap-2 rounded-full border border-[#E60012]/50 bg-[#E60012]/15 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-[#ff5a66]">
                <MapPin className="h-3.5 w-3.5" /> Loja física no Cambuí · Campinas/SP
              </span>

              <h1 className="text-[2.1rem] font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.6rem]">
                Assistência técnica, PC gamer e reparo Apple em Campinas —{" "}
                <span className="text-[#E60012]">resolvido por quem você vê.</span>
              </h1>

              <p className="max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
                Conserto de computador e notebook, troca de tela e bateria de iPhone, reparo de MacBook, montagem de PC
                gamer e recuperação de dados, numa loja de verdade na Av. Anchieta. Você fala com o técnico, aprova o
                orçamento e acompanha tudo — sem mandar seu equipamento para longe.
              </p>

              <div className="flex flex-wrap gap-3">
                <a
                  href={whats("Olá! Vim pela página de Especialidades do site e quero atendimento.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-conversion-source="especialidades-hero"
                  data-conversion-label="whatsapp-hero"
                  className="inline-flex items-center gap-2.5 rounded-2xl bg-[#E60012] px-6 py-4 text-base font-black text-white shadow-xl shadow-red-950/50 transition-all hover:bg-red-700 active:scale-95"
                >
                  <MessageCircle className="h-5 w-5" /> Falar no WhatsApp agora
                </a>
                <a
                  href={`tel:+${SITE_CONFIG.phone.number}`}
                  data-conversion-source="especialidades-hero"
                  data-conversion-label="telefone-hero"
                  className="inline-flex items-center gap-2.5 rounded-2xl border border-white/20 bg-white/5 px-6 py-4 text-base font-black text-white transition-colors hover:border-white/50"
                >
                  <Phone className="h-5 w-5" /> {SITE_CONFIG.phone.display}
                </a>
              </div>

              <ul className="grid max-w-2xl grid-cols-2 gap-3 pt-2 sm:grid-cols-4">
                {PROVAS.map((p) => (
                  <li key={p.texto} className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur">
                    <p.icone className="mb-1.5 h-4 w-4 text-[#E60012]" />
                    <p className="text-xl font-black leading-none">{p.numero}</p>
                    <p className="mt-1 text-[11px] font-semibold leading-snug text-slate-400">{p.texto}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div id="triagem" className="scroll-mt-28">
              <TriagemLead origem="especialidades-hero" />
            </div>
          </div>
        </section>

        {/* ============ PROBLEMAS COMUNS ============ */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className={rotuloSecao}>Comece pelo problema</p>
              <h2 className={tituloSecao}>O que está acontecendo com o seu equipamento?</h2>
            </div>
            <p className="max-w-md text-sm text-[var(--site-muted)]">
              Toque no seu caso: o WhatsApp abre com a mensagem pronta e o técnico já sabe do que se trata.
            </p>
          </div>
          <ul className="flex flex-wrap gap-2.5">
            {PROBLEMAS.map((p) => (
              <li key={p.texto}>
                <a
                  href={whats(`Olá! Vim pela página de Especialidades. Meu caso: ${p.texto}.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-conversion-source="especialidades-problemas"
                  data-conversion-label={p.texto}
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--site-border)] bg-[var(--site-panel)] px-4 py-2.5 text-sm font-bold text-[var(--site-soft)] transition-all hover:-translate-y-0.5 hover:border-[#E60012] hover:text-[var(--site-text)]"
                >
                  <MessageCircle className="h-4 w-4 text-[#E60012]" /> {p.texto}
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* ============ ESPECIALIDADES COM FOTO ============ */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-labelledby="titulo-especialidades">
          <div className="mb-8 max-w-3xl">
            <p className={rotuloSecao}>Nossas especialidades</p>
            <h2 id="titulo-especialidades" className={tituloSecao}>
              Seis frentes, uma bancada só, no meio de Campinas
            </h2>
            <p className="mt-3 text-base text-[var(--site-muted)]">
              Do conserto ao computador novo: o mesmo time vende, monta, conserta e dá garantia. Escolha a área e fale
              direto com quem resolve.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {ESPECIALIDADES.map((e, i) => (
              <article key={e.titulo} className={`${cartao} group overflow-hidden transition-colors hover:border-[#E60012]/60`}>
                <Link href={e.href} className="relative block aspect-[16/9] overflow-hidden" aria-label={e.cta}>
                  <Image
                    src={e.imagem}
                    alt={e.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    loading={i < 2 ? "eager" : "lazy"}
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                  <h3 className="absolute bottom-4 left-5 right-5 text-xl font-black leading-tight text-white sm:text-2xl">
                    {e.titulo}
                  </h3>
                </Link>
                <div className="space-y-4 p-5 sm:p-6">
                  <p className="text-sm leading-relaxed text-[var(--site-soft)]">{e.resumo}</p>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {e.itens.map((item) => (
                      <li key={item} className="flex gap-2 text-sm text-[var(--site-soft)]">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#E60012]" /> {item}
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap items-center gap-2 border-t border-[var(--site-border)] pt-4">
                    <a
                      href={whats(e.mensagem)}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-conversion-source="especialidades-cards"
                      data-conversion-label={e.titulo}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#E60012] px-4 py-2.5 text-sm font-black text-white transition-colors hover:bg-red-700"
                    >
                      <MessageCircle className="h-4 w-4" /> Pedir orçamento
                    </a>
                    <Link
                      href={e.href}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--site-border)] px-4 py-2.5 text-sm font-bold text-[var(--site-text)] transition-colors hover:border-[#E60012]"
                    >
                      {e.cta} <ArrowRight className="h-4 w-4" />
                    </Link>
                    {e.links?.map((l) => (
                      <Link key={l.href} href={l.href} className="px-2 py-2 text-xs font-bold text-[var(--site-muted)] hover:text-[#E60012]">
                        {l.rotulo}
                      </Link>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>

          <ul className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {MAIS_SERVICOS.map((s) => (
              <li key={s.titulo}>
                <Link
                  href={s.href}
                  className={`${cartao} flex h-full items-start gap-3 p-4 transition-colors hover:border-[#E60012]/60`}
                >
                  <s.icone className="mt-0.5 h-5 w-5 shrink-0 text-[#E60012]" />
                  <span>
                    <span className="block text-sm font-extrabold text-[var(--site-text)]">{s.titulo}</span>
                    <span className="block text-xs leading-snug text-[var(--site-muted)]">{s.texto}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* ============ VITRINES ============ */}
        {vitrines.length > 0 && (
          <section className="mx-auto max-w-7xl space-y-14 px-4 sm:px-6 lg:px-8" aria-label="Produtos em destaque">
            {vitrines.map((v) => (
              <div key={v.id}>
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className={rotuloSecao}>Na loja agora</p>
                    <h2 className="text-2xl font-black tracking-tight text-[var(--site-text)] sm:text-3xl">{v.titulo}</h2>
                    <p className="mt-1 text-sm text-[var(--site-muted)]">{v.subtitulo}</p>
                  </div>
                  <Link
                    href={v.href}
                    className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-[var(--site-soft)] hover:text-[#E60012]"
                  >
                    {v.rotulo} <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
                  {v.produtos.map((produto) => (
                    <ProductCard key={produto.id} product={produto} />
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* ============ COMPARATIVO ============ */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className={`${cartao} overflow-hidden`}>
            <div className="grid lg:grid-cols-[0.8fr_1.2fr]">
              <div className="relative min-h-[260px]">
                <Image
                  src="/blog/capas/assistencia-tecnica-informatica-campinas.webp"
                  alt="Técnico da assistência no Cambuí atendendo cliente"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                <div className="absolute bottom-0 p-6 text-white sm:p-8">
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-[#ff5a66]">Por que a Balão</p>
                  <h2 className="mt-2 text-2xl font-black leading-tight sm:text-3xl">
                    Loja grande vende produto. A Balão vende solução — e cuida depois.
                  </h2>
                </div>
              </div>
              <div className="p-5 sm:p-8">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[520px] text-left text-sm">
                    <caption className="sr-only">Comparativo entre a Balão da Informática e lojas só online</caption>
                    <thead>
                      <tr className="border-b border-[var(--site-border)] text-xs uppercase tracking-wider text-[var(--site-muted)]">
                        <th scope="col" className="py-3 pr-4 font-black">O que importa</th>
                        <th scope="col" className="py-3 pr-4 font-black text-[#E60012]">Balão da Informática</th>
                        <th scope="col" className="py-3 font-black">Loja só online</th>
                      </tr>
                    </thead>
                    <tbody>
                      {COMPARATIVO.map((linha) => (
                        <tr key={linha.item} className="border-b border-[var(--site-border)] last:border-0">
                          <th scope="row" className="py-3.5 pr-4 font-bold text-[var(--site-text)]">{linha.item}</th>
                          <td className="py-3.5 pr-4 text-[var(--site-soft)]">
                            <span className="inline-flex items-start gap-1.5">
                              <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#E60012]" /> {linha.balao}
                            </span>
                          </td>
                          <td className="py-3.5 text-[var(--site-muted)]">
                            <span className="inline-flex items-start gap-1.5">
                              <X className="mt-0.5 h-4 w-4 shrink-0 opacity-60" /> {linha.online}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ COMO FUNCIONA ============ */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <p className={rotuloSecao}>Como funciona</p>
            <h2 className={tituloSecao}>Do primeiro “oi” ao equipamento funcionando</h2>
          </div>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PASSOS.map((p, i) => (
              <li key={p.titulo} className={`${cartao} relative p-6`}>
                <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#E60012] text-lg font-black text-white">
                  {i + 1}
                </span>
                <h3 className="text-lg font-black text-[var(--site-text)]">{p.titulo}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[var(--site-muted)]">{p.texto}</p>
              </li>
            ))}
          </ol>
          <div className="mt-8 flex justify-center">
            <a
              href="#triagem"
              className="inline-flex items-center gap-2 rounded-2xl bg-[#E60012] px-7 py-4 font-black text-white shadow-lg shadow-red-950/40 transition-all hover:bg-red-700 active:scale-95"
            >
              Começar minha triagem <ArrowRight className="h-5 w-5" />
            </a>
          </div>
        </section>

        {/* ============ RESUMO PARA GOOGLE E IAs ============ */}
        <section id="resumo" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className={`${cartao} grid gap-8 p-6 sm:p-10 lg:grid-cols-[1fr_1fr]`}>
            <div>
              <p className={rotuloSecao}>Em resumo</p>
              <h2 className="mt-1 text-2xl font-black text-[var(--site-text)] sm:text-3xl">
                Balão da Informática: loja e assistência técnica de informática em Campinas
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-[var(--site-soft)]">
                A Balão da Informática é uma loja de informática com assistência técnica própria no bairro Cambuí, em
                Campinas (SP), com mais de 25 anos de marca. Conserta computadores, notebooks, iPhones, MacBooks, iPads e
                videogames; monta PCs gamer e workstations sob medida; recupera dados de HDs e SSDs; e vende notebooks,
                computadores, peças e periféricos, novos e seminovos com garantia. Atende Campinas e a Região
                Metropolitana com retirada na loja e entrega por motoboy, e o Brasil pelos Correios.
              </p>
            </div>
            <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
              {[
                ["Endereço", `${SITE_CONFIG.address}, ${SITE_CONFIG.postalCode}`],
                ["Horário", SITE_CONFIG.openingHoursDisplay],
                ["WhatsApp", SITE_CONFIG.whatsapp.display],
                ["Telefone", SITE_CONFIG.phone.display],
                ["Atende", "Campinas, Sumaré, Hortolândia, Paulínia, Valinhos, Vinhedo, Indaiatuba e todo o Brasil pelos Correios"],
                ["Pagamento", "Pix, Visa, Mastercard, Elo e American Express"],
                ["Garantia", "Nota fiscal e garantia do fabricante; seminovos com 6 meses da loja"],
                ["CNPJ", SITE_CONFIG.cnpj],
              ].map(([rotulo, valor]) => (
                <div key={rotulo} className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-panel-muted)] p-3.5">
                  <dt className="text-[11px] font-black uppercase tracking-wider text-[var(--site-muted)]">{rotulo}</dt>
                  <dd className="mt-0.5 font-semibold text-[var(--site-text)]">{valor}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ============ REGIÃO ============ */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <p className={rotuloSecao}>Onde atendemos</p>
            <h2 className={tituloSecao}>Campinas e região, com motoboy e retirada na loja</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {REGIONAL_CITIES.map((cidade) => (
              <div key={cidade.slug} className={`${cartao} p-5`}>
                <h3 className="flex items-center gap-2 text-base font-black text-[var(--site-text)]">
                  <MapPin className="h-4 w-4 text-[#E60012]" /> {cidade.name}
                </h3>
                <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5">
                  {REGIONAL_SERVICES.map((servico) => (
                    <li key={servico.slug}>
                      <Link
                        href={`/regiao/${cidade.slug}/${servico.slug}`}
                        className="text-xs font-semibold text-[var(--site-muted)] underline-offset-4 hover:text-[#E60012] hover:underline"
                      >
                        {servico.shortName} em {cidade.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-5">
            <p className="mb-2 text-xs font-black uppercase tracking-wider text-[var(--site-muted)]">Bairros de Campinas</p>
            <ul className="flex flex-wrap gap-2">
              {CAMPINAS_NEIGHBORHOODS.map((bairro) => (
                <li key={bairro.slug}>
                  <Link
                    href={`/bairro/${bairro.slug}`}
                    className="inline-block rounded-full border border-[var(--site-border)] px-3 py-1.5 text-xs font-bold text-[var(--site-soft)] hover:border-[#E60012] hover:text-[#E60012]"
                  >
                    Assistência técnica · {bairro.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ============ FAQ ============ */}
        <section id="faq" className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <p className={rotuloSecao}>Dúvidas frequentes</p>
            <h2 className={tituloSecao}>Perguntas sobre a assistência e a loja</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <details key={faq.question} open={i === 0} className={`${cartao} group p-5 sm:p-6`}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-black text-[var(--site-text)]">
                  <h3>{faq.question}</h3>
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--site-border)] text-[#E60012] transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-[var(--site-soft)]">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ============ CTA FINAL ============ */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[32px] border border-[#E60012]/40 bg-[#0b0f1a]">
            <Image
              src="/blog/capas/pc-gamer-montado-para-jogos-vale-a-pena.webp"
              alt="PC gamer montado pela Balão da Informática"
              fill
              sizes="100vw"
              className="object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0b0f1a] via-[#0b0f1a]/90 to-[#0b0f1a]/40" />
            <div className="relative grid gap-8 p-6 text-white sm:p-10 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:p-14">
              <div className="space-y-5">
                <h2 className="text-3xl font-black leading-tight sm:text-4xl">
                  Seu equipamento resolvido por quem está a uma avenida de você.
                </h2>
                <p className="text-slate-300">
                  {SITE_CONFIG.address} · {SITE_CONFIG.openingHoursDisplay}
                </p>
                <ul className="space-y-2 text-sm text-slate-200">
                  <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#E60012]" /> Orçamento aprovado por você antes do serviço</li>
                  <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-[#E60012]" /> Canal urgente para resolver no mesmo dia</li>
                  <li className="flex items-center gap-2"><Truck className="h-4 w-4 text-[#E60012]" /> Motoboy em Campinas e região</li>
                </ul>
                <div className="flex flex-wrap gap-3 pt-1">
                  <a
                    href={whats("Olá! Vim pela página de Especialidades do site e quero atendimento.")}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-conversion-source="especialidades-final"
                    data-conversion-label="whatsapp-final"
                    className="inline-flex items-center gap-2 rounded-2xl bg-[#E60012] px-6 py-4 font-black text-white transition-all hover:bg-red-700 active:scale-95"
                  >
                    <MessageCircle className="h-5 w-5" /> WhatsApp {SITE_CONFIG.whatsapp.display}
                  </a>
                  <a
                    href={SITE_CONFIG.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/25 px-6 py-4 font-black text-white hover:border-white/60"
                  >
                    <MapPin className="h-5 w-5" /> Como chegar
                  </a>
                </div>
              </div>
              <TriagemLead origem="especialidades-final" titulo="Ainda em dúvida? Faça a triagem e fale com o técnico." />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
