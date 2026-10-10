import type { Metadata } from "next";
import PainelLoginForm from "@/components/PainelLoginForm";
import { isPainelAuthenticated } from "@/lib/painel-auth";

export const metadata: Metadata = {
  // As áreas dão só o próprio nome ("Vendedores"); o modelo completa.
  title: { default: "Painel do Balão", template: "%s | Painel do Balão" },
  description: "Administração do Balão da Informática, protegida por senha.",
  robots: {
    index: false,
    follow: false,
  },
};

// A sessão vive em cookie, então nada daqui pode ser guardado como página pronta.
export const dynamic = "force-dynamic";

/**
 * A porta do painel.
 *
 * Tudo o que é administração — vendas, produtos, CRM, equipe, Arena, site —
 * mora embaixo de /painel e passa por aqui. Sem a senha, o que aparece é a
 * tela de entrada, qualquer que seja o endereço pedido; depois de entrar, a
 * pessoa cai na área que tinha tentado abrir.
 */
export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const autenticado = await isPainelAuthenticated();

  if (!autenticado) {
    return (
      <div className="relative h-full overflow-y-auto bg-slate-950">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,_rgba(230,0,18,0.18),_transparent_60%)]"
        />
        <div className="relative z-10 mx-auto flex min-h-full w-full max-w-5xl flex-col items-center justify-center gap-10 px-4 py-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl text-white">
            <p className="mb-3 text-sm font-semibold text-red-300">www.balao.info/painel</p>
            <h2 className="text-3xl font-bold leading-tight sm:text-4xl">
              A administração do Balão em um lugar só.
            </h2>
            <p className="mt-4 text-base text-slate-300">
              Vendas, produtos e preços, CRM, equipe, Arena e o conteúdo do site. Uma senha abre
              tudo.
            </p>
            <p className="mt-3 text-sm text-slate-400">
              É vendedor? Entre pela sua página pessoal (por exemplo,{" "}
              <span className="font-semibold text-slate-200">www.balao.info/brendon</span>) com a
              sua senha.
            </p>
          </div>
          <PainelLoginForm
            redirectTo="atual"
            badgeLabel=""
            title="Entrar no painel"
            description="Digite a senha do painel."
            submitLabel="Entrar"
          />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
