"use client";

import { useState, useEffect } from "react";
import HomeBlocksManager from "@/components/admin/HomeBlocksManager";
import { Layout } from "lucide-react";
import { Category } from "@/lib/utils";

export default function HomeBlocksPage() {
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await fetch("/api/categories");
            if (res.ok) {
                const data = await res.json();
                setCategories(data);
            }
        } catch (e) {
            console.error("Failed to fetch categories", e);
        }
    };

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Layout className="text-[#E60012]" />
          Blocos da Home
        </h2>
      </div>
      <HomeBlocksManager categories={categories} />
    </div>
  );
}
