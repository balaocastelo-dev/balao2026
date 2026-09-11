import type { Metadata } from "next";
import Link from "next/link";
import CapturaWhatsApp from "@/components/CapturaWhatsApp";
import { SITE_CONFIG } from "@/lib/config";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Livros Gratuitos sobre IA e Tecnologia | Balão da Informática",
  description:
    "Dez livros gratuitos sobre inteligência artificial, programação e o futuro do trabalho, escritos pelo Balão da Informática. Leia online ou baixe.",
  alternates: { canonical: "https://www.balao.info/livros" },
};

const livros = [
  {
    id: "agente-01",
    titulo: "O Código do Futuro",
    subtitulo: "Programação, IA e o Futuro do Trabalho",
    cor: "from-blue-500 to-cyan-500",
    icone: "🚀",
  },
  {
    id: "agente-02",
    titulo: "Raízes Digitais",
    subtitulo: "Como a tecnologia transforma cultura e identidade",
    cor: "from-green-600 to-emerald-500",
    icone: "🌱",
  },
  {
    id: "agente-03",
    titulo: "O Último Humano",
    subtitulo: "Uma jornada pelo futuro da humanidade e da inteligência artificial",
    cor: "from-red-500 to-orange-500",
    icone: "👁️",
  },
  {
    id: "agente-04",
    titulo: "Pontes Invisíveis",
    subtitulo: "Como a tecnologia conecta — ou separa — pessoas",
    cor: "from-indigo-500 to-blue-500",
    icone: "🌉",
  },
  {
    id: "agente-05",
    titulo: "O Preço do Progresso",
    subtitulo: "Ética e dilemas morais na era da inteligência artificial",
    cor: "from-amber-500 to-yellow-500",
    icone: "⚖️",
  },
  {
    id: "agente-06",
    titulo: "Sementes de Mudança",
    subtitulo: "Sustentabilidade, meio ambiente e tecnologia verde",
    cor: "from-green-500 to-teal-500",
    icone: "🌍",
  },
  {
    id: "agente-07",
    titulo: "A Voz das Máquinas",
    subtitulo: "Comunicação, linguagem e inteligência artificial",
    cor: "from-purple-500 to-pink-500",
    icone: "🗣️",
  },
  {
    id: "agente-08",
    titulo: "Fronteiras do Pensamento",
    subtitulo: "Filosofia, consciência e o futuro da mente humana",
    cor: "from-violet-500 to-purple-500",
    icone: "🧠",
  },
  {
    id: "agente-09",
    titulo: "O Mapa do Tesouro",
    subtitulo: "Empreendedorismo digital, inovação e novas oportunidades",
    cor: "from-yellow-500 to-amber-500",
    icone: "🗺️",
  },
  {
    id: "agente-10",
    titulo: "Além do Horizonte",
    subtitulo: "O futuro da humanidade, transhumanismo e exploração espacial",
    cor: "from-sky-500 to-blue-600",
    icone: "⭐",
  },
];

export default function LivrosPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#090b11] via-[#0b1324] to-[#121a2b]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 via-transparent to-red-600/10 pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 py-16 sm:py-24 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-red-600/20 border border-red-500/30 rounded-full px-4 py-2 mb-6">
              <span className="text-red-400 text-sm font-medium">✨ Coleção Exclusiva</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold text-white mb-4">
              📚 Livros{" "}
              <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                IA & Sociedade
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto mb-6">
              10 livros sobre tecnologia, inteligência artificial e o futuro da humanidade.
              Com áudio narrado por IA (voz FranciscaNeural) e ilustrações artísticas.
            </p>
            <p className="text-sm text-gray-400">
              Criado por <span className="text-red-400 font-medium">Hermes</span> • by{" "}
              <a
                href="mailto:balaocastelo@gmail.com"
                className="text-red-400 hover:text-red-300 underline underline-offset-2"
              >
                balaocastelo@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Books Grid */}
      <div className="max-w-6xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {livros.map((livro, index) => (
            <Link
              key={livro.id}
              href={`/livros/${livro.id}`}
              className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-red-500/10"
            >
              {/* Number Badge */}
              <div className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                {index + 1}
              </div>

              {/* Icon & Title */}
              <div className="flex items-start gap-4 mb-4">
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${livro.cor} flex items-center justify-center text-2xl shadow-lg flex-shrink-0`}
                >
                  {livro.icone}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors">
                    {livro.titulo}
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">{livro.subtitulo}</p>
                </div>
              </div>

              {/* Meta */}
              <div className="flex items-center gap-4 text-xs text-gray-500 mt-4 pt-4 border-t border-white/5">
                <span className="flex items-center gap-1">
                  🎧 10 áudios
                </span>
                <span className="flex items-center gap-1">
                  📖 10 capítulos
                </span>
              </div>

              {/* CTA */}
              <div className="mt-4 flex items-center text-red-400 text-sm font-medium group-hover:text-red-300 transition-colors">
                Ler e ouvir
                <svg
                  className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {/* Livro em PDF, com o portão de WhatsApp.
            Os dez livros acima continuam abertos: são leitura no site e o
            portão ali só atrapalharia. O PDF é material que a pessoa leva
            embora — é onde a troca faz sentido. */}
        <div className="mt-16">
          <div className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-transparent p-6 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-red-600 text-4xl shadow-lg">
                📕
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                  Livro completo em PDF
                </span>
                <h2 className="mt-1 text-2xl font-bold text-white">
                  O Filho da Puta
                </h2>
                <p className="mt-1 text-sm text-gray-400">por Thiago Herrera</p>
                <p className="mt-3 text-sm leading-relaxed text-gray-300">
                  Livro completo, gratuito, para baixar e ler onde quiser.
                </p>

                <div className="mt-5">
                  <CapturaWhatsApp
                    material="o-filho-da-puta"
                    titulo="O Filho da Puta — Thiago Herrera"
                    link="/livros/o-filho-da-puta/livro.pdf"
                    rotuloBotao="📥 Baixar o PDF"
                    aviso="Arquivo de 31 MB — no celular, prefira o Wi-Fi."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-6 py-4">
            <div className="flex items-center gap-2 text-gray-300">
              <span className="text-red-400">🎙️</span>
              <span className="text-sm">Voz: pt-BR-FranciscaNeural</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-white/20" />
            <div className="flex items-center gap-2 text-gray-300">
              <span className="text-red-400">🎨</span>
              <span className="text-sm">Ilustrações: Canvas API</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-white/20" />
            <div className="flex items-center gap-2 text-gray-300">
              <span className="text-red-400">🤖</span>
              <span className="text-sm">Gerado com IA</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
