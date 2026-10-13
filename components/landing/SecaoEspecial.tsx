import type { ReactNode } from "react";

/** Moldura de seção para os blocos que só uma página tem (fileiras da /pcgamer, 3D, formulário). */
export default function SecaoEspecial({
  id,
  titulo,
  texto,
  painel = false,
  children,
}: {
  id: string;
  titulo?: string;
  texto?: string;
  painel?: boolean;
  children: ReactNode;
}) {
  return (
    <section id={id} className={`cpt-secao scroll-mt-20${painel ? " cpt-secao--painel" : ""}`} aria-labelledby={titulo ? `${id}-titulo` : undefined}>
      <div className="cpt-miolo">
        {titulo ? (
          <div className="mb-10 max-w-3xl">
            <h2 id={`${id}-titulo`} className="cpt-h2">
              {titulo}
            </h2>
            {texto ? <p className="cpt-corpo mt-4">{texto}</p> : null}
          </div>
        ) : null}
        {children}
      </div>
    </section>
  );
}
