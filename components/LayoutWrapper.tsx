'use client';

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { SidebarProvider } from "@/context/SidebarContext";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import type { Category } from "@/lib/utils";

export default function LayoutWrapper({
  children,
  categories,
  slugsVendedores = [],
}: {
  children: React.ReactNode;
  categories: Category[];
  /**
   * Slugs das páginas pessoais de atendimento (/brendon, /thiago…), vindos do
   * servidor para não duplicar a lista aqui. São telas de trabalho: rodapé
   * institucional, menu e botão de WhatsApp só roubam espaço de quem passa o
   * dia respondendo cliente.
   */
  slugsVendedores?: string[];
}) {
  const pathname = usePathname();
  const isRoletaPage = pathname === "/roleta";
  const isBlogPage = pathname === "/blog" || pathname.startsWith("/blog/");
  const isCrmPage = pathname === "/crm" || pathname.startsWith("/crm");
  const isPaginaVendedor =
    slugsVendedores.some((slug) => pathname === `/${slug}`) ||
    // Vendedores criados pelo dashboard entram por /equipe/<slug>. Sem isto
    // eles ganhariam o rodapé institucional no meio do atendimento, que é
    // justamente o que essas telas não podem ter.
    pathname.startsWith("/equipe/");
  const isFullscreenPanel =
    isCrmPage ||
    isPaginaVendedor ||
    pathname === "/whatsapp" ||
    pathname === "/painel";

  return (
    <SidebarProvider>
      {/* O Sidebar usa `useSearchParams()`, e em página estática isso faz o
          Next desistir de renderizar no servidor. Sem este Suspense próprio, a
          desistência levava junto TODO o `{children}` abaixo — 24 páginas
          chegavam ao Google com 10 palavras e nenhum <h1>, com o conteúdo só
          dentro do JavaScript. Isolado aqui, só o menu lateral cai para o
          navegador; o conteúdo da página continua vindo pronto do servidor. */}
      {!isRoletaPage && !isBlogPage && !isFullscreenPanel && (
        <Suspense fallback={null}>
          <Sidebar categories={categories} mobileOnly />
        </Suspense>
      )}
      <div
        className={
          isFullscreenPanel
            ? // Altura fixa e sem overflow: a tela de atendimento manda no
              // viewport inteiro e não gera aquela segunda barra de rolagem.
              "flex h-screen w-full max-w-full flex-col overflow-hidden"
            : "flex min-h-screen w-full max-w-full flex-col overflow-x-hidden"
        }
      >
        <main
          className={
            isFullscreenPanel
              ? "flex-1 w-full max-w-full overflow-hidden"
              : "flex-grow w-full max-w-full overflow-x-hidden"
          }
        >
          {children}
        </main>
        {!isRoletaPage && !isFullscreenPanel && <Footer />}
      </div>
      {!isFullscreenPanel && <FloatingWhatsApp />}
    </SidebarProvider>
  );
}
