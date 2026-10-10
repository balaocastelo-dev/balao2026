"use client";

import CategoryManager from "@/components/admin/CategoryManager";
import { Layers } from "lucide-react";

export default function CategoriesPage() {
  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Layers className="text-[#E60012]" />
          Gerenciamento de Categorias
        </h2>
      </div>
      <CategoryManager />
    </div>
  );
}
