import { NextResponse } from "next/server";
import { createCategory, getCategories } from "@/lib/db";
import { getCachedCategories, invalidarCacheCategorias } from "@/lib/cache";

export const dynamic = 'force-dynamic';

// A leitura passa pelo cache do Next. Não é detalhe: o CRM busca as categorias
// toda vez que um vendedor abre o painel, e o banco da Hostinger aceita 500
// conexões por HORA. Com seis vendedores recarregando a tela, só isso já
// mordia um pedaço da cota — e quando ela estoura, o catálogo some do site
// inteiro até a hora virar.
export async function GET(request: Request) {
  try {
    // `origem=banco`: lê o banco direto, sem cache e sem a cópia da VPS. É por
    // aqui que a VPS busca as categorias para espelhar — pela rota normal, um
    // dia de cota estourada faria o espelho gravar a própria cópia de volta.
    if (new URL(request.url).searchParams.get("origem") === "banco") {
      return NextResponse.json(await getCategories());
    }

    const categories = await getCachedCategories();
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
    // Sem isto, a categoria nova só apareceria no menu e no CRM depois de
    // cinco minutos.
    invalidarCacheCategorias();
    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
