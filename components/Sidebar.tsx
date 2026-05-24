"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Category, buildCategoryTree } from "@/lib/utils";
import { 
  Menu, ChevronRight, ChevronDown, 
  Monitor, Smartphone, Gamepad, Speaker, Tv, Wifi, Printer, Home, Plug, HardDrive, Briefcase, Shield, List,
  Laptop, Cpu, Keyboard, Mouse, Watch, Tablet, Headphones, Camera,
  Tag, Wrench, Handshake,
  Lock, Ghost, Key, Armchair, Square, Disc, Mic, Cable, RefreshCcw, Usb, Backpack, Lightbulb, Zap, Video, Bell, Radio, Power, ToggleLeft, User, Star, Smile, Shirt, Coffee, Image, Gift, FileText, PenTool, Table, Move, CreditCard, Copy, Droplet, Cylinder, Scan, Gamepad2, Box, Server, Book, Feather, Aperture, CircuitBoard, MemoryStick, Fan, Network, Battery,
  Filter as FilterIcon, Check, XCircle, X
} from "lucide-react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";

// --- Configuration & Icons ---

const iconMap: Record<string, any> = {
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
  "Ghost": Ghost,
  "Key": Key,
  "Armchair": Armchair,
  "Square": Square,
  "Disc": Disc,
  "Mic": Mic,
  "Cable": Cable,
  "RefreshCcw": RefreshCcw,
  "Usb": Usb,
  "Backpack": Backpack,
  "Lightbulb": Lightbulb,
  "Zap": Zap,
  "Video": Video,
  "Bell": Bell,
  "Radio": Radio,
  "Power": Power,
  "ToggleLeft": ToggleLeft,
  "User": User,
  "Star": Star,
  "Smile": Smile,
  "Shirt": Shirt,
  "Coffee": Coffee,
  "Image": Image,
  "Gift": Gift,
  "FileText": FileText,
  "PenTool": PenTool,
  "Table": Table,
  "Move": Move,
  "CreditCard": CreditCard,
  "Copy": Copy,
  "Droplet": Droplet,
  "Cylinder": Cylinder,
  "Scan": Scan,
  "Gamepad2": Gamepad2,
  "Box": Box,
  "Server": Server,
  "Book": Book,
  "Feather": Feather,
  "Aperture": Aperture,
  "CircuitBoard": CircuitBoard,
  "MemoryStick": MemoryStick,
  "Fan": Fan,
  "Network": Network,
  "Battery": Battery
};

interface SidebarProps {
  categories: Category[];
  mobileOnly?: boolean;
  availableTags?: { name: string; count: number }[];
  selectedTags?: string[];
}

