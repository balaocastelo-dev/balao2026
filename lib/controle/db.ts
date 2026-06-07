import { hasAdmin, supabaseAdmin } from "@/lib/supabase-admin";

import type {
  ControlePart,
  ControlePartInput,
  ControleReceiptData,
  ControleWithdrawalInput,
  ControleWithdrawalRecord,
} from "@/lib/controle/types";

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

function getAdmin() {
  if (!hasAdmin) {
    throw new Error("Supabase admin nao configurado.");
  }

  return supabaseAdmin;
}

export async function listPublicControleParts(): Promise<ControlePart[]> {
  if (!hasAdmin) return [];

  const admin = getAdmin();
  const { data, error } = await admin
    .from("controle_parts")
    .select(PART_COLUMNS)
    .eq("status", "disponivel")
    .order("type", { ascending: true })
    .order("full_name", { ascending: true });

  if (error) {
    console.error("Erro ao listar pecas publicas:", error);
    return [];
  }

  return (data ?? []) as ControlePart[];
}

export async function listAdminControleParts(): Promise<ControlePart[]> {
  const admin = getAdmin();
  const { data, error } = await admin
    .from("controle_parts")
    .select(PART_COLUMNS)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Erro ao listar pecas: ${error.message}`);
  }

  return (data ?? []) as ControlePart[];
}

export async function createControlePart(payload: ControlePartInput): Promise<ControlePart> {
  const admin = getAdmin();

  const { data, error } = await admin
    .from("controle_parts")
    .insert({
      type: payload.type,
      full_name: payload.fullName.trim(),
      serial_number: payload.serialNumber.trim(),
      purchase_order_reference: payload.purchaseOrderReference.trim(),
      photo_url: payload.photoUrl.trim(),
      notes: payload.notes?.trim() || null,
      status: "disponivel",
    })
    .select(PART_COLUMNS)
    .single();

  if (error || !data) {
    throw new Error(`Erro ao cadastrar peca: ${error?.message ?? "desconhecido"}`);
  }

  return data as ControlePart;
}

export async function createControleWithdrawal(
  payload: ControleWithdrawalInput,
  approvedPasswordCode: string,
): Promise<ControleReceiptData> {
  const admin = getAdmin();

  const { data: part, error: partError } = await admin
    .from("controle_parts")
    .select(PART_COLUMNS)
    .eq("id", payload.partId)
    .single();

  if (partError || !part) {
    throw new Error("Peca nao encontrada.");
  }

  const typedPart = part as ControlePart;

  if (typedPart.status !== "disponivel") {
    throw new Error("Essa peca nao esta mais disponivel para retirada.");
  }

  const { data: withdrawal, error: withdrawalError } = await admin
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
      part_snapshot_photo_url: typedPart.photo_url,
      purchase_order_reference: typedPart.purchase_order_reference,
    })
    .select(WITHDRAWAL_COLUMNS)
    .single();

  if (withdrawalError || !withdrawal) {
    throw new Error(`Nao foi possivel registrar a retirada: ${withdrawalError?.message ?? "erro desconhecido"}`);
  }

  const withdrawnAt = new Date().toISOString();
  const { data: updatedPart, error: updateError } = await admin
    .from("controle_parts")
    .update({
      status: "retirada",
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
    await admin.from("controle_part_withdrawals").delete().eq("id", withdrawal.id);
    throw new Error("Nao foi possivel atualizar o estoque da peca.");
  }

  return {
    withdrawal: withdrawal as ControleWithdrawalRecord,
    part: updatedPart as ControlePart,
  };
}
