"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product } from "@/lib/utils";

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
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

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
