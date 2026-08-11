import { NextResponse, NextRequest } from "next/server";
import { updateCategory, deleteCategory } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const data = await request.json();
    console.log(`[API] Updating category ${params.id} with data:`, data);
    await updateCategory(params.id, data);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[API] Update category failed:", error);
    return NextResponse.json({ error: error.message || "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    await deleteCategory(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
