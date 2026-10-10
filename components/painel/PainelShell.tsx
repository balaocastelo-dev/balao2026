"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ExternalLink, LogOut, Menu, Search, Store, X } from "lucide-react";
import {
  INICIO_DO_PAINEL,
  MENU_DO_PAINEL,
  grupoDoItem,
  itemDoCaminho,
  type ItemDoPainel,
} from "@/lib/painel/menu";

// ============================================================
// A moldura do painel: menu à esquerda, a área escolhida à direita.
//
// Antes cada área administrativa tinha o próprio endereço, o próprio menu e,
// em alguns casos, a própria senha (ou nenhuma). Aqui tudo passa por uma
// porta só: quem entrou no /painel alcança qualquer área pelo menu, e volta
// para ele de qualquer tela.
// ============================================================

/** Sem acento e em minúsculas, para a busca achar "preco" em "Preços". */
function semAcento(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

function LinkDoMenu({
  item,
  ativo,
  aoEscolher,
}: {
  item: ItemDoPainel;
  ativo: boolean;
  aoEscolher: () => void;
}) {
  const Icone = item.icone;
  const classe = `group relative flex items-center gap-3 rounded-lg py-2 pl-3 pr-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-white/70 ${
    ativo
      ? "bg-white/10 font-semibold text-white"
      : "text-slate-300 hover:bg-white/5 hover:text-white"
  }`;
  const conteudo = (
    <>
      {ativo ? (
        <span aria-hidden className="absolute inset-y-1.5 left-0 w-[3px] rounded-full bg-[#E60012]" />
      ) : null}
      <Icone size={17} className={ativo ? "text-white" : "text-slate-400 group-hover:text-slate-200"} />
      <span className="min-w-0 flex-1 truncate">{item.rotulo}</span>
      {item.fora ? <ExternalLink size={13} className="shrink-0 text-slate-500" aria-hidden /> : null}
    </>
  );

  if (item.fora) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className={classe}
        title={`${item.descricao} Abre em outra aba.`}
        onClick={aoEscolher}
      >
        {conteudo}
      </a>
    );
  }

  return (
    // Sem pré-carregar: são quase trinta áreas, e pré-carregar todas a cada
    // abertura do painel seria gastar servidor (e cota do banco) à toa.
    <Link
      href={item.href}
      prefetch={false}
      className={classe}
      title={item.descricao}
      aria-current={ativo ? "page" : undefined}
      onClick={aoEscolher}
    >
      {conteudo}
    </Link>
  );
}

function Navegacao({
  atual,
  aoEscolher,
}: {
  atual: ItemDoPainel | null;
  aoEscolher: () => void;
}) {
  const router = useRouter();
  const [busca, setBusca] = useState("");

  const grupos = useMemo(() => {
    // Cada palavra digitada precisa aparecer em algum lugar do item: no nome,
    // na descrição, no grupo ou nas palavras de busca ("cupom" acha "Cupons").
    const termos = semAcento(busca).split(/\s+/).filter(Boolean);
    if (termos.length === 0) return MENU_DO_PAINEL;
    return MENU_DO_PAINEL.map((g) => ({
      ...g,
      itens: g.itens.filter((i) => {
        const texto = semAcento(`${i.rotulo} ${i.descricao} ${g.rotulo} ${i.palavras || ""}`);
        return termos.every((t) => texto.includes(t));
      }),
    })).filter((g) => g.itens.length > 0);
  }, [busca]);

  const primeiro = busca.trim() ? grupos[0]?.itens[0] : undefined;

  return (
    <>
      <form
        role="search"
        className="px-3 pb-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!primeiro) return;
          if (primeiro.fora) window.open(primeiro.href, "_blank", "noopener");
          else router.push(primeiro.href);
          setBusca("");
          aoEscolher();
        }}
      >
        <label className="relative block">
          <span className="sr-only">Buscar no painel</span>
          <Search
            size={15}
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar no painel"
            className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-white/40"
          />
        </label>
      </form>

      <nav aria-label="Áreas do painel" className="flex-1 overflow-y-auto px-3 pb-4">
        {!busca.trim() ? (
          <div className="mb-3">
            <LinkDoMenu
              item={INICIO_DO_PAINEL}
              ativo={atual?.href === INICIO_DO_PAINEL.href}
              aoEscolher={aoEscolher}
            />
          </div>
        ) : null}

        {grupos.map((grupo) => (
          <div key={grupo.chave} className="mb-3">
            <p className="px-3 pb-1 pt-2 text-xs font-medium text-slate-500">{grupo.rotulo}</p>
            <div className="space-y-0.5">
              {grupo.itens.map((item) => (
                <LinkDoMenu
                  key={item.href}
                  item={item}
                  ativo={atual?.href === item.href}
                  aoEscolher={aoEscolher}
                />
              ))}
            </div>
          </div>
        ))}

        {grupos.length === 0 ? (
          <p className="px-3 py-4 text-sm text-slate-400">
            Nada com “{busca.trim()}”. Tente o nome da área, como “cupom” ou “pedido”.
          </p>
        ) : null}
      </nav>
    </>
  );
}

