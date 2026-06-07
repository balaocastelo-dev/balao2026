export const PART_TYPES = [
  "processador",
  "placa_mae",
  "kits",
  "memoria",
  "ssd_hdd",
  "gabinete",
  "cooler",
  "outros",
] as const;

export const PART_TYPE_LABELS: Record<PartType, string> = {
  processador: "Processador",
  placa_mae: "Placa-mãe",
  kits: "Kits",
  memoria: "Memória",
  ssd_hdd: "SSD ou HD",
  gabinete: "Gabinete",
  cooler: "Cooler",
  outros: "Outros",
};

export type PartType = (typeof PART_TYPES)[number];

export type PartStatus = "disponivel" | "retirada";

export interface ControlePart {
  id: string;
  created_at: string;
  updated_at: string;
  type: PartType;
  status: PartStatus;
  full_name: string;
  serial_number: string;
  purchase_order_reference: string;
  photo_url: string | null;
  notes: string | null;
  withdrawn_at: string | null;
  withdrawn_customer_name: string | null;
  withdrawn_os_number: string | null;
  withdrawn_sale_price: number | null;
  withdrawn_technician_name: string | null;
  withdrawn_authorization_code: string | null;
}

export interface ControlePartInput {
  type: PartType;
  fullName: string;
  serialNumber: string;
  purchaseOrderReference: string;
  photoUrl: string;
  notes?: string;
}

export interface ControleWithdrawalInput {
  partId: string;
  customerName: string;
  osNumber: string;
  salePrice: number;
  technicianName: string;
  authorizationCode: string;
  approvalPassword: string;
}

export interface ControleWithdrawalRecord {
  id: string;
  created_at: string;
  part_id: string;
  customer_name: string;
  os_number: string;
  sale_price: number;
  technician_name: string;
  authorization_code: string;
  approved_password_code: string;
  part_snapshot_name: string;
  part_snapshot_serial: string;
  part_snapshot_type: PartType;
  part_snapshot_photo_url: string | null;
  purchase_order_reference: string;
}

export interface ControleReceiptData {
  withdrawal: ControleWithdrawalRecord;
  part: ControlePart;
}
