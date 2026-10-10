"use client";

import CarouselManager from "@/components/admin/CarouselManager";
import { Layout } from "lucide-react";

export default function CarouselPage() {
  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Layout className="text-[#E60012]" />
          Gerenciamento do Carrossel
        </h2>
      </div>
      <CarouselManager />
    </div>
  );
}
