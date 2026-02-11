"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { Category, buildCategoryTree } from "@/lib/utils";
import { 
  Menu, ChevronRight, ChevronDown, 
  Monitor, Smartphone, Gamepad, Speaker, Tv, Wifi, Printer, Home, Plug, HardDrive, Briefcase, Shield, List,
  Laptop, Cpu, Keyboard, Mouse, Watch, Tablet, Headphones, Camera,
  Tag, Wrench, Handshake,
  Lock, Ghost, Key, Armchair, Square, Disc, Mic, Cable, RefreshCcw, Usb, Backpack, Lightbulb, Zap, Video, Bell, Radio, Power, ToggleLeft, User, Star, Smile, Shirt, Coffee, Image, Gift, FileText, PenTool, Table, Move, CreditCard, Copy, Droplet, Cylinder, Scan, Gamepad2, Box, Server, Book, Feather, Aperture, CircuitBoard, MemoryStick, Fan, Network, Battery,
  Filter as FilterIcon, Check, XCircle
} from "lucide-react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import { X } from "lucide-react";

// Icon mapping
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
  "Apple": Laptop, // Fallback for Apple
  "Notebooks": Laptop,
  "Computadores": Monitor,
  "Hardware": Cpu,
  "Acessórios": Keyboard,
  "Smartwatches": Watch,
  "Tablets": Tablet,
  "Fones": Headphones,
  "Câmeras": Camera,
  // Added mappings for seed data
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

export default function Sidebar(props: SidebarProps) {
  return (
    <Suspense fallback={<div className="w-[280px] bg-white h-screen lg:h-auto animate-pulse" />}>
      <SidebarContent {...props} />
    </Suspense>
  );
}

