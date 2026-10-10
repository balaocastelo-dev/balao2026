import type { Metadata } from "next";
import Link from "next/link";
import PaginasDosVendedores from "@/components/painel/PaginasDosVendedores";
import { isPainelConfigurado } from "@/lib/painel-auth";
import { VENDEDORES, temSenhaConfigurada } from "@/lib/vendedores";

export const metadata: Metadata = {
  title: "Usuários e acessos",
};

function Porta({
  titulo,
  quem,
  children,
}: {
  titulo: string;
  quem: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-3">
        <h2 className="text-sm font-bold text-slate-900">{titulo}</h2>
        <p className="mt-0.5 text-sm text-slate-600">{quem}</p>
      </div>
      {children}
    </section>
  );
}

function Linha({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 px-4 py-3 sm:grid-cols-[11rem_1fr] sm:gap-4">
      <dt className="text-sm text-slate-600">{rotulo}</dt>
      <dd className="text-sm text-slate-900">{children}</dd>
    </div>
  );
}

/**
 * Quem entra em quê. O sistema tem três portas, cada uma com a sua senha, e
 * esta tela existe para ninguém precisar lembrar de cabeça qual abre o quê.
 *
 * Só mostra SE uma senha existe — nunca a senha.
 */
export default function PainelUsuariosPage() {
  const vendedores = VENDEDORES.map((v) => ({
    slug: v.slug,
    nome: v.nome,
    cargo: v.cargo,
    temSenha: temSenhaConfigurada(v),
  }));
  const semSenha = vendedores.filter((v) => !v.temSenha).length;
  const temTokenDeAutomacao = Boolean(process.env.ADMIN_API_TOKEN);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-5 p-3 sm:p-5 lg:p-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Usuários e acessos</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-600">
          O sistema tem três portas de entrada. Aqui está quem usa cada uma, o que ela abre e se a
          senha está definida. As senhas em si não aparecem em tela nenhuma.
        </p>
      </div>

      <Porta
        titulo="Administração (este painel)"
        quem="Para quem cuida da loja inteira."
      >
        <dl className="divide-y divide-slate-200">
          <Linha rotulo="Como entra">Em www.balao.info/painel, com a senha do painel.</Linha>
          <Linha rotulo="O que abre">
            Tudo o que está no menu: vendas, produtos e preços, CRM, equipe, Arena, site e
            assistência.
          </Linha>
          <Linha rotulo="Quanto dura">
            12 horas em cada navegador. Depois disso, ou ao clicar em “Sair do painel”, a senha é
            pedida de novo.
          </Linha>
          <Linha rotulo="Situação">
            {isPainelConfigurado() ? "Senha definida." : "Sem senha definida."}
          </Linha>
        </dl>
        <p className="border-t border-slate-200 px-4 py-3 text-sm text-slate-600">
          É uma senha só, sem nome de usuário: quem tem a senha entra como administrador, e o
          sistema não registra qual pessoa fez cada alteração.
        </p>
      </Porta>

      <Porta
        titulo="Vendedores"
        quem="Para quem atende cliente no WhatsApp da loja."
      >
        <dl className="divide-y divide-slate-200">
          <Linha rotulo="Como entra">Cada um na sua página pessoal, com a própria senha.</Linha>
          <Linha rotulo="O que abre">
            Só o atendimento: as conversas, o funil dele e o catálogo para enviar ao cliente. Não
            abre o painel.
          </Linha>
          <Linha rotulo="Quanto dura">30 dias no computador em que entrou.</Linha>
          <Linha rotulo="Situação">
            {semSenha === 0
              ? `Os ${vendedores.length} vendedores estão com senha definida.`
              : `${semSenha} de ${vendedores.length} sem senha definida.`}
          </Linha>
        </dl>
        <div className="border-t border-slate-200">
          <PaginasDosVendedores vendedores={vendedores} />
        </div>
        <p className="border-t border-slate-200 px-4 py-3 text-sm text-slate-600">
          Assinatura e PIN de cada um ficam em{" "}
          <Link
            href="/painel/vendedores"
            prefetch={false}
            className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-2 hover:text-[#E60012]"
          >
            Vendedores
          </Link>
          .
        </p>
      </Porta>

      <Porta
        titulo="Balcão da assistência"
        quem="Para os técnicos, que não têm a senha do painel."
      >
        <dl className="divide-y divide-slate-200">
          <Linha rotulo="Como entra">
            Em www.balao.info/fechamento e www.balao.info/controle/admin, com a senha do dia.
          </Linha>
          <Linha rotulo="O que abre">
            O fechamento da semana e o estoque de peças. Não abre catálogo, pedidos nem CRM.
          </Linha>
          <Linha rotulo="Quanto dura">Até a meia-noite. A senha muda todo dia.</Linha>
          <Linha rotulo="Retirada de peça">
            Além da senha do dia, cada retirada pede um código que muda a cada minuto. Ele aparece
            em{" "}
            <a
              href="/controle/senha"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-2 hover:text-[#E60012]"
            >
              www.balao.info/controle/senha
            </a>
            .
          </Linha>
        </dl>
        <p className="border-t border-slate-200 px-4 py-3 text-sm text-slate-600">
          Quem já entrou no painel abre o fechamento e o estoque de peças pelo menu, sem digitar a
          senha do dia.
        </p>
      </Porta>

      <Porta
        titulo="Como trocar uma senha ou criar um acesso"
        quem="Hoje isso não se faz por dentro do painel."
      >
        <div className="space-y-2 px-4 py-3 text-sm text-slate-700">
          <p>
            A senha do painel e a de cada vendedor ficam guardadas na configuração da hospedagem do
            site, fora do banco de dados. Trocar qualquer uma delas, ou criar a página de um
            vendedor novo, é uma alteração na configuração seguida de uma publicação do site.
          </p>
          <p>
            Acesso por programa (sem navegador):{" "}
            {temTokenDeAutomacao ? "há uma chave de automação definida." : "nenhuma chave de automação definida."}
          </p>
        </div>
      </Porta>
    </div>
  );
}
