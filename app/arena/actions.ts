'use server';

import { revalidatePath } from 'next/cache';
import { Vendedor, ArenaConfig, EventoMidia, Venda } from './types';
import { turso, isTursoActive } from '@/lib/turso';

function isOperational(): boolean {
  return isTursoActive();
}

function genId(): string {
  return `id_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// --- Vendas (Histórico) ---

export async function getVendasRecentes(limit = 50): Promise<Venda[]> {
  if (!isOperational()) return [];

  try {
    const res = await turso.execute({
      sql: `
        SELECT v.id, v.vendedor_id, v.order_id, v.valor, v.created_at,
               vend.nome as vendedor_nome, vend.avatar_url, vend.veiculo_emoji,
               vend.meta_valor, vend.vendas_atual, vend.criado_em as vendedor_criado_em
        FROM arena_vendas v
        LEFT JOIN arena_vendedores vend ON vend.id = v.vendedor_id
        ORDER BY v.created_at DESC
        LIMIT ?
      `,
      args: [limit],
    });
    return (res.rows as any[]).map((r) => ({
      id: String(r.id),
      vendedor_id: r.vendedor_id ? String(r.vendedor_id) : null,
      order_id: r.order_id ? String(r.order_id) : null,
      valor: Number(r.valor || 0),
      created_at: r.created_at ? String(r.created_at) : new Date().toISOString(),
      vendedor: r.vendedor_nome ? {
        id: String(r.vendedor_id),
        nome: String(r.vendedor_nome || ''),
        avatar_url: r.avatar_url ? String(r.avatar_url) : null,
        veiculo_emoji: r.veiculo_emoji ? String(r.veiculo_emoji) : '🚗',
        meta_valor: Number(r.meta_valor || 0),
        vendas_atual: Number(r.vendas_atual || 0),
        criado_em: r.vendedor_criado_em ? String(r.vendedor_criado_em) : undefined,
      } as Vendedor : null,
    })) as Venda[];
  } catch (e) {
    console.error('[arena:getVendasRecentes] Erro:', (e as any).message);
    return [];
  }
}

export async function removerVenda(vendaId: string) {
  if (!isOperational()) {
    console.warn('[arena:removerVenda] Banco não configurado');
    return;
  }

  try {
    const vendaRes = await turso.execute({
      sql: 'SELECT vendedor_id, valor, order_id FROM arena_vendas WHERE id = ? LIMIT 1',
      args: [vendaId],
    });
    if (vendaRes.rows.length === 0) return;
    const venda = vendaRes.rows[0] as any;
    const vendedorId = venda.vendedor_id;
    const valorVenda = Number(venda.valor || 0);
    const orderId = venda.order_id;

    if (vendedorId) {
      const vRes = await turso.execute({
        sql: 'SELECT vendas_atual FROM arena_vendedores WHERE id = ? LIMIT 1',
        args: [vendedorId],
      });
      if (vRes.rows.length > 0) {
        const atual = Number((vRes.rows[0] as any).vendas_atual || 0);
        const novoTotal = Math.max(0, atual - valorVenda);
        await turso.execute({
          sql: 'UPDATE arena_vendedores SET vendas_atual = ? WHERE id = ?',
          args: [novoTotal, vendedorId],
        });
      }
    }

    await turso.execute({
      sql: 'DELETE FROM arena_vendas WHERE id = ?',
      args: [vendaId],
    });

    if (orderId) {
      try {
        await turso.execute({
          sql: "UPDATE orders SET status = 'cancelled' WHERE id = ?",
          args: [orderId],
        });
      } catch (err) {
        console.error('[arena] Erro ao cancelar pedido associado:', (err as any).message);
      }
    }

    revalidatePath('/arena/admin');
    revalidatePath('/arena');
  } catch (e) {
    console.error('[arena:removerVenda] Erro:', (e as any).message);
  }
}

// --- Vendedores ---

export async function getVendedores(): Promise<Vendedor[]> {
  if (!isOperational()) return [];

  try {
    const res = await turso.execute(
      'SELECT * FROM arena_vendedores ORDER BY vendas_atual DESC, criado_em DESC'
    );
    return (res.rows as any[]).map((r) => ({
      id: String(r.id),
      nome: String(r.nome || ''),
      avatar_url: r.avatar_url ? String(r.avatar_url) : null,
      veiculo_emoji: r.veiculo_emoji ? String(r.veiculo_emoji) : '🚗',
      meta_valor: Number(r.meta_valor || 0),
      vendas_atual: Number(r.vendas_atual || 0),
      criado_em: r.criado_em ? String(r.criado_em) : undefined,
    })) as Vendedor[];
  } catch (e) {
    console.error('[arena:getVendedores] Erro:', (e as any).message);
    return [];
  }
}

export async function criarVendedor(formData: FormData) {
  if (!isOperational()) return;

  const nome = formData.get('nome') as string;
  const avatar_url = formData.get('avatar_url') as string;
  const veiculo_emoji = formData.get('veiculo_emoji') as string;
  const meta_valor = parseFloat(formData.get('meta_valor') as string || '0');
  const vendas_atual_raw = formData.get('vendas_atual');
  const vendas_atual = vendas_atual_raw ? parseFloat(vendas_atual_raw as string) : 0;
  const id = genId();
  const criado_em = new Date().toISOString();

  try {
    await turso.execute({
      sql: `INSERT INTO arena_vendedores (id, nome, avatar_url, veiculo_emoji, meta_valor, vendas_atual, criado_em)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [id, nome, avatar_url || null, veiculo_emoji || '🚗', meta_valor, vendas_atual, criado_em],
    });
    revalidatePath('/arena/admin');
    revalidatePath('/arena');
  } catch (e) {
    console.error('[arena:criarVendedor] Erro:', (e as any).message);
  }
}

