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
  email?: string;
  documento?: string;
  endereco?: string;
  cidade?: string;
  valorNegocio?: number;
  produtoInteresse?: string;
  notas?: CrmNotaCliente[];
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
  isVoice?: boolean;
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
