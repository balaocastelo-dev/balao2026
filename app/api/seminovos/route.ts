import { NextResponse } from "next/server";
import { getUsedNotebooks, createUsedNotebook } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const items = await getUsedNotebooks();
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const created = await createUsedNotebook(body);
    return NextResponse.json(created);
  } catch (error) {
    console.error("Failed to create used notebook:", error);
    return NextResponse.json(
      { error: "Failed to create used notebook" },
      { status: 500 }
    );
  }
}

