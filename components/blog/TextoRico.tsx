import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { lerTextoRico, prenderUnidades, type Trecho } from "@/lib/blog/texto";

/**
 * Desenha o texto com marcação mínima (**negrito**, *itálico*, [link](url)).
 * Link para a própria loja usa a navegação do Next; link para fora abre em
 * outra aba e não repassa a origem.
 */
function desenhar(trechos: Trecho[], prefixo: string): ReactNode[] {
  return trechos.map((t, i) => {
    const chave = `${prefixo}${i}`;
    if (t.tipo === "texto") return <Fragment key={chave}>{prenderUnidades(t.valor)}</Fragment>;
    if (t.tipo === "negrito") return <strong key={chave}>{desenhar(t.filhos, `${chave}-`)}</strong>;
    if (t.tipo === "italico") return <em key={chave}>{desenhar(t.filhos, `${chave}-`)}</em>;

    const filhos = desenhar(t.filhos, `${chave}-`);
    if (t.href.startsWith("/")) {
      return (
        <Link key={chave} href={t.href} className="b-link" prefetch={false}>
          {filhos}
        </Link>
      );
    }
    if (t.href.startsWith("#")) {
      return (
        <a key={chave} href={t.href} className="b-link">
          {filhos}
        </a>
      );
    }
    return (
      <a key={chave} href={t.href} className="b-link" target="_blank" rel="noopener noreferrer">
        {filhos}
      </a>
    );
  });
}

export default function TextoRico({ texto }: { texto: string }) {
  return <>{desenhar(lerTextoRico(texto), "t")}</>;
}
