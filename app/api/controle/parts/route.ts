import { NextRequest, NextResponse } from "next/server";

import {
  CONTROLE_ADMIN_COOKIE,
  isControleAdminSessionValid,
} from "@/lib/controle/auth";
import {
  createControlePart,
  listAdminControleParts,
  listPublicControleParts,
} from "@/lib/controle/db";
import { PART_TYPES, type PartType } from "@/lib/controle/types";
import { isPainelAuthenticated } from "@/lib/painel-auth";

function isValidPartType(value: string): value is PartType {
  return PART_TYPES.includes(value as PartType);
}

// Administra o estoque quem entrou com a senha do dia (balcão) ou quem já
// está no painel — a tela abre em /painel/controle sem pedir outra senha.
async function isAdminAuthenticated(request: NextRequest): Promise<boolean> {
  if (isControleAdminSessionValid(request.cookies.get(CONTROLE_ADMIN_COOKIE)?.value)) {
    return true;
  }
  return isPainelAuthenticated();
}

export async function GET(request: NextRequest) {
  try {
    const scope = request.nextUrl.searchParams.get("scope");
    const parts =
      scope === "admin" && (await isAdminAuthenticated(request))
        ? await listAdminControleParts()
        : await listPublicControleParts();

    return NextResponse.json({ parts });
  } catch (error) {
    console.error("Erro ao buscar pecas:", error);
    return NextResponse.json(
      { error: "Nao foi possivel carregar as pecas." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated(request))) {
    return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const type = String(body?.type ?? "").trim();
    const fullName = String(body?.fullName ?? "").trim();
    const serialNumber = String(body?.serialNumber ?? "").trim();
    const purchaseOrderReference = String(body?.purchaseOrderReference ?? "").trim();
    const photoUrl = String(body?.photoUrl ?? "").trim();
    const notes = String(body?.notes ?? "").trim();

    if (
      !fullName ||
      !serialNumber ||
      !purchaseOrderReference ||
      !photoUrl ||
      !isValidPartType(type)
    ) {
      return NextResponse.json(
        { error: "Preencha todos os dados minimos da peca." },
        { status: 400 },
      );
    }

    const part = await createControlePart({
      type,
      fullName,
      serialNumber,
      purchaseOrderReference,
      photoUrl,
      notes,
    });

    return NextResponse.json({ part }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Nao foi possivel salvar a peca.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
