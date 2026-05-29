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

function whatsappUrl(nomePc: string) {
  const msg = `Olá, vim pela página do PC ${nomePc} e gostaria de mais informações.`;
  return `https://wa.me/5519987510267?text=${encodeURIComponent(msg)}`;
}

function Section({
  title,
  text,
  highlights,
  imageSrc,
  reverse,
}: {
  title: string;
  text: string;
  highlights: string[];
  imageSrc: string;
  reverse?: boolean;
}) {
  return (
    <section className="py-14 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-10 items-center ${reverse ? "lg:[&>*:first-child]:order-2" : ""}`}>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">{title}</h2>
            <p className="mt-4 text-gray-600 leading-relaxed">{text}</p>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {highlights.map((h) => (
                <div key={h} className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 text-sm font-bold text-gray-800">
                  {h}
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden flex items-center justify-center">
            <Image src={imageSrc} alt="" width={900} height={700} className="w-full h-[320px] sm:h-[420px] object-contain" />
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
  const canonical = `https://www.balao.info/vitrine/${page.slug}`;
  const ogImage = pickPcHeroImage({ categoria: page.categoria } as any);

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
  };
}

export default async function VitrineSlugPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const page = await getVitrinePageBySlug(slug);
  if (!page) return notFound();

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

  const copy = makeCommercialCopy(page.nome_pc, parts);
  const hero = pickPcHeroImage(parts as any);
  const cpuImg = pickComponentImage("cpu", parts as any);
  const ramImg = pickComponentImage("ram", parts as any);
  const storageImg = pickComponentImage("storage", parts as any);
  const gpuImg = pickComponentImage("gpu", parts as any);
  const coolingImg = pickComponentImage("cooling", parts as any);

  const apps = (page.aplicacoes || []).length > 0 ? page.aplicacoes : [
    "Edição de vídeo",
    "Modelagem 3D",
    "Arquitetura / CAD",
    "Programação",
    "Streaming",
    "Produtividade avançada",
    "Mundo aberto",
    "IA e Machine Learning",
  ];

  const appIcons: Record<string, any> = {
    "Edição de vídeo": Video,
    "Modelagem 3D": Cuboid,
    "Arquitetura / CAD": Ruler,
    "Programação": Code2,
    Streaming: Radio,
    "Produtividade avançada": BriefcaseBusiness,
    "Jogos de tiro": Gamepad2,
    "Jogos de corrida": Gamepad2,
    "Mundo aberto": Gamepad2,
    "IA e Machine Learning": Brain,
  };

  return (
    <div className="bg-white">
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
          <Link href="/" className="font-extrabold tracking-tight text-gray-900">
            Balão da Informática
          </Link>
          <nav className="hidden lg:flex items-center gap-5 text-sm font-bold text-gray-700">
            <Link href="/" className="hover:text-[#d71920]">Início</Link>
            <Link href="/" className="hover:text-[#d71920]">Produtos</Link>
            <Link href="/vitrine" className="hover:text-[#d71920]">Workstations</Link>
            <Link href="/fale-conosco" className="hover:text-[#d71920]">Suporte</Link>
            <Link href="/sobre-a-empresa" className="hover:text-[#d71920]">Sobre nós</Link>
            <a href={whatsappUrl(page.nome_pc)} className="hover:text-[#d71920]">Falar com especialista</a>
          </nav>
          <a
            href={whatsappUrl(page.nome_pc)}
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-[#d71920] text-white font-extrabold text-sm hover:bg-[#b9151b]"
          >
            Solicitar orçamento
          </a>
        </div>
      </header>

      <section className="py-14 sm:py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex items-center justify-center">
              <Image src={hero} alt="" width={900} height={700} className="w-full h-[340px] sm:h-[460px] object-contain" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900">
                {page.nome_pc}
              </h1>
              <p className="mt-4 text-gray-600 text-lg leading-relaxed">{copy.heroSubtitle}</p>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {page.processador && <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 font-bold text-gray-800">{page.processador}</div>}
                {page.placa_video && <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 font-bold text-gray-800">{page.placa_video}</div>}
                {page.memoria_ram && <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 font-bold text-gray-800">{page.memoria_ram}</div>}
                {page.armazenamento && <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 font-bold text-gray-800">{page.armazenamento}</div>}
                {page.sistema_operacional && <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 font-bold text-gray-800">{page.sistema_operacional}</div>}
                {page.resfriamento && <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 font-bold text-gray-800">{page.resfriamento}</div>}
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <a
                  href={whatsappUrl(page.nome_pc)}
                  className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-[#d71920] text-white font-extrabold hover:bg-[#b9151b]"
                >
                  Solicitar orçamento
                </a>
                <a
                  href={whatsappUrl(page.nome_pc)}
                  className="inline-flex items-center justify-center px-5 py-3 rounded-xl border border-gray-200 bg-white font-extrabold text-gray-900 hover:bg-gray-50"
                >
                  Falar com especialista
                </a>
                <a
                  href={whatsappUrl(page.nome_pc)}
                  className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-[#16a34a] text-white font-extrabold hover:bg-green-700"
                >
                  Chamar no WhatsApp
                </a>
              </div>

              <div className="mt-6 text-sm text-gray-600">
                Balão da Informática • Av. Anchieta, 789 • (19) 98751-0267 • balaocastelo@gmail.com
              </div>
            </div>
          </div>
        </div>
      </section>

      <Section
        title={`Processador ${page.processador || ""}`.trim()}
        text={copy.processorText}
        highlights={["Alta performance", "Multitarefas avançadas", "Eficiência energética"]}
        imageSrc={cpuImg}
        reverse
      />
      <Section
        title={page.memoria_ram || "Memória RAM"}
        text={copy.ramText}
        highlights={["Alta velocidade", "Mais fluidez", "Grande capacidade"]}
        imageSrc={ramImg}
      />
      <Section
        title={page.armazenamento || "Armazenamento"}
        text={copy.storageText}
        highlights={["Inicialização rápida", "Carregamentos ágeis", "Muito espaço"]}
        imageSrc={storageImg}
        reverse
      />
      <Section
        title={page.placa_video || "Placa de vídeo"}
        text={copy.gpuText}
        highlights={["IA", "Renderização", "Jogos"]}
        imageSrc={gpuImg}
      />
      <Section
        title={page.resfriamento || "Resfriamento eficiente"}
        text={copy.coolingText}
        highlights={["Temperaturas baixas", "Operação silenciosa", "Performance contínua"]}
        imageSrc={coolingImg}
        reverse
      />

      <section className="py-14 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
                Para que essa máquina serve?
              </h2>
              <p className="mt-4 text-gray-600 leading-relaxed">{copy.applicationsText}</p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <a
                  href={whatsappUrl(page.nome_pc)}
                  className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-[#d71920] text-white font-extrabold hover:bg-[#b9151b]"
                >
                  Solicitar orçamento
                </a>
                <a
                  href={whatsappUrl(page.nome_pc)}
                  className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-[#16a34a] text-white font-extrabold hover:bg-green-700"
                >
                  Chamar no WhatsApp
                </a>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {apps.slice(0, 10).map((a) => {
                const Icon = appIcons[a] || BriefcaseBusiness;
                return <AppCard key={a} icon={Icon} title={a} />;
              })}
            </div>
          </div>
        </div>
      </section>

      <div className="fixed bottom-4 right-4 z-30">
        <a
          href={whatsappUrl(page.nome_pc)}
          className="inline-flex items-center gap-2 px-4 py-3 rounded-full bg-[#16a34a] text-white font-extrabold shadow-lg hover:bg-green-700"
        >
          Chamar no WhatsApp
        </a>
      </div>
    </div>
  );
}
