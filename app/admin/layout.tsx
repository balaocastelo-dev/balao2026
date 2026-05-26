"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, CheckCircle, Upload, Layout, Layers, ShoppingBag, Settings, Mail } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const tabs = [
    { name: "Importação em Massa", href: "/admin/importacao", icon: Upload },
    { name: "Gerenciar Carrossel", href: "/admin/carrossel", icon: Layout },
    { name: "Gerenciar Categorias", href: "/admin/categorias", icon: Layers },
    { name: "Gerenciar Pedidos", href: "/admin/pedidos", icon: ShoppingBag },
    { name: "Gerenciar Produtos", href: "/admin/produtos", icon: Settings },
    { name: "Blocos da Home", href: "/admin/home-blocks", icon: Layout },
    { name: "Marketing & E-mail", href: "/admin/marketing", icon: Mail },
    { name: "Cupons", href: "/admin/cupons", icon: Settings },
    { name: "Barra (TopBar)", href: "/admin/barra", icon: Layout },
    { name: "Fechamento Assistência", href: "https://www.balao.info/fechamento", icon: CheckCircle },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Top Bar */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
             <div className="flex items-center gap-4">
                <Link href="/" className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-xl font-bold text-gray-800">Painel Administrativo</h1>
             </div>
             <div className="flex gap-2">
                 <Link
                   href="/fechamento"
                   className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-[#E60012] text-white text-sm font-medium hover:bg-red-700 transition-colors"
                   title="Ir para Fechamento"
                 >
                   <CheckCircle size={16} />
                   Fechamento
                 </Link>
             </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar Navigation (Tabs) */}
            <aside className="w-full lg:w-64 flex-shrink-0">
                <nav className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col">
                    {tabs.map((tab) => {
                        const isActive = pathname === tab.href;
                        return (
                            <Link
                                key={tab.href}
                                href={tab.href}
                                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${isActive ? "bg-red-50 text-[#E60012] border-l-4 border-[#E60012]" : "text-gray-600 hover:bg-gray-50"}`}
                            >
                                <tab.icon size={18} />
                                {tab.name}
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Content Area */}
            <div className="flex-1">
                <div className="bg-white rounded-lg shadow-sm p-6 min-h-[500px]">
                    {children}
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}
