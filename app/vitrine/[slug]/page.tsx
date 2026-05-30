import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { getVitrinePageBySlug } from "@/lib/vitrine/db";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await props.params;
  const page = await getVitrinePageBySlug(slug).catch(() => null);
  if (!page) return {};

  const title = `${page.nome_pc} | Balão da Informática`;
  const description =
    `Conheça o ${page.nome_pc} com ${page.processador || "processador moderno"}, ${page.placa_video || "placa de vídeo dedicada"}, ${page.memoria_ram || "memória rápida"}, ${page.armazenamento || "armazenamento rápido"} e ${page.sistema_operacional || "sistema atualizado"}.`;
  const canonical = `https://www.balao.info/p/${page.slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: "website" },
    robots: { index: true, follow: true },
  };
}

export default async function VitrineSlugRedirectPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const page = await getVitrinePageBySlug(slug);
  if (!page) redirect("/vitrine");
  redirect(`/p/${page.slug}`);
}
