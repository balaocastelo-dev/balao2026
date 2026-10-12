// Seminovos à venda, em JSON (para a JUL.IA, o CRM e quem mais precisar).
//
// Até 12/10/2026 esta rota lia a tabela `used_notebooks` do MySQL (que nunca
// teve aparelho) e tinha POST/PUT/DELETE sem tela nenhuma que os usasse. Agora
// o estoque é cadastrado em /painel/seminovos e aqui é só leitura. (O proxy
// continua exigindo a senha do painel para qualquer escrita em /api/seminovos,
// menos o /lead, que é o formulário do cliente.)

import { NextResponse } from "next/server";
import { getVitrineDeSeminovos } from "@/lib/seminovos/vitrine";
import { nomeDoAparelho } from "@/lib/seminovos/tipos";

export const revalidate = 300;

export async function GET() {
  const itens = await getVitrineDeSeminovos();
  return NextResponse.json(
    itens.map((s) => ({
      ...s,
      nome: nomeDoAparelho(s),
      fotos: s.fotos.map((f) => `https://www.balao.info${f}`),
      link: `https://www.balao.info/seminovos#aparelho-${s.id}`,
    })),
  );
}

const fechado = () => NextResponse.json({ error: "Cadastro de seminovos é feito em /painel/seminovos." }, { status: 405 });
export const POST = fechado;
export const PUT = fechado;
export const DELETE = fechado;
