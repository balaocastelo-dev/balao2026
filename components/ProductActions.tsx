"use client";

import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { Product } from "@/lib/utils";
import { MessageCircle, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { animateAddToCart } from "@/lib/animations";
import { SITE_CONFIG } from "@/lib/config";
import { trackWhatsAppClick } from "@/lib/tracking";

export default function ProductActions({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [added, setAdded] = useState(false);

  const handleWhatsAppBuy = () => {
    if (typeof window === "undefined") return;

    const message = [
      `OlÃ¡! Quero comprar este produto: ${product.name}`,
      `Valor: ${product.price || "sob consulta"}`,
      `Link: ${window.location.href}`,
      "Estou em Campinas/regiÃ£o. Tem pronta entrega hoje?",
    ].join("\n");

    trackWhatsAppClick({
      page_path: window.location.pathname,
      source: "product_primary_buy_whatsapp",
      label: product.name,
      product_name: product.name,
    });

    window.open(`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    addToCart(product);
    showToast("Adicionado ao carrinho!");
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);

    const mainImage = document.querySelector(".product-main-image") as HTMLElement;
    animateAddToCart(mainImage || (e.currentTarget as HTMLElement), product.image);
  };

  return (
    <div className="grid grid-cols-1 gap-3">
      <button
        onClick={handleWhatsAppBuy}
        className="w-full py-4 rounded-md font-black text-lg transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 bg-[#25D366] text-white hover:bg-[#128C7E]"
      >
        <MessageCircle size={24} />
        COMPRAR PELO WHATSAPP
      </button>

      <button
        onClick={handleAddToCart}
        className={`w-full py-3 rounded-md font-bold text-base transition-all active:scale-95 flex items-center justify-center gap-2 border shadow-sm ${
          added
            ? "bg-green-50 border-green-200 text-green-700"
            : "bg-white border-gray-200 text-gray-800 hover:border-[#E60012] hover:text-[#E60012]"
        }`}
      >
        <ShoppingCart size={20} />
        {added ? "ADICIONADO!" : "Adicionar ao carrinho"}
      </button>
    </div>
  );
}
