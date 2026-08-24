import { NextResponse } from "next/server";
import { replaceCategoriesFromPaths } from "@/lib/db";

export const dynamic = 'force-dynamic';

// Substitui toda a árvore de categorias pelos caminhos reais dos produtos que
// acabaram de ser importados. É chamado pela tela de importação a cada novo
// catálogo — categorias antigas que não correspondem mais a nenhum produto
// não devem sobreviver.
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const paths = Array.isArray(data?.paths) ? data.paths.filter((p: unknown) => typeof p === "string" && p.trim()) : [];
    await replaceCategoriesFromPaths(paths);
    return NextResponse.json({ success: true, count: paths.length });
  } catch (error) {
    console.error("Error rebuilding categories:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
