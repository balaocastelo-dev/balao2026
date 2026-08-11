import type { Metadata } from "next";
import Header from "@/components/Header";
import Pcgamer3dLanding from "./pcgamer3d-landing";

export const metadata: Metadata = {
  title: "Montagem de PC Gamer | Técnicas avançadas, cable management e FPS",
  description:
    "Guia técnico de montagem de alto nível: sequência correta, pasta térmica, airflow, cable management, BIOS tuning e validação por benchmarks para maximizar FPS.",
  keywords: [
    "montagem pc gamer profissional",
    "montagem pc gamer avançada",
    "cable management pc gamer",
    "organização de cabos pc gamer",
    "airflow pc gamer",
    "curva de fans pc gamer",
    "pasta térmica aplicação correta",
    "BIOS tuning performance",
    "overclock seguro pc gamer",
    "undervolt cpu gpu",
    "otimização de FPS",
    "frametime estável",
    "benchmarks estabilidade pc gamer",
  ],
  alternates: {
    canonical: "https://www.balao.info/pcgamer3d",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://www.balao.info/pcgamer3d",
    title: "Montagem de PC Gamer | Técnicas avançadas e maximização de FPS",
    description:
      "Conteúdo técnico: montagem profissional, cable management, airflow, BIOS tuning e validação por benchmarks.",
    images: ["/logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Montagem de PC Gamer | Técnicas avançadas e maximização de FPS",
    description: "Guia técnico: montagem profissional, cable management, airflow, BIOS tuning e benchmarks.",
    images: ["/logo.png"],
  },
};

export default function PcGamer3DPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-violet-500 selection:text-white">
      <Header />
      <main>
        <Pcgamer3dLanding />
      </main>
    </div>
  );
}

