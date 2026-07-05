"use client";

import { ChevronDown } from "lucide-react";
import { ReactNode } from "react";

interface SeoContentProps {
  title: string;
  children: ReactNode;
}

export default function SeoContent({ title, children }: SeoContentProps) {
  return (
    <section className="mt-8 border-t border-[var(--home-border)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <details className="group">
          <summary className="home-card flex cursor-pointer list-none items-center justify-between rounded-[1.6rem] p-4 shadow-sm transition-colors hover:border-[var(--home-border-strong)]">
            <h2 className="m-0 text-lg font-bold text-[var(--home-text)]">{title}</h2>
            <ChevronDown className="h-5 w-5 text-[var(--home-muted)] transition-transform duration-300 group-open:rotate-180" />
          </summary>
          <div className="prose prose-blue mt-4 max-w-none rounded-[1.6rem] border border-[var(--home-border)] bg-[var(--home-card-bg)] px-4 py-5 text-[var(--home-text)] animate-in fade-in slide-in-from-top-2 duration-300">
            {children}
          </div>
        </details>
      </div>
    </section>
  );
}
