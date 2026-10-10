import { emReais } from "@/lib/catalogo/reais";
import type { MaquinaDeVitrine } from "@/lib/catalogo/vitrine-premium";

/**
 * O preço como está no catálogo: à vista e, quando o cartão custa diferente,
 * o valor do cartão com as parcelas. Nenhum desconto é calculado aqui.
 */
export default function Preco({
  maquina,
  grande = false,
}: {
  maquina: Pick<MaquinaDeVitrine, "valor" | "valorNoCartao" | "parcelas">;
  grande?: boolean;
}) {
  const { valor, valorNoCartao, parcelas } = maquina;
  const como = valorNoCartao
    ? `à vista no PIX, ou ${emReais(valorNoCartao)} no cartão${parcelas ? ` em ${parcelas}` : ""}`
    : parcelas
      ? `à vista, ou em ${parcelas}`
      : "à vista";

  return (
    <div className={`prm-preco${grande ? " prm-preco--grande" : ""}`}>
      <span className="prm-preco__valor">{emReais(valor)}</span>
      <span className="prm-preco__como">{como}</span>
    </div>
  );
}
