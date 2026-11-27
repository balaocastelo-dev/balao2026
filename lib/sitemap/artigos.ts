export type EstadoDoArquivo = "existe" | "ausente" | "incerto";

/**
 * Slugs que o sitemap não deve listar: só os que a fonte confirmou que não
 * existem (404). Rede instável devolve "incerto" e o endereço continua.
 */
export async function slugsAusentes(
  slugs: string[],
  estado: (slug: string) => Promise<EstadoDoArquivo>
): Promise<Set<string>> {
  const mortos = new Set<string>();
  let cursor = 0;
  const lista = slugs.filter(Boolean);

  async function um() {
    while (cursor < lista.length) {
      const slug = lista[cursor++];
      let s: EstadoDoArquivo = "incerto";
      try {
        s = await estado(slug);
      } catch {
        s = "incerto";
      }
      if (s === "ausente") mortos.add(slug);
    }
  }

  const n = Math.min(8, lista.length);
  await Promise.all(Array.from({ length: n }, () => um()));
  return mortos;
}
