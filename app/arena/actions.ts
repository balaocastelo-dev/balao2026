'use server';

import { revalidatePath } from 'next/cache';
import { Vendedor, ArenaConfig, EventoMidia, Venda } from './types';
import { supabaseAdmin as supabaseAdminClient, hasAdmin } from '@/lib/supabase-admin';
import { turso, isTursoActive } from '@/lib/turso';

const hasTurso = isTursoActive();

function isOperational(): boolean {
  return Boolean(hasTurso || hasAdmin);
}

function genId(): string {
  return `id_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// --- Vendas (Histórico) ---

export async function getVendasRecentes(limit = 50): Promise<Venda[]> {
  if (!isOperational()) return [];

  if (hasTurso) {
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
      console.warn('[arena:getVendasRecentes] Turso error:', (e as any).message);
    }
  }

  try {
    const { data, error } = await supabaseAdminClient
      .from('arena_vendas')
      .select('*, vendedor:arena_vendedores(*)')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Erro ao buscar vendas (Supabase):', error);
      return [];
    }

    return (data || []).map((v: any) => ({
      ...v,
      vendedor: Array.isArray(v.vendedor) ? v.vendedor[0] : v.vendedor,
    })) as Venda[];
  } catch (e) {
    console.error('Erro ao buscar vendas (Supabase fallback):', (e as any).message);
    return [];
  }
}

export async function removerVenda(vendaId: string) {
  if (!isOperational()) {
    console.warn('[arena:removerVenda] Nenhum backend disponível');
    return;
  }

  try {
    if (hasTurso) {
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
          console.error('[arena] Erro ao cancelar pedido associado (Turso):', (err as any).message);
        }
      }

      revalidatePath('/arena/admin');
      revalidatePath('/arena');
      return;
    }
  } catch (e) {
    console.warn('[arena:removerVenda] Turso failed, fallback Supabase:', (e as any).message);
  }

  try {
    const { data: venda, error: fetchError } = await supabaseAdminClient
      .from('arena_vendas')
      .select('*')
      .eq('id', vendaId)
      .single();

    if (fetchError || !venda) return;

    const { data: vendedor, error: vendError } = await supabaseAdminClient
      .from('arena_vendedores')
      .select('vendas_atual')
      .eq('id', (venda as any).vendedor_id)
      .single();

    if (vendError || !vendedor) return;

    const novoTotal = Math.max(0, (Number((vendedor as any).vendas_atual) || 0) - Number((venda as any).valor || 0));

    await supabaseAdminClient
      .from('arena_vendedores')
      .update({ vendas_atual: novoTotal })
      .eq('id', (venda as any).vendedor_id);

    await supabaseAdminClient
      .from('arena_vendas')
      .delete()
      .eq('id', vendaId);

    if ((venda as any).order_id) {
      try {
        await supabaseAdminClient
          .from('orders')
          .update({ status: 'cancelled' })
          .eq('id', (venda as any).order_id);
      } catch (err) {
        console.error('Erro ao cancelar pedido associado:', err);
      }
    }

    revalidatePath('/arena/admin');
    revalidatePath('/arena');
  } catch (e) {
    console.error('[arena:removerVenda] Supabase also failed:', (e as any).message);
  }
}

// --- Vendedores ---

export async function getVendedores(): Promise<Vendedor[]> {
  if (!isOperational()) return [];

  if (hasTurso) {
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
      console.warn('[arena:getVendedores] Turso error:', (e as any).message);
    }
  }

  try {
    const { data, error } = await supabaseAdminClient
      .from('arena_vendedores')
      .select('*')
      .order('vendas_atual', { ascending: false });

    if (error) {
      console.error('Erro ao buscar vendedores (Supabase):', error);
      return [];
    }

    return (data || []) as Vendedor[];
  } catch (e) {
    console.error('Erro ao buscar vendedores (fallback):', (e as any).message);
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
    if (hasTurso) {
      await turso.execute({
        sql: `INSERT INTO arena_vendedores (id, nome, avatar_url, veiculo_emoji, meta_valor, vendas_atual, criado_em)
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [id, nome, avatar_url || null, veiculo_emoji || '🚗', meta_valor, vendas_atual, criado_em],
      });
      revalidatePath('/arena/admin');
      revalidatePath('/arena');
      return;
    }
  } catch (e) {
    console.warn('[arena:criarVendedor] Turso failed, fallback Supabase:', (e as any).message);
  }

  try {
    const { error } = await supabaseAdminClient
      .from('arena_vendedores')
      .insert({ id, nome, avatar_url, veiculo_emoji, meta_valor, vendas_atual, criado_em });

    if (error) {
      console.error('Erro ao criar vendedor (Supabase):', error.message);
      return;
    }
    revalidatePath('/arena/admin');
    revalidatePath('/arena');
  } catch (e) {
    console.error('[arena:criarVendedor] Supabase also failed:', (e as any).message);
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
    if (hasTurso) {
      await turso.execute({
        sql: `UPDATE arena_vendedores SET nome = ?, avatar_url = ?, veiculo_emoji = ?, meta_valor = ?, vendas_atual = ? WHERE id = ?`,
        args: [nome, avatar_url || null, veiculo_emoji || '🚗', meta_valor, vendas_atual, id],
      });
      revalidatePath('/arena/admin');
      revalidatePath('/arena');
      return;
    }
  } catch (e) {
    console.warn('[arena:atualizarVendedor] Turso failed, fallback Supabase:', (e as any).message);
  }

  try {
    const { error } = await supabaseAdminClient
      .from('arena_vendedores')
      .update({ nome, avatar_url, veiculo_emoji, meta_valor, vendas_atual })
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar vendedor (Supabase):', error.message);
      return;
    }
    revalidatePath('/arena/admin');
    revalidatePath('/arena');
  } catch (e) {
    console.error('[arena:atualizarVendedor] Supabase also failed:', (e as any).message);
  }
}

