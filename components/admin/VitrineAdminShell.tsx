"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Boxes,
  Files,
  DollarSign,
  Users,
  BarChart3,
  Settings,
  Sparkles,
  FilePlus2,
  Layers,
  Image as ImageIcon,
  MonitorSmartphone,
  Search,
} from "lucide-react";

export default function VitrineAdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const sideItems: Array<{
    label: string;
    href: string;
    icon: any;
    disabled?: boolean;
  }> = [
    { label: "Gerador de Páginas", href: "/gerador", icon: FilePlus2 },
    { label: "Minhas Páginas", href: "/admin/paginas", icon: Files },
    { label: "Modelos", href: "/gerador?sec=modelos", icon: Layers, disabled: true },
    { label: "Banners", href: "/gerador?sec=banners", icon: ImageIcon, disabled: true },
    { label: "Mídia", href: "/gerador?sec=midia", icon: MonitorSmartphone, disabled: true },
    { label: "Configurações", href: "/gerador?sec=config", icon: Settings, disabled: true },
    { label: "SEO & Analytics", href: "/gerador?sec=seo", icon: BarChart3, disabled: true },
  ];

  const topItems: Array<{ label: string; href: string; icon: any }> = [
    { label: "Dashboard", href: "/gerador", icon: LayoutDashboard },
    { label: "Produtos", href: "/admin/produtos", icon: Boxes },
    { label: "Páginas", href: "/admin/paginas", icon: Files },
    { label: "Vendas", href: "/admin/pedidos", icon: DollarSign },
    { label: "Clientes", href: "/admin/pedidos", icon: Users },
    { label: "Analytics", href: "/gerador", icon: BarChart3 },
    { label: "Configurações", href: "/gerador", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#111111]">
      <div className="flex min-h-screen">
        <aside className="hidden lg:flex w-72 flex-col border-r border-black/5 bg-white">
          <div className="h-16 px-6 flex items-center border-b border-black/5">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-[#d71920] text-white flex items-center justify-center shadow-sm">
                <Sparkles size={18} />
              </div>
              <div className="leading-tight">
                <div className="font-extrabold tracking-tight">Balão da Informática</div>
                <div className="text-xs text-[#333333]">Gerador de Páginas Exclusivas</div>
              </div>
            </div>
          </div>

          <div className="p-4">
            <div className="relative mb-3">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-black/10 bg-[#f5f5f5] text-sm focus:outline-none focus:ring-2 focus:ring-[#d71920]/30"
                placeholder="Buscar..."
                disabled
              />
            </div>

            <nav className="space-y-1">
              {sideItems.map((item) => {
                const isActive = pathname === item.href;
                const base =
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-colors";
                const active = "bg-[#d71920]/10 text-[#d71920]";
                const idle = "text-[#333333] hover:bg-black/5";
                const disabled = "opacity-50 cursor-not-allowed";
                const cls = `${base} ${isActive ? active : idle} ${item.disabled ? disabled : ""}`;

                return item.disabled ? (
                  <div key={item.href} className={cls} aria-disabled="true">
                    <item.icon size={18} />
                    <span>{item.label}</span>
                  </div>
                ) : (
                  <Link key={item.href} href={item.href} className={cls}>
                    <item.icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto p-4 border-t border-black/5">
            <Link
              href="/vitrine"
              className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg bg-[#111111] text-white font-semibold text-sm hover:bg-black transition-colors"
            >
              Visualizar Vitrine
            </Link>
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 bg-white border-b border-black/5 flex items-center px-4 sm:px-6">
            <div className="flex-1 flex items-center gap-2 overflow-x-auto">
              {topItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
                      isActive ? "bg-[#d71920]/10 text-[#d71920]" : "text-[#333333] hover:bg-black/5"
                    }`}
                  >
                    <item.icon size={16} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

