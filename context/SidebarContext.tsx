"use client";

import React, { createContext, useContext, useState, useEffect, Suspense } from "react";
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

function SidebarLogic() {
  const { closeSidebar, setAvailableTags } = useSidebar();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Close sidebar on route change
  useEffect(() => {
    closeSidebar();
  }, [pathname, searchParams, closeSidebar]);

  // Reset tags on route change
  useEffect(() => {
    setAvailableTags([]);
  }, [pathname, setAvailableTags]);

  return null;
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [availableTags, setAvailableTags] = useState<FilterTag[]>([]);

  const toggleSidebar = () => setIsOpen(prev => !prev);
  const closeSidebar = () => setIsOpen(false);

  return (
    <SidebarContext.Provider value={{ isOpen, toggleSidebar, closeSidebar, availableTags, setAvailableTags }}>
      <Suspense fallback={null}>
        <SidebarLogic />
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
