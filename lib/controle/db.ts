import { hasAdmin, supabaseAdmin } from "@/lib/supabase-admin";
import { turso, isTursoActive } from "@/lib/turso";

import type {
  ControlePart,
  ControlePartInput,
  ControleReceiptData,
  ControleWithdrawalInput,
  ControleWithdrawalRecord,
} from "@/lib/controle/types";

const hasTurso = isTursoActive();

function isOperational(): boolean {
  return Boolean(hasTurso || hasAdmin);
}

function genId(): string {
  return `cp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

const PART_COLUMNS = `
  id,
  created_at,
  updated_at,
  type,
  status,
  full_name,
  serial_number,
  purchase_order_reference,
  photo_url,
  notes,
  withdrawn_at,
  withdrawn_customer_name,
  withdrawn_os_number,
  withdrawn_sale_price,
  withdrawn_technician_name,
  withdrawn_authorization_code
`;

const WITHDRAWAL_COLUMNS = `
  id,
  created_at,
  part_id,
  customer_name,
  os_number,
  sale_price,
  technician_name,
  authorization_code,
  approved_password_code,
  part_snapshot_name,
  part_snapshot_serial,
  part_snapshot_type,
  part_snapshot_photo_url,
  purchase_order_reference
`;

function mapPartRow(r: any): ControlePart {
  return {
    id: String(r.id),
    created_at: r.created_at ? String(r.created_at) : '',
    updated_at: r.updated_at ? String(r.updated_at) : '',
    type: String(r.type || '') as any,
    status: String(r.status || 'disponivel') as any,
    full_name: String(r.full_name || ''),
    serial_number: String(r.serial_number || ''),
    purchase_order_reference: String(r.purchase_order_reference || ''),
    photo_url: r.photo_url ? String(r.photo_url) : null,
    notes: r.notes ? String(r.notes) : null,
    withdrawn_at: r.withdrawn_at ? String(r.withdrawn_at) : null,
    withdrawn_customer_name: r.withdrawn_customer_name ? String(r.withdrawn_customer_name) : null,
    withdrawn_os_number: r.withdrawn_os_number ? String(r.withdrawn_os_number) : null,
    withdrawn_sale_price: r.withdrawn_sale_price != null ? Number(r.withdrawn_sale_price) : null,
    withdrawn_technician_name: r.withdrawn_technician_name ? String(r.withdrawn_technician_name) : null,
    withdrawn_authorization_code: r.withdrawn_authorization_code ? String(r.withdrawn_authorization_code) : null,
  };
}

function mapWithdrawalRow(r: any): ControleWithdrawalRecord {
  return {
    id: String(r.id),
    created_at: r.created_at ? String(r.created_at) : '',
    part_id: String(r.part_id || ''),
    customer_name: String(r.customer_name || ''),
    os_number: String(r.os_number || ''),
    sale_price: Number(r.sale_price || 0),
    technician_name: String(r.technician_name || ''),
    authorization_code: String(r.authorization_code || ''),
    approved_password_code: r.approved_password_code ? String(r.approved_password_code) : '',
    part_snapshot_name: r.part_snapshot_name ? String(r.part_snapshot_name) : '',
    part_snapshot_serial: r.part_snapshot_serial ? String(r.part_snapshot_serial) : '',
    part_snapshot_type: (r.part_snapshot_type || 'outros') as any,
    part_snapshot_photo_url: r.part_snapshot_photo_url ? String(r.part_snapshot_photo_url) : null,
    purchase_order_reference: r.purchase_order_reference ? String(r.purchase_order_reference) : '',
  };
}

export async function listPublicControleParts(): Promise<ControlePart[]> {
  if (!isOperational()) return [];

  if (hasTurso) {
    try {
      const res = await turso.execute(`
        SELECT ${PART_COLUMNS} FROM controle_parts
        WHERE status = 'disponivel'
        ORDER BY type ASC, full_name ASC
      `);
      return res.rows.map(mapPartRow);
    } catch (e) {
      console.warn('[controle:listPublicControleParts] Turso error:', (e as any).message);
    }
  }

  try {
    if (!hasAdmin) return [];
    const { data, error } = await supabaseAdmin
      .from("controle_parts")
      .select(PART_COLUMNS)
      .eq("status", "disponivel")
      .order("type", { ascending: true })
      .order("full_name", { ascending: true });

    if (error) {
      console.error("Erro ao listar pecas publicas (Supabase):", error);
      return [];
    }

    return ((data ?? []) as any[]).map(mapPartRow);
  } catch (e) {
    console.error("Erro ao listar pecas publicas (fallback):", (e as any).message);
    return [];
  }
}

export async function listAdminControleParts(): Promise<ControlePart[]> {
  if (!isOperational()) return [];

  if (hasTurso) {
    try {
      const res = await turso.execute(`
        SELECT ${PART_COLUMNS} FROM controle_parts
        ORDER BY created_at DESC
      `);
      return res.rows.map(mapPartRow);
    } catch (e) {
      console.warn('[controle:listAdminControleParts] Turso error:', (e as any).message);
    }
  }

  try {
    if (!hasAdmin) return [];
    const { data, error } = await supabaseAdmin
      .from("controle_parts")
      .select(PART_COLUMNS)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao listar pecas admin (Supabase):", error.message);
      return [];
    }

    return ((data ?? []) as any[]).map(mapPartRow);
  } catch (e) {
    console.error("Erro ao listar pecas admin (fallback):", (e as any).message);
    return [];
  }
}

export async function createControlePart(payload: ControlePartInput): Promise<ControlePart> {
  if (!isOperational()) {
    throw new Error("Nenhum backend de banco disponível.");
  }

  const now = new Date().toISOString();
  const id = genId();
  const row = {
    id,
    created_at: now,
    updated_at: now,
    type: payload.type,
    status: 'disponivel' as const,
    full_name: payload.fullName.trim(),
    serial_number: payload.serialNumber.trim(),
    purchase_order_reference: payload.purchaseOrderReference.trim(),
    photo_url: payload.photoUrl.trim() || null,
    notes: payload.notes?.trim() || null,
  };

  if (hasTurso) {
    try {
      await turso.execute({
        sql: `INSERT INTO controle_parts
             (id, created_at, updated_at, type, status, full_name, serial_number, purchase_order_reference, photo_url, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [row.id, row.created_at, row.updated_at, row.type, row.status, row.full_name, row.serial_number, row.purchase_order_reference, row.photo_url, row.notes],
      });
      return mapPartRow(row);
    } catch (e) {
      console.warn('[controle:createControlePart] Turso failed, fallback Supabase:', (e as any).message);
    }
  }

  try {
    if (!hasAdmin) throw new Error("Sem backend disponível.");
    const { data, error } = await supabaseAdmin
      .from("controle_parts")
      .insert({
        type: payload.type,
        full_name: payload.fullName.trim(),
        serial_number: payload.serialNumber.trim(),
        purchase_order_reference: payload.purchaseOrderReference.trim(),
        photo_url: payload.photoUrl.trim(),
        notes: payload.notes?.trim() || null,
        status: "disponivel",
        created_at: now,
        updated_at: now,
      })
      .select(PART_COLUMNS)
      .single();

    if (error || !data) {
      throw new Error(`Erro ao cadastrar peca: ${error?.message ?? "desconhecido"}`);
    }

    return mapPartRow(data);
  } catch (e) {
    throw new Error(`Nao foi possivel cadastrar a peca: ${(e as any).message ?? "erro desconhecido"}`);
  }
}

