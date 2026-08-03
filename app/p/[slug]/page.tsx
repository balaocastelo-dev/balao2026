import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  BadgeCheck,
  Brain,
  BriefcaseBusiness,
  CheckCircle2,
  CircuitBoard,
  Code2,
  Cpu,
  CreditCard,
  Fan,
  Gamepad2,
  HardDrive,
  Headphones,
  MessageCircle,
  Monitor,
  Radio,
  Ruler,
  ShieldCheck,
  ShoppingCart,
  Truck,
  Video,
  Cuboid,
  MemoryStick,
  Box,
  Plug,
} from "lucide-react";

import { getVitrinePageBySlug } from "@/lib/vitrine/db";
import { makeCommercialCopy, pickComponentImage, pickPcHeroImage } from "@/lib/vitrine/core";
import ProductMediaSwitcher from "@/components/ProductMediaSwitcher";
import { enhanceImageUrl } from "@/lib/utils";
import JsonLd, { generateBreadcrumbSchema, generateOrganizationSchema } from "@/components/JsonLd";
import { SITE_CONFIG } from "@/lib/config";

export const dynamic = "force-dynamic";

type LandingSection = { title: string; text: string; highlights: string[]; imageSrc: string };

function priceTextFromPage(page: any): string {
  const extras = page?.extras && typeof page.extras === "object" ? page.extras : {};
  const direct = String(extras?.price_text || "").trim();
  if (direct) return direct;
  const main = extras?.main_product;
  const mainPrice = main?.price ? String(main.price).trim() : "";
  return mainPrice || "Sob consulta";
}

function whatsappHref(nome: string, priceText: string) {
  const price = String(priceText || "").trim() || "Sob consulta";
  const msg = `Olá! Quero comprar ${nome} por ${price}. Pode confirmar estoque e prazo?`;
  return `https://wa.me/5519987510267?text=${encodeURIComponent(msg)}`;
}

