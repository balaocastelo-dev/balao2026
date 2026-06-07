import { NextRequest, NextResponse } from "next/server";

import {
  CONTROLE_ADMIN_COOKIE,
  isControleAdminSessionValid,
} from "@/lib/controle/auth";

export async function GET(request: NextRequest) {
  const sessionValue = request.cookies.get(CONTROLE_ADMIN_COOKIE)?.value;

  return NextResponse.json({
    authenticated: isControleAdminSessionValid(sessionValue),
  });
}