export async function removerVendedor(id: string) {
  if (!isOperational()) return;

  try {
    if (hasTurso) {
      await turso.execute({
        sql: 'DELETE FROM arena_vendedores WHERE id = ?',
        args: [id],
      });
      revalidatePath('/arena/admin');
      revalidatePath('/arena');
      return;
    }
  } catch (e) {
    console.warn('[arena:removerVendedor] Turso failed, fallback Supabase:', (e as any).message);
  }

  try {
    const { error } = await supabaseAdminClient
      .from('arena_vendedores')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao remover vendedor (Supabase):', error.message);
      return;
    }
    revalidatePath('/arena/admin');
    revalidatePath('/arena');
  } catch (e) {
    console.error('[arena:removerVendedor] Supabase also failed:', (e as any).message);
  }
}

export async function adicionarVenda(id: string, valor: number) {
  if (!isOperational()) return;

  try {
    if (hasTurso) {
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
      return;
    }
  } catch (e) {
    console.warn('[arena:adicionarVenda] Turso failed, fallback Supabase:', (e as any).message);
  }

  try {
    const { data: vendedor, error: fetchError } = await supabaseAdminClient
      .from('arena_vendedores')
      .select('vendas_atual')
      .eq('id', id)
      .single();

    if (fetchError || !vendedor) return;

    const novaVenda = (Number((vendedor as any).vendas_atual) || 0) + Number(valor || 0);

    await supabaseAdminClient
      .from('arena_vendedores')
      .update({ vendas_atual: novaVenda })
      .eq('id', id);

    await supabaseAdminClient
      .from('arena_vendas')
      .insert({ vendedor_id: id, valor: Number(valor || 0) });

    revalidatePath('/arena/admin');
    revalidatePath('/arena');
  } catch (e) {
    console.error('[arena:adicionarVenda] Supabase also failed:', (e as any).message);
  }
}

export async function resetarVendas() {
  if (!isOperational()) return;

  try {
    if (hasTurso) {
      await turso.execute(
        "DELETE FROM arena_vendas WHERE id != '00000000-0000-0000-0000-000000000000'"
      );
      await turso.execute(
        "UPDATE arena_vendedores SET vendas_atual = 0 WHERE id != '00000000-0000-0000-0000-000000000000'"
      );
      revalidatePath('/arena/admin');
      revalidatePath('/arena');
      return;
    }
  } catch (e) {
    console.warn('[arena:resetarVendas] Turso failed, fallback Supabase:', (e as any).message);
  }

  try {
    await supabaseAdminClient
      .from('arena_vendas')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    const { error } = await supabaseAdminClient
      .from('arena_vendedores')
      .update({ vendas_atual: 0 })
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (error) {
      console.error('Erro ao resetar vendas (Supabase):', error.message);
      return;
    }
    revalidatePath('/arena/admin');
    revalidatePath('/arena');
  } catch (e) {
    console.error('[arena:resetarVendas] Supabase also failed:', (e as any).message);
  }
}

// --- Configuração ---

export async function getConfig(): Promise<ArenaConfig | null> {
  if (!isOperational()) return null;

  if (hasTurso) {
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
      console.warn('[arena:getConfig] Turso error:', (e as any).message);
    }
  }

  try {
    const { data, error } = await supabaseAdminClient
      .from('arena_config')
      .select('*')
      .limit(1)
      .single();

    if (error && (error as any).code !== 'PGRST116') {
      console.error('Erro ao buscar config (Supabase):', error);
      return null;
    }

    return (data as ArenaConfig) || null;
  } catch (e) {
    console.error('Erro ao buscar config (fallback):', (e as any).message);
    return null;
  }
}