function SidebarContent({ categories, mobileOnly = false, availableTags: propTags, selectedTags: propSelectedTags }: SidebarProps) {
  const dbTree = buildCategoryTree(categories);
  const router = useRouter();
  const { availableTags: contextTags } = useSidebar();
  
  // Use props if provided, otherwise fallback to context
  const availableTags = propTags || contextTags;
  
  // Get selected tags from URL if not provided via props
  const searchParams = useSearchParams();
  const urlTags = searchParams.get('tags')?.split(',').filter(Boolean) || [];
  const selectedTags = propSelectedTags || urlTags;

  const pathname = usePathname();
  const currentCategory = searchParams.get("category");
  const { isOpen, closeSidebar } = useSidebar();

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

  // Custom tool item
  const monteSeuPcItem = {
    name: "Monte seu PC",
    slug: "monteseupc",
    icon: Wrench,
    href: "/monteseupc"
  };

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpanded((prev: Record<string, boolean>) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleTagToggle = (tagName: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const currentTags = params.get('tags')?.split(',') || [];
    
    let newTags: string[];
    if (currentTags.includes(tagName)) {
        newTags = currentTags.filter(t => t !== tagName);
    } else {
        newTags = [...currentTags, tagName];
    }
    
    if (newTags.length > 0) {
        params.set('tags', newTags.join(','));
    } else {
        params.delete('tags');
    }
    
    // Reset page when filtering
    if (params.has('page')) {
        params.set('page', '1');
    }
    
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('tags');
    if (params.has('page')) {
        params.set('page', '1');
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const getIcon = (iconName?: string) => {
    if (!iconName) return null;
    const IconComponent = iconMap[iconName] || iconMap[Object.keys(iconMap).find(k => iconName.includes(k)) || ""] || null;
    return IconComponent ? <IconComponent size={18} /> : null;
  };

  const CategoryItem = ({ node, level }: { node: Category, level: number }) => {
     const hasChildren = node.children && node.children.length > 0;
     const isExpanded = expanded[node.id];
     const isSelected = currentCategory === node.name || (!!pathname && pathname.startsWith("/categoria/") && !!node.slug && pathname.endsWith(`/${node.slug}`));
     const Icon = level === 0 ? getIcon(node.icon || node.name) : null;

     return (
       <div className="w-full">
         <div 
            className={`flex items-center justify-between px-3 py-2 text-sm transition-colors cursor-pointer select-none
                ${isSelected 
                    ? 'text-[#E60012] font-medium bg-red-50' 
                    : 'text-gray-700 hover:bg-gray-100 hover:text-[#E60012]'}
                ${level === 0 ? 'mb-1 font-medium' : 'font-normal'}
            `}
            style={{ 
                paddingLeft: level === 0 ? '12px' : `${level * 16 + 12}px`,
                borderLeft: isSelected ? '3px solid #E60012' : '3px solid transparent'
            }}
         >
           <Link 
               href={`/categoria/${encodeURIComponent(node.slug)}`} 
                className="flex-1 flex items-center gap-3 truncate"
                onClick={closeSidebar}
            >
               {Icon && <span className="text-gray-400">{Icon}</span>}
               <span>{node.name}</span>
            </Link>
            
            {hasChildren && (
                <button 
                    onClick={(e: React.MouseEvent) => toggleExpand(node.id, e)}
                    className="p-1 hover:bg-gray-200 rounded text-gray-400"
                >
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
            )}
         </div>
         
         {hasChildren && isExpanded && (
            <div className="mt-1 mb-2">
                {node.children!.map(child => (
                    <CategoryItem key={child.id} node={child} level={level + 1} />
                ))}
            </div>
         )}
       </div>
     );
  };

  return (
    <>
        {/* Mobile Overlay */}
        {isOpen && (
            <div 
                className="fixed inset-0 bg-black/50 z-[990] lg:hidden transition-opacity"
                onClick={closeSidebar}
            />
        )}

        {/* Sidebar Container */}
        <aside className={`
            bg-white rounded-lg shadow-md border border-gray-100 flex-shrink-0 flex flex-col
            fixed inset-y-0 left-0 z-[1000] w-[280px] transform transition-transform duration-300 ease-in-out
            ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            ${mobileOnly ? 'lg:hidden' : 'lg:w-64 lg:static lg:block lg:h-fit lg:translate-x-0'}
        `}>
            <div className="p-4 bg-gray-50 border-b border-gray-100 font-bold text-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <List size={20} className="text-[#E60012]" />
                    <span>Categorias</span>
                </div>
                <button 
                    onClick={closeSidebar}
                    className="lg:hidden text-gray-500 hover:text-red-600"
                >
                    <X size={20} />
                </button>
            </div>


            <div className="py-2 overflow-y-auto max-h-[calc(100vh-60px)] lg:max-h-none custom-scrollbar">
                {tree.map(node => (
                    <CategoryItem key={node.id} node={node} level={0} />
                ))}

                {/* Custom Links */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Serviços e Ofertas
                    </div>
                    
                    <Link 
                        href="/servicos-e-ofertas" 
                        className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#E60012] transition-colors pl-[12px] border-l-[3px] border-transparent hover:border-l-[#E60012]"
                        onClick={closeSidebar}
                    >
                        <span className="text-gray-400"><Gift size={18} /></span>
                        <span>Serviços e Ofertas</span>
                    </Link>
                    
                    <Link 
                        href="/pcgamer" 
                        className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#E60012] transition-colors pl-[12px] border-l-[3px] border-transparent hover:border-l-[#E60012]"
                        onClick={closeSidebar}
                    >
                        <span className="text-gray-400"><Gamepad size={18} /></span>
                        <span>PC Gamer</span>
                    </Link>

                    <Link 
                        href="/notebooks" 
                        className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#E60012] transition-colors pl-[12px] border-l-[3px] border-transparent hover:border-l-[#E60012]"
                        onClick={closeSidebar}
                    >
                        <span className="text-gray-400"><Laptop size={18} /></span>
                        <span>Notebooks</span>
                    </Link>

                    <Link 
                        href="/promocao" 
                        className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#E60012] transition-colors pl-[12px] border-l-[3px] border-transparent hover:border-l-[#E60012]"
                        onClick={closeSidebar}
                    >
                        <span className="text-gray-400"><Tag size={18} /></span>
                        <span>Promoção</span>
                    </Link>

                    <Link 
                        href="/manutencao" 
                        className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#E60012] transition-colors pl-[12px] border-l-[3px] border-transparent hover:border-l-[#E60012]"
                        onClick={closeSidebar}
                    >
                        <span className="text-gray-400"><Wrench size={18} /></span>
                        <span>Manutenção</span>
                    </Link>

                    <Link 
                        href="/consignacao" 
                        className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#E60012] transition-colors pl-[12px] border-l-[3px] border-transparent hover:border-l-[#E60012]"
                        onClick={closeSidebar}
                    >
                        <span className="text-gray-400"><Handshake size={18} /></span>
                        <span>Consignação</span>
                    </Link>
                </div>

                {/* FILTERS SECTION */}
                {availableTags && availableTags.length > 0 && (
                    <div className="border-t border-gray-100 mt-4 pt-4">
                        <div className="px-4 py-2 bg-white font-bold text-gray-700 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm">
                                <FilterIcon size={16} className="text-[#E60012]" />
                                <span>Filtrar</span>
                            </div>
                            {selectedTags.length > 0 && (
                                <button 
                                    onClick={clearFilters}
                                    className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1 font-medium transition-colors"
                                    title="Limpar todos os filtros"
                                >
                                    <XCircle size={14} /> Limpar
                                </button>
                            )}
                        </div>
                        <div className="px-4 pb-4 space-y-2">
                            {availableTags.map(tag => {
                                const isSelected = selectedTags.includes(tag.name);
                                return (
                                    <div 
                                        key={tag.name} 
                                        className="flex items-center gap-2 cursor-pointer group"
                                        onClick={() => handleTagToggle(tag.name)}
                                    >
                                        <div className={`
                                            w-4 h-4 rounded border flex items-center justify-center transition-all duration-200
                                            ${isSelected ? 'bg-[#E60012] border-[#E60012]' : 'bg-white border-gray-300 group-hover:border-red-400'}
                                        `}>
                                            {isSelected && <Check size={12} className="text-white" strokeWidth={3} />}
                                        </div>
                                        <span className={`text-sm flex-1 truncate ${isSelected ? 'font-medium text-gray-900' : 'text-gray-600 group-hover:text-gray-900'}`}>
                                            {tag.name}
                                        </span>
                                        <span className="text-xs text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded-full">
                                            {tag.count}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </aside>
    </>
  );
}
