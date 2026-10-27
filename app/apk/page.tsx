import type { Metadata } from "next";
import Link from "next/link";
import {
  Download,
  Smartphone,
  Zap,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  MessageCircle,
  MapPin,
} from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";
import { DESCONTO_APP_PIX } from "@/lib/app-balao";

// Link do APK: a release "latest" do GitHub Actions (.github/workflows/apk.yml)
// publica sempre com este nome de arquivo, então este endereço nunca muda.
const APK_URL =
  "https://github.com/balaocastelo-dev/balao2026/releases/latest/download/balao-da-informatica.apk";

const PCT = Math.round(DESCONTO_APP_PIX * 100);

export const metadata: Metadata = {
  title: `App do Balão da Informática — ${PCT}% a mais no Pix | Baixe grátis`,
  description: `Baixe o aplicativo do Balão da Informática e ganhe ${PCT}% a mais de desconto no Pix em qualquer produto do site. Grátis, para Android.`,
  robots: { index: true, follow: true },
  openGraph: {
    title: `App do Balão — ${PCT}% a mais no Pix`,
    description: `Baixe o app e pague ${PCT}% mais barato no Pix em qualquer produto.`,
    url: "https://www.balao.info/apk",
    type: "website",
  },
};

const passos = [
  {
    icone: Download,
    titulo: "1. Baixe o app",
    texto: "Toque em “Baixar o app” aqui em cima. O arquivo é pequeno (uns 3 MB) e baixa em segundos.",
  },
  {
    icone: Smartphone,
    titulo: "2. Instale no celular",
    texto:
      "Abra o arquivo baixado e confirme a instalação. Na primeira vez o Android pede para permitir instalar “deste app/fonte” — é só confirmar.",
  },
  {
    icone: Zap,
    titulo: `3. Compre com ${PCT}% a mais no Pix`,
    texto:
      "Abra o app, escolha qualquer produto e finalize pagando no Pix. O desconto extra já entra sozinho no total.",
  },
];

export default function ApkPage() {
  return (
    <main className="min-h-screen bg-[#090d16] text-white antialiased">
      {/* topo simples */}
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5 sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-300 transition-colors hover:text-[#E60012]"
        >
          <ArrowLeft size={16} /> Voltar para a loja
        </Link>
        <span className="text-sm font-black tracking-tight text-white">
          Balão da Informática
        </span>
      </div>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(60% 50% at 50% 0%, rgba(230,0,18,0.18) 0%, rgba(9,13,22,0) 70%)",
          }}
        />
        <div className="relative mx-auto max-w-5xl px-4 pb-10 pt-8 text-center sm:px-6 sm:pt-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#E60012]/40 bg-[#E60012]/10 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-[#E60012]">
            <Zap size={14} /> {PCT}% a mais no Pix — só pelo app
          </span>

          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Baixe o app do Balão e pague{" "}
            <span className="text-[#E60012]">{PCT}% mais barato</span> no Pix
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base text-slate-300 sm:text-lg">
            É o mesmo site que você já conhece, agora no seu celular — e com{" "}
            <strong className="text-white">{PCT}% de desconto extra no Pix em qualquer produto</strong>.
            Basta comprar pelo app.
          </p>

          <div className="mt-9 flex flex-col items-center gap-3">
            <a
              href={APK_URL}
              className="inline-flex w-full max-w-sm items-center justify-center gap-2.5 rounded-2xl bg-[#E60012] px-6 py-4 text-lg font-black text-white shadow-lg shadow-red-950/50 transition-all hover:bg-red-700 active:scale-95"
            >
              <Download size={22} /> Baixar o app
            </a>
            <p className="text-xs font-medium text-slate-400">
              Android · grátis · ~3 MB · sem cadastro
            </p>
          </div>

          {/* celular ilustrativo com o preço */}
          <div className="mx-auto mt-12 max-w-xs">
            <div className="rounded-[2rem] border border-slate-700/80 bg-[#111827] p-3 shadow-2xl">
              <div className="rounded-[1.5rem] bg-[#161f32] p-5 text-left">
                <div className="h-28 rounded-xl bg-white" />
                <div className="mt-4 h-2.5 w-3/4 rounded-full bg-slate-600" />
                <div className="mt-2 h-2.5 w-1/2 rounded-full bg-slate-700" />
                <div className="mt-4">
                  <span className="rounded bg-[#E60012] px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-white">
                    -{PCT}% no app
                  </span>
                  <div className="mt-1.5 flex items-baseline gap-2">
                    <span className="text-2xl font-black text-[#E60012]">R$ 3.399</span>
                    <span className="text-xs text-slate-500 line-through">R$ 3.999</span>
                  </div>
                  <p className="mt-0.5 text-[10px] text-slate-400">à vista no PIX pelo app</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <h2 className="text-center text-2xl font-black tracking-tight sm:text-3xl">
          Como funciona
        </h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {passos.map((p) => {
            const Icone = p.icone;
            return (
              <div
                key={p.titulo}
                className="rounded-2xl border border-slate-700/80 bg-[#111827] p-6"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E60012]/15 text-[#E60012]">
                  <Icone size={22} />
                </div>
                <h3 className="mt-4 text-lg font-black text-white">{p.titulo}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{p.texto}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* INSTALAÇÃO / SEGURANÇA */}
      <section className="mx-auto max-w-5xl px-4 pb-4 sm:px-6">
        <div className="rounded-2xl border border-slate-700/80 bg-[#111827] p-6 sm:p-7">
          <div className="flex items-center gap-2 text-[#E60012]">
            <ShieldCheck size={20} />
            <h2 className="text-lg font-black text-white">É seguro instalar</h2>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            O app é o próprio site <strong className="text-white">www.balao.info</strong> empacotado
            para Android — não pede senha nem dados do cartão para instalar. Como ele vem direto da
            gente (e não da Play Store), na primeira instalação o Android mostra um aviso pedindo
            para <strong className="text-white">permitir instalar deste app</strong>: é normal, basta
            tocar em “Permitir” e seguir.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            {[
              `${PCT}% de desconto no Pix em qualquer produto, aplicado automaticamente`,
              "Mesmo catálogo, mesmos preços e mesmo atendimento do site",
              "Retirada no Cambuí ou entrega express em Campinas e região",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[#E60012]" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA final + rodapé */}
      <section className="mx-auto max-w-5xl px-4 py-10 text-center sm:px-6">
        <a
          href={APK_URL}
          className="inline-flex w-full max-w-sm items-center justify-center gap-2.5 rounded-2xl bg-[#E60012] px-6 py-4 text-lg font-black text-white shadow-lg shadow-red-950/50 transition-all hover:bg-red-700 active:scale-95"
        >
          <Download size={22} /> Baixar o app e economizar {PCT}%
        </a>

        <div className="mt-10 flex flex-col items-center gap-2 text-sm text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <MapPin size={15} className="text-[#E60012]" /> {SITE_CONFIG.addressShort}
          </span>
          <a
            href={`https://wa.me/${SITE_CONFIG.whatsapp.number}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-bold text-slate-300 transition-colors hover:text-[#E60012]"
          >
            <MessageCircle size={15} /> Dúvidas? Fale no WhatsApp {SITE_CONFIG.whatsapp.display}
          </a>
        </div>
      </section>
    </main>
  );
}
