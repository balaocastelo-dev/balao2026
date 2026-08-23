export type WhatsAppStatus =
  | "disconnected"
  | "initializing"
  | "qr"
  | "authenticated"
  | "ready"
  | "auth_failure";

export type FunnelStageId =
  | "new_lead"
  | "first_contact"
  | "budget_sent"
  | "in_negotiation"
  | "awaiting_payment"
  | "won"
  | "post_sale"
  | "lost";

export interface FunnelStage {
  id: FunnelStageId;
  title: string;
  shortTitle: string;
  color: string;
  badgeBg: string;
  borderColor: string;
  description: string;
}

export interface CrmTag {
  id: string;
  name: string;
  color: string;
  bgColor: string;
}

export interface CrmSeller {
  id: string;
  name: string;
  role: string;
  avatar: string;
  phone?: string;
  email?: string;
}

export interface CrmCustomerNote {
  id: string;
  author: string;
  text: string;
  timestamp: number;
}

export interface CrmLead {
  id: string;
  chatId: string;
  name: string;
  phone: string;
  displayNumber?: string;
  email?: string;
  document?: string;
  address?: string;
  city?: string;
  preferredBranch?: string;
  stage: FunnelStageId;
  dealValue: number;
  tags: string[];
  assignedSellerId: string | null;
  unreadCount: number;
  lastMessageBody: string;
  lastMessageTimestamp: number;
  profilePicUrl?: string | null;
  isGroup?: boolean;
  notes: CrmCustomerNote[];
  productOfInterest?: string;
  createdAt: number;
  updatedAt: number;
}

export interface CrmMessage {
  id: string;
  chatId: string;
  from: string;
  to?: string | null;
  body: string;
  direction: "in" | "out";
  timestamp: number;
  contactName?: string | null;
  realNumber?: string | null;
  displayNumber?: string | null;
  hasMedia?: boolean;
  mediaType?: string | null;
  isVoice?: boolean;
  isPix?: boolean;
  pixValue?: number;
  status?: "pending" | "sent" | "delivered" | "read" | "failed";
}

export interface QuickReplyTemplate {
  id: string;
  title: string;
  category: "saudacoes" | "pix" | "orcamento" | "loja" | "assistencia" | "followup" | "geral";
  message: string;
  shortcut?: string;
}

export interface ScheduledMessage {
  id: string;
  leadId?: string;
  leadName?: string;
  phone: string;
  message: string;
  sendAt: string;
  status: "pending" | "sent" | "failed" | "cancelled";
  sellerId?: string | null;
  createdAt: number;
}

export interface BroadcastCampaign {
  id: string;
  title: string;
  targetStage?: FunnelStageId | "all";
  targetTag?: string | "all";
  messageTemplate: string;
  intervalSeconds: number;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  status: "idle" | "running" | "completed" | "paused" | "cancelled";
  createdAt: number;
}

export interface BalãoProductCatalogItem {
  id: string;
  name: string;
  price: number;
  formattedPrice: string;
  category: string;
  image: string;
  slug?: string;
  specs?: string[];
  badge?: string;
}
