
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, ShoppingCart, User, Menu, X, Loader2, Crown, MessageCircle, Tag, LayoutGrid } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useSidebar } from "@/context/SidebarContext";
import { Product } from "@/lib/utils";
import SearchPreview from "@/components/SearchPreview";
import CartPreview from "@/components/CartPreview";
import TopBar from "@/components/TopBar";
import { SITE_CONFIG } from "@/lib/config";

export default function Header() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cartCount } = useCart();
  const { toggleSidebar } = useSidebar();
  const [logoClicks, setLogoClicks] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCartPreview, setShowCartPreview] = useState(false);
  const cartPreviewTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Sync search query with URL params
  useEffect(() => {
    const query = searchParams.get("search");
    if (query) {
      setSearchQuery(query);
    } else {
      setSearchQuery("");
    }
  }, [searchParams]);
  
  // Search Preview State
  const [showPreview, setShowPreview] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchContainerRef = useRef<HTMLFormElement>(null);
  const mobileSearchContainerRef = useRef<HTMLDivElement>(null);

  // Debounced Backend Search
  useEffect(() => {
    // Don't search if query is too short
    if (searchQuery.length < 2) {
      setProducts([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (err) {
        console.error("Failed to search products", err);
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms delay to wait for user to stop typing

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle click outside to close preview
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isOutsideDesktop = searchContainerRef.current && !searchContainerRef.current.contains(target);
      const isOutsideMobile = mobileSearchContainerRef.current && !mobileSearchContainerRef.current.contains(target);

      if (isOutsideDesktop && isOutsideMobile) {
        setShowPreview(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogoClick = () => {
    const newClicks = logoClicks + 1;
    setLogoClicks(newClicks);
    if (newClicks >= 5) {
      router.push("/admin");
      setLogoClicks(0);
    } else {
      router.push("/");
    }
  };

  const performSearch = () => {
    setShowPreview(false);
    if (searchQuery === "56676009") {
      router.push("/admin");
    } else {
      if (searchQuery.trim()) {
        router.push(`/?search=${encodeURIComponent(searchQuery)}`);
      } else {
        router.push('/');
      }
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch();
  };

  const clearSearch = () => {
    setSearchQuery("");
    setProducts([]);
    setShowPreview(false);
  };

  const handleCartMouseEnter = () => {
    if (cartPreviewTimeoutRef.current) clearTimeout(cartPreviewTimeoutRef.current);
    setShowCartPreview(true);
  };

  const handleCartMouseLeave = () => {
    cartPreviewTimeoutRef.current = setTimeout(() => {
      setShowCartPreview(false);
    }, 300);
  };

  // Products are now fetched directly from API, so no need for client-side filtering here
  const previewProducts = products;

  const whatsappHref = `https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
    SITE_CONFIG.whatsapp.messageDefault
  )}`;

  return (
    <header className="bg-zinc-950 sticky top-0 z-[900] shadow-[0_12px_40px_rgba(0,0,0,0.25)] flex flex-col">
      <TopBar />
      <div className="border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
        
        {/* Mobile Menu Button - Optimized for Touch */}
        <button 
          onClick={toggleSidebar}
          className="lg:hidden p-3 -ml-3 text-white/80 hover:text-white transition-colors active:scale-95"
          aria-label="Abrir menu"
        >
            <Menu size={32} strokeWidth={2.5} />
        </button>

        {/* Logo Section */}
        <button
          type="button"
          onClick={handleLogoClick}
          className="flex flex-col items-center cursor-pointer select-none flex-shrink-0 drop-shadow-sm transition-transform hover:scale-[1.03] active:scale-95"
          title="Ir para página inicial"
        >
             <div className="relative w-[140px] h-[45px] md:w-[200px] md:h-[65px]">
                <Image 
                    src="/logo.png" 
                    alt="Balão da Informática" 
                    fill
                    className="object-contain"
                    priority
                />
             </div>
        </button>

        

        {/* Search Bar (Desktop) */}
        <form 
             ref={searchContainerRef}
             onSubmit={handleSearch} 
             className="hidden md:flex flex-1 max-w-xl relative"
             className="hidden md:flex flex-1 max-w-xl relative"
          <input
              type="text"
              placeholder="Buscar produtos..."
              className="w-full pl-12 pr-24 py-3 border border-gray-300 rounded-full focus:outline-none focus:border-[#E60012] focus:ring-1 focus:ring-[#E60012] shadow-sm text-base"
              className="w-full pl-12 pr-28 py-3.5 border border-white/10 bg-white text-gray-900 rounded-full focus:outline-none focus:ring-2 focus:ring-[#E60012]/30 shadow-sm text-base placeholder:text-gray-400"
              onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowPreview(true);
              }}
              onFocus={() => setShowPreview(true)}
          />


          {/* Search Icon */}
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />

          {/* Clear Button */}
          {searchQuery && (
              <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-[112px] top-1/2 -translate-y-1/2 text-gray-500 p-2"
              >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : <X size={18} />}
              </button>
          )}

          {/* Search Button */}
          <button
              type="button"
              onClick={performSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#E60012] text-white px-4 py-2.5 rounded-full hover:bg-red-700 transition-colors flex items-center gap-2 font-extrabold shadow-[0_14px_30px_rgba(230,0,18,0.22)]"
          >
              <Search size={18} />
              <span className="hidden lg:inline font-semibold">Buscar</span>
          </button>

          {/* Search Preview */}
          {showPreview && searchQuery.length >= 2 && (
              <SearchPreview 
                  products={previewProducts}
                  searchQuery={searchQuery}
                  onSelect={(product) => {
                      router.push(`/product/${product.id}`);
                      setShowPreview(false);
                      setSearchQuery("");
                  }}
                  onClose={() => setShowPreview(false)}
              />
          )}
        </form>



        {/* Actions */}
        <div className="flex items-center gap-3 md:gap-6 text-white/90">

          <button
            type="button"
            onClick={() => router.push("/#categorias")}
            className="hidden lg:flex items-center gap-3 group active:scale-95 transition-transform"
            aria-label="Ver departamentos"
            title="Departamentos"
          >
            <div className="p-2 bg-white/5 rounded-full text-white/80 group-hover:bg-white/10 group-hover:text-white transition-colors border border-white/10">
              <LayoutGrid size={20} className="md:w-5 md:h-5" strokeWidth={2.5} />
            </div>
            <div className="hidden xl:flex flex-col text-sm leading-tight text-left">
              <span className="text-white/60">Departamentos</span>
              <span className="font-extrabold text-white group-hover:text-[#E60012] transition-colors">Ver categorias</span>
            </div>
          </button>

          <Link href="/fale-conosco" className="flex items-center gap-3 group active:scale-95 transition-transform">
            <div className="p-2 bg-white/5 rounded-full text-white/80 group-hover:bg-white/10 group-hover:text-white transition-colors border border-white/10">
                <User size={20} className="md:w-5 md:h-5" strokeWidth={2.5} />
            </div>
            <div className="hidden lg:flex flex-col text-sm leading-tight">
                <span className="text-white/60">Atendimento</span>
                <span className="font-extrabold text-white group-hover:text-[#E60012] transition-colors">
                  Fale Conosco
                </span>
            </div>
          </Link>

          <Link
            href="/premium"
            className="flex items-center gap-3 group active:scale-95 transition-transform"
            aria-label="PCS Premium"
            title="PCS Premium"
          >
            <div className="p-2 bg-white/5 rounded-full text-amber-400 group-hover:bg-white/10 group-hover:text-amber-300 transition-colors border border-white/10">
              <Crown size={20} className="md:w-5 md:h-5" strokeWidth={2.5} />
            </div>
            <div className="hidden lg:flex flex-col text-sm leading-tight">
              <span className="text-white/60">PCS</span>
              <span className="font-extrabold text-white group-hover:text-amber-300 transition-colors">Premium</span>
            </div>
          </Link>

          <Link
            href="/promocao"
            className="hidden md:flex items-center gap-3 group active:scale-95 transition-transform"
            aria-label="Promoções"
            title="Promoções"
          >
            <div className="p-2 bg-white/5 rounded-full text-white/80 group-hover:bg-white/10 group-hover:text-white transition-colors border border-white/10">
              <Tag size={20} className="md:w-5 md:h-5" strokeWidth={2.5} />
            </div>
            <div className="hidden xl:flex flex-col text-sm leading-tight">
              <span className="text-white/60">Ver</span>
              <span className="font-extrabold text-white group-hover:text-[#E60012] transition-colors">Promoções</span>
            </div>
          </Link>

          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="hidden md:inline-flex items-center gap-2 rounded-full bg-[#25D366] hover:bg-[#128C7E] text-white px-4 py-2.5 font-extrabold shadow-[0_14px_30px_rgba(18,140,126,0.25)] active:scale-[0.98] transition-all"
            aria-label="Falar no WhatsApp"
            title="Falar no WhatsApp"
          >
            <MessageCircle size={18} />
            <span className="hidden lg:inline">WhatsApp</span>
          </a>
          
          <div className="relative" onMouseEnter={handleCartMouseEnter} onMouseLeave={handleCartMouseLeave}>
            <Link href="/cart" id="cart-icon-container" className="relative group flex items-center gap-3 active:scale-95 transition-transform">
               <div className="p-2 bg-white/5 rounded-full text-white/80 group-hover:bg-white/10 group-hover:text-white transition-colors border border-white/10">
                  <ShoppingCart size={20} className="md:w-5 md:h-5" strokeWidth={2.5} />
               </div>
               <div className="hidden lg:flex flex-col text-sm leading-tight">
                  <span className="text-white/60">Meu</span>
                  <span className="font-extrabold text-white group-hover:text-[#E60012] transition-colors">Carrinho</span>
              </div>
              {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 md:top-0 md:right-0 lg:left-7 lg:top-0 bg-[#E60012] text-white text-[10px] md:text-[11px] font-extrabold h-5 w-5 md:h-5 md:w-5 flex items-center justify-center rounded-full border-2 border-zinc-950 shadow-sm">
                      {cartCount}
                  </span>
              )}
            </Link>
            {showCartPreview && (
                <div className="absolute top-full right-0 z-[1000]">
                    <CartPreview onClose={() => setShowCartPreview(false)} />
                </div>
            )}
          </div>
        </div>
        </div>
      </div>

      <nav className="hidden lg:block border-b border-white/10">
        <div className="container mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.18em] text-white/60">
            <span className="inline-flex h-2 w-2 rounded-full bg-[#E60012]" />
            Tecnologia • PC Gamer • Notebooks • Hardware
          </div>
          <div className="flex items-center gap-6 text-sm font-bold text-white/85">
            <Link href="/pcgamer" className="hover:text-white transition-colors">PC Gamer</Link>
            <Link href="/notebooks" className="hover:text-white transition-colors">Notebooks</Link>
            <Link href="/servicos-e-ofertas" className="hover:text-white transition-colors">Serviços</Link>
            <Link href="/vitrine" className="hover:text-white transition-colors">Vitrine</Link>
            <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
          </div>
        </div>
      </nav>

      {/* Mobile Search Bar (Full width below header on mobile) */}
      <div className="md:hidden px-4 pb-4 pt-3 border-b border-white/10" ref={mobileSearchContainerRef}>
          <form onSubmit={handleSearch} className="relative">
            <input
                type="text"
                placeholder="Buscar produtos..."
                className="w-full pl-5 pr-14 py-3.5 border border-white/10 bg-white text-gray-900 rounded-full focus:outline-none focus:ring-2 focus:ring-[#E60012]/30 shadow-sm text-base placeholder:text-gray-400"
                value={searchQuery}
                onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowPreview(true);
                }}
                onFocus={() => setShowPreview(true)}
            />
            
            {/* Clear Button (Mobile) */}
            {searchQuery && (
                 <button
                     type="button"
                     onClick={clearSearch}
                     className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-400 p-2 z-10"
                 >
                     {isLoading ? <Loader2 size={18} className="animate-spin" /> : <X size={18} />}
                 </button>
            )}

             <button 
               type="button" 
               onClick={performSearch}
               className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 p-2 z-10"
             >
                <Search size={22} />
            </button>

            {/* Mobile Search Preview */}
            {showPreview && searchQuery.length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-1 z-50">
                    <SearchPreview 
                        products={previewProducts}
                        searchQuery={searchQuery}
                        onSelect={(product) => {
                            router.push(`/product/${product.id}`);
                            setShowPreview(false);
                            setSearchQuery("");
                        }}
                        onClose={() => setShowPreview(false)}
                    />
                </div>
            )}
          </form>

          <div className="mt-3 flex items-center gap-3">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] hover:bg-[#128C7E] text-white px-4 py-3 font-extrabold shadow-[0_14px_30px_rgba(18,140,126,0.25)] active:scale-[0.98] transition-all"
            >
              <MessageCircle size={18} />
              WhatsApp
            </a>
            <Link
              href="/promocao"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white/5 hover:bg-white/10 text-white px-4 py-3 font-extrabold border border-white/10 active:scale-[0.98] transition-all"
            >
              <Tag size={18} />
              Ofertas
            </Link>
          </div>
      </div>
    </header>
  );
}
