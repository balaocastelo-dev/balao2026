"use client";

import React, { useEffect, useMemo, useState } from "react";
import ProductSearch from "./components/ProductSearch";
import CartSidebar from "./components/CartSidebar";
import CustomerForm from "./components/CustomerForm";
import PaymentModal from "./components/PaymentModal";
import RecentOrders from "./components/RecentOrders";
import { ClipboardList, PackageSearch, ShoppingCart } from "lucide-react";
import { usePdv } from "./store";

function PdvContent() {
  const { state, total } = usePdv();
  const [mobileView, setMobileView] = useState<"products" | "checkout" | "orders">("products");

  useEffect(() => {
    if (state.step === "customer" || state.step === "payment") {
      setMobileView("checkout");
    }
  }, [state.step]);

  const checkoutTitle = useMemo(() => {
    if (state.step === "customer") return "Dados do cliente";
    if (state.step === "payment") return "Pagamento";
    return "Carrinho";
  }, [state.step]);

  return (
    <div className="flex min-h-full flex-col gap-4 md:h-full">
      <div className="grid grid-cols-2 gap-3 md:hidden">
        <div className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Itens no carrinho</p>
          <p className="mt-2 text-2xl font-black text-gray-900">{state.cart.length}</p>
        </div>
        <div className="rounded-2xl border border-green-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Total atual</p>
          <p className="mt-2 text-2xl font-black text-green-600">
            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(total)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 md:hidden">
        <button
          onClick={() => setMobileView("products")}
          className={`flex items-center justify-center gap-2 rounded-2xl px-3 py-3 text-sm font-bold transition ${
            mobileView === "products"
              ? "bg-red-600 text-white"
              : "bg-white text-gray-700 shadow-sm"
          }`}
        >
          <PackageSearch size={18} />
          Produtos
        </button>
        <button
          onClick={() => setMobileView("checkout")}
          className={`flex items-center justify-center gap-2 rounded-2xl px-3 py-3 text-sm font-bold transition ${
            mobileView === "checkout"
              ? "bg-red-600 text-white"
              : "bg-white text-gray-700 shadow-sm"
          }`}
        >
          <ShoppingCart size={18} />
          {checkoutTitle}
        </button>
        <button
          onClick={() => setMobileView("orders")}
          className={`flex items-center justify-center gap-2 rounded-2xl px-3 py-3 text-sm font-bold transition ${
            mobileView === "orders"
              ? "bg-red-600 text-white"
              : "bg-white text-gray-700 shadow-sm"
          }`}
        >
          <ClipboardList size={18} />
          Pedidos
        </button>
      </div>

      <div className="hidden h-full gap-4 md:flex">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="min-h-0 flex-1">
            <ProductSearch />
          </div>
          <div className="h-80">
            <RecentOrders />
          </div>
        </div>

        <div className="w-full max-w-md">
          {state.step === "cart" && <CartSidebar />}
          {state.step === "customer" && <CustomerForm />}
          {state.step === "payment" && <PaymentModal />}
        </div>
      </div>

      <div className="md:hidden">
        {mobileView === "products" && <ProductSearch />}
        {mobileView === "checkout" && (
          <>
            {state.step === "cart" && <CartSidebar />}
            {state.step === "customer" && <CustomerForm />}
            {state.step === "payment" && <PaymentModal />}
          </>
        )}
        {mobileView === "orders" && <RecentOrders />}
      </div>

    </div>
  );
}

export default function PdvPage() {
  return <PdvContent />;
}
