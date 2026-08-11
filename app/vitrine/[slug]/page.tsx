import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function VitrineSlugPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  redirect(`/p/${slug}`);
}
