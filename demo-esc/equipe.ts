import type { AgenteEquipe } from "./tipos";

/**
 * Equipe Digital Balão.
 *
 * Para acrescentar alguém, copie um bloco no fim da lista.
 * A mesa, o computador e o lugar no mapa saem sozinhos da ordem daqui:
 * quem está "ativo" senta na ilha principal; quem está "em_breve" fica
 * na ilha inacabada, translúcido. Não precisa mexer em coordenada.
 */
export const EQUIPE: AgenteEquipe[] = [
  {
    id: "thiaguito",
    nome: "Thiaguito",
    papel: "Relacionamento e Comunicações",
    cor: "#ff4d6d",
    emoji: "💬",
    status: "ativo",
    tarefas: [
      "Respondendo cliente do Cambuí",
      "Confirmando retirada na loja",
      "Organizando recado da equipe",
    ],
  },
  {
    id: "michael",
    nome: "Michael",
    papel: "OLX e Marketplaces",
    cor: "#1aa6ff",
    emoji: "🏷️",
    status: "ativo",
    tarefas: [
      "Atualizando anúncio na OLX",
      "Respondendo interessado no marketplace",
      "Conferindo fotos do anúncio",
    ],
  },
  {
    id: "hunter",
    nome: "Hunter",
    papel: "Oportunidades e Carreiras",
    cor: "#ffb000",
    emoji: "🎯",
    status: "ativo",
    tarefas: [
      "Separando vaga em aberto",
      "Lendo currículo que chegou",
      "Alinhando retorno com o candidato",
    ],
  },
  {
    id: "sagrado",
    nome: "Sagrado",
    papel: "Motivação e Bem-estar da Equipe",
    cor: "#ffd84a",
    emoji: "☀️",
    status: "ativo",
    tarefas: [
      "Preparando uma pausa da equipe",
      "Mandando um recado de ânimo",
      "Organizando o café da sexta",
    ],
  },
  {
    id: "kevinho",
    nome: "Kevinho",
    papel: "Crédito e Cobrança",
    cor: "#8be234",
    emoji: "💳",
    status: "ativo",
    tarefas: [
      "Acompanhando acordo em aberto",
      "Lembrando boleto que vence",
      "Conferindo retorno de cobrança",
    ],
  },
  {
    id: "herrera",
    nome: "Herrera",
    papel: "Analista de Dados",
    cor: "#14d4c8",
    emoji: "📊",
    status: "ativo",
    tarefas: [
      "Montando o relatório do dia",
      "Cruzando vendas e estoque",
      "Separando número fora do padrão",
    ],
  },
  {
    id: "wendell",
    nome: "Wendell",
    papel: "Ordens de Serviço",
    cor: "#ff7a1a",
    emoji: "🔧",
    status: "ativo",
    tarefas: [
      "Atualizando ordem de serviço",
      "Testando notebook da bancada",
      "Registrando peça trocada",
    ],
  },
  {
    id: "kenlinho",
    nome: "Kenlinho",
    papel: "Corretor de Imóveis",
    cor: "#b06bff",
    emoji: "🏠",
    status: "ativo",
    tarefas: [
      "Organizando visita a um imóvel",
      "Atualizando ficha do apartamento",
      "Confirmando horário com o cliente",
    ],
  },
  {
    id: "robertinho",
    nome: "Robertinho",
    papel: "Auditoria",
    cor: "#1ec98a",
    emoji: "🔍",
    status: "ativo",
    tarefas: [
      "Conferindo lançamento do caixa",
      "Revisando ordem sem peça",
      "Fechando a checagem do dia",
    ],
  },
  {
    id: "joao",
    nome: "João",
    papel: "Videomaker",
    cor: "#ff4d9a",
    emoji: "🎬",
    status: "ativo",
    tarefas: [
      "Editando vídeo da campanha",
      "Separando take da gravação",
      "Exportando corte para o anúncio",
    ],
  },
  {
    id: "malaquias",
    nome: "Malaquias",
    papel: "Marketing",
    cor: "#ff6b4a",
    emoji: "📣",
    status: "ativo",
    tarefas: [
      "Fechando a pauta da campanha",
      "Pedindo arte e vídeo",
      "Revisando texto do anúncio",
    ],
  },
  {
    id: "futrico",
    nome: "Futrico",
    papel: "E-mail",
    cor: "#6d7cff",
    emoji: "✉️",
    status: "ativo",
    tarefas: [
      "Triando e-mail de cliente",
      "Encaminhando pedido para a equipe",
      "Respondendo orçamento por e-mail",
    ],
  },
  {
    id: "dinherildo",
    nome: "Dinherildo",
    papel: "Gerente Financeiro",
    cor: "#21c45a",
    emoji: "💰",
    status: "ativo",
    tarefas: [
      "Lançando recebimento do dia",
      "Separando ordem para faturar",
      "Conferindo conta a pagar",
    ],
  },
  {
    id: "atendente-whatsapp",
    nome: "Atendente WhatsApp",
    papel: "Atendimento no WhatsApp",
    cor: "#7dcea0",
    emoji: "📱",
    status: "em_breve",
    tarefas: ["Chegando em breve"],
  },
  {
    id: "assistente-estoque",
    nome: "Assistente de Estoque",
    papel: "Estoque e peças",
    cor: "#85c1e9",
    emoji: "📦",
    status: "em_breve",
    tarefas: ["Chegando em breve"],
  },
  {
    id: "suporte-remoto",
    nome: "Suporte Remoto",
    papel: "Suporte remoto",
    cor: "#c39bd3",
    emoji: "🖥️",
    status: "em_breve",
    tarefas: ["Chegando em breve"],
  },
];

export function agentePorId(id: string) {
  return EQUIPE.find((agente) => agente.id === id);
}

export function nomeDoAgente(id: string) {
  return agentePorId(id)?.nome ?? id;
}
