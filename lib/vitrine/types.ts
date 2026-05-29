export type VitrineStatus = "rascunho" | "publicada" | "arquivada";

export type VitrineCategory =
  | "PC Gamer"
  | "Workstation"
  | "PC para escritório"
  | "PC para edição"
  | "PC para arquitetura"
  | "PC para programação"
  | "PC custo-benefício";

export interface VitrinePageRecord {
  id: string;
  nome_pc: string;
  slug: string;
  categoria: VitrineCategory;
  descricao_original: string;
  source_url?: string;
  processador: string;
  placa_video: string;
  memoria_ram: string;
  armazenamento: string;
  sistema_operacional: string;
  resfriamento: string;
  aplicacoes: string[];
  extras?: Record<string, string>;
  images?: Record<string, string>;
  image_prompts?: Record<string, string>;
  status: VitrineStatus;
  data_criacao: string;
  data_publicacao: string | null;
}

export interface VitrineExtractedParts {
  processador?: string;
  placa_video?: string;
  memoria_ram?: string;
  armazenamento?: string;
  sistema_operacional?: string;
  resfriamento?: string;
  categoria?: VitrineCategory;
  aplicacoes?: string[];
}

export interface VitrineCommercialCopy {
  heroSubtitle: string;
  processorText: string;
  ramText: string;
  storageText: string;
  gpuText: string;
  coolingText: string;
  applicationsText: string;
  shortDescription: string;
}