export async function atualizarVendedor(id: string, formData: FormData) {
  if (!isOperational()) return;

  const nome = formData.get('nome') as string;
  const avatar_url = formData.get('avatar_url') as string;
  const veiculo_emoji = formData.get('veiculo_emoji') as string;
  const meta_valor = parseFloat(formData.get('meta_valor') as string || '0');
  const vendas_atual = parseFloat(formData.get('vendas_atual') as string || '0');

  try {
    await turso.execute({
      sql: `UPDATE arena_vendedores SET nome = ?, avatar_url = ?, veiculo_emoji = ?, meta_valor = ?, vendas_atual = ? WHERE id = ?`,
      args: [nome, avatar_url || null, veiculo_emoji || '🚗', meta_valor, vendas_atual, id],
    });
    revalidatePath('/arena/admin');
    revalidatePath('/arena');
  } catch (e) {
    console.error('[arena:atualizarVendedor] Erro:', (e as any).message);
  }
}

export async function removerVendedor(id: string) {
  if (!isOperational()) return;

  try {
    await turso.execute({
      sql: 'DELETE FROM arena_vendedores WHERE id = ?',
      args: [id],
    });
    revalidatePath('/arena/admin');
    revalidatePath('/arena');
  } catch (e) {
    console.error('[arena:removerVendedor] Erro:', (e as any).message);
  }
}

export async function adicionarVenda(id: string, valor: number) {
  if (!isOperational()) return;

  try {
    const vRes = await turso.execute({
      sql: 'SELECT vendas_atual FROM arena_vendedores WHERE id = ? LIMIT 1',
      args: [id],
    });
    if (vRes.rows.length === 0) return;
    const atual = Number((vRes.rows[0] as any).vendas_atual || 0);
    const novaVenda = atual + Number(valor || 0);

    await turso.execute({
      sql: 'UPDATE arena_vendedores SET vendas_atual = ? WHERE id = ?',
      args: [novaVenda, id],
    });

    const vendaId = genId();
    await turso.execute({
      sql: 'INSERT INTO arena_vendas (id, vendedor_id, valor, created_at) VALUES (?, ?, ?, ?)',
      args: [vendaId, id, Number(valor || 0), new Date().toISOString()],
    });

    revalidatePath('/arena/admin');
    revalidatePath('/arena');
  } catch (e) {
    console.error('[arena:adicionarVenda] Erro:', (e as any).message);
  }
}

export async function resetarVendas() {
  if (!isOperational()) return;

  try {
    await turso.execute(
      "DELETE FROM arena_vendas WHERE id != '00000000-0000-0000-0000-000000000000'"
    );
    await turso.execute(
      "UPDATE arena_vendedores SET vendas_atual = 0 WHERE id != '00000000-0000-0000-0000-000000000000'"
    );
    revalidatePath('/arena/admin');
    revalidatePath('/arena');
  } catch (e) {
    console.error('[arena:resetarVendas] Erro:', (e as any).message);
  }
}

// --- Configuração ---

