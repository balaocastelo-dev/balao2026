"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
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

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [availableTags, setAvailableTags] = useState<FilterTag[]>([]);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const toggleSidebar = () => setIsOpen(prev => !prev);
  const closeSidebar = () => setIsOpen(false);

  // Close sidebar on route change
  useEffect(() => {
    closeSidebar();
  }, [pathname, searchParams]);

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
