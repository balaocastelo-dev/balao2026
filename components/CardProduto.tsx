import Image from "next/image";
import Link from "next/link";
import { getProductHref, parsePriceToNumber, type Product } from "@/lib/utils";

/* Condições comerciais reais da loja, confirmadas pelo Thiago em 13/09/2026.
 * Mudou a política? Muda aqui e vale no site inteiro. */
export const CONDICOES = {
  descontoPixPercentual: 5,
  parcelas: 12,
  parcelasSemJuros: true,
};

const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function CardProduto({ product }: { product: Product }) {
  const href = getProductHref(product);
  const cheio = parsePriceToNumber(product.price);
  const pix = cheio * (1 - CONDICOES.descontoPixPercentual / 100);
  const parcela = cheio / CONDICOES.parcelas;
  const categoria = product.category?.split("/").pop()?.trim() || "";

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white transition hover:-translate-y-0.5 hover:border-[#E60012]/40 hover:shadow-xl">
      <Link href={href} className="relative block aspect-square overflow-hidden bg-white p-4">
        {/* O desconto anunciado é o do PIX, que existe de verdade.
            Preço "de/por" calculado a partir do preço atual é desconto
            inventado — não entra. */}
        <span className="absolute left-3 top-3 z-10 rounded-md bg-[#E60012] px-2 py-1 text-[11px] font-bold leading-none text-white">
          {CONDICOES.descontoPixPercentual}% no PIX
        </span>
        <Image
          src={product.image}
          alt={product.name}
          fill
          unoptimized
          sizes="(max-width: 768px) 50vw, 260px"
          className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
        />
      </Link>

      <div className="flex flex-1 flex-col px-4 pb-4">
        {categoria && (
          <span className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
            {categoria}
          </span>
        )}

        <Link
          href={href}
          className="mt-1 line-clamp-2 text-[13px] font-medium leading-snug text-neutral-800 hover:text-[#E60012]"
          title={product.name}
        >
          {product.name}
        </Link>

        <div className="mt-auto pt-3">
          <p className="text-xl font-extrabold leading-none text-[#E60012]">{brl(pix)}</p>
          <p className="mt-1 text-[11px] text-neutral-500">
            à vista no PIX · {brl(cheio)} no cartão
          </p>
          <p className="mt-0.5 text-[11px] text-neutral-500">
            ou {CONDICOES.parcelas}x de {brl(parcela)}
            {CONDICOES.parcelasSemJuros ? " sem juros" : ""}
          </p>

          <Link
            href={href}
            className="mt-3 flex w-full items-center justify-center rounded-lg bg-[#E60012] px-3 py-2.5 text-sm font-bold text-white transition hover:bg-[#c4000f]"
          >
            Ver produto
          </Link>
        </div>
      </div>
    </article>
  );
}
