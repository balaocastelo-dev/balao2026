import { getCachedFileirasDaPagina, getCachedQuedasDePreco } from "@/lib/cache";
import { listarResumos } from "@/lib/blog/repositorio";
import type { ArtigoResumido } from "@/lib/blog/tipos";
import type { Product } from "@/lib/utils";
import { escolherArtigosDaPagina, escolherPaginasVizinhas } from "./rede";
import { temFoto, type FileiraPronta } from "./vitrine";
import type { PaginaDeCaptacao, RegraDeVitrine } from "./tipos";
import { PAGINAS } from "./paginas";

export type DadosDaPagina = {
  /** Fileiras de cada seção "vitrine", na ordem das seções. */
  fileiras: FileiraPronta<Product>[][];
  quedas: Product[];
  artigos: ArtigoResumido[];
  vizinhas: PaginaDeCaptacao[];
};

/** Tudo o que a página lê de fora do próprio arquivo de conteúdo, em paralelo. */
export async function carregarDadosDaPagina(pagina: PaginaDeCaptacao): Promise<DadosDaPagina> {
  const regrasPorSecao: RegraDeVitrine[][] = pagina.secoes.flatMap((s) => (s.tipo === "vitrine" ? [s.regras] : []));
  const querQuedas = pagina.secoes.some((s) => s.tipo === "quedas");

  const [fileiras, quedas, resumos] = await Promise.all([
    Promise.all(
      regrasPorSecao.map((regras, i) =>
        getCachedFileirasDaPagina(`${pagina.slug}#${i}`, regras).catch(() => [] as FileiraPronta<Product>[])
      )
    ),
    querQuedas ? getCachedQuedasDePreco().catch(() => [] as Product[]) : Promise.resolve([] as Product[]),
    listarResumos({ tolerante: true }).catch(() => [] as ArtigoResumido[]),
  ]);

  return {
    fileiras,
    quedas: quedas.filter(temFoto),
    artigos: escolherArtigosDaPagina(pagina, resumos, 3),
    vizinhas: escolherPaginasVizinhas(pagina, Object.values(PAGINAS), 4),
  };
}
