import { Archivo } from "next/font/google";

// Uma família só para as páginas /premium e /ia-local. O Archivo tem eixo de
// largura: os títulos usam a versão larga (font-stretch: 125%) e o texto a
// normal, sem precisar carregar uma segunda fonte.
export const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});
