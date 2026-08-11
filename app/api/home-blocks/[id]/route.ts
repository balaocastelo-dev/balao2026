
import { NextResponse, NextRequest } from "next/server";
import { updateHomeBlock, deleteHomeBlock } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const updates = await request.json();
    const updatedBlock = await updateHomeBlock(params.id, updates);
    return NextResponse.json(updatedBlock);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update home block" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    await deleteHomeBlock(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete home block" }, { status: 500 });
  }
}
