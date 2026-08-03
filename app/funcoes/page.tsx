import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PainelLoginForm from "@/components/PainelLoginForm";
import PainelLogoutButton from "@/components/PainelLogoutButton";
import { FUNCOES_CATALOG, FUNCOES_TOTAL } from "@/lib/funcoes-catalog";
import { isPainelAuthenticated } from "@/lib/painel-auth";

export const metadata: Metadata = {
  title: "Funcoes",
  description: "Central protegida com atalhos para as funcoes do site.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function FuncoesPage() {
  const authenticated = await isPainelAuthenticated();

  if (!authenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.25),_transparent_35%)]" />
        <div className="relative z-10 flex w-full max-w-5xl flex-col items-center gap-10 lg:flex-row lg:items-start">
          <div className="max-w-xl text-white">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-blue-300">
              www.balao.info/funcoes
            </p>
            <h2 className="text-4xl font-bold leading-tight">
              Central protegida com atalhos para todas as funcoes e paginas do site.
            </h2>
            <p className="mt-4 text-base text-slate-300">
              Entre com a senha para abrir a lista completa de areas comerciais, operacionais,
              administrativas e institucionais.
            </p>
          </div>
          <PainelLoginForm
            redirectTo="/funcoes"
            badgeLabel="Funcoes Protegidas"
            title="Acesso as funcoes"
            description="Entre com a senha 56676009 para abrir a central interna em /funcoes."
            submitLabel="Entrar nas funcoes"
          />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.22),_transparent_42%)]">
        <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-300">
                Central de Funcoes
              </p>
              <h1 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
                Todos os atalhos do site em um lugar
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-300">
                Esta pagina reune as funcoes listadas do site com card, imagem, nome,
                explicacao e link direto para acesso rapido.
              </p>
              <div className="mt-6 flex flex-wrap gap-3 text-sm">
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                  {FUNCOES_TOTAL} atalhos mapeados
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                  {FUNCOES_CATALOG.length} grupos de funcoes
                </span>
              </div>
            </div>
            <PainelLogoutButton redirectTo="/funcoes" label="Sair da central" />
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {FUNCOES_CATALOG.map((category) => (
              <a
                key={category.slug}
                href={`#${category.slug}`}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-blue-400/40 hover:bg-blue-500/10"
              >
                {category.title}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-12">
        <div className="space-y-12">
          {FUNCOES_CATALOG.map((category) => (
            <section key={category.slug} id={category.slug} className="scroll-mt-24">
              <div className="mb-6 flex flex-col gap-2">
                <h2 className="text-2xl font-black text-white md:text-3xl">{category.title}</h2>
                <p className="max-w-3xl text-slate-400">{category.description}</p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {category.items.map((item) => (
                  <Link
                    key={`${category.slug}-${item.href}`}
                    href={item.href}
                    className="group overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 shadow-[0_10px_40px_rgba(0,0,0,0.18)] transition hover:-translate-y-1 hover:border-blue-400/40 hover:bg-slate-900"
                  >
                    <div className="relative h-44 overflow-hidden bg-slate-800">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover transition duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                      <div className="absolute bottom-4 left-4 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-blue-200">
                        Atalho
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                        {item.href}
                      </div>
                      <h3 className="text-2xl font-black text-white">{item.title}</h3>
                      <p className="mt-3 min-h-[72px] text-sm leading-relaxed text-slate-300">
                        {item.description}
                      </p>
                      <div className="mt-5 inline-flex items-center rounded-full bg-blue-600 px-4 py-2 text-sm font-bold text-white transition group-hover:bg-blue-500">
                        Abrir funcao
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}
