import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Boxes,
  ClipboardList,
  FileStack,
  FolderTree,
  Headset,
  Home,
  Images,
  KeyRound,
  LayoutGrid,
  ListChecks,
  Map as MapIcon,
  MessageSquareText,
  MessagesSquare,
  Megaphone,
  PackageSearch,
  Percent,
  ScanBarcode,
  ShoppingBag,
  Sparkles,
  TicketPercent,
  Trophy,
  Upload,
  UserCog,
  Users,
  Wand2,
  Wrench,
} from "lucide-react";

// ============================================================
// O mapa do painel.
//
// Tudo o que é administração do Balão mora embaixo de /painel, e esta lista é
// a única fonte de verdade sobre o que existe lá: o menu lateral, a tela de
// início e o teste que confere se cada endereço tem página leem daqui.
//
// Para colocar uma tela nova no painel:
//   1. crie a página em app/painel/(shell)/<pasta>/page.tsx;
//   2. acrescente o item no grupo certo, aqui.
// O teste __tests__/lib/painel-menu.test.ts reprova item sem página.
// ============================================================

export type ItemDoPainel = {
  /** Endereço. Começa com /painel, a não ser nas telas de balcão (`fora`). */
  href: string;
  rotulo: string;
  /** Uma linha dizendo o que se faz ali, na língua de quem usa a loja. */
  descricao: string;
  icone: LucideIcon;
  /**
   * Outras palavras pelas quais alguém procuraria esta área na busca do menu
   * (o singular, o apelido, o nome antigo). Não aparecem na tela.
   */
  palavras?: string;
  /**
   * Como a tela se encaixa no painel:
   *  - "folha": conteúdo sobre uma folha branca (as telas de cadastro);
   *  - "livre": a tela já traz o próprio fundo e os próprios cartões;
   *  - "cheia": ocupa o monitor inteiro, sem o menu (o atendimento do CRM).
   */
  moldura: "folha" | "livre" | "cheia";
  /**
   * Tela de balcão, fora do /painel: tem endereço e senha próprios porque é
   * usada por quem não tem a senha do painel. Abre em outra aba.
   */
  fora?: boolean;
};

export type GrupoDoPainel = {
  chave: string;
  rotulo: string;
  itens: ItemDoPainel[];
};

export const INICIO_DO_PAINEL: ItemDoPainel = {
  href: "/painel",
  rotulo: "Início",
  descricao: "O que precisa de atenção agora e o caminho para cada área.",
  icone: Home,
  moldura: "livre",
};

