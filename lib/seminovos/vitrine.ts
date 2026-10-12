// A leitura do estoque que a página pública usa: guardada por 5 minutos e
// refeita na hora quando o painel muda alguma coisa (revalidateTag).

import { unstable_cache } from "next/cache";
import { lerEstoque, paraVitrine, urlDaFoto } from "./dados";
import type { Seminovo } from "./tipos";

export const TAG_SEMINOVOS = "seminovos";

export type SeminovoPublico = Omit<Seminovo, "fotos"> & { fotos: string[] };

export const getVitrineDeSeminovos = unstable_cache(
  async (): Promise<SeminovoPublico[]> => {
    try {
      return paraVitrine(await lerEstoque()).map((s) => ({ ...s, fotos: s.fotos.map(urlDaFoto) }));
    } catch (e) {
      // Sem a gaveta, a página continua de pé e vira lista de espera.
      console.error("[seminovos] estoque indisponível:", (e as Error).message);
      return [];
    }
  },
  ["seminovos-vitrine-v1"],
  { revalidate: 300, tags: [TAG_SEMINOVOS] },
);
