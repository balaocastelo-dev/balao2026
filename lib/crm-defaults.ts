import {
  CrmEtiqueta,
  CrmProdutoCatalogo,
  CrmRespostaRapida,
  CrmVendedor,
  KanbanColumn,
} from "@/types/crm";

export const RESPOSTAS_BASE: CrmRespostaRapida[] = [
  {
    id: 1,
    titulo: "Boas-vindas",
    texto: "Olá! 😄 Tudo bem? Aqui é o Balão da Informática. Como posso te ajudar hoje?",
    categoria: "Saudações",
  },
  {
    id: 2,
    titulo: "Formas de pagamento",
    texto: "Aceitamos PIX (CNPJ 34.397.947/0001-08), cartão e boleto. Pagando no Pix você garante 10% de desconto imediato! 😉",
    categoria: "Pagamento",
  },
  {
    id: 3,
    titulo: "Pagamento PIX",
    texto: "Para pagar via PIX: Chave CNPJ: 34.397.947/0001-08 (Balão da Informática). Envie o comprovante aqui rapidinho que já separamos seu pedido! ✅",
    categoria: "Pagamento",
  },
  {
    id: 4,
    titulo: "Endereço da loja",
    texto: "📍 Balão da Informática Castelo\nRua Santo Antonio Claret, 241 – Castelo – Campinas/SP\nVenha nos visitar, temos estacionamento próprio e testamos tudo na bancada! 😉",
    categoria: "Loja",
  },
  {
    id: 5,
    titulo: "Horário de funcionamento",
    texto: "🕒 Segunda a sexta: 08h30 às 18h\nSábado: 09h às 13h\nEstamos online e também realizamos entregas rápidas na região de Campinas!",
    categoria: "Loja",
  },
  {
    id: 6,
    titulo: "Telefone / WhatsApp",
    texto: "📲 WhatsApp: (19) 98118-8090\n☎️ Loja Física: (19) 3255-1661\nPode chamar a qualquer momento!",
    categoria: "Loja",
  },
  {
    id: 7,
    titulo: "Site da loja",
    texto: "🌐 Acesse nosso site oficial: www.balao.info\nLá você encontra nosso catálogo completo de hardware, notebooks e PCs Gamer!",
    categoria: "Loja",
  },
  {
    id: 8,
    titulo: "Assistência técnica",
    texto: "🔧 Sim! Somos referência em assistência técnica e reparo especializado em computadores, notebooks e linha Apple (iPhone/Mac). Me conta qual o defeito que já te passo uma estimativa!",
    categoria: "Assistência",
  },
  {
    id: 9,
    titulo: "Upgrade de PC",
    texto: "⚡ Trabalhamos com upgrade completo de PC: SSD NVMe, memória RAM, placa de vídeo RTX e processadores. Me diz o modelo do seu equipamento que indico a melhor opção!",
    categoria: "Hardware",
  },
  {
    id: 10,
    titulo: "PC Gamer",
    texto: "🎮 Monte seu PC Gamer com a gente! Me passa seu orçamento aproximado e quais jogos você pretende rodar que monto a melhor configuração custo-benefício na hora!",
    categoria: "PC Gamer",
  },
  {
    id: 11,
    titulo: "Consultar estoque",
    texto: "🔍 Me diz o produto que você procura (marca/modelo) que confirmo o estoque físico e o valor exato no sistema agora mesmo!",
    categoria: "Atendimento",
  },
  {
    id: 12,
    titulo: "Nota fiscal",
    texto: "🧾 Sim, emitimos Nota Fiscal Eletrônica (NF-e) em todas as vendas para CPF e CNPJ, com garantia total!",
    categoria: "Atendimento",
  },
  {
    id: 13,
    titulo: "Garantia",
    texto: "🛡️ Todos os nossos produtos e serviços acompanham garantia com nota fiscal e suporte técnico dedicado na nossa loja física do Castelo.",
    categoria: "Atendimento",
  },
  {
    id: 14,
    titulo: "Trocas/devoluções",
    texto: "📦 Garantia e troca conforme o CDC. Se o produto apresentar qualquer inconformidade, nossa bancada técnica resolve com máxima agilidade!",
    categoria: "Atendimento",
  },
  {
    id: 15,
    titulo: "Entrega Campinas e região",
    texto: "🚚 Atendemos Campinas, Valinhos, Vinhedo, Sumaré, Paulínia e região via motoboy express/Uber Flash ou retirada imediata no balcão da loja Castelo. Me passa seu CEP!",
    categoria: "Entrega",
  },
  {
    id: 16,
    titulo: "Montagem/limpeza",
    texto: "🛠️ Fazemos montagem premium com cable management e limpeza preventiva com troca de pasta térmica de alta condutividade. Agende seu horário com a gente!",
    categoria: "Assistência",
  },
  {
    id: 17,
    titulo: "Retorno/aguardando",
    texto: "⏰ Estou verificando com nossa bancada/estoque e já te retorno aqui mesmo! Só um instante por gentileza. 😉",
    categoria: "Atendimento",
  },
  {
    id: 18,
    titulo: "Agradecimento/encerramento",
    texto: "😊 Muito obrigado pelo contato com o Balão da Informática! Qualquer dúvida é só chamar por aqui. Tenha um excelente dia! 🎈",
    categoria: "Atendimento",
  },
];

export const ETIQUETAS_BASE: CrmEtiqueta[] = [
  { id: 1, nome: "Cliente Quente", cor: "#d93025" },
  { id: 2, nome: "Interessado", cor: "#ffb300" },
  { id: 3, nome: "Cliente Fiel", cor: "#0f9d58" },
  { id: 4, nome: "Pendente de Pagamento", cor: "#1a73e8" },
  { id: 5, nome: "Entregue", cor: "#7b1fa2" },
  { id: 6, nome: "Assistência Técnica", cor: "#00897b" },
];

export const KANBAN_COLUNAS_BASE: KanbanColumn[] = [
  { id: "novos", nome: "Novos Leads", cor: "#3b82f6" },
  { id: "atendimento", nome: "Em Atendimento", cor: "#8b5cf6" },
  { id: "orcamento", nome: "Orçamento Enviado", cor: "#f59e0b" },
  { id: "negociacao", nome: "Em Negociação", cor: "#ec4899" },
  { id: "aguardando_pgto", nome: "Aguardando Pix / Pgto", cor: "#06b6d4" },
  { id: "ganho", nome: "Venda Fechada / Ganho", cor: "#10b981" },
  { id: "pos_venda", nome: "Pós-Venda & Garantia", cor: "#6366f1" },
  { id: "perdido", nome: "Perdido / Sem Retorno", cor: "#64748b" },
];

export const VENDEDORES_BASE: CrmVendedor[] = [];

export const PRODUTOS_CATALOGO_BASE: CrmProdutoCatalogo[] = [];

