import { NextRequest, NextResponse } from "next/server";

import {
  getApprovalPasswordDetails,
  isDailyPasswordValid,
} from "@/lib/controle/auth";

export async function GET(request: NextRequest) {
  const dailyPassword = String(request.headers.get("x-controle-password") ?? "").trim();

  if (!isDailyPasswordValid(dailyPassword)) {
    return NextResponse.json(
      { error: "Senha diaria invalida." },
      { status: 401 },
    );
  }

  return NextResponse.json(getApprovalPasswordDetails());
}
