"use client";

import { useId, useMemo, useState } from "react";
import estilos from "../overclock.module.css";
import { FORMAS_DE_PAGAMENTO } from "../_dados/oferta";
import { calcular, lerValorDigitado, reais } from "../_dados/calculo";

const ATALHOS = [1000, 3000, 5000];

function meses(n: number | null) {
  if (n === null) return "não se paga só com anúncio";
  if (n > 60) return "mais de 5 anos";
  return n === 1 ? "1 mês" : `${n} meses`;
}

function formatarCampo(n: number) {
  return n > 0 ? Math.round(n).toLocaleString("pt-BR") : "";
}

export default function Calculadora() {
  const idGasto = useId();
  const idManter = useId();
  const [gasto, setGasto] = useState("3.000");
  const [manter, setManter] = useState("200");

  const resultado = useMemo(
    () => calcular(lerValorDigitado(gasto), lerValorDigitado(manter), FORMAS_DE_PAGAMENTO),
    [gasto, manter],
  );
  const valorGasto = lerValorDigitado(gasto);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12">
      <div className="space-y-7">
        <div>
          <label htmlFor={idGasto} className="block text-lg font-bold">
            Quanto você gasta por mês com anúncio?
          </label>
          <p className="mt-1 text-base text-(--oc-suave)">Some Google, Instagram e Facebook.</p>
          <div className="mt-3 flex items-center rounded-xl border-2 border-(--oc-linha) bg-(--oc-fundo) focus-within:border-(--oc-laranja)">
            <span className="pl-4 text-xl font-bold text-(--oc-suave)" aria-hidden>
              R$
            </span>
            <input
              id={idGasto}
              inputMode="numeric"
              autoComplete="off"
              value={gasto}
              onChange={(e) => setGasto(e.target.value)}
              onBlur={() => setGasto(formatarCampo(lerValorDigitado(gasto)))}
              className={`${estilos.numero} w-full bg-transparent px-3 py-3 text-3xl text-(--oc-texto) outline-none`}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {ATALHOS.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setGasto(formatarCampo(v))}
                aria-pressed={valorGasto === v}
                className={`min-h-12 rounded-lg border-2 px-4 text-base font-bold transition-colors ${
                  valorGasto === v
                    ? "border-(--oc-laranja) bg-(--oc-laranja) text-(--oc-fundo)"
                    : "border-(--oc-linha) text-(--oc-texto) hover:border-(--oc-suave)"
                }`}
              >
                {reais(v)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor={idManter} className="block text-lg font-bold">
            Quanto vai custar manter o sistema por mês?
          </label>
          <p className="mt-1 text-base text-(--oc-suave)">
            Veja a tabela “Quanto custa manter” acima. Deixamos R$ 200 para começar.
          </p>
          <div className="mt-3 flex items-center rounded-xl border-2 border-(--oc-linha) bg-(--oc-fundo) focus-within:border-(--oc-laranja)">
            <span className="pl-4 text-xl font-bold text-(--oc-suave)" aria-hidden>
              R$
            </span>
            <input
              id={idManter}
              inputMode="numeric"
              autoComplete="off"
              value={manter}
              onChange={(e) => setManter(e.target.value)}
              onBlur={() => setManter(formatarCampo(lerValorDigitado(manter)) || "0")}
              className={`${estilos.numero} w-full bg-transparent px-3 py-3 text-2xl text-(--oc-texto) outline-none`}
            />
          </div>
        </div>
      </div>

      <div aria-live="polite" className="rounded-2xl border border-(--oc-linha) bg-(--oc-fundo) p-5 sm:p-7">
        {resultado.sobraPorMes > 0 ? (
          <>
            <p className="text-lg">
              Sem anúncio, sobram{" "}
              <strong className={`${estilos.numero} text-2xl text-(--oc-verde)`}>
                {reais(resultado.sobraPorMes)}
              </strong>{" "}
              por mês, já descontado o custo de manter.
            </p>
            <p className="mt-2 text-base text-(--oc-suave)">
              Em 12 meses, {reais(resultado.semAnuncio12)} deixam de ir para anúncio. Em 24 meses,{" "}
              {reais(resultado.semAnuncio24)}.
            </p>

            <ul className="mt-6 divide-y divide-(--oc-linha) border-y border-(--oc-linha)">
              {resultado.formas.map((f) => (
                <li key={f.id} className="grid grid-cols-2 gap-x-4 gap-y-1 py-4 sm:grid-cols-[1.2fr_1fr_1fr]">
                  <p className="col-span-2 font-bold sm:col-span-1">
                    {f.nome}
                    <span className="block text-base font-normal text-(--oc-suave)">
                      total R$ {f.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </p>
                  <p>
                    <span className="block text-sm text-(--oc-suave)">Se paga em</span>
                    <span className={`${estilos.numero} text-xl`}>{meses(f.mesesParaPagar)}</span>
                  </p>
                  <p>
                    <span className="block text-sm text-(--oc-suave)">Saldo em 24 meses</span>
                    <span
                      className={`${estilos.numero} text-xl ${f.saldo24 >= 0 ? "text-(--oc-verde)" : "text-(--oc-laranja-claro)"}`}
                    >
                      {reais(f.saldo24)}
                    </span>
                  </p>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-(--oc-suave)">
              Saldo em 24 meses: o anúncio que você deixou de pagar, menos o custo de manter e menos o que já
              pagou do Overclock nesse tempo.
            </p>
          </>
        ) : (
          <p className="text-lg">
            Com esse valor, a conta não fecha só com o anúncio que você deixaria de pagar. O Overclock ainda
            entrega a loja virtual, o WhatsApp da equipe e a assistência, mas a decisão vai além desta conta.
          </p>
        )}
        <p className="mt-5 text-sm text-(--oc-suave)">
          Conta ilustrativa: supõe que você deixe de pagar anúncio, como a Balão da Informática fez. Não é
          promessa de venda nem de faturamento. Cada loja tem seu resultado.
        </p>
      </div>
    </div>
  );
}
