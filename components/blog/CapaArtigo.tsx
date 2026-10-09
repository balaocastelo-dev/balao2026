import SafeImage from "@/components/SafeImage";
import { fundoGerado } from "@/lib/blog/seo";
import type { ArtigoResumido } from "@/lib/blog/tipos";

type Props = {
  artigo: Pick<ArtigoResumido, "capa" | "titulo" | "categoria" | "slug">;
  sizes: string;
  /** Capa do topo da página: carrega antes do resto. */
  prioridade?: boolean;
  /** Escurece a base para receber título por cima. */
  comTexto?: boolean;
  className?: string;
};

/**
 * A capa de um artigo, sempre com o mesmo tratamento de imagem.
 * Artigo sem foto recebe a capa desenhada para ele; e se o arquivo de uma
 * foto falhar (capa hospedada fora, por exemplo), a desenhada entra no lugar —
 * o cartão nunca fica com um buraco.
 */
export default function CapaArtigo({ artigo, sizes, prioridade, comTexto, className = "" }: Props) {
  const reserva = fundoGerado(artigo);
  // A capa desenhada já está nas cores do blog, como as feitas à mão.
  const pronta = artigo.capa ? artigo.capa.pronta : true;
  return (
    <div className={`b-capa ${comTexto ? "b-capa-com-texto" : ""} ${pronta ? "b-capa-pronta" : ""} ${className}`}>
      <SafeImage
        src={artigo.capa?.src ?? reserva}
        fallbackSrc={reserva}
        // Quando o título está logo ao lado, repetir o texto no alt só faz o
        // leitor de tela dizer a mesma frase duas vezes.
        alt={comTexto ? "" : (artigo.capa?.alt ?? "")}
        fill
        sizes={sizes}
        priority={prioridade}
      />
    </div>
  );
}