function normalize(s: unknown) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}+/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parsePriceToNumber(text: string): number {
  const raw = String(text || "").trim();
  if (!raw) return 0;
  const cleaned = raw.replace(/R\$/gi, "").replace(/\s/g, "").replace(/[^\d,.\-]/g, "");
  if (!cleaned) return 0;
  const hasComma = cleaned.includes(",");
  const hasDot = cleaned.includes(".");
  let normalizedNum = cleaned;
  if (hasComma && hasDot) normalizedNum = cleaned.replace(/\./g, "").replace(",", ".");
  else if (hasComma && !hasDot) normalizedNum = cleaned.replace(",", ".");
  const n = Number.parseFloat(normalizedNum);
  return Number.isFinite(n) ? n : 0;
}

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function priceValidUntilDate() {
  return new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function badgeText(categoria: string) {
  const c = normalize(categoria);
  if (c.includes("gamer")) return "PC GAMER / ALTO FPS";
  if (c.includes("escritorio")) return "ESCRITÓRIO / PRODUTIVIDADE";
  return "WORKSTATION / ALTA PERFORMANCE";
}

function installmentLine(priceText: string) {
  const n = parsePriceToNumber(priceText);
  if (!n) return null;
  const per = n / 12;
  if (!Number.isFinite(per) || per <= 0) return null;
  return `ou 12x de ${formatBRL(per)} sem juros`;
}

function KindIcon({ kind }: { kind: string }) {
  const k = normalize(kind);
  const Icon =
    k === "cpu"
      ? Cpu
      : k === "motherboard"
        ? CircuitBoard
        : k === "ram"
          ? MemoryStick
          : k === "storage"
            ? HardDrive
            : k === "gpu"
              ? Monitor
              : k === "cooling"
                ? Fan
                : k === "psu"
                  ? Plug
                  : k === "case"
                    ? Box
                    : BadgeCheck;
  return <Icon size={18} className="text-[#E60012]" />;
}

function TrustItem({
  icon: Icon,
  title,
  text,
}: {
  icon: any;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white/70 backdrop-blur px-4 py-4 flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl bg-[#E60012]/10 text-[#E60012] flex items-center justify-center flex-shrink-0">
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <div className="text-sm font-extrabold text-gray-900">{title}</div>
        <div className="mt-0.5 text-xs text-gray-600 leading-snug">{text}</div>
      </div>
    </div>
  );
}

function SpecCard({ icon: Icon, title, value }: { icon: any; title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm px-4 py-4 flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-900 flex items-center justify-center flex-shrink-0">
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <div className="text-xs font-extrabold text-gray-600 uppercase tracking-wide">{title}</div>
        <div className="mt-1 text-sm font-extrabold text-gray-900 whitespace-normal break-words">{value}</div>
      </div>
    </div>
  );
}

function PieceRow({
  kind,
  label,
  name,
  text,
  highlights,
  imageSrc,
}: {
  kind: string;
  label: string;
  name: string;
  text: string;
  highlights: string[];
  imageSrc: string;
}) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#E60012]/10 flex items-center justify-center flex-shrink-0">
              <KindIcon kind={kind} />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-extrabold text-gray-600 uppercase tracking-wide">{label}</div>
              <div className="mt-1 text-lg sm:text-xl font-extrabold text-gray-900 whitespace-normal break-words">{name}</div>
              <div className="mt-2 text-sm text-gray-600 leading-relaxed">{String(text || "").slice(0, 100)}</div>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
                {highlights.slice(0, 3).map((h) => (
                  <div key={h} className="rounded-2xl bg-gray-50 border border-gray-200 px-3 py-2 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#E60012]" />
                    <div className="text-xs font-bold text-gray-800">{h}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="lg:ml-auto w-full lg:w-[380px]">
            <div className="rounded-2xl bg-white border border-gray-200 flex items-center justify-center overflow-hidden p-4">
              <Image src={imageSrc} alt="" width={900} height={700} className="w-full h-[340px] sm:h-[340px] object-contain" unoptimized />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AppCard({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: any;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4 flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl bg-gray-100 text-[#E60012] flex items-center justify-center flex-shrink-0">
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <div className="text-sm font-extrabold text-gray-900">{title}</div>
        <div className="mt-0.5 text-xs text-gray-600 leading-snug">{subtitle}</div>
      </div>
    </div>
  );
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await props.params;
  const page = await getVitrinePageBySlug(slug).catch(() => null);
  if (!page) return {};

  const title = `${page.nome_pc}`;
  const description = `${page.nome_pc}. Confira detalhes e compre direto no site da Balão da Informática.`;
  const canonical = `https://www.balao.info/p/${page.slug}`;
  const ogImage = (page as any)?.images?.hero || pickPcHeroImage({ categoria: page.categoria } as any);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      images: [{ url: ogImage }],
    },
    robots: { index: true, follow: true },
  };
}

export default async function PublicPPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const page = await getVitrinePageBySlug(slug);
  if (!page) return notFound();

  const priceText = priceTextFromPage(page as any);
  const hero = (page as any)?.images?.hero || pickPcHeroImage({ categoria: page.categoria } as any);

  const canonical = `https://www.balao.info/p/${page.slug}`;
  const breadcrumbItems = [
    { name: "Home", item: "https://www.balao.info" },
    { name: "PCs Montados", item: "https://www.balao.info/vitrine" },
    { name: page.nome_pc, item: canonical },
  ];

  const priceNumber = parsePriceToNumber(priceText);
  const offerPrice = Number.isFinite(priceNumber) && priceNumber > 0 ? priceNumber.toFixed(2) : undefined;
  const priceValidUntil = priceValidUntilDate();

  const specSummary = [page.processador, page.placa_video, page.memoria_ram, page.armazenamento]
    .map((value) => String(value || "").trim())
    .filter(Boolean)
    .join(", ");

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: page.nome_pc,
    image: hero,
    url: canonical,
    description: `${page.nome_pc} — PC ${page.categoria}${specSummary ? `. ${specSummary}.` : ""} Monte seu setup na Balão da Informática em Campinas.`,
    brand: {
      "@type": "Brand",
      name: SITE_CONFIG.name,
    },
    ...(offerPrice
      ? {
          offers: {
            "@type": "Offer",
            url: canonical,
            price: offerPrice,
            priceCurrency: "BRL",
            priceValidUntil,
            availability: "https://schema.org/InStock",
            itemCondition: "https://schema.org/NewCondition",
            seller: { "@id": "https://www.balao.info/#store" },
          },
        }
      : {}),
  };

  const parts = {
    processador: page.processador,
    placa_video: page.placa_video,
    memoria_ram: page.memoria_ram,
    armazenamento: page.armazenamento,
    sistema_operacional: page.sistema_operacional,
    resfriamento: page.resfriamento,
    categoria: page.categoria,
    aplicacoes: page.aplicacoes,
  };

  const copy = makeCommercialCopy(page.nome_pc, parts as any);

  const cpuImg = (page as any)?.images?.cpu || pickComponentImage("cpu", parts as any);
  const ramImg = (page as any)?.images?.ram || pickComponentImage("ram", parts as any);
  const storageImg = (page as any)?.images?.storage || pickComponentImage("storage", parts as any);
  const gpuImg = (page as any)?.images?.gpu || pickComponentImage("gpu", parts as any);
  const coolingImg = (page as any)?.images?.cooling || pickComponentImage("cooling", parts as any);

  const extras = (page as any)?.extras && typeof (page as any).extras === "object" ? (page as any).extras : {};
  const mainProduct = extras?.main_product && typeof extras.main_product === "object" ? extras.main_product : null;
  const mainImages: string[] = Array.isArray(mainProduct?.image_urls)
    ? (mainProduct.image_urls as any[]).map((u) => String(u || "").trim()).filter(Boolean)
    : [];
  const heroPrimary = enhanceImageUrl(String(mainImages[0] || hero || "").trim());
  const heroExtras = mainImages.slice(1, 8).map((u) => enhanceImageUrl(String(u || "").trim())).filter(Boolean);
  const extraParts: any[] = Array.isArray(extras?.parts) ? extras.parts : [];
  const pieceText = (kind: string) => {
    const k = String(kind || "").toLowerCase();
    const base =
      k === "cpu"
        ? "Processamento rápido e estável para tarefas e jogos."
        : k === "motherboard"
          ? "Base confiável do sistema, com conexões e estabilidade."
          : k === "ram"
            ? "Mais fluidez para multitarefas e aplicativos pesados."
            : k === "storage"
              ? "Inicialização e carregamentos rápidos, com bom espaço."
              : k === "gpu"
                ? "Gráficos, render e IA com alto desempenho."
                : k === "psu"
                  ? "Energia estável e segura para os componentes."
                  : k === "case"
                    ? "Airflow e acabamento premium para o setup."
                    : k === "cooling"
                      ? "Temperaturas baixas para manter a performance."
                      : "Componente selecionado para performance e estabilidade.";
    const t = String(base || "").trim();
    return t.length > 100 ? `${t.slice(0, 97).trimEnd()}...` : t;
  };

  const pickHighlights = (kind: string) => {
    const k = String(kind || "").toLowerCase();
    if (k === "cpu") return ["Alta performance", "Multitarefas", "Eficiência"];
    if (k === "motherboard") return ["Compatibilidade", "Estabilidade", "Conectividade"];
    if (k === "ram") return ["Alta velocidade", "Mais fluidez", "Grande capacidade"];
    if (k === "storage") return ["Inicialização rápida", "Carregamentos ágeis", "Muito espaço"];
    if (k === "gpu") return ["IA", "Renderização", "Jogos"];
    if (k === "psu") return ["Proteção", "Estabilidade", "Eficiência"];
    if (k === "case") return ["Airflow", "Organização", "Acabamento"];
    if (k === "cooling") return ["Temperaturas baixas", "Silêncio", "Performance contínua"];
    return ["Compatível", "Desempenho", "Confiabilidade"];
  };

  const pickFallbackImage = (kind: string) => {
    const k = String(kind || "").toLowerCase();
    if (k === "cpu") return cpuImg;
    if (k === "ram") return ramImg;
    if (k === "storage") return storageImg;
    if (k === "gpu") return gpuImg;
    if (k === "cooling") return coolingImg;
    return hero;
  };

  const normalizedParts = extraParts
    .filter((p) => p && typeof p === "object")
    .map((p) => ({
      kind: String(p.kind || "other"),
      label: String(p.label || "Peça"),
      name: String(p.product?.name || ""),
      image: String(p.product?.image || "").trim(),
    }))
    .filter((p) => p.name);

  const pieceCards = (normalizedParts.length > 0
    ? normalizedParts.map((p) => ({
        kind: p.kind,
        label: p.label || "Peça",
        name: p.name,
        text: pieceText(p.kind),
        highlights: pickHighlights(p.kind),
        imageSrc: enhanceImageUrl(p.image || pickFallbackImage(p.kind)),
      }))
    : [
        { kind: "cpu", label: "Processador", name: page.processador || "Processador", text: pieceText("cpu"), highlights: ["Alta performance", "Multitarefas avançadas", "Eficiência energética"], imageSrc: enhanceImageUrl(cpuImg) },
        { kind: "ram", label: "Memória RAM", name: page.memoria_ram || "Memória RAM", text: pieceText("ram"), highlights: ["Alta velocidade", "Mais fluidez", "Grande capacidade"], imageSrc: enhanceImageUrl(ramImg) },
        { kind: "storage", label: "Armazenamento", name: page.armazenamento || "Armazenamento", text: pieceText("storage"), highlights: ["Inicialização rápida", "Carregamentos ágeis", "Muito espaço"], imageSrc: enhanceImageUrl(storageImg) },
        { kind: "gpu", label: "Placa de vídeo", name: page.placa_video || "Placa de vídeo", text: pieceText("gpu"), highlights: ["IA", "Renderização", "Jogos"], imageSrc: enhanceImageUrl(gpuImg) },
        { kind: "cooling", label: "Resfriamento", name: page.resfriamento || "Resfriamento eficiente", text: pieceText("cooling"), highlights: ["Temperaturas baixas", "Operação silenciosa", "Performance contínua"], imageSrc: enhanceImageUrl(coolingImg) },
      ]).filter((s) => s.imageSrc);

  const apps = (page.aplicacoes || []).length > 0 ? page.aplicacoes : [];
  const appIcons: Record<string, any> = {
    "Edição de vídeo": Video,
    "Modelagem 3D": Cuboid,
    "Arquitetura / CAD": Ruler,
    Programação: Code2,
    Streaming: Radio,
    "Produtividade avançada": BriefcaseBusiness,
    "Jogos de tiro": Gamepad2,
    "Jogos de corrida": Gamepad2,
    "Mundo aberto": Gamepad2,
    "IA e Machine Learning": Brain,
    Planilhas: BriefcaseBusiness,
    Videoconferência: Radio,
    Navegação: BriefcaseBusiness,
    Estudos: Brain,
  };

  const whatsHref = whatsappHref(page.nome_pc, priceText);
  const buyHref = (() => {
    const id = mainProduct?.id ? String(mainProduct.id).trim() : "";
    const url = typeof mainProduct?.product_url === "string" ? String(mainProduct.product_url).trim() : "";
    const internalUrl =
      url && (url.startsWith("/product/") || url.includes("://www.balao.info/product/") || url.includes("://balao.info/product/") || url.includes("/product/"));
    if (internalUrl) return url.startsWith("http") ? url : url;
    if (id) return `/product/${id}`;
    return null;
  })();
  const installment = installmentLine(priceText);
  const extraSpecItems = (() => {
    const out: string[] = [];
    for (const p of normalizedParts) {
      const k = String(p.kind || "").toLowerCase();
      if (k === "motherboard") out.push(p.name);
      if (k === "psu") out.push(p.name);
      if (k === "case") out.push(p.name);
    }
    return out.slice(0, 3);
  })();

  return (
    <div className="text-gray-900 pb-24 md:pb-0 bg-[linear-gradient(180deg,#ffffff_0%,#ffffff_24%,#0b0d10_52%,#0b0d10_62%,#ffffff_88%,#ffffff_100%)]">
      <JsonLd
        data={[
          generateOrganizationSchema(),
          generateBreadcrumbSchema(breadcrumbItems),
          productSchema,
        ]}
      />
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0b0d10]/90 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt="Balão da Informática" width={160} height={40} className="h-8 w-auto" priority />
          </Link>

          <div className="ml-auto flex items-center gap-2">
            <a
              href={whatsHref}
              target="_blank"
              rel="noreferrer"
              className="balao-cta-pulse inline-flex items-center justify-center gap-2 rounded-full bg-[#E60012] text-white font-extrabold px-4 py-2.5 shadow-lg hover:bg-red-700"
            >
              <MessageCircle size={18} />
              <span className="hidden sm:inline">Falar no WhatsApp</span>
            </a>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            <div className="lg:col-span-6 order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 py-2 text-xs font-extrabold tracking-widest text-gray-900 backdrop-blur">
                {badgeText(page.categoria)}
              </div>

              <h1 className="mt-4 text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900 whitespace-normal break-words">
                {page.nome_pc}
              </h1>
              <p className="mt-4 text-base sm:text-lg text-gray-700 leading-relaxed">{copy.heroSubtitle}</p>

              <div className="mt-6 rounded-3xl border border-black/10 bg-white/80 p-5 backdrop-blur">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                  <div>
                    <div className="text-xs font-extrabold text-gray-600 uppercase tracking-wide">Preço</div>
                    <div className="mt-1 text-3xl sm:text-4xl font-extrabold text-gray-900">{priceText}</div>
                    {installment ? <div className="mt-1 text-sm text-gray-600">{installment}</div> : null}
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <a
                      href={buyHref || whatsHref}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#E60012] px-5 py-3 text-white font-extrabold shadow-lg hover:bg-red-700"
                    >
                      <ShoppingCart size={18} />
                      Quero comprar
                    </a>
                    <a
                      href={whatsHref}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-300 bg-white px-5 py-3 text-gray-900 font-extrabold hover:bg-gray-50"
                    >
                      <MessageCircle size={18} className="text-[#E60012]" />
                      Falar no WhatsApp
                    </a>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { t: "Montagem profissional", i: CheckCircle2 },
                    { t: "Garantia e testes", i: ShieldCheck },
                    { t: "Suporte especializado", i: Headphones },
                  ].map((b) => (
                    <div key={b.t} className="rounded-2xl border border-black/10 bg-white/70 px-3 py-2 flex items-center gap-2">
                      <b.i size={16} className="text-[#E60012]" />
                      <div className="text-sm font-bold text-gray-900">{b.t}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {[
                    { k: "cpu", label: "CPU", value: page.processador },
                    { k: "gpu", label: "GPU", value: page.placa_video },
                    { k: "ram", label: "RAM", value: page.memoria_ram },
                    { k: "storage", label: "SSD", value: page.armazenamento },
                    { k: "cooling", label: "Resfriamento", value: page.resfriamento || page.sistema_operacional },
                  ]
                    .filter((x) => String(x.value || "").trim())
                    .slice(0, 6)
                    .map((x) => (
                      <div key={`${x.label}-${x.value}`} className="rounded-full border border-black/10 bg-white/70 px-3 py-1.5 flex items-center gap-2">
                        <KindIcon kind={x.k} />
                        <div className="text-xs font-extrabold text-gray-700">{x.label}</div>
                        <div className="text-xs font-bold text-gray-900 truncate max-w-[260px]">{String(x.value || "")}</div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 order-1 lg:order-2">
              <div className="rounded-3xl border border-black/10 bg-white/60 p-4 shadow-2xl backdrop-blur">
                <div className="rounded-2xl bg-transparent border-0 p-0">
                  <ProductMediaSwitcher
                    imageUrl={heroPrimary}
                    imageUrls={heroExtras}
                    productName={page.nome_pc}
                    variant="hero"
                    heroHeightClassName="h-[520px] sm:h-[620px]"
                    autoRotateMs={2000}
                    showBorder={false}
                    showBackground={false}
                    padding={false}
                    rounded={true}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <TrustItem icon={Truck} title="Entrega rápida" text="Envio para todo o Brasil com rastreio." />
            <TrustItem icon={ShieldCheck} title="Garantia" text="Compra segura e suporte pós-venda." />
            <TrustItem icon={Headphones} title="Suporte especializado" text="Atendimento que entende de PC." />
            <TrustItem icon={CreditCard} title="12x sem juros" text="Condições facilitadas no cartão." />
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-xs font-extrabold text-gray-600 uppercase tracking-wide">Especificações</div>
              <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">Tudo o que você precisa, claro e rápido</h2>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {page.processador ? <SpecCard icon={Cpu} title="Processador" value={page.processador} /> : null}
            {page.placa_video ? <SpecCard icon={Monitor} title="Placa de vídeo" value={page.placa_video} /> : null}
            {page.memoria_ram ? <SpecCard icon={MemoryStick} title="Memória RAM" value={page.memoria_ram} /> : null}
            {page.armazenamento ? <SpecCard icon={HardDrive} title="Armazenamento" value={page.armazenamento} /> : null}
            {page.resfriamento ? <SpecCard icon={Fan} title="Resfriamento" value={page.resfriamento} /> : null}
            {extraSpecItems.map((t) => (
              <SpecCard key={t} icon={CircuitBoard} title="Componente" value={t} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-12 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-xs font-extrabold text-white/70 uppercase tracking-wide">Componentes</div>
              <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Peças escolhidas para performance e estabilidade</h2>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {pieceCards.map((p) => (
              <PieceRow
                key={`${p.kind}-${p.label}-${p.name}`}
                kind={p.kind}
                label={p.label}
                name={p.name}
                text={p.text}
                highlights={p.highlights}
                imageSrc={p.imageSrc}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5">
              <div className="text-xs font-extrabold text-gray-600 uppercase tracking-wide">Aplicações</div>
              <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">Para que essa máquina serve?</h2>
              <p className="mt-4 text-gray-600 leading-relaxed">{copy.applicationsText}</p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <a
                  href={buyHref || whatsHref}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#E60012] px-6 py-4 text-white font-extrabold shadow-lg hover:bg-red-700"
                >
                  <ShoppingCart size={18} />
                  Quero comprar
                </a>
                <a
                  href={whatsHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-300 bg-white px-6 py-4 text-gray-900 font-extrabold hover:bg-gray-50"
                >
                  <MessageCircle size={18} className="text-[#E60012]" />
                  Falar no WhatsApp
                </a>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {apps.map((a) => {
                  const Icon = appIcons[a] || BriefcaseBusiness;
                  const subtitle =
                    a === "Edição de vídeo"
                      ? "Renderize e edite com fluidez."
                      : a === "Modelagem 3D"
                        ? "Projetos pesados com estabilidade."
                        : a === "Programação"
                          ? "Ambientes e builds rápidos."
                          : a === "Streaming"
                            ? "Lives com qualidade e performance."
                            : a === "IA e Machine Learning"
                              ? "Treinos e inferência com eficiência."
                              : a.includes("Jogos")
                                ? "FPS alto com boa resposta."
                                : a === "Planilhas"
                                  ? "Produtividade sem travar."
                                  : a === "Videoconferência"
                                    ? "Chamadas estáveis."
                                    : a === "Estudos"
                                      ? "Conforto para o dia a dia."
                                      : "Alta performance para seu uso.";
                  return <AppCard key={a} icon={Icon} title={a} subtitle={subtitle} />;
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-12 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-gray-200 bg-white shadow-xl p-6 sm:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7">
                <div className="inline-flex items-center gap-2 text-xs font-extrabold tracking-widest text-[#E60012] uppercase">
                  <div className="w-7 h-7 rounded-full bg-[#E60012]/10 flex items-center justify-center">
                    <BadgeCheck size={16} className="text-[#E60012]" />
                  </div>
                  CTA final
                </div>

                <h3 className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 leading-[1.05]">
                  Pronto para
                  <br />
                  elevar seu <span className="text-[#E60012]">desempenho?</span>
                </h3>
                <div className="mt-4 text-base sm:text-lg text-gray-700 leading-relaxed">
                  Configuração pensada para performance e estabilidade no dia a dia.
                </div>

                <div className="mt-6 grid grid-cols-1 gap-3 max-w-md">
                  {["Componentes premium", "Montagem profissional", "Suporte pós-venda"].map((t) => (
                    <div key={t} className="rounded-2xl border border-gray-200 bg-white px-4 py-3 flex items-center gap-3 shadow-sm">
                      <div className="w-9 h-9 rounded-full bg-[#E60012] text-white flex items-center justify-center">
                        <CheckCircle2 size={18} />
                      </div>
                      <div className="text-sm font-extrabold text-gray-900">{t}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { icon: ShieldCheck, title: "Peças selecionadas", text: "Máxima qualidade" },
                      { icon: BadgeCheck, title: "Performance real", text: "Testado e aprovado" },
                      { icon: Headphones, title: "Atendimento", text: "Especializado" },
                    ].map((it) => (
                      <div key={it.title} className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 text-gray-900">
                          <it.icon size={18} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-extrabold text-gray-900">{it.title}</div>
                          <div className="mt-0.5 text-xs text-gray-600">{it.text}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                  <div className="p-4">
                    <div className="relative rounded-3xl border border-gray-200 bg-gradient-to-b from-gray-50 to-white overflow-hidden p-4">
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_center,rgba(230,0,18,0.12),rgba(255,255,255,0)_60%)]" />
                      </div>
                      <div className="relative">
                        <Image
                          src={heroPrimary}
                          alt=""
                          width={900}
                          height={700}
                          className="w-full h-[420px] sm:h-[520px] object-contain"
                          unoptimized
                        />
                        <div className="absolute left-4 bottom-4 rounded-2xl bg-white/95 backdrop-blur border border-gray-200 px-3 py-2 shadow-sm flex items-center gap-2">
                          <ShieldCheck size={16} className="text-gray-900" />
                          <div className="leading-tight">
                            <div className="text-[10px] font-extrabold text-gray-900 uppercase">1 ano</div>
                            <div className="text-[10px] font-bold text-gray-600 uppercase">de garantia</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 pb-6">
                    <div className="text-gray-600 text-xs font-extrabold uppercase tracking-wide">Produto</div>
                    <div className="mt-2 text-base sm:text-lg font-extrabold text-gray-900 whitespace-normal break-words">
                      {page.nome_pc}
                    </div>

                    <div className="mt-4 text-gray-600 text-xs font-extrabold uppercase tracking-wide">Preço</div>
                    <div className="mt-1 text-3xl font-extrabold text-gray-900">{priceText}</div>
                    {installment ? <div className="mt-1 text-sm text-gray-600">{installment}</div> : null}

                    <div className="mt-5 grid grid-cols-1 gap-2">
                      <a
                        href={buyHref || whatsHref}
                        className="balao-cta-pulse inline-flex items-center justify-center gap-2 rounded-2xl bg-[#E60012] px-6 py-4 text-white font-extrabold shadow-lg hover:bg-red-700"
                      >
                        <ShoppingCart size={18} />
                        Quero comprar agora
                      </a>
                      <a
                        href={whatsHref}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#E60012]/30 bg-white px-6 py-4 text-gray-900 font-extrabold hover:bg-gray-50"
                      >
                        <MessageCircle size={18} className="text-[#E60012]" />
                        Falar no WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-sm text-gray-600 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="font-semibold">Balão da Informática • WhatsApp (19) 98751-0267</div>
          <a href={whatsHref} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#E60012] text-white font-extrabold px-6 py-3 shadow-lg hover:bg-red-700">
            <MessageCircle size={18} />
            Falar no WhatsApp
          </a>
        </div>
      </footer>

      <div className="fixed bottom-0 left-0 right-0 md:hidden z-40 border-t border-gray-200 bg-white/95 backdrop-blur">
        <div className="px-4 py-3 pr-24 flex items-center gap-3">
          <div className="min-w-0">
            <div className="text-[11px] font-extrabold text-gray-600 uppercase tracking-wide">Preço</div>
            <div className="text-lg font-extrabold text-gray-900 truncate">{priceText}</div>
          </div>
          <a
            href={buyHref || whatsHref}
            className="ml-auto balao-cta-pulse inline-flex items-center justify-center gap-2 rounded-2xl bg-[#E60012] px-5 py-3 text-white font-extrabold shadow-lg"
          >
            <ShoppingCart size={18} />
            Comprar
          </a>
        </div>
      </div>
    </div>
  );
}
