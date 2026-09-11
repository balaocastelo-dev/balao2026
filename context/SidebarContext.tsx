"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";

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

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [availableTags, setAvailableTags] = useState<FilterTag[]>([]);
  const pathname = usePathname();

  const toggleSidebar = () => setIsOpen(prev => !prev);
  const closeSidebar = () => setIsOpen(false);

  // Fecha o menu ao trocar de página.
  //
  // Antes isto dependia também de `useSearchParams()`. Este provedor envolve o
  // site inteiro, e esse gancho fazia o Next desistir de renderizar no servidor
  // em toda página estática — o conteúdo de 24 páginas ficava só no JavaScript.
  // Só o caminho basta: trocar apenas o filtro (`?tags=`) não deveria mesmo
  // fechar o menu no meio da escolha.
  useEffect(() => {
    closeSidebar();
  }, [pathname]);

  // Reset tags on route change (optional, but good practice to avoid stale tags)
  // Mas se a nova página tiver tags, o FilterSyncer vai atualizar logo em seguida.
  // Melhor resetar para evitar flash de tags da categoria anterior.
  useEffect(() => {
    setAvailableTags([]);
  }, [pathname]);

  return (
    <SidebarContext.Provider value={{ isOpen, toggleSidebar, closeSidebar, availableTags, setAvailableTags }}>
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
