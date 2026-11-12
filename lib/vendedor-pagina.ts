import { cookies } from "next/headers";
import { VENDEDOR_COOKIE_NAME } from "@/lib/vendedor-auth";
import { listarVendedoresDoCrm } from "@/lib/vendedor-remoto";
import { lerSessaoVendedor } from "@/lib/vendedor-sessao";
import { acharPorSlug, slugReservado } from "@/lib/vendedor-slug";
import { getVendedorPorSlug } from "@/lib/vendedores";

// ============================================================
// Quem é o vendedor deste endereço, sem PIN no resultado.
//
// A lista viva vem do CRM. Se o servidor do WhatsApp não responder,
// os vendedores que já têm página no código continuam abrindo a tela
// de PIN — um nome novo, que só existe no CRM, precisa do servidor.
// ============================================================

export type VendedorDaPagina = {
  id: string;
  slug: string;
  nome: string;
  cargo: string;
  assinatura: string;
};

function doCodigo(slug: string): VendedorDaPagina | null {
  const fixo = getVendedorPorSlug(slug);
  if (!fixo) return null;
  return {
    id: fixo.id,
    slug: fixo.slug,
    nome: fixo.nome,
    cargo: fixo.cargo,
    assinatura: fixo.assinatura,
  };
}

export async function resolverVendedor(slugBruto: string): Promise<VendedorDaPagina | null> {
  const slug = String(slugBruto || "").trim().toLowerCase();
  if (!/^[a-z0-9]{1,80}$/.test(slug) || slugReservado(slug)) return null;

  const remotos = await listarVendedoresDoCrm();
  if (remotos) {
    const achado = acharPorSlug(remotos, slug);
    if (!achado) return null;
    return {
      id: String(achado.id),
      slug: achado.slug,
      nome: achado.nome,
      cargo: String(achado.cargo ?? ""),
      assinatura: String(achado.assinatura ?? ""),
    };
  }

  return doCodigo(slug);
}

export async function vendedorAutenticadoNaPagina(vendedor: VendedorDaPagina): Promise<boolean> {
  const store = await cookies();
  const sessao = lerSessaoVendedor(store.get(VENDEDOR_COOKIE_NAME)?.value);
  if (!sessao) return false;
  return sessao.slug === vendedor.slug && sessao.id === vendedor.id;
}
