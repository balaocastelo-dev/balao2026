import { NextResponse, NextRequest } from "next/server";
import { updateUsedNotebook, deleteUsedNotebook } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const updates = await request.json();
    const notebook = await updateUsedNotebook(params.id, updates);
    return NextResponse.json(notebook);
  } catch (error) {
    console.error("Failed to update used notebook:", error);
    return NextResponse.json(
      { error: "Failed to update used notebook" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    await deleteUsedNotebook(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete used notebook:", error);
    return NextResponse.json(
      { error: "Failed to delete used notebook" },
      { status: 500 }
    );
  }
}