export async function atualizarConfig(formData: FormData) {
  if (!isOperational()) return;

  const titulo = formData.get('titulo') as string;
  const ativo = formData.get('ativo') === 'true';
  const agora = new Date().toISOString();

  try {
    if (hasTurso) {
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
      return;
    }
  } catch (e) {
    console.warn('[arena:atualizarConfig] Turso failed, fallback Supabase:', (e as any).message);
  }

  try {
    const config = await getConfig();
    let error: any;
    if (config) {
      const result = await supabaseAdminClient
        .from('arena_config')
        .update({ titulo, ativo, atualizado_em: agora })
        .eq('id', config.id);
      error = result.error;
    } else {
      const result = await supabaseAdminClient
        .from('arena_config')
        .insert({ titulo, ativo });
      error = result.error;
    }

    if (error) {
      console.error('Erro ao atualizar config (Supabase):', error.message);
      return;
    }
    revalidatePath('/arena/admin');
    revalidatePath('/arena');
  } catch (e) {
    console.error('[arena:atualizarConfig] Supabase also failed:', (e as any).message);
  }
}

// --- Eventos de Mídia ---

export async function getEventosMidia(): Promise<EventoMidia[]> {
  if (!isOperational()) return [];

  if (hasTurso) {
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
      console.warn('[arena:getEventosMidia] Turso error:', (e as any).message);
    }
  }

  try {
    const { data, error } = await supabaseAdminClient
      .from('arena_eventos_midia')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar eventos de mídia (Supabase):', error);
      return [];
    }

    return (data || []) as EventoMidia[];
  } catch (e) {
    console.error('Erro ao buscar eventos de mídia (fallback):', (e as any).message);
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
    if (hasTurso) {
      await turso.execute({
        sql: `INSERT INTO arena_eventos_midia (id, evento_tipo, gif_url, titulo, mensagem_template, ativo, created_at)
              VALUES (?, ?, ?, ?, ?, 1, ?)`,
        args: [id, evento_tipo, gif_url || null, titulo || null, mensagem_template || null, created_at],
      });
      revalidatePath('/arena/admin');
      revalidatePath('/arena');
      return;
    }
  } catch (e) {
    console.warn('[arena:criarEventoMidia] Turso failed, fallback Supabase:', (e as any).message);
  }

  try {
    const { error } = await supabaseAdminClient
      .from('arena_eventos_midia')
      .insert({ evento_tipo, gif_url, titulo, mensagem_template, ativo: true, created_at });

    if (error) {
      console.error('Erro ao criar evento de mídia (Supabase):', error.message);
      return;
    }
    revalidatePath('/arena/admin');
    revalidatePath('/arena');
  } catch (e) {
    console.error('[arena:criarEventoMidia] Supabase also failed:', (e as any).message);
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
    if (hasTurso) {
      await turso.execute({
        sql: `UPDATE arena_eventos_midia SET evento_tipo = ?, gif_url = ?, titulo = ?, mensagem_template = ?, ativo = ? WHERE id = ?`,
        args: [evento_tipo, gif_url || null, titulo || null, mensagem_template || null, ativo ? 1 : 0, id],
      });
      revalidatePath('/arena/admin');
      revalidatePath('/arena');
      return;
    }
  } catch (e) {
    console.warn('[arena:atualizarEventoMidia] Turso failed, fallback Supabase:', (e as any).message);
  }

  try {
    const { error } = await supabaseAdminClient
      .from('arena_eventos_midia')
      .update({ evento_tipo, gif_url, titulo, mensagem_template, ativo })
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar evento de mídia (Supabase):', error.message);
      return;
    }
    revalidatePath('/arena/admin');
    revalidatePath('/arena');
  } catch (e) {
    console.error('[arena:atualizarEventoMidia] Supabase also failed:', (e as any).message);
  }
}

export async function removerEventoMidia(id: string) {
  if (!isOperational()) return;

  try {
    if (hasTurso) {
      await turso.execute({
        sql: 'DELETE FROM arena_eventos_midia WHERE id = ?',
        args: [id],
      });
      revalidatePath('/arena/admin');
      revalidatePath('/arena');
      return;
    }
  } catch (e) {
    console.warn('[arena:removerEventoMidia] Turso failed, fallback Supabase:', (e as any).message);
  }

  try {
    const { error } = await supabaseAdminClient
      .from('arena_eventos_midia')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao remover evento de mídia (Supabase):', error.message);
      return;
    }
    revalidatePath('/arena/admin');
    revalidatePath('/arena');
  } catch (e) {
    console.error('[arena:removerEventoMidia] Supabase also failed:', (e as any).message);
  }
}
