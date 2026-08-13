"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Category, buildCategoryTree } from "@/lib/utils";
import { 
  Menu, ChevronRight, ChevronDown, Search as SearchIcon,
  Monitor, Smartphone, Gamepad, Speaker, Tv, Wifi, Printer, Home, Plug, HardDrive, Briefcase, Shield, List,
  Laptop, Cpu, Keyboard, Mouse, Watch, Tablet, Headphones, Camera,
  Tag, Wrench, Handshake,
  Lock, Ghost, Key, Armchair, Square, Disc, Mic, Cable, RefreshCcw, Usb, Backpack, Lightbulb, Zap, Video, Bell, Radio, Power, ToggleLeft, User, Star, Smile, Shirt, Coffee, Image, Gift, FileText, PenTool, Table, Move, CreditCard, Copy, Droplet, Cylinder, Scan, Gamepad2, Box, Server, Book, Feather, Aperture, CircuitBoard, MemoryStick, Fan, Network, Battery,
  Filter as FilterIcon, Check, XCircle, X, type LucideIcon
} from "lucide-react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";

// --- Configuration & Icons ---

const iconMap: Record<string, LucideIcon> = {
  "Monitor": Monitor,
  "Smartphone": Smartphone,
  "Gamepad": Gamepad,
  "Speaker": Speaker,
  "Tv": Tv,
  "Wifi": Wifi,
  "Printer": Printer,
  "Home": Home,
  "Plug": Plug,
  "HardDrive": HardDrive,
  "Briefcase": Briefcase,
  "Shield": Shield,
  "List": List,
  "Apple": Laptop,
  "Notebooks": Laptop,
  "Computadores": Monitor,
  "Hardware": Cpu,
  "Acessórios": Keyboard,
  "Smartwatches": Watch,
  "Tablets": Tablet,
  "Fones": Headphones,
  "Câmeras": Camera,
  "Laptop": Laptop,
  "Cpu": Cpu,
  "Keyboard": Keyboard,
  "Mouse": Mouse,
  "Headphones": Headphones,
  "Watch": Watch,
  "Tablet": Tablet,
  "Camera": Camera,
  "Lock": Lock,
  "Adaptadores": RefreshCcw,
  "Bases": Armchair,
  "Cabos": Cable,
  "Filtros": Zap,
  "Estabilizadores": Zap,
  "Hubs": Usb,
  "Iluminação": Lightbulb,
  "RGB": Lightbulb,
  "Mochilas": Backpack,
  "Cases": Box,
  "Suportes": Armchair,
  "Headset": Headphones,
  "AirPods": Headphones,
  "Automação": ToggleLeft,
  "Assistentes": User,
  "Casa": Home,
  "Inteligente": ToggleLeft,
  "Centrais": Server,
  "Interruptores": ToggleLeft,
  "Lâmpadas": Lightbulb,
  "Fitas": Lightbulb,
  "LED": Lightbulb,
  "Sensores": Bell,
  "Tomadas": Power,
  "All-in-One": Monitor,
  "Mini PC": Box,
  "Corporativo": Briefcase,
  "Escritório": Briefcase,
  "PC Gamer": Cpu,
  "Workstation": Server,
  "Cadeiras": Armchair,
  "Ergonômicas": Armchair,
  "Gamer": Gamepad,
  "Mesas": Table,
  "Organizadores": FileText,
  "Assinaturas": CreditCard,
  "Consoles": Gamepad2,
  "Controles": Gamepad2,
  "Gift Cards": Gift,
  "Jogos": Disc,
  "Nintendo": Disc,
  "PlayStation": Disc,
  "Xbox": Disc,
  "Action Figures": Smile,
  "Brinquedos": Smile,
  "Temáticos": Smile,
  "Camisetas": Shirt,
  "Vestuário": Shirt,
  "Canecas": Coffee,
  "Copos": Coffee,
  "Colecionáveis": Star,
  "Decoração": Image,
  "Geek": Smile,
  "Funko": Smile,
  "Pop": Smile,
  "Coolers": Fan,
  "Water Cooler": Droplet,
  "Fontes": Battery,
  "Alimentação": Battery,
  "Gabinetes": Box,
  "Memória": MemoryStick,
  "RAM": MemoryStick,
  "Placas": CircuitBoard,
  "Rede": Network,
  "Som": Speaker,
  "Vídeo": Monitor,
  "GPU": Monitor,
  "Placas-Mãe": CircuitBoard,
  "Processadores": Cpu,
  "CPU": Cpu,
  "SSD": HardDrive,
  "HD": HardDrive,
  "NVMe": HardDrive,
  "Cartuchos": Droplet,
  "Tinta": Droplet,
  "Etiquetas": FileText,
  "Impressoras": Printer,
  "Jato": Printer,
  "Laser": Printer,
  "Multifuncionais": Printer,
  "Papel": FileText,
  "Fotográfico": Image,
  "Scanners": Scan,
  "Toners": Printer,
  "Antivírus": Shield,
  "Microsoft": Key,
  "Office": Key,
  "Softwares": PenTool,
  "Design": PenTool,
  "Edição": PenTool,
  "Windows": Key,
  "4K": Monitor,
  "Curvo": Monitor,
  "Profissional": Monitor,
  "Ultrawide": Monitor,
  "MacBook": Laptop,
  "Estudante": Laptop,
  "Ultrabook": Laptop,
  "Joysticks": Gamepad2,
  "Microfones": Mic,
  "Mousepads": Mouse,
  "Mouses": Mouse,
  "Teclados": Keyboard,
  "Mecânicos": Keyboard,
  "Volantes": Gamepad2,
  "Simuladores": Gamepad2,
  "Webcams": Camera,
  "Alarmes": Bell,
  "Residenciais": Bell,
  "Câmeras de Segurança": Camera,
  "IP": Camera,
  "Wi-Fi": Camera,
  "DVR": HardDrive,
  "NVR": HardDrive,
  "Fechaduras": Lock,
  "Eletrônicas": Lock,
  "Kits": Box,
  "CFTV": Camera,
  "Movimento": Bell,
  "Vídeo Porteiros": Video,
  "Capas": Shirt,
  "Películas": Shield,
  "Carregadores": Battery,
  "Android": Smartphone,
  "Power Banks": Battery,
};

