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
  const isPaginaVendedor = slugsVendedores.some(
    (slug) => pathname === `/${slug}`
  );
  // Página de vendas dos sistemas: tem cabeçalho, rodapé e barra de compra
  // próprios. O menu, o rodapé da loja e o botão flutuante de WhatsApp
  // competiriam com o único botão que importa ali.
  const isPaginaDeVendas = pathname === "/sistemasdeia" || pathname === "/macbookm5";
  // O painel inteiro (/painel e tudo embaixo dele) é tela de trabalho: tem o
  // próprio menu e rola por dentro, sem o rodapé nem o botão da loja.
  const isPainel = pathname === "/painel" || pathname.startsWith("/painel/");
  const isFullscreenPanel =
    isCrmPage ||
    isPaginaVendedor ||
    pathname === "/whatsapp" ||
    isPainel;

  return (
    <SidebarProvider>
      {/* O blog também recebe o menu da loja: sem ele, o botão de menu do
          cabeçalho não abria nada no celular e o leitor não tinha como ir do
          artigo para as categorias. */}
      {!isRoletaPage && !isFullscreenPanel && !isPaginaDeVendas && (
        // O menu lê os filtros da URL; dentro do Suspense, só ele espera o
        // navegador — o resto da página continua saindo pronto do servidor.
        <Suspense fallback={null}>
          <Sidebar categories={categories} mobileOnly />
        </Suspense>
      )}
      <div
        className={
          isFullscreenPanel
            ? // Altura fixa e sem overflow: a tela de atendimento manda no
              // viewport inteiro e não gera aquela segunda barra de rolagem.
              // Na impressão (relatório do painel) a altura fixa cortaria tudo
              // depois da primeira folha.
              // No painel a altura acompanha a parte visível da tela (dvh):
              // no celular, 100vh inclui o trecho escondido atrás da barra do
              // navegador, e o fim do menu ficava fora de alcance.
              `flex h-screen w-full max-w-full flex-col overflow-hidden print:h-auto print:overflow-visible ${
                isPainel ? "supports-[height:100dvh]:h-dvh" : ""
              }`
            : `flex min-h-screen w-full max-w-full flex-col ${isBlogPage ? "overflow-x-clip" : "overflow-x-hidden"}`
        }
      >
        <main
          className={
            isFullscreenPanel
              ? "flex-1 w-full max-w-full overflow-hidden print:overflow-visible"
              : // No blog o corte lateral é "clip": com "hidden" o navegador
                // trata o bloco como área de rolagem, e aí nada fica preso ao
                // topo — nem o filtro da lista, nem o sumário do artigo.
                `flex-grow w-full max-w-full ${isBlogPage ? "overflow-x-clip" : "overflow-x-hidden"}`
          }
        >
          {children}
        </main>
        {!isRoletaPage && !isFullscreenPanel && !isPaginaDeVendas && <Footer />}
      </div>
      {!isFullscreenPanel && !isPaginaDeVendas && <FloatingWhatsApp />}
    </SidebarProvider>
  );
}
