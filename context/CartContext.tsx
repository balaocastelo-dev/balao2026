"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { Product } from "@/lib/utils";
import { aplicarPrecos, type PrecoAtual } from "@/lib/carrinho/precos";

export interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  isCartOpen: boolean;
  toggleCart: () => void;
  /** Reconsulta o preço de agora de cada item; devolve os nomes dos que mudaram. */
  atualizarPrecos: () => Promise<string[]>;
  /** Aplica preços que o servidor já devolveu (ex.: resposta 409 do checkout). */
  aplicarPrecosDoServidor: (atuais: PrecoAtual[]) => string[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const itensRef = useRef<CartItem[]>([]);
  itensRef.current = items;

  useEffect(() => {
    setIsMounted(true);
    const savedCart = localStorage.getItem("balao_cart");
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("balao_cart", JSON.stringify(items));
    }
  }, [items, isMounted]);

  // Expose addToCart to window for Voice Agent
  useEffect(() => {
    if (typeof window !== "undefined") {
        (window as any).balao_addToCart = (product: Product) => {
            addToCart(product);
            // Also dispatch a custom event for Toast
            window.dispatchEvent(new CustomEvent('balao-toast', { detail: { message: `Adicionado: ${product.name}` } }));
            setIsCartOpen(true); // Open cart to confirm
        };
    }
  }, [items]); // Re-bind if needed, but addToCart is stable-ish. Better depends on nothing or addToCart

  const addToCart = (product: Product) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    // Optional: Open cart drawer on add
    // setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
        removeFromCart(productId);
        return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const toggleCart = () => setIsCartOpen(!isCartOpen);

  // O carrinho guardado no navegador é uma cópia antiga: o preço que vale é o
  // do site agora (lib/carrinho/precos.ts). Ex.: produto que entrou em
  // "Queda de preço" depois de ser adicionado.
  const aplicarPrecosDoServidor = useCallback((atuais: PrecoAtual[]) => {
    const mapa: Record<string, PrecoAtual> = {};
    for (const a of atuais) if (a && a.id) mapa[a.id] = a;
    const { itens, mudaram } = aplicarPrecos(itensRef.current, mapa);
    if (mudaram.length > 0 || itens.some((it, i) => it !== itensRef.current[i])) setItems(itens);
    return mudaram;
  }, []);

  const atualizarPrecos = useCallback(async () => {
    const ids = itensRef.current.map((i) => i.id).filter(Boolean);
    if (ids.length === 0) return [];
    try {
      const res = await fetch("/api/carrinho/precos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
        cache: "no-store",
      });
      if (!res.ok) return [];
      const dados = (await res.json()) as { produtos?: Record<string, PrecoAtual> };
      return aplicarPrecosDoServidor(Object.values(dados.produtos ?? {}));
    } catch {
      return [];
    }
  }, [aplicarPrecosDoServidor]);

  // Ao carregar o carrinho guardado, já troca pelos preços de agora.
  const jaAtualizou = useRef(false);
  useEffect(() => {
    if (!isMounted || jaAtualizou.current || items.length === 0) return;
    jaAtualizou.current = true;
    atualizarPrecos().then((mudaram) => {
      if (mudaram.length > 0 && typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("balao-toast", {
            detail: { message: `Preço atualizado no carrinho: ${mudaram.slice(0, 2).join(", ")}${mudaram.length > 2 ? "…" : ""}` },
          })
        );
      }
    });
  }, [isMounted, items.length, atualizarPrecos]);

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
  
  const cartTotal = items.reduce((acc, item) => {
    // Parse price string "R$ 1.200,00" to number
    const priceStr = item.price.replace("R$", "").replace(/\./g, "").replace(",", ".");
    const price = parseFloat(priceStr) || 0;
    return acc + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
        isCartOpen,
        toggleCart,
        atualizarPrecos,
        aplicarPrecosDoServidor,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
