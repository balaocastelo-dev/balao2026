"use client";

import React, { Suspense, createContext, useContext, useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export interface FilterTag {
  name: string;
  count: number;
}

interface SidebarContextType {
  isOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  availableTags: FilterTag[];
  setAvailableTags: (tags: FilterTag[]) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

/**
 * Fecha o menu quando o endereço muda (página ou filtros da URL).
 *
 * Fica num componente à parte, dentro de um Suspense, por um motivo sério:
 * `useSearchParams` chamado direto no provider — que envolve o site inteiro —
 * fazia o Next desistir de montar no servidor TODA página estática. O HTML
 * dessas páginas saía sem conteúdo nenhum, só com o JavaScript que o
 * desenharia depois. Para o Google e para quem compartilha o link, a página
 * chegava vazia. Isolado aqui, só este pedacinho espera o navegador.
 */
function FecharAoNavegar({ fechar }: { fechar: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    fechar();
    // `fechar` muda a cada desenho; o que importa aqui é o endereço.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  return null;
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [availableTags, setAvailableTags] = useState<FilterTag[]>([]);
  const pathname = usePathname();

  const toggleSidebar = () => setIsOpen(prev => !prev);
  const closeSidebar = () => setIsOpen(false);

  // Reset tags on route change (optional, but good practice to avoid stale tags)
  // Mas se a nova página tiver tags, o FilterSyncer vai atualizar logo em seguida.
  // Melhor resetar para evitar flash de tags da categoria anterior.
  useEffect(() => {
    setAvailableTags([]);
  }, [pathname]);

  return (
    <SidebarContext.Provider value={{ isOpen, toggleSidebar, closeSidebar, availableTags, setAvailableTags }}>
      <Suspense fallback={null}>
        <FecharAoNavegar fechar={closeSidebar} />
      </Suspense>
      {children}
    </SidebarContext.Provider>
  );
}

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};
