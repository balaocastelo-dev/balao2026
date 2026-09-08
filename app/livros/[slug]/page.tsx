import Link from "next/link";
import { notFound } from "next/navigation";

const livros = {
  "agente-01": {
    titulo: "O Código do Futuro",
    subtitulo: "Programação, IA e o Futuro do Trabalho",
    icone: "🚀",
  },
  "agente-02": {
    titulo: "Raízes Digitais",
    subtitulo: "Como a tecnologia transforma cultura e identidade",
    icone: "🌱",
  },
  "agente-03": {
    titulo: "O Último Humano",
    subtitulo: "Uma jornada pelo futuro da humanidade e da inteligência artificial",
    icone: "👁️",
  },
  "agente-04": {
    titulo: "Pontes Invisíveis",
    subtitulo: "Como a tecnologia conecta — ou separa — pessoas",
    icone: "🌉",
  },
  "agente-05": {
    titulo: "O Preço do Progresso",
    subtitulo: "Ética e dilemas morais na era da inteligência artificial",
    icone: "⚖️",
  },
  "agente-06": {
    titulo: "Sementes de Mudança",
    subtitulo: "Sustentabilidade, meio ambiente e tecnologia verde",
    icone: "🌍",
  },
  "agente-07": {
    titulo: "A Voz das Máquinas",
    subtitulo: "Comunicação, linguagem e inteligência artificial",
    icone: "🗣️",
  },
  "agente-08": {
    titulo: "Fronteiras do Pensamento",
    subtitulo: "Filosofia, consciência e o futuro da mente humana",
    icone: "🧠",
  },
  "agente-09": {
    titulo: "O Mapa do Tesouro",
    subtitulo: "Empreendedorismo digital, inovação e novas oportunidades",
    icone: "🗺️",
  },
  "agente-10": {
    titulo: "Além do Horizonte",
    subtitulo: "O futuro da humanidade, transhumanismo e exploração espacial",
    icone: "⭐",
  },
};

export function generateStaticParams() {
  return Object.keys(livros).map((id) => ({ slug: id }));
}

export default async function LivroPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const livro = livros[slug as keyof typeof livros];

  if (!livro) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#090b11] via-[#0b1324] to-[#121a2b]">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <Link href="/" className="hover:text-white transition-colors">
            Início
          </Link>
          <span>/</span>
          <Link href="/livros" className="hover:text-white transition-colors">
            Livros
          </Link>
          <span>/</span>
          <span className="text-white">{livro.titulo}</span>
        </nav>

        {/* Book Header */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">{livro.icone}</div>
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-3">
            {livro.titulo}
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            {livro.subtitulo}
          </p>
        </div>

        {/* Book Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <div className="text-2xl mb-2">📖</div>
            <div className="text-white font-bold">10</div>
            <div className="text-gray-400 text-sm">Capítulos</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <div className="text-2xl mb-2">🎧</div>
            <div className="text-white font-bold">10</div>
            <div className="text-gray-400 text-sm">Áudios</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <div className="text-2xl mb-2">🎨</div>
            <div className="text-white font-bold">10</div>
            <div className="text-gray-400 text-sm">Ilustrações</div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center mb-12">
          <a
            href={`/livros/${slug}/index.html`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-red-500/25"
          >
            <span>📚</span>
            Abrir Livro Interativo
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
          <p className="text-gray-500 text-sm mt-3">
            Abre em nova janela com player de áudio e ilustrações
          </p>
        </div>

        {/* Features */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-12">
          <h2 className="text-xl font-bold text-white mb-4">✨ O que este livro inclui</h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start gap-3">
              <span className="text-red-400 mt-0.5">●</span>
              <span><strong className="text-white">Áudio narrado por IA</strong> — Voz FranciscaNeural (pt-BR), natural e fluida</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-400 mt-0.5">●</span>
              <span><strong className="text-white">Player integrado</strong> — Play/pause, barra de progresso, velocidade ajustável</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-400 mt-0.5">●</span>
              <span><strong className="text-white">Ilustrações artísticas</strong> — Geradas com Canvas API, cada capítulo com arte única</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-400 mt-0.5">●</span>
              <span><strong className="text-white">Pontuação otimizada</strong> — Texto preparado para fluidez na leitura por voz</span>
            </li>
          </ul>
        </div>

        {/* Author */}
        <div className="text-center text-gray-500 text-sm">
          <p>
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
  );
}
