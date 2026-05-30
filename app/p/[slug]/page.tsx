import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  Video,
  Cuboid,
  Ruler,
  Code2,
  Radio,
  BriefcaseBusiness,
  Gamepad2,
  Brain,
} from "lucide-react";

import { getVitrinePageBySlug } from "@/lib/vitrine/db";
import { makeCommercialCopy, pickComponentImage, pickPcHeroImage } from "@/lib/vitrine/core";

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

function Section({
  index,
  title,
  text,
  highlights,
  imageSrc,
  reverse,
}: {
  index: number;
  title: string;
  text: string;
  highlights: string[];
  imageSrc: string;
  reverse?: boolean;
}) {
  const num = String(index).padStart(2, "0");
  return (
    <section className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-10 items-center ${reverse ? "lg:[&>*:first-child]:order-2" : ""}`}>
          <div>
            <div className="text-xs font-extrabold text-[#d71920] tracking-widest uppercase">{num}</div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">{title}</h2>
            <p className="mt-4 text-gray-600 leading-relaxed">{text}</p>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {highlights.map((h) => (
                <div key={h} className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 text-sm font-bold text-gray-800">
                  {h}
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex items-center justify-center">
            <Image src={imageSrc} alt="" width={900} height={700} className="w-full h-[320px] sm:h-[420px] object-contain" unoptimized />
          </div>
        </div>
      </div>
    </section>
  );
}

function AppCard({ icon: Icon, title }: { icon: any; title: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-red-50 text-[#d71920] flex items-center justify-center">
        <Icon size={18} />
      </div>
      <div className="font-extrabold text-gray-900 text-sm">{title}</div>
    </div>
  );
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await props.params;
  const page = await getVitrinePageBySlug(slug).catch(() => null);
  if (!page) return {};

  const title = `${page.nome_pc} | Balão da Informática`;
  const description =
    `Conheça o ${page.nome_pc} com ${page.processador || "processador moderno"}, ${page.placa_video || "placa de vídeo dedicada"}, ${page.memoria_ram || "memória rápida"}, ${page.armazenamento || "armazenamento rápido"} e ${page.sistema_operacional || "sistema atualizado"}.`;
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
  const extraParts: any[] = Array.isArray(extras?.parts) ? extras.parts : [];
  const pickPartText = (kind: string) => {
    const k = String(kind || "").toLowerCase();
    if (k === "cpu") return copy.processorText;
    if (k === "ram") return copy.ramText;
    if (k === "storage") return copy.storageText;
    if (k === "gpu") return copy.gpuText;
    if (k === "cooling") return copy.coolingText;
    return copy.shortDescription;
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

  const sections = (normalizedParts.length > 0
    ? normalizedParts.map((p) => ({
        title: p.label ? `${p.label}: ${p.name}` : p.name,
        text: pickPartText(p.kind),
        highlights: pickHighlights(p.kind),
        imageSrc: p.image || pickFallbackImage(p.kind),
      }))
    : [
        { title: `Processador ${page.processador || ""}`.trim(), text: copy.processorText, highlights: ["Alta performance", "Multitarefas avançadas", "Eficiência energética"], imageSrc: cpuImg },
        { title: page.memoria_ram || "Memória RAM", text: copy.ramText, highlights: ["Alta velocidade", "Mais fluidez", "Grande capacidade"], imageSrc: ramImg },
        { title: page.armazenamento || "Armazenamento", text: copy.storageText, highlights: ["Inicialização rápida", "Carregamentos ágeis", "Muito espaço"], imageSrc: storageImg },
        { title: page.placa_video || "Placa de vídeo", text: copy.gpuText, highlights: ["IA", "Renderização", "Jogos"], imageSrc: gpuImg },
        { title: page.resfriamento || "Resfriamento eficiente", text: copy.coolingText, highlights: ["Temperaturas baixas", "Operação silenciosa", "Performance contínua"], imageSrc: coolingImg },
      ]).filter((s) => s.imageSrc)) as LandingSection[];

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

  const buyHref = whatsappHref(page.nome_pc, priceText);
  const applicationIndex = String(sections.length + 2).padStart(2, "0");
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
    <div className="bg-white">
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt="Balão da Informática" width={160} height={40} className="h-8 w-auto" />
          </Link>
          <nav className="hidden lg:flex items-center gap-5 text-sm font-extrabold tracking-tight text-gray-700">
            <Link href="/" className="hover:text-[#d71920]">Início</Link>
            <Link href="/" className="hover:text-[#d71920]">Loja</Link>
            <Link href="/fale-conosco" className="hover:text-[#d71920]">Atendimento</Link>
          </nav>
          <a
            href={buyHref}
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-[#16a34a] text-white font-extrabold text-sm hover:bg-green-700"
            target="_blank"
            rel="noreferrer"
          >
            Quero comprar
          </a>
        </div>
      </header>

      <section className="py-12 sm:py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex items-center justify-center">
              <Image src={hero} alt="" width={900} height={700} className="w-full h-[340px] sm:h-[460px] object-contain" unoptimized />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-red-50 text-[#d71920] px-4 py-2 text-xs font-extrabold">
                {page.categoria}
              </div>
              <h1 className="mt-4 text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900">
                {page.nome_pc}
              </h1>
              <p className="mt-4 text-gray-600 text-lg leading-relaxed">{copy.heroSubtitle}</p>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 font-extrabold text-gray-900">
                  {priceText}
                </div>
                {page.processador && <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 font-bold text-gray-800">{page.processador}</div>}
                {page.placa_video && <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 font-bold text-gray-800">{page.placa_video}</div>}
                {page.memoria_ram && <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 font-bold text-gray-800">{page.memoria_ram}</div>}
                {page.armazenamento && <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 font-bold text-gray-800">{page.armazenamento}</div>}
                {page.sistema_operacional && <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 font-bold text-gray-800">{page.sistema_operacional}</div>}
                {page.resfriamento && <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 font-bold text-gray-800">{page.resfriamento}</div>}
                {extraSpecItems.map((t) => (
                  <div key={t} className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 font-bold text-gray-800">
                    {t}
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <a
                  href={buyHref}
                  className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-[#16a34a] text-white font-extrabold hover:bg-green-700"
                  target="_blank"
                  rel="noreferrer"
                >
                  Quero comprar
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {sections.map((s, idx) => (
        <Section
          key={`${s.title}-${idx}`}
          index={idx + 2}
          title={s.title}
          text={s.text}
          highlights={s.highlights}
          imageSrc={s.imageSrc}
          reverse={idx % 2 === 0}
        />
      ))}

      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            <div>
              <div className="text-xs font-extrabold text-[#d71920] tracking-widest uppercase">{applicationIndex}</div>
              <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
                Para que essa máquina serve?
              </h2>
              <p className="mt-4 text-gray-600 leading-relaxed">{copy.applicationsText}</p>
              <div className="mt-8">
                <a
                  href={buyHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-[#16a34a] text-white font-extrabold hover:bg-green-700"
                >
                  Quero comprar
                </a>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {apps.map((a) => {
                const Icon = appIcons[a] || BriefcaseBusiness;
                return <AppCard key={a} icon={Icon} title={a} />;
              })}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-sm text-gray-600 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>Balão da Informática • WhatsApp (19) 98751-0267</div>
          <a href={buyHref} target="_blank" rel="noreferrer" className="font-extrabold text-[#16a34a] hover:text-green-700">
            Quero comprar
          </a>
        </div>
      </footer>
    </div>
  );
}
