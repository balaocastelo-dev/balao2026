import { NextResponse } from "next/server";
import { getCategories, createCategory } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    if (!data.name || !data.slug) {
        return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });
    }
    const category = await createCategory(data);
    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
