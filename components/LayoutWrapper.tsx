'use client';

import { usePathname } from "next/navigation";
import { SidebarProvider } from "@/context/SidebarContext";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import type { Category } from "@/lib/utils";

export default function LayoutWrapper({ 
  children, 
  categories 
}: { 
  children: React.ReactNode; 
  categories: Category[] 
}) {
  const pathname = usePathname();
  const isRoletaPage = pathname === "/roleta";

  return (
    <SidebarProvider>
      {!isRoletaPage && <Sidebar categories={categories} mobileOnly />}
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow">
          {children}
        </main>
        {!isRoletaPage && <Footer />}
        {!isRoletaPage && <FloatingWhatsApp />}
      </div>
    </SidebarProvider>
  );
}