// --- Component Types ---

interface SidebarProps {
  categories?: Category[];
  mobileOnly?: boolean;
  availableTags?: { name: string; count: number }[];
  selectedTags?: string[];
}

export default function Sidebar({ categories, mobileOnly = false, availableTags: propTags, selectedTags: propSelectedTags }: SidebarProps) {
  const dbTree = buildCategoryTree(categories || []);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isOpen, closeSidebar, availableTags: contextTags } = useSidebar();
  
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [deptSearch, setDeptSearch] = useState("");

  // Merge tags
  const availableTags = propTags || contextTags;
  const urlTags = searchParams.get('tags')?.split(',').filter(Boolean) || [];
  const selectedTags = propSelectedTags || urlTags;
  const currentCategory = searchParams.get("category");

  // --- Helpers ---

  const getIcon = (iconName?: string) => {
    if (!iconName) return null;
    const IconComponent = iconMap[iconName] || iconMap[Object.keys(iconMap).find(k => iconName.includes(k)) || ""] || null;
    return IconComponent ? <IconComponent size={18} /> : null;
  };

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleTagToggle = (tagName: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const currentTags = params.get('tags')?.split(',') || [];
    const newTags = currentTags.includes(tagName) 
      ? currentTags.filter(t => t !== tagName)
      : [...currentTags, tagName];
    
    if (newTags.length > 0) params.set('tags', newTags.join(','));
    else params.delete('tags');
    
    if (params.has('page')) params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('tags');
    if (params.has('page')) params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  // --- Data Preparation ---

  const allProductsItem: Category = {
    id: "all-products",
    name: "Todos os Produtos",
    slug: "todos-os-produtos",
    parent_id: null,
    display_order: -1,
    active: true,
    children: [],
    icon: "List"
  };

  const baseTree = useMemo<Category[]>(
    () => [allProductsItem, ...(dbTree || [])],
    [dbTree]
  );

  // Filtro de busca por departamento (mantém ancestrais se filho der match)
  function filterTreeBySearch(nodes: Category[], needle: string): Category[] {
    if (!needle) return nodes;
    const mapChildren = (list: Category[]): Category[] => {
      const out: Category[] = [];
      for (const n of list) {
        const kids = n.children && n.children.length ? mapChildren(n.children) : [];
        const selfMatch = String(n.name || "").toLowerCase().includes(needle) || String(n.slug || "").toLowerCase().includes(needle);
        if (selfMatch || kids.length > 0) {
          out.push({ ...n, children: kids });
        }
      }
      return out;
    };
    return mapChildren(nodes);
  }

  // Expandir automaticamente os pais quando busca estiver ativa
  useEffect(() => {
    const q = deptSearch.trim().toLowerCase();
    if (!q) return;
    const ids = new Set<string>();
    const walk = (nodes: Category[]): boolean => {
      let ok = false;
      for (const n of nodes) {
        const kids = n.children && n.children.length > 0 ? walk(n.children) : false;
        const self = String(n.name || "").toLowerCase().includes(q) || String(n.slug || "").toLowerCase().includes(q);
        if ((self || kids) && n.children && n.children.length > 0) ids.add(n.id);
        if (self || kids) ok = true;
      }
      return ok;
    };
    walk(baseTree);
    if (ids.size > 0) {
      setExpanded((prev) => {
        const next = { ...prev };
        ids.forEach((id) => (next[id] = true));
        return next;
      });
    }
  }, [deptSearch, baseTree]);

  const tree = useMemo(
    () => filterTreeBySearch(baseTree, deptSearch.trim().toLowerCase()),
    [baseTree, deptSearch]
  );

  // --- Helpers: expand/collapse em lote ---
  const getAllExpandableIds = (): string[] => {
    const out: string[] = [];
    const walk = (nodes: Category[]) => {
      for (const n of nodes) {
        if (n.children && n.children.length > 0) {
          out.push(n.id);
          walk(n.children);
        }
      }
    };
    walk(tree);
    return out;
  };
  const expandAll = () => {
    const ids = getAllExpandableIds();
    const next: Record<string, boolean> = {};
    ids.forEach((id) => (next[id] = true));
    setExpanded(next);
  };
  const collapseAll = () => setExpanded({});

  // --- Components ---

  const CategoryNode = ({ node, level }: { node: Category, level: number }) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expanded[node.id];
    const isActive = currentCategory === node.name || (!!pathname && pathname.startsWith("/categoria/") && !!node.slug && pathname.endsWith(`/${node.slug}`));
    
    const Icon = level === 0 ? getIcon(node.icon || node.name) : null;
    const isLongLabel = node.name.toLowerCase().includes('30 minutos') || node.name.toLowerCase().includes('entregas');

    return (
      <div className="w-full">
        <div 
           className={`
             group mx-2 flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-all duration-200 cursor-pointer select-none
             ${isActive 
               ? 'bg-[var(--home-primary-soft)] text-[var(--home-accent)] font-semibold ring-1 ring-[var(--home-border-strong)]' 
               : 'text-[var(--site-muted)] hover:bg-[var(--site-panel-muted)] hover:text-[var(--site-text)]'}
           `}
           style={{ paddingLeft: level === 0 ? '12px' : `${level * 14 + 12}px` }}
        >
          <Link 
              href={`/categoria/${encodeURIComponent(node.slug)}`} 
              className={`flex-1 flex items-center gap-3 ${isLongLabel ? '' : 'truncate'}`}
              onClick={closeSidebar}
          >
              {Icon && <span className={`${isActive ? 'text-[#E60012]' : 'text-[var(--site-muted)] group-hover:text-[var(--site-soft)]'}`}>{Icon}</span>}
              <span className={isLongLabel ? 'text-[11px] leading-tight font-bold' : ''}>{node.name}</span>
           </Link>
           
           {hasChildren && (
               <button 
                   onClick={(e) => toggleExpand(node.id, e)}
                   className={`p-1 rounded-full transition-colors ${isActive ? 'hover:bg-red-950/45 text-red-400' : 'hover:bg-[var(--site-panel-muted)] text-[var(--site-muted)]'}`}
               >
                   {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
               </button>
           )}
        </div>
        
        {/* Animated Submenu */}
        <div className={`grid transition-all duration-300 ease-in-out ${hasChildren && isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
           <div className="overflow-hidden">
               {node.children?.map(child => (
                   <CategoryNode key={child.id} node={child} level={level + 1} />
               ))}
           </div>
        </div>
      </div>
    );
  };

  const CustomLink = ({ href, icon: Icon, label }: { href: string, icon: LucideIcon, label: string }) => {
    const isActive = pathname === href;
    const isLongLabel = label.toLowerCase().includes('30 minutos') || label.toLowerCase().includes('entregas');

    return (
      <Link 
        href={href} 
        className={`
          mx-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200
          ${isActive 
            ? 'bg-[var(--home-primary-soft)] text-[var(--home-accent)] font-semibold ring-1 ring-[var(--home-border-strong)]' 
            : 'text-[var(--site-muted)] hover:bg-[var(--site-panel-muted)] hover:text-[var(--site-text)]'}
        `}
        onClick={closeSidebar}
      >
        <span className={`${isActive ? 'text-[#E60012]' : 'text-[var(--site-muted)]'}`}><Icon size={18} /></span>
        <span className={isLongLabel ? 'text-[11px] leading-tight font-bold' : ''}>{label}</span>
      </Link>
    );
  };

  // --- Render ---

  // Desktop View (Static)
  if (!mobileOnly) {
    return (
      <aside className="site-surface sticky top-24 hidden h-fit w-64 flex-col rounded-[1.6rem] shadow-lg lg:flex">
        <div className="border-b border-[var(--site-border)] bg-[var(--site-panel-muted)] p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-[var(--site-text)]">
              <List size={20} className="text-[#E60012]" />
              <span>Departamentos</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={expandAll}
                className="px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider text-[var(--site-muted)] hover:bg-[var(--site-panel)] hover:text-[var(--site-text)] transition-colors"
                title="Expandir todas as categorias"
              >
                +Tudo
              </button>
              <button
                onClick={collapseAll}
                className="px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider text-[var(--site-muted)] hover:bg-[var(--site-panel)] hover:text-[var(--site-text)] transition-colors"
                title="Recolher todas as categorias"
              >
                Limpar
              </button>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 rounded-xl border border-[var(--site-border)] bg-[var(--site-panel)] px-3 py-2 focus-within:ring-2 focus-within:ring-[var(--home-accent)]/40">
              <SearchIcon size={16} className="text-[var(--site-muted)]" />
              <input value={deptSearch} onChange={(e) => setDeptSearch(e.target.value)} placeholder="Buscar departamento..." className="w-full bg-transparent text-sm text-[var(--site-text)] placeholder:text-[var(--site-muted)] outline-none" />
              {deptSearch && <button onClick={() => setDeptSearch("")} className="text-[var(--site-muted)] hover:text-[var(--site-text)]"><X size={14} /></button>}
            </div>
            {deptSearch && <div className="mt-1.5 px-1 text-[10px] text-[var(--site-muted)]">Filtrando por "{deptSearch.slice(0,30)}"</div>}
          </div>
        </div>
        <div className="py-3">
          {tree.length > 0 ? (
            tree.map(node => <CategoryNode key={node.id} node={node} level={0} />)
          ) : (
            <div className="px-4 py-6 text-center text-xs text-[var(--site-muted)]">Nenhum departamento encontrado.</div>
          )}
          
          <div className="mx-4 my-2 border-t border-[var(--site-border)]" />
          
          <div className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-[var(--site-muted)]">Serviços</div>
          <CustomLink href="/blog" icon={Book} label="Blog" />
          <CustomLink href="/premium" icon={Star} label="Premium" />
          <CustomLink href="/vitrine" icon={Image} label="Vitrine" />
          <CustomLink href="/servicos-e-ofertas" icon={Gift} label="Serviços e Ofertas" />
          <CustomLink href="/pcgamer" icon={Gamepad} label="PC Gamer" />
          <CustomLink href="/notebooks" icon={Laptop} label="Notebooks" />
          <CustomLink href="/promocao" icon={Tag} label="Promoção" />
          <CustomLink href="/manutencao" icon={Wrench} label="Manutenção" />
          <CustomLink href="/consignacao" icon={Handshake} label="Consignação" />
          <CustomLink href="/carregadores" icon={Battery} label="Carregadores" />
          <CustomLink href="/microsoft" icon={Key} label="Licenças Microsoft" />
          <CustomLink href="/assistenciagames" icon={Gamepad2} label="Assistência Games" />
          <CustomLink href="/tonner" icon={Printer} label="Toners" />
          <CustomLink href="/reparoapple" icon={Smartphone} label="Reparo Apple" />
          <CustomLink href="/telaiphone" icon={Zap} label="Troca de Tela & Bateria" />
          <CustomLink href="/recuperacaodados" icon={HardDrive} label="Recuperação de Dados" />
          <CustomLink href="/montagempc" icon={Cpu} label="Montagem PC Gamer" />
          <CustomLink href="/sistemas" icon={CircuitBoard} label="Sites & Sistemas" />
          <CustomLink href="/pcgamer3d" icon={Box} label="PC Gamer 3D" />
          <CustomLink href="/wendell/apple" icon={Laptop} label="Especialista Apple" />

            {availableTags && availableTags.length > 0 && (
            <div className="mx-4 mt-4 border-t border-[var(--site-border)] pt-4">
              <div className="flex items-center justify-between mb-3">
                 <div className="flex items-center gap-2 text-sm font-bold text-[var(--site-soft)]">
                    <FilterIcon size={16} className="text-[#E60012]" />
                    <span>Filtros</span>
                 </div>
                 {selectedTags.length > 0 && (
                    <button onClick={clearFilters} className="text-xs text-red-600 hover:text-red-800 font-medium flex items-center gap-1">
                      <XCircle size={12} /> Limpar
                    </button>
                 )}
              </div>
              <div className="space-y-1">
                {availableTags.map(tag => {
                   const isSelected = selectedTags.includes(tag.name);
                   return (
                     <div key={tag.name} onClick={() => handleTagToggle(tag.name)} className="flex items-center gap-2 py-1.5 cursor-pointer group">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-[#E60012] border-[#E60012]' : 'bg-zinc-900 border-zinc-800 group-hover:border-red-500'}`}>
                           {isSelected && <Check size={10} className="text-white" strokeWidth={3} />}
                        </div>
                        <span className={`text-sm flex-1 truncate ${isSelected ? 'font-medium text-[var(--site-text)]' : 'text-[var(--site-muted)] group-hover:text-[var(--site-soft)]'}`}>{tag.name}</span>
                        <span className="rounded-full bg-[var(--site-panel-muted)] px-1.5 text-[10px] text-[var(--site-muted)]">{tag.count}</span>
                     </div>
                   );
                })}
              </div>
            </div>
          )}
        </div>
      </aside>
    );
  }

  // Mobile View (Overlay + Drawer)
  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 z-[9990] transition-opacity duration-300 lg:hidden backdrop-blur-sm
          ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}
        `}
        onClick={closeSidebar}
      />

      {/* Drawer */}
      <aside className={`
          fixed inset-y-0 left-0 z-[10000] w-[85%] max-w-[320px] flex flex-col transform bg-[var(--site-panel)] shadow-2xl transition-transform duration-300 ease-out lg:hidden
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
         {/* Mobile Header */}
         <div className="p-4 bg-[#E60012] text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2 font-bold text-lg">
              <Menu size={24} />
              <span>Menu</span>
            </div>
            <button onClick={closeSidebar} className="p-1 hover:bg-white/20 rounded-full transition-colors">
               <X size={24} />
            </button>
         </div>

         {/* Mobile Content */}
         <div className="flex-1 overflow-y-auto py-4">
            <div className="px-4 mb-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">Categorias</div>
            <div className="px-4 mb-3">
              <div className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2">
                <SearchIcon size={16} className="text-zinc-400" />
                <input value={deptSearch} onChange={(e) => setDeptSearch(e.target.value)} placeholder="Buscar departamento..." className="w-full bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 outline-none" />
                {deptSearch && <button onClick={() => setDeptSearch("")} className="text-zinc-400 hover:text-zinc-100"><X size={14} /></button>}
              </div>
            </div>
            {tree.length > 0 ? (tree.map(node => <CategoryNode key={node.id} node={node} level={0} />)) : (<div className="px-6 py-8 text-center text-xs text-zinc-500">Nenhum departamento encontrado.</div>)}
            
            <div className="my-4 border-t border-zinc-800 mx-4" />
            
            <div className="px-4 mb-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">Serviços</div>
            <CustomLink href="/blog" icon={Book} label="Blog" />
            <CustomLink href="/premium" icon={Star} label="Premium" />
            <CustomLink href="/vitrine" icon={Image} label="Vitrine" />
            <CustomLink href="/servicos-e-ofertas" icon={Gift} label="Serviços e Ofertas" />
            <CustomLink href="/pcgamer" icon={Gamepad} label="PC Gamer" />
            <CustomLink href="/notebooks" icon={Laptop} label="Notebooks" />
            <CustomLink href="/promocao" icon={Tag} label="Promoção" />
            <CustomLink href="/manutencao" icon={Wrench} label="Manutenção" />
            <CustomLink href="/consignacao" icon={Handshake} label="Consignação" />
            <CustomLink href="/assistenciagames" icon={Gamepad2} label="Assistência Games" />
            <CustomLink href="/tonner" icon={Printer} label="Toners" />
            <CustomLink href="/reparoapple" icon={Smartphone} label="Reparo Apple" />
            <CustomLink href="/telaiphone" icon={Zap} label="Troca de Tela & Bateria" />
            <CustomLink href="/recuperacaodados" icon={HardDrive} label="Recuperação de Dados" />
            <CustomLink href="/montagempc" icon={Cpu} label="Montagem PC Gamer" />
            <CustomLink href="/sistemas" icon={CircuitBoard} label="Sites & Sistemas" />
            <CustomLink href="/pcgamer3d" icon={Box} label="PC Gamer 3D" />
            <CustomLink href="/wendell/apple" icon={Laptop} label="Especialista Apple" />

                       {availableTags && availableTags.length > 0 && (
            <div className="mt-6 pt-4 border-t border-zinc-800 mx-4 bg-zinc-900/40 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                 <div className="flex items-center gap-2 text-sm font-bold text-zinc-300">
                    <FilterIcon size={16} className="text-[#E60012]" />
                    <span>Filtros</span>
                 </div>
                 {selectedTags.length > 0 && (
                    <button onClick={clearFilters} className="text-xs text-red-600 hover:text-red-800 font-medium flex items-center gap-1">
                      <XCircle size={12} /> Limpar
                    </button>
                 )}
              </div>
              <div className="space-y-2">
                {availableTags.map(tag => {
                   const isSelected = selectedTags.includes(tag.name);
                   return (
                     <div key={tag.name} onClick={() => handleTagToggle(tag.name)} className="flex items-center gap-3 py-2 cursor-pointer border-b border-zinc-900 last:border-0">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-[#E60012] border-[#E60012]' : 'bg-zinc-900 border-zinc-800'}`}>
                           {isSelected && <Check size={12} className="text-white" strokeWidth={3} />}
                        </div>
                        <span className={`text-sm flex-1 truncate ${isSelected ? 'font-medium text-zinc-100' : 'text-zinc-400'}`}>{tag.name}</span>
                        <span className="text-xs text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded-full">{tag.count}</span>
                     </div>
                   );
                })}
              </div>
            </div>
          )}
         </div>
         
         {/* Mobile Footer (Account/Help) */}
         <div className="border-t border-[var(--site-border)] bg-[var(--site-panel-muted)] p-4">
             <Link href="/fale-conosco" className="flex items-center gap-3 text-[var(--site-muted)] hover:text-[#E60012]" onClick={closeSidebar}>
                  <User size={20} />
                  <span className="font-medium">Fale Conosco</span>
             </Link>
         </div>
      </aside>
    </>
  );
}