export async function getConfig(): Promise<ArenaConfig | null> {
  if (!isOperational()) return null;

  try {
    const res = await turso.execute(
      'SELECT * FROM arena_config LIMIT 1'
    );
    if (res.rows.length > 0) {
      const r = res.rows[0] as any;
      return {
        id: Number(r.id || 1),
        ativo: Boolean(r.ativo || false),
        titulo: String(r.titulo || 'Corrida de Vendas'),
        atualizado_em: r.atualizado_em ? String(r.atualizado_em) : undefined,
      } as ArenaConfig;
    }
    return null;
  } catch (e) {
    console.error('[arena:getConfig] Erro:', (e as any).message);
    return null;
  }
}

export async function atualizarConfig(formData: FormData) {
  if (!isOperational()) return;

  const titulo = formData.get('titulo') as string;
  const ativo = formData.get('ativo') === 'true';
  const agora = new Date().toISOString();

  try {
    const existing = await getConfig();
    if (existing) {
      await turso.execute({
        sql: 'UPDATE arena_config SET titulo = ?, ativo = ?, atualizado_em = ? WHERE id = ?',
        args: [titulo, ativo ? 1 : 0, agora, existing.id],
      });
    } else {
      await turso.execute({
        sql: 'INSERT INTO arena_config (id, titulo, ativo, atualizado_em) VALUES (1, ?, ?, ?)',
        args: [titulo, ativo ? 1 : 0, agora],
      });
    }
    revalidatePath('/arena/admin');
    revalidatePath('/arena');
  } catch (e) {
    console.error('[arena:atualizarConfig] Erro:', (e as any).message);
  }
}

// --- Eventos de Mídia ---

export async function getEventosMidia(): Promise<EventoMidia[]> {
  if (!isOperational()) return [];

  try {
    const res = await turso.execute(
      'SELECT * FROM arena_eventos_midia ORDER BY created_at DESC'
    );
    return (res.rows as any[]).map((r) => ({
      id: String(r.id),
      evento_tipo: String(r.evento_tipo || ''),
      gif_url: r.gif_url ? String(r.gif_url) : null,
      titulo: r.titulo ? String(r.titulo) : null,
      mensagem_template: r.mensagem_template ? String(r.mensagem_template) : null,
      ativo: Boolean(r.ativo || false),
      created_at: r.created_at ? String(r.created_at) : undefined,
    })) as EventoMidia[];
  } catch (e) {
    console.error('[arena:getEventosMidia] Erro:', (e as any).message);
    return [];
  }
}

export async function criarEventoMidia(formData: FormData) {
  if (!isOperational()) return;

  const evento_tipo = formData.get('evento_tipo') as string;
  const gif_url = formData.get('gif_url') as string;
  const titulo = formData.get('titulo') as string;
  const mensagem_template = formData.get('mensagem_template') as string;
  const id = genId();
  const created_at = new Date().toISOString();

  try {
    await turso.execute({
      sql: `INSERT INTO arena_eventos_midia (id, evento_tipo, gif_url, titulo, mensagem_template, ativo, created_at)
            VALUES (?, ?, ?, ?, ?, 1, ?)`,
      args: [id, evento_tipo, gif_url || null, titulo || null, mensagem_template || null, created_at],
    });
    revalidatePath('/arena/admin');
    revalidatePath('/arena');
  } catch (e) {
    console.error('[arena:criarEventoMidia] Erro:', (e as any).message);
  }
}

export async function atualizarEventoMidia(id: string, formData: FormData) {
  if (!isOperational()) return;

  const evento_tipo = formData.get('evento_tipo') as string;
  const gif_url = formData.get('gif_url') as string;
  const titulo = formData.get('titulo') as string;
  const mensagem_template = formData.get('mensagem_template') as string;
  const ativo = formData.get('ativo') === 'true';

  try {
    await turso.execute({
      sql: `UPDATE arena_eventos_midia SET evento_tipo = ?, gif_url = ?, titulo = ?, mensagem_template = ?, ativo = ? WHERE id = ?`,
      args: [evento_tipo, gif_url || null, titulo || null, mensagem_template || null, ativo ? 1 : 0, id],
    });
    revalidatePath('/arena/admin');
    revalidatePath('/arena');
  } catch (e) {
    console.error('[arena:atualizarEventoMidia] Erro:', (e as any).message);
  }
}

export async function removerEventoMidia(id: string) {
  if (!isOperational()) return;

  try {
    await turso.execute({
      sql: 'DELETE FROM arena_eventos_midia WHERE id = ?',
      args: [id],
    });
    revalidatePath('/arena/admin');
    revalidatePath('/arena');
  } catch (e) {
    console.error('[arena:removerEventoMidia] Erro:', (e as any).message);
  }
}
