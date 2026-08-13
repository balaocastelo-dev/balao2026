import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
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

function invalidateAllCategoryCaches() {
  try { revalidateTag("categories", "page"); } catch {}
  try { revalidateTag("home-blocks", "page"); } catch {}
  try { revalidatePath("/", "layout"); } catch {}
  try { revalidatePath("/", "page"); } catch {}
  try { revalidatePath("/categoria/[slug]", "page"); } catch {}
  try { revalidatePath("/departamentos", "page"); } catch {}
  try { revalidatePath("/pcgamer", "page"); } catch {}
  try { revalidatePath("/manutencao", "page"); } catch {}
  try { revalidatePath("/blog", "page"); } catch {}
  try { revalidatePath("/vitrine", "page"); } catch {}
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    if (!data.name || !data.slug) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });
    }

    if (typeof data.parent_slug === "string" && data.parent_slug && !data.parent_id) {
      try {
        const all = await getCategories();
        const parent = all.find((c: any) => String(c.slug).toLowerCase() === String(data.parent_slug).toLowerCase());
        if (parent) {
          data.parent_id = (parent as any).id;
        } else {
          return NextResponse.json(
            { error: `Categoria pai não encontrada (parent_slug=${data.parent_slug}). Crie a raiz primeiro.` },
            { status: 404 }
          );
        }
      } catch (e) {
        return NextResponse.json({ error: "Erro ao resolver parent_slug: " + (e as Error)?.message }, { status: 500 });
      }
    }

    const category = await createCategory(data);
    invalidateAllCategoryCaches();
    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create category: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}

