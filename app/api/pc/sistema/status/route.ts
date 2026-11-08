// PC da loja → site → MEU BLING: o sistema está de pé? (ver lib/pc/porta.ts)
import { NextResponse } from "next/server";
import { portaDoPC, semCache } from "@/lib/pc/porta";
import { statusDoSistema } from "@/lib/pdv/sistema";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(req: Request) {
  const recusa = await portaDoPC(req);
  if (recusa) return recusa;
  return NextResponse.json({ ok: true, sistema: await statusDoSistema() }, { headers: semCache });
}