export async function createControleWithdrawal(
  payload: ControleWithdrawalInput,
  approvedPasswordCode: string,
): Promise<ControleReceiptData> {
  if (!isOperational()) {
    throw new Error("Nenhum backend de banco disponível.");
  }

  const withdrawnAt = new Date().toISOString();
  const withdrawalId = genId();

  if (hasTurso) {
    try {
      const partRes = await turso.execute({
        sql: `SELECT ${PART_COLUMNS} FROM controle_parts WHERE id = ? LIMIT 1`,
        args: [payload.partId],
      });
      if (partRes.rows.length === 0) throw new Error("Peca nao encontrada.");
      const typedPart = mapPartRow(partRes.rows[0]);

      if (typedPart.status !== "disponivel") {
        throw new Error("Essa peca nao esta mais disponivel para retirada.");
      }

      const withdrawalRow = {
        id: withdrawalId,
        created_at: withdrawnAt,
        part_id: typedPart.id,
        customer_name: payload.customerName.trim(),
        os_number: payload.osNumber.trim(),
        sale_price: Number(payload.salePrice || 0),
        technician_name: payload.technicianName.trim(),
        authorization_code: payload.authorizationCode.trim(),
        approved_password_code: approvedPasswordCode,
        part_snapshot_name: typedPart.full_name,
        part_snapshot_serial: typedPart.serial_number,
        part_snapshot_type: typedPart.type,
        part_snapshot_photo_url: typedPart.photo_url || null,
        purchase_order_reference: typedPart.purchase_order_reference || null,
      };

      await turso.execute({
        sql: `INSERT INTO controle_part_withdrawals
             (id, created_at, part_id, customer_name, os_number, sale_price, technician_name, authorization_code, approved_password_code, part_snapshot_name, part_snapshot_serial, part_snapshot_type, part_snapshot_photo_url, purchase_order_reference)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          withdrawalRow.id, withdrawalRow.created_at, withdrawalRow.part_id,
          withdrawalRow.customer_name, withdrawalRow.os_number, withdrawalRow.sale_price,
          withdrawalRow.technician_name, withdrawalRow.authorization_code,
          withdrawalRow.approved_password_code, withdrawalRow.part_snapshot_name,
          withdrawalRow.part_snapshot_serial, withdrawalRow.part_snapshot_type,
          withdrawalRow.part_snapshot_photo_url, withdrawalRow.purchase_order_reference,
        ],
      });

      const updateRes = await turso.execute({
        sql: `UPDATE controle_parts SET
             status = 'retirada',
             updated_at = ?,
             withdrawn_at = ?,
             withdrawn_customer_name = ?,
             withdrawn_os_number = ?,
             withdrawn_sale_price = ?,
             withdrawn_technician_name = ?,
             withdrawn_authorization_code = ?
             WHERE id = ? AND status = 'disponivel'`,
        args: [
          withdrawnAt, withdrawnAt, payload.customerName.trim(), payload.osNumber.trim(),
          Number(payload.salePrice || 0), payload.technicianName.trim(),
          payload.authorizationCode.trim(), typedPart.id,
        ],
      });

      if ((updateRes as any).rowsAffected === 0) {
        await turso.execute({
          sql: 'DELETE FROM controle_part_withdrawals WHERE id = ?',
          args: [withdrawalId],
        });
        throw new Error("Nao foi possivel atualizar o estoque da peca.");
      }

      const updatedPartRes = await turso.execute({
        sql: `SELECT ${PART_COLUMNS} FROM controle_parts WHERE id = ? LIMIT 1`,
        args: [typedPart.id],
      });
      const updatedPart = updatedPartRes.rows.length > 0
        ? mapPartRow(updatedPartRes.rows[0])
        : typedPart;

      return {
        withdrawal: mapWithdrawalRow(withdrawalRow),
        part: updatedPart,
      };
    } catch (e) {
      if ((e as any).message && (e as any).message.includes("Turso")) {
        // já logado, tenta fallback Supabase abaixo
      } else {
        throw e;
      }
      console.warn('[controle:createControleWithdrawal] Turso error, trying Supabase:', (e as any).message);
    }
  }

  try {
    if (!hasAdmin) throw new Error("Sem backend disponível.");

    const { data: part, error: partError } = await supabaseAdmin
      .from("controle_parts")
      .select(PART_COLUMNS)
      .eq("id", payload.partId)
      .single();

    if (partError || !part) {
      throw new Error("Peca nao encontrada.");
    }

    const typedPart = mapPartRow(part);

    if (typedPart.status !== "disponivel") {
      throw new Error("Essa peca nao esta mais disponivel para retirada.");
    }

    const { data: withdrawal, error: withdrawalError } = await supabaseAdmin
      .from("controle_part_withdrawals")
      .insert({
        part_id: typedPart.id,
        customer_name: payload.customerName.trim(),
        os_number: payload.osNumber.trim(),
        sale_price: payload.salePrice,
        technician_name: payload.technicianName.trim(),
        authorization_code: payload.authorizationCode.trim(),
        approved_password_code: approvedPasswordCode,
        part_snapshot_name: typedPart.full_name,
        part_snapshot_serial: typedPart.serial_number,
        part_snapshot_type: typedPart.type,
        part_snapshot_photo_url: typedPart.photo_url || null,
        purchase_order_reference: typedPart.purchase_order_reference || null,
      })
      .select(WITHDRAWAL_COLUMNS)
      .single();

    if (withdrawalError || !withdrawal) {
      throw new Error(`Nao foi possivel registrar a retirada: ${withdrawalError?.message ?? "erro desconhecido"}`);
    }

    const { data: updatedPart, error: updateError } = await supabaseAdmin
      .from("controle_parts")
      .update({
        status: "retirada",
        updated_at: withdrawnAt,
        withdrawn_at: withdrawnAt,
        withdrawn_customer_name: payload.customerName.trim(),
        withdrawn_os_number: payload.osNumber.trim(),
        withdrawn_sale_price: payload.salePrice,
        withdrawn_technician_name: payload.technicianName.trim(),
        withdrawn_authorization_code: payload.authorizationCode.trim(),
      })
      .eq("id", typedPart.id)
      .eq("status", "disponivel")
      .select(PART_COLUMNS)
      .single();

    if (updateError || !updatedPart) {
      await supabaseAdmin.from("controle_part_withdrawals").delete().eq("id", (withdrawal as any).id);
      throw new Error("Nao foi possivel atualizar o estoque da peca.");
    }

    return {
      withdrawal: mapWithdrawalRow(withdrawal),
      part: mapPartRow(updatedPart),
    };
  } catch (e) {
    throw new Error(`Nao foi possivel registrar a retirada: ${(e as any).message ?? "erro desconhecido"}`);
  }
}
