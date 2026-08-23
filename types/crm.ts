export type WhatsAppStatus =
  | "disconnected"
  | "initializing"
  | "qr"
  | "authenticated"
  | "ready"
  | "auth_failure";

export interface KanbanColumn {
  id: string;
  nome: string;
  cor: string;
}

export interface CrmEtiqueta {
  id: number;
  nome: string;
  cor: string;
}

export interface CrmVendedor {
  id: string | number;
  nome: string;
  cargo?: string;
  telefone?: string;
  assinatura?: string;
}

export interface CrmNotaCliente {
  id: string;
  autor: string;
  texto: string;
  timestamp: number;
}

export interface CrmProdutoEnviado {
  id: string;
  nome: string;
  preco: number;
  timestamp: number;
}

export interface CrmChat {
  id: string; // e.g. "5519981188090@c.us"
  nome: string;
  numero: string;
  pic?: string | null;
  unread: number;
  lastMessage: string;
  timestamp: number;
  tags: string[];
  vendedorId?: string | number | null;
  kanbanColId?: string | null;
  fixado?: boolean;
  bloqueado?: boolean;
  precisaAtencao?: boolean;
  transferidoPor?: string | null;
  transferidoEm?: number | null;
  optOut?: boolean;
  email?: string;
  documento?: string;
  endereco?: string;
  cidade?: string;
  valorNegocio?: number;
  produtoInteresse?: string;
  notas?: CrmNotaCliente[];
  produtosEnviados?: CrmProdutoEnviado[];
}

export interface CrmMensagem {
  id: string;
  chatId: string;
  from: string;
  to?: string | null;
  body: string;
  direction: "in" | "out";
  timestamp: number;
  contactName?: string | null;
  realNumber?: string | null;
  hasMedia?: boolean;
  mediaType?: string | null;
  mediaUrl?: string | null;
  mediaName?: string | null;
  isVoice?: boolean;
  replyTo?: {
    id: string;
    body: string;
    author: string;
  } | null;
  status?: "pending" | "sent" | "delivered" | "read" | "failed";
}

export interface CrmRespostaRapida {
  id: string | number;
  titulo: string;
  texto: string;
  categoria?: string;
  atalho?: string;
}

export interface CrmProdutoCatalogo {
  id: string;
  nome: string;
  preco: number;
  custo?: number;
  fornecedor?: string;
  margem?: number;
  precoFormatado: string;
  categoria: string;
  imagem: string;
  slug?: string;
  specs?: string[];
}

export interface CrmPromocao {
  id: string | number;
  titulo: string;
  texto: string;
  ativo: boolean;
  cartaz?: string | null;
  cartazNome?: string | null;
}

export interface CrmStatusItem {
  id: string;
  body: string;
  timestamp: number;
  hasMedia?: boolean;
  mediaType?: string | null;
  mediaUrl?: string | null;
}

export interface CrmStatusFeed {
  id: string;
  contactId: string | null;
  contactName: string;
  contactNumber?: string | null;
  profilePicUrl?: string | null;
  unreadCount?: number;
  totalCount?: number;
  timestamp: number;
  items: CrmStatusItem[];
}
