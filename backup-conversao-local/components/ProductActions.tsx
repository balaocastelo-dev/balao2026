"use client";

import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { Product } from "@/lib/utils";
import { ShoppingCart } from "lucide-react";
import { useState } from "react";
import { animateAddToCart } from "@/lib/animations";

export default function ProductActions({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [added, setAdded] = useState(false);

  const handleBuy = (e: React.MouseEvent) => {
    addToCart(product);
    showToast("Adicionado ao carrinho!");
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);

    // Animation
    const mainImage = document.querySelector('.product-main-image') as HTMLElement;
    animateAddToCart(mainImage || (e.currentTarget as HTMLElement), product.image);
  };

  return (
    <button 
        onClick={handleBuy}
        className={`w-full py-4 rounded-md font-bold text-lg transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
            added ? "bg-green-600 text-white" : "bg-[#E60012] text-white hover:bg-[#cc0010]"
        }`}
    >
        <ShoppingCart size={24} />
        {added ? "ADICIONADO!" : "COMPRAR AGORA"}
    </button>
  );
}
