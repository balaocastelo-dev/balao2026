"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  ChevronDown,
  Cpu,
  Keyboard,
  Laptop,
  Monitor,
  Gamepad2,
  HardDrive,
  Wifi,
  CircuitBoard,
  Fan,
  Zap,
  Box,
  MemoryStick,
  Printer,
  Cable,
  Headphones,
  Smartphone,
  Tablet,
  Watch,
  Speaker,
  Key,
  Server,
  RefreshCcw,
  Tag,
  Mouse,
  HeadphonesIcon as _Head,
  type LucideIcon,
} from "lucide-react";
import type { Category } from "@/lib/utils";

const MAP: Record<string, LucideIcon> = {
  Hardware: Cpu,
  hardware: Cpu,
  "Periféricos": Keyboard,
  perifericos: Keyboard,
  Perifericos: Keyboard,
  Notebooks: Laptop,
  notebooks: Laptop,
  Computadores: Monitor,
  computadores: Monitor,
  "PC Gamer": Gamepad2,
  pcgamer: Gamepad2,
  Monitores: Monitor,
  monitores: Monitor,
  Armazenamento: HardDrive,
  SSD: HardDrive,
  "HD e SSD": HardDrive,
  armazenamento: HardDrive,
  Redes: Wifi,
  redes: Wifi,
  "Redes e Roteadores": Wifi,
  "Placas-mãe": CircuitBoard,
  "Placa-Mãe": CircuitBoard,
  "Placas de Vídeo": Monitor,
  Processadores: Cpu,
  Coolers: Fan,
  Fontes: Zap,
  Gabinetes: Box,
  Memorias: MemoryStick,
  "Memória RAM": MemoryStick,
  Impressoras: Printer,
  Cabos: Cable,
  Acessorios: Headphones,
  "Acessórios": Headphones,
  Games: Gamepad2,
  Consoles: Gamepad2,
  Celulares: Smartphone,
  Smartphones: Smartphone,
  Tablets: Tablet,
  Smartwatches: Watch,
  "Fones de Ouvido": Headphones,
  Audio: Speaker,
  Áudio: Speaker,
  Tonners: Printer,
  Impressao: Printer,
  Software: Key,
  Sistemas: CircuitBoard,
  Servidores: Server,
  "Semi Novos": RefreshCcw,
  Seminovos: RefreshCcw,
  Outros: Tag,
  Mouse: Mouse,
};

function pickIconFor(name: string, slug?: string): LucideIcon | null {
  const tryList = [name, slug || "", ...name.split(/\s+/)].filter(Boolean);
  for (const key of tryList) {
    if (MAP[key]) return MAP[key];
  }
  for (const key of tryList) {
    const hit = Object.keys(MAP).find((k) => key.toLowerCase().includes(k.toLowerCase()));
    if (hit) return MAP[hit];
  }
  return null;
}

export type CategoryTreeNode = Category & { children?: CategoryTreeNode[] };

function flattenExpandedIds(node: CategoryTreeNode, acc: string[] = []): string[] {
  if (node.children && node.children.length > 0) {
    acc.push(node.id);
    node.children.forEach((c) => flattenExpandedIds(c, acc));
  }
  return acc;
}

