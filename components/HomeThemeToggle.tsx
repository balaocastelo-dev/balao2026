"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type HomeTheme = "dark" | "light";

const STORAGE_KEY = "balao-home-theme";

export default function HomeThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<HomeTheme>("light");

  useEffect(() => {
    const savedTheme = "light";

    setTheme(savedTheme);
    document.documentElement.setAttribute("data-home-theme", savedTheme);
    window.localStorage.setItem(STORAGE_KEY, savedTheme);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    document.documentElement.setAttribute("data-home-theme", theme);
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [mounted, theme]);

  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(nextTheme)}
      aria-label={`Ativar tema ${nextTheme === "dark" ? "escuro" : "claro"}`}
      title={`Ativar tema ${nextTheme === "dark" ? "escuro" : "claro"}`}
      className="inline-flex items-center gap-2 rounded-full border border-[var(--home-border)] bg-[var(--home-card-bg)] px-3 py-2 text-xs font-black uppercase tracking-[0.2em] text-[var(--home-text)] shadow-[0_14px_34px_rgba(2,6,23,0.16)] transition hover:-translate-y-0.5"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--home-accent-soft)] text-[var(--home-accent)]">
        {theme === "dark" ? <Moon size={16} /> : <Sun size={16} />}
      </span>
      <span className="hidden sm:inline">
        {mounted ? (theme === "dark" ? "Tema escuro" : "Tema claro") : "Tema"}
      </span>
    </button>
  );
}
