import Link from "next/link";
import { NIVEIS, VRAM_MINIMA, type NivelDeIA } from "@/lib/catalogo/ia-local";

const plural = (n: number) => (n === 1 ? "1 máquina" : `${n} máquinas`);

/**
 * A régua de memória de vídeo: mostra, em escala, onde a categoria começa
 * (12 GB) e o que cabe em cada faixa — com quantas máquinas a loja tem em
 * cada uma hoje.
 */
export default function ReguaDeMemoria({
  totais,
  comLinks = false,
}: {
  totais: Record<NivelDeIA, number>;
  /** Liga cada faixa à lista filtrada em /ia-local. */
  comLinks?: boolean;
}) {
  return (
    <figure className="prm-regua">
      <figcaption className="prm-regua__titulo">Memória da placa de vídeo, em escala</figcaption>

      <div className="prm-regua__barra" aria-hidden="true">
        <span className="prm-regua__trecho prm-regua__trecho--fora" />
        <span className={`prm-regua__trecho ${totais["vram-12"] ? "prm-regua__trecho--12" : "prm-regua__trecho--vazio"}`} />
        <span className={`prm-regua__trecho ${totais["vram-16"] ? "prm-regua__trecho--16" : "prm-regua__trecho--vazio"}`} />
        <span className={`prm-regua__trecho ${totais["vram-24"] ? "" : "prm-regua__trecho--vazio"}`} />
      </div>
      <div className="prm-regua__marcas" aria-hidden="true">
        <span>0</span>
        <span>12 GB</span>
        <span>16 GB</span>
        <span>
          <span>24 GB</span>
          <span>32 GB</span>
        </span>
      </div>

      <ul className="prm-niveis">
        <li data-vazio="true">
          <span className="prm-niveis__nome">Menos de {VRAM_MINIMA} GB</span>
          <p>Fora da categoria. Rodam modelos pequenos, mas o limite chega cedo.</p>
        </li>
        {[...NIVEIS]
          .filter((n) => n.id !== "apple")
          .reverse()
          .map((nivel) => {
            const total = totais[nivel.id];
            return (
              <li key={nivel.id} data-vazio={total === 0}>
                <span className="prm-niveis__nome">
                  {comLinks && total > 0 ? <Link href={`/ia-local?nivel=${nivel.id}#maquinas`}>{nivel.titulo}</Link> : nivel.titulo}
                  <span className="prm-niveis__total">{total > 0 ? plural(total) : "nenhuma pronta hoje"}</span>
                </span>
                <p>{nivel.cabe}</p>
              </li>
            );
          })}
        {(() => {
          const apple = NIVEIS.find((n) => n.id === "apple")!;
          const total = totais.apple;
          if (total === 0) return null;
          return (
            <li>
              <span className="prm-niveis__nome">
                {comLinks ? <Link href="/ia-local?nivel=apple#maquinas">{apple.titulo}</Link> : apple.titulo}
                <span className="prm-niveis__total">{plural(total)}</span>
              </span>
              <p>{apple.cabe}</p>
            </li>
          );
        })()}
      </ul>
    </figure>
  );
}
