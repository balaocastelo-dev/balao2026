import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Check, MapPin, MessageCircle, Star } from "lucide-react";
import Header from "@/components/Header";
import JsonLd, { generateBreadcrumbSchema, generateFAQSchema, generateOrganizationSchema } from "@/components/JsonLd";
import { archivo } from "@/components/premium/fonte";
import BarraDePedido from "@/components/seminovos/BarraDePedido";
import FormularioDeLead from "@/components/seminovos/FormularioDeLead";
import QualSeminovo from "@/components/seminovos/QualSeminovo";
import VitrineDeSeminovos from "@/components/seminovos/VitrineDeSeminovos";
import { SITE_CONFIG } from "@/lib/config";
import { nomeDoAparelho } from "@/lib/seminovos/tipos";
import { getVitrineDeSeminovos } from "@/lib/seminovos/vitrine";
import { linkDoWhatsApp, mensagemDoPedido } from "@/lib/seminovos/whatsapp";

// ============================================================
// /seminovos — página de captação (pedido do Thiago, 12/10/2026).
//
// Antes: a "vitrine" buscava "notebook" no catálogo inteiro e mostrava cabo
// de força e fonte; a página carregava os 7 mil produtos a cada visita.
// Agora: a vitrine mostra só os aparelhos cadastrados em /painel/seminovos,
// com foto tirada na loja (regra da foto exata, 12/10). Sem aparelho
// cadastrado, a página vira lista de espera e continua captando.
// Todo formulário guarda o lead no painel, avisa a loja por e-mail e abre o
// WhatsApp com o pedido escrito.
// ============================================================

export const revalidate = 300;

