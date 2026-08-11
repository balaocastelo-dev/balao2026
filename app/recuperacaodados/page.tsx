import { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import JsonLd, {
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateOrganizationSchema,
} from "@/components/JsonLd";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Database,
  FileSearch,
  FileText,
  HardDrive,
  Image,
  Lock,
  Mail,
  MemoryStick,
  MapPin,
  MessageCircle,
  Package,
  PenTool,
  Server,
  ShieldCheck,
  Smartphone,
  Truck,
  Usb,
  Video,
} from "lucide-react";
import Model3DViewer from "@/components/Model3DViewer";

export const metadata: Metadata = {
  title: "Recuperação de Dados no Brasil | HD, SSD/NVMe, Pendrive, SD e RAID",
  description:
    "Recuperação de dados com atendimento nacional (envio). HD, SSD/NVMe, pendrive, cartão SD e RAID/NAS. Sigilo total, análise rápida e orçamento sem compromisso em Campinas/SP.",
  keywords: [
    "recuperação de dados brasil",
    "recuperação de dados campinas",
    "recuperar dados hd campinas",
    "recuperar dados ssd campinas",
    "recuperar dados nvme campinas",
    "recuperar dados pendrive campinas",
    "recuperar fotos cartão de memória campinas",
    "recuperar dados hd",
    "recuperar dados ssd",
    "recuperar dados nvme",
    "recuperar fotos cartão sd",
    "recuperação de dados pendrive",
    "recuperação de dados raid",
    "recuperação de dados nas",
    "recuperação de dados servidor",
    "recuperação de dados empresarial",
    "recuperação de dados contabilidade",
    "recuperação de dados engenharia",
    "recuperação de dados arquitetura",
    "recuperação de dados advocacia",
    "recuperação de dados clínica",
    "recuperação de banco de dados",
    "hd externo não reconhece campinas",
    "ssd não reconhecido campinas",
    "arquivos apagados recuperacao",
    "partição raw recuperação",
    "hd fazendo barulho campinas",
    "recuperação de dados empresarial campinas",
    "recuperação de dados servidor raid nas",
    "assistência técnica campinas cambuí",
    "recuperação de dados urgente",
    "recuperação de dados confidencial",
    "recuperar fotos e videos",
    "recuperar documentos word excel pdf",
    "recuperar arquivos pst ost outlook",
    "recuperar banco de dados sql",
    "recuperar arquivos cad",
  ],
  alternates: {
    canonical: "https://www.balao.info/recuperacaodados",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Recuperação de Dados no Brasil | Balão da Informática",
    description:
      "Atendimento nacional (envio) + Campinas. Recuperação de HD, SSD/NVMe, pendrive, cartão SD e RAID/NAS com sigilo total e análise rápida.",
    url: "https://www.balao.info/recuperacaodados",
    type: "website",
    images: ["/logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Recuperação de Dados no Brasil | HD, SSD/NVMe, RAID/NAS",
    description:
      "Atendimento nacional (envio) + Campinas/SP. Sigilo total e análise rápida para recuperação de dados.",
    images: ["/logo.png"],
  },
};

const WHATSAPP_LINK =
  "https://wa.me/5519987510267?text=Olá!%20Preciso%20de%20recuperação%20de%20dados.%20Meu%20dispositivo%20(HD/SSD/pendrive/cartão)%20está%20com%20problema%20e%20quero%20um%20orçamento%20sem%20compromisso.";

const SSD_MODEL_ID = "ad215e54c381456895e21db5062f8714";

const FAQS = [
  {
    question: "O que devo fazer imediatamente após perder meus dados?",
    answer:
      "Pare de usar o dispositivo na hora. Não instale programas, não salve arquivos e evite tentativas repetidas. Quanto menos o dispositivo for usado, maior a chance de recuperar os dados com segurança.",
  },
  {
    question: "Vocês atendem clientes de todo o Brasil?",
    answer:
      "Sim. Atendemos em Campinas/SP e também recebemos dispositivos de todo o Brasil via envio (Correios ou transportadora). Você recebe orientações de embalagem e o acompanhamento do processo.",
  },
  {
    question: "Vocês atendem empresas e casos críticos (contabilidade, engenharia, clínicas, advocacia)?",
    answer:
      "Sim. Atuamos com recuperação de dados empresarial e tratamos informações sensíveis com confidencialidade. Trabalhamos com prioridades definidas por você (por exemplo: banco de dados, documentos fiscais, projetos e arquivos jurídicos).",
  },
  {
    question: "Vocês recuperam dados de SSD e NVMe?",
    answer:
      "Sim. Atendemos SSD SATA, M.2 e NVMe. Em muitos casos, a recuperação exige diagnóstico técnico e procedimentos específicos para evitar perdas definitivas.",
  },
  {
    question: "Quanto tempo leva a recuperação de dados?",
    answer:
      "Depende do tipo de falha e do volume de dados. Fazemos análise rápida e apresentamos um plano com prazo e orçamento. Casos simples podem ser resolvidos rapidamente; casos físicos/firmware podem levar mais tempo.",
  },
  {
    question: "A análise tem compromisso?",
    answer:
      "Não. Você recebe a avaliação e o orçamento antes de qualquer procedimento definitivo. A prioridade é transparência total.",
  },
  {
    question: "Meus dados ficam em sigilo?",
    answer:
      "Sim. Tratamos arquivos pessoais e empresariais com confidencialidade, seguindo boas práticas de segurança para manuseio e transferência de dados.",
  },
  {
    question: "Quais problemas vocês atendem?",
    answer:
      "Arquivos apagados, formatação, partição RAW, falhas de leitura, HD com barulho, dispositivo não reconhecido, queda, água/umidade e cenários complexos com servidor, NAS e RAID.",
  },
];

function BlockHero() {
  return (
    <section className="relative overflow-hidden bg-black text-white pt-20">
      <JsonLd
        data={[
          generateOrganizationSchema(),
          generateBreadcrumbSchema([
            { name: "Home", item: "https://www.balao.info" },
            { name: "Recuperação de Dados", item: "https://www.balao.info/recuperacaodados" },
          ]),
          generateFAQSchema(FAQS),
          {
            "@context": "https://schema.org",
            "@type": "Service",
            name: "Recuperação de Dados",
            serviceType: "Recuperação de dados (HD, SSD/NVMe, Pendrive, Cartão de memória, NAS/RAID)",
            areaServed: [
              { "@type": "Country", name: "Brasil" },
              { "@type": "City", name: "Campinas" },
            ],
            provider: {
              "@type": "LocalBusiness",
              name: "Balão da Informática",
              url: "https://www.balao.info",
            },
          },
        ]}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black" />
      <div className="absolute top-1/2 left-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/10 blur-[120px]" />

      <div className="container mx-auto px-4 relative z-10 py-14 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-xs md:text-sm font-bold uppercase tracking-widest border border-white/10 mb-8">
              <ShieldCheck className="h-4 w-4 text-green-400" />
              Atendimento nacional + sigilo total
            </div>

            <h1 className="text-4xl md:text-7xl font-black tracking-tighter leading-[0.95] uppercase">
              Recuperação de Dados no{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                Brasil
              </span>
            </h1>

            <p className="mt-6 text-lg md:text-2xl text-zinc-300 max-w-3xl leading-relaxed">
              Perdeu fotos, documentos ou arquivos da empresa? Recuperamos dados de{" "}
              <strong className="text-white">HD, SSD/NVMe, pendrive e cartão</strong>{" "}
              com processo seguro, transparente e sem compromisso — em Campinas/SP e por envio para todo o país.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link
                href={WHATSAPP_LINK}
                target="_blank"
                className="bg-[#25D366] hover:bg-[#128C7E] text-white px-8 py-4 rounded-full font-black text-lg md:text-xl transition-all shadow-xl hover:scale-105 inline-flex items-center justify-center gap-3"
              >
                <MessageCircle className="h-6 w-6" />
                Falar com Especialista
                <ArrowRight className="h-6 w-6" />
              </Link>
              <Link
                href="#como-funciona"
                className="bg-white/10 hover:bg-white/20 border border-white/15 text-white px-8 py-4 rounded-full font-black text-lg md:text-xl transition-all hover:scale-105 inline-flex items-center justify-center gap-3"
              >
                <Clock className="h-6 w-6" />
                Como funciona
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-6 text-sm md:text-base text-white/70 font-bold uppercase tracking-wider">
              <div className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
                Orçamento sem compromisso
              </div>
              <div className="inline-flex items-center gap-2">
                <Lock className="h-5 w-5 text-blue-300" />
                Confidencialidade
              </div>
              <div className="inline-flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-300" />
                Análise rápida
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-transparent pointer-events-auto">
              <Model3DViewer
                title="SSD Solid State Drive 3D"
                src={`https://sketchfab.com/models/${SSD_MODEL_ID}/embed?ui_theme=dark&transparent=1&autostart=1&ui_infos=0&ui_watermark=0&ui_controls=0&ui_general_controls=0&ui_fullscreen=0&ui_help=0&ui_hint=0&ui_vr=0&ui_settings=0&ui_annotations=0&ui_stop=0&camera=0&dnt=1`}
                className="absolute bg-transparent"
                style={{
                  top: -200,
                  left: -70,
                  width: "calc(100% + 140px)",
                  height: "calc(100% + 400px)",
                  transform: "scale(0.65)",
                  transformOrigin: "center",
                }}
                allow="autoplay; fullscreen; xr-spatial-tracking"
                allowFullScreen
                loading="eager"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BlockStopDoing() {
  const donts = [
    "Não instale softwares de recuperação no mesmo disco.",
    "Não formate o dispositivo (mesmo que o Windows peça).",
    "Não fique ligando e desligando repetidamente (principalmente HD com barulho).",
    "Não tente abrir o disco ou desmontar SSD/pendrive.",
  ];

  const dos = [
    "Desligue o equipamento e mantenha o dispositivo guardado.",
    "Anote sintomas: barulho, lentidão, erro, queda, água/umidade.",
    "Fale com um técnico antes de qualquer tentativa.",
  ];

  return (
    <section className="bg-zinc-950 border-y border-zinc-900 py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="bg-black border border-red-500/20 rounded-3xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-7 w-7 text-red-500" />
              <h2 className="text-2xl md:text-3xl font-black uppercase">Pare agora</h2>
            </div>
            <p className="text-zinc-300 mb-6 leading-relaxed">
              A maior chance de sucesso vem do primeiro passo certo. Alguns “consertos” podem
              sobrescrever dados e reduzir drasticamente a recuperação.
            </p>
            <ul className="space-y-3 text-zinc-200">
              {donts.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-red-500 shrink-0" />
                  <span className="font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-black border border-green-500/20 rounded-3xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="h-7 w-7 text-green-500" />
              <h2 className="text-2xl md:text-3xl font-black uppercase">Faça isso</h2>
            </div>
            <p className="text-zinc-300 mb-6 leading-relaxed">
              Com informações básicas, já conseguimos orientar o próximo passo mais seguro e reduzir
              o risco de perda definitiva.
            </p>
            <ul className="space-y-3 text-zinc-200">
              {dos.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0" />
                  <span className="font-medium">{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Link
                href={WHATSAPP_LINK}
                target="_blank"
                className="inline-flex items-center gap-2 text-white font-bold text-lg border-b-2 border-[#25D366] pb-1 hover:text-[#25D366] transition-colors"
              >
                Enviar foto/erro no WhatsApp <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BlockDevices() {
  const items = [
    { title: "HD / HD Externo", desc: "Barulho, lentidão, RAW, não reconhece, queda.", icon: HardDrive },
    { title: "SSD / NVMe", desc: "0GB, read-only, sumiu do sistema, firmware.", icon: MemoryStick },
    { title: "Pendrive / USB", desc: "Queimou, corrompeu, pede formatação, não abre.", icon: Usb },
    { title: "Cartão SD / microSD", desc: "Fotos apagadas, cartão vazio, corrompido.", icon: FileSearch },
    { title: "Servidor / NAS / RAID", desc: "Volume degradado, múltiplos discos, falhas críticas.", icon: Server },
    { title: "Celular / Notebook", desc: "Recuperação em dispositivos com falhas e travamentos.", icon: Smartphone },
  ];

  return (
    <section className="bg-black py-20" id="o-que-recuperamos">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-5xl font-black uppercase">O que recuperamos</h2>
          <p className="text-zinc-400 mt-4 text-lg md:text-xl">
            Atendemos cenários lógicos e físicos com abordagem segura por tipo de dispositivo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((it) => (
            <div
              key={it.title}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 hover:border-blue-500/40 transition-colors"
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-6">
                <it.icon className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-bold mb-3">{it.title}</h3>
              <p className="text-zinc-400 leading-relaxed">{it.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BlockFileTypes() {
  const items = [
    {
      title: "Fotos e vídeos",
      desc: "Recuperação de mídias pessoais e profissionais (família, eventos, drones e câmeras).",
      icon: Image,
    },
    {
      title: "Documentos Office e PDF",
      desc: "Word, Excel, PowerPoint e PDFs de trabalho, faculdade, contratos e notas.",
      icon: FileText,
    },
    {
      title: "Bancos de dados",
      desc: "Bases e backups usados em empresas (SQL, ERPs, sistemas internos e relatórios).",
      icon: Database,
    },
    {
      title: "E-mails corporativos (PST/OST)",
      desc: "Arquivos do Outlook e caixas de e-mail essenciais para rotinas e auditorias.",
      icon: Mail,
    },
    {
      title: "Projetos (CAD e afins)",
      desc: "Projetos e arquivos técnicos de engenharia/arquitetura (CAD e similares).",
      icon: PenTool,
    },
  ];

  return (
    <section className="bg-black py-20 border-t border-zinc-900" id="tipos-de-arquivo">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto text-center mb-14">
          <h2 className="text-3xl md:text-5xl font-black uppercase">
            Tipos de arquivo que mais recuperamos
          </h2>
          <p className="text-zinc-400 mt-4 text-lg md:text-xl">
            Você define o que é prioridade. O objetivo é recuperar primeiro o que é mais importante para você ou sua empresa.
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((it) => (
            <div
              key={it.title}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 hover:border-blue-500/40 transition-colors"
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-6">
                <it.icon className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-bold mb-3">{it.title}</h3>
              <p className="text-zinc-400 leading-relaxed">{it.desc}</p>
            </div>
          ))}
          <div className="bg-gradient-to-br from-blue-700 to-slate-900 rounded-3xl p-8 border border-white/10 flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-white/10 text-white flex items-center justify-center mb-6">
                <Video className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-black mb-3 uppercase">Não viu seu caso?</h3>
              <p className="text-white/80 leading-relaxed">
                Envie uma foto do erro ou descreva o problema. Indicamos o próximo passo mais seguro.
              </p>
            </div>
            <Link
              href={WHATSAPP_LINK}
              target="_blank"
              className="mt-8 inline-flex items-center justify-center gap-3 bg-white text-black px-8 py-4 rounded-full font-black text-lg hover:bg-zinc-200 transition-colors"
            >
              <MessageCircle className="h-6 w-6" />
              Enviar agora
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function BlockHowItWorks() {
  const steps = [
    { title: "1) Triagem e análise", desc: "Você descreve o problema e traz/enviamos instruções.", icon: FileSearch },
    { title: "2) Diagnóstico e orçamento", desc: "Avaliamos o caso e apresentamos prazo e custo antes de executar.", icon: Clock },
    { title: "3) Recuperação segura", desc: "Processo técnico com foco em preservar a integridade dos dados.", icon: ShieldCheck },
    { title: "4) Entrega dos arquivos", desc: "Arquivos recuperados organizados e copiados para mídia adequada.", icon: CheckCircle2 },
  ];

  return (
    <section className="bg-zinc-950 py-20 border-y border-zinc-900" id="como-funciona">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-14">
          <h2 className="text-3xl md:text-5xl font-black uppercase">Como funciona</h2>
          <p className="text-zinc-400 mt-4 text-lg md:text-xl">
            Processo simples e transparente. Você aprova antes e acompanha cada etapa.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {steps.map((s) => (
            <div key={s.title} className="bg-black border border-zinc-800 rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/80">
                  <s.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold">{s.title}</h3>
              </div>
              <p className="text-zinc-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href={WHATSAPP_LINK}
            target="_blank"
            className="inline-flex items-center gap-3 bg-white text-black px-10 py-4 rounded-full font-black text-lg hover:bg-zinc-200 transition-colors"
          >
            <MessageCircle className="h-6 w-6" />
            Pedir orçamento agora
          </Link>
        </div>
      </div>
    </section>
  );
}

function BlockLocal() {
  return (
    <section className="bg-black py-14">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto bg-zinc-900 border border-zinc-800 rounded-3xl p-8 md:p-10 flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between">
          <div className="flex items-start gap-4">
            <MapPin className="h-10 w-10 text-blue-400 shrink-0" />
            <div>
              <h3 className="text-2xl font-black uppercase">Campinas + atendimento nacional</h3>
              <p className="text-zinc-400 mt-2 leading-relaxed">
                Atendimento no Cambuí, Campinas/SP, e recebimento de dispositivos de todo o Brasil por
                envio. Você recebe orientação para embalar e enviar com segurança.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <Link
              href={WHATSAPP_LINK}
              target="_blank"
              className="inline-flex items-center justify-center gap-2 bg-white text-black px-6 py-3 rounded-full font-black hover:bg-zinc-200 transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
              Orçar agora
            </Link>
            <Link
              href="#atendimento-nacional"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/15 text-white px-6 py-3 rounded-full font-black transition-colors"
            >
              <Truck className="h-5 w-5" />
              Envio nacional
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function BlockNational() {
  const steps = [
    {
      title: "1) Fale com um especialista",
      desc: "Explique o sintoma e o que é prioridade recuperar (fotos, documentos, base de dados, projetos).",
      icon: MessageCircle,
    },
    {
      title: "2) Envie o dispositivo",
      desc: "Você recebe orientações de embalagem e pode enviar por Correios/transportadora com rastreio.",
      icon: Package,
    },
    {
      title: "3) Diagnóstico e orçamento",
      desc: "Avaliação técnica para definir viabilidade, prazo e custo antes de qualquer procedimento definitivo.",
      icon: FileSearch,
    },
    {
      title: "4) Entrega dos dados",
      desc: "Após a recuperação, entregamos seus arquivos organizados em mídia adequada.",
      icon: HardDrive,
    },
  ];

  return (
    <section className="bg-zinc-950 py-20 border-y border-zinc-900" id="atendimento-nacional">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto text-center mb-14">
          <h2 className="text-3xl md:text-5xl font-black uppercase">Atendimento nacional (envio)</h2>
          <p className="text-zinc-400 mt-4 text-lg md:text-xl">
            Você não precisa estar em Campinas. Atendemos clientes de todo o Brasil com processo simples e seguro.
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {steps.map((s) => (
            <div key={s.title} className="bg-black border border-zinc-800 rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/80">
                  <s.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold">{s.title}</h3>
              </div>
              <p className="text-zinc-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href={WHATSAPP_LINK}
            target="_blank"
            className="inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#128C7E] text-white px-10 py-4 rounded-full font-black text-lg transition-all shadow-xl hover:scale-105"
          >
            <MessageCircle className="h-6 w-6" />
            Enviar caso por WhatsApp
          </Link>
        </div>
      </div>
    </section>
  );
}

function BlockCitiesServed() {
  const capitais = [
    "São Paulo (SP)",
    "Rio de Janeiro (RJ)",
    "Belo Horizonte (MG)",
    "Brasília (DF)",
    "Curitiba (PR)",
    "Porto Alegre (RS)",
    "Florianópolis (SC)",
    "Salvador (BA)",
    "Recife (PE)",
    "Fortaleza (CE)",
    "Goiânia (GO)",
    "Manaus (AM)",
    "Belém (PA)",
    "Vitória (ES)",
    "Cuiabá (MT)",
    "Campo Grande (MS)",
    "São Luís (MA)",
    "Natal (RN)",
    "João Pessoa (PB)",
    "Maceió (AL)",
    "Aracaju (SE)",
    "Teresina (PI)",
    "Palmas (TO)",
    "Porto Velho (RO)",
    "Rio Branco (AC)",
    "Macapá (AP)",
    "Boa Vista (RR)",
  ];

  const interior = [
    "Campinas (SP)",
    "Santos (SP)",
    "Ribeirão Preto (SP)",
    "Sorocaba (SP)",
    "São José dos Campos (SP)",
    "Jundiaí (SP)",
    "Bauru (SP)",
    "Piracicaba (SP)",
    "Uberlândia (MG)",
    "Juiz de Fora (MG)",
    "Contagem (MG)",
    "Niterói (RJ)",
    "Duque de Caxias (RJ)",
    "Londrina (PR)",
    "Maringá (PR)",
    "Joinville (SC)",
    "Blumenau (SC)",
    "Caxias do Sul (RS)",
    "Pelotas (RS)",
    "Feira de Santana (BA)",
    "Campina Grande (PB)",
    "Jaboatão dos Guararapes (PE)",
    "Anápolis (GO)",
    "Santarém (PA)",
  ];

  const ChipList = ({ items }: { items: string[] }) => (
    <div className="flex flex-wrap gap-2 justify-center">
      {items.map((label) => (
        <span
          key={label}
          className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-black/40 border border-white/10 rounded-full text-white/70"
        >
          {label}
        </span>
      ))}
    </div>
  );

  return (
    <section className="bg-black py-20 border-t border-zinc-900" id="cidades-atendidas">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-black uppercase">Cidades atendidas no Brasil</h2>
          <p className="text-zinc-400 mt-4 text-lg md:text-xl">
            Atendimento nacional via envio. A lista abaixo é apenas uma referência de cidades com maior volume de atendimento.
          </p>
        </div>

        <div className="max-w-6xl mx-auto mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
            <h3 className="text-xl md:text-2xl font-bold mb-6 uppercase">Capitais</h3>
            <ChipList items={capitais} />
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
            <h3 className="text-xl md:text-2xl font-bold mb-6 uppercase">Interior e região</h3>
            <ChipList items={interior} />
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link
            href={WHATSAPP_LINK}
            target="_blank"
            className="inline-flex items-center gap-3 bg-white text-black px-10 py-4 rounded-full font-black text-lg hover:bg-zinc-200 transition-colors"
          >
            <MessageCircle className="h-6 w-6" />
            Quero enviar meu dispositivo
          </Link>
        </div>
      </div>
    </section>
  );
}

function BlockSeoContent() {
  const symptoms = [
    "HD externo não reconhece ou pede formatação",
    "Partição RAW, arquivos sumiram, pastas corrompidas",
    "SSD/NVMe com 0GB, read-only ou sistema não inicia",
    "Arquivos apagados, lixeira esvaziada, formatação acidental",
    "HD fazendo barulho (cliques) ou travando",
    "Ataques, corrupção de sistema, falhas após queda ou oscilação elétrica",
  ];

  return (
    <section className="bg-black py-20 border-t border-zinc-900">
      <div className="container mx-auto px-4 max-w-5xl">
        <h2 className="text-3xl md:text-5xl font-black uppercase">Recuperação de dados: quando vale a pena</h2>
        <p className="text-zinc-400 mt-6 text-lg leading-relaxed">
          A recuperação de dados é indicada quando o dispositivo ainda contém arquivos valiosos — pessoais ou empresariais — e
          qualquer tentativa errada pode reduzir a chance de sucesso. Por isso, o ideal é interromper o uso e fazer uma análise
          técnica para definir o caminho mais seguro (lógico, firmware ou físico).
        </p>
        <h3 className="text-2xl font-bold mt-10">Recuperação de dados empresarial</h3>
        <p className="text-zinc-400 mt-4 leading-relaxed">
          Atendemos demandas de empresas e profissionais com prioridade por tipo de informação. Exemplos comuns:
          <span className="text-zinc-300 font-semibold">
            {" "}
            contabilidade (documentos fiscais e bases), engenharia/arquitetura (projetos), advocacia (processos e contratos),
            clínicas (documentos e laudos), estúdios/agências (mídia e projetos), e-commerce (cadastros e relatórios).
          </span>
        </p>
        <h3 className="text-2xl font-bold mt-10">Sintomas comuns</h3>
        <ul className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
          {symptoms.map((s) => (
            <li key={s} className="flex items-start gap-3 bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              <CheckCircle2 className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
              <span className="text-zinc-200 font-medium">{s}</span>
            </li>
          ))}
        </ul>
        <p className="text-zinc-500 mt-10 leading-relaxed">
          Se você está em Campinas, pode levar o dispositivo até nossa loja no Cambuí. Se estiver em outra cidade, atendemos via envio para todo o Brasil.
        </p>
      </div>
    </section>
  );
}

function BlockFAQ() {
  return (
    <section className="bg-zinc-950 py-20 border-t border-zinc-900" id="faq">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="text-3xl md:text-5xl font-black text-center uppercase italic">
          Dúvidas frequentes
        </h2>
        <div className="mt-12 space-y-6">
          {FAQS.map((faq) => (
            <div key={faq.question} className="bg-black border border-zinc-800 rounded-2xl p-6">
              <h3 className="text-lg md:text-xl font-bold flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                {faq.question}
              </h3>
              <p className="text-zinc-400 mt-3 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BlockCTA() {
  return (
    <section className="bg-black py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-blue-700 to-slate-900 rounded-[3rem] p-10 md:p-16 border border-white/10 shadow-2xl">
          <h2 className="text-3xl md:text-6xl font-black text-white uppercase leading-tight">
            Pare de tentar sozinho.
            <br />
            Salve seus dados agora.
          </h2>
          <p className="text-white/80 mt-6 text-lg md:text-2xl max-w-3xl leading-relaxed">
            Fale com um especialista, descreva o sintoma e receba orientação segura antes de fazer
            qualquer tentativa.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link
              href={WHATSAPP_LINK}
              target="_blank"
              className="bg-white text-black px-10 py-4 rounded-full font-black text-lg hover:bg-zinc-200 transition-colors inline-flex items-center justify-center gap-3"
            >
              <MessageCircle className="h-6 w-6" />
              Chamar no WhatsApp
            </Link>
            <Link
              href="/fale-conosco"
              className="bg-white/10 hover:bg-white/20 border border-white/15 text-white px-10 py-4 rounded-full font-black text-lg transition-colors inline-flex items-center justify-center gap-3"
            >
              <FileSearch className="h-6 w-6" />
              Fale Conosco
            </Link>
          </div>
          <div className="mt-10 text-white/70 font-bold uppercase tracking-widest text-sm">
            Av. Anchieta, 789 - Cambuí, Campinas/SP
          </div>
        </div>
      </div>
    </section>
  );
}

export default function RecuperacaoDadosPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-blue-500 selection:text-white">
      <Header />
      <main>
        <BlockHero />
        <BlockStopDoing />
        <BlockDevices />
        <BlockFileTypes />
        <BlockHowItWorks />
        <BlockLocal />
        <BlockNational />
        <BlockCitiesServed />
        <BlockFAQ />
        <BlockSeoContent />
        <BlockCTA />
      </main>
    </div>
  );
}