export const MENU_DO_PAINEL: GrupoDoPainel[] = [
  {
    chave: "vendas",
    rotulo: "Vendas",
    itens: [
      {
        href: "/painel/indicadores",
        palavras: "dashboard faturamento relatório métricas vendas visitas leads",
        rotulo: "Indicadores",
        descricao: "Faturamento, pedidos, visitas e contatos por período.",
        icone: BarChart3,
        moldura: "livre",
      },
      {
        href: "/painel/pedidos",
        palavras: "pedido venda vendas compra cliente pagamento pix",
        rotulo: "Pedidos do site",
        descricao: "Ver cada pedido, mudar a situação e avisar o cliente.",
        icone: ShoppingBag,
        moldura: "folha",
      },
      {
        href: "/painel/fechamento",
        palavras: "fechamento semanal ordem de serviço os despesa financeiro",
        rotulo: "Fechamento da assistência",
        descricao: "Ordens de serviço e despesas da semana.",
        icone: ClipboardList,
        moldura: "livre",
      },
      {
        href: "/pdv",
        palavras: "pdv caixa balcão venda",
        rotulo: "Caixa (PDV)",
        descricao: "Registrar venda de balcão.",
        icone: ScanBarcode,
        moldura: "livre",
        fora: true,
      },
    ],
  },
  {
    chave: "produtos",
    rotulo: "Produtos e preços",
    itens: [
      {
        href: "/painel/produtos",
        palavras: "produto catálogo estoque preço foto descrição",
        rotulo: "Produtos",
        descricao: "Cadastrar, editar preço, foto e descrição, ou tirar do site.",
        icone: Boxes,
        moldura: "folha",
      },
      {
        href: "/painel/categorias",
        palavras: "categoria departamento menu",
        rotulo: "Categorias",
        descricao: "Organizar os departamentos do catálogo.",
        icone: FolderTree,
        moldura: "folha",
      },
      {
        href: "/painel/precos",
        palavras: "preço margem kabum espelho fonte fornecedor",
        rotulo: "Preços por fonte",
        descricao: "Margem à vista e no cartão de cada site espelhado.",
        icone: Percent,
        moldura: "folha",
      },
      {
        href: "/painel/importacao",
        palavras: "importar importação planilha lote",
        rotulo: "Importação em massa",
        descricao: "Trazer vários produtos de uma vez.",
        icone: Upload,
        moldura: "folha",
      },
      {
        href: "/painel/cupons",
        palavras: "cupom desconto promoção código",
        rotulo: "Cupons",
        descricao: "Criar e encerrar cupons de desconto.",
        icone: TicketPercent,
        moldura: "folha",
      },
    ],
  },
  {
    chave: "crm",
    rotulo: "CRM e atendimento",
    itens: [
      {
        href: "/painel/crm",
        palavras: "crm whatsapp zap conversa kanban qr code reconectar disparo status",
        rotulo: "Atendimento no WhatsApp",
        descricao: "Conversas, funil, status, disparos e a conexão do QR Code.",
        icone: MessagesSquare,
        moldura: "cheia",
      },
      {
        href: "/painel/atendimento",
        palavras: "atendimento operação fila espera tempo de resposta",
        rotulo: "Números do atendimento",
        descricao: "Quem está esperando, tempo de resposta e movimento por dia.",
        icone: Headset,
        moldura: "livre",
      },
      {
        href: "/painel/clientes",
        palavras: "cliente contato segmento interesse remarketing",
        rotulo: "Clientes",
        descricao: "A base de contatos, por interesse, etiqueta e tempo parado.",
        icone: Users,
        moldura: "livre",
      },
      {
        href: "/painel/respostas",
        palavras: "resposta rápida etiqueta ajustes",
        rotulo: "Respostas e etiquetas",
        descricao: "Respostas rápidas e etiquetas que a equipe inteira usa.",
        icone: MessageSquareText,
        moldura: "livre",
      },
    ],
  },
  {
    chave: "equipe",
    rotulo: "Equipe",
    itens: [
      {
        href: "/painel/vendedores",
        palavras: "vendedor equipe pin assinatura atendente",
        rotulo: "Vendedores",
        descricao: "Quem atende, PIN, assinatura e a página de cada um.",
        icone: UserCog,
        moldura: "livre",
      },
      {
        href: "/painel/usuarios",
        palavras: "usuário senha login acesso permissão",
        rotulo: "Usuários e acessos",
        descricao: "Quem entra em quê, e com qual senha.",
        icone: KeyRound,
        moldura: "livre",
      },
      {
        href: "/painel/arena",
        palavras: "arena corrida meta ranking telão competidor",
        rotulo: "Arena de vendas",
        descricao: "Lançar venda, metas, corredores e os avisos do telão.",
        icone: Trophy,
        moldura: "livre",
      },
    ],
  },
  {
    chave: "site",
    rotulo: "Site e conteúdo",
    itens: [
      {
        href: "/painel/carrossel",
        palavras: "banner carrossel imagem topo",
        rotulo: "Carrossel",
        descricao: "Os banners que giram no topo da loja.",
        icone: Images,
        moldura: "folha",
      },
      {
        href: "/painel/home-blocks",
        palavras: "home página inicial prateleira bloco vitrine",
        rotulo: "Blocos da home",
        descricao: "As prateleiras da página inicial e a ordem delas.",
        icone: LayoutGrid,
        moldura: "folha",
      },
      {
        href: "/painel/barra",
        palavras: "barra topbar aviso faixa",
        rotulo: "Barra de avisos",
        descricao: "As mensagens da faixa do topo do site.",
        icone: Megaphone,
        moldura: "livre",
      },
      {
        href: "/painel/paginas",
        palavras: "página vitrine oferta landing",
        rotulo: "Páginas de vitrine",
        descricao: "Publicar, arquivar e compartilhar as páginas de oferta.",
        icone: FileStack,
        moldura: "livre",
      },
      {
        href: "/painel/gerador",
        palavras: "gerador página pc montar",
        rotulo: "Gerador de páginas",
        descricao: "Montar uma página de PC ou oferta a partir do catálogo.",
        icone: Wand2,
        moldura: "livre",
      },
      {
        href: "/painel/mapa",
        palavras: "mapa funções atalhos páginas links",
        rotulo: "Mapa do site",
        descricao: "Todas as páginas da loja, com o link de cada uma.",
        icone: MapIcon,
        moldura: "livre",
      },
    ],
  },
  {
    chave: "assistencia",
    rotulo: "Assistência técnica",
    itens: [
      {
        href: "/painel/controle",
        palavras: "controle peça peças estoque assistência",
        rotulo: "Estoque de peças",
        descricao: "Cadastrar peças e conferir as retiradas.",
        icone: PackageSearch,
        moldura: "livre",
      },
      {
        href: "/controle",
        palavras: "retirada peça técnico",
        rotulo: "Retirada de peças",
        descricao: "A tela do balcão, onde o técnico registra a retirada.",
        icone: ListChecks,
        moldura: "livre",
        fora: true,
      },
      {
        href: "/controle/senha",
        palavras: "senha código retirada dinâmica",
        rotulo: "Senha de retirada",
        descricao: "O código que muda a cada minuto e autoriza a retirada.",
        icone: KeyRound,
        moldura: "livre",
        fora: true,
      },
    ],
  },
  {
    chave: "sistema",
    rotulo: "Sistema",
    itens: [
      {
        href: "/painel/ai-settings",
        palavras: "ia inteligência artificial assistente voz",
        rotulo: "Assistente de IA",
        descricao: "Ajustes do assistente de voz e de texto.",
        icone: Sparkles,
        moldura: "folha",
      },
      {
        href: "/painel/test-migration",
        palavras: "migração imagem teste foto",
        rotulo: "Teste de imagens",
        descricao: "Conferir a cópia de uma foto para o servidor da loja.",
        icone: Wrench,
        moldura: "folha",
      },
    ],
  },
];

/** Todos os itens, com o Início na frente. */
export function todosOsItens(): ItemDoPainel[] {
  return [INICIO_DO_PAINEL, ...MENU_DO_PAINEL.flatMap((g) => g.itens)];
}

/** O item do menu que corresponde ao endereço aberto (ou null). */
export function itemDoCaminho(pathname: string): ItemDoPainel | null {
  const caminho = (pathname || "").replace(/\/+$/, "") || "/painel";
  const itens = todosOsItens().filter((i) => !i.fora);
  // O mais específico primeiro: /painel/produtos casa antes de /painel.
  const ordenados = [...itens].sort((a, b) => b.href.length - a.href.length);
  return (
    ordenados.find((i) => caminho === i.href || (i.href !== "/painel" && caminho.startsWith(`${i.href}/`))) ||
    null
  );
}

/** O grupo a que o item pertence (o Início não tem grupo). */
export function grupoDoItem(item: ItemDoPainel | null): GrupoDoPainel | null {
  if (!item) return null;
  return MENU_DO_PAINEL.find((g) => g.itens.some((i) => i.href === item.href)) || null;
}
