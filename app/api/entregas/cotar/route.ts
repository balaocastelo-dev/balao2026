import { NextResponse } from "next/server";
import { cotarEntrega, modoAtual } from "@/lib/entregas/registro";

// Cotação do motoboy da 99 para o carrinho (pública: o cliente ainda não tem conta).
//
// `noCarrinho` diz se a opção pode aparecer para o cliente. Fica desligada até
// a Vercel ter ENTREGA99_NO_CARRINHO=1 — e só faz sentido ligar com a API real
// (ENTREGA99_TOKEN), para o cliente nunca pagar um frete simulado.

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as {
    cep?: unknown;
    numero?: unknown;
    rua?: unknown;
    bairro?: unknown;
    cidade?: unknown;
    uf?: unknown;
    valorDosProdutos?: unknown;
  };
  const cep = String(b.cep ?? "");
  const valor = Number(b.valorDosProdutos);
  const resultado = await cotarEntrega({
    destino: {
      cep,
      numero: b.numero ? String(b.numero) : undefined,
      rua: b.rua ? String(b.rua) : undefined,
      bairro: b.bairro ? String(b.bairro) : undefined,
      cidade: b.cidade ? String(b.cidade) : undefined,
      uf: b.uf ? String(b.uf) : undefined,
    },
    valorDosProdutos: Number.isFinite(valor) ? valor : 0,
  });
  const modo = modoAtual();
  return NextResponse.json({
    ...resultado,
    modo,
    noCarrinho: process.env.ENTREGA99_NO_CARRINHO === "1" && modo === "real",
  });
}
