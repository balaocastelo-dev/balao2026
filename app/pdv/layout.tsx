"use client";

import React from "react";
import { PdvProvider } from "./store";
import { LogOut, User } from "lucide-react";

export default function PdvLayout({ children }: { children: React.ReactNode }) {
  return (
    <PdvProvider>
      <div className="min-h-screen bg-gray-100 text-gray-900 font-sans antialiased">
        <header className="sticky top-0 z-50 flex items-center justify-between gap-3 bg-red-600 px-3 py-3 shadow-lg md:px-6">
          <div className="flex min-w-0 items-center gap-3 md:gap-4">
            <div className="rounded bg-white p-1 shadow-sm">
               {/* eslint-disable-next-line @next/next/no-img-element */}
               <img src="/logo.png" alt="Balão da Informática" className="h-7 w-auto object-contain md:h-8" />
            </div>
            <div className="flex min-w-0 flex-col">
              <h1 className="truncate text-base font-bold leading-tight text-white md:text-lg">
                PDV <span className="opacity-80 font-normal">Balão</span>
              </h1>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-green-400"></span>
                <span className="text-[10px] font-medium uppercase tracking-wide text-white/90">
                  Sistema Online
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-6">
            <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-white/90 md:flex">
              <User size={16} />
              <span className="text-sm font-medium">Operador: <strong>Admin</strong></span>
            </div>
            <button
              className="flex items-center gap-2 rounded-full p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              title="Sair do PDV"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>
        <main className="mx-auto min-h-[calc(100vh-64px)] max-w-[1920px] overflow-x-hidden p-3 md:h-[calc(100vh-64px)] md:overflow-hidden md:p-6">
          {children}
        </main>
      </div>
    </PdvProvider>
  );
}