export function CategoryTreeAccordion({
  roots,
  mode = "compact",
  defaultOpen = "top-3",
  itemCountBySlug,
}: {
  roots: CategoryTreeNode[];
  mode?: "compact" | "cards";
  /** Quais abrir por padrão: 'none' | 'all' | 'top-N' */
  defaultOpen?: "none" | "all" | `top-${number}`;
  itemCountBySlug?: Record<string, number>;
}) {
  const defaultExpanded = (() => {
    const out: Record<string, boolean> = {};
    if (defaultOpen === "all") {
      roots.forEach((r) => {
        flattenExpandedIds(r).forEach((id) => (out[id] = true));
      });
    } else if (typeof defaultOpen === "string" && defaultOpen.startsWith("top-")) {
      const n = Number(defaultOpen.replace("top-", "")) || 3;
      roots.slice(0, n).forEach((r) => {
        if (r.children && r.children.length) out[r.id] = true;
      });
    }
    return out;
  })();

  const [expanded, setExpanded] = useState<Record<string, boolean>>(defaultExpanded);

  const toggle = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  if (mode === "cards") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {roots.map((root) => {
          const rootCount = (itemCountBySlug && root.slug ? itemCountBySlug[root.slug] : null) as number | null;
          return (
            <div
              key={root.id}
              className="rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              <div className="p-6 flex items-center gap-4 bg-gray-50 border-b border-gray-100">
                <CategoryIconBadge name={root.name} slug={root.slug} />
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/categoria/${encodeURIComponent(root.slug)}`}
                    className="font-bold text-gray-800 hover:text-blue-600 transition-colors text-xl"
                  >
                    {root.name}
                  </Link>
                  {typeof rootCount === "number" && rootCount > 0 && (
                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-0.5">
                      {rootCount} produtos
                    </div>
                  )}
                </div>
                {root.children && root.children.length > 0 && (
                  <button
                    onClick={() => toggle(root.id)}
                    className="rounded-xl p-2 text-gray-400 hover:bg-gray-200 hover:text-blue-600 transition-colors"
                    aria-label={expanded[root.id] ? "Recolher" : "Expandir"}
                  >
                    {expanded[root.id] ? (
                      <ChevronDown size={18} />
                    ) : (
                      <ChevronRight size={18} />
                    )}
                  </button>
                )}
              </div>

              <div
                className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                  root.children && root.children.length > 0 && expanded[root.id]
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="p-5 space-y-1">
                    {root.children?.map((c) => (
                      <TreeRecursiveLine
                        key={c.id}
                        node={c}
                        level={0}
                        expanded={expanded}
                        toggle={toggle}
                        itemCountBySlug={itemCountBySlug}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
                <Link
                  href={`/categoria/${encodeURIComponent(root.slug)}`}
                  className="text-blue-600 font-semibold text-sm hover:underline"
                >
                  Ver tudo em {root.name} →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {roots.map((r) => (
        <TreeRecursiveLine
          key={r.id}
          node={r}
          level={0}
          expanded={expanded}
          toggle={toggle}
          itemCountBySlug={itemCountBySlug}
          showIconBadgeAtLevel0
        />
      ))}
    </div>
  );
}

function TreeRecursiveLine({
  node,
  level,
  expanded,
  toggle,
  showIconBadgeAtLevel0,
  itemCountBySlug,
}: {
  node: CategoryTreeNode;
  level: number;
  expanded: Record<string, boolean>;
  toggle: (id: string) => void;
  showIconBadgeAtLevel0?: boolean;
  itemCountBySlug?: Record<string, number>;
}) {
  const has = node.children && node.children.length > 0;
  const isOpen = !!expanded[node.id];
  const Icon = pickIconFor(node.name, node.slug);
  const count = (itemCountBySlug && node.slug ? itemCountBySlug[node.slug] : null) as number | null;
  return (
    <div className="w-full">
      <div
        className={`group flex items-center justify-between rounded-xl px-2 py-1.5 transition-colors`}
        style={{ paddingLeft: `${4 + level * 14}px` }}
      >
        <Link
          href={`/categoria/${encodeURIComponent(node.slug)}`}
          className="flex-1 min-w-0 flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
        >
          {level === 0 && showIconBadgeAtLevel0 ? (
            <span className="w-8 h-8 shrink-0 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 group-hover:text-blue-600">
              {Icon ? <Icon size={16} /> : null}
            </span>
          ) : (
            <span className="w-1.5 h-1.5 shrink-0 rounded-full bg-gray-300 group-hover:bg-blue-500" />
          )}
          <span className="truncate">{node.name}</span>
          {typeof count === "number" && count > 0 && (
            <span className="shrink-0 text-[10px] text-gray-400 ml-1">({count})</span>
          )}
        </Link>
        {has && (
          <button
            onClick={() => toggle(node.id)}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            aria-label={isOpen ? "Recolher" : "Expandir"}
          >
            {isOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
          </button>
        )}
      </div>

      <div
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
          has && isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          {node.children?.map((c) => (
            <TreeRecursiveLine
              key={c.id}
              node={c}
              level={level + 1}
              expanded={expanded}
              toggle={toggle}
              itemCountBySlug={itemCountBySlug}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function CategoryIconBadge({ name, slug }: { name: string; slug?: string }) {
  const Icon = pickIconFor(name, slug);
  return (
    <div className="w-12 h-12 shrink-0 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
      {Icon ? <Icon size={22} /> : <span className="text-xl">📁</span>}
    </div>
  );
}

export default CategoryTreeAccordion;
