import SafeImage from "@/components/SafeImage";
import { capaGerada } from "@/lib/blog/seo";
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
 * Se o arquivo falhar (capa hospedada fora, por exemplo), entra a capa gerada
 * com o título — o cartão nunca fica com um buraco.
 */
export default function CapaArtigo({ artigo, sizes, prioridade, comTexto, className = "" }: Props) {
  const reserva = capaGerada(artigo);
  return (
    <div
      className={`b-capa ${comTexto ? "b-capa-com-texto" : ""} ${artigo.capa?.pronta ? "b-capa-pronta" : ""} ${className}`}
    >
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
