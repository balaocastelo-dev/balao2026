
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { ShoppingBag } from "lucide-react";

export default function CartPreview({ onClose }: { onClose?: () => void }) {
  const { items, cartCount, cartTotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="site-surface absolute top-full right-0 z-50 mt-2 w-80 rounded-2xl p-6 shadow-xl animate-in fade-in slide-in-from-top-2">
        <div className="flex flex-col items-center justify-center text-center">
          <ShoppingBag size={48} className="mb-3 text-[var(--site-muted)]" />
          <p className="font-medium text-[var(--site-muted)]">Seu carrinho está vazio</p>
          <Link 
            href="/" 
            className="mt-4 text-[#E60012] font-bold text-sm hover:underline"
            onClick={onClose}
          >
            Começar a comprar
          </Link>
        </div>
      </div>
    );
  }

  // Show max 3 items
  const previewItems = items.slice(0, 3);
  const hasMore = items.length > 3;

  return (
    <div className="site-surface absolute top-full right-0 z-50 mt-2 w-96 overflow-hidden rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-2">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--site-border)] bg-[var(--site-panel-muted)] p-4">
        <span className="flex items-center gap-2 font-bold text-[var(--site-text)]">
          Meu Carrinho <span className="text-xs bg-[#E60012] text-white px-2 py-0.5 rounded-full">{cartCount}</span>
        </span>
        <span className="text-xs font-medium text-[var(--site-muted)]">
            Subtotal: {cartTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </span>
      </div>

      {/* Items List */}
      <div className="max-h-[320px] overflow-y-auto">
        {previewItems.map((item) => (
          <div key={item.id} className="flex gap-3 border-b border-[var(--site-border)] p-4 transition-colors hover:bg-[var(--site-panel-muted)]">
            {/* Image */}
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border border-[var(--site-border)] bg-[var(--site-panel-soft)]">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-contain p-1"
                sizes="64px"
              />
            </div>
            
            {/* Info */}
            <div className="flex-1 min-w-0">
              <h4 className="mb-1 line-clamp-2 text-sm font-medium leading-tight text-[var(--site-text)]" title={item.name}>
                {item.name}
              </h4>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-[var(--site-muted)]">Qtd: {item.quantity}</span>
                <span className="text-sm font-bold text-[#E60012]">
                   {item.price}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-[var(--site-border)] bg-[var(--site-panel-muted)] p-4">
        {hasMore && (
            <div className="mb-3 text-center text-xs text-[var(--site-muted)]">
                E mais {items.length - 3} produto(s)...
            </div>
        )}
        
        <div className="grid grid-cols-2 gap-3">
             <Link 
                href="/cart" 
                className="flex items-center justify-center rounded-xl border border-[var(--site-border)] bg-[var(--site-panel-soft)] px-4 py-2 text-sm font-bold text-[var(--site-text)] transition-colors hover:border-[#E60012]"
                onClick={onClose}
             >
                Ver Carrinho
             </Link>
             <Link 
                href="/cart" 
                className="flex items-center justify-center px-4 py-2 bg-[#E60012] rounded text-white font-bold text-sm hover:bg-[#cc0010] shadow-md transition-all active:scale-95"
                onClick={onClose}
             >
                Finalizar
             </Link>
        </div>
      </div>
    </div>
  );
}
