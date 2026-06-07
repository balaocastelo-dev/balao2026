import { NextRequest, NextResponse } from "next/server";

import { isRotatingApprovalPasswordValid } from "@/lib/controle/auth";
import { createControleWithdrawal } from "@/lib/controle/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const partId = String(body?.partId ?? "").trim();
    const customerName = String(body?.customerName ?? "").trim();
    const osNumber = String(body?.osNumber ?? "").trim();
    const salePrice = Number(body?.salePrice ?? 0);
    const technicianName = String(body?.technicianName ?? "").trim();
    const authorizationCode = String(body?.authorizationCode ?? "").trim();
    const approvalPassword = String(body?.approvalPassword ?? "").trim();

    if (
      !partId ||
      !customerName ||
      !osNumber ||
      !technicianName ||
      !authorizationCode ||
      !approvalPassword ||
      !Number.isFinite(salePrice) ||
      salePrice < 0
    ) {
      return NextResponse.json(
        { error: "Preencha todos os dados obrigatorios da retirada." },
        { status: 400 },
      );
    }

    if (!isRotatingApprovalPasswordValid(approvalPassword)) {
      return NextResponse.json(
        { error: "Senha dinamica invalida ou expirada." },
        { status: 401 },
      );
    }

    const receipt = await createControleWithdrawal(
      {
        partId,
        customerName,
        osNumber,
        salePrice,
        technicianName,
        authorizationCode,
        approvalPassword,
      },
      approvalPassword,
    );

    return NextResponse.json({ receipt }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Nao foi possivel concluir a retirada da peca.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
