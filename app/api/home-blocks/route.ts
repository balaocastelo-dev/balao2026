
import { NextResponse } from "next/server";
import { getHomeBlocks, createHomeBlock } from "@/lib/db";

export async function GET() {
  const blocks = await getHomeBlocks(false); // Fetch all, including inactive for admin
  return NextResponse.json(blocks);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newBlock = await createHomeBlock(body);
    return NextResponse.json(newBlock);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create home block" }, { status: 500 });
  }
}