const URL_DA_PAGINA = "https://www.balao.info/seminovos";
const TITULO = "Notebook Seminovo em Campinas com 6 Meses de Garantia";
const DESCRICAO =
  "Notebooks seminovos de linha corporativa (Lenovo ThinkPad, Dell Latitude, HP EliteBook e MacBook) revisados na bancada, com 6 meses de garantia e nota fiscal. Teste antes de comprar na loja do Cambuí, em Campinas.";

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRICAO,
  keywords: [
    "notebook seminovo campinas",
    "notebook usado campinas",
    "notebook seminovo com garantia",
    "notebook corporativo seminovo",
    "thinkpad seminovo",
    "dell latitude seminovo",
    "hp elitebook seminovo",
    "macbook seminovo campinas",
    "notebook recondicionado campinas",
    "onde comprar notebook usado em campinas",
    "notebook barato campinas",
    "notebook seminovo cambuí",
    "notebook seminovo valinhos",
    "notebook seminovo paulínia",
  ],
  alternates: { canonical: URL_DA_PAGINA },
  openGraph: {
    title: `${TITULO} | Balão da Informática`,
    description: "Linha corporativa revisada na bancada, 6 meses de garantia e teste na loja do Cambuí. Diga o que precisa e receba as opções no WhatsApp.",
    type: "website",
    url: URL_DA_PAGINA,
    siteName: SITE_CONFIG.name,
    locale: "pt_BR",
    images: [{ url: "/images/landing/hero_seminovos.jpg", width: 1200, height: 630, alt: "Notebooks seminovos revisados na Balão da Informática, Campinas" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${TITULO} | Balão da Informática`,
    description: "Linha corporativa revisada, 6 meses de garantia e teste na loja do Cambuí.",
    images: ["/images/landing/hero_seminovos.jpg"],
  },
};

// ---------------------------------------------------------------- conteúdo

const LAUDO = [
  ["Tela", "sem pixel morto nem mancha"],
  ["Bateria", "saúde acima de 80%"],
  ["Teclado e touchpad", "todas as teclas"],
  ["SSD", "saúde e velocidade"],
  ["Memória", "teste completo"],
  ["Temperatura", "sob carga"],
  ["Wi-Fi, câmera e áudio", "funcionando"],
  ["Windows", "ativado, sem dados antigos"],
] as const;

const BANCADA: { grupo: string; itens: string[] }[] = [
  { grupo: "Tela e carcaça", itens: ["Pixel morto", "Manchas e vazamento de luz", "Brilho máximo e mínimo", "Dobradiças firmes", "Carcaça sem trinca"] },
  { grupo: "Bateria e energia", itens: ["Saúde da bateria e ciclos", "Carga com o carregador", "Autonomia em uso real", "Conector de carga"] },
  { grupo: "Teclado e touchpad", itens: ["Todas as teclas", "Luz do teclado, quando tem", "Touchpad e cliques", "TrackPoint nos ThinkPad"] },
  { grupo: "Desempenho", itens: ["Processador sob carga", "Temperatura e ventoinha", "Memória em teste completo", "Saúde do SSD", "Velocidade do SSD"] },
  { grupo: "Conexões", itens: ["Portas USB", "USB-C", "HDMI", "Rede cabeada", "Wi-Fi", "Bluetooth", "Leitor de cartão, quando tem"] },
  { grupo: "Câmera e som", itens: ["Câmera", "Microfone", "Alto-falantes", "Saída de fone"] },
  { grupo: "Sistema", itens: ["Windows ativado", "Drivers atualizados", "BIOS sem senha", "Formatação sem dados do dono anterior"] },
];
const TOTAL_DA_BANCADA = BANCADA.reduce((n, g) => n + g.itens.length, 0);

const COMPARATIVO: { ponto: string; seminovo: string; novo: string }[] = [
  { ponto: "Construção", seminovo: "Chassi reforçado e dobradiça feita para anos de abre e fecha", novo: "Plástico mais simples na maioria dos modelos de entrada" },
  { ponto: "Processador", seminovo: "Core i5, Core i7 ou Ryzen de linha empresarial", novo: "Muitas vezes processador de entrada para caber no preço" },
  { ponto: "Memória e SSD", seminovo: "Slots acessíveis: dá para aumentar depois, até na hora da compra", novo: "Memória soldada em muitos modelos, sem como aumentar" },
  { ponto: "Teclado", seminovo: "Teclado de uso profissional, para digitar o dia inteiro", novo: "Teclado básico" },
  { ponto: "Garantia", seminovo: "6 meses na loja, presencial, no Cambuí", novo: "Garantia de fábrica, pela assistência autorizada" },
  { ponto: "Antes de pagar", seminovo: "Você liga, testa e escolhe na loja", novo: "Caixa fechada" },
];

const POR_USO: { titulo: string; texto: string; config: string }[] = [
  {
    titulo: "Notebook seminovo para estudar",
    texto:
      "Para faculdade e curso, o que mais pesa é bateria, peso e uma tela que não cansa a vista. Um ThinkPad da série T ou um Latitude 5000 de 14 polegadas atende com folga e aguenta a mochila todo dia.",
    config: "Core i5 de 8ª geração ou mais nova, 8 a 16 GB, SSD de 256 GB, tela de 14″ Full HD.",
  },
  {
    titulo: "Notebook seminovo para trabalhar e home office",
    texto:
      "Planilha pesada, sistema da empresa e videochamada ao mesmo tempo pedem 16 GB de memória. Linha corporativa tem webcam e microfone decentes, teclado confortável e porta de rede, que faz falta em muito notebook novo.",
    config: "Core i5 de 8ª geração ou mais nova, 16 GB, SSD de 256 a 512 GB.",
  },
  {
    titulo: "Notebook seminovo para programar",
    texto:
      "IDE, navegador, Docker e máquina virtual consomem memória antes de processador. Um seminovo com 32 GB costuma custar menos que um novo com 8 GB soldados. MacBook com chip M1 também é uma escolha forte para quem programa.",
    config: "Core i7 ou Ryzen 7 (ou Core i5 de 10ª geração em diante), 16 a 32 GB, SSD NVMe de 512 GB.",
  },
  {
    titulo: "Notebook seminovo para design, foto e vídeo",
    texto:
      "Aqui a tela manda. Prefira painel IPS Full HD e venha ver o aparelho ligado. MacBook Air e Pro com chip M1, Latitude série 7000 e ThinkPad da série P são os mais pedidos para esse uso.",
    config: "Core i7 / Ryzen 7 ou Apple M1 em diante, 16 GB ou mais, SSD de 512 GB a 1 TB.",
  },
];

const FAQ = [
  {
    question: "Vale a pena comprar notebook seminovo?",
    answer:
      "Vale, quando ele é de linha corporativa e foi revisado. Pelo preço de um notebook novo de entrada você leva um ThinkPad, Latitude ou EliteBook com construção mais resistente, processador melhor e memória e SSD que dá para aumentar. O cuidado é comprar de quem testa, dá garantia e emite nota fiscal.",
  },
  {
    question: "Qual a diferença entre notebook seminovo, usado e recondicionado?",
    answer:
      "Usado é vendido como está, sem revisão. Seminovo, na Balão, é um aparelho de linha corporativa que passou pela bancada: testamos tela, bateria, teclado, SSD, memória, temperatura, conexões e sistema, e ele sai com garantia. Recondicionado é o termo usado quando há troca de peças para deixar o aparelho dentro do padrão; quando trocamos alguma peça, o vendedor informa.",
  },
  {
    question: "Qual é a garantia dos notebooks seminovos da Balão?",
    answer:
      "6 meses de garantia de hardware, com atendimento presencial na nossa loja da Av. Anchieta, 789, no Cambuí, em Campinas. Você não precisa mandar o notebook pelo correio para ninguém.",
  },
  {
    question: "De onde vêm os notebooks seminovos?",
    answer:
      "São de linha corporativa (Dell Latitude, Lenovo ThinkPad, HP EliteBook e ProBook), vindos de lotes de empresas, e também MacBooks. Equipamento feito para uso profissional costuma durar bem mais que os modelos de varejo.",
  },
  {
    question: "O que quer dizer Grau A?",
    answer:
      "Grau A é o aparelho sem trinca, com tela sem pixel morto, teclado e touchpad perfeitos e bateria com saúde acima de 80%. Pode ter marcas leves de uso. Quando um aparelho tem algum detalhe estético, isso aparece escrito no anúncio dele.",
  },
  {
    question: "Posso testar o notebook antes de comprar?",
    answer:
      "Pode e recomendamos. Reserve pelo site ou pelo WhatsApp e venha à loja no Cambuí: você liga, testa e só leva se gostar. Atendemos de segunda a sexta das 9h às 18h e aos sábados das 9h às 13h.",
  },
  {
    question: "Dá para aumentar a memória ou trocar o SSD na hora da compra?",
    answer:
      "Dá. Fazemos o upgrade na bancada da loja: SSD de 512 GB ou 1 TB e memória para 16 ou 32 GB, conforme o modelo aceita. O vendedor passa o valor junto com as opções.",
  },
  {
    question: "O notebook seminovo vem com nota fiscal?",
    answer: "Sim. Todo seminovo vendido pela Balão da Informática Castelo sai com nota fiscal, o que vale também para empresa que precisa lançar a compra.",
  },
  {
    question: "Vocês entregam em Campinas e região?",
    answer:
      "Entregamos em Campinas, Valinhos e Paulínia, normalmente no mesmo dia, combinando pelo WhatsApp. Também dá para retirar na loja do Cambuí.",
  },
  {
    question: "Quais as formas de pagamento?",
    answer: "Pix, dinheiro e cartão de crédito (Visa, Mastercard, Elo e American Express). Cada aparelho mostra o preço à vista e no cartão.",
  },
  {
    question: "Vocês vendem notebooks seminovos para empresas?",
    answer:
      "Sim. Diga quantos aparelhos precisa e para que uso, e o vendedor monta a proposta com o que há em estoque, de preferência com a mesma configuração para toda a equipe, o que facilita o suporte.",
  },
  {
    question: "Quero vender meu notebook usado. A Balão compra?",
    answer:
      "Trabalhamos com consignação: avaliamos seu notebook ou PC, ele fica na nossa vitrine no Cambuí e você recebe quando ele for vendido. Veja como funciona na página de consignação ou chame no WhatsApp.",
  },
];

const RESUMO = [
  "Loja física de informática em Campinas: Av. Anchieta, 789, Cambuí.",
  "Vende notebooks seminovos de linha corporativa: Lenovo ThinkPad, Dell Latitude, HP EliteBook e ProBook, além de MacBook.",
  `Cada aparelho passa por ${TOTAL_DA_BANCADA} itens de teste na bancada e sai com 6 meses de garantia e nota fiscal.`,
  "O cliente pode testar o notebook na loja antes de comprar; upgrade de memória e SSD na hora.",
  "Entrega em Campinas, Valinhos e Paulínia; atendimento pelo WhatsApp (19) 98751-0267.",
  "Mais de 25 anos de marca e 744 avaliações no Google.",
];

// ---------------------------------------------------------------- página

export default async function SeminovosPage() {
  const itens = await getVitrineDeSeminovos();
  const disponiveis = itens.filter((s) => s.situacao === "disponivel");
  const temEstoque = itens.length > 0;

  const schemas: Record<string, unknown>[] = [
    generateOrganizationSchema(),
    generateBreadcrumbSchema([
      { name: "Início", item: "https://www.balao.info" },
      { name: "Notebooks seminovos", item: URL_DA_PAGINA },
    ]),
    generateFAQSchema(FAQ),
    {
      "@type": "WebPage",
      "@id": `${URL_DA_PAGINA}#pagina`,
      url: URL_DA_PAGINA,
      name: TITULO,
      description: DESCRICAO,
      inLanguage: "pt-BR",
      about: { "@type": "Thing", name: "Notebook seminovo" },
      isPartOf: { "@id": "https://www.balao.info/#website" },
      publisher: { "@id": "https://www.balao.info/#organization" },
      speakable: { "@type": "SpeakableSpecification", cssSelector: ["#em-resumo"] },
    },
  ];
  if (disponiveis.length) {
    schemas.push({
      "@type": "ItemList",
      name: "Notebooks seminovos à venda na Balão da Informática",
      itemListElement: disponiveis.map((s, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Product",
          name: `${nomeDoAparelho(s)} seminovo`,
          brand: { "@type": "Brand", name: s.marca },
          description: [s.processador, s.memoria, s.armazenamento, s.tela, `Grau ${s.grau}`, `${s.garantiaMeses} meses de garantia`].filter(Boolean).join(", "),
          image: s.fotos.map((f) => `https://www.balao.info${f}`),
          url: `${URL_DA_PAGINA}#aparelho-${s.id}`,
          offers: {
            "@type": "Offer",
            price: s.precoVista.toFixed(2),
            priceCurrency: "BRL",
            itemCondition: "https://schema.org/UsedCondition",
            availability: "https://schema.org/InStoreOnly",
            seller: { "@id": "https://www.balao.info/#organization" },
          },
        },
      })),
    });
  }

  const linkDireto = linkDoWhatsApp(mensagemDoPedido({ interesse: "comprar" }));

  return (
    <div className={`${archivo.variable} min-h-screen bg-[#090d16] text-white`} style={{ fontFamily: "var(--font-archivo), Arial, sans-serif" }}>
      <JsonLd data={schemas} />
      <Header />

      <main className="pb-24 sm:pb-0">
        {/* ------------------------------------------------ topo: promessa + pedido */}
        <section className="relative overflow-hidden border-b border-slate-800/70">
          <div className="pointer-events-none absolute inset-0 -z-0 bg-[radial-gradient(60%_80%_at_85%_10%,rgba(230,0,18,0.16),transparent_60%)]" aria-hidden />
          <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-12 lg:gap-12 lg:px-8 lg:py-20">
            <div className="lg:col-span-7">
              <nav aria-label="Você está em" className="text-sm text-slate-400">
                <Link href="/" className="hover:text-white">
                  Início
                </Link>
                <span className="mx-2" aria-hidden>
                  /
                </span>
                <span className="text-slate-200">Notebooks seminovos</span>
              </nav>

              <h1 className="mt-5 text-[2.15rem] font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.6rem]" style={{ fontStretch: "118%" }}>
                Notebook seminovo em Campinas com 6 meses de garantia
              </h1>
              <p className="mt-5 max-w-[60ch] text-lg leading-relaxed text-slate-300">
                ThinkPad, Latitude, EliteBook e MacBook de linha corporativa, revisados na bancada, pelo preço de um notebook novo de entrada. Você testa na
                loja do Cambuí antes de pagar e leva com nota fiscal.
              </p>

              <div id="pedido" className="mt-8 scroll-mt-28 rounded-3xl border border-slate-700/80 bg-[#111827] p-5 shadow-2xl shadow-black/40 sm:p-7">
                <h2 className="text-xl font-black sm:text-2xl">Diga o que precisa e receba o que tem na loja hoje</h2>
                <p className="mb-5 mt-1.5 text-sm text-slate-400">Um vendedor manda fotos, configuração e preço pelo WhatsApp. Sem compromisso.</p>
                <FormularioDeLead interesse="comprar" bloco="topo" botao="Receber opções no WhatsApp" mostrarUso mostrarOrcamento />
              </div>

              <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
                  744 avaliações no Google
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#E60012]" aria-hidden />
                  Loja física na Av. Anchieta, 789
                </li>
                <li>Mais de 25 anos de marca</li>
              </ul>
            </div>

            {/* O laudo: a etiqueta que acompanha cada aparelho que sai da bancada. */}
            <div className="lg:col-span-5">
              <div className="relative">
                <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-slate-800 lg:aspect-[4/5]">
                  <Image
                    src="/images/landing/hero_seminovos.jpg"
                    alt="Notebooks seminovos corporativos revisados na bancada da Balão da Informática, em Campinas"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090d16]/80 via-transparent to-transparent" aria-hidden />
                </div>
                <figure className="relative -mt-24 mx-4 rotate-[-1.5deg] rounded-2xl bg-[#f3f4f6] p-5 text-slate-900 shadow-2xl shadow-black/60 sm:mx-8 lg:absolute lg:-left-10 lg:bottom-8 lg:mx-0 lg:mt-0 lg:w-[22rem]">
                  <div className="flex items-start justify-between gap-3 border-b border-dashed border-slate-400 pb-3">
                    <div>
                      <p className="text-[1.05rem] font-black" style={{ fontStretch: "125%" }}>
                        Laudo de bancada
                      </p>
                      <p className="text-xs text-slate-600">Vai junto com cada seminovo</p>
                    </div>
                    <span className="rotate-[8deg] rounded-md border-2 border-[#E60012] px-2 py-0.5 text-sm font-black text-[#E60012]" style={{ fontStretch: "125%" }}>
                      Aprovado
                    </span>
                  </div>
                  <ul className="mt-3 space-y-1.5 text-sm">
                    {LAUDO.map(([item, detalhe]) => (
                      <li key={item} className="flex items-baseline gap-2">
                        <Check className="h-4 w-4 shrink-0 translate-y-0.5 text-emerald-600" aria-hidden />
                        <span className="font-bold">{item}</span>
                        <span className="text-slate-600">{detalhe}</span>
                      </li>
                    ))}
                  </ul>
                  <figcaption className="mt-3 border-t border-dashed border-slate-400 pt-3 text-xs font-semibold text-slate-700">
                    {TOTAL_DA_BANCADA} itens testados. Garantia de 6 meses na loja do Cambuí.
                  </figcaption>
                </figure>
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------ vitrine ou lista de espera */}
        <section id="vitrine" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          {temEstoque ? (
            <>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-3xl font-black tracking-tight sm:text-4xl" style={{ fontStretch: "112%" }}>
                    Na loja agora
                  </h2>
                  <p className="mt-2 max-w-[60ch] text-slate-300">
                    Fotos tiradas aqui, do aparelho que você vai levar. Seminovo é peça única: quando sai, sai. Reserve para ver e testar.
                  </p>
                </div>
                <p className="text-sm text-slate-400">
                  {disponiveis.length} {disponiveis.length === 1 ? "disponível" : "disponíveis"}
                </p>
              </div>
              <div className="mt-8">
                <VitrineDeSeminovos itens={itens} />
              </div>
              <div id="lista" className="mt-10 grid scroll-mt-28 gap-6 rounded-3xl border border-slate-800 bg-[#111827] p-5 sm:p-8 lg:grid-cols-5 lg:items-center">
                <div className="lg:col-span-2">
                  <h3 className="text-xl font-black">Não achou o seu?</h3>
                  <p className="mt-2 text-slate-300">
                    Chega aparelho toda semana. Diga o modelo ou a configuração e você recebe primeiro, pelo WhatsApp, antes de ir para o site.
                  </p>
                </div>
                <div className="lg:col-span-3">
                  <FormularioDeLead interesse="lista" bloco="lista" botao="Entrar na lista pelo WhatsApp" campoLivre="Ex.: ThinkPad com 16 GB, ou MacBook Air M1" />
                </div>
              </div>
            </>
          ) : (
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div>
                <h2 className="text-3xl font-black tracking-tight sm:text-4xl" style={{ fontStretch: "112%" }}>
                  Seminovo bom não fica na vitrine
                </h2>
                <p className="mt-4 max-w-[60ch] text-lg leading-relaxed text-slate-300">
                  O estoque muda toda semana e os melhores aparelhos saem antes de serem fotografados. Quem está na lista recebe primeiro, pelo WhatsApp, com
                  foto e preço.
                </p>
                <p className="mt-6 font-bold text-white">Os que mais chegam e mais saem</p>
                <ul className="mt-3 grid gap-x-6 gap-y-2 text-slate-300 sm:grid-cols-2">
                  {["Lenovo ThinkPad T14, T480 e T490", "Dell Latitude 5400, 5410 e 5420", "HP EliteBook 840 e ProBook 440", "MacBook Air e Pro com chip M1"].map((m) => (
                    <li key={m} className="flex gap-2.5">
                      <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#E60012]" aria-hidden />
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
              <div id="lista" className="scroll-mt-28 rounded-3xl border border-slate-700/80 bg-[#111827] p-5 sm:p-7">
                <h3 className="text-xl font-black">Lista de espera de seminovos</h3>
                <p className="mb-5 mt-1.5 text-sm text-slate-400">Diga o modelo ou a configuração que procura. Avisamos assim que chegar.</p>
                <FormularioDeLead interesse="lista" bloco="lista" botao="Entrar na lista pelo WhatsApp" mostrarOrcamento campoLivre="Ex.: ThinkPad com 16 GB, ou MacBook Air M1" />
              </div>
            </div>
          )}
        </section>

        {/* ------------------------------------------------ quiz */}
        <section id="qual-seminovo" className="border-y border-slate-800/70 bg-[#0c1220]">
          <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl" style={{ fontStretch: "112%" }}>
              Qual seminovo é para você?
            </h2>
            <p className="mb-8 mt-3 max-w-[60ch] text-slate-300">Três perguntas e você sai com a configuração certa para o seu uso, do jeito que o vendedor faria no balcão.</p>
            <QualSeminovo />
          </div>
        </section>

        {/* ------------------------------------------------ comparativo */}
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <h2 className="max-w-3xl text-3xl font-black tracking-tight sm:text-4xl" style={{ fontStretch: "112%" }}>
            Seminovo corporativo ou notebook novo de entrada, pelo mesmo dinheiro
          </h2>
          <p className="mt-3 max-w-[65ch] text-slate-300">
            Notebook novo barato economiza onde não se vê: carcaça, teclado, memória soldada. Notebook de empresa foi feito para aguentar anos de uso pesado.
          </p>
          <div className="mt-8 overflow-x-auto rounded-3xl border border-slate-800">
            <table className="w-full min-w-[640px] text-left text-[15px]">
              <caption className="sr-only">Comparação entre notebook seminovo corporativo e notebook novo de entrada</caption>
              <thead className="bg-[#111827] text-sm">
                <tr>
                  <th scope="col" className="w-[22%] px-5 py-4 font-semibold text-slate-400">
                    &nbsp;
                  </th>
                  <th scope="col" className="px-5 py-4 font-black text-white">
                    Seminovo corporativo na Balão
                  </th>
                  <th scope="col" className="px-5 py-4 font-semibold text-slate-400">
                    Notebook novo de entrada
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {COMPARATIVO.map((l) => (
                  <tr key={l.ponto}>
                    <th scope="row" className="px-5 py-4 align-top font-bold text-slate-200">
                      {l.ponto}
                    </th>
                    <td className="px-5 py-4 align-top text-white">
                      <span className="flex gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#E60012]" aria-hidden />
                        {l.seminovo}
                      </span>
                    </td>
                    <td className="px-5 py-4 align-top text-slate-400">{l.novo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ------------------------------------------------ bancada */}
        <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 sm:pb-20 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <h2 className="text-3xl font-black tracking-tight sm:text-4xl" style={{ fontStretch: "112%" }}>
                O que a bancada confere antes de ir para a vitrine
              </h2>
              <p className="mt-4 text-slate-300">
                {TOTAL_DA_BANCADA} itens, um por um. O aparelho que não passa não é vendido como seminovo. O resultado vai no laudo e você pode conferir
                com o vendedor na loja.
              </p>
            </div>
            <div className="grid gap-x-8 gap-y-7 sm:grid-cols-2 lg:col-span-8 lg:grid-cols-3">
              {BANCADA.map((g) => (
                <div key={g.grupo}>
                  <h3 className="border-b border-slate-800 pb-2 font-black text-white">{g.grupo}</h3>
                  <ul className="mt-3 space-y-1.5 text-sm text-slate-300">
                    {g.itens.map((i) => (
                      <li key={i} className="flex gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden />
                        {i}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------ por que aqui */}
        <section className="border-y border-slate-800/70 bg-[#0c1220]">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
            <h2 className="max-w-3xl text-3xl font-black tracking-tight sm:text-4xl" style={{ fontStretch: "112%" }}>
              Por que comprar o seminovo na loja e não de um anúncio
            </h2>
            <div className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ["Você testa antes de pagar", "O notebook fica ligado no balcão. Liga, digita, abre seus programas e só leva se gostar."],
                ["Garantia com endereço", "6 meses de garantia na Av. Anchieta, 789. Deu problema, você traz aqui e fala com quem vendeu."],
                ["Nota fiscal", "Compra registrada, com garantia por escrito, para você e para a empresa."],
                ["Upgrade na hora", "Mais memória ou um SSD maior, instalados na bancada enquanto você espera."],
                ["Atendimento de gente", "No WhatsApp quem responde é o vendedor da loja, não um robô de protocolo."],
                ["Entrega no mesmo dia", "Em Campinas, Valinhos e Paulínia, combinando pelo WhatsApp. Ou retire no Cambuí."],
              ].map(([t, d]) => (
                <div key={t}>
                  <h3 className="text-lg font-black text-white">{t}</h3>
                  <p className="mt-1.5 leading-relaxed text-slate-300">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------ guia por uso (conteúdo para busca) */}
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <h2 className="max-w-3xl text-3xl font-black tracking-tight sm:text-4xl" style={{ fontStretch: "112%" }}>
            Como escolher um notebook seminovo para o seu uso
          </h2>
          <div className="mt-10 grid gap-x-12 gap-y-10 md:grid-cols-2">
            {POR_USO.map((u) => (
              <article key={u.titulo}>
                <h3 className="text-xl font-black text-white">{u.titulo}</h3>
                <p className="mt-2 max-w-[65ch] leading-relaxed text-slate-300">{u.texto}</p>
                <p className="mt-3 text-sm text-slate-400">
                  <strong className="text-slate-200">Configuração que recomendamos:</strong> {u.config}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* ------------------------------------------------ vender o usado */}
        <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 sm:pb-20 lg:px-8">
          <div className="grid gap-8 rounded-3xl border border-slate-800 bg-[#111827] p-6 sm:p-10 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-2xl font-black tracking-tight sm:text-3xl" style={{ fontStretch: "112%" }}>
                Tem um notebook parado em casa?
              </h2>
              <p className="mt-3 max-w-[60ch] leading-relaxed text-slate-300">
                Deixe em consignação: avaliamos, ele vai para a nossa vitrine no Cambuí e você recebe quando for vendido, sem precisar atender curioso nem
                marcar encontro com desconhecido.{" "}
                <Link href="/consignacao" className="font-bold text-white underline decoration-[#E60012] decoration-2 underline-offset-4 hover:text-[#E60012]">
                  Como funciona a consignação
                </Link>
              </p>
            </div>
            <FormularioDeLead interesse="vender" bloco="consignacao" botao="Pedir avaliação no WhatsApp" campoLivre="Modelo, configuração e estado" />
          </div>
        </section>

        {/* ------------------------------------------------ resumo + FAQ */}
        <section className="border-t border-slate-800/70 bg-[#0c1220]">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-12 lg:px-8">
            <aside id="em-resumo" className="lg:col-span-4">
              <h2 className="text-2xl font-black tracking-tight" style={{ fontStretch: "112%" }}>
                Em resumo
              </h2>
              <ul className="mt-4 space-y-3 text-slate-300">
                {RESUMO.map((r) => (
                  <li key={r} className="flex gap-2.5 leading-relaxed">
                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#E60012]" aria-hidden />
                    {r}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-sm text-slate-400">
                Atendemos todos os bairros de Campinas, como Cambuí, Centro, Taquaral, Barão Geraldo, Guanabara e Sousas, além de Valinhos e Paulínia.
              </p>
            </aside>
            <div className="lg:col-span-8">
              <h2 className="text-3xl font-black tracking-tight sm:text-4xl" style={{ fontStretch: "112%" }}>
                Perguntas sobre notebook seminovo
              </h2>
              <div className="mt-6 divide-y divide-slate-800 border-y border-slate-800">
                {FAQ.map((f) => (
                  <details key={f.question} className="group py-1">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left text-[17px] font-bold text-white hover:text-slate-200 [&::-webkit-details-marker]:hidden">
                      <h3>{f.question}</h3>
                      <span className="text-2xl font-light text-slate-400 transition-transform group-open:rotate-45" aria-hidden>
                        +
                      </span>
                    </summary>
                    <p className="max-w-[70ch] pb-5 leading-relaxed text-slate-300">{f.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------ fecho */}
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="flex flex-col items-start gap-6 rounded-3xl bg-[#E60012] p-8 sm:p-12 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl" style={{ fontStretch: "112%" }}>
                Venha testar o seu no Cambuí
              </h2>
              <p className="mt-2 text-white/90">
                {SITE_CONFIG.address}. {SITE_CONFIG.openingHoursDisplay}.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a href="#pedido" className="rounded-2xl bg-white px-6 py-4 font-black text-[#B0000E] hover:bg-slate-100">
                Receber opções
              </a>
              <a
                href={linkDireto}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl border-2 border-white/80 px-6 py-4 font-black text-white hover:bg-white/10"
              >
                <MessageCircle className="h-5 w-5" aria-hidden />
                Falar com a loja
              </a>
              <a href={SITE_CONFIG.mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-2 py-4 font-bold text-white underline underline-offset-4">
                Ver no mapa
              </a>
            </div>
          </div>
        </section>
      </main>

      <BarraDePedido />
    </div>
  );
}
