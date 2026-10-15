/**
 * Vídeos da página do Overclock (seção "Veja funcionando").
 *
 * Enquanto a lista estiver vazia, a seção mostra "em breve" e o convite para a
 * demonstração ao vivo. Para publicar um vídeo, acrescente um item:
 *
 *  - do YouTube: `{ tipo: "comercial", titulo: "...", youtube: "https://youtu.be/XXXXXXXXXXX" }`
 *  - arquivo próprio: coloque o .mp4 em `public/overclock/videos/` e use
 *    `{ tipo: "demonstracao", titulo: "...", arquivo: "/overclock/videos/demo.mp4", capa: "/overclock/videos/demo.jpg" }`
 *
 * O plano é: 5 comerciais de 30 segundos (`tipo: "comercial"`) e 1
 * demonstração completa (`tipo: "demonstracao"`), que aparece maior, em cima.
 */

export type VideoOverclock = {
  tipo: "comercial" | "demonstracao";
  titulo: string;
  descricao?: string;
  /** Endereço do YouTube (youtu.be/…, youtube.com/watch?v=…, /shorts/… ou /embed/…). */
  youtube?: string;
  /** Arquivo em /public, por exemplo "/overclock/videos/comercial-1.mp4". */
  arquivo?: string;
  /** Imagem de capa do arquivo (opcional). */
  capa?: string;
};

export const VIDEOS: VideoOverclock[] = [
  {
    tipo: "demonstracao",
    titulo: "Overclock em 3 minutos: da instalação à loja vendendo",
    descricao: "A instalação guiada, a loja no ar, o painel e o caso real.",
    arquivo: "/overclock/videos/demonstracao-overclock.mp4",
    capa: "/overclock/videos/demonstracao-overclock.jpg",
  },
  {
    tipo: "comercial",
    titulo: "R$ 169 por dia",
    descricao: "O anúncio que foi a zero.",
    arquivo: "/overclock/videos/comercial-1-r169-por-dia.mp4",
    capa: "/overclock/videos/comercial-1-r169-por-dia.jpg",
  },
  {
    tipo: "comercial",
    titulo: "Vendendo 24 horas",
    descricao: "Loja virtual, KaBuM com preço ao vivo e WhatsApp da equipe.",
    arquivo: "/overclock/videos/comercial-2-vendendo-24-horas.mp4",
    capa: "/overclock/videos/comercial-2-vendendo-24-horas.jpg",
  },
  {
    tipo: "comercial",
    titulo: "Profissionalize",
    descricao: "Orçamento por link, OS que o cliente acompanha, estoque e financeiro.",
    arquivo: "/overclock/videos/comercial-3-profissionalize.mp4",
    capa: "/overclock/videos/comercial-3-profissionalize.jpg",
  },
  {
    tipo: "comercial",
    titulo: "Instala numa tarde, com IA",
    descricao: "A tela de instalação mostra onde conseguir cada coisa.",
    arquivo: "/overclock/videos/comercial-4-instala-numa-tarde.mp4",
    capa: "/overclock/videos/comercial-4-instala-numa-tarde.jpg",
  },
  {
    tipo: "comercial",
    titulo: "É seu, não é aluguel",
    descricao: "Roda nas contas da sua loja, sem mensalidade para nós.",
    arquivo: "/overclock/videos/comercial-5-e-seu-nao-e-aluguel.mp4",
    capa: "/overclock/videos/comercial-5-e-seu-nao-e-aluguel.jpg",
  },
];

/** Tira o código do vídeo de qualquer formato de endereço do YouTube. */
export function idDoYoutube(endereco: string): string | null {
  const texto = endereco.trim();
  if (/^[\w-]{11}$/.test(texto)) return texto;
  try {
    const url = new URL(texto);
    const host = url.hostname.replace(/^www\.|^m\./, "");
    if (host === "youtu.be") return url.pathname.slice(1, 12) || null;
    if (host === "youtube.com" || host === "youtube-nocookie.com") {
      const v = url.searchParams.get("v");
      if (v) return v.slice(0, 11);
      const partes = url.pathname.split("/").filter(Boolean);
      if (["embed", "shorts", "live"].includes(partes[0]) && partes[1]) {
        return partes[1].slice(0, 11);
      }
    }
  } catch {
    return null;
  }
  return null;
}
