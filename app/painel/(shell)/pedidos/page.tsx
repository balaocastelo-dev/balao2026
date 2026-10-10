"use client";

import OrderManager from "@/components/admin/OrderManager";
import { ShoppingBag } from "lucide-react";

export default function OrdersPage() {
  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <ShoppingBag className="text-[#E60012]" />
          Gerenciamento de Pedidos
        </h2>
      </div>
      <OrderManager />
    </div>
  );
}