function Marca() {
  return (
    <Link
      href="/painel"
      prefetch={false}
      className="flex items-center gap-3 rounded-lg px-3 py-3 outline-none focus-visible:ring-2 focus-visible:ring-white/70"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white p-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="" className="max-h-full max-w-full object-contain" />
      </span>
      <span className="min-w-0 leading-tight">
        <span className="block truncate text-sm font-bold text-white">Painel do Balão</span>
        <span className="block truncate text-xs text-slate-400">Administração da loja</span>
      </span>
    </Link>
  );
}

function Rodape({ aoSair, saindo }: { aoSair: () => void; saindo: boolean }) {
  return (
    <div className="shrink-0 space-y-1 border-t border-white/10 p-3">
      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 outline-none transition-colors hover:bg-white/5 hover:text-white focus-visible:ring-2 focus-visible:ring-white/70"
      >
        <Store size={17} className="text-slate-400" />
        Ver a loja
      </a>
      <button
        type="button"
        onClick={aoSair}
        disabled={saindo}
        className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-slate-300 outline-none transition-colors hover:bg-white/5 hover:text-white focus-visible:ring-2 focus-visible:ring-white/70 disabled:cursor-wait disabled:opacity-60"
      >
        <LogOut size={17} className="text-slate-400" />
        {saindo ? "Saindo…" : "Sair do painel"}
      </button>
    </div>
  );
}

export default function PainelShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const atual = itemDoCaminho(pathname);
  const grupo = grupoDoItem(atual);
  const [gavetaAberta, setGavetaAberta] = useState(false);
  const [saindo, setSaindo] = useState(false);
  const areaRef = useRef<HTMLDivElement | null>(null);

  // Trocou de área: a nova começa do topo. (A gaveta do celular fecha no
  // próprio toque que escolheu a área.)
  useEffect(() => {
    areaRef.current?.scrollTo({ top: 0 });
  }, [pathname]);

  // O nome da área na aba do navegador. Boa parte das telas é montada só no
  // navegador e não consegue declarar o próprio título; com várias abas do
  // painel abertas, "Painel" em todas não ajuda ninguém a achar a certa.
  useEffect(() => {
    if (!atual || atual.href === "/painel") return;
    document.title = `${atual.rotulo} | Painel do Balão`;
  }, [atual, pathname]);

  // Esc fecha a gaveta, como em qualquer tela sobreposta.
  useEffect(() => {
    if (!gavetaAberta) return;
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") setGavetaAberta(false);
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [gavetaAberta]);

  const sair = async () => {
    setSaindo(true);
    try {
      await fetch("/api/painel/logout", { method: "POST" });
    } catch {
      // Mesmo sem resposta do servidor, volta para a tela de senha.
    }
    window.location.href = "/painel";
  };

  const moldura = atual?.moldura === "folha" ? "folha" : "livre";

  return (
    <div className="flex h-full w-full bg-slate-100 text-gray-900 print:block print:h-auto print:bg-white">
      {/* Menu fixo, no computador */}
      <aside className="hidden w-64 shrink-0 flex-col bg-[#0f172a] print:hidden lg:flex">
        <div className="shrink-0 p-2">
          <Marca />
        </div>
        <Navegacao atual={atual} aoEscolher={() => {}} />
        <Rodape aoSair={sair} saindo={saindo} />
      </aside>

      {/* Gaveta, no celular */}
      {gavetaAberta ? (
        <div className="fixed inset-0 z-50 flex print:hidden lg:hidden" role="dialog" aria-modal="true" aria-label="Menu do painel">
          <div className="flex w-[19rem] max-w-[85vw] flex-col bg-[#0f172a] shadow-2xl">
            <div className="flex shrink-0 items-center justify-between p-2">
              <Marca />
              <button
                type="button"
                onClick={() => setGavetaAberta(false)}
                className="mr-1 cursor-pointer rounded-lg p-2 text-slate-300 outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/70"
                aria-label="Fechar o menu"
              >
                <X size={20} />
              </button>
            </div>
            <Navegacao atual={atual} aoEscolher={() => setGavetaAberta(false)} />
            <Rodape aoSair={sair} saindo={saindo} />
          </div>
          <button
            type="button"
            className="flex-1 cursor-default bg-black/60"
            aria-label="Fechar o menu"
            onClick={() => setGavetaAberta(false)}
          />
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col print:block">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-3 print:hidden sm:px-5">
          <button
            type="button"
            onClick={() => setGavetaAberta(true)}
            className="cursor-pointer rounded-lg p-2 text-slate-700 outline-none hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-[#E60012] lg:hidden"
            aria-label="Abrir o menu do painel"
          >
            <Menu size={20} />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm">
              {grupo ? <span className="text-slate-500">{grupo.rotulo} / </span> : null}
              <span className="font-semibold text-slate-900">{atual?.rotulo || "Painel"}</span>
            </p>
            {atual ? (
              <p className="hidden truncate text-xs text-slate-500 sm:block">{atual.descricao}</p>
            ) : null}
          </div>
        </header>

        <div
          ref={areaRef}
          className="admin-panel min-h-0 flex-1 overflow-y-auto overflow-x-hidden print:overflow-visible"
        >
          {moldura === "folha" ? (
            <div className="mx-auto w-full max-w-7xl p-3 sm:p-5 lg:p-6">
              <div className="min-h-[60vh] rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
                {children}
              </div>
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
}
