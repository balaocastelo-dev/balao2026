import type { PaginaDeCaptacao } from "../tipos";
import { assistenciagames } from "./assistenciagames";
import { carregadores } from "./carregadores";
import { comoComprar } from "./como-comprar";
import { consignacao } from "./consignacao";
import { envioEEntrega } from "./envio-e-entrega";
import { manutencao } from "./manutencao";
import { microsoft } from "./microsoft";
import { montagempc } from "./montagempc";
import { notebooks } from "./notebooks";
import { pcgamer } from "./pcgamer";
import { pcgamer3d } from "./pcgamer3d";
import { promocao } from "./promocao";
import { recuperacaodados } from "./recuperacaodados";
import { reparoapple } from "./reparoapple";
import { sistemas } from "./sistemas";
import { sobreAEmpresa } from "./sobre-a-empresa";
import { sobreNos } from "./sobre-nos";
import { telaiphone } from "./telaiphone";
import { tonner } from "./tonner";
import { trocasEDevolucoes } from "./trocas-e-devolucoes";
import { wendellApple } from "./wendell-apple";

/**
 * Todas as páginas de captação, por endereço. A /servicos-e-ofertas ficou de
 * fora: outra conversa a refez no mesmo dia (PR #60, lib/servicos-e-ofertas/). É daqui que sai a rede de links
 * ("Também resolvemos") e o mapa do site; cada `app/<slug>/page.tsx` lê a sua.
 * Página nova: crie o arquivo de conteúdo, acrescente aqui e no teste.
 */
export const PAGINAS: Record<string, PaginaDeCaptacao> = Object.fromEntries(
  [
    manutencao,
    recuperacaodados,
    reparoapple,
    telaiphone,
    wendellApple,
    assistenciagames,
    montagempc,
    pcgamer,
    pcgamer3d,
    notebooks,
    carregadores,
    tonner,
    microsoft,
    consignacao,
    sistemas,
    promocao,
    envioEEntrega,
    trocasEDevolucoes,
    comoComprar,
    sobreAEmpresa,
    sobreNos,
  ].map((p) => [p.slug, p])
);

export function urlDaPagina(slug: string): string {
  return `https://www.balao.info/${slug}`;
}

export function paginaPorSlug(slug: string): PaginaDeCaptacao {
  const pagina = PAGINAS[slug];
  if (!pagina) throw new Error(`Página de captação sem conteúdo: ${slug}`);
  return pagina;
}