export default function Sidebar({ categories, mobileOnly = false, availableTags: propTags, selectedTags: propSelectedTags }: SidebarProps) {
  const dbTree = buildCategoryTree(categories);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isOpen, closeSidebar, availableTags: contextTags } = useSidebar();
  
  // State for expanded categories
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

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
    let newTags = currentTags.includes(tagName) 
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

  const tree = [allProductsItem, ...dbTree];

  // --- Components ---

  const CategoryNode = ({ node, level }: { node: Category, level: number }) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expanded[node.id];
    // Active state logic
    const isActive = currentCategory === node.name || (!!pathname && pathname.startsWith("/categoria/") && !!node.slug && pathname.endsWith(`/${node.slug}`));
    
    const Icon = level === 0 ? getIcon(node.icon || node.name) : null;
    const isLongLabel = node.name.toLowerCase().includes('30 minutos') || node.name.toLowerCase().includes('entregas');

    return (
      <div className="w-full">
        <div 
           className={`
             group flex items-center justify-between px-4 py-2.5 text-base transition-all duration-200 cursor-pointer select-none rounded-r-full mr-2
             ${isActive 
               ? 'bg-red-50 text-[#E60012] font-semibold border-l-4 border-[#E60012]' 
               : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent'}
           `}
           style={{ paddingLeft: level === 0 ? '16px' : `${level * 16 + 16}px` }}
        >
          <Link 
              href={`/categoria/${encodeURIComponent(node.slug)}`} 
              className={`flex-1 flex items-center gap-3 ${isLongLabel ? '' : 'truncate'}`}
              onClick={closeSidebar}
          >
              {Icon && <span className={`${isActive ? 'text-[#E60012]' : 'text-gray-400 group-hover:text-gray-600'}`}>{Icon}</span>}
              <span className={isLongLabel ? 'text-[11px] leading-tight font-bold' : ''}>{node.name}</span>
           </Link>
           
           {hasChildren && (
               <button 
                   onClick={(e) => toggleExpand(node.id, e)}
                   className={`p-1 rounded-full transition-colors ${isActive ? 'hover:bg-red-100 text-red-400' : 'hover:bg-gray-200 text-gray-400'}`}
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

  const CustomLink = ({ href, icon: Icon, label }: { href: string, icon: any, label: string }) => {
    const isActive = pathname === href;
    const isLongLabel = label.toLowerCase().includes('30 minutos') || label.toLowerCase().includes('entregas');

    return (
      <Link 
        href={href} 
        className={`
          flex items-center gap-3 px-4 py-2.5 text-base transition-all duration-200 rounded-r-full mr-2
          ${isActive 
            ? 'bg-red-50 text-[#E60012] font-semibold border-l-4 border-[#E60012]' 
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent'}
        `}
        onClick={closeSidebar}
      >
        <span className={`${isActive ? 'text-[#E60012]' : 'text-gray-400'}`}><Icon size={18} /></span>
        <span className={isLongLabel ? 'text-[11px] leading-tight font-bold' : ''}>{label}</span>
      </Link>
    );
  };

  // --- Render ---

  // Desktop View (Static)
  if (!mobileOnly) {
    return (
      <aside className="w-64 bg-white rounded-xl shadow-sm border border-gray-100 hidden lg:flex flex-col h-fit sticky top-24 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2 font-bold text-gray-800">
            <List size={20} className="text-[#E60012]" />
            <span>Departamentos</span>
          </div>
        </div>
        
        <div className="py-2 flex-1 overflow-y-auto max-h-[calc(100vh-150px)] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
          {tree.map(node => <CategoryNode key={node.id} node={node} level={0} />)}
          
          <div className="my-2 border-t border-gray-100 mx-4" />
          
          <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Serviços</div>
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

          {availableTags && availableTags.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100 mx-4">
              <div className="flex items-center justify-between mb-3">
                 <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
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
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-[#E60012] border-[#E60012]' : 'bg-white border-gray-300 group-hover:border-red-300'}`}>
                           {isSelected && <Check size={10} className="text-white" strokeWidth={3} />}
                        </div>
                        <span className={`text-sm flex-1 truncate ${isSelected ? 'font-medium text-gray-900' : 'text-gray-500 group-hover:text-gray-700'}`}>{tag.name}</span>
                        <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 rounded-full">{tag.count}</span>
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
          fixed inset-y-0 left-0 z-[10000] w-[85%] max-w-[320px] bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-out lg:hidden
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
            <div className="px-4 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Categorias</div>
            {tree.map(node => <CategoryNode key={node.id} node={node} level={0} />)}
            
            <div className="my-4 border-t border-gray-100 mx-4" />
            
            <div className="px-4 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Serviços</div>
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

            {/* Mobile Filters */}
            {availableTags && availableTags.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-100 mx-4 bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                 <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
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
                     <div key={tag.name} onClick={() => handleTagToggle(tag.name)} className="flex items-center gap-3 py-2 cursor-pointer border-b border-gray-100 last:border-0">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-[#E60012] border-[#E60012]' : 'bg-white border-gray-300'}`}>
                           {isSelected && <Check size={12} className="text-white" strokeWidth={3} />}
                        </div>
                        <span className={`text-sm flex-1 truncate ${isSelected ? 'font-medium text-gray-900' : 'text-gray-600'}`}>{tag.name}</span>
                        <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">{tag.count}</span>
                     </div>
                   );
                })}
              </div>
            </div>
          )}
         </div>
         
         {/* Mobile Footer (Account/Help) */}
         <div className="p-4 border-t border-gray-100 bg-gray-50">
             <Link href="/fale-conosco" className="flex items-center gap-3 text-gray-700 hover:text-[#E60012]" onClick={closeSidebar}>
                 <User size={20} />
                 <span className="font-medium">Fale Conosco</span>
             </Link>
         </div>
      </aside>
    </>
  );
}
