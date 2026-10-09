import Link from "next/link";
import CartaoArtigo from "@/components/blog/CartaoArtigo";
import { CabecalhoDaLoja } from "@/components/blog/Moldura";
import { listarResumos } from "@/lib/blog/repositorio";

/**
 * Endereço de artigo que não existe (ou deixou de existir).
 * Em vez de um beco sem saída, mostra o que há para ler.
 */
export default async function ArtigoNaoEncontrado() {
  const recentes = (await listarResumos({ tolerante: true })).slice(0, 3);

  return (
    <>
      <CabecalhoDaLoja />
      <div className="mx-auto w-full max-w-7xl px-4 pb-20 pt-12 sm:px-6 lg:px-8">
        <h1 className="b-titulo text-[2.25rem] text-white sm:text-[3rem]">Este artigo saiu do ar</h1>
        <p className="b-serifa mt-4 max-w-xl text-[1.125rem] leading-[1.6] text-[var(--b-tinta-2)]">
          O endereço pode ter mudado ou o conteúdo foi retirado. Os artigos abaixo são os mais recentes — ou{" "}
          <Link href="/blog" className="b-link">
            veja a lista completa
          </Link>
          .
        </p>
        <div className="b-grade mt-12">
          {recentes.map((r) => (
            <CartaoArtigo key={r.slug} artigo={r} />
          ))}
        </div>
      </div>
    </>
  );
}
