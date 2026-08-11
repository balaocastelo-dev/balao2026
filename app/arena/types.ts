export type Vendedor = {
  id: string;
  nome: string;
  avatar_url: string | null;
  veiculo_emoji: string;
  meta_valor: number;
  vendas_atual: number;
  criado_em: string;
};

export type Venda = {
  id: string;
  vendedor_id: string;
  valor: number;
  created_at: string;
  order_id?: string;
  vendedor?: Vendedor; // Join opcional
};

export type ArenaConfig = {
  id: number;
  ativo: boolean;
  titulo: string;
  atualizado_em: string;
};

export type EventoMidia = {
  id: string;
  evento_tipo: 'nova_venda' | 'meta_batida' | 'ultrapassagem' | 'lideranca' | 'venda_alta' | 'combo_vendas' | 'meta_global';
  gif_url: string;
  titulo: string;
  mensagem_template?: string;
  ativo: boolean;
};

export const TIPOS_EVENTOS = [
  { id: 'nova_venda', label: 'Nova Venda' },
  { id: 'meta_batida', label: 'Meta Individual Batida' },
  { id: 'meta_global', label: 'Meta Global Batida' },
  { id: 'lideranca', label: 'Assumiu Liderança' },
  { id: 'ultrapassagem', label: 'Ultrapassagem no Ranking' },
  { id: 'venda_alta', label: 'Venda Alta' },
  { id: 'combo_vendas', label: 'Combo de Vendas (3x)' },
] as const;

export const VEICULOS_DISPONIVEIS = [
  '🚗', '🏎️', '🚀', '🏍️', '🚚', '🚕', '🚓', '🚑', '🚜', '🛸', '🚲', '🛴'
];
