import Link from "next/link";
import { ExternalLink } from "lucide-react";
import AgoraNaLoja from "@/components/painel/AgoraNaLoja";
import SessaoVencida from "@/components/painel/SessaoVencida";
import { MENU_DO_PAINEL } from "@/lib/painel/menu";
import { isPainelAuthenticated } from "@/lib/painel-auth";

/**
 * O Início do painel: como a loja está agora, e o caminho para cada área.
 *
 * A lista de áreas vem do mesmo mapa que monta o menu (lib/painel/menu.ts),
 * então nada aparece num lugar e falta no outro.
 */
export default async function PainelInicioPage() {
  // Só acontece quando a sessão vence com o painel aberto (ver SessaoVencida):
  // numa abertura normal, a porta do painel responde antes desta página.
  if (!(await isPainelAuthenticated())) return <SessaoVencida />;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-3 sm:p-5 lg:p-6">
      <AgoraNaLoja />

      <section aria-labelledby="areas-do-painel">
        <h2 id="areas-do-painel" className="px-1 text-base font-bold text-slate-900">
          Todas as áreas
        </h2>

        <div className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {MENU_DO_PAINEL.map((grupo) => (
            <div key={grupo.chave} className="rounded-xl border border-slate-200 bg-white">
              <h3 className="border-b border-slate-200 px-4 py-3 text-sm font-bold text-slate-900">
                {grupo.rotulo}
              </h3>
              <ul className="p-1">
                {grupo.itens.map((item) => {
                  const Icone = item.icone;
                  const classe =
                    "group flex items-start gap-3 rounded-lg px-3 py-2.5 outline-none transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-[#E60012]";
                  const conteudo = (
                    <>
                      <Icone
                        size={18}
                        aria-hidden
                        className="mt-0.5 shrink-0 text-slate-500 group-hover:text-[#E60012]"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                          {item.rotulo}
                          {item.fora ? (
                            <ExternalLink size={12} aria-hidden className="text-slate-400" />
                          ) : null}
                        </span>
                        <span className="mt-0.5 block text-sm text-slate-600">
                          {item.descricao}
                          {item.fora ? " Abre em outra aba." : ""}
                        </span>
                      </span>
                    </>
                  );

                  return (
                    <li key={item.href}>
                      {item.fora ? (
                        <a href={item.href} target="_blank" rel="noopener noreferrer" className={classe}>
                          {conteudo}
                        </a>
                      ) : (
                        <Link href={item.href} prefetch={false} className={classe}>
                          {conteudo}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
