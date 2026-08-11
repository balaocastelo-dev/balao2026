"use client";

import { useState, useEffect } from "react";
import { HomeBlock, Category } from "@/lib/utils";
import { Plus, Trash2, GripVertical, Save, X } from "lucide-react";

interface HomeBlocksManagerProps {
  categories: Category[];
}

export default function HomeBlocksManager({ categories }: HomeBlocksManagerProps) {
  const [blocks, setBlocks] = useState<HomeBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newBlockCategory, setNewBlockCategory] = useState("");
  const [newBlockTitle, setNewBlockTitle] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBlocks();
  }, []);

  const fetchBlocks = async () => {
    try {
      setError(null);
      const res = await fetch("/api/home-blocks");
      if (res.ok) {
        const data = await res.json();
        setBlocks(data);
      } else {
          setError("Falha ao carregar blocos. Verifique se a tabela 'home_blocks' foi criada no Supabase.");
      }
    } catch (error) {
      console.error("Error fetching blocks:", error);
      setError("Erro de conexão ao carregar blocos.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddBlock = async () => {
    if (!newBlockCategory) return;

    try {
      setError(null);
      const res = await fetch("/api/home-blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category_id: newBlockCategory,
          title: newBlockTitle || categories.find(c => c.name === newBlockCategory)?.name || newBlockCategory
        }),
      });

      if (res.ok) {
        await fetchBlocks();
        setIsAdding(false);
        setNewBlockCategory("");
        setNewBlockTitle("");
      } else {
          const errData = await res.json();
          setError(errData.error || "Erro ao criar bloco. Verifique o console.");
      }
    } catch (error) {
      console.error("Error creating block:", error);
      setError("Erro de conexão ao criar bloco.");
    }
  };

  const handleDeleteBlock = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover este bloco?")) return;
    try {
      const res = await fetch(`/api/home-blocks/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setBlocks(blocks.filter(b => b.id !== id));
      }
    } catch (error) {
      console.error("Error deleting block:", error);
    }
  };
  
  const moveBlock = async (index: number, direction: 'up' | 'down') => {
      if ((direction === 'up' && index === 0) || (direction === 'down' && index === blocks.length - 1)) return;
      
      const newBlocks = [...blocks];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      
      [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
      
      // Update display_order locally
      newBlocks.forEach((b, i) => b.display_order = i);
      setBlocks(newBlocks);
      
      // Save order
      try {
          await fetch("/api/home-blocks/reorder", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                  items: newBlocks.map(b => ({ id: b.id, display_order: b.display_order }))
              })
          });
      } catch (error) {
          console.error("Error saving order:", error);
      }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Blocos da Home</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} /> Novo Bloco
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
          <p className="font-medium">Erro</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {isAdding && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Adicionar Novo Bloco</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Categoria</label>
              <select
                value={newBlockCategory}
                onChange={(e) => setNewBlockCategory(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Selecione uma categoria</option>
                {categories.map(c => (
                  <option key={c.id || c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Título Personalizado (Opcional)</label>
              <input
                type="text"
                value={newBlockTitle}
                onChange={(e) => setNewBlockTitle(e.target.value)}
                placeholder="Ex: Ofertas de Hardware"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsAdding(false)}
              className="px-3 py-1 text-gray-600 hover:text-gray-800"
            >
              Cancelar
            </button>
            <button
              onClick={handleAddBlock}
              disabled={!newBlockCategory}
              className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Salvar
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {blocks.map((block, index) => (
          <div key={block.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-md shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-1">
                  <button onClick={() => moveBlock(index, 'up')} disabled={index === 0} className="text-gray-400 hover:text-gray-600 disabled:opacity-20">▲</button>
                  <button onClick={() => moveBlock(index, 'down')} disabled={index === blocks.length - 1} className="text-gray-400 hover:text-gray-600 disabled:opacity-20">▼</button>
              </div>
              <div>
                <h4 className="font-medium text-gray-800">{block.title || block.category_id}</h4>
                <span className="text-xs text-gray-500">Categoria: {block.category_id}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
               <button
                onClick={() => handleDeleteBlock(block.id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
        
        {blocks.length === 0 && !loading && (
            <p className="text-center text-gray-500 py-8">Nenhum bloco configurado.</p>
        )}
      </div>
    </div>
  );
}
