import type { ReactNode } from "react";
import { CalendarClock, MessageCircle } from "lucide-react";
import estilos from "../overclock.module.css";
import { LINK_DEMONSTRACAO, LINK_QUERO } from "../_dados/oferta";

export function Secao({
  id,
  titulo,
  intro,
  children,
  fundo = "base",
}: {
  id: string;
  titulo: ReactNode;
  intro?: ReactNode;
  children?: ReactNode;
  fundo?: "base" | "painel";
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-titulo`}
      className={`border-t border-(--oc-linha) px-4 py-16 sm:px-6 md:py-24 ${fundo === "painel" ? "bg-(--oc-painel)" : ""}`}
    >
      <div className="mx-auto max-w-6xl">
        <h2 id={`${id}-titulo`} className={`${estilos.titulo} max-w-4xl text-[2rem] sm:text-[2.6rem] lg:text-[3.1rem]`}>
          {titulo}
        </h2>
        {intro ? <div className={`${estilos.texto} mt-5 text-(--oc-suave)`}>{intro}</div> : null}
        {children ? <div className="mt-10 md:mt-14">{children}</div> : null}
      </div>
    </section>
  );
}

export function BotaoQuero({ className = "" }: { className?: string }) {
  return (
    <a
      href={LINK_QUERO}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex min-h-16 items-center justify-center gap-3 rounded-xl bg-(--oc-laranja) px-4 py-3 text-center text-[1.05rem] leading-tight font-bold text-(--oc-fundo) sm:px-7 sm:text-xl transition-colors hover:bg-(--oc-laranja-claro) ${className}`}
    >
      <MessageCircle className="hidden h-6 w-6 shrink-0 sm:block" aria-hidden />
      Quero o Overclock na minha loja
    </a>
  );
}

export function BotaoDemonstracao({ className = "" }: { className?: string }) {
  return (
    <a
      href={LINK_DEMONSTRACAO}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex min-h-16 items-center justify-center gap-3 rounded-xl border-2 border-(--oc-texto) px-4 py-3 text-center text-[1.05rem] leading-tight font-bold text-(--oc-texto) sm:px-7 sm:text-xl transition-colors hover:bg-(--oc-texto) hover:text-(--oc-fundo) ${className}`}
    >
      <CalendarClock className="h-6 w-6 shrink-0" aria-hidden />
      Agendar demonstração
    </a>
  );
}
