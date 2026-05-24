import { NextResponse } from "next/server";
import { getMasterAgentStatusSnapshot } from "@/lib/ai/master-agent";

export async function GET() {
  const snapshot = getMasterAgentStatusSnapshot();
  return NextResponse.json({ ok: true, ...snapshot }, { headers: { "cache-control": "no-store" } });
}
