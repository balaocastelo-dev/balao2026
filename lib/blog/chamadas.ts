import { SITE_CONFIG } from "@/lib/config";
import { semAcento } from "./texto";
import type { Artigo, BlocoChamada, TemaDeChamada } from "./tipos";

/**
 * As chamadas que aparecem no meio e no fim dos artigos.
 *
 * A regra é uma só: a chamada continua o assunto do texto. Quem está lendo
 * sobre notebook que esquenta recebe a assistência; quem compara placas de
 * vídeo recebe as placas. Nada de "compre agora" genérico — é o que separa um
 * artigo de um panfleto.
 *
 * Só entra aqui o que a loja de fato oferece. Preço, prazo e percentual de
 * desconto ficam de fora de propósito: mudam, e artigo antigo com número
 * velho vira promessa quebrada.
 */

type ChamadaPronta = {
  titulo: string;
  texto: string;
  rotulo: string;
  /** Página interna. Sem ela, o botão abre o WhatsApp. */
  href?: string;
};

export const CHAMADAS: Record<TemaDeChamada, ChamadaPronta> = {
  "placas-de-video": {
    titulo: "Veja a placa rodando antes de pagar",
    texto:
      "Na loja do Cambuí você vê o computador ligado e testa antes de fechar. Leve o modelo da sua fonte e do gabinete: a equipe confere se combinam com a placa escolhida.",
    rotulo: "Ver placas de vídeo",
    href: "/categoria/hardware-placa-de-video-vga",
  },
  "pc-gamer": {
    titulo: "PC gamer montado para os jogos que você joga",
    texto:
      "Diga quais jogos e qual monitor você usa. A equipe monta a configuração, testa e mostra a máquina ligada antes do pagamento.",
    rotulo: "Montar meu PC",
    href: "/montagempc",
  },
  montagem: {
    titulo: "Monte com quem testa antes de entregar",
    texto:
      "Montagem sob medida em Campinas: o computador sai montado e testado, e você vê a máquina ligada antes de pagar.",
    rotulo: "Conhecer a montagem",
    href: "/montagempc",
  },
  manutencao: {
    titulo: "Sintoma parecido aí? A bancada avalia",
    texto:
      "Assistência técnica presencial no Cambuí, em Campinas: diagnóstico, limpeza, troca de peça e conserto no mesmo lugar onde você compra.",
    rotulo: "Ver assistência técnica",
    href: "/manutencao",
  },
  dados: {
    titulo: "Arquivo importante em risco? Pare de insistir no disco",
    texto:
      "Cada nova tentativa pode piorar a falha. Recuperação de dados é um dos serviços da loja, em Campinas — fale com a equipe antes de tentar de novo.",
    rotulo: "Ver recuperação de dados",
    href: "/recuperacaodados",
  },
  notebooks: {
    titulo: "Veja o notebook ligado antes de decidir",
    texto:
      "Novos e seminovos na loja do Cambuí, para testar teclado, tela e bateria na hora — com assistência técnica no mesmo endereço.",
    rotulo: "Ver notebooks",
    href: "/notebooks",
  },
  seminovos: {
    titulo: "Seminovos testados, com assistência no mesmo lugar",
    texto:
      "Computadores e notebooks seminovos na loja do Cambuí. Você testa antes de pagar e sabe onde levar se precisar.",
    rotulo: "Ver seminovos",
    href: "/seminovos",
  },
  upgrade: {
    titulo: "Na dúvida se a peça serve no seu computador?",
    texto:
      "Mande o modelo da placa-mãe ou do notebook. A equipe confere a compatibilidade antes de você comprar — e instala, se preferir.",
    rotulo: "Conferir compatibilidade",
  },
  empresas: {
    titulo: "Computadores para a empresa, com suporte por perto",
    texto:
      "Conte quantas máquinas e para que tarefa. A equipe indica a configuração, e a assistência técnica fica no mesmo endereço.",
    rotulo: "Pedir orientação",
  },
  geral: {
    titulo: "Ficou com dúvida? Fale com quem monta e conserta",
    texto:
      "Atendimento humano no WhatsApp, direto com a equipe da loja em Campinas. Sem robô e sem abrir chamado.",
    rotulo: "Tirar minha dúvida",
  },
};

export function linkDoWhatsApp(mensagem: string): string {
  return `https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(mensagem)}`;
}

/** Pelo assunto do artigo, qual chamada faz sentido. */
export function escolherTema(artigo: Pick<Artigo, "titulo" | "slug" | "categoria" | "etiquetas">): TemaDeChamada {
  const t = ` ${semAcento(`${artigo.titulo} ${artigo.slug.replace(/-/g, " ")} ${artigo.etiquetas.join(" ")}`)} `;
  const tem = (...termos: string[]) => termos.some((termo) => t.includes(termo));

  if (tem("recuperar dados", "recuperacao de dados", "dados de hd")) return "dados";
  if (tem("manutencao", "assistencia", "esquenta", "conserto")) return "manutencao";
  if (tem("placa de video", "rtx", "radeon", "vram")) return "placas-de-video";
  if (tem("montagem")) return "montagem";
  if (tem("pc gamer", "fonte ideal", "pc pronto")) return "pc-gamer";
  if (tem("seminovo")) return "seminovos";
  if (tem("empresa", "escritorio")) return "empresas";
  if (tem("notebook")) return tem("ssd", "memoria") ? "upgrade" : "notebooks";
  if (tem("ssd", "memoria ram", "suporte", "upgrade")) return "upgrade";
  return "geral";
}

export type ChamadaResolvida = {
  titulo: string;
  texto: string;
  rotulo: string;
  href: string;
  /** Abre fora do site (WhatsApp). */
  externa: boolean;
  /** Link de WhatsApp oferecido ao lado, quando o botão principal é uma página. */
  whatsapp: string;
  tema: TemaDeChamada;
};

export function resolverChamada(
  bloco: BlocoChamada,
  artigo: Pick<Artigo, "titulo" | "slug" | "categoria" | "etiquetas">,
): ChamadaResolvida {
  const tema = bloco.tema ?? escolherTema(artigo);
  const pronta = CHAMADAS[tema];
  const mensagem = bloco.mensagem ?? `Olá! Li “${artigo.titulo}” no blog da Balão e quero uma orientação.`;
  const whatsapp = linkDoWhatsApp(mensagem);
  // Chamada com título próprio e sem link é uma pergunta à equipe: abre o
  // WhatsApp. Só a chamada pronta do tema herda a página interna do tema.
  const propria = Boolean(bloco.titulo) && !bloco.tema;
  const href = bloco.href ?? (propria ? undefined : pronta.href);

  return {
    titulo: bloco.titulo ?? pronta.titulo,
    texto: bloco.texto ?? pronta.texto,
    rotulo: bloco.rotulo ?? pronta.rotulo,
    href: href ?? whatsapp,
    externa: !href,
    whatsapp,
    tema,
  };
}
