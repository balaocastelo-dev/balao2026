import Image from "next/image";
import Link from "next/link";
import type { MaquinaDeVitrine } from "@/lib/catalogo/vitrine-premium";
import Preco from "./Preco";

const SEM_DADO = "Consulte a ficha";

/** "16 GB" e "2 TB" não se separam do número na quebra de linha. */
export const semQuebra = (texto: string) => texto.replace(/(\d) (GB|TB)\b/g, "$1\u00a0$2");

/**
 * Uma máquina na lista: foto, o que ela é, a ficha em quatro colunas e o
 * preço. A linha inteira leva para a página do produto.
 */
export default function LinhaDeMaquina({ maquina }: { maquina: MaquinaDeVitrine }) {
  return (
    <Link href={maquina.href} className="prm-linha">
      <span className="prm-linha__foto">
        {maquina.imagem ? (
          <Image src={maquina.imagem} alt={maquina.nome} fill sizes="(min-width: 64rem) 136px, 88px" unoptimized />
        ) : null}
      </span>

      <span className="prm-linha__nome">
        <span className="prm-linha__tipo">{maquina.tipo}</span>
        <span className="prm-linha__titulo">{maquina.titulo}</span>
      </span>

      <dl className="prm-linha__dados">
        <div>
          <dt>Processador</dt>
          <dd>{maquina.processador || SEM_DADO}</dd>
        </div>
        <div>
          <dt>Placa de vídeo</dt>
          <dd>{maquina.placa ? semQuebra(maquina.placa) : "Integrada"}</dd>
        </div>
        <div>
          <dt>Memória</dt>
          <dd>{maquina.memoria ? semQuebra(maquina.memoria) : SEM_DADO}</dd>
        </div>
        <div>
          <dt>Armazenamento</dt>
          <dd>{maquina.armazenamento ? semQuebra(maquina.armazenamento) : SEM_DADO}</dd>
        </div>
      </dl>

      <span className="prm-linha__preco">
        <Preco maquina={maquina} />
        <span className="prm-botao prm-botao--contorno prm-linha__ver">Ver máquina</span>
      </span>
    </Link>
  );
}
