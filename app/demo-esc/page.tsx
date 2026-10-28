import type { Metadata } from "next";
import { Baloo_2 } from "next/font/google";
import Escritorio from "./escritorio";

const fonte = Baloo_2({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { absolute: "Escritório Digital | Balão da Informática" },
  description:
    "Equipe Digital Balão em um escritório virtual da Balão da Informática Castelo, em Campinas.",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default function PaginaEscritorioDigital() {
  return <Escritorio fonte={fonte.className} />;
}
